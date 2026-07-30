import {
  CONTENT_SCHEMA_VERSION,
  assertValidContent,
  canonicalContentJson,
  contentAddressFor,
  contentContractError,
  validateRemoteCatalog
} from './content-contracts-v2.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,transactV10 } from './v10-persistence.js';

export const SIGNED_CATALOG_KIND='vocab-master-signed-catalog';
export const SIGNATURE_VERSION=1;
export const CATALOG_ALGORITHM='Ed25519';
export const LAST_KNOWN_GOOD_CATALOG_ID='phase4:catalog:last-known-good';

const encoder=new TextEncoder();
const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);

function catalogError(code,message,details={}){
  return Object.assign(contentContractError(code,message,details),{name:'CatalogTrustError',recoverable:true});
}

function decodeBase64(value){
  const normalized=clean(value,100_000).replace(/-/g,'+').replace(/_/g,'/');
  const padded=normalized.padEnd(Math.ceil(normalized.length/4)*4,'=');
  if(typeof atob==='function')return Uint8Array.from(atob(padded),character=>character.charCodeAt(0));
  return Uint8Array.from(Buffer.from(padded,'base64'));
}

export function encodeBase64(value){
  const bytes=value instanceof Uint8Array?value:new Uint8Array(value);
  if(typeof btoa==='function')return btoa(String.fromCharCode(...bytes));
  return Buffer.from(bytes).toString('base64');
}

function exactInstant(value,path){
  const text=clean(value,80),time=Date.parse(text);
  if(!text||!Number.isFinite(time)||new Date(time).toISOString()!==text)throw catalogError('CATALOG_TRUST_ROOT_INVALID',`${path} must be an exact ISO instant.`);
  return time;
}

export function validateTrustRoot(root,{now=Date.now()}={}){
  if(!root||typeof root!=='object'||Array.isArray(root))throw catalogError('CATALOG_TRUST_ROOT_INVALID','Trust root must be an object.');
  if(!/^[a-z0-9][a-z0-9._:-]{2,159}$/i.test(clean(root.keyId,180)))throw catalogError('CATALOG_TRUST_ROOT_INVALID','Trust root keyId is invalid.');
  if(root.algorithm!==CATALOG_ALGORITHM)throw catalogError('CATALOG_TRUST_ROOT_INVALID','Trust root algorithm is unsupported.');
  if(root.status!=='active')throw catalogError('CATALOG_KEY_INACTIVE',`Trust root ${root.keyId} is not active.`);
  if(!Array.isArray(root.usages)||!root.usages.includes('catalog-signing'))throw catalogError('CATALOG_KEY_USAGE_INVALID',`Trust root ${root.keyId} cannot sign catalogs.`);
  const validFrom=exactInstant(root.validFrom,'TrustRoot.validFrom');
  const validUntil=exactInstant(root.validUntil,'TrustRoot.validUntil');
  if(Number(now)<validFrom||Number(now)>=validUntil)throw catalogError('CATALOG_KEY_EXPIRED',`Trust root ${root.keyId} is outside its validity window.`);
  const raw=decodeBase64(root.publicKey);
  if(raw.byteLength!==32)throw catalogError('CATALOG_TRUST_ROOT_INVALID','Ed25519 public key must be 32 bytes.');
  return Object.freeze({...clone(root),raw});
}

export function canonicalCatalogPayload(payload){
  return canonicalContentJson(payload);
}

export async function verifyCatalogSignature(envelope,{trustRoots=[],now=Date.now()}={}){
  if(!envelope||typeof envelope!=='object'||Array.isArray(envelope))throw catalogError('CATALOG_ENVELOPE_MALFORMED','Signed catalog envelope must be an object.');
  if(envelope.kind!==SIGNED_CATALOG_KIND||Number(envelope.signatureVersion)!==SIGNATURE_VERSION)throw catalogError('CATALOG_ENVELOPE_MALFORMED','Signed catalog envelope kind or signature version is unsupported.');
  if(envelope.algorithm!==CATALOG_ALGORITHM)throw catalogError('CATALOG_SIGNATURE_ALGORITHM_UNSUPPORTED','Catalog signature algorithm is unsupported.');
  const keyId=clean(envelope.keyId,180);
  const candidate=(Array.isArray(trustRoots)?trustRoots:[]).find(root=>root?.keyId===keyId);
  if(!candidate)throw catalogError('CATALOG_KEY_UNKNOWN',`Catalog signing key ${keyId||'missing'} is not bundled.`);
  const root=validateTrustRoot(candidate,{now});
  if(envelope.payload?.keyId!==keyId)throw catalogError('CATALOG_KEY_MISMATCH','Envelope and catalog key IDs do not match.');
  let signature;
  try{signature=decodeBase64(envelope.signature);}catch{throw catalogError('CATALOG_SIGNATURE_INVALID','Catalog signature is not valid base64.');}
  if(signature.byteLength!==64)throw catalogError('CATALOG_SIGNATURE_INVALID','Ed25519 signature must be 64 bytes.');
  let key;
  try{key=await crypto.subtle.importKey('raw',root.raw,{name:CATALOG_ALGORITHM},false,['verify']);}
  catch(error){throw catalogError('CATALOG_KEY_IMPORT_FAILED','Bundled catalog public key cannot be imported.',{cause:error});}
  const bytes=encoder.encode(canonicalCatalogPayload(envelope.payload));
  const valid=await crypto.subtle.verify({name:CATALOG_ALGORITHM},key,signature,bytes);
  if(!valid)throw catalogError('CATALOG_SIGNATURE_INVALID','Catalog signature verification failed.');
  return{root,payloadBytes:bytes};
}

function previousPayload(lastKnownGood){
  return lastKnownGood?.payload||lastKnownGood?.envelope?.payload||lastKnownGood||null;
}

export async function verifySignedCatalogEnvelope(envelope,{trustRoots=[],lastKnownGood=null,now=Date.now()}={}){
  const signature=await verifyCatalogSignature(envelope,{trustRoots,now});
  const payload=assertValidContent(
    validateRemoteCatalog(envelope.payload,{publication:true,at:now}),
    'CATALOG_CONTRACT_INVALID'
  );
  const prior=previousPayload(lastKnownGood);
  if(!prior&&signature.root.bootstrap!==true)throw catalogError(
    'CATALOG_BOOTSTRAP_KEY_UNAUTHORIZED',
    `Catalog signing key ${signature.root.keyId} is not an explicitly bundled bootstrap trust root.`
  );
  const payloadAddress=await contentAddressFor(canonicalCatalogPayload(payload));
  if(prior){
    if(prior.catalogId!==payload.catalogId)throw catalogError('CATALOG_ID_MISMATCH','Catalog identity changed without a new bundled trust domain.');
    const sequence=Number(payload.sequence),priorSequence=Number(prior.sequence);
    if(sequence<priorSequence)throw catalogError('CATALOG_REPLAY','Catalog sequence is older than the last-known-good catalog.');
    if(sequence===priorSequence){
      const priorAddress=lastKnownGood?.payloadAddress||await contentAddressFor(canonicalCatalogPayload(prior));
      if(priorAddress!==payloadAddress)throw catalogError('CATALOG_SEQUENCE_COLLISION','Catalog sequence was reused for different content.');
      return Object.freeze({status:'unchanged',payload,payloadAddress,envelope:clone(envelope)});
    }
    if(payload.keyId!==prior.keyId){
      const authorized=Array.isArray(prior.authorizedSuccessorKeyIds)
        ?prior.authorizedSuccessorKeyIds
        :Array.isArray(prior.supportedKeyIds)?prior.supportedKeyIds:[];
      if(!authorized.includes(payload.keyId))throw catalogError(
        'CATALOG_KEY_ROTATION_UNAUTHORIZED',
        `Catalog signing key ${payload.keyId} was not authorized by predecessor ${prior.keyId}.`
      );
    }
    if(Number(payload.catalogRevision)<Number(prior.catalogRevision)){
      const rollback=payload.rollback;
      if(
        !rollback
        ||Number(rollback.fromRevision)!==Number(prior.catalogRevision)
        ||Number(rollback.toRevision)!==Number(payload.catalogRevision)
      )throw catalogError('CATALOG_DOWNGRADE','Catalog revision downgrade lacks an exact signed rollback directive.');
    }
  }
  return Object.freeze({status:'verified-newer',payload,payloadAddress,envelope:clone(envelope)});
}

async function requestResult(request){
  return new Promise((resolve,reject)=>{
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
  });
}

export function createV10CatalogRepository(){
  return Object.freeze({
    async getLastKnownGood(){
      return getV10Record(V10_STORES.remoteCatalogs,LAST_KNOWN_GOOD_CATALOG_ID);
    },
    async commitVerified(verified,{observedAt=new Date().toISOString()}={}){
      const record={
        id:LAST_KNOWN_GOOD_CATALOG_ID,
        catalogId:verified.payload.catalogId,
        sequence:Number(verified.payload.sequence),
        catalogRevision:Number(verified.payload.catalogRevision),
        state:'last-known-good',
        verifiedAt:observedAt,
        payloadAddress:verified.payloadAddress,
        payload:clone(verified.payload),
        envelope:clone(verified.envelope),
        updatedAt:Date.parse(observedAt)
      };
      const history={...record,id:`phase4:catalog:${record.catalogId}:${record.sequence}`,state:'verified-history'};
      const committed=await transactV10(
        [V10_STORES.remoteCatalogs,V10_STORES.packRevocations],
        async({stores,memory})=>{
          if(memory)throw catalogError('CATALOG_DURABILITY_REQUIRED','Catalog trust state cannot fall back to memory.');
          const current=await requestResult(stores[V10_STORES.remoteCatalogs].get(LAST_KNOWN_GOOD_CATALOG_ID));
          if(current&&Number(current.sequence)>record.sequence)throw catalogError('CATALOG_REPLAY','A newer durable catalog already exists.');
          if(current&&Number(current.sequence)===record.sequence){
            if(current.payloadAddress!==record.payloadAddress)throw catalogError(
              'CATALOG_SEQUENCE_COLLISION',
              'The durable catalog sequence is already bound to different content.'
            );
            return clone(current);
          }
          stores[V10_STORES.remoteCatalogs].put(clone(history));
          stores[V10_STORES.remoteCatalogs].put(clone(record));
          for(const revocation of verified.payload.revocations||[])stores[V10_STORES.packRevocations].put({
            ...clone(revocation),
            id:`revocation:${revocation.packId}:${revocation.packRevision}`,
            catalogSequence:record.sequence,
              updatedAt:record.updatedAt
            });
          return clone(record);
        },
        'phase4-catalog-verified'
      );
      return committed;
    }
  });
}

export async function loadBundledTrustRoots({url='/content/trust-roots.json',fetcher=fetch}={}){
  const response=await fetcher(url,{cache:'force-cache'});
  if(!response.ok)throw catalogError('CATALOG_TRUST_ROOT_UNAVAILABLE',`Bundled trust roots returned HTTP ${response.status}.`);
  const document=await response.json();
  if(Number(document.schemaVersion)!==CONTENT_SCHEMA_VERSION||!Array.isArray(document.keys)||!document.keys.length)throw catalogError('CATALOG_TRUST_ROOT_INVALID','Bundled trust-root document is malformed.');
  return Object.freeze(document.keys.map(root=>Object.freeze(clone(root))));
}

export function createCatalogTrustService({
  repository=createV10CatalogRepository(),
  trustRoots=[],
  fetcher=fetch,
  now=()=>Date.now()
}={}){
  function assess(record){
    if(!record)return null;
    const expiresAt=Date.parse(previousPayload(record)?.expiresAt||'');
    const expired=!Number.isFinite(expiresAt)||expiresAt<=Number(now());
    return Object.freeze({...clone(record),expired,trustState:expired?'expired-last-known-good':'verified-last-known-good'});
  }
  async function current(){
    return assess(await repository.getLastKnownGood());
  }
  async function accept(envelope){
    const existing=await current();
    const verified=await verifySignedCatalogEnvelope(envelope,{trustRoots,lastKnownGood:existing,now:now()});
    if(verified.status==='unchanged')return{state:'verified-last-known-good',catalog:existing,verified};
    const stored=await repository.commitVerified(verified,{observedAt:new Date(now()).toISOString()});
    return{state:'verified-newer',catalog:stored,verified};
  }
  async function refresh(url){
    const existing=await current();
    try{
      const response=await fetcher(url,{cache:'no-store'});
      if(!response.ok)throw catalogError('CATALOG_HTTP_ERROR',`Catalog request returned HTTP ${response.status}.`,{status:response.status});
      const envelope=await response.json();
      return await accept(envelope);
    }catch(error){
      if(existing)return{
        state:existing.expired?'expired-last-known-good':error?.code?.startsWith?.('CATALOG_')&&error.code!=='CATALOG_HTTP_ERROR'?'rejected-last-known-good':'offline-last-known-good',
        catalog:existing,
        error
      };
      throw catalogError('CATALOG_UNAVAILABLE_NO_LKG','No verified catalog is available on this device.',{cause:error,recovery:'retry-network'});
    }
  }
  async function startup(){
    const existing=await current();
    return existing
      ?{state:existing.expired?'expired-last-known-good':'offline-last-known-good',catalog:existing}
      :{state:'no-valid-catalog',catalog:null,recovery:'connect-and-retry'};
  }
  return Object.freeze({accept,current,refresh,startup});
}
