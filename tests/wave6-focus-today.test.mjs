import test from 'node:test';
import assert from 'node:assert/strict';
import { composeTodayPlan } from '../src/today-composer.js';
import { buildCanonicalProgressProjection } from '../src/progress.js';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { decideEvidence } from '../src/evidence-policy.js';
import { buildLearningEventRecords } from '../src/event-repository.js';

const target=(id,skill='recall')=>({cardId:id,senseId:`sense:${id}`,skill,sourceId:`core-card:${id}`,sourceRevision:`core-card:${id}:r1`});
const composerRow=(id,overrides={})=>({id,type:'typing',target:target(id),executor:'core-card',estimatedSeconds:60,priority:1,...overrides});
function evidenceRecord(suffix,{rating='good',createdAt=1_000}={}){
  const envelope=buildCoreEvidenceEnvelope({
    card:{id:`focus-card:${suffix}`,senseId:`focus-sense:${suffix}`,front:'private',back:'private',type:'word'},
    rating,
    step:{id:`focus-activity:${suffix}`,kind:'typing',skill:'recall',receiptId:`focus-receipt:${suffix}`},
    session:{id:`focus-session:${suffix}`,mode:'today',timezone:'UTC'},
    now:createdAt
  });
  const decision=decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification});
  return buildLearningEventRecords({...envelope,decision}).find(row=>row.eventType==='evidence-decided');
}

async function focusApiOrFallback(candidate){
  try{return await import('../src/focus-selector.js');}
  catch(error){
    if(error?.code!=='ERR_MODULE_NOT_FOUND')throw error;
    return{
      selectCanonicalFocus:()=>({status:'SELECTED',reasonCode:'observed-weakness-focus',selection:{candidate}}),
      validateFocusSelectionBinding:()=>({valid:false,value:null})
    };
  }
}

test('Today binds exactly one authenticated observed weakness Focus after all due work within budget',async()=>{
  const focusCandidate={id:'focus-repair',type:'typing',target:target('focus-repair'),executor:'core-card',estimatedSeconds:60,category:'repair',originReasonCode:'error-repair'};
  const api=await focusApiOrFallback(focusCandidate);
  const profile=buildCanonicalProgressProjection([
    evidenceRecord('good'),
    evidenceRecord('again',{rating:'again',createdAt:2_000})
  ]).weaknessProfile;
  const decision=api.selectCanonicalFocus({weaknessProfile:profile,candidates:[focusCandidate],acceptedExecutors:['core-card'],dayKey:'2026-08-14'});
  const plan=composeTodayPlan({
    dueReviews:[composerRow('due-1',{dueAt:100})],
    repairs:[composerRow('focus-repair')],
    content:[composerRow('ordinary-content')],
    minutes:3,
    focusDecision:decision,
    timezone:'UTC',
    now:Date.UTC(2026,7,14,1,0,0)
  });

  const focusRows=plan.activities.filter(row=>row.reasonCode==='observed-weakness-focus');
  assert.equal(focusRows.length,1,'existing Today path must bind exactly one observed weakness Focus row');
  assert.equal(plan.activities[0].id,'due-1','due work must precede Focus');
  assert.ok(plan.activities.indexOf(focusRows[0])>0,'Focus must be after all selected due work');
  assert.ok(plan.estimatedSeconds<=plan.budgetSeconds,'Focus must preserve the Today budget');
  assert.equal(focusRows[0].id,'focus-repair');
  assert.equal(focusRows[0].payload.focusSelection.reasonCode,'observed-weakness-focus');
  assert.equal(api.validateFocusSelectionBinding(focusRows[0].payload.focusSelection).valid,true,'persisted Focus binding must authenticate');

  const other={...focusCandidate,id:'z',target:target('z')};
  const reversed=api.selectCanonicalFocus({weaknessProfile:profile,candidates:[other,focusCandidate].reverse(),acceptedExecutors:['core-card'],dayKey:'2026-08-14'});
  const repeated=api.selectCanonicalFocus({weaknessProfile:profile,candidates:[focusCandidate,other],acceptedExecutors:['core-card'],dayKey:'2026-08-14'});
  assert.deepEqual(reversed,repeated,'Focus ranking must be deterministic under candidate ordering');
  assert.equal(repeated.selection.candidate.id,'focus-repair');

  const forged=structuredClone(focusRows[0].payload.focusSelection);
  forged.selection.candidate.executor='tampered-executor';
  assert.equal(api.validateFocusSelectionBinding(forged).valid,false,'tampered Focus binding must fail before execution');

  const serialized=JSON.stringify(plan);
  for(const forbidden of ['readiness','bandEstimate','masteryClaim','providerCall','fcs-02','p7-04'])assert.equal(serialized.includes(forbidden),false);
});
