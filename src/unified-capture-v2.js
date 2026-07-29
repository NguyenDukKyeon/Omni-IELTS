import { listCaptureDrafts,deleteCaptureDraft } from './persistence.js';
import { captureLexicalCandidate,listCaptureInbox,finalizeCaptureCandidate,rejectCaptureCandidate,matchLexicalCards } from './lexical-core-v2.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function toast(message){const node=document.querySelector('#toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),3200);}

export async function captureFromAnySource(input={}){
  if(!String(input.term||'').trim())throw new Error('Thiếu từ hoặc cụm từ.');
  const candidate=await captureLexicalCandidate(input);globalThis.dispatchEvent(new CustomEvent('vocab:v10-capture-updated',{detail:{candidateId:candidate.id}}));return candidate;
}

export async function migrateLegacyCaptureDrafts(){
  const drafts=await listCaptureDrafts();let migrated=0;
  for(const draft of drafts){
    const candidate=await captureFromAnySource({term:draft.term,proposedMeaning:draft.meaning||'',sourceOccurrence:{sourceType:'legacy-capture',sourceId:draft.id,title:draft.sourceLabel||'Hộp thư cũ',context:draft.sourceContext||''},provenance:{source:'manual',confirmedByUser:false},status:'captured'});
    if(candidate){await deleteCaptureDraft(draft.id);migrated+=1;}
  }
  return{found:drafts.length,migrated};
}

function candidateMarkup(row){
  const exact=row.duplicateOfCardId;const matches=row.matchedCardIds||[];
  return`<article class="v10-capture-row" data-v10-candidate="${escape(row.id)}"><div class="v10-capture-main"><div><strong>${escape(row.term||'Chưa có từ')}</strong><span>${escape(row.proposedMeaning||'Chưa chọn nghĩa')}</span></div><p>${escape(row.sourceOccurrence?.context||'Chưa có ngữ cảnh nguồn')}</p><small>${escape(row.sourceOccurrence?.sourceType||'manual')} · ${exact?'Có mục cùng nghĩa trong Kho từ':matches.length?'Có mục cùng từ nhưng có thể khác nghĩa':'Mục mới'}</small></div><div class="v10-capture-actions">${exact?`<button class="primary-button" data-v10-link="${escape(exact)}">Thêm nguồn vào mục hiện có</button>`:`<button class="primary-button" data-v10-create>Tạo mục từ</button>`}${!exact&&matches.length?`<select data-v10-existing aria-label="Liên kết mục hiện có"><option value="">Chọn nghĩa hiện có…</option>${matches.map(id=>{const card=(globalThis.VocabMasterApp?.getState?.().cards||[]).find(item=>item.id===id);return`<option value="${escape(id)}">${escape(card?.front||id)} — ${escape(card?.back||'')}</option>`;}).join('')}</select><button class="secondary-button" data-v10-link-selected>Liên kết</button>`:''}<button class="text-button" data-v10-reject>Bỏ qua</button></div></article>`;
}

async function renderInbox(){
  const host=document.querySelector('#v10CaptureInbox');if(!host)return;const rows=await listCaptureInbox();const count=document.querySelector('#v10CaptureCount');if(count)count.textContent=`${rows.length} mục`;
  host.innerHTML=rows.length?rows.map(candidateMarkup).join(''):'<p class="muted">Không có mục chờ xử lý. Từ lưu từ video, Reading, Lexical Set và Retell sẽ xuất hiện tại đây.</p>';
}

async function handleInboxClick(event){
  const row=event.target.closest('[data-v10-candidate]');if(!row)return;const candidateId=row.dataset.v10Candidate;
  try{
    if(event.target.closest('[data-v10-create]')){await finalizeCaptureCandidate(candidateId,{action:'create'});toast('Đã tạo mục từ và lưu ngữ cảnh nguồn.');}
    else if(event.target.closest('[data-v10-link]')){await finalizeCaptureCandidate(candidateId,{action:'link',cardId:event.target.closest('[data-v10-link]').dataset.v10Link});toast('Đã liên kết nguồn với mục từ hiện có.');}
    else if(event.target.closest('[data-v10-link-selected]')){const id=row.querySelector('[data-v10-existing]')?.value;if(!id)throw new Error('Hãy chọn một nghĩa hiện có.');await finalizeCaptureCandidate(candidateId,{action:'link',cardId:id});toast('Đã liên kết với nghĩa đã chọn.');}
    else if(event.target.closest('[data-v10-reject]')){await rejectCaptureCandidate(candidateId);toast('Đã bỏ qua mục này.');}
    else return;
    await renderInbox();
  }catch(error){toast(error.message);}
}

function installCaptureBridge(){
  globalThis.addEventListener('vocab:capture-candidate',event=>{void captureFromAnySource(event.detail||{}).then(renderInbox).catch(error=>toast(error.message));});
  globalThis.addEventListener('vocab:v10-capture-updated',()=>void renderInbox());
  globalThis.addEventListener('vocab:v10-card-linked',()=>void renderInbox());
}

function mountPanel(){
  const route=document.querySelector('[data-view="capture"]');if(!route||document.querySelector('#v10CapturePanel'))return;
  const panel=document.createElement('section');panel.id='v10CapturePanel';panel.className='section-block v10-capture-panel';panel.innerHTML=`<div class="section-heading"><div><p class="eyebrow">UNIFIED CAPTURE</p><h3>Hộp thư từ vựng từ mọi nguồn</h3><p class="muted">Mọi từ từ video, Reading, IELTS content, Retell và import đều được kiểm tra trùng trước khi vào FSRS.</p></div><strong id="v10CaptureCount">0 mục</strong></div><div id="v10CaptureInbox" class="v10-capture-inbox" aria-live="polite"></div>`;
  const anchor=document.querySelector('#quickCapturePanel');if(anchor)anchor.insertAdjacentElement('afterend',panel);else route.prepend(panel);panel.addEventListener('click',event=>void handleInboxClick(event));
}

export async function mountUnifiedCaptureV2(){
  mountPanel();installCaptureBridge();
  try{await migrateLegacyCaptureDrafts();}catch(error){console.warn('[v10 capture migration]',error);}
  await renderInbox();
  globalThis.VocabMasterCapture={capture:captureFromAnySource,findMatches:matchLexicalCards,refresh:renderInbox};
}
