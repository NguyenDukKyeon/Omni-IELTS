#!/usr/bin/env node
// Agent Context Compiler — Pilot Implementation (Final Clean Remediation)
// Transaction: AGENT-HARNESS-CONTEXT-COMPILER-PILOT-003-FINAL-REMEDIATION
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
import { execFileSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Supported protocol formats
// ---------------------------------------------------------------------------
const SUPPORTED_PROTOCOLS = Object.freeze([
  'BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1',
]);

// ---------------------------------------------------------------------------
// Fail-closed error codes
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Fail-closed error codes
// ---------------------------------------------------------------------------
export const ERRORS = Object.freeze({
  UNKNOWN_TRANSACTION: 'UNKNOWN_TRANSACTION',
  AMBIGUOUS_AUTHORITY: 'AMBIGUOUS_AUTHORITY',
  AUTHORITY_NOT_EFFECTIVE: 'AUTHORITY_NOT_EFFECTIVE',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  CANONICAL_CONTRADICTION: 'CANONICAL_CONTRADICTION',
  REPOSITORY_STATE_UNAVAILABLE: 'REPOSITORY_STATE_UNAVAILABLE',
  UNSUPPORTED_AUTHORITY_FORMAT: 'UNSUPPORTED_AUTHORITY_FORMAT',
  ACTIVATION_RECORD_AMBIGUOUS: 'ACTIVATION_RECORD_AMBIGUOUS',
  ACTIVATION_RECORD_INVALID: 'ACTIVATION_RECORD_INVALID',
  ACTIVATION_MANIFEST_MISMATCH: 'ACTIVATION_MANIFEST_MISMATCH',
  ACTIVATION_PREDECESSOR_STALE: 'ACTIVATION_PREDECESSOR_STALE',
});

// ---------------------------------------------------------------------------
// Git helpers — process-safe (execFileSync with argument arrays), no network
// ---------------------------------------------------------------------------
function gitExec(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function gitShow(refAndPath, cwd) {
  try {
    return execFileSync('git', ['show', refAndPath], { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    return null;
  }
}

function resolveCanonicalMain(rootDir) {
  // 1. In GitHub Actions PR context, resolve from GITHUB_EVENT_PATH (only for root repository, not temp test fixtures)
  const isDefaultRoot = !rootDir || path.resolve(rootDir) === path.resolve(process.cwd());
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (isDefaultRoot && eventPath && fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
      const eventSha = event.pull_request?.base?.sha;
      if (event.pull_request?.base?.ref === 'main' && eventSha && /^[0-9a-f]{40}$/.test(eventSha)) {
        return { value: eventSha, source: 'GITHUB_EVENT_PATH' };
      }
    } catch {
      // Fall through to Git refs if event file parse fails
    }
  }

  // 2. Resolve refs/remotes/origin/main
  const originMain = gitExec(['rev-parse', 'refs/remotes/origin/main'], rootDir);
  if (originMain && /^[0-9a-f]{40}$/.test(originMain)) {
    return { value: originMain, source: 'refs/remotes/origin/main' };
  }

  // 3. Resolve refs/heads/main
  const localMain = gitExec(['rev-parse', 'refs/heads/main'], rootDir);
  if (localMain && /^[0-9a-f]{40}$/.test(localMain)) {
    return { value: localMain, source: 'refs/heads/main' };
  }

  // 4. Shorthand origin/main fallback
  const shortOriginMain = gitExec(['rev-parse', 'origin/main'], rootDir);
  if (shortOriginMain && /^[0-9a-f]{40}$/.test(shortOriginMain)) {
    return { value: shortOriginMain, source: 'refs/remotes/origin/main' };
  }

  // 5. Shorthand main fallback
  const shortMain = gitExec(['rev-parse', 'main'], rootDir);
  if (shortMain && /^[0-9a-f]{40}$/.test(shortMain)) {
    return { value: shortMain, source: 'refs/heads/main' };
  }

  return null;
}

function resolveWorkingHead(rootDir) {
  const head = gitExec(['rev-parse', 'HEAD'], rootDir);
  if (head && /^[0-9a-f]{40}$/.test(head)) {
    return { value: head };
  }
  return null;
}

function gitBlobSha(filePath, cwd) {
  const sha = gitExec(['hash-object', filePath], cwd);
  return sha && /^[0-9a-f]{40}$/.test(sha) ? sha : '';
}

// ---------------------------------------------------------------------------
// V1 Activation Record Parser
// ---------------------------------------------------------------------------
function parseV1ActivationSections(content, transactionId) {
  const sections = content.split(/^##\s+/m);
  const matching = [];

  for (let i = 1; i < sections.length; i++) {
    const s = sections[i];
    const firstLineEnd = s.indexOf('\n');
    const title = firstLineEnd >= 0 ? s.slice(0, firstLineEnd).trim() : s.trim();

    if (title.startsWith('AGENT_CONTEXT_AUTH_ACTIVATION_V1') && s.includes(transactionId)) {
      matching.push({ title: `## ${title}`, text: s });
    }
  }

  return matching;
}

function parseV1TableFields(sectionText) {
  const fields = {};
  let hasDuplicateKeys = false;
  const lines = sectionText.split('\n');
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 2) {
      const rawKey = cells[0].replace(/^`|`$/g, '').trim();
      const rawVal = cells[1].replace(/^`|`$/g, '').trim();
      if (rawKey && rawVal && !rawKey.includes('---')) {
        if (fields[rawKey] !== undefined) {
          hasDuplicateKeys = true;
        }
        fields[rawKey] = rawVal;
      }
    }
  }
  return { fields, hasDuplicateKeys };
}

function findV1ActivationIntroductionCommit(canonicalMainSha, statusRelPath, transactionId, rootDir) {
  const logOutput = gitExec(['rev-list', '--first-parent', canonicalMainSha], rootDir);
  if (!logOutput) return null;
  const commits = logOutput.split('\n').map(c => c.trim()).filter(Boolean);

  let earliestWithActivation = null;

  for (const commit of commits) {
    const statusAtCommit = gitShow(`${commit}:${statusRelPath}`, rootDir);
    if (statusAtCommit) {
      const v1Sections = parseV1ActivationSections(statusAtCommit, transactionId);
      if (v1Sections.length > 0) {
        earliestWithActivation = commit;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return earliestWithActivation;
}

// ---------------------------------------------------------------------------
// Markdown structural extraction helpers
// ---------------------------------------------------------------------------

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extract a bold-delimited field: `Label: **value**` or `Label: **`value`**` */
function extractHeaderField(text, label) {
  const re = new RegExp(`${escapeRegex(label)}:\\s*\\*\\*\`?([^*\`]+)\`?\\*\\*`, 'i');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

/** Extract protocol identifier: `Protocol: **NAME** (ADR-XX)` or `Protocol: **NAME**` */
function extractProtocol(text) {
  const raw = extractHeaderField(text, 'Protocol');
  if (!raw) return null;
  const m = raw.match(/^([A-Z0-9_]+)/);
  return m ? m[1] : raw;
}

/** Extract section text under a heading matching ## N. Title or ### N.N Title */
function extractSection(text, headingPattern) {
  const re = new RegExp(`^(#{2,4})\\s+${escapeRegex(headingPattern)}`, 'im');
  const m = re.exec(text);
  if (!m) return null;
  const level = m[1].length;
  const start = m.index + m[0].length;
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
    if (cells.some(c => /file\s*path/i.test(c))) {
      filePathCol = cells.findIndex(c => /file\s*path/i.test(c));
      continue;
    }
    if (cells.every(c => /^[-:]+$/.test(c))) continue;
    if (filePathCol >= 0 && filePathCol < cells.length) {
      const raw = cells[filePathCol];
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

/** Extract numbered list items from a section */
function extractNumberedList(sectionText) {
  const items = [];
  const lines = sectionText.split('\n');
  for (const line of lines) {
    const m = line.match(/^\d+\.\s+`([^`]+)`[:\s]*(.*)/);
    if (m) {
      items.push(m[1]);
    } else {
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

/** Extract green gates from numbered list */
function extractGreenGates(sectionText) {
  const gates = [];
  const lines = sectionText.split('\n');
  for (const line of lines) {
    const m = line.match(/^\d+\.\s+(.*)/);
    if (m) {
      gates.push(m[1].replace(/`/g, '').replace(/\*\*/g, '').trim());
    }
  }
  return gates;
}

// ---------------------------------------------------------------------------
// Status reconciliation: parse docs/IMPLEMENTATION_STATUS.md
// ---------------------------------------------------------------------------
function reconcileExecutionStatus(statusContent, transactionId, manifestStatus) {
  const sections = statusContent.split(/^##\s+/m);
  const matchingSections = [];

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const firstLineEnd = section.indexOf('\n');
    const title = firstLineEnd >= 0 ? section.slice(0, firstLineEnd).trim() : section.trim();
    // V1 activation records are handled exclusively by canonical Git snapshot V1 resolution
    if (title.startsWith('AGENT_CONTEXT_AUTH_ACTIVATION_V1')) {
      continue;
    }
    if (section.includes(transactionId)) {
      matchingSections.push({ title: `## ${title}`, text: section });
    }
  }

  if (matchingSections.length === 0) {
    const isManifestNotEffective = /NOT_EFFECTIVE|PENDING|CANDIDATE/i.test(manifestStatus);
    if (isManifestNotEffective) {
      return {
        ok: false,
        error: ERRORS.AUTHORITY_NOT_EFFECTIVE,
        message: `Transaction ${transactionId} has non-effective authorization status (${manifestStatus}) and no canonical execution record in IMPLEMENTATION_STATUS.md`,
      };
    }
    return {
      ok: true,
      executionStatus: 'NOT_RECORDED',
      anchor: 'Document root (no section found)',
    };
  }

  // Check for internal contradictions in any matching section
  for (const s of matchingSections) {
    const hasAccepted = /ACCEPTED|Canonical Closure|merged/i.test(s.text);
    const hasRejectedConflict = /REJECTED_UNRESOLVED|Conflict|CONTRADICTION/i.test(s.text);
    if (hasAccepted && hasRejectedConflict) {
      return {
        ok: false,
        error: ERRORS.CANONICAL_CONTRADICTION,
        message: `Contradictory execution status facts found for ${transactionId} in ${s.title}`,
      };
    }
  }

  // Look for definitive acceptance / canonical closure section
  const closureSection = matchingSections.find(s =>
    /Implementation Acceptance|Canonical Closure/i.test(s.title) ||
    (/Merge SHA/i.test(s.text) && /Formal Independent Audit.*ACCEPT/i.test(s.text))
  );

  if (closureSection) {
    return {
      ok: true,
      executionStatus: 'HISTORICAL_CLOSED',
      anchor: closureSection.title,
    };
  }

  // Check other statuses in latest matching section
  const latest = matchingSections[matchingSections.length - 1];
  if (/ACCEPTED/i.test(latest.text)) {
    return { ok: true, executionStatus: 'HISTORICAL_CLOSED', anchor: latest.title };
  }
  if (/IN_PROGRESS/i.test(latest.text)) {
    return { ok: true, executionStatus: 'IN_PROGRESS', anchor: latest.title };
  }
  if (/BLOCKED/i.test(latest.text)) {
    return { ok: true, executionStatus: 'BLOCKED', anchor: latest.title };
  }

  return { ok: true, executionStatus: 'UNKNOWN', anchor: latest.title };
}

// ---------------------------------------------------------------------------
// Core compiler
// ---------------------------------------------------------------------------

/**
 * Compile a deterministic execution capsule from canonical repo docs + Git state.
 *
 * @param {string} transactionId - The Wave ID to look up
 * @param {object} options
 * @param {string} [options.rootDir] - Repository root directory
 * @param {string} [options.authorizationDir] - Override for authorization docs directory (testing)
 * @param {string} [options.statusFilePath] - Override for IMPLEMENTATION_STATUS.md path (testing)
 * @returns {Promise<{ ok: boolean, capsule?: object, error?: string, message?: string }>}
 */
export async function compileContext(transactionId, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const authDir = options.authorizationDir || path.join(rootDir, 'docs', 'authorizations');
  const statusFilePath = options.statusFilePath || path.join(rootDir, 'docs', 'IMPLEMENTATION_STATUS.md');

  // 1. Resolve Git state process-safely
  const canonicalMain = resolveCanonicalMain(rootDir);
  if (!canonicalMain) {
    return {
      ok: false,
      error: ERRORS.REPOSITORY_STATE_UNAVAILABLE,
      message: 'Cannot resolve canonical main reference (checked GITHUB_EVENT_PATH, refs/remotes/origin/main, refs/heads/main)',
    };
  }

  const workingHead = resolveWorkingHead(rootDir);
  if (!workingHead) {
    return {
      ok: false,
      error: ERRORS.REPOSITORY_STATE_UNAVAILABLE,
      message: 'Cannot resolve git HEAD',
    };
  }

  // Check canonical IMPLEMENTATION_STATUS.md at canonicalMain.value for V1 activation
  let canonicalStatusContent = null;
  if (canonicalMain.value) {
    canonicalStatusContent = gitShow(`${canonicalMain.value}:docs/IMPLEMENTATION_STATUS.md`, rootDir);
  }

  const v1CanonicalSections = canonicalStatusContent
    ? parseV1ActivationSections(canonicalStatusContent, transactionId)
    : [];

  if (v1CanonicalSections.length > 1) {
    return {
      ok: false,
      error: ERRORS.ACTIVATION_RECORD_AMBIGUOUS,
      message: `Multiple V1 activation records found in canonical IMPLEMENTATION_STATUS.md for transaction: ${transactionId}`,
    };
  }

  let isV1 = false;
  let authContent = '';
  let authRelPath = '';
  let authBlobSha = '';
  let authorityBytesParsed = 0;
  let discoveryBytesRead = 0;
  let authFilesCount = 0;
  let matchingSourcesCount = 0;
  let v1IntroductionCommit = null;
  let v1Fields = null;

  if (v1CanonicalSections.length === 1) {
    const v1Section = v1CanonicalSections[0];
    const parsed = parseV1TableFields(v1Section.text);
    if (parsed.hasDuplicateKeys) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_RECORD_AMBIGUOUS,
        message: `Duplicate field row(s) found in V1 activation record for ${transactionId}`,
      };
    }
    const fields = parsed.fields;

    const requiredV1Fields = [
      'Activation Schema',
      'Transaction ID',
      'Authorization Manifest',
      'Authorization Manifest Identity',
      'Authorization Accepted Head',
      'Independent Authorization Review',
      'Authorization Merge SHA',
      'Activation State',
      'Effective Implementation Predecessor',
    ];

    const missingV1 = requiredV1Fields.filter(f => !fields[f]);
    if (
      missingV1.length > 0 ||
      fields['Activation Schema'] !== 'AGENT_CONTEXT_AUTH_ACTIVATION_V1' ||
      fields['Transaction ID'] !== transactionId ||
      fields['Activation State'] !== 'AUTHORIZED / READY_FOR_EXECUTION' ||
      fields['Authorization Merge SHA'] !== 'SELF_RESOLVE_ACTIVATION_MERGE_SHA' ||
      fields['Effective Implementation Predecessor'] !== 'SELF_RESOLVE_ACTIVATION_MERGE_SHA'
    ) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_RECORD_INVALID,
        message: `Invalid or incomplete V1 activation record for ${transactionId}`,
      };
    }

    v1IntroductionCommit = findV1ActivationIntroductionCommit(
      canonicalMain.value,
      'docs/IMPLEMENTATION_STATUS.md',
      transactionId,
      rootDir
    );

    if (!v1IntroductionCommit) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_RECORD_INVALID,
        message: `Cannot determine activation introduction commit for ${transactionId}`,
      };
    }

    if (canonicalMain.value !== v1IntroductionCommit) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_PREDECESSOR_STALE,
        message: `Canonical main (${canonicalMain.value}) has advanced past activation commit (${v1IntroductionCommit}) for transaction ${transactionId}`,
      };
    }

    const manifestRel = fields['Authorization Manifest'].replace(/\\/g, '/');
    const canonicalAuthAtM = gitShow(`${v1IntroductionCommit}:${manifestRel}`, rootDir);
    if (!canonicalAuthAtM) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Canonical authorization manifest not found at ${v1IntroductionCommit}:${manifestRel}`,
      };
    }

    const mId = extractHeaderField(canonicalAuthAtM, 'Manifest Identity');
    const wId = extractHeaderField(canonicalAuthAtM, 'Wave ID');
    if (mId !== fields['Authorization Manifest Identity'] || wId !== transactionId) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Canonical authorization manifest identity (${mId}/${wId}) does not match activation record (${fields['Authorization Manifest Identity']}/${transactionId})`,
      };
    }

    const acceptedHead = fields['Authorization Accepted Head'];
    if (!/^[0-9a-f]{40}$/.test(acceptedHead)) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Invalid Authorization Accepted Head SHA: ${acceptedHead}`,
      };
    }

    const catCheck = gitExec(['cat-file', '-e', `${acceptedHead}^{commit}`], rootDir);
    if (catCheck === null) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Authorization Accepted Head commit does not exist: ${acceptedHead}`,
      };
    }

    const mergeBase = gitExec(['merge-base', acceptedHead, v1IntroductionCommit], rootDir);
    if (mergeBase !== acceptedHead) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Authorization Accepted Head (${acceptedHead}) is not an ancestor of activation commit (${v1IntroductionCommit})`,
      };
    }

    const acceptedAuthContent = gitShow(`${acceptedHead}:${manifestRel}`, rootDir);
    if (acceptedAuthContent === null || acceptedAuthContent !== canonicalAuthAtM) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Authorization manifest blob at accepted head (${acceptedHead}) does not match canonical manifest blob at activation commit (${v1IntroductionCommit})`,
      };
    }

    isV1 = true;
    v1Fields = fields;
    authContent = canonicalAuthAtM;
    authRelPath = manifestRel;
    const authBlob = gitExec(['rev-parse', `${v1IntroductionCommit}:${manifestRel}`], rootDir);
    if (!authBlob || !/^[0-9a-f]{40}$/.test(authBlob)) {
      return {
        ok: false,
        error: ERRORS.ACTIVATION_MANIFEST_MISMATCH,
        message: `Cannot determine canonical authorization manifest blob SHA at ${v1IntroductionCommit}:${manifestRel}`,
      };
    }
    authBlobSha = authBlob;
    authorityBytesParsed = Buffer.byteLength(canonicalAuthAtM, 'utf8');
    discoveryBytesRead = authorityBytesParsed;
    authFilesCount = 1;
    matchingSourcesCount = 1;
  } else {
    // 2. Discover authorization sources matching the transaction ID
    let authFiles;
    try {
      authFiles = fs.readdirSync(authDir).filter(f => f.endsWith('.md')).sort();
    } catch {
      return {
        ok: false,
        error: ERRORS.REPOSITORY_STATE_UNAVAILABLE,
        message: `Cannot read authorization directory: ${authDir}`,
      };
    }

    authFilesCount = authFiles.length;
    const matchingSources = [];
    const sourceContents = new Map();

    for (const file of authFiles) {
      const filePath = path.join(authDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      discoveryBytesRead += Buffer.byteLength(content, 'utf8');
      const waveId = extractHeaderField(content, 'Wave ID');
      if (waveId === transactionId) {
        matchingSources.push(filePath);
        sourceContents.set(filePath, content);
      }
    }

    // 3. Fail-closed: unknown transaction
    if (matchingSources.length === 0) {
      return {
        ok: false,
        error: ERRORS.UNKNOWN_TRANSACTION,
        message: `No authorization source found for transaction: ${transactionId}`,
      };
    }

    // 4. Fail-closed: ambiguous authority
    if (matchingSources.length > 1) {
      return {
        ok: false,
        error: ERRORS.AMBIGUOUS_AUTHORITY,
        message: `Multiple authorization sources found for transaction: ${transactionId}: ${matchingSources.map(p => path.basename(p)).join(', ')}`,
      };
    }

    // 5. Parse the single authority source
    matchingSourcesCount = 1;
    const authPath = matchingSources[0];
    authContent = sourceContents.get(authPath);
    authRelPath = path.relative(rootDir, authPath).replace(/\\/g, '/');
    authBlobSha = gitBlobSha(authPath, rootDir);
    authorityBytesParsed = Buffer.byteLength(authContent, 'utf8');
  }

  function makeAuthProvenance(anchor) {
    return {
      source_path: authRelPath,
      source_blob_sha: authBlobSha,
      anchor,
    };
  }

  // Check Protocol format support
  const protocol = extractProtocol(authContent);
  if (!protocol || !SUPPORTED_PROTOCOLS.includes(protocol)) {
    return {
      ok: false,
      error: ERRORS.UNSUPPORTED_AUTHORITY_FORMAT,
      message: `Unsupported or missing protocol format in ${authRelPath}: ${protocol || 'NONE'}. Supported: ${SUPPORTED_PROTOCOLS.join(', ')}`,
    };
  }

  // 6. Extract header fields
  const manifestId = extractHeaderField(authContent, 'Manifest Identity');
  const manifestStatus = extractHeaderField(authContent, 'Status');
  const predecessor = extractHeaderField(authContent, 'Canonical Predecessor (Base)') ||
                      extractHeaderField(authContent, 'Canonical Predecessor');

  if (!manifestId || !manifestStatus || !predecessor) {
    return {
      ok: false,
      error: ERRORS.REQUIRED_FIELD_MISSING,
      message: `Missing required header field(s) in ${authRelPath}: ` +
        [!manifestId && 'Manifest Identity', !manifestStatus && 'Status', !predecessor && 'Predecessor']
          .filter(Boolean).join(', '),
    };
  }

  // 7. Extract structured sections from authorization doc
  const allowlistSection = extractSection(authContent, '5. Exact Implementation Allowlist');
  if (allowlistSection === null) {
    return {
      ok: false,
      error: ERRORS.REQUIRED_FIELD_MISSING,
      message: `Missing required section "5. Exact Implementation Allowlist" in ${authRelPath}`,
    };
  }
  const allowedWrites = extractFilePathsFromTables(allowlistSection);

  const redSection = extractSection(authContent, '6. RED / GREEN Execution Topology');
  if (redSection === null) {
    return {
      ok: false,
      error: ERRORS.REQUIRED_FIELD_MISSING,
      message: `Missing required section "6. RED / GREEN Execution Topology" in ${authRelPath}`,
    };
  }
  const redPredicateSection = extractSection(authContent, '6.1 Commit A');
  const redPredicates = redPredicateSection ? extractRedPredicates(redPredicateSection) : [];

  const greenSection = extractSection(authContent, '6.3 Commit B');
  const greenGates = greenSection ? extractGreenGates(greenSection) : [];

  const verificationSection = extractSection(authContent, '9. Verification Commands');
  if (verificationSection === null) {
    return {
      ok: false,
      error: ERRORS.REQUIRED_FIELD_MISSING,
      message: `Missing required section "9. Verification Commands" in ${authRelPath}`,
    };
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

  const stopSection = extractSection(authContent, '10. Execution Stop Conditions');
  if (stopSection === null) {
    return {
      ok: false,
      error: ERRORS.REQUIRED_FIELD_MISSING,
      message: `Missing required section "10. Execution Stop Conditions" in ${authRelPath}`,
    };
  }
  const stopConditions = extractNumberedList(stopSection);

  const ciSection = extractSection(authContent, '9.2 Natural Exact-Head CI');
  const ciRequirements = ciSection ? ciSection.replace(/\n+/g, ' ').trim() : 'UNKNOWN';

  // 8. Reconcile execution status against IMPLEMENTATION_STATUS.md
  let statusContent = '';
  let statusBytesRead = 0;
  let statusRelPath = 'docs/IMPLEMENTATION_STATUS.md';
  let statusBlobSha = '';

  if (fs.existsSync(statusFilePath)) {
    statusContent = fs.readFileSync(statusFilePath, 'utf8');
    statusBytesRead = Buffer.byteLength(statusContent, 'utf8');
    statusRelPath = path.relative(rootDir, statusFilePath).replace(/\\/g, '/');
    if (isV1) {
      const canonicalStatusBlob = gitExec(['rev-parse', `${v1IntroductionCommit}:${statusRelPath}`], rootDir);
      if (canonicalStatusBlob && /^[0-9a-f]{40}$/.test(canonicalStatusBlob)) {
        statusBlobSha = canonicalStatusBlob;
      } else {
        statusBlobSha = gitBlobSha(statusFilePath, rootDir);
      }
    } else {
      statusBlobSha = gitBlobSha(statusFilePath, rootDir);
    }
  } else {
    return {
      ok: false,
      error: ERRORS.REPOSITORY_STATE_UNAVAILABLE,
      message: `Cannot find implementation status file at: ${statusFilePath}`,
    };
  }

  let executionStatusValue = '';
  let executionStatusAnchor = '';

  if (isV1) {
    executionStatusValue = v1Fields['Activation State'] || 'AUTHORIZED / READY_FOR_EXECUTION';
    executionStatusAnchor = `AGENT_CONTEXT_AUTH_ACTIVATION_V1 — ${transactionId}`;
  } else {
    const reconciliation = reconcileExecutionStatus(statusContent, transactionId, manifestStatus);
    if (!reconciliation.ok) {
      return {
        ok: false,
        error: reconciliation.error,
        message: reconciliation.message,
      };
    }
    executionStatusValue = reconciliation.executionStatus;
    executionStatusAnchor = reconciliation.anchor;
  }

  const predecessorValue = isV1
    ? v1IntroductionCommit
    : predecessor;

  const predecessorProvenance = isV1
    ? {
        source_path: statusRelPath,
        source_blob_sha: statusBlobSha,
        anchor: `AGENT_CONTEXT_AUTH_ACTIVATION_V1 — ${transactionId}: Effective Implementation Predecessor`,
      }
    : makeAuthProvenance('Header field: Canonical Predecessor (Base)');

  // 9. Calculate Machine & Estimated Context Metrics
  const totalMachineBytesRead = discoveryBytesRead + statusBytesRead;

  const onDemandGovernanceFiles = [
    {
      path: 'AGENTS.md',
      role: 'REPOSITORY_ENGINEERING_AND_GOVERNANCE_INVARIANTS',
      reason: 'Repository engineering rules and governance invariants',
      triggers: ['AUTHORITY_AMBIGUITY', 'CONTRADICTION_INVESTIGATION', 'PROVENANCE_AUDIT'],
    },
    {
      path: 'docs/MASTER_ROADMAP.md',
      role: 'MASTER_PRODUCT_ROADMAP_STAGE_TAXONOMY',
      reason: 'Master product roadmap Stage 1-8 taxonomy',
      triggers: ['STAGE_BOUNDARY_AMBIGUITY', 'PRODUCT_LINEAGE_AUDIT'],
    },
    {
      path: 'docs/ROADMAP.md',
      role: 'TECHNICAL_PACKAGE_TAXONOMY_AND_DEPENDENCIES',
      reason: 'Technical package Phase 0-7 taxonomy and dependencies',
      triggers: ['PACKAGE_DEPENDENCY_AMBIGUITY', 'PHASE_ORDER_INVESTIGATION'],
    },
    {
      path: 'docs/IMPLEMENTATION_PLAN.md',
      role: 'ACCEPTANCE_CRITERIA_AND_STOP_CONDITIONS',
      reason: 'Package specifications, test plans, and stop conditions',
      triggers: ['ACCEPTANCE_CRITERIA_CLARIFICATION', 'STOP_CONDITION_RESOLUTION'],
    },
    {
      path: 'docs/DECISIONS.md',
      role: 'ARCHITECTURE_DECISION_RECORDS',
      reason: 'Architecture decision records (ADR) and rationales',
      triggers: ['ARCHITECTURE_RATIONALE_INVESTIGATION', 'ADR_PRECEDENT_AUDIT'],
    },
  ];

  let estimatedGovernanceBytes = 0;
  for (const doc of onDemandGovernanceFiles) {
    const fullPath = path.join(rootDir, doc.path);
    if (fs.existsSync(fullPath)) {
      estimatedGovernanceBytes += fs.statSync(fullPath).size;
    }
  }
  const estimatedFullAgentContextBytes = totalMachineBytesRead + estimatedGovernanceBytes;

  const warnings = [];
  if (redPredicates.length === 0) {
    warnings.push('PILOT_LIMITATION: No RED predicates could be extracted from section 6.1');
  }
  if (greenGates.length === 0) {
    warnings.push('PILOT_LIMITATION: No GREEN gates could be extracted from section 6.3');
  }

  // 10. Build the Capsule Payload (Primary Bounded Context)
  const capsule = {
    transaction_id: transactionId,
    canonical_main: canonicalMain,
    working_head: workingHead,
    authority_provenance_model: 'CANONICAL_DOCS_ARE_AUTHORITY_CAPSULE_IS_DERIVED',

    primary_context: {
      capsule_is_sufficient_for_bounded_execution: true,
      description: 'Emitted capsule contains complete bounded operational facts. Consult on-demand references only on escalation or ambiguity.',
    },

    authorization_manifest_status: {
      value: manifestStatus,
      provenance: makeAuthProvenance('Header field: Status'),
    },

    current_execution_status: {
      value: executionStatusValue,
      provenance: {
        source_path: statusRelPath,
        source_blob_sha: statusBlobSha,
        anchor: executionStatusAnchor,
      },
    },

    authority_sources: [authRelPath],

    authority_ledger_references: [
      {
        source_path: authRelPath,
        source_blob_sha: authBlobSha,
        role: 'AUTHORIZATION_MANIFEST_CONTROLLING_BOUNDARY',
        anchor: 'Header field: Manifest Identity',
      },
      {
        source_path: statusRelPath,
        source_blob_sha: statusBlobSha,
        role: 'CANONICAL_IMPLEMENTATION_STATUS_LEDGER',
        anchor: executionStatusAnchor,
      },
    ],

    consult_on_demand_references: onDemandGovernanceFiles.filter(d => fs.existsSync(path.join(rootDir, d.path))),

    transaction_predecessor: {
      value: predecessorValue,
      provenance: predecessorProvenance,
    },

    allowed_writes: {
      value: allowedWrites.sort(),
      provenance: makeAuthProvenance('5. Exact Implementation Allowlist'),
    },

    forbidden_writes: {
      value: 'ALL_PATHS_NOT_IN_ALLOWED_WRITES',
      provenance: makeAuthProvenance('5. Exact Implementation Allowlist (inverse)'),
    },

    required_tests: {
      value: requiredTests,
      provenance: makeAuthProvenance('9. Verification Commands'),
    },

    red_predicates: {
      value: redPredicates,
      provenance: makeAuthProvenance('6.1 Commit A — RED Test Contract'),
    },

    green_gates: {
      value: greenGates,
      provenance: makeAuthProvenance('6.3 Commit B — GREEN Acceptance Gates'),
    },

    stop_conditions: {
      value: stopConditions,
      provenance: makeAuthProvenance('10. Execution Stop Conditions'),
    },

    ci_requirements: {
      value: ciRequirements,
      provenance: makeAuthProvenance('9.2 Natural Exact-Head CI Requirements'),
    },

    warnings,

    metrics: {
      authorization_discovery_files_read: authFilesCount,
      authorization_discovery_bytes_read: discoveryBytesRead,
      authority_bytes_parsed: authorityBytesParsed,
      status_bytes_read: statusBytesRead,
      status_bytes_parsed: statusBytesRead,
      total_machine_bytes_read: totalMachineBytesRead,
      capsule_bytes: 0,
      model_context_bytes_emitted: 0,
      machine_read_to_capsule_ratio: 0,
      estimated_full_agent_context_bytes: estimatedFullAgentContextBytes,
      estimated_agent_context_reduction_ratio: 0,
      authority_source_count: matchingSourcesCount,
      on_demand_reference_count: onDemandGovernanceFiles.filter(d => fs.existsSync(path.join(rootDir, d.path))).length + 2,
    },
  };

  // 11. Deterministic Fixed-Point Byte Metric Calculation (F006 remediation)
  let converged = false;
  for (let iter = 0; iter < 10; iter++) {
    const json = JSON.stringify(capsule, null, 2);
    const actualBytes = Buffer.byteLength(json, 'utf8');

    const ratiosStable =
      capsule.metrics.machine_read_to_capsule_ratio === (totalMachineBytesRead > 0 ? Math.round((totalMachineBytesRead / actualBytes) * 100) / 100 : 0) &&
      capsule.metrics.estimated_agent_context_reduction_ratio === (estimatedFullAgentContextBytes > 0 ? Math.round((estimatedFullAgentContextBytes / actualBytes) * 100) / 100 : 0);

    if (capsule.metrics.capsule_bytes === actualBytes &&
        capsule.metrics.model_context_bytes_emitted === actualBytes &&
        ratiosStable) {
      converged = true;
      break;
    }

    capsule.metrics.capsule_bytes = actualBytes;
    capsule.metrics.model_context_bytes_emitted = actualBytes;
    capsule.metrics.machine_read_to_capsule_ratio = totalMachineBytesRead > 0
      ? Math.round((totalMachineBytesRead / actualBytes) * 100) / 100
      : 0;
    capsule.metrics.estimated_agent_context_reduction_ratio = estimatedFullAgentContextBytes > 0
      ? Math.round((estimatedFullAgentContextBytes / actualBytes) * 100) / 100
      : 0;
  }

  // Final verification of byte equality
  const finalJson = JSON.stringify(capsule, null, 2);
  const finalActual = Buffer.byteLength(finalJson, 'utf8');
  if (capsule.metrics.capsule_bytes !== finalActual) {
    // If not converged due to digit-length oscillation, lock to final serialized size
    capsule.metrics.capsule_bytes = finalActual;
    capsule.metrics.model_context_bytes_emitted = finalActual;
  }

  return { ok: true, capsule };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
function printHelp() {
  console.log(`
Agent Context Compiler — Pilot (Final Remediation)

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
  lines.push('  AGENT CONTEXT CAPSULE (PRIMARY BOUNDED CONTEXT)');
  lines.push('  DERIVED FROM CANONICAL DOCS — NOT AUTHORITY');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`  Transaction:          ${capsule.transaction_id}`);
  lines.push(`  Canonical Main:       ${capsule.canonical_main.value} (${capsule.canonical_main.source})`);
  lines.push(`  Working HEAD:         ${capsule.working_head.value}`);
  lines.push(`  Authority Model:      ${capsule.authority_provenance_model}`);
  lines.push(`  Manifest Status:      ${capsule.authorization_manifest_status.value}`);
  lines.push(`  Execution Status:     ${capsule.current_execution_status.value}`);
  lines.push(`  Predecessor:          ${capsule.transaction_predecessor.value}`);
  lines.push('');
  lines.push('─── Authority Ledger References ───');
  for (const s of capsule.authority_ledger_references) lines.push(`  • [${s.role}] ${s.source_path} (${s.anchor})`);
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
  if (capsule.consult_on_demand_references.length > 0) {
    lines.push('─── Consult On-Demand References (Escalation Only) ───');
    for (const ref of capsule.consult_on_demand_references) lines.push(`  ℹ ${ref.path} — ${ref.role} (Triggers: ${ref.triggers.join(', ')})`);
    lines.push('');
  }
  if (capsule.warnings.length > 0) {
    lines.push('─── Warnings ───');
    for (const w of capsule.warnings) lines.push(`  ⚠ ${w}`);
    lines.push('');
  }
  lines.push('─── Truthful Metrics (Fixed-Point Verified) ───');
  lines.push(`  Auth discovery files read:  ${capsule.metrics.authorization_discovery_files_read}`);
  lines.push(`  Auth discovery bytes read:  ${capsule.metrics.authorization_discovery_bytes_read.toLocaleString()}`);
  lines.push(`  Authority bytes parsed:     ${capsule.metrics.authority_bytes_parsed.toLocaleString()}`);
  lines.push(`  Status bytes read:          ${capsule.metrics.status_bytes_read.toLocaleString()}`);
  lines.push(`  Total machine bytes read:   ${capsule.metrics.total_machine_bytes_read.toLocaleString()}`);
  lines.push(`  Capsule bytes (emitted):    ${capsule.metrics.capsule_bytes.toLocaleString()}`);
  lines.push(`  Model context emitted:      ${capsule.metrics.model_context_bytes_emitted.toLocaleString()}`);
  lines.push(`  Machine read / capsule:     ${capsule.metrics.machine_read_to_capsule_ratio}x`);
  lines.push(`  Estimated agent context:    ${capsule.metrics.estimated_full_agent_context_bytes.toLocaleString()} (Estimate)`);
  lines.push(`  Estimated reduction ratio:  ${capsule.metrics.estimated_agent_context_reduction_ratio}x`);
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════');
  return lines.join('\n');
}

// CLI invocation handling
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
