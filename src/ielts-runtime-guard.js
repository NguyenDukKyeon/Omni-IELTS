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

function openLabFromLauncher(event){
  const launcher=event.target.closest?.('#openIeltsLabButton,#openIeltsLabMobile');if(!launcher)return false;
  event.preventDefault();event.stopImmediatePropagation();
  const dialog=document.getElementById('ieltsLabDialog');if(!dialog)return true;
  if(!dialog.open)dialog.showModal();
  const selected=dialog.querySelector('[data-ielts-tab][aria-selected="true"]');const tab=selected||dialog.querySelector('[data-ielts-tab="overview"]');
  tab?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:globalThis}));
  return true;
}

function hardenRenderedControls(root=document){
  const dictation=root.querySelector?.('#mediaDictationForm select[name="cardId"]');
  if(dictation){
    for(const option of dictation.options){
      if(!option.value)continue;
      const allowed=supportsSkill(option.value,'listening');
      if(option.disabled!==!allowed)option.disabled=!allowed;
      if(!allowed&&option.title!=='Thẻ này không có Listening trong mục tiêu học.')option.title='Thẻ này không có Listening trong mục tiêu học.';
    }
    if(dictation.value&&!supportsSkill(dictation.value,'listening'))dictation.value='';
  }
  const retell=root.querySelector?.('#mediaRetellForm');
  if(retell)for(const input of retell.querySelectorAll('input[name="target"]')){
    const allowed=supportsSkill(input.value,'production');
    if(input.disabled!==!allowed)input.disabled=!allowed;
    if(!allowed){input.checked=false;const label=input.closest('label');if(label?.getAttribute('title')!=='Thẻ này chưa có Production trong mục tiêu học.')label?.setAttribute('title','Thẻ này chưa có Production trong mục tiêu học.');}
  }
  const saveShadow=root.querySelector?.('[data-media-action="save-shadow"]');
  if(saveShadow){const audio=root.querySelector?.('#shadowPlayback');if(!audio?.getAttribute('src')&&!saveShadow.disabled)saveShadow.disabled=true;}
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
    if(openLabFromLauncher(event))return;
    const button=event.target.closest?.('[data-media-action="speech-retell"]');
    if(!button||!String(button.textContent||'').startsWith('■'))return;
    event.preventDefault();event.stopImmediatePropagation();const stop=button.onclick;button.onclick=null;try{stop?.call(button,event);}catch{}button.textContent='🎤 Nhận giọng nói';
  },true);
  observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        const element=node instanceof Element?node:null;if(!element)continue;
        const root=element.closest?.('#ieltsLabDialog')||element.querySelector?.('#ieltsLabDialog')||element;
        hardenRenderedControls(root);
      }
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  hardenRenderedControls(document);
}

export const __testing=Object.freeze({supportsSkill,guardSynchronousForm,hardenRenderedControls,openLabFromLauncher});
