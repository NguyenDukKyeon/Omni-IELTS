# EWF-00 Artifact Contracts MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the minimum repository-local EWF artifact contracts without changing product behavior, canonical governance, CI or dependencies.

**Architecture:** Add a small Node built-in-only artifact module and JSON templates under `.specify/`. The module validates subordinate metadata, preserves authority separation and produces deterministic canonical JSON/digests. It does not execute workflows, discover tests, run commands, inspect Git worktrees or issue acceptance verdicts.

**Tech Stack:** Node.js ESM (`node >=20.19`), `node:test`, built-in `node:crypto`, `node:fs` and `node:path`; no new package.

## Global Constraints

- Canonical package: `EWF-00`.
- Approved spec: `EWF00-ARTIFACTS-001`.
- Exact predecessor is supplied by the separate frozen authorization brief.
- Do not modify `src/**`, `server/**`, `public/**`, `.github/**`, `package.json`, `package-lock.json` or canonical governance documents.
- Do not install Spec Kit, fast-check, a JSON-schema package or any other dependency.
- Do not implement Git/worktree preflight, command execution, trace traversal, pilots, CI integration, retry, scheduler, daemon or dashboard behavior.
- EWF artifacts are subordinate. They never infer or write package status, acceptance or release safety.
- All portable output must redact secrets and machine-absolute private paths.

---

## File map

| Path | Responsibility |
|---|---|
| `.specify/memory/constitution.md` | Minimal bridge linking the five canonical authority files |
| `.specify/templates/ewf/change-set.template.json` | Exact predecessor, writer, worktree, allowlist, exclusions and stop conditions |
| `.specify/templates/ewf/lightweight-repair.template.json` | Small-repair eligibility and bounded evidence record |
| `.specify/templates/ewf/spec-metadata.template.json` | Local spec identity, canonical package reference, requirements and profiles |
| `.specify/templates/ewf/verification-manifest.template.json` | Declared focused/PR commands and requirement links |
| `.specify/templates/ewf/implementation-report.template.json` | Exact subject evidence labeled non-acceptance |
| `.specify/templates/ewf/frozen-acceptance-brief.template.json` | Immutable audit boundary and bound digests |
| `.specify/templates/ewf/audit-result.template.json` | External auditor envelope with restricted verdict vocabulary |
| `scripts/ewf-artifacts.mjs` | Load, normalize, validate, canonicalize and digest artifacts |
| `tests/ewf-artifact-contracts.test.mjs` | Contract, authority, determinism, redaction and invalidation tests |

## Public module interface

`scripts/ewf-artifacts.mjs` must export:

```js
export const COMMAND_RESULTS = Object.freeze([
  'PASS', 'FAIL', 'ERROR', 'NOT_RUN', 'NOT_AVAILABLE'
]);

export const AUDIT_RESULTS = Object.freeze([
  'ACCEPT', 'REJECT', 'BLOCKED_BY_INVALID_BRIEF'
]);

export function canonicalizeArtifact(value) {}
export function digestArtifact(value) {}
export function validateArtifact(kind, value, options = {}) {}
export function validateFrozenBrief(brief, bindings) {}
export function containsForbiddenAuthorityCopy(markdown) {}
export function redactPortableValue(value) {}
```

Validation returns a stable envelope:

```js
{
  valid: boolean,
  errors: [{ code, path, message }],
  warnings: [{ code, path, message }],
  normalized: object | null,
  digest: string | null
}
```

Errors and warnings must be sorted deterministically by `code`, then `path`, then
`message`.

---

### Task 1: Constitutional bridge and forbidden-authority guard

**Files:**
- Create: `.specify/memory/constitution.md`
- Create: `tests/ewf-artifact-contracts.test.mjs`
- Create: `scripts/ewf-artifacts.mjs`

**Interfaces:**
- Produces `containsForbiddenAuthorityCopy(markdown)` for later validation.
- Consumes no product module.

- [ ] **Step 1: Write the failing bridge tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { containsForbiddenAuthorityCopy } from '../scripts/ewf-artifacts.mjs';

const bridge = await readFile(
  new URL('../.specify/memory/constitution.md', import.meta.url),
  'utf8'
);

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
```

- [ ] **Step 2: Run the test and confirm it fails because files/exports are absent**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
```

Expected: non-zero exit with missing module or bridge.

- [ ] **Step 3: Implement the minimal bridge and scanner**

The bridge may contain only relative links, short role descriptions, precedence
and conflict-stop language. The scanner must reject copied package-status rows,
acceptance checklists, dependency tables, detailed ADR bodies and Definition of
Done sections using explicit structural markers; it must not reject ordinary
links containing those words.

- [ ] **Step 4: Run focused tests**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
```

Expected: bridge test passes.

- [ ] **Step 5: Commit**

```powershell
git add .specify/memory/constitution.md scripts/ewf-artifacts.mjs tests/ewf-artifact-contracts.test.mjs
git commit -m "feat(ewf): add subordinate constitutional bridge"
```

---

### Task 2: Artifact templates and core validation

**Files:**
- Create all eight `.specify/templates/ewf/*.template.json` files.
- Modify: `scripts/ewf-artifacts.mjs`
- Modify: `tests/ewf-artifact-contracts.test.mjs`

**Interfaces:**
- Consumes `canonicalizeArtifact`, `digestArtifact` and validation envelope.
- Produces versioned template shapes used by later EWF preflight/trace work.

- [ ] **Step 1: Add failing template tests**

Tests must load every template and assert:

```js
assert.equal(template.schemaVersion, 1);
assert.equal(typeof template.artifactKind, 'string');
```

They must also prove:

- change-set declaration requires predecessor, branch, worktree, writer,
  allowlist, exclusions and stop conditions;
- repair records cannot pass unless every lightweight eligibility predicate is
  explicitly `true`;
- spec metadata requires an existing canonical package ID and namespaced unique
  requirement IDs;
- implementation reports always carry
  `authorityLabel: 'IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE'`;
- command results accept exactly the five declared values;
- audit results accept exactly the three declared values;
- no artifact field can claim canonical package status.

- [ ] **Step 2: Run tests and confirm failures**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
```

Expected: non-zero exit because templates/validators are incomplete.

- [ ] **Step 3: Create templates and minimal validators**

Use explicit field validators; do not introduce a general JSON Schema engine.
Unknown safe fields may be preserved under `extensions`, but unknown top-level
authority/status/verdict fields fail closed.

- [ ] **Step 4: Run tests**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
```

Expected: all artifact-shape and authority tests pass.

- [ ] **Step 5: Commit**

```powershell
git add .specify/templates/ewf scripts/ewf-artifacts.mjs tests/ewf-artifact-contracts.test.mjs
git commit -m "feat(ewf): add minimum artifact contracts"
```

---

### Task 3: Deterministic canonicalization, digest and brief invalidation

**Files:**
- Modify: `scripts/ewf-artifacts.mjs`
- Modify: `tests/ewf-artifact-contracts.test.mjs`

**Interfaces:**
- Produces deterministic JSON and SHA-256 digest strings.
- Produces `validateFrozenBrief(brief, bindings)` for identity/completeness only.

- [ ] **Step 1: Add failing determinism and invalidation tests**

```js
const a = { b: 2, a: 1 };
const b = { a: 1, b: 2 };
assert.equal(canonicalizeArtifact(a), canonicalizeArtifact(b));
assert.equal(digestArtifact(a), digestArtifact(b));
```

Add fixtures proving that changing subject commit, parent, spec revision, trace
digest, evidence digest or brief digest invalidates the brief. The validator must
return `BLOCKED_BY_INVALID_BRIEF` semantics and must never emit `ACCEPT`.

- [ ] **Step 2: Run tests and confirm failures**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
```

- [ ] **Step 3: Implement canonicalization and validation**

Canonicalization recursively sorts object keys, preserves array order, rejects
non-JSON values and uses UTF-8 JSON without insignificant whitespace. Digests are
lowercase SHA-256 hex.

- [ ] **Step 4: Run tests twice to prove deterministic results**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
node --test tests/ewf-artifact-contracts.test.mjs
```

Expected: identical test count and zero failures on both runs.

- [ ] **Step 5: Commit**

```powershell
git add scripts/ewf-artifacts.mjs tests/ewf-artifact-contracts.test.mjs
git commit -m "feat(ewf): validate frozen artifact identity"
```

---

### Task 4: Portable redaction, CLI-absent check and final verification

**Files:**
- Modify: `scripts/ewf-artifacts.mjs`
- Modify: `tests/ewf-artifact-contracts.test.mjs`

**Interfaces:**
- Produces `redactPortableValue(value)`.
- Adds a read-only CLI mode: `node scripts/ewf-artifacts.mjs --check`.

- [ ] **Step 1: Add failing redaction and CLI tests**

Fixtures must include Windows and POSIX absolute private paths, tokens, API keys,
credentials and safe repository-relative paths. Secrets/private absolute paths
must be replaced by stable redaction markers; repository-relative paths and
non-secret identities remain.

- [ ] **Step 2: Run tests and confirm failures**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
```

- [ ] **Step 3: Implement redaction and `--check`**

`--check` loads the bridge/templates, validates them and exits non-zero on any
error. It must not require or invoke `specify`, install dependencies, write files
or alter canonical docs.

- [ ] **Step 4: Run focused profile**

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
node scripts/ewf-artifacts.mjs --check
npm run audit:roadmap
git diff --check
```

Expected: zero failures and no writes outside the allowlist.

- [ ] **Step 5: Run PR profile**

```powershell
npm test
npm run check
npm run audit:roadmap
npm run build
```

Record every command as `PASS`, `FAIL`, `ERROR`, `NOT_RUN` or `NOT_AVAILABLE`.
Do not call the task green unless all required commands actually pass in a clean
environment with installed lockfile dependencies.

- [ ] **Step 6: Verify rollback**

From the implementation subject, prove that removing only the new EWF files
restores the prior manual workflow and changes no product/canonical file.

- [ ] **Step 7: Commit**

```powershell
git add .specify scripts/ewf-artifacts.mjs tests/ewf-artifact-contracts.test.mjs
git commit -m "test(ewf): verify artifact contracts and degradation"
```

---

## Final handoff requirements

The implementation handoff must include:

- exact subject commit and parent;
- actual changed-file list matching the authorization allowlist;
- requirement-to-test-to-command-to-evidence trace for `EWF00-AC-01` through
  `EWF00-AC-12` only where this MVP task implements them;
- explicit disposition for requirements deferred to later EWF specs;
- focused and PR command results with environment and duration;
- frozen acceptance brief digest;
- implementation report labeled non-acceptance;
- independent read-only review at the exact subject commit.

Passing this plan does not accept EWF-00. EWF-00 package acceptance still
requires the preflight/trace implementation and both separately authorized
pilots under `EWF00-PILOTS-001`.
