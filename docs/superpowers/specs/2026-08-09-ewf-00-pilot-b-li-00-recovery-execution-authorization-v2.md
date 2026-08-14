# W1-LI-00-001 Pilot B Recovery Execution Authorization v2

## Authorization state

\`\`\`text
IDENTITY: W1-LI-00-001-PILOT-B-RECOVERY-AUTH-002
STATE: DRAFT
SCOPE: DOCS ONLY
AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
NOT_EFFECTIVE

Pilot B execution: NOT_STARTED
PILOT_MEASUREMENT: NOT_EXECUTED
LI-00 implementation: NOT_STARTED BY THIS AUTHORIZATION
LI-00 acceptance: NOT_GRANTED
Pilot B acceptance: NOT_GRANTED
EWF-00 acceptance: NOT_GRANTED
package acceptance: NOT_GRANTED
merge authority: NONE
\`\`\`

This is a docs-only candidate for exactly one new \`EWF00-PILOTS-001 / Pilot B\` recovery attempt for product record \`W1-LI-00-001\` and package \`LI-00\`. It is an authorization candidate, not an implementation, measurement request, measurement result, evidence package, acceptance, status mutation, or merge authority.

It may become executable only after an Independent Auditor posts an exact-head \`ACCEPT\` binding this authorization commit SHA, this document blob, this identity, this changed path, and the accepted measurement-tooling revision. The implementer must not issue that verdict.

## Fresh authority bindings and immutable history

| Binding | Frozen value |
|---|---|
| Fresh current \`main\` at authoring | \`f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e\` |
| Accepted W1 manifest | \`W1-AUTH-MANIFEST-004\`, independent ACCEPT comment \`5212739464\` |
| Literal W1 executable product predecessor | \`e53d0971db1160f9b01349d2e4c17e59c6aaa99b\`, posted in \`W1_MANIFEST_EXECUTABLE_PREDECESSOR_BINDING\` comment \`5212765715\` |
| Canonical measurement/substrate revision | \`1d0077a8b90ab58a025fff510dde3fd2cda7bc9a\` |
| Accepted measurement tooling revision | \`c64b926a596855237add816ff9c07f2558cfa971\` |
| Independent tooling ACCEPT | PR #45 comment \`5229107834\` |
| Historical Pilot B STOP | PR #37 Governor STOP comment \`5225048322\` |

The PR #45 verdict grants substrate implementation acceptance for exact E3 \`c64b926a596855237add816ff9c07f2558cfa971\` only. It does not grant Pilot acceptance, LI-00 acceptance, EWF-00 acceptance, or package acceptance. It does not by itself authorize a real \`PILOT_MEASUREMENT\` or Pilot B restart.

PR #35, PR #36, and PR #37, their branches, comments, evidence, and commits remain HISTORICAL, FROZEN, NON-REUSABLE AS CURRENT EXECUTION, NOT CURRENT BASELINE, and NOT CURRENT ASSISTED EVIDENCE. In particular, the PR #37 STOP remains controlling: no retrospective baseline, no baseline backfill, and no conversion of its Commit A/B into a new valid measured attempt.

## Exact future execution capsule

The only conditionally authorized future topology is:

\`\`\`text
independently accepted recovery execution authorization
  -> BASELINE PILOT_MEASUREMENT
  -> baseline dataset frozen and read back
  -> Commit A — TEST ONLY / natural RED
  -> Commit B — SOURCE ONLY / GREEN
  -> ASSISTED PILOT_MEASUREMENT
  -> Commit C — EVIDENCE ONLY
  -> HANDOFF
  -> INDEPENDENT AUDIT
  -> STOP
\`\`\`

\`\`\`text
BASELINE MUST EXIST BEFORE COMMIT A.
\`\`\`

The baseline request itself is not created by this authorization candidate. It may be created exactly once only after this exact authorization has independent ACCEPT.

### Product and write boundary

The baseline subject is exactly:

\`\`\`text
e53d0971db1160f9b01349d2e4c17e59c6aaa99b
\`\`\`

It is the literal accepted W1 predecessor, not moving \`main\` and not a tooling commit.

Future product source allowlist:

\`\`\`text
src/learning-contracts.js
src/today-runner.js
\`\`\`

Future product test allowlist:

\`\`\`text
tests/li-00-execution-safety.test.mjs
\`\`\`

At minimum, the following are excluded: \`src/today-composer.js\`, \`tests/today-composer.test.mjs\`, \`src/v10-persistence.js\`, \`src/persistence.js\`, \`src/event-repository.js\`, \`.github/**\`, \`package.json\`, \`package-lock.json\`, a new runtime/store/scheduler/persistence authority/package owner/AI authority, FSRS behavior changes, canonical status mutation, and historical-evidence rewrite. If the LI behavior cannot be implemented inside this boundary using accepted existing dependencies, stop with \`RECOVERY_SOURCE_BOUNDARY_INSUFFICIENT\`.

### Commit rules

- Commit A is test-only, has parent equal to the exact baseline subject, and changes only \`tests/li-00-execution-safety.test.mjs\`. Its source blobs are byte-identical to baseline. It may form only after the baseline dataset is frozen/read back.
- Commit A must use the accepted W1 frozen natural RED: create one valid bound Today Run, persist a valid terminal Receipt, then submit a distinct conflicting terminal Receipt for that Run; current \`recordTodayReceipt\` accepts the second write and replaces the first winner. The first failing assertion must prove that overwrite. Import/setup/storage/bootstrap/infrastructure/malformed-envelope/artificial/unrelated failures are \`INVALID_OR_AMBIGUOUS_RED\`.
- Commit B is source-only, is a direct child of A, changes only a subset of the two source paths, and leaves the Commit-A test blob byte-identical. It must implement the complete accepted LI seam, not merely the first assertion.
- Commit C is evidence-only, is a direct child of B, and preserves all source and test blobs byte-identically to B.
- There is no Commit D. Any required remediation, source/test edit after valid RED, topology deviation, or need for additional implementation commits is \`AUTHORIZED_COMMIT_TOPOLOGY_EXHAUSTED\`.

## Frozen controlled measurement pair

\`\`\`text
measurementPairId:
EWF00-PILOTS-001-PILOT-B-RECOVERY-002-PAIR-001

attemptId:
W1-LI-00-001-PILOT-B-RECOVERY-002-ATTEMPT-001

baselineSubject:
e53d0971db1160f9b01349d2e4c17e59c6aaa99b

assistedSubject rule:
the exact future Commit B SHA, direct child of the authorized Commit A, satisfying
the source/test allowlists and preserving the Commit-A test blob.

lineageAnchor:
e53d0971db1160f9b01349d2e4c17e59c6aaa99b

acceptedMeasurementToolingRevision:
c64b926a596855237add816ff9c07f2558cfa971

acceptedMeasurementToolingVerdictCommentId:
5229107834

measurementSchemaRevision:
CONTROLLED_SUBJECT_PAIR_V1

measurementMethodRevision:
EWF00-PILOTS-001-PILOT-B-MEASUREMENT-METHOD-V1

rawEvidenceFormatRevision:
EWF00-MEASURE-EXEC-001-RAW-EVIDENCE-V1

operationDefinitionRevision:
W1-LI-00-001-PILOT-B-RECOVERY-AUTH-002-OPDEF-V1

environmentInheritancePolicy:
EWF00-MEASURE-EXEC-001-AUTH-001-CHILD-ENV-V1

cwdPolicy:
PRODUCT_ROOT_RELATIVE

timeoutPolicy:
commandRetryCount=0
sealAwaitWindowMs=300000
sealPollIntervalMs=5000

controlled runtime:
runnerFamily=ubuntu-24.04
node=22.22.3
npm=10.9.8
shell=bash --noprofile --norc -eo pipefail -c
clock=process.hrtime.bigint()
executionContainerDigest=NOT_SELECTED
\`\`\`

Baseline and assisted use the same tooling, command manifest, method, controlled semantics, pair, operation definition, environment inheritance, cwd policy, and timeout policy. Any unrelated product delta or controlled-fingerprint mismatch invalidates comparability; it may not be normalized away.

A future baseline request must be \`requestPurpose=PILOT_MEASUREMENT\`, \`measurementPhase=baseline\`, and bind this authorization identity, its independently accepted exact subject/verdict/path, tooling revision/verdict, canonical spec revision, verification digest, declaration IDs, command manifest/digest, exact baseline subject, pair, and attempt. An assisted request may exist only after valid B GREEN and uses \`measurementPhase=assisted\` with \`productSubject\` equal to the exact B SHA.

The E3 operation-journal protocol is frozen for real Pilot use: contemporaneous immutable top-level \`EWF_MEASUREMENT_OPERATION_V1\` comments and one \`EWF_MEASUREMENT_JOURNAL_SEAL_V1\` comment must bind this request identity, exact ordered comment IDs/body digests, \`operationDefinitionRevision\`, journal digest, and observation window. Journal/seal posting is future evidence capture only; it is not performed here and does not count recursively as a manual operation. No SAT artifact is Pilot evidence.

## Machine-readable command authority

The following JSON is intentionally resolver-facing. Its \`commandManifest\` is the sole exact ordered Pilot command authority. The \`verificationManifest.commands.pr\` profile records natural PR CI context only; it is not Pilot shell authority and must not be run by \`PILOT_MEASUREMENT\`.

\`\`\`json
{
  "executionAuthorizationIdentity": "W1-LI-00-001-PILOT-B-RECOVERY-AUTH-002",
  "executionAuthorizationPath": "docs/superpowers/specs/2026-08-09-ewf-00-pilot-b-li-00-recovery-execution-authorization-v2.md",
  "canonicalSpecRevision": "1d0077a8b90ab58a025fff510dde3fd2cda7bc9a",
  "verificationManifestDigest": "ce86facecf7c45ecdda0b39234d69e7d9321bf043711a59bd85faeec817b6585",
  "commandDeclarationIds": [
    "li-pilot-b-01-focused-tests",
    "li-pilot-b-02-check-learning-contracts",
    "li-pilot-b-03-check-today-runner",
    "li-pilot-b-04-check-li-safety-test",
    "li-pilot-b-05-p1-contracts",
    "li-pilot-b-06-p1-runner",
    "li-pilot-b-07-backup",
    "li-pilot-b-08-restore"
  ],
  "commandManifest": [
    {"commandId":"li-pilot-b-01-focused-tests","ordinal":1,"command":"node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":120000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-02-check-learning-contracts","ordinal":2,"command":"node --check src/learning-contracts.js","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":30000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-03-check-today-runner","ordinal":3,"command":"node --check src/today-runner.js","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":30000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-04-check-li-safety-test","ordinal":4,"command":"node --check tests/li-00-execution-safety.test.mjs","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":30000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-05-p1-contracts","ordinal":5,"command":"npm run test:p1-contracts","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":120000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-06-p1-runner","ordinal":6,"command":"npm run test:p1-runner","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":120000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-07-backup","ordinal":7,"command":"npm run test:backup","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":120000,"explicitEnvironment":{}},
    {"commandId":"li-pilot-b-08-restore","ordinal":8,"command":"npm run test:restore","cwd":".","required":true,"requirements":["node==22.22.3"],"timeoutMs":120000,"explicitEnvironment":{}}
  ],
  "commandManifestDigest": "abfb6a08f8cd7a16f7fbbee04c23d5ac1310d5fa838ed4136a1ba3f257609113",
  "verificationManifest": {
    "schemaVersion": 1,
    "artifactKind": "verification-manifest",
    "authorityLabel": "DECLARED_VERIFICATION / NOT_EXECUTION",
    "specId": "EWF00-PREFLIGHT-001",
    "commands": {
      "focused": [
        {"id":"li-pilot-b-01-focused-tests","command":"node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-02-check-learning-contracts","command":"node --check src/learning-contracts.js","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-03-check-today-runner","command":"node --check src/today-runner.js","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-04-check-li-safety-test","command":"node --check tests/li-00-execution-safety.test.mjs","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-05-p1-contracts","command":"npm run test:p1-contracts","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-06-p1-runner","command":"npm run test:p1-runner","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-07-backup","command":"npm run test:backup","requirements":["node==22.22.3"]},
        {"id":"li-pilot-b-08-restore","command":"npm run test:restore","requirements":["node==22.22.3"]}
      ],
      "pr": [
        {"id":"li-pr-01","command":"npm test","requirements":["node==22.22.3"]},
        {"id":"li-pr-02","command":"npm run check","requirements":["node==22.22.3"]},
        {"id":"li-pr-03","command":"npm run audit:roadmap","requirements":["node==22.22.3"]},
        {"id":"li-pr-04","command":"npm run audit:ielts","requirements":["node==22.22.3"]},
        {"id":"li-pr-05","command":"npm run test:v10","requirements":["node==22.22.3"]},
        {"id":"li-pr-06","command":"npm run audit:v10","requirements":["node==22.22.3"]},
        {"id":"li-pr-07","command":"npm run build","requirements":["node==22.22.3"]},
        {"id":"li-pr-08","command":"npm run test:serve","requirements":["node==22.22.3"]},
        {"id":"li-pr-09","command":"npm run test:preview","requirements":["node==22.22.3"]},
        {"id":"li-pr-10","command":"npm run test:browser","requirements":["node==22.22.3"]},
        {"id":"li-pr-11","command":"npm run test:v10-browser","requirements":["node==22.22.3"]},
        {"id":"li-pr-12","command":"npm run test:hardening","requirements":["node==22.22.3"]}
      ]
    },
    "extensions": {
      "canonicalSpecRevision": "1d0077a8b90ab58a025fff510dde3fd2cda7bc9a",
      "preflightSchemaRevision": "0b43efac974c3fbbc489f10e9fa668bac84c9b43",
      "verificationManifestDigest": "ce86facecf7c45ecdda0b39234d69e7d9321bf043711a59bd85faeec817b6585"
    }
  }
}
\`\`\`

Digest method is mechanically frozen:

\`\`\`text
commandManifestDigest = SHA-256(UTF-8(JSON.stringify(recursively key-sorted commandManifest)))
verificationManifestDigest = digestArtifact(recursively key-sorted verificationManifest with only extensions.verificationManifestDigest omitted)
\`\`\`

The computed digests above are reproducible under the accepted E3 canonicalization: recursive lexicographic object keys, preserved array order, UTF-8 JSON, SHA-256. Reordering, joining, splitting, replacing, adding, or editing a declaration, cwd, required flag, requirement, timeout, or explicit environment is \`UNAUTHORIZED_COMMAND\` and must result in zero product-command execution.

## Non-effects and stop boundary

This candidate does not create a measurement request, baseline, assisted run, journal entry, seal, implementation branch, Commit A/B/C, test, source change, workflow change, dependency change, status reconciliation, evidence package, acceptance verdict, Ready transition, or merge.

It grants no authority to amend/rebase/force-push/extend/reinterpret historical attempts. No use of \`npm test\`, broad CI, discovered tests, reordered/joined/split/additional commands, workflow dispatch, rerun, manual CI trigger, or backfilled measurement is authorized as a Pilot substitute.

Independent authorization verdict: NOT_ISSUED_BY_IMPLEMENTER. Merge authority: NONE.

## Required next action

\`\`\`text
INDEPENDENT AUTHORIZATION AUDIT
\`\`\`

After an independent exact-head ACCEPT, the next permitted action is creation of the one baseline \`PILOT_MEASUREMENT\` request under this frozen authority. Otherwise, stop.
