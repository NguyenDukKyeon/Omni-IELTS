import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { commitCoreEvidence,coreSourceRevision } from '../src/schedule-gateway.js';
import { applyFsrsRating,unlockedSkillsForCard } from '../src/fsrs-scheduler.js';

const card=()=>({id:'card-1',front:'durable',back:'bền',type:'word',learningGoal:'active',status:'learning',createdAt:100,fsrsBySkill:{},qualifiedEvidenceBySkill:{}});
const session={id:'session-1',mode:'today'};
const step=(overrides={})=>({id:'activity-1',kind:'typing',skill:'recall',affectsSchedule:true,...overrides});

test('qualified Core evidence is scheduled once with complete event bindings',async()=>{
  const writes=[];const result=await commitCoreEvidence({card:card(),rating:'good',step:step(),session,now:2000,persist:async value=>{writes.push(value);return{inserted:true,event:value.event};}});
  assert.equal(result.inserted,true);assert.equal(writes.length,1);assert.equal(result.decision.eligible,true);assert.equal(result.decision.successful,true);
  assert.equal(result.card.qualifiedEvidenceBySkill.recall.successes,1);
  assert.equal(result.event.id,`evidence:${result.decision.receiptId}`);assert.equal(result.event.activityId,'activity-1');assert.equal(result.event.target.skill,'recall');
  assert.equal(result.event.metadata.receiptBinding,result.decision.receiptBinding);
  assert.equal(result.event.evidence.attempt.receiptId,result.decision.receiptId);assert.equal(result.event.evidence.verification.source.status,'verified');
  assert.equal(result.event.evidenceType,'independent_review');assert.equal(result.event.metadata.evidenceType,'independent_review');assert.equal(result.event.metadata.predictedRetrievability,0);
});

test('qualified Again persists failure but cannot unlock downstream skills',async()=>{
  let write;const result=await commitCoreEvidence({card:card(),rating:'again',step:step(),session,now:2000,persist:async value=>{write=value;return{inserted:true,event:value.event};}});
  assert.equal(result.inserted,true);assert.equal(result.decision.successful,false);assert.equal(result.event.qualifiedFailure,true);assert.ok(write);
  assert.equal(result.card.qualifiedEvidenceBySkill.recall.failures,1);assert.equal(result.card.qualifiedEvidenceBySkill.recall.successes,0);
  assert.deepEqual(unlockedSkillsForCard(result.card),['recognition','recall']);
});

test('planned Core sense remains bound through decision and persisted review event',async()=>{
  const targetCard={...card(),senseId:'sense-2'};
  const plannedTarget={cardId:targetCard.id,senseId:targetCard.senseId,skill:'recall',sourceId:`core-card:${targetCard.id}`,sourceRevision:coreSourceRevision(targetCard)};
  let write;
  const result=await commitCoreEvidence({
    card:targetCard,rating:'good',step:step({plannedActivityType:'typing',plannedTarget}),session,now:2000,
    persist:async value=>{write=value;return{inserted:true,event:value.event};}
  });
  assert.equal(result.inserted,true);
  assert.equal(result.decision.target.senseId,'sense-2');
  assert.equal(result.event.target.senseId,'sense-2');
  assert.equal(result.event.evidence.activity.target.senseId,'sense-2');
  assert.equal(result.event.evidence.attempt.target.senseId,'sense-2');
  assert.equal(write.event.evidenceDecision.target.senseId,'sense-2');
});

test('planned Core sense mismatch fails closed before persistence',async()=>{
  const targetCard={...card(),senseId:'sense-2'};
  const plannedTarget={cardId:targetCard.id,senseId:'sense-other',skill:'recall',sourceId:`core-card:${targetCard.id}`,sourceRevision:coreSourceRevision(targetCard)};
  let writes=0;
  const result=await commitCoreEvidence({
    card:targetCard,rating:'good',step:step({plannedActivityType:'typing',plannedTarget}),session,now:2000,
    persist:async()=>{writes+=1;return{inserted:true};}
  });
  assert.equal(result.inserted,false);
  assert.equal(result.decision.reason,'planned-target-mismatch');
  assert.equal(writes,0);
});

test('reveal and semantic skill mismatch fail closed before persistence',async()=>{
  let writes=0;const persist=async()=>{writes+=1;return{inserted:true};};
  const revealed=await commitCoreEvidence({card:card(),rating:'good',step:step({kind:'flashcard',skill:'recognition'}),session,exposure:{revealed:true,answerExposed:true},now:2000,persist});
  assert.equal(revealed.decision.reason,'assistance-exposed');assert.equal(revealed.inserted,false);
  const relabeled=await commitCoreEvidence({card:card(),rating:'good',step:step({kind:'typing',skill:'listening'}),session,now:2000,persist});
  assert.equal(relabeled.decision.reason,'planned-skill-mismatch');assert.equal(relabeled.inserted,false);assert.equal(writes,0);
});

test('validated production failure is symmetric while self-assessment is ineligible',async()=>{
  const production=step({kind:'production',skill:'production'});let writes=0;
  const self=await commitCoreEvidence({card:card(),rating:'again',step:production,session,learnerOutput:'I tried durable.',now:2000,persist:async()=>{writes+=1;return{inserted:true};}});
  assert.equal(self.decision.reason,'evaluation-is-not-verified');assert.equal(writes,0);
  const verified=await commitCoreEvidence({card:card(),rating:'again',step:production,session,learnerOutput:'I tried durable.',evaluation:{authority:'validated-provider',status:'verified',targetUsed:false},now:2000,persist:async value=>{writes+=1;return{inserted:true,event:value.event};}});
  assert.equal(verified.inserted,true);assert.equal(verified.decision.successful,false);assert.equal(writes,1);
});

test('invalid ratings cannot silently become Good',async()=>{
  const result=await commitCoreEvidence({card:card(),rating:'mystery',step:step(),session,now:2000,persist:async()=>{throw new Error('must not persist');}});
  assert.equal(result.decision.reason,'result-is-not-qualified');assert.equal(result.inserted,false);
  assert.throws(()=>applyFsrsRating(card(),'mystery',2000),/rating không hợp lệ/);
});

test('Core runtime has one schedule gateway and no raw event append path',async()=>{
  const [app,gateway,persistence]=await Promise.all([
    readFile(new URL('../src/app.js',import.meta.url),'utf8'),readFile(new URL('../src/schedule-gateway.js',import.meta.url),'utf8'),readFile(new URL('../src/persistence.js',import.meta.url),'utf8')
  ]);
  assert.match(app,/commitCoreEvidence/);assert.doesNotMatch(app,/applyFsrsRating|persistReviewResult/);
  assert.match(gateway,/decideEvidence/);assert.match(gateway,/applyFsrsRating/);assert.match(gateway,/persistReviewResult/);
  assert.match(persistence,/appendReviewEvent bị vô hiệu hóa/);assert.match(persistence,/assertEvidenceReviewWrite/);
});
