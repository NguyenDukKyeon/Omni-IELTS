import {
  IELTS_SCHEMA_VERSION,
  IELTS_STORE_NAMES,
  createErrorRecord,
  mergeErrorRecords,
  sanitizeLexicalSet,
  sanitizeLexicalRelation,
  sanitizeLabItem,
  sanitizeReadingPassage,
  createIeltsReadingSourceRevision,
  validateIeltsReadingSourceRevision,
  IELTS_READING_MATCHING_KINDS,
  sanitizeMediaSource,
  sanitizeTranscriptSegment,
  sanitizeMediaAttempt,
  validateLexicalSet,
  validateLabItem,
  validateReadingPassage,
  validateTranscriptSegments
} from './ielts-domain.js';
import { PRODUCTIVE_PROMPT_REF,PRODUCTIVE_ERROR_CODES,createArtifactRevision,createLearnerArtifact,normalizeProductiveText,sameProductivePromptRef,validateArtifactLineage,validateLearnerArtifact,validateLearnerArtifactRevision,validateProductiveFeedback,validateProductivePromptRef } from './productive-text-contracts.js';
import { createIeltsObjectiveInventoryItem, transitionIeltsObjectiveInventoryItem, validateIeltsObjectiveInventoryItem } from './ielts-profile-inventory.js';
import { canonicalContentJson } from './content-contracts-v2.js';
import { durableStorageUnavailable } from './storage-safety.js';
import { assertActiveRestoreToken,withDurableWriteLock } from './storage-lock.js';
import { MIGRATION_LEDGER_PREFIX,defineMigration,openForwardCompatibleDatabase } from './migration-ledger.js';

export const IELTS_DB_NAME='vocab-master-ielts';
export const IELTS_DB_VERSION=3;
export const IELTS_BACKUP_VERSION=3;

const STORE_LIST=Object.freeze(Object.values(IELTS_STORE_NAMES));
const MAX_RECORDS_PER_STORE=100_000;
let databasePromise=null;
let writeQueue=Promise.resolve();
let channel=null;
const memory=new Map(STORE_LIST.map(name=>[name,new Map()]));
const IELTS_MIGRATIONS=Object.freeze([
  defineMigration({
    id:'p1-00-ielts-opener-v1',
    digest:'ielts-v1-stores-and-indexes:2026-07-30',
    targetVersion:1,
    description:'Adopt the Phase 0 IELTS v1 layout under the forward-compatible opener and durable migration ledger.'
  }),
  defineMigration({
    id:'wave4-ielts-profile-inventory-v2',
    digest:'wave4-ielts-profile-inventory-store-v2:2026-08-10',
    targetVersion:2,
    description:'Add canonical IELTS profile/inventory storage without changing the legacy IELTS domain schema.'
  }),
  defineMigration({
    id:'wave5-productive-text-artifacts-v3',
    digest:'wave5-productive-text-artifacts-store-v3:2026-08-12',
    targetVersion:3,
    description:'Add the private immutable learner-artifact owner store for provider-off productive writing.'
  })
]);

function clone(value){return value==null?value:structuredClone(value);}
function nowRevision(){return Date.now()*1000+Math.floor(Math.random()*1000);}
function indexedDbUnavailable(){return typeof indexedDB==='undefined';}
function requestResult(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));});}
function transactionDone(transaction){return new Promise((resolve,reject)=>{transaction.oncomplete=()=>resolve();transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));});}
function enqueueWrite(task,{restoreToken=null}={}){if(restoreToken)return withDurableWriteLock(task,restoreToken);const locked=()=>withDurableWriteLock(task);const run=writeQueue.then(locked,locked);writeQueue=run.catch(()=>{});return run;}
function emit(status,detail={}){globalThis.dispatchEvent?.(new CustomEvent('vocab:ielts-persistence',{detail:{status,...detail}}));}
function assertStore(name){if(!STORE_LIST.includes(name))throw new Error(`IELTS store không hợp lệ: ${name}`);return name;}

function createIndexes(storeName,store){
  if(storeName===IELTS_STORE_NAMES.errors){store.createIndex('normalizedKey','normalizedKey',{unique:true});store.createIndex('status','status',{unique:false});store.createIndex('lastSeenAt','lastSeenAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.lexicalSets){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.lexicalRelations||storeName===IELTS_STORE_NAMES.labItems){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.readingPassages){store.createIndex('status','status',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.readingAttempts){store.createIndex('passageId','passageId',{unique:false});store.createIndex('completedAt','completedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.mediaSources){store.createIndex('videoId','videoId',{unique:true});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.transcriptionJobs){store.createIndex('mediaSourceId','mediaSourceId',{unique:false});store.createIndex('status','status',{unique:false});store.createIndex('cacheKey','cacheKey',{unique:true});}
  if(storeName===IELTS_STORE_NAMES.transcriptSegments){store.createIndex('mediaSourceId','mediaSourceId',{unique:false});store.createIndex('order','order',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.mediaAttempts){store.createIndex('mediaSourceId','mediaSourceId',{unique:false});store.createIndex('segmentId','segmentId',{unique:false});store.createIndex('completedAt','completedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.mediaProgress){store.createIndex('mediaSourceId','mediaSourceId',{unique:true});store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.settings){store.createIndex('updatedAt','updatedAt',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.objectiveInventory){store.createIndex('itemId','itemId',{unique:false});store.createIndex('skill','skill',{unique:false});store.createIndex('status','status',{unique:false});}
  if(storeName===IELTS_STORE_NAMES.learnerArtifacts){store.createIndex('kind','kind',{unique:false});store.createIndex('artifactId','artifactId',{unique:false});store.createIndex('updatedAt','updatedAt',{unique:false});}
}

export function openIeltsDatabase(){
  if(databasePromise)return databasePromise;
  if(indexedDbUnavailable())return Promise.reject(durableStorageUnavailable(IELTS_DB_NAME));
  databasePromise=openForwardCompatibleDatabase({
    name:IELTS_DB_NAME,
    version:IELTS_DB_VERSION,
    requiredStores:STORE_LIST,
    ledgerStore:IELTS_STORE_NAMES.settings,
    migrations:IELTS_MIGRATIONS,
    onVersionChange:()=>{databasePromise=null;},
    upgrade:({database})=>{
      for(const storeName of STORE_LIST){
        if(database.objectStoreNames.contains(storeName))continue;
        const store=database.createObjectStore(storeName,{keyPath:storeName===IELTS_STORE_NAMES.settings?'key':'id'});
        createIndexes(storeName,store);
      }
    }
  }).catch(error=>{databasePromise=null;throw error;});
  return databasePromise;
}

async function withStore(storeName,mode,callback){
  assertStore(storeName);
  const database=await openIeltsDatabase();
  if(!database){const map=memory.get(storeName);return callback(null,map);}
  const transaction=database.transaction(storeName,mode);const store=transaction.objectStore(storeName);const result=await callback(store,null,transaction);await transactionDone(transaction);return result;
}

async function getAll(storeName){return withStore(storeName,'readonly',async(store,map)=>map?[...map.values()].map(clone):requestResult(store.getAll()));}
async function getOne(storeName,key){return withStore(storeName,'readonly',async(store,map)=>map?clone(map.get(key)):requestResult(store.get(key)));}
async function putOne(storeName,value){return enqueueWrite(()=>withStore(storeName,'readwrite',async(store,map)=>{const copy=clone(value);if(map)map.set(copy.key??copy.id,copy);else store.put(copy);return copy;}));}
async function deleteOne(storeName,key){return enqueueWrite(()=>withStore(storeName,'readwrite',async(store,map)=>{if(map)map.delete(key);else store.delete(key);}));}

function initializeChannel(){
  if(channel||typeof BroadcastChannel==='undefined')return;
  channel=new BroadcastChannel('vocab-master-ielts-data-v1');channel.unref?.();
  channel.addEventListener('message',event=>{if(event.data?.type==='changed')globalThis.dispatchEvent?.(new CustomEvent('vocab:ielts-external-change',{detail:event.data}));});
}
function broadcast(reason,stores=[]){const revision=nowRevision();channel?.postMessage({type:'changed',reason,stores,revision});globalThis.dispatchEvent?.(new CustomEvent('vocab:ielts-data-saved',{detail:{reason,stores,revision}}));return revision;}

export async function initializeIeltsPersistence(){
  initializeChannel();await openIeltsDatabase();const recoveredJobs=await recoverInterruptedTranscriptionJobs();const counts={};for(const store of STORE_LIST)counts[store]=(await getAll(store)).length;return{database:IELTS_DB_NAME,version:IELTS_DB_VERSION,counts,recoveredJobs};
}

export async function listIeltsRecords(storeName,{limit=0,sortBy='updatedAt',descending=true}={}){
  if(storeName===IELTS_STORE_NAMES.objectiveInventory)throw Object.assign(new Error('Canonical IELTS objective inventory requires its dedicated owner API.'),{code:'IELTS_INVENTORY_DIRECT_WRITE_FORBIDDEN'});if(storeName===IELTS_STORE_NAMES.learnerArtifacts)throw Object.assign(new Error('Learner artifact storage requires its dedicated owner API.'),{code:'IELTS_OWNER_DIRECT_ACCESS_FORBIDDEN'});
  const rows=await getAll(assertStore(storeName));rows.sort((a,b)=>{const av=Number(a?.[sortBy]||0),bv=Number(b?.[sortBy]||0);return descending?bv-av:av-bv;});return limit>0?rows.slice(0,limit):rows;
}

export async function getIeltsRecord(storeName,id){if(storeName===IELTS_STORE_NAMES.objectiveInventory)throw Object.assign(new Error('Canonical IELTS objective inventory requires its dedicated owner API.'),{code:'IELTS_INVENTORY_DIRECT_WRITE_FORBIDDEN'});if(storeName===IELTS_STORE_NAMES.learnerArtifacts)throw Object.assign(new Error('Learner artifact storage requires its dedicated owner API.'),{code:'IELTS_OWNER_DIRECT_ACCESS_FORBIDDEN'});return getOne(assertStore(storeName),id);}

export async function saveIeltsRecord(storeName,value,reason='ielts-record-saved'){
  if(storeName===IELTS_STORE_NAMES.objectiveInventory)throw Object.assign(new Error('Canonical IELTS objective inventory requires its dedicated owner API.'),{code:'IELTS_INVENTORY_DIRECT_WRITE_FORBIDDEN'});if(storeName===IELTS_STORE_NAMES.learnerArtifacts)throw Object.assign(new Error('Learner artifact storage requires its dedicated owner API.'),{code:'IELTS_OWNER_DIRECT_ACCESS_FORBIDDEN'});
  assertStore(storeName);const row={...clone(value),updatedAt:Number(value?.updatedAt||Date.now())};if(storeName===IELTS_STORE_NAMES.settings){if(!row.key)throw new Error('IELTS setting cần key.');}else if(!row.id)throw new Error(`${storeName} cần id.`);
  emit('saving',{storeName});const saved=await putOne(storeName,row);broadcast(reason,[storeName]);emit('saved',{storeName});return saved;
}

export async function deleteIeltsRecord(storeName,id,reason='ielts-record-deleted'){
  if(storeName===IELTS_STORE_NAMES.objectiveInventory)throw Object.assign(new Error('Canonical IELTS objective inventory cannot be deleted through generic CRUD.'),{code:'IELTS_INVENTORY_DIRECT_WRITE_FORBIDDEN'});if(storeName===IELTS_STORE_NAMES.learnerArtifacts)throw Object.assign(new Error('Learner artifact storage cannot be deleted through generic CRUD.'),{code:'IELTS_OWNER_DIRECT_ACCESS_FORBIDDEN'});
  await deleteOne(assertStore(storeName),id);broadcast(reason,[storeName]);return true;
}

function productiveError(code,message,cause=null){return Object.assign(new Error(message),{code,cause});}
function productiveArtifactId(at){return `productive-artifact:${globalThis.crypto?.randomUUID?.()||`${Number(at)}-${Math.random().toString(16).slice(2)}`}`;}
function immutableProductive(value){const copy=clone(value);const visit=item=>{if(item&&typeof item==='object'&&!Object.isFrozen(item)){for(const child of Object.values(item))visit(child);Object.freeze(item);}return item;};return visit(copy);}
async function productiveRowsByArtifact(artifactId,store=null,map=null){
  if(map)return[...map.values()].filter(row=>row.id===artifactId||row.artifactId===artifactId);
  const [head,children]=await Promise.all([requestResult(store.get(artifactId)),requestResult(store.index('artifactId').getAll(artifactId))]);
  return[...(head?[head]:[]),...children].filter(row=>row.id===artifactId||row.artifactId===artifactId);
}
function validateStoredProductive(rows,artifactId){
  const artifact=rows.find(row=>row.kind==='learner-text-artifact'&&row.id===artifactId);
  const revisions=rows.filter(row=>row.kind==='learner-text-artifact-revision');
  const feedback=rows.filter(row=>row.kind==='productive-advisory-feedback');
  const lineage=validateArtifactLineage({artifact,revisions,feedback});
  if(!lineage.valid)throw productiveError(PRODUCTIVE_ERROR_CODES.MISMATCH,'Stored productive artifact lineage is malformed.');
  return{artifact:lineage.value.artifact,revisions:lineage.value.revisions,feedback};
}

export async function autosaveLearnerTextArtifact({artifactId=null,expectedRevisionId=null,promptRef=PRODUCTIVE_PROMPT_REF,text,at=Date.now()}={}){
  let canonicalText;try{canonicalText=normalizeProductiveText(text);}catch(error){throw productiveError(error.code||PRODUCTIVE_ERROR_CODES.INVALID,error.message,error);}
  const canonicalPrompt=validateProductivePromptRef(promptRef);if(!canonicalPrompt.valid)throw productiveError(PRODUCTIVE_ERROR_CODES.PROMPT,canonicalPrompt.errors[0]);
  if((artifactId!==null&&typeof artifactId!=='string')||(expectedRevisionId!==null&&typeof expectedRevisionId!=='string'))throw productiveError(PRODUCTIVE_ERROR_CODES.INVALID,'Artifact and expected revision IDs must be strings or null.');
  const saved=await enqueueWrite(async()=>{
    let database;try{database=await openIeltsDatabase();}catch(error){throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.',error);}
    if(!database)throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.');
    const transaction=database.transaction(IELTS_STORE_NAMES.learnerArtifacts,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.learnerArtifacts);
    const id=artifactId||productiveArtifactId(at);const rows=await productiveRowsByArtifact(id,store);let artifact,revisions;
    if(!artifactId){
      const revision=createArtifactRevision({artifactId:id,revisionNumber:1,parentRevisionId:null,text:canonicalText,at:Number(at)});
      artifact=createLearnerArtifact({id,promptRef:canonicalPrompt.value,revision,at:Number(at)});store.put(artifact);store.put(revision);await transactionDone(transaction);return{artifact,revision,created:true};
    }
    if(!rows.length)throw productiveError(PRODUCTIVE_ERROR_CODES.ARTIFACT,'Learner artifact was not found.');
    ({artifact,revisions}=validateStoredProductive(rows,id));if(!sameProductivePromptRef(artifact.promptRef,canonicalPrompt.value))throw productiveError(PRODUCTIVE_ERROR_CODES.PROMPT,'Productive prompt does not match the artifact owner.');
    if(expectedRevisionId!==artifact.currentRevisionId)throw productiveError(PRODUCTIVE_ERROR_CODES.STALE,'Learner artifact head changed; reload the durable revision.');
    const head=revisions.at(-1);if(head.text===canonicalText){await transactionDone(transaction);return{artifact,revision:head,created:false};}
    const revision=createArtifactRevision({artifactId:id,revisionNumber:artifact.revisionCount+1,parentRevisionId:head.id,text:canonicalText,at:Number(at)});
    const next={...artifact,currentRevisionId:revision.id,revisionCount:revision.revisionNumber,updatedAt:Number(at)};store.put(revision);store.put(next);await transactionDone(transaction);return{artifact:next,revision,created:true};
  });
  broadcast('productive-text-autosaved',[IELTS_STORE_NAMES.learnerArtifacts]);
  return immutableProductive({artifactId:saved.artifact.id,artifactRevisionId:saved.revision.id,revisionNumber:saved.revision.revisionNumber,textDigest:saved.revision.textDigest,wordCount:saved.revision.wordCount,durable:true,createdRevision:saved.created,revision:saved.revision});
}

export async function getLearnerTextArtifact(artifactId){
  if(!exactProductiveId(artifactId))return null;
  let database;try{database=await openIeltsDatabase();}catch(error){throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.',error);}
  if(!database)throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.');
  const transaction=database.transaction(IELTS_STORE_NAMES.learnerArtifacts,'readonly'),store=transaction.objectStore(IELTS_STORE_NAMES.learnerArtifacts);const rows=await productiveRowsByArtifact(artifactId,store);await transactionDone(transaction);if(!rows.length)return null;return immutableProductive(validateStoredProductive(rows,artifactId));
}
export async function getLatestControlledLearnerTextArtifact(promptRef=PRODUCTIVE_PROMPT_REF){
  const canonicalPrompt=validateProductivePromptRef(promptRef);if(!canonicalPrompt.valid)throw productiveError(PRODUCTIVE_ERROR_CODES.PROMPT,canonicalPrompt.errors[0]);let database;try{database=await openIeltsDatabase();}catch(error){throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.',error);}if(!database)throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.');const transaction=database.transaction(IELTS_STORE_NAMES.learnerArtifacts,'readonly'),store=transaction.objectStore(IELTS_STORE_NAMES.learnerArtifacts),all=await requestResult(store.getAll());
  const heads=all.filter(row=>row?.kind==='learner-text-artifact');
  if(heads.length+all.filter(row=>row?.kind==='learner-text-artifact-revision'||row?.kind==='productive-advisory-feedback').length!==all.length)throw productiveError(PRODUCTIVE_ERROR_CODES.MISMATCH,'Stored productive owner contains an unknown record.');
  const lineages=heads.map(head=>validateStoredProductive(all.filter(row=>row.id===head.id||row.artifactId===head.id),head.id));
  const controlled=lineages.filter(value=>sameProductivePromptRef(value.artifact.promptRef,canonicalPrompt.value)).sort((a,b)=>b.artifact.updatedAt-a.artifact.updatedAt||String(a.artifact.id).localeCompare(String(b.artifact.id)));
  await transactionDone(transaction);return controlled.length?immutableProductive(controlled[0]):null;
}
function exactProductiveId(value){return typeof value==='string'&&value.length>0&&value.length<=240;}
export async function saveProductiveAdvisoryFeedback(input){
  const checked=validateProductiveFeedback(input);if(!checked.valid)throw productiveError(PRODUCTIVE_ERROR_CODES.INVALID,checked.errors[0]);const feedback=checked.value;
  const saved=await enqueueWrite(async()=>{
    let database;try{database=await openIeltsDatabase();}catch(error){throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.',error);}
    if(!database)throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.');
    const transaction=database.transaction(IELTS_STORE_NAMES.learnerArtifacts,'readwrite'),store=transaction.objectStore(IELTS_STORE_NAMES.learnerArtifacts);const rows=await productiveRowsByArtifact(feedback.artifactId,store);const lineage=validateStoredProductive(rows,feedback.artifactId);if(!lineage.revisions.some(row=>row.id===feedback.artifactRevisionId))throw productiveError(PRODUCTIVE_ERROR_CODES.REVISION,'Artifact revision was not found.');if(lineage.artifact.currentRevisionId!==feedback.artifactRevisionId)throw productiveError(PRODUCTIVE_ERROR_CODES.STALE,'Self-review must bind the current durable revision.');if(!sameProductivePromptRef(lineage.artifact.promptRef,feedback.promptRef))throw productiveError(PRODUCTIVE_ERROR_CODES.PROMPT,'Self-review prompt does not match the artifact owner.');const prior=lineage.feedback.find(row=>row.runId===feedback.runId);if(prior&&JSON.stringify(prior)!==JSON.stringify(feedback))throw productiveError('PRODUCTIVE_TERMINAL_CONFLICT','Productive terminal already has a different feedback winner.');
    const existing=await requestResult(store.get(feedback.id));if(existing){const old=validateProductiveFeedback(existing);if(!old.valid||JSON.stringify(old.value)!==JSON.stringify(feedback))throw productiveError(PRODUCTIVE_ERROR_CODES.COLLISION,'Feedback identity collision.');await transactionDone(transaction);return old.value;}
    store.put(feedback);await transactionDone(transaction);return feedback;
  });broadcast('productive-self-review-saved',[IELTS_STORE_NAMES.learnerArtifacts]);return immutableProductive(saved);
}
export async function getProductiveFeedbackByRun({artifactId,runId}={}){
  if(!exactProductiveId(artifactId)||!exactProductiveId(runId))return null;
  let database;try{database=await openIeltsDatabase();}catch(error){throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.',error);}
  if(!database)throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.');
  const transaction=database.transaction(IELTS_STORE_NAMES.learnerArtifacts,'readonly'),store=transaction.objectStore(IELTS_STORE_NAMES.learnerArtifacts),rows=await productiveRowsByArtifact(artifactId,store);await transactionDone(transaction);
  if(!rows.length)return null;const lineage=validateStoredProductive(rows,artifactId);const winners=lineage.feedback.filter(row=>row.runId===runId).sort((left,right)=>right.updatedAt-left.updatedAt||String(left.id).localeCompare(String(right.id)));
  if(winners.length>1)throw productiveError(PRODUCTIVE_ERROR_CODES.MISMATCH,'Stored productive Run has multiple feedback owners.');
  return winners.length?immutableProductive(winners[0]):null;
}
export async function getProductiveFeedbackProjection(feedbackId){
  if(!exactProductiveId(feedbackId))return null;let database;try{database=await openIeltsDatabase();}catch(error){throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.',error);}if(!database)throw productiveError(PRODUCTIVE_ERROR_CODES.STORAGE,'Productive writing requires durable IndexedDB storage.');const transaction=database.transaction(IELTS_STORE_NAMES.learnerArtifacts,'readonly'),store=transaction.objectStore(IELTS_STORE_NAMES.learnerArtifacts),feedback=await requestResult(store.get(feedbackId));if(!feedback){await transactionDone(transaction);return null;}const checked=validateProductiveFeedback(feedback);if(!checked.valid)throw productiveError(PRODUCTIVE_ERROR_CODES.MISMATCH,'Stored productive feedback is malformed.');const rows=await productiveRowsByArtifact(checked.value.artifactId,store);await transactionDone(transaction);const lineage=validateStoredProductive(rows,checked.value.artifactId);return immutableProductive({feedbackId:checked.value.id,artifactId:checked.value.artifactId,artifactRevisionId:checked.value.artifactRevisionId,currentRevisionId:lineage.artifact.currentRevisionId,freshness:lineage.artifact.currentRevisionId===checked.value.artifactRevisionId?'current':'stale',feedback:checked.value});}

function immutableSnapshot(value){
  const copy=clone(value);
  const freeze=current=>{if(current&&typeof current==='object'&&!Object.isFrozen(current)){for(const child of Object.values(current))freeze(child);Object.freeze(current);}return current;};
  return freeze(copy);
}

function canonicalInventorySnapshot(value){
  const checked=validateIeltsObjectiveInventoryItem(value,{historical:true});if(!checked.valid||canonicalContentJson(checked.value)!==canonicalContentJson(value))throw Object.assign(new Error('Stored inventory row is noncanonical.'),{code:'IELTS_INVENTORY_INVALID'});return immutableSnapshot(checked.value);
}
function inventoryId(value){if(typeof value!=='string'||!/^ielts-objective:[a-f0-9]{64}$/.test(value))throw Object.assign(new Error('Inventory id is invalid.'),{code:'IELTS_INVENTORY_INVALID'});return value;}

function inventoryPersistenceError(error){
  if(error?.code==='DURABLE_STORAGE_UNAVAILABLE')return Object.assign(new Error('Canonical IELTS inventory requires durable IndexedDB storage.'),{code:'IELTS_INVENTORY_DURABILITY_UNAVAILABLE',cause:error});
  return error;
}

function sameInventoryImmutableContent(left,right){
  const pick=value=>({id:value.id,kind:value.kind,schemaVersion:value.schemaVersion,itemId:value.itemId,itemRevision:value.itemRevision,skill:value.skill,profiles:value.profiles,form:value.form,section:value.section,order:value.order,sourceRevisionRef:value.sourceRevisionRef,questionBinding:value.questionBinding,questionPayload:value.questionPayload,contentDigest:value.contentDigest,rights:value.rights,provenance:value.provenance,humanReview:value.humanReview,createdAt:value.createdAt,verifiedAt:value.verifiedAt,extensions:value.extensions});
  return canonicalContentJson(pick(left))===canonicalContentJson(pick(right));
}

function sameInventoryApprovalTransition(left,right){
  const pick=value=>({id:value.id,kind:value.kind,schemaVersion:value.schemaVersion,itemId:value.itemId,itemRevision:value.itemRevision,skill:value.skill,profiles:value.profiles,form:value.form,section:value.section,order:value.order,sourceRevisionRef:value.sourceRevisionRef,questionBinding:value.questionBinding,questionPayload:value.questionPayload,contentDigest:value.contentDigest,createdAt:value.createdAt,extensions:value.extensions});
  return canonicalContentJson(pick(left))===canonicalContentJson(pick(right));
}

async function authenticQarPromotion(candidate,questionActivity){
  if(!questionActivity||typeof questionActivity!=='object')return false;
  const { normalizeQuestionResponse,validateQuestionActivity }=await import('./question-activity-contracts.js');
  const objectiveTextKinds=['reading-sentence-completion','reading-summary-completion','reading-note-completion','reading-table-completion','reading-flow-chart-completion','reading-short-answer','reading-diagram-label-completion','listening-form-completion','listening-note-completion','listening-table-completion','listening-flow-chart-completion','listening-summary-completion','listening-sentence-completion','listening-short-answer'];
  if(objectiveTextKinds.includes(candidate.questionBinding.kind)){
    const objective=await import('./objective-text-response.js');
    if(!objective.isObjectiveTextResponseQuestion(questionActivity))return false;
    let expected;try{const definition=candidate.questionPayload;expected=await objective.createObjectiveTextResponseQuestionAsync(definition,{ownerAdapter:objective.createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:async id=>id===definition.id?definition:null})});}catch{return false;}
    const binding={kind:expected.kind,schemaVersion:expected.version,registryRevision:expected.registryRevision,questionId:expected.id,promptRevision:expected.promptRevision,promptDigest:expected.promptDigest,keyRevision:expected.keyRevision,keyDigest:expected.keyDigest,rubricRevision:expected.rubricRevision,rubricDigest:expected.rubricDigest,scorer:expected.scorer,reviewPolicyRevision:expected.reviewPolicyRevision,requiredCapabilities:expected.requiredCapabilities};
    return canonicalContentJson(candidate.questionBinding)===canonicalContentJson(binding)&&canonicalContentJson(questionActivity)===canonicalContentJson(expected);
  }
  if(candidate.skill==='reading'&&IELTS_READING_MATCHING_KINDS.includes(candidate.questionBinding.kind)){
    const objective=await import('./objective-matching-response.js');
    if(!objective.isObjectiveMatchingResponseQuestion(questionActivity))return false;
    let expected;try{const definition=candidate.questionPayload;expected=await objective.createObjectiveMatchingResponseQuestionAsync(definition,{ownerAdapter:objective.createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:async id=>id===definition.id?definition:null})});}catch{return false;}
    const binding={kind:expected.kind,schemaVersion:expected.version,registryRevision:expected.registryRevision,questionId:expected.id,promptRevision:expected.promptRevision,promptDigest:expected.promptDigest,keyRevision:expected.keyRevision,keyDigest:expected.keyDigest,rubricRevision:expected.rubricRevision,rubricDigest:expected.rubricDigest,scorer:expected.scorer,reviewPolicyRevision:expected.reviewPolicyRevision,requiredCapabilities:expected.requiredCapabilities};
    return canonicalContentJson(candidate.questionBinding)===canonicalContentJson(binding)&&canonicalContentJson(questionActivity)===canonicalContentJson(expected);
  }
  if(candidate.skill==='listening'&&['listening-matching','listening-plan-map-diagram-labelling'].includes(candidate.questionBinding.kind)){
    const listening=await import('./ielts-listening-question-activity.js');
    if(!listening.isAuthenticIeltsListeningMatchingQuestion(questionActivity,candidate))return false;
    const objective=await import('./objective-matching-response.js');let expected;try{const definition=candidate.questionPayload;expected=await objective.createObjectiveMatchingResponseQuestionAsync(definition,{ownerAdapter:objective.createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:async id=>id===definition.id?definition:null})});}catch{return false;}
    const binding={kind:expected.kind,schemaVersion:expected.version,registryRevision:expected.registryRevision,questionId:expected.id,promptRevision:expected.promptRevision,promptDigest:expected.promptDigest,keyRevision:expected.keyRevision,keyDigest:expected.keyDigest,rubricRevision:expected.rubricRevision,rubricDigest:expected.rubricDigest,scorer:expected.scorer,reviewPolicyRevision:expected.reviewPolicyRevision,requiredCapabilities:expected.requiredCapabilities};
    return canonicalContentJson(candidate.questionBinding)===canonicalContentJson(binding)&&canonicalContentJson(questionActivity)===canonicalContentJson(expected);
  }
  const validation=validateQuestionActivity(questionActivity);if(!validation.valid)return false;
  const optionId=validation.value.item?.options?.[0]?.id;
  if(typeof optionId!=='string'||!normalizeQuestionResponse(questionActivity,{optionId}).valid)return false;
  const item=candidate.questionBinding.kind==='listening-multiple-choice'&&candidate.questionBinding.schemaVersion===2?(({sealedOptions,...publicItem})=>publicItem)(candidate.questionPayload):candidate.questionPayload;const envelope={schema:'question-activity',version:candidate.questionBinding.schemaVersion,registryRevision:candidate.questionBinding.registryRevision,kind:candidate.questionBinding.kind,id:candidate.questionBinding.questionId,item,sourceRevisionRef:candidate.sourceRevisionRef,promptRevision:candidate.questionBinding.promptRevision,promptDigest:candidate.questionBinding.promptDigest,keyRevision:candidate.questionBinding.keyRevision,keyDigest:candidate.questionBinding.keyDigest,rubricRevision:candidate.questionBinding.rubricRevision,rubricDigest:candidate.questionBinding.rubricDigest,reviewPolicyRevision:candidate.questionBinding.reviewPolicyRevision,scorer:candidate.questionBinding.scorer,requiredCapabilities:candidate.questionBinding.requiredCapabilities,approval:'owner-verified'};
  return validateQuestionActivity(envelope).valid&&canonicalContentJson(questionActivity)===canonicalContentJson(envelope);
}

export async function saveIeltsObjectiveInventoryItem(input,{at=Date.now(),questionActivity=null}={}){
  let candidate,historicalCandidate=false;try{candidate=await createIeltsObjectiveInventoryItem(input,{at});}catch(error){const historical=validateIeltsObjectiveInventoryItem(input,{at,historical:true});if(!historical.valid)throw error;candidate=historical.value;historicalCandidate=true;}
  const authenticPromotion=candidate.status==='verified'&&!historicalCandidate?await authenticQarPromotion(candidate,questionActivity):false;
  try{
    const saved=await enqueueWrite(async()=>{
      const database=await openIeltsDatabase();
      if(!database)throw Object.assign(new Error('Canonical IELTS inventory requires durable storage.'),{code:'IELTS_INVENTORY_DURABILITY_UNAVAILABLE'});
      const transaction=database.transaction(IELTS_STORE_NAMES.objectiveInventory,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.objectiveInventory);
      const existing=await requestResult(store.get(candidate.id));
      if(existing){
        const checked=validateIeltsObjectiveInventoryItem(existing,{at,historical:true});if(!checked.valid||canonicalContentJson(checked.value)!==canonicalContentJson(existing)){await transactionDone(transaction);throw Object.assign(new Error('Stored inventory row is noncanonical and cannot transition.'),{code:'IELTS_INVENTORY_INVALID'});}
        if(canonicalContentJson(existing)===canonicalContentJson(candidate)){await transactionDone(transaction);return existing;}
        if(existing.status==='draft'&&candidate.status==='verified'&&sameInventoryApprovalTransition(existing,candidate)){if(!authenticPromotion){await transactionDone(transaction);throw Object.assign(new Error('Verified inventory promotion requires an authentic current QAR question.'),{code:'IELTS_INVENTORY_INVALID'});}store.put(clone(candidate));await transactionDone(transaction);return candidate;}
        if(existing.status==='verified'&&candidate.status==='retired'){await transactionDone(transaction);throw Object.assign(new Error('Only the retirement owner API may transition VERIFIED inventory.'),{code:'IELTS_INVENTORY_LIFECYCLE_CONFLICT'});}
        const lifecycleConflict=existing.status!=='draft'||candidate.status!=='draft';await transactionDone(transaction);throw Object.assign(new Error(lifecycleConflict?'Inventory lifecycle replay conflicts.':'A different record already owns this inventory identity.'),{code:lifecycleConflict?'IELTS_INVENTORY_LIFECYCLE_CONFLICT':'IELTS_INVENTORY_IDENTITY_COLLISION'});
      }
      if(historicalCandidate){await transactionDone(transaction);throw Object.assign(new Error('Expired publication approval cannot create durable inventory.'),{code:'IELTS_INVENTORY_INVALID'});}if(candidate.status!=='draft'){await transactionDone(transaction);throw Object.assign(new Error('Initial durable inventory creation must be DRAFT.'),{code:'IELTS_INVENTORY_LIFECYCLE_CONFLICT'});}
      store.put(clone(candidate));await transactionDone(transaction);return candidate;
    });
    broadcast('ielts-objective-inventory-saved',[IELTS_STORE_NAMES.objectiveInventory]);return immutableSnapshot(saved);
  }catch(error){throw inventoryPersistenceError(error);}
}

export async function getIeltsObjectiveInventoryItem(id){
  try{const value=await getOne(IELTS_STORE_NAMES.objectiveInventory,inventoryId(id));return value==null?null:canonicalInventorySnapshot(value);}catch(error){throw inventoryPersistenceError(error);}
}

export async function listIeltsObjectiveInventoryItems(filters={}){
  try{
    const allowed=['itemId','skill','status','profile'];if(!filters||typeof filters!=='object'||Array.isArray(filters)||Object.getPrototypeOf(filters)!==Object.prototype&&Object.getPrototypeOf(filters)!==null)throw Object.assign(new Error('Inventory filters are invalid.'),{code:'IELTS_INVENTORY_INVALID'});const descriptors=Object.getOwnPropertyDescriptors(filters);if(Object.getOwnPropertySymbols(filters).length||Object.keys(descriptors).some(key=>!allowed.includes(key)||!Object.hasOwn(descriptors[key],'value')))throw Object.assign(new Error('Inventory filters are invalid.'),{code:'IELTS_INVENTORY_INVALID'});const filter=Object.fromEntries(Object.entries(descriptors).map(([key,descriptor])=>[key,descriptor.value]));if(filter.itemId!=null&&!/^[a-z0-9][a-z0-9._:-]{2,159}$/.test(filter.itemId)||filter.skill!=null&&!['reading','listening'].includes(filter.skill)||filter.status!=null&&!['draft','verified','retired'].includes(filter.status)||filter.profile!=null&&!['academic','general-training'].includes(filter.profile))throw Object.assign(new Error('Inventory filters are invalid.'),{code:'IELTS_INVENTORY_INVALID'});
    const rows=(await getAll(IELTS_STORE_NAMES.objectiveInventory)).map(canonicalInventorySnapshot);const selected=rows.filter(row=>(filter.itemId==null||row.itemId===filter.itemId)&&(filter.skill==null||row.skill===filter.skill)&&(filter.status==null||row.status===filter.status)&&(filter.profile==null||row.profiles.includes(filter.profile))).sort((left,right)=>left.id.localeCompare(right.id));
    return immutableSnapshot(selected);
  }catch(error){throw inventoryPersistenceError(error);}
}

export async function retireIeltsObjectiveInventoryItem(id,{reason,at=Date.now()}={}){
  try{
    let requestedAt;try{requestedAt=new Date(Number(at)).toISOString();}catch{throw Object.assign(new Error('Retirement time is invalid.'),{code:'IELTS_INVENTORY_INVALID'});}
    const retired=await enqueueWrite(async()=>{
      const database=await openIeltsDatabase();if(!database)throw Object.assign(new Error('Canonical IELTS inventory requires durable storage.'),{code:'IELTS_INVENTORY_DURABILITY_UNAVAILABLE'});
      const transaction=database.transaction(IELTS_STORE_NAMES.objectiveInventory,'readwrite'),store=transaction.objectStore(IELTS_STORE_NAMES.objectiveInventory),current=await requestResult(store.get(inventoryId(id)));
      if(!current){await transactionDone(transaction);throw Object.assign(new Error('IELTS objective inventory item was not found.'),{code:'IELTS_INVENTORY_NOT_FOUND'});}
      const checked=validateIeltsObjectiveInventoryItem(current,{at,historical:true});if(!checked.valid||canonicalContentJson(checked.value)!==canonicalContentJson(current)){await transactionDone(transaction);throw Object.assign(new Error('Stored inventory row is noncanonical and cannot transition.'),{code:'IELTS_INVENTORY_INVALID'});}
      if(current.status==='retired'){await transactionDone(transaction);if(current.retirementReason===reason&&current.retiredAt===requestedAt)return current;throw Object.assign(new Error('Retired inventory is terminal and changed replay conflicts.'),{code:'IELTS_INVENTORY_LIFECYCLE_CONFLICT'});}
      const next=transitionIeltsObjectiveInventoryItem(current,{status:'retired',reason,at});store.put(clone(next));await transactionDone(transaction);return next;
    });
    broadcast('ielts-objective-inventory-retired',[IELTS_STORE_NAMES.objectiveInventory]);return immutableSnapshot(retired);
  }catch(error){throw inventoryPersistenceError(error);}
}

export async function upsertErrorRecord(input,reason='ielts-error-upserted'){
  const incoming=createErrorRecord(input);emit('saving',{storeName:IELTS_STORE_NAMES.errors});
  const saved=await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.errors);const existing=[...map.values()].find(row=>row.normalizedKey===incoming.normalizedKey);const value=existing?mergeErrorRecords(existing,incoming):incoming;if(existing)map.delete(existing.id);map.set(value.id,value);return value;}
    const transaction=database.transaction(IELTS_STORE_NAMES.errors,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.errors);const existing=await requestResult(store.index('normalizedKey').get(incoming.normalizedKey));const value=existing?mergeErrorRecords(existing,incoming):incoming;store.put(value);await transactionDone(transaction);return value;
  });
  const { recordErrorOccurrence }=await import('./error-repository.js');
  await recordErrorOccurrence({...saved,occurrenceId:`ielts:${incoming.id}`,weight:incoming.occurrenceCount,provenance:{...saved.provenance,legacyId:saved.id,source:'ielts'}});
  broadcast(reason,[IELTS_STORE_NAMES.errors]);emit('saved',{storeName:IELTS_STORE_NAMES.errors});return saved;
}

export async function setErrorStatus(id,status,evidenceAttempt=null){
  const current=await getOne(IELTS_STORE_NAMES.errors,id);if(!current)throw new Error('Không tìm thấy lỗi.');
  const evidenceAttempts=evidenceAttempt?[...(current.evidenceAttempts||[]),structuredClone(evidenceAttempt)].slice(-30):(current.evidenceAttempts||[]);
  const value=createErrorRecord({...current,status,evidenceAttempts,lastResolvedAt:status==='resolved'?Date.now():current.lastResolvedAt,resolutionAttempts:Number(current.resolutionAttempts||0)+(status==='practicing'?1:0),now:current.firstSeenAt});
  await putOne(IELTS_STORE_NAMES.errors,value);
  if(evidenceAttempt){
    const { normalizeErrorOccurrence,recordCorrectionEvidence }=await import('./error-repository.js');
    const normalized=normalizeErrorOccurrence({...value,provenance:{...value.provenance,legacyId:value.id,source:'ielts'}});
    await recordCorrectionEvidence(normalized.errorRecordId,evidenceAttempt);
  }
  broadcast('ielts-error-status',[IELTS_STORE_NAMES.errors]);return value;
}

export async function saveLexicalSet(input){const result=validateLexicalSet(input);if(!result.valid&&result.value.status==='active')throw new Error(result.errors.join(' '));return saveIeltsRecord(IELTS_STORE_NAMES.lexicalSets,result.value,'ielts-lexical-set-saved');}
export async function saveLexicalRelation(input){return saveIeltsRecord(IELTS_STORE_NAMES.lexicalRelations,sanitizeLexicalRelation(input),'ielts-relation-saved');}
export async function saveLabItem(input){const result=validateLabItem(input);if(!result.valid&&result.value.status==='verified')throw new Error(result.errors.join(' '));return saveIeltsRecord(IELTS_STORE_NAMES.labItems,result.value,'ielts-lab-item-saved');}
export async function saveReadingPassage(input){const result=validateReadingPassage(input);if(!result.valid&&result.value.status==='verified')throw new Error(result.errors.join(' '));return saveIeltsRecord(IELTS_STORE_NAMES.readingPassages,result.value,'ielts-reading-saved');}
export async function saveIeltsReadingSourceRevision(input){const result=validateIeltsReadingSourceRevision(input);if(!result.valid)throw Object.assign(new Error(result.errors.join(' ')),{code:'IELTS_READING_SOURCE_INVALID'});const existing=await getIeltsRecord(IELTS_STORE_NAMES.readingPassages,result.value.id);if(existing){if(existing.kind===result.value.kind&&canonicalContentJson(existing)===canonicalContentJson(result.value))return clone(existing);throw Object.assign(new Error('A changed Reading source revision requires a new durable identity.'),{code:'IELTS_READING_SOURCE_COLLISION'});}return saveIeltsRecord(IELTS_STORE_NAMES.readingPassages,result.value,'ielts-reading-source-saved');}
export async function getIeltsReadingSourceRevision(id){const row=await getIeltsRecord(IELTS_STORE_NAMES.readingPassages,id);if(row==null)return null;const result=validateIeltsReadingSourceRevision(row);if(!result.valid||canonicalContentJson(result.value)!==canonicalContentJson(row))throw Object.assign(new Error('Stored Reading source is malformed.'),{code:'IELTS_READING_SOURCE_INVALID'});return immutableSnapshot(result.value);}

export async function saveReadingAttempt(input){
  const value={id:String(input.id||globalThis.crypto?.randomUUID?.()||`reading-attempt-${Date.now()}`),passageId:String(input.passageId||''),answers:Array.isArray(input.answers)?clone(input.answers):[],score:Math.max(0,Number(input.score||0)),completedAt:Number(input.completedAt||Date.now()),evidence:Array.isArray(input.evidence)?clone(input.evidence):[],updatedAt:Date.now()};
  if(!value.passageId)throw new Error('Reading attempt thiếu passageId.');return saveIeltsRecord(IELTS_STORE_NAMES.readingAttempts,value,'ielts-reading-attempt');
}

export async function saveMediaSource(input){const value=sanitizeMediaSource(input);if(!value.videoId)throw new Error('Media source thiếu YouTube video ID.');return saveIeltsRecord(IELTS_STORE_NAMES.mediaSources,value,'ielts-media-source');}

export async function findMediaByVideoId(videoId){
  const value=String(videoId||'');const database=await openIeltsDatabase();if(!database)return[...memory.get(IELTS_STORE_NAMES.mediaSources).values()].find(row=>row.videoId===value)||null;
  const transaction=database.transaction(IELTS_STORE_NAMES.mediaSources,'readonly');const result=await requestResult(transaction.objectStore(IELTS_STORE_NAMES.mediaSources).index('videoId').get(value));await transactionDone(transaction);return result||null;
}

function normalizeTranscriptionJob(input={},existing=null){
  const now=Date.now();return{
    ...(existing?clone(existing):{}),
    id:String(existing?.id||input.id||globalThis.crypto?.randomUUID?.()||`transcription-${now}`),
    mediaSourceId:String(input.mediaSourceId??existing?.mediaSourceId??''),
    cacheKey:String(input.cacheKey??existing?.cacheKey??''),
    model:String(input.model??existing?.model??''),
    language:String(input.language??existing?.language??'en'),
    status:['queued','processing','needs-review','ready','failed','cancelled'].includes(input.status)?input.status:(existing?.status||'queued'),
    retryCount:Math.max(0,Number(input.retryCount??existing?.retryCount??0)),
    error:String(input.error??existing?.error??''),
    createdAt:Number(existing?.createdAt||input.createdAt||now),
    updatedAt:now
  };
}

export async function saveTranscriptionJob(input){
  const candidate=normalizeTranscriptionJob(input);if(!candidate.mediaSourceId||!candidate.cacheKey)throw new Error('Transcription job thiếu mediaSourceId hoặc cacheKey.');
  emit('saving',{storeName:IELTS_STORE_NAMES.transcriptionJobs});
  const saved=await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.transcriptionJobs);const existing=[...map.values()].find(row=>row.cacheKey===candidate.cacheKey)||null;const value=normalizeTranscriptionJob(input,existing);if(existing&&existing.id!==value.id)map.delete(existing.id);map.set(value.id,value);return value;}
    const transaction=database.transaction(IELTS_STORE_NAMES.transcriptionJobs,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.transcriptionJobs);const existing=await requestResult(store.index('cacheKey').get(candidate.cacheKey));const value=normalizeTranscriptionJob(input,existing||null);store.put(value);await transactionDone(transaction);return value;
  });
  broadcast('ielts-transcription-job',[IELTS_STORE_NAMES.transcriptionJobs]);emit('saved',{storeName:IELTS_STORE_NAMES.transcriptionJobs});return saved;
}

export async function recoverInterruptedTranscriptionJobs({now=Date.now()}={}){
  const recovered=await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.transcriptionJobs);const changed=[];for(const[rowId,row]of map){if(row.status!=='processing')continue;const value={...row,status:'failed',retryCount:Number(row.retryCount||0)+1,error:'Phiên tạo transcript bị gián đoạn do reload hoặc đóng ứng dụng. Bạn có thể thử lại.',updatedAt:now};map.set(rowId,value);changed.push(value);}return changed;}
    const transaction=database.transaction(IELTS_STORE_NAMES.transcriptionJobs,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.transcriptionJobs);const processing=await requestResult(store.index('status').getAll('processing'));const changed=processing.map(row=>({...row,status:'failed',retryCount:Number(row.retryCount||0)+1,error:'Phiên tạo transcript bị gián đoạn do reload hoặc đóng ứng dụng. Bạn có thể thử lại.',updatedAt:now}));for(const row of changed)store.put(row);await transactionDone(transaction);return changed;
  });
  if(recovered.length)broadcast('ielts-transcription-recovered',[IELTS_STORE_NAMES.transcriptionJobs]);return recovered.length;
}

export async function replaceTranscriptSegments(mediaSourceId,input,{durationMs=0}={}){
  const result=validateTranscriptSegments((Array.isArray(input)?input:[]).map((row,index)=>sanitizeTranscriptSegment({...row,mediaSourceId},index)),{durationMs});if(!result.valid)throw new Error(result.errors.join(' '));
  const segments=result.segments.map((row,index)=>({...row,order:index,mediaSourceId}));
  await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){const map=memory.get(IELTS_STORE_NAMES.transcriptSegments);for(const[key,value]of map)if(value.mediaSourceId===mediaSourceId)map.delete(key);for(const row of segments)map.set(row.id,clone(row));return;}
    const transaction=database.transaction(IELTS_STORE_NAMES.transcriptSegments,'readwrite');const store=transaction.objectStore(IELTS_STORE_NAMES.transcriptSegments);const existing=await requestResult(store.index('mediaSourceId').getAll(mediaSourceId));for(const row of existing)store.delete(row.id);for(const row of segments)store.put(clone(row));await transactionDone(transaction);
  });
  const { persistTranscriptAggregate }=await import('./transcript-aggregate.js');
  const canonical=await persistTranscriptAggregate({
    source:{id:`transcript-source:ielts:${mediaSourceId}`,namespace:'private',externalId:mediaSourceId,sourceType:'ielts-media',language:segments[0]?.language||'en',status:'unverified',complete:result.complete===true},
    segments,
    provenance:{kind:'ielts-transcript-import',mediaSourceId}
  },{activate:true});
  broadcast('ielts-transcript-replaced',[IELTS_STORE_NAMES.transcriptSegments]);
  return{...result,segments,transcriptSourceId:canonical.source.id,transcriptRevisionId:canonical.revision.id};
}

export async function listTranscriptSegments(mediaSourceId){
  const database=await openIeltsDatabase();let rows;if(!database)rows=[...memory.get(IELTS_STORE_NAMES.transcriptSegments).values()].filter(row=>row.mediaSourceId===mediaSourceId).map(clone);else{const transaction=database.transaction(IELTS_STORE_NAMES.transcriptSegments,'readonly');rows=await requestResult(transaction.objectStore(IELTS_STORE_NAMES.transcriptSegments).index('mediaSourceId').getAll(mediaSourceId));await transactionDone(transaction);}return rows.sort((a,b)=>Number(a.order||0)-Number(b.order||0)||Number(a.startMs||0)-Number(b.startMs||0));
}

export async function saveMediaAttempt(input){
  const saved=await saveIeltsRecord(IELTS_STORE_NAMES.mediaAttempts,sanitizeMediaAttempt(input),'ielts-media-attempt');
  const attempts=Array.isArray(input?.evidenceAttempts)?input.evidenceAttempts:[];
  if(attempts.length){
    const { persistLearningEnvelope }=await import('./persistence.js');
    for(const envelope of attempts)await persistLearningEnvelope(envelope);
  }
  return saved;
}

export async function saveMediaProgress(input){
  const value={id:String(input.id||input.mediaSourceId||''),mediaSourceId:String(input.mediaSourceId||input.id||''),lastSegmentId:String(input.lastSegmentId||''),lastPositionMs:Math.max(0,Number(input.lastPositionMs||0)),completedSegmentIds:[...new Set((Array.isArray(input.completedSegmentIds)?input.completedSegmentIds:[]).map(String))],weakSegmentIds:[...new Set((Array.isArray(input.weakSegmentIds)?input.weakSegmentIds:[]).map(String))],playbackRate:Math.max(.25,Math.min(2,Number(input.playbackRate||1))),sessionMinutes:[10,20,30].includes(Number(input.sessionMinutes))?Number(input.sessionMinutes):20,updatedAt:Date.now()};
  if(!value.mediaSourceId)throw new Error('Media progress thiếu mediaSourceId.');return saveIeltsRecord(IELTS_STORE_NAMES.mediaProgress,value,'ielts-media-progress');
}

export async function getMediaProgress(mediaSourceId){const rows=await getAll(IELTS_STORE_NAMES.mediaProgress);return rows.find(row=>row.mediaSourceId===mediaSourceId)||null;}

export async function buildIeltsBackup({restoreToken=null}={}){
  if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);
  let stores={};const database=await openIeltsDatabase();
  if(!database)for(const store of STORE_LIST)stores[store]=[...memory.get(store).values()].map(clone);
  else{
    const physicalStores=[...database.objectStoreNames];const unknown=physicalStores.filter(name=>!STORE_LIST.includes(name));const missing=STORE_LIST.filter(name=>!physicalStores.includes(name));
    if(unknown.length||missing.length)throw Object.assign(new Error(`IELTS store registry mismatch (missing: ${missing.join(',')||'none'}; unknown: ${unknown.join(',')||'none'}).`),{code:'BACKUP_STORE_REGISTRY_MISMATCH'});
    const transaction=database.transaction(STORE_LIST,'readonly');stores=Object.fromEntries(await Promise.all(STORE_LIST.map(async store=>[store,await requestResult(transaction.objectStore(store).getAll())])));await transactionDone(transaction);
  }
  return{app:'Vocab Master IELTS Labs',schemaVersion:IELTS_BACKUP_VERSION,domainSchemaVersion:IELTS_SCHEMA_VERSION,exportedAt:new Date().toISOString(),stores};
}

function upgradeLegacyIeltsBackupV1(input){
  if(![1,2].includes(Number(input?.schemaVersion)))return null;
  if(Number(input?.domainSchemaVersion)!==IELTS_SCHEMA_VERSION)return{error:'Legacy IELTS backup domain schema is invalid.'};
  const stores=input?.stores;if(!stores||typeof stores!=='object'||Array.isArray(stores))return{error:'Legacy IELTS backup stores are invalid.'};
  const legacyStores=Number(input.schemaVersion)===1?STORE_LIST.filter(store=>![IELTS_STORE_NAMES.objectiveInventory,IELTS_STORE_NAMES.learnerArtifacts].includes(store)):STORE_LIST.filter(store=>store!==IELTS_STORE_NAMES.learnerArtifacts);
  if(Object.keys(stores).some(store=>!legacyStores.includes(store)))return{error:'Legacy IELTS backup contains unknown or partial inventory storage.'};
  if(legacyStores.some(store=>!Array.isArray(stores[store])))return{error:'Legacy IELTS backup is missing a required store.'};
  return{value:{...clone(input),schemaVersion:IELTS_BACKUP_VERSION,stores:{...clone(stores),...(Number(input.schemaVersion)===1?{[IELTS_STORE_NAMES.objectiveInventory]:{}}:{}),[IELTS_STORE_NAMES.objectiveInventory]:stores[IELTS_STORE_NAMES.objectiveInventory]||[],[IELTS_STORE_NAMES.learnerArtifacts]:[]}},warning:`Legacy IELTS backup v${input.schemaVersion} was additively upgraded with empty productive artifact storage.`};
}

export function validateIeltsBackup(input){
  const legacy=upgradeLegacyIeltsBackupV1(input);if(legacy?.error)return{valid:false,errors:[legacy.error],warnings:[],value:null};if(legacy?.value)input=legacy.value;
  const errors=[];const warnings=[];if(!input||typeof input!=='object'||Array.isArray(input))return{valid:false,errors:['Backup IELTS phải là object.'],warnings,value:null};
  if(Number(input.schemaVersion||0)!==IELTS_BACKUP_VERSION)errors.push(Number(input.schemaVersion||0)>IELTS_BACKUP_VERSION?'Backup IELTS dùng schema mới hơn ứng dụng.':'Backup IELTS thiếu hoặc sai schema version.');
  if(Number(input.domainSchemaVersion||0)!==IELTS_SCHEMA_VERSION)errors.push(Number(input.domainSchemaVersion||0)>IELTS_SCHEMA_VERSION?'Backup IELTS dùng domain schema mới hơn ứng dụng.':'Backup IELTS thiếu hoặc sai domain schema version.');
  const stores=input.stores&&typeof input.stores==='object'?input.stores:{};const value={app:'Vocab Master IELTS Labs',schemaVersion:IELTS_BACKUP_VERSION,domainSchemaVersion:IELTS_SCHEMA_VERSION,exportedAt:String(input.exportedAt||new Date().toISOString()),stores:{}};
  for(const store of STORE_LIST){if(!Object.hasOwn(stores,store))errors.push(`Backup IELTS thiếu store ${store}.`);const rows=Array.isArray(stores[store])?stores[store]:[];if(!Array.isArray(stores[store])&&Object.hasOwn(stores,store))errors.push(`${store} phải là array.`);if(rows.length>MAX_RECORDS_PER_STORE)errors.push(`${store} vượt giới hạn ${MAX_RECORDS_PER_STORE}.`);value.stores[store]=clone(rows);}
  for(const store of Object.keys(stores))if(!STORE_LIST.includes(store))errors.push(`Backup IELTS có store không được hỗ trợ: ${store}.`);
  const ids=new Set();for(const store of STORE_LIST){for(const row of value.stores[store]){const id=String(row?.key??row?.id??'');if(!id){errors.push(`${store} có record thiếu id/key.`);continue;}const composite=`${store}:${id}`;if(ids.has(composite))errors.push(`${store} trùng id ${id}.`);ids.add(composite);}}
  for(const row of value.stores[IELTS_STORE_NAMES.lexicalSets]){const result=validateLexicalSet(row);if(row.status==='active'&&!result.valid)errors.push(...result.errors.map(error=>`lexicalSets/${row.id}: ${error}`));}
  for(const row of value.stores[IELTS_STORE_NAMES.labItems]){const result=validateLabItem(row);if(row.status==='verified'&&!result.valid)errors.push(...result.errors.map(error=>`labItems/${row.id}: ${error}`));}
  for(const row of value.stores[IELTS_STORE_NAMES.readingPassages]){if(row?.kind==='ielts-reading-source-revision'){const result=validateIeltsReadingSourceRevision(row);if(!result.valid||canonicalContentJson(result.value)!==canonicalContentJson(row))errors.push(...(result.errors.length?result.errors:['canonical source record is inconsistent.']).map(error=>`readingPassages/${row?.id||'unknown'}: ${error}`));}else{const result=validateReadingPassage(row);if(row.status==='verified'&&!result.valid)errors.push(...result.errors.map(error=>`readingPassages/${row.id}: ${error}`));}}
  for(const row of value.stores[IELTS_STORE_NAMES.objectiveInventory]){const result=validateIeltsObjectiveInventoryItem(row,{historical:true});if(!result.valid)errors.push(...result.errors.map(error=>`objectiveInventory/${row?.id||'unknown'}: ${error}`));else if(canonicalContentJson(result.value)!==canonicalContentJson(row))errors.push(`objectiveInventory/${row.id}: canonical inventory record is inconsistent.`);}
  const productiveArtifacts=value.stores[IELTS_STORE_NAMES.learnerArtifacts].filter(row=>row?.kind==='learner-text-artifact');
  const productiveRevisions=value.stores[IELTS_STORE_NAMES.learnerArtifacts].filter(row=>row?.kind==='learner-text-artifact-revision');
  const productiveFeedback=value.stores[IELTS_STORE_NAMES.learnerArtifacts].filter(row=>row?.kind==='productive-advisory-feedback');
  if(productiveArtifacts.length+productiveRevisions.length+productiveFeedback.length!==value.stores[IELTS_STORE_NAMES.learnerArtifacts].length)errors.push('learnerArtifacts contains an unknown record kind.');
  for(const artifact of productiveArtifacts){const lineage=validateArtifactLineage({artifact,revisions:productiveRevisions.filter(row=>row.artifactId===artifact.id),feedback:productiveFeedback.filter(row=>row.artifactId===artifact.id)});if(!lineage.valid)errors.push(...lineage.errors.map(error=>`learnerArtifacts/${artifact.id}: ${error}`));}
  for(const row of productiveRevisions)if(!productiveArtifacts.some(artifact=>artifact.id===row.artifactId))errors.push(`learnerArtifacts/${row.id||'unknown'} has no artifact owner.`);
  for(const row of productiveFeedback)if(!productiveArtifacts.some(artifact=>artifact.id===row.artifactId))errors.push(`learnerArtifacts/${row.id||'unknown'} has no artifact owner.`);
  const sourceIds=new Set(value.stores[IELTS_STORE_NAMES.mediaSources].map(row=>row.id));for(const segment of value.stores[IELTS_STORE_NAMES.transcriptSegments])if(!sourceIds.has(segment.mediaSourceId))warnings.push(`Segment ${segment.id} tham chiếu media source không tồn tại.`);
  return{valid:errors.length===0,errors,warnings,value};
}

export async function restoreIeltsBackup(input){
  const {restoreIeltsBackupSafely}=await import('./ielts-backup.js');
  return restoreIeltsBackupSafely(input);
}

export async function reopenIeltsDatabase({restoreToken=null}={}){if(!restoreToken)await writeQueue;else assertActiveRestoreToken(restoreToken);if(databasePromise){const database=await databasePromise.catch(()=>null);database?.close();databasePromise=null;}return openIeltsDatabase();}

export async function downloadIeltsBackup(){
  const backup=await buildIeltsBackup();const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`vocab-master-ielts-${new Date().toISOString().slice(0,10)}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return backup;
}

export async function clearIeltsData(){
  await enqueueWrite(async()=>{
    const database=await openIeltsDatabase();
    if(!database){
      for(const[name,map]of memory){
        if(name!==IELTS_STORE_NAMES.settings){map.clear();continue;}
        for(const key of [...map.keys()])if(!String(key).startsWith(MIGRATION_LEDGER_PREFIX))map.delete(key);
      }
      return;
    }
    const transaction=database.transaction(STORE_LIST,'readwrite');
    const settings=transaction.objectStore(IELTS_STORE_NAMES.settings);
    const migrationRows=(await requestResult(settings.getAll())).filter(row=>String(row?.key||'').startsWith(MIGRATION_LEDGER_PREFIX));
    for(const store of STORE_LIST)transaction.objectStore(store).clear();
    for(const row of migrationRows)settings.put(row);
    await transactionDone(transaction);
  });
  broadcast('ielts-data-cleared',STORE_LIST);
}

export const __testing=Object.freeze({requestResult,transactionDone,getAll,getOne,putOne,deleteOne,memory,normalizeTranscriptionJob});
