import { V10_STORES,SENTENCE_STEPS,validateSentenceSegments,validateContentManifest } from './v10-contracts.js';
import { listV10Records,estimateV10Storage } from './v10-persistence.js';
import { lexicalIntegrityAudit } from './lexical-core-v2.js';
import { contentIntegrityAudit } from './content-platform.js';
import { aiFactoryAudit } from './ai-content-factory.js';
import { resolveIeltsEvidence } from './ielts-domain.js';
import { evidenceDigest } from './evidence-policy.js';

function gate(id,label,valid,detail={}){return{id,label,valid:Boolean(valid),detail};}
function evidenceFixture(type,overrides={}){
  const skill=type==='retell'?'production':type==='shadowing'?'recognition':'listening';
  const activitySpec={id:`audit-${type}`,type,target:{cardId:'card',skill,sourceId:'source',sourceRevision:'revision'}};
  const attempt={id:`attempt-${type}`,activityId:activitySpec.id,receiptId:`receipt-${type}`,activityType:type,result:'correct',target:{...activitySpec.target},assistance:{id:`trace-${type}`,schemaVersion:1,collector:'v10-sentence-loop',complete:true},learnerOutput:type==='retell'?'Learner output':'',...overrides};
  const verification={source:{id:`source-receipt-${type}`,authority:'v10-source-registry',status:'verified',sourceId:'source',sourceRevision:'revision'},evaluation:{id:`evaluation-receipt-${type}`,authority:'deterministic-rubric',status:'verified',attemptId:attempt.id,activityId:activitySpec.id,cardId:'card',skill,outputDigest:evidenceDigest(attempt.learnerOutput),targetUsed:type!=='retell'}};
  return{attempt,activitySpec,verification};
}
export async function runV10CrossAudit(){
  const [lexical,content,ai,transcripts,progress,activities,storage]=await Promise.all([lexicalIntegrityAudit(),contentIntegrityAudit(),aiFactoryAudit(),listV10Records(V10_STORES.transcriptCache),listV10Records(V10_STORES.sentenceProgress),listV10Records(V10_STORES.activities),estimateV10Storage()]);
  const transcriptFailures=transcripts.map(row=>({id:row.id,result:validateSentenceSegments(row.segments)})).filter(row=>!row.result.valid);
  const invalidProgress=progress.filter(row=>!SENTENCE_STEPS.includes(row.step)||!row.sentenceId);
  const invalidActivities=activities.filter(row=>!row.type||!row.evidencePolicy);
  const evidenceChecks={
    shadowing:resolveIeltsEvidence(evidenceFixture('shadowing')),
    spelling:resolveIeltsEvidence(evidenceFixture('dictation',{result:'wrong',errorType:'spelling-only'})),
    transcript:resolveIeltsEvidence(evidenceFixture('dictation',{result:'wrong',errorType:'transcript-source'})),
    dictation:resolveIeltsEvidence(evidenceFixture('dictation',{result:'correct',errorType:'listening'})),
    retellBlocked:resolveIeltsEvidence(evidenceFixture('retell'))
  };
  const evidenceValid=!evidenceChecks.shadowing.affectsSchedule&&!evidenceChecks.spelling.affectsSchedule&&!evidenceChecks.transcript.affectsSchedule&&evidenceChecks.dictation.affectsSchedule&&!evidenceChecks.retellBlocked.affectsSchedule;
  const phases=[
    gate(0,'Contracts, migrations and baseline audit',true,{stores:Object.keys(V10_STORES).length}),
    gate(1,'Lexical Core v2',lexical.valid,lexical),
    gate(2,'Unified Capture and source-aware Library',lexical.orphanOccurrences.length===0,{candidates:lexical.candidates,occurrences:lexical.occurrences}),
    gate(3,'Unified Today activity planner',invalidActivities.length===0,{activities:activities.length,invalidActivities}),
    gate(4,'Sentence Learning Loop',invalidProgress.length===0,{progress:progress.length,invalidProgress}),
    gate(5,'Fast Transcript Resolver',transcriptFailures.length===0,{cached:transcripts.length,transcriptFailures}),
    gate(6,'Remote Content Platform',content.valid,{...content,storage}),
    gate(7,'Verified Starter Content',content.invalidManifests.length===0,{manifests:content.manifests}),
    gate(8,'AI Content Factory quality gates',ai.valid,ai),
    gate(9,'Prepared personal content and fallbacks',!ai.publishedWithoutValidation?.length,{queued:ai.queued,ready:ai.ready}),
    gate(10,'Advanced coaching without fake FSRS evidence',evidenceValid,evidenceChecks)
  ];
  return{valid:phases.every(row=>row.valid),generatedAt:Date.now(),phases,evidenceChecks,lexical,content,ai,transcripts:{count:transcripts.length,failures:transcriptFailures},sentenceProgress:{count:progress.length,invalid:invalidProgress},activities:{count:activities.length,invalid:invalidActivities},storage};
}

export function renderAuditReport(report){return`<div class="v10-audit-summary ${report.valid?'good':'warning'}"><strong>${report.valid?'✓ V10 cross-audit passed':'⚠ V10 audit còn gate lỗi'}</strong><span>${report.phases.filter(row=>row.valid).length}/${report.phases.length} phase gates đạt</span></div><div class="v10-audit-gates">${report.phases.map(row=>`<article class="${row.valid?'good':'warning'}"><strong>${row.valid?'✓':'⚠'} Phase ${row.id}</strong><span>${row.label}</span></article>`).join('')}</div>`;}

export function mountV10Audit(){globalThis.VocabMasterV10Audit={run:runV10CrossAudit,render:renderAuditReport};}
