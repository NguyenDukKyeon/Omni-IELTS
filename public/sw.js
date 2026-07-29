const CACHE_VERSION='vocab-master-pwa-v6';
const STATIC_CACHE=`${CACHE_VERSION}-static`;
const RUNTIME_CACHE=`${CACHE_VERSION}-runtime`;
const PRECACHE=[
  '/',
  '/index.html',
  '/styles.css',
  '/experience.css',
  '/settings-tabs.css',
  '/ielts-lab.css',
  '/assets/app.js',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/maskable-512.svg',
  '/icons/badge.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(PRECACHE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>!key.startsWith(CACHE_VERSION)).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});

async function networkFirst(request){
  const cache=await caches.open(RUNTIME_CACHE);
  try{
    const response=await fetch(request);
    if(response.ok)cache.put(request,response.clone());
    return response;
  }catch{
    const cached=await cache.match(request)||await caches.match(request);
    if(cached)return cached;
    if(request.mode==='navigate')return caches.match('/offline.html');
    throw new Error('Offline and not cached');
  }
}

async function staleWhileRevalidate(request){
  const cache=await caches.open(RUNTIME_CACHE);
  const cached=await caches.match(request);
  const network=fetch(request).then(response=>{
    if(response.ok)cache.put(request,response.clone());
    return response;
  }).catch(()=>null);
  return cached||await network||new Response('',{status:504,statusText:'Offline'});
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/'))return;
  if(request.mode==='navigate')event.respondWith(networkFirst(request));
  else if(['script','style','worker'].includes(request.destination))event.respondWith(networkFirst(request));
  else event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?.json()||{};}catch{payload={body:event.data?.text()||''};}
  const title=payload.title||'Vocab Master';
  const options={
    body:payload.body||'Đến giờ ôn từ vựng hôm nay.',
    icon:payload.icon||'/icons/icon-192.svg',
    badge:payload.badge||'/icons/badge.svg',
    tag:payload.tag||'vocab-master-reminder',
    renotify:Boolean(payload.renotify),
    requireInteraction:Boolean(payload.requireInteraction),
    data:{url:payload.url||'/#today',...(payload.data||{})},
    actions:payload.actions||[
      {action:'study',title:'Học ngay'},
      {action:'close',title:'Đóng'}
    ]
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  if(event.action==='close')return;
  const target=new URL(event.notification.data?.url||'/#today',self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
    for(const client of clients){
      if(new URL(client.url).origin===self.location.origin){client.navigate(target);return client.focus();}
    }
    return self.clients.openWindow(target);
  }));
});

async function saveReminderConfig(config={}){
  const cache=await caches.open(`${CACHE_VERSION}-config`);
  await cache.put('/__vocab-reminder-config__',new Response(JSON.stringify({reminder:/^([01]\d|2[0-3]):[0-5]\d$/.test(String(config.reminder||''))?config.reminder:'20:00',timeZone:String(config.timeZone||'UTC'),locale:String(config.locale||'vi'),enabled:config.enabled!==false}),{headers:{'content-type':'application/json'}}));
}

async function readReminderConfig(){
  const response=await caches.match('/__vocab-reminder-config__');
  return response?response.json().catch(()=>({})):{};
}

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='REMINDER_CONFIG')event.waitUntil(saveReminderConfig(event.data.config));
  if(event.data?.type==='SHOW_NOTIFICATION'){
    event.waitUntil(self.registration.showNotification(event.data.title||'Vocab Master',{
      body:event.data.body||'Thông báo đang hoạt động.',icon:'/icons/icon-192.svg',badge:'/icons/badge.svg',tag:'vocab-master-local-test',data:{url:'/#today'}
    }));
  }
});

function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);return Uint8Array.from([...raw].map(character=>character.charCodeAt(0)));
}

self.addEventListener('pushsubscriptionchange',event=>{
  event.waitUntil(Promise.all([fetch('/api/push/public-key').then(response=>response.json()),readReminderConfig()]).then(async([data,config])=>{
    if(!data.publicKey)return;
    const subscription=await self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(data.publicKey)});
    await fetch('/api/push/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({subscription:subscription.toJSON(),reminder:config.reminder||'20:00',timeZone:config.timeZone||'UTC',locale:config.locale||'vi',enabled:config.enabled!==false})});
  }).catch(()=>{}));
});
