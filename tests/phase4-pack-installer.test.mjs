import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contentActivityTargetFor,
  contentAddressFor,
  lessonIdentityFor,
  normalizeContentAddress
} from '../src/content-contracts-v2.js';
import { createPackInstaller } from '../src/pack-installer.js';

const clockValue=Date.parse('2026-07-30T12:00:00.000Z');
const clock=()=>clockValue;
const instant=new Date(clockValue).toISOString();
const future='2027-07-30T12:00:00.000Z';
const encode=value=>new TextEncoder().encode(value);
const clone=value=>structuredClone(value);
const semanticAddress=character=>`sha256:${character.repeat(64)}`;

function publication(id,scopeDigest){
  return{
    publishedAt:instant,
    rights:{
      id:`rights:${id}`,schemaVersion:2,status:'approved',licenseId:'test-original',
      rightsHolder:'Test fixture author',basis:'Original deterministic test fixture.',
      assertedAt:instant,expiresAt:null,aiAsserted:false
    },
    provenance:{
      id:`provenance:${id}`,schemaVersion:2,sourceType:'original-human-authored',
      sourceDescription:'Deterministic installer fixture.',authorOrOrigin:'Test fixture author',
      createdAt:instant,aiDraft:false
    },
    humanReview:{
      id:`review:${id}`,schemaVersion:2,status:'approved',reviewerType:'human',
      reviewerId:'test-human-reviewer',reviewedAt:instant,scopeDigest,
      checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false
    }
  };
}

async function makeFixture({revision=1,assetText='verified audio bytes',assetMediaType='audio/wav',packId='pack:installer-test'}={}){
  const bytes=encode(assetText);
  const assetAddress=await contentAddressFor(bytes);
  const asset={
    id:`asset:${packId}:${revision}:audio`,schemaVersion:2,contentRevision:revision,
    contentAddress:assetAddress,sha256:normalizeContentAddress(assetAddress).digest,
    byteLength:bytes.byteLength,mediaType:assetMediaType,
    retrievalUrl:`https://content.example.test/sha256/${normalizeContentAddress(assetAddress).digest}.wav`,
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation','shadowing']},
    ...publication(`asset-${packId}-${revision}`,assetAddress)
  };
  const lesson={
    id:`lesson:${packId}:listening`,schemaVersion:2,contentRevision:revision,
    title:'Installer listening fixture',learningObjective:'Identify an exact scheduling detail.',
    estimatedMinutes:8,difficulty:'B1',skill:'listening',topic:'Scheduling',
    lexicalTargets:[{id:'lex:bring-forward',term:'bring forward'}],
    assetIds:[asset.id],
    activities:[{
      id:`activity:${packId}:dictation`,type:'dictation',prompt:'Write the sentence.',
      answer:{text:'The appointment was brought forward.'},assetIds:[asset.id],
      target:await contentActivityTargetFor({
        packId,packRevision:revision,lessonId:`lesson:${packId}:listening`,
        lessonRevision:revision,activityId:`activity:${packId}:dictation`,activityType:'dictation'
      })
    }],
    accessibility:{label:'Installer listening fixture',language:'en',transcriptAssetId:asset.id},
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation']},
    ...publication(`lesson-${packId}-${revision}`,semanticAddress(revision%2?'b':'d'))
  };
  const lessonIdentity=await lessonIdentityFor(lesson);
  Object.assign(lesson,{contentAddress:lessonIdentity.contentAddress,sha256:lessonIdentity.sha256,byteLength:lessonIdentity.byteLength});
  lesson.humanReview.scopeDigest=lessonIdentity.contentAddress;
  const packAddress=semanticAddress(revision%2?'c':'e');
  const manifest={
    id:packId,schemaVersion:2,contentRevision:revision,contentAddress:packAddress,
    title:`Installer Pack revision ${revision}`,assets:[asset],lessons:[lesson],
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation','shadowing']},
    ...publication(`pack-${packId}-${revision}`,packAddress)
  };
  const manifestText=JSON.stringify(manifest);
  const manifestBytes=encode(manifestText);
  const entryAddress=await contentAddressFor(manifestBytes);
  const entry={
    id:packId,packId,schemaVersion:2,contentRevision:revision,contentAddress:entryAddress,
    manifestUrl:`https://content.example.test/sha256/${normalizeContentAddress(entryAddress).digest}.json`,
    byteLength:manifestBytes.byteLength,
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation']},
    ...publication(`entry-${packId}-${revision}`,entryAddress)
  };
  const catalog={
    schemaVersion:2,catalogId:'catalog:installer-test',sequence:revision,catalogRevision:revision,
    issuedAt:instant,expiresAt:future,keyId:'test-key',supportedKeyIds:['test-key'],entries:[entry],revocations:[]
  };
  return{asset,assetBytes:bytes,entry,manifest,manifestBytes,catalog};
}

function makeRepository(){
  const journals=new Map(),installed=new Map(),leases=new Map(),receipts=[];
  const durableRevocations=[];
  let activateFailure=null;
  return{
    journals,installed,leases,receipts,durableRevocations,
    getJournal:async id=>clone(journals.get(id)||null),
    saveJournal:async value=>{journals.set(value.id,clone(value));return clone(value);},
    getInstalled:async packId=>clone(installed.get(packId)||null),
    listInstalled:async()=>[...installed.values()].map(clone),
    listJournals:async()=>[...journals.values()].map(clone),
    listRevocations:async()=>clone(durableRevocations),
    acquireLease:async(packId,ownerId,{now,expiresAt,nonce})=>{
      const previous=leases.get(packId);
      if(previous&&previous.expiresAt>now)return null;
      const generation=(previous?.generation||0)+1;
      const lease={packId,ownerId,generation,fencingToken:`${generation}:${nonce}`,expiresAt};
      leases.set(packId,lease);return clone(lease);
    },
    renewLease:async(packId,ownerId,token,{now,expiresAt})=>{
      const current=leases.get(packId);
      if(!current||current.ownerId!==ownerId||current.fencingToken!==token||current.expiresAt<=now)return null;
      const next={...current,expiresAt};leases.set(packId,next);return clone(next);
    },
    verifyLease:async(packId,ownerId,token,{now})=>{
      const current=leases.get(packId);
      return Boolean(current&&current.ownerId===ownerId&&current.fencingToken===token&&current.expiresAt>now);
    },
    releaseLease:async(packId,ownerId,token)=>{
      const current=leases.get(packId);
      if(current?.ownerId===ownerId&&current?.fencingToken===token)leases.delete(packId);
    },
    setActivateFailure(error){activateFailure=error;},
    async activate({entry,manifest,journal,verifiedAssets,activatedAt}){
      if(activateFailure){const error=activateFailure;activateFailure=null;throw error;}
      const previous=installed.get(manifest.id)||null;
      if(previous?.activeRevision===manifest.contentRevision&&previous.manifestAddress===entry.contentAddress){
        journals.set(journal.id,{...clone(journal),stage:'activated',activatedAt});
        return{installed:clone(previous),receipt:null,duplicate:true};
      }
      const value={
        id:`installed:${manifest.id}`,packId:manifest.id,state:'installed',
        activeRevision:manifest.contentRevision,manifestAddress:entry.contentAddress,
        lessonIds:manifest.lessons.map(row=>row.id),assetAddresses:manifest.assets.map(row=>row.contentAddress),
        revisionHistory:previous?[...(previous.revisionHistory||[]),{revision:previous.activeRevision,manifestAddress:previous.manifestAddress}]:[],
        activatedAt
      };
      const receipt={id:`receipt:${manifest.id}:${manifest.contentRevision}`,packId:manifest.id,activatedRevision:manifest.contentRevision,previousRevision:previous?.activeRevision||null};
      installed.set(manifest.id,clone(value));receipts.push(clone(receipt));
      journals.set(journal.id,{...clone(journal),stage:'activated',activatedAt});
      return{installed:value,receipt,duplicate:false,verifiedAssets};
    }
  };
}

function makeAssetStore({quotaFailure=false}={}){
  const final=new Map(),stages=new Map();
  return{
    final,stages,
    async readFinal(descriptor){
      const row=final.get(descriptor.contentAddress);
      return row?{bytes:new Uint8Array(row.bytes),mediaType:row.mediaType}:null;
    },
    async putStage(installId,descriptor,bytes){
      if(quotaFailure)throw new DOMException('quota','QuotaExceededError');
      const stage=stages.get(installId)||new Map();
      stage.set(descriptor.contentAddress,{bytes:new Uint8Array(bytes),mediaType:descriptor.mediaType});
      stages.set(installId,stage);
    },
    async readStage(installId,descriptor){
      const row=stages.get(installId)?.get(descriptor.contentAddress);
      return row?{bytes:new Uint8Array(row.bytes),mediaType:row.mediaType}:null;
    },
    async promote(installId,descriptor){
      const row=stages.get(installId)?.get(descriptor.contentAddress);
      if(!row)throw new Error('stage missing');
      final.set(descriptor.contentAddress,{bytes:new Uint8Array(row.bytes),mediaType:row.mediaType});
    },
    async deleteStage(installId){return stages.delete(installId);}
  };
}

function makeFetch(fixtures,{assetTransform=null,manifestTransform=null,deferAsset=null}={}){
  let manifestCalls=0,assetCalls=0;
  const fetcher=async(url,{signal}={})=>{
    if(url===fixtures.entry.manifestUrl){
      manifestCalls+=1;
      if(manifestTransform){
        const transformed=await manifestTransform(fixtures.manifestBytes,signal);
        return transformed instanceof Response?transformed:new Response(transformed,{status:200,headers:{'content-type':'application/json'}});
      }
      return new Response(fixtures.manifestBytes,{status:200,headers:{'content-type':'application/json'}});
    }
    if(url===fixtures.asset.retrievalUrl){
      assetCalls+=1;
      if(deferAsset)await deferAsset(signal);
      if(assetTransform){
        const transformed=await assetTransform(fixtures.assetBytes,signal);
        return transformed instanceof Response?transformed:new Response(transformed,{status:200,headers:{'content-type':fixtures.asset.mediaType}});
      }
      return new Response(fixtures.assetBytes,{status:200,headers:{'content-type':fixtures.asset.mediaType}});
    }
    return new Response('missing',{status:404});
  };
  fetcher.calls=()=>({manifest:manifestCalls,asset:assetCalls});
  return fetcher;
}

function fakeHeartbeatScheduler(){
  const callbacks=new Set();
  return{
    set(callback){callbacks.add(callback);return callback;},
    clear(callback){callbacks.delete(callback);},
    async tick(){
      for(const callback of [...callbacks])callback();
      await new Promise(resolve=>setTimeout(resolve,0));
    }
  };
}

function installerFor(fixtures,{repository=makeRepository(),assetStore=makeAssetStore(),fetcher=makeFetch(fixtures),hooks={},catalogRecord={payload:fixtures.catalog},ownerId='test-installer',clockFn=clock,heartbeatScheduler=undefined,leaseNonceFactory=undefined}={}){
  const catalogTrust={current:async()=>clone(catalogRecord)};
  const installer=createPackInstaller({
    catalogTrust,repository,assetStore,fetcher,clock:clockFn,ownerId,lockManager:null,hooks,
    ...(heartbeatScheduler?{heartbeatScheduler}:{}),
    ...(leaseNonceFactory?{leaseNonceFactory}:{})
  });
  return{installer,repository,assetStore,fetcher};
}

test('clean install verifies manifest and every asset before one activation',async()=>{
  const fixtures=await makeFixture();
  const setup=installerFor(fixtures);
  const result=await setup.installer.install(fixtures.manifest.id);
  assert.equal(result.status,'installed');
  assert.equal(setup.repository.installed.get(fixtures.manifest.id).activeRevision,1);
  assert.equal(setup.repository.journals.get(`install:${fixtures.manifest.id}:1`).stage,'activated');
  assert.equal(setup.assetStore.final.has(fixtures.asset.contentAddress),true);
  assert.deepEqual(setup.fetcher.calls(),{manifest:1,asset:1});
});

test('verified cache hit deduplicates asset download and duplicate install is idempotent',async()=>{
  const fixtures=await makeFixture();
  const assetStore=makeAssetStore();
  assetStore.final.set(fixtures.asset.contentAddress,{bytes:fixtures.assetBytes,mediaType:fixtures.asset.mediaType});
  const setup=installerFor(fixtures,{assetStore});
  const first=await setup.installer.install(fixtures.manifest.id);
  const second=await setup.installer.install(fixtures.manifest.id);
  assert.equal(first.status,'installed');
  assert.equal(second.status,'already-installed');
  assert.equal(setup.fetcher.calls().asset,0);
  assert.equal(setup.repository.receipts.length,1);
});

test('concurrent install requests are excluded by a durable lease',async()=>{
  const fixtures=await makeFixture();
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const fetcher=makeFetch(fixtures,{deferAsset:()=>gate});
  const setup=installerFor(fixtures,{fetcher});
  const first=setup.installer.install(fixtures.manifest.id);
  await new Promise(resolve=>setTimeout(resolve,10));
  await assert.rejects(()=>setup.installer.install(fixtures.manifest.id),error=>error.code==='PACK_INSTALL_CONCURRENT');
  release();
  assert.equal((await first).status,'installed');
});

test('interrupted manifest and asset downloads are typed and retryable',async()=>{
  const fixtures=await makeFixture();
  const manifestFailure=installerFor(fixtures,{fetcher:makeFetch(fixtures,{manifestTransform:()=>{throw new TypeError('network reset');}})});
  await assert.rejects(()=>manifestFailure.installer.install(fixtures.manifest.id),error=>error.code==='PACK_NETWORK_FAILED'&&error.recoverable);

  const assetFailure=installerFor(fixtures,{fetcher:makeFetch(fixtures,{assetTransform:()=>{throw new TypeError('asset reset');}})});
  await assert.rejects(()=>assetFailure.installer.install(fixtures.manifest.id),error=>error.code==='PACK_NETWORK_FAILED'&&error.recoverable);
  assert.equal(assetFailure.repository.installed.size,0);
});

test('corrupted bytes, wrong length and wrong media type never activate',async()=>{
  const fixtures=await makeFixture();
  const corrupt=installerFor(fixtures,{fetcher:makeFetch(fixtures,{assetTransform:()=>encode('corrupt bytes')})});
  await assert.rejects(()=>corrupt.installer.install(fixtures.manifest.id),error=>['PACK_DIGEST_MISMATCH','PACK_LENGTH_MISMATCH'].includes(error.code));
  assert.equal(corrupt.repository.installed.size,0);

  const wrongLengthFixture=await makeFixture();
  wrongLengthFixture.asset.byteLength+=1;
  wrongLengthFixture.manifest.assets[0].byteLength+=1;
  const manifestBytes=encode(JSON.stringify(wrongLengthFixture.manifest));
  wrongLengthFixture.manifestBytes=manifestBytes;
  wrongLengthFixture.entry.contentAddress=await contentAddressFor(manifestBytes);
  wrongLengthFixture.entry.byteLength=manifestBytes.byteLength;
  wrongLengthFixture.entry.manifestUrl=`https://content.example.test/sha256/${normalizeContentAddress(wrongLengthFixture.entry.contentAddress).digest}.json`;
  wrongLengthFixture.entry.humanReview.scopeDigest=wrongLengthFixture.entry.contentAddress;
  const wrongLength=installerFor(wrongLengthFixture);
  await assert.rejects(()=>wrongLength.installer.install(wrongLengthFixture.manifest.id),error=>error.code==='PACK_LENGTH_MISMATCH');

  const wrongMedia=installerFor(fixtures,{fetcher:makeFetch(fixtures,{assetTransform:bytes=>new Response(bytes,{status:200,headers:{'content-type':'text/plain'}})})});
  await assert.rejects(()=>wrongMedia.installer.install(fixtures.manifest.id),error=>error.code==='PACK_MEDIA_TYPE_MISMATCH');
});

test('quota failure is typed, recoverable and leaves no active pointer',async()=>{
  const fixtures=await makeFixture();
  const setup=installerFor(fixtures,{assetStore:makeAssetStore({quotaFailure:true})});
  await assert.rejects(()=>setup.installer.install(fixtures.manifest.id),error=>error.code==='PACK_QUOTA_EXCEEDED'&&error.recoverable);
  assert.equal(setup.repository.installed.size,0);
  assert.equal(setup.repository.journals.get(`install:${fixtures.manifest.id}:1`).stage,'failed');
});

test('restart from every durable journal stage is idempotent',async()=>{
  const stages=['created','catalog-verified','manifest-staged','manifest-verified','assets-staging','assets-verified','activation-pending','failed','cancelled'];
  for(const stage of stages){
    const fixtures=await makeFixture({packId:`pack:restart-${stage}`});
    const repository=makeRepository();
    const installId=`install:${fixtures.manifest.id}:1`;
    repository.journals.set(installId,{
      id:installId,schemaVersion:2,kind:'pack-install-journal',packId:fixtures.manifest.id,
      packRevision:1,ownerId:'crashed-tab',stage,verifiedAssets:[],createdAt:instant,updatedAt:instant
    });
    const setup=installerFor(fixtures,{repository});
    const result=await setup.installer.install(fixtures.manifest.id);
    assert.equal(result.status,'installed',stage);
    assert.equal(repository.journals.get(installId).stage,'activated',stage);
  }
});

test('failed update preserves old active pack and successful retry preserves external progress',async()=>{
  const first=await makeFixture({revision:1});
  const repository=makeRepository();
  const firstSetup=installerFor(first,{repository});
  await firstSetup.installer.install(first.manifest.id);
  const progress=new Map([[first.manifest.lessons[0].id,{status:'completed',attempts:3}]]);
  const second=await makeFixture({revision:2,assetText:'revision two verified bytes'});
  repository.setActivateFailure(new DOMException('transaction quota','QuotaExceededError'));
  const failedUpdate=installerFor(second,{repository});
  await assert.rejects(()=>failedUpdate.installer.install(second.manifest.id),error=>error.code==='PACK_QUOTA_EXCEEDED');
  assert.equal(repository.installed.get(second.manifest.id).activeRevision,1);
  const retried=installerFor(second,{repository});
  assert.equal((await retried.installer.install(second.manifest.id)).status,'installed');
  assert.equal(repository.installed.get(second.manifest.id).activeRevision,2);
  assert.deepEqual(progress.get(second.manifest.lessons[0].id),{status:'completed',attempts:3});
});

test('cancellation before activation is safe and retry succeeds',async()=>{
  const fixtures=await makeFixture();
  let started;
  const assetStarted=new Promise(resolve=>{started=resolve;});
  const fetcher=makeFetch(fixtures,{deferAsset:signal=>new Promise((resolve,reject)=>{
    started();
    signal.addEventListener('abort',()=>reject(new DOMException('cancelled','AbortError')),{once:true});
  })});
  const setup=installerFor(fixtures,{fetcher});
  const installing=setup.installer.install(fixtures.manifest.id);
  await assetStarted;
  const cancelled=await setup.installer.cancel(fixtures.manifest.id,1);
  assert.equal(cancelled.cancelled,true);
  await assert.rejects(()=>installing,error=>error.code==='PACK_DOWNLOAD_CANCELLED');
  assert.equal(setup.repository.installed.size,0);
  const retry=installerFor(fixtures,{repository:setup.repository,assetStore:setup.assetStore});
  assert.equal((await retry.installer.install(fixtures.manifest.id)).status,'installed');
});

test('orphaned staging cleanup marks abandoned journals recoverable',async()=>{
  const fixtures=await makeFixture();
  const repository=makeRepository(),assetStore=makeAssetStore();
  const installId=`install:${fixtures.manifest.id}:1`;
  repository.journals.set(installId,{
    id:installId,schemaVersion:2,kind:'pack-install-journal',packId:fixtures.manifest.id,
    packRevision:1,ownerId:'gone-tab',stage:'assets-staging',verifiedAssets:[],
    createdAt:'2026-07-29T00:00:00.000Z',updatedAt:'2026-07-29T00:00:00.000Z'
  });
  assetStore.stages.set(installId,new Map());
  const setup=installerFor(fixtures,{repository,assetStore});
  const result=await setup.installer.reconcile({olderThanMs:60_000});
  assert.deepEqual(result.cleaned,[installId]);
  assert.equal(repository.journals.get(installId).stage,'failed');
  assert.equal(assetStore.stages.has(installId),false);
});

test('expired last-known-good blocks new install and update before any download',async()=>{
  const fixtures=await makeFixture();
  const setup=installerFor(fixtures,{catalogRecord:{payload:fixtures.catalog,expired:true,trustState:'expired-last-known-good'}});
  await assert.rejects(()=>setup.installer.install(fixtures.manifest.id),error=>error.code==='PACK_CATALOG_EXPIRED');
  assert.deepEqual(setup.fetcher.calls(),{manifest:0,asset:0});
});

test('durable revocation blocks fresh install and update even when a newer catalog omits it',async()=>{
  const first=await makeFixture({revision:1});
  const repository=makeRepository();
  repository.durableRevocations.push({
    id:`revocation:${first.manifest.id}:1`,
    packId:first.manifest.id,
    packRevision:1,
    reasonCode:'rights-withdrawn',
    reason:'Rights withdrawn.',
    revokedAt:instant
  });
  const fresh=installerFor(first,{repository});
  await assert.rejects(()=>fresh.installer.install(first.manifest.id),error=>error.code==='PACK_REVOKED');
  assert.deepEqual(fresh.fetcher.calls(),{manifest:0,asset:0});

  repository.durableRevocations.length=0;
  await installerFor(first,{repository}).installer.install(first.manifest.id);
  repository.durableRevocations.push({
    id:`revocation:${first.manifest.id}:1`,
    packId:first.manifest.id,
    packRevision:1,
    reasonCode:'rights-withdrawn',
    reason:'Rights withdrawn.',
    revokedAt:instant
  });
  const second=await makeFixture({revision:2,assetText:'revision two'});
  const update=installerFor(second,{repository});
  await assert.rejects(()=>update.installer.install(second.manifest.id),error=>error.code==='PACK_REVOKED');
  assert.equal(repository.installed.get(first.manifest.id).activeRevision,1);
});

test('renewable fallback lease survives beyond the original TTL and excludes a second owner',async()=>{
  const fixtures=await makeFixture({packId:'pack:renewed-lease'});
  const repository=makeRepository(),assetStore=makeAssetStore(),scheduler=fakeHeartbeatScheduler();
  let time=clockValue,releaseAsset,assetStarted;
  const started=new Promise(resolve=>{assetStarted=resolve;});
  const gate=new Promise(resolve=>{releaseAsset=resolve;});
  const slowFetch=makeFetch(fixtures,{deferAsset:async()=>{assetStarted();await gate;}});
  const first=installerFor(fixtures,{
    repository,assetStore,fetcher:slowFetch,ownerId:'owner-a',clockFn:()=>time,
    heartbeatScheduler:scheduler,leaseNonceFactory:()=> 'nonce-a'
  });
  const installing=first.installer.install(fixtures.manifest.id);
  await started;
  time+=40_000;await scheduler.tick();
  time+=40_000;await scheduler.tick();
  const second=installerFor(fixtures,{repository,assetStore,ownerId:'owner-b',clockFn:()=>time,leaseNonceFactory:()=> 'nonce-b'});
  await assert.rejects(()=>second.installer.install(fixtures.manifest.id),error=>error.code==='PACK_INSTALL_CONCURRENT');
  releaseAsset();
  assert.equal((await installing).status,'installed');
});

test('lease renewal failure stops the stale owner before promotion or activation',async()=>{
  const fixtures=await makeFixture({packId:'pack:renewal-failure'});
  const repository=makeRepository(),scheduler=fakeHeartbeatScheduler();
  const renew=repository.renewLease;
  let failRenewal=false;
  repository.renewLease=async(...args)=>failRenewal?null:renew(...args);
  let releaseAsset,assetStarted,time=clockValue;
  const started=new Promise(resolve=>{assetStarted=resolve;});
  const gate=new Promise(resolve=>{releaseAsset=resolve;});
  const setup=installerFor(fixtures,{
    repository,fetcher:makeFetch(fixtures,{deferAsset:async()=>{assetStarted();await gate;}}),
    ownerId:'owner-a',clockFn:()=>time,heartbeatScheduler:scheduler,leaseNonceFactory:()=> 'nonce-a'
  });
  const installing=setup.installer.install(fixtures.manifest.id);
  await started;
  failRenewal=true;
  time+=20_000;
  await scheduler.tick();
  releaseAsset();
  await assert.rejects(()=>installing,error=>error.code==='PACK_LEASE_LOST');
  assert.equal(repository.installed.size,0);
});

test('expired owner cannot activate after a second fenced owner acquires',async()=>{
  const fixtures=await makeFixture({packId:'pack:fenced-takeover'});
  const repository=makeRepository(),assetStore=makeAssetStore();
  let time=clockValue,releaseAsset,assetStarted;
  const started=new Promise(resolve=>{assetStarted=resolve;});
  const gate=new Promise(resolve=>{releaseAsset=resolve;});
  const inertScheduler={set:()=>null,clear:()=>{}};
  const first=installerFor(fixtures,{
    repository,assetStore,fetcher:makeFetch(fixtures,{deferAsset:async()=>{assetStarted();await gate;}}),
    ownerId:'owner-a',clockFn:()=>time,heartbeatScheduler:inertScheduler,leaseNonceFactory:()=> 'nonce-a'
  });
  const staleInstall=first.installer.install(fixtures.manifest.id);
  await started;
  time+=61_000;
  const second=installerFor(fixtures,{
    repository,assetStore,ownerId:'owner-b',clockFn:()=>time,
    heartbeatScheduler:inertScheduler,leaseNonceFactory:()=> 'nonce-b'
  });
  assert.equal((await second.installer.install(fixtures.manifest.id)).status,'installed');
  releaseAsset();
  await assert.rejects(()=>staleInstall,error=>error.code==='PACK_LEASE_LOST');
  assert.equal(repository.installed.get(fixtures.manifest.id).activeRevision,1);
});
