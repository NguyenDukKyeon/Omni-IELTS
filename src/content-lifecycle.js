import {
  CONTENT_SCHEMA_VERSION,
  contentContractError,
  validatePackManifest
} from './content-contracts-v2.js';
import { createCacheAssetStore } from './pack-installer.js';
import { createEffectiveRevocationLookup } from './content-revocations.js';
import { V10_STORES } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Record,transactV10 } from './v10-persistence.js';

const clone=value=>value==null?value:structuredClone(value);
const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);
const requestResult=request=>new Promise((resolve,reject)=>{
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
});

export function contentLifecycleError(code,message,details={}){
  return Object.assign(contentContractError(code,message,details),{name:'ContentLifecycleError',recoverable:true,...details});
}

function compareVersions(left='0',right='0'){
  const a=String(left).split('.').map(Number),b=String(right).split('.').map(Number);
  for(let index=0;index<Math.max(a.length,b.length);index++){
    const difference=(a[index]||0)-(b[index]||0);
    if(difference)return difference;
  }
  return 0;
}

function allAddresses(installed={}){
  return new Set([
    ...(installed.assetAddresses||[]),
    ...(installed.revisionHistory||[]).flatMap(revision=>revision.assetAddresses||[])
  ]);
}

function projectLessonFromSnapshot(lesson,manifest,installed,at){
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
    assetDescriptors:manifest.assets.filter(asset=>(lesson.assetIds||[]).includes(asset.id)).map(clone),
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
    packManifestAddress:installed.manifestAddress,
    installedAt:at,
    updatedAt:Date.parse(at)
  };
}

export function createV10LifecycleRepository(){
  return Object.freeze({
    listInstalled:()=>listV10Records(V10_STORES.installedPacks,{sortBy:'updatedAt'}),
    async getInstalled(packId){
      const rows=await listV10Records(V10_STORES.installedPacks,{index:'packId',query:packId,sortBy:null});
      return rows[0]||null;
    },
    listLessons:()=>listV10Records(V10_STORES.contentManifests,{sortBy:'updatedAt'}),
    getLesson:lessonId=>getV10Record(V10_STORES.contentManifests,lessonId),
    getProgress:lessonId=>getV10Record(V10_STORES.contentProgress,lessonId),
    saveProgress:progress=>putV10Record(V10_STORES.contentProgress,progress,'phase4-content-progress'),
    listRevocations:()=>listV10Records(V10_STORES.packRevocations,{sortBy:'revokedAt'}),
    async setPackState(packId,state,patch={}){
      const installed=await this.getInstalled(packId);
      if(!installed)return null;
      const next={...installed,...clone(patch),state,updatedAt:Date.now()};
      await putV10Record(V10_STORES.installedPacks,next,'phase4-pack-state');
      return next;
    },
    async deletePack(installed,{unreferencedAddresses,deletedAt}){
      const stores=[
        V10_STORES.installedPacks,
        V10_STORES.packTombstones,
        V10_STORES.contentManifests,
        V10_STORES.contentAssets
      ];
      return transactV10(stores,async({stores:transactionStores,memory})=>{
        if(memory)throw contentLifecycleError('PACK_DURABILITY_REQUIRED','Pack deletion cannot fall back to memory.');
        const installedStore=transactionStores[V10_STORES.installedPacks];
        const current=await requestResult(installedStore.get(installed.id));
        if(!current)return{deleted:false,reason:'not-installed'};
        const tombstone={
          id:`tombstone:${installed.packId}:${Date.parse(deletedAt)}`,
          schemaVersion:CONTENT_SCHEMA_VERSION,
          packId:installed.packId,
          deletedRevision:installed.activeRevision,
          manifestAddress:installed.manifestAddress,
          lessonIds:clone(installed.lessonIds||[]),
          assetAddresses:[...allAddresses(installed)],
          deletedAt,
          reason:'learner-request',
          updatedAt:Date.parse(deletedAt)
        };
        installedStore.put({
          ...clone(current),
          state:'deleted',
          deletedAt,
          lessonIds:[],
          assetAddresses:[],
          updatedAt:Date.parse(deletedAt)
        });
        transactionStores[V10_STORES.packTombstones].add(tombstone);
        for(const lessonId of current.lessonIds||[]){
          const lesson=await requestResult(transactionStores[V10_STORES.contentManifests].get(lessonId));
          if(lesson)transactionStores[V10_STORES.contentManifests].put({...lesson,installState:'uninstalled',verified:false,qualityStatus:'validated',updatedAt:Date.parse(deletedAt)});
        }
        for(const address of allAddresses(current)){
          const id=`remote:${address}`;
          const asset=await requestResult(transactionStores[V10_STORES.contentAssets].get(id));
          if(!asset)continue;
          const packIds=(asset.packIds||[]).filter(value=>value!==installed.packId);
          if(unreferencedAddresses.has(address))transactionStores[V10_STORES.contentAssets].delete(id);
          else transactionStores[V10_STORES.contentAssets].put({...asset,packIds,updatedAt:Date.parse(deletedAt)});
        }
        return{deleted:true,tombstone};
      },'phase4-pack-deleted');
    },
    async rollback(installed,revision,{activatedAt}){
      const target=(installed.revisionHistory||[]).find(row=>Number(row.revision)===Number(revision));
      if(!target?.manifestSnapshot)throw contentLifecycleError('PACK_ROLLBACK_UNAVAILABLE','The requested immutable revision metadata is unavailable.');
      const manifest=target.manifestSnapshot;
      const stores=[V10_STORES.installedPacks,V10_STORES.packActivationReceipts,V10_STORES.contentManifests];
      return transactV10(stores,async({stores:transactionStores,memory})=>{
        if(memory)throw contentLifecycleError('PACK_DURABILITY_REQUIRED','Pack rollback cannot fall back to memory.');
        const current=await requestResult(transactionStores[V10_STORES.installedPacks].get(installed.id));
        if(!current||Number(current.activeRevision)!==Number(installed.activeRevision))throw contentLifecycleError('PACK_ROLLBACK_CONFLICT','Active pack changed before rollback.');
        const currentHistory={
          revision:current.activeRevision,
          manifestAddress:current.manifestAddress,
          assetAddresses:current.assetAddresses||[],
          lessonIds:current.lessonIds||[],
          manifestSnapshot:current.manifestSnapshot,
          deactivatedAt:activatedAt
        };
        const nextHistory=(current.revisionHistory||[]).filter(row=>Number(row.revision)!==Number(revision));
        nextHistory.push(currentHistory);
        const next={
          ...current,
          activeRevision:Number(revision),
          manifestAddress:target.manifestAddress,
          assetAddresses:clone(target.assetAddresses||manifest.assets.map(asset=>asset.contentAddress)),
          lessonIds:clone(target.lessonIds||manifest.lessons.map(lesson=>lesson.id)),
          manifestSnapshot:clone(manifest),
          revisionHistory:nextHistory,
          state:'installed',
          activatedAt,
          updatedAt:Date.parse(activatedAt)
        };
        transactionStores[V10_STORES.installedPacks].put(next);
        const receipt={
          id:`activation:${installed.packId}:${revision}:rollback:${Date.parse(activatedAt)}`,
          schemaVersion:CONTENT_SCHEMA_VERSION,
          packId:installed.packId,
          activatedRevision:Number(revision),
          previousRevision:current.activeRevision,
          manifestAddress:target.manifestAddress,
          activatedAt,
          rollback:true,
          updatedAt:Date.parse(activatedAt)
        };
        transactionStores[V10_STORES.packActivationReceipts].add(receipt);
        for(const lesson of manifest.lessons)transactionStores[V10_STORES.contentManifests].put(projectLessonFromSnapshot(lesson,manifest,next,activatedAt));
        return{installed:next,receipt};
      },'phase4-pack-rollback');
    },
    async restorePackReady(installed,{verifiedAt}){
      const stores=[V10_STORES.installedPacks,V10_STORES.contentManifests];
      return transactV10(stores,async({stores:transactionStores,memory})=>{
        if(memory)throw contentLifecycleError('PACK_DURABILITY_REQUIRED','Restore reconciliation cannot fall back to memory.');
        const current=await requestResult(transactionStores[V10_STORES.installedPacks].get(installed.id));
        if(
          !current
          ||current.state!=='reinstall-required'
          ||current.restoredRequiresAssetVerification!==true
          ||Number(current.activeRevision)!==Number(installed.activeRevision)
        )throw contentLifecycleError('PACK_RESTORE_RECONCILIATION_CONFLICT','Restored pack pointer changed before cache verification completed.');
        const next={
          ...current,
          state:'installed',
          reasonCode:null,
          restoreState:'verified-cache-reconnected',
          restoredRequiresAssetVerification:false,
          restoredVerifiedAt:verifiedAt,
          updatedAt:Date.parse(verifiedAt)
        };
        transactionStores[V10_STORES.installedPacks].put(next);
        for(const lesson of current.manifestSnapshot.lessons)transactionStores[V10_STORES.contentManifests].put(
          projectLessonFromSnapshot(lesson,current.manifestSnapshot,next,verifiedAt)
        );
        return next;
      },'phase4-restored-pack-reconciled');
    }
  });
}

function revoked(revocations,packId,revision){
  return revocations.some(row=>row.packId===packId&&Number(row.packRevision)===Number(revision));
}

function hasExactInstalledActivityTarget(activity,lesson){
  const target=activity?.target;
  return Boolean(
    target
    &&target.packId===lesson.packId
    &&Number(target.packRevision)===Number(lesson.packRevision)
    &&target.lessonId===lesson.id
    &&Number(target.lessonRevision)===Number(lesson.contentRevision)
    &&target.activityId===activity.id
    &&target.cardId===activity.id
    &&target.sourceId===`remote-content:${lesson.id}`
    &&/^sha256:[a-f0-9]{64}$/.test(String(target.sourceRevision||''))
    &&['recognition','recall','listening','collocation','production'].includes(target.skill)
  );
}

function todayActivityType(activity,lesson){
  if(['dictation','shadowing'].includes(activity.type))return activity.type;
  if(activity.type==='retell-coaching')return'retell';
  if(activity.type.includes('reading'))return'reading';
  if(['sentence-production','paragraph-production'].includes(activity.type))return'production';
  if(lesson.skill==='listening')return'dictation';
  if(lesson.skill==='reading')return'reading';
  return'paraphrase';
}

export function createContentLifecycle({
  catalogTrust,
  installer,
  repository=createV10LifecycleRepository(),
  assetStore=createCacheAssetStore(),
  revocations=createEffectiveRevocationLookup({catalogTrust,repository}),
  appVersion='10.0.0',
  clock=()=>Date.now()
}={}){
  if(!catalogTrust?.current||!installer?.install)throw new TypeError('Content lifecycle requires catalog trust and pack installer services.');

  async function catalogPayload(){
    const current=await catalogTrust.current();
    return current?.payload||current?.envelope?.payload||null;
  }

  async function browse(){
    const [current,installedRows,effective]=await Promise.all([
      catalogTrust.current(),
      repository.listInstalled(),
      revocations.snapshot()
    ]);
    const payload=current?.payload||current?.envelope?.payload||null;
    if(!payload)return{state:'no-valid-catalog',catalog:null,packs:[]};
    const installedByPack=new Map(installedRows.map(row=>[row.packId,row]));
    const catalogExpired=current?.expired===true||current?.trustState==='expired-last-known-good';
    const visibleEntries=catalogExpired
      ?payload.entries.filter(entry=>installedByPack.has(entry.packId))
      :payload.entries;
    const packs=visibleEntries.map(entry=>{
      const installed=installedByPack.get(entry.packId)||null;
      const isRevoked=effective.indexed.has(`${entry.packId}:${Number(entry.contentRevision)}`)
        ||Boolean(installed&&effective.indexed.has(`${installed.packId}:${Number(installed.activeRevision)}`));
      const updateAvailable=Boolean(installed?.state==='installed'&&Number(entry.contentRevision)>Number(installed.activeRevision));
      return{
        id:entry.packId,
        title:entry.title||entry.packId,
        summary:entry.summary||'Verified immutable learning pack.',
        revision:Number(entry.contentRevision),
        byteLength:Number(entry.byteLength),
        lessonCount:Number(entry.lessonCount||0),
        rights:clone(entry.rights),
        provenance:clone(entry.provenance),
        review:clone(entry.humanReview),
        installedRevision:installed?.activeRevision||null,
        state:isRevoked?'revoked':catalogExpired?(installed?.state==='installed'?'installed':'historical'):updateAvailable?'update-available':installed?.state||'available',
        updateAvailable:catalogExpired?false:updateAvailable,
        revoked:isRevoked,
        compatible:compareVersions(appVersion,entry.compatibility?.minimumAppVersion)<0?false:true,
        catalogInstallable:!catalogExpired&&!isRevoked
      };
    });
    return{
      state:catalogExpired?'expired-last-known-good':'verified',
      catalog:{catalogId:payload.catalogId,sequence:payload.sequence,revision:payload.catalogRevision,issuedAt:payload.issuedAt,expiresAt:payload.expiresAt},
      packs
    };
  }

  async function listLessons({installedOnly=true,skill=null}={}){
    let rows=await repository.listLessons();
    if(installedOnly)rows=rows.filter(row=>row.installState==='installed'&&row.verified===true&&row.qualityStatus==='verified');
    if(skill)rows=rows.filter(row=>row.skill===skill);
    const installedRows=await repository.listInstalled();
    const installedByPack=new Map(installedRows.map(row=>[row.packId,row]));
    const effective=await revocations.snapshot();
    return rows.filter(row=>{
      const pack=installedByPack.get(row.packId);
      const active=Boolean(pack?.state==='installed'&&Number(pack.activeRevision)===Number(row.packRevision));
      if(!active||compareVersions(appVersion,row.compatibility?.minimumAppVersion)<0)return false;
      return !effective.indexed.has(`${row.packId}:${Number(row.packRevision)}`);
    });
  }

  async function install(packId,options={}){
    return installer.install(packId,options);
  }

  async function pauseOrCancel(packId,revision){
    return installer.cancel(packId,revision);
  }

  async function remove(packId){
    const installed=await repository.getInstalled(packId);
    if(!installed||installed.state==='deleted')return{deleted:false,reason:'not-installed'};
    const otherInstalled=(await repository.listInstalled()).filter(row=>row.packId!==packId&&row.state!=='deleted');
    const referencedElsewhere=new Set(otherInstalled.flatMap(row=>[...allAddresses(row)]));
    const unreferenced=new Set([...allAddresses(installed)].filter(address=>!referencedElsewhere.has(address)));
    const deletedAt=new Date(clock()).toISOString();
    const durable=await repository.deletePack(installed,{unreferencedAddresses:unreferenced,deletedAt});
    const cacheErrors=[];
    for(const address of unreferenced)try{await assetStore.deleteFinal(address);}catch(error){cacheErrors.push({address,error});}
    return{...durable,removedAssets:unreferenced.size,cacheCleanupPending:cacheErrors.map(row=>row.address)};
  }

  async function reconcileMissingAssets(){
    const rows=(await repository.listInstalled()).filter(row=>
      row.state==='installed'
      ||(row.state==='reinstall-required'&&row.restoredRequiresAssetVerification===true)
    );
    const missing=[];
    const restored=[];
    for(const installed of rows){
      const manifest=installed.manifestSnapshot;
      if(!manifest){
        await repository.setPackState(installed.packId,'reinstall-required',{reasonCode:'manifest-metadata-missing'});
        missing.push({packId:installed.packId,addresses:[]});
        continue;
      }
      const absent=[];
      for(const descriptor of manifest.assets)if(!await assetStore.readFinal(descriptor))absent.push(descriptor.contentAddress);
      if(absent.length){
        await repository.setPackState(installed.packId,'reinstall-required',{reasonCode:'cache-assets-missing',missingAssetAddresses:absent});
        missing.push({packId:installed.packId,addresses:absent});
      }else if(installed.state==='reinstall-required'&&installed.restoredRequiresAssetVerification===true){
        const revocation=await revocations.find(installed.packId,installed.activeRevision);
        if(revocation){
          await repository.setPackState(installed.packId,'revoked',{reasonCode:revocation.reasonCode||'effective-revocation',effectiveRevocation:clone(revocation)});
          continue;
        }
        const validation=await validatePackManifest(manifest,{publication:true,at:clock()});
        if(
          !validation.valid
          ||Number(manifest.contentRevision)!==Number(installed.activeRevision)
        ){
          await repository.setPackState(installed.packId,'error',{
            reasonCode:'restore-content-contract-invalid',
            restoreState:'quarantined',
            restoredRequiresAssetVerification:false,
            validationErrors:validation.errors
          });
          continue;
        }
        const ready=await repository.restorePackReady(installed,{verifiedAt:new Date(clock()).toISOString()});
        restored.push(ready.packId);
      }
    }
    return{missing,restored};
  }

  async function applyRevocations(){
    const effective=await revocations.snapshot();
    const changed=[];
    for(const installed of await repository.listInstalled()){
      if(installed.state==='deleted')continue;
      const record=effective.indexed.get(`${installed.packId}:${Number(installed.activeRevision)}`);
      if(record){
        await repository.setPackState(installed.packId,'revoked',{
          revokedAt:record.revokedAt||new Date(clock()).toISOString(),
          reasonCode:record.reasonCode||'effective-revocation',
          effectiveRevocation:clone(record)
        });
        changed.push(installed.packId);
      }
    }
    return{revoked:changed};
  }

  async function launch(lessonId){
    const lesson=await repository.getLesson(lessonId);
    if(!lesson)throw contentLifecycleError('CONTENT_LESSON_MISSING',`Lesson ${lessonId} does not exist.`,{recovery:'browse-catalog'});
    const installed=await repository.getInstalled(lesson.packId);
    if(!installed||installed.state==='deleted'||lesson.installState!=='installed')throw contentLifecycleError('CONTENT_NOT_INSTALLED',`Lesson ${lessonId} is not installed.`,{recovery:'install-pack'});
    if(installed.state==='revoked')throw contentLifecycleError('CONTENT_PACK_REVOKED',`Pack ${installed.packId} is revoked.`,{recoverable:false});
    if(installed.state!=='installed')throw contentLifecycleError('CONTENT_REINSTALL_REQUIRED',`Pack ${installed.packId} must be reinstalled.`,{recovery:'reinstall-pack'});
    if(Number(installed.activeRevision)!==Number(lesson.packRevision))throw contentLifecycleError('CONTENT_STALE_DEEP_LINK','Lesson points to an inactive immutable revision.',{recovery:'browse-installed-pack'});
    const revocation=await revocations.find(installed.packId,installed.activeRevision);
    if(revocation){
      await repository.setPackState(installed.packId,'revoked',{reasonCode:revocation.reasonCode||'effective-revocation',effectiveRevocation:clone(revocation)});
      throw contentLifecycleError('CONTENT_PACK_REVOKED',`Pack ${installed.packId} is revoked.`,{recoverable:false,revocation});
    }
    if(compareVersions(appVersion,lesson.compatibility?.minimumAppVersion)<0)throw contentLifecycleError('CONTENT_INCOMPATIBLE','This lesson requires a newer app.',{recovery:'update-app'});
    const assets={};
    const missing=[];
    for(const descriptor of lesson.assetDescriptors||[]){
      const stored=await assetStore.readFinal(descriptor);
      if(!stored){missing.push(descriptor.contentAddress);continue;}
      const bytes=stored.bytes;
      if(descriptor.mediaType.includes('json')){
        try{assets[descriptor.id]=JSON.parse(new TextDecoder().decode(bytes));}
        catch{throw contentLifecycleError('CONTENT_ASSET_MALFORMED',`Installed JSON asset ${descriptor.id} is malformed.`,{recovery:'reinstall-pack'});}
      }else assets[descriptor.id]={bytes,mediaType:descriptor.mediaType};
    }
    if(missing.length){
      await repository.setPackState(installed.packId,'reinstall-required',{reasonCode:'cache-assets-missing',missingAssetAddresses:missing});
      throw contentLifecycleError('CONTENT_ASSETS_MISSING','Installed metadata exists but verified cache assets are missing.',{missing,recovery:'reinstall-pack'});
    }
    const progress=await repository.getProgress(lessonId)||null;
    return{lesson,installed,assets,progress,offline:true};
  }

  async function recordProgress(lessonId,activityId,{status='in-progress',attemptId=null,receiptId=null}={}){
    const lesson=await repository.getLesson(lessonId);
    if(!lesson)throw contentLifecycleError('CONTENT_LESSON_MISSING',`Lesson ${lessonId} does not exist.`);
    const existing=await repository.getProgress(lessonId)||{
      id:lessonId,
      schemaVersion:CONTENT_SCHEMA_VERSION,
      lessonId,
      activityProgress:{},
      completedActivityIds:[],
      firstStartedAt:new Date(clock()).toISOString()
    };
    const activity=lesson.activities?.find(row=>row.id===activityId);
    if(!activity)throw contentLifecycleError('CONTENT_ACTIVITY_MISSING',`Activity ${activityId} is not declared by lesson ${lessonId}.`);
    const updatedAt=new Date(clock()).toISOString();
    const activityProgress={
      ...(existing.activityProgress||{}),
      [activityId]:{status,attemptId,receiptId,updatedAt}
    };
    const completedActivityIds=[...new Set([
      ...(existing.completedActivityIds||[]),
      ...(status==='completed'?[activityId]:[])
    ])];
    const next={
      ...existing,
      activityProgress,
      completedActivityIds,
      status:completedActivityIds.length===lesson.activities.length?'completed':'in-progress',
      lessonRevision:lesson.contentRevision,
      updatedAtIso:updatedAt,
      updatedAt:clock()
    };
    await repository.saveProgress(next);
    return next;
  }

  async function rollback(packId,revision){
    const installed=await repository.getInstalled(packId);
    if(!installed||installed.state==='deleted')throw contentLifecycleError('PACK_ROLLBACK_UNAVAILABLE','Pack is not installed.');
    const target=(installed.revisionHistory||[]).find(row=>Number(row.revision)===Number(revision));
    if(!target?.manifestSnapshot)throw contentLifecycleError('PACK_ROLLBACK_UNAVAILABLE','Requested revision metadata is unavailable.');
    const revocation=await revocations.find(packId,revision);
    if(revocation)throw contentLifecycleError('CONTENT_PACK_REVOKED','Requested rollback revision is revoked.',{recoverable:false,revocation});
    const missing=[];
    for(const descriptor of target.manifestSnapshot.assets)if(!await assetStore.readFinal(descriptor))missing.push(descriptor.contentAddress);
    if(missing.length)throw contentLifecycleError('CONTENT_ASSETS_MISSING','Rollback assets are missing.',{missing,recovery:'reinstall-pack'});
    return repository.rollback(installed,revision,{activatedAt:new Date(clock()).toISOString()});
  }

  async function todayInventory(){
    const current=await catalogTrust.current();
    if(current?.expired===true||current?.trustState==='expired-last-known-good')return[];
    const lessons=await listLessons({installedOnly:true});
    return lessons.flatMap(lesson=>(lesson.activities||[])
      .filter(activity=>hasExactInstalledActivityTarget(activity,lesson))
      .map(activity=>({
        id:`content:${lesson.id}:${lesson.contentRevision}:${activity.id}`,
        lessonId:lesson.id,
        lessonRevision:Number(lesson.contentRevision),
        activityId:activity.id,
        packId:lesson.packId,
        packRevision:Number(lesson.packRevision),
        type:todayActivityType(activity,lesson),
        target:clone(activity.target),
        executor:'content',
        estimatedSeconds:Math.max(60,Math.round(Number(lesson.estimatedMinutes||5)*60/Math.max(1,lesson.activities.length))),
        payload:{
          contentId:lesson.id,
          activityId:activity.id,
          label:lesson.title,
          packId:lesson.packId,
          packRevision:Number(lesson.packRevision),
          lessonRevision:Number(lesson.contentRevision)
        }
      })));
  }

  return Object.freeze({
    applyRevocations,
    browse,
    install,
    launch,
    listLessons,
    pauseOrCancel,
    reconcileMissingAssets,
    recordProgress,
    remove,
    rollback,
    todayInventory
  });
}

export const __testing=Object.freeze({allAddresses,compareVersions,hasExactInstalledActivityTarget,revoked,todayActivityType});
