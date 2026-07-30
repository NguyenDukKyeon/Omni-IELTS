import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory,IDBKeyRange } from 'fake-indexeddb';
import { CAPTURE_SOURCE_TYPES,createCaptureItem,transitionCaptureItem } from '../src/capture-domain.js';

globalThis.indexedDB=new IDBFactory();
globalThis.IDBKeyRange=IDBKeyRange;
globalThis.dispatchEvent=()=>true;
globalThis.CustomEvent??=class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};

const core=await import('../src/persistence.js');
const v10=await import('../src/v10-persistence.js');
const { V10_STORES }=await import('../src/v10-contracts.js');
const lexical=await import('../src/lexical-core-v2.js');

await core.initializePersistence();
await v10.initializeV10Persistence();
globalThis.VocabMasterApp={getState:()=>core.getCurrentState()};

function completeInput(sourceType,id=sourceType){
  return{
    id:`capture-${id}`,
    term:`term ${id}`,
    proposedMeaning:`meaning ${id}`,
    sourceOccurrence:{id:`occurrence-${id}`,sourceType,sourceId:`source-${id}`,context:`context ${id}`,verified:true},
    provenance:{source:'manual',confirmedByUser:true},
    createdAt:100,
    updatedAt:100
  };
}

test('every supported capture source uses the same quality gate and ready state',()=>{
  for(const sourceType of CAPTURE_SOURCE_TYPES){
    const item=createCaptureItem(completeInput(sourceType));
    assert.equal(item.kind,'capture-item');
    assert.equal(item.quality.eligible,true,sourceType);
    assert.equal(item.status,'ready',sourceType);
    assert.match(item.finalizeKey,/^capture-finalize:/);
  }
  const incomplete=createCaptureItem({id:'capture-incomplete',term:'term',sourceOccurrence:{sourceType:'video',sourceId:'video-1'}});
  assert.equal(incomplete.status,'captured');
  assert.deepEqual(new Set(incomplete.quality.issues),new Set(['missing-meaning','missing-source-context']));
});

test('CaptureItem state transitions and oversized imports fail closed',()=>{
  const ready=createCaptureItem(completeInput('import','state'));
  const finalizing=transitionCaptureItem(ready,'finalizing');
  assert.equal(transitionCaptureItem(finalizing,'linked').status,'linked');
  assert.throws(()=>transitionCaptureItem(ready,'linked'),error=>error.code==='CAPTURE_STATE_TRANSITION_INVALID');
  const oversized=createCaptureItem({...completeInput('import','oversized'),term:'x'.repeat(241)});
  assert.equal(oversized.quality.eligible,false);
  assert.ok(oversized.quality.issues.includes('term-too-long'));
  assert.throws(()=>transitionCaptureItem(oversized,'finalizing'),error=>error.code==='CAPTURE_STATE_TRANSITION_INVALID'||error.code==='CAPTURE_QUALITY_GATE_FAILED');
});

test('finalize creates exact card, occurrence and linked candidate once',async()=>{
  const candidate=await lexical.captureLexicalCandidate(completeInput('video','finalize-once'));
  const first=await lexical.finalizeCaptureCandidate(candidate.id,{action:'create'});
  const duplicate=await lexical.finalizeCaptureCandidate(candidate.id,{action:'create'});
  const cards=core.getCurrentState().cards.filter(card=>card.id===`capture-card:${candidate.id}`);
  const occurrences=await lexical.listSourceOccurrences(first.card.id);
  assert.equal(first.intent.status,'completed');
  assert.equal(duplicate.intent.status,'completed');
  assert.equal(cards.length,1);
  assert.equal(occurrences.length,1);
  assert.equal(duplicate.candidate.status,'linked');
  assert.equal(duplicate.candidate.duplicateOfCardId,first.card.id);
});

test('finalize resumes after a crash without duplicate card or occurrence',async()=>{
  const candidate=await lexical.captureLexicalCandidate(completeInput('reading','resume'));
  let crashed=false;
  await assert.rejects(
    lexical.finalizeCaptureCandidate(candidate.id,{
      action:'create',
      hooks:{afterAction:({stepId})=>{if(!crashed&&stepId==='ensure-card'){crashed=true;throw Object.assign(new Error('simulated crash'),{code:'SIMULATED_PROCESS_CRASH'});}}}
    }),
    error=>error.code==='SIMULATED_PROCESS_CRASH'
  );
  const resumed=await lexical.finalizeCaptureCandidate(candidate.id,{action:'create'});
  assert.equal(resumed.intent.status,'completed');
  assert.equal(core.getCurrentState().cards.filter(card=>card.id===resumed.card.id).length,1);
  assert.equal((await lexical.listSourceOccurrences(resumed.card.id)).length,1);
  assert.equal((await v10.listV10Records(V10_STORES.workflowIntents,{sortBy:null})).filter(row=>row.id===`capture-finalize:${candidate.id}`).length,1);
});
