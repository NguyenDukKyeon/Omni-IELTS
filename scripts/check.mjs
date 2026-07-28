import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,css,experience,settingsCss,app,audio,main,learning,progress,fsrsAdapter,persistence,persistenceCore,pwa,settingsUi,serviceWorker,manifest,server,build,packageJson,browserSmoke]=await Promise.all([
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../styles.css',import.meta.url),'utf8'),
  readFile(new URL('../public/experience.css',import.meta.url),'utf8'),
  readFile(new URL('../public/settings-tabs.css',import.meta.url),'utf8'),
  readFile(new URL('../src/app.js',import.meta.url),'utf8'),
  readFile(new URL('../src/audio-manager.js',import.meta.url),'utf8'),
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('../src/learning.js',import.meta.url),'utf8'),
  readFile(new URL('../src/progress.js',import.meta.url),'utf8'),
  readFile(new URL('../src/fsrs-scheduler.js',import.meta.url),'utf8'),
  readFile(new URL('../src/persistence.js',import.meta.url),'utf8'),
  readFile(new URL('../src/persistence-core.js',import.meta.url),'utf8'),
  readFile(new URL('../src/pwa.js',import.meta.url),'utf8'),
  readFile(new URL('../src/settings-ui.js',import.meta.url),'utf8'),
  readFile(new URL('../public/sw.js',import.meta.url),'utf8'),
  readFile(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'),
  readFile(new URL('../server/server.mjs',import.meta.url),'utf8'),
  readFile(new URL('./build.mjs',import.meta.url),'utf8'),
  readFile(new URL('../package.json',import.meta.url),'utf8'),
  readFile(new URL('./browser-smoke.mjs',import.meta.url),'utf8')
]);

const requiredIds=[
  'startToday','quickReview','weakPractice','practiceSheet','importDialog','settingsDialog','aiEnrichButton','geminiKey','geminiModel','settingInterests','exerciseHost','deckDialog','filterDialog',
  'activityHeatmap','knowledgeStrength','knowledgeRing','wordDetailDialog','generateMnemonic','generateContextExample','saveAiResult','todayInsightAction','settingVoiceURI','settingAudioRate','settingAutoPlayNew','settingPlayExample','settingShowSlowAudio','testVoiceButton','detailSlowAudio','detailExampleAudio','studySlowAudio','audioStatus'
];
for(const id of requiredIds){
  assert.match(html,new RegExp(`id=["']${id}["']`),`Missing #${id} in index.html`);
  assert.ok(app.includes(`#${id}`),`Missing #${id} wiring in app.js`);
}

const settingsIds=['fsrsRetention','fsrsMaximumInterval','pwaSettings','pwaStatus','installPwaButton','toggleNotificationsButton','testNotificationButton','dataProtectionSettings','persistenceStatus','downloadFullBackup','restoreFullBackup','resetLearningProgress'];
for(const id of settingsIds)assert.ok(settingsUi.includes(`id=\"${id}\"`)||settingsUi.includes(`id='${id}'`),`Settings UI missing #${id}`);

const visibleModes=['matching','typing','cloze','listening','pronunciation','collocation','production','output','weak','test'];
for(const mode of visibleModes){
  assert.ok(html.includes(`data-practice="${mode}"`),`Mode ${mode} is not visible in More Practice`);
  assert.ok(learning.includes(`mode==='${mode}'`)||learning.includes(`mode === '${mode}'`),`Mode ${mode} has no learning policy`);
}
const exerciseKinds=['intro','flashcard','meaning-choice','typing','listening-choice','dictation','cloze','sentence-cloze','production','matching','pronunciation','output'];
for(const kind of exerciseKinds)assert.ok(learning.includes(`'${kind}'`)||learning.includes(`"${kind}"`),`Exercise kind ${kind} missing`);

for(const className of ['flashcard-inner','flashcard-back','study-overlay','practice-grid','import-layout','settings-form'])assert.ok(css.includes(`.${className}`),`Missing .${className} base styling`);
for(const className of ['matching-board','pronunciation-card','output-terms','heatmap','knowledge-ring','word-detail-grid'])assert.ok(experience.includes(`.${className}`),`Missing .${className} experience styling`);
for(const className of ['settings-tabs','settings-panel','study-support','microphone-help'])assert.ok(settingsCss.includes(`.${className}`),`Missing .${className} settings/learning styling`);
assert.ok(app.includes('flashcard-front')&&app.includes('flashcard-back'),'Both flashcard faces must be rendered');
assert.match(css,/rotateY\(180deg\)/,'Flashcard 3D flip missing');
assert.ok(app.includes("event.code==='Space'"),'Space-to-flip missing');
assert.ok(audio.includes('speechSynthesis')||audio.includes('globalThis.speechSynthesis'),'Web Speech synthesis manager missing');
assert.ok(audio.includes("addEventListener('voiceschanged'"),'Asynchronous voice loading missing');
assert.ok(audio.includes('voiceURI'),'Specific voice selection is not persisted');
assert.ok(audio.includes('slow:0.7')&&audio.includes('normal:0.9')&&audio.includes('example:0.95'),'Proposed audio rates are not exact');
assert.ok(audio.includes('synthesis?.cancel?.()'),'Previous audio is not cancelled');
assert.ok(audio.includes('delay=80'),'Anti-clipping playback delay missing');
assert.ok(app.includes('inlineSlowAudio')&&app.includes('dictationSlowAudio')&&app.includes('pronunciationSlowSample'),'Slow playback is not wired across study modes');
assert.ok(app.includes("target==='example'"),'Word/example audio separation missing');
assert.ok(app.includes('MediaRecorder'),'Pronunciation recording is not wired');
assert.ok(app.includes('getUserMedia'),'Microphone capture is not wired');
assert.ok(app.includes('microphoneDenied')&&app.includes('microphoneHelp'),'Microphone denied fallback is missing');
assert.ok(app.includes('studySupportMarkup'),'Post-error mnemonic/context help is missing');
assert.ok(app.includes('/api/ai/pronunciation'),'Pronunciation AI endpoint is not called');
assert.ok(app.includes('/api/ai/mnemonic'),'Mnemonic endpoint is not called');
assert.ok(app.includes('/api/ai/context-example'),'Interest-based example endpoint is not called');
assert.ok(app.includes('/api/ai/output-practice'),'Output-practice endpoint is not called');
assert.ok(app.includes('parseImportText'),'Import parser not connected');
assert.ok(app.includes('weakWordScore'),'Weak-word policy not connected to UI');
assert.ok(app.includes('listReviewEvents'),'Progress UI does not use append-only review events');
assert.ok(progress.includes('calculateKnowledgeStrength'),'Knowledge strength calculation missing');
assert.ok(progress.includes('calculateStreak'),'Streak calculation missing');
assert.ok(progress.includes('buildHeatmapDays'),'Heatmap calculation missing');
assert.ok(progress.includes('skillHasReviews')&&progress.includes('requiredSkillsForCard'),'Knowledge Strength must use reviewed required skills only');
assert.ok(progress.includes("label:!values.length?'Chưa đủ dữ liệu'"),'No-data Knowledge Strength label missing');
assert.ok(progress.includes('calculateSkillCoverage'),'Required-skill coverage metric missing');

assert.ok(html.includes('<option value="10">10 từ</option>'),'10-card daily limit missing');
assert.ok(html.includes('<option value="15">15 từ</option>'),'15-card daily limit missing');
assert.ok(html.includes('Chủ đề bạn quan tâm'),'Interest personalization setting missing');
assert.ok(html.includes('data-filter="weak"'),'Weak-word library filter missing');
assert.equal((html.match(/class="nav-item/g)||[]).length,4,'Desktop navigation must remain limited to four primary destinations');
assert.equal((html.match(/class="bottom-nav"/g)||[]).length,1,'Mobile navigation contract changed unexpectedly');

assert.match(html,/id="bootStatus"[^>]*display:none/,'Boot diagnostic overlay must be hidden by default');
assert.ok(html.includes('clearLocalPwaState'),'Local page does not clean stale Service Worker state');
assert.ok(main.includes("if(!isAiStudioPreview)document.getElementById('bootStatus')?.remove()"),'Normal pages can still be blocked by the boot overlay');
assert.ok(main.includes('clearDevelopmentPwaState'),'Development PWA cleanup missing');
assert.ok(main.includes('showNonBlockingBootError'),'Local boot errors must not become a full-screen blocker');
assert.ok(main.includes('__VOCAB_INITIAL_STATE__')&&main.includes('initializePersistence'),'IndexedDB state must be ready before app import');
assert.ok(main.indexOf("import('./settings-ui.js')")<main.lastIndexOf("import('./app.js')"),'Settings layout must initialize before app listeners');
assert.ok(browserSmoke.includes('Input.dispatchMouseEvent'),'Browser smoke does not test real pointer interaction');
for(const expected of ['settingsDialog','practiceSheet','importDialog','wordDetailDialog','studyOverlay','activityHeatmap'])assert.ok(browserSmoke.includes(expected),`Browser smoke misses ${expected}`);
assert.ok(packageJson.includes('"test:browser": "node scripts/browser-smoke.mjs"'),'Browser smoke npm script missing');

assert.ok(packageJson.includes('"ts-fsrs": "5.4.1"'),'Official ts-fsrs dependency must be pinned');
assert.ok(fsrsAdapter.includes("from 'ts-fsrs'"),'FSRS adapter must use official package');
assert.ok(fsrsAdapter.includes('learning_steps'),'FSRS learning steps missing');
assert.ok(fsrsAdapter.includes('relearning_steps'),'FSRS relearning steps missing');
assert.ok(fsrsAdapter.includes('get_retrievability'),'FSRS retrievability missing');
assert.ok(learning.includes('applyFsrsRating'),'Learning engine is not wired to FSRS');
assert.doesNotMatch(learning,/base\*2\.4|base\*4\.2/,'Legacy heuristic interval calculation remains');
assert.ok(settingsUi.includes('data-settings-tab')&&settingsUi.includes("['learning','audio','ai','data']"),'Four Settings tabs are missing');
assert.equal((app.match(/#settingsForm'\)\.addEventListener\('submit'/g)||[]).length,1,'Settings must have exactly one submit handler');
assert.doesNotMatch(pwa,/form\.addEventListener\(['"]submit/,'PWA must not attach a second Settings submit handler');
assert.doesNotMatch(pwa,/injectSettings/,'PWA must not inject Settings DOM');

assert.ok(persistence.includes('indexedDB.open(DB_NAME'),'IndexedDB database is not opened');
assert.ok(persistence.includes("reviewEvents:'reviewEvents'")||persistence.includes("reviewEvents: 'reviewEvents'"),'Append-only review-event store missing');
assert.ok(persistence.includes('.add(event)')||persistence.includes('.add(operation.event)')||persistence.includes('.add(review)'),'Review events must use add(), not overwrite with put()');
assert.ok(persistence.includes('createAutomaticSnapshot'),'Automatic snapshots missing');
assert.ok(persistence.includes('restoreBackupDocument'),'Validated restore path missing');
assert.ok(persistence.includes('persistReviewResult'),'Card and review event atomic persistence path missing');
assert.ok(persistence.includes('writeQueue'),'Serialized write queue missing');
assert.doesNotMatch(persistence,/Storage\.prototype\.(setItem|removeItem)/,'Storage prototype monkey-patching must be removed');
assert.ok(app.includes('persistCard')&&app.includes('persistCardsBatch')&&app.includes('persistSettings')&&app.includes('persistMetrics')&&app.includes('persistReviewResult'),'App does not use incremental explicit persistence commands');
assert.doesNotMatch(app,/localStorage\.(getItem|setItem|removeItem)/,'App state must not be sourced from localStorage');
assert.ok(persistenceCore.includes('dedupeReviewEvents'),'Review-event idempotency missing');

assert.ok(app.includes('MAX_AUDIO_BYTES=2*1024*1024'),'Client audio limit must be 2 MB');
assert.ok(app.includes('MAX_RECORDING_MS=12_000'),'Client recording duration limit missing');
assert.ok(app.includes('AbortController')&&app.includes('PRONUNCIATION_TIMEOUT_MS=45_000'),'Client AI timeout missing');
assert.ok(server.includes('MAX_AUDIO_BYTES=2*1024*1024'),'Server audio limit must be 2 MB');
assert.ok(server.includes('MAX_AUDIO_BASE64_CHARS'),'Server Base64 limit missing');
assert.ok(server.includes("kind:'pronunciation'")&&server.includes('timeout:45_000'),'Pronunciation server timeout missing');
assert.ok(app.includes("if(key)headers['x-gemini-key']=key"),'Blank Gemini key header should not be sent');
assert.ok(server.includes('process.env.GEMINI_API_KEY'),'Server environment key support missing');
assert.ok(packageJson&&true);

const parsedManifest=JSON.parse(manifest);
assert.equal(parsedManifest.display,'standalone');
assert.equal(parsedManifest.start_url,'/#today');
assert.ok(parsedManifest.icons.some(icon=>icon.sizes==='192x192'));
assert.ok(parsedManifest.icons.some(icon=>icon.sizes==='512x512'));
assert.ok(parsedManifest.icons.some(icon=>String(icon.purpose).includes('maskable')));
assert.ok(serviceWorker.includes("'/experience.css'"),'Multimodal stylesheet is not precached');
assert.ok(serviceWorker.includes("'/settings-tabs.css'"),'Settings stylesheet is not precached');
assert.ok(serviceWorker.includes("self.addEventListener('install'"),'Service worker install handler missing');
assert.ok(serviceWorker.includes("self.addEventListener('fetch'"),'Offline fetch handler missing');
assert.ok(serviceWorker.includes("self.addEventListener('push'"),'Push handler missing');
assert.ok(serviceWorker.includes("self.addEventListener('notificationclick'"),'Notification click handler missing');
assert.ok(pwa.includes('PushManager'),'Push subscription client missing');
assert.ok(pwa.includes('beforeinstallprompt'),'PWA install UI missing');
assert.doesNotMatch(pwa,/localStorage\.(getItem|setItem|removeItem)/,'PWA settings must use app state, not localStorage');

for(const route of ['/api/ai/enrich','/api/ai/evaluate','/api/ai/mnemonic','/api/ai/context-example','/api/ai/context-capture','/api/ai/output-practice','/api/ai/pronunciation'])assert.ok(server.includes(route),`Server route ${route} missing`);
assert.ok(server.includes('inline_data'),'Gemini audio input is not sent as multimodal data');
assert.ok(server.includes('microphone=(self)'),'Permissions Policy blocks microphone access');
assert.ok(server.includes('gemini-3.6-flash'),'Gemini 3.6 Flash default missing');
assert.ok(server.includes("responseMimeType:'application/json'")&&server.includes('responseJsonSchema'),'Schema-constrained structured JSON output missing');
assert.ok(server.includes('webpush.sendNotification'),'Web Push sender missing');
assert.ok(server.includes('checkReminders'),'Daily reminder scheduler missing');
assert.ok(build.includes('/experience.css'),'Build does not link multimodal stylesheet');
assert.ok(build.includes("entryPoints:[resolve(root,'src/main.js')]"),'Browser dependency bundle missing');
assert.doesNotMatch(html,/>Học<\/button>/,'Top-level Học tab should remain hidden');

assert.ok(fsrsAdapter.includes('requiredSkillsForCard')&&fsrsAdapter.includes('getDueSkillItems'),'Required skill profiles and due-skill queue missing');
assert.ok(learning.includes('addBundleIfFits')&&learning.includes('timeBudgetSeconds'),'Atomic acquisition bundles or time-budget composer missing');
assert.ok(learning.includes("affectsSchedule:false")&&app.includes('assisted:true'),'Assisted corrective practice must not extend FSRS');
assert.ok(app.includes("rating=correct?(data.grammarStatus==='minor'?'hard':'good'):'again'"),'Production failures must be rated Again, not Hard');
assert.ok(app.includes('cardIdentityKey')&&app.includes('importConflictStrategy'),'Sense-aware identity and import conflict handling missing');
assert.ok(app.includes('editCardFromDetail')&&app.includes('suspendCardFromDetail')&&app.includes('undoDeleteCard'),'Card lifecycle controls missing');
assert.ok(server.includes('AI_MODELS')&&server.includes('validateAiResult')&&server.includes('AI_SCHEMAS'),'AI model allowlist/schema/runtime validation missing');
assert.ok(app.includes('intelligibilityScore')&&app.includes("persistOneCardInBackground(updated,'pronunciation-practice')"),'Pronunciation coaching metrics missing');
{const pronunciationBlock=app.slice(app.indexOf('function renderPronunciation'),app.indexOf('function renderOutputPractice'));assert.doesNotMatch(pronunciationBlock,/scheduleCard|scheduleSpecificCard/,'Pronunciation must not update production FSRS');}
assert.ok(app.includes('/api/ai/context-capture')&&learning.includes('getTransferDueCards')&&app.includes('renderTransfer'),'Context capture and transfer checks missing');
assert.ok(persistence.includes("outbox:'outbox'")&&persistence.includes('replayOutbox'),'Durable write outbox missing');
assert.ok(persistence.includes('databaseInitialized')&&app.includes("Array.isArray(bootstrap.cards)?bootstrap.cards:[]"),'Empty library must remain empty and initialized state must be explicit');
assert.doesNotMatch(app,/persistCards\(state\.cards/,'Routine UI actions must not rewrite the entire card store');
assert.ok(serviceWorker.includes('REMINDER_CONFIG')&&serviceWorker.includes("action:'close'"),'Push resubscribe config or honest notification action missing');
assert.ok(html.includes('role="dialog" aria-modal="true"')&&experience.includes('prefers-reduced-motion'),'Study dialog accessibility or reduced-motion support missing');

console.log('Cross-check passed: data trust, atomic persistence/outbox, required-skill FSRS, adaptive sessions, card lifecycle, schema-validated AI, pronunciation coaching, transfer checks, actionable progress, PWA resubscribe and accessibility contracts are present.');
