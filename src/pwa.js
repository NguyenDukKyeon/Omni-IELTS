const AI_STUDIO_PREVIEW=/^ais-dev-/i.test(globalThis.location?.hostname||'')&&/\.run\.app$/i.test(globalThis.location?.hostname||'');
const IS_DEVELOPMENT=Boolean(import.meta.env?.DEV);
let deferredInstallPrompt=null;
let serviceWorkerRegistration=null;

function $(selector){return document.querySelector(selector);}
function appSettings(){return globalThis.VocabMasterApp?.getState?.().settings||globalThis.__VOCAB_INITIAL_STATE__?.settings||{};}
function setStatus(message,tone='neutral'){
  const element=$('#pwaStatus');
  if(!element)return;
  element.textContent=message;
  element.dataset.tone=tone;
}
function toast(message){
  const element=$('#toast');
  if(!element)return;
  element.textContent=message;
  element.classList.add('show');
  setTimeout(()=>element.classList.remove('show'),2400);
}
function addHeadMetadata(){
  if(!document.querySelector('link[rel="manifest"]')){
    const link=document.createElement('link');link.rel='manifest';link.href='/manifest.webmanifest';document.head.append(link);
  }
  if(!document.querySelector('link[rel="icon"]')){
    const icon=document.createElement('link');icon.rel='icon';icon.href='/icons/icon-192.svg';icon.type='image/svg+xml';document.head.append(icon);
  }
  for(const[name,content]of[
    ['apple-mobile-web-app-capable','yes'],
    ['apple-mobile-web-app-status-bar-style','default'],
    ['apple-mobile-web-app-title','Vocab Master']
  ]){
    if(!document.querySelector(`meta[name="${name}"]`)){
      const meta=document.createElement('meta');meta.name=name;meta.content=content;document.head.append(meta);
    }
  }
}
function addOfflineBadge(){
  if($('#offlineBadge'))return;
  const badge=document.createElement('div');
  badge.id='offlineBadge';badge.className='offline-badge';badge.textContent='Đang ngoại tuyến · vẫn có thể học';
  document.body.append(badge);
}
function isStandalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}
function updateInstallButton(){
  const button=$('#installPwaButton');if(!button)return;
  if(IS_DEVELOPMENT){button.textContent='Có trong bản production';button.disabled=true;return;}
  if(isStandalone()){button.textContent='✓ Đã cài đặt';button.disabled=true;}
  else if(deferredInstallPrompt){button.textContent='⬇ Cài ứng dụng';button.disabled=false;}
  else{button.textContent='Cài từ menu trình duyệt';button.disabled=true;}
}
async function installPwa(){
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;
  updateInstallButton();
}
function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from([...raw].map(character=>character.charCodeAt(0)));
}
async function registerServiceWorker(){
  if(IS_DEVELOPMENT)throw new Error('Service Worker được tắt trong chế độ Vite để tránh cache code cũ.');
  if(!('serviceWorker'in navigator))throw new Error('Trình duyệt không hỗ trợ Service Worker.');
  serviceWorkerRegistration=await navigator.serviceWorker.register('/sw.js',{scope:'/'});
  await navigator.serviceWorker.ready;
  return serviceWorkerRegistration;
}
function reminderTime(){return $('#settingReminder')?.value||appSettings().reminder||'20:00';}

function reminderConfig(){return{reminder:reminderTime(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:navigator.language,enabled:Boolean(appSettings().notificationEnabled)};}
async function sendReminderConfigToWorker(){
  const registration=serviceWorkerRegistration||await navigator.serviceWorker?.ready?.catch?.(()=>null);
  const worker=registration?.active||navigator.serviceWorker?.controller;
  worker?.postMessage({type:'REMINDER_CONFIG',config:reminderConfig()});
}
async function postJson(path,body,{timeoutMs=15_000}={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||`HTTP ${response.status}`);
    return data;
  }catch(error){
    if(error.name==='AbortError')throw new Error('Máy chủ thông báo phản hồi quá lâu.');
    throw error;
  }finally{clearTimeout(timer);}
}
async function getSubscription(){
  const registration=serviceWorkerRegistration||await registerServiceWorker();
  return registration.pushManager?.getSubscription()||null;
}
function setNotificationPreference(enabled){
  globalThis.dispatchEvent(new CustomEvent('vocab:notification-setting',{detail:{enabled:Boolean(enabled)}}));
}
async function subscribeNotifications(){
  if(!('Notification'in window)||!('PushManager'in window))throw new Error('Trình duyệt chưa hỗ trợ Web Push.');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')throw new Error(permission==='denied'?'Bạn đã chặn thông báo trong trình duyệt.':'Chưa được cấp quyền thông báo.');
  const registration=serviceWorkerRegistration||await registerServiceWorker();
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription){
    const response=await fetch('/api/push/public-key');
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.publicKey)throw new Error(data.error||'Máy chủ chưa cấu hình Web Push.');
    subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(data.publicKey)});
  }
  await postJson('/api/push/subscribe',{
    subscription:subscription.toJSON(),
    reminder:reminderTime(),
    timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale:navigator.language,
    enabled:true
  });
  setNotificationPreference(true);
  await sendReminderConfigToWorker();
  return subscription;
}
async function unsubscribeNotifications(){
  const subscription=await getSubscription();
  if(subscription){
    await postJson('/api/push/unsubscribe',{endpoint:subscription.endpoint}).catch(()=>{});
    await subscription.unsubscribe();
  }
  setNotificationPreference(false);
}
async function syncSubscription(){
  await sendReminderConfigToWorker();
  if(!appSettings().notificationEnabled)return;
  const subscription=await getSubscription();
  if(!subscription)return;
  await postJson('/api/push/subscribe',{
    subscription:subscription.toJSON(),reminder:reminderTime(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:navigator.language,enabled:true
  });
}
async function toggleNotifications(){
  const button=$('#toggleNotificationsButton');if(!button)return;
  button.disabled=true;
  try{
    if(appSettings().notificationEnabled){await unsubscribeNotifications();toast('Đã tắt nhắc học.');}
    else{await subscribeNotifications();toast('Đã bật nhắc học qua hệ điều hành.');}
    await refreshNotificationStatus();
  }catch(error){setStatus(error.message,'error');toast(error.message);}
  finally{button.disabled=false;}
}
async function testNotification(){
  const button=$('#testNotificationButton');if(!button)return;
  button.disabled=true;
  try{
    let subscription=await getSubscription();
    if(!subscription)subscription=await subscribeNotifications();
    await postJson('/api/push/test',{endpoint:subscription.endpoint});
    setStatus('Đã gửi thông báo thử. Có thể mất vài giây để xuất hiện.','success');
  }catch(error){
    try{
      const registration=serviceWorkerRegistration||await registerServiceWorker();
      await registration.showNotification('Vocab Master',{body:'Thông báo hệ điều hành đang hoạt động.',icon:'/icons/icon-192.svg',badge:'/icons/badge.svg',tag:'vocab-master-test'});
      setStatus('Thông báo cục bộ hoạt động; Web Push máy chủ chưa sẵn sàng.','neutral');
    }catch{setStatus(error.message,'error');}
  }finally{button.disabled=false;}
}
async function refreshNotificationStatus(){
  const button=$('#toggleNotificationsButton');
  const test=$('#testNotificationButton');
  if(!button)return;
  if(IS_DEVELOPMENT){
    setStatus('Vite development không đăng ký Service Worker để tránh cache code cũ. Nhắc hệ điều hành chỉ hoạt động khi chạy bản production.','neutral');
    button.disabled=true;if(test)test.disabled=true;return;
  }
  if(!window.isSecureContext){setStatus('Thông báo cần HTTPS hoặc localhost.','error');button.disabled=true;if(test)test.disabled=true;return;}
  if(!('Notification'in window)||!('serviceWorker'in navigator)||!('PushManager'in window)){
    setStatus('Trình duyệt này không hỗ trợ đầy đủ Web Push.','error');button.disabled=true;if(test)test.disabled=true;return;
  }
  const subscription=await getSubscription().catch(()=>null);
  const enabled=Boolean(subscription)&&Notification.permission==='granted'&&Boolean(appSettings().notificationEnabled);
  button.disabled=false;if(test)test.disabled=false;
  button.textContent=enabled?'🔕 Tắt nhắc học':'🔔 Bật nhắc học';
  setStatus(enabled?`Đang nhắc mỗi ngày lúc ${reminderTime()}.`:`Quyền: ${Notification.permission==='default'?'chưa hỏi':Notification.permission}.`,enabled?'success':'neutral');
}
function updateNetworkBadge(){const badge=$('#offlineBadge');if(badge)badge.classList.toggle('show',!navigator.onLine);}
function bindControls(){
  $('#installPwaButton')?.addEventListener('click',installPwa);
  $('#toggleNotificationsButton')?.addEventListener('click',toggleNotifications);
  $('#testNotificationButton')?.addEventListener('click',testNotification);
}

export async function initPwa(){
  if(AI_STUDIO_PREVIEW)return;
  addHeadMetadata();addOfflineBadge();bindControls();updateInstallButton();updateNetworkBadge();
  globalThis.addEventListener('vocab:settings-saved',()=>{void syncSubscription().catch(error=>setStatus(error.message,'error'));});
  globalThis.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;updateInstallButton();});
  globalThis.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateInstallButton();toast('Vocab Master đã được cài đặt.');});
  globalThis.addEventListener('online',updateNetworkBadge);globalThis.addEventListener('offline',updateNetworkBadge);
  if(IS_DEVELOPMENT){await refreshNotificationStatus();return;}
  try{await registerServiceWorker();await refreshNotificationStatus();await syncSubscription();}
  catch(error){setStatus(error.message,'error');}
}

initPwa();
