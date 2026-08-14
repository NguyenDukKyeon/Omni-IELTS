import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { createCoreCardSourceAdapter } from '../src/source-revision-ref.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { IELTS_STORE_NAMES } from '../src/ielts-domain.js';

if(!globalThis.indexedDB)globalThis.indexedDB=new IDBFactory();

const qar=await import('../src/question-activity-contracts.js');
const persistence=await import('../src/ielts-persistence.js');
const loadAsm=async path=>{try{return await import(path);}catch(error){if(error?.code==='ERR_MODULE_NOT_FOUND')return null;throw error;}};
const contracts=await loadAsm('../src/frozen-assessment-contracts.js');
const assessment=await loadAsm('../src/frozen-assessment-runtime.js');

const card=Object.freeze({id:'asm-card',senseId:'asm-sense',front:'durable',back:'bền vững',type:'word',sourceVerified:true,rightsStatus:'allowed',privacy:'private',sourceProvenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'}});
const sourceAdapter=createCoreCardSourceAdapter({getCard:id=>id===card.id?card:null});
const sourceRef=sourceAdapter.createRef(card);
const item=(id,correct='a')=>({id,kind:'paraphrase',prompt:`Choose ${id}.`,context:'Controlled local provider-off practice.',options:[{id:'a',text:'A',correct:correct==='a',rationale:'private-a'},{id:'b',text:'B',correct:correct==='b',rationale:'private-b'}],sourceCardIds:[card.id],status:'verified',provenance:{status:'verified',verifiedBy:'fixture-reviewer'},createdAt:1,updatedAt:2});

function prerequisiteQuestions(){
  const first=item('asm-item-1','a'),second=item('asm-item-2','b');
  const owner=qar.createIeltsLabOwnerAdapter({readVerifiedItem:id=>[first,second].find(row=>row.id===id)||null});
  return [qar.adaptIeltsLabItem(first,sourceRef,{ownerAdapter:owner}),qar.adaptIeltsLabItem(second,sourceRef,{ownerAdapter:owner})];
}

const capabilityAvailable=Boolean(contracts&&assessment);

test('existing QAR and IELTS prerequisites are healthy before Frozen Assessment capability is required',async()=>{
  const questions=prerequisiteQuestions();
  const registry=qar.createQuestionRegistry();
  registry.registerExecutor(questions[0].kind,questions[0].version,['keyboard','focus','screen-reader']);
  assert.equal(registry.hasExecutor(questions[0].kind,questions[0].version),true,'existing QAR registry prerequisite must be healthy');
  const backup=await persistence.buildIeltsBackup();
  assert.ok(backup&&backup.stores,'existing IELTS persistence prerequisite must be healthy');
  assert.equal(capabilityAvailable,true,'dedicated durable Frozen Assessment owner plus authenticated immutable multi-item scoring snapshot is absent');
});

if(capabilityAvailable){
  function harness({changed=false}={}){
    const questions=prerequisiteQuestions();
    const registry=qar.createQuestionRegistry();
    registry.registerExecutor(questions[0].kind,questions[0].version,['keyboard','focus','screen-reader']);
    const ownerAdapter=persistence.createFrozenAssessmentOwnerAdapter();
    const runtime=assessment.createFrozenAssessmentRuntime({ownerAdapter,questionRegistry:registry,resolveQuestion:async binding=>{
      const question=questions.find(row=>row.id===binding.questionId);
      if(!question)return null;
      return changed?{...question,promptDigest:'changed'}:question;
    }});
    return {runtime,questions,ownerAdapter};
  }
  const blueprintInput=(questions,id='asm-blueprint')=>({id,profile:'Controlled local practice',questions,createdAt:10});
  const responses=(first='a',second='b')=>[{ordinal:1,response:{optionId:first}},{ordinal:2,response:{optionId:second}}];
  const assertNoClaims=value=>{
    assert.equal(value.representative,false);assert.equal(value.bandScore,null);assert.equal(value.readiness,null);assert.equal(value.mastery,null);assert.equal(value.affectsSchedule,false);assert.equal(value.evidenceEligible,false);
    const text=JSON.stringify(value);for(const secret of ['private-a','private-b','keyDigest','rubricDigest'])assert.equal(text.includes(secret),false);
  };

  test('Frozen Assessment creates an immutable authenticated multi-item blueprint and deterministic replay',async()=>{
    const {runtime,questions}=harness();
    const first=await runtime.createBlueprint(blueprintInput(questions));
    assert.deepEqual(await runtime.createBlueprint(blueprintInput(questions)),first);
    assert.equal(first.mode,'UNTIMED');assert.equal(first.purpose,'provider-off-practice-assessment');assert.equal(first.coverage.itemCount,2);assert.equal(Object.isFrozen(first),true);assertNoClaims(first);
    await assert.rejects(()=>runtime.createBlueprint({...blueprintInput(questions),profile:'Changed'}),error=>error.code==='FROZEN_ASSESSMENT_BLUEPRINT_COLLISION');
  });

  test('Frozen Assessment completes atomically, replays the winner and rejects changed terminal responses',async()=>{
    const {runtime,questions}=harness();await runtime.createBlueprint(blueprintInput(questions));await runtime.startRun({id:'asm-run',blueprintId:'asm-blueprint',at:20});
    const winner=await runtime.completeRun({runId:'asm-run',responses:responses(),at:30});
    assert.deepEqual(winner.aggregate,{numerator:2,denominator:2,answeredCount:2,itemCount:2});assertNoClaims(winner);
    assert.deepEqual(await runtime.completeRun({runId:'asm-run',responses:responses(),at:999}),winner);
    await assert.rejects(()=>runtime.completeRun({runId:'asm-run',responses:responses('b','b'),at:31}),error=>error.code==='FROZEN_ASSESSMENT_TERMINAL_CONFLICT');
  });

  test('invalid response sets and changed QAR bindings fail before terminal mutation',async()=>{
    const {runtime,questions}=harness();await runtime.createBlueprint(blueprintInput(questions,'asm-invalid'));await runtime.startRun({id:'asm-invalid-run',blueprintId:'asm-invalid',at:40});
    await assert.rejects(()=>runtime.completeRun({runId:'asm-invalid-run',responses:[{ordinal:1,response:{optionId:'a'}}],at:41}),error=>error.code==='FROZEN_ASSESSMENT_INCOMPLETE');
    assert.equal((await runtime.getRun('asm-invalid-run')).status,'ACTIVE');
    const changed=harness({changed:true}).runtime;await assert.rejects(()=>changed.completeRun({runId:'asm-invalid-run',responses:responses(),at:42}));
    assert.equal((await runtime.getRun('asm-invalid-run')).status,'ACTIVE');
  });

  test('Frozen Assessment persists additively through standalone v4 and combined v6 backup restore/reopen',async()=>{
    const {runtime,questions}=harness();await runtime.createBlueprint(blueprintInput(questions,'asm-backup'));await runtime.startRun({id:'asm-backup-run',blueprintId:'asm-backup',at:50});const result=await runtime.completeRun({runId:'asm-backup-run',responses:responses(),at:51});
    const standalone=await persistence.buildIeltsBackup();assert.equal(standalone.schemaVersion,4);assert.ok(Array.isArray(standalone.stores[IELTS_STORE_NAMES.frozenAssessments]));
    const combined=await buildCombinedBackup();assert.equal(combined.schemaVersion,6);assert.equal(combined.registryVersion,6);
    await restoreCombinedBackup(combined);await persistence.reopenIeltsDatabase();assert.deepEqual(await runtime.getRun('asm-backup-run'),result);
  });

  test('Frozen Assessment rejects hostile accessor/cycle/symbol/private-shaped input without invoking accessors',async()=>{
    const {runtime,questions}=harness();let reads=0;const accessor=blueprintInput(questions,'hostile-accessor');Object.defineProperty(accessor,'id',{enumerable:true,get(){reads+=1;throw new Error('must not run');}});
    await assert.rejects(()=>runtime.createBlueprint(accessor),error=>error.code==='FROZEN_ASSESSMENT_INVALID_INPUT');assert.equal(reads,0);
    const cyclic=blueprintInput(questions,'hostile-cycle');cyclic.self=cyclic;await assert.rejects(()=>runtime.createBlueprint(cyclic),error=>error.code==='FROZEN_ASSESSMENT_INVALID_INPUT');
    const symbolic=blueprintInput(questions,'hostile-symbol');symbolic[Symbol('x')]='x';await assert.rejects(()=>runtime.createBlueprint(symbolic),error=>error.code==='FROZEN_ASSESSMENT_INVALID_INPUT');
    const secret=blueprintInput(questions,'hostile-secret');secret.clientSecret='x';await assert.rejects(()=>runtime.createBlueprint(secret),error=>error.code==='FROZEN_ASSESSMENT_INVALID_INPUT');
  });
}
