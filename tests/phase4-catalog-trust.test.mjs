import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SIGNED_CATALOG_KIND,
  canonicalCatalogPayload,
  createCatalogTrustService,
  encodeBase64,
  verifySignedCatalogEnvelope
} from '../src/signed-catalog.js';

const encoder=new TextEncoder();
const nowMs=Date.parse('2026-07-30T12:00:00.000Z');
const issuedAt='2026-07-30T10:00:00.000Z';
const expiresAt='2026-08-30T10:00:00.000Z';
const keyPair=await crypto.subtle.generateKey({name:'Ed25519'},true,['sign','verify']);
const publicKey=encodeBase64(await crypto.subtle.exportKey('raw',keyPair.publicKey));
const trustRoot={
  keyId:'phase4-test-key-2026',
  algorithm:'Ed25519',
  status:'active',
  usages:['catalog-signing'],
  validFrom:'2026-01-01T00:00:00.000Z',
  validUntil:'2027-01-01T00:00:00.000Z',
  publicKey
};

const address=character=>`sha256:${character.repeat(64)}`;
const digest=character=>character.repeat(64);
const publication=(id,scopeDigest)=>({
  publishedAt:issuedAt,
  rights:{
    id:`rights:${id}`,schemaVersion:2,status:'approved',licenseId:'test-original',
    rightsHolder:'Test fixture author',basis:'Original deterministic test fixture.',
    assertedAt:issuedAt,expiresAt:null,aiAsserted:false
  },
  provenance:{
    id:`provenance:${id}`,schemaVersion:2,sourceType:'original-human-authored',
    sourceDescription:'Deterministic catalog trust fixture.',authorOrOrigin:'Test fixture author',
    createdAt:issuedAt,aiDraft:false
  },
  humanReview:{
    id:`review:${id}`,schemaVersion:2,status:'approved',reviewerType:'human',
    reviewerId:'test-human-reviewer',reviewedAt:issuedAt,scopeDigest,
    checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false
  }
});

function payload({sequence=1,catalogRevision=1,expires=expiresAt,schemaVersion=2,rollback=null}={}){
  const contentAddress=address('a');
  const entry={
    id:'pack:phase4-test',packId:'pack:phase4-test',schemaVersion:2,contentRevision:1,
    contentAddress,manifestUrl:`https://content.example.test/sha256/${digest('a')}.json`,
    byteLength:4096,
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation']},
    ...publication('entry-phase4-test',contentAddress)
  };
  return{
    schemaVersion,catalogId:'catalog:vocab-master-staging',sequence,catalogRevision,
    issuedAt,expiresAt:expires,keyId:trustRoot.keyId,supportedKeyIds:[trustRoot.keyId],
    entries:[entry],revocations:[],...(rollback?{rollback}: {})
  };
}

async function signed(catalogPayload=payload(),{privateKey=keyPair.privateKey,keyId=trustRoot.keyId}={}){
  const signature=await crypto.subtle.sign(
    {name:'Ed25519'},
    privateKey,
    encoder.encode(canonicalCatalogPayload(catalogPayload))
  );
  return{
    kind:SIGNED_CATALOG_KIND,
    signatureVersion:1,
    algorithm:'Ed25519',
    keyId,
    payload:catalogPayload,
    signature:encodeBase64(signature)
  };
}

test('valid Ed25519 catalog signature and deterministic canonical payload are accepted',async()=>{
  const envelope=await signed();
  const verified=await verifySignedCatalogEnvelope(envelope,{trustRoots:[trustRoot],now:nowMs});
  assert.equal(verified.status,'verified-newer');
  assert.match(verified.payloadAddress,/^sha256:[a-f0-9]{64}$/);
});

test('bundled production catalog verifies against the bundled public trust root and contains no unreviewed entries',async()=>{
  const [catalogDocument,rootDocument]=await Promise.all([
    readFile(new URL('../public/content/catalog.json',import.meta.url),'utf8').then(JSON.parse),
    readFile(new URL('../public/content/trust-roots.json',import.meta.url),'utf8').then(JSON.parse)
  ]);
  const verified=await verifySignedCatalogEnvelope(catalogDocument,{trustRoots:rootDocument.keys,now:nowMs});
  assert.equal(verified.payload.catalogId,'catalog:vocab-master-production');
  assert.equal(verified.payload.entries.length,0);
});

test('modified payload, invalid signature and unknown key fail closed',async()=>{
  const modified=await signed();
  modified.payload.entries[0].byteLength+=1;
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(modified,{trustRoots:[trustRoot],now:nowMs}),
    error=>error.code==='CATALOG_SIGNATURE_INVALID'
  );
  const invalid=await signed();
  invalid.signature=`A${invalid.signature.slice(1)}`;
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(invalid,{trustRoots:[trustRoot],now:nowMs}),
    error=>error.code==='CATALOG_SIGNATURE_INVALID'
  );
  const unknown=await signed(payload(),{keyId:'unknown-key'});
  unknown.payload.keyId='unknown-key';
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(unknown,{trustRoots:[trustRoot],now:nowMs}),
    error=>error.code==='CATALOG_KEY_UNKNOWN'
  );
});

test('expired and unsupported-schema catalogs do not pass even with a valid signature',async()=>{
  const expired=await signed(payload({expires:'2026-07-30T11:00:00.000Z'}));
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(expired,{trustRoots:[trustRoot],now:nowMs}),
    error=>error.code==='CATALOG_CONTRACT_INVALID'
  );
  const future=await signed(payload({schemaVersion:99}));
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(future,{trustRoots:[trustRoot],now:nowMs}),
    error=>error.code==='CATALOG_CONTRACT_INVALID'
  );
});

test('sequence replay, collision and unsigned downgrade fail while exact signed rollback succeeds',async()=>{
  const currentEnvelope=await signed(payload({sequence:5,catalogRevision:5}));
  const current=await verifySignedCatalogEnvelope(currentEnvelope,{trustRoots:[trustRoot],now:nowMs});
  const replay=await signed(payload({sequence:4,catalogRevision:4}));
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(replay,{trustRoots:[trustRoot],lastKnownGood:current,now:nowMs}),
    error=>error.code==='CATALOG_REPLAY'
  );
  const collision=await signed(payload({sequence:5,catalogRevision:6}));
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(collision,{trustRoots:[trustRoot],lastKnownGood:current,now:nowMs}),
    error=>error.code==='CATALOG_SEQUENCE_COLLISION'
  );
  const downgrade=await signed(payload({sequence:6,catalogRevision:4}));
  await assert.rejects(
    ()=>verifySignedCatalogEnvelope(downgrade,{trustRoots:[trustRoot],lastKnownGood:current,now:nowMs}),
    error=>error.code==='CATALOG_DOWNGRADE'
  );
  const rollback=await signed(payload({
    sequence:6,
    catalogRevision:4,
    rollback:{fromRevision:5,toRevision:4,reason:'Signed rollback after a verified content defect.'}
  }));
  const verifiedRollback=await verifySignedCatalogEnvelope(rollback,{trustRoots:[trustRoot],lastKnownGood:current,now:nowMs});
  assert.equal(verifiedRollback.status,'verified-newer');
  assert.equal(verifiedRollback.payload.catalogRevision,4);
});

test('offline startup and network failure retain last-known-good; first launch stays truthfully recoverable',async()=>{
  let lastKnownGood=null;
  const repository={
    async getLastKnownGood(){return lastKnownGood;},
    async commitVerified(verified){
      lastKnownGood={id:'last-known-good',payload:structuredClone(verified.payload),payloadAddress:verified.payloadAddress,envelope:structuredClone(verified.envelope)};
      return lastKnownGood;
    }
  };
  const service=createCatalogTrustService({
    repository,
    trustRoots:[trustRoot],
    now:()=>nowMs,
    fetcher:async()=>{throw Object.assign(new Error('offline'),{code:'NETWORK_OFFLINE'});}
  });
  assert.deepEqual(await service.startup(),{state:'no-valid-catalog',catalog:null,recovery:'connect-and-retry'});
  await assert.rejects(()=>service.refresh('https://content.example.test/catalog.json'),error=>error.code==='CATALOG_UNAVAILABLE_NO_LKG');
  await service.accept(await signed());
  const offline=await service.refresh('https://content.example.test/catalog.json');
  assert.equal(offline.state,'offline-last-known-good');
  assert.equal(offline.catalog.payload.sequence,1);
});

test('an invalid newer catalog cannot replace last-known-good',async()=>{
  let commitCount=0;
  const existingVerified=await verifySignedCatalogEnvelope(await signed(),{trustRoots:[trustRoot],now:nowMs});
  const lastKnownGood={payload:existingVerified.payload,payloadAddress:existingVerified.payloadAddress,envelope:existingVerified.envelope};
  const repository={
    async getLastKnownGood(){return lastKnownGood;},
    async commitVerified(){commitCount+=1;throw new Error('must not commit');}
  };
  const invalid=await signed(payload({sequence:2,catalogRevision:2}));
  invalid.payload.entries[0].byteLength=9999;
  const service=createCatalogTrustService({
    repository,
    trustRoots:[trustRoot],
    now:()=>nowMs,
    fetcher:async()=>new Response(JSON.stringify(invalid),{status:200,headers:{'content-type':'application/json'}})
  });
  const result=await service.refresh('https://content.example.test/catalog.json');
  assert.equal(result.state,'rejected-last-known-good');
  assert.equal(result.catalog.payload.sequence,1);
  assert.equal(commitCount,0);
});
