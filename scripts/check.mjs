import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,css,experience,settingsCss,app,audio,main,learning,progress,fsrsAdapter,persistence,persistenceCore,pwa,settingsUi,serviceWorker,manifest,server,build,packageJson,browserSmoke,browserSmokeEntry]=await Promise.all([
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
  readFile(new URL('./browser-smoke.mjs',import.meta.url),'utf8'),
  readFile(new URL('./browser-smoke-entry.mjs',import.meta.url),'utf8')
]);
const[restoreCoordinator,storageLock,migrationLedger,captureInbox,unifiedCapture,todayPlanner,ieltsHub,ieltsLab,primaryIa]=await Promise.all([
  readFile(new URL('../src/ielts-backup.js',import.meta.url),'utf8'),
  readFile(new URL('../src/storage-lock.js',import.meta.url),'utf8'),
  readFile(new URL('../src/migration-ledger.js',import.meta.url),'utf8'),
  readFile(new URL('../src/capture-inbox.js',import.meta.url),'utf8'),
  readFile(new URL('../src/unified-capture-v2.js',import.meta.url),'utf8'),
  readFile(new URL('../src/today-planner-v2.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-hub-v2.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-lab.js',import.meta.url),'utf8'),
  readFile(new URL('../src/primary-ia-v10.js',import.meta.url),'utf8')
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
assert.ok(progress.includes('skillHasReviews')&&progress.includes('plannedSkillsForCard'),'Knowledge Strength must use reviewed planned skills only');
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
assert.ok(main.indexOf('recoverInterruptedRestore()')<main.indexOf('persistence.initializePersistence()'),'Restore recovery must finish before Core initialization, migration or outbox replay');
assert.doesNotMatch(main,/withTimeout\(persistence\.initializePersistence/,'Durable initialization must not continue mutating after a non-cancelling boot timeout');
assert.ok(main.includes("shell.inert=true")&&main.includes("error?.code"),'Storage recovery failure must leave the product shell inert');
assert.ok(main.indexOf("import('./settings-ui.js')")<main.lastIndexOf("import('./app.js')"),'Settings layout must initialize before app listeners');
assert.ok(browserSmoke.includes('Input.dispatchMouseEvent'),'Browser smoke does not test real pointer interaction');
for(const expected of ['settingsDialog','practiceSheet','importDialog','wordDetailDialog','studyOverlay','activityHeatmap'])assert.ok(browserSmoke.includes(expected),`Browser smoke misses ${expected}`);
assert.ok(packageJson.includes('"test:browser": "node scripts/browser-smoke-entry.mjs"'),'Browser smoke npm script missing');
assert.ok(browserSmokeEntry.includes("VITE_BROWSER_SMOKE_SEED='1'"),'Browser smoke seed flag missing');
assert.ok(main.includes("isBrowserSmokeSeed=isViteDevelopment&&import.meta.env?.VITE_BROWSER_SMOKE_SEED==='1'"),'E2E seed must be gated to an explicit Vite test flag');

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

assert.ok(persistence.includes('openForwardCompatibleDatabase')&&migrationLedger.includes('indexedDB.open(databaseName,supportedVersion)'),'IndexedDB database is not opened through the forward-compatible migration ledger');
assert.ok(persistence.includes("reviewEvents:'reviewEvents'")||persistence.includes("reviewEvents: 'reviewEvents'"),'Append-only review-event store missing');
assert.ok(persistence.includes('.add(event)')||persistence.includes('.add(operation.event)')||persistence.includes('.add(clone(operation.event))')||persistence.includes('.add(review)'),'Review events must use add(), not overwrite with put()');
assert.ok(persistence.includes('createAutomaticSnapshot'),'Automatic snapshots missing');
assert.ok(persistence.includes('restoreBackupDocument'),'Validated restore path missing');
assert.ok(persistence.includes("restoreCoreBackupSafely}=await import('./ielts-backup.js')"),'Core restore bypasses the cross-database coordinator');
assert.ok(restoreCoordinator.includes('withExclusiveStorageLock')&&restoreCoordinator.includes('reopenAndVerify'),'Restore coordinator must hold an exclusive lock through durable read-back');
assert.ok(storageLock.includes("request(LOCK_NAME,{mode}")&&storageLock.includes("mode:'shared'"),'Durable writes must use the deterministic shared/exclusive storage lock');
assert.ok(captureInbox.includes("panel.dataset.captureEntry='canonical'")&&captureInbox.includes('data-capture-inbox="canonical"'),'Canonical Capture/Inbox entry point is missing');
assert.doesNotMatch(unifiedCapture,/v10CapturePanel|insertAdjacentElement\(['"]afterend/,'Legacy V10 must not mount a second Capture Inbox implementation');
assert.ok(unifiedCapture.includes('configureCaptureInbox')&&unifiedCapture.includes('withExclusiveStorageLock'),'V10 Capture must reuse the canonical Inbox and migrate under the storage lock');
assert.ok(unifiedCapture.indexOf('await reopenV10Database')<unifiedCapture.indexOf('await deleteCaptureDraft'),'Capture migration must reopen the target before deleting the durable source');
assert.ok(todayPlanner.includes("today.dataset.todayEntry='canonical'")&&todayPlanner.includes('today.replaceChildren(section)'),'Canonical Today must replace, not CSS-hide, the legacy implementation');
assert.ok(todayPlanner.includes('activityLaunchBinding')&&todayPlanner.includes('getV10Record(V10_STORES.activities'),'Today launch must re-read and verify the durable plan binding');
assert.ok(todayPlanner.includes("execution.kind==='core-card'")&&app.includes('startPlannedActivity'),'Core Today launch must use the exact planned executor');
assert.ok(app.includes('coreSourceRevision(card)!==target.sourceRevision')&&app.includes('TODAY_TARGET_STALE'),'Core Today must fail closed for stale/missing targets');
assert.doesNotMatch(ieltsHub,/buildTodayActivityPlan|data-v10-hub-activity|Học hôm nay/,'IELTS Hub must not mount a second Today planner');
assert.doesNotMatch(ieltsLab,/ieltsTodayErrors|data-today-error|renderTodayErrors/,'IELTS Lab must not mount a second Today widget');
assert.ok(ieltsLab.includes('openErrorTarget')&&ieltsLab.includes('state.selectedErrorId=id'),'Error repair must open the exact planned error ID');
assert.ok(primaryIa.includes("embedHub(tab='discover')")&&!primaryIa.includes("embedHub(tab='today')"),'IELTS primary route must not default to a second Today surface');
assert.equal((html.match(/data-today-entry=/g)||[]).length,0,'Canonical Today marker must be owned by the runtime replacement');
assert.equal((html.match(/data-today-nav="canonical"/g)||[]).length,2,'Desktop/mobile responsive Today controls must share one canonical route marker');
assert.doesNotMatch(html,/class="brand"[^>]*href="#today"/,'Brand must not be an additional Today launcher');
assert.ok(persistence.includes('persistReviewResult'),'Card and review event atomic persistence path missing');
assert.ok(persistence.includes('writeQueue'),'Serialized write queue missing');
assert.doesNotMatch(persistence,/Storage\.prototype\.(setItem|removeItem)/,'Storage prototype monkey-patching must be removed');
assert.ok(app.includes('persistCard')&&app.includes('persistCardsBatch')&&app.includes('persistSettings')&&app.includes('persistMetrics')&&app.includes('commitCoreEvidence'),'App does not use incremental explicit persistence commands through the evidence gateway');
assert.doesNotMatch(app,/applyFsrsRating|persistReviewResult/,'Core app bypasses the evidence schedule gateway');
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

assert.ok(app.includes('const form=event.currentTarget;')&&!app.includes('event.currentTarget.reset();'),'Async form handler must keep a stable form reference');
