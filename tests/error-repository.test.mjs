import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { decideEvidence } from '../src/evidence-policy.js';

globalThis.indexedDB=new IDBFactory();
const errors=await import('../src/error-repository.js');

function occurrence(id,{revision='revision-1',cardId='card-error',weight=1}={}){
  return{
    id,
    occurrenceId:id,
    normalizedKey:`recall:${cardId}:${revision}:missing-word`,
    category:'missing-word',
    learnerResponse:'wrong',
    expectedResponse:'durable',
    target:{cardId,senseId:'sense-1',skill:'recall',sourceId:'transcript-source:test',sourceRevision:revision},
    transcriptRevisionId:revision,
    occurrenceCount:weight,
    occurredAt:1_000+Number(id.replace(/\D/g,'')||0),
    provenance:{source:'test'}
  };
}

function correctionEnvelope(suffix,{assisted=false,rating='good',cardId='card-error'}={}){
  const envelope=buildCoreEvidenceEnvelope({
    card:{id:cardId,senseId:'sense-1',front:'durable',back:'bền',type:'word'},
    rating,
    step:{id:`error-correction-${suffix}`,kind:'typing',skill:'recall',receiptId:`error-receipt-${suffix}`},
    session:{id:`error-session-${suffix}`,mode:'repair',timezone:'UTC'},
    exposure:assisted?{correctionExposed:true}: {},
    now:2_000
  });
  return{...envelope,decision:decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification})};
}

test('duplicate occurrence delivery is idempotent while genuine recurrence increments totals',async()=>{
  const first=await errors.recordErrorOccurrence(occurrence('error-occurrence-1'));
  const duplicate=await errors.recordErrorOccurrence(occurrence('error-occurrence-1'));
  const recurrence=await errors.recordErrorOccurrence(occurrence('error-occurrence-2'));
  assert.equal(first.inserted,true);
  assert.equal(duplicate.inserted,false);
  assert.equal(recurrence.record.totalOccurrences,2);
  const occurrences=await errors.listErrorOccurrences(first.record.id);
  assert.equal(occurrences.length,2);
  assert.equal(occurrences.reduce((sum,row)=>sum+row.weight,0),recurrence.record.totalOccurrences);
});

test('only independent verified correction evidence resolves an error',async()=>{
  const base=await errors.recordErrorOccurrence(occurrence('error-occurrence-3',{cardId:'card-correction'}));
  const assisted=correctionEnvelope('assisted',{assisted:true,cardId:'card-correction'});
  const denied=await errors.recordCorrectionEvidence(base.record.id,assisted);
  assert.equal(denied.successful,false);
  assert.equal(denied.record.status,'monitoring');

  const eligible=correctionEnvelope('eligible',{cardId:'card-correction'});
  const resolved=await errors.recordCorrectionEvidence(base.record.id,eligible);
  assert.equal(resolved.successful,true);
  assert.equal(resolved.record.status,'resolved');

  const recurred=await errors.recordErrorOccurrence(occurrence('error-occurrence-4',{cardId:'card-correction'}));
  assert.equal(recurred.record.status,'monitoring');
});

test('source revisions do not collapse and legacy aliases remain traceable',async()=>{
  const oldRevision=await errors.importLegacyErrorRecord({...occurrence('legacy-error',{revision:'revision-old',weight:3}),id:'legacy-record-1'});
  const newRevision=await errors.recordErrorOccurrence(occurrence('error-occurrence-5',{revision:'revision-new'}));
  assert.notEqual(oldRevision.record.id,newRevision.record.id);
  assert.equal(oldRevision.record.totalOccurrences,3);
  assert.deepEqual(oldRevision.record.legacyAliases,['legacy-record-1']);
  assert.equal(oldRevision.occurrence.transcriptRevisionId,'revision-old');
});

test('repair queue is deterministic, exact-targeted and capped per target',async()=>{
  await errors.recordErrorOccurrence(occurrence('error-occurrence-6',{cardId:'card-queue'}));
  await errors.recordErrorOccurrence(occurrence('error-occurrence-7',{cardId:'card-queue',revision:'revision-2'}));
  await errors.recordErrorOccurrence(occurrence('error-occurrence-8',{cardId:'card-other'}));
  const first=await errors.composeRepairQueue({now:5_000,limit:10,perTargetCap:1});
  const second=await errors.composeRepairQueue({now:5_000,limit:10,perTargetCap:1});
  assert.deepEqual(second,first);
  assert.equal(first.filter(row=>row.target.cardId==='card-queue').length,1);
  assert.equal(first.every(row=>row.target.cardId&&row.target.skill&&row.target.sourceRevision),true);
});
