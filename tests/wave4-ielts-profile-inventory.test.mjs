import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';
import { createSourceRevisionRef } from '../src/source-revision-ref.js';
import { canonicalContentJson } from '../src/content-contracts-v2.js';
import { createCoreCardSourceAdapter } from '../src/source-revision-ref.js';
import { IELTS_STORE_NAMES } from '../src/ielts-domain.js';
import {
  IELTS_OBJECTIVE_INVENTORY_KIND,
  createIeltsObjectiveInventoryItem,
  validateIeltsObjectiveInventoryItem,
  transitionIeltsObjectiveInventoryItem
} from '../src/ielts-profile-inventory.js';

const at=Date.parse('2026-08-10T05:00:00.000Z');
globalThis.indexedDB=new IDBFactory();globalThis.IDBKeyRange=IDBKeyRange;globalThis.dispatchEvent=()=>true;globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};
const persistence=await import('../src/ielts-persistence.js');
const qar=await import('../src/question-activity-contracts.js');
const sha=value=>`sha256:${value.repeat(64).slice(0,64)}`;
const sourceRevisionRef=()=>createSourceRevisionRef({
  schema:'SourceRevisionRef',version:1,kind:'private-pack',authority:'local-source-owner',
  sourceId:'source-001',revisionId:'revision-001',integrity:'a'.repeat(64),locator:{assetId:'asset-001'},
  provenance:{origin:'local',verification:'verified',rights:'allowed',privacy:'private'}
});
const base=()=>({
  kind:IELTS_OBJECTIVE_INVENTORY_KIND,schemaVersion:1,itemId:'reading-item-001',itemRevision:1,
  skill:'reading',profiles:['academic'],form:{id:'academic-form-001',revision:1},
  section:{id:'reading-section-001',revision:1,number:1},order:1,sourceRevisionRef:sourceRevisionRef(),
  questionBinding:{kind:'single-choice',schemaVersion:1,registryRevision:'qar-00-registry-v1',questionId:'q-001',promptRevision:'prompt-v1',promptDigest:'fnv1a64:abc123',keyRevision:'key-v1',keyDigest:'fnv1a64:def456',rubricRevision:'rubric-v1',rubricDigest:'fnv1a64:789abc',scorer:{id:'objective-v1',version:1},reviewPolicyRevision:'review-v1',requiredCapabilities:['keyboard']},
  questionPayload:{prompt:'Choose the best answer.',options:[{id:'a',text:'One'},{id:'b',text:'Two'}],sealedObjectiveKey:{correctOptionId:'a'}},
  status:'draft',createdAt:'2026-08-10T05:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,
  rights:null,provenance:null,humanReview:null,extensions:{authoringNote:'local draft'}
});
const approval=(kind,digest,reviewer='reviewer-a')=>kind==='rights'?{schemaVersion:2,id:`rights-${reviewer}`,status:'approved',licenseId:'license-test',rightsHolder:'holder',basis:'permission',assertedAt:'2026-08-10T05:00:00.000Z',expiresAt:null,aiAsserted:false}:kind==='provenance'?{schemaVersion:2,id:`provenance-${reviewer}`,sourceType:'original-human-authored',sourceDescription:'human fixture',authorOrOrigin:reviewer,createdAt:'2026-08-10T05:00:00.000Z',aiDraft:false}:{schemaVersion:2,id:`review-${reviewer}`,status:'approved',reviewerType:'human',reviewerId:reviewer,reviewedAt:'2026-08-10T05:01:00.000Z',scopeDigest:digest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false};
async function authenticDraft(itemId){const card={id:`${itemId}-card`,senseId:'sense',front:'durable',back:'bền vững',type:'word',sourceVerified:true,rightsStatus:'allowed',privacy:'private',sourceProvenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'}},lab={id:`${itemId}-lab`,kind:'paraphrase',prompt:'Choose the best paraphrase.',context:'A durable system remains useful.',options:[{id:'a',text:'It lasts.',correct:true,rationale:'Correct.'},{id:'b',text:'It breaks.',correct:false,rationale:'Incorrect.'}],sourceCardIds:[card.id],status:'verified',provenance:{status:'verified',verifiedBy:'reviewer'},createdAt:1,updatedAt:2},source=createCoreCardSourceAdapter({getCard:()=>card}).createRef(card),question=qar.adaptIeltsLabItem(lab,source,{ownerAdapter:qar.createIeltsLabOwnerAdapter({readVerifiedItem:()=>lab})}),binding={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};return{draft:await createIeltsObjectiveInventoryItem({...base(),itemId,sourceRevisionRef:question.sourceRevisionRef,questionBinding:binding,questionPayload:question.item},{at}),question};}

test('creates a deterministic immutable draft identity from profile, form, section and item revision',async()=>{
  const left=await createIeltsObjectiveInventoryItem(base(),{at});
  const right=await createIeltsObjectiveInventoryItem(base(),{at});
  assert.equal(left.id,right.id);
  assert.equal(left.kind,'ielts-objective-inventory-item');
  assert.match(left.contentDigest,/^sha256:[a-f0-9]{64}$/);
  assert.equal(Object.isFrozen(left),true);
  assert.equal(Object.isFrozen(left.questionPayload),true);
  const digest=value=>`sha256:${createHash('sha256').update(canonicalContentJson(value)).digest('hex')}`;
  const identity=digest({skill:left.skill,profiles:left.profiles,form:left.form,section:left.section,order:left.order,itemId:left.itemId,itemRevision:left.itemRevision});
  const content=digest({skill:left.skill,profiles:left.profiles,form:left.form,section:left.section,order:left.order,itemId:left.itemId,itemRevision:left.itemRevision,sourceRevisionRef:left.sourceRevisionRef,questionBinding:left.questionBinding,questionPayload:left.questionPayload,extensions:left.extensions});
  assert.equal(left.id,`ielts-objective:${identity.slice(7)}`);assert.equal(left.contentDigest,content);
});

test('enforces exact Academic/GT profile rules and fails closed on mutable or unsafe inventory data',async()=>{
  const listening=base();listening.skill='listening';listening.profiles=['academic','general-training'];
  const listeningResult=await validateIeltsObjectiveInventoryItem(listening,{at});assert.equal(listeningResult.valid,true,listeningResult.errors.join('\n'));
  const invalid=base();invalid.profiles=['general-training'];invalid.questionPayload.audioBody='not allowed';
  const result=await validateIeltsObjectiveInventoryItem(invalid,{at});
  assert.equal(result.valid,false);assert.ok(result.errors.length);
  const general=base();general.profiles=['general-training'];assert.equal((await validateIeltsObjectiveInventoryItem(general,{at})).valid,true);
  const duplicate=base();duplicate.profiles=['academic','academic'];assert.equal((await validateIeltsObjectiveInventoryItem(duplicate,{at})).valid,false);
});

test('rejects descriptors and private data before getters run',()=>{
  const unsafe=base();let calls=0;Object.defineProperty(unsafe.questionPayload.options,'0',{get(){calls+=1;return{id:'a',text:'A'};},enumerable:true});
  const result=validateIeltsObjectiveInventoryItem(unsafe,{at});assert.equal(result.valid,false);assert.equal(calls,0);
  const privateRow=base();privateRow.questionPayload.clientSecret='x';assert.equal(validateIeltsObjectiveInventoryItem(privateRow,{at}).valid,false);
  const safe=base();safe.questionPayload.tokenizer='safe';safe.questionPayload.secretaryNote='safe';assert.equal(validateIeltsObjectiveInventoryItem(safe,{at}).valid,true);
});

test('privacy fence rejects lexical credential and source-body families without invoking getters',()=>{
  for(const key of ['secret','credential','credentials','password','token','sessionToken','sourcePath','absolutePath','rawText','captionText','SecretValueArchive','cachedbearertokenvalue']){const row=base();row.questionPayload[key]=key==='absolutePath'?'/etc/private-audit-sentinel':'x';assert.equal(validateIeltsObjectiveInventoryItem(row,{at}).valid,false,key);}
  const safe=base();Object.assign(safe.questionPayload,{tokenizer:'x',tokenizationModel:'x',secretaryNote:'x',empathy:'x',pathology:'x'});assert.equal(validateIeltsObjectiveInventoryItem(safe,{at}).valid,true);let reads=0;const hostile=base();Object.defineProperty(hostile.questionPayload,'sessionToken',{enumerable:true,get(){reads+=1;return'x';}});assert.equal(validateIeltsObjectiveInventoryItem(hostile,{at}).valid,false);assert.equal(reads,0);
});

test('accepts an authentic current QAR public binding and rejects an inconsistent projected binding',async()=>{
  const card={id:'wave4-qar-card',senseId:'wave4-qar-sense',front:'durable',back:'bền vững',type:'word',sourceVerified:true,rightsStatus:'allowed',privacy:'private',sourceProvenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'}};
  const lab={id:'wave4-qar-lab',kind:'paraphrase',prompt:'Choose the best paraphrase.',context:'A durable system remains useful.',options:[{id:'a',text:'It lasts.',correct:true,rationale:'Correct.'},{id:'b',text:'It breaks.',correct:false,rationale:'Incorrect.'}],sourceCardIds:[card.id],status:'verified',provenance:{status:'verified',verifiedBy:'reviewer'},createdAt:1,updatedAt:2};
  const source=createCoreCardSourceAdapter({getCard:id=>id===card.id?card:null}).createRef(card);
  const question=qar.adaptIeltsLabItem(lab,source,{ownerAdapter:qar.createIeltsLabOwnerAdapter({readVerifiedItem:id=>id===lab.id?lab:null})});
  const row=base();row.sourceRevisionRef=question.sourceRevisionRef;row.questionBinding={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};row.questionPayload={questionBinding:{...row.questionBinding},item:question.item};
  assert.equal((await validateIeltsObjectiveInventoryItem(row,{at})).valid,true);
  row.questionBinding.questionId='forged-question';
  assert.equal((await validateIeltsObjectiveInventoryItem(row,{at})).valid,false);
  row.questionBinding={...row.questionPayload.questionBinding,schemaVersion:2};
  assert.equal((await validateIeltsObjectiveInventoryItem(row,{at})).valid,false);
});

test('only an authentic QAR question object can durably promote an otherwise exact projection',async()=>{
  const {draft,question}=await authenticDraft('auth-fence-001');await persistence.saveIeltsObjectiveInventoryItem(draft,{at});const verified={...draft,status:'verified',verifiedAt:'2026-08-10T05:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)};
  await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(verified,{at,questionActivity:structuredClone(question)}),error=>error.code==='IELTS_INVENTORY_INVALID');assert.equal(await persistence.getIeltsObjectiveInventoryItem(draft.id).then(row=>row.status),'draft');await persistence.saveIeltsObjectiveInventoryItem(verified,{at,questionActivity:question});assert.equal((await persistence.getIeltsObjectiveInventoryItem(draft.id)).status,'verified');
});

test('historical verified inventory remains durable after rights expiry while fresh publication validation fails',async()=>{
  const {draft,question}=await authenticDraft('expiry-rights-001'),promotionAt=Date.parse('2026-08-10T05:01:00.000Z'),afterExpiry=Date.parse('2026-08-10T05:03:00.000Z');await persistence.saveIeltsObjectiveInventoryItem(draft,{at});const rights={...approval('rights',draft.contentDigest),expiresAt:'2026-08-10T05:02:00.000Z'},verified={...draft,status:'verified',verifiedAt:'2026-08-10T05:01:00.000Z',rights,provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)};
  const saved=await persistence.saveIeltsObjectiveInventoryItem(verified,{at:promotionAt,questionActivity:question});assert.equal(validateIeltsObjectiveInventoryItem(saved,{at:afterExpiry}).valid,false);assert.equal(validateIeltsObjectiveInventoryItem(saved,{at:afterExpiry,historical:true}).valid,true);assert.deepEqual(await persistence.saveIeltsObjectiveInventoryItem(saved,{at:afterExpiry}),saved);const retired=await persistence.retireIeltsObjectiveInventoryItem(saved.id,{reason:'expired-rights-history',at:afterExpiry});assert.equal(retired.status,'retired');const backup=await persistence.buildIeltsBackup();assert.equal(persistence.validateIeltsBackup(backup).valid,true);for(const store of Object.values(IELTS_STORE_NAMES))for(const row of await persistence.__testing.getAll(store))await persistence.__testing.deleteOne(store,row.key??row.id);const restored=await persistence.restoreIeltsBackup(backup);assert.equal(restored.durable,true);await persistence.reopenIeltsDatabase();assert.deepEqual(await persistence.getIeltsObjectiveInventoryItem(retired.id),retired);
  const expired={...draft,status:'verified',verifiedAt:'2026-08-10T05:01:00.000Z',rights:{...rights,expiresAt:'2026-08-10T05:00:30.000Z'},provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)};await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(expired,{at:promotionAt,questionActivity:question}),error=>error.code==='IELTS_INVENTORY_INVALID');
});

test('only permits explicit verified-to-retired lifecycle transitions and exact terminal replay',async()=>{
  const draft=await createIeltsObjectiveInventoryItem(base(),{at});
  assert.throws(()=>transitionIeltsObjectiveInventoryItem(draft,{status:'retired',reason:'withdrawn',at}),error=>error.code==='IELTS_INVENTORY_LIFECYCLE_CONFLICT');
});

test('persists only through the canonical owner API with idempotent replay and collision preservation',async()=>{
  const item=await createIeltsObjectiveInventoryItem(base(),{at});
  const first=await persistence.saveIeltsObjectiveInventoryItem(item,{at});
  const replay=await persistence.saveIeltsObjectiveInventoryItem(item,{at});
  assert.deepEqual(replay,first);
  await assert.rejects(()=>persistence.saveIeltsRecord('objectiveInventory',item),error=>error.code==='IELTS_INVENTORY_DIRECT_WRITE_FORBIDDEN');
  const changed=base();changed.questionPayload.prompt='A different durable prompt.';
  await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(changed,{at}),error=>error.code==='IELTS_INVENTORY_IDENTITY_COLLISION');
  const listed=await persistence.listIeltsObjectiveInventoryItems({itemId:item.itemId,skill:'reading',profile:'academic'});
  assert.equal(listed.length,1);assert.equal(Object.isFrozen(listed[0]),true);
});

test('durably promotes and retires one canonical inventory lifecycle',async()=>{
  const {draft,question}=await authenticDraft('lifecycle-item-001');const saved=await persistence.saveIeltsObjectiveInventoryItem(draft,{at});
  const verifiedAt='2026-08-10T06:00:00.000Z';const verified={...saved,status:'verified',verifiedAt,rights:{schemaVersion:2,id:'rights-lifecycle',status:'approved',licenseId:'license-test',rightsHolder:'holder',basis:'permission',assertedAt:'2026-08-10T05:00:00.000Z',expiresAt:null,aiAsserted:false},provenance:{schemaVersion:2,id:'provenance-lifecycle',sourceType:'original-human-authored',sourceDescription:'human fixture',authorOrOrigin:'reviewer',createdAt:'2026-08-10T05:00:00.000Z',aiDraft:false},humanReview:{schemaVersion:2,id:'review-lifecycle',status:'approved',reviewerType:'human',reviewerId:'reviewer-1',reviewedAt:verifiedAt,scopeDigest:saved.contentDigest,checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false}};
  const promoted=await persistence.saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verifiedAt),questionActivity:question});assert.equal(promoted.status,'verified');assert.deepEqual(await persistence.saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verifiedAt)}),promoted);
  const retired=await persistence.retireIeltsObjectiveInventoryItem(promoted.id,{reason:'withdrawn',at:Date.parse('2026-08-10T07:00:00.000Z')});assert.equal(retired.status,'retired');await assert.rejects(()=>persistence.retireIeltsObjectiveInventoryItem(promoted.id,{reason:'different',at:Date.parse('2026-08-10T07:00:00.000Z')}),error=>error.code==='IELTS_INVENTORY_LIFECYCLE_CONFLICT');
});

test('durable lifecycle has one CAS winner, terminal replay, no resurrection, and reopen readback',async()=>{
  const {draft,question}=await authenticDraft('lifecycle-cas-001');await persistence.saveIeltsObjectiveInventoryItem(draft,{at});
  const verified=await createIeltsObjectiveInventoryItem({...draft,status:'verified',verifiedAt:'2026-08-10T05:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)},{at});
  const alternate=await createIeltsObjectiveInventoryItem({...verified,humanReview:approval('humanReview',draft.contentDigest,'reviewer-b')},{at});
  const outcomes=await Promise.allSettled([persistence.saveIeltsObjectiveInventoryItem(verified,{at,questionActivity:question}),persistence.saveIeltsObjectiveInventoryItem(alternate,{at,questionActivity:question})]);assert.equal(outcomes.filter(row=>row.status==='fulfilled').length,1);assert.equal(outcomes.find(row=>row.status==='rejected').reason.code,'IELTS_INVENTORY_LIFECYCLE_CONFLICT');
  const winner=await persistence.getIeltsObjectiveInventoryItem(draft.id);assert.equal(winner.status,'verified');const [retired,replay]=await Promise.all([persistence.retireIeltsObjectiveInventoryItem(draft.id,{reason:'withdrawn',at:Date.parse('2026-08-10T05:02:00.000Z')}),persistence.retireIeltsObjectiveInventoryItem(draft.id,{reason:'withdrawn',at:Date.parse('2026-08-10T05:02:00.000Z')})]);assert.deepEqual(retired,replay);await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(draft,{at}),error=>error.code==='IELTS_INVENTORY_LIFECYCLE_CONFLICT');await persistence.reopenIeltsDatabase();assert.equal((await persistence.getIeltsObjectiveInventoryItem(draft.id)).status,'retired');
});

test('backup rejects a future or tampered canonical inventory before mutation',async()=>{
  const backup=await persistence.buildIeltsBackup();
  const future=structuredClone(backup);future.stores.objectiveInventory[0].schemaVersion=2;
  assert.equal(persistence.validateIeltsBackup(future).valid,false);
  const tampered=structuredClone(backup);tampered.stores.objectiveInventory[0].questionPayload.prompt='tampered';
  assert.equal(persistence.validateIeltsBackup(tampered).valid,false);
});

test('refuses a malformed stored draft before any promotion overwrite',async()=>{
  const draft=await createIeltsObjectiveInventoryItem({...base(),itemId:'forged-row-001'},{at});const forged={...draft,forgedUnexpectedField:true};await persistence.__testing.putOne('objectiveInventory',forged);
  const verified={...draft,status:'verified',verifiedAt:'2026-08-10T06:00:00.000Z',rights:{schemaVersion:2,id:'rights-forged',status:'approved',licenseId:'l',rightsHolder:'h',basis:'b',assertedAt:'2026-08-10T05:00:00.000Z',expiresAt:null},provenance:{schemaVersion:2,id:'provenance-forged',sourceType:'original-human-authored',sourceDescription:'d',authorOrOrigin:'o',createdAt:'2026-08-10T05:00:00.000Z'},humanReview:{schemaVersion:2,id:'review-forged',status:'approved',reviewerType:'human',reviewerId:'human-1',reviewedAt:'2026-08-10T06:00:00.000Z',scopeDigest:draft.contentDigest,checks:['rights','pedagogy','accuracy']}};
  await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(verified,{at:Date.parse(verified.verifiedAt)}),error=>error.code==='IELTS_INVENTORY_INVALID');assert.equal((await persistence.__testing.getOne('objectiveInventory',draft.id)).forgedUnexpectedField,true);
});

test('QAR accessors and public inventory IDs fail closed without coercion or mutation',async()=>{
  const {draft,question}=await authenticDraft('hostile-owner-001');await persistence.saveIeltsObjectiveInventoryItem(draft,{at});const verified={...draft,status:'verified',verifiedAt:'2026-08-10T05:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)};let reads=0;const hostile={...question};Object.defineProperty(hostile,'item',{enumerable:true,get(){reads+=1;throw new Error('must not read');}});await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(verified,{at,questionActivity:hostile}),error=>error.code==='IELTS_INVENTORY_INVALID');assert.equal(reads,0);assert.equal((await persistence.getIeltsObjectiveInventoryItem(draft.id)).status,'draft');const badId={toString(){reads+=1;return draft.id;},valueOf(){reads+=1;return draft.id;}};await assert.rejects(()=>persistence.getIeltsObjectiveInventoryItem(badId),error=>error.code==='IELTS_INVENTORY_INVALID');await assert.rejects(()=>persistence.retireIeltsObjectiveInventoryItem(badId,{reason:'x',at}),error=>error.code==='IELTS_INVENTORY_INVALID');assert.equal(reads,0);
});

test('public inventory reads reject malformed raw rows without changing durable bytes',async()=>{
  const raw={id:'ielts-objective:'+ 'f'.repeat(64),kind:'bad',schemaVersion:99,profiles:null,status:'future',forged:true};await persistence.__testing.putOne('objectiveInventory',raw);const before=structuredClone(await persistence.__testing.getOne('objectiveInventory',raw.id));await assert.rejects(()=>persistence.getIeltsObjectiveInventoryItem(raw.id),error=>error.code==='IELTS_INVENTORY_INVALID');await assert.rejects(()=>persistence.listIeltsObjectiveInventoryItems({}),error=>error.code==='IELTS_INVENTORY_INVALID');assert.deepEqual(await persistence.__testing.getOne('objectiveInventory',raw.id),before);
});

test('generic save cannot retire and concurrent retirement has one terminal winner',async()=>{
  const {draft,question}=await authenticDraft('retire-owner-001');await persistence.saveIeltsObjectiveInventoryItem(draft,{at});const verified={...draft,status:'verified',verifiedAt:'2026-08-10T05:01:00.000Z',rights:approval('rights',draft.contentDigest),provenance:approval('provenance',draft.contentDigest),humanReview:approval('humanReview',draft.contentDigest)};const saved=await persistence.saveIeltsObjectiveInventoryItem(verified,{at,questionActivity:question});const candidate=transitionIeltsObjectiveInventoryItem(saved,{status:'retired',reason:'direct',at:Date.parse('2026-08-10T05:02:00.000Z')});await assert.rejects(()=>persistence.saveIeltsObjectiveInventoryItem(candidate,{at}),error=>error.code==='IELTS_INVENTORY_LIFECYCLE_CONFLICT');const attempts=await Promise.allSettled([persistence.retireIeltsObjectiveInventoryItem(saved.id,{reason:'winner-a',at:Date.parse('2026-08-10T05:02:00.000Z')}),persistence.retireIeltsObjectiveInventoryItem(saved.id,{reason:'winner-b',at:Date.parse('2026-08-10T05:03:00.000Z')})]);assert.equal(attempts.filter(row=>row.status==='fulfilled').length,1);assert.equal(attempts.find(row=>row.status==='rejected').reason.code,'IELTS_INVENTORY_LIFECYCLE_CONFLICT');const winner=attempts.find(row=>row.status==='fulfilled').value;assert.deepEqual(await persistence.retireIeltsObjectiveInventoryItem(saved.id,{reason:winner.retirementReason,at:Date.parse(winner.retiredAt)}),winner);
});
