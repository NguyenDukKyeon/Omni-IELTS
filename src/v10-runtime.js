import { initializeV10Persistence,requestV10PersistentStorage } from './v10-persistence.js';
import { migrateExistingCardsToOccurrences } from './lexical-core-v2.js';
import { mountUnifiedCaptureV2 } from './unified-capture-v2.js';
import { mountLibraryV2 } from './library-v2-runtime.js';
import { mountTodayPlannerV2 } from './today-planner-v2.js';
import { mountSentenceLearningLoop } from './sentence-learning-loop.js';
import { mountTranscriptResolverV2 } from './transcript-resolver-v2.js';
import { mountContentPlatform,refreshContentCatalog,evictContentCache } from './content-platform.js';
import { mountIeltsHubV2 } from './ielts-hub-v2.js';
import { mountIeltsLauncherOverride } from './ielts-launcher-override.js';
import { mountPrimaryIAV10 } from './primary-ia-v10.js';
import { mountAiContentFactory } from './ai-content-factory.js';
import { mountCoachingEngineV2 } from './coaching-engine-v2.js';
import { mountV10Audit,runV10CrossAudit } from './v10-audit.js';

function ensureStyles(){if(document.querySelector('link[href="/v10.css"]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='/v10.css';document.head.append(link);}
function emitStatus(status,detail={}){globalThis.dispatchEvent(new CustomEvent('vocab:v10-status',{detail:{status,...detail}}));}
async function guarded(name,task,diagnostics){try{const result=await task();diagnostics.push({name,status:'ready'});return result;}catch(error){diagnostics.push({name,status:'failed',error:error.message});console.error(`[v10:${name}]`,error);emitStatus('module-failed',{module:name,error:error.message});return null;}}

export async function mountV10Runtime(){
  if(globalThis.__VOCAB_V10_READY__)return globalThis.__VOCAB_V10_READY__;ensureStyles();const diagnostics=[];emitStatus('loading');
  const persistence=await guarded('persistence',()=>initializeV10Persistence(),diagnostics);if(!persistence)throw new Error('Không thể khởi tạo Vocab Master v10 persistence.');
  await guarded('lexical-migration',()=>migrateExistingCardsToOccurrences(),diagnostics);
  mountSentenceLearningLoop();diagnostics.push({name:'sentence-loop',status:'ready'});
  mountTranscriptResolverV2();diagnostics.push({name:'transcript-resolver',status:'ready'});
  mountContentPlatform();diagnostics.push({name:'content-platform',status:'ready'});
  await guarded('unified-capture',()=>mountUnifiedCaptureV2(),diagnostics);
  await guarded('library-v2',()=>mountLibraryV2(),diagnostics);
  await guarded('today-v2',()=>mountTodayPlannerV2(),diagnostics);
  mountIeltsHubV2();diagnostics.push({name:'ielts-hub',status:'ready'});
  mountIeltsLauncherOverride();diagnostics.push({name:'ielts-launcher-override',status:'ready'});
  mountPrimaryIAV10();diagnostics.push({name:'primary-information-architecture',status:'ready'});
  mountAiContentFactory();diagnostics.push({name:'ai-factory',status:'ready'});
  await guarded('coaching',()=>mountCoachingEngineV2(),diagnostics);
  mountV10Audit();diagnostics.push({name:'audit',status:'ready'});
  void guarded('content-catalog',()=>refreshContentCatalog(),diagnostics).then(()=>globalThis.VocabMasterIeltsHub?.refresh?.());
  void guarded('storage-persistence',()=>requestV10PersistentStorage(),diagnostics);
  void guarded('content-eviction',()=>evictContentCache(),diagnostics);
  const ready={version:'10.0.0',persistence,diagnostics,mountedAt:Date.now()};globalThis.__VOCAB_V10_READY__=ready;emitStatus('ready',ready);
  setTimeout(()=>{void runV10CrossAudit().then(report=>{globalThis.__VOCAB_V10_AUDIT__=report;emitStatus(report.valid?'audit-passed':'audit-warning',{report});}).catch(error=>console.warn('[v10 audit]',error));},1200);
  return ready;
}
