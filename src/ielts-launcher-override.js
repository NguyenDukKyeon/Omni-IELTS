const LEGACY_TABS=new Set(['errors','lexical','paraphrase','reading','media','overview']);
const replacedNodes=new WeakSet();

function openLegacyDialog(tab='overview'){
  const legacy=document.querySelector('#ieltsLabDialog');if(!legacy)throw new Error('IELTS advanced tools chưa được mount.');
  const hub=document.querySelector('#v10IeltsHubDialog');if(hub?.open)hub.close();
  if(!legacy.open)legacy.showModal();
  requestAnimationFrame(()=>document.querySelector(`#ieltsLabDialog [data-ielts-tab="${tab}"]`)?.click());
}

function hubLauncherClick(event){
  event.preventDefault();event.stopImmediatePropagation();
  const legacy=document.querySelector('#ieltsLabDialog');if(legacy?.open)legacy.close();
  void globalThis.VocabMasterIeltsHub?.open?.('today');
}

function interceptPrimaryLauncher(event){
  const launcher=event.target.closest?.('#openIeltsLabButton,#openIeltsLabMobile');
  if(!launcher)return;
  hubLauncherClick(event);
}

function replaceLauncher(node){
  if(!node||replacedNodes.has(node))return;
  const clone=node.cloneNode(true);node.replaceWith(clone);
  clone.addEventListener('click',hubLauncherClick,true);
  replacedNodes.add(clone);
}

function replaceLaunchers(){
  for(const node of document.querySelectorAll('#openIeltsLabButton,#openIeltsLabMobile'))replaceLauncher(node);
}

function interceptHubAdvancedTools(event){
  const direct=event.target.closest('[data-v10-legacy-tab]');const activity=event.target.closest('[data-v10-hub-action]');const tab=direct?.dataset.v10LegacyTab||activity?.dataset.v10HubAction;
  if(!LEGACY_TABS.has(tab))return;event.preventDefault();event.stopImmediatePropagation();openLegacyDialog(tab);
}

export function mountIeltsLauncherOverride(){
  document.addEventListener('click',interceptPrimaryLauncher,true);
  replaceLaunchers();const hub=document.querySelector('#v10IeltsHubDialog');hub?.addEventListener('click',interceptHubAdvancedTools,true);
  const observer=new MutationObserver(()=>replaceLaunchers());observer.observe(document.body,{childList:true,subtree:true});
  if(globalThis.VocabMasterIeltsHub)globalThis.VocabMasterIeltsHub.openLegacyTab=openLegacyDialog;
  globalThis.VocabMasterIeltsLauncher={openHub:tab=>globalThis.VocabMasterIeltsHub?.open?.(tab||'today'),openLegacy:openLegacyDialog,refresh:replaceLaunchers,destroy:()=>{observer.disconnect();document.removeEventListener('click',interceptPrimaryLauncher,true);}};
}
