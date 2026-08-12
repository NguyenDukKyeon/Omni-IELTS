import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { IDBFactory } from 'fake-indexeddb';
import * as listening from '../src/ielts-listening-question-activity.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';
import { createTranscriptSourceAdapter } from '../src/source-revision-ref.js';
import { createIeltsObjectiveInventoryItem,deriveIeltsObjectiveInventoryId } from '../src/ielts-profile-inventory.js';
import { createObjectiveTextResponseOwnerAdapter,createObjectiveTextResponseQuestion } from '../src/question-activity-contracts.js';
import { getQuestionCoverageReport } from '../src/question-activity-contracts.js';
import * as qar from '../src/question-activity-contracts.js';
import { composeTodayPlan } from '../src/today-composer.js';
import { createSourceRevisionRegistry } from '../src/source-revision-ref.js';
import { getV10Record,listV10Records,putV10Record } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { createControlledListeningObjectiveTextProof,createControlledListeningProof } from '../src/listening-value-slice-ui.js';
import { listIeltsObjectiveInventoryItems } from '../src/ielts-persistence.js';
import * as persistence from '../src/ielts-persistence.js';
import { IELTS_STORE_NAMES } from '../src/ielts-domain.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { deleteV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { listReviewEvents } from '../src/persistence.js';

globalThis.indexedDB=new IDBFactory();

const fixture=JSON.parse(await readFile(new URL('./fixtures/wave4-listening-objective-text-fixture.json',import.meta.url),'utf8'));
const wave2Fixture=JSON.parse(await readFile(new URL('./fixtures/wave2-listening-tone-fixture.json',import.meta.url),'utf8'));
const wave2Audio=await readFile(new URL('./fixtures/wave2-listening-tone-fixture.wav',import.meta.url));
const KINDS=fixture.definitions.map(definition=>definition.kind);

function aggregate(){return createTranscriptAggregate({source:{id:'wave4-listening-otr-source',status:'verified',complete:true},segments:fixture.transcript.segments.map((segment,index)=>({startMs:segment.startMs,endMs:segment.endMs,text:segment.text,status:'verified',aligned:true,speaker:null,language:'en',confidence:null,id:index})),provenance:{origin:'project-generated-controlled-fixture',verification:'verified',rights:'allowed',privacy:'private'},createdAt:fixture.timestamps.createdAt});}
function approval(kind,digest){return kind==='rights'?{schemaVersion:2,id:'wave4-listening-otr-rights',status:'approved',licenseId:'project-created-local',rightsHolder:'VocabMaster project',basis:'project-created',assertedAt:'2026-08-11T00:00:00.000Z',expiresAt:null,aiAsserted:false}:kind==='provenance'?{schemaVersion:2,id:'wave4-listening-otr-provenance',sourceType:'original-human-authored',sourceDescription:'CONTROLLED_LOCAL_TEST_ONLY mathematical tone fixture',authorOrOrigin:'VocabMaster project',createdAt:'2026-08-11T00:00:00.000Z',aiDraft:false}:{schemaVersion:2,id:'wave4-listening-otr-review',status:'approved',reviewerType:'human',reviewerId:'controlled-reviewer',reviewedAt:'2026-08-11T00:01:00.000Z',scopeDigest:digest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false};}
function bindingFor(question){return{kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};}
function drafted(kind,definition,source){const reference=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>source}).createRef(source),id=deriveIeltsObjectiveInventoryId({skill:'listening',profiles:['academic','general-training'],form:{id:'wave4-listening-form',revision:1},section:{id:'wave4-listening-section',revision:1,number:1},order:1,itemId:definition.id,itemRevision:1}),payload={id,kind,prompt:definition.prompt,slots:definition.slots,target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:id,cardId:null,senseId:null,skill:'listening',sourceId:reference.sourceId,sourceRevision:reference.revisionId},sourceRevisionRef:reference,createdAt:fixture.timestamps.createdAt,updatedAt:fixture.timestamps.updatedAt},question=createObjectiveTextResponseQuestion(payload,{ownerAdapter:createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>payload})}),record={kind:'ielts-objective-inventory-item',schemaVersion:1,itemId:definition.id,itemRevision:1,skill:'listening',profiles:['academic','general-training'],form:{id:'wave4-listening-form',revision:1},section:{id:'wave4-listening-section',revision:1,number:1},order:1,sourceRevisionRef:reference,questionBinding:bindingFor(question),questionPayload:payload,status:'draft',createdAt:'2026-08-11T00:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,rights:null,provenance:null,humanReview:null,extensions:{fixture:'CONTROLLED_LOCAL_TEST_ONLY'}};return createIeltsObjectiveInventoryItem(record);}
function verified(kind,definition,source){const draft=drafted(kind,definition,source);return createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)});}
async function harness(definition,id){const source=aggregate(),inventory=verified(definition.kind,definition,source);let currentInventory=inventory,currentSource=source;const owner=listening.createIeltsListeningObjectiveTextOwnerAdapter({readVerifiedInventory:async value=>value===inventory.id?currentInventory:null,getTranscriptAggregate:async value=>value===source.revision.id?currentSource:null}),question=await listening.adaptIeltsListeningObjectiveTextItem(inventory,inventory.sourceRevisionRef,{ownerAdapter:owner}),registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,question.requiredCapabilities);const target=question.item.target,plan=composeTodayPlan({content:[{id,type:'listening',target,executor:'qar-objective-text-response',estimatedSeconds:60}],now:1000,minutes:5}),activity={...plan.activities[0],execution:{kind:'qar-objective-text-response',status:'ready'},assistanceCollectionMode:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,launchBinding:`wave4-listening-test:${id}`,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}},sourceRegistry=createSourceRevisionRegistry({adapters:[listening.createIeltsListeningSourceAdapter({getAggregate:async value=>value===source.revision.id?currentSource:null})]});return{source,inventory,question,registry,activity,sourceRegistry,setInventory:value=>{currentInventory=value;},setSource:value=>{currentSource=value;}};}
const responseFor=(question,texts)=>({slots:question.item.slots.map((slot,index)=>({slotId:slot.id,text:texts[index]??''}))});
async function controlledSideEffects(){return{todayRuns:(await listV10Records(V10_STORES.todayRuns,{sortBy:null})).map(row=>row.id).sort(),activities:(await listV10Records(V10_STORES.activities,{sortBy:null})).map(row=>row.id).sort(),reviews:(await listReviewEvents()).map(row=>row.id).sort(),errors:(await persistence.__testing.getAll(IELTS_STORE_NAMES.errors)).map(row=>row.id).sort(),globalErrors:(await listV10Records(V10_STORES.globalErrorRecords,{sortBy:null})).map(row=>row.id).sort(),providers:(await listV10Records(V10_STORES.resolverEvents,{sortBy:null})).map(row=>row.id).sort(),aiJobs:(await listV10Records(V10_STORES.aiJobs,{sortBy:null})).map(row=>row.id).sort()};}

test('Listening OTR exposes the exact seven controlled objective text kinds',()=>{
  assert.deepEqual(listening.IELTS_LISTENING_OBJECTIVE_TEXT_KINDS,KINDS);
  assert.equal(typeof listening.createIeltsListeningObjectiveTextOwnerAdapter,'function');
  assert.equal(typeof listening.adaptIeltsListeningObjectiveTextItem,'function');
});

test('Listening OTR rejects unsafe or noncanonical controlled manifests before any durable read',async()=>{
  const mutations=[
    ['transcript text',value=>{value.transcript.segments[0].text='mutated tone';}],['revision',value=>{value.transcript.revisionId='transcript-revision:tampered';}],['digest',value=>{value.transcript.contentDigest='fnv1a64:294:tampered';}],['coverage',value=>{value.transcript.coverage.ratio=.5;}],['segment order',value=>{value.transcript.segments.reverse();}],['segment timing',value=>{value.transcript.segments[1].startMs=601;}],['audio',value=>{value.audio.frequencies[1]=440;}],['definition',value=>{value.definitions[0].slots[0].acceptedAnswers[0]='high';}],['timestamps',value=>{value.timestamps.updatedAt+=1;}],['extra',value=>{value.extra='nope';}],['missing',value=>{delete value.audio.sha256;}],['nonfinite',value=>{value.audio.format.sampleRate=Infinity;}],['symbol',value=>{value[Symbol('fixture')]='nope';}],['unsafe prototype',value=>{Object.setPrototypeOf(value.audio,Date.prototype);}]
  ];
  for(const [name,mutate] of mutations){const changed=structuredClone(fixture);mutate(changed);await assert.rejects(createControlledListeningObjectiveTextProof({fixture:changed}),error=>error.code==='LISTENING_FIXTURE_INVALID',name);}
  const cyclic=structuredClone(fixture);cyclic.claims.loop=cyclic;await assert.rejects(createControlledListeningObjectiveTextProof({fixture:cyclic}),error=>error.code==='LISTENING_FIXTURE_INVALID');
  let getterCalls=0;const hostile=structuredClone(fixture);Object.defineProperty(hostile,'kind',{enumerable:true,get(){getterCalls+=1;return fixture.kind;}});Object.defineProperty(hostile.audio,'path',{enumerable:true,get(){getterCalls+=1;return fixture.audio.path;}});
  await assert.rejects(createControlledListeningObjectiveTextProof({fixture:hostile}),error=>error.code==='LISTENING_FIXTURE_INVALID');assert.equal(getterCalls,0);
});

test('Listening OTR rejects accessor-backed public proof options without invoking the accessor',async()=>{
  const before=await controlledSideEffects();let getterCalls=0,outcome='accepted';const options={};Object.defineProperty(options,'fixture',{enumerable:true,get(){getterCalls+=1;return fixture;}});
  try{await createControlledListeningObjectiveTextProof(options);}catch(error){outcome=error.code;}
  assert.equal(getterCalls,0);assert.equal(outcome,'LISTENING_FIXTURE_INVALID');
  const unsafe=Object.create(Date.prototype);Object.defineProperty(unsafe,'fixture',{enumerable:true,value:fixture});const symbolic={fixture};symbolic[Symbol('extra')]=true;
  for(const value of [null,[],{},unsafe,symbolic,{fixture,extra:true}])await assert.rejects(createControlledListeningObjectiveTextProof(value),error=>error.code==='LISTENING_FIXTURE_INVALID');
  assert.deepEqual(await controlledSideEffects(),before);
});

test('Listening OTR records project-generated tones with truthful rights-cleared provenance',async()=>{
  const proof=await createControlledListeningObjectiveTextProof({fixture});await proof.open();
  const row=(await listIeltsObjectiveInventoryItems({skill:'listening',status:'verified'})).find(value=>value.itemId===fixture.definitions[0].id);
  assert.equal(row.provenance.sourceType,'rights-cleared-source');
  assert.match(row.provenance.sourceDescription,/project-generated/i);
  assert.doesNotMatch(row.provenance.sourceDescription,/human-authored/i);
});

test('Listening OTR authenticates every controlled kind and never exposes accepted answers',async()=>{
  const source=aggregate();
  for(const definition of fixture.definitions){
    const draft=drafted(definition.kind,definition,source),verified=createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-11T00:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('review',draft.contentDigest)}),owner=listening.createIeltsListeningObjectiveTextOwnerAdapter({readVerifiedInventory:async id=>id===verified.id?verified:null,getTranscriptAggregate:async id=>id===source.revision.id?source:null}),question=await listening.adaptIeltsListeningObjectiveTextItem(verified,verified.sourceRevisionRef,{ownerAdapter:owner});
    assert.equal(question.kind,definition.kind);assert.deepEqual(question.item.target,verified.questionPayload.target);assert.equal(JSON.stringify(question).includes('acceptedAnswers'),false);assert.equal(Object.hasOwn(question.item.slots[0],'acceptedAnswers'),false);
  }
});

test('Listening OTR coverage reports only the seven implemented controlled dimensions as partial',()=>{
  const rows=getQuestionCoverageReport().kinds.filter(row=>KINDS.includes(row.kind));assert.equal(rows.length,7);
  for(const row of rows){assert.equal(row.coverage,'PARTIAL');for(const dimension of ['uiInventory','inventory','profile','durability'])assert.equal(row.dimensions[dimension],'PARTIAL');assert.equal(row.dimensions.section,'GAP');assert.equal(row.dimensions.readiness,'GAP');assert.match(row.limitations,/full Listening/i);}
});

test('Listening OTR executes every kind through one default-deny canonical receipt with exact slot scoring',async()=>{
  for(const [index,definition] of fixture.definitions.entries()){
    const data=await harness(definition,`listening-otr-${index}`),answer=definition.slots.map(slot=>slot.acceptedAnswers[0]),result=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:responseFor(data.question,answer),sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:2000+index});
    assert.equal(result.run.status,'completed');assert.equal(result.score.disposition,'correct');assert.equal(result.score.numerator,definition.slots.length);assert.equal(result.decision.eligible,false);assert.equal(result.decision.affectsSchedule,false);assert.equal(result.run.evidenceDecision.affectsSchedule,false);assert.equal(JSON.stringify(result.run).includes('acceptedAnswers'),false);assert.equal(await getV10Record(V10_STORES.todayRuns,result.run.id)!=null,true);
  }
  const definition={...fixture.definitions[0],id:'wave4-tone-two-slot',slots:[{id:'tone-1',label:'First',wordLimit:1,acceptedAnswers:['low']},{id:'tone-2',label:'Second',wordLimit:1,acceptedAnswers:['high']}]};
  for(const [texts,disposition,numerator,reason] of [[['low','wrong'],'partial',1,'MISMATCH'],[['','one two'],'wrong',0,'WORD_LIMIT_EXCEEDED']]){const data=await harness(definition,`listening-otr-${disposition}`),result=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response:responseFor(data.question,texts),sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:3000+numerator});assert.equal(result.score.disposition,disposition);assert.equal(result.score.numerator,numerator);assert.equal(result.score.slots.at(-1).reason,reason);}
});

test('Listening OTR rejects pre-Run owner drift and preserves only exact terminal replay',async()=>{
  const definition={...fixture.definitions[0],id:'wave4-tone-replay',slots:[{id:'tone-1',label:'First',wordLimit:1,acceptedAnswers:['low']},{id:'tone-2',label:'Second',wordLimit:1,acceptedAnswers:['high']}]};
  for(const [name,mutate] of [['retired',data=>data.setInventory({...data.inventory,status:'retired'})],['source-body',data=>data.setSource({...data.source,segments:[{...data.source.segments[0],text:'changed'},...data.source.segments.slice(1)]})]]){const data=await harness(definition,`listening-otr-drift-${name}`),runId=`today-run:${data.activity.activitySpec.id}`;mutate(data);await assert.rejects(qar.executeQuestionActivity({activity:data.activity,question:data.question,response:responseFor(data.question,['low','high']),sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:4000}),error=>['QUESTION_ACTIVITY_OWNER_CHANGED','QUESTION_ACTIVITY_OWNER_UNAVAILABLE'].includes(error.code));assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);}
  const data=await harness(definition,'listening-otr-replay'),response=responseFor(data.question,['low','high']),first=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response,sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:4100}),replay=await qar.executeQuestionActivity({activity:data.activity,question:data.question,response,sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:4101});assert.equal(replay.run.envelope.receipt.id,first.run.envelope.receipt.id);await assert.rejects(qar.executeQuestionActivity({activity:data.activity,question:data.question,response:responseFor(data.question,['low','wrong']),sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:4102}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  const reordered=await harness(definition,'listening-otr-invalid-order'),runId=`today-run:${reordered.activity.activitySpec.id}`;await assert.rejects(qar.executeQuestionActivity({activity:reordered.activity,question:reordered.question,response:{slots:[{slotId:'tone-2',text:'high'},{slotId:'tone-1',text:'low'}]},sourceRegistry:reordered.sourceRegistry,questionRegistry:reordered.registry,now:4103}),error=>error.code==='QUESTION_ACTIVITY_RESPONSE_INVALID');assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined);
});

test('Listening OTR preflight rejects every durable owner and Transcript drift with no run, review, error, or provider mutation',async()=>{
  const definition=fixture.definitions[0],response=['low'];
  const mutations=[
    ['missing-inventory',data=>data.setInventory(null)],['retired-inventory',data=>data.setInventory({...data.inventory,status:'retired'})],['rebound-inventory',data=>data.setInventory({...data.inventory,sourceRevisionRef:{...data.inventory.sourceRevisionRef,revisionId:'transcript-revision:rebound'}})],
    ['source-status',data=>data.setSource({...data.source,source:{...data.source.source,status:'draft'}})],['revision-status',data=>data.setSource({...data.source,revision:{...data.source.revision,status:'draft'}})],['tombstone',data=>data.setSource({...data.source,revision:{...data.source.revision,tombstone:true}})],['integrity',data=>data.setSource({...data.source,revision:{...data.source.revision,contentDigest:'fnv1a64:1:0'}})],['coverage',data=>data.setSource({...data.source,revision:{...data.source.revision,coverage:{...data.source.revision.coverage,ratio:.5}}})],['segment-id',data=>data.setSource({...data.source,segments:[{...data.source.segments[0],id:'tampered'},...data.source.segments.slice(1)]})],['segment-order',data=>data.setSource({...data.source,segments:[...data.source.segments].reverse()})],['segment-time',data=>data.setSource({...data.source,segments:[{...data.source.segments[0],endMs:599},...data.source.segments.slice(1)]})],['segment-text',data=>data.setSource({...data.source,segments:[{...data.source.segments[0],text:'tampered'},...data.source.segments.slice(1)]})],['provenance',data=>data.setSource({...data.source,revision:{...data.source.revision,provenance:{...data.source.revision.provenance,rights:'denied'}}})]
  ];
  for(const [name,mutate] of mutations){const data=await harness(definition,`listening-otr-preflight-${name}`),before=await controlledSideEffects(),runId=`today-run:${data.activity.activitySpec.id}`;mutate(data);await assert.rejects(qar.executeQuestionActivity({activity:data.activity,question:data.question,response:responseFor(data.question,response),sourceRegistry:data.sourceRegistry,questionRegistry:data.registry,now:5_000}),error=>['QUESTION_ACTIVITY_OWNER_CHANGED','QUESTION_ACTIVITY_OWNER_UNAVAILABLE','QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED','QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH'].includes(error.code),name);assert.equal(await getV10Record(V10_STORES.todayRuns,runId),undefined,name);assert.deepEqual(await controlledSideEffects(),before,name);}
  let throwReads=false;const source=aggregate(),inventory=verified(definition.kind,definition,source),owner=listening.createIeltsListeningObjectiveTextOwnerAdapter({readVerifiedInventory:async id=>{if(throwReads)throw new Error('owner unavailable');return id===inventory.id?inventory:null;},getTranscriptAggregate:async id=>{if(throwReads)throw new Error('source unavailable');return id===source.revision.id?source:null;}}),question=await listening.adaptIeltsListeningObjectiveTextItem(inventory,inventory.sourceRevisionRef,{ownerAdapter:owner}),registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,question.requiredCapabilities);const plan=composeTodayPlan({content:[{id:'listening-otr-thrown-reader',type:'listening',target:question.item.target,executor:'qar-objective-text-response',estimatedSeconds:60}],now:5001,minutes:5}),activity={...plan.activities[0],execution:{kind:'qar-objective-text-response',status:'ready'},assistanceCollectionMode:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,launchBinding:'wave4-listening-thrown-reader',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:question.scorer.id,reviewPolicyRevision:question.reviewPolicyRevision}},sourceRegistry=createSourceRevisionRegistry({adapters:[listening.createIeltsListeningSourceAdapter({getAggregate:async id=>id===source.revision.id?source:null})]}),before=await controlledSideEffects();throwReads=true;await assert.rejects(qar.executeQuestionActivity({activity,question,response:responseFor(question,response),sourceRegistry,questionRegistry:registry,now:5002}),error=>error.code==='QUESTION_ACTIVITY_OWNER_UNAVAILABLE');assert.equal(await getV10Record(V10_STORES.todayRuns,`today-run:${activity.activitySpec.id}`),undefined);assert.deepEqual(await controlledSideEffects(),before);
});

test('Listening OTR binds to the exact existing controlled Transcript aggregate',async()=>{
  const wave2=await createControlledListeningProof({fixture:wave2Fixture,audioBytes:wave2Audio,audioUrl:'/tests/fixtures/wave2-listening-tone-fixture.wav'});
  await wave2.open();
  const objective=await createControlledListeningObjectiveTextProof({fixture});
  assert.equal((await objective.open()).items.length,7);
});

test('Listening OTR controlled proof durably seeds both profiles and submits through the canonical terminal',async()=>{
  const proof=await createControlledListeningObjectiveTextProof({fixture});
  const opened=await proof.open();
  assert.equal(opened.items.length,7);
  assert.equal(JSON.stringify(opened).includes('acceptedAnswers'),false);
  assert.equal(JSON.stringify(opened).includes('low tone'),false);
  const inventory=await listIeltsObjectiveInventoryItems({skill:'listening',status:'verified'});
  const rows=inventory.filter(row=>fixture.definitions.some(definition=>definition.id===row.itemId));
  assert.equal(rows.length,7);
  for(const row of rows)assert.deepEqual(row.profiles,['academic','general-training']);
  const first=opened.items[0],terminal=await proof.submit(first.id,{slots:first.slots.map(slot=>({slotId:slot.id,text:'low'}))});
  assert.equal(terminal.result.score.disposition,'correct');
  assert.equal(terminal.result.decision.eligible,false);
  assert.equal(JSON.stringify(terminal).includes('acceptedAnswers'),false);
  const reloaded=await createControlledListeningObjectiveTextProof({fixture}),replayed=await reloaded.open();
  assert.equal(replayed.items[0].result.score.disposition,'correct');
});

test('Listening OTR rejects terminal learner output, score metadata, and receipt binding tampering without overwriting the stored winner',async()=>{
  const proof=await createControlledListeningObjectiveTextProof({fixture}),opened=await proof.open(),item=opened.items[2],response={slots:item.slots.map(slot=>({slotId:slot.id,text:'low'}))},first=await proof.submit(item.id,response),stored=await getV10Record(V10_STORES.todayRuns,first.result.runId);
  const mutations=[['learner-output',row=>{row.envelope.attempt.learnerOutput='{"slots":[]}';}],['question-result',row=>{row.envelope.attempt.metadata.questionResult.keyDigest='tampered';}],['objective-metadata',row=>{row.envelope.receipt.metadata.objectiveTextResponse.totals={numerator:0,denominator:1};}],['receipt-metadata',row=>{row.envelope.receipt.metadata.questionResult.keyDigest='tampered';}]];
  for(const [name,mutate] of mutations){const injected=structuredClone(stored);mutate(injected);await putV10Record(V10_STORES.todayRuns,injected,'wave4-listening-terminal-tamper');const persisted=await getV10Record(V10_STORES.todayRuns,stored.id);await assert.rejects(proof.submit(item.id,response),error=>['QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT','LISTENING_FIXTURE_TERMINAL_INVALID'].includes(error.code),name);assert.deepEqual(await getV10Record(V10_STORES.todayRuns,stored.id),persisted,name);await putV10Record(V10_STORES.todayRuns,stored,'wave4-listening-terminal-restore');}
  const replay=await proof.submit(item.id,response);assert.equal(replay.result.runId,first.result.runId);await assert.rejects(proof.submit(item.id,{slots:item.slots.map(slot=>({slotId:slot.id,text:'wrong'}))}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
});

test('Listening OTR combined backup rejects tampering and restores Transcript inventory and terminal without key duplication',async()=>{
  const proof=await createControlledListeningObjectiveTextProof({fixture}),opened=await proof.open(),first=opened.items[0];
  const terminal=first.result?{result:first.result}:await proof.submit(first.id,{slots:first.slots.map(slot=>({slotId:slot.id,text:'low'}))});
  const inventory=(await listIeltsObjectiveInventoryItems({skill:'listening',status:'verified'})).find(row=>row.itemId===fixture.definitions[0].id),run=await getV10Record(V10_STORES.todayRuns,terminal.result.runId),backup=await buildCombinedBackup(),owner=backup.domains.ielts.stores.objectiveInventory.find(row=>row.id===inventory.id),publicRun=backup.domains.v10.stores.todayRuns.find(row=>row.id===run.id);
  assert.ok(owner);assert.ok(publicRun);assert.equal(JSON.stringify(owner).includes('acceptedAnswers'),true);assert.equal(JSON.stringify(publicRun).includes('acceptedAnswers'),false);assert.equal(JSON.stringify(publicRun).includes('low tone'),false);
  const tampered=structuredClone(backup);tampered.domains.ielts.stores.objectiveInventory.find(row=>row.id===inventory.id).questionPayload.prompt='tampered';const before=await buildCombinedBackup();await assert.rejects(restoreCombinedBackup(tampered),error=>error.code==='BACKUP_INVALID');assert.equal((await buildCombinedBackup()).payloadDigest,before.payloadDigest);
  await persistence.__testing.deleteOne(IELTS_STORE_NAMES.objectiveInventory,inventory.id);await deleteV10Record(V10_STORES.todayRuns,run.id,'wave4-listening-backup-delete');await persistence.reopenIeltsDatabase();await reopenV10Database();assert.equal(await persistence.getIeltsObjectiveInventoryItem(inventory.id),null);assert.equal(await getV10Record(V10_STORES.todayRuns,run.id),undefined);
  await restoreCombinedBackup(backup);await persistence.reopenIeltsDatabase();await reopenV10Database();assert.deepEqual(await persistence.getIeltsObjectiveInventoryItem(inventory.id),inventory);assert.deepEqual(await getV10Record(V10_STORES.todayRuns,run.id),run);
  const restoredProof=await createControlledListeningObjectiveTextProof({fixture}),restored=await restoredProof.open();assert.equal(restored.items.find(item=>item.id===first.id).result.runId,run.id);const replay=await restoredProof.submit(first.id,{slots:first.slots.map(slot=>({slotId:slot.id,text:'low'}))});assert.equal(replay.result.runId,run.id);await assert.rejects(restoredProof.submit(first.id,{slots:first.slots.map(slot=>({slotId:slot.id,text:'wrong'}))}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
});
