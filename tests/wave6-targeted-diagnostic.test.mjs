import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { projectWeaknessProfile,validateWeaknessProfile } from '../src/weakness-profile.js';
import { createQuestionRegistry,createIeltsLabOwnerAdapter,adaptIeltsLabItem } from '../src/question-activity-contracts.js';
import { createFrozenAssessmentRuntime } from '../src/frozen-assessment-runtime.js';
import { createFrozenAssessmentOwnerAdapter,reopenIeltsDatabase } from '../src/ielts-persistence.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { createCoreCardSourceAdapter } from '../src/source-revision-ref.js';

if(!globalThis.indexedDB)globalThis.indexedDB=new IDBFactory();

const loadTd=async()=>{try{return await import('../src/targeted-diagnostic.js');}catch(error){if(error?.code==='ERR_MODULE_NOT_FOUND')return null;throw error;}};
const tdModule=await loadTd();
const tdAvailable=Boolean(tdModule&&typeof tdModule.createTargetedDiagnosticAdapter==='function');

const card=Object.freeze({id:'td-card',senseId:'td-sense',front:'diagnostic',back:'chẩn đoán',type:'word',sourceVerified:true,rightsStatus:'allowed',privacy:'private',sourceProvenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'}});
const sourceAdapter=createCoreCardSourceAdapter({getCard:id=>id===card.id?card:null});
const sourceRef=sourceAdapter.createRef(card);

function makeLabItem(id,correct='a'){
  return{id,kind:'paraphrase',prompt:`Choose ${id}.`,context:'Controlled targeted practice.',options:[{id:'a',text:'A',correct:correct==='a',rationale:'private-a'},{id:'b',text:'B',correct:correct==='b',rationale:'private-b'}],sourceCardIds:[card.id],status:'verified',provenance:{status:'verified',verifiedBy:'fixture-reviewer'},createdAt:1,updatedAt:2};
}

const ITEM_SKILLS={
  r1:'reading',r2:'reading',r3:'reading',
  l1:'listening',l2:'listening',l3:'listening',
  w1:'writing',w2:'writing',
  s1:'speaking',s2:'speaking'
};
const shortQuestionId=id=>String(id||'').replace(/^qar:/,'');

function makeMetrics({bySkill,denominator=10}={}){
  const canonicalInputRefs=[];
  let refCount=0;
  const normalizedSkill={};
  for(const [skill,data] of Object.entries(bySkill)){
    const refs=[];
    const total=data.successful+data.unsuccessful;
    for(let i=0;i<total;i++){
      const ref={id:`event-${refCount}`,eventType:'receipt',eventDigest:`digest-${refCount}`,createdAt:1000+refCount};
      refs.push(ref);
      canonicalInputRefs.push(ref);
      refCount++;
    }
    refs.sort((a,b)=>`${a.id}\u0000${a.eventType}\u0000${a.eventDigest}\u0000${a.createdAt}`.localeCompare(`${b.id}\u0000${b.eventType}\u0000${b.eventDigest}\u0000${b.createdAt}`));
    normalizedSkill[skill]={...data,denominator:total,sourceRefs:refs};
  }
  canonicalInputRefs.sort((a,b)=>`${a.id}\u0000${a.eventType}\u0000${a.eventDigest}\u0000${a.createdAt}`.localeCompare(`${b.id}\u0000${b.eventType}\u0000${b.eventDigest}\u0000${b.createdAt}`));
  return{
    schemaVersion:1,
    reducerVersion:'p7-reducer-v1',
    inputDigest:'fnv1a64:metrics-test',
    denominator,
    canonicalInputRefs,
    bySkill:normalizedSkill,
    timeframe:{kind:'inclusive',startAt:1000,endAt:2000,timeZone:'UTC',calendarDays:1}
  };
}

function harness(){
  const labItems=[
    makeLabItem('r1','a'),
    makeLabItem('r2','b'),
    makeLabItem('r3','a'),
    makeLabItem('l1','a'),
    makeLabItem('l2','b'),
    makeLabItem('l3','a'),
    makeLabItem('w1','a'),
    makeLabItem('w2','b'),
    makeLabItem('s1','a'),
    makeLabItem('s2','b')
  ];
  const labOwner=createIeltsLabOwnerAdapter({readVerifiedItem:id=>labItems.find(row=>row.id===id)||null});
  const questions=labItems.map(it=>adaptIeltsLabItem(it,sourceRef,{ownerAdapter:labOwner}));
  const questionMap=new Map(questions.map(q=>[q.id,q]));
  const registry=createQuestionRegistry();
  registry.registerExecutor(questions[0].kind,questions[0].version,questions[0].requiredCapabilities);
  const ownerAdapter=createFrozenAssessmentOwnerAdapter();
  const resolveQuestion=binding=>questionMap.get(typeof binding==='string'?binding:binding?.questionId)||null;
  const runtime=createFrozenAssessmentRuntime({ownerAdapter,questionRegistry:registry,resolveQuestion});
  return{questions,questionMap,labItems,registry,runtime,ownerAdapter,resolveQuestion};
}

const questionIds=questions=>questions.map(q=>q.id);
const resolveSkill=id=>ITEM_SKILLS[shortQuestionId(id)]||'reading';

test('prerequisite WeaknessProfile, QAR and Frozen Assessment are healthy before Targeted Diagnostic capability is required',async()=>{
  const {questions,registry,runtime}=harness();
  const metrics=makeMetrics({
    bySkill:{
      reading:{successful:1,unsuccessful:3},
      listening:{successful:0,unsuccessful:4},
      writing:{successful:2,unsuccessful:0}
    },
    denominator:10
  });
  const profile=projectWeaknessProfile(metrics);
  assert.equal(validateWeaknessProfile(profile).valid,true,'WeaknessProfile prerequisite must be valid');
  assert.equal(registry.supports(questions[0]),true,'QAR registry must support question');
  const bp=await runtime.createBlueprint({
    id:'asm-td-prereq',
    title:'Prerequisite Assessment',
    purpose:'provider-off-practice-assessment',
    mode:'UNTIMED',
    profile:'academic',
    questions:[questions[0]],
    createdAt:100
  });
  assert.equal(bp?.id,'asm-td-prereq','Frozen Assessment runtime must create blueprint');
  assert.equal(tdAvailable,true,'Targeted Diagnostic adapter capability is absent');
});

test('Targeted Diagnostic adapter creates weakness-biased blueprint with at least 2 weak skills and 2 items per skill',async()=>{
  const {questions,questionMap,runtime}=harness();
  const {createTargetedDiagnosticAdapter}=tdModule||{};
  if(!createTargetedDiagnosticAdapter)return;
  const adapter=createTargetedDiagnosticAdapter({runtime,resolveQuestion:id=>questionMap.get(id)||null,resolveSkill});
  const metrics=makeMetrics({
    bySkill:{
      reading:{successful:1,unsuccessful:3},
      listening:{successful:0,unsuccessful:4},
      writing:{successful:2,unsuccessful:0}
    },
    denominator:10
  });
  const profile=projectWeaknessProfile(metrics);
  const blueprint=await adapter.createDiagnosticBlueprint({
    id:'diag-bp-1',
    title:'Targeted Weakness Diagnostic',
    profile,
    questionPool:questionIds(questions),
    at:100
  });

  assert.equal(blueprint.id,'diag-bp-1');
  assert.equal(blueprint.purpose,'provider-off-practice-assessment');
  assert.equal(blueprint.mode,'UNTIMED');
  assert.equal(blueprint.representative,false);
  assert.equal(blueprint.bandScore,null);
  assert.equal(blueprint.readiness,null);
  assert.equal(blueprint.mastery,null);
  assert.equal(blueprint.affectsSchedule,false);
  assert.equal(blueprint.evidenceEligible,false);
  assert.ok(blueprint.items.length>=4,'Must select at least 4 items (at least 2 per weak skill)');

  const selectedSkills=new Set();
  for(const item of blueprint.items){
    const skill=ITEM_SKILLS[shortQuestionId(item.questionId)];
    selectedSkills.add(skill);
  }
  assert.ok(selectedSkills.has('reading'),'Selected skills must include weak skill: reading');
  assert.ok(selectedSkills.has('listening'),'Selected skills must include weak skill: listening');
  assert.equal(selectedSkills.has('writing'),false,'Selected skills must not include strong skill: writing');
});

test('Targeted Diagnostic completes run atomically and computes factual non-claim aggregate',async()=>{
  const {questions,questionMap,runtime}=harness();
  const {createTargetedDiagnosticAdapter}=tdModule||{};
  if(!createTargetedDiagnosticAdapter)return;
  const adapter=createTargetedDiagnosticAdapter({runtime,resolveQuestion:id=>questionMap.get(id)||null,resolveSkill});
  const metrics=makeMetrics({
    bySkill:{
      reading:{successful:1,unsuccessful:3},
      listening:{successful:0,unsuccessful:4}
    },
    denominator:8
  });
  const profile=projectWeaknessProfile(metrics);
  const blueprint=await adapter.createDiagnosticBlueprint({
    id:'diag-bp-run',
    title:'Diagnostic Run',
    profile,
    questionPool:questionIds(questions),
    at:200
  });

  const run=await runtime.startRun({id:'diag-run-1',blueprintId:blueprint.id,at:210});
  assert.equal(run.id,'diag-run-1');
  assert.equal(run.status,'ACTIVE');

  const responses=blueprint.items.map((item,index)=>({
    ordinal:index+1,
    questionId:item.questionId,
    response:{optionId:'a'},
    at:220+index
  }));

  const completed=await runtime.completeRun({runId:run.id,responses,at:250});

  assert.equal(completed.status,'COMPLETED');
  assert.equal(completed.representative,false);
  assert.equal(completed.bandScore,null);
  assert.equal(completed.readiness,null);
  assert.equal(completed.mastery,null);
  assert.equal(completed.affectsSchedule,false);
  assert.equal(completed.evidenceEligible,false);
  assert.equal(completed.aggregate.itemCount,blueprint.items.length);
  assert.equal(completed.aggregate.answeredCount,blueprint.items.length);
  assert.equal(typeof completed.aggregate.numerator,'number');
  assert.equal(typeof completed.aggregate.denominator,'number');
});

test('Targeted Diagnostic rejects invalid profiles, insufficient data, or hostile accessor inputs',async()=>{
  const {questions,questionMap,runtime}=harness();
  const {createTargetedDiagnosticAdapter}=tdModule||{};
  if(!createTargetedDiagnosticAdapter)return;
  const adapter=createTargetedDiagnosticAdapter({runtime,resolveQuestion:id=>questionMap.get(id)||null,resolveSkill});

  await assert.rejects(
    adapter.createDiagnosticBlueprint({id:'fail-1',title:'Fake Profile',profile:{fake:true},questionPool:questionIds(questions),at:100}),
    error=>error.code==='INVALID_PROFILE'||error.code==='INVALID_INPUT'
  );

  const insufficientMetrics=makeMetrics({bySkill:{reading:{successful:0,unsuccessful:1},listening:{successful:0,unsuccessful:0}},denominator:1});
  const insufficientProfile=projectWeaknessProfile(insufficientMetrics);
  await assert.rejects(
    adapter.createDiagnosticBlueprint({id:'fail-2',title:'Insufficient Profile',profile:insufficientProfile,questionPool:questionIds(questions),at:100}),
    error=>error.code==='INSUFFICIENT_OBSERVATIONS'||error.code==='INVALID_PROFILE'||error.code==='INSUFFICIENT_DATA'
  );

  let hostileInvoked=false;
  const hostileInput={
    id:'hostile-bp',
    title:'Hostile Input',
    profile:projectWeaknessProfile(makeMetrics({bySkill:{reading:{successful:1,unsuccessful:3},listening:{successful:0,unsuccessful:4}},denominator:8})),
    questionPool:questionIds(questions),
    at:100,
    get clientSecret(){hostileInvoked=true;return'leaked-secret';}
  };
  await assert.rejects(adapter.createDiagnosticBlueprint(hostileInput),error=>error.code==='INVALID_INPUT'||error.code==='SAFETY_ERROR');
  assert.equal(hostileInvoked,false,'Hostile getters must not be invoked');
});

test('Targeted Diagnostic persists additively through Frozen Assessment store and backup',async()=>{
  const {questions,questionMap,runtime}=harness();
  const {createTargetedDiagnosticAdapter}=tdModule||{};
  if(!createTargetedDiagnosticAdapter)return;
  const adapter=createTargetedDiagnosticAdapter({runtime,resolveQuestion:id=>questionMap.get(id)||null,resolveSkill});
  const profile=projectWeaknessProfile(makeMetrics({bySkill:{reading:{successful:1,unsuccessful:3},listening:{successful:0,unsuccessful:4}},denominator:8}));
  const blueprint=await adapter.createDiagnosticBlueprint({id:'diag-bp-backup',title:'Backup Diagnostic',profile,questionPool:questionIds(questions),at:300});

  const run=await runtime.startRun({id:'diag-run-backup',blueprintId:blueprint.id,at:310});
  const responses=blueprint.items.map((item,index)=>({ordinal:index+1,questionId:item.questionId,response:{optionId:'a'},at:320+index}));
  const completed=await runtime.completeRun({runId:run.id,responses,at:330});

  const combined=await buildCombinedBackup();
  assert.equal(combined.schemaVersion,6);
  assert.equal(combined.registryVersion,6);

  await restoreCombinedBackup(combined);
  await reopenIeltsDatabase();

  assert.deepEqual(await runtime.getBlueprint('diag-bp-backup'),blueprint);
  assert.deepEqual(await runtime.getRun('diag-run-backup'),completed);
});
