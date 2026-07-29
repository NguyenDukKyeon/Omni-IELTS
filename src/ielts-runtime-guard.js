import { skillIsPlanned } from './fsrs-scheduler.js';
import { IELTS_STORE_NAMES } from './ielts-domain.js';
import { getIeltsRecord } from './ielts-persistence.js';

let mounted=false;
let observer=null;

function appState(){return globalThis.VocabMasterApp?.getState?.()||{cards:[]};}
function findCard(cardId){return(appState().cards||[]).find(card=>card.id===cardId)||null;}
function supportsSkill(cardId,skill){const card=findCard(cardId);return Boolean(card&&skillIsPlanned(card,skill));}
function announce(message,kind='info'){
  const node=document.getElementById('ieltsLabStatus');if(!node)return;
  node.className=`ielts-status ${kind}`;node.textContent=message;
}

function hardenRenderedControls(root=document){
  const dictation=root.querySelector?.('#mediaDictationForm select[name="cardId"]');
  if(dictation){
    for(const option of dictation.options){
      if(!option.value)continue;
      const allowed=supportsSkill(option.value,'listening');option.disabled=!allowed;
      if(!allowed)option.title='Thẻ này không có Listening trong mục tiêu học.';
    }
    if(dictation.value&&!supportsSkill(dictation.value,'listening'))dictation.value='';
  }
  const retell=root.querySelector?.('#mediaRetellForm');
  if(retell)for(const input of retell.querySelectorAll('input[name="target"]')){
    const allowed=supportsSkill(input.value,'production');input.disabled=!allowed;if(!allowed){input.checked=false;input.closest('label')?.setAttribute('title','Thẻ này chưa có Production trong mục tiêu học.');}
  }
  const saveShadow=root.querySelector?.('[data-media-action="save-shadow"]');
  if(saveShadow){const audio=root.querySelector?.('#shadowPlayback');if(!audio?.getAttribute('src'))saveShadow.disabled=true;}
}

function guardSynchronousForm(form){
  if(form.id==='mediaDictationForm'){
    const select=form.querySelector('select[name="cardId"]');
    if(select?.value&&!supportsSkill(select.value,'listening')){
      select.value='';announce('Target card không có mục tiêu Listening nên lượt này chỉ lưu attempt/error, không cập nhật FSRS.','error');
    }
  }
  if(form.id==='mediaRetellForm'){
    let removed=0;
    for(const input of form.querySelectorAll('input[name="target"]:checked'))if(!supportsSkill(input.value,'production')){input.checked=false;removed++;}
    if(removed)announce(`Đã loại ${removed} target không có mục tiêu Production; chúng không được phép tạo FSRS evidence.`,'error');
  }
}

async function guardErrorCorrection(event,form){
  if(form.dataset.ieltsGuardBypass==='true'){delete form.dataset.ieltsGuardBypass;return;}
  event.preventDefault();event.stopImmediatePropagation();
  const error=await getIeltsRecord(IELTS_STORE_NAMES.errors,form.dataset.error).catch(()=>null);
  const skill=form.querySelector('[name="skill"]')?.value||'recall';
  const linked=Array.isArray(error?.linkedCardIds)?error.linkedCardIds:[];
  const card=linked.length===1?findCard(linked[0]):null;
  if(card&&!skillIsPlanned(card,skill)){
    announce(`Không thể ghi ${skill} FSRS cho “${card.front}” vì kỹ năng này không thuộc mục tiêu của thẻ. Hãy đổi kỹ năng hoặc mục tiêu thẻ.`,'error');
    return;
  }
  form.dataset.ieltsGuardBypass='true';form.requestSubmit();
}

export function mountIeltsRuntimeGuard(){
  if(mounted)return;mounted=true;
  document.addEventListener('submit',event=>{
    const form=event.target;if(!(form instanceof HTMLFormElement))return;
    if(form.id==='errorCorrectionForm'){void guardErrorCorrection(event,form);return;}
    guardSynchronousForm(form);
  },true);
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-media-action="speech-retell"]');
    if(!button||!String(button.textContent||'').startsWith('■'))return;
    event.preventDefault();event.stopImmediatePropagation();const stop=button.onclick;button.onclick=null;try{stop?.call(button,event);}catch{}button.textContent='🎤 Nhận giọng nói';
  },true);
  observer=new MutationObserver(records=>{
    for(const record of records){const target=record.target instanceof Element?record.target:null;hardenRenderedControls(target?.closest?.('#ieltsLabDialog')||document);}
  });
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','src']});
  hardenRenderedControls(document);
}

export const __testing=Object.freeze({supportsSkill,guardSynchronousForm,hardenRenderedControls});
