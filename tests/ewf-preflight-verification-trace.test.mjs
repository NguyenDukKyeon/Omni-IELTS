import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import {
  COMMAND_RESULTS,
  canonicalizeArtifact,
  digestArtifact,
  redactPortableValue
} from '../scripts/ewf-artifacts.mjs';
import {
  PREFLIGHT_RESULTS,
  REMOTE_COLLISION_POLICIES,
  TOOL_REQUIREMENTS,
  evaluatePreflight,
  executeVerificationProfile,
  runPreflight,
  validateFrozenHandoff,
  validateTraceManifest
} from '../scripts/ewf-preflight-trace.mjs';

const REPOSITORY = 'NguyenDukKyeon/VocabMaster';
const SPEC_ID = 'EWF00-PREFLIGHT-001';
const SPEC_REVISION = '0b43efac974c3fbbc489f10e9fa668bac84c9b43';
const PLAN_COMMIT = '250b879fa06b7be50a198e3cf007637c5f9d7306';
const PLAN_PARENT = '474bde8e3c7b09f757e7df4a1587f8a71b2e7865';
const PLAN_BLOB = 'c45255836ca211d7f07f010016c68b568da6b193';
const PLAN_PATH = 'docs/superpowers/plans/2026-08-05-ewf-00-preflight-verification-trace-github-connector-v4.md';
const IMPLEMENTATION_BRANCH = 'chatgpt/ewf-00-preflight-verification-trace-mvp';
const IMPLEMENTATION_REF = `refs/heads/${IMPLEMENTATION_BRANCH}`;
const WRITER = 'chatgpt-github-ewf00-preflight-primary-writer';

const CANONICAL_FILES = Object.freeze([
  'AGENTS.md',
  'docs/ROADMAP.md',
  'docs/IMPLEMENTATION_PLAN.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/DECISIONS.md'
]);

const ALLOWLIST = Object.freeze([
  '.specify/templates/ewf/preflight-result.template.json',
  '.specify/templates/ewf/trace-manifest.template.json',
  'scripts/ewf-preflight-trace.mjs',
  'tests/ewf-preflight-verification-trace.test.mjs'
]);

const EXCLUSIONS = Object.freeze([
  'AGENTS.md',
  'docs/ROADMAP.md',
  'docs/IMPLEMENTATION_PLAN.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/DECISIONS.md',
  '.github/**',
  'src/**',
  'server/**',
  'public/**',
  'package.json',
  'package-lock.json',
  'scripts/ewf-artifacts.mjs',
  'docs/superpowers/evidence/**'
]);

const SEMANTIC_KEYS = Object.freeze([
  'ewf:preflight-observation',
  'ewf:verification-execution',
  'ewf:trace-validation',
  'ewf:frozen-handoff-validation'
]);

const INHERITED_ENVIRONMENT = Object.freeze([
  'PATH',
  'HOME',
  'USERPROFILE',
  'SYSTEMROOT',
  'COMSPEC',
  'PATHEXT',
  'TEMP',
  'TMP',
  'APPDATA',
  'LOCALAPPDATA',
  'CI'
]);

const clone = (value) => structuredClone(value);

function omit(value, key) {
  const copy = clone(value);
  delete copy[key];
  return copy;
}

function attachContentDigest(value) {
  const redacted = redactPortableValue(value);
  return {
    ...redacted,
    contentDigest: digestArtifact(redacted)
  };
}

function assertPortableDigest(value) {
  assert.match(value.contentDigest, /^[0-9a-f]{64}$/);
  const projection = omit(value, 'contentDigest');
  assert.deepEqual(projection, redactPortableValue(projection));
  assert.equal(value.contentDigest, digestArtifact(projection));
}

function withDeclarationDigest(declaration) {
  return {
    ...declaration,
    declarationDigest: digestArtifact(declaration)
  };
}

function withManifestDigest(manifest) {
  const projection = clone(manifest);
  delete projection.extensions.verificationManifestDigest;
  return {
    ...manifest,
    extensions: {
      ...manifest.extensions,
      verificationManifestDigest: digestArtifact(projection)
    }
  };
}

function makeCommandDeclaration(overrides = {}) {
  const declaration = {
    id: 'ewf-preflight-focused',
    profile: 'focused',
    command: 'node --test tests/ewf-preflight-verification-trace.test.mjs',
    argv: ['node', '--test', 'tests/ewf-preflight-verification-trace.test.mjs'],
    cwd: '.',
    inheritEnvironment: [...INHERITED_ENVIRONMENT],
    environment: {},
    timeoutMs: 120000,
    toolRequirement: 'REQUIRED',
    requirements: ['EWF00-PVT-01', 'EWF00-PVT-02', 'EWF00-PVT-10'],
    ...overrides
  };
  return withDeclarationDigest(declaration);
}

function makeVerificationManifest(command = makeCommandDeclaration()) {
  return withManifestDigest({
    schemaVersion: 1,
    artifactKind: 'verification-manifest',
    authorityLabel: 'DECLARED_VERIFICATION / NOT_EXECUTION',
    specId: SPEC_ID,
    commands: {
      focused: [command],
      pr: []
    },
    extensions: {
      verificationManifestDigest: null
    }
  });
}

function makeRegistryRow(root) {
  return {
    writer: WRITER,
    writerMode: 'exclusive',
    branch: IMPLEMENTATION_BRANCH,
    ref: IMPLEMENTATION_REF,
    worktree: root,
    allowlist: [...ALLOWLIST],
    semanticConflictKeys: [...SEMANTIC_KEYS]
  };
}

function makeDeclaration(root) {
  return {
    schemaVersion: 1,
    declarationKind: 'approved-change-set',
    authorityLabel: 'SUBORDINATE_CHANGE_DECLARATION / NOT_CANONICAL',
    specId: SPEC_ID,
    repository: REPOSITORY,
    repositoryRoot: root,
    requiredCanonicalFiles: [...CANONICAL_FILES],
    approvedPlanPath: PLAN_PATH,
    approvedPlanCommit: PLAN_COMMIT,
    approvedPlanBlob: PLAN_BLOB,
    expectedHead: PLAN_COMMIT,
    expectedPredecessorParent: PLAN_PARENT,
    expectedSymbolicRef: IMPLEMENTATION_REF,
    expectedLocalTargetRef: IMPLEMENTATION_REF,
    expectedWorktree: root,
    requiredSingleWorktree: true,
    remoteName: 'origin',
    remoteTargetRef: IMPLEMENTATION_REF,
    remoteCollisionPolicy: 'REQUIRE_ABSENT',
    remoteExpectedState: 'ABSENT',
    remoteExpectedSha: null,
    writer: WRITER,
    writerMode: 'exclusive',
    activeWriterRegistry: {
      complete: true,
      rows: [makeRegistryRow(root)]
    },
    allowlist: [...ALLOWLIST],
    exclusions: [...EXCLUSIONS],
    semanticConflictKeys: [...SEMANTIC_KEYS],
    canonicalEntryGates: [
      {
        id: 'EWF-00-status',
        source: 'docs/IMPLEMENTATION_STATUS.md',
        expected: 'PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED'
      },
      {
        id: 'EWF-artifact-predecessor',
        source: 'docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/HANDOFF.md',
        expected: 'EWF00-ARTIFACTS-001'
      }
    ],
    verificationManifest: makeVerificationManifest(),
    safetyApprovals: {
      noProductBehaviorChange: true,
      noCanonicalStatusChange: true,
      noCiChange: true,
      noDependencyChange: true,
      noPilotWork: true,
      noAcceptanceVerdict: true
    }
  };
}

function makeObservation(root) {
  return {
    observationKind: 'LOCAL_READ_ONLY_PREFLIGHT_OBSERVATION',
    complete: true,
    observedAt: '2026-08-05T00:00:00.000Z',
    repository: REPOSITORY,
    repositoryRoot: root,
    canonicalFiles: CANONICAL_FILES.map((path) => ({
      path,
      absolutePath: resolve(root, path),
      exists: true
    })),
    head: PLAN_COMMIT,
    parent: PLAN_PARENT,
    symbolicRef: IMPLEMENTATION_REF,
    localTargetRef: {
      ref: IMPLEMENTATION_REF,
      sha: PLAN_COMMIT
    },
    worktrees: {
      complete: true,
      rows: [{
        path: root,
        head: PLAN_COMMIT,
        branchRef: IMPLEMENTATION_REF
      }]
    },
    status: {
      complete: true,
      tracked: [],
      index: [],
      untracked: []
    },
    remote: {
      complete: true,
      name: 'origin',
      repository: REPOSITORY,
      url: 'https://github.com/NguyenDukKyeon/VocabMaster.git',
      targetRef: IMPLEMENTATION_REF,
      state: 'ABSENT',
      sha: null,
      rows: []
    },
    writer: WRITER,
    writerMode: 'exclusive',
    activeWriterRegistry: {
      complete: true,
      rows: [makeRegistryRow(root)]
    },
    overlaps: {
      files: [],
      semanticKeys: []
    },
    canonicalEntryGateResults: [
      {
        id: 'EWF-00-status',
        observed: 'PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED'
      },
      {
        id: 'EWF-artifact-predecessor',
        observed: 'EWF00-ARTIFACTS-001'
      }
    ],
    requestedChanges: [...ALLOWLIST],
    exclusions: [...EXCLUSIONS]
  };
}

async function withDisposableRepositoryRoot(run) {
  const root = await mkdtemp(join(tmpdir(), 'ewf-preflight-contract-'));
  try {
    for (const path of CANONICAL_FILES) {
      const absolutePath = join(root, path);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, `${path}\n`, 'utf8');
    }
    return await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function diagnosticCodes(result) {
  return result.diagnostics.map((diagnostic) => diagnostic.code);
}

function emptyEffects() {
  return {
    contentWrites: 0,
    indexWrites: 0,
    gitMutations: 0,
    branchMutations: 0,
    installations: 0,
    retries: 0,
    remediations: 0,
    acceptanceOutputs: 0
  };
}

function assertZeroEffects(effects) {
  assert.deepEqual(effects, emptyEffects());
}

function makeStage0Record() {
  return {
    recordType: 'CONNECTOR_GOVERNANCE_STAGE_0_RAW_METADATA',
    result: 'PASS',
    observedAt: '2026-08-05T00:00:00.000Z',
    repository: REPOSITORY,
    repositoryApiIdentity: REPOSITORY,
    defaultBranch: 'main',
    mainRef: 'refs/heads/main',
    mainSha: PLAN_PARENT,
    planCommit: PLAN_COMMIT,
    planParent: PLAN_PARENT,
    planPath: PLAN_PATH,
    planBlob: PLAN_BLOB,
    authorizationPrNumber: 22,
    authorizationPrState: 'open',
    authorizationPrDraft: true,
    authorizationPrHeadBranch: 'chatgpt/ewf-00-preflight-trace-authorization-v4',
    authorizationPrHeadSha: '92966cf4aa04050b084a745faf87071d349aa9cd',
    implementationBranch: IMPLEMENTATION_BRANCH,
    implementationBranchState: 'ABSENT',
    implementationPrState: 'ABSENT',
    writer: WRITER,
    writerMode: 'exclusive',
    allowlist: [...ALLOWLIST],
    semanticConflictKeys: [...SEMANTIC_KEYS],
    canonicalGateResults: [],
    openPrRows: [],
    diagnostics: []
  };
}

function makeEvidence(command, overrides = {}) {
  return attachContentDigest({
    id: 'EWF00-EVIDENCE-001',
    authorityLabel: 'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE',
    subjectCommit: 'a'.repeat(40),
    parentCommit: PLAN_COMMIT,
    specRevision: SPEC_REVISION,
    verificationManifestDigest: makeVerificationManifest(command).extensions.verificationManifestDigest,
    commandId: command.id,
    declarationDigest: command.declarationDigest,
    argv: [...command.argv],
    cwd: command.cwd,
    inheritEnvironment: [...command.inheritEnvironment],
    environment: clone(command.environment),
    timeoutMs: command.timeoutMs,
    toolRequirement: command.toolRequirement,
    result: 'PASS',
    durationMs: 10,
    exitCode: 0,
    stdoutDigest: 'b'.repeat(64),
    stderrDigest: 'c'.repeat(64),
    ...overrides
  });
}

function makeTraceManifest() {
  const command = makeCommandDeclaration();
  const verificationManifest = makeVerificationManifest(command);
  const evidence = makeEvidence(command, {
    verificationManifestDigest: verificationManifest.extensions.verificationManifestDigest
  });
  return {
    schemaVersion: 1,
    artifactKind: 'trace-manifest',
    authorityLabel: 'IMPLEMENTER_TRACE / NOT_ACCEPTANCE',
    specId: SPEC_ID,
    subjectCommit: evidence.subjectCommit,
    parentCommit: evidence.parentCommit,
    specRevision: SPEC_REVISION,
    verificationManifestDigest: verificationManifest.extensions.verificationManifestDigest,
    requirements: [{
      id: 'EWF00-PVT-01',
      tests: ['EWF00-TEST-001'],
      disposition: 'REQUIRED'
    }],
    tests: [{
      id: 'EWF00-TEST-001',
      commands: [command.id],
      scope: 'LOCAL'
    }],
    commands: [{
      id: command.id,
      declarationDigest: command.declarationDigest,
      evidence: [evidence.id]
    }],
    evidence: [evidence],
    extensions: {}
  };
}

function withoutBriefDigest(brief) {
  return omit(brief, 'briefDigest');
}

function makeFrozenBrief() {
  const trace = makeTraceManifest();
  const evidenceDigest = digestArtifact(trace.evidence);
  const traceDigest = digestArtifact(trace);
  const command = makeCommandDeclaration();
  const manifest = makeVerificationManifest(command);
  const brief = {
    schemaVersion: 1,
    artifactKind: 'frozen-acceptance-brief',
    authorityLabel: 'FROZEN_AUDIT_BOUNDARY / NOT_ACCEPTANCE',
    specId: SPEC_ID,
    subjectCommit: trace.subjectCommit,
    parentCommit: PLAN_COMMIT,
    specRevision: SPEC_REVISION,
    traceDigest,
    evidenceDigest,
    briefIdentity: `EWF00-PREFLIGHT-001/${trace.subjectCommit}`,
    extensions: {
      canonicalPackageId: 'EWF-00',
      approvedPlanPath: PLAN_PATH,
      approvedPlanCommit: PLAN_COMMIT,
      approvedPlanBlob: PLAN_BLOB,
      approvedPlanParent: PLAN_PARENT,
      allowlist: [...ALLOWLIST],
      exclusions: [...EXCLUSIONS],
      verificationManifestDigest: manifest.extensions.verificationManifestDigest,
      requiredCommands: [{
        id: command.id,
        declarationDigest: command.declarationDigest,
        argv: [...command.argv],
        cwd: command.cwd,
        inheritEnvironment: [...command.inheritEnvironment],
        environment: clone(command.environment),
        timeoutMs: command.timeoutMs,
        toolRequirement: command.toolRequirement,
        requiredResult: 'PASS'
      }]
    },
    briefDigest: null
  };
  brief.briefDigest = digestArtifact(withoutBriefDigest(brief));
  return { brief, trace, command, manifest };
}

test('contract constants preserve the frozen result and policy vocabularies', () => {
  assert.deepEqual(PREFLIGHT_RESULTS, ['PASS', 'BLOCKED']);
  assert.deepEqual(REMOTE_COLLISION_POLICIES, ['REQUIRE_ABSENT', 'REQUIRE_EXACT_SHA']);
  assert.deepEqual(TOOL_REQUIREMENTS, ['REQUIRED', 'OPTIONAL']);
  assert.deepEqual(COMMAND_RESULTS, ['PASS', 'FAIL', 'ERROR', 'NOT_RUN', 'NOT_AVAILABLE']);
});

test('future templates stay subordinate and do not embed Connector Governance Stage 0', async () => {
  const [preflight, trace] = await Promise.all([
    readFile(new URL('../.specify/templates/ewf/preflight-result.template.json', import.meta.url), 'utf8'),
    readFile(new URL('../.specify/templates/ewf/trace-manifest.template.json', import.meta.url), 'utf8')
  ]).then((values) => values.map(JSON.parse));

  assert.equal(preflight.schemaVersion, 1);
  assert.equal(preflight.artifactKind, 'preflight-result');
  assert.match(preflight.authorityLabel, /NOT_ACCEPTANCE|NOT_AUTHORIZATION/);
  assert.equal(trace.schemaVersion, 1);
  assert.equal(trace.artifactKind, 'trace-manifest');
  assert.match(trace.authorityLabel, /NOT_ACCEPTANCE/);

  for (const template of [preflight, trace]) {
    assert.equal(Object.hasOwn(template, 'openPrRows'), false);
    assert.equal(Object.hasOwn(template, 'openPrRegistryDigest'), false);
    assert.equal(Object.hasOwn(template, 'auditResult'), false);
    assert.equal(Object.hasOwn(template, 'packageStatus'), false);
  }
});

test('a complete local observation produces a deterministic portable PASS result', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const declaration = makeDeclaration(root);
    const observation = makeObservation(root);
    const first = await evaluatePreflight(declaration, observation);
    const second = await evaluatePreflight(clone(declaration), clone(observation));

    assert.equal(first.result, 'PASS');
    assert.deepEqual(first.diagnostics, []);
    assert.deepEqual(first, second);
    assertPortableDigest(first);
    assert.equal(Object.hasOwn(first, 'auditResult'), false);
    assert.equal(Object.hasOwn(first, 'verdict'), false);
    assert.equal(Object.hasOwn(first, 'packageStatus'), false);
  });
});

const BLOCKING_FIXTURES = [
  {
    name: 'wrong repository',
    code: 'REPOSITORY_IDENTITY_MISMATCH',
    mutate: ({ observation }) => { observation.repository = 'Other/Repository'; }
  },
  {
    name: 'wrong repository root',
    code: 'REPOSITORY_ROOT_MISMATCH',
    mutate: ({ observation, root }) => { observation.repositoryRoot = `${root}-other`; }
  },
  {
    name: 'missing required canonical file',
    code: 'MISSING_CANONICAL_FILE',
    mutate: ({ observation }) => { observation.canonicalFiles[0].exists = false; }
  },
  {
    name: 'canonical path escaping root',
    code: 'CANONICAL_PATH_OUTSIDE_ROOT',
    mutate: ({ declaration }) => { declaration.requiredCanonicalFiles[0] = '../AGENTS.md'; }
  },
  {
    name: 'wrong HEAD',
    code: 'HEAD_MISMATCH',
    mutate: ({ observation }) => { observation.head = 'd'.repeat(40); }
  },
  {
    name: 'wrong predecessor parent',
    code: 'PARENT_OBSERVATION_MISMATCH',
    mutate: ({ observation }) => { observation.parent = 'e'.repeat(40); }
  },
  {
    name: 'detached symbolic ref',
    code: 'DETACHED_HEAD',
    mutate: ({ observation }) => { observation.symbolicRef = null; }
  },
  {
    name: 'wrong symbolic ref',
    code: 'SYMBOLIC_REF_MISMATCH',
    mutate: ({ observation }) => { observation.symbolicRef = 'refs/heads/wrong'; }
  },
  {
    name: 'wrong local target ref',
    code: 'LOCAL_TARGET_REF_MISMATCH',
    mutate: ({ observation }) => { observation.localTargetRef.ref = 'refs/heads/wrong'; }
  },
  {
    name: 'local target ref at wrong SHA',
    code: 'LOCAL_TARGET_REF_SHA_MISMATCH',
    mutate: ({ observation }) => { observation.localTargetRef.sha = 'f'.repeat(40); }
  },
  {
    name: 'wrong worktree identity',
    code: 'WORKTREE_IDENTITY_MISMATCH',
    mutate: ({ observation, root }) => { observation.worktrees.rows[0].path = `${root}-other`; }
  },
  {
    name: 'multiple declared worktrees',
    code: 'MULTIPLE_IMPLEMENTATION_WORKTREES',
    mutate: ({ observation, root }) => {
      observation.worktrees.rows.push({
        path: `${root}-second`,
        head: PLAN_COMMIT,
        branchRef: IMPLEMENTATION_REF
      });
    }
  },
  {
    name: 'malformed worktree registry',
    code: 'MALFORMED_WORKTREE_OBSERVATION',
    mutate: ({ observation }) => { observation.worktrees.complete = false; }
  },
  {
    name: 'dirty tracked worktree',
    code: 'DIRTY_TRACKED_WORKTREE',
    mutate: ({ observation }) => { observation.status.tracked = ['scripts/ewf-preflight-trace.mjs']; }
  },
  {
    name: 'staged index change',
    code: 'DIRTY_INDEX',
    mutate: ({ observation }) => { observation.status.index = ['tests/ewf-preflight-verification-trace.test.mjs']; }
  },
  {
    name: 'dirty untracked worktree',
    code: 'DIRTY_UNTRACKED_WORKTREE',
    mutate: ({ observation }) => { observation.status.untracked = ['debug.log']; }
  },
  {
    name: 'malformed status observation',
    code: 'MALFORMED_STATUS_OBSERVATION',
    mutate: ({ observation }) => { observation.status.complete = false; }
  },
  {
    name: 'missing writer',
    code: 'MISSING_WRITER',
    mutate: ({ declaration }) => { delete declaration.writer; }
  },
  {
    name: 'wrong writer',
    code: 'WRITER_IDENTITY_MISMATCH',
    mutate: ({ observation }) => { observation.writer = 'another-writer'; }
  },
  {
    name: 'non-exclusive writer mode',
    code: 'WRITER_MODE_MISMATCH',
    mutate: ({ observation }) => { observation.writerMode = 'shared'; }
  },
  {
    name: 'missing writer registry',
    code: 'MISSING_WRITER_REGISTRY',
    mutate: ({ declaration }) => { delete declaration.activeWriterRegistry; }
  },
  {
    name: 'incomplete writer registry',
    code: 'INCOMPLETE_WRITER_REGISTRY',
    mutate: ({ observation }) => { observation.activeWriterRegistry.complete = false; }
  },
  {
    name: 'file overlap',
    code: 'FILE_OVERLAP',
    mutate: ({ observation }) => { observation.overlaps.files = [ALLOWLIST[0]]; }
  },
  {
    name: 'semantic overlap',
    code: 'SEMANTIC_OVERLAP',
    mutate: ({ observation }) => { observation.overlaps.semanticKeys = [SEMANTIC_KEYS[0]]; }
  },
  {
    name: 'remote target collision',
    code: 'REMOTE_TARGET_COLLISION',
    mutate: ({ observation }) => {
      observation.remote.state = 'PRESENT';
      observation.remote.sha = '1'.repeat(40);
      observation.remote.rows = [{ ref: IMPLEMENTATION_REF, sha: observation.remote.sha }];
    }
  },
  {
    name: 'remote observation failure',
    code: 'REMOTE_OBSERVATION_ERROR',
    mutate: ({ observation }) => { observation.remote.complete = false; }
  },
  {
    name: 'malformed remote row',
    code: 'MALFORMED_REMOTE_OBSERVATION',
    mutate: ({ observation }) => { observation.remote.rows = [{ raw: 'malformed' }]; }
  },
  {
    name: 'broken canonical entry gate',
    code: 'CANONICAL_GATE_MISMATCH',
    mutate: ({ observation }) => {
      observation.canonicalEntryGateResults[0].observed = 'IMPLEMENTED';
    }
  },
  {
    name: 'allowlist mismatch',
    code: 'ALLOWLIST_MISMATCH',
    mutate: ({ declaration }) => { declaration.allowlist = declaration.allowlist.slice(0, -1); }
  },
  {
    name: 'exclusion mismatch',
    code: 'EXCLUSION_MISMATCH',
    mutate: ({ declaration }) => { declaration.exclusions = declaration.exclusions.slice(1); }
  },
  {
    name: 'attempted out-of-bound write',
    code: 'OUT_OF_BOUND_WRITE',
    mutate: ({ observation }) => { observation.requestedChanges.push('src/app.js'); }
  }
];

for (const fixture of BLOCKING_FIXTURES) {
  test(`preflight blocks ${fixture.name} with zero side effects`, async () => {
    await withDisposableRepositoryRoot(async (root) => {
      const declaration = makeDeclaration(root);
      const observation = makeObservation(root);
      fixture.mutate({ declaration, observation, root });
      const effects = emptyEffects();

      const result = await runPreflight(declaration, {
        observation,
        initialize: async () => { effects.gitMutations += 1; },
        writeContent: async () => { effects.contentWrites += 1; },
        writeIndex: async () => { effects.indexWrites += 1; },
        mutateGit: async () => { effects.gitMutations += 1; },
        mutateBranch: async () => { effects.branchMutations += 1; },
        installTool: async () => { effects.installations += 1; },
        retry: async () => { effects.retries += 1; },
        remediate: async () => { effects.remediations += 1; },
        emitAcceptance: async () => { effects.acceptanceOutputs += 1; }
      });

      assert.equal(result.result, 'BLOCKED');
      assert.ok(diagnosticCodes(result).includes(fixture.code), JSON.stringify(result.diagnostics));
      assertZeroEffects(effects);
      assertPortableDigest(result);
    });
  });
}

test('diagnostics are deterministic regardless of unordered overlap input', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const declaration = makeDeclaration(root);
    const firstObservation = makeObservation(root);
    firstObservation.head = '1'.repeat(40);
    firstObservation.parent = '2'.repeat(40);
    firstObservation.overlaps.files = [ALLOWLIST[1], ALLOWLIST[0]];
    firstObservation.overlaps.semanticKeys = [SEMANTIC_KEYS[1], SEMANTIC_KEYS[0]];

    const secondObservation = clone(firstObservation);
    secondObservation.overlaps.files.reverse();
    secondObservation.overlaps.semanticKeys.reverse();

    const first = await evaluatePreflight(declaration, firstObservation);
    const second = await evaluatePreflight(clone(declaration), secondObservation);
    assert.deepEqual(first.diagnostics, second.diagnostics);
    assert.deepEqual(first, second);
  });
});

test('raw Connector Governance Stage 0 metadata cannot substitute for local adapter evidence', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const stage0 = makeStage0Record();
    for (const forbidden of [
      'openPrRegistryDigest',
      'contentDigest',
      'declarationDigest',
      'verificationManifestDigest',
      'commandResults',
      'localGitOutput',
      'localFilesystemOutput'
    ]) assert.equal(Object.hasOwn(stage0, forbidden), false, forbidden);

    const result = await evaluatePreflight(makeDeclaration(root), stage0);
    assert.equal(result.result, 'BLOCKED');
    assert.ok(diagnosticCodes(result).includes('CONNECTOR_STAGE0_NOT_LOCAL_EVIDENCE'));
    assertPortableDigest(result);
  });
});

test('verification executes exact argv once with shell disabled and binds declaration identity', async () => {
  const declaration = makeCommandDeclaration();
  const manifest = makeVerificationManifest(declaration);
  const calls = [];
  const result = await executeVerificationProfile(manifest, 'focused', {
    spawn: async (request) => {
      calls.push(clone(request));
      return {
        exitCode: 0,
        signal: null,
        timedOut: false,
        stdout: 'ok',
        stderr: '',
        durationMs: 12
      };
    }
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].argv, declaration.argv);
  assert.equal(calls[0].cwd, declaration.cwd);
  assert.equal(calls[0].shell, false);
  assert.equal(calls[0].timeoutMs, declaration.timeoutMs);
  assert.deepEqual(calls[0].inheritEnvironment, declaration.inheritEnvironment);
  assert.deepEqual(calls[0].environment, declaration.environment);

  assert.equal(result.commandResults.length, 1);
  assert.equal(result.commandResults[0].result, 'PASS');
  assert.equal(result.commandResults[0].declarationDigest, declaration.declarationDigest);
  assert.equal(
    result.commandResults[0].verificationManifestDigest,
    manifest.extensions.verificationManifestDigest
  );
  assert.deepEqual(result.commandResults[0].argv, declaration.argv);
  assertPortableDigest(result.commandResults[0]);
});

const VERIFICATION_CLASSIFICATIONS = [
  {
    name: 'successful exit',
    outcome: { exitCode: 0, signal: null, timedOut: false, stdout: '', stderr: '', durationMs: 1 },
    expected: 'PASS'
  },
  {
    name: 'ordinary non-zero exit',
    outcome: { exitCode: 1, signal: null, timedOut: false, stdout: '', stderr: 'failure', durationMs: 1 },
    expected: 'FAIL'
  },
  {
    name: 'missing executable',
    outcome: { errorCode: 'ENOENT', exitCode: null, signal: null, timedOut: false, stdout: '', stderr: '', durationMs: 1 },
    expected: 'NOT_AVAILABLE'
  },
  {
    name: 'timeout',
    outcome: { exitCode: null, signal: 'SIGTERM', timedOut: true, stdout: '', stderr: '', durationMs: 120000 },
    expected: 'ERROR'
  },
  {
    name: 'process crash',
    outcome: { exitCode: null, signal: 'SIGSEGV', timedOut: false, stdout: '', stderr: '', durationMs: 1 },
    expected: 'ERROR'
  },
  {
    name: 'infrastructure failure',
    outcome: { errorCode: 'EACCES', exitCode: null, signal: null, timedOut: false, stdout: '', stderr: '', durationMs: 1 },
    expected: 'ERROR'
  }
];

for (const fixture of VERIFICATION_CLASSIFICATIONS) {
  test(`verification preserves ${fixture.expected} for ${fixture.name} without retry`, async () => {
    const declaration = makeCommandDeclaration();
    const manifest = makeVerificationManifest(declaration);
    let attempts = 0;
    const result = await executeVerificationProfile(manifest, 'focused', {
      spawn: async () => {
        attempts += 1;
        return clone(fixture.outcome);
      }
    });
    assert.equal(attempts, 1);
    assert.equal(result.commandResults[0].result, fixture.expected);
    assert.equal(result.commandResults[0].declarationDigest, declaration.declarationDigest);
  });
}

test('verification rejects declaration or manifest digest drift before process execution', async () => {
  for (const mutate of [
    (manifest) => { manifest.commands.focused[0].argv = ['node', '--version']; },
    (manifest) => { manifest.commands.focused[0].timeoutMs = 1; },
    (manifest) => { manifest.extensions.verificationManifestDigest = '0'.repeat(64); }
  ]) {
    const manifest = makeVerificationManifest();
    mutate(manifest);
    let attempts = 0;
    const result = await executeVerificationProfile(manifest, 'focused', {
      spawn: async () => {
        attempts += 1;
        return { exitCode: 0, durationMs: 1 };
      }
    });
    assert.equal(attempts, 0);
    assert.equal(result.valid, false);
    assert.ok(result.diagnostics.some((diagnostic) =>
      ['DECLARATION_DIGEST_MISMATCH', 'VERIFICATION_MANIFEST_DIGEST_MISMATCH'].includes(diagnostic.code)
    ));
  }
});

test('trace validates requirement to test to exact command declaration to evidence', () => {
  const trace = makeTraceManifest();
  const result = validateTraceManifest(trace, {
    subjectCommit: trace.subjectCommit,
    parentCommit: trace.parentCommit,
    specRevision: SPEC_REVISION,
    verificationManifestDigest: trace.verificationManifestDigest
  });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.deepEqual(result.errors, []);
  assert.equal(Object.hasOwn(result, 'auditResult'), false);
  assert.equal(Object.hasOwn(result, 'verdict'), false);
});

const TRACE_DEFECTS = [
  {
    name: 'duplicate requirement ID',
    code: 'DUPLICATE_REQUIREMENT_ID',
    mutate: (trace) => { trace.requirements.push(clone(trace.requirements[0])); }
  },
  {
    name: 'duplicate test ID',
    code: 'DUPLICATE_TEST_ID',
    mutate: (trace) => { trace.tests.push(clone(trace.tests[0])); }
  },
  {
    name: 'broken test reference',
    code: 'BROKEN_TEST_REFERENCE',
    mutate: (trace) => { trace.requirements[0].tests = ['UNKNOWN-TEST']; }
  },
  {
    name: 'broken command reference',
    code: 'BROKEN_COMMAND_REFERENCE',
    mutate: (trace) => { trace.tests[0].commands = ['unknown-command']; }
  },
  {
    name: 'missing required evidence',
    code: 'MISSING_REQUIRED_EVIDENCE',
    mutate: (trace) => { trace.evidence = []; }
  },
  {
    name: 'command declaration digest mismatch',
    code: 'DECLARATION_DIGEST_MISMATCH',
    mutate: (trace) => { trace.commands[0].declarationDigest = '0'.repeat(64); }
  },
  {
    name: 'evidence subject mismatch',
    code: 'EVIDENCE_SUBJECT_MISMATCH',
    mutate: (trace) => { trace.evidence[0].subjectCommit = '9'.repeat(40); }
  },
  {
    name: 'evidence content digest mismatch',
    code: 'CONTENT_DIGEST_MISMATCH',
    mutate: (trace) => { trace.evidence[0].contentDigest = '0'.repeat(64); }
  },
  {
    name: 'shared test without rationale',
    code: 'MISSING_SHARED_SCOPE_RATIONALE',
    mutate: (trace) => { trace.tests[0].scope = 'SHARED'; }
  },
  {
    name: 'Connector Stage 0 used as command evidence',
    code: 'CONNECTOR_STAGE0_NOT_COMMAND_EVIDENCE',
    mutate: (trace) => { trace.evidence[0] = makeStage0Record(); }
  }
];

for (const fixture of TRACE_DEFECTS) {
  test(`trace reports ${fixture.name}`, () => {
    const trace = makeTraceManifest();
    fixture.mutate(trace);
    const result = validateTraceManifest(trace, {
      subjectCommit: trace.subjectCommit,
      parentCommit: trace.parentCommit,
      specRevision: SPEC_REVISION,
      verificationManifestDigest: trace.verificationManifestDigest
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.code === fixture.code), JSON.stringify(result.errors));
  });
}

test('frozen handoff binds plan, subject, digests, boundary, declarations and required results', () => {
  const { brief, trace, command, manifest } = makeFrozenBrief();
  const bindings = {
    canonicalPackageId: 'EWF-00',
    specId: SPEC_ID,
    subjectCommit: brief.subjectCommit,
    parentCommit: brief.parentCommit,
    specRevision: brief.specRevision,
    traceDigest: brief.traceDigest,
    evidenceDigest: brief.evidenceDigest,
    briefDigest: brief.briefDigest,
    approvedPlanPath: PLAN_PATH,
    approvedPlanCommit: PLAN_COMMIT,
    approvedPlanBlob: PLAN_BLOB,
    approvedPlanParent: PLAN_PARENT,
    allowlist: [...ALLOWLIST],
    exclusions: [...EXCLUSIONS],
    actualChangedFiles: [...ALLOWLIST],
    verificationManifestDigest: manifest.extensions.verificationManifestDigest,
    requiredCommandResults: [{
      id: command.id,
      declarationDigest: command.declarationDigest,
      result: 'PASS'
    }],
    trace
  };
  const result = validateFrozenHandoff(brief, bindings);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(Object.hasOwn(result, 'auditResult'), false);
  assert.equal(Object.hasOwn(result, 'verdict'), false);
});

const BRIEF_MISMATCHES = [
  ['approved plan path', 'PLAN_PATH_MISMATCH', (bindings) => { bindings.approvedPlanPath = 'docs/wrong.md'; }],
  ['approved plan commit', 'PLAN_COMMIT_MISMATCH', (bindings) => { bindings.approvedPlanCommit = '0'.repeat(40); }],
  ['approved plan blob', 'PLAN_BLOB_MISMATCH', (bindings) => { bindings.approvedPlanBlob = '0'.repeat(40); }],
  ['approved plan parent', 'PLAN_PARENT_MISMATCH', (bindings) => { bindings.approvedPlanParent = '0'.repeat(40); }],
  ['subject commit', 'SUBJECT_COMMIT_MISMATCH', (bindings) => { bindings.subjectCommit = '0'.repeat(40); }],
  ['parent commit', 'PARENT_COMMIT_MISMATCH', (bindings) => { bindings.parentCommit = '0'.repeat(40); }],
  ['spec revision', 'SPEC_REVISION_MISMATCH', (bindings) => { bindings.specRevision = 'wrong'; }],
  ['trace digest', 'TRACE_DIGEST_MISMATCH', (bindings) => { bindings.traceDigest = '0'.repeat(64); }],
  ['evidence digest', 'EVIDENCE_DIGEST_MISMATCH', (bindings) => { bindings.evidenceDigest = '0'.repeat(64); }],
  ['brief digest', 'BRIEF_DIGEST_MISMATCH', (bindings) => { bindings.briefDigest = '0'.repeat(64); }],
  ['allowlist', 'ALLOWLIST_MISMATCH', (bindings) => { bindings.allowlist = bindings.allowlist.slice(0, -1); }],
  ['exclusions', 'EXCLUSION_MISMATCH', (bindings) => { bindings.exclusions = bindings.exclusions.slice(1); }],
  ['actual changed files', 'CHANGED_FILE_BOUNDARY_MISMATCH', (bindings) => { bindings.actualChangedFiles.push('src/app.js'); }],
  ['verification manifest', 'VERIFICATION_MANIFEST_DIGEST_MISMATCH', (bindings) => { bindings.verificationManifestDigest = '0'.repeat(64); }],
  ['required command declaration', 'REQUIRED_COMMAND_DECLARATION_MISMATCH', (bindings) => { bindings.requiredCommandResults[0].declarationDigest = '0'.repeat(64); }],
  ['required command result', 'REQUIRED_COMMAND_NOT_PASS', (bindings) => { bindings.requiredCommandResults[0].result = 'NOT_RUN'; }]
];

for (const [name, code, mutate] of BRIEF_MISMATCHES) {
  test(`frozen handoff blocks ${name} mismatch without product verdict`, () => {
    const { brief, trace, command, manifest } = makeFrozenBrief();
    const bindings = {
      canonicalPackageId: 'EWF-00',
      specId: SPEC_ID,
      subjectCommit: brief.subjectCommit,
      parentCommit: brief.parentCommit,
      specRevision: brief.specRevision,
      traceDigest: brief.traceDigest,
      evidenceDigest: brief.evidenceDigest,
      briefDigest: brief.briefDigest,
      approvedPlanPath: PLAN_PATH,
      approvedPlanCommit: PLAN_COMMIT,
      approvedPlanBlob: PLAN_BLOB,
      approvedPlanParent: PLAN_PARENT,
      allowlist: [...ALLOWLIST],
      exclusions: [...EXCLUSIONS],
      actualChangedFiles: [...ALLOWLIST],
      verificationManifestDigest: manifest.extensions.verificationManifestDigest,
      requiredCommandResults: [{
        id: command.id,
        declarationDigest: command.declarationDigest,
        result: 'PASS'
      }],
      trace
    };
    mutate(bindings);
    const result = validateFrozenHandoff(brief, bindings);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.code === code), JSON.stringify(result.errors));
    assert.equal(Object.hasOwn(result, 'auditResult'), false);
    assert.equal(Object.hasOwn(result, 'verdict'), false);
  });
}

test('portable evidence redacts secrets and private absolute paths before digesting', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const declaration = makeDeclaration(root);
    const observation = makeObservation(root);
    observation.portableFixture = {
      repositoryRelativePath: 'tests/ewf-preflight-verification-trace.test.mjs',
      privatePosixPath: '/home/alice/VocabMaster/.env',
      privateWindowsPath: 'C:\\Users\\Alice\\VocabMaster\\secret.txt',
      apiKey: 'plain-secret-value',
      authenticatedUrl: 'https://alice:password@example.com/private'
    };

    const result = await evaluatePreflight(declaration, observation);
    const serialized = canonicalizeArtifact(result);
    assert.doesNotMatch(serialized, /plain-secret-value|alice:password|C:\\\\Users\\\\Alice|\/home\/alice/);
    assert.match(serialized, /tests\/ewf-preflight-verification-trace\.test\.mjs/);
    assert.match(serialized, /REDACTED_SECRET|REDACTED_ABSOLUTE_PATH|REDACTED_CREDENTIALS/);
    assertPortableDigest(result);
  });
});

const PVT_REQUIREMENT_IDS = Object.freeze(
  Array.from({ length: 12 }, (_entry, index) => `EWF00-PVT-${String(index + 1).padStart(2, '0')}`)
);

function makeCompleteTraceManifest() {
  const trace = makeTraceManifest();
  trace.requirements = PVT_REQUIREMENT_IDS.map((id, index) => ({
    id,
    tests: [`EWF00-TEST-${String(index + 1).padStart(3, '0')}`],
    disposition: 'REQUIRED'
  }));
  trace.tests = PVT_REQUIREMENT_IDS.map((_id, index) => ({
    id: `EWF00-TEST-${String(index + 1).padStart(3, '0')}`,
    commands: [trace.commands[0].id],
    scope: 'LOCAL'
  }));
  return trace;
}

function rewriteTraceEvidence(trace, mutate) {
  const payload = omit(trace.evidence[0], 'contentDigest');
  mutate(payload);
  trace.evidence[0] = attachContentDigest(payload);
}

function makeFrozenHandoffBindings(fixture = makeFrozenBrief()) {
  const { brief, trace, command, manifest } = fixture;
  return {
    canonicalPackageId: 'EWF-00',
    specId: SPEC_ID,
    subjectCommit: brief.subjectCommit,
    parentCommit: brief.parentCommit,
    specRevision: brief.specRevision,
    traceDigest: brief.traceDigest,
    evidenceDigest: brief.evidenceDigest,
    briefIdentity: brief.briefIdentity,
    briefDigest: brief.briefDigest,
    approvedPlanPath: PLAN_PATH,
    approvedPlanCommit: PLAN_COMMIT,
    approvedPlanBlob: PLAN_BLOB,
    approvedPlanParent: PLAN_PARENT,
    allowlist: [...ALLOWLIST],
    exclusions: [...EXCLUSIONS],
    actualChangedFiles: [...ALLOWLIST],
    verificationManifestDigest: manifest.extensions.verificationManifestDigest,
    requiredCommandResults: [{
      id: command.id,
      declarationDigest: command.declarationDigest,
      argv: [...command.argv],
      cwd: command.cwd,
      inheritEnvironment: [...command.inheritEnvironment],
      environment: clone(command.environment),
      timeoutMs: command.timeoutMs,
      toolRequirement: command.toolRequirement,
      result: 'PASS'
    }],
    trace
  };
}

function assertNoAuthorityFields(result) {
  for (const field of [
    'acceptance',
    'auditResult',
    'packageStatus',
    'releaseSafety',
    'pilotAuthorization',
    'verdict'
  ]) assert.equal(Object.hasOwn(result, field), false, field);
}

const ADDITIONAL_BLOCKING_FIXTURES = [
  {
    name: 'incomplete local observation',
    code: 'INCOMPLETE_PREFLIGHT_OBSERVATION',
    mutate: ({ observation }) => { observation.complete = false; }
  },
  {
    name: 'canonical file identity outside its declared slot',
    code: 'CANONICAL_FILE_IDENTITY_MISMATCH',
    mutate: ({ observation, root }) => {
      observation.canonicalFiles[0].absolutePath = resolve(root, 'docs/ROADMAP.md');
    }
  },
  {
    name: 'worktree registry without rows',
    code: 'MALFORMED_WORKTREE_OBSERVATION',
    mutate: ({ observation }) => { observation.worktrees.rows = null; }
  },
  {
    name: 'status registry without tracked rows',
    code: 'MALFORMED_STATUS_OBSERVATION',
    mutate: ({ observation }) => { observation.status.tracked = null; }
  },
  {
    name: 'missing observed writer registry',
    code: 'MISSING_WRITER_REGISTRY',
    mutate: ({ observation }) => { delete observation.activeWriterRegistry; }
  },
  {
    name: 'wrong remote repository identity',
    code: 'REMOTE_REPOSITORY_IDENTITY_MISMATCH',
    mutate: ({ observation }) => {
      observation.remote.repository = 'Other/Repository';
      observation.remote.url = 'https://github.com/Other/Repository.git';
    }
  },
  {
    name: 'wrong remote URL identity',
    code: 'REMOTE_REPOSITORY_IDENTITY_MISMATCH',
    mutate: ({ observation }) => {
      observation.remote.url = 'git@github.com:Other/Repository.git';
    }
  },
  {
    name: 'observed exclusion mismatch',
    code: 'EXCLUSION_MISMATCH',
    mutate: ({ observation }) => { observation.exclusions = observation.exclusions.slice(1); }
  },
  {
    name: 'exact-SHA remote policy mismatch',
    code: 'REMOTE_TARGET_SHA_MISMATCH',
    mutate: ({ declaration, observation }) => {
      declaration.remoteCollisionPolicy = 'REQUIRE_EXACT_SHA';
      declaration.remoteExpectedState = 'PRESENT';
      declaration.remoteExpectedSha = '1'.repeat(40);
      observation.remote.state = 'PRESENT';
      observation.remote.sha = '2'.repeat(40);
      observation.remote.rows = [{ ref: IMPLEMENTATION_REF, sha: observation.remote.sha }];
    }
  }
];

for (const fixture of ADDITIONAL_BLOCKING_FIXTURES) {
  test(`extended preflight blocks ${fixture.name} with the complete zero-effect vector`, async () => {
    await withDisposableRepositoryRoot(async (root) => {
      const declaration = makeDeclaration(root);
      const observation = makeObservation(root);
      fixture.mutate({ declaration, observation, root });
      const effects = emptyEffects();
      const result = await runPreflight(declaration, {
        observation,
        initialize: async () => { effects.gitMutations += 1; },
        writeContent: async () => { effects.contentWrites += 1; },
        writeIndex: async () => { effects.indexWrites += 1; },
        mutateGit: async () => { effects.gitMutations += 1; },
        mutateBranch: async () => { effects.branchMutations += 1; },
        installTool: async () => { effects.installations += 1; },
        retry: async () => { effects.retries += 1; },
        remediate: async () => { effects.remediations += 1; },
        emitAcceptance: async () => { effects.acceptanceOutputs += 1; }
      });
      assert.equal(result.result, 'BLOCKED');
      assert.ok(diagnosticCodes(result).includes(fixture.code), JSON.stringify(result.diagnostics));
      assertZeroEffects(effects);
      assertZeroEffects(result.effects);
      assertPortableDigest(result);
    });
  });
}

const VERIFICATION_DECLARATION_MATRIX = [
  {
    name: 'exact command ID with wrong argv',
    codes: ['DECLARATION_DIGEST_MISMATCH'],
    mutate: (command) => { command.argv = ['node', '--version']; }
  },
  {
    name: 'wrong cwd',
    codes: ['DECLARATION_DIGEST_MISMATCH'],
    mutate: (command) => { command.cwd = '../outside'; }
  },
  {
    name: 'wrong inherited-environment allowlist',
    codes: ['INVALID_INHERITED_ENVIRONMENT', 'DECLARATION_DIGEST_MISMATCH'],
    mutate: (command) => { command.inheritEnvironment.push('NODE_OPTIONS'); }
  },
  {
    name: 'wrong explicit environment',
    codes: ['DECLARATION_DIGEST_MISMATCH'],
    mutate: (command) => { command.environment = { CI: 'true' }; }
  },
  {
    name: 'wrong timeout',
    codes: ['INVALID_COMMAND_TIMEOUT', 'DECLARATION_DIGEST_MISMATCH'],
    mutate: (command) => { command.timeoutMs = 0; }
  },
  {
    name: 'wrong tool requirement',
    codes: ['INVALID_TOOL_REQUIREMENT', 'DECLARATION_DIGEST_MISMATCH'],
    mutate: (command) => { command.toolRequirement = 'FORBIDDEN'; }
  }
];

for (const fixture of VERIFICATION_DECLARATION_MATRIX) {
  test(`verification blocks ${fixture.name} before spawn`, async () => {
    const manifest = makeVerificationManifest();
    fixture.mutate(manifest.commands.focused[0]);
    let attempts = 0;
    const result = await executeVerificationProfile(manifest, 'focused', {
      spawn: async () => {
        attempts += 1;
        return { exitCode: 0, durationMs: 1 };
      }
    });
    assert.equal(attempts, 0);
    assert.equal(result.valid, false);
    for (const code of fixture.codes) {
      assert.ok(diagnosticCodes(result).includes(code), `${fixture.name}: ${JSON.stringify(result.diagnostics)}`);
    }
  });
}

test('verification blocks a missing profile before process execution', async () => {
  let attempts = 0;
  const result = await executeVerificationProfile(makeVerificationManifest(), 'release', {
    spawn: async () => {
      attempts += 1;
      return { exitCode: 0, durationMs: 1 };
    }
  });
  assert.equal(attempts, 0);
  assert.equal(result.valid, false);
  assert.ok(diagnosticCodes(result).includes('MISSING_VERIFICATION_PROFILE'));
});

test('verification rejects an empty declared profile instead of fabricating a zero-command pass', async () => {
  let manifest = makeVerificationManifest();
  manifest.commands.focused = [];
  manifest = withManifestDigest(manifest);
  let attempts = 0;
  const result = await executeVerificationProfile(manifest, 'focused', {
    spawn: async () => {
      attempts += 1;
      return { exitCode: 0, durationMs: 1 };
    }
  });
  assert.equal(attempts, 0);
  assert.equal(result.valid, false);
  assert.ok(diagnosticCodes(result).includes('MISSING_VERIFICATION_PROFILE'));
});

test('verification rejects duplicate command IDs before spawn', async () => {
  const command = makeCommandDeclaration();
  let manifest = makeVerificationManifest(command);
  manifest.commands.focused.push(clone(command));
  manifest = withManifestDigest(manifest);
  let attempts = 0;
  const result = await executeVerificationProfile(manifest, 'focused', {
    spawn: async () => {
      attempts += 1;
      return { exitCode: 0, durationMs: 1 };
    }
  });
  assert.equal(attempts, 0);
  assert.equal(result.valid, false);
  assert.ok(diagnosticCodes(result).includes('DUPLICATE_COMMAND_ID'));
});

test('verification rejects a missing process boundary without command discovery', async () => {
  const result = await executeVerificationProfile(makeVerificationManifest(), 'focused');
  assert.equal(result.valid, false);
  assert.deepEqual(result.commandResults, []);
  assert.ok(diagnosticCodes(result).includes('MISSING_PROCESS_BOUNDARY'));
});

test('optional unavailable tool remains NOT_AVAILABLE without fabricating PASS', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const declaration = makeDeclaration(root);
    declaration.verificationManifest = makeVerificationManifest(
      makeCommandDeclaration({ toolRequirement: 'OPTIONAL' })
    );
    const result = await runPreflight(declaration, {
      observation: makeObservation(root),
      spawn: async () => ({
        errorCode: 'ENOENT',
        exitCode: null,
        signal: null,
        timedOut: false,
        stdout: '',
        stderr: '',
        durationMs: 1
      })
    });
    assert.equal(result.result, 'PASS');
    assert.equal(result.verification.commandResults[0].result, 'NOT_AVAILABLE');
    assert.notEqual(result.verification.commandResults[0].result, 'PASS');
  });
});

test('required unavailable tool blocks the preflight handoff after exactly one attempt', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const declaration = makeDeclaration(root);
    let attempts = 0;
    const result = await runPreflight(declaration, {
      observation: makeObservation(root),
      spawn: async () => {
        attempts += 1;
        return {
          errorCode: 'ENOENT',
          exitCode: null,
          signal: null,
          timedOut: false,
          stdout: '',
          stderr: '',
          durationMs: 1
        };
      }
    });
    assert.equal(attempts, 1);
    assert.equal(result.result, 'BLOCKED');
    assert.equal(result.verification.commandResults[0].result, 'NOT_AVAILABLE');
    assert.ok(diagnosticCodes(result).includes('REQUIRED_VERIFICATION_NOT_PASS'));
    assertZeroEffects(result.effects);
  });
});

test('generic thrown process-boundary exception is classified as ERROR with one attempt', async () => {
  let attempts = 0;
  const result = await executeVerificationProfile(makeVerificationManifest(), 'focused', {
    spawn: async () => {
      attempts += 1;
      const error = new Error('runner failed');
      error.code = 'EIO';
      throw error;
    }
  });
  assert.equal(attempts, 1);
  assert.equal(result.valid, true);
  assert.equal(result.commandResults[0].result, 'ERROR');
  assert.equal(result.commandResults[0].errorCode, 'EIO');
});

test('successful verification never invokes discovery, installation, retry or remediation callbacks', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const calls = {
      spawn: 0,
      discover: 0,
      install: 0,
      retry: 0,
      remediate: 0
    };
    const observation = makeObservation(root);
    observation.specKit = { available: false, source: 'synthetic-observation' };
    const result = await runPreflight(makeDeclaration(root), {
      observation,
      spawn: async (request) => {
        calls.spawn += 1;
        assert.equal(request.shell, false);
        return { exitCode: 0, signal: null, timedOut: false, stdout: '', stderr: '', durationMs: 1 };
      },
      discoverCommands: async () => { calls.discover += 1; },
      installTool: async () => { calls.install += 1; },
      retry: async () => { calls.retry += 1; },
      remediate: async () => { calls.remediate += 1; }
    });
    assert.equal(result.result, 'PASS');
    assert.deepEqual(calls, { spawn: 1, discover: 0, install: 0, retry: 0, remediate: 0 });
  });
});

test('complete trace represents every frozen EWF00-PVT-01 through EWF00-PVT-12 requirement', () => {
  const trace = makeCompleteTraceManifest();
  assert.deepEqual(trace.requirements.map(({ id }) => id), PVT_REQUIREMENT_IDS);
  const result = validateTraceManifest(trace, {
    specId: SPEC_ID,
    subjectCommit: trace.subjectCommit,
    parentCommit: trace.parentCommit,
    specRevision: trace.specRevision,
    verificationManifestDigest: trace.verificationManifestDigest
  });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

const EXTENDED_TRACE_DEFECTS = [
  {
    name: 'duplicate command ID',
    code: 'DUPLICATE_COMMAND_ID',
    mutate: (trace) => { trace.commands.push(clone(trace.commands[0])); }
  },
  {
    name: 'duplicate evidence ID',
    code: 'DUPLICATE_EVIDENCE_ID',
    mutate: (trace) => { trace.evidence.push(clone(trace.evidence[0])); }
  },
  {
    name: 'broken command to evidence reference',
    code: 'MISSING_REQUIRED_EVIDENCE',
    mutate: (trace) => { trace.commands[0].evidence = ['UNKNOWN-EVIDENCE']; }
  },
  {
    name: 'missing required command declaration',
    code: 'BROKEN_COMMAND_REFERENCE',
    mutate: (trace) => { trace.commands = []; }
  },
  {
    name: 'wrong command identity with otherwise valid evidence',
    code: 'COMMAND_EVIDENCE_MISMATCH',
    mutate: (trace) => rewriteTraceEvidence(trace, (evidence) => {
      evidence.commandId = 'different-command';
    })
  },
  {
    name: 'wrong evidence declaration digest',
    code: 'DECLARATION_DIGEST_MISMATCH',
    mutate: (trace) => rewriteTraceEvidence(trace, (evidence) => {
      evidence.declarationDigest = '0'.repeat(64);
    })
  },
  {
    name: 'wrong evidence verification-manifest digest',
    code: 'VERIFICATION_MANIFEST_DIGEST_MISMATCH',
    mutate: (trace) => rewriteTraceEvidence(trace, (evidence) => {
      evidence.verificationManifestDigest = '0'.repeat(64);
    })
  },
  {
    name: 'wrong evidence parent commit',
    code: 'EVIDENCE_PARENT_MISMATCH',
    mutate: (trace) => rewriteTraceEvidence(trace, (evidence) => {
      evidence.parentCommit = '0'.repeat(40);
    })
  },
  {
    name: 'wrong evidence specification revision',
    code: 'EVIDENCE_SPEC_REVISION_MISMATCH',
    mutate: (trace) => rewriteTraceEvidence(trace, (evidence) => {
      evidence.specRevision = 'wrong-revision';
    })
  },
  {
    name: 'invalid command result vocabulary',
    code: 'INVALID_COMMAND_RESULT',
    mutate: (trace) => rewriteTraceEvidence(trace, (evidence) => {
      evidence.result = 'GREEN';
    })
  }
];

for (const fixture of EXTENDED_TRACE_DEFECTS) {
  test(`extended trace rejects ${fixture.name}`, () => {
    const trace = makeTraceManifest();
    fixture.mutate(trace);
    const result = validateTraceManifest(trace, {
      specId: SPEC_ID,
      subjectCommit: trace.subjectCommit,
      parentCommit: trace.parentCommit,
      specRevision: trace.specRevision,
      verificationManifestDigest: trace.verificationManifestDigest
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(({ code }) => code === fixture.code), JSON.stringify(result.errors));
    assertNoAuthorityFields(result);
  });
}

const TRACE_BINDING_DEFECTS = [
  ['subject commit', 'TRACE_SUBJECT_MISMATCH', { subjectCommit: '0'.repeat(40) }],
  ['parent commit', 'TRACE_PARENT_MISMATCH', { parentCommit: '0'.repeat(40) }],
  ['specification revision', 'TRACE_SPEC_REVISION_MISMATCH', { specRevision: 'wrong' }],
  ['verification-manifest digest', 'VERIFICATION_MANIFEST_DIGEST_MISMATCH', { verificationManifestDigest: '0'.repeat(64) }]
];

for (const [name, code, override] of TRACE_BINDING_DEFECTS) {
  test(`trace blocks wrong ${name} binding`, () => {
    const trace = makeTraceManifest();
    const result = validateTraceManifest(trace, {
      specId: SPEC_ID,
      subjectCommit: trace.subjectCommit,
      parentCommit: trace.parentCommit,
      specRevision: trace.specRevision,
      verificationManifestDigest: trace.verificationManifestDigest,
      ...override
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.code === code), JSON.stringify(result.errors));
  });
}

test('frozen handoff rejects canonical package, spec and required command identity mismatches independently', () => {
  const matrix = [
    ['canonical package', 'CANONICAL_PACKAGE_MISMATCH', (bindings) => { bindings.canonicalPackageId = 'OTHER-00'; }],
    ['specification', 'SPEC_ID_MISMATCH', (bindings) => { bindings.specId = 'OTHER-SPEC'; }],
    ['required command ID', 'REQUIRED_COMMAND_DECLARATION_MISMATCH', (bindings) => {
      bindings.requiredCommandResults[0].id = 'different-command';
    }]
  ];
  for (const [name, code, mutate] of matrix) {
    const fixture = makeFrozenBrief();
    const bindings = makeFrozenHandoffBindings(fixture);
    mutate(bindings);
    const result = validateFrozenHandoff(fixture.brief, bindings);
    assert.equal(result.valid, false, name);
    assert.ok(result.errors.some((error) => error.code === code), `${name}: ${JSON.stringify(result.errors)}`);
    assertNoAuthorityFields(result);
  }
});

const HANDOFF_COMMAND_BINDING_MATRIX = [
  ['argv', (row) => { row.argv = ['node', '--version']; }],
  ['cwd', (row) => { row.cwd = '../outside'; }],
  ['inherited environment boundary', (row) => { row.inheritEnvironment = ['PATH', 'NODE_OPTIONS']; }],
  ['explicit environment boundary', (row) => { row.environment = { CI: 'true' }; }],
  ['timeout', (row) => { row.timeoutMs = 1; }],
  ['tool requirement', (row) => { row.toolRequirement = 'OPTIONAL'; }]
];

for (const [name, mutate] of HANDOFF_COMMAND_BINDING_MATRIX) {
  test(`frozen handoff blocks required command ${name} drift`, () => {
    const fixture = makeFrozenBrief();
    const bindings = makeFrozenHandoffBindings(fixture);
    mutate(bindings.requiredCommandResults[0]);
    const result = validateFrozenHandoff(fixture.brief, bindings);
    assert.equal(result.valid, false, JSON.stringify(result.errors));
    assert.ok(
      result.errors.some(({ code }) => code === 'REQUIRED_COMMAND_DECLARATION_MISMATCH'),
      `${name}: ${JSON.stringify(result.errors)}`
    );
    assertNoAuthorityFields(result);
  });
}

test('frozen handoff rejects a trace payload whose digest binding was not refreshed', () => {
  const fixture = makeFrozenBrief();
  const bindings = makeFrozenHandoffBindings(fixture);
  bindings.trace.requirements[0].disposition = 'OPTIONAL';
  const result = validateFrozenHandoff(fixture.brief, bindings);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(({ code }) => code === 'TRACE_DIGEST_MISMATCH'), JSON.stringify(result.errors));
});

test('frozen handoff rejects an evidence aggregate whose digest binding was not refreshed', () => {
  const fixture = makeFrozenBrief();
  const bindings = makeFrozenHandoffBindings(fixture);
  rewriteTraceEvidence(bindings.trace, (evidence) => { evidence.result = 'FAIL'; });
  const result = validateFrozenHandoff(fixture.brief, bindings);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(({ code }) => code === 'EVIDENCE_DIGEST_MISMATCH'), JSON.stringify(result.errors));
});

test('frozen handoff rejects a self-consistent digest with the wrong brief identity', () => {
  const fixture = makeFrozenBrief();
  fixture.brief.briefIdentity = `OTHER-SPEC/${fixture.brief.subjectCommit}`;
  fixture.brief.briefDigest = digestArtifact(withoutBriefDigest(fixture.brief));
  const bindings = makeFrozenHandoffBindings(fixture);
  const result = validateFrozenHandoff(fixture.brief, bindings);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(({ code }) => code === 'BRIEF_IDENTITY_MISMATCH'), JSON.stringify(result.errors));
  assertNoAuthorityFields(result);
});

test('valid frozen handoff result contains no acceptance, package, release, pilot or verdict surface', () => {
  const fixture = makeFrozenBrief();
  const result = validateFrozenHandoff(fixture.brief, makeFrozenHandoffBindings(fixture));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assertNoAuthorityFields(result);
});

test('static implementation boundary preserves accepted helpers and forbids duplicate engines or repository mutation', async () => {
  const sourceEntries = await Promise.all(ALLOWLIST.map(async (path) => [
    path,
    await readFile(new URL(`../${path}`, import.meta.url), 'utf8')
  ]));
  const authorizedSources = new Map(sourceEntries);
  const helperSource = await readFile(new URL('../scripts/ewf-artifacts.mjs', import.meta.url), 'utf8');
  const adapterSource = authorizedSources.get('scripts/ewf-preflight-trace.mjs');

  assert.deepEqual([...authorizedSources.keys()].sort(), [...ALLOWLIST].sort());
  for (const source of authorizedSources.values()) assert.ok(source.length > 0);
  for (const helper of [
    'COMMAND_RESULTS',
    'canonicalizeArtifact',
    'digestArtifact',
    'validateArtifact',
    'validateFrozenBrief',
    'redactPortableValue'
  ]) {
    assert.match(adapterSource, new RegExp(`\\b${helper}\\b`), helper);
    assert.match(helperSource, new RegExp(`\\b${helper}\\b`), helper);
  }

  assert.doesNotMatch(adapterSource, /from\s+['"]node:crypto['"]/);
  assert.doesNotMatch(adapterSource, /\bcreateHash\s*\(/);
  assert.doesNotMatch(adapterSource, /\bJSON\.stringify\s*\(/);
  assert.doesNotMatch(adapterSource, /\bfunction\s+(?:canonicalize|digest|redact)\w*\s*\(/i);
  assert.doesNotMatch(adapterSource, /from\s+['"]node:(?:fs|fs\/promises|child_process)['"]/);
  assert.doesNotMatch(adapterSource, /\bprocess\.(?:argv|cwd|env|exit|exitCode)\b/);
  assert.doesNotMatch(adapterSource, /\bfetch\s*\(|@octokit|api\.github\.com/i);
  assert.doesNotMatch(adapterSource, /\bgit\s+(?:rev-parse|status|worktree|remote|ls-remote)\b/i);
  assert.doesNotMatch(adapterSource, /\b(?:writeFile|appendFile|createWriteStream|unlink|rename|mkdir|rm)\s*\(/);
  assert.doesNotMatch(adapterSource, /\bwhile\s*\(/);
  assert.doesNotMatch(adapterSource, /boundaries\.(?:retry|installTool|remediate|emitAcceptance)\s*\(/);
  assert.doesNotMatch(adapterSource, /\b(?:setPackageStatus|authorizePilot|generateAcceptance|releaseSafety)\s*\(/);
  for (const path of ALLOWLIST) {
    assert.doesNotMatch(path, /^(?:\.github\/|src\/|server\/|public\/|docs\/superpowers\/evidence\/)/);
    assert.notEqual(path, 'package.json');
    assert.notEqual(path, 'package-lock.json');
  }
});

test('equivalent complete observations are byte-equivalent regardless of row ordering', async () => {
  await withDisposableRepositoryRoot(async (root) => {
    const declaration = makeDeclaration(root);
    const firstObservation = makeObservation(root);
    firstObservation.canonicalFiles.reverse();
    firstObservation.canonicalEntryGateResults.reverse();
    firstObservation.requestedChanges.reverse();
    firstObservation.exclusions.reverse();
    firstObservation.worktrees.rows.push(
      { path: `${root}-z`, head: '1'.repeat(40), branchRef: 'refs/heads/z' },
      { path: `${root}-a`, head: '2'.repeat(40), branchRef: 'refs/heads/a' }
    );
    firstObservation.activeWriterRegistry.rows.push(
      {
        writer: 'writer-z',
        writerMode: 'exclusive',
        branch: 'z',
        ref: 'refs/heads/z',
        worktree: `${root}-z`,
        allowlist: ['docs/z.md'],
        semanticConflictKeys: ['unrelated:z']
      },
      {
        writer: 'writer-a',
        writerMode: 'exclusive',
        branch: 'a',
        ref: 'refs/heads/a',
        worktree: `${root}-a`,
        allowlist: ['docs/a.md'],
        semanticConflictKeys: ['unrelated:a']
      }
    );

    const secondObservation = clone(firstObservation);
    secondObservation.canonicalFiles.reverse();
    secondObservation.canonicalEntryGateResults.reverse();
    secondObservation.requestedChanges.reverse();
    secondObservation.exclusions.reverse();
    secondObservation.worktrees.rows.reverse();
    secondObservation.activeWriterRegistry.rows.reverse();

    const first = await evaluatePreflight(declaration, firstObservation);
    const second = await evaluatePreflight(clone(declaration), secondObservation);
    assert.equal(first.result, 'PASS');
    assert.equal(second.result, 'PASS');
    assert.equal(canonicalizeArtifact(first), canonicalizeArtifact(second));
  });
});

test('verification evidence redacts raw environment secrets while preserving portable keys', async () => {
  const command = makeCommandDeclaration({
    environment: {
      GITHUB_TOKEN: 'raw-environment-secret',
      PORTABLE_MODE: 'matrix'
    }
  });
  const result = await executeVerificationProfile(makeVerificationManifest(command), 'focused', {
    spawn: async () => ({
      exitCode: 0,
      signal: null,
      timedOut: false,
      stdout: '',
      stderr: '',
      durationMs: 1
    })
  });
  const serialized = canonicalizeArtifact(result.commandResults[0]);
  assert.doesNotMatch(serialized, /raw-environment-secret/);
  assert.match(serialized, /REDACTED_SECRET/);
  assert.match(serialized, /PORTABLE_MODE/);
  assert.match(serialized, /matrix/);
  assertPortableDigest(result.commandResults[0]);
});

test('raw Stage 0 remains a separate digest-free metadata record', () => {
  const stage0 = makeStage0Record();
  assert.equal(stage0.recordType, 'CONNECTOR_GOVERNANCE_STAGE_0_RAW_METADATA');
  assert.deepEqual(Object.keys(stage0).filter((key) => /digest/i.test(key)), []);
  assert.equal(Object.hasOwn(stage0, 'commandResults'), false);
  assert.equal(Object.hasOwn(stage0, 'localGitOutput'), false);
  assert.equal(Object.hasOwn(stage0, 'localFilesystemOutput'), false);
});
