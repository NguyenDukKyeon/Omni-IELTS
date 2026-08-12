import assert from 'node:assert/strict';
import test from 'node:test';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=indexedDB;
globalThis.IDBKeyRange=IDBKeyRange;

import { createIeltsReadingSourceRevision,IELTS_READING_MATCHING_KINDS,IELTS_STORE_NAMES } from '../src/ielts-domain.js';
import { createIeltsObjectiveInventoryItem,deriveIeltsObjectiveInventoryId } from '../src/ielts-profile-inventory.js';
import { learningContractDigest } from '../src/learning-contracts.js';
import { createSourceRevisionRegistry } from '../src/source-revision-ref.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { createQuestionRegistry,executeQuestionActivity,getQuestionCoverageReport } from '../src/question-activity-contracts.js';
import {
  createIeltsReadingMatchingOwnerAdapter,
  adaptIeltsReadingMatchingItem,
  createIeltsReadingSourceAdapter,
  createDurableIeltsReadingMatchingOwnerAdapter
} from '../src/ielts-reading-question-activity.js';
import { saveIeltsReadingSourceRevision,saveIeltsObjectiveInventoryItem,getIeltsReadingSourceRevision,getIeltsObjectiveInventoryItem,buildIeltsBackup,reopenIeltsDatabase,__testing as ieltsTesting } from '../src/ielts-persistence.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { getV10Record,deleteV10Record,reopenV10Database,listV10Records } from '../src/v10-persistence.js';
import { listReviewEvents } from '../src/persistence.js';
import { listErrorCandidates } from '../src/error-candidate.js';

const approval=(kind,digest)=>kind==='rights'?{schemaVersion:2,id:'matching-rights',status:'approved',licenseId:'controlled-local',rightsHolder:'project',basis:'project-created',assertedAt:'2026-08-11T00:00:00.000Z',expiresAt:null,aiAsserted:false}:kind==='provenance'?{schemaVersion:2,id:'matching-provenance',sourceType:'original-human-authored',sourceDescription:'CONTROLLED_LOCAL_TEST_ONLY fixture',authorOrOrigin:'project',createdAt:'2026-08-11T00:00:00.000Z',aiDraft:false}:{schemaVersion:2,id:'matching-review',status:'approved',reviewerType:'human',reviewerId:'controlled-reviewer',reviewedAt:'2026-08-11T00:01:00.000Z',scopeDigest:digest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false};

function fixture(kind='reading-matching-information',profile='academic',reusePolicy='SINGLE_USE'){
  const base={skill:'reading',profiles:[profile],form:{id:'matching-form',revision:1},section:{id:`matching-${profile}`,revision:1,number:1},order:1,itemId:`matching-${kind}-${profile}`,itemRevision:1};
  const id=deriveIeltsObjectiveInventoryId(base);
  const sourceFields={id:`matching-${kind}-${profile}`,revision:1,profile,title:'Controlled matching passage',passage:'CONTROLLED_LOCAL_TEST_ONLY source passage.',status:'verified',createdAt:1,updatedAt:1};
  const source=createIeltsReadingSourceRevision({...sourceFields,objectiveItems:[{inventoryId:id,kind,schemaVersion:1}]});
  const payload={id,kind,prompt:'Match each controlled statement.',slots:[{id:'one',label:'First statement',acceptedOptionId:'a'},{id:'two',label:'Second statement',acceptedOptionId:reusePolicy==='ALLOW_REUSE'?'a':'b'}],options:[{id:'a',label:'Option A'},{id:'b',label:'Option B'}],reusePolicy,target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:id,cardId:null,senseId:null,skill:'reading',sourceId:source.sourceRevisionRef.sourceId,sourceRevision:source.sourceRevisionRef.revisionId},sourceRevisionRef:source.sourceRevisionRef,createdAt:1,updatedAt:1};
  const { createObjectiveMatchingResponseOwnerAdapter,createObjectiveMatchingResponseQuestion }=awaitableMatching();
  const question=createObjectiveMatchingResponseQuestion(payload,{ownerAdapter:createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>payload})});
  const binding={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};
  const draft=createIeltsObjectiveInventoryItem({...base,kind:'ielts-objective-inventory-item',schemaVersion:1,sourceRevisionRef:source.sourceRevisionRef,questionBinding:binding,questionPayload:payload,status:'draft',createdAt:'2026-08-11T00:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,rights:null,provenance:null,humanReview:null,extensions:{fixture:'CONTROLLED_LOCAL_TEST_ONLY'}});
  const verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)});
  return {source,payload,verified};
}

// This indirection keeps the test's RED an authentic missing Reading seam,
// rather than a missing test harness import.
function awaitableMatching(){ return globalThis.__wave4MatchingKernel; }

function matchingActivity(question,activityId,now=1_000){
  const target=question.item.target,plan=composeTodayPlan({content:[{id:activityId,type:'reading',target,executor:'qar-objective-matching-response',estimatedSeconds:60}],now,minutes:5});
  return {...plan.activities[0],execution:{kind:'qar-objective-matching-response',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'matching-r3',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
}
function matchingExecutionContext(question,source){const registry=createQuestionRegistry();registry.registerExecutor(question.kind,question.version,question.requiredCapabilities);return{questionRegistry:registry,sourceRegistry:createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>source})]})};}
async function matchingMutationSnapshot(){return{today:(await listV10Records(V10_STORES.todayRuns,{sortBy:null})).map(row=>learningContractDigest(row)).sort(),reviews:(await listReviewEvents()).map(row=>learningContractDigest(row)).sort(),candidates:(await listErrorCandidates()).map(row=>learningContractDigest(row)).sort()};}

test('Reading matching seals, adapts and scores every Reading family without key projection',async()=>{
  const matching=await import('../src/objective-matching-response.js');
  globalThis.__wave4MatchingKernel=matching;
  assert.deepEqual(IELTS_READING_MATCHING_KINDS,[
    'reading-matching-information','reading-matching-headings','reading-matching-features','reading-matching-sentence-endings'
  ]);
  for(const kind of IELTS_READING_MATCHING_KINDS){
    const {source,payload,verified}=fixture(kind,kind.endsWith('features')?'general-training':'academic');
    const owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async id=>id===verified.id?verified:null,readVerifiedSource:async ref=>ref.revisionId===source.sourceRevisionRef.revisionId?source:null});
    const question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner});
    assert.equal(question.kind,kind);
    assert.equal(JSON.stringify(question).includes('acceptedOptionId'),false);
    const correct=await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'b'}]});
    assert.deepEqual([correct.disposition,correct.numerator,correct.denominator],['correct',2,2]);
    assert.equal((await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:'b'},{slotId:'two',optionId:'a'}]})).disposition,'wrong');
    assert.equal((await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'a'}]})).valid,false);
    assert.equal((await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:null},{slotId:'two',optionId:'b'}]})).disposition,'partial');
    assert.equal(learningContractDigest(question.item.target),learningContractDigest(payload.target));
  }
});

test('Reading matching reaches canonical Run/Attempt/Receipt and is terminal-idempotent',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const {source,verified}=fixture('reading-matching-headings','academic');
  const owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>source});
  const question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner});
  const target=question.item.target,activityId=`matching:${verified.id}`,plan=composeTodayPlan({content:[{id:activityId,type:'reading',target,executor:'qar-objective-matching-response',estimatedSeconds:60}],now:1_000,minutes:5}),activity={...plan.activities[0],execution:{kind:'qar-objective-matching-response',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'matching-r1',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>source})]});
  const response={slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'b'}]};
  const first=await executeQuestionActivity({activity,question,response,sourceRegistry,questionRegistry:registry,now:1_001});
  const replay=await executeQuestionActivity({activity,question,response,sourceRegistry,questionRegistry:registry,now:1_002});
  assert.equal(first.run.status,'completed');assert.equal(first.decision.eligible,false);assert.equal(replay.run.receiptId,first.run.receiptId);
  await assert.rejects(executeQuestionActivity({activity,question,response:{slots:[{slotId:'one',optionId:'b'},{slotId:'two',optionId:'a'}]},sourceRegistry,questionRegistry:registry,now:1_003}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
});

test('Reading matching source seal is marker-only, owner drift fails closed, and coverage remains honest',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const {source,verified}=fixture('reading-matching-sentence-endings','general-training','ALLOW_REUSE');
  assert.throws(()=>createIeltsReadingSourceRevision({...source,objectiveItems:[{inventoryId:verified.id,kind:'reading-matching-sentence-endings',schemaVersion:1,options:[]}]}),error=>error.code==='IELTS_READING_SOURCE_INVALID');
  let currentSource=source;const owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>currentSource});
  const question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner});
  currentSource=null;
  const score=await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'a'}]});
  assert.deepEqual(score.errors,['QUESTION_ACTIVITY_OWNER_UNAVAILABLE']);
  const rows=getQuestionCoverageReport().kinds;for(const kind of IELTS_READING_MATCHING_KINDS)assert.equal(rows.find(row=>row.kind===kind)?.coverage,'PARTIAL');
  const listening=rows.find(row=>row.kind==='listening-matching');assert.equal(listening?.coverage,'PARTIAL');assert.deepEqual(listening?.dimensions,{schema:'PARTIAL',adapterExecutor:'PARTIAL',scoringReview:'PARTIAL',canonicalAttemptStorage:'PARTIAL',testsEvidence:'PARTIAL',uiInventory:'PARTIAL',inventory:'PARTIAL',profile:'PARTIAL',durability:'PARTIAL',media:'PARTIAL',section:'GAP',readiness:'GAP'});
});

test('Reading matching executes the authentic Reading kind/profile/reuse matrix through canonical grouped receipts',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  for(const [index,kind] of IELTS_READING_MATCHING_KINDS.entries())for(const [profile,reusePolicy] of [['academic','SINGLE_USE'],['general-training','ALLOW_REUSE']]){
    const {source,verified}=fixture(kind,profile,reusePolicy);
    const owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>source});
    const question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner});
    const expectedSecond=reusePolicy==='ALLOW_REUSE'?'a':'b';
    for(const [name,response,disposition] of [['correct',{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:expectedSecond}]},'correct'],['partial',{slots:[{slotId:'one',optionId:null},{slotId:'two',optionId:expectedSecond}]},'partial'],['wrong',{slots:[{slotId:'one',optionId:'b'},{slotId:'two',optionId:'a'}]},reusePolicy==='ALLOW_REUSE'?'partial':'wrong'],['null',{slots:[{slotId:'one',optionId:null},{slotId:'two',optionId:null}]},'wrong']]){
      const score=await matching.scoreObjectiveMatchingResponseAsync(question,response);assert.equal(score.valid,true,`${kind}/${profile}/${name}`);assert.equal(score.disposition,disposition,`${kind}/${profile}/${name}`);
    }
    if(reusePolicy==='SINGLE_USE')assert.equal((await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'a'}]})).valid,false);
    else assert.equal((await matching.scoreObjectiveMatchingResponseAsync(question,{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'a'}]})).disposition,'correct');
    const terminalName=['correct','partial','wrong','null'][index%4],terminalResponse={correct:{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:expectedSecond}]},partial:{slots:[{slotId:'one',optionId:null},{slotId:'two',optionId:expectedSecond}]},wrong:{slots:[{slotId:'one',optionId:'b'},{slotId:'two',optionId:reusePolicy==='ALLOW_REUSE'?'b':'a'}]},null:{slots:[{slotId:'one',optionId:null},{slotId:'two',optionId:null}]}}[terminalName],activity=matchingActivity(question,`matching-r3:${kind}:${profile}`,10_000+index),context=matchingExecutionContext(question,source),result=await executeQuestionActivity({activity,question,response:terminalResponse,...context,now:10_001+index});
    assert.equal(result.run.status,'completed');assert.equal(result.score.disposition,terminalName==='null'?'wrong':terminalName);assert.equal(result.decision.eligible,false);assert.equal(result.decision.affectsSchedule,false);assert.deepEqual(result.run.activitySpec.target,question.item.target);
    const replay=await executeQuestionActivity({activity,question,response:terminalResponse,...context,now:10_002+index});assert.equal(replay.run.receiptId,result.run.receiptId);
    if(index===0)await assert.rejects(executeQuestionActivity({activity,question,response:{slots:[{slotId:'one',optionId:'b'},{slotId:'two',optionId:'a'}]},...context,now:10_003}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
    assert.equal(question.item.target.skill,'reading');assert.equal(question.kind,kind);assert.equal(index>=0,true);
  }
});

test('Reading matching durable owner backup restores a terminal grouped receipt after deletion and reopens both databases',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const {source,verified}=fixture('reading-matching-features','general-training','ALLOW_REUSE');
  const draft={...verified,status:'draft',verifiedAt:null,rights:null,provenance:null,humanReview:null};
  const localOwner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async id=>id===verified.id?verified:null,readVerifiedSource:async()=>source});
  const question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:localOwner});
  await saveIeltsReadingSourceRevision(source);await saveIeltsObjectiveInventoryItem(draft,{at:Date.parse(draft.createdAt)});await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});
  const response={slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'a'}]},activityId=`matching-r3-durable:${verified.id}`,activity=matchingActivity(question,activityId,20_000),context=matchingExecutionContext(question,source),terminal=await executeQuestionActivity({activity,question,response,...context,now:20_001});assert.equal(terminal.run.status,'completed');assert.equal(terminal.decision.eligible,false);assert.equal(terminal.decision.affectsSchedule,false);const terminalDigest=learningContractDigest(terminal.run),terminalMetadata=terminal.run.envelope.attempt.metadata.objectiveMatchingResponse;
  const before=await buildCombinedBackup();const inventory=before.domains.ielts.stores.objectiveInventory.find(row=>row.id===verified.id),sourceRow=before.domains.ielts.stores.readingPassages.find(row=>row.id===source.id),backupRun=before.domains.v10.stores.todayRuns.find(row=>row.id===terminal.run.id);
  assert.ok(inventory);assert.ok(sourceRow);assert.equal(JSON.stringify(sourceRow).includes('acceptedOptionId'),false);assert.equal(JSON.stringify(before.domains.v10).includes('acceptedOptionId'),false);assert.ok(inventory.questionPayload.slots.every(slot=>typeof slot.acceptedOptionId==='string'));
  assert.ok(backupRun);assert.deepEqual(backupRun.envelope.attempt.metadata.objectiveMatchingResponse,terminalMetadata);const originalScore=await matching.scoreObjectiveMatchingResponseAsync(question,response);assert.equal(originalScore.disposition,'correct');
  const ieltsBackup=await buildIeltsBackup();assert.deepEqual(ieltsBackup.stores.objectiveInventory.find(row=>row.id===verified.id),inventory);
  await ieltsTesting.deleteOne(IELTS_STORE_NAMES.readingPassages,source.id);await ieltsTesting.deleteOne(IELTS_STORE_NAMES.objectiveInventory,verified.id);await deleteV10Record(V10_STORES.todayRuns,terminal.run.id,'matching-r3-test-delete');assert.equal(await getIeltsReadingSourceRevision(source.id)==null,true);assert.equal(await getIeltsObjectiveInventoryItem(verified.id)==null,true);assert.equal(await getV10Record(V10_STORES.todayRuns,terminal.run.id)==null,true);
  await restoreCombinedBackup(before);await reopenIeltsDatabase();await reopenV10Database();
  const restoredSource=await getIeltsReadingSourceRevision(source.id),restoredInventory=await getIeltsObjectiveInventoryItem(verified.id),restoredRun=await getV10Record(V10_STORES.todayRuns,terminal.run.id);assert.deepEqual(restoredSource,source);assert.deepEqual(restoredInventory,verified);assert.equal(learningContractDigest(restoredRun),terminalDigest);assert.deepEqual(restoredRun.envelope.attempt.metadata.objectiveMatchingResponse,terminalMetadata);
  const durableQuestion=await adaptIeltsReadingMatchingItem(restoredInventory,restoredSource.sourceRevisionRef,{ownerAdapter:createDurableIeltsReadingMatchingOwnerAdapter()}),durableActivity=matchingActivity(durableQuestion,activityId,20_000),durableContext=matchingExecutionContext(durableQuestion,restoredSource),replayTerminal=await executeQuestionActivity({activity:durableActivity,question:durableQuestion,response,...durableContext,now:20_002});assert.equal(replayTerminal.run.receiptId,terminal.run.receiptId);assert.equal(learningContractDigest(replayTerminal.run),terminalDigest);await assert.rejects(executeQuestionActivity({activity:durableActivity,question:durableQuestion,response:{slots:[{slotId:'one',optionId:'b'},{slotId:'two',optionId:'a'}]},...durableContext,now:20_003}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  const replay=await matching.scoreObjectiveMatchingResponseAsync(durableQuestion,response);assert.equal(replay.disposition,'correct');assert.equal(replay.answerBindingDigest,originalScore.answerBindingDigest);assert.equal(replay.optionPoolDigest,originalScore.optionPoolDigest);
});

test('Reading matching invalid pre-run owners, seals, and responses create zero canonical runs',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const {source,verified}=fixture('reading-matching-sentence-endings','academic','SINGLE_USE'),owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>source}),question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner}),before=(await listV10Records(V10_STORES.todayRuns,{sortBy:null})).length;
  const invalid=[{}, {slots:[{slotId:'one',optionId:'a'}]}, {slots:[{slotId:'two',optionId:'b'},{slotId:'one',optionId:'a'}]}, {slots:[{slotId:'one',optionId:'missing'},{slotId:'two',optionId:'b'}]}, {slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'a'}]}];
  for(const [index,response] of invalid.entries()){const activity=matchingActivity(question,`matching-r3-invalid:${index}`,30_000+index),context=matchingExecutionContext(question,source);await assert.rejects(executeQuestionActivity({activity,question,response,...context,now:30_001+index}),error=>error.code==='QUESTION_ACTIVITY_RESPONSE_INVALID');assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).length,before);}
  let current=source;const driftOwner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>current}),driftQuestion=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:driftOwner});current=null;const driftActivity=matchingActivity(driftQuestion,'matching-r3-owner-unavailable',31_000),driftContext=matchingExecutionContext(driftQuestion,source);await assert.rejects(executeQuestionActivity({activity:driftActivity,question:driftQuestion,response:{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'b'}]},...driftContext,now:31_001}),error=>error.code==='QUESTION_ACTIVITY_OWNER_UNAVAILABLE');assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).length,before);
  const validNull=await executeQuestionActivity({activity:matchingActivity(question,'matching-r3-null-valid',32_000),question,response:{slots:[{slotId:'one',optionId:null},{slotId:'two',optionId:null}]},...matchingExecutionContext(question,source),now:32_001});assert.equal(validNull.score.disposition,'wrong');assert.equal(validNull.decision.eligible,false);
});

test('Reading matching promotion rejects unbranded or mismatched public questions before verified durable mutation',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const {source,verified}=fixture('reading-matching-information','general-training','ALLOW_REUSE'),draft={...verified,status:'draft',verifiedAt:null,rights:null,provenance:null,humanReview:null},owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>source}),question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner});
  await saveIeltsReadingSourceRevision(source);await saveIeltsObjectiveInventoryItem(draft,{at:Date.parse(draft.createdAt)});
  for(const forged of [structuredClone(question),{...question,item:{...question.item}},{...question,kind:'listening-matching'},{...question,sourceRevisionRef:{...question.sourceRevisionRef,revisionId:'forged'}}])await assert.rejects(saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:forged}),error=>error.code==='IELTS_INVENTORY_INVALID');
  assert.equal((await getIeltsObjectiveInventoryItem(verified.id)).status,'draft');await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});assert.equal((await getIeltsObjectiveInventoryItem(verified.id)).status,'verified');await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});
});

test('Reading matching public option boundaries reject accessors without invoking them',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  let inventoryGets=0,sourceGets=0;assert.throws(()=>createIeltsReadingMatchingOwnerAdapter({get readVerifiedInventory(){inventoryGets++;return async()=>null;},get readVerifiedSource(){sourceGets++;return async()=>null;}}),error=>error.code==='QUESTION_ACTIVITY_OWNER_UNAVAILABLE');assert.equal(inventoryGets,0);assert.equal(sourceGets,0);
  const {source,verified}=fixture('reading-matching-information','academic'),owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>source});let ownerGets=0;await assert.rejects(adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{get ownerAdapter(){ownerGets++;return owner;}}),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');assert.equal(ownerGets,0);
});

test('Reading matching owner/source lifecycle matrix fails before every canonical mutation',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const cases=[
    ['inventory-null',state=>{state.inventory=null;}],['inventory-throw',state=>{state.throwInventory=true;}],['inventory-accessor',state=>{const row={...state.verified};Object.defineProperty(row,'questionPayload',{get(){state.inventoryGets++;return state.verified.questionPayload;}});state.inventory=row;}],['inventory-retired',state=>{state.inventory={...state.verified,status:'retired',retiredAt:'2026-08-11T00:02:00.000Z',retirementReason:'controlled'};}],['inventory-payload-mutated',state=>{state.inventory={...state.verified,questionPayload:{...state.verified.questionPayload,prompt:'changed'}};}],['inventory-binding-mutated',state=>{state.inventory={...state.verified,questionBinding:{...state.verified.questionBinding,promptDigest:'changed'}};}],
    ['source-null',state=>{state.source=null;}],['source-throw',state=>{state.throwSource=true;}],['source-accessor',state=>{const row={...state.originalSource};Object.defineProperty(row,'passage',{get(){state.sourceGets++;return state.originalSource.passage;}});state.source=row;}],['source-body',state=>{state.source={...state.originalSource,passage:'changed'};}],['source-title',state=>{state.source={...state.originalSource,title:'changed'};}],['source-profile',state=>{state.source={...state.originalSource,profile:'general-training'};}],['source-revision',state=>{state.source={...state.originalSource,revision:2};}],['source-ref',state=>{state.source={...state.originalSource,sourceRevisionRef:{...state.originalSource.sourceRevisionRef,revisionId:'changed'}};}],['source-seal-extra',state=>{state.source={...state.originalSource,objectiveItems:[...state.originalSource.objectiveItems,{inventoryId:'extra',kind:'reading-matching-headings',schemaVersion:1}]};}],['source-seal-rebound',state=>{state.source={...state.originalSource,objectiveItems:[{inventoryId:'other',kind:'reading-matching-information',schemaVersion:1}]};}]
  ];
  for(const [index,[name,mutate]] of cases.entries()){
    const {source,verified}=fixture('reading-matching-information','academic','SINGLE_USE');let state={verified,inventory:verified,source,originalSource:source,throwInventory:false,throwSource:false,inventoryGets:0,sourceGets:0};const owner=createIeltsReadingMatchingOwnerAdapter({readVerifiedInventory:async()=>{if(state.throwInventory)throw new Error('offline');return state.inventory;},readVerifiedSource:async()=>{if(state.throwSource)throw new Error('offline');return state.source;}}),question=await adaptIeltsReadingMatchingItem(verified,source.sourceRevisionRef,{ownerAdapter:owner});mutate(state);const before=await matchingMutationSnapshot(),activity=matchingActivity(question,`matching-r5-owner:${index}`,50_000+index),context=matchingExecutionContext(question,source);await assert.rejects(executeQuestionActivity({activity,question,response:{slots:[{slotId:'one',optionId:'a'},{slotId:'two',optionId:'b'}]},...context,now:50_001+index}),error=>['QUESTION_ACTIVITY_OWNER_UNAVAILABLE','QUESTION_ACTIVITY_OWNER_CHANGED'].includes(error.code),name);assert.deepEqual(await matchingMutationSnapshot(),before,name);if(name==='inventory-accessor')assert.equal(state.inventoryGets,0);if(name==='source-accessor')assert.equal(state.sourceGets,0);
  }
});

test('Reading-owned sources cannot construct a Listening matching inventory candidate',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;
  const {source}=fixture('reading-matching-information','academic','SINGLE_USE'),base={skill:'listening',profiles:['academic','general-training'],form:{id:'matching-listening-form',revision:1},section:{id:'matching-listening-section',revision:1,number:1},order:1,itemId:'matching-listening-candidate',itemRevision:1},id=deriveIeltsObjectiveInventoryId(base),payload={id,kind:'listening-matching',prompt:'Controlled Listening matching.',slots:[{id:'one',label:'One',acceptedOptionId:'a'}],options:[{id:'a',label:'A'}],reusePolicy:'SINGLE_USE',target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:id,cardId:null,senseId:null,skill:'listening',sourceId:source.sourceRevisionRef.sourceId,sourceRevision:source.sourceRevisionRef.revisionId},sourceRevisionRef:source.sourceRevisionRef,createdAt:1,updatedAt:1},question=matching.createObjectiveMatchingResponseQuestion(payload,{ownerAdapter:matching.createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>payload})}),binding={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities},candidate={...base,kind:'ielts-objective-inventory-item',schemaVersion:1,sourceRevisionRef:source.sourceRevisionRef,questionBinding:binding,questionPayload:payload,status:'draft',createdAt:'2026-08-11T00:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,rights:null,provenance:null,humanReview:null,extensions:{fixture:'CONTROLLED_LOCAL_TEST_ONLY'}};
  assert.throws(()=>createIeltsObjectiveInventoryItem(candidate),error=>error.code==='IELTS_INVENTORY_INVALID');
});

test('Reading matching source seals reject malformed, mixed, extra, mismatched, and accessor markers before persistence',async()=>{
  const matching=await import('../src/objective-matching-response.js');globalThis.__wave4MatchingKernel=matching;const {source,verified}=fixture('reading-matching-headings','academic'),before=await matchingMutationSnapshot(),bad=[
    [{inventoryId:verified.id,kind:'reading-matching-headings'}],
    [{inventoryId:verified.id,kind:'reading-matching-headings',schemaVersion:1,options:[]}],
    [{inventoryId:verified.id,kind:'reading-matching-headings',schemaVersion:1,extra:true}],
    [{inventoryId:verified.id,kind:'reading-matching-information',schemaVersion:1}]
  ];for(const objectiveItems of bad)assert.throws(()=>createIeltsReadingSourceRevision({...source,objectiveItems}),error=>error.code==='IELTS_READING_SOURCE_INVALID');let gets=0;const marker={inventoryId:verified.id,kind:'reading-matching-headings',schemaVersion:1};Object.defineProperty(marker,'kind',{get(){gets++;return 'reading-matching-headings';}});assert.throws(()=>createIeltsReadingSourceRevision({...source,objectiveItems:[marker]}),error=>error.code==='IELTS_READING_SOURCE_INVALID');assert.equal(gets,0);assert.deepEqual(await matchingMutationSnapshot(),before);
});
