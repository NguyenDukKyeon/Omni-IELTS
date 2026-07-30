import { CONTENT_SCHEMA_VERSION } from './content-contracts-v2.js';

const clone=value=>value==null?value:structuredClone(value);
const key=(packId,packRevision)=>`${String(packId||'')}:${Number(packRevision)}`;

export function isCatalogCurrentlyValid(record,{now=Date.now()}={}){
  const payload=record?.payload||record?.envelope?.payload;
  const expiresAt=Date.parse(payload?.expiresAt||'');
  return Boolean(
    payload
    &&Number(payload.schemaVersion)===CONTENT_SCHEMA_VERSION
    &&Number.isFinite(expiresAt)
    &&expiresAt>Number(now)
    &&record?.trustState!=='expired-last-known-good'
    &&record?.expired!==true
  );
}

export function indexEffectiveRevocations({durable=[],catalog=[]}={}){
  const rows=new Map();
  for(const [source,values] of [['durable',durable],['catalog',catalog]]){
    for(const value of Array.isArray(values)?values:[]){
      if(!value?.packId||!Number.isInteger(Number(value.packRevision))||Number(value.packRevision)<1)continue;
      const identity=key(value.packId,value.packRevision);
      const prior=rows.get(identity);
      const candidate={...clone(value),effectiveSource:prior?'durable+catalog':source};
      if(!prior||Date.parse(candidate.revokedAt||0)>=Date.parse(prior.revokedAt||0))rows.set(identity,candidate);
      else if(prior.effectiveSource!==candidate.effectiveSource)rows.set(identity,{...prior,effectiveSource:'durable+catalog'});
    }
  }
  return rows;
}

export const __testing=Object.freeze({key});
