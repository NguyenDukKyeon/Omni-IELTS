import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveIeltsEvidence } from '../src/ielts-domain.js';
import { evidenceDigest } from '../src/evidence-policy.js';
import { diffSentence } from '../src/sentence-learning-loop.js';
import { assistThoughtGroups,smartSelectSentences } from '../src/coaching-engine-v2.js';
import { validateReadingSemantics,validateParaphraseSemantics,validatePersonalSentenceItem } from '../src/ai-content-factory.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

function evidenceFixture(type='dictation',overrides={}){
  const skill=type==='retell'?'production':type==='shadowing'?'recognition':'listening';
  const activitySpec={id:`activity-${type}`,type,target:{cardId:'card',skill,sourceId:'source-1',sourceRevision:'revision-1'}};
  const attempt={id:`attempt-${type}`,activityId:activitySpec.id,receiptId:`receipt-${type}`,activityType:type,result:'correct',target:{...activitySpec.target},assistance:{id:`trace-${type}`,schemaVersion:1,collector:'v10-sentence-loop',complete:true},learnerOutput:type==='retell'?'A real learner retell':'',...overrides};
  const verification={source:{id:`source-receipt-${type}`,authority:'v10-source-registry',status:'verified',sourceId:'source-1',sourceRevision:'revision-1'},evaluation:{id:`evaluation-receipt-${type}`,authority:'deterministic-rubric',status:'verified',attemptId:attempt.id,activityId:activitySpec.id,cardId:'card',skill,outputDigest:evidenceDigest(attempt.learnerOutput),targetUsed:true}};
  return{attempt,activitySpec,verification};
}

test('shadowing and pronunciation coaching never affect FSRS',()=>{
  const decision=resolveIeltsEvidence(evidenceFixture('shadowing'));
  assert.equal(decision.affectsSchedule,false);
  assert.equal(decision.reason,'activity-is-coaching-only');
});

test('spelling-only and transcript-source errors do not reduce listening FSRS',()=>{
  for(const errorType of ['spelling-only','transcript-source']){
    const decision=resolveIeltsEvidence(evidenceFixture('dictation',{result:'wrong',errorType}));
    assert.equal(decision.affectsSchedule,false,errorType);
  }
});

test('verified independent dictation can create listening evidence',()=>{
  const decision=resolveIeltsEvidence(evidenceFixture('dictation',{result:'near',errorType:'listening'}));
  assert.equal(decision.affectsSchedule,true);
  assert.equal(decision.skill,'listening');
  assert.equal(decision.rating,'hard');
});

test('retell requires a preselected target used correctly',()=>{
  const notUsed=evidenceFixture('retell');notUsed.verification.evaluation={...notUsed.verification.evaluation,targetUsed:false};
  const unverified=evidenceFixture('retell');unverified.verification.evaluation={...unverified.verification.evaluation,authority:'caller-claimed'};
  assert.equal(resolveIeltsEvidence(notUsed).affectsSchedule,false);
  assert.equal(resolveIeltsEvidence(unverified).affectsSchedule,false);
  assert.equal(resolveIeltsEvidence(evidenceFixture('retell')).affectsSchedule,true);
});

test('sentence diff separates missing, replaced and inserted tokens',()=>{
  const result=diffSentence('The course runs for six weeks.','Course run six week');
  assert.ok(result.accuracy<1);
  assert.ok(result.operations.some(row=>row.type!=='equal'));
  assert.equal(diffSentence('The course runs for six weeks.','The course runs for six weeks.').accuracy,1);
});

test('thought groups are deterministic and do not claim pronunciation scoring',()=>{
  const groups=assistThoughtGroups('Although the policy was effective, its long-term impact remains uncertain.');
  assert.ok(groups.length>=2);
  assert.equal(groups.join(' ').includes('Although'),true);
});

test('smart sentence selection prefers verified sentences containing due cards',()=>{
  const now=Date.now();const cards=[{id:'c1',front:'mitigate the effect',back:'giảm tác động',type:'collocation',status:'learning',dueAt:now-1,fsrsBySkill:{listening:{due:now-1,stability:1,difficulty:5,state:2,last_review:now-86400000,scheduled_days:1,elapsed_days:1,reps:1,lapses:0}}}];
  const rows=smartSelectSentences({sentences:[{id:'s1',text:'Trees can mitigate the effect by providing shade.',verified:true},{id:'s2',text:'The weather is pleasant today.',verified:true}],cards,limit:2,now});
  assert.equal(rows[0].id,'s1');
  assert.ok(rows[0].matchedCardIds.includes('c1'));
});

test('AI content validators reject unsupported evidence and ambiguous answers',()=>{
  const reading=validateReadingSemantics({title:'X',passage:'Only this sentence is present.',microSkill:'evidence',status:'draft',questions:[{id:'q',type:'evidence-match',prompt:'?',evidenceText:'Missing evidence',explanation:'x',options:[{id:'a',text:'A',correct:true,rationale:'Reason for A.'},{id:'b',text:'B',correct:true,rationale:'Reason for B.'}]}],provenance:{status:'draft'}});
  assert.equal(reading.valid,false);
  assert.ok(reading.errors.some(error=>error.includes('evidenceText')));
  const paraphrase=validateParaphraseSemantics({prompt:'Source sentence',context:'Context',kind:'paraphrase',status:'draft',options:[{id:'a',text:'Source sentence',correct:true,rationale:'Too close to the source.'},{id:'b',text:'Other',correct:false,rationale:'A valid detailed rationale.'}],provenance:{status:'draft'}});
  assert.equal(paraphrase.valid,false);
  assert.equal(validatePersonalSentenceItem({text:'Too short',targets:[],explanation:''}).valid,false);
});

test('personal prepared content runs during idle time and cannot create FSRS evidence by itself',async()=>{
  const [factory,today]=await Promise.all([readFile(resolve(root,'src/ai-content-factory.js'),'utf8'),readFile(resolve(root,'src/today-planner-v2.js'),'utf8')]);
  assert.match(factory,/prepareAndRunPersonalContent/);
  assert.match(factory,/requestIdleCallback/);
  assert.match(factory,/runPendingAiJobs/);
  assert.match(factory,/ensurePersonalContentManifest/);
  assert.match(factory,/private-user-generated/);
  assert.match(factory,/lessonId:PERSONAL_LESSON_ID/);
  assert.match(today,/lessonId==='personal-next-session'/);
  assert.match(today,/personal-ai-content-is-validated-but-not-source-verified/);
  assert.doesNotMatch(today,/personal-ai-content-is-validated-but-not-source-verified[^\n]*affectsSchedule:true/);
});
