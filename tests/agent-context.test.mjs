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
    // Manifest using an unsupported protocol format version
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
    // Valid manifest
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

    // Contradictory status file: claims both ACCEPTED and REJECTED_UNRESOLVED for same transaction
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
    // Candidate manifest that is not effective
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

    // Empty status file (no closure for NOT-EFF-TEST-001)
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

  // Verify no execSync imports or usage
  assert.ok(!src.includes('execSync('), 'compiler must not use execSync');

  // Verify execFileSync is imported and used
  assert.ok(src.includes('execFileSync'), 'compiler must use execFileSync');
});

// ============================================================================
// O. Canonical W0 values verification
// ============================================================================
test('O: W0 capsule contains expected canonical values from authorization doc', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const c = result.capsule;

  // Predecessor
  assert.equal(c.transaction_predecessor.value, 'a755ae4949746a71ac86299b34766ad8fe3b6fb6');

  // Authority sources
  assert.ok(c.authority_sources.some(s => s.includes('STAGE2-W0-IELTS-ARCH-AUTH-001')));

  // Allowed writes
  const writes = c.allowed_writes.value;
  assert.ok(writes.some(w => w.includes('src/ielts-domain.js')));
  assert.ok(writes.some(w => w.includes('src/ielts-persistence.js')));
  assert.ok(writes.some(w => w.includes('src/backup-registry.js')));

  // Stop conditions
  const stops = c.stop_conditions.value;
  assert.ok(stops.some(s => s.includes('CANONICAL_BASE_DRIFT')));
  assert.ok(stops.some(s => s.includes('RED_TEST_MUTATION_REQUIRED')));

  // Authority provenance model
  assert.equal(c.authority_provenance_model, 'CANONICAL_DOCS_ARE_AUTHORITY_CAPSULE_IS_DERIVED');
});
