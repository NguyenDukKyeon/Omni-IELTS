import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ACCEPTANCE_FIXTURE,
  ACCEPTANCE_FIXTURE_DIGEST,
  AUTHORIZATION_ID,
  AUTHORIZATION_SUBJECT,
  AUTHORIZATION_VERDICT_COMMENT_ID,
  CHILD_ENV_POLICY,
  COMMAND_RESULTS,
  EVIDENCE_AUTHORITY,
  EXECUTION_CONTAINER_DIGEST,
  IMPLEMENTATION_PATHS,
  LI_DECLARATIONS,
  METRIC_DEFINITIONS,
  METRIC_RESULT_STATES,
  OPERATION_DEFINITION_REVISION,
  PREDECESSOR,
  RAW_EVIDENCE_FORMAT_REVISION,
  SAT_ATTEMPT_ID,
  SPEC_REVISION,
  EwfMeasurementError,
  assertAuthorizedCommandManifest,
  assertNoAcceptanceAuthority,
  assertSafeDeclarations,
  buildArtifactManifest,
  buildChildEnvironment,
  buildVerificationManifest,
  canonicalize,
  classifySupersession,
  computeControlledEnvironmentFingerprint,
  computeJournalDigest,
  executeAcceptanceFixture,
  sha256,
  validateBaselineTemporalGate,
  validateControlledPair,
  validateJournalAndSeal,
  validateMetricObservations,
  validateProductImmutability,
  validateRequest,
  validateWorkflowContract,
} from '../scripts/ewf-measurement-executor.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const workflowPath = join(repoRoot, '.github', 'workflows', 'ewf-measurement.yml');

const B = 'b'.repeat(40);
const R = 'c'.repeat(40);
const PILOT = 'd'.repeat(40);
const WORKFLOW_DIGEST = '1'.repeat(64);
const EXECUTOR_DIGEST = '2'.repeat(64);
const REQUEST_PATH = `docs/superpowers/measurement-requests/ewf00-measure-exec-001-auth-001-sat-001-${B}.json`;

function commandManifestDigest(manifest = ACCEPTANCE_FIXTURE.runtimeCases) {
  return sha256(canonicalize(manifest));
}

function satRequest(overrides = {}) {
  return {
    schemaVersion: 'EWF00_MEASURE_EXEC_REQUEST_V1',
    requestPurpose: 'SUBSTRATE_ACCEPTANCE_TEST',
    attemptId: SAT_ATTEMPT_ID,
    candidateToolingRevision: B,
    substrateImplementationAuthorization: AUTHORIZATION_ID,
    substrateImplementationAuthorizationSubject: AUTHORIZATION_SUBJECT,
    substrateImplementationAuthorizationVerdictCommentId: AUTHORIZATION_VERDICT_COMMENT_ID,
    substrateSpecRevision: SPEC_REVISION,
    syntheticOrDisposableProductSubject: PREDECESSOR,
    acceptanceFixtureManifestDigest: ACCEPTANCE_FIXTURE_DIGEST,
    evidenceAuthority: EVIDENCE_AUTHORITY,
    commandManifest: ACCEPTANCE_FIXTURE.runtimeCases,
    commandManifestDigest: commandManifestDigest(),
    cwdPolicy: 'PRODUCT_ROOT_RELATIVE',
    explicitEnvironment: {},
    environmentInheritancePolicy: CHILD_ENV_POLICY,
    timeoutPolicy: {
      commandRetryCount: 0,
      sealAwaitWindowMs: 300000,
      sealPollIntervalMs: 5000,
    },
    operationDefinitionRevision: OPERATION_DEFINITION_REVISION,
    rawEvidenceFormatRevision: RAW_EVIDENCE_FORMAT_REVISION,
    ...overrides,
  };
}

function pilotRequest(overrides = {}) {
  return {
    schemaVersion: 'EWF00_MEASURE_EXEC_REQUEST_V1',
    requestPurpose: 'PILOT_MEASUREMENT',
    attemptId: 'PILOT-ATTEMPT-001',
    measurementPairId: 'PAIR-001',
    measurementPhase: 'baseline',
    acceptedMeasurementToolingRevision: B,
    productSubject: PILOT,
    executionAuthorizationIdentity: 'PILOT-AUTH-001',
    executionAuthorizationSubject: 'e'.repeat(40),
    executionAuthorizationVerdictCommentId: 123,
    canonicalSpecRevision: 'f'.repeat(40),
    verificationManifestDigest: '3'.repeat(64),
    commandDeclarationIds: ['cmd-1'],
    commandManifest: [{ commandId: 'cmd-1', ordinal: 1, command: 'node -e "process.exit(0)"', cwd: '.', required: true, requirements: [], timeoutMs: 1000, explicitEnvironment: {} }],
    commandManifestDigest: '4'.repeat(64),
    cwdPolicy: 'PRODUCT_ROOT_RELATIVE',
    explicitEnvironment: {},
    environmentInheritancePolicy: CHILD_ENV_POLICY,
    timeoutPolicy: { commandRetryCount: 0 },
    operationDefinitionRevision: 'PILOT-OPDEF-V1',
    rawEvidenceFormatRevision: RAW_EVIDENCE_FORMAT_REVISION,
    ...overrides,
  };
}

function satContext(overrides = {}) {
  return {
    requestPR: 40,
    requestHeadSha: R,
    requestCommit: R,
    currentPrHead: R,
    requestParent: B,
    requestChangedPaths: [REQUEST_PATH],
    candidateToolingRevision: B,
    candidateChangedPaths: IMPLEMENTATION_PATHS,
    authorizationAccepted: true,
    authorizationSubject: AUTHORIZATION_SUBJECT,
    authorizationVerdictCommentId: AUTHORIZATION_VERDICT_COMMENT_ID,
    substrateSpecRevision: SPEC_REVISION,
    disposableProductSubject: PREDECESSOR,
    realPilotSubjects: [PILOT],
    workflowContentDigest: WORKFLOW_DIGEST,
    expectedWorkflowContentDigest: WORKFLOW_DIGEST,
    executorContentDigest: EXECUTOR_DIGEST,
    expectedExecutorContentDigest: EXECUTOR_DIGEST,
    toolingIndependentlyAccepted: false,
    nodeVersion: '22.22.3',
    npmVersion: '10.9.8',
    ...overrides,
  };
}

function pilotContext(overrides = {}) {
  return {
    requestPR: 41,
    requestHeadSha: R,
    requestCommit: R,
    currentPrHead: R,
    requestParent: 'a'.repeat(40),
    requestChangedPaths: ['docs/superpowers/measurement-requests/pilot.json'],
    toolingIndependentlyAccepted: true,
    acceptedMeasurementToolingRevision: B,
    acceptedExecutionAuthorization: true,
    productSubject: PILOT,
    nodeVersion: '22.22.3',
    ...overrides,
  };
}

function expectCode(fn, code) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof EwfMeasurementError);
    assert.equal(error.code, code);
    return true;
  });
}

function operationBody(actionId, category, action, head = R) {
  return `EWF_MEASUREMENT_OPERATION_V1\n${JSON.stringify({
    requestPurpose: 'SUBSTRATE_ACCEPTANCE_TEST',
    attemptId: SAT_ATTEMPT_ID,
    requestPR: 40,
    requestHeadSha: head,
    actorRole: 'SUBSTRATE_ACCEPTANCE_FIXTURE_OPERATOR',
    operationDefinitionRevision: OPERATION_DEFINITION_REVISION,
    actionId,
    operationCategory: category,
    action,
    operationStartedAt: '2026-08-08T10:30:00.000Z',
    operationEndedAt: '2026-08-08T10:30:00.100Z',
    evidenceRef: `synthetic://${actionId}`,
  })}`;
}

function syntheticComments({ edited = false, missingSecond = false } = {}) {
  const firstBody = operationBody('sat-op-001', 'preflightOperation', 'synthetic acceptance preflight marker');
  const secondBody = operationBody('sat-op-002', 'artifactPreparationOperation', 'synthetic acceptance artifact marker');
  const rows = [
    { id: 1001, created_at: '2026-08-08T10:30:01Z', updated_at: edited ? '2026-08-08T10:30:02Z' : '2026-08-08T10:30:01Z', body: firstBody, user: { login: 'NguyenDukKyeon' } },
  ];
  if (!missingSecond) {
    rows.push({ id: 1002, created_at: '2026-08-08T10:30:02Z', updated_at: '2026-08-08T10:30:02Z', body: secondBody, user: { login: 'NguyenDukKyeon' } });
  }
  return rows;
}

function sealFor(comments, overrides = {}) {
  const journalDigest = computeJournalDigest(comments);
  const ordered = comments
    .map((comment) => ({
      id: comment.id,
      createdAt: comment.created_at,
      bodyDigest: sha256(comment.body.replace(/\r\n?/g, '\n')),
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);
  const payload = {
    attemptId: SAT_ATTEMPT_ID,
    requestPurpose: 'SUBSTRATE_ACCEPTANCE_TEST',
    requestPR: 40,
    requestHeadSha: R,
    orderedOperationCommentIds: ordered.map((row) => row.id),
    orderedOperationBodyDigests: ordered.map((row) => row.bodyDigest),
    operationDefinitionRevision: OPERATION_DEFINITION_REVISION,
    journalDigest,
    observationWindowStart: '2026-08-08T10:30:00Z',
    observationWindowEnd: '2026-08-08T10:30:03Z',
    ...overrides,
  };
  const body = `EWF_MEASUREMENT_JOURNAL_SEAL_V1\n${JSON.stringify(payload)}`;
  return { id: 2001, created_at: '2026-08-08T10:30:03Z', updated_at: '2026-08-08T10:30:03Z', body, user: { login: 'NguyenDukKyeon' } };
}

test('EWF00-ME-01 purpose domains are immutable and non-reclassifiable', () => {
  const result = validateRequest(satRequest(), satContext());
  assert.equal(result.evidenceAuthority, EVIDENCE_AUTHORITY);
  assert.equal('measurementPhase' in result, false);
  assert.equal('baselineDatasetDigest' in result, false);
  assert.equal('assistedDatasetDigest' in result, false);
  expectCode(() => validateRequest(satRequest({ requestPurpose: 'PILOT_MEASUREMENT' }), satContext()), 'INVALID_REQUEST_PURPOSE');
});

test('EWF00-ME-02 SAT accepts an unaccepted candidate only under exact accepted substrate authority', () => {
  const result = validateRequest(satRequest(), satContext({ toolingIndependentlyAccepted: false }));
  assert.equal(result.candidateToolingRevision, B);
  expectCode(() => validateRequest(satRequest(), satContext({ authorizationAccepted: false })), 'INVALID_SUBSTRATE_AUTHORITY');
});

test('EWF00-ME-03 real Pilot rejects unaccepted tooling', () => {
  expectCode(() => validateRequest(pilotRequest(), pilotContext({ toolingIndependentlyAccepted: false })), 'UNACCEPTED_TOOLING');
  assert.equal(validateRequest(pilotRequest(), pilotContext()).requestPurpose, 'PILOT_MEASUREMENT');
});

test('EWF00-ME-04 workflow uses only natural opened+synchronize request-path triggers', async () => {
  const text = await readFile(workflowPath, 'utf8');
  assert.match(text, /pull_request:/);
  assert.match(text, /branches:\s*\[main\]/);
  assert.match(text, /-\s+opened/);
  assert.match(text, /-\s+synchronize/);
  assert.match(text, /docs\/superpowers\/measurement-requests\/\*\*/);
  assert.doesNotMatch(text, /workflow_dispatch|schedule:|ready_for_review|reopened/);
  assert.equal(validateWorkflowContract(text).valid, true);
});

test('EWF00-ME-05 request identity is exact and successful evidence is superseded on head movement', () => {
  assert.equal(validateRequest(satRequest(), satContext()).requestHeadSha, R);
  expectCode(() => validateRequest(satRequest(), satContext({ currentPrHead: '9'.repeat(40) })), 'REQUEST_HEAD_MISMATCH');
  assert.deepEqual(classifySupersession({ evidenceRequestHeadSha: R, currentRequestHeadSha: '9'.repeat(40) }), {
    status: 'REQUEST_SUPERSEDED',
    pairValidity: 'INVALID_FOR_PAIR',
    mayExecuteOldIdentity: false,
  });
});

test('EWF00-ME-06 workflow permissions are exactly read-only and it never writes comments', async () => {
  const text = await readFile(workflowPath, 'utf8');
  const permissionBlock = text.match(/permissions:\n([\s\S]*?)\njobs:/)?.[1] ?? '';
  assert.match(permissionBlock, /contents:\s*read/);
  assert.match(permissionBlock, /pull-requests:\s*read/);
  assert.doesNotMatch(permissionBlock, /write/);
  assert.doesNotMatch(text, /issues\.createComment|pulls\.createReview|gh\s+pr\s+comment/);
  assert.equal(validateWorkflowContract(text).valid, true);
});

test('EWF00-ME-07 child environment is allowlisted and forbidden credentials are stripped', () => {
  const env = buildChildEnvironment({ EWF_ACCEPTANCE_CASE: 'PASS' }, {
    PATH: '/bin',
    HOME: '/home/runner',
    RUNNER_TEMP: '/tmp/runner',
    TMPDIR: '/tmp',
    GITHUB_TOKEN: 'secret',
    OPENAI_API_KEY: 'secret',
    UNRELATED: 'secret',
  });
  assert.deepEqual(Object.keys(env).sort(), ['CI', 'EWF_ACCEPTANCE_CASE', 'HOME', 'LANG', 'LC_ALL', 'PATH', 'RUNNER_TEMP', 'TMPDIR', 'TZ'].sort());
  assert.equal(env.CI, 'true');
  assert.equal(env.TZ, 'UTC');
  assert.equal(env.GITHUB_TOKEN, undefined);
});

test('EWF00-ME-08 exact external command authority rejects modifications before process execution', () => {
  assert.doesNotThrow(() => assertAuthorizedCommandManifest(ACCEPTANCE_FIXTURE.runtimeCases, ACCEPTANCE_FIXTURE.runtimeCases));
  const extra = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases);
  extra[0].declarations.push({ ...extra[0].declarations[0], commandId: 'extra', ordinal: 2 });
  expectCode(() => assertAuthorizedCommandManifest(extra, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
});

test('EWF00-ME-09 LI declaration fixture is exact-order authority-only and never spawned by SAT', async () => {
  assert.deepEqual(ACCEPTANCE_FIXTURE.liDeclarationFixture.commands, LI_DECLARATIONS);
  assert.equal(ACCEPTANCE_FIXTURE.liDeclarationFixture.mode, 'AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN');
  const root = await mkdtemp(join(tmpdir(), 'ewf-sat-li-no-spawn-'));
  try {
    const outcome = await executeAcceptanceFixture({
      fixture: ACCEPTANCE_FIXTURE,
      productDir: root,
      nodeVersion: '22.22.3',
      inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root },
    });
    assert.equal(outcome.liCommandsExecuted, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('EWF00-ME-10 five-state execution preserves output, digests, typed errors, monotonic duration and no retry', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ewf-sat-runtime-'));
  try {
    const outcome = await executeAcceptanceFixture({
      fixture: ACCEPTANCE_FIXTURE,
      productDir: root,
      nodeVersion: '22.22.3',
      inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root },
    });
    const states = new Set(outcome.commandResults.map((row) => row.result));
    assert.deepEqual([...states].sort(), [...COMMAND_RESULTS].sort());
    for (const row of outcome.commandResults) {
      assert.match(row.stdoutDigest, /^[0-9a-f]{64}$/);
      assert.match(row.stderrDigest, /^[0-9a-f]{64}$/);
      assert.ok(Number.isInteger(row.durationMs) && row.durationMs >= 0);
      assert.equal(row.attemptCount, 1);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('EWF00-ME-11 unsafe remote mutation declarations and tracked product mutations are invalid', () => {
  expectCode(() => assertSafeDeclarations([{ command: 'git push origin HEAD:main' }]), 'UNAUTHORIZED_REMOTE_MUTATION');
  expectCode(() => assertSafeDeclarations([{ command: 'npm publish' }]), 'UNAUTHORIZED_REMOTE_MUTATION');
  assert.doesNotThrow(() => validateProductImmutability({ requestedSha: PREDECESSOR, beforeSha: PREDECESSOR, afterSha: PREDECESSOR, beforeClean: true, afterClean: true }));
  expectCode(() => validateProductImmutability({ requestedSha: PREDECESSOR, beforeSha: PREDECESSOR, afterSha: PREDECESSOR, beforeClean: true, afterClean: false }), 'PRODUCT_MUTATION');
});

test('EWF00-ME-12 controlled fingerprint excludes host diagnostics but binds controlled semantics', () => {
  const controlled = { candidateToolingRevision: B, nodeVersion: '22.22.3', npmVersion: '10.9.8', rawEvidenceFormatRevision: RAW_EVIDENCE_FORMAT_REVISION };
  const a = computeControlledEnvironmentFingerprint(controlled, { runnerImageVersion: 'A' });
  const b = computeControlledEnvironmentFingerprint(controlled, { runnerImageVersion: 'B' });
  assert.equal(a.digest, b.digest);
  assert.notDeepEqual(a.hostDiagnostics, b.hostDiagnostics);
});

test('EWF00-ME-13 container identity is explicitly NOT_SELECTED', () => {
  assert.equal(EXECUTION_CONTAINER_DIGEST, 'NOT_SELECTED');
});

test('EWF00-ME-14 operation comments are ingested contemporaneously in deterministic order', () => {
  const comments = syntheticComments().reverse();
  const seal = sealFor(comments);
  const journal = validateJournalAndSeal({ comments, sealComment: seal, requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID });
  assert.deepEqual(journal.entries.map((row) => row.commentId), [1001, 1002]);
  assert.match(journal.journalDigest, /^[0-9a-f]{64}$/);
});

test('EWF00-ME-15 edited or missing journal evidence is rejected without reconstruction', () => {
  const edited = syntheticComments({ edited: true });
  expectCode(() => validateJournalAndSeal({ comments: edited, sealComment: sealFor(edited), requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'JOURNAL_EDITED');
  const missing = syntheticComments({ missingSecond: true });
  expectCode(() => validateJournalAndSeal({ comments: missing, sealComment: sealFor(missing), requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'JOURNAL_INCOMPLETE');
});

test('EWF00-ME-16 journal seal binds exact ids/digests/head/window and missing seal times out invalid', () => {
  const comments = syntheticComments();
  assert.doesNotThrow(() => validateJournalAndSeal({ comments, sealComment: sealFor(comments), requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }));
  expectCode(() => validateJournalAndSeal({ comments, sealComment: null, requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'SEAL_TIMEOUT');
});

test('EWF00-ME-17 evidence-capture comments are excluded from manual-operation counts', () => {
  const comments = syntheticComments();
  const journal = validateJournalAndSeal({ comments, sealComment: sealFor(comments), requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID });
  assert.equal(journal.manualOperationCount, 0);
});

test('EWF00-ME-18 synthetic baseline-before-A temporal gate is fail closed', () => {
  assert.doesNotThrow(() => validateBaselineTemporalGate({ baselineFrozenAt: 100, commitAFormedAt: 200, baselineSubject: '1'.repeat(40), commitAParent: '1'.repeat(40), evidencePurpose: 'PILOT_MEASUREMENT' }));
  expectCode(() => validateBaselineTemporalGate({ baselineFrozenAt: 300, commitAFormedAt: 200, baselineSubject: '1'.repeat(40), commitAParent: '1'.repeat(40), evidencePurpose: 'PILOT_MEASUREMENT' }), 'BASELINE_TEMPORAL_INVALID');
  expectCode(() => validateBaselineTemporalGate({ baselineFrozenAt: 100, commitAFormedAt: 200, baselineSubject: '1'.repeat(40), commitAParent: '1'.repeat(40), evidencePurpose: 'SUBSTRATE_ACCEPTANCE_TEST' }), 'BASELINE_DOMAIN_INVALID');
});

test('EWF00-ME-19 all eight metric families and zero-vs-missing semantics are exact', () => {
  const observations = METRIC_DEFINITIONS.map((metric, index) => ({
    metricId: metric.metricId,
    value: index === 0 ? 12 : index === 1 ? 0 : null,
    unit: metric.unit,
    start: '2026-08-08T10:00:00Z',
    end: '2026-08-08T10:00:01Z',
    method: 'SAT_SYNTHETIC_METHOD_V1',
    exclusions: [],
    rawEvidenceRef: `synthetic://metric/${metric.metricId}`,
    resultState: index === 0 ? 'OBSERVED' : index === 1 ? 'OBSERVED_ZERO' : 'NOT_APPLICABLE',
  }));
  assert.deepEqual(validateMetricObservations(observations).map((row) => row.metricId), METRIC_DEFINITIONS.map((row) => row.metricId));
  assert.deepEqual(METRIC_RESULT_STATES, ['OBSERVED', 'OBSERVED_ZERO', 'NOT_RUN', 'NOT_AVAILABLE', 'NOT_APPLICABLE', 'UNKNOWN']);
});

test('EWF00-ME-20 controlled pair requires exact controlled context and authorized product delta while host drift is diagnostic only', () => {
  const base = { controlledEnvironmentFingerprint: 'a'.repeat(64), measurementMethodRevision: 'M1', rawEvidenceFormatRevision: 'R1', commandManifestDigest: 'b'.repeat(64), allowedChangedPaths: ['src/a.js'], actualChangedPaths: ['src/a.js'], currentRequestHeadMatchesEvidence: true, journalValid: true, hostDiagnostics: { image: 'A' } };
  const assisted = { ...base, hostDiagnostics: { image: 'B' } };
  assert.equal(validateControlledPair(base, assisted).comparabilityResult, 'COMPARABLE');
  expectCode(() => validateControlledPair(base, { ...assisted, actualChangedPaths: ['src/a.js', 'src/unrelated.js'] }), 'COMPARABILITY_INVALID');
});

test('EWF00-ME-21 raw artifact member digests and aggregate dataset digest are deterministic and non-recursive', () => {
  const members = new Map([
    ['environment.json', Buffer.from('{}')],
    ['command-results.json', Buffer.from('[]')],
    ['measurement-observations.json', Buffer.from('[]')],
    ['operation-journal.json', Buffer.from('{}')],
  ]);
  const a = buildArtifactManifest(members);
  const b = buildArtifactManifest(new Map([...members].reverse()));
  assert.deepEqual(a, b);
  assert.equal('artifact-manifest.json' in a.members, false);
  assert.match(a.datasetDigest, /^[0-9a-f]{64}$/);
});

test('EWF00-ME-22 substrate evidence cannot carry acceptance/status/Ready/merge/deploy authority', () => {
  assert.doesNotThrow(() => assertNoAcceptanceAuthority({ evidenceAuthority: EVIDENCE_AUTHORITY }));
  for (const key of ['verdict', 'packageAcceptance', 'pilotAcceptance', 'ewfAcceptance', 'ready', 'merge', 'deploy']) {
    expectCode(() => assertNoAcceptanceAuthority({ evidenceAuthority: EVIDENCE_AUTHORITY, [key]: 'ACCEPT' }), 'ACCEPTANCE_AUTHORITY_FORBIDDEN');
  }
});

const negativeCases = {
  'ME-N01': () => expectCode(() => validateRequest(satRequest({ requestPurpose: 'WRONG' }), satContext()), 'INVALID_REQUEST_PURPOSE'),
  'ME-N02': () => expectCode(() => validateRequest(pilotRequest(), pilotContext({ toolingIndependentlyAccepted: false })), 'UNACCEPTED_TOOLING'),
  'ME-N03': () => expectCode(() => validateRequest(satRequest({ syntheticOrDisposableProductSubject: PILOT }), satContext()), 'PURPOSE_SUBJECT_MISMATCH'),
  'ME-N04': () => expectCode(() => validateRequest(satRequest({ candidateToolingRevision: 'HEAD' }), satContext()), 'IMMUTABLE_IDENTITY_REQUIRED'),
  'ME-N05': () => expectCode(() => validateRequest(satRequest(), satContext({ requestHeadSha: '8'.repeat(40) })), 'REQUEST_HEAD_MISMATCH'),
  'ME-N06': () => assert.equal(classifySupersession({ evidenceRequestHeadSha: R, currentRequestHeadSha: '8'.repeat(40) }).status, 'REQUEST_SUPERSEDED'),
  'ME-N07': () => expectCode(() => validateRequest(satRequest(), satContext({ requestParent: '8'.repeat(40) })), 'CANDIDATE_BOOTSTRAP_INVALID'),
  'ME-N08': () => expectCode(() => validateRequest(satRequest(), satContext({ requestChangedPaths: [REQUEST_PATH, 'docs/superpowers/measurement-requests/extra.json'] })), 'REQUEST_BOUNDARY_INVALID'),
  'ME-N09': () => expectCode(() => validateRequest(satRequest(), satContext({ candidateChangedPaths: [...IMPLEMENTATION_PATHS, 'package.json'] })), 'IMPLEMENTATION_BOUNDARY_INVALID'),
  'ME-N10': () => expectCode(() => validateRequest(satRequest(), satContext({ workflowContentDigest: '0'.repeat(64) })), 'TOOLING_IDENTITY_MISMATCH'),
  'ME-N11': () => expectCode(() => assertAuthorizedCommandManifest(null, ACCEPTANCE_FIXTURE.runtimeCases), 'MISSING_COMMAND_AUTHORITY'),
  'ME-N12': () => {
    const x = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases); x[0].declarations.push({ ...x[0].declarations[0], commandId: 'extra', ordinal: 2 });
    expectCode(() => assertAuthorizedCommandManifest(x, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
  },
  'ME-N13': () => {
    const x = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases); [x[0], x[1]] = [x[1], x[0]];
    expectCode(() => assertAuthorizedCommandManifest(x, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
  },
  'ME-N14': () => {
    const x = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases); x[0].declarations[0].cwd = 'other';
    expectCode(() => assertAuthorizedCommandManifest(x, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
  },
  'ME-N15': () => {
    const x = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases); x[0].declarations[0].timeoutMs += 1;
    expectCode(() => assertAuthorizedCommandManifest(x, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
  },
  'ME-N16': () => {
    const x = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases); x[0].declarations[0].explicitEnvironment = { BAD: '1' };
    expectCode(() => assertAuthorizedCommandManifest(x, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
  },
  'ME-N17': () => assert.equal(buildChildEnvironment({}, { PATH: '/bin', GITHUB_TOKEN: 'x' }).GITHUB_TOKEN, undefined),
  'ME-N18': () => expectCode(() => validateProductImmutability({ requestedSha: PREDECESSOR, beforeSha: PREDECESSOR, afterSha: '9'.repeat(40), beforeClean: true, afterClean: true }), 'PRODUCT_MUTATION'),
  'ME-N19': async () => {
    const root = await mkdtemp(join(tmpdir(), 'ewf-n19-')); try {
      const result = await executeAcceptanceFixture({ fixture: { ...ACCEPTANCE_FIXTURE, runtimeCases: [ACCEPTANCE_FIXTURE.runtimeCases[0]] }, productDir: root, nodeVersion: '22.22.3', inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root } });
      assert.equal(result.commandResults[0].result, 'PASS');
    } finally { await rm(root, { recursive: true, force: true }); }
  },
  'ME-N20': async () => {
    const root = await mkdtemp(join(tmpdir(), 'ewf-n20-')); try {
      const result = await executeAcceptanceFixture({ fixture: { ...ACCEPTANCE_FIXTURE, runtimeCases: [ACCEPTANCE_FIXTURE.runtimeCases[1]] }, productDir: root, nodeVersion: '22.22.3', inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root } });
      assert.equal(result.commandResults[0].result, 'FAIL');
    } finally { await rm(root, { recursive: true, force: true }); }
  },
  'ME-N21': async () => {
    const root = await mkdtemp(join(tmpdir(), 'ewf-n21-')); try {
      const result = await executeAcceptanceFixture({ fixture: { ...ACCEPTANCE_FIXTURE, runtimeCases: [ACCEPTANCE_FIXTURE.runtimeCases[2], ACCEPTANCE_FIXTURE.runtimeCases[3]] }, productDir: root, nodeVersion: '22.22.3', inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root } });
      assert.deepEqual(result.commandResults.map((x) => x.result), ['ERROR', 'ERROR']);
    } finally { await rm(root, { recursive: true, force: true }); }
  },
  'ME-N22': async () => {
    const root = await mkdtemp(join(tmpdir(), 'ewf-n22-')); try {
      const result = await executeAcceptanceFixture({ fixture: { ...ACCEPTANCE_FIXTURE, runtimeCases: [ACCEPTANCE_FIXTURE.runtimeCases[5]] }, productDir: root, nodeVersion: '22.22.3', inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root } });
      assert.equal(result.commandResults[1].result, 'NOT_RUN');
    } finally { await rm(root, { recursive: true, force: true }); }
  },
  'ME-N23': async () => {
    const root = await mkdtemp(join(tmpdir(), 'ewf-n23-')); try {
      const result = await executeAcceptanceFixture({ fixture: { ...ACCEPTANCE_FIXTURE, runtimeCases: [ACCEPTANCE_FIXTURE.runtimeCases[4]] }, productDir: root, nodeVersion: '22.22.3', inheritedEnvironment: { PATH: process.env.PATH, HOME: root, RUNNER_TEMP: root, TMPDIR: root } });
      assert.equal(result.commandResults[0].result, 'NOT_AVAILABLE');
    } finally { await rm(root, { recursive: true, force: true }); }
  },
  'ME-N24': () => {
    const comments = syntheticComments({ edited: true }); expectCode(() => validateJournalAndSeal({ comments, sealComment: sealFor(comments), requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'JOURNAL_EDITED');
  },
  'ME-N25': () => {
    const comments = syntheticComments({ missingSecond: true }); expectCode(() => validateJournalAndSeal({ comments, sealComment: sealFor(comments), requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'JOURNAL_INCOMPLETE');
  },
  'ME-N26': () => {
    const comments = syntheticComments(); const seal = sealFor(comments, { journalDigest: '0'.repeat(64) }); expectCode(() => validateJournalAndSeal({ comments, sealComment: seal, requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'JOURNAL_DIGEST_MISMATCH');
  },
  'ME-N27': () => expectCode(() => validateJournalAndSeal({ comments: syntheticComments(), sealComment: null, requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'SEAL_TIMEOUT'),
  'ME-N28': () => {
    const comments = syntheticComments(); const seal = { ...sealFor(comments), updated_at: '2026-08-08T10:31:00Z' }; expectCode(() => validateJournalAndSeal({ comments, sealComment: seal, requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'SEAL_EDITED');
  },
  'ME-N29': () => {
    const comments = syntheticComments(); const seal = sealFor(comments, { requestHeadSha: '7'.repeat(40) }); expectCode(() => validateJournalAndSeal({ comments, sealComment: seal, requestPR: 40, requestHeadSha: R, attemptId: SAT_ATTEMPT_ID }), 'SEAL_HEAD_MISMATCH');
  },
  'ME-N30': () => {
    const base = { controlledEnvironmentFingerprint: 'a'.repeat(64), measurementMethodRevision: 'M1', rawEvidenceFormatRevision: 'R1', commandManifestDigest: 'b'.repeat(64), allowedChangedPaths: [], actualChangedPaths: [], currentRequestHeadMatchesEvidence: true, journalValid: true };
    expectCode(() => validateControlledPair(base, { ...base, controlledEnvironmentFingerprint: 'c'.repeat(64) }), 'COMPARABILITY_INVALID');
  },
  'ME-N31': () => {
    const base = { controlledEnvironmentFingerprint: 'a'.repeat(64), measurementMethodRevision: 'M1', rawEvidenceFormatRevision: 'R1', commandManifestDigest: 'b'.repeat(64), allowedChangedPaths: [], actualChangedPaths: [], currentRequestHeadMatchesEvidence: true, journalValid: true, hostDiagnostics: { image: 'A' } };
    assert.equal(validateControlledPair(base, { ...base, hostDiagnostics: { image: 'B' } }).comparabilityResult, 'COMPARABLE');
  },
  'ME-N32': () => {
    const manifest = buildArtifactManifest(new Map([['environment.json', Buffer.from('{}')]]));
    const changed = buildArtifactManifest(new Map([['environment.json', Buffer.from('{"x":1}')]]));
    assert.notEqual(manifest.datasetDigest, changed.datasetDigest);
  },
  'ME-N33': () => expectCode(() => assertNoAcceptanceAuthority({ evidenceAuthority: EVIDENCE_AUTHORITY, baselineDatasetDigest: 'a'.repeat(64) }), 'EVIDENCE_DOMAIN_RECLASSIFICATION_FORBIDDEN'),
  'ME-N34': () => {
    const changed = [...LI_DECLARATIONS].reverse(); assert.notDeepEqual(changed, ACCEPTANCE_FIXTURE.liDeclarationFixture.commands); assert.equal(ACCEPTANCE_FIXTURE.liDeclarationFixture.mode, 'AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN');
  },
  'ME-N35': () => {
    const x = structuredClone(ACCEPTANCE_FIXTURE.runtimeCases); x[0].declarations[0].command = 'node -e "process.exit(0)"'; expectCode(() => assertAuthorizedCommandManifest(x, ACCEPTANCE_FIXTURE.runtimeCases), 'UNAUTHORIZED_COMMAND');
  },
  'ME-N36': () => assert.equal(buildChildEnvironment({}, { PATH: '/bin', OPENAI_API_KEY: 'secret' }).OPENAI_API_KEY, undefined),
  'ME-N37': async () => {
    const text = (await readFile(workflowPath, 'utf8')).replace('pull-requests: read', 'pull-requests: write');
    expectCode(() => validateWorkflowContract(text), 'WORKFLOW_CONTRACT_INVALID');
  },
  'ME-N38': async () => {
    const text = (await readFile(workflowPath, 'utf8')).replace(/(name: Product checkout[\s\S]*?persist-credentials:) false/, '$1 true');
    expectCode(() => validateWorkflowContract(text), 'WORKFLOW_CONTRACT_INVALID');
  },
  'ME-N39': async () => {
    const text = (await readFile(workflowPath, 'utf8')).replace(/(name: Tooling checkout[\s\S]*?persist-credentials:) false/, '$1 true');
    expectCode(() => validateWorkflowContract(text), 'WORKFLOW_CONTRACT_INVALID');
  },
  'ME-N40': () => expectCode(() => validateBaselineTemporalGate({ baselineFrozenAt: 300, commitAFormedAt: 200, baselineSubject: '1'.repeat(40), commitAParent: '2'.repeat(40), evidencePurpose: 'PILOT_MEASUREMENT' }), 'BASELINE_TEMPORAL_INVALID'),
  'ME-N41': () => {
    const base = { controlledEnvironmentFingerprint: 'a'.repeat(64), measurementMethodRevision: 'M1', rawEvidenceFormatRevision: 'R1', commandManifestDigest: 'b'.repeat(64), allowedChangedPaths: ['src/a.js'], actualChangedPaths: ['src/a.js'], currentRequestHeadMatchesEvidence: true, journalValid: true };
    expectCode(() => validateControlledPair(base, { ...base, actualChangedPaths: ['src/a.js', 'src/b.js'] }), 'COMPARABILITY_INVALID');
  },
  'ME-N42': () => {
    const observations = METRIC_DEFINITIONS.map((metric) => ({ metricId: metric.metricId, value: null, unit: metric.unit, start: '2026-01-01T00:00:00Z', end: '2026-01-01T00:00:01Z', method: 'M', exclusions: [], rawEvidenceRef: 'x', resultState: 'OBSERVED_ZERO' }));
    expectCode(() => validateMetricObservations(observations), 'METRIC_STATE_INVALID');
  },
  'ME-N43': () => {
    const observations = METRIC_DEFINITIONS.slice(0, -1).map((metric) => ({ metricId: metric.metricId, value: null, unit: metric.unit, start: '2026-01-01T00:00:00Z', end: '2026-01-01T00:00:01Z', method: 'M', exclusions: [], rawEvidenceRef: 'x', resultState: 'NOT_APPLICABLE' }));
    expectCode(() => validateMetricObservations(observations), 'METRIC_SCHEMA_INVALID');
  },
  'ME-N44': () => expectCode(() => validateRequest(satRequest(), satContext({ currentPrHead: '6'.repeat(40) })), 'REQUEST_HEAD_MISMATCH'),
  'ME-N45': () => expectCode(() => validateRequest(satRequest({ substrateSpecRevision: '5'.repeat(40) }), satContext()), 'INVALID_SUBSTRATE_AUTHORITY'),
  'ME-N46': () => {
    const base = { controlledEnvironmentFingerprint: 'a'.repeat(64), measurementMethodRevision: 'M1', rawEvidenceFormatRevision: 'R1', commandManifestDigest: 'b'.repeat(64), allowedChangedPaths: [], actualChangedPaths: [], currentRequestHeadMatchesEvidence: true, journalValid: true };
    expectCode(() => validateControlledPair(base, { ...base, measurementMethodRevision: 'M2' }), 'COMPARABILITY_INVALID');
  },
};

for (const id of ACCEPTANCE_FIXTURE.negativeFixtureIds) {
  test(`${id} executable/replayable negative fixture`, async () => {
    assert.ok(negativeCases[id], `missing handler for ${id}`);
    await negativeCases[id]();
  });
}

test('fixture canonicalization and digest exactly match EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2', () => {
  assert.equal(sha256(canonicalize(ACCEPTANCE_FIXTURE)), 'a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d');
  assert.equal(ACCEPTANCE_FIXTURE_DIGEST, 'a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d');
});

test('verification manifest accounts for every EWF00-ME-01..22 and ME-N01..ME-N46 identity', () => {
  const manifest = buildVerificationManifest();
  assert.deepEqual(manifest.requirements.map((row) => row.requirementId), Array.from({ length: 22 }, (_, index) => `EWF00-ME-${String(index + 1).padStart(2, '0')}`));
  assert.deepEqual(manifest.negativeFixtures.map((row) => row.fixtureId), Array.from({ length: 46 }, (_, index) => `ME-N${String(index + 1).padStart(2, '0')}`));
});
