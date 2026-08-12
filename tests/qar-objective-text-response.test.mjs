import assert from 'node:assert/strict';
import test from 'node:test';
import * as otr from '../src/objective-text-response.js';
import * as qar from '../src/question-activity-contracts.js';
import { learningContractDigest } from '../src/learning-contracts.js';
import { createSourceRevisionRef } from '../src/source-revision-ref.js';
import { createCoreCardSourceAdapter,createSourceRevisionRegistry,createTranscriptSourceAdapter } from '../src/source-revision-ref.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { deleteV10Record,getV10Record,listV10Records,putV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { getCurrentState,listReviewEvents } from '../src/persistence.js';
import { IDBFactory } from 'fake-indexeddb';
globalThis.indexedDB=new IDBFactory();

const source=createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'test-source',authority:'test-source',sourceId:'source:objective',revisionId:'rev-1',integrity:'sha256:test',locator:{},provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'},tombstone:null,extensions:{},display:null});
const target=Object.freeze({schemaVersion:2,targetType:'ielts-objective-item',targetId:`ielts-objective:${'a'.repeat(64)}`,cardId:null,senseId:null,skill:'reading',sourceId:source.sourceId,sourceRevision:source.revisionId});
const definition=Object.freeze({id:'objective-1',kind:'reading-sentence-completion',prompt:'Complete the sentence.',slots:[{id:'one',label:'First blank',wordLimit:2,acceptedAnswers:['Café noir','blue-green']},{id:'two',label:'Second blank',wordLimit:1,acceptedAnswers:['42','can’t']}],target,sourceRevisionRef:source,createdAt:1,updatedAt:2});
const ownerFor=value=>otr.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:id=>id===value.id?structuredClone(value):null});

test('normalizes exact NFC Unicode whitespace and lower-case without widening equivalence',()=>{
  assert.equal(otr.normalizeObjectiveTextResponse('  Cafe\u0301\u2003NOIR  '),'café noir');
  assert.equal(otr.normalizeObjectiveTextResponse('Blue-Green'),'blue-green');
  assert.equal(otr.normalizeObjectiveTextResponse("CAN’T"),'can’t');
  assert.equal(otr.countObjectiveTextWords('... café -- 42'),2);
  assert.notEqual(otr.normalizeObjectiveTextResponse('café!'),otr.normalizeObjectiveTextResponse('café'));
  assert.notEqual(otr.normalizeObjectiveTextResponse('blue green'),otr.normalizeObjectiveTextResponse('blue-green'));
});

test('validates sealed owner definitions, rejects duplicate or over-limit keys and never projects answers',()=>{
  const question=otr.createObjectiveTextResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});
  assert.equal(question.registryRevision,'qar-objective-text-response-registry-v1');
  assert.equal(question.normalizer.id,'objective-text-response-normalizer-v1');
  assert.equal(question.scorer.id,'objective-text-response-scorer-v1');
  assert.equal(JSON.stringify(question).includes('Café noir'),false);
  assert.throws(()=>otr.createObjectiveTextResponseQuestion({...definition,slots:[{...definition.slots[0],acceptedAnswers:['one two three']},definition.slots[1]]},{ownerAdapter:ownerFor({...definition,slots:[{...definition.slots[0],acceptedAnswers:['one two three']},definition.slots[1]]})}),e=>e.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const dup={...definition,slots:[{...definition.slots[0],acceptedAnswers:['Cafe\u0301','café']},definition.slots[1]]};
  assert.throws(()=>otr.createObjectiveTextResponseQuestion(dup,{ownerAdapter:ownerFor(dup)}),e=>e.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
});

test('non-spatial text question key digest remains byte-compatible',()=>{
  const question=otr.createObjectiveTextResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});
  const expected=learningContractDigest({slots:definition.slots.map(row=>({id:row.id,wordLimit:row.wordLimit,acceptedAnswers:row.acceptedAnswers.map(otr.normalizeObjectiveTextResponse)})),normalizer:otr.OBJECTIVE_TEXT_RESPONSE_NORMALIZER,scorer:otr.OBJECTIVE_TEXT_RESPONSE_SCORER,reviewPolicyRevision:otr.OBJECTIVE_TEXT_RESPONSE_REVIEW_POLICY,prompt:definition.prompt,target:definition.target,sourceRevisionRef:definition.sourceRevisionRef});
  assert.equal(question.keyDigest,expected);
});

test('requires exact raw slot order and returns deterministic per-slot objective scoring',()=>{
  const question=otr.createObjectiveTextResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});
  const correct=otr.scoreObjectiveTextResponse(question,{slots:[{slotId:'one',text:' cafe\u0301 noir '},{slotId:'two',text:'42'}]});
  assert.deepEqual(correct.normalizedResponse,{slots:[{slotId:'one',value:'café noir',wordCount:2},{slotId:'two',value:'42',wordCount:1}]});
  assert.equal(correct.disposition,'correct'); assert.equal(correct.numerator,2); assert.equal(correct.denominator,2);
  const partial=otr.scoreObjectiveTextResponse(question,{slots:[{slotId:'one',text:''},{slotId:'two',text:'too many'}]});
  assert.equal(partial.disposition,'wrong'); assert.deepEqual(partial.slots.map(row=>row.reason),['EMPTY','WORD_LIMIT_EXCEEDED']);
  const mixed=otr.scoreObjectiveTextResponse(question,{slots:[{slotId:'one',text:'café noir'},{slotId:'two',text:'no'}]});
  assert.equal(mixed.disposition,'partial');
  assert.throws(()=>otr.normalizeObjectiveTextResponseSubmission(question,{slots:[{slotId:'two',text:'42'},{slotId:'one',text:'café noir'}]}),e=>e.code==='QUESTION_ACTIVITY_RESPONSE_INVALID');
  assert.throws(()=>otr.normalizeObjectiveTextResponseSubmission(question,{slots:[{slotId:'one',text:'café noir',extra:true},{slotId:'two',text:'42'}]}),e=>e.code==='QUESTION_ACTIVITY_RESPONSE_INVALID');
});

test('brands adapters and re-reads owner state before scoring',()=>{
  let current=structuredClone(definition); const owner=otr.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>current});
  const question=otr.createObjectiveTextResponseQuestion(definition,{ownerAdapter:owner});
  assert.throws(()=>otr.createObjectiveTextResponseQuestion(definition,{ownerAdapter:{readVerifiedQuestion:()=>definition}}),e=>e.code==='QUESTION_ACTIVITY_OWNER_UNAVAILABLE');
  current={...current,prompt:'changed'};
  assert.throws(()=>otr.assertObjectiveTextResponseOwnerCurrent(question),e=>e.code==='QUESTION_ACTIVITY_OWNER_CHANGED');
});

test('declares all fourteen kinds and exact capability sets as partial coverage',()=>{
  assert.equal(otr.OBJECTIVE_TEXT_RESPONSE_KINDS.length,14);
  for(const kind of otr.OBJECTIVE_TEXT_RESPONSE_KINDS){const entry=otr.objectiveTextResponseRegistryEntry(kind);assert.equal(entry.coverage,'PARTIAL');assert.deepEqual(entry.capabilities,kind.startsWith('listening-')?['audio-playback','text-entry','keyboard','focus','screen-reader']:['text-entry','keyboard','focus','screen-reader']);}
});

test('registers objective text questions through the shared QAR registry without changing choice contracts',()=>{
  const question=qar.createObjectiveTextResponseQuestion(definition,{ownerAdapter:qar.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>structuredClone(definition)})});
  assert.equal(qar.validateQuestionActivity(question).valid,true);
  const registry=qar.createQuestionRegistry(); registry.registerExecutor(question.kind,question.version,['text-entry','keyboard','focus','screen-reader']);
  assert.equal(registry.supports(question),true); assert.equal(registry.hasExecutor(question),true);
  assert.equal(qar.scoreQuestionActivity(question,{slots:[{slotId:'one',text:'café noir'},{slotId:'two',text:'42'}]}).disposition,'correct');
  assert.equal(qar.getQuestionCoverageReport().kinds.filter(row=>otr.OBJECTIVE_TEXT_RESPONSE_KINDS.includes(row.kind)).every(row=>row.coverage==='PARTIAL'),true);
});

test('fails closed for private source data, symbols and async owner drift',async()=>{
  const privateRef={...source,locator:{absolutePath:'C:\\private\\secret.txt'}}; const unsafe={...definition,sourceRevisionRef:privateRef};
  assert.throws(()=>otr.createObjectiveTextResponseQuestion(unsafe,{ownerAdapter:ownerFor(unsafe)}),e=>e.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const symbolic={...definition};Object.defineProperty(symbolic,Symbol('hidden'),{value:'x'});assert.throws(()=>otr.createObjectiveTextResponseQuestion(symbolic,{ownerAdapter:ownerFor(symbolic)}),e=>e.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  let current=structuredClone(definition);const asyncOwner=otr.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:async()=>current});const question=await otr.createObjectiveTextResponseQuestionAsync(definition,{ownerAdapter:asyncOwner});current={...current,prompt:'changed'};await assert.rejects(otr.assertObjectiveTextResponseOwnerCurrentAsync(question),e=>e.code==='QUESTION_ACTIVITY_OWNER_CHANGED');
});

test('executes one canonical grouped Listening response with durable safe scoring metadata and default-deny evidence',async()=>{
  const aggregate=createTranscriptAggregate({source:{id:'otr-source',status:'verified',complete:true},segments:[{startMs:0,endMs:1000,text:'safe',status:'verified',aligned:true}],provenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'},createdAt:1}),adapter=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>aggregate}),ref=adapter.createRef(aggregate),target={schemaVersion:2,targetType:'ielts-objective-item',targetId:`ielts-objective:${'b'.repeat(64)}`,cardId:null,senseId:null,skill:'listening',sourceId:ref.sourceId,sourceRevision:ref.revisionId},def={...definition,id:target.targetId,kind:'listening-short-answer',target,sourceRevisionRef:ref};let current=structuredClone(def);const question=qar.createObjectiveTextResponseQuestion(def,{ownerAdapter:qar.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>current})}),score=qar.scoreQuestionActivity(question,{slots:[{slotId:'one',text:'café noir'},{slotId:'two',text:'42'}]}),plan=composeTodayPlan({dueReviews:[{id:'otr-exec',type:'listening',target,executor:'otr',estimatedSeconds:60}],now:120000,minutes:5}),activity={...plan.activities[0],execution:{kind:'otr',status:'ready'},launchBinding:'objective-text-response',assistanceCollectionMode:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}},registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,1,['audio-playback','text-entry','keyboard','focus','screen-reader']);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]}),payload={slots:[{slotId:'one',text:'café noir'},{slotId:'two',text:'42'}]},result=await qar.executeQuestionActivity({activity,question,response:payload,sourceRegistry,questionRegistry:registry,now:120001});assert.equal(result.score.affectsSchedule,false);assert.equal(result.run.envelope.attempt.metadata.objectiveTextResponse.wordLimits[0].wordLimit,2);assert.equal(JSON.stringify(result.run).includes('Café noir'),false);assert.equal(result.run.evidenceDecision.eligible,false);const replay=await qar.executeQuestionActivity({activity,question,response:payload,sourceRegistry,questionRegistry:registry,now:120002});assert.equal(replay.run.receiptId,result.run.receiptId);await assert.rejects(qar.executeQuestionActivity({activity,question,response:{slots:[{slotId:'one',text:'blue-green'},{slotId:'two',text:'42'}]},sourceRegistry,questionRegistry:registry,now:120003}),e=>e.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
});

test('scores every objective disposition and rejects hostile response/resource shapes before execution',()=>{
  const question=otr.createObjectiveTextResponseQuestion(definition,{ownerAdapter:ownerFor(definition)});
  const wrong=otr.scoreObjectiveTextResponse(question,{slots:[{slotId:'one',text:''},{slotId:'two',text:'many words'}]});assert.equal(wrong.disposition,'wrong');assert.deepEqual(wrong.slots.map(x=>x.reason),['EMPTY','WORD_LIMIT_EXCEEDED']);
  const partial=otr.scoreObjectiveTextResponse(question,{slots:[{slotId:'one',text:'café noir'},{slotId:'two',text:'no'}]});assert.equal(partial.disposition,'partial');assert.equal(partial.slots[1].reason,'MISMATCH');assert.equal(partial.slots[0].wordLimit,2);assert.equal(partial.normalizer.version,1);assert.equal(partial.scorer.version,1);
  for(const response of [{slots:[{slotId:'one',text:'x'},{slotId:'two',text:'y'},{slotId:'three',text:'z'}]},{slots:[{slotId:'one',text:'x'},{slotId:'one',text:'y'}]},{slots:[{slotId:'one',text:'x'.repeat(10001)},{slotId:'two',text:'y'}]}])assert.equal(otr.scoreObjectiveTextResponse(question,response).valid,false);
  const safe={...definition,sourceRevisionRef:{...source,locator:{tokenizer:'safe',tokenizationModel:'safe',secretaryNote:'safe',empathy:'safe',pathology:'safe'}}};assert.doesNotThrow(()=>otr.createObjectiveTextResponseQuestion(safe,{ownerAdapter:ownerFor(safe)}));
});

function objectiveExecutionHarness({kind='reading-short-answer',asyncOwner=false,id='otr-controlled'}={}){
  const aggregate=createTranscriptAggregate({source:{id:`${id}:source`,status:'verified',complete:true},segments:[{startMs:0,endMs:1000,text:'controlled public source marker',status:'verified',aligned:true}],provenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'},createdAt:1});
  const adapter=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>aggregate}),ref=adapter.createRef(aggregate),skill=kind.startsWith('listening-')?'listening':'reading',itemId=`ielts-objective:${(kind.startsWith('listening-')?'b':'a').repeat(64)}`;
  let current={...definition,id:itemId,kind,target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:itemId,cardId:null,senseId:null,skill,sourceId:ref.sourceId,sourceRevision:ref.revisionId},sourceRevisionRef:ref};
  let reads=0;const owner=qar.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:asyncOwner?async value=>{reads+=1;return value===itemId?structuredClone(current):null;}:value=>{reads+=1;return value===itemId?structuredClone(current):null;}});
  const create=asyncOwner?qar.createObjectiveTextResponseQuestionAsync:async (value,options)=>qar.createObjectiveTextResponseQuestion(value,options);
  const questionPromise=create(current,{ownerAdapter:owner});
  return {adapter,ref,owner,get current(){return current;},setCurrent:value=>{current=value;},get reads(){return reads;},questionPromise,kind,skill,id};
}
function objectiveActivity(question,{id='otr-activity'}={}){
  const plan=composeTodayPlan({dueReviews:[{id,type:question.kind,target:question.item.target,executor:'objective-text-response',estimatedSeconds:60}],now:200_000,minutes:5});
  return {...plan.activities[0],execution:{kind:'objective-text-response',status:'ready'},launchBinding:'objective-text-response',assistanceCollectionMode:question.kind.startsWith('listening-')?qar.LISTENING_ASSISTANCE_COLLECTION_MODE:qar.READING_ASSISTANCE_COLLECTION_MODE,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}};
}
function objectiveRegistry(question){const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,question.requiredCapabilities);return registry;}
const objectivePayload=Object.freeze({slots:[{slotId:'one',text:' caf\u0065\u0301 noir '},{slotId:'two',text:'42'}]});
async function noObjectiveTodayRow(activity,operation,code=null){await assert.rejects(operation,error=>!code||error.code===code);assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id===`today-run:${activity.activitySpec.id}`),false);}
async function controlledEffects(){const state=getCurrentState();return{reviewEvents:await listReviewEvents(),cards:state.cards,fsrsConfig:state.fsrsConfig,activities:await listV10Records(V10_STORES.activities,{sortBy:null})};}

test('QAR OTR controlled Reading execution persists one grouped, sealed, default-deny terminal result',async()=>{
  const before=await controlledEffects(),harness=objectiveExecutionHarness({kind:'reading-short-answer',id:'otr-reading-control'}),question=await harness.questionPromise,activity=objectiveActivity(question,{id:'otr-reading-control'}),registry=objectiveRegistry(question),sourceRegistry=createSourceRevisionRegistry({adapters:[harness.adapter]});
  const result=await qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:200_001});
  assert.equal(result.score.affectsSchedule,false);assert.equal(result.decision.eligible,false);assert.equal(result.run.status,'completed');
  const attempt=result.run.envelope.attempt,receipt=result.run.envelope.receipt,meta=attempt.metadata.objectiveTextResponse;
  assert.equal(attempt.learnerOutput,JSON.stringify(objectivePayload));assert.deepEqual(attempt.metadata.questionResult,receipt.metadata.questionResult);assert.deepEqual(meta,receipt.metadata.objectiveTextResponse);
  assert.deepEqual(meta.normalizedResponse,{slots:[{slotId:'one',value:'caf\u00e9 noir',wordCount:2},{slotId:'two',value:'42',wordCount:1}]});assert.deepEqual(meta.totals,{numerator:2,denominator:2});assert.equal(meta.normalizer.id,otr.OBJECTIVE_TEXT_RESPONSE_NORMALIZER.id);assert.equal(meta.scorer.id,otr.OBJECTIVE_TEXT_RESPONSE_SCORER.id);assert.equal(meta.keyDigest,result.score.keyDigest);
  const serial=JSON.stringify(result.run);for(const leak of ['Caf\u00e9 noir','blue-green','controlled public source marker','acceptedAnswers'])assert.equal(serial.includes(leak),false,leak);
  assert.deepEqual(await controlledEffects(),before);
});

test('QAR OTR async owner execution does not sync-reread and terminal replay compares raw response plus complete metadata',async()=>{
  const before=await controlledEffects(),harness=objectiveExecutionHarness({kind:'listening-short-answer',asyncOwner:true,id:'otr-async-control'}),question=await harness.questionPromise,activity=objectiveActivity(question,{id:'otr-async-control'}),registry=objectiveRegistry(question),sourceRegistry=createSourceRevisionRegistry({adapters:[harness.adapter]});
  const first=await qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:201_001});assert.equal(harness.reads,2);
  const duplicate=await qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:201_002});assert.equal(duplicate.run.receiptId,first.run.receiptId);assert.equal(harness.reads,3);
  const stored=await getV10Record(V10_STORES.todayRuns,first.run.id);
  await assert.rejects(qar.executeQuestionActivity({activity,question,response:{slots:[{slotId:'one',text:'blue-green'},{slotId:'two',text:'42'}]},sourceRegistry,questionRegistry:registry,now:201_003}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  assert.equal(JSON.stringify(await getV10Record(V10_STORES.todayRuns,first.run.id)),JSON.stringify(stored));
  const mutations=[row=>{delete row.envelope.receipt.metadata.objectiveTextResponse.normalizedResponse;},row=>{row.envelope.attempt.learnerOutput='{"slots":[]}';},row=>{row.envelope.attempt.metadata.questionResult.keyDigest='substituted';},row=>{row.envelope.receipt.metadata.objectiveTextResponse.totals={numerator:0,denominator:2};},row=>{row.envelope.attempt.id='substituted-attempt';},row=>{row.envelope.receipt.status='failed';}];
  for(const mutate of mutations){const injected=structuredClone(stored);mutate(injected);await putV10Record(V10_STORES.todayRuns,injected,'otr-test-terminal-tamper');const persisted=await getV10Record(V10_STORES.todayRuns,stored.id);await assert.rejects(qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:201_004}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');assert.deepEqual(await getV10Record(V10_STORES.todayRuns,stored.id),persisted);await putV10Record(V10_STORES.todayRuns,stored,'otr-test-terminal-restore');}
  assert.deepEqual(await controlledEffects(),before);
});

test('QAR OTR preflight rejects malformed raw responses and changed async owner before Today mutation',async()=>{
  const harness=objectiveExecutionHarness({kind:'reading-short-answer',asyncOwner:true,id:'otr-preflight'}),question=await harness.questionPromise,registry=objectiveRegistry(question),sourceRegistry=createSourceRevisionRegistry({adapters:[harness.adapter]});
  for(const [suffix,response] of [['reordered',{slots:[{slotId:'two',text:'42'},{slotId:'one',text:'cafÃ© noir'}]}],['duplicate',{slots:[{slotId:'one',text:'x'},{slotId:'one',text:'y'}]}],['unknown',{slots:[{slotId:'one',text:'x'},{slotId:'unknown',text:'y'}]}],['oversized',{slots:[{slotId:'one',text:'x'.repeat(10_001)},{slotId:'two',text:'y'}]}]]){const activity=objectiveActivity(question,{id:`otr-preflight-${suffix}`});await noObjectiveTodayRow(activity,()=>qar.executeQuestionActivity({activity,question,response,sourceRegistry,questionRegistry:registry,now:202_001}));}
  const changedActivity=objectiveActivity(question,{id:'otr-preflight-owner'});harness.setCurrent({...harness.current,prompt:'changed owner'});await noObjectiveTodayRow(changedActivity,()=>qar.executeQuestionActivity({activity:changedActivity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:202_002}));
});

test('QAR OTR preserves typed async owner missing, changed, and rejected failures before Today mutation',async()=>{
  for(const [suffix,next,code] of [['changed',current=>({...current,prompt:'changed'}),'QUESTION_ACTIVITY_OWNER_CHANGED'],['missing',()=>null,'QUESTION_ACTIVITY_OWNER_CHANGED'],['rejected',()=>Symbol('uncloneable'),'QUESTION_ACTIVITY_OWNER_UNAVAILABLE']]){const harness=objectiveExecutionHarness({kind:'reading-short-answer',asyncOwner:true,id:`otr-owner-${suffix}`}),question=await harness.questionPromise,activity=objectiveActivity(question,{id:`otr-owner-${suffix}`}),registry=objectiveRegistry(question),sourceRegistry=createSourceRevisionRegistry({adapters:[harness.adapter]});harness.setCurrent(next(harness.current));await noObjectiveTodayRow(activity,()=>qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:202_100}),code);}
});

test('QAR OTR terminal data survives combined backup restore without answer-key or source-body leakage',async()=>{
  const harness=objectiveExecutionHarness({kind:'listening-short-answer',asyncOwner:true,id:'otr-backup'}),question=await harness.questionPromise,activity=objectiveActivity(question,{id:'otr-backup'}),registry=objectiveRegistry(question),sourceRegistry=createSourceRevisionRegistry({adapters:[harness.adapter]});
  const first=await qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:203_001}),backup=await buildCombinedBackup(),backupRow=backup.domains.v10.stores.todayRuns.find(row=>row.id===first.run.id);
  assert.ok(backupRow);assert.deepEqual(backupRow.envelope.attempt.metadata.objectiveTextResponse,first.run.envelope.attempt.metadata.objectiveTextResponse);const payload=JSON.stringify(backup);for(const leak of ['Caf\u00e9 noir','blue-green','controlled public source marker','acceptedAnswers'])assert.equal(payload.includes(leak),false,leak);
  await deleteV10Record(V10_STORES.todayRuns,first.run.id,'otr-test-backup-mutation');await reopenV10Database();assert.equal(await getV10Record(V10_STORES.todayRuns,first.run.id),undefined);
  await restoreCombinedBackup(backup);await reopenV10Database();const reopened=await getV10Record(V10_STORES.todayRuns,first.run.id);assert.deepEqual(reopened,first.run);
  const replay=await qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry,questionRegistry:registry,now:203_002});assert.equal(replay.run.receiptId,first.run.receiptId);
});

test('QAR OTR rejects normalized secret families, accessors, cycles, symbols, unsafe prototypes and nonfinite definitions without reads',()=>{
  const dangerous=['api_secret','access-token','client secret','authorization header','credential value','password hash','bearer token','private path','absolute path','file path','source body','source text','source content'];
  for(const key of dangerous){assert.equal(otr.__testing.data({[key]:'never'}),false,key);const unsafe=structuredClone(definition);unsafe.sourceRevisionRef={...unsafe.sourceRevisionRef,extensions:{[key]:'never'}};assert.throws(()=>otr.createObjectiveTextResponseQuestion(unsafe,{ownerAdapter:ownerFor(unsafe)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID',key);}
  let getterReads=0;const getter=structuredClone(definition);Object.defineProperty(getter,'prompt',{enumerable:true,get(){getterReads+=1;throw new Error('must not read');}});assert.throws(()=>otr.createObjectiveTextResponseQuestion(getter,{ownerAdapter:ownerFor(definition)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');assert.equal(getterReads,0);
  const cyclic=structuredClone(definition);cyclic.extensions={};cyclic.extensions.self=cyclic.extensions;assert.throws(()=>otr.createObjectiveTextResponseQuestion(cyclic,{ownerAdapter:ownerFor(cyclic)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const symbolic=structuredClone(definition);Object.defineProperty(symbolic,Symbol('unsafe'),{value:'x'});assert.throws(()=>otr.createObjectiveTextResponseQuestion(symbolic,{ownerAdapter:ownerFor(symbolic)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const proto=Object.assign(Object.create({unsafe:true}),structuredClone(definition));assert.throws(()=>otr.createObjectiveTextResponseQuestion(proto,{ownerAdapter:ownerFor(proto)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const nonfinite=structuredClone(definition);nonfinite.createdAt=Infinity;assert.throws(()=>otr.createObjectiveTextResponseQuestion(nonfinite,{ownerAdapter:ownerFor(nonfinite)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const oversized=structuredClone(definition);oversized.prompt='x'.repeat(81_000);assert.throws(()=>otr.createObjectiveTextResponseQuestion(oversized,{ownerAdapter:ownerFor(oversized)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const future=structuredClone(definition);future.sourceRevisionRef={...future.sourceRevisionRef,version:2,futureSafe:'preserve'};assert.throws(()=>otr.createObjectiveTextResponseQuestion(future,{ownerAdapter:ownerFor(future)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
  const nestedCycle=structuredClone(definition);nestedCycle.sourceRevisionRef.extensions.nested={};nestedCycle.sourceRevisionRef.extensions.nested.self=nestedCycle.sourceRevisionRef.extensions.nested;assert.throws(()=>otr.createObjectiveTextResponseQuestion(nestedCycle,{ownerAdapter:ownerFor(nestedCycle)}),error=>error.code==='QUESTION_ACTIVITY_TEXT_DEFINITION_INVALID');
});

test('QAR OTR preflight fences source, frozen binding, registry and capability failures with zero Today writes',async()=>{
  const harness=objectiveExecutionHarness({kind:'reading-short-answer',asyncOwner:true,id:'otr-fences'}),question=await harness.questionPromise,sourceRegistry=createSourceRevisionRegistry({adapters:[harness.adapter]}),registry=objectiveRegistry(question);
  const cases=[
    ['source-mismatch',{activitySpec:{...objectiveActivity(question,{id:'x'}).activitySpec,target:{...question.item.target,sourceRevision:'wrong'}}},registry,sourceRegistry],
    ['frozen',{evaluationBinding:{...objectiveActivity(question,{id:'x'}).evaluationBinding,keyDigest:'wrong'}},registry,sourceRegistry],
    ['registry',{},null,sourceRegistry],
    ['source-unavailable',{},registry,createSourceRevisionRegistry({adapters:[]})]
  ];
  for(const [suffix,patch,caseRegistry,caseSourceRegistry] of cases){const activity={...objectiveActivity(question,{id:`otr-fences-${suffix}`}),...patch};await noObjectiveTodayRow(activity,()=>qar.executeQuestionActivity({activity,question,response:objectivePayload,sourceRegistry:caseSourceRegistry,questionRegistry:caseRegistry,now:204_001}));}
  const unregistered=qar.createQuestionRegistry(),unregisteredActivity=objectiveActivity(question,{id:'otr-fences-unregistered'});await noObjectiveTodayRow(unregisteredActivity,()=>qar.executeQuestionActivity({activity:unregisteredActivity,question,response:objectivePayload,sourceRegistry,questionRegistry:unregistered,now:204_002}));
  const wrongCaps=qar.createQuestionRegistry();assert.throws(()=>wrongCaps.registerExecutor(question.kind,question.version,['keyboard']),error=>error.code==='QUESTION_ACTIVITY_CAPABILITY_MISMATCH');
});
