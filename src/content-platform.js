import { createContentLifecycle } from './content-lifecycle.js';
import { createPackInstaller } from './pack-installer.js';
import {
  createCatalogTrustService,
  loadBundledTrustRoots
} from './signed-catalog.js';

const CATALOG_URL='/content/catalog.json';
let platformPromise=null;

function platformError(code,message,details={}){
  return Object.assign(new Error(message),{name:'ContentPlatformError',code,recoverable:true,...details});
}

async function createPlatform(){
  const trustRoots=await loadBundledTrustRoots();
  const catalogTrust=createCatalogTrustService({trustRoots});
  const installer=createPackInstaller({catalogTrust});
  const lifecycle=createContentLifecycle({catalogTrust,installer});
  return Object.freeze({catalogTrust,installer,lifecycle,trustRoots});
}

export function getContentPlatform(){
  if(!platformPromise)platformPromise=createPlatform().catch(error=>{platformPromise=null;throw error;});
  return platformPromise;
}

export async function refreshContentCatalog({url=CATALOG_URL}={}){
  const platform=await getContentPlatform();
  const result=await platform.catalogTrust.refresh(url);
  await platform.lifecycle.applyRevocations();
  await platform.lifecycle.reconcileMissingAssets();
  globalThis.dispatchEvent?.(new CustomEvent('vocab:phase4-catalog-state',{detail:{state:result.state,errorCode:result.error?.code||null}}));
  return result;
}

export async function contentCatalogStartup(){
  const platform=await getContentPlatform();
  const startup=await platform.catalogTrust.startup();
  await platform.lifecycle.applyRevocations();
  await platform.lifecycle.reconcileMissingAssets();
  return startup;
}

export async function browseContentPacks(){
  const platform=await getContentPlatform();
  return platform.lifecycle.browse();
}

export async function listContentLessons({level=null,topic=null,skill=null,verifiedOnly=true}={}){
  const platform=await getContentPlatform();
  let rows=await platform.lifecycle.listLessons({installedOnly:verifiedOnly,skill});
  if(level)rows=rows.filter(row=>row.level===level||row.difficulty===level);
  if(topic)rows=rows.filter(row=>row.topic===topic);
  return rows;
}

export async function installContentPack(packId,options={}){
  const platform=await getContentPlatform();
  const result=await platform.lifecycle.install(packId,options);
  globalThis.dispatchEvent?.(new CustomEvent('vocab:phase4-pack-changed',{detail:{packId,state:result.status}}));
  return result;
}

export async function cancelContentPackInstall(packId,revision){
  const platform=await getContentPlatform();
  return platform.lifecycle.pauseOrCancel(packId,revision);
}

export async function deleteContentPack(packId){
  const platform=await getContentPlatform();
  const result=await platform.lifecycle.remove(packId);
  globalThis.dispatchEvent?.(new CustomEvent('vocab:phase4-pack-changed',{detail:{packId,state:'deleted'}}));
  return result;
}

export async function rollbackContentPack(packId,revision){
  const platform=await getContentPlatform();
  const result=await platform.lifecycle.rollback(packId,revision);
  globalThis.dispatchEvent?.(new CustomEvent('vocab:phase4-pack-changed',{detail:{packId,state:'rolled-back',revision}}));
  return result;
}

export async function openContentLesson(lessonId){
  const platform=await getContentPlatform();
  const result=await platform.lifecycle.launch(lessonId);
  globalThis.dispatchEvent?.(new CustomEvent('vocab:phase4-open-lesson',{detail:result}));
  return result;
}

export async function recordContentProgress(lessonId,activityId,progress){
  const platform=await getContentPlatform();
  return platform.lifecycle.recordProgress(lessonId,activityId,progress);
}

export async function contentTodayInventory(){
  const platform=await getContentPlatform();
  return platform.lifecycle.todayInventory();
}

// Compatibility aliases preserve existing callers while routing through the
// signed pack boundary. They never fetch an unsigned lesson manifest.
export async function downloadContentLesson(lessonId,options={}){
  const lessons=await listContentLessons({verifiedOnly:false});
  const lesson=lessons.find(row=>row.id===lessonId);
  if(!lesson?.packId)throw platformError('CONTENT_PACK_UNKNOWN',`No verified pack owns lesson ${lessonId}.`,{recovery:'browse-catalog'});
  return installContentPack(lesson.packId,options);
}

export async function removeDownloadedLesson(lessonId){
  const lessons=await listContentLessons({verifiedOnly:false});
  const lesson=lessons.find(row=>row.id===lessonId);
  if(!lesson?.packId)return{deleted:false,reason:'lesson-not-found'};
  return deleteContentPack(lesson.packId);
}

export async function setLessonPinned(lessonId,pinned){
  if(!pinned)throw platformError('CONTENT_DELETE_CONFIRM_REQUIRED','Uninstall requires explicit pack-level confirmation.');
  return downloadContentLesson(lessonId);
}

export async function evictContentCache(){
  // Installed immutable assets are never evicted silently. Missing caches are
  // detected and converted to a recoverable reinstall-required state.
  const platform=await getContentPlatform();
  return platform.lifecycle.reconcileMissingAssets();
}

export async function contentIntegrityAudit(){
  const platform=await getContentPlatform();
  const [catalog,lessons,reconciliation]=await Promise.all([
    platform.lifecycle.browse(),
    platform.lifecycle.listLessons({installedOnly:false}),
    platform.lifecycle.reconcileMissingAssets()
  ]);
  const invalidLessons=lessons.filter(row=>row.installState==='installed'&&(!row.verified||row.qualityStatus!=='verified'));
  return{
    valid:catalog.state!=='no-valid-catalog'&&invalidLessons.length===0&&reconciliation.missing.length===0,
    catalogState:catalog.state,
    packs:catalog.packs.length,
    lessons:lessons.length,
    invalidLessons,
    missingAssets:reconciliation.missing
  };
}

export function mountContentPlatform(){
  globalThis.addEventListener('vocab:v10-open-content',event=>{
    void openContentLesson(event.detail?.contentId).catch(error=>{
      console.error('[content open]',error);
      globalThis.dispatchEvent?.(new CustomEvent('vocab:phase4-content-error',{detail:{code:error.code||'CONTENT_OPEN_FAILED',message:error.message}}));
    });
  });
  globalThis.VocabMasterContent=Object.freeze({
    audit:contentIntegrityAudit,
    browse:browseContentPacks,
    cancel:cancelContentPackInstall,
    delete:deleteContentPack,
    download:downloadContentLesson,
    install:installContentPack,
    lessons:listContentLessons,
    open:openContentLesson,
    progress:recordContentProgress,
    refresh:refreshContentCatalog,
    rollback:rollbackContentPack,
    startup:contentCatalogStartup,
    today:contentTodayInventory
  });
  return globalThis.VocabMasterContent;
}
