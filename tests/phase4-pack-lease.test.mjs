import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';
import { createV10PackRepository,PACK_LEASE_MS } from '../src/pack-installer.js';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{
  constructor(type,{detail}={}){this.type=type;this.detail=detail;}
};

const baseTime=Date.parse('2026-07-30T12:00:00.000Z');

test('durable fallback leases renew, fence stale owners and protect atomic activation',async()=>{
  const repository=createV10PackRepository();
  const first=await repository.acquireLease('pack-lease','owner-a',{
    now:baseTime,
    expiresAt:baseTime+PACK_LEASE_MS,
    nonce:'a'
  });
  assert.equal(first.generation,1);

  const renewed=await repository.renewLease('pack-lease','owner-a',first.fencingToken,{
    now:baseTime+40_000,
    expiresAt:baseTime+40_000+PACK_LEASE_MS
  });
  assert.equal(renewed.generation,1);
  assert.equal(
    await repository.acquireLease('pack-lease','owner-b',{
      now:baseTime+80_000,
      expiresAt:baseTime+80_000+PACK_LEASE_MS,
      nonce:'b-before-expiry'
    }),
    null
  );

  const second=await repository.acquireLease('pack-lease','owner-b',{
    now:baseTime+PACK_LEASE_MS+40_001,
    expiresAt:baseTime+(2*PACK_LEASE_MS)+40_001,
    nonce:'b'
  });
  assert.equal(second.generation,2);
  assert.notEqual(second.fencingToken,first.fencingToken);
  assert.equal(
    await repository.renewLease('pack-lease','owner-a',first.fencingToken,{
      now:baseTime+PACK_LEASE_MS+40_002,
      expiresAt:baseTime+(2*PACK_LEASE_MS)+40_002
    }),
    null
  );

  await repository.releaseLease('pack-lease','owner-a',first.fencingToken);
  assert.equal(
    await repository.verifyLease('pack-lease','owner-b',second.fencingToken,{now:baseTime+PACK_LEASE_MS+40_002}),
    true
  );

  await assert.rejects(
    ()=>repository.activate({
      entry:{contentAddress:'sha256:'.padEnd(71,'0')},
      manifest:{id:'pack-lease',contentRevision:1,lessons:[],assets:[]},
      journal:{id:'install:pack-lease:1'},
      verifiedAssets:[],
      activatedAt:'2026-07-30T12:02:00.000Z',
      lease:{...first,kind:'fallback'},
      leaseNow:baseTime+PACK_LEASE_MS+40_002
    }),
    error=>error.code==='PACK_LEASE_LOST'
  );

  await repository.releaseLease('pack-lease','owner-b',second.fencingToken);
  assert.equal(
    await repository.verifyLease('pack-lease','owner-b',second.fencingToken,{now:baseTime+PACK_LEASE_MS+40_003}),
    false
  );
});
