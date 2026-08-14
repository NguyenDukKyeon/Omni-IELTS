import assert from 'node:assert/strict';
import test from 'node:test';
import { decideEvidence } from '../src/evidence-policy.js';
import { buildLearningEventRecords,validateLearningEventRecord } from '../src/event-repository.js';
import { selectCanonicalFocus } from '../src/focus-selector.js';
import { P7_METRICS_MAX_EVENTS } from '../src/p7-00-metrics-reducer.js';
import { buildCanonicalProgressProjection } from '../src/progress.js';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { validateWeaknessProfile } from '../src/weakness-profile.js';

function canonicalCoreRecord(id,{rating='again',now=Date.parse('2026-08-14T00:00:00Z')}={}){
  const envelope=buildCoreEvidenceEnvelope({
    card:{id:`stage15-card-${id}`,senseId:`stage15-sense-${id}`,front:'diagnostic',back:'chẩn đoán',type:'word'},
    rating,
    step:{id:`stage15-activity-${id}`,kind:'typing',skill:'recall',receiptId:`stage15-receipt-${id}`},
    session:{id:`stage15-session-${id}`,mode:'today',timezone:'UTC'},
    exposure:{},
    now
  });
  const decision=decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification});
  assert.equal(decision.eligible,true,'F002/F003 fixture must be qualified canonical evidence.');
  const record=buildLearningEventRecords({...envelope,decision}).find(row=>row.eventType==='evidence-decided');
  assert.ok(record,'fixture must produce one evidence-decided record');
  assert.equal(validateLearningEventRecord(record).valid,true,'fixture record must validate canonically');
  return record;
}

const focusTarget=(id,skill='recall')=>({cardId:id,senseId:`sense:${id}`,skill,sourceId:`core-card:${id}`,sourceRevision:`core-card:${id}:r1`});
const focusCandidate=(id='stage15-focus')=>({id,type:'typing',target:focusTarget(id),executor:'core-card',estimatedSeconds:60,category:'repair',originReasonCode:'error-repair'});

function selectFromProjection(projection,id='stage15-focus'){
  return selectCanonicalFocus({
    weaknessProfile:projection.weaknessProfile,
    candidates:[focusCandidate(id)],
    acceptedExecutors:['core-card'],
    dayKey:'2026-08-14'
  });
}

test('S15-F002 Progress exposes the one canonical transportable WeaknessProfile consumed by Focus',()=>{
  const projection=buildCanonicalProgressProjection([
    canonicalCoreRecord('f002-good',{rating:'good',now:1_786_665_600_000}),
    canonicalCoreRecord('f002-again-1',{rating:'again',now:1_786_665_601_000}),
    canonicalCoreRecord('f002-again-2',{rating:'again',now:1_786_665_602_000})
  ],{timeZone:'UTC'});

  const direct=validateWeaknessProfile(projection.weaknessProfile);
  assert.equal(direct.valid,true,'Progress WeaknessProfile must satisfy the canonical P7/WKN validator.');

  const roundTrip=structuredClone(JSON.parse(JSON.stringify(projection.weaknessProfile)));
  const transported=validateWeaknessProfile(roundTrip);
  assert.equal(transported.valid,true,'Canonical WeaknessProfile validity must survive clone/serialization instead of hidden process-local identity.');

  const focus=selectFromProjection(projection,'stage15-focus-f002');
  assert.equal(focus.status,'SELECTED','Focus must consume the same canonical WeaknessProfile representation emitted by Progress.');
});

test('S15-F003 canonical producer/Progress history above the current Focus aggregate ceiling remains consumable',()=>{
  assert.equal(P7_METRICS_MAX_EVENTS,100000,'producer maximum is part of the current canonical reducer contract');
  const firstCurrentFailureThreshold=5001;
  const start=1_786_665_600_000;
  const records=Array.from({length:firstCurrentFailureThreshold},(_,index)=>canonicalCoreRecord(`f003-${String(index).padStart(5,'0')}`,{rating:'again',now:start+index}));

  const projection=buildCanonicalProgressProjection(records,{timeZone:'UTC'});
  assert.equal(projection.metrics.denominator,firstCurrentFailureThreshold,'producer must accept all canonical-valid evidence rows.');
  assert.equal(projection.metrics.canonicalInputRefs.length,firstCurrentFailureThreshold,'Progress must preserve canonical input provenance.');
  assert.equal(projection.metrics.bySkill.recall.sourceRefs.length,firstCurrentFailureThreshold,'qualified evidence provenance must remain intact; the regression must not manufacture or discard refs.');

  let focus;
  assert.doesNotThrow(()=>{focus=selectFromProjection(projection,'stage15-focus-f003');},'Focus must not reject an upstream-valid projection solely because canonical and observation provenance are both counted against a lower aggregate ceiling.');
  assert.equal(focus.status,'SELECTED','the same canonical-valid large-history dataset must remain selectable downstream.');
});
