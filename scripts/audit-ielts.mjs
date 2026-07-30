import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [domain,evidencePolicy,persistence,ui,todayPlanner,ieltsHub,runtimeGuard,content,player,api,server,main,sw,css,packageJson]=await Promise.all([
  readFile(new URL('../src/ielts-domain.js',import.meta.url),'utf8'),
  readFile(new URL('../src/evidence-policy.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-persistence.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-lab.js',import.meta.url),'utf8'),
  readFile(new URL('../src/today-planner-v2.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-hub-v2.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-runtime-guard.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-content.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ielts-media-player.js',import.meta.url),'utf8'),
  readFile(new URL('../server/ielts-api.mjs',import.meta.url),'utf8'),
  readFile(new URL('../server/server.mjs',import.meta.url),'utf8'),
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('../public/sw.js',import.meta.url),'utf8'),
  readFile(new URL('../public/ielts-lab.css',import.meta.url),'utf8'),
  readFile(new URL('../package.json',import.meta.url),'utf8')
]);

const checks=[];
function check(name,fn){fn();checks.push(name);}

check('Phase 0: all durable stores exist',()=>{
  for(const name of ['errorRecords','lexicalSets','lexicalRelations','labItems','readingPassages','readingAttempts','mediaSources','transcriptionJobs','transcriptSegments','mediaAttempts','mediaProgress'])assert.match(domain,new RegExp(`['\"]${name}['\"]`),`Missing ${name}`);
  assert.ok(persistence.includes('buildIeltsBackup')&&persistence.includes('restoreIeltsBackup')&&persistence.includes('validateIeltsBackup'),'IELTS backup lifecycle missing');
  assert.ok(persistence.includes('BroadcastChannel')&&persistence.includes('writeQueue'),'IELTS concurrency protection missing');
});

check('Phase 0: one evidence gateway guards FSRS',()=>{
  assert.ok(domain.includes('resolveIeltsEvidence')&&domain.includes('decideEvidence'),'Evidence gateway missing');
  assert.ok(evidencePolicy.includes('COACHING_ACTIVITIES')&&evidencePolicy.includes("'shadowing'")&&evidencePolicy.includes('activity-is-coaching-only'),'Shadowing guard missing');
  assert.ok(evidencePolicy.includes("attempt.errorType==='spelling-only'")&&evidencePolicy.includes('spelling-is-not-listening-retrieval'),'Spelling/listening distinction missing');
  assert.ok(evidencePolicy.includes('learnerOutput')&&evidencePolicy.includes('targetUsed')&&evidencePolicy.includes('evaluation-is-not-verified'),'Retell target/output/evaluator guard missing');
  assert.ok(evidencePolicy.includes('missing-receipt-id')&&evidencePolicy.includes('planned-target-mismatch')&&evidencePolicy.includes('assistance-exposed'),'Default-deny binding and assistance guards missing');
  assert.ok(evidencePolicy.includes('SOURCE_AUTHORITIES')&&evidencePolicy.includes('EVALUATION_AUTHORITIES')&&evidencePolicy.includes('receiptBinding'),'Authoritative receipt binding missing');
  assert.ok(ui.includes('buildIeltsEvidenceEnvelope'),'UI does not emit canonical evidence envelopes');
  assert.doesNotMatch(ui,/applyFsrsRating|persistReviewResult|commitEvidence/,'IELTS UI contains a direct schedule write path');
  assert.ok(ui.includes('selectedTargetIds.has(row.cardId)'),'Retell evaluator results are not restricted to preselected targets');
  assert.ok(runtimeGuard.includes('skillIsPlanned')&&runtimeGuard.includes("supportsSkill(option.value,'listening')")&&runtimeGuard.includes("supportsSkill(input.value,'production')"),'Card learning-goal guard missing');
  assert.ok(main.includes('mountIeltsRuntimeGuard'),'FSRS runtime guard is not mounted');
});

check('Error Notebook stores full evidence and has one exact Today adapter',()=>{
  for(const field of ['learnerResponse','expectedResponse','correction','sourceRef','linkedCardIds','occurrenceCount','status'])assert.ok(domain.includes(field),`ErrorRecord missing ${field}`);
  assert.ok(persistence.includes("index('normalizedKey').get")&&persistence.includes('mergeErrorRecords'),'Persistent exact dedupe missing');
  assert.ok(ui.includes('installCoreErrorCapture'),'Existing core exercise bridge missing');
  assert.ok(ui.includes('openErrorTarget')&&ui.includes('state.selectedErrorId=id'),'Exact error target adapter missing');
  assert.ok(todayPlanner.includes("execution.kind==='ielts-error'")&&todayPlanner.includes('openErrorTarget'),'Canonical Today does not use the exact error adapter');
  assert.doesNotMatch(ui,/renderTodayErrors|ieltsTodayErrors|data-today-error/,'IELTS Lab still mounts a second Today widget');
  assert.doesNotMatch(ieltsHub,/buildTodayActivityPlan|data-v10-hub-activity|data-v10-ielts-tab="today"/,'IELTS Hub still mounts a second Today planner');
});

check('Phase 2: Lexical Sets contain IELTS usage metadata and production',()=>{
  for(const marker of ['context:','register:','commonMistake:','function:','productionPrompt:'])assert.ok(content.includes(marker),`Curated lexical content missing ${marker}`);
  assert.ok(content.match(/suggestedEntries:/g)?.length>=6,'Fewer than six curated lexical sets');
  assert.ok(ui.includes('setProductionForm')&&ui.includes('/api/ai/output-practice'),'Production task not wired');
  assert.ok(ui.includes('saveCardFromEntry'),'Lexical set to Library flow missing');
});

check('Phase 3: AI paraphrase/distractor stays draft until verified',()=>{
  assert.ok(api.includes('/api/ielts/paraphrase-draft'),'Paraphrase draft route missing');
  assert.ok(domain.includes('Mỗi item MVP phải có đúng một đáp án đúng'),'Single-answer validator missing');
  assert.ok(domain.includes('thiếu giải thích'),'Distractor rationale validator missing');
  assert.ok(ui.includes("status:'draft'")&&ui.includes('verifiedBy'),'Draft/verify workflow missing');
  assert.ok(ui.includes("category:item.kind==='distractor'?'distractor':'paraphrase'"),'Lab errors not routed to Notebook');
});

check('Phase 4: Reading requires passage, attempts, evidence and rationales',()=>{
  assert.ok(domain.includes('ReadingPassage')||domain.includes('sanitizeReadingPassage'),'Reading passage model missing');
  assert.ok(domain.includes('evidenceText')&&domain.includes('thiếu evidence text hợp lệ'),'Evidence validator missing');
  assert.ok(persistence.includes('saveReadingAttempt'),'Reading attempt persistence missing');
  assert.ok(ui.includes('readingPracticeForm')&&ui.includes('evidenceMatch'),'Evidence-based practice missing');
  assert.ok(ui.includes('captureReadingCard'),'Reading to Library flow missing');
});

check('Phase 5: Media URL, auto transcript, player, editor, attempts and progress are real',()=>{
  assert.ok(domain.includes('parseYouTubeUrl'),'YouTube URL parser missing');
  assert.ok(api.includes('fileData')&&api.includes('videoMetadata')&&api.includes('/api/ielts/transcript'),'Direct URL transcript route missing');
  assert.ok(api.includes('startOffset')&&api.includes('endOffset'),'20-minute clip metadata missing');
  assert.ok(player.includes('enablejsapi')&&player.includes('seekTo')&&player.includes('getCurrentTime'),'A–B controllable iframe missing');
  assert.ok(ui.includes('splitTranscriptSegment')&&ui.includes('mergeTranscriptSegments'),'Transcript editor split/merge missing');
  assert.ok(ui.includes('saveMediaAttempt')&&ui.includes('saveMediaProgress'),'Media attempt/progress persistence missing');
  assert.ok(ui.includes('dictationMarkup')&&ui.includes('shadowingMarkup')&&ui.includes('retellMarkup'),'Media learning modes missing');
  assert.ok(domain.includes('IELTS_SESSION_MINUTES')&&domain.includes('[10,20,30]')&&ui.includes('Tạo transcript tối đa 20 phút'),'20-minute product scope missing');
});

check('Media policy: no YouTube download or audio extraction implementation',()=>{
  const mediaCode=`${ui}\n${player}\n${api}`;
  assert.doesNotMatch(mediaCode,/ytdl|youtube-dl|yt-dlp|ffmpeg|downloadVideo|extractAudio|audioOnly|itag\s*[:=]/i,'Forbidden media download/extraction implementation found');
  assert.ok(player.includes('youtube-nocookie.com/embed'),'Privacy-enhanced iframe missing');
  assert.ok(server.includes('frame-src https://www.youtube.com https://www.youtube-nocookie.com'),'CSP YouTube frame allowlist missing');
});

check('Shadowing and Retell safety',()=>{
  assert.ok(ui.includes("mode:'shadowing'")&&ui.includes("reason:'shadowing-is-imitation'"),'Shadowing coaching-only evidence missing');
  assert.doesNotMatch(ui,/mode:'shadowing'[\s\S]{0,300}commitEvidence/,'Shadowing appears to schedule FSRS');
  assert.ok(api.includes('Do not output an IELTS band score'),'Retell prompt band-score prohibition missing');
  assert.ok(domain.includes('Retell feedback không được chứa band score'),'Retell output validator missing');
  assert.ok(ui.includes('Không cung cấp band score'),'Retell user disclaimer missing');
});

check('Reliability: loading, retry, reload and PWA assets',()=>{
  assert.ok(ui.includes('setBusy')&&ui.includes("data-ielts-action=\"retry-render\""),'Loading/retry states missing');
  assert.ok(persistence.includes('transcriptionJobs')&&ui.includes("status:'failed'")&&ui.includes('retryCount'),'Transcription failure state missing');
  assert.ok(main.includes("import('./ielts-lab.js')")&&main.includes('mountIeltsLab'),'IELTS runtime not mounted');
  assert.ok(sw.includes("'/ielts-lab.css'"),'IELTS stylesheet not precached');
  assert.ok(css.includes('@media(max-width:760px)'),'Responsive CSS missing');
  assert.ok(ui.includes('aria-live')&&ui.includes('role="tablist"'),'Accessibility semantics missing');
});

check('Test and audit scripts are registered',()=>{
  assert.ok(packageJson.includes('audit:ielts'),'IELTS audit npm script missing');
  assert.ok(packageJson.includes('test:ielts-browser'),'IELTS browser smoke npm script missing');
});

console.log(`IELTS adversarial roadmap audit passed: ${checks.length}/${checks.length}`);
for(const name of checks)console.log(`✓ ${name}`);
