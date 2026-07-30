import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const persistence=await import('../src/persistence.js');
const ieltsPersistence=await import('../src/ielts-persistence.js');
const v10Persistence=await import('../src/v10-persistence.js');
const { sanitizeCardInput,createSessionSteps }=await import('../src/learning.js');
const { coreSourceRevision,commitCoreEvidence }=await import('../src/schedule-gateway.js');
const { normalizeActivity,V10_STORES }=await import('../src/v10-contracts.js');

await persistence.initializePersistence();
await ieltsPersistence.initializeIeltsPersistence();
await v10Persistence.initializeV10Persistence();

const reviewed=(now)=>({due:now-1,stability:3,difficulty:5,elapsed_days:1,scheduled_days:1,learning_steps:0,reps:1,lapses:0,state:2,last_review:now-86_400_000});
const qualified=(card,...skills)=>({...card,qualifiedEvidenceBySkill:Object.fromEntries(skills.map(skill=>[skill,{attempts:1,successes:1,failures:0}]))});
const makeCard=(id,front,now)=>qualified(sanitizeCardInput({
  id,front,back:`meaning ${front}`,learningGoal:'active',status:'learning',createdAt:now-100_000,
  storageUpdatedAt:100,fsrsBySkill:{recognition:reviewed(now),recall:reviewed(now)}
}),'recognition','recall');

const now=new Date(2026,6,30,10,0,0).getTime();
const cardA=makeCard('card-a','alpha',now);
const cardB=makeCard('card-b','bravo',now);
let appState={cards:[cardA,cardB],settings:{minutes:10,newLimit:0},fsrsConfig:{}};
globalThis.VocabMasterApp={getState:()=>structuredClone(appState)};

const today=await import('../src/today-planner-v2.js');

test('planned-exact queue never substitutes another due card or skill',()=>{
  const target={cardId:cardB.id,senseId:cardB.senseId||null,skill:'recall',sourceId:`core-card:${cardB.id}`,sourceRevision:coreSourceRevision(cardB)};
  const steps=createSessionSteps([cardA,cardB],'planned-exact',1,{
    targetCardId:cardB.id,targetSkill:'recall',activityId:'today-card-b-recall',activityType:'card-review',
    plannedTarget:target,affectsSchedule:true,minutes:1,timeBudgetSeconds:60
  });
  assert.equal(steps.length,1);
  assert.deepEqual({id:steps[0].id,cardId:steps[0].cardId,skill:steps[0].skill},{id:'today-card-b-recall',cardId:'card-b',skill:'recall'});
  assert.deepEqual(steps[0].plannedTarget,target);
  assert.deepEqual(createSessionSteps([cardA,cardB],'planned-exact',1,{targetCardId:'missing',targetSkill:'recall'}),[]);
});

test('planned target remains the authority if the card changes before evidence commit',async()=>{
  const plannedTarget={cardId:cardB.id,skill:'recall',sourceId:`core-card:${cardB.id}`,sourceRevision:coreSourceRevision(cardB)};
  const changed={...cardB,front:'changed after plan',storageUpdatedAt:200};
  let writes=0;
  const result=await commitCoreEvidence({
    card:changed,rating:'good',
    step:{id:'today-card-b-recall',kind:'typing',skill:'recall',affectsSchedule:true,plannedActivityType:'card-review',plannedTarget},
    session:{id:'planned-session',mode:'today-planned'},now:now+100,
    persist:async()=>{writes+=1;return{inserted:true};}
  });
  assert.equal(result.inserted,false);
  assert.equal(result.decision.reason,'source-revision-mismatch');
  assert.equal(writes,0);
});

test('legacy or targetless activity is normalized to a blocked no-schedule record',()=>{
  const legacy=normalizeActivity({id:'legacy-today',type:'card-review',cardIds:['card-b'],evidencePolicy:{affectsSchedule:true,skill:'recall'}});
  assert.equal(legacy.execution.status,'blocked');
  assert.equal(legacy.target,null);
  assert.equal(legacy.evidencePolicy.affectsSchedule,false);
});

test('durable Today plan resumes the same immutable target and force refresh creates a new binding',async()=>{
  const first=await today.buildTodayActivityPlan({force:true,now,minutes:10});
  const recall=first.activities.find(row=>row.target?.cardId==='card-b'&&row.target?.skill==='recall');
  assert.ok(recall);
  assert.equal(recall.execution.kind,'core-card');
  assert.equal(today.activityLaunchBinding(recall),recall.launchBinding);
  const persisted=await v10Persistence.getV10Record(V10_STORES.activities,recall.id);
  assert.equal(persisted.launchBinding,recall.launchBinding);

  appState={...appState,cards:appState.cards.map(card=>card.id==='card-b'?{...card,front:'new revision',storageUpdatedAt:200}:card)};
  const resumed=await today.buildTodayActivityPlan({now:now+1,minutes:10});
  const resumedRecall=resumed.activities.find(row=>row.id===recall.id);
  assert.equal(resumedRecall.planId,recall.planId);
  assert.equal(resumedRecall.target.sourceRevision,recall.target.sourceRevision);

  const refreshed=await today.buildTodayActivityPlan({force:true,now:now+2,minutes:10});
  const refreshedRecall=refreshed.activities.find(row=>row.target?.cardId==='card-b'&&row.target?.skill==='recall');
  assert.notEqual(refreshedRecall.planId,recall.planId);
  assert.notEqual(refreshedRecall.target.sourceRevision,recall.target.sourceRevision);
});
