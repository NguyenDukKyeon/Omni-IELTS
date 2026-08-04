import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AUDIT_RESULTS,
  COMMAND_RESULTS,
  canonicalizeArtifact,
  containsForbiddenAuthorityCopy,
  digestArtifact,
  redactPortableValue,
  validateArtifact,
  validateFrozenBrief
} from '../scripts/ewf-artifacts.mjs';

const bridge = await readFile(
  new URL('../.specify/memory/constitution.md', import.meta.url),
  'utf8'
);

const TEMPLATE_KINDS = [
  'change-set',
  'lightweight-repair',
  'spec-metadata',
  'verification-manifest',
  'implementation-report',
  'frozen-acceptance-brief',
  'audit-result'
];

const templateUrl = (kind) => new URL(
  `../.specify/templates/ewf/${kind}.template.json`,
  import.meta.url
);

async function loadTemplate(kind) {
  return JSON.parse(await readFile(templateUrl(kind), 'utf8'));
}

function clone(value) {
  return structuredClone(value);
}

const canonicalOptions = { canonicalPackageIds: ['EWF-00'] };

test('constitution links every canonical authority and declares subordination', () => {
  for (const path of [
    'AGENTS.md',
    'docs/ROADMAP.md',
    'docs/IMPLEMENTATION_PLAN.md',
    'docs/IMPLEMENTATION_STATUS.md',
    'docs/DECISIONS.md'
  ]) assert.match(bridge, new RegExp(path.replaceAll('/', '\\/')));
  assert.match(bridge, /not canonical authority/i);
  assert.match(bridge, /not acceptance evidence/i);
  assert.equal(containsForbiddenAuthorityCopy(bridge), false);
});

test('forbidden-authority scanner rejects copied governance structures, not links', () => {
  assert.equal(containsForbiddenAuthorityCopy('See [Definition of Done](../../docs/ROADMAP.md).'), false);
  assert.equal(containsForbiddenAuthorityCopy('## Definition of Done\n- [ ] Ship it'), true);
  assert.equal(containsForbiddenAuthorityCopy('| Package | Status |\n|---|---|\n| EWF-00 | ACCEPTED |'), true);
  assert.equal(containsForbiddenAuthorityCopy('## Context\nDetails\n## Decision\nCopy body'), true);
});

test('every EWF template is versioned, typed, subordinate and valid', async () => {
  for (const kind of TEMPLATE_KINDS) {
    const template = await loadTemplate(kind);
    assert.equal(template.schemaVersion, 1);
    assert.equal(template.artifactKind, kind);
    assert.equal(typeof template.authorityLabel, 'string');
    assert.match(template.authorityLabel, /NOT_|AUDIT/i);
    const result = validateArtifact(kind, template, canonicalOptions);
    assert.equal(result.valid, true, `${kind}: ${JSON.stringify(result.errors)}`);
    assert.equal(typeof result.digest, 'string');
    assert.equal(result.digest.length, 64);
  }
});

test('change-set requires every bounded authorization field', async () => {
  const template = await loadTemplate('change-set');
  for (const field of [
    'predecessor', 'branch', 'worktree', 'writer', 'allowlist', 'exclusions', 'stopConditions'
  ]) {
    const candidate = clone(template);
    delete candidate[field];
    const result = validateArtifact('change-set', candidate);
    assert.equal(result.valid, false, field);
    assert.ok(result.errors.some((error) => error.path === `$.${field}`), field);
  }
});

test('lightweight repair requires every eligibility predicate to be explicitly true', async () => {
  const template = await loadTemplate('lightweight-repair');
  for (const field of Object.keys(template.eligibility)) {
    const falseCandidate = clone(template);
    falseCandidate.eligibility[field] = false;
    assert.equal(validateArtifact('lightweight-repair', falseCandidate).valid, false, field);

    const missingCandidate = clone(template);
    delete missingCandidate.eligibility[field];
    assert.equal(validateArtifact('lightweight-repair', missingCandidate).valid, false, field);
  }
});

test('spec metadata requires an existing package and unique namespaced requirements', async () => {
  const template = await loadTemplate('spec-metadata');
  assert.equal(validateArtifact('spec-metadata', template, canonicalOptions).valid, true);
  assert.equal(validateArtifact('spec-metadata', template, { canonicalPackageIds: [] }).valid, false);
  assert.equal(validateArtifact('spec-metadata', template).valid, false);

  const duplicate = clone(template);
  duplicate.requirements.push(clone(duplicate.requirements[0]));
  assert.equal(validateArtifact('spec-metadata', duplicate, canonicalOptions).valid, false);

  const wrongNamespace = clone(template);
  wrongNamespace.requirements[0].id = 'OTHER-AC-01';
  assert.equal(validateArtifact('spec-metadata', wrongNamespace, canonicalOptions).valid, false);
});

test('implementation reports preserve non-acceptance and cannot fake readiness', async () => {
  const template = await loadTemplate('implementation-report');
  assert.equal(template.authorityLabel, 'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE');
  assert.equal(validateArtifact('implementation-report', template).valid, true);

  const wrongLabel = clone(template);
  wrongLabel.authorityLabel = 'ACCEPTED';
  assert.equal(validateArtifact('implementation-report', wrongLabel).valid, false);

  const incomplete = clone(template);
  incomplete.handoffState = 'HANDOFF_READY';
  assert.equal(validateArtifact('implementation-report', incomplete).valid, false);
});

test('HANDOFF_READY requires a lowercase frozen brief SHA-256 digest', async () => {
  const report = await loadTemplate('implementation-report');
  Object.assign(report, {
    handoffState: 'HANDOFF_READY',
    subjectCommit: 'a'.repeat(40),
    parentCommit: 'b'.repeat(40),
    changedFiles: ['scripts/ewf-artifacts.mjs'],
    requirementTrace: [{ requirementId: 'EWF00-AC-01' }],
    commandResults: [{
      command: 'node --test tests/ewf-artifact-contracts.test.mjs',
      result: 'PASS',
      durationMs: 1,
      exitCode: 0,
      environment: 'node-test'
    }],
    environment: { node: process.version }
  });

  report.frozenBriefDigest = null;
  assert.equal(validateArtifact('implementation-report', report).valid, false);

  report.frozenBriefDigest = 'A'.repeat(64);
  assert.equal(validateArtifact('implementation-report', report).valid, false);

  report.frozenBriefDigest = 'c'.repeat(64);
  assert.equal(validateArtifact('implementation-report', report).valid, true);
});

test('command and audit results accept exactly their frozen vocabularies', async () => {
  assert.deepEqual(COMMAND_RESULTS, ['PASS', 'FAIL', 'ERROR', 'NOT_RUN', 'NOT_AVAILABLE']);
  assert.deepEqual(AUDIT_RESULTS, ['ACCEPT', 'REJECT', 'BLOCKED_BY_INVALID_BRIEF']);

  const report = await loadTemplate('implementation-report');
  for (const resultName of COMMAND_RESULTS) {
    const candidate = clone(report);
    candidate.commandResults = [{
      command: 'node --test',
      result: resultName,
      durationMs: 1,
      exitCode: resultName === 'PASS' ? 0 : null,
      environment: 'node-test'
    }];
    assert.equal(validateArtifact('implementation-report', candidate).valid, true, resultName);
  }
  const invalidReport = clone(report);
  invalidReport.commandResults = [{
    command: 'node --test', result: 'SKIPPED', durationMs: 1, exitCode: null, environment: 'node-test'
  }];
  assert.equal(validateArtifact('implementation-report', invalidReport).valid, false);

  const audit = await loadTemplate('audit-result');
  for (const resultName of AUDIT_RESULTS) {
    const candidate = clone(audit);
    candidate.auditResult = resultName;
    assert.equal(validateArtifact('audit-result', candidate).valid, true, resultName);
  }
  const invalidAudit = clone(audit);
  invalidAudit.auditResult = 'APPROVED';
  assert.equal(validateArtifact('audit-result', invalidAudit).valid, false);
});

test('authority-like top-level fields and canonical status claims fail closed', async () => {
  const template = await loadTemplate('change-set');
  for (const [field, value] of [
    ['status', 'COMPLETE'],
    ['verdict', 'ACCEPT'],
    ['canonicalStatus', 'ACCEPTED'],
    ['packageStatus', 'DONE'],
    ['releaseSafety', 'SAFE']
  ]) {
    const candidate = clone(template);
    candidate[field] = value;
    const result = validateArtifact('change-set', candidate);
    assert.equal(result.valid, false, field);
  }

  const nested = clone(template);
  nested.extensions = { packageStatus: 'ACCEPTED' };
  assert.equal(validateArtifact('change-set', nested).valid, false);
});

test('validation rejects non-JSON data, nested status claims and forged authority labels', async () => {
  const template = await loadTemplate('change-set');

  const nonJson = clone(template);
  nonJson.extensions.unserializable = undefined;
  assert.equal(validateArtifact('change-set', nonJson).valid, false);

  const nestedClaim = clone(template);
  nestedClaim.writer.packageStatus = 'ACCEPTED';
  assert.equal(validateArtifact('change-set', nestedClaim).valid, false);

  const forgedAuthority = clone(template);
  forgedAuthority.authorityLabel = 'CANONICAL_AUTHORITY / ACCEPTED';
  assert.equal(validateArtifact('change-set', forgedAuthority).valid, false);
});

test('nested validation errors retain their full artifact path', async () => {
  const template = await loadTemplate('change-set');
  delete template.worktree.mode;
  const result = validateArtifact('change-set', template);
  assert.ok(result.errors.some((error) => error.path === '$.worktree.mode'));
});

test('validation issues are sorted deterministically', () => {
  const result = validateArtifact('change-set', { artifactKind: 'wrong' });
  const sorted = [...result.errors].sort((a, b) =>
    a.code.localeCompare(b.code) || a.path.localeCompare(b.path) || a.message.localeCompare(b.message)
  );
  assert.deepEqual(result.errors, sorted);
  assert.equal(result.normalized, null);
  assert.equal(result.digest, null);
});

test('canonicalization and digest are deterministic for logical JSON equality', () => {
  const a = { b: 2, a: 1, nested: { z: true, a: null }, list: [{ y: 2, x: 1 }] };
  const b = { list: [{ x: 1, y: 2 }], nested: { a: null, z: true }, a: 1, b: 2 };
  assert.equal(canonicalizeArtifact(a), canonicalizeArtifact(b));
  assert.equal(digestArtifact(a), digestArtifact(b));
  assert.notEqual(canonicalizeArtifact([1, 2]), canonicalizeArtifact([2, 1]));
  assert.match(digestArtifact(a), /^[0-9a-f]{64}$/);
});

test('canonicalization rejects non-JSON values instead of coercing them', () => {
  for (const value of [
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    1n,
    new Date('2026-08-04T00:00:00Z'),
    { missing: undefined },
    [1, undefined]
  ]) {
    assert.throws(() => canonicalizeArtifact(value), /JSON/i);
  }
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalizeArtifact(cyclic), /JSON|cyclic/i);
});

function withoutBriefDigest(brief) {
  const { briefDigest: _ignored, ...digestable } = brief;
  return digestable;
}

async function boundFrozenBrief() {
  const brief = await loadTemplate('frozen-acceptance-brief');
  brief.briefDigest = digestArtifact(withoutBriefDigest(brief));
  const bindings = {
    subjectCommit: brief.subjectCommit,
    parentCommit: brief.parentCommit,
    specRevision: brief.specRevision,
    traceDigest: brief.traceDigest,
    evidenceDigest: brief.evidenceDigest,
    briefIdentity: brief.briefIdentity,
    briefDigest: brief.briefDigest
  };
  return { brief, bindings };
}

test('frozen brief validates identity/completeness without issuing acceptance', async () => {
  const { brief, bindings } = await boundFrozenBrief();
  const result = validateFrozenBrief(brief, bindings);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.auditResult, null);
  assert.notEqual(result.auditResult, 'ACCEPT');
  assert.equal(result.digest, digestArtifact(brief));
});

test('any frozen subject, parent, revision, evidence or identity mismatch blocks the brief', async () => {
  const { brief, bindings } = await boundFrozenBrief();
  const mismatches = {
    subjectCommit: 'a'.repeat(40),
    parentCommit: 'b'.repeat(40),
    specRevision: 'different-spec-revision',
    traceDigest: 'c'.repeat(64),
    evidenceDigest: 'd'.repeat(64),
    briefIdentity: 'different/brief-identity',
    briefDigest: 'e'.repeat(64)
  };

  for (const [field, replacement] of Object.entries(mismatches)) {
    const candidateBindings = { ...bindings, [field]: replacement };
    const result = validateFrozenBrief(brief, candidateBindings);
    assert.equal(result.valid, false, field);
    assert.equal(result.auditResult, 'BLOCKED_BY_INVALID_BRIEF', field);
    assert.notEqual(result.auditResult, 'ACCEPT', field);
    assert.ok(result.errors.some((error) => error.path === `$.bindings.${field}`), field);
  }
});

test('tampering with the stored brief digest blocks validation even when bindings match it', async () => {
  const { brief, bindings } = await boundFrozenBrief();
  brief.briefDigest = 'f'.repeat(64);
  bindings.briefDigest = brief.briefDigest;
  const result = validateFrozenBrief(brief, bindings);
  assert.equal(result.valid, false);
  assert.equal(result.auditResult, 'BLOCKED_BY_INVALID_BRIEF');
  assert.ok(result.errors.some((error) => error.code === 'BRIEF_DIGEST_MISMATCH'));
});

const repositoryRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

async function snapshotPortableFiles() {
  const roots = [
    join(repositoryRoot, '.specify'),
    join(repositoryRoot, 'scripts', 'ewf-artifacts.mjs'),
    join(repositoryRoot, 'tests', 'ewf-artifact-contracts.test.mjs')
  ];
  const snapshot = {};
  for (const root of roots) {
    const rootStat = await stat(root);
    const paths = rootStat.isDirectory()
      ? (await readdir(root, { recursive: true, withFileTypes: true }))
          .filter((entry) => entry.isFile())
          .map((entry) => join(entry.parentPath, entry.name))
      : [root];
    for (const path of paths) {
      const metadata = await stat(path);
      snapshot[relative(repositoryRoot, path).replaceAll('\\', '/')] = {
        size: metadata.size,
        mtimeMs: metadata.mtimeMs,
        mode: metadata.mode
      };
    }
  }
  return snapshot;
}

test('portable redaction removes secrets and machine-absolute private paths', () => {
  const original = {
    repoPath: 'scripts/ewf-artifacts.mjs',
    relativeDataPath: 'mnt/data/VocabMaster/evidence.json',
    identity: 'NguyenDukKyeon',
    posixPath: '/home/alice/VocabMaster/.env',
    sandboxPath: '/mnt/data/VocabMaster/evidence.json',
    windowsPath: 'C:\\Users\\Alice\\VocabMaster\\secret.txt',
    log: 'failed at /Users/alice/VocabMaster/private.json',
    apiKey: 'plain-secret-value',
    nested: {
      credential: 'alice:password',
      accessToken: 'ordinary-looking-secret',
      clientSecret: 'another-secret',
      opaque: 'ghp_abcdefghijklmnopqrstuvwxyz1234567890',
      authenticatedUrl: 'https://alice:password@example.com/private',
      safeUrl: 'https://example.com/docs'
    }
  };

  const redacted = redactPortableValue(original);
  assert.notStrictEqual(redacted, original);
  assert.equal(redacted.repoPath, original.repoPath);
  assert.equal(redacted.relativeDataPath, original.relativeDataPath);
  assert.equal(redacted.identity, original.identity);
  assert.equal(redacted.posixPath, '[REDACTED_ABSOLUTE_PATH]');
  assert.equal(redacted.sandboxPath, '[REDACTED_ABSOLUTE_PATH]');
  assert.equal(redacted.windowsPath, '[REDACTED_ABSOLUTE_PATH]');
  assert.equal(redacted.log, 'failed at [REDACTED_ABSOLUTE_PATH]');
  assert.equal(redacted.apiKey, '[REDACTED_SECRET]');
  assert.equal(redacted.nested.credential, '[REDACTED_SECRET]');
  assert.equal(redacted.nested.accessToken, '[REDACTED_SECRET]');
  assert.equal(redacted.nested.clientSecret, '[REDACTED_SECRET]');
  assert.equal(redacted.nested.opaque, '[REDACTED_SECRET]');
  assert.equal(redacted.nested.authenticatedUrl, 'https://[REDACTED_CREDENTIALS]@example.com/private');
  assert.equal(redacted.nested.safeUrl, original.nested.safeUrl);
  assert.equal(original.apiKey, 'plain-secret-value');
});

async function runCheckWithBridge(bridgeText) {
  const tempRoot = await mkdtemp(join(tmpdir(), 'ewf-check-'));
  try {
    await mkdir(join(tempRoot, 'scripts'), { recursive: true });
    await mkdir(join(tempRoot, '.specify', 'memory'), { recursive: true });
    await cp(
      join(repositoryRoot, '.specify', 'templates'),
      join(tempRoot, '.specify', 'templates'),
      { recursive: true }
    );
    await cp(
      join(repositoryRoot, 'scripts', 'ewf-artifacts.mjs'),
      join(tempRoot, 'scripts', 'ewf-artifacts.mjs')
    );
    await writeFile(join(tempRoot, '.specify', 'memory', 'constitution.md'), bridgeText, 'utf8');
    return spawnSync(
      process.execPath,
      [join(tempRoot, 'scripts', 'ewf-artifacts.mjs'), '--check'],
      { cwd: tempRoot, encoding: 'utf8', env: { ...process.env, PATH: '' } }
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

test('--check rejects a bridge missing canonical links or authority declarations', async () => {
  const cases = [
    {
      name: 'canonical link',
      value: bridge.replaceAll('docs/DECISIONS.md', 'docs/DECISIONS-REMOVED.md'),
      code: 'MISSING_CANONICAL_AUTHORITY_LINK'
    },
    {
      name: 'noncanonical declaration',
      value: bridge.replace(/not canonical authority/i, 'local reference'),
      code: 'MISSING_NONCANONICAL_DECLARATION'
    },
    {
      name: 'non-acceptance declaration',
      value: bridge.replace(/not acceptance evidence/i, 'supporting notes'),
      code: 'MISSING_NONACCEPTANCE_DECLARATION'
    }
  ];

  for (const fixture of cases) {
    const result = await runCheckWithBridge(fixture.value);
    assert.notEqual(result.status, 0, fixture.name);
    assert.match(result.stdout, new RegExp(fixture.code), fixture.name);
  }
});

test('--check succeeds without Spec Kit on PATH and performs zero repository writes', async () => {
  const before = await snapshotPortableFiles();
  const result = spawnSync(
    process.execPath,
    [join(repositoryRoot, 'scripts', 'ewf-artifacts.mjs'), '--check'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: { ...process.env, PATH: '' }
    }
  );
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /"valid"\s*:\s*true/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /specify.*not found/i);
  const after = await snapshotPortableFiles();
  assert.deepEqual(after, before);
});

test('CLI rejects unsupported modes without writing', async () => {
  const before = await snapshotPortableFiles();
  const result = spawnSync(
    process.execPath,
    [join(repositoryRoot, 'scripts', 'ewf-artifacts.mjs'), '--execute'],
    { cwd: repositoryRoot, encoding: 'utf8' }
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsupported/i);
  assert.deepEqual(await snapshotPortableFiles(), before);
});
