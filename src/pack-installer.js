import {
  CONTENT_SCHEMA_VERSION,
  INSTALL_JOURNAL_STAGES,
  assertValidContent,
  canonicalContentJson,
  contentAddressFor,
  contentContractError,
  normalizeContentAddress,
  sha256HexBytes,
  validateCatalogEntry,
  validatePackInstallJournal,
  validatePackManifest
} from './content-contracts-v2.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Record,transactV10 } from './v10-persistence.js';

export const CONTENT_CACHE_NAME='vocab-master-content-v2';
export const CONTENT_STAGE_PREFIX='vocab-master-content-stage-v2:';
export const PACK_LEASE_MS=60_000;

const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);
const nowIso=clock=>new Date(clock()).toISOString();
const requestResult=request=>new Promise((resolve,reject)=>{
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
});

export function packInstallError(code,message,details={}){
  const recoverable=!['PACK_CONTRACT_INVALID','PACK_RIGHTS_REJECTED','PACK_REVOKED','PACK_SCHEMA_UNSUPPORTED'].includes(code);
  return Object.assign(contentContractError(code,message,details),{name:'PackInstallError',recoverable,...details});
}

function normalizeMediaType(value){
  return clean(value,160).split(';',1)[0].trim().toLowerCase();
}

function compareVersions(left='0',right='0'){
  const a=String(left).split('.').map(Number),b=String(right).split('.').map(Number);
  for(let index=0;index<Math.max(a.length,b.length);index++){
    const difference=(a[index]||0)-(b[index]||0);
    if(difference)return difference;
  }
  return 0;
}

function cacheKey(address){
  const parsed=normalizeContentAddress(address);
  return`https://vocab-master.invalid/__content__/sha256/${parsed.digest}`;
}

function typedStorageError(error,stage){
  if(error?.code?.startsWith?.('PACK_'))return error;
  if(error?.name==='QuotaExceededError')return packInstallError('PACK_QUOTA_EXCEEDED','Not enough storage to install this pack.',{stage,cause:error,recovery:'free-space-and-retry'});
  if(error?.name==='AbortError')return packInstallError('PACK_DOWNLOAD_CANCELLED','Pack download was cancelled safely.',{stage,cause:error,recovery:'retry'});
  return packInstallError('PACK_STORAGE_FAILED',`Pack storage failed during ${stage}.`,{stage,cause:error,recovery:'retry'});
}

async function responseBytes(response){
  return new Uint8Array(await response.arrayBuffer());
}

async function verifyAssetBytes(bytes,descriptor,mediaType){
  const expected=normalizeContentAddress(descriptor.contentAddress);
  const actualDigest=await sha256HexBytes(bytes);
  if(actualDigest!==expected.digest)throw packInstallError('PACK_DIGEST_MISMATCH',`Digest mismatch for ${descriptor.id}.`,{assetId:descriptor.id,expected:expected.digest,actual:actualDigest,recovery:'redownload'});
  if(bytes.byteLength!==Number(descriptor.byteLength))throw packInstallError('PACK_LENGTH_MISMATCH',`Length mismatch for ${descriptor.id}.`,{assetId:descriptor.id,expected:Number(descriptor.byteLength),actual:bytes.byteLength,recovery:'redownload'});
  const declared=normalizeMediaType(descriptor.mediaType),actual=normalizeMediaType(mediaType);
  if(actual!==declared)throw packInstallError('PACK_MEDIA_TYPE_MISMATCH',`Media type mismatch for ${descriptor.id}.`,{assetId:descriptor.id,expected:declared,actual,recovery:'redownload'});
  return{address:expected.value,digest:actualDigest,byteLength:bytes.byteLength,mediaType:actual};
}

export function createCacheAssetStore({cacheStorage=globalThis.caches}={}){
  if(!cacheStorage)throw packInstallError('PACK_CACHE_UNAVAILABLE','CacheStorage is unavailable.',{recovery:'use-supported-browser'});
  const stageName=installId=>`${CONTENT_STAGE_PREFIX}${encodeURIComponent(installId)}`;
  async function read(cacheName,address){
    const cache=await cacheStorage.open(cacheName);
    const response=await cache.match(cacheKey(address));
    if(!response)return null;
    return{bytes:await responseBytes(response.clone()),mediaType:response.headers.get('content-type')||'',response};
  }
  return Object.freeze({
    async readFinal(descriptor){
      const stored=await read(CONTENT_CACHE_NAME,descriptor.contentAddress);
      if(!stored)return null;
      try{
        await verifyAssetBytes(stored.bytes,descriptor,stored.mediaType);
        return stored;
      }catch{
        const cache=await cacheStorage.open(CONTENT_CACHE_NAME);
        await cache.delete(cacheKey(descriptor.contentAddress));
        return null;
      }
    },
    async putStage(installId,descriptor,bytes){
      const cache=await cacheStorage.open(stageName(installId));
      await cache.put(cacheKey(descriptor.contentAddress),new Response(bytes,{status:200,headers:{
        'content-type':descriptor.mediaType,
        'content-length':String(bytes.byteLength),
        'x-vocab-content-address':descriptor.contentAddress
      }}));
    },
    async readStage(installId,descriptor){
      const stored=await read(stageName(installId),descriptor.contentAddress);
      if(!stored)return null;
      await verifyAssetBytes(stored.bytes,descriptor,stored.mediaType);
      return stored;
    },
    async promote(installId,descriptor){
      const stored=await this.readStage(installId,descriptor);
      if(!stored)throw packInstallError('PACK_STAGING_MISSING',`Staged asset ${descriptor.id} is missing.`,{assetId:descriptor.id,recovery:'retry'});
      const cache=await cacheStorage.open(CONTENT_CACHE_NAME);
      await cache.put(cacheKey(descriptor.contentAddress),new Response(stored.bytes,{status:200,headers:{
        'content-type':descriptor.mediaType,
        'content-length':String(stored.bytes.byteLength),
        'x-vocab-content-address':descriptor.contentAddress
      }}));
    },
    async deleteStage(installId){
      return cacheStorage.delete(stageName(installId));
    },
    async deleteFinal(address){
      const cache=await cacheStorage.open(CONTENT_CACHE_NAME);
      return cache.delete(cacheKey(address));
    },
    async hasFinal(descriptor){
      return Boolean(await this.readFinal(descriptor));
    },
    finalKey:cacheKey,
    stageName
  });
}

function lessonProjection(lesson,manifest,entry,installedAt){
  return{
    id:lesson.id,
    schemaVersion:lesson.schemaVersion,
    contentRevision:lesson.contentRevision,
    contentAddress:lesson.contentAddress,
    title:lesson.title,
    description:lesson.learningObjective,
    learningObjective:lesson.learningObjective,
    estimatedMinutes:lesson.estimatedMinutes,
    level:lesson.difficulty,
    difficulty:lesson.difficulty,
    skill:lesson.skill,
    skills:[lesson.skill],
    topic:lesson.topic||'IELTS foundations',
    lexicalTargets:clone(lesson.lexicalTargets||[]),
    activities:clone(lesson.activities||[]),
    assetIds:clone(lesson.assetIds||[]),
    accessibility:clone(lesson.accessibility),
    compatibility:clone(lesson.compatibility),
    rights:clone(lesson.rights),
    provenance:clone(lesson.provenance),
    humanReview:clone(lesson.humanReview),
    publishedAt:lesson.publishedAt,
    verified:true,
    qualityStatus:'verified',
    installState:'installed',
    packId:manifest.id,
    packRevision:Number(manifest.contentRevision),
    packManifestAddress:entry.contentAddress,
    installedAt,
    updatedAt:Date.parse(installedAt)
  };
}

export function createV10PackRepository(){
  return Object.freeze({
    getJournal:installId=>getV10Record(V10_STORES.packInstallJournals,installId),
    saveJournal:journal=>putV10Record(V10_STORES.packInstallJournals,journal,'phase4-pack-journal'),
    getInstalled:async packId=>{
      const rows=await listV10Records(V10_STORES.installedPacks,{index:'packId',query:packId,sortBy:null});
      return rows[0]||null;
    },
    listInstalled:()=>listV10Records(V10_STORES.installedPacks,{sortBy:'updatedAt'}),
    listJournals:()=>listV10Records(V10_STORES.packInstallJournals,{sortBy:'updatedAt'}),
    async acquireLease(packId,ownerId,expiresAt){
      const leaseId=`phase4:pack-lease:${packId}`;
      return transactV10([V10_STORES.packInstallJournals],async({stores,memory})=>{
        if(memory)throw packInstallError('PACK_DURABILITY_REQUIRED','Pack lease cannot fall back to memory.');
        const existing=await requestResult(stores[V10_STORES.packInstallJournals].get(leaseId));
        if(existing&&Number(existing.expiresAt)>Date.now())return false;
        stores[V10_STORES.packInstallJournals].put({
          id:leaseId,kind:'pack-install-lease',schemaVersion:CONTENT_SCHEMA_VERSION,
          packId,ownerId,expiresAt,updatedAt:Date.now()
        });
        return true;
      },'phase4-pack-lease-acquired');
    },
    async releaseLease(packId,ownerId){
      const leaseId=`phase4:pack-lease:${packId}`;
      await transactV10([V10_STORES.packInstallJournals],async({stores,memory})=>{
        if(memory)throw packInstallError('PACK_DURABILITY_REQUIRED','Pack lease cannot fall back to memory.');
        const existing=await requestResult(stores[V10_STORES.packInstallJournals].get(leaseId));
        if(existing?.ownerId===ownerId)stores[V10_STORES.packInstallJournals].delete(leaseId);
      },'phase4-pack-lease-released');
    },
    async activate({entry,manifest,journal,verifiedAssets,activatedAt}){
      const storeNames=[
        V10_STORES.installedPacks,
        V10_STORES.packActivationReceipts,
        V10_STORES.packInstallJournals,
        V10_STORES.contentManifests,
        V10_STORES.contentAssets
      ];
      return transactV10(storeNames,async({stores,memory})=>{
        if(memory)throw packInstallError('PACK_DURABILITY_REQUIRED','Pack activation cannot fall back to memory.');
        const installedStore=stores[V10_STORES.installedPacks];
        const existingRows=await requestResult(installedStore.index('packId').getAll(manifest.id));
        const existing=existingRows[0]||null;
        if(existing&&Number(existing.activeRevision)===Number(manifest.contentRevision)&&existing.manifestAddress===entry.contentAddress){
          const completed={...journal,stage:'activated',activatedAt,updatedAt:Date.parse(activatedAt)};
          stores[V10_STORES.packInstallJournals].put(completed);
          return{installed:existing,receipt:null,duplicate:true};
        }
        const history=[
          ...(existing?.revisionHistory||[]),
          ...(existing?[{
            revision:existing.activeRevision,
            manifestAddress:existing.manifestAddress,
            assetAddresses:existing.assetAddresses||[],
            lessonIds:existing.lessonIds||[],
            deactivatedAt:activatedAt
          }]:[])
        ].filter((row,index,rows)=>rows.findIndex(candidate=>Number(candidate.revision)===Number(row.revision)&&candidate.manifestAddress===row.manifestAddress)===index);
        const installed={
          id:`installed:${manifest.id}`,
          schemaVersion:CONTENT_SCHEMA_VERSION,
          packId:manifest.id,
          activeRevision:Number(manifest.contentRevision),
          manifestAddress:entry.contentAddress,
          state:'installed',
          lessonIds:manifest.lessons.map(lesson=>lesson.id),
          assetAddresses:manifest.assets.map(asset=>asset.contentAddress),
          revisionHistory:history,
          installedAt:existing?.installedAt||activatedAt,
          activatedAt,
          updatedAt:Date.parse(activatedAt)
        };
        const receipt={
          id:`activation:${manifest.id}:${manifest.contentRevision}:${Date.parse(activatedAt)}`,
          schemaVersion:CONTENT_SCHEMA_VERSION,
          packId:manifest.id,
          activatedRevision:Number(manifest.contentRevision),
          previousRevision:existing?.activeRevision||null,
          manifestAddress:entry.contentAddress,
          activatedAt,
          journalId:journal.id,
          updatedAt:Date.parse(activatedAt)
        };
        installedStore.put(clone(installed));
        stores[V10_STORES.packActivationReceipts].add(clone(receipt));
        for(const lesson of manifest.lessons)stores[V10_STORES.contentManifests].put(lessonProjection(lesson,manifest,entry,activatedAt));
        for(const descriptor of manifest.assets)stores[V10_STORES.contentAssets].put({
          id:`remote:${descriptor.contentAddress}`,
          schemaVersion:CONTENT_SCHEMA_VERSION,
          lessonId:null,
          packIds:[...new Set([...(existing?.packIds||[]),manifest.id])],
          assetType:'remote-content-addressed',
          contentAddress:descriptor.contentAddress,
          mediaType:descriptor.mediaType,
          bytes:descriptor.byteLength,
          retrievalUrl:descriptor.retrievalUrl,
          verified:true,
          verifiedAt:activatedAt,
          updatedAt:Date.parse(activatedAt)
        });
        stores[V10_STORES.packInstallJournals].put({...clone(journal),stage:'activated',activatedAt,updatedAt:Date.parse(activatedAt)});
        return{installed,receipt,duplicate:false,verifiedAssets};
      },'phase4-pack-activated');
    }
  });
}

function journalRecord({installId,packId,packRevision,ownerId,clock,existing={}}){
  const createdAt=existing.createdAt||nowIso(clock);
  const value={
    ...clone(existing),
    id:installId,
    schemaVersion:CONTENT_SCHEMA_VERSION,
    kind:'pack-install-journal',
    packId,
    packRevision:Number(packRevision),
    ownerId,
    stage:existing.stage||'created',
    verifiedAssets:Array.isArray(existing.verifiedAssets)?existing.verifiedAssets:[],
    createdAt,
    updatedAt:nowIso(clock)
  };
  assertValidContent(validatePackInstallJournal(value),'PACK_JOURNAL_INVALID');
  return value;
}

export function createPackInstaller({
  catalogTrust,
  repository=createV10PackRepository(),
  assetStore=createCacheAssetStore(),
  fetcher=fetch,
  appVersion='10.0.0',
  ownerId=globalThis.crypto?.randomUUID?.()||`pack-installer-${Date.now()}`,
  clock=()=>Date.now(),
  lockManager=globalThis.navigator?.locks||null,
  hooks={}
}={}){
  if(!catalogTrust?.current)throw new TypeError('Pack installer requires a catalog trust service.');
  const activeControllers=new Map();

  async function updateJournal(journal,stage,patch={}){
    if(!INSTALL_JOURNAL_STAGES.includes(stage))throw packInstallError('PACK_JOURNAL_STAGE_INVALID',`Unsupported install stage ${stage}.`);
    const next={...clone(journal),...clone(patch),stage,updatedAt:nowIso(clock)};
    assertValidContent(validatePackInstallJournal(next),'PACK_JOURNAL_INVALID');
    await repository.saveJournal(next);
    await hooks.afterStage?.(stage,clone(next));
    return next;
  }

  async function withLease(packId,operation){
    if(lockManager?.request){
      return lockManager.request(`vocab-master:pack:${packId}`,{mode:'exclusive'},operation);
    }
    const acquired=await repository.acquireLease(packId,ownerId,clock()+PACK_LEASE_MS);
    if(!acquired)throw packInstallError('PACK_INSTALL_CONCURRENT','Another tab is installing this pack.',{packId,recovery:'wait-and-retry'});
    try{return await operation();}finally{await repository.releaseLease(packId,ownerId);}
  }

  async function fetchVerifiedBytes(url,{expectedAddress,expectedLength,expectedMediaType,signal,kind,id}){
    let response;
    try{response=await fetcher(url,{cache:'no-store',signal});}
    catch(error){
      if(error?.name==='AbortError')throw typedStorageError(error,kind);
      throw packInstallError('PACK_NETWORK_FAILED',`Network failed while downloading ${kind} ${id}.`,{kind,id,cause:error,recovery:'retry'});
    }
    if(!response.ok)throw packInstallError('PACK_HTTP_ERROR',`${kind} ${id} returned HTTP ${response.status}.`,{kind,id,status:response.status,recovery:'retry'});
    const bytes=await responseBytes(response);
    const descriptor={
      id,
      contentAddress:expectedAddress,
      byteLength:Number(expectedLength),
      mediaType:expectedMediaType
    };
    await verifyAssetBytes(bytes,descriptor,response.headers.get('content-type')||'');
    return bytes;
  }

  async function install(packId,{signal=null}={}){
    return withLease(packId,async()=>{
      const currentCatalog=await catalogTrust.current();
      const payload=currentCatalog?.payload||currentCatalog?.envelope?.payload;
      if(!payload)throw packInstallError('PACK_CATALOG_UNAVAILABLE','No verified catalog is available.',{recovery:'refresh-catalog'});
      const entry=payload.entries?.find(candidate=>candidate.packId===packId);
      if(!entry)throw packInstallError('PACK_NOT_IN_CATALOG',`Pack ${packId} is absent from the verified catalog.`,{packId,recovery:'refresh-catalog'});
      assertValidContent(validateCatalogEntry(entry,{publication:true,at:clock()}),'PACK_CATALOG_ENTRY_INVALID');
      if((payload.revocations||[]).some(row=>row.packId===packId&&Number(row.packRevision)===Number(entry.contentRevision)))throw packInstallError('PACK_REVOKED',`Pack ${packId} revision ${entry.contentRevision} is revoked.`,{packId,packRevision:entry.contentRevision});
      if(compareVersions(appVersion,entry.compatibility.minimumAppVersion)<0)throw packInstallError('PACK_APP_INCOMPATIBLE',`Pack ${packId} requires app ${entry.compatibility.minimumAppVersion}.`,{recovery:'update-app'});
      const existingInstalled=await repository.getInstalled(packId);
      if(existingInstalled?.state==='installed'&&Number(existingInstalled.activeRevision)===Number(entry.contentRevision)&&existingInstalled.manifestAddress===entry.contentAddress)return{status:'already-installed',installed:existingInstalled};

      const installId=`install:${packId}:${entry.contentRevision}`;
      let journal=journalRecord({
        installId,packId,packRevision:entry.contentRevision,ownerId,clock,
        existing:await repository.getJournal(installId)||{}
      });
      if(['cancelled','failed'].includes(journal.stage))journal=await updateJournal(journal,'created',{error:null,cancelRequested:false});
      else if(!await repository.getJournal(installId))await repository.saveJournal(journal);
      const controller=new AbortController();
      const abort=()=>controller.abort(signal?.reason);
      signal?.addEventListener?.('abort',abort,{once:true});
      activeControllers.set(installId,controller);
      try{
        if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
        journal=await updateJournal(journal,'catalog-verified',{catalogSequence:payload.sequence,catalogRevision:payload.catalogRevision,entryAddress:entry.contentAddress});
        const manifestBytes=await fetchVerifiedBytes(entry.manifestUrl,{
          expectedAddress:entry.contentAddress,
          expectedLength:entry.byteLength,
          expectedMediaType:'application/json',
          signal:controller.signal,
          kind:'manifest',
          id:packId
        });
        journal=await updateJournal(journal,'manifest-staged',{manifestBytes:manifestBytes.byteLength});
        let manifest;
        try{manifest=JSON.parse(new TextDecoder().decode(manifestBytes));}
        catch(error){throw packInstallError('PACK_MANIFEST_MALFORMED',`Pack ${packId} manifest is not valid JSON.`,{cause:error});}
        const manifestResult=validatePackManifest(manifest,{publication:true,at:clock()});
        if(!manifestResult.valid)throw packInstallError('PACK_CONTRACT_INVALID',manifestResult.errors.join(' '),{errors:manifestResult.errors});
        manifest=manifestResult.value;
        if(manifest.id!==entry.packId||Number(manifest.contentRevision)!==Number(entry.contentRevision))throw packInstallError('PACK_IDENTITY_MISMATCH','Catalog entry and pack manifest identity do not match.');
        if(compareVersions(appVersion,manifest.compatibility.minimumAppVersion)<0)throw packInstallError('PACK_APP_INCOMPATIBLE',`Pack ${packId} requires app ${manifest.compatibility.minimumAppVersion}.`,{recovery:'update-app'});
        journal=await updateJournal(journal,'manifest-verified',{manifestId:manifest.id,manifestContentAddress:manifest.contentAddress,assetCount:manifest.assets.length,lessonCount:manifest.lessons.length});
        journal=await updateJournal(journal,'assets-staging');

        const verifiedAssets=[];
        for(const descriptor of manifest.assets){
          if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
          let source='cache-hit';
          let stored=await assetStore.readFinal(descriptor);
          if(!stored){
            source='download';
            stored=await assetStore.readStage(installId,descriptor).catch(()=>null);
            if(!stored){
              const bytes=await fetchVerifiedBytes(descriptor.retrievalUrl,{
                expectedAddress:descriptor.contentAddress,
                expectedLength:descriptor.byteLength,
                expectedMediaType:descriptor.mediaType,
                signal:controller.signal,
                kind:'asset',
                id:descriptor.id
              });
              try{await assetStore.putStage(installId,descriptor,bytes);}
              catch(error){throw typedStorageError(error,'asset-staging');}
              stored={bytes,mediaType:descriptor.mediaType};
            }else source='staging-hit';
          }
          verifiedAssets.push({id:descriptor.id,contentAddress:descriptor.contentAddress,source,byteLength:stored.bytes.byteLength,mediaType:descriptor.mediaType});
          journal=await updateJournal(journal,'assets-staging',{verifiedAssets:clone(verifiedAssets)});
        }
        journal=await updateJournal(journal,'assets-verified',{verifiedAssets:clone(verifiedAssets)});
        for(const descriptor of manifest.assets){
          if(await assetStore.readFinal(descriptor))continue;
          try{await assetStore.promote(installId,descriptor);}
          catch(error){throw typedStorageError(error,'asset-promotion');}
        }
        journal=await updateJournal(journal,'activation-pending');
        const activatedAt=nowIso(clock);
        const result=await repository.activate({entry,manifest,journal,verifiedAssets,activatedAt});
        await assetStore.deleteStage(installId).catch(()=>false);
        return{status:result.duplicate?'already-installed':'installed',...result,manifest};
      }catch(error){
        const typed=typedStorageError(error,journal.stage);
        if(!['activation-pending','activated'].includes(journal.stage)){
          const cancelled=typed.code==='PACK_DOWNLOAD_CANCELLED';
          await updateJournal(journal,cancelled?'cancelled':'failed',{
            error:{code:typed.code,message:typed.message,recoverable:typed.recoverable},
            cancelRequested:cancelled
          }).catch(()=>undefined);
        }
        throw typed;
      }finally{
        signal?.removeEventListener?.('abort',abort);
        activeControllers.delete(installId);
      }
    });
  }

  async function cancel(packId,packRevision){
    const installId=`install:${packId}:${packRevision}`;
    const journal=await repository.getJournal(installId);
    if(!journal)return{cancelled:false,reason:'not-found'};
    if(['activation-pending','activated'].includes(journal.stage))return{cancelled:false,reason:'activation-committed'};
    activeControllers.get(installId)?.abort();
    await updateJournal(journal,'cancelled',{cancelRequested:true});
    return{cancelled:true,installId};
  }

  async function reconcile({olderThanMs=15*60_000}={}){
    const cutoff=clock()-olderThanMs;
    const journals=await repository.listJournals();
    const abandoned=journals.filter(row=>row.kind==='pack-install-journal'&&!['activated','cancelled'].includes(row.stage)&&Date.parse(row.updatedAt)<cutoff);
    const cleaned=[];
    for(const journal of abandoned){
      await assetStore.deleteStage(journal.id).catch(()=>false);
      await updateJournal(journal,'failed',{error:{code:'PACK_INSTALL_ABANDONED',message:'Abandoned staging was cleaned safely.',recoverable:true}});
      cleaned.push(journal.id);
    }
    return{cleaned};
  }

  return Object.freeze({cancel,install,reconcile});
}

export const __testing=Object.freeze({cacheKey,compareVersions,normalizeMediaType,verifyAssetBytes});
