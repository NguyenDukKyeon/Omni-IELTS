import {
  seedCards,
  sanitizeCardInput,
  parseImportText,
  createSessionSteps,
  checkAnswer,
  filterCards,
  normalizeText,
  weakWordScore,
  cardIdentityKey,
  calculateExamPacing,
  forecastWorkload,
  summarizeErrorFingerprint,
  estimateSessionMinutes,
  getTransferDueCards
} from './learning.js';
import {
  DEFAULT_FSRS_CONFIG,
  FSRS_SKILLS,
  applyFsrsRating,
  getCardRetrievability,
  getSkillDueAt,
  getDueSkillItems,
  plannedSkillsForCard,
  skillIsUnlocked,
  previewFsrsRatings,
  saveFsrsConfig,
  validateFsrsConfig,
  requiredSkillsForCard,
  skillHasReviews
} from './fsrs-scheduler.js';
import {
  listReviewEvents,
  persistCard,
  persistCardsBatch,
  persistImportBatch,
  deleteCard as deletePersistedCard,
  persistFsrsConfig,
  persistMetrics,
  persistReviewResult,
  persistSettings,
  downloadBackupFile
} from './persistence.js';
import {
  calculateKnowledgeStrength,
  calculateSkillCoverage,
  summarizeActivity,
  summarizeReviewQuality
} from './progress.js';
import { audioManager, AUDIO_RATES } from './audio-manager.js';
import { activateSettingsTab } from './settings-ui.js';

const SESSION_KEY='vocab-master-gemini-key';
const MAX_AUDIO_BYTES=2*1024*1024;
const MAX_RECORDING_MS=12_000;
const AI_TIMEOUT_MS=30_000;
const PRONUNCIATION_TIMEOUT_MS=45_000;
const defaultSettings={
  minutes:10,
  newLimit:5,
  learningGoal:'passive',
  examDate:'',
  voice:'en-US',
  voiceURI:'',
  voiceName:'',
  audioRate:'medium',
  autoPlayNew:false,
  playExampleAfterWord:false,
  showSlowAudio:true,
  reminder:'20:00',
  model:'gemini-3.6-flash',
  interests:'',
  notificationEnabled:false
};
const bootstrap=globalThis.__VOCAB_INITIAL_STATE__||{};
const state={
  cards:(Array.isArray(bootstrap.cards)?bootstrap.cards:[]).map(card=>sanitizeCardInput(card)),
  settings:{...defaultSettings,...(bootstrap.settings||{})},
  fsrsConfig:validateFsrsConfig({...DEFAULT_FSRS_CONFIG,...(bootstrap.fsrsConfig||{})}),
  metrics:{dailyDate:'',dailyDone:0,dailyTarget:0,studyMinutes:0,completedReviews:0,activitiesDone:0,independentReviewsDone:0,newSkillsIntroduced:0,...(bootstrap.metrics||{})},
  route:location.hash.replace('#','')||'today',
  libraryFilter:'all',
  libraryDeck:'all',
  session:null,
  importResult:null,
  detailAi:null,
  pendingAiDraft:null,
  activeRecorder:null,
  progressRenderToken:0,
  pendingDeleteCardId:null,
  lastDeletedCard:null,
  previousStudyFocus:null
};
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

saveFsrsConfig(state.fsrsConfig);

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function createId(prefix='item'){return globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;}
function showToast(message,{actionLabel='',onAction=null,duration=4000}={}){
  const toast=$('#toast');if(!toast)return;
  toast.replaceChildren();
  const text=document.createElement('span');text.textContent=message;toast.append(text);
  if(actionLabel&&typeof onAction==='function'){
    const button=document.createElement('button');button.type='button';button.className='toast-action';button.textContent=actionLabel;
    button.addEventListener('click',()=>{clearTimeout(showToast.timer);toast.classList.remove('show');onAction();},{once:true});toast.append(button);
  }
  toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),duration);
}
function openDialog(id){const dialog=$(id);if(dialog&&!dialog.open)dialog.showModal();}
function closeDialog(dialog){if(dialog?.open)dialog.close();}
function persistSettingsInBackground(){void persistSettings(state.settings).catch(error=>{console.warn('[persistence] Không thể lưu cài đặt',error);showToast('Không thể lưu cài đặt.');});}
function persistMetricsInBackground(){void persistMetrics(state.metrics).catch(error=>console.warn('[persistence] Không thể lưu chỉ số',error));}
function persistOneCardInBackground(card,reason){void persistCard(card,reason).catch(error=>{console.warn('[persistence] Không thể lưu thẻ',error);showToast(error.outboxQueued?'Thay đổi đang chờ trong outbox và sẽ được thử lại.':'Không thể bảo vệ thay đổi này. Hãy tải backup trước khi tiếp tục.');});}
function localDayKey(value=Date.now()){const date=new Date(value);return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function resetDailyProgressWhenNeeded(){const today=localDayKey();if(state.metrics.dailyDate!==today){state.metrics.dailyDate=today;state.metrics.dailyDone=0;state.metrics.dailyTarget=0;state.metrics.activitiesDone=0;state.metrics.independentReviewsDone=0;state.metrics.newSkillsIntroduced=0;persistMetricsInBackground();}}
function interestsList(){return String(state.settings.interests||'').split(',').map(value=>value.trim()).filter(Boolean).slice(0,8);}
function cardRetrievability(card,skill=null,now=Date.now()){return getCardRetrievability(card,now,state.fsrsConfig,skill);}
function activeCards(){return state.cards.filter(card=>!card.suspendedAt&&!card.archivedAt);}
function findCard(cardId){return state.cards.find(card=>card.id===cardId);}
function replaceCard(card){const index=state.cards.findIndex(item=>item.id===card.id);if(index>=0)state.cards[index]=sanitizeCardInput(card);else state.cards.unshift(sanitizeCardInput(card));return state.cards[index>=0?index:0];}

function setRoute(route){
  state.route=['today','capture','library','progress'].includes(route)?route:'today';
  if(location.hash!==`#${state.route}`)location.hash=state.route;
  $$('.route-view').forEach(view=>view.classList.toggle('active',view.dataset.view===state.route));
  $$('[data-route]').forEach(button=>button.classList.toggle('active',button.dataset.route===state.route));
  if(state.route==='library')renderLibrary();
  if(state.route==='progress')void renderProgress();
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function decks(){return[...new Set(state.cards.map(card=>card.deck||'Cá nhân'))].sort((a,b)=>a.localeCompare(b,'vi'));}
function refreshDeckControls(){
  const options=decks().map(deck=>`<option value="${escapeHtml(deck)}"></option>`).join('');
  if($('#deckOptions'))$('#deckOptions').innerHTML=options;
  if($('#libraryDeckFilter')){
    $('#libraryDeckFilter').innerHTML=`<option value="all">Tất cả deck</option>${decks().map(deck=>`<option value="${escapeHtml(deck)}">${escapeHtml(deck)}</option>`).join('')}`;
    $('#libraryDeckFilter').value=state.libraryDeck;
  }
}
function weakCards(){return activeCards().filter(card=>card.status!=='new'&&weakWordScore(card)>=30).sort((a,b)=>weakWordScore(b)-weakWordScore(a));}
function hasModeContent(mode){return createSessionSteps(state.cards,mode,6,{newLimit:state.settings.newLimit,minutes:3,fsrsConfig:state.fsrsConfig}).length>0;}
function weakestSkillInsight(){
  const labels={recognition:['👁️','Nhận biết','matching'],recall:['⌨️','Tự nhớ','typing'],listening:['🎧','Nghe','listening'],collocation:['🔗','Collocation','collocation'],production:['✍️','Sử dụng chủ động','production']};
  const rows=[];
  for(const skill of FSRS_SKILLS){
    const values=[];
    for(const card of activeCards())if(requiredSkillsForCard(card).includes(skill)&&skillHasReviews(card,skill))values.push(cardRetrievability(card,skill));
    if(values.length)rows.push({skill,score:values.reduce((sum,value)=>sum+value,0)/values.length,samples:values.length});
  }
  rows.sort((a,b)=>a.score-b.score);
  for(const candidate of rows){const[icon,name,mode]=labels[candidate.skill];if(hasModeContent(mode))return{icon,title:`${name} là kỹ năng cần củng cố`,text:`Khả năng nhớ ước tính ${Math.round(candidate.score*100)}% trên ${candidate.samples} lịch đã kiểm chứng.`,mode};}
  if(!state.cards.length)return{icon:'🌱',title:'Bắt đầu bằng một từ quan trọng',text:'Thêm từ bạn vừa gặp hoặc chọn bộ mẫu để khám phá ứng dụng.',mode:'capture'};
  const mode=hasModeContent('quick')?'quick':'matching';return{icon:'⚡',title:'Ôn ngắn để giữ nhịp',text:'Hệ thống sẽ tự chọn kỹ năng đang đến hạn, thay vì yêu cầu bạn chọn minigame.',mode};
}
function renderToday(){
  resetDailyProgressWhenNeeded();
  const dueItems=getDueSkillItems(state.cards,Date.now(),state.fsrsConfig);
  const fresh=activeCards().filter(card=>card.status==='new').length;
  const weak=weakCards().length;
  const preview=createSessionSteps(state.cards,'today',40,{newLimit:state.settings.newLimit,minutes:state.settings.minutes,fsrsConfig:state.fsrsConfig});
  const planned=preview.filter(step=>step.affectsSchedule&&!step.assisted).length;
  if(Number(state.metrics.dailyTarget||0)<=0&&planned>0){state.metrics.dailyTarget=planned;persistMetricsInBackground();}
  const total=Math.max(1,Number(state.metrics.dailyTarget||0)||planned||1);
  const done=Number(state.metrics.dailyDone||0);
  const pct=Math.min(100,Math.round(done/total*100));
  $('#reviewCount').textContent=dueItems.length;
  $('#newCount').textContent=Math.min(fresh,Number(state.settings.newLimit||0));
  $('#weakCount').textContent=weak;
  $('#sessionMinutes').textContent=preview.length?estimateSessionMinutes(preview):state.settings.minutes;
  $('#dailyPercent').textContent=`${pct}%`;
  if($('#sidebarStreakText'))$('#sidebarStreakText').textContent=`Tiến độ ${pct}%`;
  if($('#sidebarProgressFill'))$('#sidebarProgressFill').style.width=`${pct}%`;
  $('#progressText').textContent=`${Math.min(done,total)}/${total}`;
  $('#ringValue').style.strokeDashoffset=String(302-302*pct/100);
  const aiReady=Boolean(sessionStorage.getItem(SESSION_KEY)||location.hostname==='localhost');
  $('#aiStatus').textContent=aiReady?'AI sẵn sàng; nội dung tạo ra luôn cần bạn xác nhận.':'AI chưa cấu hình. Mở Cài đặt & AI để nhập khóa Gemini.';
  const insight=weakestSkillInsight();
  $('#todayInsightIcon').textContent=insight.icon;$('#todayInsightTitle').textContent=insight.title;$('#todayInsightText').textContent=insight.text;$('#todayInsightAction').dataset.mode=insight.mode;
  $('#todayInsightAction').textContent=insight.mode==='capture'?'Thêm từ':'Luyện ngay';
  const start=$('#startToday');if(start){start.disabled=!preview.length;start.title=preview.length?'':'Hãy thêm từ hoặc chờ đến khi có kỹ năng đến hạn';}
}

function strengthForCard(card,now=Date.now()){
  const required=requiredSkillsForCard(card);const values=required.filter(skill=>skillHasReviews(card,skill)).map(skill=>cardRetrievability(card,skill,now));
  return values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length*100):0;
}
function renderLibrary(){
  const searchValue=$('#librarySearch')?.value||'';
  const cards=filterCards(state.cards,searchValue,state.libraryFilter,state.libraryDeck);
  const mastered=state.cards.filter(card=>card.status==='mastered').length;const weak=weakCards().length;
  $('#libStatTotal').textContent=state.cards.length;$('#libStatMastered').textContent=mastered;$('#libStatWeak').textContent=weak;
  $('#countAll').textContent=state.cards.length;$('#countWord').textContent=state.cards.filter(card=>card.type==='word'||!card.type).length;$('#countCollocation').textContent=state.cards.filter(card=>card.type==='collocation').length;$('#countWeak').textContent=weak;$('#countMastered').textContent=mastered;
  const now=Date.now();
  $('#wordList').innerHTML=cards.length?cards.map(card=>{
    const strength=strengthForCard(card,now);const isNew=card.status==='new';const isCollocation=card.type==='collocation';const suspended=Boolean(card.suspendedAt);
    const badge=isNew?['strength-new','Mới']:strength>=80?['strength-high',`${strength}%`]:strength>=50?['strength-med',`${strength}%`]:['strength-low',`${strength}%`];
    return`<article class="lib-card-item${suspended?' is-suspended':''}" data-card-row="${escapeHtml(card.id)}">
      <button class="lib-card-open" data-open-card="${escapeHtml(card.id)}" aria-label="Mở chi tiết ${escapeHtml(card.front)}">
        <span class="lib-card-icon ${isCollocation?'collocation':'word'}">${isCollocation?'🔗':'🔤'}</span>
        <span class="lib-card-content"><span class="lib-card-header"><strong class="lib-word-title">${escapeHtml(card.front)}</strong>${card.pronunciation?`<span class="lib-ipa">${escapeHtml(card.pronunciation)}</span>`:''}${card.mnemonic?'<span class="lib-mnemonic-badge" title="Có mẹo nhớ AI">✨</span>':''}</span><span class="lib-word-meaning">${escapeHtml(card.back)}</span>${card.example?`<span class="lib-word-example">“${escapeHtml(card.example)}”</span>`:''}</span>
      </button>
      <div class="lib-card-footer"><div class="lib-tags-group">${card.cefr&&card.cefr!=='—'?`<span class="cefr-pill">${escapeHtml(card.cefr)}</span>`:''}<span class="deck-pill">${escapeHtml(card.deck)}</span><span class="deck-pill">${card.learningGoal==='active'?'Chủ động':'Thụ động'}</span>${suspended?'<span class="deck-pill">Đã tạm dừng</span>':''}</div><div class="lib-actions-group"><button class="lib-audio-btn" data-audio-id="${escapeHtml(card.id)}" aria-label="Nghe ${escapeHtml(card.front)}">🔊 <span>Nghe</span></button><span class="memory-strength-pill ${badge[0]}">${badge[1]}</span><button class="lib-delete-btn" data-delete-id="${escapeHtml(card.id)}" aria-label="Xóa ${escapeHtml(card.front)}">🗑️</button></div></div>
    </article>`;
  }).join(''):`<div class="library-empty-state"><div class="empty-illustration">📚</div><h3>${searchValue?'Không tìm thấy kết quả phù hợp':'Thư viện đang trống'}</h3><p>${searchValue?'Thử từ khóa hoặc bộ lọc khác.':'Dữ liệu mẫu không còn tự sinh. Bạn quyết định thêm từ thật hoặc nạp bộ mẫu.'}</p><div class="exercise-actions"><button class="primary-button" data-route-jump="capture">＋ Thêm từ mới</button>${!searchValue?'<button class="secondary-button" data-load-sample>Thêm bộ mẫu</button>':''}</div></div>`;
  $$('[data-open-card]').forEach(button=>button.addEventListener('click',()=>openWordDetail(button.dataset.openCard)));
  $$('[data-audio-id]').forEach(button=>button.addEventListener('click',()=>{const card=findCard(button.dataset.audioId);if(card)void speak(card,'normal','front',button);}));
  $$('[data-delete-id]').forEach(button=>button.addEventListener('click',()=>promptDeleteCard(button.dataset.deleteId)));
  $$('#wordList [data-route-jump]').forEach(button=>button.addEventListener('click',()=>setRoute(button.dataset.routeJump)));
  $('#wordList [data-load-sample]')?.addEventListener('click',()=>void loadSampleDeck());
}

function renderCardCounts(){
  const count=status=>state.cards.filter(card=>card.status===status).length;
  $('#newWordsMetric').textContent=count('new');$('#learningMetric').textContent=count('learning');$('#familiarMetric').textContent=count('familiar');$('#masteredMetric').textContent=count('mastered');
  let success=0,total=0;for(const card of state.cards){const counts=card.ratingCounts||{};success+=Number(counts.hard||0)+Number(counts.good||0)+Number(counts.easy||0);total+=Number(counts.again||0)+Number(counts.hard||0)+Number(counts.good||0)+Number(counts.easy||0);}
  $('#accuracyMetric').textContent=`${total?Math.round(success/total*100):0}%`;$('#minutesMetric').textContent=`${Number(state.metrics.studyMinutes||0)} phút`;
}
async function renderProgress(){
  renderCardCounts();const token=++state.progressRenderToken;
  try{
    const events=await listReviewEvents();if(token!==state.progressRenderToken)return;
    const timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
    const activity=summarizeActivity(events,Date.now(),timeZone);const knowledge=calculateKnowledgeStrength(state.cards,Date.now(),state.fsrsConfig);const coverage=calculateSkillCoverage(state.cards);const quality=summarizeReviewQuality(events);const forecast=forecastWorkload(state.cards,7);const exam=calculateExamPacing(state.cards,state.settings.examDate);const errors=summarizeErrorFingerprint(state.cards);
    $('#streakValue').textContent=activity.streak;$('#daysMetric').textContent=`${activity.activeDaysLast7}/7 ngày`;$('#reviewsLast7').textContent=`${activity.reviewsLast7} lượt`;$('#accuracyMetric').textContent=`${quality.successRate}%`;
    $('#knowledgeStrength').textContent=`${knowledge.percent}%`;$('#knowledgeLabel').textContent=knowledge.label;$('#knowledgeRing').style.setProperty('--knowledge',String(knowledge.percent));
    $('#knowledgeDescription').innerHTML=knowledge.sampleSize?`Độ bền trung bình trên <strong>${knowledge.sampleSize}</strong> lịch đã kiểm chứng. Phủ kỹ năng bắt buộc: <strong>${coverage.reviewed}/${coverage.required} (${coverage.percent}%)</strong>.`:'Chưa có lượt ôn đã kiểm chứng. Kỹ năng chưa học được hiển thị như khoảng trống, không bị tính là đã biết.';
    $('#activityHeatmap').innerHTML=activity.heatmap.map(day=>`<span class="heatmap-cell" data-level="${day.level}" title="${day.key}: ${day.count} lượt" aria-label="${day.key}: ${day.count} lượt"></span>`).join('');
    const forecastNode=$('#workloadForecast');if(forecastNode)forecastNode.innerHTML=`<div class="exam-pacing"><strong>${escapeHtml(exam.label)}</strong><span>${exam.configured?(exam.daysRemaining?`Còn ${exam.daysRemaining} ngày · tối thiểu ${exam.dailyMinimum} kỹ năng/ngày để xử lý ${exam.skillGaps} khoảng trống và ${exam.dueNow} lượt đang đến hạn`:`Ngày mục tiêu đã tới · còn ${exam.skillGaps} khoảng trống kỹ năng`):'Đặt ngày mục tiêu trong Cài đặt để xem nhịp tối thiểu; đây không phải dự đoán điểm thi.'}</span></div>${forecast.map(day=>`<div><strong>${day.date.toLocaleDateString('vi-VN',{weekday:'short'})}</strong><span>${day.reviews} lượt · ~${day.estimatedMinutes} phút</span></div>`).join('')}`;
    const errorNode=$('#errorFingerprint');if(errorNode){const meaningful=errors.filter(item=>item.count>0).slice(0,3);errorNode.innerHTML=meaningful.length?meaningful.map(item=>`<div><strong>${escapeHtml(item.label)}</strong><span>${item.count} lần</span></div>`).join(''):'<p class="muted">Chưa đủ lỗi để xác định mẫu sai thường gặp.</p>';}
  }catch(error){console.warn('[progress] Không thể dựng báo cáo',error);}
}

function voiceOptionLabel(voice){return`${voice.name} — ${voice.lang}${voice.localService?' · offline':''}`;}
function renderVoiceOptions(){
  const select=$('#settingVoiceURI');if(!select)return;const language=$('#settingVoice')?.value||state.settings.voice||'en-US';const all=audioManager.getVoices('en');const exact=all.filter(voice=>String(voice.lang||'').toLowerCase()===language.toLowerCase());const voices=exact.length?exact:all;const previous=select.dataset.userSelected==='true'?select.value:state.settings.voiceURI;const best=audioManager.chooseVoice({language,voiceURI:previous});
  select.innerHTML=voices.length?voices.map(voice=>`<option value="${escapeHtml(voice.voiceURI)}">${escapeHtml(voiceOptionLabel(voice))}</option>`).join(''):'<option value="">Thiết bị chưa cung cấp giọng tiếng Anh</option>';if(best&&voices.some(voice=>voice.voiceURI===best.voiceURI))select.value=best.voiceURI;$('#voiceTestStatus')?.replaceChildren(document.createTextNode(best?`Đề xuất: ${voiceOptionLabel(best)}`:'Chưa tìm thấy giọng phù hợp.'));
}
function updateAudioStatus(status){const node=$('#audioStatus');if(node)node.textContent=status==='playing'?'Đang phát âm…':status==='loading'?'Đang tải giọng…':status==='unavailable'?'Audio không khả dụng.':'Sẵn sàng phát âm.';}
async function playText(text,{mode='normal',button=null,label='Nghe',language=state.settings.voice,voiceURI=state.settings.voiceURI,defaultRate=state.settings.audioRate}={}){
  const value=String(text||'').trim();if(!value){showToast('Chưa có nội dung để phát.');return null;}const original=button?.innerHTML;if(button){button.disabled=true;button.classList.add('is-playing');button.setAttribute('aria-busy','true');button.textContent='◌ Đang phát';}
  try{return await audioManager.speakText(value,{mode,language,voiceURI,defaultRate,onStart:()=>updateAudioStatus('playing'),onEnd:()=>updateAudioStatus('idle')});}catch(error){showToast(error.message);return{error};}finally{if(button){button.disabled=false;button.classList.remove('is-playing');button.removeAttribute('aria-busy');button.innerHTML=original||label;}}
}
async function speak(card,mode='normal',target='front',button=null,{includeExample=false}={}){const text=target==='example'?card?.example:card?.front;const result=await playText(text,{mode:target==='example'?'example':mode,button,label:target==='example'?'Nghe câu':'Nghe từ'});if(target==='front'&&includeExample&&card?.example&&!result?.cancelled&&!result?.error){await new Promise(resolve=>setTimeout(resolve,500));return playText(card.example,{mode:'example'});}return result;}
audioManager.subscribe(event=>{if(event.type==='voices')renderVoiceOptions();if(event.type==='status')updateAudioStatus(event.status);});

function modeLabel(mode){return({today:'Phiên thông minh',quick:'Ôn nhanh 3 phút',matching:'Nối cặp',typing:'Tự nhớ & chính tả',cloze:'Điền ngữ cảnh',listening:'Luyện nghe',pronunciation:'Coaching phát âm',collocation:'Collocation',production:'Viết câu',output:'Phản xạ AI',weak:'Từ yếu',mistakes:'Từ yếu',test:'Kiểm tra',deck:'Học theo deck',transfer:'Transfer check'})[mode]||'Phiên học';}
function startStudy(mode='today',options={},fallbackMode=null){
  if(mode==='capture'){setRoute('capture');return true;}
  if(!state.cards.length){showToast('Thư viện đang trống. Hãy thêm từ hoặc bộ mẫu.');setRoute('capture');return false;}
  const minutes=mode==='quick'?3:Number(state.settings.minutes||10);const limit=mode==='quick'?8:40;
  const steps=createSessionSteps(state.cards,mode,limit,{newLimit:state.settings.newLimit,minutes,timeBudgetSeconds:minutes*60,fsrsConfig:state.fsrsConfig,...options});
  if(!steps.length){if(fallbackMode&&fallbackMode!==mode){showToast('Chưa có bài đúng chế độ này; đã chuyển sang phiên tổng hợp.');return startStudy(fallbackMode,{},null);}showToast(mode==='weak'?'Chưa có từ nào đủ điều kiện “từ yếu”.':'Không có kỹ năng đến hạn cho phiên này.');return false;}
  state.previousStudyFocus=document.activeElement;state.session={id:createId('session'),mode,steps,index:0,completed:0,correct:0,startedAt:Date.now(),retryIds:new Set(),minutesRecorded:false};
  const overlay=$('#studyOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';overlay.focus();renderStudyStep();return true;
}
function stopActiveRecorder(){const active=state.activeRecorder;if(!active)return;clearTimeout(active.timer);try{if(active.recorder?.state==='recording')active.recorder.stop();}catch{}try{active.recognition?.abort?.();}catch{}for(const track of active.stream?.getTracks?.()||[])track.stop();state.activeRecorder=null;}
function recordSessionMinutes(){const session=state.session;if(!session||session.minutesRecorded||session.completed<=0)return;const elapsed=Math.max(1,Math.round((Date.now()-session.startedAt)/60000));state.metrics.studyMinutes=Number(state.metrics.studyMinutes||0)+elapsed;session.minutesRecorded=true;persistMetricsInBackground();}
function closeStudy(){stopActiveRecorder();audioManager.stop();recordSessionMinutes();const overlay=$('#studyOverlay');overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';state.session=null;renderAll();state.previousStudyFocus?.focus?.();state.previousStudyFocus=null;}
function activeContext(){const session=state.session;const step=session?.steps[session.index];const card=step&&findCard(step.cardId);return{session,step,card};}
function nextStep(){const{session}=activeContext();if(!session)return;session.index+=1;if(session.index>=session.steps.length){finishStudy();return;}renderStudyStep();}
function finishStudy(){const session=state.session;if(!session)return;showToast(`Hoàn thành ${session.completed} hoạt động · ${session.correct} lần đạt.`);setTimeout(closeStudy,700);}
function resolvedSkill(step,card){return step?.skill||(step?.kind==='typing'||step?.kind==='sentence-cloze'?'recall':step?.kind==='dictation'||step?.kind==='listening-choice'?'listening':step?.kind==='cloze'?'collocation':step?.kind==='production'||step?.kind==='output'?'production':card?.type==='collocation'?'collocation':'recognition');}
function errorCategory(step,rating){if(rating!=='again'&&rating!=='hard')return null;if(step?.kind==='dictation'||step?.kind==='typing')return'spelling';if(step?.kind==='listening-choice')return'listening';if(step?.kind==='cloze')return'collocation';if(step?.kind==='production'||step?.kind==='output'||step?.kind==='transfer')return'production';return'meaning';}
function evidenceTypeForStep(step={}){if(step.assisted)return'assisted_practice';if(step.transfer)return'transfer_check';if(!step.affectsSchedule)return'optional_practice';if(step.kind==='production'||step.kind==='output')return step.verification==='ai'?'ai_verified_production':'self_assessed_production';return'independent_review';}
async function scheduleSpecificCard(card,rating,step,session){
  if(!step?.affectsSchedule)return null;
  const now=Date.now();const skill=resolvedSkill(step,card);const predictedRetrievability=cardRetrievability(card,skill,now);const result=applyFsrsRating(card,rating,now,state.fsrsConfig,skill);const counts={again:0,hard:0,good:0,easy:0,...(card.ratingCounts||{})};counts[rating]=Number(counts[rating]||0)+1;result.card.ratingCounts=counts;
  const category=errorCategory(step,rating);if(category){result.card.lastError=category;result.card.errorCounts={...(card.errorCounts||{}),[category]:Number(card.errorCounts?.[category]||0)+1};}result.card.lastSkill=skill;
  const savedCard=replaceCard(result.card);
  const evidenceType=evidenceTypeForStep(step);
  const event={id:createId('review'),cardId:card.id,skill,exerciseType:step.kind,sessionMode:session?.mode,sessionId:session?.id,resultLog:result.log,rating,reviewedAt:now,assisted:Boolean(step.assisted),evidenceType,metadata:{dueReason:step.dueReason||'',transfer:Boolean(step.transfer),evidenceType,predictedRetrievability}};
  try{await persistReviewResult({card:savedCard,event,metrics:step.persistMetrics===false?null:state.metrics});}catch(error){if(!error.outboxQueued)replaceCard(card);console.warn('[persistence] Không thể lưu lượt ôn',error);showToast(error.outboxQueued?'Lượt ôn chưa ghi xong; outbox sẽ thử lại khi mở ứng dụng.':'Không thể bảo vệ lượt ôn này. Trạng thái thẻ đã được hoàn tác; hãy tải lại nếu tab khác vừa sửa dữ liệu.');}
  return result.interval;
}
function scheduleCard(card,rating,affectsSchedule=true,overrides={}){const{step,session}=activeContext();return scheduleSpecificCard(card,rating,{...step,...overrides,affectsSchedule},session);}
function addRetry(step){const{session}=activeContext();if(!session||session.retryIds.has(step.id)||step.retry)return;session.retryIds.add(step.id);const nextKind=step.kind==='listening-choice'?'dictation':step.kind==='meaning-choice'||step.kind==='sentence-cloze'||step.kind==='flashcard'?'typing':step.kind;session.steps.push({...step,id:`${step.id}-retry`,retry:true,assisted:true,affectsSchedule:false,kind:nextKind,skill:resolvedSkill({...step,kind:nextKind},findCard(step.cardId))});}
function recordResult(status,{persist=true,reviewCount=null}={}){const{session,step}=activeContext();if(!session)return;session.completed+=1;if(status==='correct')session.correct+=1;state.metrics.activitiesDone=Number(state.metrics.activitiesDone||0)+1;const completed=reviewCount==null?(step?.affectsSchedule&&!step?.assisted?1:0):Math.max(0,Number(reviewCount||0));state.metrics.completedReviews=Number(state.metrics.completedReviews||0)+completed;state.metrics.independentReviewsDone=Number(state.metrics.independentReviewsDone||0)+completed;state.metrics.dailyDone=state.metrics.independentReviewsDone;if(step?.dueReason==='skill-gap'&&completed)state.metrics.newSkillsIntroduced=Number(state.metrics.newSkillsIntroduced||0)+1;if(persist)persistMetricsInBackground();}
function studySupportMarkup(card){const parts=[];if(card?.mnemonic)parts.push(`<p><strong>✨ Mẹo nhớ:</strong> ${escapeHtml(card.mnemonic)}</p>`);if(card?.example)parts.push(`<p><strong>Ngữ cảnh:</strong> ${escapeHtml(card.example)}${card.translation?`<br><small>${escapeHtml(card.translation)}</small>`:''}</p>`);return parts.length?`<details class="study-support"><summary>Xem gợi ý và mẹo nhớ</summary>${parts.join('')}</details>`:'';}
function renderStudyStep(){
  stopActiveRecorder();audioManager.stop();const{session,step,card}=activeContext();if(!session||!step||(!card&&step.kind!=='matching'&&step.kind!=='output')){finishStudy();return;}
  $('#studyLabel').textContent=modeLabel(session.mode);$('#studyCounter').textContent=`${session.index+1} / ${session.steps.length}`;$('#studyProgressBar').style.width=`${session.index/session.steps.length*100}%`;
  const canPlay=Boolean(step.playAudio||['intro','flashcard','pronunciation'].includes(step.kind));$('#studyAudio').style.visibility=canPlay?'visible':'hidden';$('#studySlowAudio').style.visibility=canPlay&&state.settings.showSlowAudio?'visible':'hidden';
  $('#studyHint').textContent=step.retry?'Đây là bài sửa có hỗ trợ; kết quả không kéo dài lịch FSRS.':hintForStep(step);
  const host=$('#exerciseHost');host.replaceChildren();
  if(step.kind==='intro')renderIntro(host,card);else if(step.kind==='flashcard')renderFlashcard(host,card,step);else if(['choice','meaning-choice','listening-choice'].includes(step.kind))renderChoice(host,card,step);else if(['typing','dictation','cloze','sentence-cloze'].includes(step.kind))renderInputExercise(host,card,step);else if(step.kind==='production')renderProduction(host,card,step);else if(step.kind==='transfer')renderTransfer(host,card,step);else if(step.kind==='matching')renderMatching(host,step);else if(step.kind==='pronunciation')renderPronunciation(host,card,step);else if(step.kind==='output')renderOutputPractice(host,step);
  if(step.playAudio&&step.kind!=='pronunciation')setTimeout(()=>void speak(card,'normal','front'),250);else if(step.kind==='intro'&&state.settings.autoPlayNew)setTimeout(()=>void speak(card,'normal','front',null,{includeExample:state.settings.playExampleAfterWord}),250);
}
function hintForStep(step){return({intro:'Khám phá từ mới trước khi kiểm tra',flashcard:'Hãy cố nhớ rồi mới lật thẻ',choice:'Chọn đáp án phù hợp nhất','meaning-choice':'Chọn nghĩa đúng','listening-choice':'Nghe kỹ rồi chọn nghĩa',typing:'Tự nhớ lại, không nhìn đáp án',dictation:'Nghe rồi nhập lại',cloze:'Điền phần còn thiếu của collocation','sentence-cloze':'Dùng ngữ cảnh để truy hồi từ',production:'Viết một câu ngắn và tự nhiên',transfer:'Kiểm tra khả năng dùng trong ngữ cảnh mới',matching:'Khởi động; bài này không thay đổi lịch',pronunciation:'Coaching mức dễ hiểu; không thay đổi FSRS',output:'Mỗi từ được đánh giá riêng'})[step.kind]||'';}
function renderIntro(host,card){
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">TỪ MỚI</span><h2>${escapeHtml(card.front)}</h2><p class="meaning">${escapeHtml(card.back)}</p><p class="pronunciation">${escapeHtml(card.pronunciation)}</p><p class="example">${escapeHtml(card.example||'Chưa có ví dụ.')}</p><span class="translation">${escapeHtml(card.translation||'')}</span>${card.mnemonic?`<div class="ai-feedback"><strong>✨ Mẹo nhớ</strong><p>${escapeHtml(card.mnemonic)}</p></div>`:''}<div class="audio-actions"><button class="secondary-button" id="introAudio">🔊 Nghe từ</button>${state.settings.showSlowAudio?'<button class="secondary-button" id="introSlowAudio">🐢 Nghe chậm</button>':''}${card.example?'<button class="secondary-button" id="introExampleAudio">▶ Nghe câu</button>':''}</div><div class="exercise-actions"><button class="primary-button" id="introContinue">Đã hiểu, kiểm tra tôi</button></div></article>`;
  $('#introAudio').addEventListener('click',event=>void speak(card,'normal','front',event.currentTarget,{includeExample:state.settings.playExampleAfterWord}));$('#introSlowAudio')?.addEventListener('click',event=>void speak(card,'slow','front',event.currentTarget));$('#introExampleAudio')?.addEventListener('click',event=>void speak(card,'example','example',event.currentTarget));
  $('#introContinue').addEventListener('click',()=>{if(card.status==='new'){const updated=replaceCard({...card,status:'learning'});persistOneCardInBackground(updated,'new-card-introduced');}recordResult('introduced');nextStep();});
}
function renderFlashcard(host,card,step){
  let intervals={again:'Theo FSRS',hard:'Theo FSRS',good:'Theo FSRS',easy:'Theo FSRS'};try{intervals=previewFsrsRatings(card,Date.now(),state.fsrsConfig,resolvedSkill(step,card));}catch{}
  host.innerHTML=`<button class="flashcard" id="flashcard" aria-pressed="false"><span class="flashcard-inner"><span class="flashcard-face flashcard-front"><span class="exercise-type">${card.type==='collocation'?'COLLOCATION':'TỪ VỰNG'}</span><strong>${escapeHtml(card.front)}</strong><span class="pronunciation">${escapeHtml(card.pronunciation)}</span><span class="flip-cue">↻ Chạm để xem đáp án</span></span><span class="flashcard-face flashcard-back"><span class="exercise-type">ĐÁP ÁN</span><strong>${escapeHtml(card.back)}</strong><p>${escapeHtml(card.example||'')}</p><span class="translation">${escapeHtml(card.translation||'')}</span>${card.mnemonic?`<p class="mini-badge">✨ ${escapeHtml(card.mnemonic)}</p>`:''}<span class="flip-cue">↻ Chạm để xem mặt trước</span></span></span></button><div class="audio-actions"><button class="secondary-button" id="flashAudio">🔊 Nghe từ</button>${state.settings.showSlowAudio?'<button class="secondary-button" id="flashSlowAudio">🐢 Nghe chậm</button>':''}${card.example?'<button class="secondary-button" id="flashExampleAudio">▶ Nghe câu</button>':''}</div><div class="rating-panel" id="ratingPanel" hidden>${['again','hard','good','easy'].map((rating,index)=>`<button class="${rating}" data-rating="${rating}"><strong>${['Chưa nhớ','Nhớ nhưng khó','Đã nhớ','Rất dễ'][index]}</strong><small>${escapeHtml(intervals[rating])}</small></button>`).join('')}</div>`;
  const flashcard=$('#flashcard');flashcard.addEventListener('click',()=>{const flipped=flashcard.classList.toggle('flipped');flashcard.setAttribute('aria-pressed',String(flipped));$('#ratingPanel').hidden=!flipped;});flashcard.focus();
  $('#flashAudio').addEventListener('click',event=>void speak(card,'normal','front',event.currentTarget));$('#flashSlowAudio')?.addEventListener('click',event=>void speak(card,'slow','front',event.currentTarget));$('#flashExampleAudio')?.addEventListener('click',event=>void speak(card,'example','example',event.currentTarget));
  $$('[data-rating]').forEach(button=>button.addEventListener('click',async()=>{const rating=button.dataset.rating;$$('[data-rating]').forEach(item=>item.disabled=true);recordResult(rating==='again'?'wrong':'correct',{persist:!step.affectsSchedule});const interval=await scheduleCard(card,rating,step.affectsSchedule);if(rating==='again')addRetry(step);showToast(interval?`Ôn tiếp sau ${interval.label}`:'Đã ghi nhận');nextStep();}));
}
function renderChoice(host,card,step){
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">${step.kind==='listening-choice'?'NGHE':'CHỌN ĐÁP ÁN'}</span><h2>${escapeHtml(step.prompt)}</h2>${step.playAudio?`<div class="audio-actions centered"><button class="secondary-button" id="inlineAudio">🔊 Nghe</button>${state.settings.showSlowAudio?'<button class="secondary-button" id="inlineSlowAudio">🐢 Nghe chậm</button>':''}</div>`:''}<div class="choice-list">${step.choices.map(choice=>`<button data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join('')}</div><div id="answerFeedback" aria-live="polite"></div></article>`;
  $('#inlineAudio')?.addEventListener('click',event=>void speak(card,'normal','front',event.currentTarget));$('#inlineSlowAudio')?.addEventListener('click',event=>void speak(card,'slow','front',event.currentTarget));$$('[data-choice]').forEach(button=>button.addEventListener('click',()=>void submitAnswer(button.dataset.choice)));
}
function renderInputExercise(host,card,step){
  const label=step.kind==='dictation'?'CHÍNH TẢ':step.kind==='cloze'?'COLLOCATION':step.kind==='sentence-cloze'?'ĐIỀN NGỮ CẢNH':'TỰ NHỚ';
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">${label}</span><h2 class="${step.kind==='sentence-cloze'?'context-cloze':''}">${escapeHtml(step.prompt)}</h2>${step.kind==='dictation'?`<div class="audio-actions centered"><button class="secondary-button" id="dictationAudio">🔊 Nghe</button>${state.settings.showSlowAudio?'<button class="secondary-button" id="dictationSlowAudio">🐢 Nghe chậm</button>':''}</div>`:''}${step.context?`<p class="example">${escapeHtml(step.context)}</p>`:''}${step.meaning?`<p class="translation">Gợi ý nghĩa: ${escapeHtml(step.meaning)}</p>`:''}<form class="answer-form" id="answerForm"><input id="answerInput" autocomplete="off" placeholder="Nhập đáp án..." /><button class="primary-button">Kiểm tra</button></form><div id="answerFeedback" aria-live="polite"></div></article>`;
  $('#dictationAudio')?.addEventListener('click',event=>void speak(card,'normal','front',event.currentTarget));$('#dictationSlowAudio')?.addEventListener('click',event=>void speak(card,'slow','front',event.currentTarget));$('#answerForm').addEventListener('submit',event=>{event.preventDefault();void submitAnswer($('#answerInput').value);});setTimeout(()=>$('#answerInput').focus(),50);
}
async function submitAnswer(answer){
  const{step,card}=activeContext();const result=checkAnswer(card,step,answer);if(result.status==='empty'){showToast('Hãy nhập hoặc chọn một đáp án.');return;}
  const rating=result.status==='correct'?'good':result.status==='near'?'hard':'again';
  const feedback=$('#answerFeedback');feedback.className=`feedback ${result.status==='correct'?'correct':result.status==='near'?'near':'wrong'}`;feedback.innerHTML=`<strong>${result.status==='correct'?'✓ Chính xác':result.status==='near'?'△ Gần đúng':'✕ Chưa đúng'}</strong><p>Đáp án: <b>${escapeHtml(result.expected)}</b></p>${!result.correct?studySupportMarkup(card):''}<div class="exercise-actions"><button class="primary-button" id="continueAnswer">Tiếp tục</button>${!result.correct?'<button class="secondary-button" id="acceptMyAnswer">Đáp án của tôi cũng đúng</button>':''}</div>`;
  $$('[data-choice]').forEach(button=>button.disabled=true);$('#answerForm button')?.setAttribute('disabled','');$('#answerInput')?.setAttribute('disabled','');
  let committed=false;
  const commit=async({finalRating,finalStatus,addCorrective=false,acceptedVariant=''})=>{
    if(committed)return;committed=true;$('#continueAnswer').disabled=true;$('#acceptMyAnswer')?.setAttribute('disabled','');
    let current=findCard(card.id)||card;
    const acceptedKind=step.kind||'typing';const acceptedForExercise=Array.isArray(current.acceptedByExercise?.[acceptedKind])?current.acceptedByExercise[acceptedKind]:[];
    if(acceptedVariant&&!acceptedForExercise.includes(acceptedVariant)){
      current=replaceCard({...current,acceptedByExercise:{...(current.acceptedByExercise||{}),[acceptedKind]:[...acceptedForExercise,acceptedVariant]}});
      try{await persistCard(current,'accepted-variant-added');}catch(error){committed=false;$('#continueAnswer').disabled=false;$('#acceptMyAnswer')?.removeAttribute('disabled');showToast(`Chưa lưu được biến thể: ${error.message}`);return;}
    }
    recordResult(finalStatus,{persist:!step.affectsSchedule});const interval=await scheduleCard(current,finalRating,step.affectsSchedule);if(addCorrective)addRetry(step);
    showToast(acceptedVariant?'Đã chấp nhận biến thể và ghi nhận đáp án đúng.':interval?`Ôn tiếp sau ${interval.label}`:'Đã ghi nhận');nextStep();
  };
  $('#continueAnswer').addEventListener('click',()=>void commit({finalRating:rating,finalStatus:result.status,addCorrective:!result.correct}));
  $('#acceptMyAnswer')?.addEventListener('click',()=>{const variant=String(answer||'').trim();if(!variant){showToast('Không có biến thể để lưu.');return;}void commit({finalRating:'good',finalStatus:'correct',acceptedVariant:variant});});
}

function renderProduction(host,card,step){
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">VIẾT CÂU</span><h2>${escapeHtml(step.prompt)}</h2><p class="meaning">${escapeHtml(card.back)}</p><form class="answer-form" id="productionForm"><textarea id="productionInput" rows="4" placeholder="Viết câu của bạn..."></textarea><div class="exercise-actions"><button type="button" class="ai-button" id="evaluateAi">✨ AI góp ý</button><button type="button" class="secondary-button" id="manualGood">Tự đánh giá: dùng được</button><button type="button" class="secondary-button" id="manualAgain">Tôi chưa dùng được</button></div></form><div id="answerFeedback" aria-live="polite"></div></article>`;
  let busy=false;let committed=false;
  const controls=()=>[$('#evaluateAi'),$('#manualGood'),$('#manualAgain'),$('#productionInput')].filter(Boolean);
  const setDisabled=value=>controls().forEach(control=>{control.disabled=value;});
  const commitManual=async(rating,status)=>{
    if(busy||committed)return;
    const sentence=$('#productionInput').value.trim();
    if(rating!=='again'){
      if(!sentence){showToast('Hãy viết một câu trước khi tự đánh giá.');return;}
      const normalized=normalizeText(sentence);const tokens=normalizeText(card.front).split(' ').filter(Boolean);
      if(!tokens.every(token=>normalized.split(' ').includes(token))){showToast('Câu chưa chứa đủ thành phần của từ/cụm mục tiêu.');return;}
      rating='hard';status='correct';
    }
    committed=true;setDisabled(true);
    recordResult(status,{persist:!step.affectsSchedule});
    await scheduleCard(card,rating,step.affectsSchedule,{verification:'self'});
    if(rating==='again')addRetry(step);
    nextStep();
  };
  $('#evaluateAi').addEventListener('click',async()=>{
    if(busy||committed)return;
    const sentence=$('#productionInput').value.trim();if(!sentence){showToast('Hãy viết một câu trước.');return;}
    const button=$('#evaluateAi');busy=true;setDisabled(true);button.textContent='Đang đánh giá...';
    try{
      const data=await callAi('/api/ai/evaluate',{term:card.front,meaning:card.back,sentence,interests:interestsList()});
      if(activeContext().step?.id!==step.id)return;
      const correct=Boolean(data.targetUsedCorrectly)&&data.grammarStatus!=='incorrect';
      const rating=correct?(data.grammarStatus==='minor'?'hard':'good'):'again';
      committed=true;recordResult(correct?'correct':'wrong',{persist:!step.affectsSchedule});
      await scheduleCard(card,rating,step.affectsSchedule,{verification:'ai'});if(!correct)addRetry(step);
      $('#answerFeedback').className='ai-feedback';
      $('#answerFeedback').innerHTML=`<strong>${correct?'✓ Dùng từ phù hợp':'✕ Chưa dùng đúng mục tiêu'}</strong><p>${escapeHtml(data.shortExplanation||'')}</p>${data.correctedSentence?`<p><b>Gợi ý:</b> ${escapeHtml(data.correctedSentence)}</p>`:''}${!correct?studySupportMarkup(card):''}<div class="exercise-actions"><button class="primary-button" id="continueProduction">Tiếp tục</button></div>`;
      $('#continueProduction').addEventListener('click',nextStep);
    }catch(error){showToast(error.message);}
    finally{busy=false;button.textContent='✨ AI góp ý';if(!committed)setDisabled(false);}
  });
  $('#manualGood').addEventListener('click',()=>void commitManual('hard','correct'));
  $('#manualAgain').addEventListener('click',()=>void commitManual('again','wrong'));
}
function renderTransfer(host,card,step){
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">TRANSFER CHECK</span><h2>${escapeHtml(step.prompt)}</h2><p class="meaning">${escapeHtml(card.back)}</p><p class="muted">Không lặp lại câu ví dụ: ${escapeHtml(card.example||'—')}</p><textarea id="transferInput" rows="4" placeholder="Tạo một câu mới..."></textarea><div class="exercise-actions"><button class="ai-button" id="evaluateTransfer">✨ Kiểm tra chuyển giao</button><button class="secondary-button" id="skipTransfer">Để lần sau</button></div><div id="answerFeedback" aria-live="polite"></div></article>`;
  let busy=false;let committed=false;
  const setDisabled=value=>[$('#evaluateTransfer'),$('#skipTransfer'),$('#transferInput')].filter(Boolean).forEach(control=>{control.disabled=value;});
  $('#evaluateTransfer').addEventListener('click',async()=>{
    if(busy||committed)return;
    const sentence=$('#transferInput').value.trim();if(!sentence){showToast('Hãy viết một câu mới trước.');return;}
    busy=true;setDisabled(true);
    try{
      const data=await callAi('/api/ai/evaluate',{term:card.front,meaning:card.back,sentence,interests:interestsList()});
      if(activeContext().step?.id!==step.id)return;
      const sourceTokens=new Set(normalizeText(card.example).split(' ').filter(token=>token.length>2));const sentenceTokens=new Set(normalizeText(sentence).split(' ').filter(token=>token.length>2));const shared=[...sentenceTokens].filter(token=>sourceTokens.has(token)).length;const novelty=shared/Math.max(1,new Set([...sourceTokens,...sentenceTokens]).size)<0.65;const passed=Boolean(data.targetUsedCorrectly)&&data.grammarStatus!=='incorrect'&&normalizeText(sentence)!==normalizeText(card.example)&&novelty;
      committed=true;
      const updated=replaceCard({...card,transferAttempts:Number(card.transferAttempts||0)+1,transferPassedAt:passed?Date.now():0,transferDueAt:passed?0:Date.now()+7*86400000});
      persistOneCardInBackground(updated,'transfer-check');recordResult(passed?'correct':'wrong');
      $('#answerFeedback').className='ai-feedback';
      $('#answerFeedback').innerHTML=`<strong>${passed?'✓ Đã chuyển sang ngữ cảnh mới':'△ Chưa vượt transfer check'}</strong><p>${escapeHtml(data.shortExplanation||'')}</p>${data.correctedSentence?`<p><b>Gợi ý:</b> ${escapeHtml(data.correctedSentence)}</p>`:''}<div class="exercise-actions"><button class="primary-button" id="continueTransfer">Tiếp tục</button></div>`;
      $('#continueTransfer').addEventListener('click',nextStep);
    }catch(error){showToast(error.message);}
    finally{busy=false;if(!committed)setDisabled(false);}
  });
  $('#skipTransfer').addEventListener('click',()=>{
    if(busy||committed)return;
    committed=true;setDisabled(true);
    const updated=replaceCard({...card,transferDueAt:Date.now()+3*86400000});
    persistOneCardInBackground(updated,'transfer-snoozed');recordResult('skipped');nextStep();
  });
}
function shuffled(values,seed=''){return[...values].sort((a,b)=>normalizeText(`${seed}-${a.id||a.text}`).localeCompare(normalizeText(`${seed}-${b.id||b.text}`)));}
function renderMatching(host,step){
  const pairs=step.pairs||[];const left=shuffled(pairs.map(pair=>({id:pair.id,text:pair.front})),'left');const right=shuffled(pairs.map(pair=>({id:pair.id,text:pair.back})),'right').reverse();
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">KHỞI ĐỘNG</span><h2>Nối từ với nghĩa</h2><div class="matching-board"><div class="matching-column">${left.map(item=>`<button class="matching-tile" data-match-side="left" data-pair-id="${escapeHtml(item.id)}">${escapeHtml(item.text)}</button>`).join('')}</div><div class="matching-column">${right.map(item=>`<button class="matching-tile" data-match-side="right" data-pair-id="${escapeHtml(item.id)}">${escapeHtml(item.text)}</button>`).join('')}</div></div><div class="matching-summary"><span id="matchingProgress">0/${pairs.length} cặp</span><span id="matchingAttempts">0 lần thử</span></div><div class="exercise-actions" id="matchingActions"></div></article>`;
  let selectedLeft=null,selectedRight=null,matched=0,attempts=0;
  const select=button=>{if(button.classList.contains('matched'))return;const side=button.dataset.matchSide;$$(`.matching-tile[data-match-side="${side}"]`).forEach(tile=>tile.classList.remove('selected'));button.classList.add('selected');if(side==='left')selectedLeft=button;else selectedRight=button;if(!selectedLeft||!selectedRight)return;attempts+=1;$('#matchingAttempts').textContent=`${attempts} lần thử`;if(selectedLeft.dataset.pairId===selectedRight.dataset.pairId){selectedLeft.classList.add('matched');selectedRight.classList.add('matched');matched+=1;$('#matchingProgress').textContent=`${matched}/${pairs.length} cặp`;selectedLeft=null;selectedRight=null;if(matched===pairs.length){recordResult('correct');$('#matchingActions').innerHTML='<button class="primary-button" id="continueMatching">Tiếp tục</button>';$('#continueMatching').addEventListener('click',nextStep);}}else{selectedLeft.classList.add('wrong');selectedRight.classList.add('wrong');setTimeout(()=>{selectedLeft?.classList.remove('wrong','selected');selectedRight?.classList.remove('wrong','selected');selectedLeft=null;selectedRight=null;},450);}};
  $$('.matching-tile').forEach(button=>button.addEventListener('click',()=>select(button)));
}
function blobToBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
function microphoneDenied(error){return['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name)||/denied|permission|không cho phép/i.test(String(error?.message||''));}
async function recordWithMediaRecorder(){
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw Object.assign(new Error('Trình duyệt chưa hỗ trợ thu âm MediaRecorder.'),{code:'MEDIA_UNSUPPORTED'});
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});const preferred=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported?.(type));let recorder;try{recorder=new MediaRecorder(stream,{...(preferred?{mimeType:preferred}:{}),audioBitsPerSecond:48_000});}catch{recorder=new MediaRecorder(stream,preferred?{mimeType:preferred}:undefined);}
  const chunks=[];recorder.addEventListener('dataavailable',event=>{if(event.data.size)chunks.push(event.data);});const stopped=new Promise((resolve,reject)=>{recorder.addEventListener('stop',async()=>{try{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});for(const track of stream.getTracks())track.stop();if(blob.size>MAX_AUDIO_BYTES)throw new Error('Bản ghi vượt quá 2 MB. Hãy đọc lại đoạn ngắn hơn.');resolve({audioBase64:await blobToBase64(blob),mimeType:blob.type||'audio/webm',audioBytes:blob.size,captureMode:'audio'});}catch(error){reject(error);}});recorder.addEventListener('error',event=>reject(event.error||new Error('Không thể thu âm.')));});
  recorder.start(250);state.activeRecorder={recorder,stream,timer:setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},MAX_RECORDING_MS)};$('#recordPronunciation').classList.add('recording');$('#recordPronunciation').textContent='■';$('#pronunciationStatus').textContent='Đang thu âm… bấm lại để dừng. Tự dừng sau 12 giây.';return stopped;
}
async function recognizeSpeechFallback(){const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)throw new Error('Trình duyệt chưa hỗ trợ thu âm hoặc nhận diện giọng nói.');return new Promise((resolve,reject)=>{const recognition=new Recognition();recognition.lang=state.settings.voice;recognition.interimResults=false;recognition.maxAlternatives=3;recognition.onresult=event=>resolve({transcript:event.results[0][0].transcript,confidence:event.results[0][0].confidence,captureMode:'transcript'});recognition.onerror=event=>reject(new Error(`Nhận diện giọng nói lỗi: ${event.error}`));recognition.onend=()=>{if(state.activeRecorder?.recognition===recognition)state.activeRecorder=null;};recognition.start();state.activeRecorder={recognition,timer:setTimeout(()=>recognition.stop(),MAX_RECORDING_MS)};});}
function microphoneHelp(error){return`<div class="microphone-help"><strong>Không thể dùng microphone</strong><p>${escapeHtml(error.message||'Trình duyệt chưa cấp quyền microphone.')}</p><small>Cho phép microphone rồi thử lại. Bạn vẫn có thể nghe mẫu và tự luyện; hoạt động này không thay đổi FSRS.</small></div>`;}
function renderPronunciation(host,card){
  host.innerHTML=`<article class="exercise-card pronunciation-card"><span class="exercise-type">COACHING PHÁT ÂM</span><h2>${escapeHtml(card.front)}</h2><p class="pronunciation">${escapeHtml(card.pronunciation||'Nghe mẫu rồi đọc lại')}</p><div class="audio-actions centered"><button class="secondary-button" id="pronunciationSample">🔊 Nghe mẫu</button>${state.settings.showSlowAudio?'<button class="secondary-button" id="pronunciationSlowSample">🐢 Nghe chậm</button>':''}</div><button class="record-orb" id="recordPronunciation" aria-label="Bắt đầu thu âm">🎙️</button><p id="pronunciationStatus" class="muted">Nếu trình duyệt thu được audio, bản ghi sẽ được gửi tới Gemini để coaching mức dễ hiểu. Fallback nhận dạng trong trình duyệt không chấm phát âm. Kết quả không thay đổi lịch FSRS.</p><div id="pronunciationResult" aria-live="polite"></div><div class="exercise-actions"><button class="secondary-button" id="skipPronunciation">Tiếp tục không chấm</button></div></article>`;
  $('#pronunciationSample').addEventListener('click',event=>void speak(card,'normal','front',event.currentTarget));
  $('#pronunciationSlowSample')?.addEventListener('click',event=>void speak(card,'slow','front',event.currentTarget));
  let lastCaptured=null;let completed=false;let finalStatus='skipped';
  const analyze=async captured=>{
    const button=$('#recordPronunciation');const skip=$('#skipPronunciation');
    button.disabled=true;skip.disabled=true;
    $('#pronunciationStatus').textContent=captured.captureMode==='transcript'?'Trình duyệt đang so khớp từ nhận dạng…':'AI đang ước tính mức dễ hiểu…';
    try{
      const current=findCard(card.id);if(!current)return;
      if(captured.captureMode==='transcript'){
        const actual=normalizeText(captured.transcript);
        const variants=[card.front,...(card.acceptedBySkill?.listening||[]),...(card.acceptedBySkill?.production||[])].map(normalizeText).filter(Boolean);
        const matched=variants.some(value=>actual===value||` ${actual} `.includes(` ${value} `));
        const updated=replaceCard({...current,pronunciationPractice:{...(current.pronunciationPractice||{}),attempts:Number(current.pronunciationPractice?.attempts||0)+1,lastPracticedAt:Date.now(),lastTranscript:String(captured.transcript||''),lastRecognitionMatched:matched}});
        persistOneCardInBackground(updated,'pronunciation-browser-recognition');finalStatus=matched?'correct':'near';
        $('#pronunciationStatus').textContent='Trình duyệt đã nhận dạng xong; kết quả này chỉ kiểm tra khả năng nhận ra từ, không chấm phát âm.';
        $('#pronunciationResult').innerHTML=`<div class="pronunciation-score"><strong>${matched?'✓':'△'}</strong><div><p><b>${matched?'Nhận dạng đúng từ mục tiêu':'Chưa nhận dạng đúng từ mục tiêu'}</b></p><p>Trình duyệt nghe được: “${escapeHtml(captured.transcript||'—')}”. Hãy nghe mẫu, đọc chậm hơn và thử lại.</p></div></div><div class="exercise-actions"><button class="secondary-button" id="retryRecording">Thu lại</button><button class="primary-button" id="continuePronunciation">Tiếp tục</button></div>`;
      }else{
        const data=await callAi('/api/ai/pronunciation',{term:card.front,ipa:card.pronunciation,accent:state.settings.voice,...captured},{timeoutMs:PRONUNCIATION_TIMEOUT_MS});
        if(activeContext().card?.id!==card.id)return;
        const intelligibility=Math.max(0,Math.min(100,Number(data.intelligibilityScore??data.score??0)));
        const previous=Number(current.pronunciationPractice?.lastScore||0);
        const updated=replaceCard({...current,pronunciationPractice:{...(current.pronunciationPractice||{}),attempts:Number(current.pronunciationPractice?.attempts||0)+1,lastScore:intelligibility,bestScore:Math.max(intelligibility,Number(current.pronunciationPractice?.bestScore||0)),lastPracticedAt:Date.now(),commonIssues:Array.isArray(data.soundIssues)?data.soundIssues.slice(0,5):[],lastFeedback:String(data.feedback||''),confidence:String(data.confidence||'low')}});
        persistOneCardInBackground(updated,'pronunciation-practice');finalStatus=intelligibility>=70?'correct':'near';
        $('#pronunciationStatus').textContent='Đã phân tích xong; đây là ước tính mức dễ hiểu, không phải chứng nhận phát âm.';
        $('#pronunciationResult').innerHTML=`<div class="pronunciation-score"><strong>${intelligibility}</strong><div><p><b>Mức dễ hiểu ước tính</b>${previous?` · thay đổi ${intelligibility-previous>=0?'+':''}${intelligibility-previous}`:''} · độ tin cậy ${escapeHtml(data.confidence||'thấp')}</p><p>${escapeHtml(data.feedback||'')}</p>${Array.isArray(data.soundIssues)&&data.soundIssues.length?`<small>Tập trung: ${escapeHtml(data.soundIssues.slice(0,2).join(', '))}</small>`:''}${data.practiceTip?`<p><b>Cách luyện:</b> ${escapeHtml(data.practiceTip)}</p>`:''}</div></div><div class="exercise-actions"><button class="secondary-button" id="retryRecording">Thu lại</button><button class="primary-button" id="continuePronunciation">Tiếp tục</button></div>`;
      }
      $('#retryRecording').addEventListener('click',()=>{$('#pronunciationResult').replaceChildren();button.disabled=false;skip.disabled=false;button.textContent='🎙️';});
      $('#continuePronunciation').addEventListener('click',()=>{if(completed)return;completed=true;recordResult(finalStatus);nextStep();});
    }catch(error){
      $('#pronunciationStatus').textContent=error.message;
      $('#pronunciationResult').innerHTML=`<div class="microphone-help"><strong>Chưa phân tích được</strong><p>${escapeHtml(error.message)}</p><button class="secondary-button" id="retryPronunciationAi">Thử lại</button></div>`;
      $('#retryPronunciationAi').addEventListener('click',()=>void analyze(lastCaptured));button.disabled=false;skip.disabled=false;
    }
  };
  $('#recordPronunciation').addEventListener('click',async()=>{
    const button=$('#recordPronunciation');const skip=$('#skipPronunciation');
    if(completed)return;
    if(state.activeRecorder?.recorder?.state==='recording'){state.activeRecorder.recorder.stop();return;}
    button.disabled=true;skip.disabled=true;$('#pronunciationStatus').textContent='Đang xin quyền microphone…';$('#pronunciationResult').replaceChildren();
    try{
      let captured;
      try{captured=await recordWithMediaRecorder();}
      catch(error){if(microphoneDenied(error))throw error;if(error.code==='MEDIA_UNSUPPORTED')captured=await recognizeSpeechFallback();else throw error;}
      if(activeContext().card?.id!==card.id)return;
      state.activeRecorder=null;button.classList.remove('recording');button.textContent='🎙️';lastCaptured=captured;await analyze(captured);
    }catch(error){button.disabled=false;skip.disabled=false;button.classList.remove('recording');button.textContent='🎙️';$('#pronunciationStatus').textContent='Bạn có thể cấp quyền rồi thử lại.';$('#pronunciationResult').innerHTML=microphoneHelp(error);}
  });
  $('#skipPronunciation').addEventListener('click',()=>{if(completed)return;completed=true;recordResult('skipped');nextStep();});
}
function renderOutputPractice(host,step){
  host.innerHTML=`<article class="exercise-card"><span class="exercise-type">PHẢN XẠ AI</span><h2>${escapeHtml(step.prompt)}</h2><div class="output-terms">${step.terms.map(term=>`<span title="${escapeHtml(term.back)}">${escapeHtml(term.front)}</span>`).join('')}</div><form class="answer-form" id="outputForm"><textarea id="outputInput" rows="6" placeholder="Viết 2–3 câu có ý nghĩa..."></textarea><div class="exercise-actions"><button class="ai-button" id="evaluateOutput">✨ AI đánh giá từng từ</button><button type="button" class="secondary-button" id="outputSkip">Bỏ qua chấm</button></div></form><div id="answerFeedback" aria-live="polite"></div></article>`;
  let busy=false;let committed=false;
  const setDisabled=value=>[$('#evaluateOutput'),$('#outputSkip'),$('#outputInput')].filter(Boolean).forEach(control=>{control.disabled=value;});
  $('#outputForm').addEventListener('submit',async event=>{
    event.preventDefault();if(busy||committed)return;
    const paragraph=$('#outputInput').value.trim();if(paragraph.split(/\s+/).length<5){showToast('Hãy viết ít nhất một câu hoàn chỉnh.');return;}
    const button=$('#evaluateOutput');busy=true;setDisabled(true);button.textContent='Đang chấm…';
    try{
      const data=await callAi('/api/ai/output-practice',{terms:step.terms,paragraph,interests:interestsList()});
      if(activeContext().step?.id!==step.id)return;
      committed=true;
      const assessments=Array.isArray(data.termAssessments)?data.termAssessments:step.terms.map(term=>({id:term.id,term:term.front,targetUsedCorrectly:(data.usedTerms||[]).some(value=>normalizeText(value)===normalizeText(term.front)),rating:(data.usedTerms||[]).some(value=>normalizeText(value)===normalizeText(term.front))?'good':'again',feedback:''}));
      const{session}=activeContext();const schedulable=step.terms.filter(term=>findCard(term.id));const passed=assessments.filter(item=>item.targetUsedCorrectly).length;
      recordResult(passed===step.terms.length?'correct':'near',{persist:schedulable.length===0,reviewCount:schedulable.length});
      for(const[termIndex,term]of schedulable.entries()){
        const card=findCard(term.id);const assessment=assessments.find(item=>item.id===term.id||normalizeText(item.term)===normalizeText(term.front));
        const rating=['again','hard','good','easy'].includes(assessment?.rating)?assessment.rating:assessment?.targetUsedCorrectly?'good':'again';
        await scheduleSpecificCard(card,rating,{...step,skill:'production',verification:'ai',persistMetrics:termIndex===schedulable.length-1},session);
      }
      $('#answerFeedback').className='ai-feedback';
      $('#answerFeedback').innerHTML=`<strong>${passed}/${step.terms.length} từ được dùng đúng</strong><div class="output-term-assessments">${step.terms.map(term=>{const item=assessments.find(row=>row.id===term.id||normalizeText(row.term)===normalizeText(term.front));return`<p><b>${escapeHtml(term.front)}:</b> ${item?.targetUsedCorrectly?'✓':'✕'} ${escapeHtml(item?.feedback||'')}</p>`;}).join('')}</div><p>${escapeHtml(data.feedback||'')}</p>${data.correctedParagraph?`<p><b>Bản sửa:</b> ${escapeHtml(data.correctedParagraph)}</p>`:''}<div class="exercise-actions"><button class="primary-button" id="continueOutput">Tiếp tục</button></div>`;
      $('#continueOutput').addEventListener('click',nextStep);
    }catch(error){showToast(error.message);}
    finally{busy=false;button.textContent='✨ AI đánh giá từng từ';if(!committed)setDisabled(false);}
  });
  $('#outputSkip').addEventListener('click',()=>{if(busy||committed)return;committed=true;setDisabled(true);recordResult('skipped');nextStep();});
}
async function callAi(path,payload,{timeoutMs=AI_TIMEOUT_MS}={}){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);const key=sessionStorage.getItem(SESSION_KEY)||'';const headers={'content-type':'application/json','x-gemini-model':state.settings.model};if(key)headers['x-gemini-key']=key;try{const response=await fetch(path,{method:'POST',headers,body:JSON.stringify(payload),signal:controller.signal});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`AI lỗi HTTP ${response.status}`);return data;}catch(error){if(error.name==='AbortError')throw new Error(`AI phản hồi quá lâu (${Math.round(timeoutMs/1000)} giây). Nội dung vẫn được giữ để thử lại.`);throw error;}finally{clearTimeout(timer);}}
async function enrichWithAi(){const term=$('#wordInput').value.trim();const meaning=$('#meaningInput').value.trim();if(!term){showToast('Nhập từ hoặc cụm từ trước.');return;}const button=$('#aiEnrichButton');button.disabled=true;button.textContent='Đang bổ sung…';try{const data=await callAi('/api/ai/enrich',{term,meaning,sourceContext:$('#sourceContextInput')?.value.trim()||'',language:'vi',interests:interestsList()});state.pendingAiDraft={type:data.type,accepted:Array.isArray(data.accepted)?data.accepted:[],model:state.settings.model,generatedAt:Date.now(),aiFields:{meaning:{source:'ai',model:state.settings.model,confirmedByUser:true},pronunciation:{source:'ai',model:state.settings.model,confirmedByUser:true},example:{source:'ai',model:state.settings.model,confirmedByUser:true},translation:{source:'ai',model:state.settings.model,confirmedByUser:true},cefr:{source:'ai',model:state.settings.model,confirmedByUser:true}}};if(data.meaning&&!meaning)$('#meaningInput').value=data.meaning;if(data.pronunciation)$('#pronunciationInput').value=data.pronunciation;if(data.example)$('#exampleInput').value=data.example;if(data.translation)$('#translationInput').value=data.translation;if(data.cefr)$('#cefrInput').value=data.cefr;if(data.type&&$('#cardTypeInput'))$('#cardTypeInput').value=data.type;showToast('AI đã điền bản nháp. Hãy kiểm tra trước khi lưu.');}catch(error){showToast(error.message);}finally{button.disabled=false;button.textContent='✨ AI bổ sung';}}
function previewImport(){
  const result=parseImportText($('#importText').value,$('#importDeck').value.trim()||'Imported');const existing=new Map(state.cards.map(card=>[cardIdentityKey(card),card]));const cards=[];const updates=[];let duplicates=0;const strategy=$('#importConflictStrategy')?.value||'skip';
  for(const raw of result.cards){const card=sanitizeCardInput({...raw,provenance:{source:'imported',generatedAt:Date.now(),confirmedByUser:true}});const key=cardIdentityKey(card);const current=existing.get(key);if(current){duplicates+=1;if(strategy==='merge'){updates.push(sanitizeCardInput({...current,example:current.example||card.example,translation:current.translation||card.translation,pronunciation:current.pronunciation||card.pronunciation,accepted:[...new Set([...(current.accepted||[]),...(card.accepted||[])])]}));}continue;}existing.set(key,card);cards.push(card);}
  state.importResult={cards,updates,errors:result.errors,duplicates};$('#importSummary').innerHTML=`<strong>${cards.length} mục mới</strong><br><span>${updates.length} mục sẽ bổ sung dữ liệu · ${duplicates} xung đột · ${result.errors.length} lỗi</span>`;$('#importPreview').innerHTML=`<div class="preview-list">${cards.slice(0,20).map(card=>`<div class="preview-row"><strong>${escapeHtml(card.front)}</strong>${escapeHtml(card.back)} · ${escapeHtml(card.deck)}</div>`).join('')}</div>${result.errors.map(error=>`<p class="preview-error">${escapeHtml(error)}</p>`).join('')}`;$('#confirmImport').disabled=!(cards.length||updates.length);
}
async function confirmImport(){if(!state.importResult)return;const{cards,updates}=state.importResult;if(!cards.length&&!updates.length)return;const persisted=await persistImportBatch({cards,updates},'import-atomic');const merged=new Map(state.cards.map(card=>[card.id,card]));for(const card of persisted)merged.set(card.id,card);state.cards=[...persisted.filter(card=>cards.some(item=>item.id===card.id)),...[...merged.values()].filter(card=>!cards.some(item=>item.id===card.id))];renderAll();showToast(`Đã thêm ${cards.length} và cập nhật ${updates.length} mục trong một giao dịch.`);closeDialog($('#importDialog'));}
function renderDeckList(){const list=$('#deckList');list.innerHTML=decks().map(deck=>`<button data-deck="${escapeHtml(deck)}"><span>📚 ${escapeHtml(deck)}</span><span>${state.cards.filter(card=>card.deck===deck).length} mục ›</span></button>`).join('');$$('[data-deck]').forEach(button=>button.addEventListener('click',()=>{closeDialog($('#deckDialog'));startStudy('deck',{deck:button.dataset.deck},'quick');}));}
function skillName(skill){return({recognition:'Nhận biết',recall:'Tự nhớ',listening:'Nghe',collocation:'Collocation',production:'Sử dụng'})[skill]||skill;}
function detailViewMarkup(card){
  const now=Date.now();const planned=new Set(plannedSkillsForCard(card));const rows=FSRS_SKILLS.map(skill=>{const unlocked=skillIsUnlocked(card,skill);const value=Math.round(cardRetrievability(card,skill,now)*100);const due=getSkillDueAt(card,skill,now);const schedule=card.fsrsBySkill?.[skill];const stateText=!planned.has(skill)?'Không thuộc mục tiêu':!unlocked?'Sẽ mở sau kỹ năng nền':Number(schedule?.reps||0)?`${value}% · ${new Date(due).toLocaleDateString('vi-VN')}`:'Đã mở · cần học';return`<div class="detail-skill-row"><span>${skillName(skill)}${planned.has(skill)?' *':''}</span><progress max="100" value="${Number(schedule?.reps||0)?value:0}"></progress><span>${stateText}</span></div>`;}).join('');
  return`<div class="detail-meta"><span class="deck-pill">${escapeHtml(card.deck)}</span><span class="level-pill">${escapeHtml(card.cefr)}</span><span class="mini-badge">${card.learningGoal==='active'?'Mục tiêu chủ động':'Mục tiêu thụ động'}</span>${card.suspendedAt?'<span class="mini-badge">Đã tạm dừng</span>':''}</div><p class="pronunciation">${escapeHtml(card.pronunciation||'')}</p><div class="detail-example"><p>${escapeHtml(card.example||'Chưa có ví dụ.')}</p><small>${escapeHtml(card.translation||'')}</small></div>${card.sourceContext?`<div class="detail-example"><strong>Ngữ cảnh nguồn</strong><p>${escapeHtml(card.sourceContext)}</p></div>`:''}${card.mnemonic?`<div class="ai-feedback"><strong>✨ Mẹo ghi nhớ</strong><p>${escapeHtml(card.mnemonic)}</p>${card.mnemonicAssociation?`<small>${escapeHtml(card.mnemonicAssociation)}</small>`:''}</div>`:''}<div class="detail-skill-list">${rows}</div>`;
}
function openWordDetail(cardId){const card=findCard(cardId);if(!card)return;state.detailAi=null;$('#wordDetailDialog').dataset.cardId=card.id;$('#detailWord').textContent=card.front;$('#detailMeaning').textContent=card.back;$('#detailContent').innerHTML=detailViewMarkup(card);$('#detailAiResult').className='empty-box';$('#detailAiResult').textContent='Chọn một tác vụ AI. Kết quả chỉ được lưu khi bạn xác nhận.';$('#saveAiResult').disabled=true;$('#editCardFromDetail').textContent='✏️ Sửa thẻ';$('#suspendCardFromDetail').textContent=card.suspendedAt?'▶ Tiếp tục học':'⏸ Tạm dừng';openDialog('#wordDetailDialog');}
function renderCardEdit(card){$('#detailContent').innerHTML=`<form id="editCardForm" class="settings-form"><label>Từ/cụm<input id="editFront" value="${escapeHtml(card.front)}" required /></label><label>Nghĩa<input id="editBack" value="${escapeHtml(card.back)}" required /></label><div class="form-grid"><label>Loại<select id="editType"><option value="word" ${card.type==='word'?'selected':''}>Từ</option><option value="collocation" ${card.type==='collocation'?'selected':''}>Collocation</option></select></label><label>Mục tiêu<select id="editGoal"><option value="passive" ${card.learningGoal!=='active'?'selected':''}>Thụ động</option><option value="active" ${card.learningGoal==='active'?'selected':''}>Chủ động</option></select></label><label>Deck<input id="editDeck" value="${escapeHtml(card.deck)}" /></label><label>CEFR<input id="editCefr" value="${escapeHtml(card.cefr)}" /></label></div><label>IPA<input id="editPronunciation" value="${escapeHtml(card.pronunciation)}" /></label><label>Ví dụ<textarea id="editExample">${escapeHtml(card.example)}</textarea></label><label>Dịch<textarea id="editTranslation">${escapeHtml(card.translation)}</textarea></label><label>Ngữ cảnh nguồn<textarea id="editSourceContext">${escapeHtml(card.sourceContext)}</textarea></label><div class="form-actions"><button class="primary-button">Lưu thay đổi</button><button type="button" class="secondary-button" id="cancelEditCard">Hủy</button></div></form>`;$('#editCardForm').addEventListener('submit',async event=>{event.preventDefault();const updated=sanitizeCardInput({...card,front:$('#editFront').value,back:$('#editBack').value,type:$('#editType').value,learningGoal:$('#editGoal').value,deck:$('#editDeck').value,cefr:$('#editCefr').value,pronunciation:$('#editPronunciation').value,example:$('#editExample').value,translation:$('#editTranslation').value,sourceContext:$('#editSourceContext').value});const duplicate=state.cards.some(item=>item.id!==card.id&&cardIdentityKey(item)===cardIdentityKey(updated));if(duplicate){showToast('Đã có thẻ cùng từ, nghĩa và loại.');return;}replaceCard(updated);await persistCard(updated,'card-edited');renderAll();openWordDetail(updated.id);showToast('Đã lưu thay đổi.');});$('#cancelEditCard').addEventListener('click',()=>openWordDetail(card.id));}
async function generateDetailAi(kind){const card=findCard($('#wordDetailDialog').dataset.cardId);if(!card)return;const button=kind==='mnemonic'?$('#generateMnemonic'):$('#generateContextExample');button.disabled=true;const original=button.textContent;button.textContent='Đang tạo…';try{const path=kind==='mnemonic'?'/api/ai/mnemonic':'/api/ai/context-example';const data=await callAi(path,{term:card.front,meaning:card.back,example:card.example,cefr:card.cefr,interests:interestsList()});state.detailAi={kind,data,model:state.settings.model,generatedAt:Date.now()};if(kind==='mnemonic')$('#detailAiResult').innerHTML=`<div class="mnemonic-result"><strong>✨ ${escapeHtml(data.mnemonic||'')}</strong><p>${escapeHtml(data.association||'')}</p>${data.caution?`<small>Lưu ý: ${escapeHtml(data.caution)}</small>`:''}</div>`;else $('#detailAiResult').innerHTML=`<div class="context-result"><strong>${escapeHtml(data.example||'')}</strong><p>${escapeHtml(data.translation||'')}</p><small>${escapeHtml(data.usageNote||'')}</small></div>`;$('#saveAiResult').disabled=false;}catch(error){showToast(error.message);}finally{button.disabled=false;button.textContent=original;}}
async function saveDetailAi(){const cardId=$('#wordDetailDialog').dataset.cardId;const card=findCard(cardId);if(!card||!state.detailAi)return;const{kind,data,model,generatedAt}=state.detailAi;const aiFields={...(card.aiFields||{})};let updated;if(kind==='mnemonic'){aiFields.mnemonic={model,generatedAt,confirmedByUser:true};updated=sanitizeCardInput({...card,mnemonic:data.mnemonic,mnemonicAssociation:data.association,mnemonicImagePrompt:data.imagePrompt,aiFields});}else{aiFields.example={model,generatedAt,confirmedByUser:true};updated=sanitizeCardInput({...card,example:data.example||card.example,translation:data.translation||card.translation,usageNote:data.usageNote||card.usageNote,contextTopic:data.topic||'',aiFields});}replaceCard(updated);await persistCard(updated,'ai-detail-confirmed');state.detailAi=null;showToast('Đã lưu nội dung AI đã xác nhận.');openWordDetail(cardId);}
function promptDeleteCard(cardId){const card=findCard(cardId);if(!card)return;state.pendingDeleteCardId=cardId;$('#deleteCardTarget').textContent=`“${card.front}” (${card.back})`;openDialog('#confirmDeleteDialog');}
async function executeDeleteCard(){if(!state.pendingDeleteCardId)return;const card=findCard(state.pendingDeleteCardId);if(!card)return;state.lastDeletedCard=structuredClone(card);state.cards=state.cards.filter(item=>item.id!==card.id);await deletePersistedCard(card.id,'card-deleted');state.pendingDeleteCardId=null;closeDialog($('#confirmDeleteDialog'));closeDialog($('#wordDetailDialog'));renderAll();showToast(`Đã xóa “${card.front}”.`,{actionLabel:'Hoàn tác',onAction:()=>void undoDeleteCard(),duration:7000});}
async function undoDeleteCard(){const card=state.lastDeletedCard;if(!card)return;state.cards.unshift(card);await persistCard(card,'card-delete-undone');state.lastDeletedCard=null;renderAll();showToast('Đã khôi phục thẻ.');}
async function toggleSuspendCard(){const card=findCard($('#wordDetailDialog').dataset.cardId);if(!card)return;const updated=replaceCard({...card,suspendedAt:card.suspendedAt?0:Date.now()});await persistCard(updated,'card-suspension-changed');renderAll();openWordDetail(updated.id);showToast(updated.suspendedAt?'Đã tạm dừng thẻ.':'Đã đưa thẻ trở lại lịch học.');}
async function loadSampleDeck(){if(state.cards.some(card=>card.provenance?.source==='sample')){showToast('Bộ mẫu đã có trong thư viện.');return;}const sample=seedCards.map(card=>sanitizeCardInput({...card,id:createId('sample'),deck:'Bộ mẫu Vocab Master',provenance:{source:'sample',createdAt:Date.now()}}));await persistCardsBatch(sample,'sample-deck-added');state.cards=[...sample,...state.cards];renderAll();showToast(`Đã thêm ${sample.length} thẻ mẫu. Bạn có thể xóa bất cứ lúc nào.`);}

async function captureContext(){const text=$('#contextCaptureText')?.value.trim();if(!text){showToast('Hãy dán một đoạn ngữ cảnh.');return;}const button=$('#analyzeContextButton');button.disabled=true;button.textContent='Đang phân tích…';try{const data=await callAi('/api/ai/context-capture',{text,goal:state.settings.learningGoal,interests:interestsList()});const candidates=Array.isArray(data.candidates)?data.candidates:[];$('#contextCaptureResults').innerHTML=candidates.length?candidates.map((item,index)=>`<button class="context-candidate" data-context-index="${index}"><strong>${escapeHtml(item.term)}</strong><span>${escapeHtml(item.meaning)}</span><small>${escapeHtml(item.reason||'')}</small></button>`).join(''):'<p class="muted">Không tìm thấy mục đủ giá trị để học.</p>';$$('[data-context-index]').forEach(candidate=>candidate.addEventListener('click',()=>{const item=candidates[Number(candidate.dataset.contextIndex)];$('#wordInput').value=item.term||'';$('#meaningInput').value=item.meaning||'';$('#exampleInput').value=item.example||'';$('#translationInput').value=item.translation||'';$('#sourceContextInput').value=text;$('#cardTypeInput').value=item.type==='collocation'?'collocation':'word';closeDialog($('#contextCaptureDialog'));setRoute('capture');$('#wordInput').focus();showToast('Đã đưa mục đã chọn vào bản nháp; chưa tự động lưu.');}));}catch(error){showToast(error.message);}finally{button.disabled=false;button.textContent='✨ Phân tích đoạn';}}

function populateSettings(){
  const newLimit=$('#settingNewLimit');if(![...newLimit.options].some(option=>option.value===String(state.settings.newLimit)))newLimit.add(new Option(`${state.settings.newLimit} từ`,String(state.settings.newLimit)));
  if($('#learningGoalInput'))$('#learningGoalInput').value=state.settings.learningGoal||'passive';
  $('#settingMinutes').value=String(state.settings.minutes);$('#settingNewLimit').value=String(state.settings.newLimit);if($('#settingLearningGoal'))$('#settingLearningGoal').value=state.settings.learningGoal||'passive';if($('#settingExamDate'))$('#settingExamDate').value=state.settings.examDate||'';$('#settingVoice').value=state.settings.voice;$('#settingAudioRate').value=state.settings.audioRate||'medium';$('#settingAutoPlayNew').checked=Boolean(state.settings.autoPlayNew);$('#settingPlayExample').checked=Boolean(state.settings.playExampleAfterWord);$('#settingShowSlowAudio').checked=state.settings.showSlowAudio!==false;$('#settingReminder').value=state.settings.reminder;$('#settingInterests').value=state.settings.interests||'';$('#geminiModel').value=state.settings.model;$('#geminiKey').value=sessionStorage.getItem(SESSION_KEY)||'';$('#fsrsRetention').value=String(state.fsrsConfig.requestRetention);$('#fsrsMaximumInterval').value=String(state.fsrsConfig.maximumInterval);audioManager.refreshVoices();renderVoiceOptions();
}
function openSettings(tab='learning'){populateSettings();activateSettingsTab(tab);openDialog('#settingsDialog');}
async function exportData(){try{await downloadBackupFile();showToast('Đã tạo backup đầy đủ gồm thẻ, lịch FSRS và lịch sử ôn.');}catch(error){showToast(error.message);}}
function renderAll(){refreshDeckControls();renderToday();renderLibrary();renderCardCounts();void renderProgress();}

$$('[data-route]').forEach(button=>button.addEventListener('click',()=>setRoute(button.dataset.route)));$$('[data-route-jump]').forEach(button=>button.addEventListener('click',()=>setRoute(button.dataset.routeJump)));window.addEventListener('hashchange',()=>setRoute(location.hash.replace('#','')||'today'));
$('#startToday').addEventListener('click',()=>startStudy('today'));$('#quickReview').addEventListener('click',()=>startStudy('quick'));$('#weakPractice').addEventListener('click',()=>startStudy('weak',{},'quick'));$('#progressPractice').addEventListener('click',()=>startStudy('weak',{},'quick'));$('#todayInsightAction').addEventListener('click',event=>startStudy(event.currentTarget.dataset.mode||'today',{},'quick'));
$('#openMorePractice').addEventListener('click',()=>openDialog('#practiceSheet'));$$('[data-practice]').forEach(button=>button.addEventListener('click',()=>{closeDialog($('#practiceSheet'));startStudy(button.dataset.practice);}));$('#chooseDeckButton').addEventListener('click',()=>{closeDialog($('#practiceSheet'));renderDeckList();openDialog('#deckDialog');});$$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
$('#showImport').addEventListener('click',()=>openDialog('#importDialog'));$('#openImportFromCard')?.addEventListener('click',()=>openDialog('#importDialog'));$('#previewImport').addEventListener('click',previewImport);$('#importConflictStrategy')?.addEventListener('change',previewImport);$('#confirmImport').addEventListener('click',()=>void confirmImport().catch(error=>showToast(error.message)));$('#importFile').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){showToast('File vượt quá giới hạn 5 MB.');return;}$('#importText').value=await file.text();previewImport();});
$('#profileButton').addEventListener('click',()=>openSettings('learning'));$('#topProfileButton').addEventListener('click',()=>openSettings('learning'));$('#notificationButton').addEventListener('click',()=>{openSettings('learning');setTimeout(()=>$('#settingReminder').focus(),100);});
$('#settingsForm').addEventListener('submit',event=>{event.preventDefault();const voice=audioManager.getVoices().find(item=>item.voiceURI===$('#settingVoiceURI').value);state.settings={...state.settings,minutes:Number($('#settingMinutes').value),newLimit:Number($('#settingNewLimit').value),learningGoal:$('#settingLearningGoal')?.value||'passive',examDate:$('#settingExamDate')?.value||'',voice:$('#settingVoice').value,voiceURI:voice?.voiceURI||'',voiceName:voice?.name||'',audioRate:$('#settingAudioRate').value,autoPlayNew:$('#settingAutoPlayNew').checked,playExampleAfterWord:$('#settingPlayExample').checked,showSlowAudio:$('#settingShowSlowAudio').checked,reminder:$('#settingReminder').value,interests:$('#settingInterests').value.trim(),model:$('#geminiModel').value};state.fsrsConfig=validateFsrsConfig({...state.fsrsConfig,requestRetention:Number($('#fsrsRetention').value),maximumInterval:Number($('#fsrsMaximumInterval').value)});saveFsrsConfig(state.fsrsConfig);persistSettingsInBackground();void persistFsrsConfig(state.fsrsConfig).catch(error=>console.warn('[persistence] Không thể lưu FSRS',error));const key=$('#geminiKey').value.trim();if(key)sessionStorage.setItem(SESSION_KEY,key);else sessionStorage.removeItem(SESSION_KEY);globalThis.dispatchEvent(new CustomEvent('vocab:settings-saved'));renderAll();closeDialog($('#settingsDialog'));showToast('Đã lưu cài đặt.');});
globalThis.addEventListener('vocab:notification-setting',event=>{state.settings.notificationEnabled=Boolean(event.detail?.enabled);persistSettingsInBackground();});
$('#settingVoice').addEventListener('change',()=>{$('#settingVoiceURI').dataset.userSelected='false';renderVoiceOptions();});$('#settingVoiceURI').addEventListener('change',event=>{event.currentTarget.dataset.userSelected='true';});$('#testVoiceButton').addEventListener('click',async event=>{const voiceURI=$('#settingVoiceURI').value;const language=$('#settingVoice').value;const defaultRate=$('#settingAudioRate').value;$('#voiceTestStatus').textContent='Đang phát thử…';const result=await playText('Clear pronunciation makes vocabulary easier to remember.',{mode:'normal',button:event.currentTarget,label:'Nghe thử giọng',language,voiceURI,defaultRate});$('#voiceTestStatus').textContent=result?.error?'Không thể phát giọng này.':`Đã phát ở tốc độ ${AUDIO_RATES[defaultRate]??AUDIO_RATES.normal}×.`;});
$('#testAiButton').addEventListener('click',async()=>{const key=$('#geminiKey').value.trim();if(key)sessionStorage.setItem(SESSION_KEY,key);state.settings.model=$('#geminiModel').value;$('#aiTestResult').textContent='Đang kiểm tra…';try{const data=await callAi('/api/ai/test',{ping:'Vocab Master'});$('#aiTestResult').textContent=`Kết nối tốt: ${data.model}`;}catch(error){$('#aiTestResult').textContent=error.message;}});
$('#exportButton').addEventListener('click',()=>void exportData());$('#aiEnrichButton').addEventListener('click',()=>void enrichWithAi());$('#openContextCapture')?.addEventListener('click',()=>openDialog('#contextCaptureDialog'));$('#analyzeContextButton')?.addEventListener('click',()=>void captureContext());
$('#addWordForm').addEventListener('submit',async event=>{event.preventDefault();const card=sanitizeCardInput({front:$('#wordInput').value,back:$('#meaningInput').value,example:$('#exampleInput').value,translation:$('#translationInput').value,pronunciation:$('#pronunciationInput').value,sourceContext:$('#sourceContextInput')?.value||'',deck:$('#deckInput').value,cefr:$('#cefrInput').value,type:$('#cardTypeInput')?.value||state.pendingAiDraft?.type||'word',learningGoal:$('#learningGoalInput')?.value||state.settings.learningGoal,acceptedByExercise:{choice:state.pendingAiDraft?.accepted||[],typing:state.pendingAiDraft?.accepted||[],dictation:state.pendingAiDraft?.accepted||[],'sentence-cloze':state.pendingAiDraft?.accepted||[]},aiFields:state.pendingAiDraft?.aiFields||{},provenance:{source:state.pendingAiDraft?'ai':'manual',model:state.pendingAiDraft?.model||'',generatedAt:state.pendingAiDraft?.generatedAt||0,confirmedByUser:true}});if(!card.front||!card.back){showToast('Từ/cụm và nghĩa là bắt buộc.');return;}if(state.cards.some(item=>cardIdentityKey(item)===cardIdentityKey(card))){showToast('Đã có thẻ cùng từ, nghĩa và loại.');return;}state.cards.unshift(card);await persistCard(card,'card-added');state.pendingAiDraft=null;event.currentTarget.reset();$('#deckInput').value='Cá nhân';if($('#learningGoalInput'))$('#learningGoalInput').value=state.settings.learningGoal;renderAll();globalThis.dispatchEvent(new CustomEvent('vocab:card-added',{detail:{cardId:card.id}}));showToast('Đã thêm vào thư viện.');});
$('#filterButton').addEventListener('click',()=>openDialog('#filterDialog'));$('#applyFilter').addEventListener('click',()=>{state.libraryDeck=$('#libraryDeckFilter').value;closeDialog($('#filterDialog'));renderLibrary();});$('#librarySearch').addEventListener('input',renderLibrary);$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.libraryFilter=button.dataset.filter;$$('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));renderLibrary();}));
$('#detailAudio').addEventListener('click',event=>{const card=findCard($('#wordDetailDialog').dataset.cardId);if(card)void speak(card,'normal','front',event.currentTarget);});$('#detailSlowAudio').addEventListener('click',event=>{const card=findCard($('#wordDetailDialog').dataset.cardId);if(card)void speak(card,'slow','front',event.currentTarget);});$('#detailExampleAudio').addEventListener('click',event=>{const card=findCard($('#wordDetailDialog').dataset.cardId);if(card)void speak(card,'example','example',event.currentTarget);});$('#generateMnemonic').addEventListener('click',()=>void generateDetailAi('mnemonic'));$('#generateContextExample').addEventListener('click',()=>void generateDetailAi('context'));$('#saveAiResult').addEventListener('click',()=>void saveDetailAi());$('#editCardFromDetail')?.addEventListener('click',()=>{const card=findCard($('#wordDetailDialog').dataset.cardId);if(card)renderCardEdit(card);});$('#suspendCardFromDetail')?.addEventListener('click',()=>void toggleSuspendCard());
$('#deleteCardFromDetail').addEventListener('click',()=>promptDeleteCard($('#wordDetailDialog').dataset.cardId));$('#confirmDeleteButton').addEventListener('click',()=>void executeDeleteCard());
$('#closeStudy').addEventListener('click',closeStudy);$('#studyAudio').addEventListener('click',event=>{const{card}=activeContext();if(card)void speak(card,'normal','front',event.currentTarget);});$('#studySlowAudio').addEventListener('click',event=>{const{card}=activeContext();if(card)void speak(card,'slow','front',event.currentTarget);});
document.addEventListener('keydown',event=>{if(!state.session){if(event.key==='Escape')$$('dialog[open]').forEach(dialog=>dialog.close());return;}const tag=document.activeElement?.tagName;if(['INPUT','TEXTAREA'].includes(tag)&&event.key!=='Escape')return;if(event.key==='Escape'){closeStudy();return;}if(event.key.toLowerCase()==='a'){const{card}=activeContext();if(card)void speak(card,event.shiftKey?'slow':'normal','front');}if(event.code==='Space'){const flashcard=$('#flashcard');if(flashcard){event.preventDefault();flashcard.click();}}if(['1','2','3','4'].includes(event.key)&&!$('#ratingPanel')?.hidden){const button=$$('[data-rating]')[Number(event.key)-1];button?.click();}});
$('#studyOverlay').addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusable=$$('#studyOverlay button:not([disabled]), #studyOverlay input:not([disabled]), #studyOverlay textarea:not([disabled]), #studyOverlay [tabindex]:not([tabindex="-1"])').filter(node=>node.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});

globalThis.addEventListener('vocab:external-change',event=>{if(state.session){showToast('Tab khác vừa thay đổi dữ liệu. Hãy kết thúc phiên rồi tải lại để tránh ghi đè.');return;}const next=event.detail?.state;if(next?.cards){state.cards=next.cards.map(card=>sanitizeCardInput(card));state.settings={...state.settings,...(next.settings||{})};state.metrics={...state.metrics,...(next.metrics||{})};state.fsrsConfig=validateFsrsConfig(next.fsrsConfig||state.fsrsConfig);saveFsrsConfig(state.fsrsConfig);renderAll();showToast('Dữ liệu đã được cập nhật từ tab khác.');}});

globalThis.addEventListener('vocab:external-change-error',()=>showToast('Không thể đồng bộ thay đổi từ tab khác. Hãy tải lại trang.'));
globalThis.addEventListener('vocab:write-conflict',event=>{showToast(event.detail?.message||'Dữ liệu đã thay đổi ở tab khác. Ứng dụng sẽ tải lại để tránh ghi đè.');if(state.session)closeStudy();setTimeout(()=>location.reload(),250);});
globalThis.addEventListener('vocab:metrics-reconciled',event=>{state.metrics={...state.metrics,...(event.detail||{})};renderToday();});
resetDailyProgressWhenNeeded();renderAll();populateSettings();setRoute(state.route);
globalThis.VocabMasterApp={startStudy,renderAll,openWordDetail,setRoute,getState:()=>structuredClone({cards:state.cards,settings:state.settings,fsrsConfig:state.fsrsConfig,metrics:state.metrics}),loadSampleDeck};
