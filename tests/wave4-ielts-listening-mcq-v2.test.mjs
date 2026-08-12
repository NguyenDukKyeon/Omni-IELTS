import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { IDBFactory } from 'fake-indexeddb';
import * as qar from '../src/question-activity-contracts.js';
import { learningContractDigest } from '../src/learning-contracts.js';
import { createSourceRevisionRegistry,createTranscriptSourceAdapter } from '../src/source-revision-ref.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { getV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { persistTranscriptAggregate,getTranscriptAggregate } from '../src/transcript-aggregate.js';
import { createIeltsObjectiveInventoryItem } from '../src/ielts-profile-inventory.js';
import { initializeIeltsPersistence,saveIeltsObjectiveInventoryItem,getIeltsObjectiveInventoryItem,retireIeltsObjectiveInventoryItem,reopenIeltsDatabase } from '../src/ielts-persistence.js';
import {
  LISTENING_MULTIPLE_CHOICE_INVENTORY_REGISTRY_REVISION,
  adaptIeltsListeningObjectiveItem,
  createIeltsListeningQuestionOwnerAdapter,
  createDurableIeltsListeningQuestionOwnerAdapter,
  createIeltsListeningSourceAdapter
} from '../src/ielts-listening-question-activity.js';

globalThis.indexedDB=new IDBFactory();

function aggregate(){return createTranscriptAggregate({
  source:{id:'controlled-listening-source',status:'verified',complete:true},
  segments:[{startMs:0,endMs:900,text:'CONTROLLED_TRANSCRIPT_BODY_SENTINEL One.',status:'verified',aligned:true},{startMs:900,endMs:1800,text:'Two.',status:'verified',aligned:true}],
  provenance:{origin:'controlled-local-tone-fixture',verification:'verified',rights:'allowed',privacy:'private'},createdAt:1
});}

async function wave2Fixture(){
  const manifest=JSON.parse(await readFile(new URL('./fixtures/wave2-listening-tone-fixture.json',import.meta.url),'utf8'));
  const wav=await readFile(new URL('./fixtures/wave2-listening-tone-fixture.wav',import.meta.url));
  assert.equal(createHash('sha256').update(wav).digest('hex'),manifest.audio.sha256);
  assert.equal(wav.byteLength,manifest.audio.byteLength);
  return manifest;
}

function rawInventory(source=aggregate(),targetId=`ielts-objective:${'a'.repeat(64)}`){
  const options=[{id:'a',text:'The first controlled tone',correct:true,rationale:'SELECTED_RATIONALE_SENTINEL'},{id:'b',text:'The second controlled tone',correct:false,rationale:'UNSELECTED_RATIONALE_SENTINEL'}];
  const target={schemaVersion:2,targetType:'ielts-objective-item',targetId,cardId:null,senseId:null,skill:'listening',sourceId:source.source.id,sourceRevision:source.revision.id};
  const payload={id:'controlled-listening-question-v2',kind:'listening-multiple-choice',prompt:'Which controlled tone starts the fixture?',options:options.map(({id,text})=>({id,text})),sealedOptions:options,target,sourceAnchor:{sourceId:source.source.id,revisionId:source.revision.id,integrity:source.revision.contentDigest,segmentIds:source.revision.segmentIds,startMs:0,endMs:1800},createdAt:1,updatedAt:1};
  const reference=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>source}).createRef(source),publicPayload={id:payload.id,kind:payload.kind,prompt:payload.prompt,options:payload.options,target:payload.target,sourceAnchor:payload.sourceAnchor,createdAt:payload.createdAt,updatedAt:payload.updatedAt};const binding={kind:'listening-multiple-choice',schemaVersion:2,registryRevision:'qar-listening-mcq-inventory-registry-v2',questionId:payload.id,promptRevision:'controlled-listening-prompt-v2',promptDigest:learningContractDigest({item:publicPayload,sourceRevisionRef:reference}),keyRevision:'controlled-listening-key-v2',keyDigest:learningContractDigest(options.map(option=>({id:option.id,correct:option.correct}))),rubricRevision:'controlled-listening-rubric-v2',rubricDigest:learningContractDigest({rationales:options.map(option=>({id:option.id,rationale:option.rationale})),reviewPolicy:'objective-listening-review-v1'}),scorer:{id:'listening-multiple-choice-v1',version:1},reviewPolicyRevision:'objective-listening-review-v1',requiredCapabilities:['audio-playback','focus','keyboard','screen-reader']};
  return{id:target.targetId,skill:'listening',profiles:['academic','general-training'],status:'verified',sourceRevisionRef:reference,questionBinding:binding,questionPayload:payload,createdAt:1,updatedAt:1};
}

function durableInventoryInput(source,targetId,itemId='controlled-listening-v2'){const draft=rawInventory(source,targetId);return{kind:'ielts-objective-inventory-item',schemaVersion:1,itemId,itemRevision:1,skill:draft.skill,profiles:draft.profiles,form:{id:'controlled-listening-form',revision:1},section:{id:'controlled-listening-section',revision:1,number:1},order:1,sourceRevisionRef:draft.sourceRevisionRef,questionBinding:draft.questionBinding,questionPayload:draft.questionPayload,status:'draft',createdAt:'2026-08-11T01:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,rights:null,provenance:null,humanReview:null,extensions:{fixture:'CONTROLLED_LOCAL_TEST_ONLY'}};}
function approval(kind,digest){return kind==='rights'?{schemaVersion:2,id:'controlled-listening-rights',status:'approved',licenseId:'controlled-local',rightsHolder:'project',basis:'project-created',assertedAt:'2026-08-11T01:00:00.000Z',expiresAt:null,aiAsserted:false}:kind==='provenance'?{schemaVersion:2,id:'controlled-listening-provenance',sourceType:'original-human-authored',sourceDescription:'CONTROLLED_LOCAL_TEST_ONLY project fixture',authorOrOrigin:'project',createdAt:'2026-08-11T01:00:00.000Z',aiDraft:false}:{schemaVersion:2,id:'controlled-listening-review',status:'approved',reviewerType:'human',reviewerId:'controlled-reviewer',reviewedAt:'2026-08-11T01:01:00.000Z',scopeDigest:digest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false};}
function inventory(source=aggregate()){const seed=createIeltsObjectiveInventoryItem(durableInventoryInput(source,`ielts-objective:${'b'.repeat(64)}`),{at:Date.parse('2026-08-11T01:00:00.000Z')});const draft=createIeltsObjectiveInventoryItem(durableInventoryInput(source,seed.id),{at:Date.parse('2026-08-11T01:00:00.000Z')});return createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T01:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)},{at:Date.parse('2026-08-11T01:01:00.000Z')});}

function owner(item,source){return createIeltsListeningQuestionOwnerAdapter({readVerifiedInventory:async id=>id===item.id?item:null,getTranscriptAggregate:async revisionId=>revisionId===source.revision.id?source:null});}

function execution(item,question,source,id,now){
  const score=qar.scoreQuestionActivity(question,{optionId:'a'}),target=question.item.target;
  const plan=composeTodayPlan({content:[{id,type:'listening',target,executor:'qar-listening-multiple-choice',estimatedSeconds:60}],now,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-listening-multiple-choice',status:'ready'},assistanceCollectionMode:'qar-listening',launchBinding:`${id}-binding`,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
  const questionRegistry=qar.createQuestionRegistry();questionRegistry.registerExecutor(question.kind,question.version,['audio-playback','focus','keyboard','screen-reader']);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsListeningSourceAdapter({getAggregate:async revisionId=>revisionId===source.revision.id?source:null})]});
  return{activity,questionRegistry,sourceRegistry};
}

async function harness(id='controlled-listening-run',now=10_000){const source=aggregate(),item=inventory(source),ownerAdapter=owner(item,source),question=await adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter});return{source,item,ownerAdapter,question,...execution(item,question,source,id,now)};}

test('QAR Listening v2 is an additive inventory-backed public contract with the exact non-card target',async()=>{
  const source=aggregate(),item=inventory(source),question=await adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter:owner(item,source)});
  assert.equal(LISTENING_MULTIPLE_CHOICE_INVENTORY_REGISTRY_REVISION,'qar-listening-mcq-inventory-registry-v2');
  assert.equal(question.version,2);assert.equal(question.registryRevision,'qar-listening-mcq-inventory-registry-v2');assert.equal(question.item.target.targetType,'ielts-objective-item');assert.equal(question.item.target.targetId,item.id);assert.equal(question.item.target.cardId,null);assert.equal(question.item.target.senseId,null);assert.equal(question.item.target.skill,'listening');assert.deepEqual(question.item.options,[{id:'a',text:'The first controlled tone'},{id:'b',text:'The second controlled tone'}]);
  assert.equal(qar.validateQuestionActivity(question).valid,true);assert.equal(qar.scoreQuestionActivity(question,{optionId:'a'}).disposition,'correct');assert.equal(qar.scoreQuestionActivity(question,{optionId:' b '}).valid,false);
  const serialized=JSON.stringify(question);for(const secret of ['correct','rationale','CONTROLLED_TRANSCRIPT_BODY_SENTINEL'])assert.equal(serialized.includes(secret),false,secret);
  assert.equal(qar.validateQuestionActivity({...question,version:3}).valid,false);
});

test('QAR Listening v2 authenticates owner inventory and Transcript data before adaptation',async()=>{
  const source=aggregate(),item=inventory(source);const adapted=await adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter:owner(item,source)});
  assert.equal(qar.scoreQuestionActivity(structuredClone(adapted),{optionId:'a'}).valid,false);
  await assert.rejects(adaptIeltsListeningObjectiveItem({...item,profiles:['general-training','academic']},item.sourceRevisionRef,{ownerAdapter:owner(item,source)}),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  let reads=0;const hostile={...item};Object.defineProperty(hostile,'status',{enumerable:true,get(){reads+=1;return'verified';}});const unsafe=createIeltsListeningQuestionOwnerAdapter({readVerifiedInventory:async()=>hostile,getTranscriptAggregate:async()=>source});await assert.rejects(adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter:unsafe}),error=>error.code==='QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED');assert.equal(reads,0);
  const bad={...source,revision:{...source.revision,segmentIds:[...source.revision.segmentIds].reverse()}};await assert.rejects(adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter:owner(item,bad)}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');
});

test('QAR Listening v2 rereads both owners, writes only canonical terminal state, and is default-deny',async()=>{
  const data=await harness();const result=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:10_100});
  assert.equal(result.run.status,'completed');assert.equal(result.decision.eligible,false);assert.equal(result.score.affectsSchedule,false);assert.equal(result.run.activitySpec.target.targetId,data.item.id);assert.equal(result.feedback.inventoryId,data.item.id);assert.equal(result.feedback.selectedOptionId,'a');assert.equal(result.feedback.rationale,'SELECTED_RATIONALE_SENTINEL');assert.equal(JSON.stringify(result.feedback).includes('UNSELECTED_RATIONALE_SENTINEL'),false);assert.deepEqual(result.run.envelope.attempt.metadata.feedback,result.feedback);
  const before=JSON.stringify(result.run.envelope);const duplicate=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:10_200});assert.equal(JSON.stringify(duplicate.run.envelope),before);await assert.rejects(qar.executeQuestionActivity({activity:data.activity,question:data.question,response:{optionId:'b'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:10_300}),error=>['QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT','TODAY_RUN_TERMINAL_CONFLICT'].includes(error.code));
});

test('QAR Listening v2 rejects pre-Run owner drift with zero write and reports stale feedback without mutation',async()=>{
  const data=await harness('controlled-listening-drift',20_000),runId=`today-run:${data.activity.activitySpec.id}`;let currentItem=data.item,currentSource=data.source;const mutable=createIeltsListeningQuestionOwnerAdapter({readVerifiedInventory:async()=>currentItem,getTranscriptAggregate:async()=>currentSource});
  const question=await adaptIeltsListeningObjectiveItem(data.item,data.item.sourceRevisionRef,{ownerAdapter:mutable});currentItem={...currentItem,status:'retired'};
  await assert.rejects(qar.executeQuestionActivity({activity:data.activity,question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:20_100}),error=>error.code==='QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED');assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
  currentItem=data.item;const result=await qar.executeQuestionActivity({activity:data.activity,question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:20_200});const before=JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id));currentSource={...data.source,source:{...data.source.source,activeRevisionId:'different-active-child'}};const fresh=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:mutable});assert.equal(fresh.stale,true);assert.equal(fresh.staleReason,'SOURCE_ACTIVE_REVISION_CHANGED');assert.equal(JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id)),before);
});

test('R2 Listening feedback rejects an accessor-backed Transcript owner without reading it',async()=>{
  const data=await harness('r2-hostile-freshness',21_000),result=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:21_100});let reads=0;const hostile={revision:data.source.revision,segments:data.source.segments};Object.defineProperty(hostile,'source',{enumerable:true,get(){reads+=1;return data.source.source;}});
  const before=JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id)),fresh=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:createIeltsListeningQuestionOwnerAdapter({readVerifiedInventory:async()=>data.item,getTranscriptAggregate:async()=>hostile})});
  assert.equal(fresh.stale,true);assert.equal(fresh.staleReason,'SOURCE_BINDING_CHANGED');assert.equal(reads,0);assert.equal(JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id)),before);
});

test('QAR Listening v2 backup/reopen preserves the terminal envelope and coverage remains partial',async()=>{
  const data=await harness('controlled-listening-backup',30_000),result=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:30_100});const backup=await buildCombinedBackup();assert.ok(backup.domains.v10.stores.todayRuns.some(row=>row.id===result.run.id));const restored=await restoreCombinedBackup(backup);assert.equal(restored.durable,true);await reopenV10Database();const reopened=await getV10Record(V10_STORES.todayRuns,result.run.id);assert.deepEqual(reopened.envelope.receipt.metadata.feedback,result.feedback);
  const listening=qar.getQuestionCoverageReport().kinds.find(row=>row.kind==='listening-multiple-choice');assert.equal(listening.coverage,'PARTIAL');assert.match(listening.limitations,/not full Listening, readiness, or UI coverage/);
});

test('QAR Listening v2 durably promotes canonical inventory and preserves owner row through combined backup restore',async()=>{
  await initializeIeltsPersistence();const source=aggregate(),seed=createIeltsObjectiveInventoryItem(durableInventoryInput(source,`ielts-objective:${'b'.repeat(64)}`),{at:Date.parse('2026-08-11T01:00:00.000Z')});const draft=createIeltsObjectiveInventoryItem(durableInventoryInput(source,seed.id),{at:Date.parse('2026-08-11T01:00:00.000Z')});assert.equal(draft.id,seed.id);const verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T01:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)},{at:Date.parse('2026-08-11T01:01:00.000Z')});const question=await adaptIeltsListeningObjectiveItem(verified,verified.sourceRevisionRef,{ownerAdapter:owner(verified,source)});await saveIeltsObjectiveInventoryItem(draft,{at:Date.parse(draft.createdAt)});await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});const backup=await buildCombinedBackup();assert.ok(backup.domains.ielts.stores.objectiveInventory.some(row=>row.id===verified.id));await restoreCombinedBackup(backup);await reopenIeltsDatabase();assert.deepEqual(await getIeltsObjectiveInventoryItem(verified.id),verified);
});

test('R1 Listening v2 fences an exact Transcript owner snapshot before any canonical run write',async()=>{
  const data=await harness('r1-transcript-snapshot',40_000),runId=`today-run:${data.activity.activitySpec.id}`;let current=data.source;const ownerAdapter=createIeltsListeningQuestionOwnerAdapter({readVerifiedInventory:async()=>data.item,getTranscriptAggregate:async()=>current});const question=await adaptIeltsListeningObjectiveItem(data.item,data.item.sourceRevisionRef,{ownerAdapter});current={...current,segments:[{...current.segments[0],text:'substituted body with unchanged revision metadata'},...current.segments.slice(1)]};await assert.rejects(qar.executeQuestionActivity({activity:data.activity,question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:40_100}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
});

test('R1 Listening v2 rejects incomplete or inactive Transcript aggregates before adaptation',async()=>{
  const source=aggregate(),item=inventory(source);for(const mutated of [{...source,revision:{...source.revision,coverage:{...source.revision.coverage,complete:false}}},{...source,source:{...source.source,activeRevisionId:'other-revision'}},{...source,segments:[source.segments[0],{...source.segments[1],startMs:901}]},{...source,segments:[source.segments[0],{...source.segments[1],startMs:899}]},{...source,segments:[...source.segments].reverse()}])await assert.rejects(adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter:owner(item,mutated)}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');
});

test('R1 Listening v2 refuses caller identity or prompt revision overrides of the canonical inventory binding',async()=>{
  const source=aggregate(),item=inventory(source),ownerAdapter=owner(item,source);
  await assert.rejects(adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter,id:'caller-override'}),error=>error.code==='QUESTION_ACTIVITY_ID_INVALID');
  await assert.rejects(adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter,promptRevision:'caller-override'}),error=>error.code==='QUESTION_ACTIVITY_ID_INVALID');
  const question=await adaptIeltsListeningObjectiveItem(item,item.sourceRevisionRef,{ownerAdapter,id:item.questionBinding.questionId,promptRevision:item.questionBinding.promptRevision});
  assert.equal(question.id,item.questionBinding.questionId);assert.equal(question.promptRevision,item.questionBinding.promptRevision);
});

test('R1 Listening v2 marks feedback stale when an otherwise canonical owner prompt changes',async()=>{
  const data=await harness('r1-owner-content-freshness',45_000),result=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:{optionId:'a'},sourceRegistry:data.sourceRegistry,questionRegistry:data.questionRegistry,now:45_100});
  const changedInput=durableInventoryInput(data.source,data.item.id);changedInput.questionPayload={...changedInput.questionPayload,prompt:'Changed canonical owner prompt'};
  const publicPayload=(({sealedOptions,...value})=>value)(changedInput.questionPayload);changedInput.questionBinding={...changedInput.questionBinding,promptDigest:learningContractDigest({item:publicPayload,sourceRevisionRef:changedInput.sourceRevisionRef})};
  const draft=createIeltsObjectiveInventoryItem(changedInput,{at:Date.parse('2026-08-11T01:00:00.000Z')}),changed=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T01:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)},{at:Date.parse('2026-08-11T01:01:00.000Z')});
  const before=JSON.stringify(result.feedback),fresh=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:owner(changed,data.source)});
  assert.equal(fresh.stale,true);assert.equal(fresh.staleReason,'INVENTORY_BINDING_CHANGED');assert.equal(JSON.stringify(result.feedback),before);
});

test('R1 Listening source adapter rejects accessor options without reading them',()=>{let reads=0;const hostile={};Object.defineProperty(hostile,'getAggregate',{enumerable:true,get(){reads+=1;throw new Error('must not read');}});assert.throws(()=>createIeltsListeningSourceAdapter(hostile),error=>error.code==='IELTS_LISTENING_SOURCE_INVALID');assert.equal(reads,0);});

test('R1 uses the deterministic Wave2 tone fixture only as nonproduction controlled test input',async()=>{
  const manifest=await wave2Fixture();
  assert.equal(manifest.kind,'wave2-controlled-listening-fixture');
  assert.equal(manifest.source.status,'verified');assert.equal(manifest.source.complete,true);
  assert.equal(manifest.source.sourceType,'controlled-test-fixture');
  assert.equal(manifest.rights.scope,'CONTROLLED_LOCAL_TEST_ONLY');
  assert.equal(manifest.rights.productionCatalogAuthority,false);
  assert.equal(manifest.approval.publication,false);assert.equal(manifest.approval.learnerEvidence,false);
  assert.equal(manifest.approval.productionCatalog,false);
  assert.equal(manifest.transcript.segments.every(row=>row.aligned===true),true);
});

test('R1 combined backup restores one durable canonical Transcript, verified inventory, and v2 terminal exactly',async()=>{
  const fixture=await wave2Fixture();
  const source=await persistTranscriptAggregate({source:fixture.source,segments:fixture.transcript.segments,provenance:{origin:fixture.transcript.provenance.origin,verification:fixture.transcript.provenance.verification,rights:fixture.transcript.provenance.rights,privacy:fixture.transcript.provenance.privacy},createdAt:fixture.source.createdAt},{activate:true});
  const itemId='r1-durable-wave2-listening',seed=createIeltsObjectiveInventoryItem(durableInventoryInput(source,`ielts-objective:${'c'.repeat(64)}`,itemId),{at:Date.parse('2026-08-11T01:00:00.000Z')}),draft=createIeltsObjectiveInventoryItem(durableInventoryInput(source,seed.id,itemId),{at:Date.parse('2026-08-11T01:00:00.000Z')}),verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T01:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)},{at:Date.parse('2026-08-11T01:01:00.000Z')});
  const ownerAdapter=owner(verified,source),question=await adaptIeltsListeningObjectiveItem(verified,verified.sourceRevisionRef,{ownerAdapter});
  await saveIeltsObjectiveInventoryItem(draft,{at:Date.parse(draft.createdAt)});await saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});
  const run=execution(verified,question,source,'r1-combined',50_000),result=await qar.executeQuestionActivity({activity:run.activity,question,response:{optionId:'a'},sourceRegistry:run.sourceRegistry,questionRegistry:run.questionRegistry,now:50_100}),backup=await buildCombinedBackup();
  await restoreCombinedBackup(backup);await reopenIeltsDatabase();await reopenV10Database();
  assert.deepEqual(await getIeltsObjectiveInventoryItem(verified.id),verified);assert.deepEqual(await getTranscriptAggregate(source.revision.id),source);
  const reopened=await getV10Record(V10_STORES.todayRuns,result.run.id);assert.deepEqual(reopened.envelope.receipt.metadata.feedback,result.feedback);
  const durableOwnerAdapter=createDurableIeltsListeningQuestionOwnerAdapter();assert.equal((await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:durableOwnerAdapter})).stale,false);
  const terminalBefore=JSON.stringify(reopened);await retireIeltsObjectiveInventoryItem(verified.id,{reason:'R2 durable freshness mutation',at:Date.parse('2026-08-11T01:02:00.000Z')});const stale=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:durableOwnerAdapter});assert.equal(stale.stale,true);assert.equal(stale.staleReason,'INVENTORY_UNAVAILABLE');assert.equal(JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id)),terminalBefore);
  const terminal=JSON.stringify(reopened),projection=JSON.stringify(question);
  for(const value of ['low tone','UNSELECTED_RATIONALE_SENTINEL','PRIVATE_TOKEN_SENTINEL','C:\\Users\\private']){assert.equal(terminal.includes(value),false);assert.equal(projection.includes(value),false);}
});
