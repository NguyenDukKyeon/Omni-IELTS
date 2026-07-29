import { V10_STORES,normalizeContentManifest,validateContentManifest,validateSentenceSegments } from './v10-contracts.js';
import { listV10Records,getV10Record,putV10Record,putV10Records,deleteV10Record,estimateV10Storage } from './v10-persistence.js';

const CATALOG_URL='/content/catalog.json';
const CACHE_NAME='vocab-master-content-v1';
const APP_VERSION='10.0.0';

async function fetchJson(url,{cache='no-cache'}={}){const response=await fetch(url,{cache});if(!response.ok)throw new Error(`Không tải được content: HTTP ${response.status}`);return response.json();}
function isSameOriginUrl(value){try{return new URL(value,location.origin).origin===location.origin;}catch{return false;}}
function compareVersions(a='0',b='0'){const left=String(a).split('.').map(Number),right=String(b).split('.').map(Number);for(let i=0;i<Math.max(left.length,right.length);i++){const diff=(left[i]||0)-(right[i]||0);if(diff)return diff;}return 0;}

export async function refreshContentCatalog({url=CATALOG_URL}={}){
  const catalog=await fetchJson(url);if(!Array.isArray(catalog.packs)&&!Array.isArray(catalog.lessons))throw new Error('Catalog thiếu packs hoặc lessons.');const manifests=[];
  for(const row of catalog.lessons||[]){const manifest=normalizeContentManifest(row);const validation=validateContentManifest(manifest);if(!validation.valid){console.warn('[content manifest rejected]',manifest.id,validation.errors);continue;}manifests.push({...validation.value,catalogVersion:Number(catalog.catalogVersion||1),manifestUrl:row.manifestUrl||null});}
  for(const pack of catalog.packs||[]){for(const row of pack.lessons||[]){const manifest=normalizeContentManifest({...row,packId:pack.id});const validation=validateContentManifest(manifest);if(!validation.valid)continue;manifests.push({...validation.value,packId:pack.id,packTitle:pack.title,catalogVersion:Number(catalog.catalogVersion||1),manifestUrl:row.manifestUrl||null});}}
  await putV10Records(V10_STORES.contentManifests,manifests,'content-catalog-refreshed');await putV10Record(V10_STORES.meta,{key:'content-catalog',catalogVersion:Number(catalog.catalogVersion||1),etag:catalog.etag||null,refreshedAt:Date.now(),updatedAt:Date.now()},'content-catalog-meta');return{catalog,manifests};
}

export async function listContentLessons({level=null,topic=null,skill=null,verifiedOnly=true}={}){
  let rows=await listV10Records(V10_STORES.contentManifests,{sortBy:'updatedAt'});if(verifiedOnly)rows=rows.filter(row=>row.qualityStatus==='verified'&&row.verified);if(level)rows=rows.filter(row=>row.level===level);if(topic)rows=rows.filter(row=>row.topic===topic);if(skill)rows=rows.filter(row=>(row.skills||[]).includes(skill));return rows;
}

async function resolveManifest(manifest){if(!manifest.manifestUrl)return manifest;if(!isSameOriginUrl(manifest.manifestUrl))throw new Error('Manifest content phải cùng origin.');const remote=await fetchJson(manifest.manifestUrl);const merged=normalizeContentManifest({...manifest,...remote,id:manifest.id});const validation=validateContentManifest(merged);if(!validation.valid)throw new Error(validation.errors.join(' '));return{...validation.value,manifestUrl:manifest.manifestUrl,packId:manifest.packId,packTitle:manifest.packTitle};}

async function cacheAsset(lessonId,assetType,url,{pinned=false}={}){
  if(!isSameOriginUrl(url))throw new Error(`Asset ${assetType} phải cùng origin.`);const cache=await caches.open(CACHE_NAME);let response=await cache.match(url);if(!response){response=await fetch(url);if(!response.ok)throw new Error(`Không tải được ${assetType}: HTTP ${response.status}`);await cache.put(url,response.clone());}
  const text=await response.clone().text();const row={id:`${lessonId}:${assetType}`,lessonId,assetType,url,bytes:new Blob([text]).size,pinned:Boolean(pinned),cachedAt:Date.now(),lastAccessedAt:Date.now(),updatedAt:Date.now()};await putV10Record(V10_STORES.contentAssets,row,'content-asset-cached');return{text,row};
}

export async function downloadContentLesson(lessonId,{pin=false}={}){
  const stored=await getV10Record(V10_STORES.contentManifests,lessonId);if(!stored)throw new Error('Không tìm thấy lesson trong catalog.');const manifest=await resolveManifest(stored);if(manifest.minimumAppVersion&&compareVersions(APP_VERSION,manifest.minimumAppVersion)<0)throw new Error(`Lesson yêu cầu Vocab Master ${manifest.minimumAppVersion} trở lên.`);
  const entries=Object.entries(manifest.assets||{}).filter(([,url])=>typeof url==='string'&&url);const assets={};for(const[assetType,url]of entries){const result=await cacheAsset(lessonId,assetType,url,{pinned:pin});try{assets[assetType]=JSON.parse(result.text);}catch{assets[assetType]=result.text;}}
  await putV10Record(V10_STORES.contentManifests,{...manifest,downloadedAt:Date.now(),offlinePinned:Boolean(pin),updatedAt:Date.now()},'content-lesson-downloaded');return{manifest,assets};
}

export async function openContentLesson(lessonId,{startIndex=0}={}){
  let manifest=await getV10Record(V10_STORES.contentManifests,lessonId);if(!manifest)throw new Error('Lesson chưa có trong catalog.');manifest=await resolveManifest(manifest);const cache=await caches.open(CACHE_NAME);const assets={};
  for(const[assetType,url]of Object.entries(manifest.assets||{})){let response=await cache.match(url);if(!response){const downloaded=await downloadContentLesson(lessonId);Object.assign(assets,downloaded.assets);break;}const text=await response.text();try{assets[assetType]=JSON.parse(text);}catch{assets[assetType]=text;}const row=await getV10Record(V10_STORES.contentAssets,`${lessonId}:${assetType}`);if(row)await putV10Record(V10_STORES.contentAssets,{...row,lastAccessedAt:Date.now(),updatedAt:Date.now()},'content-asset-accessed');}
  const transcript=assets.transcript||assets.lesson?.transcript||assets.lesson?.sentences||[];const validation=validateSentenceSegments(Array.isArray(transcript)?transcript:transcript.segments||[]);if(!validation.segments.length)throw new Error('Lesson chưa có sentence transcript.');const exerciseTargets=assets.lexical?.targets||assets.lesson?.lexicalTargets||[];const bySentence=new Map(exerciseTargets.map(row=>[row.sentenceId,row.targets||[]]));const sentences=validation.segments.map(row=>({...row,verified:manifest.verified,lexicalTargets:bySentence.get(row.id)||row.lexicalTargets||[],ipa:row.ipa||'',weakForms:row.weakForms||[],audioUrl:row.audioUrl||null}));
  const progress=await getV10Record(V10_STORES.contentProgress,lessonId)||{};await putV10Record(V10_STORES.contentProgress,{...progress,id:lessonId,lessonId,lastOpenedAt:Date.now(),lastSentenceIndex:Number(startIndex??progress.lastSentenceIndex??0),contentVersion:manifest.contentVersion,updatedAt:Date.now()},'content-progress-opened');
  globalThis.dispatchEvent(new CustomEvent('vocab:v10-open-sentence-loop',{detail:{sourceId:lessonId,sourceType:'content',title:manifest.title,sentences,startIndex:Number(startIndex??progress.lastSentenceIndex??0)}}));return{manifest,assets,sentences};
}

export async function removeDownloadedLesson(lessonId){const assets=(await listV10Records(V10_STORES.contentAssets,{index:'lessonId',query:lessonId}));const cache=await caches.open(CACHE_NAME);for(const row of assets){if(row.pinned)continue;await cache.delete(row.url);await deleteV10Record(V10_STORES.contentAssets,row.id,'content-asset-removed');}const manifest=await getV10Record(V10_STORES.contentManifests,lessonId);if(manifest)await putV10Record(V10_STORES.contentManifests,{...manifest,downloadedAt:null,offlinePinned:false,updatedAt:Date.now()},'content-lesson-unpinned');return{removed:assets.filter(row=>!row.pinned).length};}

export async function setLessonPinned(lessonId,pinned){const manifest=await getV10Record(V10_STORES.contentManifests,lessonId);if(!manifest)throw new Error('Không tìm thấy lesson.');if(pinned)await downloadContentLesson(lessonId,{pin:true});const assets=await listV10Records(V10_STORES.contentAssets,{index:'lessonId',query:lessonId});for(const row of assets)await putV10Record(V10_STORES.contentAssets,{...row,pinned:Boolean(pinned),updatedAt:Date.now()},'content-pin-changed');await putV10Record(V10_STORES.contentManifests,{...manifest,offlinePinned:Boolean(pinned),updatedAt:Date.now()},'content-pin-changed');return true;}

export async function evictContentCache({targetRatio=.75,maxAgeDays=60}={}){
  const estimate=await estimateV10Storage();const rows=await listV10Records(V10_STORES.contentAssets,{sortBy:'lastAccessedAt',descending:false});const cache=await caches.open(CACHE_NAME);const cutoff=Date.now()-maxAgeDays*86_400_000;let freed=0,removed=0;for(const row of rows){if(row.pinned)continue;if(estimate.ratio<targetRatio&&Number(row.lastAccessedAt||0)>=cutoff)continue;await cache.delete(row.url);await deleteV10Record(V10_STORES.contentAssets,row.id,'content-lru-eviction');freed+=Number(row.bytes||0);removed+=1;if(estimate.quota&&(estimate.usage-freed)/estimate.quota<targetRatio)break;}return{removed,freed,estimate};}

export async function contentIntegrityAudit(){const manifests=await listV10Records(V10_STORES.contentManifests);const assets=await listV10Records(V10_STORES.contentAssets);const manifestIds=new Set(manifests.map(row=>row.id));const invalidManifests=manifests.map(validateContentManifest).filter(result=>!result.valid);const orphanAssets=assets.filter(row=>!manifestIds.has(row.lessonId));const bundleLeak=manifests.filter(row=>Object.values(row.assets||{}).some(url=>String(url).startsWith('data:')));return{manifests:manifests.length,assets:assets.length,invalidManifests,orphanAssets,bundleLeak,valid:invalidManifests.length===0&&orphanAssets.length===0&&bundleLeak.length===0};}

export function mountContentPlatform(){globalThis.addEventListener('vocab:v10-open-content',event=>void openContentLesson(event.detail?.contentId).catch(error=>console.error('[content open]',error)));globalThis.VocabMasterContent={refresh:refreshContentCatalog,list:listContentLessons,download:downloadContentLesson,open:openContentLesson,pin:setLessonPinned,remove:removeDownloadedLesson,evict:evictContentCache,audit:contentIntegrityAudit};}
