import assert from 'node:assert/strict';
import test from 'node:test';
import * as matching from '../src/objective-matching-response.js';
import * as qar from '../src/question-activity-contracts.js';
import { createSourceRevisionRef } from '../src/source-revision-ref.js';
import { createSourceRevisionRegistry,createTranscriptSourceAdapter } from '../src/source-revision-ref.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { deleteV10Record,getV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { IDBFactory } from 'fake-indexeddb';
globalThis.indexedDB=new IDBFactory();

const source=createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'test-source',authority:'test-source',sourceId:'source:matching',revisionId:'rev-1',integrity:'sha256:matching',locator:{},provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'},tombstone:null,extensions:{},display:null});
const target=Object.freeze({schemaVersion:2,targetType:'ielts-objective-item',targetId:`ielts-objective:${'a'.repeat(64)}`,cardId:null,senseId:null,skill:'reading',sourceId:source.sourceId,sourceRevision:source.revisionId});
const definition=Object.freeze({id:'matching-1',kind:'reading-matching-headings',prompt:'Match the headings.',slots:[{id:'slot-a',label:'Paragraph A',acceptedOptionId:'option-1'},{id:'slot-b',label:'Paragraph B',acceptedOptionId:'option-2'}],options:[{id:'option-1',label:'Climate'},{id:'option-2',label:'History'},{id:'option-3',label:'Technology'}],reusePolicy:'SINGLE_USE',target,sourceRevisionRef:source,createdAt:1,updatedAt:2});
const ownerFor=value=>matching.createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:id=>id===value.id?structuredClone(value):null});

test('Objective Matching Response v1 seals answer bindings and never projects them',()=>{
  const question=matching.createObjectiveMatchingResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});
  assert.equal(question.registryRevision,'qar-objective-matching-response-registry-v1');
  assert.equal(question.normalizer.id,'objective-matching-response-normalizer-v1');
  assert.equal(question.scorer.id,'objective-matching-response-scorer-v1');
  assert.equal(JSON.stringify(question).includes('acceptedOptionId'),false);
  assert.equal('answerBindingDigest' in question,false);
  assert.equal(JSON.stringify(question).includes('option-1'),true);
  for(const invalid of [
    {...definition,options:[{...definition.options[0],label:'Climate'}, {...definition.options[1],label:'Climate'}]},
    {...definition,slots:[definition.slots[0],{...definition.slots[1],acceptedOptionId:'option-1'}]},
    {...definition,slots:[{...definition.slots[0],acceptedOptionId:'unknown'},definition.slots[1]]},
    {...definition,reusePolicy:'single_use'}
  ])assert.throws(()=>matching.createObjectiveMatchingResponseQuestion(invalid,{ownerAdapter:ownerFor(invalid)}),error=>error.code==='QUESTION_ACTIVITY_MATCHING_DEFINITION_INVALID');
  let reads=0;const accessor=structuredClone(definition);Object.defineProperty(accessor,'slots',{enumerable:true,get(){reads+=1;throw new Error('must not read');}});assert.throws(()=>matching.createObjectiveMatchingResponseQuestion(accessor,{ownerAdapter:ownerFor(definition)}),error=>error.code==='QUESTION_ACTIVITY_MATCHING_DEFINITION_INVALID');assert.equal(reads,0);
});

test('scores exact ordered IDs, null, reuse policy and never widens identity equivalence',()=>{
  const question=matching.createObjectiveMatchingResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});
  const correct=matching.scoreObjectiveMatchingResponse(question,{slots:[{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-b',optionId:'option-2'}]});
  assert.deepEqual(correct.slots.map(row=>row.reason),['MATCH','MATCH']);assert.equal(correct.disposition,'correct');assert.equal(correct.numerator,2);
  const partial=matching.scoreObjectiveMatchingResponse(question,{slots:[{slotId:'slot-a',optionId:null},{slotId:'slot-b',optionId:'option-2'}]});assert.deepEqual(partial.slots.map(row=>row.reason),['EMPTY','MATCH']);assert.equal(partial.disposition,'partial');
  for(const response of [
    {slots:[{slotId:'slot-b',optionId:'option-2'},{slotId:'slot-a',optionId:'option-1'}]},
    {slots:[{slotId:'slot-a',optionId:'Option-1'},{slotId:'slot-b',optionId:'option-2'}]},
    {slots:[{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-b',optionId:'option-1'}]},
    {slots:[{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-a',optionId:'option-2'}]}
  ])assert.equal(matching.scoreObjectiveMatchingResponse(question,response).valid,false);
  const reusable={...definition,reusePolicy:'ALLOW_REUSE',slots:[{...definition.slots[0],acceptedOptionId:'option-1'},{...definition.slots[1],acceptedOptionId:'option-1'}]};const reusableQuestion=matching.createObjectiveMatchingResponseQuestion(reusable,{ownerAdapter:ownerFor(reusable)});assert.equal(matching.scoreObjectiveMatchingResponse(reusableQuestion,{slots:[{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-b',optionId:'option-1'}]}).disposition,'correct');
});

test('rejects accessor-backed learner responses without invoking an accessor',()=>{
  const question=matching.createObjectiveMatchingResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});let topReads=0,arrayReads=0,slotReads=0,optionReads=0;const response={};Object.defineProperty(response,'slots',{enumerable:true,get(){topReads+=1;return [{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-b',optionId:'option-2'}];}});assert.equal(matching.scoreObjectiveMatchingResponse(question,response).valid,false);assert.equal(topReads,0);
  const indexed=[];indexed.length=2;Object.defineProperty(indexed,'0',{enumerable:true,get(){arrayReads+=1;return {slotId:'slot-a',optionId:'option-1'};}});indexed[1]={slotId:'slot-b',optionId:'option-2'};assert.equal(matching.scoreObjectiveMatchingResponse(question,{slots:indexed}).valid,false);assert.equal(arrayReads,0);
  const nested={slots:[{optionId:'option-1'},{slotId:'slot-b',optionId:'option-2'}]};Object.defineProperty(nested.slots[0],'slotId',{enumerable:true,get(){slotReads+=1;return 'slot-a';}});assert.equal(matching.scoreObjectiveMatchingResponse(question,nested).valid,false);assert.equal(slotReads,0);
  const option={slots:[{slotId:'slot-a'},{slotId:'slot-b',optionId:'option-2'}]};Object.defineProperty(option.slots[0],'optionId',{enumerable:true,get(){optionReads+=1;return 'option-1';}});assert.equal(matching.scoreObjectiveMatchingResponse(question,option).valid,false);assert.equal(optionReads,0);
});

test('brands owner adapters, detects tamper and exposes the matching kernel through QAR registry',()=>{
  let current=structuredClone(definition);const owner=matching.createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>current}),question=matching.createObjectiveMatchingResponseQuestion(definition,{ownerAdapter:owner});
  assert.throws(()=>matching.createObjectiveMatchingResponseQuestion(definition,{ownerAdapter:{readVerifiedQuestion:()=>definition}}),error=>error.code==='QUESTION_ACTIVITY_OWNER_UNAVAILABLE');
  assert.equal(qar.validateQuestionActivity(question).valid,true);const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);assert.equal(registry.hasExecutor(question),true);
  current={...current,prompt:'changed'};assert.throws(()=>matching.assertObjectiveMatchingResponseOwnerCurrent(question),error=>error.code==='QUESTION_ACTIVITY_OWNER_CHANGED');
});

test('declares all bounded matching families and exact capability sets',()=>{
  assert.deepEqual(matching.OBJECTIVE_MATCHING_RESPONSE_KINDS,['reading-matching-information','reading-matching-headings','reading-matching-features','reading-matching-sentence-endings','listening-matching','listening-plan-map-diagram-labelling']);
  for(const kind of matching.OBJECTIVE_MATCHING_RESPONSE_KINDS){const entry=matching.objectiveMatchingResponseRegistryEntry(kind);assert.deepEqual(entry.capabilities,kind.startsWith('listening-')?['audio-playback','keyboard','focus','screen-reader']:['keyboard','focus','screen-reader']);assert.equal(entry.coverage,'PARTIAL');}
  assert.equal(qar.getQuestionCoverageReport().kinds.filter(row=>matching.OBJECTIVE_MATCHING_RESPONSE_KINDS.includes(row.kind)).length,6);
});

test('spatial matching composes the prompt into public and private bindings',()=>{
  const spatial={schema:'objective-spatial-prompt',version:1,mode:'plan',title:'Plan',description:'A complete controlled plan description.',width:10,height:10,elements:[{id:'edge',kind:'line',x1:0,y1:0,x2:10,y2:10}],anchors:[{slotId:'slot-a',x:1,y:1,label:'A'},{slotId:'slot-b',x:2,y:2,label:'B'}]};
  const spatialTarget={...target,skill:'listening'};const spatialDef={...definition,id:'spatial-matching',kind:'listening-plan-map-diagram-labelling',target:spatialTarget,spatialPrompt:spatial};
  const question=matching.createObjectiveMatchingResponseQuestion(spatialDef,{ownerAdapter:ownerFor(spatialDef)});
  assert.equal(question.registryRevision,'qar-objective-spatial-matching-response-registry-v1');assert.deepEqual(question.item.spatialPrompt,spatial);assert.equal(JSON.stringify(question).includes('acceptedOptionId'),false);
});

test('executes one grouped matching response through Activity Run Attempt Receipt without schedule effects',async()=>{
  const aggregate=createTranscriptAggregate({source:{id:'matching-transcript',status:'verified',complete:true},segments:[{startMs:0,endMs:1000,text:'controlled',status:'verified',aligned:true}],provenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'},createdAt:1}),adapter=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>aggregate}),ref=adapter.createRef(aggregate),listeningTarget={schemaVersion:2,targetType:'ielts-objective-item',targetId:`ielts-objective:${'b'.repeat(64)}`,cardId:null,senseId:null,skill:'listening',sourceId:ref.sourceId,sourceRevision:ref.revisionId},listeningDef={...definition,id:'matching-listening',kind:'listening-matching',target:listeningTarget,sourceRevisionRef:ref};let current=structuredClone(listeningDef);const question=qar.createObjectiveMatchingResponseQuestion(listeningDef,{ownerAdapter:qar.createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>current})}),payload={slots:[{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-b',optionId:null}]},score=qar.scoreQuestionActivity(question,payload),plan=composeTodayPlan({dueReviews:[{id:'matching-exec',type:'listening',target:listeningTarget,executor:'matching',estimatedSeconds:60}],now:500000,minutes:5}),activity={...plan.activities[0],execution:{kind:'matching',status:'ready'},launchBinding:'objective-matching-response',assistanceCollectionMode:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}},registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['audio-playback','keyboard','focus','screen-reader']);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]}),first=await qar.executeQuestionActivity({activity,question,response:payload,sourceRegistry,questionRegistry:registry,now:500001});
  assert.equal(first.run.status,'completed');assert.equal(first.score.disposition,'partial');assert.equal(first.decision.eligible,false);assert.equal(first.score.affectsSchedule,false);const serial=JSON.stringify(first.run);assert.equal(serial.includes('acceptedOptionId'),false);assert.equal(serial.includes('answerBindingDigest'),true);assert.equal(serial.includes('controlled'),false);const backup=await buildCombinedBackup(),backupRow=backup.domains.v10.stores.todayRuns.find(row=>row.id===first.run.id);assert.equal(backupRow.envelope.attempt.metadata.objectiveMatchingResponse.answerBindingDigest,first.score.answerBindingDigest);assert.equal(JSON.stringify(backup).includes('acceptedOptionId'),false);await deleteV10Record(V10_STORES.todayRuns,first.run.id,'matching-r1-backup');await restoreCombinedBackup(backup);await reopenV10Database();const restored=await getV10Record(V10_STORES.todayRuns,first.run.id);assert.equal(restored.envelope.receipt.metadata.objectiveMatchingResponse.answerBindingDigest,first.score.answerBindingDigest);const replay=await qar.executeQuestionActivity({activity,question,response:{slots:[{optionId:'option-1',slotId:'slot-a'},{optionId:null,slotId:'slot-b'}]},sourceRegistry,questionRegistry:registry,now:500002});assert.equal(replay.run.receiptId,first.run.receiptId);await assert.rejects(qar.executeQuestionActivity({activity,question,response:{slots:[{slotId:'slot-a',optionId:'option-1'},{slotId:'slot-b',optionId:'option-2'}]},sourceRegistry,questionRegistry:registry,now:500003}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  current={...current,prompt:'changed'};const other={...activity,id:`${activity.id}:changed`,activitySpec:{...activity.activitySpec,id:`${activity.activitySpec.id}:changed`}};await assert.rejects(qar.executeQuestionActivity({activity:other,question,response:payload,sourceRegistry,questionRegistry:registry,now:500004}),error=>error.code==='QUESTION_ACTIVITY_OWNER_CHANGED');
});
