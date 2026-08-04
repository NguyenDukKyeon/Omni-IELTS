import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const COMMAND_RESULTS = Object.freeze([
  'PASS', 'FAIL', 'ERROR', 'NOT_RUN', 'NOT_AVAILABLE'
]);

export const AUDIT_RESULTS = Object.freeze([
  'ACCEPT', 'REJECT', 'BLOCKED_BY_INVALID_BRIEF'
]);

const STRUCTURAL_AUTHORITY_HEADINGS = [
  /^#{1,6}\s+definition of done\s*$/i,
  /^#{1,6}\s+acceptance (?:criteria|checklist)\s*$/i,
  /^#{1,6}\s+package status\s*$/i,
  /^#{1,6}\s+dependency (?:table|matrix)\s*$/i,
  /^#{1,6}\s+(?:architecture decision record|adr(?:[-:\s].*)?)\s*$/i
];

const COMMON_FIELDS = ['schemaVersion', 'artifactKind', 'authorityLabel', 'extensions'];
const ALLOWED_FIELDS = Object.freeze({
  'change-set': new Set([...COMMON_FIELDS, 'specId', 'predecessor', 'branch', 'worktree', 'writer', 'allowlist', 'exclusions', 'stopConditions']),
  'lightweight-repair': new Set([...COMMON_FIELDS, 'specId', 'eligibility', 'evidence']),
  'spec-metadata': new Set([...COMMON_FIELDS, 'canonicalPackageId', 'specId', 'revision', 'requirements', 'profiles']),
  'verification-manifest': new Set([...COMMON_FIELDS, 'specId', 'commands']),
  'implementation-report': new Set([...COMMON_FIELDS, 'specId', 'handoffState', 'subjectCommit', 'parentCommit', 'changedFiles', 'requirementTrace', 'commandResults', 'environment', 'frozenBriefDigest']),
  'frozen-acceptance-brief': new Set([...COMMON_FIELDS, 'specId', 'subjectCommit', 'parentCommit', 'specRevision', 'traceDigest', 'evidenceDigest', 'briefIdentity', 'briefDigest']),
  'audit-result': new Set([...COMMON_FIELDS, 'briefDigest', 'auditResult', 'auditor', 'findings'])
});

const AUTHORITY_LABELS = Object.freeze({
  'change-set': 'SUBORDINATE_CHANGE_DECLARATION / NOT_CANONICAL',
  'lightweight-repair': 'SUBORDINATE_REPAIR_RECORD / NOT_ACCEPTANCE',
  'spec-metadata': 'SUBORDINATE_SPEC_METADATA / NOT_CANONICAL',
  'verification-manifest': 'DECLARED_VERIFICATION / NOT_EXECUTION',
  'implementation-report': 'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE',
  'frozen-acceptance-brief': 'FROZEN_AUDIT_BOUNDARY / NOT_ACCEPTANCE',
  'audit-result': 'INDEPENDENT_AUDIT / AUDIT_VERDICT'
});

const ELIGIBILITY_FIELDS = Object.freeze([
  'boundedScope',
  'noProductBehaviorChange',
  'noCanonicalChange',
  'noDependencyChange',
  'noCiChange',
  'reversible'
]);

const FORBIDDEN_CLAIM_KEYS = new Set([
  'acceptance',
  'acceptancestatus',
  'accepted',
  'authority',
  'canonicalstatus',
  'packageacceptance',
  'packagestatus',
  'releasesafety',
  'releasesafe',
  'status',
  'verdict'
]);

const SHA_PATTERN = /^[0-9a-f]{40}$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function issue(list, code, path, message) {
  list.push({ code, path, message });
}

function sortIssues(issues) {
  return issues.sort((left, right) =>
    left.code.localeCompare(right.code) ||
    left.path.localeCompare(right.path) ||
    left.message.localeCompare(right.message)
  );
}

function requireString(value, field, errors, { pattern, basePath = '$' } = {}) {
  const candidate = value[field];
  const path = `${basePath}.${field}`;
  if (typeof candidate !== 'string' || candidate.trim() === '') {
    issue(errors, 'REQUIRED_STRING', path, `${field} must be a non-empty string.`);
    return false;
  }
  if (pattern && !pattern.test(candidate)) {
    issue(errors, 'INVALID_FORMAT', path, `${field} has an invalid format.`);
    return false;
  }
  return true;
}

function requireStringArray(value, field, errors, { nonEmpty = true, basePath = '$' } = {}) {
  const candidate = value[field];
  const path = `${basePath}.${field}`;
  if (!Array.isArray(candidate)) {
    issue(errors, 'REQUIRED_ARRAY', path, `${field} must be an array.`);
    return false;
  }
  if (nonEmpty && candidate.length === 0) {
    issue(errors, 'EMPTY_ARRAY', path, `${field} must not be empty.`);
  }
  candidate.forEach((entry, index) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      issue(errors, 'INVALID_ARRAY_ENTRY', `${path}[${index}]`, 'Expected a non-empty string.');
    }
  });
  return true;
}

function scanForbiddenClaims(value, errors, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForbiddenClaims(entry, errors, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;

  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_CLAIM_KEYS.has(key.toLowerCase())) {
      issue(errors, 'FORBIDDEN_AUTHORITY_CLAIM', `${path}.${key}`, `${key} may not claim canonical package authority or status.`);
    }
    scanForbiddenClaims(entry, errors, `${path}.${key}`);
  }
}

function validateCommon(kind, value, errors) {
  if (!isRecord(value)) {
    issue(errors, 'ARTIFACT_NOT_OBJECT', '$', 'Artifact must be a JSON object.');
    return false;
  }

  if (value.schemaVersion !== 1) {
    issue(errors, 'UNSUPPORTED_SCHEMA_VERSION', '$.schemaVersion', 'schemaVersion must equal 1.');
  }
  if (value.artifactKind !== kind) {
    issue(errors, 'ARTIFACT_KIND_MISMATCH', '$.artifactKind', `artifactKind must equal ${kind}.`);
  }
  if (value.authorityLabel !== AUTHORITY_LABELS[kind]) {
    issue(errors, 'INVALID_AUTHORITY_LABEL', '$.authorityLabel', `authorityLabel must equal ${AUTHORITY_LABELS[kind] ?? 'the registered subordinate label'}.`);
  }

  const allowed = ALLOWED_FIELDS[kind];
  if (!allowed) {
    issue(errors, 'UNKNOWN_ARTIFACT_KIND', '$.artifactKind', `Unsupported artifact kind: ${kind}.`);
    return false;
  }

  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) {
      const authorityLike = FORBIDDEN_CLAIM_KEYS.has(field.toLowerCase());
      issue(
        errors,
        authorityLike ? 'FORBIDDEN_TOP_LEVEL_AUTHORITY_FIELD' : 'UNKNOWN_TOP_LEVEL_FIELD',
        `$.${field}`,
        authorityLike
          ? `${field} is not an authorized top-level authority field.`
          : `${field} must be placed under extensions or removed.`
      );
    }
  }

  if ('extensions' in value && !isRecord(value.extensions)) {
    issue(errors, 'INVALID_EXTENSIONS', '$.extensions', 'extensions must be an object.');
  }

  scanForbiddenClaims(value, errors, '$');
  return true;
}

function validateChangeSet(value, errors) {
  requireString(value, 'specId', errors);
  requireString(value, 'predecessor', errors, { pattern: SHA_PATTERN });
  requireString(value, 'branch', errors);
  requireStringArray(value, 'allowlist', errors);
  requireStringArray(value, 'exclusions', errors);
  requireStringArray(value, 'stopConditions', errors);

  if (!isRecord(value.worktree)) {
    issue(errors, 'REQUIRED_OBJECT', '$.worktree', 'worktree must be an object.');
  } else {
    requireString(value.worktree, 'mode', errors, { basePath: '$.worktree' });
    requireString(value.worktree, 'path', errors, { basePath: '$.worktree' });
  }
  if (!isRecord(value.writer)) {
    issue(errors, 'REQUIRED_OBJECT', '$.writer', 'writer must be an object.');
  } else {
    requireString(value.writer, 'identity', errors, { basePath: '$.writer' });
    requireString(value.writer, 'mode', errors, { basePath: '$.writer' });
  }
}

function validateLightweightRepair(value, errors) {
  requireString(value, 'specId', errors);
  if (!isRecord(value.eligibility)) {
    issue(errors, 'REQUIRED_OBJECT', '$.eligibility', 'eligibility must be an object.');
  } else {
    for (const field of ELIGIBILITY_FIELDS) {
      if (value.eligibility[field] !== true) {
        issue(errors, 'REPAIR_INELIGIBLE', `$.eligibility.${field}`, `${field} must be explicitly true.`);
      }
    }
  }
  if (!isRecord(value.evidence)) {
    issue(errors, 'REQUIRED_OBJECT', '$.evidence', 'evidence must be an object.');
  } else {
    requireStringArray(value.evidence, 'changedFiles', errors, { nonEmpty: false, basePath: '$.evidence' });
    if (!Array.isArray(value.evidence.commands)) {
      issue(errors, 'REQUIRED_ARRAY', '$.evidence.commands', 'commands must be an array.');
    }
  }
}

function canonicalPackageIds(options) {
  const candidate = options.canonicalPackageIds;
  if (candidate instanceof Set) return candidate;
  if (Array.isArray(candidate)) return new Set(candidate);
  return null;
}

function validateSpecMetadata(value, errors, options) {
  requireString(value, 'canonicalPackageId', errors);
  requireString(value, 'specId', errors);
  requireString(value, 'revision', errors);

  const packageIds = canonicalPackageIds(options);
  if (!packageIds || !packageIds.has(value.canonicalPackageId)) {
    issue(errors, 'UNKNOWN_CANONICAL_PACKAGE', '$.canonicalPackageId', 'canonicalPackageId must reference an explicitly supplied existing package.');
  }

  if (!Array.isArray(value.requirements) || value.requirements.length === 0) {
    issue(errors, 'REQUIRED_ARRAY', '$.requirements', 'requirements must be a non-empty array.');
  } else {
    const namespace = typeof value.specId === 'string' ? value.specId.split('-')[0] : '';
    const seen = new Set();
    value.requirements.forEach((requirement, index) => {
      const path = `$.requirements[${index}]`;
      if (!isRecord(requirement)) {
        issue(errors, 'INVALID_REQUIREMENT', path, 'Requirement must be an object.');
        return;
      }
      if (typeof requirement.id !== 'string' || requirement.id.trim() === '') {
        issue(errors, 'REQUIRED_STRING', `${path}.id`, 'Requirement id must be a non-empty string.');
      } else {
        if (!namespace || !requirement.id.startsWith(`${namespace}-`)) {
          issue(errors, 'REQUIREMENT_NAMESPACE_MISMATCH', `${path}.id`, `Requirement id must use the ${namespace || 'spec'} namespace.`);
        }
        if (seen.has(requirement.id)) {
          issue(errors, 'DUPLICATE_REQUIREMENT_ID', `${path}.id`, `Duplicate requirement id: ${requirement.id}.`);
        }
        seen.add(requirement.id);
      }
      if (typeof requirement.description !== 'string' || requirement.description.trim() === '') {
        issue(errors, 'REQUIRED_STRING', `${path}.description`, 'Requirement description must be a non-empty string.');
      }
    });
  }

  if (!isRecord(value.profiles)) {
    issue(errors, 'REQUIRED_OBJECT', '$.profiles', 'profiles must be an object.');
  } else {
    requireStringArray(value.profiles, 'focused', errors, { basePath: '$.profiles' });
    requireStringArray(value.profiles, 'pr', errors, { basePath: '$.profiles' });
  }
}

function validateManifestCommand(command, path, errors) {
  if (!isRecord(command)) {
    issue(errors, 'INVALID_COMMAND_DECLARATION', path, 'Command declaration must be an object.');
    return;
  }
  for (const field of ['id', 'command']) {
    if (typeof command[field] !== 'string' || command[field].trim() === '') {
      issue(errors, 'REQUIRED_STRING', `${path}.${field}`, `${field} must be a non-empty string.`);
    }
  }
  if (!Array.isArray(command.requirements) || command.requirements.length === 0) {
    issue(errors, 'REQUIRED_ARRAY', `${path}.requirements`, 'requirements must be a non-empty array.');
  } else {
    command.requirements.forEach((requirement, index) => {
      if (typeof requirement !== 'string' || requirement.trim() === '') {
        issue(errors, 'INVALID_ARRAY_ENTRY', `${path}.requirements[${index}]`, 'Expected a requirement id.');
      }
    });
  }
}

function validateVerificationManifest(value, errors) {
  requireString(value, 'specId', errors);
  if (!isRecord(value.commands)) {
    issue(errors, 'REQUIRED_OBJECT', '$.commands', 'commands must be an object.');
    return;
  }
  for (const profile of ['focused', 'pr']) {
    const commands = value.commands[profile];
    if (!Array.isArray(commands) || commands.length === 0) {
      issue(errors, 'REQUIRED_ARRAY', `$.commands.${profile}`, `${profile} commands must be a non-empty array.`);
      continue;
    }
    commands.forEach((command, index) => validateManifestCommand(command, `$.commands.${profile}[${index}]`, errors));
  }
}

function validateCommandResult(commandResult, path, errors) {
  if (!isRecord(commandResult)) {
    issue(errors, 'INVALID_COMMAND_RESULT', path, 'Command result must be an object.');
    return;
  }
  if (typeof commandResult.command !== 'string' || commandResult.command.trim() === '') {
    issue(errors, 'REQUIRED_STRING', `${path}.command`, 'command must be a non-empty string.');
  }
  if (!COMMAND_RESULTS.includes(commandResult.result)) {
    issue(errors, 'INVALID_COMMAND_RESULT_VALUE', `${path}.result`, 'result is not in the frozen command vocabulary.');
  }
  if (!Number.isFinite(commandResult.durationMs) || commandResult.durationMs < 0) {
    issue(errors, 'INVALID_DURATION', `${path}.durationMs`, 'durationMs must be a non-negative finite number.');
  }
  if (commandResult.exitCode !== null && !Number.isInteger(commandResult.exitCode)) {
    issue(errors, 'INVALID_EXIT_CODE', `${path}.exitCode`, 'exitCode must be an integer or null.');
  }
  if (typeof commandResult.environment !== 'string' || commandResult.environment.trim() === '') {
    issue(errors, 'REQUIRED_STRING', `${path}.environment`, 'environment must be a non-empty string.');
  }
}

function validateImplementationReport(value, errors) {
  requireString(value, 'specId', errors);
  if (value.authorityLabel !== 'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE') {
    issue(errors, 'INVALID_IMPLEMENTER_AUTHORITY', '$.authorityLabel', 'Implementation reports must remain non-acceptance evidence.');
  }
  if (!['DRAFT', 'HANDOFF_READY'].includes(value.handoffState)) {
    issue(errors, 'INVALID_HANDOFF_STATE', '$.handoffState', 'handoffState must be DRAFT or HANDOFF_READY.');
  }
  for (const field of ['changedFiles', 'requirementTrace', 'commandResults']) {
    if (!Array.isArray(value[field])) {
      issue(errors, 'REQUIRED_ARRAY', `$.${field}`, `${field} must be an array.`);
    }
  }
  if (!isRecord(value.environment)) {
    issue(errors, 'REQUIRED_OBJECT', '$.environment', 'environment must be an object.');
  }
  if (value.frozenBriefDigest !== null && (typeof value.frozenBriefDigest !== 'string' || !DIGEST_PATTERN.test(value.frozenBriefDigest))) {
    issue(errors, 'INVALID_FORMAT', '$.frozenBriefDigest', 'frozenBriefDigest must be null or a lowercase SHA-256 digest.');
  }
  if (Array.isArray(value.commandResults)) {
    value.commandResults.forEach((entry, index) => validateCommandResult(entry, `$.commandResults[${index}]`, errors));
  }

  if (value.handoffState === 'HANDOFF_READY') {
    for (const field of ['subjectCommit', 'parentCommit']) {
      if (typeof value[field] !== 'string' || !SHA_PATTERN.test(value[field])) {
        issue(errors, 'INCOMPLETE_HANDOFF', `$.${field}`, `${field} must be a lowercase commit SHA for HANDOFF_READY.`);
      }
    }
    for (const field of ['changedFiles', 'requirementTrace', 'commandResults']) {
      if (!Array.isArray(value[field]) || value[field].length === 0) {
        issue(errors, 'INCOMPLETE_HANDOFF', `$.${field}`, `${field} must be populated for HANDOFF_READY.`);
      }
    }
    if (!isRecord(value.environment) || Object.keys(value.environment).length === 0) {
      issue(errors, 'INCOMPLETE_HANDOFF', '$.environment', 'environment must be populated for HANDOFF_READY.');
    }
  }
}

function validateFrozenBriefShape(value, errors) {
  requireString(value, 'specId', errors);
  requireString(value, 'subjectCommit', errors, { pattern: SHA_PATTERN });
  requireString(value, 'parentCommit', errors, { pattern: SHA_PATTERN });
  requireString(value, 'specRevision', errors);
  requireString(value, 'traceDigest', errors, { pattern: DIGEST_PATTERN });
  requireString(value, 'evidenceDigest', errors, { pattern: DIGEST_PATTERN });
  requireString(value, 'briefIdentity', errors);
  requireString(value, 'briefDigest', errors, { pattern: DIGEST_PATTERN });
}

function validateAuditResult(value, errors) {
  requireString(value, 'briefDigest', errors, { pattern: DIGEST_PATTERN });
  if (!AUDIT_RESULTS.includes(value.auditResult)) {
    issue(errors, 'INVALID_AUDIT_RESULT', '$.auditResult', 'auditResult is not in the frozen audit vocabulary.');
  }
  if (!isRecord(value.auditor)) {
    issue(errors, 'REQUIRED_OBJECT', '$.auditor', 'auditor must be an object.');
  } else {
    requireString(value.auditor, 'identity', errors, { basePath: '$.auditor' });
  }
  if (!Array.isArray(value.findings)) {
    issue(errors, 'REQUIRED_ARRAY', '$.findings', 'findings must be an array.');
  }
}

function hasGovernanceTable(lines) {
  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = lines[index].trim();
    const separator = lines[index + 1].trim();
    if (!header.startsWith('|') || !/^\|?(?:\s*:?-+:?\s*\|)+\s*$/.test(separator)) continue;

    const columns = header
      .split('|')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    const copiedPackageStatus = columns.includes('package') && columns.includes('status');
    const copiedDependencyTable = columns.includes('dependency') &&
      columns.some((entry) => entry === 'status' || entry.includes('depends'));
    const copiedAcceptanceTable = columns.some((entry) => entry.includes('acceptance')) &&
      columns.some((entry) => entry === 'status' || entry.includes('evidence'));

    if (copiedPackageStatus || copiedDependencyTable || copiedAcceptanceTable) return true;
  }
  return false;
}

export function containsForbiddenAuthorityCopy(markdown) {
  if (typeof markdown !== 'string') return true;
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');

  if (lines.some((line) => STRUCTURAL_AUTHORITY_HEADINGS.some((pattern) => pattern.test(line.trim())))) {
    return true;
  }
  if (hasGovernanceTable(lines)) return true;

  const sectionHeadings = new Set(
    lines
      .map((line) => /^#{1,6}\s+(context|decision|consequences)\s*$/i.exec(line.trim())?.[1]?.toLowerCase())
      .filter(Boolean)
  );
  return sectionHeadings.size >= 2;
}

function normalizeJsonValue(value, seen, path) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`Non-JSON number at ${path}.`);
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value !== 'object') {
    throw new TypeError(`Non-JSON value at ${path}.`);
  }
  if (seen.has(value)) throw new TypeError(`Cyclic JSON value at ${path}.`);
  seen.add(value);

  try {
    if (Array.isArray(value)) {
      const normalized = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new TypeError(`Non-JSON sparse array entry at ${path}[${index}].`);
        }
        normalized.push(normalizeJsonValue(value[index], seen, `${path}[${index}]`));
      }
      return normalized;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`Non-JSON object at ${path}.`);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError(`Non-JSON symbol key at ${path}.`);
    }

    const normalized = {};
    for (const key of Object.keys(value).sort()) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || descriptor.get || descriptor.set) {
        throw new TypeError(`Non-JSON accessor at ${path}.${key}.`);
      }
      normalized[key] = normalizeJsonValue(value[key], seen, `${path}.${key}`);
    }
    return normalized;
  } finally {
    seen.delete(value);
  }
}

export function canonicalizeArtifact(value) {
  return JSON.stringify(normalizeJsonValue(value, new Set(), '$'));
}

export function digestArtifact(value) {
  return createHash('sha256').update(canonicalizeArtifact(value), 'utf8').digest('hex');
}

export function validateArtifact(kind, value, options = {}) {
  const errors = [];
  const warnings = [];
  const commonValid = validateCommon(kind, value, errors);

  if (commonValid) {
    switch (kind) {
      case 'change-set': validateChangeSet(value, errors); break;
      case 'lightweight-repair': validateLightweightRepair(value, errors); break;
      case 'spec-metadata': validateSpecMetadata(value, errors, options); break;
      case 'verification-manifest': validateVerificationManifest(value, errors); break;
      case 'implementation-report': validateImplementationReport(value, errors); break;
      case 'frozen-acceptance-brief': validateFrozenBriefShape(value, errors); break;
      case 'audit-result': validateAuditResult(value, errors); break;
      default: break;
    }
  }

  let canonical = null;
  try {
    canonical = canonicalizeArtifact(value);
  } catch (error) {
    issue(
      errors,
      'NON_JSON_VALUE',
      '$',
      error instanceof Error ? error.message : 'Artifact contains a non-JSON value.'
    );
  }

  sortIssues(errors);
  sortIssues(warnings);
  if (errors.length > 0) {
    return { valid: false, errors, warnings, normalized: null, digest: null };
  }
  const normalized = JSON.parse(canonical);
  return { valid: true, errors, warnings, normalized, digest: digestArtifact(normalized) };
}

export function validateFrozenBrief(brief, bindings) {
  const shape = validateArtifact('frozen-acceptance-brief', brief);
  const errors = [...shape.errors];
  const warnings = [...shape.warnings];
  const bindingFields = [
    'subjectCommit',
    'parentCommit',
    'specRevision',
    'traceDigest',
    'evidenceDigest',
    'briefIdentity',
    'briefDigest'
  ];

  if (!isRecord(bindings)) {
    issue(errors, 'MISSING_BRIEF_BINDINGS', '$.bindings', 'bindings must be an object.');
  } else if (isRecord(brief)) {
    for (const field of bindingFields) {
      if (bindings[field] !== brief[field]) {
        issue(
          errors,
          'BRIEF_BINDING_MISMATCH',
          `$.bindings.${field}`,
          `${field} does not match the frozen brief.`
        );
      }
    }
  }

  if (shape.valid) {
    const { briefDigest: _storedDigest, ...digestableBrief } = brief;
    const computedDigest = digestArtifact(digestableBrief);
    if (brief.briefDigest !== computedDigest) {
      issue(errors, 'BRIEF_DIGEST_MISMATCH', '$.briefDigest', 'briefDigest does not match the canonical frozen brief payload.');
    }
  }

  sortIssues(errors);
  sortIssues(warnings);
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      normalized: null,
      digest: null,
      auditResult: 'BLOCKED_BY_INVALID_BRIEF'
    };
  }

  return { ...shape, auditResult: null };
}

const REDACTED_SECRET = '[REDACTED_SECRET]';
const REDACTED_PATH = '[REDACTED_ABSOLUTE_PATH]';
const REDACTED_CREDENTIALS = '[REDACTED_CREDENTIALS]';
function isSecretField(key) {
  const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return /(?:apikey|authorization|cookie|credential|password|privatekey|secret|token)$/.test(normalized);
}
const SECRET_VALUE_PATTERNS = [
  /\bghp_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+\/-]+=*\b/gi
];

function redactString(value) {
  let redacted = value.replace(
    /:\/\/([^/\s:@]+):([^@\s/]+)@/g,
    `://${REDACTED_CREDENTIALS}@`
  );

  for (const pattern of SECRET_VALUE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(redacted)) {
      pattern.lastIndex = 0;
      const replaced = redacted.replace(pattern, REDACTED_SECRET);
      redacted = replaced === REDACTED_SECRET ? REDACTED_SECRET : replaced;
    }
  }

  redacted = redacted.replace(
    /(^|[\s("'=])(?:[A-Za-z]:\\[^\s"'`]+|\\\\[^\s"'`]+\\[^\s"'`]+)/g,
    (_match, prefix) => `${prefix}${REDACTED_PATH}`
  );
  redacted = redacted.replace(
    /(^|[\s("'=])\/(?:Users|home|root|private|tmp|var\/folders|workspace|mnt\/[a-z]\/Users)(?:\/[^\s"'`]*)?/g,
    (_match, prefix) => `${prefix}${REDACTED_PATH}`
  );
  return redacted;
}

function redactValue(value, seen, key = '') {
  if (isSecretField(key)) return REDACTED_SECRET;
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value !== 'object') return REDACTED_SECRET;
  if (seen.has(value)) throw new TypeError('Portable redaction requires an acyclic value.');
  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map((entry) => redactValue(entry, seen));
    const output = {};
    for (const [entryKey, entryValue] of Object.entries(value)) {
      output[entryKey] = redactValue(entryValue, seen, entryKey);
    }
    return output;
  } finally {
    seen.delete(value);
  }
}

export function redactPortableValue(value) {
  return redactValue(value, new Set());
}

const TEMPLATE_KINDS = Object.freeze([
  'change-set',
  'lightweight-repair',
  'spec-metadata',
  'verification-manifest',
  'implementation-report',
  'frozen-acceptance-brief',
  'audit-result'
]);

async function runCheck() {
  const repositoryRoot = new URL('../', import.meta.url);
  const errors = [];
  const checked = [];

  try {
    const bridge = await readFile(new URL('.specify/memory/constitution.md', repositoryRoot), 'utf8');
    checked.push('.specify/memory/constitution.md');
    if (containsForbiddenAuthorityCopy(bridge)) {
      errors.push({
        code: 'FORBIDDEN_AUTHORITY_COPY',
        path: '.specify/memory/constitution.md',
        message: 'Constitution bridge copies a forbidden canonical structure.'
      });
    }
  } catch (error) {
    errors.push({
      code: 'BRIDGE_READ_ERROR',
      path: '.specify/memory/constitution.md',
      message: error instanceof Error ? error.message : String(error)
    });
  }

  for (const kind of TEMPLATE_KINDS) {
    const relativePath = `.specify/templates/ewf/${kind}.template.json`;
    try {
      const template = JSON.parse(await readFile(new URL(relativePath, repositoryRoot), 'utf8'));
      checked.push(relativePath);
      const result = validateArtifact(kind, template, { canonicalPackageIds: ['EWF-00'] });
      for (const validationError of result.errors) {
        errors.push({ ...validationError, path: `${relativePath}:${validationError.path}` });
      }
    } catch (error) {
      errors.push({
        code: 'TEMPLATE_READ_ERROR',
        path: relativePath,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  sortIssues(errors);
  const output = { valid: errors.length === 0, checked: checked.sort(), errors };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  return output.valid ? 0 : 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--check') {
    process.exitCode = await runCheck();
  } else {
    process.stderr.write('Unsupported mode. The only read-only CLI mode is --check.\n');
    process.exitCode = 2;
  }
}
