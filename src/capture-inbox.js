import { deleteCaptureDraft,listCaptureDrafts,persistCaptureDraft } from './persistence.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const createSubmissionId=()=>`capture-${globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2,10)}`}`;
let mounted=false;
let activeDraftId=null;
let pendingSubmissionId=null;
let submitInFlight=null;

function notice(message){const toast=document.querySelector('#toast');if(toast){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);}}
function qualityLabel(draft){if(!draft.term)return'Thiếu từ/cụm';if(!draft.sourceContext)return'Thiếu ngữ cảnh';if(!draft.meaning)return'Cần chọn nghĩa';return'Sẵn sàng hoàn thiện';}
function setStatus(message='',kind='neutral'){
  const node=document.querySelector('#quickCaptureStatus');if(!node)return;
  node.textContent=message;node.dataset.kind=kind;
}

async function renderCoreInbox(){
  const drafts=await listCaptureDrafts();
  const count=document.querySelector('#captureInboxCount');if(count)count.textContent=`${drafts.length} bản nháp`;
  const host=document.querySelector('#captureInbox');if(!host)return;
  host.innerHTML=drafts.length?drafts.map(draft=>`<article class="draft-row" data-draft-id="${escape(draft.id)}"><div><strong>${escape(draft.term||'Chưa có từ')}</strong><span>${escape(qualityLabel(draft))}</span><p>${escape(draft.sourceContext||'Chưa lưu ngữ cảnh')}</p><small>${escape(draft.sourceLabel||'Nguồn chưa ghi')}</small></div><div class="draft-actions"><button class="secondary-button" data-draft-complete>Hoàn thiện</button><button class="ai-button" data-draft-ai>AI bổ sung</button><button class="icon-button" data-draft-delete aria-label="Xóa bản nháp">×</button></div></article>`).join(''):'<p class="muted">Chưa có bản nháp. Ghi nhanh một từ khi bạn vừa gặp nó.</p>';
}

async function handleCoreInboxClick(event){
  const row=event.target.closest('[data-draft-id]');if(!row)return;
  const drafts=await listCaptureDrafts();const draft=drafts.find(item=>item.id===row.dataset.draftId);if(!draft)return;
  if(event.target.closest('[data-draft-delete]')){await deleteCaptureDraft(draft.id);await refreshCaptureInbox();return;}
  if(event.target.closest('[data-draft-complete],[data-draft-ai]')){
    activeDraftId=draft.id;document.querySelector('#wordInput').value=draft.term||'';document.querySelector('#sourceContextInput').value=draft.sourceContext||'';document.querySelector('#wordInput').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});document.querySelector('#wordInput').focus();
    if(event.target.closest('[data-draft-ai]'))setTimeout(()=>document.querySelector('#aiEnrichButton')?.click(),80);
  }
}

const coreAdapter={
  labels:{eyebrow:'GHI NHANH',title:'Bắt từ trước, hoàn thiện sau',description:'Bản nháp không vào Today hoặc lịch FSRS cho tới khi bạn xác nhận bằng form đầy đủ.'},
  capture:async input=>({durable:true,record:await persistCaptureDraft(input)}),
  render:renderCoreInbox,
  handleClick:handleCoreInboxClick
};
let adapter=coreAdapter;

function applyLabels(labels={}){
  const eyebrow=document.querySelector('#captureInboxEyebrow');if(eyebrow)eyebrow.textContent=labels.eyebrow||coreAdapter.labels.eyebrow;
  const title=document.querySelector('#captureInboxTitle');if(title)title.textContent=labels.title||coreAdapter.labels.title;
  const description=document.querySelector('#captureInboxDescription');if(description)description.textContent=labels.description||coreAdapter.labels.description;
}

export async function configureCaptureInbox(nextAdapter){
  if(!nextAdapter||typeof nextAdapter.capture!=='function'||typeof nextAdapter.render!=='function')throw new Error('Capture Inbox adapter không hợp lệ.');
  adapter={...nextAdapter,handleClick:typeof nextAdapter.handleClick==='function'?nextAdapter.handleClick:async()=>{}};
  applyLabels(adapter.labels);
  await refreshCaptureInbox();
}

export async function refreshCaptureInbox(){return adapter.render();}

async function submitQuickCapture(event){
  event.preventDefault();
  if(submitInFlight)return;
  const form=event.currentTarget;
  const term=document.querySelector('#quickTerm').value.trim();if(!term)return;
  const button=form.querySelector('button[type="submit"]');
  pendingSubmissionId??=createSubmissionId();
  const input={
    id:pendingSubmissionId,
    term,
    sourceContext:document.querySelector('#quickContext').value,
    sourceLabel:document.querySelector('#quickSource').value,
    status:'captured'
  };
  submitInFlight=(async()=>{
    button.disabled=true;form.setAttribute('aria-busy','true');setStatus('Đang ghi bền bản nháp…','pending');
    try{
      const result=await adapter.capture(input);
      if(result?.durable!==true)throw Object.assign(new Error('Không thể xác nhận bản nháp đã được ghi bền.'),{code:'CAPTURE_DURABILITY_UNCONFIRMED',durable:false});
      const unchanged=document.querySelector('#quickTerm').value.trim()===input.term&&document.querySelector('#quickContext').value===input.sourceContext&&document.querySelector('#quickSource').value===input.sourceLabel;
      if(unchanged)form.reset();
      pendingSubmissionId=null;await refreshCaptureInbox();setStatus(unchanged?'Đã ghi bền vào một Hộp thư; chưa vào lịch học.':'Đã ghi bền bản nháp đã gửi; nội dung bạn sửa trong lúc lưu vẫn còn trong form.','success');notice('Đã lưu vào Hộp thư từ mới; chưa vào lịch học.');
    }catch(error){
      setStatus(`Chưa lưu: ${error?.message||error}. Nội dung vẫn được giữ để thử lại.`,'error');
      notice('Chưa thể lưu bền; nội dung vẫn còn trong form.');
    }finally{
      button.disabled=false;form.removeAttribute('aria-busy');submitInFlight=null;
    }
  })();
  await submitInFlight;
}

export async function mountCaptureInbox(){
  if(mounted)return refreshCaptureInbox();
  const route=document.querySelector('[data-view="capture"]');if(!route)return;
  mounted=true;
  const panel=document.createElement('section');panel.id='quickCapturePanel';panel.className='quick-capture-panel';panel.dataset.captureEntry='canonical';
  panel.innerHTML=`<div class="quick-capture-head"><div><span class="greeting-badge" id="captureInboxEyebrow">GHI NHANH</span><h2 id="captureInboxTitle">Bắt từ trước, hoàn thiện sau</h2><p id="captureInboxDescription">Bản nháp không vào Today hoặc lịch FSRS cho tới khi bạn xác nhận bằng form đầy đủ.</p></div><strong id="captureInboxCount">0 bản nháp</strong></div><form id="quickCaptureForm" class="quick-capture-form"><label>Từ hoặc cụm từ *<input id="quickTerm" required autocomplete="off" placeholder="Ví dụ: run into" /></label><label>Ngữ cảnh<textarea id="quickContext" rows="2" placeholder="Câu hoặc đoạn bạn vừa gặp"></textarea></label><label>Nguồn<input id="quickSource" placeholder="Sách, video, bài viết…" /></label><button class="primary-button" type="submit">Lưu nhanh</button></form><p id="quickCaptureStatus" class="form-note" aria-live="polite"></p><div id="captureInbox" class="quality-inbox v10-capture-inbox" data-capture-inbox="canonical" aria-live="polite"></div>`;
  route.prepend(panel);
  const form=panel.querySelector('#quickCaptureForm');
  form.addEventListener('submit',event=>{void submitQuickCapture(event);});
  form.addEventListener('input',()=>{if(!submitInFlight)pendingSubmissionId=null;});
  panel.addEventListener('click',event=>{void adapter.handleClick(event).catch(error=>{setStatus(error.message,'error');notice(error.message);});});
  globalThis.addEventListener('vocab:card-added',async()=>{if(!activeDraftId)return;const id=activeDraftId;activeDraftId=null;await deleteCaptureDraft(id);await refreshCaptureInbox();});
  applyLabels(adapter.labels);
  await refreshCaptureInbox();
}

export const __testing=Object.freeze({
  resetSubmissionState(){pendingSubmissionId=null;submitInFlight=null;},
  currentAdapter(){return adapter;}
});
