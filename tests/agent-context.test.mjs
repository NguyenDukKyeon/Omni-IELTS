import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Import the compiler's core function (not the CLI entry point)
const { compileContext } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'agent-context.mjs')).href);

// ============================================================================
// A. Recognized pilot transaction resolves
// ============================================================================
test('A: recognized W0-IELTS-ARCH-001 transaction resolves to a capsule', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true, 'compiler should succeed for known transaction');
  assert.equal(result.capsule.transaction_id, 'W0-IELTS-ARCH-001');
  assert.ok(result.capsule.authorization_manifest_status, 'authorization_manifest_status must be present');
  assert.ok(result.capsule.current_execution_status, 'current_execution_status must be present');
  assert.ok(result.capsule.authority_sources, 'authority_sources must be present');
  assert.ok(result.capsule.canonical_main, 'canonical_main must be present');
  assert.ok(result.capsule.working_head, 'working_head must be present');
  assert.ok(result.capsule.transaction_predecessor, 'transaction_predecessor must be present');
  assert.ok(result.capsule.allowed_writes, 'allowed_writes must be present');
  assert.ok(result.capsule.required_tests, 'required_tests must be present');
  assert.ok(result.capsule.stop_conditions, 'stop_conditions must be present');
  assert.ok(result.capsule.primary_context, 'primary_context must be present');
  assert.ok(result.capsule.metrics, 'metrics must be present');
});

// ============================================================================
// B. Deterministic repeated JSON output
// ============================================================================
test('B: two compilations produce byte-identical JSON', async () => {
  const r1 = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  const r2 = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  const j1 = JSON.stringify(r1.capsule, null, 2);
  const j2 = JSON.stringify(r2.capsule, null, 2);
  assert.equal(j1, j2, 'JSON output must be byte-identical across runs');
});

// ============================================================================
// C. (R1) Canonical main differs from working HEAD on feature branch
// ============================================================================
test('C (R1): canonical_main represents canonical main ref, distinct from working_head', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);

  const canonicalMain = result.capsule.canonical_main;
  assert.ok(canonicalMain && canonicalMain.value, 'canonical_main.value must exist');
  assert.match(canonicalMain.value, /^[0-9a-f]{40}$/, 'canonical_main must be 40-char SHA');
  assert.ok(
    ['GITHUB_EVENT_PATH', 'refs/remotes/origin/main', 'refs/heads/main'].includes(canonicalMain.source),
    `canonical_main.source must be a recognized source, got: ${canonicalMain.source}`
  );

  const workingHead = result.capsule.working_head;
  assert.ok(workingHead && workingHead.value, 'working_head.value must exist');
  assert.match(workingHead.value, /^[0-9a-f]{40}$/, 'working_head must be 40-char SHA');

  // Verify that canonical_main matches git origin/main or GITHUB_EVENT_PATH base sha
  let expectedMain = null;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
      if (event.pull_request?.base?.ref === 'main' && event.pull_request?.base?.sha) {
        expectedMain = event.pull_request.base.sha;
      }
    } catch {}
  }
  if (!expectedMain) {
    try {
      expectedMain = execFileSync('git', ['rev-parse', 'refs/remotes/origin/main'], { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch {
      try {
        expectedMain = execFileSync('git', ['rev-parse', 'refs/heads/main'], { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
      } catch {}
    }
  }

  if (expectedMain) {
    assert.equal(canonicalMain.value, expectedMain, 'canonical_main must match expected main');
  }
});

// ============================================================================
// D. Provenance exists for authority-sensitive fields
// ============================================================================
test('D: authority-sensitive fields carry provenance with correct sources', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  const c = result.capsule;

  // Manifest-derived fields
  const manifestFields = [
    'authorization_manifest_status',
    'transaction_predecessor',
    'allowed_writes',
    'required_tests',
    'stop_conditions',
  ];

  for (const field of manifestFields) {
    assert.ok(c[field], `field ${field} must exist`);
    const entry = c[field];
    assert.ok(entry.provenance, `${field} must have provenance`);
    assert.equal(entry.provenance.source_path, 'docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md');
    assert.match(entry.provenance.source_blob_sha, /^[0-9a-f]{40}$/);
    assert.ok(entry.provenance.anchor, `${field}.provenance must have anchor`);
  }

  // Execution status provenance MUST point to docs/IMPLEMENTATION_STATUS.md
  assert.ok(c.current_execution_status, 'current_execution_status must exist');
  assert.equal(c.current_execution_status.provenance.source_path, 'docs/IMPLEMENTATION_STATUS.md');
  assert.match(c.current_execution_status.provenance.source_blob_sha, /^[0-9a-f]{40}$/);
  assert.ok(c.current_execution_status.provenance.anchor.includes('Stage 2 Wave W0'),
    'anchor must reference the exact section in IMPLEMENTATION_STATUS.md');
});

// ============================================================================
// E. Unknown transaction fails closed
// ============================================================================
test('E: unknown transaction returns UNKNOWN_TRANSACTION failure', async () => {
  const result = await compileContext('NONEXISTENT-TRANSACTION-XYZ', { rootDir: ROOT });
  assert.equal(result.ok, false, 'compiler must fail for unknown transaction');
  assert.equal(result.error, 'UNKNOWN_TRANSACTION');
  assert.equal(result.capsule, undefined, 'no capsule on failure');
});

// ============================================================================
// F. Ambiguous authority fails closed
// ============================================================================
test('F: ambiguous authority (duplicate sources) fails closed', async () => {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-ambig-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    const header = 'Wave ID: **AMBIG-TEST-001**\nProtocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1**\nStatus: **CANDIDATE**\nCanonical Predecessor (Base): **abc123**\n';
    fs.writeFileSync(path.join(docsDir, 'auth-a.md'), `# Auth A\n\nManifest Identity: **AMBIG-AUTH-A**\n${header}`);
    fs.writeFileSync(path.join(docsDir, 'auth-b.md'), `# Auth B\n\nManifest Identity: **AMBIG-AUTH-B**\n${header}`);
    const result = await compileContext('AMBIG-TEST-001', {
      rootDir: ROOT,
      authorizationDir: docsDir,
    });
    assert.equal(result.ok, false, 'compiler must fail on ambiguous authority');
    assert.equal(result.error, 'AMBIGUOUS_AUTHORITY');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// G. Required anchor missing fails closed
// ============================================================================
test('G: missing required heading fails closed with REQUIRED_FIELD_MISSING', async () => {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-missing-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    const content = [
      '# Wave Authorization Manifest — Test',
      '',
      'Manifest Identity: **MISSING-ANCHOR-AUTH-001**',
      'Wave ID: **MISSING-ANCHOR-001**',
      'Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1**',
      'Status: **CANDIDATE**',
      'Canonical Predecessor (Base): **abc123**',
      '',
      '## 1. Summary',
      'Some summary text.',
    ].join('\n');
    fs.writeFileSync(path.join(docsDir, 'auth-missing.md'), content);
    const result = await compileContext('MISSING-ANCHOR-001', {
      rootDir: ROOT,
      authorizationDir: docsDir,
    });
    assert.equal(result.ok, false, 'compiler must fail on missing required anchor');
    assert.equal(result.error, 'REQUIRED_FIELD_MISSING');
    assert.ok(result.message, 'must include a diagnostic message');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// H. (R2) Real canonical W0 status is reconciled to EXACTLY HISTORICAL_CLOSED
// ============================================================================
test('H (R2): historical W0 transaction reconciles to EXACTLY HISTORICAL_CLOSED', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);

  // Current execution status MUST be exactly HISTORICAL_CLOSED (reconciled from IMPLEMENTATION_STATUS.md)
  assert.equal(result.capsule.current_execution_status.value, 'HISTORICAL_CLOSED');

  // Authorization manifest status must accurately preserve the original historical manifest header
  assert.equal(
    result.capsule.authorization_manifest_status.value,
    'CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE'
  );
});

// ============================================================================
// I. (R3) Truthful metrics distinguishing actual machine work from estimates
// ============================================================================
test('I (R3): metrics accurately distinguish machine-read bytes from estimated context', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const m = result.capsule.metrics;

  // Actual machine work
  assert.ok(typeof m.authorization_discovery_files_read === 'number' && m.authorization_discovery_files_read > 0);
  assert.ok(typeof m.authorization_discovery_bytes_read === 'number' && m.authorization_discovery_bytes_read > 0);
  assert.ok(typeof m.authority_bytes_parsed === 'number' && m.authority_bytes_parsed > 0);
  assert.ok(typeof m.status_bytes_read === 'number' && m.status_bytes_read > 0);
  assert.ok(typeof m.status_bytes_parsed === 'number' && m.status_bytes_parsed > 0);
  assert.ok(typeof m.total_machine_bytes_read === 'number' && m.total_machine_bytes_read > 0);
  assert.ok(typeof m.capsule_bytes === 'number' && m.capsule_bytes > 0);
  assert.ok(typeof m.model_context_bytes_emitted === 'number' && m.model_context_bytes_emitted > 0);

  // Exact arithmetic checks for actual machine bytes
  assert.equal(
    m.total_machine_bytes_read,
    m.authorization_discovery_bytes_read + m.status_bytes_read,
    'total_machine_bytes_read must equal sum of files actually read'
  );

  // Estimated full agent context must be separate and larger
  assert.ok(typeof m.estimated_full_agent_context_bytes === 'number');
  assert.ok(m.estimated_full_agent_context_bytes > m.total_machine_bytes_read,
    'estimated full context must be strictly larger than bytes actually read by compiler');

  // Truthful ratio naming
  assert.ok(typeof m.machine_read_to_capsule_ratio === 'number');
  assert.ok(typeof m.estimated_agent_context_reduction_ratio === 'number');
});

// ============================================================================
// J. Compiler does not require network access
// ============================================================================
test('J: compiler operates purely on local files and git without network dependencies', async () => {
  const srcPath = path.join(ROOT, 'scripts', 'agent-context.mjs');
  const src = fs.readFileSync(srcPath, 'utf8');
  assert.ok(!src.match(/from\s+['"](?:node:)?(?:http|https|net|dns|tls)['"]/),
    'compiler must not import network modules');
  assert.ok(!src.includes('fetch('), 'compiler must not use fetch()');
  assert.ok(!src.includes('XMLHttpRequest'), 'compiler must not use XMLHttpRequest');

  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true, 'compiler succeeds without network');
});

// ============================================================================
// K. (R4) UNSUPPORTED_AUTHORITY_FORMAT fails closed
// ============================================================================
test('K (R4): unsupported protocol/format fails closed with UNSUPPORTED_AUTHORITY_FORMAT', async () => {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-format-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    const content = [
      '# Wave Authorization Manifest — Unsupported Format',
      '',
      'Manifest Identity: **UNSUPPORTED-AUTH-001**',
      'Wave ID: **UNSUPPORTED-FORMAT-001**',
      'Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V99_UNKNOWN**',
      'Status: **CANDIDATE**',
      'Canonical Predecessor (Base): **abc123**',
      '',
      '## 5. Exact Implementation Allowlist',
      '| File Path | Description |',
      '|---|---|',
      '| `src/foo.js` | Foo |',
      '',
      '## 6. RED / GREEN Execution Topology',
      '## 9. Verification Commands',
      '```bash',
      'npm test',
      '```',
      '## 10. Execution Stop Conditions',
      '1. `STOP_ONE`',
    ].join('\n');
    fs.writeFileSync(path.join(docsDir, 'auth-unsupported.md'), content);
    const result = await compileContext('UNSUPPORTED-FORMAT-001', {
      rootDir: ROOT,
      authorizationDir: docsDir,
    });
    assert.equal(result.ok, false, 'compiler must fail on unsupported protocol format');
    assert.equal(result.error, 'UNSUPPORTED_AUTHORITY_FORMAT');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// L. (R5) CANONICAL_CONTRADICTION fails closed
// ============================================================================
test('L (R5): contradictory status facts fail closed with CANONICAL_CONTRADICTION', async () => {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-contra-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    const authContent = [
      '# Wave Authorization Manifest — Valid',
      '',
      'Manifest Identity: **CONTRA-AUTH-001**',
      'Wave ID: **CONTRA-TEST-001**',
      'Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1**',
      'Status: **ACCEPTED**',
      'Canonical Predecessor (Base): **abc123**',
      '',
      '## 5. Exact Implementation Allowlist',
      '| File Path | Description |',
      '|---|---|',
      '| `src/foo.js` | Foo |',
      '',
      '## 6. RED / GREEN Execution Topology',
      '## 9. Verification Commands',
      '```bash',
      'npm test',
      '```',
      '## 10. Execution Stop Conditions',
      '1. `STOP_ONE`',
    ].join('\n');
    fs.writeFileSync(path.join(docsDir, 'auth-contra.md'), authContent);

    const statusContent = [
      '# Implementation Status',
      '',
      '## Contradictory Section',
      '- **Wave ID**: `CONTRA-TEST-001`',
      '- **Status**: `ACCEPTED`',
      '- **Secondary Status**: `REJECTED_UNRESOLVED` (Conflict)',
    ].join('\n');
    const statusPath = path.join(tmpDir, 'docs', 'IMPLEMENTATION_STATUS.md');
    fs.writeFileSync(statusPath, statusContent);

    const result = await compileContext('CONTRA-TEST-001', {
      rootDir: ROOT,
      authorizationDir: docsDir,
      statusFilePath: statusPath,
    });
    assert.equal(result.ok, false, 'compiler must fail on contradictory canonical status');
    assert.equal(result.error, 'CANONICAL_CONTRADICTION');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// M. (R6) AUTHORITY_NOT_EFFECTIVE fails closed
// ============================================================================
test('M (R6): candidate manifest with no historical/current execution closure fails with AUTHORITY_NOT_EFFECTIVE', async () => {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-not-eff-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    const authContent = [
      '# Wave Authorization Manifest — Not Effective',
      '',
      'Manifest Identity: **NOT-EFF-AUTH-001**',
      'Wave ID: **NOT-EFF-TEST-001**',
      'Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1**',
      'Status: **CANDIDATE / AUTHORIZATION_PENDING / NOT_EFFECTIVE**',
      'Canonical Predecessor (Base): **abc123**',
      '',
      '## 5. Exact Implementation Allowlist',
      '| File Path | Description |',
      '|---|---|',
      '| `src/foo.js` | Foo |',
      '',
      '## 6. RED / GREEN Execution Topology',
      '## 9. Verification Commands',
      '```bash',
      'npm test',
      '```',
      '## 10. Execution Stop Conditions',
      '1. `STOP_ONE`',
    ].join('\n');
    fs.writeFileSync(path.join(docsDir, 'auth-not-eff.md'), authContent);

    const statusContent = '# Implementation Status\n\nNo records for NOT-EFF-TEST-001.\n';
    const statusPath = path.join(tmpDir, 'docs', 'IMPLEMENTATION_STATUS.md');
    fs.writeFileSync(statusPath, statusContent);

    const result = await compileContext('NOT-EFF-TEST-001', {
      rootDir: ROOT,
      authorizationDir: docsDir,
      statusFilePath: statusPath,
    });
    assert.equal(result.ok, false, 'compiler must fail when authority is not effective and no closure exists');
    assert.equal(result.error, 'AUTHORITY_NOT_EFFECTIVE');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// N. (R7) Shell safety — argument-safe process invocation
// ============================================================================
test('N (R7): compiler uses argument-safe process invocation with zero execSync string interpolation', async () => {
  const srcPath = path.join(ROOT, 'scripts', 'agent-context.mjs');
  const src = fs.readFileSync(srcPath, 'utf8');

  assert.ok(!src.includes('execSync('), 'compiler must not use execSync');
  assert.ok(src.includes('execFileSync'), 'compiler must use execFileSync');
});

// ============================================================================
// O. Canonical W0 values verification
// ============================================================================
test('O: W0 capsule contains expected canonical values from authorization doc', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const c = result.capsule;

  assert.equal(c.transaction_predecessor.value, 'a755ae4949746a71ac86299b34766ad8fe3b6fb6');
  assert.ok(c.authority_sources.some(s => s.includes('STAGE2-W0-IELTS-ARCH-AUTH-001')));

  const writes = c.allowed_writes.value;
  assert.ok(writes.some(w => w.includes('src/ielts-domain.js')));
  assert.ok(writes.some(w => w.includes('src/ielts-persistence.js')));
  assert.ok(writes.some(w => w.includes('src/backup-registry.js')));

  const stops = c.stop_conditions.value;
  assert.ok(stops.some(s => s.includes('CANONICAL_BASE_DRIFT')));
  assert.ok(stops.some(s => s.includes('RED_TEST_MUTATION_REQUIRED')));

  assert.equal(c.authority_provenance_model, 'CANONICAL_DOCS_ARE_AUTHORITY_CAPSULE_IS_DERIVED');
});

// ============================================================================
// P. (R8) EXACT FINAL CAPSULE BYTE EQUALITY (F006 remediation)
// ============================================================================
test('P (R8): reported capsule_bytes exactly equals Buffer.byteLength of emitted JSON', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);

  const json = JSON.stringify(result.capsule, null, 2);
  const actualBytes = Buffer.byteLength(json, 'utf8');

  assert.equal(
    result.capsule.metrics.capsule_bytes,
    actualBytes,
    `capsule_bytes (${result.capsule.metrics.capsule_bytes}) must match actual JSON byte length (${actualBytes})`
  );

  assert.equal(
    result.capsule.metrics.model_context_bytes_emitted,
    actualBytes,
    `model_context_bytes_emitted must equal capsule_bytes`
  );
});

// ============================================================================
// Q. (R9) PRIMARY CONTEXT CONTRACT / NO MANDATORY ALL-CORPUS REREAD (F007 remediation)
// ============================================================================
test('Q (R9): capsule establishes primary bounded execution context without broad mandatory reread', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const c = result.capsule;

  // Primary context declaration
  assert.ok(c.primary_context, 'primary_context must be present');
  assert.equal(
    c.primary_context.capsule_is_sufficient_for_bounded_execution,
    true,
    'capsule must declare itself sufficient for bounded execution'
  );

  // Must NOT emit a broad mandatory `required_reads` list that tells agents to read all governance docs upfront
  assert.equal(
    c.required_reads,
    undefined,
    'broad required_reads must be removed to avoid forcing coding agents to reread entire corpus'
  );
});

// ============================================================================
// R. (R10) ON-DEMAND AND AUTHORITY REFERENCES PRESERVED (F007 remediation)
// ============================================================================
test('R (R10): authority ledger and on-demand escalation references remain available with provenance', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const c = result.capsule;

  // Authority ledger references
  assert.ok(Array.isArray(c.authority_ledger_references), 'authority_ledger_references must be an array');
  assert.ok(c.authority_ledger_references.length > 0);
  for (const ref of c.authority_ledger_references) {
    assert.ok(ref.source_path, 'must have source_path');
    assert.match(ref.source_blob_sha, /^[0-9a-f]{40}$/, 'must have valid blob SHA');
    assert.ok(ref.role, 'must have role');
  }

  // Consult-on-demand references with explicit triggers
  assert.ok(Array.isArray(c.consult_on_demand_references), 'consult_on_demand_references must be an array');
  assert.ok(c.consult_on_demand_references.length > 0);
  for (const ref of c.consult_on_demand_references) {
    assert.ok(ref.path, 'must have path');
    assert.ok(ref.reason, 'must have reason');
    assert.ok(ref.triggers && ref.triggers.length > 0, 'must have triggers');
  }
});

// ============================================================================
// AGENT_CONTEXT_AUTH_ACTIVATION_V1 & Exact Predecessor Resolution Test Suite
// Transaction: AGENT-HARNESS-CONTEXT-COMPILER-PREDECESSOR-SUPPORT-001
// ============================================================================

function createTempGitRepo() {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-v1-git-'));
  const git = (args) => execFileSync('git', args, {
    cwd: tmpDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test Author',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test Committer',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();

  git(['init', '-b', 'main']);
  git(['config', 'user.name', 'Test Author']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'commit.gpgsign', 'false']);

  const cleanup = () => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  };

  return { dir: tmpDir, git, cleanup };
}

function makeValidManifest(manifestId, waveId, baseSha, overrides = {}) {
  return [
    `# Wave Authorization Manifest — ${waveId}`,
    '',
    `Manifest Identity: **${manifestId}**`,
    `Wave ID: **${waveId}**`,
    'Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1**',
    'Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**',
    `Canonical Predecessor (Base): **${baseSha}**`,
    '',
    '## 5. Exact Implementation Allowlist',
    '',
    '### 5.1 Source Allowlist (SOURCE_ALLOWLIST)',
    '| File Path | Description |',
    '|---|---|',
    '| `scripts/agent-rebind-check.mjs` | Source implementation |',
    '| `package.json` | Package manifest |',
    '',
    '### 5.2 Test Allowlist (TEST_ALLOWLIST)',
    '| File Path | Description |',
    '|---|---|',
    '| `tests/agent-rebind-check.test.mjs` | Test suite |',
    '| `.github/workflows/ci.yml` | CI workflow |',
    '',
    '### 5.3 Fixture Allowlist (FIXTURE_ALLOWLIST)',
    '| File Path | Description |',
    '|---|---|',
    '| `tests/fixtures/safe-rebind-w0-evidence-v1.json` | Fixture bundle |',
    '',
    '### 5.4 Docs and Evidence Allowlist (DOC_EVIDENCE_ALLOWLIST)',
    overrides.docEvidence || 'DOC_EVIDENCE_ALLOWLIST: NONE',
    '',
    '## 6. RED / GREEN Execution Topology',
    '### 6.1 Commit A',
    '| Test Path | Predicate | Expected Failure |',
    '|---|---|---|',
    '| `tests/agent-rebind-check.test.mjs` | Test Predicate 1 | Missing implementation |',
    '',
    '### 6.3 Commit B',
    '1. `node --test tests/agent-rebind-check.test.mjs` passes all tests.',
    '',
    '## 9. Verification Commands',
    '```bash',
    'npm test',
    '```',
    '### 9.2 Natural Exact-Head CI',
    'Requirements: Natural CI required.',
    '',
    '## 10. Execution Stop Conditions',
    '1. `CANONICAL_BASE_DRIFT`',
  ].join('\n');
}

function makeV1ActivationSection(transactionId, manifestPath, manifestId, acceptedHeadSha, reviewId = 'PRR_kwDOTmjPCs8AAAABJs-jLQ', overrides = {}) {
  return [
    `## AGENT_CONTEXT_AUTH_ACTIVATION_V1 — ${transactionId}`,
    '',
    '| Field | Value |',
    '|---|---|',
    `| Activation Schema | \`${overrides.schema || 'AGENT_CONTEXT_AUTH_ACTIVATION_V1'}\` |`,
    `| Transaction ID | \`${transactionId}\` |`,
    `| Authorization Manifest | \`${manifestPath}\` |`,
    `| Authorization Manifest Identity | \`${manifestId}\` |`,
    `| Authorization Accepted Head | \`${acceptedHeadSha}\` |`,
    `| Independent Authorization Review | \`${reviewId}\` |`,
    `| Authorization Merge SHA | \`${overrides.authMergeSha || 'SELF_RESOLVE_ACTIVATION_MERGE_SHA'}\` |`,
    `| Activation State | \`${overrides.state || 'AUTHORIZED / READY_FOR_EXECUTION'}\` |`,
    `| Effective Implementation Predecessor | \`${overrides.predecessor || 'SELF_RESOLVE_ACTIVATION_MERGE_SHA'}\` |`,
    '',
  ].join('\n');
}

// ============================================================================
// S. (T1) Pending candidate without canonical activation fails closed
// ============================================================================
test('S (T1): pending candidate manifest with no canonical activation fails with AUTHORITY_NOT_EFFECTIVE', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });
    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', '0000000000000000000000000000000000000000');
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');

    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'initial commit']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'AUTHORITY_NOT_EFFECTIVE');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// T. (T2) Working-tree activation without canonical main activation fails closed
// ============================================================================
test('T (T2): candidate working tree contains V1 activation but canonical origin/main does not -> AUTHORITY_NOT_EFFECTIVE', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });
    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', '0000000000000000000000000000000000000000');
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');

    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'main base without activation']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    // Now modify working tree ONLY (not committed or pushed to origin/main)
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', '1111111111111111111111111111111111111111');
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false, 'working-tree-only activation must NOT leak execution authority');
    assert.equal(result.error, 'AUTHORITY_NOT_EFFECTIVE');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// U. (T3, T4, T10, T16) Valid canonical V1 activation succeeds and resolves predecessor M
// ============================================================================
test('U (T3, T4, T10, T16): valid canonical V1 activation resolves predecessor M and emits READY_FOR_EXECUTION', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    // Commit 0: Base main
    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    // Candidate branch: add manifest
    repo.git(['checkout', '-b', 'docs/test-auth']);
    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'candidate authorization']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    // Merge candidate authorization to main
    repo.git(['checkout', 'main']);
    repo.git(['merge', '--no-ff', 'docs/test-auth', '-m', 'merge authorization PR']);
    const authMergeSha = repo.git(['rev-parse', 'HEAD']);

    // Activation on main
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical activation of TEST-TX-001']);
    const activationCommitM = repo.git(['rev-parse', 'HEAD']);

    // Update canonical origin/main
    repo.git(['update-ref', 'refs/remotes/origin/main', activationCommitM]);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, true, `compileContext should succeed, got: ${result.error}: ${result.message}`);
    const c = result.capsule;

    assert.equal(c.transaction_id, 'TEST-TX-001');
    assert.equal(c.current_execution_status.value, 'AUTHORIZED / READY_FOR_EXECUTION');
    assert.equal(c.transaction_predecessor.value, activationCommitM, 'transaction_predecessor must equal activation commit M');
    assert.ok(c.transaction_predecessor.provenance.anchor.includes('AGENT_CONTEXT_AUTH_ACTIVATION_V1'));
    assert.equal(c.current_execution_status.provenance.source_path, 'docs/IMPLEMENTATION_STATUS.md');
    assert.ok(c.allowed_writes.value.includes('scripts/agent-rebind-check.mjs'));
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// V. (T5) V1 activation record with manifest path mismatch fails closed
// ============================================================================
test('V (T5): V1 activation record with manifest path mismatch fails closed with ACTIVATION_MANIFEST_MISMATCH', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    // Activation pointing to nonexistent manifest path
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/NONEXISTENT-AUTH.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical activation with wrong path']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_MANIFEST_MISMATCH');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// W. (T6) V1 activation record with manifest identity mismatch fails closed
// ============================================================================
test('W (T6): V1 activation record with manifest identity mismatch fails closed with ACTIVATION_MANIFEST_MISMATCH', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    // Activation with mismatched manifest identity
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'WRONG-AUTH-IDENTITY-999', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical activation with wrong identity']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_MANIFEST_MISMATCH');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// X. (T7) V1 activation record with accepted-head blob mismatch fails closed
// ============================================================================
test('X (T7): V1 activation record with accepted-head manifest blob mismatch fails closed with ACTIVATION_MANIFEST_MISMATCH', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    // Candidate branch commit 1
    repo.git(['checkout', '-b', 'auth-branch']);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0, { docEvidence: 'DOC_EVIDENCE_ALLOWLIST: NONE' }));
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'accepted candidate head']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    // Candidate branch commit 2: mutate manifest blob
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0, { docEvidence: 'DOC_EVIDENCE_ALLOWLIST: MUTATED' }));
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'sneaky modification after audit']);

    // Merge mutated version to main
    repo.git(['checkout', 'main']);
    repo.git(['merge', '--no-ff', 'auth-branch', '-m', 'merge mutated candidate']);

    // Activation referencing the original acceptedHead, but blob on main differs
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical activation']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_MANIFEST_MISMATCH');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// Y. (T8) Duplicate V1 activation records fails with ACTIVATION_RECORD_AMBIGUOUS
// ============================================================================
test('Y (T8): duplicate V1 activation records for same transaction ID fails closed with ACTIVATION_RECORD_AMBIGUOUS', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    // Add duplicate activation records
    const a1 = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    const a2 = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${a1}\n${a2}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical activation with duplicates']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_RECORD_AMBIGUOUS');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// Z. (T9) Malformed V1 activation record fails closed with ACTIVATION_RECORD_INVALID
// ============================================================================
test('Z (T9): malformed V1 activation record missing required field fails closed with ACTIVATION_RECORD_INVALID', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);

    // Malformed activation section missing Independent Authorization Review
    const malformedSection = [
      '## AGENT_CONTEXT_AUTH_ACTIVATION_V1 — TEST-TX-001',
      '',
      '| Field | Value |',
      '|---|---|',
      '| Activation Schema | `AGENT_CONTEXT_AUTH_ACTIVATION_V1` |',
      '| Transaction ID | `TEST-TX-001` |',
      '| Authorization Manifest | `docs/authorizations/TEST-AUTH-001.md` |',
      '| Authorization Manifest Identity | `TEST-AUTH-001` |',
      '| Activation State | `AUTHORIZED / READY_FOR_EXECUTION` |',
      '',
    ].join('\n');

    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${malformedSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical activation malformed']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_RECORD_INVALID');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// AA. (T11) Canonical origin/main advances after M -> ACTIVATION_PREDECESSOR_STALE (NO silent rebind)
// ============================================================================
test('AA (T11): canonical origin/main advances past activation commit M -> ACTIVATION_PREDECESSOR_STALE', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'activation commit M']);
    const activationCommitM = repo.git(['rev-parse', 'HEAD']);

    // Canonical main advances to commit C
    fs.writeFileSync(path.join(repo.dir, 'docs', 'UNRELATED.md'), 'unrelated note\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'unrelated advance of main to C']);
    const commitC = repo.git(['rev-parse', 'HEAD']);

    // origin/main is at C (C != M)
    repo.git(['update-ref', 'refs/remotes/origin/main', commitC]);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false, 'compiler must fail closed when canonical main advances past activation commit');
    assert.equal(result.error, 'ACTIVATION_PREDECESSOR_STALE');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// AB. (T12) V1 activation fields containing word "Accepted" do NOT imply HISTORICAL_CLOSED
// ============================================================================
test('AB (T12): V1 activation record containing "Accepted" in field names does not trigger HISTORICAL_CLOSED', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    // Note review field explicitly contains "Formal Review Accepted"
    const activationSection = makeV1ActivationSection(
      'TEST-TX-001',
      'docs/authorizations/TEST-AUTH-001.md',
      'TEST-AUTH-001',
      acceptedHead,
      'PRR_kwDOTmjPCs8AAAABJs-jLQ (Formal Review Accepted)'
    );
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'activation commit']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, true);
    assert.equal(result.capsule.current_execution_status.value, 'AUTHORIZED / READY_FOR_EXECUTION');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// AC. (T13) Legacy historical W0 behavior remains unchanged
// ============================================================================
test('AC (T13): legacy historical W0 behavior remains exactly HISTORICAL_CLOSED', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  assert.equal(result.capsule.current_execution_status.value, 'HISTORICAL_CLOSED');
  assert.equal(result.capsule.transaction_predecessor.value, 'a755ae4949746a71ac86299b34766ad8fe3b6fb6');
});

// ============================================================================
// AD. (T14, T15) DOC_EVIDENCE_ALLOWLIST: NONE compiles to exactly 5 paths
// ============================================================================
test('AD (T14, T15): DOC_EVIDENCE_ALLOWLIST: NONE contributes 0 paths, compiling to exact 5 paths', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0, { docEvidence: 'DOC_EVIDENCE_ALLOWLIST: NONE' });
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'activation commit']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, true);
    assert.deepEqual(result.capsule.allowed_writes.value, [
      '.github/workflows/ci.yml',
      'package.json',
      'scripts/agent-rebind-check.mjs',
      'tests/agent-rebind-check.test.mjs',
      'tests/fixtures/safe-rebind-w0-evidence-v1.json',
    ]);
    assert.equal(result.capsule.allowed_writes.value.length, 5);
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// AE. (T17) Working-tree manifest tampering cannot override canonical activated manifest
// ============================================================================
test('AE (T17): working-tree manifest tampering cannot override canonical activated manifest', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const canonicalManifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), canonicalManifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'canonical manifest']);
    const acceptedHead = repo.git(['rev-parse', 'HEAD']);

    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', acceptedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'activation commit']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    // Tamper with working-tree manifest by inserting an unauthorized file in allowlist
    const tamperedManifestContent = canonicalManifestContent.replace(
      '| `package.json` | Package manifest |',
      '| `package.json` | Package manifest |\n| `src/malicious-tampering.js` | Unauthorized write |'
    );
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), tamperedManifestContent);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, true);
    // Canonical snapshot wins: tampered path must NOT appear in allowed_writes
    assert.ok(!result.capsule.allowed_writes.value.includes('src/malicious-tampering.js'),
      'canonical manifest snapshot must win over working-tree tampering');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// AF. (T18) Invalid / nonexistent Authorization Accepted Head SHA fails closed
// ============================================================================
test('AF (T18): nonexistent Authorization Accepted Head SHA fails closed with ACTIVATION_MANIFEST_MISMATCH', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest']);

    // Point to non-existent git object
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', '0000000000000000000000000000000000000000');
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'activation commit']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_MANIFEST_MISMATCH');
  } finally {
    repo.cleanup();
  }
});

// ============================================================================
// AG. (T19) Authorization Accepted Head is not an ancestor of activation commit M fails closed
// ============================================================================
test('AG (T19): Authorization Accepted Head not ancestor of activation commit M fails closed with ACTIVATION_MANIFEST_MISMATCH', async () => {
  const repo = createTempGitRepo();
  try {
    const authDir = path.join(repo.dir, 'docs', 'authorizations');
    fs.mkdirSync(authDir, { recursive: true });

    fs.writeFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), '# Implementation Status\n');
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'commit 0: base']);
    const c0 = repo.git(['rev-parse', 'HEAD']);

    // Create an unmerged candidate on orphan/unrelated branch
    repo.git(['checkout', '--orphan', 'unrelated-branch']);
    repo.git(['rm', '-rf', '.']);
    fs.mkdirSync(authDir, { recursive: true });
    const manifestContent = makeValidManifest('TEST-AUTH-001', 'TEST-TX-001', c0);
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'unrelated orphan manifest commit']);
    const unmergedHead = repo.git(['rev-parse', 'HEAD']);

    // Back on main, manifest is added independently
    repo.git(['checkout', 'main']);
    fs.mkdirSync(authDir, { recursive: true });
    fs.writeFileSync(path.join(authDir, 'TEST-AUTH-001.md'), manifestContent);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'add manifest on main']);

    // Activation references unmergedHead
    const activationSection = makeV1ActivationSection('TEST-TX-001', 'docs/authorizations/TEST-AUTH-001.md', 'TEST-AUTH-001', unmergedHead);
    fs.appendFileSync(path.join(repo.dir, 'docs', 'IMPLEMENTATION_STATUS.md'), `\n${activationSection}`);
    repo.git(['add', '.']);
    repo.git(['commit', '-m', 'activation commit']);
    repo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    const result = await compileContext('TEST-TX-001', { rootDir: repo.dir });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'ACTIVATION_MANIFEST_MISMATCH');
  } finally {
    repo.cleanup();
  }
});
