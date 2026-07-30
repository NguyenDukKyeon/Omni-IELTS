import test from 'node:test';
import assert from 'node:assert/strict';
import { createContentLifecycle } from '../src/content-lifecycle.js';

const now=Date.parse('2026-07-30T12:00:00.000Z');
const address=character=>`sha256:${character.repeat(64)}`;
const clone=value=>value==null?value:structuredClone(value);

function lesson({id='lesson:listening-01',packId='pack:week-1',revision=1,skill='listening',assetAddress=address('a')}={}){
  const activityId=`activity:${id}:one`;
  return{
    id,packId,packRevision:revision,contentRevision:revision,contentAddress:address(revision===1?'b':'c'),
    title:`Lesson ${id}`,learningObjective:'Practice one exact target.',estimatedMinutes:6,
    skill,installState:'installed',verified:true,qualityStatus:'verified',
    compatibility:{minimumAppVersion:'10.0.0'},
    activities:[{
      id:activityId,type:'dictation',prompt:'Listen.',answer:{text:'answer'},
      target:{
        contract:'RemoteContentActivityTarget',schemaVersion:2,
        packId,packRevision:revision,lessonId:id,lessonRevision:revision,activityId,
        contentRevision:revision,cardId:activityId,senseId:null,skill:'listening',
        sourceId:`remote-content:${id}`,sourceRevision:address('f')
      }
    }],
    assetDescriptors:[{
      id:`asset:${id}`,contentAddress:assetAddress,byteLength:4,
      mediaType:'application/json',retrievalUrl:`https://content.example.test/${assetAddress.slice(7)}.json`
    }]
  };
}

function installed({packId='pack:week-1',revision=1,lessonRows=[lesson()],assetAddresses=[address('a')],state='installed'}={}){
  return{
    id:`installed:${packId}`,packId,state,activeRevision:revision,manifestAddress:address(revision===1?'d':'e'),
    lessonIds:lessonRows.map(row=>row.id),assetAddresses,
    manifestSnapshot:{id:packId,contentRevision:revision,lessons:lessonRows,assets:lessonRows.flatMap(row=>row.assetDescriptors)},
    revisionHistory:[]
  };
}

function memoryRepository({installedRows=[],lessonRows=[],progressRows=[],revocations=[]}={}){
  const packs=new Map(installedRows.map(row=>[row.packId,clone(row)]));
  const lessons=new Map(lessonRows.map(row=>[row.id,clone(row)]));
  const progress=new Map(progressRows.map(row=>[row.lessonId,clone(row)]));
  const tombstones=[];
  return{
    packs,lessons,progress,tombstones,
    listInstalled:async()=>[...packs.values()].map(clone),
    getInstalled:async packId=>clone(packs.get(packId)||null),
    listLessons:async()=>[...lessons.values()].map(clone),
    getLesson:async id=>clone(lessons.get(id)||null),
    getProgress:async id=>clone(progress.get(id)||null),
    saveProgress:async row=>{progress.set(row.lessonId,clone(row));return row;},
    listRevocations:async()=>clone(revocations),
    async setPackState(packId,state,patch={}){
      const current=packs.get(packId);if(!current)return null;
      const next={...current,...clone(patch),state};packs.set(packId,next);return clone(next);
    },
    async deletePack(pack,{unreferencedAddresses,deletedAt}){
      packs.set(pack.packId,{...pack,state:'deleted',lessonIds:[],assetAddresses:[],deletedAt});
      for(const id of pack.lessonIds||[]){const row=lessons.get(id);if(row)lessons.set(id,{...row,installState:'uninstalled',verified:false,qualityStatus:'validated'});}
      const tombstone={packId:pack.packId,deletedAt,unreferenced:[...unreferencedAddresses]};
      tombstones.push(tombstone);return{deleted:true,tombstone};
    },
    async rollback(pack,revision,{activatedAt}){
      const target=pack.revisionHistory.find(row=>row.revision===revision);
      const currentHistory={revision:pack.activeRevision,manifestSnapshot:pack.manifestSnapshot,assetAddresses:pack.assetAddresses,lessonIds:pack.lessonIds,manifestAddress:pack.manifestAddress};
      const next={...pack,activeRevision:revision,manifestSnapshot:target.manifestSnapshot,assetAddresses:target.assetAddresses,lessonIds:target.lessonIds,manifestAddress:target.manifestAddress,revisionHistory:[currentHistory],activatedAt,state:'installed'};
      packs.set(pack.packId,next);
      for(const row of target.manifestSnapshot.lessons)lessons.set(row.id,{...row,installState:'installed',verified:true,qualityStatus:'verified'});
      return{installed:clone(next),receipt:{rollback:true,activatedRevision:revision}};
    }
  };
}

function memoryAssets(entries=[]){
  const values=new Map(entries.map(([key,value])=>[key,value]));
  const deleted=[];
  return{
    values,deleted,
    async readFinal(descriptor){const value=values.get(descriptor.contentAddress);return value?clone(value):null;},
    async deleteFinal(contentAddress){deleted.push(contentAddress);return values.delete(contentAddress);}
  };
}

function setup({packRows,lessonRows,progressRows=[],revocations=[],catalogRevocations=[],assetEntries=[],catalogExpired=false}={}){
  const repository=memoryRepository({installedRows:packRows,lessonRows,progressRows,revocations});
  const assetStore=memoryAssets(assetEntries);
  const catalog={
    schemaVersion:2,catalogId:'catalog:test',sequence:2,catalogRevision:2,
    issuedAt:'2026-07-30T10:00:00.000Z',expiresAt:'2027-07-30T10:00:00.000Z',
    entries:(packRows||[]).map(pack=>({
      packId:pack.packId,contentRevision:pack.activeRevision,byteLength:1000,lessonCount:pack.lessonIds.length,
      rights:{status:'approved'},provenance:{sourceType:'original-human-authored'},humanReview:{status:'approved'},
      compatibility:{minimumAppVersion:'10.0.0'}
    })),
    revocations:catalogRevocations
  };
  const catalogTrust={current:async()=>({payload:catalog,...(catalogExpired?{expired:true,trustState:'expired-last-known-good'}:{})})};
  const installer={install:async packId=>({status:'installed',packId}),cancel:async()=>({cancelled:true})};
  const lifecycle=createContentLifecycle({catalogTrust,installer,repository,assetStore,clock:()=>now});
  return{lifecycle,repository,assetStore,catalog};
}

test('fully installed lesson launches offline from verified cache and records durable progress',async()=>{
  const row=lesson(),pack=installed({lessonRows:[row]});
  const setupValue=setup({packRows:[pack],lessonRows:[row],assetEntries:[[address('a'),{bytes:new TextEncoder().encode('{"segments":[]}'),mediaType:'application/json'}]]});
  const launched=await setupValue.lifecycle.launch(row.id);
  assert.equal(launched.offline,true);
  assert.deepEqual(launched.assets[`asset:${row.id}`],{segments:[]});
  const progress=await setupValue.lifecycle.recordProgress(row.id,row.activities[0].id,{status:'completed',attemptId:'attempt-1',receiptId:'receipt-1'});
  assert.equal(progress.status,'completed');
  assert.equal(setupValue.repository.progress.get(row.id).completedActivityIds[0],row.activities[0].id);
});

test('cleared CacheStorage never deletes progress and produces a recoverable reinstall state',async()=>{
  const row=lesson(),pack=installed({lessonRows:[row]});
  const existingProgress={id:row.id,lessonId:row.id,status:'completed',completedActivityIds:[row.activities[0].id]};
  const setupValue=setup({packRows:[pack],lessonRows:[row],progressRows:[existingProgress]});
  const reconciled=await setupValue.lifecycle.reconcileMissingAssets();
  assert.equal(reconciled.missing[0].packId,pack.packId);
  assert.equal(setupValue.repository.packs.get(pack.packId).state,'reinstall-required');
  assert.deepEqual(setupValue.repository.progress.get(row.id),existingProgress);
  await assert.rejects(()=>setupValue.lifecycle.launch(row.id),error=>error.code==='CONTENT_REINSTALL_REQUIRED');
});

test('delete preserves learner progress and removes only assets not shared by another installed pack',async()=>{
  const shared=address('a'),unique=address('f');
  const firstLesson=lesson({id:'lesson:first',packId:'pack:first',assetAddress:shared});
  const secondLesson=lesson({id:'lesson:second',packId:'pack:second',assetAddress:shared});
  const first=installed({packId:'pack:first',lessonRows:[firstLesson],assetAddresses:[shared,unique]});
  const second=installed({packId:'pack:second',lessonRows:[secondLesson],assetAddresses:[shared]});
  const progress={id:firstLesson.id,lessonId:firstLesson.id,status:'completed'};
  const setupValue=setup({
    packRows:[first,second],lessonRows:[firstLesson,secondLesson],progressRows:[progress],
    assetEntries:[[shared,{bytes:new Uint8Array([1]),mediaType:'audio/wav'}],[unique,{bytes:new Uint8Array([2]),mediaType:'audio/wav'}]]
  });
  const result=await setupValue.lifecycle.remove('pack:first');
  assert.equal(result.deleted,true);
  assert.deepEqual(setupValue.assetStore.deleted,[unique]);
  assert.equal(setupValue.assetStore.values.has(shared),true);
  assert.deepEqual(setupValue.repository.progress.get(firstLesson.id),progress);
  assert.equal(setupValue.repository.tombstones.length,1);
});

test('delete then reinstall reconnects existing progress by stable lesson ID',async()=>{
  const row=lesson(),pack=installed({lessonRows:[row]});
  const progress={id:row.id,lessonId:row.id,status:'completed',completedActivityIds:[row.activities[0].id]};
  const setupValue=setup({packRows:[pack],lessonRows:[row],progressRows:[progress]});
  await setupValue.lifecycle.remove(pack.packId);
  setupValue.repository.packs.set(pack.packId,clone(pack));
  setupValue.repository.lessons.set(row.id,clone(row));
  assert.deepEqual(setupValue.repository.progress.get(row.id),progress);
  assert.equal((await setupValue.lifecycle.listLessons()).length,1);
});

test('revoked pack stops new launches without deleting historical evidence',async()=>{
  const row=lesson(),pack=installed({lessonRows:[row]});
  const revocation={packId:pack.packId,packRevision:pack.activeRevision,reasonCode:'rights-withdrawn',reason:'Rights withdrawn.',revokedAt:new Date(now).toISOString()};
  const progress={id:row.id,lessonId:row.id,status:'completed'};
  const setupValue=setup({packRows:[pack],lessonRows:[row],progressRows:[progress],catalogRevocations:[revocation],assetEntries:[[address('a'),{bytes:new TextEncoder().encode('{}'),mediaType:'application/json'}]]});
  const applied=await setupValue.lifecycle.applyRevocations();
  assert.deepEqual(applied.revoked,[pack.packId]);
  await assert.rejects(()=>setupValue.lifecycle.launch(row.id),error=>error.code==='CONTENT_PACK_REVOKED');
  assert.deepEqual(setupValue.repository.progress.get(row.id),progress);
});

test('rollback switches atomically to a cached immutable prior revision',async()=>{
  const oldLesson=lesson({revision:1,assetAddress:address('a')});
  const newLesson=lesson({revision:2,assetAddress:address('f')});
  const pack=installed({revision:2,lessonRows:[newLesson],assetAddresses:[address('f')]});
  pack.revisionHistory=[{
    revision:1,manifestAddress:address('d'),assetAddresses:[address('a')],lessonIds:[oldLesson.id],
    manifestSnapshot:{id:pack.packId,contentRevision:1,lessons:[oldLesson],assets:oldLesson.assetDescriptors}
  }];
  const setupValue=setup({
    packRows:[pack],lessonRows:[newLesson],
    assetEntries:[[address('a'),{bytes:new TextEncoder().encode('{}'),mediaType:'application/json'}],[address('f'),{bytes:new TextEncoder().encode('{}'),mediaType:'application/json'}]]
  });
  const result=await setupValue.lifecycle.rollback(pack.packId,1);
  assert.equal(result.installed.activeRevision,1);
  assert.equal(result.receipt.rollback,true);
});

test('stale deep links and unavailable content fail closed; Today uses only exact installed targets',async()=>{
  const installedLesson=lesson(),stale=lesson({id:'lesson:stale',revision:1});
  stale.packRevision=2;
  const pack=installed({lessonRows:[installedLesson]});
  const setupValue=setup({packRows:[pack],lessonRows:[installedLesson,stale]});
  await assert.rejects(()=>setupValue.lifecycle.launch('lesson:missing'),error=>error.code==='CONTENT_LESSON_MISSING');
  await assert.rejects(()=>setupValue.lifecycle.launch(stale.id),error=>error.code==='CONTENT_STALE_DEEP_LINK');
  const inventory=await setupValue.lifecycle.todayInventory();
  assert.equal(inventory.length,1);
  assert.equal(inventory[0].lessonId,installedLesson.id);
  assert.equal(inventory[0].activityId,installedLesson.activities[0].id);
  assert.equal(inventory[0].target.sourceRevision,installedLesson.activities[0].target.sourceRevision);
  assert.equal(inventory[0].payload.packRevision,pack.activeRevision);
});

test('durable revocation survives catalog omission and blocks browse, launch and Today',async()=>{
  const row=lesson(),pack=installed({lessonRows:[row]});
  const durableRevocation={
    id:`revocation:${pack.packId}:1`,
    packId:pack.packId,
    packRevision:1,
    reasonCode:'rights-withdrawn',
    reason:'Rights withdrawn.',
    revokedAt:new Date(now).toISOString()
  };
  const setupValue=setup({
    packRows:[pack],
    lessonRows:[row],
    revocations:[durableRevocation],
    catalogRevocations:[],
    assetEntries:[[address('a'),{bytes:new TextEncoder().encode('{}'),mediaType:'application/json'}]]
  });
  const browsed=await setupValue.lifecycle.browse();
  assert.equal(browsed.packs[0].state,'revoked');
  assert.equal(browsed.packs[0].catalogInstallable,false);
  assert.deepEqual((await setupValue.lifecycle.applyRevocations()).revoked,[pack.packId]);
  await assert.rejects(()=>setupValue.lifecycle.launch(row.id),error=>error.code==='CONTENT_PACK_REVOKED');
  assert.deepEqual(await setupValue.lifecycle.todayInventory(),[]);
});

test('durable revocation blocks rollback to the revoked historical revision',async()=>{
  const oldLesson=lesson({revision:1,assetAddress:address('a')});
  const newLesson=lesson({revision:2,assetAddress:address('f')});
  const pack=installed({revision:2,lessonRows:[newLesson],assetAddresses:[address('f')]});
  pack.revisionHistory=[{
    revision:1,manifestAddress:address('d'),assetAddresses:[address('a')],lessonIds:[oldLesson.id],
    manifestSnapshot:{id:pack.packId,contentRevision:1,lessons:[oldLesson],assets:oldLesson.assetDescriptors}
  }];
  const setupValue=setup({
    packRows:[pack],
    lessonRows:[newLesson],
    revocations:[{id:'revocation:rollback:1',packId:pack.packId,packRevision:1,reasonCode:'defect',reason:'Defect.',revokedAt:new Date(now).toISOString()}],
    assetEntries:[[address('a'),{bytes:new TextEncoder().encode('{}'),mediaType:'application/json'}]]
  });
  await assert.rejects(()=>setupValue.lifecycle.rollback(pack.packId,1),error=>error.code==='CONTENT_PACK_REVOKED');
  assert.equal(setupValue.repository.packs.get(pack.packId).activeRevision,2);
});

test('expired LKG shows installed history without discovery while installed offline launch remains available',async()=>{
  const row=lesson(),pack=installed({lessonRows:[row]});
  const setupValue=setup({
    packRows:[pack],
    lessonRows:[row],
    catalogExpired:true,
    assetEntries:[[address('a'),{bytes:new TextEncoder().encode('{}'),mediaType:'application/json'}]]
  });
  const browsed=await setupValue.lifecycle.browse();
  assert.equal(browsed.state,'expired-last-known-good');
  assert.equal(browsed.packs.length,1);
  assert.equal(browsed.packs[0].catalogInstallable,false);
  assert.equal((await setupValue.lifecycle.launch(row.id)).offline,true);
  assert.equal((await setupValue.lifecycle.todayInventory()).length,0);
});
