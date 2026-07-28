const TAB_ORDER=['learning','audio','ai','data'];

function ensureStyles(){
  if(document.querySelector('link[href="/settings-tabs.css"]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/settings-tabs.css';
  document.head.append(link);
}

function createLearningFsrsSection(){
  const section=document.createElement('section');
  section.className='fsrs-settings';
  section.innerHTML=`
    <div>
      <h3>FSRS & lịch ôn</h3>
      <p class="muted">Mức nhớ mục tiêu cao hơn tạo nhiều lượt ôn hơn. 90% là mức cân bằng cho học cá nhân.</p>
    </div>
    <div class="form-grid">
      <label>Mức nhớ mục tiêu
        <select id="fsrsRetention">
          <option value="0.85">85% · nhẹ</option>
          <option value="0.88">88%</option>
          <option value="0.9">90% · cân bằng</option>
          <option value="0.92">92%</option>
          <option value="0.95">95% · nhiều lượt ôn</option>
        </select>
      </label>
      <label>Khoảng tối đa
        <select id="fsrsMaximumInterval">
          <option value="365">1 năm</option>
          <option value="3650">10 năm</option>
          <option value="36500">100 năm</option>
        </select>
      </label>
    </div>`;
  return section;
}

function createDataPanelContent(){
  const fragment=document.createDocumentFragment();
  const pwa=document.createElement('section');
  pwa.id='pwaSettings';
  pwa.className='pwa-settings';
  pwa.innerHTML=`
    <div>
      <h3>Ứng dụng & nhắc học</h3>
      <p class="muted">Cài Vocab Master như ứng dụng và nhận nhắc học qua thông báo hệ điều hành.</p>
    </div>
    <div class="pwa-status" id="pwaStatus">Đang kiểm tra khả năng hỗ trợ...</div>
    <div class="pwa-actions">
      <button type="button" class="secondary-button" id="installPwaButton">⬇ Cài ứng dụng</button>
      <button type="button" class="secondary-button" id="toggleNotificationsButton">🔔 Bật nhắc học</button>
      <button type="button" class="secondary-button" id="testNotificationButton">Gửi thử</button>
    </div>`;

  const data=document.createElement('section');
  data.id='dataProtectionSettings';
  data.className='data-protection-settings';
  data.innerHTML=`
    <div>
      <h3>Dữ liệu & sao lưu</h3>
      <p class="muted">IndexedDB là nguồn dữ liệu chuẩn cho thư viện, cài đặt, tiến độ và lịch FSRS. Hệ thống giữ tối đa 30 snapshot cục bộ.</p>
    </div>
    <div id="persistenceStatus" class="storage-status">Đang kiểm tra dữ liệu...</div>
    <div class="form-actions">
      <button type="button" class="secondary-button" id="requestPersistentStorage">Giữ dữ liệu bền vững</button>
      <button type="button" class="secondary-button" id="downloadFullBackup">Tải backup đầy đủ</button>
      <button type="button" class="secondary-button" id="chooseAutoBackup">Chọn file tự động</button>
      <button type="button" class="secondary-button" id="restoreFullBackup">Khôi phục backup</button>
      <button type="button" class="secondary-button danger-soft" id="resetLearningProgress">Đặt lại tiến độ học</button>
      <input type="file" id="restoreBackupInput" accept="application/json,.json" hidden />
    </div>`;
  fragment.append(pwa,data);
  return fragment;
}

export function activateSettingsTab(name='learning',{focus=false}={}){
  const selected=TAB_ORDER.includes(name)?name:'learning';
  document.querySelectorAll('[data-settings-tab]').forEach(button=>{
    const active=button.dataset.settingsTab===selected;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
    button.tabIndex=active?0:-1;
    if(active&&focus)button.focus();
  });
  document.querySelectorAll('[data-settings-panel]').forEach(panel=>{
    const active=panel.dataset.settingsPanel===selected;
    panel.hidden=!active;
    panel.classList.toggle('active',active);
  });
  const dialog=document.querySelector('#settingsDialog');
  if(dialog)dialog.dataset.activeTab=selected;
}

export function initializeSettingsUI(){
  ensureStyles();
  const form=document.querySelector('#settingsForm');
  if(!form||form.dataset.tabsReady==='true')return;
  form.dataset.tabsReady='true';

  const sessionSection=[...form.children].find(node=>node.tagName==='SECTION'&&!node.classList.contains('audio-settings')&&!node.classList.contains('ai-settings'));
  const audioSection=form.querySelector('.audio-settings');
  const aiSection=form.querySelector('.ai-settings');
  const actions=form.querySelector(':scope > .form-actions');

  const tabs=document.createElement('div');
  tabs.className='settings-tabs';
  tabs.setAttribute('role','tablist');
  tabs.setAttribute('aria-label','Nhóm cài đặt');
  const labels={learning:'🎯 Mục tiêu & FSRS',audio:'🔊 Âm thanh',ai:'✨ Gemini AI',data:'💾 Dữ liệu & PWA'};
  tabs.innerHTML=TAB_ORDER.map((name,index)=>`<button type="button" role="tab" class="settings-tab${index===0?' active':''}" data-settings-tab="${name}" aria-selected="${index===0?'true':'false'}" tabindex="${index===0?'0':'-1'}">${labels[name]}</button>`).join('');

  const panels=document.createElement('div');
  panels.className='settings-panels';
  const learning=document.createElement('div');
  learning.className='settings-panel active';
  learning.dataset.settingsPanel='learning';
  if(sessionSection)learning.append(sessionSection);
  learning.append(createLearningFsrsSection());

  const audio=document.createElement('div');
  audio.className='settings-panel';
  audio.dataset.settingsPanel='audio';
  audio.hidden=true;
  if(audioSection)audio.append(audioSection);

  const ai=document.createElement('div');
  ai.className='settings-panel';
  ai.dataset.settingsPanel='ai';
  ai.hidden=true;
  if(aiSection)ai.append(aiSection);

  const data=document.createElement('div');
  data.className='settings-panel';
  data.dataset.settingsPanel='data';
  data.hidden=true;
  data.append(createDataPanelContent());

  panels.append(learning,audio,ai,data);
  form.prepend(panels);
  form.prepend(tabs);
  if(actions)form.append(actions);

  tabs.addEventListener('click',event=>{
    const button=event.target.closest('[data-settings-tab]');
    if(button)activateSettingsTab(button.dataset.settingsTab);
  });
  tabs.addEventListener('keydown',event=>{
    const current=event.target.closest('[data-settings-tab]');
    if(!current||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const index=TAB_ORDER.indexOf(current.dataset.settingsTab);
    const next=event.key==='Home'?0:event.key==='End'?TAB_ORDER.length-1:event.key==='ArrowRight'?(index+1)%TAB_ORDER.length:(index-1+TAB_ORDER.length)%TAB_ORDER.length;
    activateSettingsTab(TAB_ORDER[next],{focus:true});
  });
  activateSettingsTab('learning');
}

initializeSettingsUI();
