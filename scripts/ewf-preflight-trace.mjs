import { isAbsolute, relative, resolve, sep } from 'node:path';
import {
  COMMAND_RESULTS,
  canonicalizeArtifact,
  digestArtifact,
  validateArtifact,
  validateFrozenBrief,
  redactPortableValue
} from './ewf-artifacts.mjs';

export const PREFLIGHT_RESULTS = Object.freeze(['PASS', 'BLOCKED']);
export const REMOTE_COLLISION_POLICIES = Object.freeze([
  'REQUIRE_ABSENT',
  'REQUIRE_EXACT_SHA'
]);
export const TOOL_REQUIREMENTS = Object.freeze(['REQUIRED', 'OPTIONAL']);

const REPOSITORY = 'NguyenDukKyeon/VocabMaster';
const SPEC_ID = 'EWF00-PREFLIGHT-001';
const SPEC_REVISION = '0b43efac974c3fbbc489f10e9fa668bac84c9b43';
const PLAN_PATH = 'docs/superpowers/plans/2026-08-05-ewf-00-preflight-verification-trace-github-connector-v4.md';
const PLAN_COMMIT = '250b879fa06b7be50a198e3cf007637c5f9d7306';
const PLAN_PARENT = '474bde8e3c7b09f757e7df4a1587f8a71b2e7865';
const PLAN_BLOB = 'c45255836ca211d7f07f010016c68b568da6b193';
const IMPLEMENTATION_BRANCH = 'chatgpt/ewf-00-preflight-verification-trace-mvp';
const IMPLEMENTATION_REF = `refs/heads/${IMPLEMENTATION_BRANCH}`;
const WRITER = 'chatgpt-github-ewf00-preflight-primary-writer';
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

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

const INHERITED_ENVIRONMENT_ALLOWLIST = Object.freeze([
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

const INHERITED_ENVIRONMENT_SET = new Set(INHERITED_ENVIRONMENT_ALLOWLIST);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneData(value) {
  return structuredClone(value);
}

function issue(list, code, path, message) {
  list.push({ code, path, message });
}

function orderedIssues(issues) {
  const deduplicated = new Map();
  for (const entry of issues) {
    const key = `${entry.code}\u0000${entry.path}\u0000${entry.message}`;
    if (!deduplicated.has(key)) deduplicated.set(key, entry);
  }
  return [...deduplicated.values()].sort((left, right) =>
    left.code.localeCompare(right.code) ||
    left.path.localeCompare(right.path) ||
    left.message.localeCompare(right.message)
  );
}

function sameJson(left, right) {
  try {
    return canonicalizeArtifact(left) === canonicalizeArtifact(right);
  } catch {
    return false;
  }
}

function sortedStrings(value) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
    ? [...value].sort()
    : null;
}

function sameStringSet(left, right) {
  const normalizedLeft = sortedStrings(left);
  const normalizedRight = sortedStrings(right);
  return normalizedLeft !== null &&
    normalizedRight !== null &&
    sameJson(normalizedLeft, normalizedRight);
}

function omitTopLevel(value, field) {
  const copy = cloneData(value);
  delete copy[field];
  return copy;
}

function portableWithDigest(value) {
  const projection = omitTopLevel(value, 'contentDigest');
  const redacted = redactPortableValue(projection);
  return {
    ...redacted,
    contentDigest: digestArtifact(redacted)
  };
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

function sortRows(rows, selector) {
  return Array.isArray(rows)
    ? [...rows].sort((left, right) => selector(left).localeCompare(selector(right)))
    : rows;
}

function normalizedObservation(observation) {
  if (!isRecord(observation)) return observation ?? null;
  const copy = cloneData(observation);
  if (isRecord(copy.overlaps)) {
    if (Array.isArray(copy.overlaps.files)) copy.overlaps.files.sort();
    if (Array.isArray(copy.overlaps.semanticKeys)) copy.overlaps.semanticKeys.sort();
  }
  if (Array.isArray(copy.requestedChanges)) copy.requestedChanges.sort();
  if (Array.isArray(copy.exclusions)) copy.exclusions.sort();
  if (Array.isArray(copy.canonicalFiles)) {
    copy.canonicalFiles = sortRows(copy.canonicalFiles, (row) => String(row?.path ?? ''));
  }
  if (Array.isArray(copy.canonicalEntryGateResults)) {
    copy.canonicalEntryGateResults = sortRows(copy.canonicalEntryGateResults, (row) => String(row?.id ?? ''));
  }
  if (isRecord(copy.status)) {
    for (const field of ['tracked', 'index', 'untracked']) {
      if (Array.isArray(copy.status[field])) copy.status[field].sort();
    }
  }
  if (isRecord(copy.worktrees) && Array.isArray(copy.worktrees.rows)) {
    copy.worktrees.rows = sortRows(copy.worktrees.rows, (row) =>
      `${String(row?.branchRef ?? '')}\u0000${String(row?.path ?? '')}\u0000${String(row?.head ?? '')}`
    );
  }
  if (isRecord(copy.remote) && Array.isArray(copy.remote.rows)) {
    copy.remote.rows = sortRows(copy.remote.rows, (row) =>
      `${String(row?.ref ?? '')}\u0000${String(row?.sha ?? '')}`
    );
  }
  if (isRecord(copy.activeWriterRegistry) && Array.isArray(copy.activeWriterRegistry.rows)) {
    copy.activeWriterRegistry.rows = sortRows(copy.activeWriterRegistry.rows, (row) =>
      `${String(row?.writer ?? '')}\u0000${String(row?.ref ?? '')}\u0000${String(row?.worktree ?? '')}`
    ).map((row) => {
      if (!isRecord(row)) return row;
      if (Array.isArray(row.allowlist)) row.allowlist.sort();
      if (Array.isArray(row.semanticConflictKeys)) row.semanticConflictKeys.sort();
      return row;
    });
  }
  return copy;
}

function isWithinRoot(root, repositoryRelativePath) {
  if (typeof root !== 'string' || root.length === 0 ||
      typeof repositoryRelativePath !== 'string' || repositoryRelativePath.length === 0 ||
      isAbsolute(repositoryRelativePath)) {
    return false;
  }
  const normalizedRoot = resolve(root);
  const candidate = resolve(normalizedRoot, repositoryRelativePath);
  const relativePath = relative(normalizedRoot, candidate);
  return relativePath !== '..' &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath);
}

function normalizeRepositoryIdentity(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const trimmed = value.trim().replace(/\.git$/i, '').replace(/\/$/, '');
  if (/^[^@\s]+@[^:\s]+:[^\s]+$/.test(trimmed)) {
    const path = trimmed.slice(trimmed.indexOf(':') + 1);
    const parts = path.split('/').filter(Boolean);
    return parts.length >= 2 ? parts.slice(-2).join('/') : null;
  }
  try {
    const parsed = new URL(trimmed);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length >= 2 ? parts.slice(-2).join('/') : null;
  } catch {
    const parts = trimmed.split('/').filter(Boolean);
    return parts.length === 2 ? parts.join('/') : null;
  }
}

function validateDeclaration(declaration, diagnostics) {
  if (!isRecord(declaration)) {
    issue(diagnostics, 'MALFORMED_CHANGE_SET_DECLARATION', '$.declaration', 'The approved change-set declaration must be an object.');
    return;
  }

  const exactBindings = [
    ['specId', SPEC_ID, 'SPEC_ID_MISMATCH'],
    ['repository', REPOSITORY, 'REPOSITORY_IDENTITY_MISMATCH'],
    ['approvedPlanPath', PLAN_PATH, 'PLAN_PATH_MISMATCH'],
    ['approvedPlanCommit', PLAN_COMMIT, 'PLAN_COMMIT_MISMATCH'],
    ['approvedPlanBlob', PLAN_BLOB, 'PLAN_BLOB_MISMATCH'],
    ['expectedHead', PLAN_COMMIT, 'EXPECTED_HEAD_MISMATCH'],
    ['expectedPredecessorParent', PLAN_PARENT, 'EXPECTED_PARENT_MISMATCH'],
    ['expectedSymbolicRef', IMPLEMENTATION_REF, 'EXPECTED_SYMBOLIC_REF_MISMATCH'],
    ['expectedLocalTargetRef', IMPLEMENTATION_REF, 'EXPECTED_LOCAL_REF_MISMATCH'],
    ['remoteName', 'origin', 'REMOTE_NAME_MISMATCH'],
    ['remoteTargetRef', IMPLEMENTATION_REF, 'REMOTE_TARGET_REF_MISMATCH']
  ];
  for (const [field, expected, code] of exactBindings) {
    if (declaration[field] !== expected) {
      issue(diagnostics, code, `$.declaration.${field}`, `${field} must equal the frozen declaration value.`);
    }
  }

  if (typeof declaration.repositoryRoot !== 'string' || declaration.repositoryRoot.length === 0) {
    issue(diagnostics, 'MISSING_REPOSITORY_ROOT', '$.declaration.repositoryRoot', 'repositoryRoot must be an exact non-empty path.');
  }
  if (typeof declaration.expectedWorktree !== 'string' || declaration.expectedWorktree.length === 0) {
    issue(diagnostics, 'MISSING_EXPECTED_WORKTREE', '$.declaration.expectedWorktree', 'expectedWorktree must be an exact non-empty path.');
  }
  if (declaration.requiredSingleWorktree !== true) {
    issue(diagnostics, 'SINGLE_WORKTREE_REQUIREMENT_MISMATCH', '$.declaration.requiredSingleWorktree', 'requiredSingleWorktree must be true.');
  }

  if (!Array.isArray(declaration.requiredCanonicalFiles)) {
    issue(diagnostics, 'MISSING_CANONICAL_FILE_DECLARATION', '$.declaration.requiredCanonicalFiles', 'requiredCanonicalFiles must be an array.');
  }
  if (!sameStringSet(declaration.requiredCanonicalFiles, CANONICAL_FILES)) {
    issue(diagnostics, 'CANONICAL_FILE_SET_MISMATCH', '$.declaration.requiredCanonicalFiles', 'The canonical file set must equal the frozen set.');
  }

  if (typeof declaration.writer !== 'string' || declaration.writer.length === 0) {
    issue(diagnostics, 'MISSING_WRITER', '$.declaration.writer', 'The designated writer is required.');
  } else if (declaration.writer !== WRITER) {
    issue(diagnostics, 'WRITER_IDENTITY_MISMATCH', '$.declaration.writer', 'The declared writer does not match the frozen writer.');
  }
  if (declaration.writerMode !== 'exclusive') {
    issue(diagnostics, 'WRITER_MODE_MISMATCH', '$.declaration.writerMode', 'writerMode must be exclusive.');
  }
  if (!isRecord(declaration.activeWriterRegistry)) {
    issue(diagnostics, 'MISSING_WRITER_REGISTRY', '$.declaration.activeWriterRegistry', 'The active writer registry is required.');
  }

  if (!sameStringSet(declaration.allowlist, ALLOWLIST)) {
    issue(diagnostics, 'ALLOWLIST_MISMATCH', '$.declaration.allowlist', 'The allowlist does not match the frozen four-file boundary.');
  }
  if (!sameStringSet(declaration.exclusions, EXCLUSIONS)) {
    issue(diagnostics, 'EXCLUSION_MISMATCH', '$.declaration.exclusions', 'The exclusions do not match the frozen boundary.');
  }
  if (!sameStringSet(declaration.semanticConflictKeys, SEMANTIC_KEYS)) {
    issue(diagnostics, 'SEMANTIC_KEY_SET_MISMATCH', '$.declaration.semanticConflictKeys', 'The semantic-conflict keys do not match the frozen set.');
  }

  if (!REMOTE_COLLISION_POLICIES.includes(declaration.remoteCollisionPolicy)) {
    issue(diagnostics, 'INVALID_REMOTE_COLLISION_POLICY', '$.declaration.remoteCollisionPolicy', 'The remote collision policy is not in the frozen vocabulary.');
  }
  if (declaration.remoteCollisionPolicy === 'REQUIRE_ABSENT' &&
      (declaration.remoteExpectedState !== 'ABSENT' || declaration.remoteExpectedSha !== null)) {
    issue(diagnostics, 'REMOTE_EXPECTATION_MISMATCH', '$.declaration.remoteExpectedState', 'REQUIRE_ABSENT requires ABSENT and a null SHA.');
  }
  if (declaration.remoteCollisionPolicy === 'REQUIRE_EXACT_SHA' &&
      (declaration.remoteExpectedState !== 'PRESENT' || !SHA_PATTERN.test(declaration.remoteExpectedSha ?? ''))) {
    issue(diagnostics, 'REMOTE_EXPECTATION_MISMATCH', '$.declaration.remoteExpectedSha', 'REQUIRE_EXACT_SHA requires PRESENT and one lowercase SHA.');
  }

  if (!isRecord(declaration.verificationManifest)) {
    issue(diagnostics, 'MISSING_VERIFICATION_MANIFEST', '$.declaration.verificationManifest', 'The verification manifest is required.');
  }

  const approvals = declaration.safetyApprovals;
  if (!isRecord(approvals)) {
    issue(diagnostics, 'MISSING_SAFETY_APPROVALS', '$.declaration.safetyApprovals', 'Safety approvals must be explicit.');
  } else {
    for (const field of [
      'noProductBehaviorChange',
      'noCanonicalStatusChange',
      'noCiChange',
      'noDependencyChange',
      'noPilotWork',
      'noAcceptanceVerdict'
    ]) {
      if (approvals[field] !== true) {
        issue(diagnostics, 'SAFETY_APPROVAL_MISSING', `$.declaration.safetyApprovals.${field}`, `${field} must be true.`);
      }
    }
  }
}

function validateCanonicalFiles(declaration, observation, diagnostics) {
  const required = Array.isArray(declaration.requiredCanonicalFiles)
    ? declaration.requiredCanonicalFiles
    : [];
  const observed = Array.isArray(observation.canonicalFiles)
    ? observation.canonicalFiles
    : [];
  const root = declaration.repositoryRoot;

  for (const path of required) {
    if (!isWithinRoot(root, path)) {
      issue(diagnostics, 'CANONICAL_PATH_OUTSIDE_ROOT', '$.declaration.requiredCanonicalFiles', `Canonical path escapes the declared repository root: ${path}.`);
      continue;
    }
    const row = observed.find((entry) => isRecord(entry) && entry.path === path);
    if (!row || row.exists !== true) {
      issue(diagnostics, 'MISSING_CANONICAL_FILE', `$.observation.canonicalFiles.${path}`, `Required canonical file is missing: ${path}.`);
      continue;
    }
    if (typeof row.absolutePath === 'string' && resolve(row.absolutePath) !== resolve(root, path)) {
      issue(diagnostics, 'CANONICAL_FILE_IDENTITY_MISMATCH', `$.observation.canonicalFiles.${path}`, `Canonical file identity does not match the declared root: ${path}.`);
    }
  }
}

function validateWorktreeAndStatus(declaration, observation, diagnostics) {
  const worktrees = observation.worktrees;
  if (!isRecord(worktrees) || worktrees.complete !== true || !Array.isArray(worktrees.rows)) {
    issue(diagnostics, 'MALFORMED_WORKTREE_OBSERVATION', '$.observation.worktrees', 'The worktree registry is missing, malformed, or incomplete.');
  } else {
    const implementationRows = worktrees.rows.filter((row) =>
      isRecord(row) && row.branchRef === declaration.expectedSymbolicRef
    );
    if (implementationRows.length > 1) {
      issue(diagnostics, 'MULTIPLE_IMPLEMENTATION_WORKTREES', '$.observation.worktrees.rows', 'More than one implementation worktree is declared.');
    }
    const exactRow = implementationRows.find((row) =>
      resolve(row.path ?? '') === resolve(declaration.expectedWorktree ?? '')
    );
    if (!exactRow) {
      issue(diagnostics, 'WORKTREE_IDENTITY_MISMATCH', '$.observation.worktrees.rows', 'The exact declared implementation worktree was not observed.');
    } else {
      if (exactRow.head !== declaration.expectedHead) {
        issue(diagnostics, 'WORKTREE_HEAD_MISMATCH', '$.observation.worktrees.rows', 'The declared worktree HEAD is incorrect.');
      }
      if (exactRow.branchRef !== declaration.expectedSymbolicRef) {
        issue(diagnostics, 'WORKTREE_REF_MISMATCH', '$.observation.worktrees.rows', 'The declared worktree branch ref is incorrect.');
      }
    }
  }

  const status = observation.status;
  if (!isRecord(status) || status.complete !== true ||
      !Array.isArray(status.tracked) || !Array.isArray(status.index) || !Array.isArray(status.untracked)) {
    issue(diagnostics, 'MALFORMED_STATUS_OBSERVATION', '$.observation.status', 'The status observation is missing, malformed, or incomplete.');
    return;
  }
  if (status.tracked.length > 0) {
    issue(diagnostics, 'DIRTY_TRACKED_WORKTREE', '$.observation.status.tracked', 'Tracked worktree changes are present.');
  }
  if (status.index.length > 0) {
    issue(diagnostics, 'DIRTY_INDEX', '$.observation.status.index', 'Staged or index changes are present.');
  }
  if (status.untracked.length > 0) {
    issue(diagnostics, 'DIRTY_UNTRACKED_WORKTREE', '$.observation.status.untracked', 'Untracked files are present.');
  }
}

function validateRemote(declaration, observation, diagnostics) {
  const remote = observation.remote;
  if (!isRecord(remote) || remote.complete !== true) {
    issue(diagnostics, 'REMOTE_OBSERVATION_ERROR', '$.observation.remote', 'The exact remote observation did not complete successfully.');
    return;
  }
  if (!Array.isArray(remote.rows)) {
    issue(diagnostics, 'MALFORMED_REMOTE_OBSERVATION', '$.observation.remote.rows', 'Remote rows must be a complete array.');
    return;
  }

  if (remote.name !== declaration.remoteName || remote.targetRef !== declaration.remoteTargetRef) {
    issue(diagnostics, 'REMOTE_TARGET_IDENTITY_MISMATCH', '$.observation.remote', 'The observed remote name or target ref is incorrect.');
  }
  if (remote.repository !== declaration.repository) {
    issue(diagnostics, 'REMOTE_REPOSITORY_IDENTITY_MISMATCH', '$.observation.remote.repository', 'The observed remote repository identity is incorrect.');
  }
  const urlIdentity = normalizeRepositoryIdentity(remote.url);
  if (urlIdentity !== null && urlIdentity !== declaration.repository) {
    issue(diagnostics, 'REMOTE_REPOSITORY_IDENTITY_MISMATCH', '$.observation.remote.url', 'The remote URL does not identify the declared repository.');
  }

  const malformed = remote.rows.some((row) =>
    !isRecord(row) || row.ref !== declaration.remoteTargetRef || !SHA_PATTERN.test(row.sha ?? '')
  );
  if (malformed) {
    issue(diagnostics, 'MALFORMED_REMOTE_OBSERVATION', '$.observation.remote.rows', 'A remote target row is malformed or does not bind the exact target ref.');
    return;
  }

  if (declaration.remoteCollisionPolicy === 'REQUIRE_ABSENT') {
    if (remote.state !== 'ABSENT' || remote.sha !== null || remote.rows.length !== 0) {
      issue(diagnostics, 'REMOTE_TARGET_COLLISION', '$.observation.remote', 'The exact remote target must be absent.');
    }
    return;
  }

  if (declaration.remoteCollisionPolicy === 'REQUIRE_EXACT_SHA') {
    const exactRow = remote.rows.length === 1 &&
      remote.rows[0].ref === declaration.remoteTargetRef &&
      remote.rows[0].sha === declaration.remoteExpectedSha;
    if (remote.state !== 'PRESENT') {
      issue(diagnostics, 'REMOTE_TARGET_STATE_MISMATCH', '$.observation.remote.state', 'The exact remote target must be present.');
    }
    if (remote.sha !== declaration.remoteExpectedSha || !exactRow) {
      issue(diagnostics, 'REMOTE_TARGET_SHA_MISMATCH', '$.observation.remote.sha', 'The exact remote target SHA does not match the declaration.');
    }
  }
}

function validateRegistryAndOverlap(declaration, observation, diagnostics) {
  const declaredRegistry = declaration.activeWriterRegistry;
  if (!isRecord(declaredRegistry)) return;
  if (declaredRegistry.complete !== true || !Array.isArray(declaredRegistry.rows)) {
    issue(diagnostics, 'INCOMPLETE_WRITER_REGISTRY', '$.declaration.activeWriterRegistry', 'The declared active writer registry is incomplete.');
  }

  const observedRegistry = observation.activeWriterRegistry;
  if (!isRecord(observedRegistry)) {
    issue(diagnostics, 'MISSING_WRITER_REGISTRY', '$.observation.activeWriterRegistry', 'The observed active writer registry is missing.');
    return;
  }
  if (observedRegistry.complete !== true || !Array.isArray(observedRegistry.rows)) {
    issue(diagnostics, 'INCOMPLETE_WRITER_REGISTRY', '$.observation.activeWriterRegistry', 'The observed active writer registry is incomplete.');
    return;
  }

  const ownRows = observedRegistry.rows.filter((row) =>
    isRecord(row) && row.writer === declaration.writer && row.ref === declaration.expectedSymbolicRef
  );
  if (ownRows.length !== 1) {
    issue(diagnostics, 'WRITER_REGISTRY_IDENTITY_MISMATCH', '$.observation.activeWriterRegistry.rows', 'The exact writer/ref registry row must appear once.');
  } else {
    const row = ownRows[0];
    if (row.writerMode !== 'exclusive' || row.branch !== IMPLEMENTATION_BRANCH ||
        resolve(row.worktree ?? '') !== resolve(declaration.expectedWorktree ?? '') ||
        !sameStringSet(row.allowlist, declaration.allowlist) ||
        !sameStringSet(row.semanticConflictKeys, declaration.semanticConflictKeys)) {
      issue(diagnostics, 'WRITER_REGISTRY_IDENTITY_MISMATCH', '$.observation.activeWriterRegistry.rows', 'The writer registry row does not bind the exact branch/worktree/boundary.');
    }
  }

  const approvedFiles = Array.isArray(declaration.allowlist) ? declaration.allowlist : [];
  const approvedKeys = Array.isArray(declaration.semanticConflictKeys) ? declaration.semanticConflictKeys : [];
  for (const row of observedRegistry.rows) {
    if (!isRecord(row) || row.writer === declaration.writer) continue;
    const fileOverlap = Array.isArray(row.allowlist)
      ? row.allowlist.filter((path) => approvedFiles.includes(path)).sort()
      : [];
    const semanticOverlap = Array.isArray(row.semanticConflictKeys)
      ? row.semanticConflictKeys.filter((key) => approvedKeys.includes(key)).sort()
      : [];
    if (fileOverlap.length > 0) {
      issue(diagnostics, 'FILE_OVERLAP', '$.observation.activeWriterRegistry.rows', `Active writer file overlap: ${fileOverlap.join(', ')}.`);
    }
    if (semanticOverlap.length > 0) {
      issue(diagnostics, 'SEMANTIC_OVERLAP', '$.observation.activeWriterRegistry.rows', `Active writer semantic overlap: ${semanticOverlap.join(', ')}.`);
    }
  }

  const overlaps = observation.overlaps;
  if (!isRecord(overlaps) || !Array.isArray(overlaps.files) || !Array.isArray(overlaps.semanticKeys)) {
    issue(diagnostics, 'MALFORMED_OVERLAP_OBSERVATION', '$.observation.overlaps', 'The overlap observation is malformed.');
    return;
  }
  const files = [...overlaps.files].sort();
  const semanticKeys = [...overlaps.semanticKeys].sort();
  if (files.length > 0) {
    issue(diagnostics, 'FILE_OVERLAP', '$.observation.overlaps.files', `File overlap: ${files.join(', ')}.`);
  }
  if (semanticKeys.length > 0) {
    issue(diagnostics, 'SEMANTIC_OVERLAP', '$.observation.overlaps.semanticKeys', `Semantic overlap: ${semanticKeys.join(', ')}.`);
  }
}

function validateCanonicalGatesAndBoundary(declaration, observation, diagnostics) {
  const gates = Array.isArray(declaration.canonicalEntryGates)
    ? declaration.canonicalEntryGates
    : [];
  const results = Array.isArray(observation.canonicalEntryGateResults)
    ? observation.canonicalEntryGateResults
    : [];
  for (const gate of gates) {
    if (!isRecord(gate) || typeof gate.id !== 'string') {
      issue(diagnostics, 'MALFORMED_CANONICAL_GATE', '$.declaration.canonicalEntryGates', 'A canonical gate declaration is malformed.');
      continue;
    }
    const row = results.find((entry) => isRecord(entry) && entry.id === gate.id);
    if (!row || row.observed !== gate.expected) {
      issue(diagnostics, 'CANONICAL_GATE_MISMATCH', `$.observation.canonicalEntryGateResults.${gate.id}`, `Canonical gate ${gate.id} does not match its frozen expected value.`);
    }
  }

  if (!sameStringSet(observation.exclusions, declaration.exclusions)) {
    issue(diagnostics, 'EXCLUSION_MISMATCH', '$.observation.exclusions', 'Observed exclusions do not match the approved declaration.');
  }

  const approvedFiles = Array.isArray(declaration.allowlist) ? declaration.allowlist : [];
  if (!Array.isArray(observation.requestedChanges)) {
    issue(diagnostics, 'MALFORMED_REQUESTED_CHANGES', '$.observation.requestedChanges', 'requestedChanges must be an array.');
  } else {
    for (const path of [...observation.requestedChanges].sort()) {
      if (!approvedFiles.includes(path)) {
        issue(diagnostics, 'OUT_OF_BOUND_WRITE', '$.observation.requestedChanges', `Requested change is outside the allowlist: ${path}.`);
      }
    }
  }
}

function buildPreflightResult(declaration, observation, diagnostics) {
  const ordered = orderedIssues(diagnostics);
  return portableWithDigest({
    schemaVersion: 1,
    artifactKind: 'preflight-result',
    authorityLabel: 'SUBORDINATE_PREFLIGHT_RESULT / NOT_ACCEPTANCE',
    specId: declaration?.specId ?? null,
    specRevision: SPEC_REVISION,
    repositoryBinding: {
      identity: declaration?.repository ?? null,
      root: declaration?.repositoryRoot ?? null
    },
    planBinding: {
      path: declaration?.approvedPlanPath ?? null,
      commit: declaration?.approvedPlanCommit ?? null,
      parent: declaration?.expectedPredecessorParent ?? null,
      blob: declaration?.approvedPlanBlob ?? null
    },
    implementationBinding: {
      branch: IMPLEMENTATION_BRANCH,
      symbolicRef: declaration?.expectedSymbolicRef ?? null,
      localTargetRef: declaration?.expectedLocalTargetRef ?? null,
      writer: declaration?.writer ?? null,
      writerMode: declaration?.writerMode ?? null
    },
    semanticKeyMapping: {
      preflightObservation: SEMANTIC_KEYS[0],
      verificationExecution: SEMANTIC_KEYS[1],
      traceValidation: SEMANTIC_KEYS[2],
      frozenHandoffValidation: SEMANTIC_KEYS[3]
    },
    canonicalGateObservations: sortRows(
      Array.isArray(observation?.canonicalEntryGateResults)
        ? observation.canonicalEntryGateResults
        : [],
      (row) => String(row?.id ?? '')
    ),
    pathBoundary: {
      allowlist: sortedStrings(declaration?.allowlist) ?? [],
      exclusions: sortedStrings(declaration?.exclusions) ?? [],
      requestedChanges: sortedStrings(observation?.requestedChanges) ?? []
    },
    observation: normalizedObservation(observation),
    diagnostics: ordered,
    effects: emptyEffects(),
    result: ordered.length === 0 ? 'PASS' : 'BLOCKED'
  });
}

export async function evaluatePreflight(declaration, observation) {
  const diagnostics = [];
  validateDeclaration(declaration, diagnostics);
  if (!isRecord(declaration)) {
    return buildPreflightResult(declaration, observation, diagnostics);
  }

  if (isRecord(observation) && observation.recordType === 'CONNECTOR_GOVERNANCE_STAGE_0_RAW_METADATA') {
    issue(diagnostics, 'CONNECTOR_STAGE0_NOT_LOCAL_EVIDENCE', '$.observation.recordType', 'Connector Governance Stage 0 metadata cannot substitute for local adapter evidence.');
    return buildPreflightResult(declaration, observation, diagnostics);
  }
  if (!isRecord(observation) || observation.observationKind !== 'LOCAL_READ_ONLY_PREFLIGHT_OBSERVATION') {
    issue(diagnostics, 'MALFORMED_PREFLIGHT_OBSERVATION', '$.observation', 'A local read-only preflight observation is required.');
    return buildPreflightResult(declaration, observation, diagnostics);
  }
  if (observation.complete !== true) {
    issue(diagnostics, 'INCOMPLETE_PREFLIGHT_OBSERVATION', '$.observation.complete', 'The local preflight observation is incomplete.');
  }

  if (observation.repository !== declaration.repository) {
    issue(diagnostics, 'REPOSITORY_IDENTITY_MISMATCH', '$.observation.repository', 'The observed repository identity is incorrect.');
  }
  if (typeof declaration.repositoryRoot !== 'string' ||
      typeof observation.repositoryRoot !== 'string' ||
      resolve(observation.repositoryRoot) !== resolve(declaration.repositoryRoot)) {
    issue(diagnostics, 'REPOSITORY_ROOT_MISMATCH', '$.observation.repositoryRoot', 'The observed repository root is incorrect.');
  }

  validateCanonicalFiles(declaration, observation, diagnostics);

  if (observation.head !== declaration.expectedHead) {
    issue(diagnostics, 'HEAD_MISMATCH', '$.observation.head', 'The observed HEAD does not match the approved plan commit.');
  }
  if (observation.parent !== declaration.expectedPredecessorParent) {
    issue(diagnostics, 'PARENT_OBSERVATION_MISMATCH', '$.observation.parent', 'The observed predecessor parent is incorrect.');
  }
  if (observation.symbolicRef === null || observation.symbolicRef === undefined) {
    issue(diagnostics, 'DETACHED_HEAD', '$.observation.symbolicRef', 'A symbolic implementation ref is required.');
  } else if (observation.symbolicRef !== declaration.expectedSymbolicRef) {
    issue(diagnostics, 'SYMBOLIC_REF_MISMATCH', '$.observation.symbolicRef', 'The symbolic ref does not match the approved declaration.');
  }

  if (!isRecord(observation.localTargetRef) ||
      observation.localTargetRef.ref !== declaration.expectedLocalTargetRef) {
    issue(diagnostics, 'LOCAL_TARGET_REF_MISMATCH', '$.observation.localTargetRef', 'The local target ref identity is incorrect.');
  } else if (observation.localTargetRef.sha !== declaration.expectedHead) {
    issue(diagnostics, 'LOCAL_TARGET_REF_SHA_MISMATCH', '$.observation.localTargetRef.sha', 'The local target ref points to the wrong SHA.');
  }

  validateWorktreeAndStatus(declaration, observation, diagnostics);
  validateRemote(declaration, observation, diagnostics);

  if (observation.writer !== declaration.writer) {
    issue(diagnostics, 'WRITER_IDENTITY_MISMATCH', '$.observation.writer', 'The observed writer does not match the approved writer.');
  }
  if (observation.writerMode !== 'exclusive' || declaration.writerMode !== 'exclusive') {
    issue(diagnostics, 'WRITER_MODE_MISMATCH', '$.observation.writerMode', 'The writer mode must remain exclusive.');
  }

  validateRegistryAndOverlap(declaration, observation, diagnostics);
  validateCanonicalGatesAndBoundary(declaration, observation, diagnostics);
  return buildPreflightResult(declaration, observation, diagnostics);
}

function validateCommandDeclaration(command, profile, path, diagnostics) {
  if (!isRecord(command)) {
    issue(diagnostics, 'MALFORMED_COMMAND_DECLARATION', path, 'Command declaration must be an object.');
    return;
  }
  if (typeof command.id !== 'string' || command.id.length === 0) {
    issue(diagnostics, 'MISSING_COMMAND_ID', `${path}.id`, 'Command id is required.');
  }
  if (command.profile !== profile) {
    issue(diagnostics, 'COMMAND_PROFILE_MISMATCH', `${path}.profile`, 'Command profile does not match the requested profile.');
  }
  if (!Array.isArray(command.argv) || command.argv.length === 0 ||
      !command.argv.every((entry) => typeof entry === 'string' && entry.length > 0)) {
    issue(diagnostics, 'INVALID_COMMAND_ARGV', `${path}.argv`, 'argv must be a non-empty string array.');
  }
  if (typeof command.cwd !== 'string' || command.cwd.length === 0) {
    issue(diagnostics, 'INVALID_COMMAND_CWD', `${path}.cwd`, 'cwd must be a non-empty declared value.');
  }
  if (!Array.isArray(command.inheritEnvironment) ||
      command.inheritEnvironment.some((entry) => !INHERITED_ENVIRONMENT_SET.has(entry)) ||
      new Set(command.inheritEnvironment).size !== command.inheritEnvironment.length) {
    issue(diagnostics, 'INVALID_INHERITED_ENVIRONMENT', `${path}.inheritEnvironment`, 'Inherited environment keys must be unique and within the frozen allowlist.');
  }
  if (!isRecord(command.environment)) {
    issue(diagnostics, 'INVALID_EXPLICIT_ENVIRONMENT', `${path}.environment`, 'environment must be an explicit object.');
  }
  if (!Number.isInteger(command.timeoutMs) || command.timeoutMs <= 0) {
    issue(diagnostics, 'INVALID_COMMAND_TIMEOUT', `${path}.timeoutMs`, 'timeoutMs must be a positive integer.');
  }
  if (!TOOL_REQUIREMENTS.includes(command.toolRequirement)) {
    issue(diagnostics, 'INVALID_TOOL_REQUIREMENT', `${path}.toolRequirement`, 'toolRequirement is not in the frozen vocabulary.');
  }
  if (!Array.isArray(command.requirements) || command.requirements.length === 0 ||
      !command.requirements.every((entry) => typeof entry === 'string' && entry.length > 0)) {
    issue(diagnostics, 'INVALID_COMMAND_REQUIREMENTS', `${path}.requirements`, 'requirements must be a non-empty string array.');
  }

  let expectedDigest = null;
  try {
    expectedDigest = digestArtifact(omitTopLevel(command, 'declarationDigest'));
  } catch {
    issue(diagnostics, 'MALFORMED_COMMAND_DECLARATION', path, 'Command declaration is not deterministic JSON.');
  }
  if (expectedDigest !== null && command.declarationDigest !== expectedDigest) {
    issue(diagnostics, 'DECLARATION_DIGEST_MISMATCH', `${path}.declarationDigest`, 'The declaration digest does not bind the exact command declaration.');
  }
}

function validateVerificationManifestIdentity(manifest, profile, diagnostics) {
  if (!isRecord(manifest)) {
    issue(diagnostics, 'MALFORMED_VERIFICATION_MANIFEST', '$.manifest', 'Verification manifest must be an object.');
    return [];
  }

  const acceptedShape = validateArtifact('verification-manifest', manifest);
  if (acceptedShape.errors.some((entry) => entry.code === 'NON_JSON_VALUE')) {
    issue(diagnostics, 'MALFORMED_VERIFICATION_MANIFEST', '$.manifest', 'Verification manifest contains a non-JSON value.');
  }
  if (manifest.schemaVersion !== 1 || manifest.artifactKind !== 'verification-manifest' ||
      manifest.authorityLabel !== 'DECLARED_VERIFICATION / NOT_EXECUTION' || manifest.specId !== SPEC_ID) {
    issue(diagnostics, 'VERIFICATION_MANIFEST_IDENTITY_MISMATCH', '$.manifest', 'Verification manifest identity does not match the frozen specification.');
  }
  if (!isRecord(manifest.commands) || !Array.isArray(manifest.commands[profile])) {
    issue(diagnostics, 'MISSING_VERIFICATION_PROFILE', `$.manifest.commands.${profile}`, 'The requested verification profile is not declared.');
    return [];
  }

  let expectedManifestDigest = null;
  try {
    const projection = cloneData(manifest);
    if (!isRecord(projection.extensions)) projection.extensions = {};
    delete projection.extensions.verificationManifestDigest;
    expectedManifestDigest = digestArtifact(projection);
  } catch {
    issue(diagnostics, 'MALFORMED_VERIFICATION_MANIFEST', '$.manifest', 'Verification manifest is not deterministic JSON.');
  }
  if (!isRecord(manifest.extensions) ||
      manifest.extensions.verificationManifestDigest !== expectedManifestDigest) {
    issue(diagnostics, 'VERIFICATION_MANIFEST_DIGEST_MISMATCH', '$.manifest.extensions.verificationManifestDigest', 'The verification manifest digest does not bind the exact manifest.');
  }

  const commands = manifest.commands[profile];
  if (commands.length === 0) {
    issue(diagnostics, 'EMPTY_VERIFICATION_PROFILE', `$.manifest.commands.${profile}`, 'The requested verification profile must declare at least one command.');
  }
  const seen = new Set();
  commands.forEach((command, index) => {
    const path = `$.manifest.commands.${profile}[${index}]`;
    validateCommandDeclaration(command, profile, path, diagnostics);
    if (isRecord(command) && typeof command.id === 'string') {
      if (seen.has(command.id)) {
        issue(diagnostics, 'DUPLICATE_COMMAND_ID', `${path}.id`, `Duplicate command id: ${command.id}.`);
      }
      seen.add(command.id);
    }
  });
  return commands;
}

function classifyExecution(outcome) {
  if (outcome?.errorCode === 'ENOENT') return 'NOT_AVAILABLE';
  if (outcome?.timedOut === true) return 'ERROR';
  if (typeof outcome?.signal === 'string' && outcome.signal.length > 0) return 'ERROR';
  if (outcome?.errorCode !== null && outcome?.errorCode !== undefined) return 'ERROR';
  if (outcome?.exitCode === 0) return 'PASS';
  if (Number.isInteger(outcome?.exitCode)) return 'FAIL';
  return 'ERROR';
}

function commandEvidence(command, verificationManifestDigest, outcome) {
  const stdout = typeof outcome?.stdout === 'string' ? outcome.stdout : '';
  const stderr = typeof outcome?.stderr === 'string' ? outcome.stderr : '';
  const durationMs = Number.isFinite(outcome?.durationMs) && outcome.durationMs >= 0
    ? outcome.durationMs
    : 0;
  return portableWithDigest({
    id: `${command.id}-result`,
    authorityLabel: 'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE',
    commandId: command.id,
    profile: command.profile,
    verificationManifestDigest,
    declarationDigest: command.declarationDigest,
    argv: cloneData(command.argv),
    cwd: command.cwd,
    inheritEnvironment: cloneData(command.inheritEnvironment),
    environment: cloneData(command.environment),
    timeoutMs: command.timeoutMs,
    toolRequirement: command.toolRequirement,
    requirements: cloneData(command.requirements),
    result: classifyExecution(outcome),
    durationMs,
    exitCode: Number.isInteger(outcome?.exitCode) ? outcome.exitCode : null,
    signal: typeof outcome?.signal === 'string' ? outcome.signal : null,
    timedOut: outcome?.timedOut === true,
    errorCode: typeof outcome?.errorCode === 'string' ? outcome.errorCode : null,
    stdoutDigest: digestArtifact(redactPortableValue(stdout)),
    stderrDigest: digestArtifact(redactPortableValue(stderr))
  });
}

export async function executeVerificationProfile(manifest, profile, boundaries = {}) {
  const diagnostics = [];
  const commands = validateVerificationManifestIdentity(manifest, profile, diagnostics);
  if (typeof boundaries.spawn !== 'function') {
    issue(diagnostics, 'MISSING_PROCESS_BOUNDARY', '$.boundaries.spawn', 'An injected declared-command process boundary is required.');
  }
  if (diagnostics.length > 0) {
    return portableWithDigest({
      valid: false,
      profile,
      verificationManifestDigest: isRecord(manifest?.extensions)
        ? manifest.extensions.verificationManifestDigest ?? null
        : null,
      diagnostics: orderedIssues(diagnostics),
      commandResults: []
    });
  }

  const commandResults = [];
  for (const command of commands) {
    let outcome;
    try {
      outcome = await boundaries.spawn({
        id: command.id,
        profile,
        argv: cloneData(command.argv),
        cwd: command.cwd,
        shell: false,
        timeoutMs: command.timeoutMs,
        inheritEnvironment: cloneData(command.inheritEnvironment),
        environment: cloneData(command.environment),
        toolRequirement: command.toolRequirement
      });
    } catch (error) {
      outcome = {
        errorCode: typeof error?.code === 'string' ? error.code : 'PROCESS_BOUNDARY_ERROR',
        exitCode: null,
        signal: null,
        timedOut: false,
        stdout: '',
        stderr: '',
        durationMs: 0
      };
    }
    commandResults.push(commandEvidence(
      command,
      manifest.extensions.verificationManifestDigest,
      isRecord(outcome) ? outcome : {}
    ));
  }

  return portableWithDigest({
    valid: true,
    profile,
    verificationManifestDigest: manifest.extensions.verificationManifestDigest,
    diagnostics: [],
    commandResults
  });
}

function duplicateIds(rows, code, path, errors) {
  if (!Array.isArray(rows)) {
    issue(errors, 'MISSING_TRACE_COLLECTION', path, 'Trace collection must be an array.');
    return new Map();
  }
  const result = new Map();
  rows.forEach((row, index) => {
    const rowPath = `${path}[${index}]`;
    if (!isRecord(row) || typeof row.id !== 'string' || row.id.length === 0) {
      issue(errors, 'MALFORMED_TRACE_ENTRY', rowPath, 'Trace entry must have a non-empty id.');
      return;
    }
    if (result.has(row.id)) {
      issue(errors, code, `${rowPath}.id`, `Duplicate id: ${row.id}.`);
    } else {
      result.set(row.id, row);
    }
  });
  return result;
}

function validateEvidenceDigest(evidence, path, errors) {
  if (typeof evidence.contentDigest !== 'string' || !DIGEST_PATTERN.test(evidence.contentDigest)) {
    issue(errors, 'MISSING_CONTENT_DIGEST', `${path}.contentDigest`, 'Executable evidence requires a lowercase content digest.');
    return;
  }
  let expected = null;
  try {
    const projection = redactPortableValue(omitTopLevel(evidence, 'contentDigest'));
    expected = digestArtifact(projection);
  } catch {
    issue(errors, 'MALFORMED_EVIDENCE', path, 'Evidence is not deterministic portable JSON.');
  }
  if (expected !== null && evidence.contentDigest !== expected) {
    issue(errors, 'CONTENT_DIGEST_MISMATCH', `${path}.contentDigest`, 'Evidence contentDigest does not bind the portable payload.');
  }
}

export function validateTraceManifest(trace, bindings = {}) {
  const errors = [];
  if (!isRecord(trace)) {
    issue(errors, 'MALFORMED_TRACE_MANIFEST', '$.trace', 'Trace manifest must be an object.');
    return { valid: false, errors: orderedIssues(errors) };
  }
  if (trace.artifactKind !== 'trace-manifest' || trace.authorityLabel !== 'IMPLEMENTER_TRACE / NOT_ACCEPTANCE') {
    issue(errors, 'TRACE_IDENTITY_MISMATCH', '$.trace', 'Trace manifest identity must remain subordinate implementer evidence.');
  }
  if (trace.specId !== SPEC_ID || (bindings.specId !== undefined && trace.specId !== bindings.specId)) {
    issue(errors, 'TRACE_SPEC_ID_MISMATCH', '$.trace.specId', 'Trace specId does not match the frozen specification.');
  }
  if (bindings.subjectCommit !== undefined && trace.subjectCommit !== bindings.subjectCommit) {
    issue(errors, 'TRACE_SUBJECT_MISMATCH', '$.trace.subjectCommit', 'Trace subjectCommit does not match the binding.');
  }
  if (bindings.parentCommit !== undefined && trace.parentCommit !== bindings.parentCommit) {
    issue(errors, 'TRACE_PARENT_MISMATCH', '$.trace.parentCommit', 'Trace parentCommit does not match the binding.');
  }
  if (bindings.specRevision !== undefined && trace.specRevision !== bindings.specRevision) {
    issue(errors, 'TRACE_SPEC_REVISION_MISMATCH', '$.trace.specRevision', 'Trace specRevision does not match the binding.');
  }
  if (bindings.verificationManifestDigest !== undefined &&
      trace.verificationManifestDigest !== bindings.verificationManifestDigest) {
    issue(errors, 'VERIFICATION_MANIFEST_DIGEST_MISMATCH', '$.trace.verificationManifestDigest', 'Trace verification manifest digest does not match the binding.');
  }

  if (Array.isArray(trace.evidence)) {
    trace.evidence.forEach((evidence, index) => {
      if (isRecord(evidence) && evidence.recordType === 'CONNECTOR_GOVERNANCE_STAGE_0_RAW_METADATA') {
        issue(errors, 'CONNECTOR_STAGE0_NOT_COMMAND_EVIDENCE', `$.trace.evidence[${index}]`, 'Connector Stage 0 metadata is not executable command evidence.');
      }
    });
  }

  const requirements = duplicateIds(trace.requirements, 'DUPLICATE_REQUIREMENT_ID', '$.trace.requirements', errors);
  const tests = duplicateIds(trace.tests, 'DUPLICATE_TEST_ID', '$.trace.tests', errors);
  const commands = duplicateIds(trace.commands, 'DUPLICATE_COMMAND_ID', '$.trace.commands', errors);
  const evidenceRows = duplicateIds(trace.evidence, 'DUPLICATE_EVIDENCE_ID', '$.trace.evidence', errors);

  for (const [requirementId, requirement] of requirements) {
    if (!Array.isArray(requirement.tests) || requirement.tests.length === 0) {
      issue(errors, 'BROKEN_TEST_REFERENCE', `$.trace.requirements.${requirementId}.tests`, 'Requirement must reference at least one test.');
      continue;
    }
    for (const testId of requirement.tests) {
      if (!tests.has(testId)) {
        issue(errors, 'BROKEN_TEST_REFERENCE', `$.trace.requirements.${requirementId}.tests`, `Unknown test reference: ${testId}.`);
      }
    }
  }

  for (const [testId, testRow] of tests) {
    if (!Array.isArray(testRow.commands) || testRow.commands.length === 0) {
      issue(errors, 'BROKEN_COMMAND_REFERENCE', `$.trace.tests.${testId}.commands`, 'Test must reference at least one command.');
    } else {
      for (const commandId of testRow.commands) {
        if (!commands.has(commandId)) {
          issue(errors, 'BROKEN_COMMAND_REFERENCE', `$.trace.tests.${testId}.commands`, `Unknown command reference: ${commandId}.`);
        }
      }
    }
    if (testRow.scope === 'SHARED' &&
        (typeof testRow.sharedScopeRationale !== 'string' || testRow.sharedScopeRationale.trim() === '')) {
      issue(errors, 'MISSING_SHARED_SCOPE_RATIONALE', `$.trace.tests.${testId}`, 'Shared tests require an explicit scope rationale.');
    }
  }

  for (const [commandId, command] of commands) {
    if (!Array.isArray(command.evidence) || command.evidence.length === 0) {
      issue(errors, 'MISSING_REQUIRED_EVIDENCE', `$.trace.commands.${commandId}.evidence`, 'Command must reference executable evidence.');
      continue;
    }
    for (const evidenceId of command.evidence) {
      const evidence = evidenceRows.get(evidenceId);
      if (!evidence) {
        issue(errors, 'MISSING_REQUIRED_EVIDENCE', `$.trace.commands.${commandId}.evidence`, `Missing evidence reference: ${evidenceId}.`);
        continue;
      }
      if (evidence.recordType === 'CONNECTOR_GOVERNANCE_STAGE_0_RAW_METADATA') {
        issue(errors, 'CONNECTOR_STAGE0_NOT_COMMAND_EVIDENCE', `$.trace.evidence.${evidenceId}`, 'Connector Stage 0 metadata is not executable command evidence.');
        continue;
      }
      if (evidence.commandId !== commandId) {
        issue(errors, 'COMMAND_EVIDENCE_MISMATCH', `$.trace.evidence.${evidenceId}.commandId`, 'Evidence commandId does not match its command reference.');
      }
      if (evidence.declarationDigest !== command.declarationDigest) {
        issue(errors, 'DECLARATION_DIGEST_MISMATCH', `$.trace.evidence.${evidenceId}.declarationDigest`, 'Evidence declaration digest does not match the command declaration.');
      }
      if (evidence.verificationManifestDigest !== trace.verificationManifestDigest) {
        issue(errors, 'VERIFICATION_MANIFEST_DIGEST_MISMATCH', `$.trace.evidence.${evidenceId}.verificationManifestDigest`, 'Evidence verification manifest digest does not match the trace.');
      }
      if (evidence.subjectCommit !== trace.subjectCommit) {
        issue(errors, 'EVIDENCE_SUBJECT_MISMATCH', `$.trace.evidence.${evidenceId}.subjectCommit`, 'Evidence subjectCommit does not match the trace.');
      }
      if (evidence.parentCommit !== trace.parentCommit) {
        issue(errors, 'EVIDENCE_PARENT_MISMATCH', `$.trace.evidence.${evidenceId}.parentCommit`, 'Evidence parentCommit does not match the trace.');
      }
      if (evidence.specRevision !== trace.specRevision) {
        issue(errors, 'EVIDENCE_SPEC_REVISION_MISMATCH', `$.trace.evidence.${evidenceId}.specRevision`, 'Evidence specRevision does not match the trace.');
      }
      if (!COMMAND_RESULTS.includes(evidence.result)) {
        issue(errors, 'INVALID_COMMAND_RESULT', `$.trace.evidence.${evidenceId}.result`, 'Evidence result is outside the frozen command vocabulary.');
      }
      validateEvidenceDigest(evidence, `$.trace.evidence.${evidenceId}`, errors);
    }
  }

  return { valid: errors.length === 0, errors: orderedIssues(errors) };
}

function compareBinding(errors, actual, expected, code, path, message) {
  if (!sameJson(actual, expected)) issue(errors, code, path, message);
}

export function validateFrozenHandoff(brief, bindings) {
  const errors = [];
  const warnings = [];
  const shape = validateArtifact('frozen-acceptance-brief', brief);
  errors.push(...shape.errors);
  warnings.push(...shape.warnings);

  if (!isRecord(brief) || !isRecord(bindings)) {
    if (!isRecord(bindings)) {
      issue(errors, 'MISSING_HANDOFF_BINDINGS', '$.bindings', 'Frozen handoff bindings must be an object.');
    }
    return { valid: false, errors: orderedIssues(errors), warnings: orderedIssues(warnings) };
  }

  const accepted = validateFrozenBrief(brief, {
    subjectCommit: bindings.subjectCommit,
    parentCommit: bindings.parentCommit,
    specRevision: bindings.specRevision,
    traceDigest: bindings.traceDigest,
    evidenceDigest: bindings.evidenceDigest,
    briefIdentity: brief.briefIdentity,
    briefDigest: bindings.briefDigest
  });
  errors.push(...accepted.errors);
  warnings.push(...accepted.warnings);

  const extension = isRecord(brief.extensions) ? brief.extensions : {};
  const exactComparisons = [
    [extension.canonicalPackageId, bindings.canonicalPackageId, 'CANONICAL_PACKAGE_MISMATCH', '$.bindings.canonicalPackageId', 'Canonical package identity mismatch.'],
    [brief.specId, bindings.specId, 'SPEC_ID_MISMATCH', '$.bindings.specId', 'Specification identity mismatch.'],
    [brief.subjectCommit, bindings.subjectCommit, 'SUBJECT_COMMIT_MISMATCH', '$.bindings.subjectCommit', 'Subject commit mismatch.'],
    [brief.parentCommit, bindings.parentCommit, 'PARENT_COMMIT_MISMATCH', '$.bindings.parentCommit', 'Parent commit mismatch.'],
    [brief.specRevision, bindings.specRevision, 'SPEC_REVISION_MISMATCH', '$.bindings.specRevision', 'Specification revision mismatch.'],
    [brief.traceDigest, bindings.traceDigest, 'TRACE_DIGEST_MISMATCH', '$.bindings.traceDigest', 'Trace digest mismatch.'],
    [brief.evidenceDigest, bindings.evidenceDigest, 'EVIDENCE_DIGEST_MISMATCH', '$.bindings.evidenceDigest', 'Evidence digest mismatch.'],
    [brief.briefDigest, bindings.briefDigest, 'BRIEF_DIGEST_MISMATCH', '$.bindings.briefDigest', 'Frozen brief digest mismatch.'],
    [extension.approvedPlanPath, bindings.approvedPlanPath, 'PLAN_PATH_MISMATCH', '$.bindings.approvedPlanPath', 'Approved plan path mismatch.'],
    [extension.approvedPlanCommit, bindings.approvedPlanCommit, 'PLAN_COMMIT_MISMATCH', '$.bindings.approvedPlanCommit', 'Approved plan commit mismatch.'],
    [extension.approvedPlanBlob, bindings.approvedPlanBlob, 'PLAN_BLOB_MISMATCH', '$.bindings.approvedPlanBlob', 'Approved plan blob mismatch.'],
    [extension.approvedPlanParent, bindings.approvedPlanParent, 'PLAN_PARENT_MISMATCH', '$.bindings.approvedPlanParent', 'Approved plan parent mismatch.'],
    [extension.verificationManifestDigest, bindings.verificationManifestDigest, 'VERIFICATION_MANIFEST_DIGEST_MISMATCH', '$.bindings.verificationManifestDigest', 'Verification manifest digest mismatch.']
  ];
  for (const [actual, expected, code, path, message] of exactComparisons) {
    compareBinding(errors, actual, expected, code, path, message);
  }

  compareBinding(errors, extension.allowlist, bindings.allowlist, 'ALLOWLIST_MISMATCH', '$.bindings.allowlist', 'Allowlist mismatch.');
  compareBinding(errors, extension.exclusions, bindings.exclusions, 'EXCLUSION_MISMATCH', '$.bindings.exclusions', 'Exclusion mismatch.');
  compareBinding(errors, [...(bindings.actualChangedFiles ?? [])].sort(), [...(extension.allowlist ?? [])].sort(), 'CHANGED_FILE_BOUNDARY_MISMATCH', '$.bindings.actualChangedFiles', 'Actual changed files do not equal the frozen implementation boundary.');

  const expectedBriefIdentity = `${brief.specId}/${brief.subjectCommit}`;
  if (brief.briefIdentity !== expectedBriefIdentity) {
    issue(errors, 'BRIEF_IDENTITY_MISMATCH', '$.brief.briefIdentity', 'Frozen brief identity does not bind spec and subject.');
  }

  const requiredCommands = Array.isArray(extension.requiredCommands) ? extension.requiredCommands : [];
  const results = Array.isArray(bindings.requiredCommandResults) ? bindings.requiredCommandResults : [];
  for (const command of requiredCommands) {
    const result = results.find((entry) => isRecord(entry) && entry.id === command.id);
    if (!result || result.declarationDigest !== command.declarationDigest) {
      issue(errors, 'REQUIRED_COMMAND_DECLARATION_MISMATCH', '$.bindings.requiredCommandResults', `Required command declaration mismatch: ${command.id}.`);
      continue;
    }
    if (result.result !== command.requiredResult) {
      issue(errors, 'REQUIRED_COMMAND_NOT_PASS', '$.bindings.requiredCommandResults', `Required command did not produce ${command.requiredResult}: ${command.id}.`);
    }
  }

  if (isRecord(bindings.trace)) {
    const traceResult = validateTraceManifest(bindings.trace, {
      specId: bindings.specId,
      subjectCommit: bindings.subjectCommit,
      parentCommit: bindings.parentCommit,
      specRevision: bindings.specRevision,
      verificationManifestDigest: bindings.verificationManifestDigest
    });
    errors.push(...traceResult.errors);
    try {
      if (digestArtifact(bindings.trace) !== bindings.traceDigest) {
        issue(errors, 'TRACE_DIGEST_MISMATCH', '$.bindings.trace', 'Trace payload does not match traceDigest.');
      }
      if (digestArtifact(bindings.trace.evidence ?? []) !== bindings.evidenceDigest) {
        issue(errors, 'EVIDENCE_DIGEST_MISMATCH', '$.bindings.trace.evidence', 'Trace evidence does not match evidenceDigest.');
      }
    } catch {
      issue(errors, 'MALFORMED_TRACE_MANIFEST', '$.bindings.trace', 'Trace payload is not deterministic JSON.');
    }
  } else {
    issue(errors, 'MISSING_TRACE', '$.bindings.trace', 'Frozen handoff requires a trace manifest.');
  }

  return {
    valid: errors.length === 0,
    errors: orderedIssues(errors),
    warnings: orderedIssues(warnings)
  };
}

export async function runPreflight(declaration, boundaries = {}) {
  const preflight = await evaluatePreflight(declaration, boundaries.observation);
  if (preflight.result === 'BLOCKED') return preflight;

  const profile = typeof boundaries.profile === 'string' ? boundaries.profile : 'focused';
  const verification = await executeVerificationProfile(
    declaration.verificationManifest,
    profile,
    { spawn: boundaries.spawn }
  );
  const diagnostics = [...preflight.diagnostics, ...verification.diagnostics];
  const requiredFailure = verification.commandResults.some((result) =>
    result.toolRequirement === 'REQUIRED' && result.result !== 'PASS'
  );
  if (requiredFailure) {
    issue(diagnostics, 'REQUIRED_VERIFICATION_NOT_PASS', '$.verification.commandResults', 'A required verification command did not pass.');
  }

  const projection = omitTopLevel(preflight, 'contentDigest');
  return portableWithDigest({
    ...projection,
    diagnostics: orderedIssues(diagnostics),
    effects: emptyEffects(),
    result: verification.valid && !requiredFailure ? 'PASS' : 'BLOCKED',
    verification
  });
}
