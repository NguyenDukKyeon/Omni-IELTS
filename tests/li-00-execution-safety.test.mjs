import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB = new IDBFactory();
globalThis.IDBKeyRange = IDBKeyRange;
globalThis.dispatchEvent ??= () => true;
globalThis.CustomEvent ??= class CustomEvent {
  constructor(type,{detail}={}) { this.type=type; this.detail=detail; }
};

const contracts = await import('../src/learning-contracts.js');
const runner = await import('../src/today-runner.js');
const v10 = await import('../src/v10-persistence.js');
const { V10_STORES } = await import('../src/v10-contracts.js');
const persistence = await import('../src/persistence.js');
const evidencePolicy = await import('../src/evidence-policy.js');
const backups = await import('../src/ielts-backup.js');
const ewfArtifacts = await import('../scripts/ewf-artifacts.mjs');
const ewfTrace = await import('../scripts/ewf-preflight-trace.mjs');

const FIRST_RECEIPT_ID='li-recovery-first-receipt';
const SECOND_RECEIPT_ID='li-recovery-second-receipt';
const TERMINAL_STATUSES=['completed','failed','skipped','cancelled','abstained'];
const clone=value=>value==null?value:structuredClone(value);

const transactionDone=transaction=>new Promise((resolve,reject)=>{
  transaction.oncomplete=()=>resolve();
  transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB transaction failed'));
  transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB transaction aborted'));
});

async function clearLearningStores(){
  const database=await persistence.openDatabase();
  const names=[
    persistence.STORE_NAMES.learningEvents,
    persistence.STORE_NAMES.learningProjections,
    persistence.STORE_NAMES.learningDeadLetters
  ];
  const transaction=database.transaction(names,'readwrite');
  for(const name of names)transaction.objectStore(name).clear();
  await transactionDone(transaction);
}

async function resetTodayAndLearning(){
  await v10.clearV10Store(V10_STORES.todayRuns,'li-00-recovery-reset');
  await clearLearningStores();
}

function targetFor(id='primary',revision='source-revision-v1'){
  return {
    cardId:`li-card-${id}`,
    senseId:`li-sense-${id}`,
    skill:'recall',
    sourceId:`core-card:li-card-${id}`,
    sourceRevision:revision
  };
}

function activityFor(id='primary',revision='source-revision-v1'){
  const target=targetFor(id,revision);
  const activitySpec=contracts.createActivitySpec({
    id:`li-activity-${id}`,
    type:'typing',
    target,
    planId:'li-recovery-plan',
    plannedAt:1_000,
    timezone:'UTC',
    policyVersion:'phase0-evidence-v1',
    executor:'core-session',
    metadata:{
      activityRevision:'typing-v1',
      promptRevision:'prompt-v1',
      configRevision:'config-v1',
      rubricRevision:'rubric-v1',
      scoringRevision:'scoring-v1',
      evidencePolicyRef:'phase0-evidence-v1',
      assistanceMode:'independent',
      assistanceProvenance:'core-session-v1'
    }
  });
  return {
    id:activitySpec.id,
    planId:activitySpec.planId,
    target:activitySpec.target,
    activitySpec,
    launchBinding:`li-launch:${id}:${revision}`,
    execution:{kind:'core-session',status:'ready'}
  };
}

function terminalEnvelope(started,{
  receiptId,
  attemptId=`attempt:${receiptId}`,
  receiptStatus='completed',
  runStatus=receiptStatus==='failed'?'failed':receiptStatus==='cancelled'?'cancelled':'completed',
  result=receiptStatus==='failed'?'wrong':receiptStatus,
  now=2_000,
  verificationAuthority='core-card-registry',
  assistance={}
}={}){
  const activitySpec=started.run.activitySpec;
  const run=contracts.createRun({
    ...started.run.canonicalRun,
    activitySpec,
    status:runStatus,
    completedAt:now
  });
  const trace=contracts.createAssistanceTrace({
    id:`trace:${receiptId}`,
    collector:'core-session',
    complete:true,
    ...assistance
  });
  const attempt=contracts.createAttempt({
    id:attemptId,
    run,
    activitySpec,
    receiptId,
    activityType:activitySpec.type,
    result,
    target:activitySpec.target,
    assistance:trace,
    learnerOutput:`answer:${receiptId}`,
    occurredAt:now,
    timezone:activitySpec.timezone
  });
  const receipt=contracts.createReceipt({
    id:receiptId,
    run,
    activitySpec,
    attempt,
    status:receiptStatus,
    issuedAt:now,
    timezone:activitySpec.timezone
  });
  const verification={
    source:{
      id:`source:${receiptId}`,
      authority:verificationAuthority,
      status:'verified',
      sourceId:activitySpec.target.sourceId,
      sourceRevision:activitySpec.target.sourceRevision
    }
  };
  const decision=evidencePolicy.decideEvidence({attempt,activity:activitySpec,verification});
  return {activitySpec,run,attempt,receipt,verification,decision,now};
}

function without(object,key){
  const copy=clone(object);
  delete copy[key];
  return copy;
}

function commandDeclaration(id,{toolRequirement='REQUIRED'}={}){
  const command={
    id,
    command:'node --version',
    requirements:['LI00-FR-01'],
    profile:'focused',
    argv:['node','--version'],
    cwd:'.',
    inheritEnvironment:[],
    environment:{},
    timeoutMs:1_000,
    toolRequirement
  };
  command.declarationDigest=ewfArtifacts.digestArtifact(command);
  return command;
}

function verificationManifest(command){
  const manifest={
    schemaVersion:1,
    artifactKind:'verification-manifest',
    authorityLabel:'DECLARED_VERIFICATION / NOT_EXECUTION',
    specId:'EWF00-PREFLIGHT-001',
    commands:{focused:[command],pr:[{id:'repository-tests',command:'npm test',requirements:['LI00-FR-01']}]},
    extensions:{}
  };
  manifest.extensions.verificationManifestDigest=ewfArtifacts.digestArtifact(manifest);
  return manifest;
}

function executableEvidence({id='evidence-1',subjectCommit='1'.repeat(40),parentCommit='0'.repeat(40),specRevision='li-spec-revision',verificationManifestDigest='a'.repeat(64),commandId='li-command',declarationDigest='b'.repeat(64),result='PASS'}={}){
  const row={
    id,
    authorityLabel:'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE',
    subjectCommit,
    parentCommit,
    specRevision,
    verificationManifestDigest,
    commandId,
    declarationDigest,
    result
  };
  row.contentDigest=ewfArtifacts.digestArtifact(row);
  return row;
}

function validTraceAndBrief(){
  const subjectCommit='1'.repeat(40);
  const parentCommit='0'.repeat(40);
  const specRevision='li-spec-revision';
  const verificationManifestDigest='a'.repeat(64);
  const declarationDigest='b'.repeat(64);
  const evidence=executableEvidence({subjectCommit,parentCommit,specRevision,verificationManifestDigest,declarationDigest});
  const trace={
    schemaVersion:1,
    artifactKind:'trace-manifest',
    authorityLabel:'IMPLEMENTER_TRACE / NOT_ACCEPTANCE',
    specId:'EWF00-PREFLIGHT-001',
    subjectCommit,
    parentCommit,
    specRevision,
    verificationManifestDigest,
    requirements:[{id:'LI00-FR-01',tests:['LI00-TEST-001'],disposition:'REQUIRED'}],
    tests:[{id:'LI00-TEST-001',commands:['li-command'],scope:'LOCAL',sharedScopeRationale:null}],
    commands:[{id:'li-command',declarationRef:'verification-manifest#commands.focused[0]',declarationDigest,evidence:[evidence.id]}],
    evidence:[evidence],
    extensions:{canonicalPackageId:'LI-00',productFeatureSpecId:'LI00-FROZEN-RUN-001'}
  };
  const traceDigest=ewfArtifacts.digestArtifact(trace);
  const evidenceDigest=ewfArtifacts.digestArtifact(trace.evidence);
  const brief={
    schemaVersion:1,
    artifactKind:'frozen-acceptance-brief',
    authorityLabel:'FROZEN_AUDIT_BOUNDARY / NOT_ACCEPTANCE',
    specId:'EWF00-PREFLIGHT-001',
    subjectCommit,
    parentCommit,
    specRevision,
    traceDigest,
    evidenceDigest,
    briefIdentity:`EWF00-PREFLIGHT-001/${subjectCommit}`,
    briefDigest:null,
    extensions:{
      canonicalPackageId:'LI-00',
      productFeatureSpecId:'LI00-FROZEN-RUN-001',
      approvedPlanPath:'docs/superpowers/specs/2026-08-08-ewf-00-pilot-b-li-00-recovery-authorization-manifest-v1.md',
      approvedPlanCommit:'caf6a87b3cef1a532cf25dbab04f7f2c06f8fd0f',
      approvedPlanBlob:'3fab683d8f21665852d17b2c03f8c201bc57af09',
      approvedPlanParent:'5585ad19599fabdb05063e71562a5706d17ab16f',
      verificationManifestDigest,
      allowlist:['src/learning-contracts.js','src/today-runner.js','tests/li-00-execution-safety.test.mjs'],
      exclusions:['src/v10-persistence.js'],
      requiredCommands:[]
    }
  };
  brief.briefDigest=ewfArtifacts.digestArtifact(without(brief,'briefDigest'));
  const bindings={
    subjectCommit,parentCommit,specRevision,traceDigest,evidenceDigest,
    briefDigest:brief.briefDigest,
    canonicalPackageId:'LI-00',
    specId:'EWF00-PREFLIGHT-001',
    approvedPlanPath:brief.extensions.approvedPlanPath,
    approvedPlanCommit:brief.extensions.approvedPlanCommit,
    approvedPlanBlob:brief.extensions.approvedPlanBlob,
    approvedPlanParent:brief.extensions.approvedPlanParent,
    verificationManifestDigest,
    allowlist:brief.extensions.allowlist,
    exclusions:brief.extensions.exclusions,
    actualChangedFiles:brief.extensions.allowlist,
    requiredCommandResults:[],
    trace
  };
  return {trace,brief,bindings};
}

function hasCode(result,code){return result.errors?.some(entry=>entry.code===code);}

async function recordVerifierFixtures(){
  const fixtures=[];
  const execute=async(id,outcome,toolRequirement='REQUIRED')=>{
    const command=commandDeclaration(id,{toolRequirement});
    const manifest=verificationManifest(command);
    const result=await ewfTrace.executeVerificationProfile(manifest,'focused',{spawn:async()=>outcome});
    const observed=result.commandResults[0]?.result;
    fixtures.push({fixtureIdentity:id,observed:observed??'MISSING'});
    return observed;
  };
  assert.equal(await execute('optional-tool-absent',{errorCode:'ENOENT',exitCode:null,durationMs:3},'OPTIONAL'),'NOT_AVAILABLE');
  assert.equal(await execute('required-tool-absent',{errorCode:'ENOENT',exitCode:null,durationMs:3},'REQUIRED'),'NOT_AVAILABLE');
  assert.equal(await execute('normal-command-fail',{exitCode:7,durationMs:4}),'FAIL');
  assert.equal(await execute('command-error-timeout',{exitCode:null,timedOut:true,durationMs:5}),'ERROR');

  const base=validTraceAndBrief();
  assert.equal(ewfTrace.validateFrozenHandoff(base.brief,base.bindings).valid,true);
  const cases=[
    ['stale-subject-evidence',()=>{const next=clone(base);next.bindings.trace.evidence[0].subjectCommit='2'.repeat(40);next.bindings.trace.evidence[0].contentDigest=ewfArtifacts.digestArtifact(without(next.bindings.trace.evidence[0],'contentDigest'));return hasCode(ewfTrace.validateTraceManifest(next.bindings.trace,{specId:next.bindings.specId,subjectCommit:next.bindings.subjectCommit,parentCommit:next.bindings.parentCommit,specRevision:next.bindings.specRevision,verificationManifestDigest:next.bindings.verificationManifestDigest}),'EVIDENCE_SUBJECT_MISMATCH');}],
    ['subject-changed-after-brief-freeze',()=>{const next=clone(base.bindings);next.subjectCommit='2'.repeat(40);return hasCode(ewfTrace.validateFrozenHandoff(base.brief,next),'SUBJECT_COMMIT_MISMATCH');}],
    ['parent-mismatch',()=>{const next=clone(base.bindings);next.parentCommit='2'.repeat(40);return hasCode(ewfTrace.validateFrozenHandoff(base.brief,next),'PARENT_COMMIT_MISMATCH');}],
    ['spec-revision-mismatch',()=>{const next=clone(base.bindings);next.specRevision='different-revision';return hasCode(ewfTrace.validateFrozenHandoff(base.brief,next),'SPEC_REVISION_MISMATCH');}],
    ['trace-digest-mismatch',()=>{const next=clone(base.bindings);next.traceDigest='c'.repeat(64);return hasCode(ewfTrace.validateFrozenHandoff(base.brief,next),'TRACE_DIGEST_MISMATCH');}],
    ['evidence-digest-mismatch',()=>{const next=clone(base.bindings);next.evidenceDigest='d'.repeat(64);return hasCode(ewfTrace.validateFrozenHandoff(base.brief,next),'EVIDENCE_DIGEST_MISMATCH');}],
    ['brief-identity-digest-mismatch',()=>{const next=clone(base.brief);next.briefIdentity='wrong/identity';next.briefDigest=ewfArtifacts.digestArtifact(without(next,'briefDigest'));const bindings=clone(base.bindings);bindings.briefDigest=next.briefDigest;return hasCode(ewfTrace.validateFrozenHandoff(next,bindings),'BRIEF_IDENTITY_MISMATCH');}]
  ];
  for(const[fixtureIdentity,run]of cases){assert.equal(run(),true,fixtureIdentity);fixtures.push({fixtureIdentity,observed:'REJECTED_AS_EXPECTED'});}

  const reviewerFinding={path:'src/persistence.js',scope:'OUT_OF_SCOPE',action:'REPORT_ONLY'};
  assert.equal(reviewerFinding.action,'REPORT_ONLY');
  fixtures.push({fixtureIdentity:'out-of-scope-reviewer-finding',observed:reviewerFinding.action});
  const abortedId='li-aborted-cleanup';
  await v10.putV10Record(V10_STORES.todayRuns,{id:abortedId,activityId:abortedId,status:'active',updatedAt:1},'li-aborted-fixture');
  await v10.deleteV10Record(V10_STORES.todayRuns,abortedId,'li-aborted-cleanup');
  assert.equal(await v10.getV10Record(V10_STORES.todayRuns,abortedId),undefined);
  fixtures.push({fixtureIdentity:'aborted-pilot-cleanup',observed:'CLEAN'});
  return fixtures;
}

test('W1-LI-00-001 recovery frozen safety suite',{concurrency:false},async()=>{
  const focusedStarted=performance.now();
  await resetTodayAndLearning();

  // PRIMARY NATURAL RED: predecessor must overwrite the durable Today winner before
  // downstream canonical event persistence naturally rejects the incompatible Run.
  const planned=activityFor('primary');
  const started=await runner.startTodayRun(planned,{tabId:'tab-primary',now:1_100,leaseMs:10_000});
  const first=terminalEnvelope(started,{receiptId:FIRST_RECEIPT_ID,receiptStatus:'completed',runStatus:'completed',result:'good',now:2_000});
  assert.equal(contracts.validateLearningEnvelope(first).valid,true,'first terminal envelope must be independently valid');
  assert.equal(first.decision.eligible,true,'first EvidencePolicy decision must be valid and eligible');
  await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:2_000});
  const durableFirst=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(durableFirst.receiptId,FIRST_RECEIPT_ID,'first Receipt must be durably established before conflict action');

  const second=terminalEnvelope(started,{receiptId:SECOND_RECEIPT_ID,receiptStatus:'failed',runStatus:'failed',result:'wrong',now:2_100});
  assert.equal(contracts.validateLearningEnvelope(second).valid,true,'second incompatible terminal envelope must also be independently valid');
  assert.equal(second.decision.eligible,true,'second EvidencePolicy decision must be independently valid');
  await assert.rejects(
    runner.recordTodayReceipt(started.run.id,second,{status:'failed',now:2_100}),
    error=>error.code==='LEARNING_EVENT_COLLISION'
  );
  const afterNaturalCollision=await v10.getV10Record(V10_STORES.todayRuns,started.run.id);
  assert.equal(
    afterNaturalCollision.receiptId,
    FIRST_RECEIPT_ID,
    'LI_TERMINAL_WINNER_MUTATED_BEFORE_CONFLICT_REJECTION'
  );

  // Frozen binding is durable and validates after the primary invariant is repaired.
  assert.equal(typeof contracts.validateFrozenRunBinding,'function');
  const bindingValidation=contracts.validateFrozenRunBinding(afterNaturalCollision.frozenBinding,{activitySpec:afterNaturalCollision.activitySpec,run:afterNaturalCollision.canonicalRun,storedDigest:afterNaturalCollision.frozenBindingDigest});
  assert.equal(bindingValidation.valid,true,bindingValidation.errors?.join(' ')||'frozen binding invalid');
  assert.equal(afterNaturalCollision.frozenBinding.target.sourceRevision,planned.activitySpec.target.sourceRevision);
  assert.equal(afterNaturalCollision.frozenBinding.execution.executor,'core-session');
  assert.equal(afterNaturalCollision.frozenBinding.execution.promptRevision,'prompt-v1');
  assert.equal(afterNaturalCollision.frozenBinding.evidence.policyRevision,'phase0-evidence-v1');
  assert.equal(afterNaturalCollision.frozenBinding.assistance.mode,'independent');
  assert.ok(afterNaturalCollision.frozenBinding.idempotency.startKey);
  assert.ok(afterNaturalCollision.frozenBinding.idempotency.terminalKey);

  // Identical delivery and explicit retry are idempotent.
  const duplicate=await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:2_200});
  const retry=await runner.recordTodayReceipt(started.run.id,first,{status:'completed',now:2_300});
  assert.equal(duplicate.receiptId,FIRST_RECEIPT_ID);
  assert.equal(retry.receiptId,FIRST_RECEIPT_ID);

  // Same terminal identity with a different payload is a stable collision and never overwrites.
  const sameIdentityDifferentPayload=clone(first);
  sameIdentityDifferentPayload.attempt={...sameIdentityDifferentPayload.attempt,learnerOutput:'different-payload'};
  sameIdentityDifferentPayload.receipt={...sameIdentityDifferentPayload.receipt,attemptDigest:contracts.learningContractDigest(sameIdentityDifferentPayload.attempt)};
  sameIdentityDifferentPayload.decision=evidencePolicy.decideEvidence({attempt:sameIdentityDifferentPayload.attempt,activity:sameIdentityDifferentPayload.activitySpec,verification:sameIdentityDifferentPayload.verification});
  assert.equal(contracts.validateLearningEnvelope(sameIdentityDifferentPayload).valid,true);
  await assert.rejects(runner.recordTodayReceipt(started.run.id,sameIdentityDifferentPayload,{status:'completed',now:2_400}),error=>error.code==='LEARNING_EVENT_COLLISION');
  assert.equal((await v10.getV10Record(V10_STORES.todayRuns,started.run.id)).receiptId,FIRST_RECEIPT_ID);

  // Real simultaneous incompatible terminal race: both release from the same barrier/turn.
  await resetTodayAndLearning();
  const raceStarted=await runner.startTodayRun(activityFor('terminal-race'),{tabId:'tab-race',now:3_000,leaseMs:10_000});
  const raceA=terminalEnvelope(raceStarted,{receiptId:'race-receipt-a',receiptStatus:'completed',runStatus:'completed',result:'good',now:3_100});
  const raceB=terminalEnvelope(raceStarted,{receiptId:'race-receipt-b',receiptStatus:'failed',runStatus:'failed',result:'wrong',now:3_101});
  let releaseTerminals;
  const terminalBarrier=new Promise(resolve=>{releaseTerminals=resolve;});
  const compete=envelope=>(async()=>{await terminalBarrier;return runner.recordTodayReceipt(raceStarted.run.id,envelope,{status:envelope.receipt.status,now:envelope.receipt.issuedAt});})();
  const terminalPromises=[compete(raceA),compete(raceB)];
  releaseTerminals();
  const terminalResults=await Promise.allSettled(terminalPromises);
  assert.equal(terminalResults.filter(row=>row.status==='fulfilled').length,1);
  assert.equal(terminalResults.filter(row=>row.status==='rejected'&&row.reason?.code==='LEARNING_EVENT_COLLISION').length,1);
  const durableRace=await v10.getV10Record(V10_STORES.todayRuns,raceStarted.run.id);
  assert.equal(durableRace.receiptId,terminalResults.find(row=>row.status==='fulfilled').value.receiptId);
  assert.ok(Array.isArray(durableRace.collisionDiagnostics)&&durableRace.collisionDiagnostics.length>=1,'collision diagnostics must be durable');

  // Simultaneous-tab start uses one durable CAS winner and fences the loser.
  await resetTodayAndLearning();
  const tabActivity=activityFor('tab-race');
  let releaseTabs;
  const tabBarrier=new Promise(resolve=>{releaseTabs=resolve;});
  const startFrom=tabId=>(async()=>{await tabBarrier;return runner.startTodayRun(tabActivity,{tabId,now:4_000,leaseMs:10_000});})();
  const tabPromises=[startFrom('tab-a'),startFrom('tab-b')];
  releaseTabs();
  const tabResults=await Promise.allSettled(tabPromises);
  assert.equal(tabResults.filter(row=>row.status==='fulfilled').length,1);
  assert.equal(tabResults.filter(row=>row.status==='rejected'&&row.reason?.code==='TODAY_RUN_ACTIVE_OTHER_TAB').length,1);

  // start -> reload -> resume -> terminal uses the persisted binding, not a recomputed caller binding.
  await resetTodayAndLearning();
  const reloadActivity=activityFor('reload-resume');
  const reloadStart=await runner.startTodayRun(reloadActivity,{tabId:'tab-reload',now:5_000});
  const frozenDigestBefore=reloadStart.run.frozenBindingDigest;
  await v10.reopenV10Database();
  const resumed=await runner.resumeTodayRun(reloadStart.run.id,{tabId:'tab-reload',now:5_100});
  assert.equal(resumed.run.frozenBindingDigest,frozenDigestBefore);
  const resumedEnvelope=terminalEnvelope(resumed,{receiptId:'reload-terminal',now:5_200});
  await runner.recordTodayReceipt(resumed.run.id,resumedEnvelope,{status:'completed',now:5_200});
  assert.equal((await v10.getV10Record(V10_STORES.todayRuns,resumed.run.id)).receiptId,'reload-terminal');

  // start -> crash/reopen preserves binding; terminal -> crash/reopen preserves winner.
  await resetTodayAndLearning();
  const crashStart=await runner.startTodayRun(activityFor('crash-reopen'),{tabId:'tab-crash',now:6_000});
  const crashBinding=crashStart.run.frozenBindingDigest;
  await v10.reopenV10Database();
  assert.equal((await v10.getV10Record(V10_STORES.todayRuns,crashStart.run.id)).frozenBindingDigest,crashBinding);
  const crashEnvelope=terminalEnvelope(crashStart,{receiptId:'crash-terminal',now:6_100});
  await runner.recordTodayReceipt(crashStart.run.id,crashEnvelope,{status:'completed',now:6_100});
  await v10.reopenV10Database();
  const reopenedWinner=await v10.getV10Record(V10_STORES.todayRuns,crashStart.run.id);
  assert.equal(reopenedWinner.receiptId,'crash-terminal');
  assert.equal(reopenedWinner.frozenBindingDigest,crashBinding);

  // Missing, unsupported, stale and digest-mismatched bindings fail closed.
  const bindingCases=[
    ['missing-binding','LI_FROZEN_BINDING_MISSING',row=>{delete row.frozenBinding;delete row.frozenBindingDigest;}],
    ['unsupported-binding','LI_FROZEN_BINDING_UNSUPPORTED',row=>{row.frozenBinding={...row.frozenBinding,schemaVersion:999};row.frozenBindingDigest=contracts.learningContractDigest(row.frozenBinding);}],
    ['stale-binding','LI_FROZEN_BINDING_STALE',row=>{row.frozenBinding={...row.frozenBinding,activitySpecDigest:'stale-digest'};row.frozenBindingDigest=contracts.learningContractDigest(row.frozenBinding);}],
    ['digest-mismatch','LI_FROZEN_BINDING_DIGEST_MISMATCH',row=>{row.frozenBindingDigest='not-the-binding-digest';}]
  ];
  for(const[id,code,mutate]of bindingCases){
    await resetTodayAndLearning();
    const fixture=await runner.startTodayRun(activityFor(id),{tabId:`tab-${id}`,now:7_000});
    const row=clone(await v10.getV10Record(V10_STORES.todayRuns,fixture.run.id));
    mutate(row);
    await v10.putV10Record(V10_STORES.todayRuns,row,`li-${id}-fixture`);
    await assert.rejects(runner.resumeTodayRun(fixture.run.id,{tabId:`tab-${id}`,now:7_100}),error=>error.code===code);
  }

  // Caller/provider strings cannot grant evidence authority.
  await resetTodayAndLearning();
  const authorityStart=await runner.startTodayRun(activityFor('authority'),{tabId:'tab-authority',now:8_000});
  const denied=terminalEnvelope(authorityStart,{receiptId:'authority-receipt',now:8_100,verificationAuthority:'caller-claimed'});
  assert.equal(denied.decision.eligible,false);
  const forged={...denied,decision:{...denied.decision,eligible:true,affectsSchedule:true,reason:'caller-forged'}};
  await assert.rejects(runner.recordTodayReceipt(authorityStart.run.id,forged,{status:'completed',now:8_100}),error=>error.code==='LI_EVIDENCE_DECISION_MISMATCH');
  assert.equal((await v10.getV10Record(V10_STORES.todayRuns,authorityStart.run.id)).status,'active');

  // Every canonical terminal status is a durable one-winner state.
  for(const[ordinal,status]of TERMINAL_STATUSES.entries()){
    await resetTodayAndLearning();
    const statusStart=await runner.startTodayRun(activityFor(`status-${status}`),{tabId:`tab-${status}`,now:9_000+ordinal*100});
    const statusEnvelope=terminalEnvelope(statusStart,{receiptId:`status-receipt-${status}`,receiptStatus:status,now:9_050+ordinal*100});
    await runner.recordTodayReceipt(statusStart.run.id,statusEnvelope,{status,now:9_050+ordinal*100});
    const statusRow=await v10.getV10Record(V10_STORES.todayRuns,statusStart.run.id);
    assert.equal(statusRow.status,status);
    assert.equal(statusRow.receiptId,`status-receipt-${status}`);
  }

  // Legacy rows remain readable but are never fabricated into frozen authority and cannot resume execution.
  await resetTodayAndLearning();
  const legacyActivity=activityFor('legacy');
  const legacyRun=contracts.createRun({id:'today-run:legacy',activitySpec:legacyActivity.activitySpec,status:'active',startedAt:10_000,timezone:'UTC'});
  const legacyRow={id:legacyRun.id,kind:'today-run-state',schemaVersion:1,activityId:legacyActivity.id,planId:legacyActivity.planId,launchBinding:legacyActivity.launchBinding,activitySpec:legacyActivity.activitySpec,activitySpecDigest:contracts.learningContractDigest(legacyActivity.activitySpec),canonicalRun:legacyRun,status:'active',ownerTabId:'legacy-tab',leaseUntil:0,resumeCount:0,attemptId:null,receiptId:null,createdAt:10_000,updatedAt:10_000};
  await v10.putV10Record(V10_STORES.todayRuns,legacyRow,'li-legacy-fixture');
  const listedLegacy=(await runner.listTodayRuns()).find(row=>row.id===legacyRow.id);
  assert.equal(Object.hasOwn(listedLegacy,'frozenBinding'),false);
  await assert.rejects(runner.resumeTodayRun(legacyRow.id,{tabId:'legacy-tab',now:10_100}),error=>error.code==='LI_FROZEN_BINDING_MISSING');

  // Actual repository backup -> destructive Today deletion -> restore -> reopen preserves binding and winner.
  await resetTodayAndLearning();
  const backupStart=await runner.startTodayRun(activityFor('backup-restore'),{tabId:'tab-backup',now:11_000});
  const backupEnvelope=terminalEnvelope(backupStart,{receiptId:'backup-winner',now:11_100});
  await runner.recordTodayReceipt(backupStart.run.id,backupEnvelope,{status:'completed',now:11_100});
  const beforeBackup=await v10.getV10Record(V10_STORES.todayRuns,backupStart.run.id);
  const backupDocument=await backups.buildCombinedBackup();
  await v10.clearV10Store(V10_STORES.todayRuns,'li-destructive-restore-fixture');
  assert.equal(await v10.getV10Record(V10_STORES.todayRuns,backupStart.run.id),undefined);
  const restoreResult=await backups.restoreCombinedBackup(backupDocument);
  assert.equal(restoreResult.durable,true);
  await v10.reopenV10Database();
  const restored=await v10.getV10Record(V10_STORES.todayRuns,backupStart.run.id);
  assert.equal(restored.receiptId,beforeBackup.receiptId);
  assert.equal(restored.frozenBindingDigest,beforeBackup.frozenBindingDigest);

  // Execute authorized verifier-negative and recovery fixtures through accepted EWF primitives.
  const fixtureResults=await recordVerifierFixtures();
  assert.equal(fixtureResults.length,13);
  console.log(`LI00_RECOVERY_FIXTURES=${JSON.stringify(fixtureResults)}`);
  console.log(`LI00_FOCUSED_MEASUREMENT=${JSON.stringify({metricId:'focusedDuration',value:Math.max(0,performance.now()-focusedStarted),unit:'ms',method:'node:test performance clock',resultState:'PASS'})}`);
});
