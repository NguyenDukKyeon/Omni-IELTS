import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { __testing as persistenceTesting } from '../src/persistence.js';

const source=url=>readFile(new URL(url,import.meta.url),'utf8');

test('metrics normalization is explicit, finite and includes completed reviews',()=>{
  assert.deepEqual(persistenceTesting.normalizeMetrics({dailyDate:'2026-07-28',dailyDone:'4',dailyTarget:'10',studyMinutes:'12',completedReviews:'3'}),{
    dailyDate:'2026-07-28',dailyDone:4,dailyTarget:10,studyMinutes:12,completedReviews:3,activitiesDone:4,independentReviewsDone:3,newSkillsIntroduced:0
  });
  assert.deepEqual(persistenceTesting.normalizeMetrics({dailyDone:-3,dailyTarget:-4,studyMinutes:-8,completedReviews:-1}),{
    dailyDate:'',dailyDone:0,dailyTarget:0,studyMinutes:0,completedReviews:0,activitiesDone:0,independentReviewsDone:0,newSkillsIntroduced:0
  });
});

test('data trust contracts remove hidden reset, hidden seeding and whole-library review writes',async()=>{
  const[persistence,app,main]=await Promise.all([
    source('../src/persistence.js'),source('../src/app.js'),source('../src/main.js')
  ]);
  assert.doesNotMatch(persistence,/applyRequiredLearningReset/);
  assert.doesNotMatch(app,/cards\.length\s*===\s*0[^\n]*seedCards/);
  assert.doesNotMatch(main,/Promise\.race[^\n]*localStorage/);
  assert.match(persistence,/persistReviewResult/);
  assert.match(persistence,/STORE_NAMES\.outbox/);
  assert.match(persistence,/(transaction\.objectStore\(STORE_NAMES\.cards\)|cardStore|const store=transaction\.objectStore\(STORE_NAMES\.cards\))[^;]*[;\s\S]{0,500}\.put/);
  assert.match(persistence,/const granted=Boolean\(result\?\.persisted\)/);
  assert.match(persistence,/existingStamp<incomingStamp/);
  assert.doesNotMatch(persistence,/persistReviewResult[\s\S]{0,1800}replaceCards\(/);
});

test('app uses incremental persistence and assisted corrective semantics',async()=>{
  const app=await source('../src/app.js');
  for(const command of ['persistCard','persistCardsBatch','persistReviewResult'])assert.match(app,new RegExp(command));
  assert.match(app,/assisted:true,affectsSchedule:false/);
  assert.match(app,/Đáp án của tôi cũng đúng/);
  assert.match(app,/acceptedVariant:'?[^']*'?/);
  assert.match(app,/rating==='again'\?'wrong':'correct'/);
});

test('AI server has allowlisted models, structured schemas, validation and per-term output',async()=>{
  const server=await source('../server/server.mjs');
  assert.match(server,/const AI_MODELS=new Set/);
  assert.match(server,/responseJsonSchema/);
  assert.match(server,/validateAiResult/);
  assert.match(server,/termAssessments/);
  assert.match(server,/contextCapture/);
  assert.match(server,/fetchWithRetry/);
  assert.match(server,/aiTelemetry/);
});

test('pronunciation is coaching-only and PWA no longer promises a fake snooze',async()=>{
  const[app,sw,pwa]=await Promise.all([
    source('../src/app.js'),source('../public/sw.js'),source('../src/pwa.js')
  ]);
  assert.match(app,/Coaching mức dễ hiểu; không thay đổi FSRS/);
  assert.match(app,/pronunciationPractice/);
  assert.doesNotMatch(app,/scheduleCard\(card,[^\n]*pronunciation/);
  assert.doesNotMatch(sw,/action:\s*'snooze'/);
  assert.match(sw,/REMINDER_CONFIG|saveReminderConfig/);
  assert.match(pwa,/sendReminderConfigToWorker/);
});

test('accessibility and responsive resilience contracts remain visible',async()=>{
  const[html,css,app]=await Promise.all([
    source('../index.html'),source('../public/experience.css'),source('../src/app.js')
  ]);
  assert.match(html,/id="studyOverlay"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(html,/aria-label="Đóng/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(app,/previousStudyFocus/);
  assert.match(app,/event\.key!==['"]Tab['"]/);
  assert.match(app,/!\$\('#ratingPanel'\)\?\.hidden/);
});
