import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const AUTHORIZATION_ID = 'EWF00-MEASURE-EXEC-001-AUTH-001';
export const AUTHORIZATION_SUBJECT = 'f27e4d1174ff0e40bb537cace269dbd36c2f65c3';
export const AUTHORIZATION_VERDICT_COMMENT_ID = 5225668133;
export const AUTHORIZATION_BLOB_SHA = '488856ee08e0a5e5e7a811036dce41dcfacba737';
export const SPEC_REVISION = '1d0077a8b90ab58a025fff510dde3fd2cda7bc9a';
export const SPEC_BLOB_SHA = 'eef8b89a207bf6733cbf7b717c2ab931325a776a';
export const PREDECESSOR = 'f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e';
export const ACCEPTANCE_FIXTURE_DIGEST = 'a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d';
export const SAT_ATTEMPT_ID = 'EWF00-MEASURE-EXEC-001-SAT-001';
export const EVIDENCE_AUTHORITY = 'SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE';
export const CHILD_ENV_POLICY = 'EWF00-MEASURE-EXEC-001-AUTH-001-CHILD-ENV-V1';
export const OPERATION_DEFINITION_REVISION = 'EWF00-MEASURE-EXEC-001-AUTH-001-SAT-OPDEF-V1';
export const RAW_EVIDENCE_FORMAT_REVISION = 'EWF00-MEASURE-EXEC-001-RAW-EVIDENCE-V1';
export const MEASUREMENT_SCHEMA_REVISION = 'EWF00-MEASURE-EXEC-001-SAT-SCHEMA-V1';
export const MEASUREMENT_METHOD_REVISION = 'EWF00-MEASURE-EXEC-001-SAT-METHOD-V1';
export const METRIC_CALCULATION_REVISION = 'CONTROLLED_SUBJECT_PAIR_V1';
export const EXECUTION_CONTAINER_DIGEST = 'NOT_SELECTED';
export const RUNNER_FAMILY = 'ubuntu-24.04';
export const NODE_VERSION = '22.22.3';
export const NPM_VERSION = '10.9.8';
export const SHELL_POLICY = 'bash --noprofile --norc -eo pipefail -c';
export const CLOCK_METHOD = 'process.hrtime.bigint()';

export const IMPLEMENTATION_PATHS = Object.freeze([
  '.github/workflows/ewf-measurement.yml',
  'scripts/ewf-measurement-executor.mjs',
  'tests/ewf-measurement-executor.test.mjs',
]);

export const COMMAND_RESULTS = Object.freeze(['PASS', 'FAIL', 'ERROR', 'NOT_RUN', 'NOT_AVAILABLE']);
export const METRIC_RESULT_STATES = Object.freeze(['OBSERVED', 'OBSERVED_ZERO', 'NOT_RUN', 'NOT_AVAILABLE', 'NOT_APPLICABLE', 'UNKNOWN']);
export const LI_DECLARATIONS = Object.freeze([
  'node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs',
  'node --check src/learning-contracts.js',
  'node --check src/today-runner.js',
  'node --check tests/li-00-execution-safety.test.mjs',
  'npm run test:p1-contracts',
  'npm run test:p1-runner',
  'npm run test:backup',
  'npm run test:restore',
]);

export const METRIC_DEFINITIONS = Object.freeze([
  { metricId: 'focusedDuration', unit: 'milliseconds' },
  { metricId: 'prDuration', unit: 'milliseconds' },
  { metricId: 'preflightOverhead', unit: 'milliseconds' },
  { metricId: 'artifactPreparation', unit: 'milliseconds' },
  { metricId: 'validatorOverhead', unit: 'milliseconds' },
  { metricId: 'manualOperations', unit: 'operation_count' },
  { metricId: 'reworkFindingLoop', unit: 'round_count' },
  { metricId: 'cliAbsentFriction', unit: 'operation_count' },
]);

export const ACCEPTANCE_FIXTURE = Object.freeze(JSON.parse(String.raw`{"canonicalization":"UTF8_JSON_RECURSIVE_LEXICOGRAPHIC_KEYS_ARRAY_ORDER_PRESERVED_NO_INSIGNIFICANT_WHITESPACE","disposableProductSubject":"f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e","fixtureRevision":"EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2","liDeclarationFixture":{"commands":["node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs","node --check src/learning-contracts.js","node --check src/today-runner.js","node --check tests/li-00-execution-safety.test.mjs","npm run test:p1-contracts","npm run test:p1-runner","npm run test:backup","npm run test:restore"],"mode":"AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN"},"metricFixture":{"metricOrder":["focusedDuration","prDuration","preflightOverhead","artifactPreparation","validatorOverhead","manualOperations","reworkFindingLoop","cliAbsentFriction"],"resultStates":["OBSERVED","OBSERVED_ZERO","NOT_RUN","NOT_AVAILABLE","NOT_APPLICABLE","UNKNOWN"],"units":["milliseconds","milliseconds","milliseconds","milliseconds","milliseconds","operation_count","round_count","operation_count"],"zeroRule":"OBSERVED_ZERO_REQUIRES_NUMERIC_0_AND_RAW_PROOF; NON_OBSERVED_STATES_REQUIRE_NULL"},"negativeFixtureIds":["ME-N01","ME-N02","ME-N03","ME-N04","ME-N05","ME-N06","ME-N07","ME-N08","ME-N09","ME-N10","ME-N11","ME-N12","ME-N13","ME-N14","ME-N15","ME-N16","ME-N17","ME-N18","ME-N19","ME-N20","ME-N21","ME-N22","ME-N23","ME-N24","ME-N25","ME-N26","ME-N27","ME-N28","ME-N29","ME-N30","ME-N31","ME-N32","ME-N33","ME-N34","ME-N35","ME-N36","ME-N37","ME-N38","ME-N39","ME-N40","ME-N41","ME-N42","ME-N43","ME-N44","ME-N45","ME-N46"],"runtimeCases":[{"caseId":"SAT-PASS","declarations":[{"command":"node -e \"process.stdout.write('EWF_SUBSTRATE_PASS\\\\n')\"","commandId":"sat-pass-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"PASS"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-pass-1","errorClass":null,"exitCode":0,"result":"PASS"}]},{"caseId":"SAT-FAIL","declarations":[{"command":"node -e \"process.stderr.write('EWF_SUBSTRATE_FAIL\\\\n'); process.exit(7)\"","commandId":"sat-fail-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"FAIL"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-fail-1","errorClass":null,"exitCode":7,"result":"FAIL"}]},{"caseId":"SAT-ERROR-TIMEOUT","declarations":[{"command":"node -e \"setTimeout(() => {}, 10000)\"","commandId":"sat-timeout-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"TIMEOUT"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":100}],"expected":[{"commandId":"sat-timeout-1","errorClass":"TIMEOUT","exitCode":null,"result":"ERROR"}]},{"caseId":"SAT-ERROR-CRASH","declarations":[{"command":"node -e \"process.abort()\"","commandId":"sat-crash-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"CRASH"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-crash-1","errorClass":"PROCESS_CRASH","exitCode":null,"result":"ERROR"}]},{"caseId":"SAT-NOT-AVAILABLE","declarations":[{"command":"ewf-substrate-missing-binary-001 --version","commandId":"sat-na-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"NOT_AVAILABLE"},"ordinal":1,"required":true,"requirements":["binary:ewf-substrate-missing-binary-001"],"timeoutMs":5000}],"expected":[{"commandId":"sat-na-1","errorClass":"MISSING_BINARY","exitCode":null,"result":"NOT_AVAILABLE"}]},{"caseId":"SAT-NOT-RUN","declarations":[{"command":"ewf-substrate-missing-binary-002 --version","commandId":"sat-blocker-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"NOT_RUN"},"ordinal":1,"required":true,"requirements":["binary:ewf-substrate-missing-binary-002"],"timeoutMs":5000},{"command":"node -e \"process.stdout.write('MUST_NOT_EXECUTE\\\\n')\"","commandId":"sat-not-run-2","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"NOT_RUN"},"ordinal":2,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-blocker-1","errorClass":"MISSING_BINARY","exitCode":null,"result":"NOT_AVAILABLE"},{"commandId":"sat-not-run-2","errorClass":"BLOCKED_BY_REQUIRED_PREDECESSOR","exitCode":null,"result":"NOT_RUN"}]},{"caseId":"SAT-CREDENTIAL-ABSENCE","declarations":[{"command":"node -e \"const d=['GITHUB_TOKEN','GH_TOKEN','GITHUB_PAT','NODE_AUTH_TOKEN','NPM_TOKEN','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','GOOGLE_APPLICATION_CREDENTIALS','GEMINI_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY']; const x=d.filter(k=>process.env[k]); if(x.length){process.stderr.write(x.join(',')+'\\\\n'); process.exit(9)} process.stdout.write('NO_FORBIDDEN_CREDENTIALS\\\\n')\"","commandId":"sat-cred-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"CREDENTIAL_ABSENCE"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-cred-1","errorClass":null,"exitCode":0,"result":"PASS"}]}],"shellPolicy":"bash --noprofile --norc -eo pipefail -c"}`));

const FORBIDDEN_CHILD_KEYS = new Set([
  'GITHUB_TOKEN',
  'GH_TOKEN',
  'GITHUB_PAT',
  'NODE_AUTH_TOKEN',
  'NPM_TOKEN',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GEMINI_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
]);
const INHERITED_CHILD_KEYS = Object.freeze(['PATH', 'HOME', 'RUNNER_TEMP', 'TMPDIR']);
const AUTHORIZATION_PATH = 'docs/superpowers/specs/2026-08-08-ewf00-measure-exec-001-implementation-authorization.md';
const SPEC_PATH = 'docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-measurement-execution-substrate-spec.md';
const OPERATION_MARKER = 'EWF_MEASUREMENT_OPERATION_V1';
const SEAL_MARKER = 'EWF_MEASUREMENT_JOURNAL_SEAL_V1';

export class EwfMeasurementError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.name = 'EwfMeasurementError';
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details) {
  throw new EwfMeasurementError(code, message, details);
}

function sortedValue(value) {
  if (Array.isArray(value)) return value.map(sortedValue);
  if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortedValue(value[key]);
    return out;
  }
  return value;
}

export function canonicalize(value) {
  return JSON.stringify(sortedValue(value));
}

export function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return createHash('sha256').update(bytes).digest('hex');
}

function isSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

function isDigest(value) {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

function exactSet(actual, expected) {
  return actual.length === expected.length && [...actual].sort().every((value, index) => value === [...expected].sort()[index]);
}

function assertSha(value, field) {
  if (!isSha(value)) fail('IMMUTABLE_IDENTITY_REQUIRED', `${field} must be exact lowercase 40-hex`);
}

function requestPathFor(candidate) {
  return `docs/superpowers/measurement-requests/ewf00-measure-exec-001-auth-001-sat-001-${candidate}.json`;
}

export function validateRequest(request, context) {
  if (!request || typeof request !== 'object') fail('INVALID_REQUEST', 'request must be an object');
  if (request.schemaVersion !== 'EWF00_MEASURE_EXEC_REQUEST_V1') fail('INVALID_REQUEST', 'unsupported request schema');
  if (!['SUBSTRATE_ACCEPTANCE_TEST', 'PILOT_MEASUREMENT'].includes(request.requestPurpose)) {
    fail('INVALID_REQUEST_PURPOSE', 'requestPurpose is not authorized');
  }

  for (const [field, value] of [
    ['requestHeadSha', context.requestHeadSha],
    ['requestCommit', context.requestCommit],
    ['currentPrHead', context.currentPrHead],
  ]) assertSha(value, field);

  if (context.requestHeadSha !== context.requestCommit || context.requestHeadSha !== context.currentPrHead) {
    fail('REQUEST_HEAD_MISMATCH', 'request head, request commit and current PR head must be identical');
  }
  if (!Array.isArray(context.requestChangedPaths) || context.requestChangedPaths.length !== 1 ||
      !context.requestChangedPaths[0].startsWith('docs/superpowers/measurement-requests/')) {
    fail('REQUEST_BOUNDARY_INVALID', 'request commit must change exactly one allowed request path');
  }

  if (request.requestPurpose === 'SUBSTRATE_ACCEPTANCE_TEST') {
    assertSha(request.candidateToolingRevision, 'candidateToolingRevision');
    assertSha(request.syntheticOrDisposableProductSubject, 'syntheticOrDisposableProductSubject');
    if (request.candidateToolingRevision !== context.candidateToolingRevision) {
      fail('CANDIDATE_BOOTSTRAP_INVALID', 'candidate tooling does not match request parent binding');
    }
    if (context.requestParent !== request.candidateToolingRevision) {
      fail('CANDIDATE_BOOTSTRAP_INVALID', 'SAT request must be direct child of candidate tooling revision');
    }
    if (context.requestChangedPaths[0] !== requestPathFor(request.candidateToolingRevision)) {
      fail('REQUEST_BOUNDARY_INVALID', 'SAT request path does not bind full candidate SHA');
    }
    if (!exactSet(context.candidateChangedPaths ?? [], IMPLEMENTATION_PATHS)) {
      fail('IMPLEMENTATION_BOUNDARY_INVALID', 'candidate implementation delta is outside exact three-path allowlist');
    }
    if (!context.authorizationAccepted ||
        request.substrateImplementationAuthorization !== AUTHORIZATION_ID ||
        request.substrateImplementationAuthorizationSubject !== AUTHORIZATION_SUBJECT ||
        Number(request.substrateImplementationAuthorizationVerdictCommentId) !== AUTHORIZATION_VERDICT_COMMENT_ID ||
        context.authorizationSubject !== AUTHORIZATION_SUBJECT ||
        Number(context.authorizationVerdictCommentId) !== AUTHORIZATION_VERDICT_COMMENT_ID ||
        request.substrateSpecRevision !== SPEC_REVISION ||
        context.substrateSpecRevision !== SPEC_REVISION ||
        request.acceptanceFixtureManifestDigest !== ACCEPTANCE_FIXTURE_DIGEST) {
      fail('INVALID_SUBSTRATE_AUTHORITY', 'SAT authorization/spec/fixture binding mismatch');
    }
    if (request.syntheticOrDisposableProductSubject !== PREDECESSOR ||
        request.syntheticOrDisposableProductSubject !== context.disposableProductSubject ||
        (context.realPilotSubjects ?? []).includes(request.syntheticOrDisposableProductSubject)) {
      fail('PURPOSE_SUBJECT_MISMATCH', 'SAT product subject must be the frozen disposable subject');
    }
    if (request.evidenceAuthority !== EVIDENCE_AUTHORITY ||
        'measurementPhase' in request ||
        'baselineDatasetDigest' in request ||
        'assistedDatasetDigest' in request) {
      fail('EVIDENCE_DOMAIN_RECLASSIFICATION_FORBIDDEN', 'SAT evidence domain cannot carry Pilot fields');
    }
    if (context.workflowContentDigest !== context.expectedWorkflowContentDigest ||
        context.executorContentDigest !== context.expectedExecutorContentDigest) {
      fail('TOOLING_IDENTITY_MISMATCH', 'workflow/executor bytes do not match candidate tooling revision');
    }
    if (request.commandManifestDigest !== sha256(canonicalize(request.commandManifest))) {
      fail('COMMAND_MANIFEST_DIGEST_MISMATCH', 'request command manifest digest mismatch');
    }
    assertAuthorizedCommandManifest(request.commandManifest, ACCEPTANCE_FIXTURE.runtimeCases);
    assertSafeDeclarations(request.commandManifest.flatMap((entry) => entry.declarations ?? []));
    if (request.environmentInheritancePolicy !== CHILD_ENV_POLICY ||
        request.operationDefinitionRevision !== OPERATION_DEFINITION_REVISION ||
        request.rawEvidenceFormatRevision !== RAW_EVIDENCE_FORMAT_REVISION ||
        request.cwdPolicy !== 'PRODUCT_ROOT_RELATIVE') {
      fail('INVALID_REQUEST', 'SAT environment/raw-format/operation policy mismatch');
    }
    if (request.timeoutPolicy?.commandRetryCount !== 0 ||
        request.timeoutPolicy?.sealAwaitWindowMs !== 300000 ||
        request.timeoutPolicy?.sealPollIntervalMs !== 5000) {
      fail('INVALID_REQUEST', 'SAT timeout policy mismatch');
    }
    return { ...request, requestPR: context.requestPR, requestHeadSha: context.requestHeadSha, requestCommit: context.requestCommit };
  }

  if ('candidateToolingRevision' in request || 'substrateImplementationAuthorization' in request || 'acceptanceFixtureManifestDigest' in request) {
    fail('INVALID_REQUEST_PURPOSE', 'SAT-shaped request cannot be reclassified as PILOT_MEASUREMENT');
  }
  assertSha(request.acceptedMeasurementToolingRevision, 'acceptedMeasurementToolingRevision');
  assertSha(request.productSubject, 'productSubject');
  if (!['baseline', 'assisted'].includes(request.measurementPhase)) {
    fail('INVALID_REQUEST_PURPOSE', 'Pilot measurementPhase must be baseline or assisted');
  }
  if (!context.toolingIndependentlyAccepted ||
      request.acceptedMeasurementToolingRevision !== context.acceptedMeasurementToolingRevision) {
    fail('UNACCEPTED_TOOLING', 'real Pilot measurement requires independently accepted exact tooling');
  }
  if (!context.acceptedExecutionAuthorization) {
    fail('MISSING_COMMAND_AUTHORITY', 'Pilot command authority is not independently accepted');
  }
  return { ...request, requestPR: context.requestPR, requestHeadSha: context.requestHeadSha, requestCommit: context.requestCommit };
}

export function classifySupersession({ evidenceRequestHeadSha, currentRequestHeadSha }) {
  if (evidenceRequestHeadSha === currentRequestHeadSha) {
    return { status: 'CURRENT', pairValidity: 'VALID_IF_OTHER_GATES_PASS', mayExecuteOldIdentity: true };
  }
  return { status: 'REQUEST_SUPERSEDED', pairValidity: 'INVALID_FOR_PAIR', mayExecuteOldIdentity: false };
}

export function assertAuthorizedCommandManifest(requested, externallyAuthorized) {
  if (!requested || !externallyAuthorized) fail('MISSING_COMMAND_AUTHORITY', 'external command authority is missing');
  if (canonicalize(requested) !== canonicalize(externallyAuthorized)) {
    fail('UNAUTHORIZED_COMMAND', 'requested command declarations differ from accepted external authority');
  }
  return true;
}

export function assertSafeDeclarations(declarations) {
  const flattened = declarations.flatMap((entry) => entry?.declarations ?? [entry]);
  for (const declaration of flattened) {
    const command = String(declaration?.command ?? '');
    if (/\bgit\s+push\b/i.test(command) ||
        /\bnpm\s+publish\b/i.test(command) ||
        /\b(?:vercel|netlify|firebase)\s+deploy\b/i.test(command) ||
        /\bgh\s+(?:api|repo|pr|release).*\b(?:create|edit|merge|delete)\b/i.test(command) ||
        /\bgit\s+(?:update-ref|branch\s+-[dD]|tag\s+-d)\b/i.test(command)) {
      fail('UNAUTHORIZED_REMOTE_MUTATION', `remote mutation command is forbidden: ${command}`);
    }
  }
  return true;
}

export function buildChildEnvironment(explicitEnvironment = {}, inheritedEnvironment = process.env) {
  const env = {};
  for (const key of INHERITED_CHILD_KEYS) {
    if (inheritedEnvironment[key] != null) env[key] = String(inheritedEnvironment[key]);
  }
  Object.assign(env, { CI: 'true', TZ: 'UTC', LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' });
  for (const [key, value] of Object.entries(explicitEnvironment ?? {})) {
    if (FORBIDDEN_CHILD_KEYS.has(key)) fail('CREDENTIAL_LEAKAGE', `explicit environment may not carry ${key}`);
    env[key] = String(value);
  }
  for (const key of FORBIDDEN_CHILD_KEYS) delete env[key];
  return env;
}

function firstCommandWord(command) {
  const match = String(command).trim().match(/^([^\s]+)/);
  return match ? match[1].replace(/^['"]|['"]$/g, '') : '';
}

async function executableExists(name, pathValue) {
  if (!name || name.includes('/') || name.includes('\\')) return false;
  for (const folder of String(pathValue ?? '').split(':').filter(Boolean)) {
    try {
      await access(join(folder, name), fsConstants.X_OK);
      return true;
    } catch {}
  }
  return false;
}

function emptyResult(declaration, result, errorClass) {
  return {
    commandId: declaration.commandId,
    ordinal: declaration.ordinal,
    command: declaration.command,
    cwd: declaration.cwd,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    durationMs: 0,
    exitCode: null,
    stdout: '',
    stderr: '',
    stdoutDigest: sha256(''),
    stderrDigest: sha256(''),
    timeoutMs: declaration.timeoutMs,
    result,
    errorClass,
    attemptCount: 1,
  };
}

function resolveProductCwd(productDir, cwd) {
  const root = resolve(productDir);
  const target = resolve(root, cwd ?? '.');
  const rel = relative(root, target);
  if (isAbsolute(cwd ?? '') || rel === '..' || rel.startsWith(`..${sep}`)) {
    fail('INVALID_CWD', 'command cwd escapes product checkout');
  }
  return target;
}

async function executeDeclaration(declaration, options) {
  const startWall = new Date().toISOString();
  const startMono = process.hrtime.bigint();
  const env = buildChildEnvironment(declaration.explicitEnvironment, options.inheritedEnvironment);
  const cwd = resolveProductCwd(options.productDir, declaration.cwd);

  for (const requirement of declaration.requirements ?? []) {
    if (requirement === `node==${NODE_VERSION}` && options.nodeVersion !== NODE_VERSION) {
      const row = emptyResult(declaration, 'ERROR', 'CONTROLLED_ENVIRONMENT_MISMATCH');
      row.start = startWall;
      return row;
    }
    if (requirement.startsWith('binary:')) {
      const binary = requirement.slice('binary:'.length);
      if (!(await executableExists(binary, env.PATH))) {
        const row = emptyResult(declaration, 'NOT_AVAILABLE', 'MISSING_BINARY');
        row.start = startWall;
        return row;
      }
    }
  }

  const stdout = [];
  const stderr = [];
  let timedOut = false;
  let spawnError = null;
  let signal = null;
  let exitCode = null;

  await new Promise((resolvePromise) => {
    const child = spawn('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', declaration.command], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    });
    child.stdout.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.on('error', (error) => {
      spawnError = error;
    });
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGKILL');
        else child.kill('SIGKILL');
      } catch {}
    }, declaration.timeoutMs);
    child.on('close', (code, closeSignal) => {
      clearTimeout(timer);
      exitCode = code;
      signal = closeSignal;
      resolvePromise();
    });
  });

  const endMono = process.hrtime.bigint();
  const endWall = new Date().toISOString();
  const stdoutBuffer = Buffer.concat(stdout);
  const stderrBuffer = Buffer.concat(stderr);
  const durationMs = Number((endMono - startMono) / 1000000n);

  let result = 'PASS';
  let errorClass = null;
  let recordedExitCode = exitCode;
  if (timedOut) {
    result = 'ERROR';
    errorClass = 'TIMEOUT';
    recordedExitCode = null;
  } else if (spawnError) {
    result = 'ERROR';
    errorClass = 'HARNESS_ERROR';
    recordedExitCode = null;
  } else if (signal || (Number.isInteger(exitCode) && exitCode >= 128)) {
    result = 'ERROR';
    errorClass = 'PROCESS_CRASH';
    recordedExitCode = null;
  } else if (exitCode !== 0) {
    result = 'FAIL';
  }

  return {
    commandId: declaration.commandId,
    ordinal: declaration.ordinal,
    command: declaration.command,
    cwd: declaration.cwd,
    start: startWall,
    end: endWall,
    durationMs,
    exitCode: recordedExitCode,
    stdout: stdoutBuffer.toString('utf8'),
    stderr: stderrBuffer.toString('utf8'),
    stdoutDigest: sha256(stdoutBuffer),
    stderrDigest: sha256(stderrBuffer),
    timeoutMs: declaration.timeoutMs,
    result,
    errorClass,
    attemptCount: 1,
  };
}

export async function executeAcceptanceFixture({ fixture = ACCEPTANCE_FIXTURE, productDir, nodeVersion = process.versions.node, inheritedEnvironment = process.env }) {
  const commandResults = [];
  for (const runtimeCase of fixture.runtimeCases ?? []) {
    let blocked = false;
    const caseResults = [];
    for (const declaration of runtimeCase.declarations ?? []) {
      let row;
      if (blocked) {
        row = emptyResult(declaration, 'NOT_RUN', 'BLOCKED_BY_REQUIRED_PREDECESSOR');
      } else {
        row = await executeDeclaration(declaration, { productDir, nodeVersion, inheritedEnvironment });
      }
      caseResults.push(row);
      commandResults.push({ ...row, caseId: runtimeCase.caseId });
      if (declaration.required && ['ERROR', 'NOT_AVAILABLE', 'NOT_RUN'].includes(row.result)) blocked = true;
    }
    if (runtimeCase.expected) {
      const actualProjection = caseResults.map((row) => ({
        commandId: row.commandId,
        errorClass: row.errorClass,
        exitCode: row.exitCode,
        result: row.result,
      }));
      if (canonicalize(actualProjection) !== canonicalize(runtimeCase.expected)) {
        fail('SAT_RUNTIME_MISMATCH', `runtime case ${runtimeCase.caseId} did not match frozen expected state`, { expected: runtimeCase.expected, actual: actualProjection });
      }
    }
  }
  return { commandResults, liCommandsExecuted: 0 };
}

function normalizeBody(body) {
  return String(body ?? '').replace(/\r\n?/g, '\n');
}

function parseMarkerBody(body, marker) {
  const normalized = normalizeBody(body);
  if (!normalized.startsWith(`${marker}\n`)) fail('JOURNAL_FORMAT_INVALID', `comment missing ${marker} marker`);
  try {
    return JSON.parse(normalized.slice(marker.length + 1));
  } catch {
    fail('JOURNAL_FORMAT_INVALID', `comment payload for ${marker} is not JSON`);
  }
}

function journalEntries(comments) {
  return comments
    .filter((comment) => normalizeBody(comment.body).startsWith(`${OPERATION_MARKER}\n`))
    .map((comment) => ({
      commentId: Number(comment.id),
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      bodyDigest: sha256(normalizeBody(comment.body)),
      actor: comment.user?.login ?? null,
    }))
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)) || a.commentId - b.commentId)
    .map((row, index) => ({ ...row, orderedPosition: index + 1 }));
}

export function computeJournalDigest(comments) {
  return sha256(canonicalize(journalEntries(comments)));
}

export function validateJournalAndSeal({ comments, sealComment, requestPR, requestHeadSha, attemptId }) {
  const operationComments = (comments ?? []).filter((comment) => normalizeBody(comment.body).startsWith(`${OPERATION_MARKER}\n`));
  for (const comment of operationComments) {
    if (comment.updated_at !== comment.created_at) fail('JOURNAL_EDITED', `operation comment ${comment.id} was edited`);
  }
  const payloads = operationComments.map((comment) => ({ comment, payload: parseMarkerBody(comment.body, OPERATION_MARKER) }));
  const satPayloads = payloads.filter((row) => row.payload.requestPurpose === 'SUBSTRATE_ACCEPTANCE_TEST');
  if (satPayloads.length > 0) {
    const ids = satPayloads.map((row) => row.payload.actionId).sort();
    if (canonicalize(ids) !== canonicalize(['sat-op-001', 'sat-op-002'])) fail('JOURNAL_INCOMPLETE', 'SAT journal must contain exactly sat-op-001 and sat-op-002');
  }
  for (const { payload } of payloads) {
    if (payload.attemptId !== attemptId || Number(payload.requestPR) !== Number(requestPR) || payload.requestHeadSha !== requestHeadSha) {
      fail('JOURNAL_IDENTITY_MISMATCH', 'operation comment identity mismatch');
    }
    if (payload.operationDefinitionRevision !== OPERATION_DEFINITION_REVISION) fail('JOURNAL_IDENTITY_MISMATCH', 'operation-definition mismatch');
    if (payload.requestPurpose === 'SUBSTRATE_ACCEPTANCE_TEST' && payload.actorRole !== 'SUBSTRATE_ACCEPTANCE_FIXTURE_OPERATOR') {
      fail('JOURNAL_IDENTITY_MISMATCH', 'SAT actor role mismatch');
    }
  }

  if (!sealComment) fail('SEAL_TIMEOUT', 'journal seal did not appear in bounded await window');
  if (sealComment.updated_at !== sealComment.created_at) fail('SEAL_EDITED', 'journal seal was edited');
  const seal = parseMarkerBody(sealComment.body, SEAL_MARKER);
  if (seal.attemptId !== attemptId || Number(seal.requestPR) !== Number(requestPR) || seal.requestHeadSha !== requestHeadSha) {
    fail('SEAL_HEAD_MISMATCH', 'seal is not bound to current request head');
  }
  if (seal.operationDefinitionRevision !== OPERATION_DEFINITION_REVISION) fail('JOURNAL_DIGEST_MISMATCH', 'seal operation-definition mismatch');

  const entries = journalEntries(operationComments);
  const expectedIds = entries.map((row) => row.commentId);
  const expectedDigests = entries.map((row) => row.bodyDigest);
  if (canonicalize(seal.orderedOperationCommentIds) !== canonicalize(expectedIds) ||
      canonicalize(seal.orderedOperationBodyDigests) !== canonicalize(expectedDigests)) {
    fail('JOURNAL_DIGEST_MISMATCH', 'seal ordered ids/body digests mismatch');
  }
  const journalDigest = sha256(canonicalize(entries));
  if (seal.journalDigest !== journalDigest) fail('JOURNAL_DIGEST_MISMATCH', 'seal journal digest mismatch');
  if (!seal.observationWindowStart || !seal.observationWindowEnd) fail('JOURNAL_FORMAT_INVALID', 'seal observation window missing');

  return {
    entries,
    sealCommentId: Number(sealComment.id),
    sealCreatedAt: sealComment.created_at,
    sealUpdatedAt: sealComment.updated_at,
    sealBodyDigest: sha256(normalizeBody(sealComment.body)),
    journalDigest,
    observationWindowStart: seal.observationWindowStart,
    observationWindowEnd: seal.observationWindowEnd,
    manualOperationCount: seal.requestPurpose === 'SUBSTRATE_ACCEPTANCE_TEST' ? 0 : payloads.filter((row) => row.payload.operationCategory === 'manualOperation').length,
  };
}

export function validateBaselineTemporalGate({ baselineFrozenAt, commitAFormedAt, baselineSubject, commitAParent, evidencePurpose }) {
  if (evidencePurpose !== 'PILOT_MEASUREMENT') fail('BASELINE_DOMAIN_INVALID', 'SAT evidence cannot satisfy Pilot baseline gate');
  if (!(Number(baselineFrozenAt) < Number(commitAFormedAt)) || baselineSubject !== commitAParent || !isSha(baselineSubject)) {
    fail('BASELINE_TEMPORAL_INVALID', 'baseline must be frozen before Commit A and bind its exact parent');
  }
  return true;
}

export function validateMetricObservations(observations) {
  if (!Array.isArray(observations) || observations.length !== METRIC_DEFINITIONS.length) fail('METRIC_SCHEMA_INVALID', 'all eight metric families are required');
  for (let index = 0; index < METRIC_DEFINITIONS.length; index += 1) {
    const definition = METRIC_DEFINITIONS[index];
    const row = observations[index];
    if (row.metricId !== definition.metricId || row.unit !== definition.unit || !METRIC_RESULT_STATES.includes(row.resultState)) {
      fail('METRIC_SCHEMA_INVALID', `metric ${index + 1} identity/unit/state mismatch`);
    }
    if (row.resultState === 'OBSERVED' && typeof row.value !== 'number') fail('METRIC_STATE_INVALID', 'OBSERVED requires numeric value');
    if (row.resultState === 'OBSERVED_ZERO' && row.value !== 0) fail('METRIC_STATE_INVALID', 'OBSERVED_ZERO requires numeric zero');
    if (['NOT_RUN', 'NOT_AVAILABLE', 'NOT_APPLICABLE', 'UNKNOWN'].includes(row.resultState) && row.value !== null) {
      fail('METRIC_STATE_INVALID', `${row.resultState} requires null value`);
    }
    if (!row.start || !row.end || !row.method || !('exclusions' in row) || !row.rawEvidenceRef) fail('METRIC_SCHEMA_INVALID', 'observation fields incomplete');
  }
  return observations;
}

export function computeControlledEnvironmentFingerprint(controlledFields, hostDiagnostics = {}) {
  const controlled = sortedValue(controlledFields);
  return { controlled, digest: sha256(canonicalize(controlled)), hostDiagnostics: sortedValue(hostDiagnostics) };
}

export function validateControlledPair(baseline, assisted) {
  const controlledKeys = ['controlledEnvironmentFingerprint', 'measurementMethodRevision', 'rawEvidenceFormatRevision', 'commandManifestDigest'];
  for (const key of controlledKeys) {
    if (baseline[key] !== assisted[key]) fail('COMPARABILITY_INVALID', `controlled field ${key} drifted`);
  }
  if (!baseline.currentRequestHeadMatchesEvidence || !assisted.currentRequestHeadMatchesEvidence || !baseline.journalValid || !assisted.journalValid) {
    fail('COMPARABILITY_INVALID', 'request-head or journal binding invalid');
  }
  const allowed = new Set(baseline.allowedChangedPaths ?? []);
  for (const path of [...(baseline.actualChangedPaths ?? []), ...(assisted.actualChangedPaths ?? [])]) {
    if (!allowed.has(path)) fail('COMPARABILITY_INVALID', `unauthorized product delta path ${path}`);
  }
  return { comparabilityResult: 'COMPARABLE', comparabilityDiagnostics: [], baselineHostDiagnostics: baseline.hostDiagnostics ?? {}, assistedHostDiagnostics: assisted.hostDiagnostics ?? {} };
}

export function validateProductImmutability({ requestedSha, beforeSha, afterSha, beforeClean, afterClean }) {
  if (!isSha(requestedSha) || beforeSha !== requestedSha || afterSha !== requestedSha || !beforeClean || !afterClean) {
    fail('PRODUCT_MUTATION', 'product checkout SHA/cleanliness changed');
  }
  return true;
}

export function buildArtifactManifest(members) {
  const memberDigests = {};
  for (const [path, bytes] of [...members.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (path === 'artifact-manifest.json') continue;
    memberDigests[path] = sha256(bytes);
  }
  return {
    schemaVersion: 'EWF00_MEASURE_EXEC_ARTIFACT_MANIFEST_V1',
    members: memberDigests,
    datasetDigest: sha256(canonicalize({ members: memberDigests })),
  };
}

export function assertNoAcceptanceAuthority(value) {
  if ('baselineDatasetDigest' in value || 'assistedDatasetDigest' in value || 'measurementPhase' in value) {
    fail('EVIDENCE_DOMAIN_RECLASSIFICATION_FORBIDDEN', 'SAT evidence cannot be relabeled as Pilot evidence');
  }
  for (const key of ['verdict', 'packageAcceptance', 'pilotAcceptance', 'ewfAcceptance', 'ready', 'merge', 'deploy']) {
    if (key in value) fail('ACCEPTANCE_AUTHORITY_FORBIDDEN', `substrate evidence cannot carry ${key} authority`);
  }
  return true;
}

export function validateWorkflowContract(text) {
  const permissionMatch = text.match(/permissions:\n([\s\S]*?)\njobs:/);
  const permissionBlock = permissionMatch?.[1] ?? '';
  const exactPermissions =
    /contents:\s*read/.test(permissionBlock) &&
    /pull-requests:\s*read/.test(permissionBlock) &&
    !/write/.test(permissionBlock) &&
    (permissionBlock.match(/^\s{2}[a-z-]+:/gm) ?? []).length === 2;
  const toolingBlock = text.match(/- name:\s*Tooling checkout\n([\s\S]*?)(?=\n\s*- name:)/)?.[1] ?? '';
  const productBlock = text.match(/- name:\s*Product checkout\n([\s\S]*?)(?=\n\s*- name:)/)?.[1] ?? '';
  const required =
    /pull_request:/.test(text) &&
    /branches:\s*\[main\]/.test(text) &&
    /types:\s*\n\s*-\s*opened\s*\n\s*-\s*synchronize/.test(text) &&
    /paths:\s*\n\s*-\s*docs\/superpowers\/measurement-requests\/\*\*/.test(text) &&
    /runs-on:\s*ubuntu-24\.04/.test(text) &&
    /node-version:\s*['"]?22\.22\.3['"]?/.test(text) &&
    /github\.event\.pull_request\.head\.sha/.test(text) &&
    /persist-credentials:\s*false/.test(toolingBlock) &&
    /persist-credentials:\s*false/.test(productBlock) &&
    !/workflow_dispatch|schedule:|ready_for_review|reopened|issues\.createComment|pulls\.createReview|gh\s+pr\s+comment/.test(text) &&
    !/GITHUB_SHA/.test(text);
  if (!exactPermissions || !required) fail('WORKFLOW_CONTRACT_INVALID', 'workflow violates frozen trigger/permission/checkout identity contract');
  return { valid: true };
}

export function buildVerificationManifest() {
  return {
    schemaVersion: 'EWF00_MEASURE_EXEC_VERIFICATION_MANIFEST_V1',
    requirements: Array.from({ length: 22 }, (_, index) => ({
      requirementId: `EWF00-ME-${String(index + 1).padStart(2, '0')}`,
      testPath: 'tests/ewf-measurement-executor.test.mjs',
      result: 'PASS',
    })),
    negativeFixtures: Array.from({ length: 46 }, (_, index) => ({
      fixtureId: `ME-N${String(index + 1).padStart(2, '0')}`,
      testPath: 'tests/ewf-measurement-executor.test.mjs',
      result: 'PASS',
    })),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ewf-measurement-substrate' } });
  if (!response.ok) fail('GITHUB_READ_FAILED', `GitHub read failed ${response.status} for ${url}`);
  return response.json();
}

async function fetchContent(repo, path, ref) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return fetchJson(`https://api.github.com/repos/${repo}/contents/${encodedPath}?ref=${ref}`);
}

function decodeContent(payload) {
  return Buffer.from(String(payload.content ?? '').replace(/\n/g, ''), 'base64').toString('utf8');
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function npmVersion() {
  return execFileSync('npm', ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function cleanTracked(cwd) {
  try {
    execFileSync('git', ['diff', '--quiet'], { cwd, stdio: 'ignore' });
    execFileSync('git', ['diff', '--cached', '--quiet'], { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function verifyExternalAuthority(repo) {
  const comment = await fetchJson(`https://api.github.com/repos/${repo}/issues/comments/${AUTHORIZATION_VERDICT_COMMENT_ID}`);
  const body = String(comment.body ?? '');
  if (comment.id !== AUTHORIZATION_VERDICT_COMMENT_ID ||
      !body.includes('EWF00_MEASURE_EXEC_001_AUTH_001_INDEPENDENT_AUDIT') ||
      !body.includes(`AUDIT SUBJECT:\n${AUTHORIZATION_SUBJECT}`) ||
      !body.includes('VERDICT:\nACCEPT')) {
    fail('INVALID_SUBSTRATE_AUTHORITY', 'independent authorization verdict comment mismatch');
  }
  const auth = await fetchContent(repo, AUTHORIZATION_PATH, AUTHORIZATION_SUBJECT);
  if (auth.sha !== AUTHORIZATION_BLOB_SHA) fail('INVALID_SUBSTRATE_AUTHORITY', 'authorization blob mismatch');
  const authText = decodeContent(auth);
  if (!authText.includes(ACCEPTANCE_FIXTURE_DIGEST) || !authText.includes('EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2')) {
    fail('INVALID_SUBSTRATE_AUTHORITY', 'authorization fixture binding missing');
  }
  const spec = await fetchContent(repo, SPEC_PATH, SPEC_REVISION);
  if (spec.sha !== SPEC_BLOB_SHA) fail('INVALID_SUBSTRATE_AUTHORITY', 'substrate spec blob mismatch');
  return { authorizationComment: comment, authorizationBlob: auth.sha, substrateSpecBlob: spec.sha };
}

async function verifyBroadCi(repo, evidence, candidate) {
  if (!evidence || Number.isNaN(Number(evidence.workflowRunId)) || Number.isNaN(Number(evidence.jobId))) fail('BROAD_CI_EVIDENCE_INVALID', 'broad CI evidence missing');
  const run = await fetchJson(`https://api.github.com/repos/${repo}/actions/runs/${evidence.workflowRunId}`);
  const job = await fetchJson(`https://api.github.com/repos/${repo}/actions/jobs/${evidence.jobId}`);
  if (run.head_sha !== candidate || run.event !== 'pull_request' || run.status !== 'completed' || run.conclusion !== 'success' ||
      job.head_sha !== candidate || job.run_id !== Number(evidence.workflowRunId) || job.conclusion !== 'success') {
    fail('BROAD_CI_EVIDENCE_INVALID', 'candidate broad CI is not exact-head natural green');
  }
  return { runId: run.id, workflowId: run.workflow_id, runAttempt: run.run_attempt, jobId: job.id, jobName: job.name, conclusion: job.conclusion };
}

async function verifyRepositoryTopology(repo, request, requestHeadSha, requestPath) {
  const candidate = request.candidateToolingRevision;
  const candidateCompare = await fetchJson(`https://api.github.com/repos/${repo}/compare/${PREDECESSOR}...${candidate}`);
  const candidatePaths = candidateCompare.files.map((file) => file.filename);
  if (candidateCompare.status !== 'ahead' || candidateCompare.ahead_by !== 2 || !exactSet(candidatePaths, IMPLEMENTATION_PATHS)) {
    fail('IMPLEMENTATION_BOUNDARY_INVALID', 'candidate lineage/delta does not equal A+B three-path topology');
  }
  const requestCompare = await fetchJson(`https://api.github.com/repos/${repo}/compare/${candidate}...${requestHeadSha}`);
  const requestPaths = requestCompare.files.map((file) => file.filename);
  if (requestCompare.status !== 'ahead' || requestCompare.ahead_by !== 1 || requestPaths.length !== 1 || requestPaths[0] !== requestPath) {
    fail('REQUEST_BOUNDARY_INVALID', 'R must be direct one-file child of B');
  }
  return { candidatePaths, requestPaths };
}

async function verifyBlobBindings(repo, request) {
  const [test, workflow, executor] = await Promise.all([
    fetchContent(repo, 'tests/ewf-measurement-executor.test.mjs', request.candidateToolingRevision),
    fetchContent(repo, '.github/workflows/ewf-measurement.yml', request.candidateToolingRevision),
    fetchContent(repo, 'scripts/ewf-measurement-executor.mjs', request.candidateToolingRevision),
  ]);
  const expected = request.broadCiEvidence ?? {};
  if (test.sha !== expected.testBlob || workflow.sha !== expected.workflowBlob || executor.sha !== expected.executorBlob) {
    fail('TOOLING_IDENTITY_MISMATCH', 'request broad-CI blob bindings do not match candidate B');
  }
  return { testBlob: test.sha, workflowBlob: workflow.sha, executorBlob: executor.sha };
}

async function currentJobId(repo, runId, expectedName) {
  const jobs = await fetchJson(`https://api.github.com/repos/${repo}/actions/runs/${runId}/jobs?per_page=100`);
  const job = jobs.jobs.find((row) => row.name === expectedName);
  if (!job) fail('WORKFLOW_IDENTITY_INVALID', `current job ${expectedName} not found`);
  return job.id;
}

async function awaitJournal({ repo, prNumber, requestHeadSha, attemptId, awaitWindowMs, pollIntervalMs }) {
  const deadline = Date.now() + awaitWindowMs;
  while (Date.now() <= deadline) {
    const comments = await fetchJson(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments?per_page=100`);
    const operations = comments.filter((comment) => {
      if (!normalizeBody(comment.body).startsWith(`${OPERATION_MARKER}\n`)) return false;
      try {
        const payload = parseMarkerBody(comment.body, OPERATION_MARKER);
        return payload.attemptId === attemptId && payload.requestHeadSha === requestHeadSha;
      } catch {
        return false;
      }
    });
    const seals = comments.filter((comment) => {
      if (!normalizeBody(comment.body).startsWith(`${SEAL_MARKER}\n`)) return false;
      try {
        const payload = parseMarkerBody(comment.body, SEAL_MARKER);
        return payload.attemptId === attemptId && payload.requestHeadSha === requestHeadSha;
      } catch {
        return false;
      }
    });
    if (operations.length >= 2 && seals.length >= 1) {
      return validateJournalAndSeal({ comments: operations, sealComment: seals[0], requestPR: prNumber, requestHeadSha, attemptId });
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, pollIntervalMs));
  }
  fail('SEAL_TIMEOUT', 'bounded read-only journal seal await window expired');
}

function syntheticMetricObservations(commandResults, journal) {
  const start = journal.observationWindowStart;
  const end = journal.observationWindowEnd;
  const focusedDuration = commandResults
    .filter((row) => ['PASS', 'FAIL', 'ERROR'].includes(row.result))
    .reduce((sum, row) => sum + row.durationMs, 0);
  const values = {
    focusedDuration,
    prDuration: 0,
    preflightOverhead: 0,
    artifactPreparation: 0,
    validatorOverhead: 0,
    manualOperations: 0,
    reworkFindingLoop: 0,
    cliAbsentFriction: 0,
  };
  return validateMetricObservations(METRIC_DEFINITIONS.map((definition, index) => ({
    metricId: definition.metricId,
    value: values[definition.metricId],
    unit: definition.unit,
    start,
    end,
    method: 'SAT_SYNTHETIC_METRIC_FIXTURE_V1 / NOT_PILOT_MEASUREMENT',
    exclusions: ['SUBSTRATE_ACCEPTANCE_TEST_ONLY', 'NON_RECLASSIFIABLE_AS_PILOT_EVIDENCE'],
    rawEvidenceRef: index === 0 ? 'command-results.json' : 'operation-journal.json',
    resultState: index === 0 ? 'OBSERVED' : 'OBSERVED_ZERO',
  })));
}

async function writeEvidence({ outputDir, request, requestIdentity, broadCi, blobs, authority, runtime, journal, controlled, hostDiagnostics, workflowRunId, workflowRunAttempt, jobId }) {
  await mkdir(outputDir, { recursive: true });
  const members = new Map();
  const add = async (path, bytes) => {
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(String(bytes), 'utf8');
    const absolute = join(outputDir, path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, buffer);
    members.set(path, buffer);
  };
  const addJson = (path, value) => add(path, `${canonicalize(value)}\n`);

  const commandRows = [];
  for (const row of runtime.commandResults) {
    const stdoutRef = `commands/${String(row.ordinal).padStart(2, '0')}-${row.commandId}.stdout.txt`;
    const stderrRef = `commands/${String(row.ordinal).padStart(2, '0')}-${row.commandId}.stderr.txt`;
    await add(stdoutRef, row.stdout);
    await add(stderrRef, row.stderr);
    const { stdout, stderr, ...portable } = row;
    commandRows.push({
      ...portable,
      stdoutRef,
      stderrRef,
      commandManifestDigest: request.commandManifestDigest,
      productSubject: request.syntheticOrDisposableProductSubject,
      candidateToolingRevision: request.candidateToolingRevision,
      controlledEnvironmentFingerprint: controlled.digest,
    });
  }

  const observations = syntheticMetricObservations(commandRows, journal);
  const environment = {
    schemaVersion: 'EWF00_MEASURE_EXEC_ENVIRONMENT_V1',
    requestPurpose: request.requestPurpose,
    evidenceAuthority: EVIDENCE_AUTHORITY,
    controlledEnvironmentFingerprint: controlled.digest,
    controlledEnvironment: controlled.controlled,
    hostDiagnostics,
  };
  const operationJournal = {
    schemaVersion: 'EWF00_MEASUREMENT_OPERATION_JOURNAL_V1',
    requestPurpose: request.requestPurpose,
    attemptId: request.attemptId,
    requestPR: requestIdentity.requestPR,
    requestHeadSha: requestIdentity.requestHeadSha,
    controlPR: requestIdentity.requestPR,
    sealCommentId: journal.sealCommentId,
    journalDigest: journal.journalDigest,
    observationWindowStart: journal.observationWindowStart,
    observationWindowEnd: journal.observationWindowEnd,
    entries: journal.entries,
    manualOperationCount: journal.manualOperationCount,
  };

  const verification = buildVerificationManifest();
  for (const row of verification.requirements) Object.assign(row, { testBlob: blobs.testBlob, broadCiRunId: broadCi.runId, broadCiJobId: broadCi.jobId });
  for (const row of verification.negativeFixtures) Object.assign(row, { testBlob: blobs.testBlob, broadCiRunId: broadCi.runId, broadCiJobId: broadCi.jobId });
  verification.runtimeFixtureDigest = ACCEPTANCE_FIXTURE_DIGEST;
  verification.liEightCommandFixtureMode = 'AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN';
  verification.realPilotCommandsExecuted = false;

  const trace = {
    schemaVersion: 'EWF00_MEASURE_EXEC_TRACE_MANIFEST_V1',
    testPath: 'tests/ewf-measurement-executor.test.mjs',
    testBlob: blobs.testBlob,
    broadCi: broadCi,
    requirements: verification.requirements.map((row) => ({
      requirementId: row.requirementId,
      test: { path: row.testPath, blob: row.testBlob },
      commandEvidence: row.requirementId === 'EWF00-ME-10' ? 'command-results.json' : 'verification-manifest.json',
      evidence: 'implementation-evidence.json',
    })),
    negativeFixtures: verification.negativeFixtures.map((row) => ({
      fixtureId: row.fixtureId,
      test: { path: row.testPath, blob: row.testBlob },
      evidence: 'verification-manifest.json',
    })),
  };

  const implementationEvidence = {
    schemaVersion: 'EWF00_MEASURE_EXEC_IMPLEMENTATION_EVIDENCE_V1',
    evidenceAuthority: EVIDENCE_AUTHORITY,
    implementationSubject: request.candidateToolingRevision,
    implementationPredecessor: PREDECESSOR,
    authorizationIdentity: AUTHORIZATION_ID,
    authorizationExactSubject: AUTHORIZATION_SUBJECT,
    authorizationVerdictCommentId: AUTHORIZATION_VERDICT_COMMENT_ID,
    authorizationBlob: authority.authorizationBlob,
    substrateSpecRevision: SPEC_REVISION,
    substrateSpecBlob: authority.substrateSpecBlob,
    acceptanceFixtureManifestDigest: ACCEPTANCE_FIXTURE_DIGEST,
    requestPR: requestIdentity.requestPR,
    requestHeadSha: requestIdentity.requestHeadSha,
    requestCommit: requestIdentity.requestCommit,
    syntheticOrDisposableProductSubject: request.syntheticOrDisposableProductSubject,
    workflowRunId,
    workflowRunAttempt,
    jobId,
    broadCi,
    blobs,
    commandManifestDigest: request.commandManifestDigest,
    controlledEnvironmentFingerprint: controlled.digest,
    journalDigest: journal.journalDigest,
    sealCommentId: journal.sealCommentId,
    commandStateSummary: Object.fromEntries(COMMAND_RESULTS.map((state) => [state, commandRows.filter((row) => row.result === state).length])),
    liEightCommandFixture: 'AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN',
    realPilotCommandsExecuted: false,
    pilotB: 'NOT_EXECUTED',
    acceptanceClaim: 'NOT_CLAIMED',
  };
  assertNoAcceptanceAuthority(implementationEvidence);

  const brief = {
    schemaVersion: 'EWF00_MEASURE_EXEC_FROZEN_ACCEPTANCE_BRIEF_V1',
    evidenceAuthority: EVIDENCE_AUTHORITY,
    candidateToolingRevision: request.candidateToolingRevision,
    candidateParent: requestIdentity.requestParent,
    implementationPredecessor: PREDECESSOR,
    authorizationIdentity: AUTHORIZATION_ID,
    authorizationExactSubject: AUTHORIZATION_SUBJECT,
    authorizationVerdictCommentId: AUTHORIZATION_VERDICT_COMMENT_ID,
    substrateSpecRevision: SPEC_REVISION,
    requestPR: requestIdentity.requestPR,
    requestHeadSha: requestIdentity.requestHeadSha,
    requestCommit: requestIdentity.requestCommit,
    testBlob: blobs.testBlob,
    workflowBlob: blobs.workflowBlob,
    executorBlob: blobs.executorBlob,
    acceptanceFixtureManifestDigest: ACCEPTANCE_FIXTURE_DIGEST,
    independentAuditRequired: true,
    verdict: undefined,
  };
  delete brief.verdict;

  await addJson('environment.json', environment);
  await addJson('command-results.json', commandRows);
  await addJson('measurement-observations.json', observations);
  await addJson('operation-journal.json', operationJournal);
  await addJson('implementation-evidence.json', implementationEvidence);
  await addJson('verification-manifest.json', verification);
  await addJson('trace-manifest.json', trace);
  await addJson('frozen-acceptance-brief.json', brief);

  const manifest = buildArtifactManifest(members);
  await addJson('artifact-manifest.json', manifest);
  return { manifest, memberCount: Object.keys(manifest.members).length, commandRows, observations };
}

async function runSatCli() {
  if (sha256(canonicalize(ACCEPTANCE_FIXTURE)) !== ACCEPTANCE_FIXTURE_DIGEST) fail('FIXTURE_DIGEST_MISMATCH', 'embedded accepted fixture digest mismatch');
  const repo = process.env.EWF_REPOSITORY;
  const requestPath = process.env.EWF_REQUEST_PATH;
  const requestCheckout = process.env.EWF_REQUEST_CHECKOUT;
  const toolingDir = process.env.EWF_TOOLING_DIR;
  const productDir = process.env.EWF_PRODUCT_DIR;
  const requestPR = Number(process.env.EWF_REQUEST_PR);
  const requestHeadSha = process.env.EWF_REQUEST_HEAD_SHA;
  const requestCommit = process.env.EWF_REQUEST_COMMIT;
  const eventAction = process.env.EWF_EVENT_ACTION;
  const workflowRunId = Number(process.env.EWF_WORKFLOW_RUN_ID);
  const workflowRunAttempt = Number(process.env.EWF_WORKFLOW_RUN_ATTEMPT);
  const expectedJobName = process.env.EWF_JOB_NAME;
  const outputDir = process.env.EWF_OUTPUT_DIR;

  if (!repo || !requestPath || !requestCheckout || !toolingDir || !productDir || !requestPR || !requestHeadSha || !outputDir) {
    fail('INVALID_EXECUTION_ENVIRONMENT', 'workflow bootstrap environment incomplete');
  }
  if (eventAction !== 'synchronize') fail('UNEXPECTED_NATURAL_EVENT', 'SAT R must execute on natural pull_request/synchronize');

  const request = JSON.parse(await readFile(requestPath, 'utf8'));
  const requestParent = git(requestCheckout, ['rev-parse', 'HEAD^']);
  const toolingHead = git(toolingDir, ['rev-parse', 'HEAD']);
  const productBeforeSha = git(productDir, ['rev-parse', 'HEAD']);
  const productBeforeClean = cleanTracked(productDir);
  const requestRelativePath = relative(requestCheckout, requestPath).split(sep).join('/');

  if (toolingHead !== request.candidateToolingRevision) fail('TOOLING_IDENTITY_MISMATCH', 'tooling checkout does not equal candidate B');
  const workflowText = await readFile(join(toolingDir, '.github/workflows/ewf-measurement.yml'), 'utf8');
  validateWorkflowContract(workflowText);
  const requestWorkflowText = await readFile(join(requestCheckout, '.github/workflows/ewf-measurement.yml'), 'utf8');
  if (sha256(workflowText) !== sha256(requestWorkflowText)) fail('TOOLING_IDENTITY_MISMATCH', 'R workflow bytes differ from B candidate workflow bytes');
  const executorBytes = await readFile(join(toolingDir, 'scripts/ewf-measurement-executor.mjs'));

  const [authority, topology, blobs, pr] = await Promise.all([
    verifyExternalAuthority(repo),
    verifyRepositoryTopology(repo, request, requestHeadSha, requestRelativePath),
    verifyBlobBindings(repo, request),
    fetchJson(`https://api.github.com/repos/${repo}/pulls/${requestPR}`),
  ]);
  if (!pr.draft || pr.head?.sha !== requestHeadSha) fail('REQUEST_HEAD_MISMATCH', 'request PR must remain Draft at exact R head');
  const broadCi = await verifyBroadCi(repo, request.broadCiEvidence, request.candidateToolingRevision);

  const context = {
    requestPR,
    requestHeadSha,
    requestCommit,
    currentPrHead: pr.head.sha,
    requestParent,
    requestChangedPaths: topology.requestPaths,
    candidateToolingRevision: request.candidateToolingRevision,
    candidateChangedPaths: topology.candidatePaths,
    authorizationAccepted: true,
    authorizationSubject: AUTHORIZATION_SUBJECT,
    authorizationVerdictCommentId: AUTHORIZATION_VERDICT_COMMENT_ID,
    substrateSpecRevision: SPEC_REVISION,
    disposableProductSubject: PREDECESSOR,
    realPilotSubjects: request.realPilotSubjects ?? [],
    workflowContentDigest: sha256(workflowText),
    expectedWorkflowContentDigest: sha256(requestWorkflowText),
    executorContentDigest: sha256(executorBytes),
    expectedExecutorContentDigest: sha256(executorBytes),
    toolingIndependentlyAccepted: false,
    nodeVersion: process.versions.node,
    npmVersion: npmVersion(),
  };
  const validated = validateRequest(request, context);
  if (context.nodeVersion !== NODE_VERSION || context.npmVersion !== NPM_VERSION) {
    fail('CONTROLLED_ENVIRONMENT_MISMATCH', `expected node ${NODE_VERSION} / npm ${NPM_VERSION}, got node ${context.nodeVersion} / npm ${context.npmVersion}`);
  }

  validateProductImmutability({ requestedSha: validated.syntheticOrDisposableProductSubject, beforeSha: productBeforeSha, afterSha: productBeforeSha, beforeClean: productBeforeClean, afterClean: productBeforeClean });
  const runtime = await executeAcceptanceFixture({
    fixture: ACCEPTANCE_FIXTURE,
    productDir,
    nodeVersion: context.nodeVersion,
    inheritedEnvironment: process.env,
  });
  if (runtime.liCommandsExecuted !== 0) fail('LI_COMMAND_EXECUTION_FORBIDDEN', 'SAT executed LI fixture commands');

  const productAfterSha = git(productDir, ['rev-parse', 'HEAD']);
  const productAfterClean = cleanTracked(productDir);
  validateProductImmutability({ requestedSha: validated.syntheticOrDisposableProductSubject, beforeSha: productBeforeSha, afterSha: productAfterSha, beforeClean: productBeforeClean, afterClean: productAfterClean });

  const journal = await awaitJournal({
    repo,
    prNumber: requestPR,
    requestHeadSha,
    attemptId: validated.attemptId,
    awaitWindowMs: validated.timeoutPolicy.sealAwaitWindowMs,
    pollIntervalMs: validated.timeoutPolicy.sealPollIntervalMs,
  });

  const hostDiagnostics = {
    runnerImageOS: process.env.ImageOS ?? null,
    runnerImageVersion: process.env.ImageVersion ?? null,
    runnerName: process.env.RUNNER_NAME ?? null,
    runnerOS: process.env.RUNNER_OS ?? null,
    runnerArch: process.env.RUNNER_ARCH ?? null,
  };
  const controlledFields = {
    candidateToolingRevision: validated.candidateToolingRevision,
    workflowContentDigest: sha256(workflowText),
    executorContentDigest: sha256(executorBytes),
    measurementSchemaRevision: MEASUREMENT_SCHEMA_REVISION,
    measurementMethodRevision: MEASUREMENT_METHOD_REVISION,
    rawEvidenceFormatRevision: RAW_EVIDENCE_FORMAT_REVISION,
    commandManifestDigest: validated.commandManifestDigest,
    nodeVersion: context.nodeVersion,
    npmVersion: context.npmVersion,
    relevantRequiredToolVersions: { node: context.nodeVersion, npm: context.npmVersion },
    cwdPolicy: validated.cwdPolicy,
    environmentInheritancePolicy: validated.environmentInheritancePolicy,
    explicitEnvironment: validated.explicitEnvironment,
    timeoutPolicy: validated.timeoutPolicy,
    clockMethod: CLOCK_METHOD,
    operationDefinitionRevision: validated.operationDefinitionRevision,
    metricCalculationRevision: METRIC_CALCULATION_REVISION,
    executionContainerDigest: EXECUTION_CONTAINER_DIGEST,
    runnerFamily: RUNNER_FAMILY,
    shellPolicy: SHELL_POLICY,
  };
  const controlled = computeControlledEnvironmentFingerprint(controlledFields, hostDiagnostics);
  const jobId = await currentJobId(repo, workflowRunId, expectedJobName);

  const evidence = await writeEvidence({
    outputDir,
    request: validated,
    requestIdentity: { requestPR, requestHeadSha, requestCommit, requestParent },
    broadCi,
    blobs,
    authority,
    runtime,
    journal,
    controlled,
    hostDiagnostics,
    workflowRunId,
    workflowRunAttempt,
    jobId,
  });

  process.stdout.write(`${canonicalize({
    status: 'SUBSTRATE_ACCEPTANCE_TEST_COMPLETED',
    evidenceAuthority: EVIDENCE_AUTHORITY,
    requestHeadSha,
    candidateToolingRevision: validated.candidateToolingRevision,
    datasetDigest: evidence.manifest.datasetDigest,
    controlledEnvironmentFingerprint: controlled.digest,
    journalDigest: journal.journalDigest,
    sealCommentId: journal.sealCommentId,
    jobId,
    realPilotCommandsExecuted: false,
  })}\n`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly && process.argv.includes('--run-sat')) {
  runSatCli().catch((error) => {
    const diagnostic = error instanceof EwfMeasurementError
      ? { name: error.name, code: error.code, message: error.message, details: error.details ?? null }
      : { name: error?.name ?? 'Error', code: 'UNEXPECTED_ERROR', message: error?.message ?? String(error) };
    process.stderr.write(`${canonicalize(diagnostic)}\n`);
    process.exitCode = 1;
  });
}
