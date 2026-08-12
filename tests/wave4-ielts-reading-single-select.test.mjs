import assert from 'node:assert/strict';
import test from 'node:test';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=indexedDB;
globalThis.IDBKeyRange=IDBKeyRange;

import * as qar from '../src/question-activity-contracts.js';
import { learningContractDigest } from '../src/learning-contracts.js';
import { createSourceRevisionRef } from '../src/source-revision-ref.js';
import { createSourceRevisionRegistry } from '../src/source-revision-ref.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { createIeltsReadingSourceRevision } from '../src/ielts-domain.js';
import { createIeltsObjectiveInventoryItem } from '../src/ielts-profile-inventory.js';
import { initializeIeltsPersistence,saveIeltsReadingSourceRevision,getIeltsReadingSourceRevision,reopenIeltsDatabase,saveIeltsObjectiveInventoryItem,getIeltsObjectiveInventoryItem } from '../src/ielts-persistence.js';
import {
  READING_MULTIPLE_CHOICE_SINGLE_KIND,
  READING_TRUE_FALSE_NOT_GIVEN_KIND,
  READING_YES_NO_NOT_GIVEN_KIND,
  createIeltsReadingQuestionOwnerAdapter,
  adaptIeltsReadingObjectiveItem
} from '../src/ielts-reading-question-activity.js';
import { createIeltsReadingSourceAdapter } from '../src/ielts-reading-question-activity.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { getV10Record,reopenV10Database } from '../src/v10-persistence.js';

const sourceRevisionRef=createSourceRevisionRef({
  schema:'SourceRevisionRef',version:1,kind:'ielts-reading-passage',authority:'ielts-reading-owner',
  sourceId:'reading-source:academic-library',revisionId:'reading-source:academic-library:1',integrity:'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  locator:{passageId:'academic-library',revision:1},provenance:{origin:'ielts-reading-owner',verification:'verified',rights:'allowed',privacy:'private'}
});

const academicSource=Object.freeze({
  id:'academic-library',revision:1,profile:'academic',status:'verified',
  passage:'A six-week city-library trial moved a quiet study room from the ground floor to the second floor. Visitors rose from 120 to 150 each day. The report did not measure whether the move caused the rise.',
  sourceRevisionRef
});

function inventory(kind=READING_MULTIPLE_CHOICE_SINGLE_KIND){
  const options=kind===READING_TRUE_FALSE_NOT_GIVEN_KIND?
    [{id:'true',text:'True',correct:false,rationale:'The report did not measure causation.'},{id:'false',text:'False',correct:false,rationale:'The report did not measure causation.'},{id:'not-given',text:'Not Given',correct:true,rationale:'No causation measurement is reported.'}]:
    kind===READING_YES_NO_NOT_GIVEN_KIND?
    [{id:'yes',text:'Yes',correct:true,rationale:'The notice states the start time.'},{id:'no',text:'No',correct:false,rationale:'The notice states the start time.'},{id:'not-given',text:'Not Given',correct:false,rationale:'The notice states the start time.'}]:
    [{id:'measured',text:'Whether the move caused the rise',correct:true,rationale:'The report did not measure causation.'},{id:'counted',text:'Daily visitor numbers',correct:false,rationale:'Visitor numbers were counted.'}];
  const questionPayload={id:`question-${kind}`,kind,prompt:'What did the report not measure?',options:options.map(({id,text})=>({id,text})),target:{skill:'reading',profile:'academic',sourceId:sourceRevisionRef.sourceId,sourceRevision:sourceRevisionRef.revisionId},createdAt:1,updatedAt:1};
  return {id:`ielts-objective:${'a'.repeat(64)}`,itemId:`item-${kind}`,itemRevision:1,skill:'reading',profiles:['academic'],status:'verified',sourceRevisionRef,questionBinding:{kind,schemaVersion:1,registryRevision:'qar-reading-single-select-registry-v1',questionId:`question-${kind}`,promptRevision:'prompt-r1',promptDigest:learningContractDigest({item:questionPayload,sourceRevisionRef}),keyRevision:'key-r1',keyDigest:learningContractDigest(options.map(option=>({id:option.id,correct:option.correct}))),rubricRevision:'rubric-r1',rubricDigest:learningContractDigest({rationales:options.map(option=>({id:option.id,rationale:option.rationale})),reviewPolicy:'objective-reading-review-v1'}),scorer:{id:'reading-single-select-v1',version:1},reviewPolicyRevision:'objective-reading-review-v1',requiredCapabilities:['keyboard','focus','screen-reader']},questionPayload,sealedQuestion:{options}};
}

function owner(item){
  return createIeltsReadingQuestionOwnerAdapter({
    readVerifiedInventory:async id=>id===item.id?item:null,
    readVerifiedSource:async ref=>ref.revisionId===sourceRevisionRef.revisionId?{...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]}:null
  });
}

function readingOwnerSource(item){
  return {...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]};
}

function readingExecution(item,question,source,id,now){
  const score=qar.scoreQuestionActivity(question,{optionId:'measured'});
  const target={schemaVersion:2,targetType:'ielts-objective-item',targetId:item.id,cardId:null,senseId:null,skill:'reading',sourceId:sourceRevisionRef.sourceId,sourceRevision:sourceRevisionRef.revisionId};
  const plan=composeTodayPlan({content:[{id,type:'reading',target,executor:'qar-reading-single-select',estimatedSeconds:60}],now,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-reading-single-select',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:`${id}-r1`,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const questionRegistry=qar.createQuestionRegistry();questionRegistry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async sourceId=>sourceId===source.id?source:null})]});
  return{activity,questionRegistry,sourceRegistry};
}

async function mutableReadingOwnerHarness(id,now){
  const item=inventory(),source=readingOwnerSource(item);
  let inventoryReader=async()=>item,sourceReader=async()=>source;
  const ownerAdapter=createIeltsReadingQuestionOwnerAdapter({readVerifiedInventory:(...args)=>inventoryReader(...args),readVerifiedSource:(...args)=>sourceReader(...args)});
  const question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter});
  return{item,source,question,ownerAdapter,...readingExecution(item,question,source,id,now),setInventoryReader:value=>{inventoryReader=value;},setSourceReader:value=>{sourceReader=value;}};
}

async function assertOwnerReadbackRejects(harness,expectedCode,now){
  const runId=`today-run:${harness.activity.activitySpec.id}`;
  assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
  await assert.rejects(
    qar.executeQuestionActivity({activity:harness.activity,question:harness.question,response:{optionId:'measured'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.questionRegistry,now}),
    error=>error.code===expectedCode
  );
  assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
}

const approval=(kind,digest)=>kind==='rights'?{schemaVersion:2,id:'controlled-reading-rights',status:'approved',licenseId:'controlled-local',rightsHolder:'project',basis:'project-created',assertedAt:'2026-08-10T08:20:00.000Z',expiresAt:null,aiAsserted:false}:kind==='provenance'?{schemaVersion:2,id:'controlled-reading-provenance',sourceType:'original-human-authored',sourceDescription:'CONTROLLED_LOCAL_TEST_ONLY project fixture',authorOrOrigin:'project',createdAt:'2026-08-10T08:20:00.000Z',aiDraft:false}:{schemaVersion:2,id:'controlled-reading-review',status:'approved',reviewerType:'human',reviewerId:'controlled-reviewer',reviewedAt:'2026-08-10T08:21:00.000Z',scopeDigest:digest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false};
function readingDraft({itemId,source,kind=READING_MULTIPLE_CHOICE_SINGLE_KIND}){
  const options=[{id:'not-measured',text:'Whether the move caused the rise'},{id:'counted',text:'Daily visitor numbers'}],sealed=[{...options[0],correct:true,rationale:'The report did not measure causation.'},{...options[1],correct:false,rationale:'Visitor numbers were counted.'}],payload={id:`controlled-question-${itemId}`,kind,prompt:'What did the report not measure?',options,target:{skill:'reading',profile:'academic',sourceId:source.sourceRevisionRef.sourceId,sourceRevision:source.sourceRevisionRef.revisionId},createdAt:1,updatedAt:1};
  const binding={kind,schemaVersion:1,registryRevision:'qar-reading-single-select-registry-v1',questionId:payload.id,promptRevision:'controlled-prompt-v1',promptDigest:learningContractDigest({item:payload,sourceRevisionRef:source.sourceRevisionRef}),keyRevision:'controlled-key-v1',keyDigest:learningContractDigest(sealed.map(option=>({id:option.id,correct:option.correct}))),rubricRevision:'controlled-rubric-v1',rubricDigest:learningContractDigest({rationales:sealed.map(option=>({id:option.id,rationale:option.rationale})),reviewPolicy:'objective-reading-review-v1'}),scorer:{id:'reading-single-select-v1',version:1},reviewPolicyRevision:'objective-reading-review-v1',requiredCapabilities:['keyboard','focus','screen-reader']};
  return {kind:'ielts-objective-inventory-item',schemaVersion:1,itemId,itemRevision:1,skill:'reading',profiles:['academic'],form:{id:'controlled-form',revision:1},section:{id:'controlled-section',revision:1,number:1},order:1,sourceRevisionRef:source.sourceRevisionRef,questionBinding:binding,questionPayload:payload,status:'draft',createdAt:'2026-08-10T08:20:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,rights:null,provenance:null,humanReview:null,extensions:{fixture:'CONTROLLED_LOCAL_TEST_ONLY'},sealed};
}

test('Reading single-select adapter is absent before the QAR-01 implementation',async()=>{
  assert.equal(typeof createIeltsReadingQuestionOwnerAdapter,'function');
  const item=inventory();
  const question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)});
  assert.equal(question.kind,READING_MULTIPLE_CHOICE_SINGLE_KIND);
  assert.deepEqual(question.item.options,[{id:'measured',text:'Whether the move caused the rise'},{id:'counted',text:'Daily visitor numbers'}]);
  assert.equal('correct' in question.item.options[0],false);
  assert.equal(qar.scoreQuestionActivity(question,{optionId:'measured'}).numerator,1);
});

test('Reading source revisions are immutable profile-bound owner records',()=>{
  const source=createIeltsReadingSourceRevision({id:'academic-library',revision:1,profile:'academic',title:'Library trial',passage:academicSource.passage,status:'verified',createdAt:1,updatedAt:1,objectiveItems:[{inventoryId:'inventory:reading-multiple-choice-single',options:[{id:'measured',text:'Whether the move caused the rise',correct:true,rationale:'No cause measurement.'},{id:'counted',text:'Daily visitor numbers',correct:false,rationale:'Counts were reported.'}]}]});
  assert.equal(source.sourceRevisionRef.kind,'ielts-reading-passage');
  assert.equal(source.sourceRevisionRef.locator.revision,1);
  assert.throws(()=>createIeltsReadingSourceRevision({...source,sourceRevisionRef:{...source.sourceRevisionRef,revisionId:'current'}}),error=>error.code==='IELTS_READING_SOURCE_INVALID');
});

test('all three Reading kinds enforce an exact single option identity and fixed claim order',async()=>{
  for(const [kind,correct] of [[READING_MULTIPLE_CHOICE_SINGLE_KIND,'measured'],[READING_TRUE_FALSE_NOT_GIVEN_KIND,'not-given'],[READING_YES_NO_NOT_GIVEN_KIND,'yes']]){
    const item=inventory(kind);const question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)});
    assert.equal(qar.validateQuestionActivity(question).valid,true);
    assert.equal(qar.scoreQuestionActivity(question,{optionId:correct}).disposition,'correct');
    assert.equal(qar.normalizeQuestionResponse(question,{optionId:` ${correct} `}).valid,false);
    assert.equal(qar.normalizeQuestionResponse(question,{optionId:correct,extra:true}).valid,false);
    if(kind!==READING_MULTIPLE_CHOICE_SINGLE_KIND)assert.deepEqual(question.item.options.map(option=>option.id),kind===READING_TRUE_FALSE_NOT_GIVEN_KIND?['true','false','not-given']:['yes','no','not-given']);
  }
});

test('Reading questions are public projections and clone/wrapper data cannot become answer authority',async()=>{
  const item=inventory(),question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)});
  const serialized=JSON.stringify(question);assert.equal(serialized.includes('correct'),false);assert.equal(serialized.includes('rationale'),false);
  const clone=structuredClone(question);assert.equal(qar.scoreQuestionActivity(clone,{optionId:'measured'}).valid,false);
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);assert.equal(registry.supports(question),true);
  assert.throws(()=>registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']),error=>error.code==='QUESTION_ACTIVITY_DUPLICATE_EXECUTOR');
});

test('Reading source durability is idempotent and a changed source cannot overwrite its exact revision',async()=>{
  await initializeIeltsPersistence();
  const source=createIeltsReadingSourceRevision({id:'academic-durable-reading',revision:1,profile:'academic',title:'Durable library trial',passage:academicSource.passage,status:'verified',createdAt:11,updatedAt:11,objectiveItems:[]});
  const first=await saveIeltsReadingSourceRevision(source),replay=await saveIeltsReadingSourceRevision(source);
  assert.deepEqual(replay,first);
  const changed={...source,passage:`${source.passage} Extra.`};delete changed.sourceRevisionRef;
  await assert.rejects(saveIeltsReadingSourceRevision(changed),error=>error.code==='IELTS_READING_SOURCE_COLLISION');
  await reopenIeltsDatabase();
  assert.deepEqual(await getIeltsReadingSourceRevision(source.id),source);
});

test('Reading launches through the canonical QAR Run, Attempt, and Receipt path without legacy attempts',async()=>{
  const item=inventory(),question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)}),score=qar.scoreQuestionActivity(question,{optionId:'measured'});
  const plan=composeTodayPlan({content:[{id:'reading-qar-run',type:'reading',target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:item.id,cardId:null,senseId:null,skill:'reading',sourceId:sourceRevisionRef.sourceId,sourceRevision:sourceRevisionRef.revisionId},executor:'qar-reading-single-select',estimatedSeconds:60}],now:20_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-reading-single-select',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'reading-r1',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async id=>id===academicSource.id?{...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]}:null})]});
  const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'measured'},sourceRegistry,questionRegistry:registry,now:20_100});
  assert.equal(result.run.status,'completed');assert.equal(result.score.affectsSchedule,false);assert.equal(result.decision.eligible,false);
});

test('Reading terminal feedback is selected-only and the v2 target binds the durable inventory identity',async()=>{
  const item=inventory(),question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)}),score=qar.scoreQuestionActivity(question,{optionId:'measured'});
  const target={schemaVersion:2,targetType:'ielts-objective-item',targetId:item.id,cardId:null,senseId:null,skill:'reading',sourceId:sourceRevisionRef.sourceId,sourceRevision:sourceRevisionRef.revisionId};
  const plan=composeTodayPlan({content:[{id:'reading-feedback',type:'reading',target,executor:'qar-reading-single-select',estimatedSeconds:60}],now:30_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-reading-single-select',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'reading-feedback-r1',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>({...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]})})]});
  const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'measured'},sourceRegistry,questionRegistry:registry,now:30_100});
  assert.deepEqual(result.run.activitySpec.target,target);
  assert.equal(result.feedback.selectedOptionId,'measured');
  assert.equal(result.feedback.rationale,'The report did not measure causation.');
  assert.equal(JSON.stringify(result.feedback).includes('Visitor numbers were counted.'),false);
  assert.deepEqual(result.run.envelope.attempt.metadata.feedback,result.feedback);
});

test('Reading rejects a substituted objective target before starting a canonical run',async()=>{
  const item=inventory(),question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)}),score=qar.scoreQuestionActivity(question,{optionId:'measured'});
  const target={schemaVersion:2,targetType:'ielts-objective-item',targetId:'ielts-objective:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',cardId:null,senseId:null,skill:'reading',sourceId:sourceRevisionRef.sourceId,sourceRevision:sourceRevisionRef.revisionId};
  const plan=composeTodayPlan({content:[{id:'reading-substituted-target',type:'reading',target,executor:'qar-reading-single-select',estimatedSeconds:60}],now:40_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-reading-single-select',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'reading-substitution-r1',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>({...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]})})]});
  await assert.rejects(qar.executeQuestionActivity({activity,question,response:{optionId:'measured'},sourceRegistry,questionRegistry:registry,now:40_100}),error=>error.code==='QUESTION_ACTIVITY_TARGET_BINDING_MISMATCH');
});

test('two-pass public owner construction derives a stable inventory identity without persisting provisional content',async()=>{
  await initializeIeltsPersistence();
  const id='controlled-reading-two-pass';
  const provisional=createIeltsReadingSourceRevision({id,revision:1,profile:'academic',title:'Controlled library trial',passage:academicSource.passage,objectiveItems:[],status:'verified',createdAt:1,updatedAt:1});
  const provisionalInput=readingDraft({itemId:id,source:provisional});const {sealed:provisionalSealed,...provisionalRecord}=provisionalInput;const provisionalDraft=await createIeltsObjectiveInventoryItem(provisionalRecord,{at:Date.parse(provisionalRecord.createdAt)});
  const {sourceRevisionRef:ignoredProvisionalRef,...provisionalSourceFields}=provisional;const finalSource=createIeltsReadingSourceRevision({...provisionalSourceFields,objectiveItems:[{inventoryId:provisionalDraft.id,options:provisionalInput.sealed}]});
  const finalInput=readingDraft({itemId:id,source:finalSource});const {sealed:finalSealed,...finalRecord}=finalInput;const finalDraft=await createIeltsObjectiveInventoryItem(finalRecord,{at:Date.parse(finalRecord.createdAt)});
  assert.equal(finalDraft.id,provisionalDraft.id);
  assert.notEqual(finalDraft.contentDigest,provisionalDraft.contentDigest);
  assert.equal(finalSource.objectiveItems[0].inventoryId,finalDraft.id);
  const verifiedInput={...finalDraft,status:'verified',verifiedAt:'2026-08-10T08:21:00.000Z',rights:approval('rights',finalDraft.contentDigest),provenance:approval('provenance',finalDraft.contentDigest),humanReview:approval('humanReview',finalDraft.contentDigest)};const verified=await createIeltsObjectiveInventoryItem(verifiedInput,{at:Date.parse(verifiedInput.verifiedAt)});
  const finalOwner=createIeltsReadingQuestionOwnerAdapter({readVerifiedInventory:async value=>value===finalDraft.id?verified:null,readVerifiedSource:async reference=>reference.revisionId===finalSource.sourceRevisionRef.revisionId?finalSource:null});
  const question=await adaptIeltsReadingObjectiveItem(verified,finalSource.sourceRevisionRef,{ownerAdapter:finalOwner});
  await saveIeltsReadingSourceRevision(finalSource);await saveIeltsObjectiveInventoryItem(finalDraft,{at:Date.parse(finalDraft.createdAt)});
  const saved=await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});
  assert.equal((await getIeltsObjectiveInventoryItem(saved.id)).contentDigest,finalDraft.contentDigest);
  assert.equal((await getIeltsReadingSourceRevision(finalSource.id)).sourceRevisionRef.integrity,finalSource.sourceRevisionRef.integrity);
});

test('Reading source and owner adapters reject mismatched or accessor-backed owner rows without invoking accessors',async()=>{
  let sourceReads=0;
  const adapter=createIeltsReadingSourceAdapter({readSource:async()=>{sourceReads+=1;return{...academicSource,id:'substituted-source',objectiveItems:[]};}});
  const mismatch=await adapter.resolve(sourceRevisionRef);
  assert.equal(mismatch.executable,false);
  assert.equal(mismatch.code,'INTEGRITY_MISMATCH');
  assert.equal(sourceReads,1);

  let accessorCalls=0;
  const item=inventory();
  const unsafeSource={...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]};
  Object.defineProperty(unsafeSource,'status',{enumerable:true,get(){accessorCalls+=1;return'verified';}});
  const unsafeOwner=createIeltsReadingQuestionOwnerAdapter({readVerifiedInventory:async()=>item,readVerifiedSource:async()=>unsafeSource});
  await assert.rejects(
    adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:unsafeOwner}),
    error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH'
  );
  assert.equal(accessorCalls,0);
});

test('Reading terminal feedback authenticates exact current inventory/source and reports stale owner state without mutation',async()=>{
  const item=inventory(),question=await adaptIeltsReadingObjectiveItem(item,sourceRevisionRef,{ownerAdapter:owner(item)}),score=qar.scoreQuestionActivity(question,{optionId:'measured'});
  const target={schemaVersion:2,targetType:'ielts-objective-item',targetId:item.id,cardId:null,senseId:null,skill:'reading',sourceId:sourceRevisionRef.sourceId,sourceRevision:sourceRevisionRef.revisionId};
  const plan=composeTodayPlan({content:[{id:'reading-feedback-freshness',type:'reading',target,executor:'qar-reading-single-select',estimatedSeconds:60}],now:50_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-reading-single-select',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'reading-feedback-freshness-r1',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>({...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]})})]});
  const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'measured'},sourceRegistry,questionRegistry:registry,now:50_100});
  const before=JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id));
  assert.equal((await qar.assessReadingFeedbackFreshness(result.feedback,{ownerAdapter:owner(item)})).stale,false);
  const retiredOwner=createIeltsReadingQuestionOwnerAdapter({readVerifiedInventory:async()=>({...item,status:'retired'}),readVerifiedSource:async()=>({...academicSource,objectiveItems:[{inventoryId:item.id,options:item.sealedQuestion.options}]})});
  const stale=await qar.assessReadingFeedbackFreshness(result.feedback,{ownerAdapter:retiredOwner});
  assert.equal(stale.stale,true);
  assert.equal(stale.staleReason,'INVENTORY_UNAVAILABLE');
  assert.equal(JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id)),before);
  await assert.rejects(
    qar.assessReadingFeedbackFreshness({...result.feedback,rationale:'tampered'}, {ownerAdapter:owner(item)}),
    error=>error.code==='QUESTION_ACTIVITY_FEEDBACK_INVALID'
  );
});

test('Reading owner records and canonical selected-only terminal survive combined backup restore and reopen exactly',async()=>{
  const itemId='controlled-reading-backup';
  const provisional=createIeltsReadingSourceRevision({id:itemId,revision:1,profile:'general-training',title:'Controlled notice',passage:'A project-authored notice says the office opens at nine. It does not state when the office closes.',objectiveItems:[],status:'verified',createdAt:60_000,updatedAt:60_000});
  const provisionalInput=readingDraft({itemId,source:provisional});provisionalInput.profiles=['general-training'];provisionalInput.questionPayload.target.profile='general-training';
  const {sealed:provisionalSealed,...provisionalRecord}=provisionalInput;const provisionalDraft=await createIeltsObjectiveInventoryItem(provisionalRecord,{at:Date.parse(provisionalRecord.createdAt)});
  const {sourceRevisionRef:ignored,...sourceFields}=provisional;const finalSource=createIeltsReadingSourceRevision({...sourceFields,objectiveItems:[{inventoryId:provisionalDraft.id,options:provisionalSealed}]});
  const finalInput=readingDraft({itemId,source:finalSource});finalInput.profiles=['general-training'];finalInput.questionPayload.target.profile='general-training';finalInput.questionBinding.promptDigest=learningContractDigest({item:finalInput.questionPayload,sourceRevisionRef:finalSource.sourceRevisionRef});
  const {sealed,...finalRecord}=finalInput;const finalDraft=await createIeltsObjectiveInventoryItem(finalRecord,{at:Date.parse(finalRecord.createdAt)});
  const verifiedInput={...finalDraft,status:'verified',verifiedAt:'2026-08-10T08:21:00.000Z',rights:approval('rights',finalDraft.contentDigest),provenance:approval('provenance',finalDraft.contentDigest),humanReview:approval('humanReview',finalDraft.contentDigest)};const verified=await createIeltsObjectiveInventoryItem(verifiedInput,{at:Date.parse(verifiedInput.verifiedAt)});
  const durableOwner=createIeltsReadingQuestionOwnerAdapter({readVerifiedInventory:async value=>value===verified.id?verified:null,readVerifiedSource:async()=>finalSource});const question=await adaptIeltsReadingObjectiveItem(verified,finalSource.sourceRevisionRef,{ownerAdapter:durableOwner});
  await saveIeltsReadingSourceRevision(finalSource);await saveIeltsObjectiveInventoryItem(finalDraft,{at:Date.parse(finalDraft.createdAt)});await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});
  const score=qar.scoreQuestionActivity(question,{optionId:'not-measured'}),target={schemaVersion:2,targetType:'ielts-objective-item',targetId:verified.id,cardId:null,senseId:null,skill:'reading',sourceId:finalSource.sourceRevisionRef.sourceId,sourceRevision:finalSource.sourceRevisionRef.revisionId};
  const plan=composeTodayPlan({content:[{id:'reading-backup-owner',type:'reading',target,executor:'qar-reading-single-select',estimatedSeconds:60}],now:61_000,minutes:5});const activity={...plan.activities[0],execution:{kind:'qar-reading-single-select',status:'ready'},assistanceCollectionMode:'qar-reading',launchBinding:'reading-backup-r1',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>finalSource})]});const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'not-measured'},sourceRegistry,questionRegistry:registry,now:61_100});
  const backup=await buildCombinedBackup();await restoreCombinedBackup(backup);await reopenIeltsDatabase();await reopenV10Database();
  assert.deepEqual(await getIeltsReadingSourceRevision(finalSource.id),finalSource);
  assert.deepEqual(await getIeltsObjectiveInventoryItem(verified.id),verified);
  const reopened=await getV10Record(V10_STORES.todayRuns,result.run.id);assert.deepEqual(reopened.envelope.attempt.metadata.feedback,result.feedback);assert.deepEqual(reopened.envelope.receipt.metadata.feedback,result.feedback);assert.equal(reopened.evidenceDecision.reason,'unsupported-non-card-target');
  assert.equal(JSON.stringify(result.feedback).includes('Visitor numbers were counted.'),false);
});

test('Reading execution rereads exact verified inventory lifecycle and immutable binding before any run write',async()=>{
  const retired=await mutableReadingOwnerHarness('reading-owner-retired',70_000);
  retired.setInventoryReader(async()=>({...retired.item,status:'retired'}));
  await assertOwnerReadbackRejects(retired,'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED',70_100);

  const rebound=await mutableReadingOwnerHarness('reading-owner-rebound',71_000);
  rebound.setInventoryReader(async()=>({...rebound.item,questionBinding:{...rebound.item.questionBinding,keyRevision:'key-r2'}}));
  await assertOwnerReadbackRejects(rebound,'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED',71_100);
});

test('Reading execution rejects same-identity source body and sealed-option substitution before any run write',async()=>{
  const harness=await mutableReadingOwnerHarness('reading-owner-source-substitution',72_000);
  harness.setSourceReader(async()=>({...harness.source,passage:`${harness.source.passage} Substituted body.`,objectiveItems:[{inventoryId:harness.item.id,options:harness.item.sealedQuestion.options.map((option,index)=>index?option:{...option,rationale:'Substituted sealed rationale.'})}]}));
  await assertOwnerReadbackRejects(harness,'QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH',72_100);
});

test('Reading execution fails closed on throwing, absent, malformed, or accessor-backed owner rereads',async()=>{
  const cases=[
    {id:'inventory-throw',side:'inventory',reader:async()=>{throw new Error('owner unavailable');},code:'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED'},
    {id:'inventory-null',side:'inventory',reader:async()=>null,code:'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED'},
    {id:'inventory-malformed',side:'inventory',reader:async()=>({id:'malformed'}),code:'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED'},
    {id:'source-throw',side:'source',reader:async()=>{throw new Error('owner unavailable');},code:'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED'},
    {id:'source-null',side:'source',reader:async()=>null,code:'QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH'},
    {id:'source-malformed',side:'source',reader:async()=>({id:'malformed'}),code:'QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH'}
  ];
  for(let index=0;index<cases.length;index+=1){
    const row=cases[index],harness=await mutableReadingOwnerHarness(`reading-owner-${row.id}`,73_000+index*1_000);
    if(row.side==='inventory')harness.setInventoryReader(row.reader);else harness.setSourceReader(row.reader);
    await assertOwnerReadbackRejects(harness,row.code,73_100+index*1_000);
  }

  let inventoryGetterCalls=0;
  const inventoryAccessor=await mutableReadingOwnerHarness('reading-owner-inventory-accessor',80_000),unsafeInventory={...inventoryAccessor.item};
  Object.defineProperty(unsafeInventory,'status',{enumerable:true,get(){inventoryGetterCalls+=1;return'verified';}});
  inventoryAccessor.setInventoryReader(async()=>unsafeInventory);
  await assertOwnerReadbackRejects(inventoryAccessor,'QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED',80_100);
  assert.equal(inventoryGetterCalls,0);

  let sourceGetterCalls=0;
  const sourceAccessor=await mutableReadingOwnerHarness('reading-owner-source-accessor',81_000),unsafeSource={...sourceAccessor.source};
  Object.defineProperty(unsafeSource,'status',{enumerable:true,get(){sourceGetterCalls+=1;return'verified';}});
  sourceAccessor.setSourceReader(async()=>unsafeSource);
  await assertOwnerReadbackRejects(sourceAccessor,'QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH',81_100);
  assert.equal(sourceGetterCalls,0);
});

test('Reading execution allows unchanged owner rows and exact terminal replay remains idempotent',async()=>{
  const harness=await mutableReadingOwnerHarness('reading-owner-exact-replay',82_000);
  const first=await qar.executeQuestionActivity({activity:harness.activity,question:harness.question,response:{optionId:'measured'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.questionRegistry,now:82_100});
  const replay=await qar.executeQuestionActivity({activity:harness.activity,question:harness.question,response:{optionId:'measured'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.questionRegistry,now:82_100});
  assert.deepEqual(replay,first);
});
