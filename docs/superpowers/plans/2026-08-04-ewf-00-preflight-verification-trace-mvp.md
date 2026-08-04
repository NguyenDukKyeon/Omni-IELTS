# EWF-00 Preflight, Verification and Trace MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the minimum repository-local adapter for read-only preflight, exact declared-command verification, `requirement → test → command → evidence` trace validation and frozen-handoff completeness without changing product behavior, canonical governance, CI or dependencies.

**Architecture:** Add one Node built-in-only adapter that imports the accepted canonicalization, digest, redaction, artifact validation and frozen-brief primitives from `scripts/ewf-artifacts.mjs`. The adapter is split into pure evaluators and injected read-only/process boundaries so all Git, filesystem, timeout, crash and overlap cases can be tested in disposable repositories without touching the user worktree. It does not discover tests, infer ownership/status, retry, install tools, mutate CI, schedule a graph or emit acceptance verdicts.

**Tech Stack:** Node.js ESM (`node >=20.19`), `node:test`, built-in `node:child_process`, `node:crypto`, `node:fs`, `node:os`, `node:path`, `node:url` and the accepted exports from `scripts/ewf-artifacts.mjs`; no new package.

## Global Constraints

- Canonical package: `EWF-00`.
- Approved bounded spec: `EWF00-PREFLIGHT-001`.
- Frozen spec subject: `0b43efac974c3fbbc489f10e9fa668bac84c9b43`.
- Documentation review: `d059aeee7d5ddf4691a1bd72628cb0bce31453fd`.
- Canonical package status remains `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- The approved implementation predecessor is the exact commit containing this plan; the following frozen authorization brief records that SHA.
- Required implementation branch: `chatgpt/ewf-00-preflight-verification-trace-mvp`.
- One writer only. Reviewers and subagents remain read-only.
- Preflight must fail closed before any implementation write.
- The adapter may read canonical package/dependency evidence only through declared entry-gate observations. It must not parse ambiguous prose to choose an owner, status, dependency result or acceptance state.
- Semantic overlap is detected only from declared semantic conflict keys and registered active change-set evidence. File names are not used to infer semantic independence.
- Verification executes only declared `argv` entries, in array order, with declared `cwd`, inherited environment keys, explicit environment values and timeout.
- `shell` is always `false`; no retry, test discovery, command expansion, auto-remediation, binary installation or initializer is permitted.
- Command result vocabulary remains exactly `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`.
- Timeout, signal termination, spawn infrastructure failure and invalid execution environment are `ERROR`. Missing executable is `NOT_AVAILABLE`.
- Required `NOT_RUN` or `NOT_AVAILABLE` blocks handoff. Optional `NOT_RUN` or `NOT_AVAILABLE` remains visible and does not become `PASS`.
- Implementer artifacts remain subordinate and may not write `ACCEPT`, package status or release-safety claims.
- Do not modify `scripts/ewf-artifacts.mjs`; reuse its accepted exports instead of copying canonicalization, digest, frozen-base validation or redaction logic.
- Do not modify existing EWF templates or `tests/ewf-artifact-contracts.test.mjs`.
- Do not modify `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/DECISIONS.md`, `.github/**`, `src/**`, `server/**`, `public/**`, `package.json` or `package-lock.json`.
- Do not install Spec Kit, fast-check, mutation tooling or any dependency.
- Do not implement either pilot from `EWF00-PILOTS-001`.
- Do not resolve or depend on the P3-02 Shadowing conflict.

---

## Authorized Implementation File Map

| Exact path | Responsibility |
|---|---|
| `scripts/ewf-preflight-trace.mjs` | Public adapter API and read-only CLI for preflight, declared verification, trace validation and extended frozen-handoff validation |
| `tests/ewf-preflight-verification-trace.test.mjs` | Disposable-repository fixtures, negative matrices, determinism, zero-write, timeout/crash, CLI-absent, redaction and rollback evidence |
| `.specify/templates/ewf/preflight-result.template.json` | Versioned subordinate output shape for content-digested preflight observations/checks |
| `.specify/templates/ewf/trace-manifest.template.json` | Versioned subordinate requirement/test/command/evidence graph shape |

The implementation allowlist is exactly the four paths above. `scripts/ewf-artifacts.mjs` is deliberately excluded: its accepted exports already provide `COMMAND_RESULTS`, `canonicalizeArtifact`, `digestArtifact`, `validateArtifact`, `validateFrozenBrief` and `redactPortableValue`. Adding new behavior there would reopen the accepted artifact-contract slice and increase the audit surface without being necessary.

## Existing Artifact Inputs Reused Without Modification

The adapter consumes these accepted artifact shapes:

- `.specify/templates/ewf/change-set.template.json` for predecessor, branch, worktree, writer, allowlist, exclusions and stop conditions;
- `.specify/templates/ewf/verification-manifest.template.json` for ordered focused/PR command declarations;
- `.specify/templates/ewf/frozen-acceptance-brief.template.json` for subject, parent, spec revision and digest identity;
- `.specify/templates/ewf/implementation-report.template.json` for later implementer evidence.

Nested verification command objects may add adapter-specific fields because the accepted base validator requires `id`, `command` and `requirements` but does not reject safe nested fields. The adapter validates the complete execution declaration before spawning anything.

## Public Module Interface

`scripts/ewf-preflight-trace.mjs` must export exactly:

```js
export const PREFLIGHT_RESULTS = Object.freeze(['PASS', 'BLOCKED']);
export const DIAGNOSTIC_SEVERITIES = Object.freeze(['ERROR', 'WARNING']);
export const TOOL_REQUIREMENTS = Object.freeze(['REQUIRED', 'OPTIONAL']);

export async function collectPreflightObservation(declaration, options = {}) {}
export function evaluatePreflight(declaration, observation, options = {}) {}
export async function runPreflight(declaration, options = {}) {}
export async function executeVerificationProfile(manifest, profile, options = {}) {}
export function validateTraceManifest(trace, bindings = {}) {}
export function validateFrozenHandoff(brief, bindings = {}) {}
```

The adapter imports rather than reimplements:

```js
import {
  COMMAND_RESULTS,
  canonicalizeArtifact,
  digestArtifact,
  validateArtifact,
  validateFrozenBrief,
  redactPortableValue
} from './ewf-artifacts.mjs';
```

Every validator/evaluator returns a deterministic envelope:

```js
{
  valid: boolean,
  result: 'PASS' | 'BLOCKED' | null,
  errors: [{ severity: 'ERROR', code, path, message }],
  warnings: [{ severity: 'WARNING', code, path, message }],
  normalized: object | null,
  digest: string | null
}
```

Diagnostics are sorted by `severity`, then `code`, then `path`, then `message`. No function returns `ACCEPT`, `REJECT`, package status or release safety.

## CLI Interface

The CLI is a thin JSON/stdout adapter over the exported functions:

```text
node scripts/ewf-preflight-trace.mjs preflight --change-set <file> --registry <file> --writer <identity>
node scripts/ewf-preflight-trace.mjs verify --manifest <file> --profile focused|pr
node scripts/ewf-preflight-trace.mjs trace --trace <file> --bindings <file>
node scripts/ewf-preflight-trace.mjs brief --brief <file> --bindings <file>
```

Rules:

- `preflight`, `trace` and `brief` are read-only and emit one redacted JSON envelope to stdout.
- `verify` only spawns commands explicitly present in the selected profile. The adapter itself writes no repository file; any command side effect is the declared command's behavior and remains subject to the approved profile.
- Unsupported modes or incomplete arguments exit `2` and write no file.
- A validation/preflight block exits `1`.
- Successful validation/preflight exits `0`.
- The CLI never invokes `specify`, never initializes `.specify`, never installs a tool and never edits Git refs.

## Change-set Extension Contract

The accepted change-set fields remain unchanged. `extensions` must contain:

```json
{
  "repositoryIdentity": "NguyenDukKyeon/VocabMaster",
  "remoteName": "origin",
  "canonicalFiles": [
    "AGENTS.md",
    "docs/ROADMAP.md",
    "docs/IMPLEMENTATION_PLAN.md",
    "docs/IMPLEMENTATION_STATUS.md",
    "docs/DECISIONS.md"
  ],
  "semanticConflictKeys": [
    "ewf:preflight-observation",
    "ewf:verification-execution",
    "ewf:trace-validation",
    "ewf:frozen-handoff-validation"
  ],
  "entryGates": [
    {
      "id": "EWF-00-status",
      "sourcePath": "docs/IMPLEMENTATION_STATUS.md",
      "expectedLiteral": "PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED",
      "required": true
    }
  ]
}
```

`entryGates` use exact declared literals. The adapter reads the declared source path and checks that literal; it does not interpret conflicting prose or choose a status. A missing source, absent literal, duplicate gate ID or contradictory declared gate is an error.

The active registry input is an array of registered change-set observations:

```json
[
  {
    "id": "EWF00-PREFLIGHT-001",
    "active": true,
    "writerIdentity": "writer-a",
    "worktreePath": ".worktrees/ewf-preflight",
    "allowlist": ["scripts/ewf-preflight-trace.mjs"],
    "semanticConflictKeys": ["ewf:preflight-observation"]
  }
]
```

The registry must be supplied even when it contains only the current change set. Absence is `ACTIVE_CHANGE_REGISTRY_MISSING`; the adapter must not assume that no other writer exists.

## Read-only Repository Observation

`collectPreflightObservation()` may execute only these read-only Git commands, with `shell: false`:

```text
git rev-parse --show-toplevel
git rev-parse HEAD
git rev-parse HEAD^
git symbolic-ref --quiet --short HEAD
git status --porcelain=v1 -z --untracked-files=all
git worktree list --porcelain
git remote get-url <declared remoteName>
```

It may use `realpath`, `readFile` and `stat` on declared paths. It must not execute `fetch`, `pull`, `checkout`, `switch`, `reset`, `clean`, `stash`, `rebase`, `commit`, `add`, `update-ref`, initializer or write commands.

Repository identity normalization accepts only the declared GitHub owner/repository from HTTPS or SSH origin forms. A missing or different remote is a blocking mismatch.

The current writer identity is supplied explicitly through `options.writerIdentity` or `--writer`; environment username, Git author or process owner is never inferred as the writer.

## Preflight Result Schema

`.specify/templates/ewf/preflight-result.template.json` freezes this shape:

```json
{
  "schemaVersion": 1,
  "artifactKind": "preflight-result",
  "authorityLabel": "READ_ONLY_PREFLIGHT / NOT_AUTHORIZATION",
  "specId": "EWF00-PREFLIGHT-001",
  "result": "BLOCKED",
  "declarationDigest": "0000000000000000000000000000000000000000000000000000000000000000",
  "observedAt": "2026-08-04T00:00:00.000Z",
  "repository": {
    "identity": "NguyenDukKyeon/VocabMaster",
    "head": "0000000000000000000000000000000000000000",
    "parent": "0000000000000000000000000000000000000000",
    "branch": "chatgpt/example",
    "worktree": "[REDACTED_ABSOLUTE_PATH]",
    "writer": "single-writer"
  },
  "checks": [
    {
      "id": "exact-head",
      "result": "ERROR",
      "evidence": ["HEAD differs from the approved predecessor."]
    }
  ],
  "diagnostics": [
    {
      "severity": "ERROR",
      "code": "HEAD_MISMATCH",
      "path": "$.repository.head",
      "message": "Observed HEAD differs from the approved predecessor."
    }
  ],
  "extensions": {
    "zeroWrite": true
  },
  "contentDigest": "0000000000000000000000000000000000000000000000000000000000000000"
}
```

`contentDigest` equals `digestArtifact(preflightResult without the top-level contentDigest field)`. The output is passed through `redactPortableValue()` before portable serialization. Tests inject a fixed clock; production observations record actual UTC time.

## Verification Manifest Execution Fields

Each command entry in the accepted verification manifest must include:

```json
{
  "id": "ewf-preflight-focused",
  "command": "node --test tests/ewf-preflight-verification-trace.test.mjs",
  "requirements": ["EWF00-PVT-01"],
  "argv": ["node", "--test", "tests/ewf-preflight-verification-trace.test.mjs"],
  "cwd": ".",
  "inheritEnvironment": ["PATH", "SYSTEMROOT", "TEMP", "TMP"],
  "environment": {},
  "timeoutMs": 120000,
  "toolRequirement": "REQUIRED"
}
```

Validation rules:

- `argv` is a non-empty string array; element zero is the executable.
- `cwd` resolves inside the observed repository root.
- `inheritEnvironment` contains unique non-empty keys.
- explicit `environment` values are strings and override inherited keys.
- `timeoutMs` is a positive safe integer.
- `toolRequirement` is exactly `REQUIRED` or `OPTIONAL`.
- profile array order is execution order.
- the executor uses `spawn(argv[0], argv.slice(1), { shell: false, cwd, env })`.
- there is exactly one execution attempt per command.

Each command result is:

```js
{
  id,
  command,
  argv,
  cwd,
  required: boolean,
  result: 'PASS' | 'FAIL' | 'ERROR' | 'NOT_RUN' | 'NOT_AVAILABLE',
  startedAt,
  endedAt,
  durationMs,
  exitCode,
  signal,
  environmentDigest,
  stdoutDigest,
  stderrDigest,
  diagnostics: []
}
```

Classification:

- exit code `0` → `PASS`;
- non-zero normal exit → `FAIL`;
- executable `ENOENT` → `NOT_AVAILABLE`;
- timeout → `ERROR` with `COMMAND_TIMEOUT`;
- signal termination → `ERROR` with `COMMAND_CRASH`;
- other spawn/infrastructure failure → `ERROR` with `COMMAND_INFRASTRUCTURE_ERROR`;
- declared but deliberately not executed → `NOT_RUN`.

Raw stdout/stderr are not included in portable results. Their UTF-8 content digests are recorded; any optional diagnostic excerpt must be passed through `redactPortableValue()`.

## Trace Manifest Schema

`.specify/templates/ewf/trace-manifest.template.json` freezes:

```json
{
  "schemaVersion": 1,
  "artifactKind": "trace-manifest",
  "authorityLabel": "IMPLEMENTER_TRACE / NOT_ACCEPTANCE",
  "specId": "EWF00-PREFLIGHT-001",
  "subjectCommit": "1111111111111111111111111111111111111111",
  "parentCommit": "0000000000000000000000000000000000000000",
  "specRevision": "0b43efac974c3fbbc489f10e9fa668bac84c9b43",
  "requirements": [
    {
      "id": "EWF00-PVT-01",
      "required": true,
      "planTasks": ["Task 2"],
      "tests": ["preflight-wrong-head"]
    }
  ],
  "tests": [
    {
      "id": "preflight-wrong-head",
      "scope": "LOCAL",
      "rationale": "Directly proves fail-before-write on an exact HEAD mismatch.",
      "commands": ["ewf-preflight-focused"]
    }
  ],
  "commands": [
    {
      "id": "ewf-preflight-focused",
      "profile": "focused",
      "required": true,
      "evidence": ["focused-result"]
    }
  ],
  "evidence": [
    {
      "id": "focused-result",
      "commandId": "ewf-preflight-focused",
      "subjectCommit": "1111111111111111111111111111111111111111",
      "result": "PASS",
      "environmentDigest": "1111111111111111111111111111111111111111111111111111111111111111",
      "contentDigest": "2222222222222222222222222222222222222222222222222222222222222222"
    }
  ],
  "extensions": {}
}
```

IDs are unique within their own namespaces. Every required requirement reaches at least one test, every test reaches at least one command and every required command reaches at least one evidence record. `SHARED` tests require a non-empty boundary rationale; tests outside this spec are not scanned and are not treated as orphans.

## Extended Frozen Handoff Bindings

`validateFrozenHandoff()` first calls accepted `validateFrozenBrief()` and then validates these exact values under `brief.extensions`:

```json
{
  "canonicalPackageId": "EWF-00",
  "allowlist": [
    ".specify/templates/ewf/preflight-result.template.json",
    ".specify/templates/ewf/trace-manifest.template.json",
    "scripts/ewf-preflight-trace.mjs",
    "tests/ewf-preflight-verification-trace.test.mjs"
  ],
  "exclusions": ["... frozen authorization exclusions ..."],
  "requiredCommandIds": ["... exact focused and PR command IDs ..."]
}
```

The function receives bindings containing actual changed files, exclusions, trace manifest, command results and expected package/spec identity. It rejects:

- base frozen-brief identity mismatch;
- allowlist or exclusion mismatch;
- changed file outside allowlist;
- missing required command result;
- required result other than `PASS`;
- evidence/trace digest mismatch;
- incomplete trace;
- any implementer-supplied verdict field.

It returns `BLOCKED_BY_INVALID_BRIEF` semantics only. It never returns `ACCEPT`.

## Typed Diagnostic Codes

The implementation must preserve these codes where applicable.

### Preflight

- `ACTIVE_CHANGE_REGISTRY_MISSING`
- `REPOSITORY_IDENTITY_MISMATCH`
- `REPOSITORY_ROOT_MISMATCH`
- `CANONICAL_FILE_MISSING`
- `HEAD_MISMATCH`
- `PARENT_OBSERVATION_MISMATCH`
- `BRANCH_MISMATCH`
- `WORKTREE_MISMATCH`
- `DIRTY_WORKTREE`
- `WRITER_UNDECLARED`
- `WRITER_MISMATCH`
- `FILE_OVERLAP`
- `SEMANTIC_OVERLAP`
- `CANONICAL_ENTRY_GATE_MISMATCH`
- `ALLOWLIST_INCOMPLETE`
- `EXCLUSION_CONFLICT`
- `PREFLIGHT_OBSERVATION_ERROR`

### Verification

- `INVALID_COMMAND_DECLARATION`
- `COMMAND_NOT_AVAILABLE`
- `COMMAND_TIMEOUT`
- `COMMAND_CRASH`
- `COMMAND_EXIT_FAILURE`
- `COMMAND_INFRASTRUCTURE_ERROR`
- `COMMAND_CWD_OUTSIDE_REPOSITORY`

### Trace

- `DUPLICATE_REQUIREMENT_ID`
- `DUPLICATE_TEST_ID`
- `DUPLICATE_COMMAND_ID`
- `DUPLICATE_EVIDENCE_ID`
- `BROKEN_TEST_REFERENCE`
- `BROKEN_COMMAND_REFERENCE`
- `BROKEN_EVIDENCE_REFERENCE`
- `SHARED_RATIONALE_REQUIRED`
- `REQUIRED_COMMAND_RESULT_MISSING`
- `REQUIRED_EVIDENCE_MISSING`
- `SUBJECT_BINDING_MISMATCH`
- `EVIDENCE_DIGEST_MISMATCH`
- `ENVIRONMENT_DIGEST_MISMATCH`
- `TRACE_DIGEST_MISMATCH`

### Frozen handoff

- accepted base brief diagnostics from `validateFrozenBrief()`;
- `CANONICAL_PACKAGE_BINDING_MISMATCH`
- `ALLOWLIST_BINDING_MISMATCH`
- `EXCLUSIONS_BINDING_MISMATCH`
- `CHANGED_FILE_OUTSIDE_ALLOWLIST`
- `REQUIRED_RESULT_NOT_PASS`
- `IMPLEMENTER_VERDICT_FORBIDDEN`

## Zero-write Guarantee

The adapter must not call any filesystem write API in `preflight`, `trace` or `brief` paths. `runPreflight()` returns an in-memory object and stdout serialization only. The first repository mutation remains an external action permitted only after `result === 'PASS'`.

Every preflight negative test:

1. creates a disposable Git repository under `mkdtemp()`;
2. records a snapshot of tracked files, untracked files, HEAD, refs and worktree status;
3. invokes preflight;
4. asserts the blocking diagnostic;
5. asserts the snapshot is unchanged;
6. removes the disposable directory in `finally`.

No fixture changes branch, index, refs or files in the user's repository.

## Semantic-overlap Rule

Overlap is mechanical intersection over declared evidence only:

```js
fileOverlap = intersection(current.allowlist, active.allowlist);
semanticOverlap = intersection(
  current.extensions.semanticConflictKeys,
  active.semanticConflictKeys
);
```

An active record with a different writer and either non-empty intersection blocks preflight. Empty intersections do not authorize independence when required declarations are missing; missing semantic keys or registry evidence fail closed. The adapter never derives package ownership or semantic keys from paths, imports, commit history or prose.

## Requirement Coverage

| Requirement | Plan coverage |
|---|---|
| `EWF00-PVT-01` | Task 2 exact repository/root/HEAD/parent/branch/worktree checks and zero-write fixtures |
| `EWF00-PVT-02` | Task 2 dirty tree, explicit writer identity and declared file/semantic overlap |
| `EWF00-PVT-03` | Task 2 exact-literal canonical entry gates with no status mutation/inference |
| `EWF00-PVT-04` | Task 3 exact ordered `argv`, `shell:false`, one attempt, no discovery/retry/install |
| `EWF00-PVT-05` | Task 3 five-state results, environment/time/output digests |
| `EWF00-PVT-06` | Task 4 duplicate IDs, broken refs, required result/evidence and digest checks |
| `EWF00-PVT-07` | Task 4 explicit `SHARED` rationale and no repository-wide orphan scan |
| `EWF00-PVT-08` | Task 5 accepted base brief plus allowlist/exclusion/required-result checks, no verdict |
| `EWF00-PVT-09` | Task 5 PATH-without-Spec-Kit fixture for every core mode |
| `EWF00-PVT-10` | Tasks 1, 2 and 4 stable normalization and diagnostic ordering |
| `EWF00-PVT-11` | Tasks 2, 3 and 5 reuse accepted portable redaction for paths/secrets/env |
| `EWF00-PVT-12` | Four-file allowlist, read-only Git commands, no dependency/CI/runtime/scheduler |

## Mandatory Negative Fixture Matrix

| Fixture | Expected typed result |
|---|---|
| Wrong HEAD | `BLOCKED`; `HEAD_MISMATCH`; zero writes |
| Changed parent/ref assumption | `BLOCKED`; `PARENT_OBSERVATION_MISMATCH`; zero writes |
| Dirty tracked or untracked file | `BLOCKED`; `DIRTY_WORKTREE`; zero writes |
| Wrong repository remote identity | `BLOCKED`; `REPOSITORY_IDENTITY_MISMATCH`; zero writes |
| Wrong repository root/worktree | `BLOCKED`; `REPOSITORY_ROOT_MISMATCH` or `WORKTREE_MISMATCH`; zero writes |
| Missing current writer identity | `BLOCKED`; `WRITER_UNDECLARED`; zero writes |
| Current writer differs from declaration | `BLOCKED`; `WRITER_MISMATCH`; zero writes |
| Active writer shares exact file | `BLOCKED`; `FILE_OVERLAP`; zero writes |
| Active writer shares semantic conflict key with different files | `BLOCKED`; `SEMANTIC_OVERLAP`; zero writes |
| Missing active registry | `BLOCKED`; `ACTIVE_CHANGE_REGISTRY_MISSING`; zero writes |
| Broken canonical entry literal | `BLOCKED`; `CANONICAL_ENTRY_GATE_MISMATCH`; zero writes |
| Missing canonical source file | `BLOCKED`; `CANONICAL_FILE_MISSING`; zero writes |
| Duplicate requirement IDs | trace invalid; `DUPLICATE_REQUIREMENT_ID` |
| Duplicate test IDs | trace invalid; `DUPLICATE_TEST_ID` |
| Broken requirement→test reference | trace invalid; `BROKEN_TEST_REFERENCE` |
| Broken test→command reference | trace invalid; `BROKEN_COMMAND_REFERENCE` |
| Broken command→evidence reference | trace invalid; `BROKEN_EVIDENCE_REFERENCE` |
| Shared test without rationale | trace invalid or warning as frozen by requirement; `SHARED_RATIONALE_REQUIRED` |
| Missing required command result | trace/brief invalid; `REQUIRED_COMMAND_RESULT_MISSING` |
| Missing required evidence | trace/brief invalid; `REQUIRED_EVIDENCE_MISSING` |
| Evidence bound to another subject | trace/brief invalid; `SUBJECT_BINDING_MISMATCH` |
| Evidence/environment/content digest mismatch | trace/brief invalid with exact digest diagnostic |
| Wrong brief subject/parent/spec revision/trace/evidence/brief digest | `BLOCKED_BY_INVALID_BRIEF`; never `ACCEPT` |
| Optional executable absent | command `NOT_AVAILABLE`; visible warning; does not block unless referenced as required |
| Required executable absent | command `NOT_AVAILABLE`; handoff blocked |
| Command normal non-zero exit | `FAIL` |
| Command timeout | `ERROR`; `COMMAND_TIMEOUT`; one attempt |
| Command killed by signal or crash fixture | `ERROR`; `COMMAND_CRASH`; one attempt |
| Other spawn failure | `ERROR`; `COMMAND_INFRASTRUCTURE_ERROR` |
| Spec Kit executable absent from PATH | preflight, verify of Node-only command, trace and brief modes remain operational |
| Same normalized invalid input twice | byte-identical diagnostics/digest with injected fixed clock |
| Secret-shaped env and Windows/POSIX private paths | portable output contains accepted redaction markers, not original values |
| Remove only four adapter files in disposable copy | existing `ewf-artifacts --check` and manual package command declarations remain intact |

---

### Task 1: Freeze adapter templates and deterministic validation foundation

**Files:**
- Create: `.specify/templates/ewf/preflight-result.template.json`
- Create: `.specify/templates/ewf/trace-manifest.template.json`
- Create: `scripts/ewf-preflight-trace.mjs`
- Create: `tests/ewf-preflight-verification-trace.test.mjs`

**Interfaces:**
- Consumes: accepted EWF exports listed in the Public Module Interface.
- Produces: exported constants/functions with deterministic diagnostics; template loaders used by all later tasks.

- [ ] **Step 1: Write failing template and export tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const preflightTemplate = JSON.parse(await readFile(
  new URL('../.specify/templates/ewf/preflight-result.template.json', import.meta.url)
));
const traceTemplate = JSON.parse(await readFile(
  new URL('../.specify/templates/ewf/trace-manifest.template.json', import.meta.url)
));

test('new EWF templates are versioned, typed and subordinate', () => {
  assert.equal(preflightTemplate.schemaVersion, 1);
  assert.equal(preflightTemplate.artifactKind, 'preflight-result');
  assert.equal(preflightTemplate.authorityLabel, 'READ_ONLY_PREFLIGHT / NOT_AUTHORIZATION');
  assert.equal(traceTemplate.schemaVersion, 1);
  assert.equal(traceTemplate.artifactKind, 'trace-manifest');
  assert.equal(traceTemplate.authorityLabel, 'IMPLEMENTER_TRACE / NOT_ACCEPTANCE');
});

test('adapter exports the frozen public interface', async () => {
  const adapter = await import('../scripts/ewf-preflight-trace.mjs');
  assert.deepEqual(adapter.PREFLIGHT_RESULTS, ['PASS', 'BLOCKED']);
  assert.deepEqual(adapter.DIAGNOSTIC_SEVERITIES, ['ERROR', 'WARNING']);
  assert.deepEqual(adapter.TOOL_REQUIREMENTS, ['REQUIRED', 'OPTIONAL']);
  for (const name of [
    'collectPreflightObservation',
    'evaluatePreflight',
    'runPreflight',
    'executeVerificationProfile',
    'validateTraceManifest',
    'validateFrozenHandoff'
  ]) assert.equal(typeof adapter[name], 'function', name);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
```

Expected: non-zero exit because templates/module do not exist.

- [ ] **Step 3: Create the exact two templates and minimal exported scaffolding**

Implement constants, imported accepted primitives, deterministic `diagnostic()` and `sortDiagnostics()` helpers, strict JSON normalization via imported `canonicalizeArtifact()` and placeholder function bodies that return typed invalid envelopes rather than throwing untyped errors.

- [ ] **Step 4: Add tests proving no duplicate canonicalization/redaction implementation**

Read `scripts/ewf-preflight-trace.mjs` and assert it imports the five accepted helpers and does not import `node:crypto` or define another SHA/redaction implementation.

- [ ] **Step 5: Run focused tests**

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
```

Expected: template/export/import-boundary tests pass and accepted artifact check remains green.

- [ ] **Step 6: Commit**

```powershell
git add .specify/templates/ewf/preflight-result.template.json .specify/templates/ewf/trace-manifest.template.json scripts/ewf-preflight-trace.mjs tests/ewf-preflight-verification-trace.test.mjs
git commit -m "feat(ewf): add preflight trace contracts"
```

---

### Task 2: Implement fail-before-write repository preflight

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Modify: `tests/ewf-preflight-verification-trace.test.mjs`

**Interfaces:**
- Consumes: accepted change-set artifact plus explicit active registry/current writer.
- Produces: `collectPreflightObservation()`, pure `evaluatePreflight()` and orchestration `runPreflight()`.

- [ ] **Step 1: Add disposable Git repository helpers**

Use `mkdtemp(join(tmpdir(), 'ewf-preflight-'))`, `spawnSync('git', ..., { shell: false })`, synthetic files and `finally { rm(tempRoot, { recursive: true, force: true }) }`. Configure local fixture author only inside the disposable repository. Never invoke Git mutation against `repositoryRoot`.

- [ ] **Step 2: Write RED tests for exact identity failures**

Add separate tests for wrong HEAD, parent mismatch, wrong origin repository, wrong root/worktree, wrong branch, dirty tracked file and untracked file. Each test records a preflight snapshot before and after and asserts exact equality.

Representative assertion:

```js
const result = await runPreflight(declaration, {
  cwd: fixture.worktree,
  writerIdentity: 'writer-a',
  activeChangeSets: [fixture.currentRegistryEntry],
  clock: () => '2026-08-04T00:00:00.000Z'
});
assert.equal(result.result, 'BLOCKED');
assert.ok(result.errors.some(({ code }) => code === 'HEAD_MISMATCH'));
assert.deepEqual(await snapshotRepository(fixture.worktree), before);
```

- [ ] **Step 3: Write RED tests for writer, overlap and entry gates**

Cover missing registry, absent writer, writer mismatch, exact file overlap, semantic overlap with disjoint files, missing semantic declarations, missing canonical file and broken exact-literal entry gate.

- [ ] **Step 4: Implement read-only observation collection**

Run only the approved Git commands. Normalize remote identity, resolve/compare paths, parse porcelain status/worktree output and read declared canonical sources. Convert all command/read failures into `PREFLIGHT_OBSERVATION_ERROR` rather than mutating or repairing state.

- [ ] **Step 5: Implement pure preflight evaluation**

Validate the base change-set using `validateArtifact('change-set', declaration)`. Evaluate every check, include explicit evidence, sort diagnostics and set `result` to `PASS` only when there are zero errors. Compute `declarationDigest` from the normalized declaration and `contentDigest` from the projected result.

- [ ] **Step 6: Prove deterministic output**

Call `evaluatePreflight()` twice with deep-cloned logically equal observations whose object keys are in different orders and a fixed clock. Assert equal canonical JSON and equal digest.

- [ ] **Step 7: Run focused tests twice**

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node --test tests/ewf-preflight-verification-trace.test.mjs
```

Expected: identical test count, all identity/overlap/zero-write cases pass twice.

- [ ] **Step 8: Commit**

```powershell
git add scripts/ewf-preflight-trace.mjs tests/ewf-preflight-verification-trace.test.mjs
git commit -m "feat(ewf): enforce read-only preflight"
```

---

### Task 3: Execute exact declared verification profiles

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Modify: `tests/ewf-preflight-verification-trace.test.mjs`

**Interfaces:**
- Consumes: accepted verification manifest with the frozen nested execution fields.
- Produces: ordered command-result array with exact five-state classification and digests.

- [ ] **Step 1: Write RED declaration validation tests**

Reject empty `argv`, `cwd` outside repository, duplicate environment keys, non-string environment values, invalid timeout and undeclared tool requirement before spawning any child.

- [ ] **Step 2: Write RED ordered-execution and no-retry tests**

Create disposable Node fixture scripts that append their command ID to a temp file. Declare two commands and assert array order equals file order. Create a failing fixture that increments a counter and assert the counter is exactly `1`.

- [ ] **Step 3: Write RED five-state tests**

Use disposable fixture executables/scripts to prove:

- exit `0` → `PASS`;
- exit `7` → `FAIL`;
- nonexistent optional executable → `NOT_AVAILABLE` warning;
- nonexistent required executable → `NOT_AVAILABLE` blocking evidence;
- child exceeding `timeoutMs` → `ERROR`/`COMMAND_TIMEOUT`;
- child self-terminating by signal where supported, or injected signal close event on Windows → `ERROR`/`COMMAND_CRASH`;
- injected spawn infrastructure error → `ERROR`/`COMMAND_INFRASTRUCTURE_ERROR`.

- [ ] **Step 4: Implement strict command normalization**

Validate the base verification manifest with `validateArtifact('verification-manifest', manifest)`, then validate adapter fields. Build environment only from explicitly inherited keys plus declared values. Resolve `cwd` under repository root and reject escape.

- [ ] **Step 5: Implement one-attempt process execution**

Use injected `spawnImpl` defaulting to Node `spawn`; `shell:false`; one timer; one child; bounded listener cleanup. Do not retry on any result. Capture stdout/stderr in memory for digesting and redact any returned excerpt.

- [ ] **Step 6: Prove command identity and portable evidence**

Assert result records exact `argv`, declared command label, normalized relative `cwd`, environment digest, duration, exit/signal and stdout/stderr digests. Secret environment values and private absolute paths must not appear in the portable result.

- [ ] **Step 7: Run focused tests**

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
```

- [ ] **Step 8: Commit**

```powershell
git add scripts/ewf-preflight-trace.mjs tests/ewf-preflight-verification-trace.test.mjs
git commit -m "feat(ewf): run declared verification profiles"
```

---

### Task 4: Validate requirement-to-evidence trace

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Modify: `tests/ewf-preflight-verification-trace.test.mjs`

**Interfaces:**
- Consumes: trace manifest, verification manifest/results and exact subject bindings.
- Produces: deterministic trace validation envelope and trace digest; no graph scheduler.

- [ ] **Step 1: Write RED duplicate-ID tests**

Create one fixture per namespace and assert exact diagnostics for duplicate requirement, test, command and evidence IDs.

- [ ] **Step 2: Write RED broken-reference tests**

Independently break requirement→test, test→command and command→evidence references. Assert all defects are reported in deterministic sorted order, not fail-fast after the first defect.

- [ ] **Step 3: Write RED required evidence/binding tests**

Cover missing required result, required `NOT_RUN`, required `NOT_AVAILABLE`, missing evidence, wrong evidence command, wrong subject commit, environment digest mismatch and content digest mismatch.

- [ ] **Step 4: Write RED shared-test semantics tests**

A `SHARED` test without rationale must produce `SHARED_RATIONALE_REQUIRED`. A shared test with explicit boundary behavior and command mapping passes. Do not scan unrelated repository tests or require them in the manifest.

- [ ] **Step 5: Implement strict trace normalization and traversal**

Validate shape, build four ID maps, report duplicate IDs, traverse only declared edges, check bindings/digests and preserve warnings. Use imported canonicalization/digest. Do not build a DAG executor or infer plan ownership.

- [ ] **Step 6: Add full `EWF00-PVT-01` through `EWF00-PVT-12` trace fixture**

The fixture contains all twelve requirement IDs exactly once and maps each to named tests, exact focused/PR command IDs and synthetic evidence. Assert no gap and stable trace digest.

- [ ] **Step 7: Run focused tests twice**

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node --test tests/ewf-preflight-verification-trace.test.mjs
```

Expected: identical diagnostic ordering and digest.

- [ ] **Step 8: Commit**

```powershell
git add scripts/ewf-preflight-trace.mjs tests/ewf-preflight-verification-trace.test.mjs
git commit -m "feat(ewf): validate requirement evidence trace"
```

---

### Task 5: Bind frozen handoff, CLI-absent operation, redaction and rollback

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Modify: `tests/ewf-preflight-verification-trace.test.mjs`

**Interfaces:**
- Consumes: accepted frozen brief plus exact package/allowlist/exclusion/command/trace bindings.
- Produces: final identity/completeness validation and read-only CLI; never acceptance.

- [ ] **Step 1: Write RED base and extended brief mismatch matrix**

Start from a valid synthetic brief. Mutate one field at a time: subject, parent, spec revision, trace digest, evidence digest, brief identity, brief digest, canonical package, allowlist, exclusions, changed files and required command results. Every mutation must invalidate the handoff; result must never contain `ACCEPT`.

- [ ] **Step 2: Implement `validateFrozenHandoff()`**

Call accepted `validateFrozenBrief()` first. Validate extended bindings under `extensions`, exact changed-file containment, trace validity/digest and required command results. Reject any `auditResult`, `verdict`, `acceptance` or package-status field supplied by implementer evidence.

- [ ] **Step 3: Write and implement CLI tests**

Exercise all four modes with disposable JSON files. Assert stdout is one JSON envelope, exit codes are exact, unsupported/missing arguments exit `2`, and no mode writes files or refs.

- [ ] **Step 4: Prove Spec Kit absence**

Run preflight, a Node-only verification command, trace and brief modes with PATH containing Node/Git shims but no `specify` executable. Assert core functions operate and no initializer path is attempted.

- [ ] **Step 5: Prove portable redaction**

Use secret-shaped environment fields, URL credentials, Windows `C:\\Users\\...`, POSIX `/home/...`, `/Users/...`, `/mnt/data/...` and safe repository-relative paths. Assert accepted redaction markers and preservation of stable IDs/relative paths.

- [ ] **Step 6: Prove rollback to manual commands in a disposable copy**

Create a temp repository copy containing the accepted artifact bridge/templates/script, `package.json` and the four adapter files. Remove only the four adapter files inside the disposable copy. Assert:

```powershell
node scripts/ewf-artifacts.mjs --check
```

still exits `0`; `package.json` still declares `test`, `check`, `audit:roadmap` and `build`; no canonical or product file changes. Do not delete files in the implementation worktree.

- [ ] **Step 7: Run the frozen focused profile**

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

All commands are required. No extra focused command is added because the Node test suite directly exercises every CLI mode and both new templates, while the accepted artifact `--check` protects the reused base contracts.

- [ ] **Step 8: Run the frozen PR profile**

```powershell
npm test
npm run check
npm run audit:roadmap
npm run build
```

Record actual environment, duration, exit code and five-state result. Do not install missing dependencies. A missing required tool is `NOT_AVAILABLE`, not pass.

- [ ] **Step 9: Review exact implementation diff**

Verify the implementation subject changes exactly the four authorized paths, contains no dependency/CI/canonical/product change, no generated evidence file and no audit verdict.

- [ ] **Step 10: Commit final implementation subject**

```powershell
git add scripts/ewf-preflight-trace.mjs tests/ewf-preflight-verification-trace.test.mjs
git commit -m "test(ewf): verify preflight trace degradation"
```

The exact commit created here is the implementation subject. Do not add evidence files to this commit.

---

## Frozen Verification Profiles

### Focused

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

### PR

```powershell
npm test
npm run check
npm run audit:roadmap
npm run build
```

No CI workflow change is authorized. Existing PR CI may run broader repository checks, but the adapter must neither discover nor add them.

## Acceptance Criteria

1. Preflight validates declared repository identity, exact HEAD/parent, branch/worktree, clean state, explicit writer, active registry, file/semantic overlap, canonical files, exact-literal entry gates, allowlist and exclusions before any write.
2. Every failed preflight fixture proves zero tracked/untracked/ref/worktree mutation in a disposable repository.
3. Semantic overlap depends only on declared conflict keys and active registration; no ownership or independence inference occurs.
4. Verification validates and executes exact declared `argv` in profile order with declared cwd/environment/time budget, `shell:false`, one attempt and no discovery/retry/install.
5. Command outcomes preserve exactly the five accepted values; timeout/crash/infrastructure are `ERROR`, missing executable is `NOT_AVAILABLE`, normal non-zero is `FAIL`.
6. Command evidence binds environment, duration, exit/signal and stdout/stderr digests with portable redaction.
7. Trace validation detects duplicate requirement/test/command/evidence IDs, broken edges, missing required result/evidence, shared-rationale gaps and subject/environment/content/digest mismatch.
8. The complete trace covers `EWF00-PVT-01` through `EWF00-PVT-12` exactly once.
9. Frozen-handoff validation checks base subject/parent/spec/trace/evidence/brief identity plus package, allowlist, exclusions, changed files and required results; it never emits `ACCEPT`.
10. Preflight, Node-only verification, trace and brief operation remain available when Spec Kit CLI is absent.
11. Diagnostics and digests are deterministic for equal normalized inputs; secrets and machine-private absolute paths are redacted while stable IDs/relative paths remain.
12. Removing only the four adapter files in a disposable copy restores the accepted manual artifact/canonical command workflow; no product, canonical, CI, dependency, manifest or lockfile is changed.

Passing these criteria makes only `EWF00-PREFLIGHT-001` eligible for independent exact-head audit. It does not accept EWF-00 and does not authorize either pilot.

## Stop Conditions

Stop before writing or abandon the implementation subject if any condition is true:

- HEAD is not the exact predecessor recorded by the frozen authorization brief.
- Branch is not `chatgpt/ewf-00-preflight-verification-trace-mvp`.
- Worktree is dirty before the first write.
- Repository identity, writer or active change registry is missing/mismatched.
- Another active writer overlaps any exact allowlist file or declared semantic conflict key.
- Canonical EWF-00 status/dependency evidence conflicts or cannot be checked by exact declared evidence.
- Any required implementation file falls outside the four-path allowlist.
- Implementation requires modifying `scripts/ewf-artifacts.mjs`, an existing template or the accepted artifact test.
- Implementation requires canonical docs, product source, package manifest, lockfile, CI or dependency changes.
- Implementation would parse prose to select package ownership, status, dependency satisfaction or acceptance.
- Implementation would infer semantic independence instead of using declared evidence.
- Implementation would add automatic test discovery, retry, remediation, initializer, scheduler, queue, DAG, daemon, dashboard or workflow server.
- Implementation would install or auto-download a tool/binary.
- Implementation would write an acceptance verdict or package/status mutation.
- P3-02 Shadowing conflict or either EWF pilot enters the change.

## Evidence-only Revision and Independent Audit Topology

After the final implementation subject and existing CI are green:

1. Freeze the exact implementation subject and parent; do not amend or add evidence to that subject.
2. Obtain a separate evidence-only revision authorization.
3. That later authorization may create only:

```text
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/implementation-report.json
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/requirement-trace.json
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/frozen-acceptance-brief.json
```

4. Bind subject, parent, spec revision, trace digest, evidence digest, brief digest, exact implementation allowlist/exclusions and required command results.
5. Use the accepted digest projection:
   - `traceDigest = digestArtifact(requirement-trace.json)`;
   - `evidenceDigest = digestArtifact(implementation-report.json with top-level frozenBriefDigest omitted)`;
   - `briefDigest = digestArtifact(frozen brief with top-level briefDigest omitted)`;
   - set report `frozenBriefDigest` to `briefDigest`.
6. Keep authority label `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`; the implementer writes no `ACCEPT`.
7. Run CI on the evidence HEAD.
8. A separate read-only auditor checks the exact frozen subject/evidence bindings, reruns required gates and owns the verdict.
9. Merge only after the independent verdict is `ACCEPT`.

Even an accepted and merged `EWF00-PREFLIGHT-001` leaves EWF-00 `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` until the separately authorized pilots and package-level audit are complete.
