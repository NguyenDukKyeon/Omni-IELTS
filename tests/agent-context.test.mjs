import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Import the compiler's core function (not the CLI entry point)
// The compiler exports `compileContext(transactionId, options)` for testability.
const { compileContext } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'agent-context.mjs')).href);

// ============================================================================
// A. Recognized pilot transaction resolves
// ============================================================================
test('A: recognized W0-IELTS-ARCH-001 transaction resolves to a capsule', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true, 'compiler should succeed for known transaction');
  assert.equal(result.capsule.transaction_id, 'W0-IELTS-ARCH-001');
  assert.ok(result.capsule.authority_status, 'authority_status must be present');
  assert.ok(result.capsule.authority_sources, 'authority_sources must be present');
  assert.ok(result.capsule.current_main, 'current_main must be present');
  assert.ok(result.capsule.transaction_predecessor, 'transaction_predecessor must be present');
  assert.ok(result.capsule.allowed_writes, 'allowed_writes must be present');
  assert.ok(result.capsule.required_tests, 'required_tests must be present');
  assert.ok(result.capsule.stop_conditions, 'stop_conditions must be present');
  assert.ok(result.capsule.execution_status, 'execution_status must be present');
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
// C. Exact current_main from Git
// ============================================================================
test('C: current_main captures actual git HEAD', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  const actualHead = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(result.capsule.current_main, actualHead);
});

// ============================================================================
// D. Provenance exists for authority-sensitive fields
// ============================================================================
test('D: authority-sensitive fields carry provenance', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  const c = result.capsule;

  // Check provenance on authority-sensitive fields
  const fieldsWithProvenance = [
    'authority_status',
    'transaction_predecessor',
    'allowed_writes',
    'required_tests',
    'stop_conditions',
  ];

  for (const field of fieldsWithProvenance) {
    assert.ok(c[field], `field ${field} must exist`);
    const entry = c[field];
    assert.ok(entry.provenance, `${field} must have provenance`);
    assert.ok(entry.provenance.source_path, `${field}.provenance must have source_path`);
    assert.ok(
      entry.provenance.source_blob_sha || entry.provenance.source_blob_sha === '',
      `${field}.provenance must have source_blob_sha`
    );
    assert.ok(entry.provenance.anchor, `${field}.provenance must have anchor`);
    // source_blob_sha must be a non-empty hex string (git blob SHA)
    assert.match(entry.provenance.source_blob_sha, /^[0-9a-f]{40}$/,
      `${field}.provenance.source_blob_sha must be a valid git blob SHA`);
  }
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
  // Create a temporary directory with two authorization files matching the same Wave ID
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-ambig-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    const header = 'Wave ID: **AMBIG-TEST-001**\nStatus: **CANDIDATE**\nCanonical Predecessor (Base): **abc123**\n';
    fs.writeFileSync(path.join(docsDir, 'auth-a.md'), `# Auth A\n\nManifest Identity: **AMBIG-AUTH-A**\n${header}`);
    fs.writeFileSync(path.join(docsDir, 'auth-b.md'), `# Auth B\n\nManifest Identity: **AMBIG-AUTH-B**\n${header}`);
    // Copy minimal git setup - use the real root for git but override authDir
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
test('G: missing required heading fails closed', async () => {
  // Create a temporary directory with an authorization file missing required sections
  const tmpDir = fs.mkdtempSync(path.join(ROOT, 'tests', '.tmp-missing-'));
  try {
    const docsDir = path.join(tmpDir, 'docs', 'authorizations');
    fs.mkdirSync(docsDir, { recursive: true });
    // Create a minimal auth doc with Wave ID but missing required sections
    const content = [
      '# Wave Authorization Manifest — Test',
      '',
      'Manifest Identity: **MISSING-ANCHOR-AUTH-001**',
      'Wave ID: **MISSING-ANCHOR-001**',
      'Status: **CANDIDATE**',
      'Canonical Predecessor (Base): **abc123**',
      '',
      '## 1. Summary',
      'Some summary text.',
      '',
      // Deliberately missing: ## 5, ## 6, ## 9, ## 10
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
// H. Historical W0 does NOT become currently executable
// ============================================================================
test('H: historical W0 transaction cannot be interpreted as currently executable', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const status = result.capsule.execution_status.value;
  // Must NOT be an executable status
  assert.notEqual(status, 'EXECUTION_AUTHORIZED_NOW',
    'historical W0 must not be reported as currently executable');
  assert.notEqual(status, 'READY_FOR_EXECUTION',
    'historical W0 must not be reported as ready for execution');
  // Should indicate historical/closed/not-effective state
  assert.ok(
    status === 'HISTORICAL_CLOSED' ||
    status === 'AUTHORIZATION_PENDING' ||
    status === 'NOT_EFFECTIVE' ||
    status.includes('NOT_EFFECTIVE') ||
    status.includes('PENDING'),
    `execution_status should indicate non-executable state, got: ${status}`
  );
});

// ============================================================================
// I. Capsule size metrics are calculated
// ============================================================================
test('I: capsule includes size metrics with positive values', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const m = result.capsule.metrics;
  assert.ok(m, 'metrics must exist');
  assert.ok(typeof m.source_file_count === 'number' && m.source_file_count > 0,
    'source_file_count must be a positive number');
  assert.ok(typeof m.source_bytes_considered === 'number' && m.source_bytes_considered > 0,
    'source_bytes_considered must be a positive number');
  assert.ok(typeof m.capsule_bytes === 'number' && m.capsule_bytes > 0,
    'capsule_bytes must be a positive number');
  assert.ok(typeof m.compression_ratio === 'number' && m.compression_ratio > 1,
    'compression_ratio must be > 1 (capsule smaller than source)');
  // The authorization doc alone is ~27KB; capsule should be materially smaller
  assert.ok(m.source_bytes_considered > m.capsule_bytes,
    'source bytes must exceed capsule bytes');
});

// ============================================================================
// J. Compiler does not require network access
// ============================================================================
test('J: compiler operates purely on local files and git (structural verification)', async () => {
  // Verify by inspecting the module source — no http/https/fetch/net imports
  const srcPath = path.join(ROOT, 'scripts', 'agent-context.mjs');
  const src = fs.readFileSync(srcPath, 'utf8');
  assert.ok(!src.includes("import") || !src.match(/from\s+['"](?:node:)?(?:http|https|net|dns|tls)['"]/),
    'compiler must not import network modules');
  assert.ok(!src.includes('fetch('), 'compiler must not use fetch()');
  assert.ok(!src.includes('XMLHttpRequest'), 'compiler must not use XMLHttpRequest');
  // Also verify the compiler actually succeeds (functional proof of local-only)
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true, 'compiler succeeds without network');
});

// ============================================================================
// Additional structural assertions on W0 canonical values
// ============================================================================
test('W0 capsule contains expected canonical values from authorization doc', async () => {
  const result = await compileContext('W0-IELTS-ARCH-001', { rootDir: ROOT });
  assert.equal(result.ok, true);
  const c = result.capsule;

  // Transaction predecessor should match the doc
  assert.equal(c.transaction_predecessor.value, 'a755ae4949746a71ac86299b34766ad8fe3b6fb6');

  // Authority sources should reference the authorization document
  assert.ok(c.authority_sources.length > 0);
  assert.ok(c.authority_sources.some(s =>
    s.includes('STAGE2-W0-IELTS-ARCH-AUTH-001')
  ));

  // Allowed writes should contain expected source files
  const writes = c.allowed_writes.value;
  assert.ok(writes.some(w => w.includes('src/ielts-domain.js')), 'must include ielts-domain.js');
  assert.ok(writes.some(w => w.includes('src/ielts-persistence.js')), 'must include ielts-persistence.js');
  assert.ok(writes.some(w => w.includes('src/backup-registry.js')), 'must include backup-registry.js');

  // Stop conditions should contain expected conditions
  const stops = c.stop_conditions.value;
  assert.ok(stops.some(s => s.includes('CANONICAL_BASE_DRIFT')), 'must include CANONICAL_BASE_DRIFT');
  assert.ok(stops.some(s => s.includes('RED_TEST_MUTATION_REQUIRED')), 'must include RED_TEST_MUTATION_REQUIRED');

  // Warnings array should exist
  assert.ok(Array.isArray(c.warnings));

  // authority_provenance_model must indicate derived context
  assert.equal(c.authority_provenance_model, 'CANONICAL_DOCS_ARE_AUTHORITY_CAPSULE_IS_DERIVED');
});
