import { contentContractError } from './content-contracts-v2.js';
import { indexEffectiveRevocations,isCatalogCurrentlyValid } from './content-revocation-contract.js';
import { V10_STORES } from './v10-contracts.js';
import { listV10Records } from './v10-persistence.js';

const clone=value=>value==null?value:structuredClone(value);
const key=(packId,packRevision)=>`${String(packId||'')}:${Number(packRevision)}`;

export { indexEffectiveRevocations,isCatalogCurrentlyValid };

export function contentRevocationError(code,message,details={}){
  return Object.assign(contentContractError(code,message,details),{
    name:'ContentRevocationError',
    recoverable:false,
    ...details
  });
}

export function createV10RevocationRepository(){
  return Object.freeze({
    listRevocations:()=>listV10Records(V10_STORES.packRevocations,{sortBy:'revokedAt'})
  });
}

export function createEffectiveRevocationLookup({
  catalogTrust,
  repository=createV10RevocationRepository(),
  clock=()=>Date.now()
}={}){
  if(!catalogTrust?.current||!repository?.listRevocations)throw new TypeError('Effective revocation lookup requires catalog trust and a durable revocation repository.');

  async function snapshot(){
    const [durable,current]=await Promise.all([
      repository.listRevocations(),
      catalogTrust.current()
    ]);
    const payload=current?.payload||current?.envelope?.payload;
    const catalog=isCatalogCurrentlyValid(current,{now:clock()})?payload?.revocations||[]:[];
    const indexed=indexEffectiveRevocations({durable,catalog});
    return Object.freeze({
      current,
      durable:Object.freeze(clone(durable)),
      catalog:Object.freeze(clone(catalog)),
      rows:Object.freeze([...indexed.values()].map(clone)),
      indexed
    });
  }

  async function find(packId,packRevision){
    return (await snapshot()).indexed.get(key(packId,packRevision))||null;
  }

  async function assertAllowed(packId,packRevision,{code='CONTENT_PACK_REVOKED',operation='use'}={}){
    const revocation=await find(packId,packRevision);
    if(!revocation)return null;
    throw contentRevocationError(
      code,
      `Pack ${packId} revision ${packRevision} is revoked and cannot ${operation}.`,
      {packId,packRevision:Number(packRevision),operation,revocation:clone(revocation)}
    );
  }

  return Object.freeze({assertAllowed,find,snapshot});
}

export const __testing=Object.freeze({key});
