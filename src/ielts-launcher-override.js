const LEGACY_TABS=new Set(['errors','lexical','paraphrase','reading','media','overview']);
const replacedNodes=new WeakSet();

function updateLaunchTrace(patch){globalThis.__VOCAB_IELTS_LAUNCH_TRACE__={...(globalThis.__VOCAB_IELTS_LAUNCH_TRACE__||{}),...patch};return globalThis.__VOCAB_IELTS_LAUNCH_TRACE__;}

function openLegacyDialog(tab='overview'){
  updateLaunchTrace({phase:'legacy-requested',legacyTab:tab,legacyRequestedAt:Date.now()});
  const legacy=document.querySelector('#ieltsLabDialog');if(!legacy)throw new Error('IELTS advanced tools chưa được mount.');
  const hub=document.querySelector('#v10IeltsHubDialog');if(hub?.open)hub.close();
  if(!legacy.open)legacy.showModal();
  requestAnimationFrame(()=>document.querySelector(`#ieltsLabDialog [data-ielts-tab="${tab}"]`)?.click());
}

function hubLauncherClick(event){
  event.preventDefault();event.stopImmediatePropagation();
  const launcher=event.target.closest?.('#openIeltsLabButton,#openIeltsLabMobile');
  const legacy=document.querySelector('#ieltsLabDialog');if(legacy?.open)legacy.close();
  updateLaunchTrace({phase:'hub-captured',capturedAt:Date.now(),launcherId:launcher?.id||event.currentTarget?.id||'',legacyWasOpen:Boolean(legacy?.open),hubAvailable:Boolean(globalThis.VocabMasterIeltsHub?.open)});
  const opening=globalThis.VocabMasterIeltsHub?.open?.('today');
  void Promise.resolve(opening).then(()=>updateLaunchTrace({phase:'hub-open-complete',completedAt:Date.now(),hubOpen:Boolean(document.querySelector('#v10IeltsHubDialog')?.open),legacyOpen:Boolean(document.querySelector('#ieltsLabDialog')?.open)})).catch(error=>updateLaunchTrace({phase:'hub-open-failed',failedAt:Date.now(),error:error?.message||String(error)}));
}

function interceptPrimaryLauncher(event){
  const launcher=event.target.closest?.('#openIeltsLabButton,#openIeltsLabMobile');
  if(!launcher)return;
  hubLauncherClick(event);
}

function replaceLauncher(node){
  if(!node||replacedNodes.has(node))return;
  const clone=node.cloneNode(true);node.replaceWith(clone);
  clone.dataset.v10Launcher='hub';
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
  updateLaunchTrace({phase:'mounted',mountedAt:Date.now(),launcherCount:document.querySelectorAll('#openIeltsLabButton,#openIeltsLabMobile').length});
  globalThis.VocabMasterIeltsLauncher={openHub:tab=>globalThis.VocabMasterIeltsHub?.open?.(tab||'today'),openLegacy:openLegacyDialog,refresh:replaceLaunchers,destroy:()=>{observer.disconnect();document.removeEventListener('click',interceptPrimaryLauncher,true);}};
}
