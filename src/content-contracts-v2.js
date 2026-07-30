export const CONTENT_SCHEMA_VERSION=2;
export const SUPPORTED_CONTENT_SCHEMAS=Object.freeze([CONTENT_SCHEMA_VERSION]);
export const CONTENT_ADDRESS_ALGORITHM='sha256';
export const CONTENT_ADDRESS_PATTERN=/^sha256:([a-f0-9]{64})$/;
export const CONTENT_ID_PATTERN=/^[a-z0-9][a-z0-9._:-]{2,159}$/;
export const PUBLISHED_RIGHTS_STATUSES=Object.freeze(['approved']);
export const INSTALL_JOURNAL_STAGES=Object.freeze([
  'created',
  'catalog-verified',
  'manifest-staged',
  'manifest-verified',
  'assets-staging',
  'assets-verified',
  'activation-pending',
  'activated',
  'cancelled',
  'failed'
]);
export const INSTALLED_PACK_STATES=Object.freeze([
  'installing',
  'installed',
  'update-available',
  'reinstall-required',
  'revoked',
  'deleted',
  'error'
]);
export const SUPPORTED_ACTIVITY_TYPES=Object.freeze([
  'listening-comprehension',
  'dictation',
  'strict-practice',
  'shadowing',
  'retell-coaching',
  'reading-comprehension',
  'paraphrase-recognition',
  'distractor-recognition',
  'micro-reading',
  'controlled-recall',
  'sentence-production',
  'paragraph-production',
  'lexical-choice'
]);

export const PHASE4_CONTRACTS=Object.freeze({
  RemoteCatalog:CONTENT_SCHEMA_VERSION,
  CatalogEntry:CONTENT_SCHEMA_VERSION,
  PackManifest:CONTENT_SCHEMA_VERSION,
  LessonManifest:CONTENT_SCHEMA_VERSION,
  AssetDescriptor:CONTENT_SCHEMA_VERSION,
  ContentAddress:CONTENT_SCHEMA_VERSION,
  RightsRecord:CONTENT_SCHEMA_VERSION,
  ProvenanceRecord:CONTENT_SCHEMA_VERSION,
  HumanReviewRecord:CONTENT_SCHEMA_VERSION,
  PackInstallJournal:CONTENT_SCHEMA_VERSION,
  InstalledPack:CONTENT_SCHEMA_VERSION,
  PackActivationReceipt:CONTENT_SCHEMA_VERSION,
  ContentProgress:CONTENT_SCHEMA_VERSION,
  PackRevocation:CONTENT_SCHEMA_VERSION
});

const encoder=new TextEncoder();
const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);
const isObject=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const unique=values=>[...new Set(values)];
const codeUnitCompare=(left,right)=>left<right?-1:left>right?1:0;
const clone=value=>value==null?value:structuredClone(value);
const isoInstant=value=>{
  const text=clean(value,80);
  const time=Date.parse(text);
  return text&&Number.isFinite(time)&&new Date(time).toISOString()===text?text:null;
};

export function contentContractError(code,message,details={}){
  return Object.assign(new Error(message),{name:'ContentContractError',code,durable:false,recoverable:false,...details});
}

export function canonicalContentValue(value,seen=new Set(),path='$'){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'){
    if(!Number.isFinite(value))throw contentContractError('CONTENT_CANONICAL_NUMBER',`${path} contains a non-finite number.`);
    return Object.is(value,-0)?0:value;
  }
  if(typeof value!=='object')throw contentContractError('CONTENT_CANONICAL_TYPE',`${path} contains unsupported type ${typeof value}.`);
  if(seen.has(value))throw contentContractError('CONTENT_CANONICAL_CYCLE',`${path} contains a cycle.`);
  seen.add(value);
  if(Array.isArray(value)){
    const result=value.map((item,index)=>canonicalContentValue(item,seen,`${path}[${index}]`));
    seen.delete(value);
    return result;
  }
  const prototype=Object.getPrototypeOf(value);
  if(prototype!==Object.prototype&&prototype!==null)throw contentContractError('CONTENT_CANONICAL_PROTOTYPE',`${path} is not a plain JSON object.`);
  const result={};
  for(const key of Object.keys(value).sort(codeUnitCompare)){
    if(value[key]===undefined)throw contentContractError('CONTENT_CANONICAL_UNDEFINED',`${path}.${key} is undefined.`);
    result[key]=canonicalContentValue(value[key],seen,`${path}.${key}`);
  }
  seen.delete(value);
  return result;
}

export function canonicalContentJson(value){
  return JSON.stringify(canonicalContentValue(value));
}

export async function sha256HexBytes(value){
  const bytes=typeof value==='string'?encoder.encode(value):value instanceof Uint8Array?value:new Uint8Array(value);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

export async function contentAddressFor(value){
  return`sha256:${await sha256HexBytes(value)}`;
}

export function normalizeContentAddress(value){
  const text=clean(isObject(value)?`${value.algorithm}:${value.digest}`:value,80).toLowerCase();
  const match=CONTENT_ADDRESS_PATTERN.exec(text);
  if(!match)throw contentContractError('CONTENT_ADDRESS_INVALID','Content address must be sha256:<64 lowercase hex>.');
  return Object.freeze({schemaVersion:CONTENT_SCHEMA_VERSION,algorithm:CONTENT_ADDRESS_ALGORITHM,digest:match[1],value:text});
}

function baseErrors(value,{contract,id=true,revision=true}={}){
  const errors=[];
  if(!isObject(value))return[`${contract} must be an object.`];
  if(!SUPPORTED_CONTENT_SCHEMAS.includes(Number(value.schemaVersion)))errors.push(`${contract}.schemaVersion is unsupported.`);
  if(id){
    const identity=clean(value.id,200);
    if(!CONTENT_ID_PATTERN.test(identity))errors.push(`${contract}.id is missing or unstable.`);
    if(/^https?:\/\//i.test(identity))errors.push(`${contract}.id must not be a mutable URL.`);
  }
  if(revision&&(!Number.isInteger(Number(value.contentRevision))||Number(value.contentRevision)<1))errors.push(`${contract}.contentRevision must be a positive integer.`);
  return errors;
}

function compatibilityErrors(value,path){
  const errors=[];
  if(!isObject(value))return[`${path} is missing.`];
  if(!clean(value.minimumAppVersion,40))errors.push(`${path}.minimumAppVersion is missing.`);
  if(!Array.isArray(value.supportedActivityTypes)||!value.supportedActivityTypes.length)errors.push(`${path}.supportedActivityTypes is missing.`);
  else for(const type of value.supportedActivityTypes)if(!SUPPORTED_ACTIVITY_TYPES.includes(type))errors.push(`${path} contains unsupported activity type ${type}.`);
  return errors;
}

export function validateRightsRecord(value,{at=Date.now(),publication=false}={}){
  const errors=baseErrors(value,{contract:'RightsRecord',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  const status=clean(value.status,40).toLowerCase();
  if(publication&&!PUBLISHED_RIGHTS_STATUSES.includes(status))errors.push(`RightsRecord.status ${status||'missing'} is not publishable.`);
  if(!['approved','pending','rejected','expired'].includes(status))errors.push('RightsRecord.status is invalid.');
  if(!clean(value.licenseId,160))errors.push('RightsRecord.licenseId is missing.');
  if(!clean(value.rightsHolder,240))errors.push('RightsRecord.rightsHolder is missing.');
  if(!clean(value.basis,500))errors.push('RightsRecord.basis is missing.');
  if(!isoInstant(value.assertedAt))errors.push('RightsRecord.assertedAt must be an exact ISO instant.');
  const expires=value.expiresAt==null?null:isoInstant(value.expiresAt);
  if(value.expiresAt!=null&&!expires)errors.push('RightsRecord.expiresAt is invalid.');
  if(publication&&expires&&Date.parse(expires)<=Number(at))errors.push('RightsRecord is expired.');
  if(publication&&value.aiAsserted===true)errors.push('AI cannot assert content rights.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze({...clone(value),status,expiresAt:expires})};
}

export function validateProvenanceRecord(value,{publication=false}={}){
  const errors=baseErrors(value,{contract:'ProvenanceRecord',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!['original-human-authored','rights-cleared-source','generated-draft'].includes(value.sourceType))errors.push('ProvenanceRecord.sourceType is invalid.');
  if(!clean(value.sourceDescription,1000))errors.push('ProvenanceRecord.sourceDescription is missing.');
  if(!clean(value.authorOrOrigin,240))errors.push('ProvenanceRecord.authorOrOrigin is missing.');
  if(!isoInstant(value.createdAt))errors.push('ProvenanceRecord.createdAt must be an exact ISO instant.');
  if(publication&&value.sourceType==='generated-draft')errors.push('Generated draft provenance is not publishable.');
  if(publication&&value.aiDraft===true)errors.push('AI-assisted content remains a draft until human authorship review.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validateHumanReviewRecord(value,{publication=false,scopeDigest=null}={}){
  const errors=baseErrors(value,{contract:'HumanReviewRecord',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  const status=clean(value.status,40).toLowerCase();
  if(!['approved','changes-requested','pending','rejected'].includes(status))errors.push('HumanReviewRecord.status is invalid.');
  if(publication&&status!=='approved')errors.push('HumanReviewRecord approval is required for publication.');
  if(clean(value.reviewerType,40)!=='human')errors.push('HumanReviewRecord.reviewerType must be human.');
  if(!clean(value.reviewerId,240)||/^ai[:_-]?/i.test(clean(value.reviewerId,240)))errors.push('HumanReviewRecord.reviewerId must identify a human reviewer.');
  if(!isoInstant(value.reviewedAt))errors.push('HumanReviewRecord.reviewedAt must be an exact ISO instant.');
  try{normalizeContentAddress(value.scopeDigest);}catch{errors.push('HumanReviewRecord.scopeDigest is invalid.');}
  if(scopeDigest&&clean(value.scopeDigest,100)!==clean(scopeDigest,100))errors.push('HumanReviewRecord.scopeDigest does not match reviewed content.');
  if(!Array.isArray(value.checks)||!value.checks.includes('rights')||!value.checks.includes('pedagogy')||!value.checks.includes('accuracy'))errors.push('HumanReviewRecord checks must cover rights, pedagogy and accuracy.');
  if(value.selfApprovedByAi===true)errors.push('AI cannot mark its own content reviewed.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze({...clone(value),status})};
}

function publicationRecordErrors(value,{path,at,scopeDigest}){
  const errors=[];
  const rights=validateRightsRecord(value?.rights,{at,publication:true});
  const provenance=validateProvenanceRecord(value?.provenance,{publication:true});
  const review=validateHumanReviewRecord(value?.humanReview,{publication:true,scopeDigest});
  errors.push(...rights.errors.map(error=>`${path}.rights: ${error}`));
  errors.push(...provenance.errors.map(error=>`${path}.provenance: ${error}`));
  errors.push(...review.errors.map(error=>`${path}.humanReview: ${error}`));
  if(!isoInstant(value?.publishedAt))errors.push(`${path}.publishedAt must be an exact ISO instant.`);
  return errors;
}

export function validateAssetDescriptor(value,{publication=true,at=Date.now()}={}){
  const errors=baseErrors(value,{contract:'AssetDescriptor'});
  if(!isObject(value))return{valid:false,errors,value:null};
  let address=null;
  try{address=normalizeContentAddress(value.contentAddress);}catch(error){errors.push(error.message);}
  if(address&&clean(value.sha256,64).toLowerCase()!==address.digest)errors.push('AssetDescriptor.sha256 is inconsistent with contentAddress.');
  if(!Number.isInteger(Number(value.byteLength))||Number(value.byteLength)<0)errors.push('AssetDescriptor.byteLength is invalid.');
  if(!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(clean(value.mediaType,160)))errors.push('AssetDescriptor.mediaType is invalid.');
  const url=clean(value.retrievalUrl,2000);
  if(!url)errors.push('AssetDescriptor.retrievalUrl is missing.');
  if(address&&url&&!url.toLowerCase().includes(address.digest))errors.push('AssetDescriptor.retrievalUrl must contain the immutable digest.');
  errors.push(...compatibilityErrors(value.compatibility,'AssetDescriptor.compatibility'));
  if(publication)errors.push(...publicationRecordErrors(value,{path:'AssetDescriptor',at,scopeDigest:value.contentAddress}));
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze({...clone(value),contentAddress:address?.value})};
}

function activityErrors(activity,path,assetIds){
  const errors=[];
  if(!isObject(activity)){errors.push(`${path} must be an object.`);return errors;}
  if(!CONTENT_ID_PATTERN.test(clean(activity.id,200)))errors.push(`${path}.id is invalid.`);
  if(!SUPPORTED_ACTIVITY_TYPES.includes(activity.type))errors.push(`${path}.type ${activity.type||'missing'} is unsupported.`);
  if(!clean(activity.prompt,5000))errors.push(`${path}.prompt is missing.`);
  if(!isObject(activity.answer)&&!Array.isArray(activity.answer)&&!clean(activity.answer,5000))errors.push(`${path}.answer is missing.`);
  for(const assetId of activity.assetIds||[])if(!assetIds.has(assetId))errors.push(`${path} references undeclared asset ${assetId}.`);
  return errors;
}

export function validateLessonManifest(value,{publication=true,at=Date.now(),declaredAssets=[]}={}){
  const errors=baseErrors(value,{contract:'LessonManifest'});
  if(!isObject(value))return{valid:false,errors,value:null};
  let address=null;
  try{address=normalizeContentAddress(value.contentAddress);}catch(error){errors.push(error.message);}
  if(!clean(value.title,300))errors.push('LessonManifest.title is missing.');
  if(!clean(value.learningObjective,1000))errors.push('LessonManifest.learningObjective is missing.');
  if(!Number.isInteger(Number(value.estimatedMinutes))||Number(value.estimatedMinutes)<1)errors.push('LessonManifest.estimatedMinutes is invalid.');
  if(!['B1','B2','C1'].includes(value.difficulty))errors.push('LessonManifest.difficulty is invalid.');
  if(!['listening','reading','lexical-paraphrase'].includes(value.skill))errors.push('LessonManifest.skill is invalid.');
  if(!Array.isArray(value.lexicalTargets)||!value.lexicalTargets.length)errors.push('LessonManifest.lexicalTargets is missing.');
  const lexicalIds=(value.lexicalTargets||[]).map(target=>clean(target.id||target.term,200).toLowerCase()).filter(Boolean);
  if(unique(lexicalIds).length!==lexicalIds.length)errors.push('LessonManifest contains duplicate lexical targets.');
  const assetIds=new Set((declaredAssets||[]).map(asset=>asset.id));
  for(const assetId of value.assetIds||[])if(!assetIds.has(assetId))errors.push(`LessonManifest references undeclared asset ${assetId}.`);
  const activities=Array.isArray(value.activities)?value.activities:[];
  if(!activities.length)errors.push('LessonManifest.activities is missing.');
  const activityIds=activities.map(activity=>activity?.id).filter(Boolean);
  if(unique(activityIds).length!==activityIds.length)errors.push('LessonManifest contains duplicate activity IDs.');
  activities.forEach((activity,index)=>errors.push(...activityErrors(activity,`LessonManifest.activities[${index}]`,assetIds)));
  if(!isObject(value.accessibility)||!clean(value.accessibility.label,300)||!clean(value.accessibility.language,20))errors.push('LessonManifest.accessibility metadata is incomplete.');
  errors.push(...compatibilityErrors(value.compatibility,'LessonManifest.compatibility'));
  if(publication)errors.push(...publicationRecordErrors(value,{path:'LessonManifest',at,scopeDigest:value.contentAddress}));
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze({...clone(value),contentAddress:address?.value})};
}

export function validateCatalogEntry(value,{publication=true,at=Date.now()}={}){
  const errors=baseErrors(value,{contract:'CatalogEntry'});
  if(!isObject(value))return{valid:false,errors,value:null};
  try{normalizeContentAddress(value.contentAddress);}catch(error){errors.push(error.message);}
  if(!clean(value.packId,160))errors.push('CatalogEntry.packId is missing.');
  if(value.packId!==value.id)errors.push('CatalogEntry.id must equal packId.');
  if(!clean(value.manifestUrl,2000))errors.push('CatalogEntry.manifestUrl is missing.');
  else{
    let address=null;try{address=normalizeContentAddress(value.contentAddress);}catch{}
    if(address&&!String(value.manifestUrl).toLowerCase().includes(address.digest))errors.push('CatalogEntry.manifestUrl must contain the immutable manifest digest.');
  }
  if(!Number.isInteger(Number(value.byteLength))||Number(value.byteLength)<1)errors.push('CatalogEntry.byteLength is invalid.');
  errors.push(...compatibilityErrors(value.compatibility,'CatalogEntry.compatibility'));
  if(publication)errors.push(...publicationRecordErrors(value,{path:'CatalogEntry',at,scopeDigest:value.contentAddress}));
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validatePackManifest(value,{publication=true,at=Date.now(),maxBytes=8*1024*1024}={}){
  const errors=baseErrors(value,{contract:'PackManifest'});
  if(!isObject(value))return{valid:false,errors,value:null};
  let address=null;try{address=normalizeContentAddress(value.contentAddress);}catch(error){errors.push(error.message);}
  if(!clean(value.title,300))errors.push('PackManifest.title is missing.');
  const assets=Array.isArray(value.assets)?value.assets:[];
  const lessons=Array.isArray(value.lessons)?value.lessons:[];
  if(!assets.length)errors.push('PackManifest.assets is missing.');
  if(!lessons.length)errors.push('PackManifest.lessons is missing.');
  const assetIds=assets.map(asset=>asset?.id).filter(Boolean);
  const lessonIds=lessons.map(lesson=>lesson?.id).filter(Boolean);
  if(unique(assetIds).length!==assetIds.length)errors.push('PackManifest contains duplicate asset IDs.');
  if(unique(lessonIds).length!==lessonIds.length)errors.push('PackManifest contains duplicate lesson IDs.');
  for(const[assetIndex,asset]of assets.entries()){
    const result=validateAssetDescriptor(asset,{publication,at});
    errors.push(...result.errors.map(error=>`PackManifest.assets[${assetIndex}]: ${error}`));
  }
  for(const[lessonIndex,lesson]of lessons.entries()){
    const result=validateLessonManifest(lesson,{publication,at,declaredAssets:assets});
    errors.push(...result.errors.map(error=>`PackManifest.lessons[${lessonIndex}]: ${error}`));
  }
  const declaredBytes=assets.reduce((sum,asset)=>sum+Number(asset?.byteLength||0),0);
  if(declaredBytes>maxBytes)errors.push(`PackManifest exceeds ${maxBytes} bytes.`);
  errors.push(...compatibilityErrors(value.compatibility,'PackManifest.compatibility'));
  if(publication)errors.push(...publicationRecordErrors(value,{path:'PackManifest',at,scopeDigest:value.contentAddress}));
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze({...clone(value),contentAddress:address?.value,declaredBytes})};
}

export function validateRemoteCatalog(value,{publication=true,at=Date.now()}={}){
  const errors=baseErrors(value,{contract:'RemoteCatalog',id:false,revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!CONTENT_ID_PATTERN.test(clean(value.catalogId,160)))errors.push('RemoteCatalog.catalogId is invalid.');
  if(!Number.isInteger(Number(value.sequence))||Number(value.sequence)<1)errors.push('RemoteCatalog.sequence is invalid.');
  if(!Number.isInteger(Number(value.catalogRevision))||Number(value.catalogRevision)<1)errors.push('RemoteCatalog.catalogRevision is invalid.');
  const issued=isoInstant(value.issuedAt),expires=isoInstant(value.expiresAt);
  if(!issued)errors.push('RemoteCatalog.issuedAt is invalid.');
  if(!expires)errors.push('RemoteCatalog.expiresAt is invalid.');
  if(issued&&expires&&Date.parse(expires)<=Date.parse(issued))errors.push('RemoteCatalog expiry must follow issue time.');
  if(publication&&expires&&Date.parse(expires)<=Number(at))errors.push('RemoteCatalog is expired.');
  if(!clean(value.keyId,160))errors.push('RemoteCatalog.keyId is missing.');
  if(!Array.isArray(value.supportedKeyIds)||!value.supportedKeyIds.includes(value.keyId))errors.push('RemoteCatalog key rotation metadata does not include the signing key.');
  const entries=Array.isArray(value.entries)?value.entries:[];
  const ids=entries.map(entry=>entry?.id).filter(Boolean);
  if(unique(ids).length!==ids.length)errors.push('RemoteCatalog contains duplicate entry IDs.');
  entries.forEach((entry,index)=>{
    const result=validateCatalogEntry(entry,{publication,at});
    errors.push(...result.errors.map(error=>`RemoteCatalog.entries[${index}]: ${error}`));
  });
  if(value.rollback){
    if(!isObject(value.rollback)||!Number.isInteger(Number(value.rollback.fromRevision))||!Number.isInteger(Number(value.rollback.toRevision))||Number(value.rollback.toRevision)>=Number(value.rollback.fromRevision)||!clean(value.rollback.reason,500))errors.push('RemoteCatalog.rollback metadata is invalid.');
  }
  const revocations=Array.isArray(value.revocations)?value.revocations:[];
  revocations.forEach((revocation,index)=>{
    const result=validatePackRevocation(revocation);
    errors.push(...result.errors.map(error=>`RemoteCatalog.revocations[${index}]: ${error}`));
  });
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validatePackInstallJournal(value){
  const errors=baseErrors(value,{contract:'PackInstallJournal',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!clean(value.packId,160)||!Number.isInteger(Number(value.packRevision))||Number(value.packRevision)<1)errors.push('PackInstallJournal pack identity is invalid.');
  if(!INSTALL_JOURNAL_STAGES.includes(value.stage))errors.push('PackInstallJournal.stage is invalid.');
  if(!isoInstant(value.createdAt)||!isoInstant(value.updatedAt))errors.push('PackInstallJournal timestamps are invalid.');
  if(!clean(value.ownerId,180))errors.push('PackInstallJournal.ownerId is missing.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validateInstalledPack(value){
  const errors=baseErrors(value,{contract:'InstalledPack',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!clean(value.packId,160)||!Number.isInteger(Number(value.activeRevision))||Number(value.activeRevision)<1)errors.push('InstalledPack active identity is invalid.');
  if(!INSTALLED_PACK_STATES.includes(value.state))errors.push('InstalledPack.state is invalid.');
  if(!Array.isArray(value.lessonIds)||!Array.isArray(value.assetAddresses))errors.push('InstalledPack inventory is invalid.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validatePackActivationReceipt(value){
  const errors=baseErrors(value,{contract:'PackActivationReceipt',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!clean(value.packId,160)||!Number.isInteger(Number(value.activatedRevision))||Number(value.activatedRevision)<1)errors.push('PackActivationReceipt pack identity is invalid.');
  if(!isoInstant(value.activatedAt))errors.push('PackActivationReceipt.activatedAt is invalid.');
  try{normalizeContentAddress(value.manifestAddress);}catch(error){errors.push(error.message);}
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validateContentProgress(value){
  const errors=baseErrors(value,{contract:'ContentProgress',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!clean(value.lessonId,160)||!clean(value.activityId,160))errors.push('ContentProgress target is invalid.');
  if(!['not-started','in-progress','completed'].includes(value.status))errors.push('ContentProgress.status is invalid.');
  if(!isoInstant(value.updatedAt))errors.push('ContentProgress.updatedAt is invalid.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function validatePackRevocation(value){
  const errors=baseErrors(value,{contract:'PackRevocation',revision:false});
  if(!isObject(value))return{valid:false,errors,value:null};
  if(!clean(value.packId,160))errors.push('PackRevocation.packId is missing.');
  if(!Number.isInteger(Number(value.packRevision))||Number(value.packRevision)<1)errors.push('PackRevocation.packRevision is invalid.');
  if(!clean(value.reasonCode,120)||!clean(value.reason,500))errors.push('PackRevocation reason is missing.');
  if(!isoInstant(value.revokedAt))errors.push('PackRevocation.revokedAt is invalid.');
  return{valid:errors.length===0,errors,value:errors.length?null:Object.freeze(clone(value))};
}

export function assertValidContent(result,code='CONTENT_CONTRACT_INVALID'){
  if(result.valid)return result.value;
  throw contentContractError(code,result.errors.join(' '),{errors:Object.freeze([...result.errors])});
}
