import assert from 'node:assert/strict';
import test from 'node:test';
import { indexedDB,IDBKeyRange } from 'fake-indexeddb';
import {
  createIeltsReadingSourceRevision
} from '../src/ielts-domain.js';
import {
  createIeltsObjectiveInventoryItem,deriveIeltsObjectiveInventoryId
} from '../src/ielts-profile-inventory.js';
import {
  createIeltsReadingObjectiveTextOwnerAdapter,createDurableIeltsReadingObjectiveTextOwnerAdapter,
  adaptIeltsReadingObjectiveTextItem
} from '../src/ielts-reading-question-activity.js';
import { createObjectiveTextResponseOwnerAdapter,createObjectiveTextResponseQuestion } from '../src/question-activity-contracts.js';
import { getQuestionCoverageReport } from '../src/question-activity-contracts.js';
import { scoreObjectiveTextResponseAsync } from '../src/objective-text-response.js';
import * as qar from '../src/question-activity-contracts.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { createSourceRevisionRegistry } from '../src/source-revision-ref.js';
import { createIeltsReadingSourceAdapter } from '../src/ielts-reading-question-activity.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { getV10Record,listV10Records,putV10Record,deleteV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { IELTS_STORE_NAMES } from '../src/ielts-domain.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { getCurrentState,listReviewEvents } from '../src/persistence.js';
globalThis.indexedDB=indexedDB;globalThis.IDBKeyRange=IDBKeyRange;globalThis.dispatchEvent=()=>true;globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};
const persistence=await import('../src/ielts-persistence.js');

const KINDS=['reading-sentence-completion','reading-summary-completion','reading-note-completion','reading-table-completion','reading-flow-chart-completion','reading-short-answer'];

function source(profile='academic',items=[],id=`wave4-otr-${profile}`){
  return createIeltsReadingSourceRevision({id,revision:1,profile,title:'Controlled local Reading passage',passage:'A project-created passage supplies the exact controlled context for every completion exercise.',objectiveItems:items,status:'verified',createdAt:1,updatedAt:1});
}

function definition(kind,reference,id,slots=[{id:'slot-1',label:'Answer',wordLimit:2,acceptedAnswers:['controlled answer']}]){
  return {id,kind,prompt:'Complete the controlled response.',slots,target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:id,cardId:null,senseId:null,skill:'reading',sourceId:reference.sourceId,sourceRevision:reference.revisionId},sourceRevisionRef:reference,createdAt:1,updatedAt:1};
}

function record(kind,profile,reference,itemId,payload,binding){
  return {kind:'ielts-objective-inventory-item',schemaVersion:1,itemId,itemRevision:1,skill:'reading',profiles:[profile],form:{id:'wave4-form',revision:1},section:{id:`wave4-${profile}`,revision:1,number:1},order:1,sourceRevisionRef:reference,questionBinding:binding,questionPayload:payload,status:'draft',createdAt:'2026-08-11T00:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,rights:null,provenance:null,humanReview:null,extensions:{fixture:'CONTROLLED_LOCAL_TEST_ONLY'}};
}

function placeholderBinding(kind){return{kind,schemaVersion:1,registryRevision:'qar-objective-text-response-registry-v1',questionId:'qar:placeholder',promptRevision:'objective-text:1',promptDigest:'pending',keyRevision:'objective-text-key:1',keyDigest:'pending',rubricRevision:'objective-text-rubric:1',rubricDigest:'pending',scorer:{id:'objective-text-response-scorer-v1',version:1},reviewPolicyRevision:'objective-text-response-review-v1',requiredCapabilities:['text-entry','keyboard','focus','screen-reader']};}
function bindingFor(question){return{kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};}
function approval(kind,digest){return kind==='rights'?{schemaVersion:2,id:'wave4-otr-rights',status:'approved',licenseId:'project-created-local',rightsHolder:'VocabMaster project',basis:'project-created',assertedAt:'2026-08-11T00:00:00.000Z',expiresAt:null,aiAsserted:false}:kind==='provenance'?{schemaVersion:2,id:'wave4-otr-provenance',sourceType:'original-human-authored',sourceDescription:'CONTROLLED_LOCAL_TEST_ONLY project fixture',authorOrOrigin:'VocabMaster project',createdAt:'2026-08-11T00:00:00.000Z',aiDraft:false}:{schemaVersion:2,id:'wave4-otr-review',status:'approved',reviewerType:'human',reviewerId:'controlled-reviewer',reviewedAt:'2026-08-11T00:01:00.000Z',scopeDigest:digest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false};}
function drafted(kind,profile,reference,itemId,slots){
  const id=deriveIeltsObjectiveInventoryId({skill:'reading',profiles:[profile],form:{id:'wave4-form',revision:1},section:{id:`wave4-${profile}`,revision:1,number:1},order:1,itemId,itemRevision:1});
  const payload=definition(kind,reference,id,slots),question=createObjectiveTextResponseQuestion(payload,{ownerAdapter:createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>payload})});
  return createIeltsObjectiveInventoryItem(record(kind,profile,reference,itemId,payload,bindingFor(question)));
}

test('Reading OTR owner adapter creates a private-key-free public question for every Reading kind and profile',async()=>{
  assert.equal(typeof createIeltsReadingObjectiveTextOwnerAdapter,'function');
  assert.equal(typeof adaptIeltsReadingObjectiveTextItem,'function');
  for(const profile of ['academic','general-training'])for(const kind of KINDS){
    const provisional=source(profile),item=drafted(kind,profile,provisional.sourceRevisionRef,`${profile}-${kind}`);
    const sealed=source(profile,[{inventoryId:item.id,kind,schemaVersion:1}]);
    const currentDraft=drafted(kind,profile,sealed.sourceRevisionRef,`${profile}-${kind}`),current=createIeltsObjectiveInventoryItem({...currentDraft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',currentDraft.contentDigest),provenance:approval('provenance',currentDraft.contentDigest),humanReview:approval('review',currentDraft.contentDigest)});
    assert.equal(current.id,item.id);
    const owner=createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory:async id=>id===current.id?current:null,readVerifiedSource:async ref=>ref.revisionId===sealed.sourceRevisionRef.revisionId?sealed:null});
    const question=await adaptIeltsReadingObjectiveTextItem(current,sealed.sourceRevisionRef,{ownerAdapter:owner});
    assert.equal(question.kind,kind);
    assert.equal(question.item.target.targetId,current.id);
    assert.equal(JSON.stringify(question).includes('controlled answer'),false);
  }
});

test('Reading OTR promotion is durable and authenticated without publishing answer keys',async()=>{
  await persistence.initializeIeltsPersistence();
  const provisional=source('academic'),identity=drafted('reading-short-answer','academic',provisional.sourceRevisionRef,'durable-reading-otr');
  const sealed=source('academic',[{inventoryId:identity.id,kind:'reading-short-answer',schemaVersion:1}]),draft=drafted('reading-short-answer','academic',sealed.sourceRevisionRef,'durable-reading-otr'),verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)});
  const owner=createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory:async id=>id===verified.id?verified:null,readVerifiedSource:async ref=>ref.revisionId===sealed.sourceRevisionRef.revisionId?sealed:null}),question=await adaptIeltsReadingObjectiveTextItem(verified,sealed.sourceRevisionRef,{ownerAdapter:owner});
  await persistence.saveIeltsReadingSourceRevision(sealed);await persistence.saveIeltsObjectiveInventoryItem(draft);await persistence.saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:question});await persistence.reopenIeltsDatabase();
  const durable=await persistence.getIeltsObjectiveInventoryItem(verified.id);assert.equal(durable.questionPayload.slots[0].acceptedAnswers[0],'controlled answer');assert.equal(JSON.stringify(question).includes('controlled answer'),false);
});

test('Reading OTR keeps kernel scoring, exact slot order, and unavailable-owner semantics',async()=>{
  const provisional=source('academic'),item=drafted('reading-summary-completion','academic',provisional.sourceRevisionRef,'score-reading-otr'),sealed=source('academic',[{inventoryId:item.id,kind:'reading-summary-completion',schemaVersion:1}]),draft=drafted('reading-summary-completion','academic',sealed.sourceRevisionRef,'score-reading-otr'),verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)}),owner=createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory:async()=>verified,readVerifiedSource:async()=>sealed}),question=await adaptIeltsReadingObjectiveTextItem(verified,sealed.sourceRevisionRef,{ownerAdapter:owner});
  assert.equal((await scoreObjectiveTextResponseAsync(question,{slots:[{slotId:'slot-1',text:'controlled answer'}]})).disposition,'correct');
  const empty=await scoreObjectiveTextResponseAsync(question,{slots:[{slotId:'slot-1',text:''}]});assert.equal(empty.valid,true);assert.equal(empty.slots[0].reason,'EMPTY');
  const over=await scoreObjectiveTextResponseAsync(question,{slots:[{slotId:'slot-1',text:'one two three'}]});assert.equal(over.valid,true);assert.equal(over.slots[0].reason,'WORD_LIMIT_EXCEEDED');
  assert.equal((await scoreObjectiveTextResponseAsync(question,{slots:[{slotId:'unknown',text:'controlled answer'}]})).valid,false);
  const unavailable=createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory:async()=>{throw new Error('offline');},readVerifiedSource:async()=>sealed}),broken=await adaptIeltsReadingObjectiveTextItem(verified,sealed.sourceRevisionRef,{ownerAdapter:unavailable}).catch(error=>error);assert.equal(broken.code,'QUESTION_ACTIVITY_OWNER_UNAVAILABLE');
});

test('Reading OTR identity and binding fences reject unsafe or cross-kind authoring',()=>{
  assert.throws(()=>deriveIeltsObjectiveInventoryId({skill:'reading',profiles:['academic'],form:{id:'safe-form',revision:1},section:{id:'safe-section',revision:1,number:1},order:1,itemId:'safe-item',itemRevision:1,extra:true}),error=>error.code==='IELTS_INVENTORY_INVALID'||error instanceof TypeError);
  const hostile={skill:'reading',profiles:['academic'],form:{id:'safe-form',revision:1},section:{id:'safe-section',revision:1,number:1},order:1,itemId:'safe-item',itemRevision:1};Object.defineProperty(hostile,'skill',{enumerable:true,get(){throw new Error('getter');}});assert.throws(()=>deriveIeltsObjectiveInventoryId(hostile));
});

test('Reading source objective union rejects ambiguous and hostile OTR seals',()=>{
  const valid=source('academic',[{inventoryId:'choice-row',options:[{id:'a',text:'A',correct:true,rationale:'R'},{id:'b',text:'B',correct:false,rationale:'R'}]},{inventoryId:'otr-row',kind:'reading-note-completion',schemaVersion:1}]);assert.equal(valid.objectiveItems.length,2);
  assert.throws(()=>source('academic',[{inventoryId:'same-row',kind:'reading-note-completion',schemaVersion:1},{inventoryId:'same-row',options:[{id:'a',text:'A',correct:true,rationale:'R'},{id:'b',text:'B',correct:false,rationale:'R'}]}]));
  assert.throws(()=>source('academic',[{inventoryId:'bad-row',kind:'reading-note-completion',schemaVersion:1,options:[]}]));
  let reads=0;const hostile={inventoryId:'hostile-row',kind:'reading-note-completion',schemaVersion:1};Object.defineProperty(hostile,'kind',{enumerable:true,get(){reads+=1;return'reading-note-completion';}});assert.throws(()=>source('academic',[hostile]));assert.equal(reads,0);
});

test('Reading and ratified Listening OTR coverage is partial only for implemented controlled-local dimensions',()=>{
  const listeningKinds=['listening-form-completion','listening-note-completion','listening-table-completion','listening-flow-chart-completion','listening-summary-completion','listening-sentence-completion','listening-short-answer'],rows=getQuestionCoverageReport().kinds,reading=rows.filter(row=>KINDS.includes(row.kind)),listening=rows.filter(row=>listeningKinds.includes(row.kind));assert.equal(reading.length,6);assert.equal(listening.length,7);for(const row of reading){assert.equal(row.coverage,'PARTIAL');for(const key of ['uiInventory','inventory','profile','durability'])assert.equal(row.dimensions[key],'PARTIAL');}for(const row of listening){assert.equal(row.coverage,'PARTIAL');for(const key of ['uiInventory','inventory','profile','durability'])assert.equal(row.dimensions[key],'PARTIAL');assert.equal(row.dimensions.section,'GAP');assert.equal(row.dimensions.readiness,'GAP');assert.match(row.limitations,/controlled-local/i);assert.match(row.limitations,/non-human speech/i);assert.match(row.limitations,/full Listening/i);}
});

function otrActivity(question,id){
  const plan=composeTodayPlan({content:[{id,type:'reading',target:question.item.target,executor:'objective-text-response',estimatedSeconds:60}],now:90_000,minutes:5});
  return {...plan.activities[0],execution:{kind:'objective-text-response',status:'ready'},assistanceCollectionMode:qar.READING_ASSISTANCE_COLLECTION_MODE,launchBinding:`${id}:otr`,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
}

async function mutableReadingOtrHarness(id){
  const provisional=source('academic'),identity=drafted('reading-short-answer','academic',provisional.sourceRevisionRef,`${id}-item`),sealed=source('academic',[{inventoryId:identity.id,kind:'reading-short-answer',schemaVersion:1}]),draft=drafted('reading-short-answer','academic',sealed.sourceRevisionRef,`${id}-item`),verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)});
  let inventory=verified,readingSource=sealed,readInventory=async value=>value===verified.id?inventory:null,readSource=async()=>readingSource;
  const owner=createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory:(...args)=>readInventory(...args),readVerifiedSource:(...args)=>readSource(...args)});
  const question=await adaptIeltsReadingObjectiveTextItem(verified,sealed.sourceRevisionRef,{ownerAdapter:owner}),registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,question.requiredCapabilities);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter({readSource:async()=>readingSource})]});
  return {activity:otrActivity(question,id),inventory,question,registry,source:sealed,sourceRegistry,setInventory:value=>{inventory=value;},setSource:value=>{readingSource=value;},setInventoryReader:value=>{readInventory=value;},setSourceReader:value=>{readSource=value;}};
}

async function durableReadingOtrHarness(id){
  const sourceId=`wave4-otr-durable-${id}`,slots=[{id:'slot-1',label:'First answer',wordLimit:2,acceptedAnswers:['controlled answer']},{id:'slot-2',label:'Second answer',wordLimit:1,acceptedAnswers:['42']}],provisional=source('academic',[],sourceId),identity=drafted('reading-short-answer','academic',provisional.sourceRevisionRef,`${id}-item`,slots),sealed=source('academic',[{inventoryId:identity.id,kind:'reading-short-answer',schemaVersion:1}],sourceId),draft=drafted('reading-short-answer','academic',sealed.sourceRevisionRef,`${id}-item`,slots),verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)});
  const promotionOwner=createIeltsReadingObjectiveTextOwnerAdapter({readVerifiedInventory:async value=>value===verified.id?verified:null,readVerifiedSource:async reference=>reference.revisionId===sealed.sourceRevisionRef.revisionId?sealed:null}),promotionQuestion=await adaptIeltsReadingObjectiveTextItem(verified,sealed.sourceRevisionRef,{ownerAdapter:promotionOwner});
  await persistence.initializeIeltsPersistence();await persistence.saveIeltsReadingSourceRevision(sealed);await persistence.saveIeltsObjectiveInventoryItem(draft);await persistence.saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt),questionActivity:promotionQuestion});await persistence.reopenIeltsDatabase();
  const inventory=await persistence.getIeltsObjectiveInventoryItem(verified.id),owner=createDurableIeltsReadingObjectiveTextOwnerAdapter(),question=await adaptIeltsReadingObjectiveTextItem(inventory,sealed.sourceRevisionRef,{ownerAdapter:owner}),registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,question.requiredCapabilities);const sourceRegistry=createSourceRevisionRegistry({adapters:[createIeltsReadingSourceAdapter()]});
  return {inventory,question,registry,source:sealed,sourceRegistry};
}

test('Reading OTR refuses a source-body substitution before creating a Today Run',async()=>{
  const harness=await mutableReadingOtrHarness('reading-otr-source-body-substitution'),runId=`today-run:${harness.activity.activitySpec.id}`;
  harness.setSource({...harness.source,passage:'substituted'});
  await assert.rejects(qar.executeQuestionActivity({activity:harness.activity,question:harness.question,response:{slots:[{slotId:'slot-1',text:'controlled answer'}]},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:90_001}),error=>error.code==='QUESTION_ACTIVITY_OWNER_CHANGED');
  assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
});

test('Reading OTR executes durable exact inventory through one grouped multi-slot Today receipt without scheduling',async()=>{
  const harness=await durableReadingOtrHarness('direct-execution'),before={activities:await listV10Records(V10_STORES.activities,{sortBy:null}),events:await listReviewEvents(),state:getCurrentState()};
  const cases=[['correct',{slots:[{slotId:'slot-1',text:'controlled answer'},{slotId:'slot-2',text:'42'}]},'correct',2],['partial',{slots:[{slotId:'slot-1',text:'controlled answer'},{slotId:'slot-2',text:'wrong'}]},'partial',1],['wrong',{slots:[{slotId:'slot-1',text:''},{slotId:'slot-2',text:'one two'}]},'wrong',0]];
  for(const [suffix,response,disposition,numerator] of cases){const activity=otrActivity(harness.question,`reading-otr-direct-${suffix}`),result=await qar.executeQuestionActivity({activity,question:harness.question,response,sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:91_000+numerator}),attempt=result.run.envelope.attempt,receipt=result.run.envelope.receipt,meta=attempt.metadata.objectiveTextResponse;
    assert.deepEqual(result.run.activitySpec.target,harness.inventory.questionPayload.target);assert.equal(result.run.status,'completed');assert.equal(result.score.disposition,disposition);assert.equal(result.score.numerator,numerator);assert.equal(result.score.affectsSchedule,false);assert.equal(result.decision.eligible,false);assert.equal(result.run.evidenceDecision.affectsSchedule,false);assert.equal(receipt.id,attempt.receiptId);assert.equal(meta.slots.length,2);assert.deepEqual(meta.wordLimits,[{slotId:'slot-1',wordLimit:2},{slotId:'slot-2',wordLimit:1}]);assert.deepEqual(meta.totals,{numerator,denominator:2});assert.equal(meta.normalizer.id,'objective-text-response-normalizer-v1');assert.equal(meta.scorer.id,'objective-text-response-scorer-v1');assert.equal(meta.keyDigest,result.score.keyDigest);assert.deepEqual(meta,receipt.metadata.objectiveTextResponse);assert.deepEqual(attempt.metadata.questionResult,receipt.metadata.questionResult);assert.equal(JSON.stringify(harness.question).includes('controlled answer'),false);assert.equal(JSON.stringify({run:result.run,attempt,receipt}).includes('acceptedAnswers'),false);
  }
  assert.deepEqual(await listV10Records(V10_STORES.activities,{sortBy:null}),before.activities);assert.deepEqual(await listReviewEvents(),before.events);assert.deepEqual(getCurrentState().cards,before.state.cards);assert.deepEqual(getCurrentState().fsrsConfig,before.state.fsrsConfig);
});

async function assertNoReadingOtrRun(harness,code,now){
  const runId=`today-run:${harness.activity.activitySpec.id}`;assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
  await assert.rejects(qar.executeQuestionActivity({activity:harness.activity,question:harness.question,response:{slots:[{slotId:'slot-1',text:'controlled answer'}]},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now}),error=>{if(error.code!==code)throw new Error(`Expected ${code}, got ${error.code} for ${harness.activity.activitySpec.id}`);return true;});
  assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
}

test('Reading OTR rechecks authentic owners before Run and rejects unavailable, lifecycle, binding, source, and accessor substitutions with zero mutation',async()=>{
  const cases=[
    ['missing-inventory',harness=>harness.setInventory(null),'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'],
    ['retired-inventory',harness=>harness.setInventory({...harness.inventory,status:'retired'}),'QUESTION_ACTIVITY_OWNER_CHANGED'],
    ['rebound-private-payload',harness=>harness.setInventory({...harness.inventory,questionPayload:{...harness.inventory.questionPayload,prompt:'rebound'}}),'QUESTION_ACTIVITY_OWNER_CHANGED'],
    ['missing-source',harness=>harness.setSource(null),'QUESTION_ACTIVITY_OWNER_UNAVAILABLE'],
    ['source-body',harness=>harness.setSource({...harness.source,passage:'substituted passage'}),'QUESTION_ACTIVITY_OWNER_CHANGED'],
    ['source-revision',harness=>harness.setSource({...harness.source,revision:2}),'QUESTION_ACTIVITY_OWNER_CHANGED'],
    ['source-integrity',harness=>harness.setSource({...harness.source,sourceRevisionRef:{...harness.source.sourceRevisionRef,integrity:`sha256:${'b'.repeat(64)}`}}),'QUESTION_ACTIVITY_OWNER_CHANGED'],
    ['source-seal',harness=>harness.setSource({...harness.source,objectiveItems:[{...harness.source.objectiveItems[0],kind:'reading-note-completion'}]}),'QUESTION_ACTIVITY_OWNER_CHANGED']
  ];
  for(const [id,mutate,code] of cases){const harness=await mutableReadingOtrHarness(`reading-otr-pre-run-${id}`);mutate(harness);await assertNoReadingOtrRun(harness,code,92_000);}
  const inventoryAccessor=await mutableReadingOtrHarness('reading-otr-pre-run-inventory-accessor'),unsafeInventory={...inventoryAccessor.inventory};let inventoryGetterReads=0;Object.defineProperty(unsafeInventory,'questionPayload',{enumerable:true,get(){inventoryGetterReads+=1;throw new Error('must not read');}});inventoryAccessor.setInventory(unsafeInventory);await assertNoReadingOtrRun(inventoryAccessor,'QUESTION_ACTIVITY_OWNER_CHANGED',92_100);assert.equal(inventoryGetterReads,0);
  const sourceAccessor=await mutableReadingOtrHarness('reading-otr-pre-run-source-accessor'),unsafeSource={...sourceAccessor.source};let sourceGetterReads=0;Object.defineProperty(unsafeSource,'passage',{enumerable:true,get(){sourceGetterReads+=1;throw new Error('must not read');}});sourceAccessor.setSource(unsafeSource);await assertNoReadingOtrRun(sourceAccessor,'QUESTION_ACTIVITY_OWNER_CHANGED',92_101);assert.equal(sourceGetterReads,0);
  const unavailableInventory=await mutableReadingOtrHarness('reading-otr-pre-run-unavailable-inventory');unavailableInventory.setInventoryReader(async()=>{throw new Error('offline');});await assertNoReadingOtrRun(unavailableInventory,'QUESTION_ACTIVITY_OWNER_UNAVAILABLE',92_102);
  const unavailableSource=await mutableReadingOtrHarness('reading-otr-pre-run-unavailable-source');unavailableSource.setSourceReader(async()=>{throw new Error('offline');});await assertNoReadingOtrRun(unavailableSource,'QUESTION_ACTIVITY_OWNER_UNAVAILABLE',92_103);
});

test('Reading OTR exact replay is idempotent and terminal learner output, OTR metadata, and result binding tampering fail closed',async()=>{
  const harness=await durableReadingOtrHarness('terminal-replay'),activity=otrActivity(harness.question,'reading-otr-terminal-replay'),response={slots:[{slotId:'slot-1',text:'controlled answer'},{slotId:'slot-2',text:'42'}]},beforeEvents=await listReviewEvents(),first=await qar.executeQuestionActivity({activity,question:harness.question,response,sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:93_000}),replay=await qar.executeQuestionActivity({activity,question:harness.question,response,sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:93_001}),stored=await getV10Record(V10_STORES.todayRuns,first.run.id);
  assert.equal(replay.run.id,first.run.id);assert.equal(replay.run.envelope.attempt.id,first.run.envelope.attempt.id);assert.equal(replay.run.envelope.receipt.id,first.run.envelope.receipt.id);
  await assert.rejects(qar.executeQuestionActivity({activity,question:harness.question,response:{slots:[{slotId:'slot-1',text:'changed'},{slotId:'slot-2',text:'42'}]},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:93_002}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  const mutations=[row=>{row.envelope.attempt.learnerOutput='{"slots":[]}';},row=>{row.envelope.attempt.metadata.objectiveTextResponse.totals={numerator:0,denominator:2};},row=>{row.envelope.receipt.metadata.objectiveTextResponse.keyDigest='substituted';},row=>{row.envelope.attempt.metadata.questionResult.keyDigest='substituted';}];
  for(const mutate of mutations){const tampered=structuredClone(stored);mutate(tampered);await putV10Record(V10_STORES.todayRuns,tampered,'reading-otr-terminal-tamper');const persisted=await getV10Record(V10_STORES.todayRuns,stored.id);await assert.rejects(qar.executeQuestionActivity({activity,question:harness.question,response,sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:93_003}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');assert.deepEqual(await getV10Record(V10_STORES.todayRuns,stored.id),persisted);await putV10Record(V10_STORES.todayRuns,stored,'reading-otr-terminal-restore');}
  assert.deepEqual(await listReviewEvents(),beforeEvents);
});

test('Reading OTR combined backup restores exact durable owner and terminal receipt after deletion without publishing private answer keys',async()=>{
  const harness=await durableReadingOtrHarness('combined-backup'),activity=otrActivity(harness.question,'reading-otr-combined-backup'),response={slots:[{slotId:'slot-1',text:''},{slotId:'slot-2',text:'no'}]},first=await qar.executeQuestionActivity({activity,question:harness.question,response,sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:94_000}),backup=await buildCombinedBackup(),ielts=backup.domains.ielts.stores,ownerRow=ielts.objectiveInventory.find(row=>row.id===harness.inventory.id),runRow=backup.domains.v10.stores.todayRuns.find(row=>row.id===first.run.id);
  assert.ok(ownerRow);assert.ok(runRow);assert.equal(JSON.stringify(ownerRow).includes('controlled answer'),true);assert.equal(JSON.stringify(ielts.readingPassages).includes('controlled answer'),false);assert.equal(JSON.stringify(runRow).includes('controlled answer'),false);assert.equal(JSON.stringify({question:harness.question,run:first.run}).includes('acceptedAnswers'),false);
  const tampered=structuredClone(backup),tamperedOwner=tampered.domains.ielts.stores.objectiveInventory.find(row=>row.id===harness.inventory.id);tamperedOwner.questionPayload.prompt='tampered private inventory binding';const beforeRejectedRestore=await buildCombinedBackup();await assert.rejects(restoreCombinedBackup(tampered),error=>error.code==='BACKUP_INVALID');assert.equal((await buildCombinedBackup()).payloadDigest,beforeRejectedRestore.payloadDigest);
  await persistence.__testing.deleteOne(IELTS_STORE_NAMES.readingPassages,harness.source.id);await persistence.__testing.deleteOne(IELTS_STORE_NAMES.objectiveInventory,harness.inventory.id);await deleteV10Record(V10_STORES.todayRuns,first.run.id,'reading-otr-backup-delete');await persistence.reopenIeltsDatabase();await reopenV10Database();assert.equal(await persistence.getIeltsReadingSourceRevision(harness.source.id),null);assert.equal(await persistence.getIeltsObjectiveInventoryItem(harness.inventory.id),null);assert.equal(await getV10Record(V10_STORES.todayRuns,first.run.id),undefined);
  await restoreCombinedBackup(backup);await persistence.reopenIeltsDatabase();await reopenV10Database();assert.deepEqual(await persistence.getIeltsReadingSourceRevision(harness.source.id),harness.source);assert.deepEqual(await persistence.getIeltsObjectiveInventoryItem(harness.inventory.id),harness.inventory);assert.deepEqual(await getV10Record(V10_STORES.todayRuns,first.run.id),first.run);
  const replay=await qar.executeQuestionActivity({activity,question:harness.question,response,sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:94_001});assert.equal(replay.run.envelope.receipt.id,first.run.envelope.receipt.id);
});
