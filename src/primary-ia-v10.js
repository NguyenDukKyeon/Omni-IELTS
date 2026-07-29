let mounted=false;
let routeActive=false;
let observer=null;
let dialogHome=null;

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

function ensureStyles(){
  if(document.querySelector('link[href="/v10-ia.css"]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/v10-ia.css';
  document.head.append(link);
}

function renameCoreNavigation(){
  const capture=$('[data-route="capture"] .nav-label');
  const library=$('[data-route="library"] .nav-label');
  if(capture&&capture.textContent!=='Thu thập')capture.textContent='Thu thập';
  if(library&&library.textContent!=='Kho từ')library.textContent='Kho từ';
  const mobileCapture=$('.bottom-nav [data-route="capture"] small');
  const mobileLibrary=$('.bottom-nav [data-route="library"] small');
  if(mobileCapture&&mobileCapture.textContent!=='Thu thập')mobileCapture.textContent='Thu thập';
  if(mobileLibrary&&mobileLibrary.textContent!=='Kho từ')mobileLibrary.textContent='Kho từ';
}

function desktopIeltsButton(){
  let button=$('.side-nav [data-route="ielts"]');
  if(button)return button;
  button=document.createElement('button');
  button.type='button';
  button.className='nav-item';
  button.dataset.route='ielts';
  button.innerHTML=`<span class="nav-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14.5"></path><path d="M8 7h8M8 11h8M8 15h5"></path><path d="M2 19.5h20"></path></svg></span><span class="nav-label">IELTS</span>`;
  const progress=$('.side-nav [data-route="progress"]');
  progress?.before(button);
  return button;
}

function mobileIeltsButton(){
  let button=$('.bottom-nav [data-route="ielts"]');
  if(button)return button;
  button=document.createElement('button');
  button.type='button';
  button.dataset.route='ielts';
  button.innerHTML='<span>🎓</span><small>IELTS</small>';
  const progress=$('.bottom-nav [data-route="progress"]');
  progress?.before(button);
  return button;
}

function ensureRouteView(){
  let view=$('[data-view="ielts"]');
  if(view)return view;
  view=document.createElement('section');
  view.className='route-view v10-primary-ielts-view';
  view.dataset.view='ielts';
  view.setAttribute('aria-label','IELTS');
  view.innerHTML='<div id="v10IeltsRouteHost" class="v10-ielts-route-host"><div class="v10-loading">Đang chuẩn bị IELTS…</div></div>';
  const progress=$('[data-view="progress"]');
  if(progress?.parentNode)progress.parentNode.insertBefore(view,progress.nextSibling);
  else $('.main-content')?.append(view);
  return view;
}

function suppressLegacyLaunchers(){
  for(const node of $$('#openIeltsLabButton,#openIeltsLabMobile')){
    node.hidden=true;
    node.setAttribute('aria-hidden','true');
    node.tabIndex=-1;
  }
}

function setVisualRoute(route){
  $$('.route-view').forEach(view=>view.classList.toggle('active',view.dataset.view===route));
  $$('[data-route]').forEach(button=>button.classList.toggle('active',button.dataset.route===route));
}

async function embedHub(tab='today'){
  const view=ensureRouteView();
  const host=$('#v10IeltsRouteHost');
  const api=globalThis.VocabMasterIeltsHub;
  if(!host||!api?.open)throw new Error('IELTS Hub v10 chưa sẵn sàng.');
  const dialog=$('#v10IeltsHubDialog');
  if(!dialog)throw new Error('Không tìm thấy IELTS Hub.');
  if(!dialogHome)dialogHome={parent:dialog.parentNode,next:dialog.nextSibling};
  await api.open(tab);
  if(dialog.open)dialog.close();
  host.replaceChildren(dialog);
  dialog.classList.add('v10-ielts-route-embedded');
  dialog.show();
  view.dataset.ready='true';
}

function restoreHubDialog(){
  const dialog=$('#v10IeltsHubDialog');
  if(!dialog?.classList.contains('v10-ielts-route-embedded'))return;
  if(dialog.open)dialog.close();
  dialog.classList.remove('v10-ielts-route-embedded');
  const parent=dialogHome?.parent?.isConnected?dialogHome.parent:document.body;
  if(dialogHome?.next?.parentNode===parent)parent.insertBefore(dialog,dialogHome.next);
  else parent.append(dialog);
  const host=$('#v10IeltsRouteHost');
  if(host&&!host.children.length)host.innerHTML='<div class="v10-loading">Đang chuẩn bị IELTS…</div>';
}

async function activateIelts({tab='today'}={}){
  routeActive=true;
  document.documentElement.dataset.v10PrimaryRoute='ielts';
  setVisualRoute('ielts');
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  await embedHub(tab);
}

function deactivateIelts(){
  if(!routeActive)return;
  routeActive=false;
  delete document.documentElement.dataset.v10PrimaryRoute;
  restoreHubDialog();
}

function handleIeltsNavigation(event){
  const button=event.target.closest?.('[data-route="ielts"]');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  void activateIelts().catch(error=>{
    const host=$('#v10IeltsRouteHost');
    if(host)host.innerHTML=`<div class="ielts-empty"><strong>Không mở được IELTS</strong><p>${String(error.message||error)}</p></div>`;
  });
}

function handleCoreNavigation(event){
  const button=event.target.closest?.('[data-route]');
  if(!button||button.dataset.route==='ielts')return;
  deactivateIelts();
}

function bindLegacyReturn(){
  const legacy=$('#ieltsLabDialog');
  if(!legacy||legacy.dataset.v10ReturnBound==='true')return;
  legacy.dataset.v10ReturnBound='true';
  legacy.addEventListener('close',()=>{if(routeActive)void embedHub('today').catch(()=>{});});
}

function refreshPrimaryIA(){
  ensureStyles();
  renameCoreNavigation();
  desktopIeltsButton();
  mobileIeltsButton();
  ensureRouteView();
  suppressLegacyLaunchers();
  bindLegacyReturn();
}

export function mountPrimaryIAV10(){
  if(mounted)return globalThis.VocabMasterPrimaryIA;
  mounted=true;
  refreshPrimaryIA();
  document.addEventListener('click',handleIeltsNavigation,true);
  document.addEventListener('click',handleCoreNavigation,true);
  observer=new MutationObserver(refreshPrimaryIA);
  observer.observe(document.body,{childList:true,subtree:true});
  globalThis.VocabMasterPrimaryIA={
    open:tab=>activateIelts({tab}),
    close:()=>{deactivateIelts();globalThis.VocabMasterApp?.setRoute?.('today');},
    refresh:refreshPrimaryIA,
    isActive:()=>routeActive,
    destroy:()=>{observer?.disconnect();document.removeEventListener('click',handleIeltsNavigation,true);document.removeEventListener('click',handleCoreNavigation,true);deactivateIelts();mounted=false;}
  };
  return globalThis.VocabMasterPrimaryIA;
}
