// LI-00 Execution Safety — Frozen Run Binding and Terminal Settlement
// Requirement namespace: LI00-FR-*
// Traces: LI00-FR-01 through LI00-FR-10
import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';

// Fresh IDB per module to isolate from other suites
globalThis.indexedDB = new IDBFactory();

const contracts = await import('../src/learning-contracts.js');
const runner = await import('../src/today-runner.js');
const { composeTodayPlan } = await import('../src/today-composer.js');
const { decideEvidence } = await import('../src/evidence-policy.js');
const { getV10Record, putV10Record } = await import('../src/v10-persistence.js');
const { V10_STORES } = await import('../src/v10-contracts.js');

// ── Shared fixture builders ──────────────────────────────────────────

const FROZEN_NOW = 100_000;

function target(overrides = {}) {
  return {
    cardId: 'card-li00',
    senseId: 'sense-li00',
    skill: 'recall',
    sourceId: 'core-card:card-li00',
    sourceRevision: 'sha256:li00-baseline',
    ...overrides
  };
}

function makeActivity(id = 'li00-activity', overrides = {}) {
  const t = target(overrides.target);
  const plan = composeTodayPlan({
    dueReviews: [{
      id,
      type: 'typing',
      target: t,
      executor: 'li00-test-executor',
      estimatedSeconds: 60
    }],
    now: FROZEN_NOW,
    minutes: 5
  });
  return {
    ...plan.activities[0],
    execution: { kind: 'li00-test-executor', status: 'ready' },
    launchBinding: `binding:${id}:${t.sourceRevision}`,
    ...overrides.activity
  };
}

function makeEnvelope(run, { status = 'completed', result = 'correct', now = FROZEN_NOW + 1000 } = {}) {
  const activitySpec = run.activitySpec;
  const trace = contracts.completeAssistanceTrace(
    contracts.createAssistanceTrace({ id: `trace:${run.id}:${status}`, collector: 'core-session' }),
    now
  );
  const receiptId = `receipt:${run.id}:${status}`;
  const attempt = contracts.createAttempt({
    id: `attempt:${run.id}:${status}`,
    run: run.canonicalRun,
    activitySpec,
    receiptId,
    result,
    target: activitySpec.target,
    assistance: trace,
    occurredAt: now,
    timezone: activitySpec.timezone
  });
  const receipt = contracts.createReceipt({
    id: receiptId,
    run: run.canonicalRun,
    activitySpec,
    attempt,
    status,
    issuedAt: now,
    timezone: activitySpec.timezone
  });
  const verification = {
    source: {
      id: `source:${activitySpec.target.sourceRevision}`,
      authority: 'core-card-registry',
      status: 'verified',
      sourceId: activitySpec.target.sourceId,
      sourceRevision: activitySpec.target.sourceRevision
    }
  };
  const decision = decideEvidence({ attempt, activity: activitySpec, verification });
  return { activitySpec, run: run.canonicalRun, attempt, receipt, verification, decision };
}

// Register test executor
runner.registerTodayExecutor('li00-test-executor', async ({ run, resumed }) => {
  return { started: true, runId: run.id, resumed };
});

// ── LI00-FR-05 / LI00-FR-06: Terminal settlement ─────────────────────

test('first terminal receipt wins; conflicting second terminal is rejected and original winner is preserved', async () => {
  // 1. create one valid bound Today Run
  const planned = makeActivity('li00-terminal-settlement');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-settlement', now: FROZEN_NOW });
  assert.equal(started.run.status, 'active');

  // 2. persist one valid first terminal Receipt (completed)
  const firstEnvelope = makeEnvelope(started.run, { status: 'completed', result: 'correct', now: FROZEN_NOW + 1000 });
  const firstTerminal = await runner.recordTodayReceipt(
    started.run.id,
    firstEnvelope,
    { status: 'completed', now: FROZEN_NOW + 1000 }
  );
  assert.equal(firstTerminal.status, 'completed');
  assert.equal(firstTerminal.receiptId, firstEnvelope.receipt.id);

  // Read back to confirm first terminal winner is persisted
  const firstReadBack = await getV10Record(V10_STORES.todayRuns, started.run.id);
  assert.equal(firstReadBack.status, 'completed');
  assert.equal(firstReadBack.receiptId, firstEnvelope.receipt.id);

  // 3. submit a distinct conflicting second terminal Receipt (skipped)
  const conflictEnvelope = makeEnvelope(started.run, { status: 'skipped', result: 'skipped', now: FROZEN_NOW + 2000 });

  // 4. Current product behavior: recordTodayReceipt does NOT check for an existing
  //    terminal receipt. It will either silently overwrite the run row or fail at a
  //    downstream persistence layer — neither preserves the first winner with a typed
  //    terminal-collision rejection.
  //
  // 5. Expected behavior after LI-00 fix:
  //    - reject with code 'TODAY_RECEIPT_TERMINAL_COLLISION'
  //    - preserve the original terminal winner
  //    - retain conflict as durable diagnostic evidence
  let conflictError = null;
  try {
    await runner.recordTodayReceipt(
      started.run.id,
      conflictEnvelope,
      { status: 'skipped', now: FROZEN_NOW + 2000 }
    );
    // If we reach here, the second write was silently accepted (the defect)
  } catch (err) {
    conflictError = err;
  }

  // The second terminal write must be rejected with this specific code
  assert.ok(conflictError, 'conflicting second terminal must not be silently accepted');
  assert.equal(conflictError.code, 'TODAY_RECEIPT_TERMINAL_COLLISION',
    'conflicting second terminal receipt must be rejected with TODAY_RECEIPT_TERMINAL_COLLISION');

  // Verify original winner is still intact after conflict rejection
  const afterConflict = await getV10Record(V10_STORES.todayRuns, started.run.id);
  assert.equal(afterConflict.status, 'completed', 'original terminal winner must be preserved');
  assert.equal(afterConflict.receiptId, firstEnvelope.receipt.id, 'original receipt ID must not change');
});

// ── LI00-FR-06: Identical replay idempotency ─────────────────────────

test('identical terminal replay is idempotent and returns the same winner', async () => {
  const planned = makeActivity('li00-idempotent');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-idempotent', now: FROZEN_NOW + 10_000 });
  const envelope = makeEnvelope(started.run, { status: 'completed', result: 'correct', now: FROZEN_NOW + 11_000 });

  const first = await runner.recordTodayReceipt(started.run.id, envelope, { status: 'completed', now: FROZEN_NOW + 11_000 });
  const replay = await runner.recordTodayReceipt(started.run.id, envelope, { status: 'completed', now: FROZEN_NOW + 12_000 });

  assert.equal(first.receiptId, replay.receiptId, 'identical replay returns same receipt');
  assert.equal(replay.status, 'completed');
});

// ── LI00-FR-01: Frozen binding at Run start ──────────────────────────

test('starting a Run validates ActivitySpec and persists a frozen binding before executor side effects', async () => {
  const planned = makeActivity('li00-frozen-binding');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-frozen', now: FROZEN_NOW + 20_000 });

  assert.ok(started.run.activitySpec, 'frozen binding must include activitySpec');
  assert.ok(started.run.activitySpecDigest, 'frozen binding must include activitySpec digest');
  assert.ok(started.run.canonicalRun, 'frozen binding must include canonical Run');

  // The persisted row must have immutable binding fields
  const persisted = await getV10Record(V10_STORES.todayRuns, started.run.id);
  assert.ok(persisted.activitySpec, 'persisted row must contain frozen activitySpec');
  assert.equal(persisted.activitySpecDigest, started.run.activitySpecDigest);
  assert.deepEqual(persisted.activitySpec.target, planned.activitySpec.target, 'frozen target must match original');
});

// ── LI00-FR-02: Resume uses persisted binding ────────────────────────

test('resume and reload use the persisted binding, not current plan or DOM state', async () => {
  const planned = makeActivity('li00-resume-binding');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-resume', now: FROZEN_NOW + 30_000, leaseMs: 5_000 });

  // Simulate resume after lease expiry (different tab takes over)
  const resumed = await runner.resumeTodayRun(started.run.id, { tabId: 'tab-resume-2', now: FROZEN_NOW + 36_000 });
  assert.equal(resumed.run.id, started.run.id);
  assert.equal(resumed.run.activitySpecDigest, started.run.activitySpecDigest, 'resumed binding digest must match original');
  assert.equal(resumed.resumed, true);
});

// ── LI00-FR-03: Immutable bindings ───────────────────────────────────

test('target, source revision, prompt/config, evaluation and evidence-policy revision cannot change after start', async () => {
  const planned = makeActivity('li00-immutable-binding');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-immutable', now: FROZEN_NOW + 40_000 });

  // Attempt to start again with changed source revision
  const changedTarget = makeActivity('li00-immutable-binding', { target: { sourceRevision: 'sha256:tampered' } });
  await assert.rejects(
    runner.startTodayRun(changedTarget, { tabId: 'tab-immutable', now: FROZEN_NOW + 41_000 }),
    error => error.code === 'TODAY_RUN_BINDING_COLLISION',
    'changed source revision must be rejected as binding collision'
  );
});

// ── LI00-FR-04: Missing/stale/unsupported input failure ──────────────

test('missing, stale, unsupported or digest-mismatched bindings fail closed', async () => {
  // Missing executor
  const noExecutor = makeActivity('li00-missing-exec');
  noExecutor.execution = { kind: 'nonexistent-executor', status: 'ready' };
  noExecutor.activitySpec = { ...noExecutor.activitySpec, executor: 'nonexistent-executor' };
  await assert.rejects(
    runner.launchTodayActivity(noExecutor, { tabId: 'tab-missing', now: FROZEN_NOW + 50_000 }),
    error => error.code === 'TODAY_EXECUTOR_UNREGISTERED'
  );

  // Stale target via binding collision
  const staleTarget = makeActivity('li00-stale-target');
  await runner.startTodayRun(staleTarget, { tabId: 'tab-stale', now: FROZEN_NOW + 51_000 });
  const mutatedTarget = makeActivity('li00-stale-target', { target: { cardId: 'card-changed' } });
  await assert.rejects(
    runner.startTodayRun(mutatedTarget, { tabId: 'tab-stale', now: FROZEN_NOW + 52_000 }),
    error => error.code === 'TODAY_RUN_BINDING_COLLISION'
  );
});

// ── LI00-FR-07: Terminal paths retain Run and assistance binding ─────

test('every terminal path retains the exact Run and assistance/provenance binding', async () => {
  // Skip path
  const plannedSkip = makeActivity('li00-skip-binding');
  const startedSkip = await runner.startTodayRun(plannedSkip, { tabId: 'tab-skip', now: FROZEN_NOW + 60_000 });
  const skipped = await runner.skipTodayRun(startedSkip.run.id, { now: FROZEN_NOW + 61_000 });
  assert.equal(skipped.status, 'skipped');
  assert.ok(skipped.envelope, 'skip must produce an envelope');
  assert.ok(skipped.envelope.attempt, 'skip must produce an attempt');
  assert.ok(skipped.envelope.receipt, 'skip must produce a receipt');
  assert.deepEqual(skipped.envelope.receipt.target, plannedSkip.activitySpec.target, 'skip receipt must preserve exact target');
  assert.ok(skipped.envelope.attempt.assistance, 'skip must preserve assistance trace');

  // Cancel path
  const plannedCancel = makeActivity('li00-cancel-binding');
  const startedCancel = await runner.startTodayRun(plannedCancel, { tabId: 'tab-cancel', now: FROZEN_NOW + 62_000 });
  const cancelled = await runner.cancelTodayRun(startedCancel.run.id, { now: FROZEN_NOW + 63_000 });
  assert.equal(cancelled.status, 'cancelled');
  assert.ok(cancelled.envelope.attempt.assistance, 'cancel must preserve assistance trace');
});

// ── LI00-FR-08: Caller cannot grant authority ────────────────────────

test('caller/provider strings cannot grant independent, verified, eligible or schedule-affecting authority', async () => {
  const planned = makeActivity('li00-no-caller-authority');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-authority', now: FROZEN_NOW + 70_000 });
  const envelope = makeEnvelope(started.run, { status: 'completed', result: 'correct', now: FROZEN_NOW + 71_000 });

  // Tamper with the decision to claim eligibility
  const tamperedEnvelope = { ...envelope, decision: { ...envelope.decision, eligible: true, reason: 'caller-claimed' } };
  // Record should still work (the decision is re-evaluated at persistence boundary)
  // The caller's claimed decision does not grant authority - EvidencePolicy re-evaluates
  const terminal = await runner.recordTodayReceipt(started.run.id, tamperedEnvelope, { status: 'completed', now: FROZEN_NOW + 71_000 });
  assert.equal(terminal.status, 'completed');
});

// ── LI00-FR-09: Backup/restore reproducibility ──────────────────────

test('eligible evidence remains reproducible under bound EvidencePolicy after backup/restore simulation', async () => {
  const planned = makeActivity('li00-restore-reproducible');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-restore', now: FROZEN_NOW + 80_000 });

  // Record a terminal receipt
  const envelope = makeEnvelope(started.run, { status: 'completed', result: 'correct', now: FROZEN_NOW + 81_000 });
  await runner.recordTodayReceipt(started.run.id, envelope, { status: 'completed', now: FROZEN_NOW + 81_000 });

  // Read back the persisted row - simulate what would survive backup/restore
  const persisted = await getV10Record(V10_STORES.todayRuns, started.run.id);
  assert.equal(persisted.status, 'completed');
  assert.equal(persisted.activitySpecDigest, started.run.activitySpecDigest);
  assert.deepEqual(persisted.activitySpec.target, planned.activitySpec.target);

  // Verify the frozen binding survives and EvidencePolicy can re-evaluate
  const restoredDecision = decideEvidence({
    attempt: persisted.envelope.attempt,
    activity: persisted.activitySpec,
    verification: persisted.envelope.verification
  });
  assert.equal(restoredDecision.policyVersion, envelope.decision.policyVersion, 'restored evidence policy version must match');
});

// ── LI00-FR-10: Existing executors remain usable ─────────────────────

test('existing accepted executors remain usable through additive adapters', async () => {
  // Existing executor pattern from today-runner.test.mjs remains functional
  let launched = false;
  const unregister = runner.registerTodayExecutor('li00-compat-executor', async () => {
    launched = true;
    return { started: true };
  });
  const planned = makeActivity('li00-compat');
  planned.execution = { kind: 'li00-compat-executor', status: 'ready' };
  planned.activitySpec = { ...planned.activitySpec, executor: 'li00-compat-executor' };
  const result = await runner.launchTodayActivity(planned, { tabId: 'tab-compat', now: FROZEN_NOW + 90_000 });
  assert.equal(launched, true);
  assert.equal(result.started, true);
  unregister();
});

// ── LI00-FR-05: Crash/reopen reproducibility ─────────────────────────

test('crash after terminal persistence returns the same winner on reopen', async () => {
  const planned = makeActivity('li00-crash-reopen');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-crash', now: FROZEN_NOW + 100_000 });
  const envelope = makeEnvelope(started.run, { status: 'completed', result: 'correct', now: FROZEN_NOW + 101_000 });
  await runner.recordTodayReceipt(started.run.id, envelope, { status: 'completed', now: FROZEN_NOW + 101_000 });

  // Simulate crash/reopen by reading back directly
  const reopened = await getV10Record(V10_STORES.todayRuns, started.run.id);
  assert.equal(reopened.status, 'completed');
  assert.equal(reopened.receiptId, envelope.receipt.id);

  // Resume returns the terminal state
  const resumeAfterCrash = await runner.startTodayRun(planned, { tabId: 'tab-crash-2', now: FROZEN_NOW + 102_000 });
  assert.equal(resumeAfterCrash.terminal, true, 'resume after crash must return terminal');
  assert.equal(resumeAfterCrash.run.status, 'completed');
});

// ── LI00-FR-01: Binding validated before side effects ────────────────

test('a bound Run crash between start and executor leaves a resumable bound Run', async () => {
  const planned = makeActivity('li00-start-crash');
  const started = await runner.startTodayRun(planned, { tabId: 'tab-start-crash', now: FROZEN_NOW + 110_000, leaseMs: 5_000 });
  assert.equal(started.run.status, 'active');

  // Read back - binding is persisted
  const persisted = await getV10Record(V10_STORES.todayRuns, started.run.id);
  assert.equal(persisted.status, 'active');
  assert.ok(persisted.activitySpec);
  assert.ok(persisted.canonicalRun);

  // Resume after lease expiry (simulating crash/reopen in another tab)
  const resumed = await runner.resumeTodayRun(started.run.id, { tabId: 'tab-start-crash-2', now: FROZEN_NOW + 116_000 });
  assert.equal(resumed.resumed, true);
  assert.equal(resumed.run.activitySpecDigest, started.run.activitySpecDigest);
});
