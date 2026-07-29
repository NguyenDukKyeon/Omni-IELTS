const hostname=globalThis.location?.hostname||'';
const previewQuery=new URLSearchParams(globalThis.location?.search||'').get('preview');
const referrer=globalThis.document?.referrer||'';
const isEmbedded=(()=>{try{return globalThis.self!==globalThis.top;}catch{return true;}})();
const isViteDevelopment=Boolean(import.meta.env?.DEV);
const isLocalDevelopment=isViteDevelopment&&/^(localhost|127(?:\.\d+){3}|0\.0\.0\.0)$/i.test(hostname);
const isBrowserSmokeSeed=isViteDevelopment&&import.meta.env?.VITE_BROWSER_SMOKE_SEED==='1';
const isAiStudioPreview=
  previewQuery==='ai-studio'||
  (/^ais-dev-/i.test(hostname)&&/\.run\.app$/i.test(hostname))||
  (/\.run\.app$/i.test(hostname)&&(isEmbedded||isViteDevelopment))||
  (isViteDevelopment&&isEmbedded)||
  /aistudio\.google\.com|ai\.google\.dev/i.test(referrer);

function ensureExperienceStyles(){
  if(document.querySelector('link[href="/experience.css"]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/experience.css';
  document.head.append(link);
}

if(isViteDevelopment)ensureExperienceStyles();

const shell=document.getElementById('appShell');
const panel=document.getElementById('bootStatus');
const originalViewport={
  htmlOverflow:document.documentElement.style.overflow,
  bodyOverflow:document.body.style.overflow,
  bodyOverscroll:document.body.style.overscrollBehavior,
  shellVisibility:shell?.style.visibility||''
};

function lockPreviewViewport(){
  if(!isAiStudioPreview)return;
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
  document.body.style.overscrollBehavior='none';
  if(shell)shell.style.visibility='hidden';
  if(panel){
    panel.style.display='grid';
    panel.style.inset='0';
    panel.style.borderRadius='0';
    panel.style.minHeight='100dvh';
  }
}

function restoreViewport(){
  document.documentElement.style.overflow=originalViewport.htmlOverflow;
  document.body.style.overflow=originalViewport.bodyOverflow;
  document.body.style.overscrollBehavior=originalViewport.bodyOverscroll;
  if(shell)shell.style.visibility=originalViewport.shellVisibility;
}

function showNonBlockingBootError(title,detail){
  let notice=document.getElementById('bootErrorNotice');
  if(!notice){
    notice=document.createElement('pre');
    notice.id='bootErrorNotice';
    Object.assign(notice.style,{
      position:'fixed',left:'16px',right:'16px',bottom:'16px',zIndex:'2147483646',maxHeight:'42vh',overflow:'auto',margin:'0',padding:'16px',borderRadius:'14px',background:'#2b1012',color:'#fff',font:'12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace',whiteSpace:'pre-wrap',boxShadow:'0 16px 50px rgba(0,0,0,.3)'
    });
    document.body.append(notice);
  }
  notice.textContent=`${title}\n\n${detail}`;
}

function reportBootError(title,error){
  const detail=error?.stack||error?.message||String(error||'Không có thông tin lỗi.');
  console.error(`[boot] ${title}`,error);
  restoreViewport();
  if(globalThis.__VOCAB_SHOW_BOOT_ERROR__)globalThis.__VOCAB_SHOW_BOOT_ERROR__(title,detail);
  else showNonBlockingBootError(title,detail);
}

function markBooted(){
  globalThis.__VOCAB_BOOTED__=true;
  restoreViewport();
  document.getElementById('bootStatus')?.remove();
}

function withTimeout(promise,timeoutMs,label){
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} quá ${timeoutMs} ms.`)),timeoutMs);});
  return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
}

async function clearDevelopmentPwaState(){
  if(!isViteDevelopment)return;
  const tasks=[];
  try{
    if('serviceWorker'in navigator)tasks.push(navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.map(registration=>registration.unregister()))));
  }catch(error){console.warn('[dev] Service Worker cleanup unavailable',error);}
  try{
    if('caches'in globalThis)tasks.push(caches.keys().then(names=>Promise.all(names.map(name=>caches.delete(name)))));
  }catch(error){console.warn('[dev] Cache cleanup unavailable',error);}
  if(!tasks.length)return;
  try{await withTimeout(Promise.allSettled(tasks),1500,'Dọn PWA cache');}
  catch(error){console.warn('[dev] PWA cleanup timed out; continuing without blocking UI',error);}
}

async function initializeState(){
  const persistence=await import('./persistence.js');
  const initial=await withTimeout(persistence.initializePersistence(),10_000,'Khởi tạo IndexedDB');
  globalThis.__VOCAB_INITIAL_STATE__=initial;
  return persistence;
}

if(!isAiStudioPreview)document.getElementById('bootStatus')?.remove();
lockPreviewViewport();

try{
  if(isAiStudioPreview){
    void clearDevelopmentPwaState();
    globalThis.__VOCAB_INITIAL_STATE__={cards:[],settings:{},fsrsConfig:{},metrics:{}};
    await import('./settings-ui.js');
    await withTimeout(import('./app.js'),8000,'Tải giao diện chính');
    markBooted();
  }else{
    if(isLocalDevelopment)void clearDevelopmentPwaState();
    const persistence=await initializeState();
    await import('./settings-ui.js');
    await import('./app.js');
    if(isBrowserSmokeSeed)await globalThis.VocabMasterApp?.loadSampleDeck?.();
    const { mountCaptureInbox } = await import('./capture-inbox.js');
    const { mountRoadmapRuntime } = await import('./roadmap-runtime.js');
    const { mountIeltsLab } = await import('./ielts-lab.js');
    const { mountIeltsBackupBridge } = await import('./ielts-backup-bridge.js');
    const { mountIeltsRuntimeGuard } = await import('./ielts-runtime-guard.js');
    await mountCaptureInbox();
    await mountRoadmapRuntime();
    await mountIeltsLab();
    mountIeltsBackupBridge();
    mountIeltsRuntimeGuard();
    await import('./pwa.js');
    await persistence.mountPersistenceUI();
    markBooted();
  }
}catch(error){
  reportBootError('Không thể khởi động Vocab Master',error);
}
