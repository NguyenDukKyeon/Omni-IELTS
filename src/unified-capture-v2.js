import { deleteCaptureDraft,listCaptureDrafts,reopenCoreDatabase } from './persistence.js';
import { configureCaptureInbox,refreshCaptureInbox } from './capture-inbox.js';
import { captureLexicalCandidate,finalizeCaptureCandidate,listCaptureInbox,matchLexicalCards,rejectCaptureCandidate } from './lexical-core-v2.js';
import { V10_STORES } from './v10-contracts.js';
import { createCaptureItem } from './capture-domain.js';
import { getV10Record,reopenV10Database } from './v10-persistence.js';
import { withDurableWriteLock,withExclusiveStorageLock } from './storage-lock.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let bridgeInstalled=false;

function toast(message){const node=document.querySelector('#toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),3200);}

function captureProjection(row={}){
  return{
    id:row.id,term:row.term,proposedMeaning:row.proposedMeaning,proposedType:row.proposedType,status:row.status,
    sourceOccurrence:{
      id:row.sourceOccurrence?.id,sourceType:row.sourceOccurrence?.sourceType,sourceId:row.sourceOccurrence?.sourceId,
      title:row.sourceOccurrence?.title,context:row.sourceOccurrence?.context,candidateId:row.sourceOccurrence?.candidateId
    },
    provenance:row.provenance
  };
}

function sameCapture(left,right){return JSON.stringify(captureProjection(left))===JSON.stringify(captureProjection(right));}

async function legacyCandidateId(draftId){
  if(!globalThis.crypto?.subtle)throw Object.assign(new Error('Không có SHA-256 để tạo migration ID deterministic; giữ nguyên draft nguồn.'),{code:'CAPTURE_MIGRATION_CRYPTO_UNAVAILABLE',durable:false});
  const digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(draftId)));
  return`legacy-draft:${[...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,'0')).join('')}`;
}

async function legacyCandidateInput(draft){
  const id=await legacyCandidateId(draft.id);
  return{
    id,
    term:draft.term,
    proposedMeaning:draft.meaning||'',
    sourceOccurrence:{
      id:`${id}:source`,
      sourceType:'legacy-capture',
      sourceId:draft.id,
      title:draft.sourceLabel||'Hộp thư cũ',
      context:draft.sourceContext||'',
      encounteredAt:Number(draft.createdAt||Date.now()),
      updatedAt:Number(draft.updatedAt||draft.createdAt||Date.now())
    },
    provenance:{source:'manual',confirmedByUser:false},
    status:'captured',
    createdAt:Number(draft.createdAt||Date.now()),
    updatedAt:Number(draft.updatedAt||draft.createdAt||Date.now())
  };
}

export async function captureFromAnySource(input={},options={}){
  if(!String(input.term||'').trim())throw new Error('Thiếu từ hoặc cụm từ.');
  return withDurableWriteLock(async()=>{
    const candidate=await captureLexicalCandidate(input,options);
    const stored=await getV10Record(V10_STORES.captureCandidates,candidate.id);
    if(!sameCapture(stored,candidate))throw Object.assign(new Error('Capture candidate commit xong nhưng durable read-back không khớp.'),{code:'DURABLE_CAPTURE_VERIFY_FAILED',durable:false,candidateId:candidate.id});
    if(options.silent!==true)globalThis.dispatchEvent(new CustomEvent('vocab:v10-capture-updated',{detail:{candidateId:candidate.id}}));
    return candidate;
  },options.restoreToken||null);
}

async function migrateLegacyCaptureDraftsLocked(restoreToken,{hooks={}}={}){
  const drafts=await listCaptureDrafts();
  const copied=[];
  for(let index=0;index<drafts.length;index+=1){
    const draft=drafts[index];const input=await legacyCandidateInput(draft);
    const existing=await getV10Record(V10_STORES.captureCandidates,input.id);
    if(existing&&(existing.sourceOccurrence?.sourceType!=='legacy-capture'||existing.sourceOccurrence?.sourceId!==draft.id))throw Object.assign(new Error(`Migration target collision tại ${input.id}; draft nguồn được giữ nguyên.`),{code:'CAPTURE_MIGRATION_TARGET_COLLISION',durable:false,draftId:draft.id,candidateId:input.id});
    const expected=createCaptureItem(input);expected.sourceOccurrence={...expected.sourceOccurrence,candidateId:expected.id};
    if(existing&&!sameCapture(existing,expected))throw Object.assign(new Error(`Migration target ${input.id} đã thay đổi sau lần copy trước; giữ cả target và draft nguồn để không ghi đè quyết định mới.`),{code:'CAPTURE_MIGRATION_TARGET_DIVERGED',durable:false,draftId:draft.id,candidateId:input.id});
    const candidate=existing||await captureFromAnySource(input,{restoreToken,silent:true});
    copied.push({draft,input,candidate});
    await hooks.afterTargetCommit?.({draft,candidate,index,restoreToken});
  }
  if(!copied.length)return{found:0,copied:0,deleted:0};

  await reopenV10Database({restoreToken});
  await hooks.afterTargetReopen?.({copied:copied.length,restoreToken});
  for(let index=0;index<copied.length;index+=1){
    const item=copied[index];const stored=await getV10Record(V10_STORES.captureCandidates,item.candidate.id);
    if(!sameCapture(stored,item.candidate))throw Object.assign(new Error(`V10 candidate ${item.candidate.id} không khớp sau reopen; draft nguồn được giữ nguyên.`),{code:'CAPTURE_MIGRATION_VERIFY_FAILED',durable:false,draftId:item.draft.id,candidateId:item.candidate.id});
    await hooks.afterTargetVerify?.({...item,index,restoreToken});
  }

  let deleted=0;
  for(let index=0;index<copied.length;index+=1){
    const item=copied[index];
    await hooks.beforeSourceDelete?.({...item,index,restoreToken});
    await deleteCaptureDraft(item.draft.id,{restoreToken});deleted+=1;
    await hooks.afterSourceDelete?.({...item,index,restoreToken});
  }
  await reopenCoreDatabase({restoreToken});
  const remaining=new Set((await listCaptureDrafts()).map(row=>row.id));
  const undeleted=copied.filter(item=>remaining.has(item.draft.id));
  if(undeleted.length)throw Object.assign(new Error(`Còn ${undeleted.length} draft nguồn sau migration; không báo hoàn tất.`),{code:'CAPTURE_MIGRATION_SOURCE_DELETE_FAILED',durable:false,draftIds:undeleted.map(item=>item.draft.id)});
  return{found:drafts.length,copied:copied.length,deleted};
}

export async function migrateLegacyCaptureDrafts(options={}){
  if(options.restoreToken)return migrateLegacyCaptureDraftsLocked(options.restoreToken,options);
  return withExclusiveStorageLock(restoreToken=>migrateLegacyCaptureDraftsLocked(restoreToken,{...options,restoreToken}));
}

function candidateMarkup(row,sourceCleanupPending=false){
  const exact=row.duplicateOfCardId;const matches=row.matchedCardIds||[];
  const actions=sourceCleanupPending?'<div class="v10-capture-actions"><span>Hoàn tất migration trước khi xử lý mục này</span></div>':`<div class="v10-capture-actions">${exact?`<button class="primary-button" data-v10-link="${escape(exact)}">Thêm nguồn vào mục hiện có</button>`:`<button class="primary-button" data-v10-create>Tạo mục từ</button>`}${!exact&&matches.length?`<select data-v10-existing aria-label="Liên kết mục hiện có"><option value="">Chọn nghĩa hiện có…</option>${matches.map(id=>{const card=(globalThis.VocabMasterApp?.getState?.().cards||[]).find(item=>item.id===id);return`<option value="${escape(id)}">${escape(card?.front||id)} — ${escape(card?.back||'')}</option>`;}).join('')}</select><button class="secondary-button" data-v10-link-selected>Liên kết</button>`:''}<button class="text-button" data-v10-reject>Bỏ qua</button></div>`;
  return`<article class="v10-capture-row" data-v10-candidate="${escape(row.id)}"><div class="v10-capture-main"><div><strong>${escape(row.term||'Chưa có từ')}</strong><span>${escape(row.proposedMeaning||'Chưa chọn nghĩa')}</span></div><p>${escape(row.sourceOccurrence?.context||'Chưa có ngữ cảnh nguồn')}</p><small>${escape(row.sourceOccurrence?.sourceType||'manual')} · ${sourceCleanupPending?'Đích đã verify; nguồn cũ đang chờ cleanup':exact?'Có mục cùng nghĩa trong Kho từ':matches.length?'Có mục cùng từ nhưng có thể khác nghĩa':'Mục mới'}</small></div>${actions}</article>`;
}

async function renderInbox(){
  const[rows,drafts]=await Promise.all([listCaptureInbox(),listCaptureDrafts()]);
  const draftTargets=await Promise.all(drafts.map(async draft=>({draft,targetId:await legacyCandidateId(draft.id)})));
  const rowIds=new Set(rows.map(row=>row.id));
  const pendingOnly=draftTargets.filter(item=>!rowIds.has(item.targetId)).map(item=>item.draft);
  const count=document.querySelector('#captureInboxCount');if(count)count.textContent=`${rows.length+pendingOnly.length} mục`;
  const host=document.querySelector('#captureInbox');if(!host)return;
  const pendingSourceIds=new Set(draftTargets.map(item=>item.targetId).filter(id=>rowIds.has(id)));
  const retry=drafts.length?`<aside class="capture-migration-notice"><span>${drafts.length} draft Core đang được giữ an toàn cho tới khi V10 verify và cleanup xong.</span><button class="secondary-button" data-capture-migration-retry>Thử migration lại</button></aside>`:'';
  const migratedRows=rows.map(row=>candidateMarkup(row,pendingSourceIds.has(row.id)));
  const legacyRows=pendingOnly.map(draft=>`<article class="v10-capture-row" data-pending-core-draft="${escape(draft.id)}"><div class="v10-capture-main"><div><strong>${escape(draft.term||'Chưa có từ')}</strong><span>Draft Core chưa migrate</span></div><p>${escape(draft.sourceContext||'Chưa có ngữ cảnh nguồn')}</p><small>Nguồn vẫn được giữ bền; chưa xóa</small></div></article>`);
  host.innerHTML=retry||migratedRows.length||legacyRows.length?`${retry}${[...migratedRows,...legacyRows].join('')}`:'<p class="muted">Không có mục chờ xử lý. Từ lưu từ video, Reading, Lexical Set và Retell sẽ xuất hiện tại đây.</p>';
}

async function handleInboxClick(event){
  if(event.target.closest('[data-capture-migration-retry]')){
    const result=await migrateLegacyCaptureDrafts();await refreshCaptureInbox();toast(`Đã verify và dọn ${result.deleted} draft nguồn.`);return;
  }
  const row=event.target.closest('[data-v10-candidate]');if(!row)return;const candidateId=row.dataset.v10Candidate;
  if(event.target.closest('[data-v10-create]')){await finalizeCaptureCandidate(candidateId,{action:'create'});toast('Đã tạo mục từ và lưu ngữ cảnh nguồn.');}
  else if(event.target.closest('[data-v10-link]')){await finalizeCaptureCandidate(candidateId,{action:'link',cardId:event.target.closest('[data-v10-link]').dataset.v10Link});toast('Đã liên kết nguồn với mục từ hiện có.');}
  else if(event.target.closest('[data-v10-link-selected]')){const id=row.querySelector('[data-v10-existing]')?.value;if(!id)throw new Error('Hãy chọn một nghĩa hiện có.');await finalizeCaptureCandidate(candidateId,{action:'link',cardId:id});toast('Đã liên kết với nghĩa đã chọn.');}
  else if(event.target.closest('[data-v10-reject]')){await rejectCaptureCandidate(candidateId);toast('Đã bỏ qua mục này.');}
  else return;
  await refreshCaptureInbox();
}

function installCaptureBridge(){
  if(bridgeInstalled)return;bridgeInstalled=true;
  globalThis.addEventListener('vocab:capture-candidate',event=>{void captureFromAnySource(event.detail||{}).then(refreshCaptureInbox).catch(error=>toast(error.message));});
  globalThis.addEventListener('vocab:v10-capture-updated',()=>void refreshCaptureInbox());
  globalThis.addEventListener('vocab:v10-card-linked',()=>void refreshCaptureInbox());
}

export async function mountUnifiedCaptureV2(){
  let migrationError=null;
  try{await migrateLegacyCaptureDrafts();}catch(error){migrationError=error;}
  installCaptureBridge();
  await configureCaptureInbox({
    labels:{eyebrow:'THU THẬP',title:'Một Hộp thư từ mọi nguồn',description:'Quick Capture, video, Reading, IELTS và import cùng đi vào một quality gate trước khi tạo card.'},
    capture:async input=>({durable:true,record:await captureFromAnySource({
      id:input.id,term:input.term,proposedMeaning:'',sourceOccurrence:{sourceType:'quick-capture',sourceId:input.id,title:input.sourceLabel||'Quick Capture',context:input.sourceContext||'',verified:false},provenance:{source:'manual',confirmedByUser:false},status:'captured'
    })}),
    render:renderInbox,
    handleClick:handleInboxClick
  });
  if(migrationError)toast(`Migration draft chưa hoàn tất; nguồn vẫn được giữ: ${migrationError.message}`);
  globalThis.VocabMasterCapture={capture:captureFromAnySource,findMatches:matchLexicalCards,refresh:refreshCaptureInbox,retryMigration:migrateLegacyCaptureDrafts};
  return{migrationError};
}

export const __testing=Object.freeze({captureProjection,legacyCandidateId,sameCapture});
