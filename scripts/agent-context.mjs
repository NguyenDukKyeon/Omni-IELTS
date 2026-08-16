#!/usr/bin/env node
// Agent Context Compiler — Pilot Implementation
// Transaction: AGENT-HARNESS-CONTEXT-COMPILER-PILOT-001
//
// Compiles canonical repository governance docs + Git state into a compact
// deterministic execution capsule for coding agents.
//
// AUTHORITY MODEL:
//   CANONICAL DOCS = AUTHORITY
//   THIS COMPILER  = DERIVED CONTEXT TOOL
//   GENERATED CAPSULE ≠ AUTHORITY
//
// If capsule and canonical source conflict: CANONICAL SOURCE WINS.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Fail-closed error codes
// ---------------------------------------------------------------------------
const ERRORS = {
  UNKNOWN_TRANSACTION: 'UNKNOWN_TRANSACTION',
  AMBIGUOUS_AUTHORITY: 'AMBIGUOUS_AUTHORITY',
  AUTHORITY_NOT_EFFECTIVE: 'AUTHORITY_NOT_EFFECTIVE',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  CANONICAL_CONTRADICTION: 'CANONICAL_CONTRADICTION',
  REPOSITORY_STATE_UNAVAILABLE: 'REPOSITORY_STATE_UNAVAILABLE',
  UNSUPPORTED_AUTHORITY_FORMAT: 'UNSUPPORTED_AUTHORITY_FORMAT',
};

// ---------------------------------------------------------------------------
// Git helpers — local only, no network
// ---------------------------------------------------------------------------
function gitRevParseHead(cwd) {
  try {
    return execSync('git rev-parse HEAD', { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function gitBlobSha(filePath, cwd) {
  try {
    return execSync(`git hash-object "${filePath}"`, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Markdown structural extraction helpers
// ---------------------------------------------------------------------------

/** Extract a bold-delimited field from the header block: `Label: **value**` */
function extractHeaderField(text, label) {
  // Match: Label: **value** or Label: **`value`**
  const re = new RegExp(`${escapeRegex(label)}:\\s*\\*\\*\`?([^*\`]+)\`?\\*\\*`, 'i');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extract the section text under a heading matching the pattern (## N. Title or ### N.N Title) */
function extractSection(text, headingPattern) {
  const re = new RegExp(`^(#{2,4})\\s+${escapeRegex(headingPattern)}`, 'im');
  const m = re.exec(text);
  if (!m) return null;
  const level = m[1].length;
  const start = m.index + m[0].length;
  // Find the next heading at the same or higher level
  const restText = text.slice(start);
  const nextHeading = new RegExp(`^#{2,${level}}\\s`, 'm');
  const nextM = nextHeading.exec(restText);
  return nextM ? restText.slice(0, nextM.index).trim() : restText.trim();
}

/** Extract file paths from markdown tables with a `File Path` column */
function extractFilePathsFromTables(sectionText) {
  const paths = [];
  const lines = sectionText.split('\n');
  let filePathCol = -1;
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    // Detect header row
    if (cells.some(c => /file\s*path/i.test(c))) {
      filePathCol = cells.findIndex(c => /file\s*path/i.test(c));
      continue;
    }
    // Skip separator row
    if (cells.every(c => /^[-:]+$/.test(c))) continue;
    // Data row
    if (filePathCol >= 0 && filePathCol < cells.length) {
      const raw = cells[filePathCol];
      // Strip markdown formatting: `path` or just path
      const cleaned = raw.replace(/^`|`$/g, '').trim();
      if (cleaned && !cleaned.includes('---')) {
        paths.push(cleaned);
      }
    }
  }
  return paths;
}

/** Extract code block contents from a section */
function extractCodeBlocks(sectionText) {
  const blocks = [];
  const re = /```(?:\w*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(sectionText)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

/** Extract numbered list items from a section, keeping the label text */
function extractNumberedList(sectionText) {
  const items = [];
  const lines = sectionText.split('\n');
  for (const line of lines) {
    const m = line.match(/^\d+\.\s+`([^`]+)`[:\s]*(.*)/);
    if (m) {
      items.push(m[1]);
    } else {
      // Try format: N. **LABEL**: description
      const m2 = line.match(/^\d+\.\s+\*\*([^*]+)\*\*/);
      if (m2) {
        items.push(m2[1]);
      }
    }
  }
  return items;
}

/** Extract test predicates from a table in RED section */
function extractRedPredicates(sectionText) {
  const predicates = [];
  const lines = sectionText.split('\n');
  let testPathCol = -1;
  let predicateCol = -1;
  let failureCol = -1;
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.some(c => /test\s*path/i.test(c))) {
      testPathCol = cells.findIndex(c => /test\s*path/i.test(c));
      predicateCol = cells.findIndex(c => /predicate/i.test(c));
      failureCol = cells.findIndex(c => /expected\s*failure/i.test(c));
      continue;
    }
    if (cells.every(c => /^[-:]+$/.test(c))) continue;
    if (testPathCol >= 0 && testPathCol < cells.length) {
      predicates.push({
        test_path: cells[testPathCol]?.replace(/^`|`$/g, '') || '',
        predicate: cells[predicateCol]?.replace(/`/g, '') || '',
        expected_failure: cells[failureCol]?.replace(/`/g, '') || '',
      });
    }
  }
  return predicates;
}

/** Extract green gates from numbered list in section 6.3 */
function extractGreenGates(sectionText) {
  const gates = [];
  const lines = sectionText.split('\n');
  for (const line of lines) {
    const m = line.match(/^\d+\.\s+(.*)/);
    if (m) {
      // Clean markdown formatting
      gates.push(m[1].replace(/`/g, '').replace(/\*\*/g, '').trim());
    }
  }
  return gates;
}

// ---------------------------------------------------------------------------
// Core compiler
// ---------------------------------------------------------------------------

/**
 * Compile a deterministic execution capsule from canonical repo docs + Git state.
 *
 * @param {string} transactionId - The Wave ID to look up
 * @param {object} options
 * @param {string} options.rootDir - Repository root directory
 * @param {string} [options.authorizationDir] - Override for authorization docs directory (testing)
 * @returns {{ ok: boolean, capsule?: object, error?: string, message?: string }}
 */
export async function compileContext(transactionId, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const authDir = options.authorizationDir || path.join(rootDir, 'docs', 'authorizations');

  // 1. Git state
  const currentMain = gitRevParseHead(rootDir);
  if (!currentMain) {
    return { ok: false, error: ERRORS.REPOSITORY_STATE_UNAVAILABLE, message: 'Cannot resolve git HEAD' };
  }

  // 2. Discover authorization sources matching the transaction ID
  let authFiles;
  try {
    authFiles = fs.readdirSync(authDir).filter(f => f.endsWith('.md'));
  } catch {
    return { ok: false, error: ERRORS.REPOSITORY_STATE_UNAVAILABLE, message: `Cannot read authorization directory: ${authDir}` };
  }

  const matchingSources = [];
  const sourceContents = new Map();
  let totalSourceBytes = 0;

  for (const file of authFiles) {
    const filePath = path.join(authDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    totalSourceBytes += Buffer.byteLength(content, 'utf8');
    const waveId = extractHeaderField(content, 'Wave ID');
    if (waveId === transactionId) {
      matchingSources.push(filePath);
      sourceContents.set(filePath, content);
    }
  }

  // 3. Fail-closed: unknown transaction
  if (matchingSources.length === 0) {
    return { ok: false, error: ERRORS.UNKNOWN_TRANSACTION, message: `No authorization source found for transaction: ${transactionId}` };
  }

  // 4. Fail-closed: ambiguous authority
  if (matchingSources.length > 1) {
    return { ok: false, error: ERRORS.AMBIGUOUS_AUTHORITY, message: `Multiple authorization sources found for transaction: ${transactionId}: ${matchingSources.map(p => path.basename(p)).join(', ')}` };
  }

  // 5. Parse the single authority source
  const authPath = matchingSources[0];
  const authContent = sourceContents.get(authPath);
  const authRelPath = path.relative(rootDir, authPath).replace(/\\/g, '/');
  const authBlobSha = gitBlobSha(authPath, rootDir);

  function makeProvenance(anchor) {
    return {
      source_path: authRelPath,
      source_blob_sha: authBlobSha,
      anchor,
    };
  }

  // 6. Extract header fields
  const manifestId = extractHeaderField(authContent, 'Manifest Identity');
  const status = extractHeaderField(authContent, 'Status');
  const predecessor = extractHeaderField(authContent, 'Canonical Predecessor (Base)') ||
                      extractHeaderField(authContent, 'Canonical Predecessor');

  if (!manifestId || !status || !predecessor) {
    return {
      ok: false,
      error: ERRORS.REQUIRED_FIELD_MISSING,
      message: `Missing required header field(s) in ${authRelPath}: ` +
        [!manifestId && 'Manifest Identity', !status && 'Status', !predecessor && 'Predecessor']
          .filter(Boolean).join(', '),
    };
  }

  // 7. Extract structured sections
  // Allowed writes from §5
  const allowlistSection = extractSection(authContent, '5. Exact Implementation Allowlist');
  if (!allowlistSection) {
    return { ok: false, error: ERRORS.REQUIRED_FIELD_MISSING, message: `Missing required section "5. Exact Implementation Allowlist" in ${authRelPath}` };
  }

  // Collect file paths from all sub-tables (Source, Test, Fixture, Doc allowlists)
  const allowedWrites = extractFilePathsFromTables(allowlistSection);

  // RED/GREEN from §6
  const redSection = extractSection(authContent, '6. RED / GREEN Execution Topology');
  if (!redSection) {
    return { ok: false, error: ERRORS.REQUIRED_FIELD_MISSING, message: `Missing required section "6. RED / GREEN Execution Topology" in ${authRelPath}` };
  }

  const redPredicateSection = extractSection(authContent, '6.1 Commit A');
  const redPredicates = redPredicateSection ? extractRedPredicates(redPredicateSection) : [];

  const greenSection = extractSection(authContent, '6.3 Commit B');
  const greenGates = greenSection ? extractGreenGates(greenSection) : [];

  // Required tests from §9
  const verificationSection = extractSection(authContent, '9. Verification Commands');
  if (!verificationSection) {
    return { ok: false, error: ERRORS.REQUIRED_FIELD_MISSING, message: `Missing required section "9. Verification Commands" in ${authRelPath}` };
  }

  const codeBlocks = extractCodeBlocks(verificationSection);
  const requiredTests = [];
  for (const block of codeBlocks) {
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.startsWith('npm ')) {
        requiredTests.push(trimmed);
      }
    }
  }

  // Stop conditions from §10
  const stopSection = extractSection(authContent, '10. Execution Stop Conditions');
  if (!stopSection) {
    return { ok: false, error: ERRORS.REQUIRED_FIELD_MISSING, message: `Missing required section "10. Execution Stop Conditions" in ${authRelPath}` };
  }

  const stopConditions = extractNumberedList(stopSection);

  // CI requirements from §9.2
  const ciSection = extractSection(authContent, '9.2 Natural Exact-Head CI');
  const ciRequirements = ciSection ? ciSection.replace(/\n+/g, ' ').trim() : 'UNKNOWN';

  // 8. Determine execution status
  // Parse the Status field to detect historical/non-effective state
  let executionStatusValue;
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes('NOT_EFFECTIVE') || statusUpper.includes('PENDING')) {
    executionStatusValue = 'AUTHORIZATION_PENDING_NOT_EFFECTIVE';
  } else if (statusUpper.includes('ACCEPTED') || statusUpper.includes('COMPLETED') || statusUpper.includes('CLOSED')) {
    executionStatusValue = 'HISTORICAL_CLOSED';
  } else if (statusUpper.includes('CANDIDATE')) {
    executionStatusValue = 'AUTHORIZATION_PENDING_NOT_EFFECTIVE';
  } else {
    executionStatusValue = 'UNKNOWN';
  }

  // 9. Gather additional source bytes for metrics
  // The compiler also implicitly reads IMPLEMENTATION_STATUS.md
  const implStatusPath = path.join(rootDir, 'docs', 'IMPLEMENTATION_STATUS.md');
  let implStatusBytes = 0;
  if (fs.existsSync(implStatusPath)) {
    implStatusBytes = fs.statSync(implStatusPath).size;
    totalSourceBytes += implStatusBytes;
  }

  // Count any other governance docs that a normal agent would read
  const governancePaths = [
    'AGENTS.md',
    'docs/MASTER_ROADMAP.md',
    'docs/ROADMAP.md',
    'docs/IMPLEMENTATION_PLAN.md',
    'docs/DECISIONS.md',
  ];
  let governanceFileCount = 0;
  for (const gp of governancePaths) {
    const fullPath = path.join(rootDir, gp);
    if (fs.existsSync(fullPath)) {
      totalSourceBytes += fs.statSync(fullPath).size;
      governanceFileCount++;
    }
  }

  // Source file count = authorization files + governance docs + IMPLEMENTATION_STATUS
  const sourceFileCount = authFiles.length + governanceFileCount + (implStatusBytes > 0 ? 1 : 0);

  // 10. Build the capsule
  const warnings = [];

  // Detect pilot limitations
  if (redPredicates.length === 0) {
    warnings.push('PILOT_LIMITATION: No RED predicates could be extracted from section 6.1');
  }
  if (greenGates.length === 0) {
    warnings.push('PILOT_LIMITATION: No GREEN gates could be extracted from section 6.3');
  }

  const capsule = {
    transaction_id: transactionId,
    current_main: currentMain,
    authority_provenance_model: 'CANONICAL_DOCS_ARE_AUTHORITY_CAPSULE_IS_DERIVED',

    authority_status: {
      value: status,
      provenance: makeProvenance('Header field: Status'),
    },

    authority_sources: [authRelPath],

    transaction_predecessor: {
      value: predecessor,
      provenance: makeProvenance('Header field: Canonical Predecessor (Base)'),
    },

    required_reads: {
      value: [authRelPath, ...governancePaths.filter(gp => fs.existsSync(path.join(rootDir, gp)))],
      provenance: makeProvenance('Controlling Authorities Fresh-Read Ledger'),
    },

    allowed_writes: {
      value: allowedWrites.sort(),
      provenance: makeProvenance('5. Exact Implementation Allowlist'),
    },

    forbidden_writes: {
      value: 'ALL_PATHS_NOT_IN_ALLOWED_WRITES',
      provenance: makeProvenance('5. Exact Implementation Allowlist (inverse)'),
    },

    required_tests: {
      value: requiredTests,
      provenance: makeProvenance('9. Verification Commands'),
    },

    red_predicates: {
      value: redPredicates,
      provenance: makeProvenance('6.1 Commit A — RED Test Contract'),
    },

    green_gates: {
      value: greenGates,
      provenance: makeProvenance('6.3 Commit B — GREEN Acceptance Gates'),
    },

    stop_conditions: {
      value: stopConditions,
      provenance: makeProvenance('10. Execution Stop Conditions'),
    },

    ci_requirements: {
      value: ciRequirements,
      provenance: makeProvenance('9.2 Natural Exact-Head CI Requirements'),
    },

    execution_status: {
      value: executionStatusValue,
      provenance: makeProvenance('Header field: Status (derived)'),
    },

    warnings,

    metrics: {
      source_file_count: sourceFileCount,
      source_bytes_considered: totalSourceBytes,
      capsule_bytes: 0, // filled below
      compression_ratio: 0, // filled below
      authority_source_count: matchingSources.length,
      required_read_count: governancePaths.filter(gp => fs.existsSync(path.join(rootDir, gp))).length + 1,
    },
  };

  // Calculate capsule bytes and compression ratio
  const capsuleJson = JSON.stringify(capsule, null, 2);
  const capsuleBytes = Buffer.byteLength(capsuleJson, 'utf8');
  capsule.metrics.capsule_bytes = capsuleBytes;
  capsule.metrics.compression_ratio = totalSourceBytes > 0
    ? Math.round((totalSourceBytes / capsuleBytes) * 100) / 100
    : 0;

  return { ok: true, capsule };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
function printHelp() {
  console.log(`
Agent Context Compiler — Pilot

USAGE:
  npm run agent:context -- <TRANSACTION_ID> [OPTIONS]

OPTIONS:
  --json      Output as deterministic JSON (default: human-readable)
  --help      Show this help

EXAMPLES:
  npm run agent:context -- W0-IELTS-ARCH-001
  npm run agent:context -- W0-IELTS-ARCH-001 --json
  npm run agent:context -- UNKNOWN-TRANSACTION

AUTHORITY MODEL:
  Canonical docs are authority. This compiler produces derived context only.
  If capsule and canonical source conflict, canonical source wins.
`.trim());
}

function formatHumanReadable(capsule) {
  const lines = [];
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  AGENT CONTEXT CAPSULE (DERIVED — NOT AUTHORITY)');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`  Transaction:          ${capsule.transaction_id}`);
  lines.push(`  Current Main:         ${capsule.current_main}`);
  lines.push(`  Authority Model:      ${capsule.authority_provenance_model}`);
  lines.push(`  Authority Status:     ${capsule.authority_status.value}`);
  lines.push(`  Execution Status:     ${capsule.execution_status.value}`);
  lines.push(`  Predecessor:          ${capsule.transaction_predecessor.value}`);
  lines.push('');
  lines.push('─── Authority Sources ───');
  for (const s of capsule.authority_sources) lines.push(`  • ${s}`);
  lines.push('');
  lines.push('─── Allowed Writes ───');
  for (const w of capsule.allowed_writes.value) lines.push(`  • ${w}`);
  lines.push('');
  lines.push('─── Required Tests ───');
  for (const t of capsule.required_tests.value) lines.push(`  $ ${t}`);
  lines.push('');
  lines.push('─── Stop Conditions ───');
  for (const s of capsule.stop_conditions.value) lines.push(`  ✗ ${s}`);
  lines.push('');
  if (capsule.red_predicates.value.length > 0) {
    lines.push('─── RED Predicates ───');
    for (const p of capsule.red_predicates.value) lines.push(`  🔴 ${p.test_path}: ${p.predicate.slice(0, 80)}`);
    lines.push('');
  }
  if (capsule.green_gates.value.length > 0) {
    lines.push('─── GREEN Gates ───');
    for (const g of capsule.green_gates.value) lines.push(`  🟢 ${g}`);
    lines.push('');
  }
  if (capsule.warnings.length > 0) {
    lines.push('─── Warnings ───');
    for (const w of capsule.warnings) lines.push(`  ⚠ ${w}`);
    lines.push('');
  }
  lines.push('─── Metrics ───');
  lines.push(`  Source files:         ${capsule.metrics.source_file_count}`);
  lines.push(`  Source bytes:         ${capsule.metrics.source_bytes_considered.toLocaleString()}`);
  lines.push(`  Capsule bytes:        ${capsule.metrics.capsule_bytes.toLocaleString()}`);
  lines.push(`  Compression ratio:    ${capsule.metrics.compression_ratio}x`);
  lines.push(`  Authority sources:    ${capsule.metrics.authority_source_count}`);
  lines.push(`  Required reads:       ${capsule.metrics.required_read_count}`);
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');
  return lines.join('\n');
}

// Only run CLI when invoked directly (not when imported)
const isMainModule = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const jsonMode = args.includes('--json');
  const transactionId = args.find(a => !a.startsWith('--'));

  if (!transactionId) {
    console.error('Error: Transaction ID required. Use --help for usage.');
    process.exit(1);
  }

  const result = await compileContext(transactionId, { rootDir: process.cwd() });

  if (!result.ok) {
    if (jsonMode) {
      console.log(JSON.stringify({ ok: false, error: result.error, message: result.message }, null, 2));
    } else {
      console.error(`\n  FAIL CLOSED: ${result.error}\n  ${result.message}\n`);
    }
    process.exit(1);
  }

  if (jsonMode) {
    console.log(JSON.stringify(result.capsule, null, 2));
  } else {
    console.log(formatHumanReadable(result.capsule));
  }
}
