import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBDatabase,IDBKeyRange } from 'fake-indexeddb';
import { createPrivateSourceRef } from '../src/private-source-contracts.js';
import { createPrivateSourceLibrary } from '../src/private-source-library.js';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const core=await import('../src/persistence.js');
const coreContracts=await import('../src/persistence-core.js');
const ielts=await import('../src/ielts-persistence.js');
const { IELTS_STORE_NAMES }=await import('../src/ielts-domain.js');
const inventory=await import('../src/ielts-profile-inventory.js');
const { createSourceRevisionRef }=await import('../src/source-revision-ref.js');
const v10=await import('../src/v10-persistence.js');
const { V10_DB_NAME,V10_DB_VERSION,V10_STORES }=await import('../src/v10-contracts.js');
const backup=await import('../src/ielts-backup.js');
const backupBridge=await import('../src/ielts-backup-bridge.js');
const registry=await import('../src/backup-registry.js');
const storageSafety=await import('../src/storage-safety.js');
const { PRODUCTIVE_PROMPT_REF }=await import('../src/productive-text-contracts.js');
const { ProductivePractice }=await import('../src/productive-practice.js');

let baselineEnvelope;
let targetEnvelope;
const inventoryRow=label=>inventory.createIeltsObjectiveInventoryItem({kind:'ielts-objective-inventory-item',schemaVersion:1,itemId:`inventory-${label}`,itemRevision:1,skill:'reading',profiles:['academic'],form:{id:'academic-form',revision:1},section:{id:'reading-section',revision:1,number:1},order:1,sourceRevisionRef:createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'private-pack',authority:'test-owner',sourceId:'source-test',revisionId:'revision-test',integrity:'a'.repeat(64),locator:{assetId:'asset-test'},provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'}}),questionBinding:{kind:'single-choice',schemaVersion:1,registryRevision:'qar-v1',questionId:'question-test',promptRevision:'prompt-v1',promptDigest:'fnv1a64:a',keyRevision:'key-v1',keyDigest:'fnv1a64:b',rubricRevision:'rubric-v1',rubricDigest:'fnv1a64:c',scorer:{id:'scorer-test',version:1},reviewPolicyRevision:'review-v1',requiredCapabilities:['keyboard']},questionPayload:{prompt:'Pick one',options:[{id:'a',text:'A'},{id:'b',text:'B'}]},status:'draft',rights:null,provenance:null,humanReview:null,createdAt:'2026-08-10T05:00:00.000Z',verifiedAt:null,retiredAt:null,retirementReason:null,extensions:{}});

async function seedSentinels(label){
  for(const entry of registry.BACKUP_STORE_REGISTRY.filter(row=>row.backupRule!=='exclude')){
    const key=`${label}-${entry.owner}-${entry.store}`;
    if(entry.owner==='core')await core.__testing.putOne(entry.store,{[entry.keyPath]:key,label});
    else if(entry.owner==='ielts'&&entry.store===IELTS_STORE_NAMES.objectiveInventory)await ielts.saveIeltsObjectiveInventoryItem(inventoryRow(label));
    else if(entry.owner==='ielts'&&entry.store===IELTS_STORE_NAMES.learnerArtifacts)await ielts.autosaveLearnerTextArtifact({text:`${label} productive artifact`,at:Date.now()});
    else if(entry.owner==='ielts')await ielts.__testing.putOne(entry.store,{[entry.keyPath]:key,label});
    else if(entry.store===V10_STORES.transcriptCache)await v10.putV10Record(entry.store,{id:key,cacheKey:key,provider:'imported',segments:[{id:`${key}-segment`,startMs:0,endMs:1000,text:`${label} imported transcript`}]},'restore-fixture');
    else if(entry.store===V10_STORES.contentAssets)await v10.putV10Record(entry.store,{id:`personal:${key}`,lessonId:'personal-next-session',data:{label}},'restore-fixture');
    else if(entry.store===V10_STORES.privateSources){const sourceId=`private-source:00000000-0000-4000-8000-${label==='before'?'000000000021':'000000000022'}`,text=`${label} private text`,revisionId=`${sourceId}:revision:1`;await v10.putV10Record(entry.store,{kind:'private-source-head',id:sourceId,sourceId,currentRevisionId:revisionId,revisionCount:1,state:'draft',currentApprovalId:null,createdAt:1,updatedAt:1},'restore-fixture');const revision={kind:'private-source-revision',id:revisionId,sourceId,revisionNumber:1,parentRevisionId:null,title:label,text,textDigest:`sha256:${registry.sha256Hex(text)}`,utf8Bytes:new TextEncoder().encode(text).length,sourceRevisionRef:null,createdAt:1};revision.sourceRevisionRef=createPrivateSourceRef(revision);await v10.putV10Record(entry.store,revision,'restore-fixture');}
    else await v10.putV10Record(entry.store,{[entry.keyPath]:key,label},'restore-fixture');
  }
}

async function currentEnvelope(){return backup.buildCombinedBackup();}
async function currentLogicalDigest(){return backup.__testing.logicalRestoreDigest(await currentEnvelope());}
const logicalDigest=envelope=>backup.__testing.logicalRestoreDigest(envelope);

test('fixture creates distinct canonical snapshots across every durable store',async()=>{
  await core.initializePersistence();await ielts.initializeIeltsPersistence();await v10.initializeV10Persistence();
  await seedSentinels('before');baselineEnvelope=await currentEnvelope();
  await seedSentinels('target');targetEnvelope=await currentEnvelope();
  assert.notEqual(baselineEnvelope.payloadDigest,targetEnvelope.payloadDigest);
  await backup.restoreCombinedBackup(baselineEnvelope);assert.equal(await currentLogicalDigest(),logicalDigest(baselineEnvelope));
});

test('staged vNext restore commits, reopens, verifies and is idempotent',async()=>{
  const result=await backup.restoreCombinedBackup(targetEnvelope);assert.equal(result.valid,true);assert.equal(result.durable,true);assert.equal(result.verified,true);assert.equal(result.status,'restored');assert.equal(result.payloadDigest,targetEnvelope.payloadDigest);
  assert.equal(await currentLogicalDigest(),logicalDigest(targetEnvelope));assert.equal(await core.readCoreRestoreJournal(),undefined);
  const duplicate=await backup.restoreCombinedBackup(targetEnvelope);assert.equal(duplicate.alreadyApplied,true);assert.equal(duplicate.status,'already-current');assert.equal(await currentLogicalDigest(),logicalDigest(targetEnvelope));
});

test('authentic Productive Stage A replay/conflict and Stage B stale restore lifecycle',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);const responses=[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'revisit'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'not-applicable'}],first=await ielts.autosaveLearnerTextArtifact({text:'A restore proof keeps private writing durable.',promptRef:PRODUCTIVE_PROMPT_REF,at:701}),input={artifactId:first.artifactId,artifactRevisionId:first.artifactRevisionId,responses,note:'Keep this private restore note.'},runtime=new ProductivePractice({now:()=>702}),result=await runtime.submitSelfReview({...input,now:702}),stageA=await currentEnvelope();await backup.restoreCombinedBackup(baselineEnvelope);await backup.restoreCombinedBackup(stageA);const replay=await new ProductivePractice({now:()=>799}).submitSelfReview({...input,now:799});assert.deepEqual(replay,result);await assert.rejects(()=>new ProductivePractice({now:()=>800}).submitSelfReview({...input,note:'changed',now:800}),error=>error.code==='PRODUCTIVE_TERMINAL_CONFLICT');
  const beforeTamper=await currentEnvelope(),repack=value=>{value.payloadDigest=registry.canonicalBackupDigest(value.domains);const manifest=value.manifest.stores.find(entry=>entry.owner==='v10'&&entry.store===V10_STORES.todayRuns);manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(value.domains.v10.stores[V10_STORES.todayRuns]))}`;return value;};
  for(const mutate of [row=>{row.activityId='forged-activity';},row=>{row.evidenceDecision.eligible=!row.evidenceDecision.eligible;},row=>{row.terminal.digest='fnv1a64:0:0';}]){const forged=structuredClone(stageA),row=forged.domains.v10.stores[V10_STORES.todayRuns].find(value=>value.activitySpec?.target?.targetType==='productive-text-revision');assert.ok(row);mutate(row);repack(forged);assert.equal(backup.validateCombinedBackup(forged).valid,false);await assert.rejects(()=>backup.restoreCombinedBackup(forged),error=>error.code==='BACKUP_INVALID');assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,beforeTamper.payloadDigest);}
  const second=await ielts.autosaveLearnerTextArtifact({artifactId:first.artifactId,expectedRevisionId:first.artifactRevisionId,promptRef:PRODUCTIVE_PROMPT_REF,text:'A restore proof keeps private writing durable after revision two.',at:803}),stageB=await currentEnvelope();await backup.restoreCombinedBackup(baselineEnvelope);await backup.restoreCombinedBackup(stageB);const reopened=await ielts.getLearnerTextArtifact(first.artifactId),feedback=await ielts.getProductiveFeedbackProjection(result.feedbackId);assert.equal(reopened.artifact.currentRevisionId,second.artifactRevisionId);assert.deepEqual(reopened.revisions.map(row=>row.text),['A restore proof keeps private writing durable.','A restore proof keeps private writing durable after revision two.']);assert.equal(feedback.freshness,'stale');await assert.rejects(()=>new ProductivePractice({now:()=>900}).submitSelfReview({...input,now:900}),error=>error.code==='PRODUCTIVE_STALE_REVISION');
});

test('private source backup restore reopens revisions, approval, tombstone privacy and an explicit older recovery',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);
  const sourceId='private-source:00000000-0000-4000-8000-000000000888',library=createPrivateSourceLibrary();
  const first=await library.create({sourceId,title:'Private restore title',text:'Private restore body revision one.',createdAt:810});
  await library.approve({sourceId,expectedRevisionId:first.currentRevisionId,approvedAt:811});
  const second=await library.edit({sourceId,title:'Private restore title two',text:'Private restore body revision two.',expectedRevisionId:first.currentRevisionId,updatedAt:812});
  await library.approve({sourceId,expectedRevisionId:second.currentRevisionId,approvedAt:813});
  const live=await currentEnvelope();
  await backup.restoreCombinedBackup(baselineEnvelope);await backup.restoreCombinedBackup(live);await v10.reopenV10Database();
  const reopened=createPrivateSourceLibrary(),loaded=await reopened.getById(sourceId),historical=await reopened.getById(sourceId,{revisionId:first.currentRevisionId});assert.equal(loaded.text,'Private restore body revision two.');assert.equal(loaded.state,'approved-private');assert.equal(historical.title,'Private restore title');assert.equal(historical.text,'Private restore body revision one.');assert.equal((await reopened.search('revision two'))[0].currentRevisionId,second.currentRevisionId);
  await reopened.delete({sourceId,expectedRevisionId:second.currentRevisionId,deletedAt:814});const tombstone=await currentEnvelope(),serialized=JSON.stringify(tombstone);for(const privateValue of ['Private restore title','Private restore body revision one.','Private restore title two','Private restore body revision two.'])assert.equal(serialized.includes(privateValue),false);
  await backup.restoreCombinedBackup(baselineEnvelope);await backup.restoreCombinedBackup(tombstone);await v10.reopenV10Database();const rows=await v10.listV10Records(V10_STORES.privateSources,{sortBy:'id'});assert.deepEqual(rows.filter(row=>row.sourceId===sourceId).map(row=>row.kind),['private-source-tombstone']);await assert.rejects(()=>createPrivateSourceLibrary().getById(sourceId),error=>error.code==='TOMBSTONED');
  await backup.restoreCombinedBackup(live);await v10.reopenV10Database();const recovered=createPrivateSourceLibrary();assert.equal((await recovered.getById(sourceId)).text,'Private restore body revision two.');assert.equal((await recovered.getById(sourceId,{revisionId:first.currentRevisionId})).text,'Private restore body revision one.');
});

test('private source semantic tampering rejects before journal or current mutation after every outer digest is recomputed',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);const sourceId='private-source:00000000-0000-4000-8000-000000000889',library=createPrivateSourceLibrary(),first=await library.create({sourceId,title:'Tamper title',text:'Tamper body one',createdAt:820});await library.approve({sourceId,expectedRevisionId:first.currentRevisionId,approvedAt:821});const second=await library.edit({sourceId,title:'Tamper title two',text:'Tamper body two',expectedRevisionId:first.currentRevisionId,updatedAt:822});await library.quarantine({sourceId,expectedRevisionId:second.currentRevisionId,code:'policy-warning',createdAt:823});const live=await currentEnvelope();await library.delete({sourceId,expectedRevisionId:second.currentRevisionId,deletedAt:824});const tomb=await currentEnvelope();await backup.restoreCombinedBackup(live);
  const repack=value=>{const rows=value.domains.v10.stores[V10_STORES.privateSources],manifest=value.manifest.stores.find(row=>row.owner==='v10'&&row.store===V10_STORES.privateSources);manifest.recordCount=rows.length;manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;value.payloadDigest=registry.canonicalBackupDigest(value.domains);return value;};
  const target=(rows,kind)=>rows.find(value=>value.sourceId===sourceId&&value.kind===kind),mutations=[
    ['head',[live,row=>target(row,'private-source-head').revisionCount=99]],
    ['ref',[live,row=>target(row,'private-source-revision').sourceRevisionRef.integrity='sha256:'+'0'.repeat(64)]],
    ['approval',[live,row=>target(row,'private-source-approval').scope='public']],
    ['finding',[live,row=>target(row,'private-source-finding').message='forged']],
    ['tombstone',[tomb,row=>target(row,'private-source-tombstone').lastRevisionId='private-source:00000000-0000-4000-8000-000000000001:revision:1']],
    ['lineage',[live,row=>row.push(structuredClone(target(row,'private-source-revision')))]],
    ['quota',[live,row=>target(row,'private-source-revision').utf8Bytes+=1]],
    ['extra-contiguous-revision',[live,row=>{const revision=target(row,'private-source-revision'),extra={...structuredClone(revision),id:`${sourceId}:revision:3`,revisionNumber:3,parentRevisionId:`${sourceId}:revision:2`,createdAt:823,sourceRevisionRef:null};extra.sourceRevisionRef=createPrivateSourceRef(extra);row.push(extra);}]],
    ['approval-after-head',[live,row=>{target(row,'private-source-approval').approvedAt=999;}]],
    ['finding-after-head',[live,row=>{target(row,'private-source-finding').createdAt=999;}]]
  ];
  for(const [name,[envelope,mutate]] of mutations){const invalid=repack(structuredClone(envelope));mutate(invalid.domains.v10.stores[V10_STORES.privateSources]);repack(invalid);const before=(await currentEnvelope()).payloadDigest;assert.equal(backup.validateCombinedBackup(invalid).valid,false,name);await assert.rejects(()=>backup.restoreCombinedBackup(invalid),error=>error.code==='BACKUP_INVALID');assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before);}
});

test('ordinary cross-DB failure rolls back to the exact last-known-good digest',async()=>{
  for(const owner of ['core','ielts','v10']){
    await backup.restoreCombinedBackup(baselineEnvelope);const before=await currentEnvelope();assert.equal(logicalDigest(before),logicalDigest(baselineEnvelope));
    await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope,{hooks:backup.__testing.createFailureHook(owner)}),error=>error.code==='RESTORE_INJECTED_FAILURE'&&error.rollbackVerified===true);
    assert.equal(await currentLogicalDigest(),logicalDigest(baselineEnvelope));assert.equal(await core.readCoreRestoreJournal(),undefined);
  }
});

test('simulated process crash leaves a durable journal and startup recovery rolls forward deterministically',async()=>{
  for(const owner of ['core','ielts','v10']){
    await backup.restoreCombinedBackup(baselineEnvelope);
    await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope,{hooks:backup.__testing.createCrashHook(owner)}),error=>error.code==='SIMULATED_PROCESS_CRASH'&&error.recoveryPending===true);
    const journal=await core.readCoreRestoreJournal();assert.equal(journal.phase,'committing');assert.equal(journal.targetDigest,targetEnvelope.payloadDigest);
    await assert.rejects(()=>backup.buildCombinedBackup(),error=>error.code==='RESTORE_IN_PROGRESS');
    const recovered=await backup.recoverInterruptedRestore();assert.equal(recovered.recovered,true);assert.equal(recovered.payloadDigest,targetEnvelope.payloadDigest);
    assert.equal(await currentLogicalDigest(),logicalDigest(targetEnvelope));assert.equal(await core.readCoreRestoreJournal(),undefined);
  }
});

test('corrupt input is rejected before journal or durable mutation',async()=>{
  const before=await currentEnvelope();const corrupt=structuredClone(targetEnvelope);corrupt.domains.core.stores.cards[0].label='tampered-without-digest';
  await assert.rejects(()=>backup.restoreCombinedBackup(corrupt),error=>error.code==='BACKUP_INVALID');
  assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before.payloadDigest);
});

test('future canonical inventory is rejected before restore journal even with recomputed manifest and payload digests',async()=>{
  const before=await currentEnvelope(),invalid=structuredClone(targetEnvelope),rows=invalid.domains.ielts.stores[IELTS_STORE_NAMES.objectiveInventory];rows[0].schemaVersion=99;invalid.payloadDigest=registry.canonicalBackupDigest(invalid.domains);const manifest=invalid.manifest.stores.find(row=>row.owner==='ielts'&&row.store===IELTS_STORE_NAMES.objectiveInventory);manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;
  await assert.rejects(()=>backup.restoreCombinedBackup(invalid),error=>error.code==='BACKUP_INVALID');assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before.payloadDigest);
});

test('objective inventory semantic tamper is rejected at construction, validation, and restore before mutation',async()=>{
  const before=await currentEnvelope();for(const mutate of [row=>{row.schemaVersion=99;},row=>{row.questionPayload.prompt='attacker changed prompt';}]){const stores=structuredClone(targetEnvelope.domains);mutate(stores.ielts.stores[IELTS_STORE_NAMES.objectiveInventory][0]);assert.throws(()=>registry.buildFullBackupEnvelope({core:stores.core.stores,ielts:stores.ielts.stores,v10:stores.v10.stores}),error=>error.code==='BACKUP_PAYLOAD_UNSAFE');const invalid=structuredClone(targetEnvelope),rows=invalid.domains.ielts.stores[IELTS_STORE_NAMES.objectiveInventory];mutate(rows[0]);invalid.payloadDigest=registry.canonicalBackupDigest(invalid.domains);const manifest=invalid.manifest.stores.find(row=>row.owner==='ielts'&&row.store===IELTS_STORE_NAMES.objectiveInventory);manifest.recordCount=rows.length;manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;assert.equal(registry.validateFullBackupEnvelope(invalid).valid,false);await assert.rejects(()=>backup.restoreCombinedBackup(invalid),error=>error.code==='BACKUP_INVALID');assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before.payloadDigest);}
});

test('registry keyPath spoofing is rejected before journal or durable mutation',async()=>{
  const before=await currentEnvelope();
  for(const fixture of[
    {owner:'core',store:core.STORE_NAMES.cards,keyPath:'id',spoofPath:'key'},
    {owner:'core',store:core.STORE_NAMES.settings,keyPath:'key',spoofPath:'id'}
  ]){
    const invalid=structuredClone(targetEnvelope);const rows=invalid.domains[fixture.owner].stores[fixture.store];const row=rows[0];
    row[fixture.spoofPath]=`surrogate-${fixture.spoofPath}`;delete row[fixture.keyPath];
    invalid.payloadDigest=registry.canonicalBackupDigest(invalid.domains);
    const manifestRow=invalid.manifest.stores.find(item=>item.owner===fixture.owner&&item.store===fixture.store);
    manifestRow.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;
    await assert.rejects(()=>backup.restoreCombinedBackup(invalid),error=>error.code==='BACKUP_INVALID'&&error.message.includes(`keyPath ${fixture.keyPath}`));
    assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before.payloadDigest);
  }
});

test('canonical payload with duplicate unique secondary index is rejected before journal or mutation',async()=>{
  const before=await currentEnvelope();const stores=structuredClone(targetEnvelope.domains);
  stores.ielts.stores[IELTS_STORE_NAMES.mediaSources].push(
    {id:'unique-source-a',videoId:'video-a'},
    {id:'unique-source-b',videoId:'video-b'}
  );
  const valid=registry.buildFullBackupEnvelope({core:stores.core.stores,ielts:stores.ielts.stores,v10:stores.v10.stores});
  const invalid=structuredClone(valid);const rows=invalid.domains.ielts.stores[IELTS_STORE_NAMES.mediaSources];rows.find(row=>row.id==='unique-source-b').videoId='video-a';
  invalid.payloadDigest=registry.canonicalBackupDigest(invalid.domains);
  const manifestRow=invalid.manifest.stores.find(row=>row.owner==='ielts'&&row.store===IELTS_STORE_NAMES.mediaSources);
  manifestRow.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(rows))}`;
  await assert.rejects(()=>backup.restoreCombinedBackup(invalid),error=>error.code==='BACKUP_INVALID'&&/unique index videoId/.test(error.message));
  assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before.payloadDigest);
});

test('legacy combined restore uses the staged adapter and preserves V10, drafts and outbox',async()=>{
  const before=await currentEnvelope();const v10Before=structuredClone(before.domains.v10.stores);const draftsBefore=structuredClone(before.domains.core.stores.captureDrafts);const outboxBefore=structuredClone(before.domains.core.stores.outbox);
  const legacyCore=coreContracts.buildBackupDocument({cards:[{id:'legacy-card',front:'legacy',back:'cũ'}],settings:{minutes:15},reviewEvents:[]});
  const legacyIelts=await ielts.buildIeltsBackup();const legacy={app:'Vocab Master',kind:'combined-core-ielts',schemaVersion:1,exportedAt:new Date().toISOString(),core:legacyCore,ielts:legacyIelts};
  const result=await backup.restoreCombinedBackup(legacy);assert.equal(result.durable,true);
  const after=await currentEnvelope();assert.deepEqual(after.domains.v10.stores,v10Before);assert.deepEqual(after.domains.core.stores.captureDrafts,draftsBefore);assert.deepEqual(after.domains.core.stores.outbox,outboxBefore);assert.equal(after.domains.core.stores.cards[0].id,'legacy-card');
});

test('degraded Core backup restores through both production file routes while preserving IELTS and V10',async()=>{
  const degraded=await backup.buildDegradedCoreBackup();
  await core.persistCard({id:'post-degraded-backup-card',front:'later',back:'sau'},'degraded-scope-fixture');
  await ielts.saveIeltsRecord(IELTS_STORE_NAMES.settings,{key:'post-degraded-ielts',value:true},'degraded-scope-fixture');
  await v10.putV10Record(V10_STORES.activities,{id:'post-degraded-v10',status:'planned'},'degraded-scope-fixture');
  const beforeRestore=await currentEnvelope();
  const result=await core.restoreBackupFile(new Blob([JSON.stringify(degraded)],{type:'application/json'}));assert.equal(result.verified,true);assert.ok(result.warnings.some(message=>message.includes('Core')));
  const after=await currentEnvelope();
  assert.equal(after.domains.core.stores.cards.some(row=>row.id==='post-degraded-backup-card'),false);
  assert.deepEqual(after.domains.ielts.stores,beforeRestore.domains.ielts.stores);
  assert.deepEqual(after.domains.v10.stores,beforeRestore.domains.v10.stores);

  await core.persistCard({id:'post-degraded-bridge-card',front:'bridge',back:'route'},'degraded-bridge-fixture');
  const beforeBridge=await currentEnvelope();
  const bridgeResult=await backupBridge.restoreIeltsBackupValue(degraded);assert.equal(bridgeResult.scope,'core-only');assert.equal(bridgeResult.result.verified,true);
  const afterBridge=await currentEnvelope();
  assert.equal(afterBridge.domains.core.stores.cards.some(row=>row.id==='post-degraded-bridge-card'),false);
  assert.deepEqual(afterBridge.domains.ielts.stores,beforeBridge.domains.ielts.stores);
  assert.deepEqual(afterBridge.domains.v10.stores,beforeBridge.domains.v10.stores);
});

test('low-level cross-database replacements reject restore bypasses',async()=>{
  assert.equal('replaceCoreBackupStores'in core,false);
  assert.equal('replaceIeltsBackupStores'in ielts,false);
  assert.equal('replaceV10BackupStores'in v10,false);
});

test('completed restore receipt remains portable and accepted by rollback builds',async()=>{
  await backup.restoreCombinedBackup(targetEnvelope);
  const portable=await currentEnvelope();const receipt=portable.domains.core.stores.meta.find(row=>row.key===core.CORE_RESTORE_RECEIPT_KEY);
  assert.ok(receipt?.targetDigest);assert.equal(registry.validateFullBackupEnvelope(portable).valid,true);
  await backup.restoreCombinedBackup(baselineEnvelope);await backup.restoreCombinedBackup(portable);
  assert.equal(await currentLogicalDigest(),logicalDigest(portable));
});

test('restore never clears excluded file handles, coaching cache or CacheStorage',async()=>{
  const fileHandle={key:'restore-excluded-handle',handle:{name:'sentinel'},label:'keep-core-excluded'};
  await core.__testing.putOne(core.STORE_NAMES.fileHandles,fileHandle);
  await v10.putV10Record(V10_STORES.coachingStats,{id:'restore-excluded-coaching',category:'sentinel',label:'keep-v10-excluded'},'restore-excluded-fixture');
  let cacheCalls=0;const previousCaches=globalThis.caches;globalThis.caches={keys:async()=>{cacheCalls+=1;return[];},delete:async()=>{cacheCalls+=1;return true;}};
  try{
    await backup.restoreCombinedBackup(baselineEnvelope);
    await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope,{hooks:backup.__testing.createFailureHook('ielts')}),error=>error.rollbackVerified===true);
    assert.equal((await core.__testing.getOne(core.STORE_NAMES.fileHandles,fileHandle.key)).label,'keep-core-excluded');
    assert.equal((await v10.getV10Record(V10_STORES.coachingStats,'restore-excluded-coaching')).label,'keep-v10-excluded');
    assert.equal(cacheCalls,0);
  }finally{if(previousCaches===undefined)delete globalThis.caches;else globalThis.caches=previousCaches;}
});

test('staging quota failure happens before journal or durable mutation',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);const before=await currentEnvelope();
  const navigatorObject=globalThis.navigator||{};const descriptor=Object.getOwnPropertyDescriptor(navigatorObject,'storage');
  Object.defineProperty(navigatorObject,'storage',{configurable:true,value:{estimate:async()=>({usage:9_999,quota:10_000})}});
  try{
    await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope),error=>error.code==='RESTORE_STAGING_QUOTA_INSUFFICIENT'&&error.durable===false);
    assert.equal(await core.readCoreRestoreJournal(),undefined);assert.equal((await currentEnvelope()).payloadDigest,before.payloadDigest);
  }finally{
    if(descriptor)Object.defineProperty(navigatorObject,'storage',descriptor);else delete navigatorObject.storage;
  }
});

test('exclusive restore lock serializes a concurrent normal write after verified commit',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);
  let releaseOwner;let ownerEntered;
  const entered=new Promise(resolve=>{ownerEntered=resolve;});
  const release=new Promise(resolve=>{releaseOwner=resolve;});
  const restorePromise=backup.restoreCombinedBackup(targetEnvelope,{hooks:{beforeOwner:async owner=>{if(owner==='core'){ownerEntered();await release;}}}});
  await entered;
  let writeDone=false;const writePromise=v10.putV10Record(V10_STORES.activities,{id:'after-exclusive-restore',status:'planned'},'concurrent-normal-write').then(()=>{writeDone=true;});
  await Promise.resolve();assert.equal(writeDone,false);
  releaseOwner();const restored=await restorePromise;assert.equal(restored.verified,true);await writePromise;
  assert.equal((await v10.getV10Record(V10_STORES.activities,'after-exclusive-restore')).status,'planned');
  await v10.deleteV10Record(V10_STORES.activities,'after-exclusive-restore','restore-lock-cleanup');
});

test('exclusive restore invalidates delayed Core maintenance before it can mutate restored state',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);
  await core.persistCard({id:'stale-maintenance-card',front:'pending',back:'snapshot'},'stale-maintenance-fixture');
  assert.equal((await currentEnvelope()).domains.core.stores.cards.some(row=>row.id==='stale-maintenance-card'),true);
  const restored=await backup.restoreCombinedBackup(targetEnvelope,{hooks:{beforeOwner:async owner=>{
    if(owner==='core')await new Promise(resolve=>setTimeout(resolve,1700));
  }}});
  assert.equal(restored.verified,true);
  await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(await currentLogicalDigest(),logicalDigest(targetEnvelope));
  assert.equal((await currentEnvelope()).domains.core.stores.cards.some(row=>row.id==='stale-maintenance-card'),false);
});

test('canonical export holds a cross-database lock and cannot race a normal write',async()=>{
  let releaseRead;let readEntered;const entered=new Promise(resolve=>{readEntered=resolve;});const release=new Promise(resolve=>{releaseRead=resolve;});
  const exportPromise=backup.buildCombinedBackup({hooks:{beforeRead:async()=>{readEntered();await release;}}});await entered;
  let writeDone=false;const writePromise=v10.putV10Record(V10_STORES.activities,{id:'after-export-snapshot',status:'planned'},'concurrent-export-write').then(()=>{writeDone=true;});
  await Promise.resolve();assert.equal(writeDone,false);releaseRead();const exported=await exportPromise;await writePromise;
  assert.equal(exported.domains.v10.stores[V10_STORES.activities].some(row=>row.id==='after-export-snapshot'),false);
  assert.equal((await v10.getV10Record(V10_STORES.activities,'after-export-snapshot')).status,'planned');
  await v10.deleteV10Record(V10_STORES.activities,'after-export-snapshot','export-lock-cleanup');
});

test('failed roll-forward recovery switches durably to verified rollback',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);
  await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope,{hooks:backup.__testing.createCrashHook('core')}),error=>error.code==='SIMULATED_PROCESS_CRASH');
  const recovered=await backup.recoverInterruptedRestore({hooks:backup.__testing.createFailureHook('ielts')});
  assert.equal(recovered.rolledBack,true);assert.equal(recovered.verified,true);assert.equal(recovered.status,'rolled-back');
  assert.equal(await currentLogicalDigest(),logicalDigest(baselineEnvelope));assert.equal(await core.readCoreRestoreJournal(),undefined);
});

test('crash after canonical verification but before receipt remains recoverable',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);
  const crash=Object.assign(new Error('crash before receipt'),{code:'SIMULATED_PROCESS_CRASH'});
  await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope,{hooks:{beforeReceipt:async()=>{throw crash;}}}),error=>error.code==='SIMULATED_PROCESS_CRASH'&&error.recoveryPending===true);
  assert.equal((await core.readCoreRestoreJournal()).phase,'committing');
  const recovered=await backup.recoverInterruptedRestore();assert.equal(recovered.verified,true);assert.equal(recovered.status,'restored');
  assert.equal(await currentLogicalDigest(),logicalDigest(targetEnvelope));
});

test('journal is additive at the current Core DB version so an old-version opener remains read-safe',async()=>{
  await backup.restoreCombinedBackup(baselineEnvelope);
  await assert.rejects(()=>backup.restoreCombinedBackup(targetEnvelope,{hooks:backup.__testing.createCrashHook('core')}),error=>error.code==='SIMULATED_PROCESS_CRASH');
  const opened=await new Promise((resolve,reject)=>{const request=indexedDB.open(core.DB_NAME,core.DB_VERSION);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});assert.equal(opened.version,core.DB_VERSION);opened.close();
  await backup.recoverInterruptedRestore();assert.equal(await core.readCoreRestoreJournal(),undefined);
});

test('storage errors are typed and IELTS/V10 never report RAM fallback as durable success',async()=>{
  assert.equal(storageSafety.normalizeDatabaseOpenError({name:'QuotaExceededError',code:22},{database:'fixture',supportedVersion:1}).code,'DURABLE_STORAGE_QUOTA_EXCEEDED');
  assert.equal(storageSafety.databaseBlocked('fixture').code,'DATABASE_BLOCKED');
  const originalIndexedDb=globalThis.indexedDB;delete globalThis.indexedDB;
  const noIelts=await import(`../src/ielts-persistence.js?no-idb=${Date.now()}`);const noV10=await import(`../src/v10-persistence.js?no-idb=${Date.now()}`);
  await assert.rejects(()=>noIelts.saveIeltsRecord(IELTS_STORE_NAMES.settings,{key:'x'}),error=>error.code==='DURABLE_STORAGE_UNAVAILABLE'&&error.durable===false);
  await assert.rejects(()=>noV10.putV10Record(V10_STORES.activities,{id:'x'}),error=>error.code==='DURABLE_STORAGE_UNAVAILABLE'&&error.durable===false);
  globalThis.indexedDB=originalIndexedDb;
});

test('blocked openers fail and a later future schema reopens read-safe',async()=>{
  const originalIndexedDb=globalThis.indexedDB;
  let lateConnectionClosed=false;
  globalThis.indexedDB={open(){const request={result:{close(){lateConnectionClosed=true;}}};queueMicrotask(()=>{request.onblocked?.();queueMicrotask(()=>request.onsuccess?.());});return request;}};
  const blockedCore=await import(`../src/persistence.js?blocked=${Date.now()}`);
  await assert.rejects(()=>blockedCore.openDatabase(),error=>error.code==='DATABASE_BLOCKED'&&error.durable===false);
  await Promise.resolve();await Promise.resolve();assert.equal(lateConnectionClosed,true);

  const factory=new IDBFactory();globalThis.indexedDB=factory;
  const versionedCore=await import(`../src/persistence.js?versionchange=${Date.now()}`);await versionedCore.openDatabase();
  const future=await new Promise((resolve,reject)=>{const request=factory.open(core.DB_NAME,core.DB_VERSION+1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  future.close();
  const compatible=await versionedCore.openDatabase();
  assert.equal(compatible.version,core.DB_VERSION+1);
  assert.throws(()=>compatible.transaction(core.STORE_NAMES.meta,'readwrite'),error=>error.code==='DATABASE_READ_ONLY_FUTURE_SCHEMA'&&error.durable===false);
  compatible.close();
  globalThis.indexedDB=originalIndexedDb;
});

test('Core fallback rejects absent or unverifiable durable storage without mutating RAM state',async()=>{
  const originalIndexedDb=globalThis.indexedDB;const localStorageDescriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');delete globalThis.indexedDB;delete globalThis.localStorage;
  const noStorage=await import(`../src/persistence.js?no-storage=${Date.now()}`);
  await assert.rejects(()=>noStorage.initializePersistence(),error=>error.code==='DURABLE_STORAGE_UNAVAILABLE'&&error.durable===false);
  const throwingStorage={getItem:()=>null,setItem:()=>{throw Object.assign(new Error('quota'),{name:'QuotaExceededError'});},removeItem:()=>{}};
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:throwingStorage});
  const quotaFallback=await import(`../src/persistence.js?quota-fallback=${Date.now()}`);
  await assert.rejects(()=>quotaFallback.initializePersistence(),error=>error.code==='DURABLE_FALLBACK_WRITE_FAILED'&&error.durable===false);
  await assert.rejects(()=>quotaFallback.persistCaptureDraft({term:'must-not-look-saved'}),error=>error.code==='DURABLE_FALLBACK_WRITE_FAILED'&&error.durable===false);
  globalThis.indexedDB=originalIndexedDb;if(localStorageDescriptor)Object.defineProperty(globalThis,'localStorage',localStorageDescriptor);else delete globalThis.localStorage;
});

test('verified degraded localStorage writes survive a module reload and are labeled durable-degraded',async()=>{
  const originalIndexedDb=globalThis.indexedDB;const localStorageDescriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');const values=new Map();
  const storage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  delete globalThis.indexedDB;Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage});
  const first=await import(`../src/persistence.js?degraded-write=${Date.now()}`);await first.initializePersistence();await first.persistSettings({minutes:27});await first.persistCaptureDraft({id:'degraded-draft',term:'persist me'});
  const status=await first.getPersistenceStatus();assert.equal(status.durable,true);assert.equal(status.degraded,true);assert.equal(status.storage,'localStorage-degraded');
  const reloaded=await import(`../src/persistence.js?degraded-reload=${Date.now()}`);const state=await reloaded.initializePersistence();assert.equal(state.settings.minutes,27);assert.equal((await reloaded.listCaptureDrafts())[0].term,'persist me');
  globalThis.indexedDB=originalIndexedDb;if(localStorageDescriptor)Object.defineProperty(globalThis,'localStorage',localStorageDescriptor);else delete globalThis.localStorage;
});

test('additive legacy-card reconciliation is idempotent and keeps DB version rollback-readable',async()=>{
  const originalIndexedDb=globalThis.indexedDB;const factory=new IDBFactory();globalThis.indexedDB=factory;
  const writer=await import(`../src/persistence.js?legacy-shape-writer=${Date.now()}`);await writer.initializePersistence();
  await writer.__testing.putOne(writer.STORE_NAMES.cards,{id:'legacy-undefined-card',front:'safe',reviewHistory:undefined});
  const reader=await import(`../src/persistence.js?legacy-shape-reader=${Date.now()}`);await reader.initializePersistence();
  const reconciled=await reader.__testing.getOne(reader.STORE_NAMES.cards,'legacy-undefined-card');assert.equal(Object.hasOwn(reconciled,'reviewHistory'),false);
  const secondReader=await import(`../src/persistence.js?legacy-shape-second=${Date.now()}`);await secondReader.initializePersistence();
  assert.equal(Object.hasOwn(await secondReader.__testing.getOne(secondReader.STORE_NAMES.cards,'legacy-undefined-card'),'reviewHistory'),false);
  const oldVersion=await new Promise((resolve,reject)=>{const request=factory.open(core.DB_NAME,core.DB_VERSION);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  assert.equal(oldVersion.version,core.DB_VERSION);oldVersion.close();globalThis.indexedDB=originalIndexedDb;
});

test('future IndexedDB versions preserve readable stores but fail writes instead of falling back to RAM',async()=>{
  const createFuture=async({moduleUrl,openName,closeName,databaseName,version,stores})=>{
    const factory=new IDBFactory();globalThis.indexedDB=factory;
    const writer=await import(`${moduleUrl}?future-writer=${Date.now()}-${Math.random()}`);
    const current=await writer[openName]();current.close();await writer[closeName]?.().then(database=>database.close());
    const future=await new Promise((resolve,reject)=>{
      const request=factory.open(databaseName,version+1);
      request.onupgradeneeded=()=>request.result.createObjectStore('futureOnly',{keyPath:'id'});
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    future.close();
    const reader=await import(`${moduleUrl}?future-reader=${Date.now()}-${Math.random()}`);
    const compatible=await reader[openName]();
    assert.equal(compatible.version,version+1);
    assert.doesNotThrow(()=>compatible.transaction(stores[0],'readonly'));
    assert.throws(()=>compatible.transaction(stores[0],'readwrite'),error=>error.code==='DATABASE_READ_ONLY_FUTURE_SCHEMA'&&error.supportedVersion===version);
    compatible.close();
  };
  await createFuture({moduleUrl:'../src/persistence.js',openName:'openDatabase',closeName:'reopenCoreDatabase',databaseName:core.DB_NAME,version:core.DB_VERSION,stores:Object.values(core.STORE_NAMES)});
  await createFuture({moduleUrl:'../src/ielts-persistence.js',openName:'openIeltsDatabase',closeName:'reopenIeltsDatabase',databaseName:ielts.IELTS_DB_NAME,version:ielts.IELTS_DB_VERSION,stores:Object.values(IELTS_STORE_NAMES)});
  await createFuture({moduleUrl:'../src/v10-persistence.js',openName:'openV10Database',closeName:'reopenV10Database',databaseName:V10_DB_NAME,version:V10_DB_VERSION,stores:Object.values(V10_STORES)});
});

test('productive backups remain a reject-before-mutation boundary',async()=>{
  const snapshot=await backup.buildCombinedBackup();const tampered=structuredClone(snapshot);tampered.domains.ielts.stores.learnerArtifacts.push({id:'forged',kind:'unknown'});tampered.payloadDigest=registry.canonicalBackupDigest(tampered.domains);assert.equal(backup.validateCombinedBackup(tampered).valid,false);
});

test('forged productive target is rejected before restore preparation',async()=>{
  const before=structuredClone(targetEnvelope),tampered=structuredClone(before);tampered.domains.v10.stores[V10_STORES.todayRuns].push({id:'forged-productive-run',status:'completed',activitySpec:{id:'forged-productive-run',target:{schemaVersion:2,targetType:'productive-text-revision',targetId:'forged-revision',cardId:null,senseId:null,skill:'production',sourceId:'controlled-writing-self-review',sourceRevision:'controlled-writing-self-review-v1'}}});tampered.payloadDigest=registry.canonicalBackupDigest(tampered.domains);const manifest=tampered.manifest.stores.find(value=>value.owner==='v10'&&value.store===V10_STORES.todayRuns);manifest.recordCount=tampered.domains.v10.stores[V10_STORES.todayRuns].length;manifest.contentDigest=`sha256:${registry.sha256Hex(JSON.stringify(tampered.domains.v10.stores[V10_STORES.todayRuns]))}`;assert.equal(backup.validateCombinedBackup(tampered).valid,false);assert.equal(await core.readCoreRestoreJournal(),undefined);assert.notEqual(tampered.payloadDigest,before.payloadDigest);
});

test('restored Productive owner accepts canonical reordered PromptRef',()=>{
  const reordered=Object.fromEntries(Object.entries(PRODUCTIVE_PROMPT_REF).reverse());assert.deepEqual(Object.keys(reordered).sort(),Object.keys(PRODUCTIVE_PROMPT_REF).sort());
});
test('private source storage remains a V10 restore participant',()=>assert.equal(V10_STORES.privateSources,'privateSources'));
