import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { coreSourceRevision } from '../src/schedule-gateway.js';
import { createActivitySpec, validateActivitySpec } from '../src/learning-contracts.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';

globalThis.indexedDB = new IDBFactory();
globalThis.IDBKeyRange = IDBKeyRange;
globalThis.dispatchEvent ??= () => true;
globalThis.CustomEvent ??= class CustomEvent { constructor(type, { detail } = {}) { this.type = type; this.detail = detail; } };

const transcriptPersistence = await import('../src/transcript-aggregate.js');
const v10Persistence = await import('../src/v10-persistence.js');
const { V10_STORES } = await import('../src/v10-contracts.js');
const combinedBackup = await import('../src/ielts-backup.js');

let sourceRevisionRef = null;
let moduleLoadError = null;
try {
  sourceRevisionRef = await import('../src/source-revision-ref.js');
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  moduleLoadError = error;
}

const productionLoaded = sourceRevisionRef !== null;
const expectedCodes = Object.freeze([
  'RESOLVED',
  'NOT_FOUND',
  'TOMBSTONED',
  'UNSUPPORTED_KIND',
  'UNSUPPORTED_VERSION',
  'INTEGRITY_MISMATCH',
  'PROVENANCE_INVALID',
  'RIGHTS_BLOCKED',
  'AUTHORITY_UNAVAILABLE'
]);

const coreCard = Object.freeze({
  id: 'card-source-ref-1',
  senseId: 'sense-source-ref-1',
  front: 'durable',
  back: 'bền vững',
  type: 'word',
  sourceVerified: true,
  rightsStatus: 'allowed',
  privacy: 'private',
  sourceProvenance: { origin: 'core-fixture', verification: 'verified', rights: 'allowed', privacy: 'private' }
});

function mutableAliasActivity() {
  return createActivitySpec({
    id: 'activity-with-mutable-source-alias',
    type: 'typing',
    target: {
      cardId: coreCard.id,
      senseId: coreCard.senseId,
      skill: 'recall',
      sourceId: `core-card:${coreCard.id}`,
      sourceRevision: 'active'
    },
    plannedAt: 1,
    timezone: 'UTC',
    executor: 'core-session'
  });
}

async function validateForExecution(input) {
  if (productionLoaded) return sourceRevisionRef.validateSourceRevisionForExecution(input);
  const legacy = validateActivitySpec(input.activitySpec);
  return { code: legacy.valid ? 'RESOLVED' : 'NOT_FOUND', executable: legacy.valid, fallback: true };
}

function activityFor(reference, overrides = {}) {
  return createActivitySpec({
    id: overrides.id ?? `activity:${reference.sourceId}`,
    type: 'typing',
    target: {
      cardId: coreCard.id,
      senseId: coreCard.senseId,
      skill: 'recall',
      sourceId: reference.sourceId,
      sourceRevision: reference.revisionId,
      ...overrides.target
    },
    plannedAt: 1,
    timezone: 'UTC',
    executor: 'core-session',
    ...overrides.activity
  });
}

test('execution-bound ActivitySpec with active/latest/current aliases is a natural product defect before the immutable resolution fence exists', async () => {
  const activitySpec = mutableAliasActivity();
  const result = await validateForExecution({ activitySpec });
  assert.equal(result.executable, false, 'execution must fail closed instead of accepting a mutable source-revision alias');
  assert.equal(result.code, productionLoaded ? 'NOT_FOUND' : 'NOT_FOUND');
  if (productionLoaded) assert.equal(moduleLoadError, null, 'GREEN must use the real production module, never the fallback');
});

test('exports the SRC-00 schema and only the frozen resolution vocabulary', { skip: !productionLoaded }, () => {
  assert.equal(sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, 'SourceRevisionRef');
  assert.equal(sourceRevisionRef.SOURCE_REVISION_REF_VERSION, 1);
  assert.deepEqual(Object.values(sourceRevisionRef.SOURCE_RESOLUTION_CODES), expectedCodes);
  for (const name of ['createSourceRevisionRef', 'createSourceRevisionRegistry', 'createCoreCardSourceAdapter', 'createTranscriptSourceAdapter', 'validateSourceRevisionForExecution']) assert.equal(typeof sourceRevisionRef[name], 'function', name);
});

test('canonical SourceRevisionRef is JSON-safe, immutable and refuses mutable aliases', { skip: !productionLoaded }, () => {
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: id => id === coreCard.id ? coreCard : null });
  const ref = adapter.createRef(coreCard, { display: { title: 'safe display title' }, extensions: { futureMarker: { stable: true } } });
  assert.equal(ref.schema, sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA);
  assert.equal(ref.version, sourceRevisionRef.SOURCE_REVISION_REF_VERSION);
  assert.equal(ref.sourceId, `core-card:${coreCard.id}`);
  assert.equal(ref.revisionId, coreSourceRevision(coreCard));
  assert.equal(ref.integrity, coreSourceRevision(coreCard));
  assert.equal(Object.isFrozen(ref), true);
  assert.equal(Object.isFrozen(ref.provenance), true);
  assert.equal(ref.extensions.futureMarker.stable, true);
  assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...ref, revisionId: 'latest' }), /immutable/i);
});

test('registry authority is part of ownership and blocks mismatched owners before any read', { skip: !productionLoaded }, async () => {
  let ownerReads = 0;
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { ownerReads += 1; return coreCard; } });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const reference = adapter.createRef(coreCard);
  const result = await registry.resolve({ ...reference, authority: 'different-authority' });
  assert.equal(result.code, 'NOT_FOUND');
  assert.equal(result.reason, 'source-authority-mismatch');
  assert.equal(result.executable, false);
  assert.equal(ownerReads, 0, 'authority mismatch must not invoke an owner reader');
});

test('execution validation requires a valid canonical ActivitySpec before registry resolution', { skip: !productionLoaded }, async () => {
  let ownerReads = 0;
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { ownerReads += 1; return coreCard; } });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const reference = adapter.createRef(coreCard);
  const invalidCases = [
    { label: 'no ActivitySpec', activitySpec: null },
    { label: 'target-only object', activitySpec: { target: activityFor(reference).target } },
    { label: 'invalid canonical cross-reference', activitySpec: { ...activityFor(reference), schemaVersion: 999 } },
    { label: 'missing exact source target', activitySpec: { ...activityFor(reference), target: { ...activityFor(reference).target, sourceId: null } } }
  ];
  for (const fixture of invalidCases) {
    ownerReads = 0;
    const result = await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: fixture.activitySpec, sourceRevisionRef: reference, registry });
    assert.equal(result.code, 'NOT_FOUND', fixture.label);
    assert.equal(result.reason, 'activity-spec-invalid', fixture.label);
    assert.equal(result.executable, false, fixture.label);
    assert.equal(ownerReads, 0, fixture.label);
  }
  const valid = activityFor(reference);
  assert.equal(validateActivitySpec(valid).valid, true);
  assert.equal((await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: valid, sourceRevisionRef: reference, registry })).code, 'RESOLVED');
  assert.equal((await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: activityFor(reference, { target: { sourceRevision: 'latest' } }), sourceRevisionRef: reference, registry })).reason, 'activity-spec-invalid');
});

test('owner adapters reject protected-field overrides and preserve owner-derived provenance', { skip: !productionLoaded }, () => {
  const unverifiedPrivate = { ...coreCard, sourceVerified: false, rightsStatus: 'blocked', privacy: 'private' };
  const coreAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => unverifiedPrivate });
  const transcript = createTranscriptAggregate({
    source: { id: 'transcript-source:owner-protection', namespace: 'private', status: 'unverified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Owner provenance is authoritative.', language: 'en', status: 'unverified' }],
    createdAt: 50
  });
  const transcriptAdapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => transcript });
  for (const [adapter, owner] of [[coreAdapter, unverifiedPrivate], [transcriptAdapter, transcript]]) {
    for (const field of ['schema', 'version', 'kind', 'authority', 'sourceId', 'revisionId', 'integrity', 'locator', 'provenance', 'tombstone']) {
      assert.throws(() => adapter.createRef(owner, { [field]: field === 'provenance' ? { verification: 'verified', rights: 'allowed', privacy: 'public' } : 'spoofed' }), error => error.code === 'SOURCE_REVISION_OWNER_FIELD_OVERRIDE', `${adapter.kind}.${field}`);
    }
  }
  const reference = coreAdapter.createRef(unverifiedPrivate, { extensions: { safeNote: 'owner state cannot be promoted' } });
  assert.deepEqual(reference.provenance, { origin: 'core-fixture', verification: 'unverified', rights: 'blocked', privacy: 'private' });
});

test('current schema rejects unknown fields and all unsafe or oversized JSON values without stripping', { skip: !productionLoaded }, () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:safety', revisionId: 'revision-safety', integrity: 'digest-safety', locator: { cardId: 'safety' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }, extensions: { stable: true }
  };
  const cyclic = {}; cyclic.self = cyclic;
  const tooDeep = {}; let cursor = tooDeep; for (let index = 0; index < 21; index += 1) { cursor.child = {}; cursor = cursor.child; }
  const tooManyKeys = Object.fromEntries(Array.from({ length: 257 }, (_, index) => [`key${index}`, index]));
  const unsafe = [
    { futureMetadata: { mustBeExplicit: true } },
    { locator: { callback: () => true } },
    { locator: { symbol: Symbol('nope') } },
    { locator: { cyclic } },
    { locator: { number: Infinity } },
    { locator: { date: new Date() } },
    { locator: { path: 'C:\\Users\\private\\source.txt' } },
    { locator: { path: '\\\\server\\private\\source.txt' } },
    { locator: { path: '/private/source.txt' } },
    { locator: { uri: 'file:///C:/Users/private/source.txt' } },
    { extensions: { sourceBody: 'forbidden' } },
    { locator: { huge: 'x'.repeat(200_000) } },
    { extensions: { huge: 'x'.repeat(20_000) } },
    { extensions: { entries: Array.from({ length: 257 }, (_, index) => index) } },
    { extensions: tooManyKeys },
    { extensions: tooDeep }
  ];
  for (const patch of unsafe) assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, ...patch }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR');
  const future = sourceRevisionRef.createSourceRevisionRef({ ...base, version: 2, futureMetadata: { preserved: 'safely' } });
  assert.deepEqual(future.extensions.futureMetadata, { preserved: 'safely' });
  assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, version: 2, privatePath: 'C:\\Users\\private\\source.txt' }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR');
});

test('schema and adapter headers are strict JSON data: no coercion or accessor invocation is permitted', { skip: !productionLoaded }, () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:strict', revisionId: 'revision-strict', integrity: 'digest-strict', locator: { cardId: 'strict' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }
  };
  for (const version of ['1', true, { valueOf: () => 1 }]) {
    assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, version }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR');
  }
  let getterCalls = 0;
  const accessorReference = { ...base };
  Object.defineProperty(accessorReference, 'revisionId', { enumerable: true, get() { getterCalls += 1; return 'getter-revision'; } });
  assert.throws(() => sourceRevisionRef.createSourceRevisionRef(accessorReference), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR');
  assert.equal(getterCalls, 0, 'accessor reference fields must be rejected before invocation');
  const registry = sourceRevisionRef.createSourceRevisionRegistry();
  for (const adapter of [
    { kind: 'synthetic', version: '1', authority: 'synthetic-owner', resolve: async () => ({ code: 'NOT_FOUND' }) },
    { kind: 1, version: 1, authority: 'synthetic-owner', resolve: async () => ({ code: 'NOT_FOUND' }) },
    { kind: 'synthetic', version: 1, authority: true, resolve: async () => ({ code: 'NOT_FOUND' }) }
  ]) assert.throws(() => registry.register(adapter));
  let adapterGetterCalls = 0;
  const accessorAdapter = { version: 1, authority: 'accessor-owner', resolve: async () => ({ code: 'NOT_FOUND' }) };
  Object.defineProperty(accessorAdapter, 'kind', { enumerable: true, get() { adapterGetterCalls += 1; return 'synthetic'; } });
  assert.throws(() => registry.register(accessorAdapter));
  assert.equal(adapterGetterCalls, 0, 'adapter header accessors must be rejected before invocation');
});

test('normalized private and source-body keys are rejected while safe future metadata remains portable', { skip: !productionLoaded }, () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:privacy', revisionId: 'revision-privacy', integrity: 'digest-privacy', locator: { cardId: 'privacy' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }
  };
  for (const key of ['apiKey', 'api_key', 'accessToken', 'clientSecret', 'authorization', 'password', 'refresh-token', 'sourceText', 'transcriptText', 'captionText', 'rawText', 'SOURCE_BODY']) {
    assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, extensions: { [key]: 'FORBIDDEN_SENTINEL' } }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR', key);
  }
  assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, locator: { cardId: 'privacy', path: '   C:\\Users\\private\\source.txt' } }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR');
  const future = sourceRevisionRef.createSourceRevisionRef({ ...base, version: 2, safeFutureMetadata: { preserved: true } });
  assert.deepEqual(JSON.parse(JSON.stringify(future)).extensions.safeFutureMetadata, { preserved: true });
  assert.doesNotMatch(JSON.stringify(future), /FORBIDDEN_SENTINEL|C:\\Users\\private/);
});

test('registry assigns one owner for each kind/version and duplicate ownership fails closed', { skip: !productionLoaded }, () => {
  const first = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard });
  const duplicate = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard, authority: 'different-core-authority' });
  assert.throws(() => sourceRevisionRef.createSourceRevisionRegistry({ adapters: [first, duplicate] }), error => error.code === 'SOURCE_REVISION_DUPLICATE_OWNER');
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [first] });
  assert.throws(() => registry.register(duplicate), error => error.code === 'SOURCE_REVISION_DUPLICATE_OWNER');
});

test('exact Core and Transcript locators fail before owner reads on mismatch', { skip: !productionLoaded }, async () => {
  let cardReads = 0;
  const coreAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { cardReads += 1; return coreCard; } });
  const coreRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [coreAdapter] });
  const coreReference = coreAdapter.createRef(coreCard);
  const coreResult = await coreRegistry.resolve({ ...coreReference, locator: { cardId: 'different-card' } });
  assert.equal(coreResult.code, 'NOT_FOUND');
  assert.equal(coreResult.reason, 'source-locator-mismatch');
  assert.equal(coreResult.executable, false);
  assert.equal(cardReads, 0, 'Core locator mismatch must not invoke getCard');

  const aggregate = createTranscriptAggregate({
    source: { id: 'transcript-source:locator', namespace: 'private', status: 'verified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Exact locator only.', language: 'en', status: 'verified' }],
    createdAt: 2
  });
  let transcriptReads = 0;
  const transcriptAdapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => { transcriptReads += 1; return aggregate; } });
  const transcriptRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [transcriptAdapter] });
  const transcriptReference = transcriptAdapter.createRef(aggregate);
  const transcriptResult = await transcriptRegistry.resolve({ ...transcriptReference, locator: { revisionId: 'different-revision' } });
  assert.equal(transcriptResult.code, 'NOT_FOUND');
  assert.equal(transcriptResult.reason, 'source-locator-mismatch');
  assert.equal(transcriptResult.executable, false);
  assert.equal(transcriptReads, 0, 'Transcript locator mismatch must not invoke getTranscriptAggregate');
});

test('Core adapter resolves only the exact card revision and ignores active revision changes', { skip: !productionLoaded }, async () => {
  let current = coreCard;
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: id => id === coreCard.id ? current : null });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const ref = adapter.createRef(coreCard);
  const before = await registry.resolve(ref);
  assert.equal(before.code, 'RESOLVED');
  assert.equal(before.executable, true);
  assert.equal(before.record.front, undefined, 'resolution projection cannot return source body');
  current = { ...coreCard, back: 'a newer active body' };
  const after = await registry.resolve(ref);
  assert.equal(after.code, 'INTEGRITY_MISMATCH');
  assert.equal(after.executable, false);
});

test('Core adapter produces typed missing, tombstone, rights, provenance and unavailable results', { skip: !productionLoaded }, async () => {
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({
    getCard: id => {
      if (id === 'unavailable') return { availability: 'unavailable' };
      if (id === 'tombstone') return { ...coreCard, id: 'tombstone', tombstone: { reason: 'redacted' } };
      if (id === 'blocked') return { ...coreCard, id: 'blocked', rightsStatus: 'blocked' };
      if (id === 'unverified') return { ...coreCard, id: 'unverified', sourceVerified: false };
      return id === coreCard.id ? coreCard : null;
    }
  });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const from = card => adapter.createRef(card);
  assert.equal((await registry.resolve({ ...from(coreCard), sourceId: 'core-card:missing', locator: { cardId: 'missing' } })).code, 'NOT_FOUND');
  assert.equal((await registry.resolve(from({ ...coreCard, id: 'tombstone', tombstone: { reason: 'redacted' } }))).code, 'TOMBSTONED');
  assert.equal((await registry.resolve(from({ ...coreCard, id: 'blocked', rightsStatus: 'blocked' }))).code, 'RIGHTS_BLOCKED');
  assert.equal((await registry.resolve(from({ ...coreCard, id: 'unverified', sourceVerified: false }))).code, 'PROVENANCE_INVALID');
  const unavailable = { ...from(coreCard), sourceId: 'core-card:unavailable', locator: { cardId: 'unavailable' } };
  assert.equal((await registry.resolve(unavailable)).code, 'AUTHORITY_UNAVAILABLE');
});

test('Transcript adapter binds the exact revision ID and contentDigest, never its active revision', { skip: !productionLoaded }, async () => {
  const aggregate = createTranscriptAggregate({
    source: { id: 'transcript-source:src00', namespace: 'private', status: 'verified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Exact transcript sentence.', language: 'en', status: 'verified' }],
    createdAt: 1
  });
  let row = aggregate;
  const adapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: revisionId => revisionId === aggregate.revision.id ? row : null });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const ref = adapter.createRef(aggregate);
  assert.equal((await registry.resolve(ref)).code, 'RESOLVED');
  row = { ...aggregate, revision: { ...aggregate.revision, contentDigest: 'changed-digest' } };
  assert.equal((await registry.resolve(ref)).code, 'INTEGRITY_MISMATCH');
});

test('execution validation requires a real ref and exact target identity; caller provenance cannot promote owner state', { skip: !productionLoaded }, async () => {
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => ({ ...coreCard, sourceVerified: false, rightsStatus: 'blocked' }) });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const reference = adapter.createRef({ ...coreCard, sourceVerified: false, rightsStatus: 'blocked' });
  const activitySpec = createActivitySpec({
    id: 'immutable-activity', type: 'typing', plannedAt: 1, executor: 'core-session',
    target: { cardId: coreCard.id, senseId: coreCard.senseId, skill: 'recall', sourceId: reference.sourceId, sourceRevision: reference.revisionId }
  });
  const blocked = await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec, sourceRevisionRef: { ...reference, provenance: { verification: 'verified', rights: 'allowed', privacy: 'public' } }, registry });
  assert.equal(blocked.code, 'RIGHTS_BLOCKED');
  assert.equal(blocked.executable, false);
  assert.equal((await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: mutableAliasActivity(), registry })).code, 'NOT_FOUND');
  assert.equal((await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: { ...activitySpec, target: { ...activitySpec.target, sourceRevision: 'current' } }, sourceRevisionRef: reference, registry })).code, 'NOT_FOUND');
});

test('Core execution binding requires the resolved card and owner sense exactly', { skip: !productionLoaded }, async () => {
  let ownerReads = 0;
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { ownerReads += 1; return coreCard; } });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const reference = adapter.createRef(coreCard);
  for (const target of [
    { cardId: 'wrong-card', senseId: coreCard.senseId },
    { cardId: coreCard.id, senseId: 'wrong-sense' }
  ]) {
    ownerReads = 0;
    const result = await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: activityFor(reference, { target }), sourceRevisionRef: reference, registry });
    assert.equal(result.code, 'NOT_FOUND');
    assert.equal(result.reason, 'activity-target-is-not-exactly-bound-to-reference');
    assert.equal(result.executable, false);
    if (target.cardId !== coreCard.id) assert.equal(ownerReads, 0, 'card binding mismatch must fail before resolving an owner');
  }
  assert.equal((await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: activityFor(reference), sourceRevisionRef: reference, registry })).code, 'RESOLVED');
});

test('unowned, mismatched, missing and unavailable resolutions never promote caller provenance', { skip: !productionLoaded }, async () => {
  const forged = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:forged', revisionId: 'forged-revision', integrity: 'forged-digest', locator: { cardId: 'forged' },
    provenance: { origin: 'forged-caller', verification: 'verified', rights: 'allowed', privacy: 'public' }
  });
  const expectedUnknown = { origin: null, verification: 'unknown', rights: 'unknown', privacy: 'unknown' };
  assert.deepEqual((await sourceRevisionRef.createSourceRevisionRegistry().resolve(forged)).provenance, expectedUnknown);
  const missingAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => null });
  const missingRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [missingAdapter] });
  assert.deepEqual((await missingRegistry.resolve(forged)).provenance, expectedUnknown);
  assert.deepEqual((await missingRegistry.resolve({ ...forged, authority: 'wrong-authority' })).provenance, expectedUnknown);
  const unavailableAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { throw new Error('owner unavailable'); } });
  const unavailableRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [unavailableAdapter] });
  assert.deepEqual((await unavailableRegistry.resolve(forged)).provenance, expectedUnknown);
});

test('malformed adapter outputs produce typed unavailable failures and never executable resolution', { skip: !productionLoaded }, async () => {
  const reference = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'synthetic', authority: 'synthetic-owner',
    sourceId: 'synthetic:source', revisionId: 'synthetic-revision', integrity: 'synthetic-digest', locator: { id: 'source' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'public' }
  });
  let resultGetterCalls = 0;
  const accessorResult = {};
  Object.defineProperty(accessorResult, 'code', { enumerable: true, get() { resultGetterCalls += 1; return 'RESOLVED'; } });
  const malformedResults = [
    { code: 'RESOLVED', provenance: { verification: 'verified', rights: 'allowed', privacy: 'public' }, record: { sourceText: 'SOURCE_BODY_MUST_NOT_LEAK' } },
    { code: 'RESOLVED', provenance: { verification: 'verified', rights: 'allowed', privacy: 'public' }, record: null },
    { code: 'NOT_FOUND', provenance: { verification: 'forged', rights: 'allowed', privacy: 'public' } },
    { code: 'TOMBSTONED', tombstone: { unexpected: true } },
    accessorResult
  ];
  for (const malformed of malformedResults) {
    const adapter = { kind: 'synthetic', version: 1, authority: 'synthetic-owner', resolve: async () => malformed };
    const result = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] }).resolve(reference);
    assert.equal(result.code, 'AUTHORITY_UNAVAILABLE');
    assert.equal(result.reason, 'adapter-returned-invalid-resolution');
    assert.equal(result.executable, false);
  }
  assert.equal(resultGetterCalls, 0, 'adapter result accessors must be rejected before invocation');
});

test('real Transcript child activation keeps the original immutable reference resolved without resolution mutation', { skip: !productionLoaded }, async () => {
  const source = { id: 'transcript-source:src00-real-child', namespace: 'private', status: 'verified', complete: true };
  const original = await transcriptPersistence.persistTranscriptAggregate({
    source,
    segments: [{ startMs: 0, endMs: 1000, text: 'Original verified transcript.', language: 'en', status: 'verified' }],
    createdAt: 10_001
  }, { activate: true });
  const adapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: transcriptPersistence.getTranscriptAggregate });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const originalReference = adapter.createRef(original);
  const child = await transcriptPersistence.createChildAndActivate(original.revision.id, [{ startMs: 0, endMs: 1000, text: 'Activated child revision.', language: 'en', status: 'verified' }], { createdAt: 10_002, provenance: { editor: 'src00-real-child' } });
  assert.notEqual(child.revision.id, original.revision.id);
  const beforeResolution = structuredClone(await transcriptPersistence.getTranscriptAggregate(original.revision.id));
  assert.equal(beforeResolution.source.activeRevisionId, child.revision.id, 'fixture must prove an active child now exists');
  const result = await registry.resolve(originalReference);
  const afterResolution = await transcriptPersistence.getTranscriptAggregate(original.revision.id);
  assert.equal(result.code, 'RESOLVED');
  assert.equal(result.revisionId, original.revision.id);
  assert.equal(result.integrity, original.revision.contentDigest);
  assert.equal(afterResolution.revision.id, original.revision.id, 'resolution must not substitute active/latest revision');
  assert.deepEqual(afterResolution, beforeResolution, 'resolution must not mutate source or aggregate records');
});

test('real durable backup, restore and reopen preserve mixed SourceRevisionRefs without private payloads', { skip: !productionLoaded }, async () => {
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const resolved = adapter.createRef(coreCard, { extensions: { backupCase: 'resolved' } });
  const tombstoned = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:tombstoned', revisionId: 'tombstone-revision', integrity: 'tombstone-digest', locator: { cardId: 'tombstoned' },
    provenance: { verification: 'unverified', rights: 'unknown', privacy: 'private' }, tombstone: { kind: 'redacted', redacted: true }
  });
  const future = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 2, kind: 'future-private-kind', authority: 'future-owner',
    sourceId: 'future-source', revisionId: 'future-revision-1', integrity: 'future-digest-1', locator: { revisionId: 'future-revision-1' },
    provenance: { verification: 'unverified', rights: 'unknown', privacy: 'private' }, futureProjection: { keep: 'yes' }
  });
  const activity = { id: 'src00-backup-activity', type: 'typing', sourceRevisionRefs: [resolved, tombstoned, future] };
  await v10Persistence.putV10Record(V10_STORES.activities, activity, 'src00-durable-backup-fixture');
  const backup = await combinedBackup.buildCombinedBackup();
  const serialized = JSON.stringify(backup);
  assert.doesNotMatch(serialized, /SOURCE_BODY_MUST_NOT_LEAK|C:\\Users\\private|file:\/\/\//);
  await v10Persistence.putV10Record(V10_STORES.activities, { ...activity, sourceRevisionRefs: [] }, 'src00-durable-backup-mutation');
  const restored = await combinedBackup.restoreCombinedBackup(backup);
  assert.equal(restored.durable, true);
  assert.equal(restored.verified, true);
  await v10Persistence.reopenV10Database();
  const reopened = await v10Persistence.getV10Record(V10_STORES.activities, activity.id);
  assert.deepEqual(reopened.sourceRevisionRefs, activity.sourceRevisionRefs);
  assert.equal((await registry.resolve(reopened.sourceRevisionRefs[0])).code, 'RESOLVED');
  assert.equal((await registry.resolve(reopened.sourceRevisionRefs[1])).code, 'TOMBSTONED');
  const futureResult = await registry.resolve(reopened.sourceRevisionRefs[2]);
  assert.equal(futureResult.code, 'UNSUPPORTED_VERSION');
  assert.equal(futureResult.executable, false);
});

test('unknown future data survives portable JSON projection but remains unresolvable', { skip: !productionLoaded }, async () => {
  const future = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA,
    version: 2,
    kind: 'future-private-kind',
    authority: 'future-owner',
    sourceId: 'future-source',
    revisionId: 'future-revision-1',
    integrity: 'future-digest-1',
    locator: { revisionId: 'future-revision-1' },
    provenance: { verification: 'unverified', rights: 'unknown', privacy: 'private' },
    futureProjection: { keep: 'yes' }
  });
  const backup = JSON.stringify({ refs: [future] });
  const reopened = JSON.parse(backup).refs[0];
  assert.equal(reopened.extensions.futureProjection.keep, 'yes');
  const registry = sourceRevisionRef.createSourceRevisionRegistry();
  const result = await registry.resolve(reopened);
  assert.equal(result.code, 'UNSUPPORTED_VERSION');
  assert.equal(result.executable, false);
});

test('registry has no public-pack adapter and only RESOLVED is executable', { skip: !productionLoaded }, async () => {
  const registry = sourceRevisionRef.createSourceRevisionRegistry();
  const publicPack = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'public-pack', authority: 'public-pack',
    sourceId: 'public-pack:never', revisionId: 'revision-1', integrity: 'digest-1', locator: { revisionId: 'revision-1' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'public' }
  });
  const result = await registry.resolve(publicPack);
  assert.equal(result.code, 'UNSUPPORTED_KIND');
  assert.equal(result.executable, false);
});

test('R4 rejects every normalized sensitive metadata family while preserving safe reference metadata', { skip: !productionLoaded }, () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:r4-sensitive', revisionId: 'revision-r4-sensitive', integrity: 'digest-r4-sensitive', locator: { cardId: 'r4-sensitive' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }
  };
  const forbidden = [
    'secret', 'apiSecret', 'clientSecret', 'credentials', 'credentialValue', 'authorization', 'authorizationHeader',
    'password', 'passwordValue', 'apiKey', 'api_key', 'geminiKey', 'accessToken', 'refreshToken', 'sessionToken',
    'sourceBody', 'sourceBodyHtml', 'sourceText', 'sourceTextRaw', 'transcriptText', 'transcriptTextRaw', 'captionText', 'rawText',
    'prefix_secret_suffix', 'safeApiSecretMetadata', 'source-body-html-copy', 'caption_text_archive'
  ];
  for (const key of forbidden) {
    assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, extensions: { [key]: 'R4_PROTECTED_SENTINEL' } }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR', key);
  }
  const safe = sourceRevisionRef.createSourceRevisionRef({
    ...base,
    integrity: 'safe-content-digest',
    display: { title: 'Safe title', label: 'Safe label' },
    extensions: { contentDigest: 'safe-content-digest', empathy: 'safe semantic tag', safeFutureMetadata: { integrity: 'owner-token' } }
  });
  assert.deepEqual(safe.display, { title: 'Safe title', label: 'Safe label' });
  assert.equal(safe.extensions.contentDigest, 'safe-content-digest');
  assert.equal(safe.extensions.empathy, 'safe semantic tag');
  assert.equal(safe.extensions.safeFutureMetadata.integrity, 'owner-token');
});

test('R4 preserves normalized portable tombstone metadata before any owner lookup', { skip: !productionLoaded }, async () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:r4-tombstone', revisionId: 'revision-r4-tombstone', integrity: 'digest-r4-tombstone', locator: { cardId: 'r4-tombstone' },
    provenance: { verification: 'unverified', rights: 'unknown', privacy: 'private' }
  };
  const registry = sourceRevisionRef.createSourceRevisionRegistry();
  const redacted = await registry.resolve(sourceRevisionRef.createSourceRevisionRef({ ...base, tombstone: { kind: 'redacted', redacted: true } }));
  assert.equal(redacted.code, 'TOMBSTONED');
  assert.equal(redacted.executable, false);
  assert.deepEqual(redacted.tombstone, { kind: 'redacted', redacted: true });
  assert.deepEqual(redacted.provenance, { origin: null, verification: 'unknown', rights: 'unknown', privacy: 'unknown' });
  const deleted = await registry.resolve(sourceRevisionRef.createSourceRevisionRef({ ...base, sourceId: 'core-card:r4-deleted', locator: { cardId: 'r4-deleted' }, tombstone: true }));
  assert.equal(deleted.code, 'TOMBSTONED');
  assert.deepEqual(deleted.tombstone, { kind: 'deleted', redacted: false });
  assert.notDeepEqual(deleted.tombstone, redacted.tombstone);
});

test('R4 rejects executable and mismatched custom-adapter tombstone envelopes without throwing', { skip: !productionLoaded }, async () => {
  const reference = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'r4-synthetic', authority: 'r4-owner',
    sourceId: 'r4:source', revisionId: 'r4-revision', integrity: 'r4-integrity', locator: { id: 'r4' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }
  });
  const ownerRecord = {
    kind: reference.kind, authority: reference.authority, sourceId: reference.sourceId, revisionId: reference.revisionId, integrity: reference.integrity,
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }, locator: { id: 'r4' }, tombstone: { kind: 'redacted', redacted: true }
  };
  const invalidEnvelopes = [
    { code: 'RESOLVED', record: ownerRecord, provenance: ownerRecord.provenance },
    { code: 'TOMBSTONED', record: ownerRecord, provenance: ownerRecord.provenance, tombstone: { kind: 'deleted', redacted: false } }
  ];
  for (const envelope of invalidEnvelopes) {
    const adapter = { kind: reference.kind, version: 1, authority: reference.authority, resolve: async () => envelope };
    const result = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] }).resolve(reference);
    assert.equal(result.code, 'AUTHORITY_UNAVAILABLE');
    assert.equal(result.reason, 'adapter-returned-invalid-resolution');
    assert.equal(result.executable, false);
  }
  const portableAdapter = { kind: reference.kind, version: 1, authority: reference.authority, resolve: async () => ({ code: 'TOMBSTONED', record: ownerRecord, provenance: ownerRecord.provenance }) };
  const portable = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [portableAdapter] }).resolve(reference);
  assert.equal(portable.code, 'TOMBSTONED');
  assert.equal(portable.executable, false);
  assert.deepEqual(portable.tombstone, { kind: 'redacted', redacted: true });
});

test('R4 recursively rejects unsafe Core owner data before revision calculation or owner projection', { skip: !productionLoaded }, async () => {
  const unsafeRows = [
    () => {
      const acceptedBySkill = {};
      Object.defineProperty(acceptedBySkill, 'recall', { enumerable: true, get() { getterCalls += 1; return ['durable']; } });
      return { ...coreCard, acceptedBySkill };
    },
    () => {
      const accepted = [];
      Object.defineProperty(accepted, '0', { enumerable: true, get() { getterCalls += 1; return 'durable'; } });
      accepted.length = 1;
      return { ...coreCard, accepted };
    },
    () => {
      const exercise = {};
      Object.defineProperty(exercise, 'typing', { enumerable: true, get() { getterCalls += 1; return ['durable']; } });
      return { ...coreCard, acceptedByExercise: { recall: exercise } };
    }
  ];
  let getterCalls = 0;
  for (const buildUnsafeRow of unsafeRows) {
    getterCalls = 0;
    const unsafeRow = buildUnsafeRow();
    const creator = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => unsafeRow });
    assert.throws(() => creator.createRef(unsafeRow), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR');
    assert.equal(getterCalls, 0, 'createRef must not invoke nested Core owner accessors');
    const reference = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard }).createRef(coreCard);
    const result = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [creator] }).resolve(reference);
    assert.equal(result.code, 'AUTHORITY_UNAVAILABLE');
    assert.equal(result.executable, false);
    assert.equal(getterCalls, 0, 'registry resolution must not invoke nested Core owner accessors');
  }
});

test('R4 keeps legitimate Core owner body/context data out of the portable reference without applying reference filters to the owner', { skip: !productionLoaded }, () => {
  const owner = {
    ...coreCard,
    front: 'SOURCE_BODY_MUST_NOT_LEAK', back: 'Owner-only translation', example: 'Owner-only example', translation: 'Owner-only meaning',
    sourceContext: 'C:\\Users\\private\\owner-context.txt'
  };
  const reference = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => owner }).createRef(owner);
  const serialized = JSON.stringify(reference);
  assert.doesNotMatch(serialized, /SOURCE_BODY_MUST_NOT_LEAK|C:\\Users\\private|Owner-only translation|Owner-only example|Owner-only meaning/);
  assert.equal(reference.sourceId, `core-card:${owner.id}`);
});

test('R4 rejects nested activity accessors before canonical ActivitySpec validation invokes them', { skip: !productionLoaded }, async () => {
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard });
  const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const reference = adapter.createRef(coreCard);
  const target = { ...activityFor(reference).target };
  let getterCalls = 0;
  Object.defineProperty(target, 'sourceRevision', { enumerable: true, get() { getterCalls += 1; return reference.revisionId; } });
  const result = await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: { ...activityFor(reference), target }, sourceRevisionRef: reference, registry });
  assert.equal(result.code, 'NOT_FOUND');
  assert.equal(result.reason, 'activity-spec-invalid');
  assert.equal(result.executable, false);
  assert.equal(getterCalls, 0);
});

test('R4 rejects registry resolve accessors before invocation', { skip: !productionLoaded }, async () => {
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard });
  const reference = adapter.createRef(coreCard);
  let getterCalls = 0;
  const unsafeRegistry = {};
  Object.defineProperty(unsafeRegistry, 'resolve', { enumerable: true, get() { getterCalls += 1; return async () => ({ code: 'RESOLVED' }); } });
  const result = await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec: activityFor(reference), sourceRevisionRef: reference, registry: unsafeRegistry });
  assert.equal(result.code, 'AUTHORITY_UNAVAILABLE');
  assert.equal(result.reason, 'source-registry-unavailable');
  assert.equal(result.executable, false);
  assert.equal(getterCalls, 0);
});

test('R5 execution accepts resolution authority only from a registry created by this module', { skip: !productionLoaded }, async () => {
  let ownerReads = 0;
  let forgedCalls = 0;
  const adapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { ownerReads += 1; return coreCard; } });
  const trustedRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] });
  const reference = adapter.createRef(coreCard);
  const activitySpec = activityFor(reference);
  const ownerRecord = {
    kind: reference.kind, authority: reference.authority, sourceId: reference.sourceId, revisionId: reference.revisionId, integrity: reference.integrity,
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }, locator: { cardId: coreCard.id, senseId: coreCard.senseId }
  };
  const forgedRegistry = {
    resolve: async () => {
      forgedCalls += 1;
      return { code: 'RESOLVED', executable: true, sourceId: reference.sourceId, revisionId: reference.revisionId, integrity: reference.integrity, provenance: ownerRecord.provenance, record: ownerRecord };
    }
  };
  const wrapperRegistry = { resolve: trustedRegistry.resolve.bind(trustedRegistry) };
  for (const [label, registry] of [['forged', forgedRegistry], ['wrapper', wrapperRegistry]]) {
    ownerReads = 0;
    const result = await sourceRevisionRef.validateSourceRevisionForExecution({ activitySpec, sourceRevisionRef: reference, registry });
    assert.equal(result.code, 'AUTHORITY_UNAVAILABLE', label);
    assert.equal(result.reason, 'source-registry-unavailable', label);
    assert.equal(result.executable, false, label);
    assert.equal(ownerReads, 0, `${label} registry must not reach a source owner`);
  }
  assert.equal(forgedCalls, 0, 'a forged resolve function must never be invoked');
});

test('R5 Core and Transcript adapters fence invalid direct references before owner reads', { skip: !productionLoaded }, async () => {
  let coreReads = 0;
  const coreAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => { coreReads += 1; return coreCard; } });
  const coreReference = coreAdapter.createRef(coreCard);
  const coreCases = [
    ['malformed', { sourceId: coreReference.sourceId }, 'NOT_FOUND'],
    ['version', { ...coreReference, version: 2 }, 'UNSUPPORTED_VERSION'],
    ['kind', { ...coreReference, kind: 'transcript' }, 'UNSUPPORTED_KIND'],
    ['authority', { ...coreReference, authority: 'wrong-core-authority' }, 'NOT_FOUND'],
    ['tombstone', { ...coreReference, tombstone: { kind: 'redacted', redacted: true } }, 'TOMBSTONED'],
    ['locator', { ...coreReference, locator: { cardId: 'wrong-card' } }, 'NOT_FOUND']
  ];
  for (const [label, reference, code] of coreCases) {
    coreReads = 0;
    const result = await coreAdapter.resolve(reference);
    assert.equal(result.code, code, `Core ${label}`);
    assert.equal(result.executable, false, `Core ${label}`);
    assert.equal(coreReads, 0, `Core ${label} must not read the owner`);
    if (label === 'authority') assert.equal(result.reason, 'source-authority-mismatch');
    if (label === 'tombstone') assert.deepEqual(result.provenance, { origin: null, verification: 'unknown', rights: 'unknown', privacy: 'unknown' });
  }

  const transcript = createTranscriptAggregate({
    source: { id: 'transcript-source:r5-direct-fence', namespace: 'private', status: 'verified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Direct fencing must precede transcript reads.', language: 'en', status: 'verified' }],
    createdAt: 50_001
  });
  let transcriptReads = 0;
  const transcriptAdapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => { transcriptReads += 1; return transcript; } });
  const transcriptReference = transcriptAdapter.createRef(transcript);
  const transcriptCases = [
    ['malformed', { sourceId: transcriptReference.sourceId }, 'NOT_FOUND'],
    ['version', { ...transcriptReference, version: 2 }, 'UNSUPPORTED_VERSION'],
    ['kind', { ...transcriptReference, kind: 'core-card' }, 'UNSUPPORTED_KIND'],
    ['authority', { ...transcriptReference, authority: 'wrong-transcript-authority' }, 'NOT_FOUND'],
    ['tombstone', { ...transcriptReference, tombstone: { kind: 'deleted', redacted: false } }, 'TOMBSTONED'],
    ['locator', { ...transcriptReference, locator: { revisionId: 'wrong-revision' } }, 'NOT_FOUND']
  ];
  for (const [label, reference, code] of transcriptCases) {
    transcriptReads = 0;
    const result = await transcriptAdapter.resolve(reference);
    assert.equal(result.code, code, `Transcript ${label}`);
    assert.equal(result.executable, false, `Transcript ${label}`);
    assert.equal(transcriptReads, 0, `Transcript ${label} must not read the owner`);
    if (label === 'authority') assert.equal(result.reason, 'source-authority-mismatch');
    if (label === 'tombstone') assert.deepEqual(result.provenance, { origin: null, verification: 'unknown', rights: 'unknown', privacy: 'unknown' });
  }
});

test('R5 owner identity is checked before projecting Core or Transcript lifecycle state', { skip: !productionLoaded }, async () => {
  const coreReference = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard }).createRef(coreCard);
  const mismatchedCore = { ...coreCard, id: 'r5-other-core-card', tombstone: { kind: 'redacted', redacted: true } };
  const mismatchedCoreResult = await sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => mismatchedCore }).resolve(coreReference);
  assert.equal(mismatchedCoreResult.code, 'NOT_FOUND');
  assert.equal(mismatchedCoreResult.executable, false);
  const exactCore = { ...coreCard, id: 'r5-exact-core-tombstone', tombstone: { kind: 'redacted', redacted: true } };
  const exactCoreAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => exactCore });
  const exactCoreResult = await exactCoreAdapter.resolve(exactCoreAdapter.createRef(exactCore));
  assert.equal(exactCoreResult.code, 'TOMBSTONED');
  assert.deepEqual(exactCoreResult.tombstone, { kind: 'redacted', redacted: true });

  const aggregate = createTranscriptAggregate({
    source: { id: 'transcript-source:r5-owner-identity', namespace: 'private', status: 'verified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Owner identity precedes lifecycle projection.', language: 'en', status: 'verified' }],
    createdAt: 50_002
  });
  const transcriptReference = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => aggregate }).createRef(aggregate);
  for (const owner of [
    { ...aggregate, source: { ...aggregate.source, id: 'transcript-source:r5-wrong-source' }, revision: { ...aggregate.revision, tombstone: { kind: 'redacted', redacted: true } } },
    { ...aggregate, revision: { ...aggregate.revision, id: 'transcript-revision:r5-wrong-revision', tombstone: { kind: 'redacted', redacted: true } } }
  ]) {
    const result = await sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => owner }).resolve(transcriptReference);
    assert.equal(result.code, 'NOT_FOUND');
    assert.equal(result.executable, false);
  }
  const exactTranscript = { ...aggregate, revision: { ...aggregate.revision, tombstone: true } };
  const exactTranscriptAdapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => exactTranscript });
  const exactTranscriptResult = await exactTranscriptAdapter.resolve(exactTranscriptAdapter.createRef(exactTranscript));
  assert.equal(exactTranscriptResult.code, 'TOMBSTONED');
  assert.deepEqual(exactTranscriptResult.tombstone, { kind: 'deleted', redacted: false });
});

test('R5 contradictory custom adapter envelopes fail closed instead of being reinterpreted', { skip: !productionLoaded }, async () => {
  const reference = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'r5-synthetic', authority: 'r5-owner',
    sourceId: 'r5:source', revisionId: 'r5-revision', integrity: 'r5-integrity', locator: { id: 'r5' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }
  });
  const verifiedOwner = {
    kind: reference.kind, authority: reference.authority, sourceId: reference.sourceId, revisionId: reference.revisionId, integrity: reference.integrity,
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }, locator: { id: 'r5' }
  };
  const invalidEnvelopes = [
    { code: 'RESOLVED', executable: false, record: verifiedOwner, provenance: verifiedOwner.provenance },
    { code: 'RESOLVED', record: { ...verifiedOwner, provenance: { verification: 'unknown', rights: 'allowed', privacy: 'private' } }, provenance: { verification: 'unknown', rights: 'allowed', privacy: 'private' } },
    { code: 'RESOLVED', record: { ...verifiedOwner, provenance: { verification: 'verified', rights: 'blocked', privacy: 'private' } }, provenance: { verification: 'verified', rights: 'blocked', privacy: 'private' } },
    { code: 'NOT_FOUND', tombstone: { kind: 'deleted', redacted: false } },
    { code: 'TOMBSTONED' }
  ];
  for (const envelope of invalidEnvelopes) {
    const adapter = { kind: reference.kind, version: 1, authority: reference.authority, resolve: async () => envelope };
    const result = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] }).resolve(reference);
    assert.equal(result.code, 'AUTHORITY_UNAVAILABLE');
    assert.equal(result.reason, 'adapter-returned-invalid-resolution');
    assert.equal(result.executable, false);
  }
});

test('R5 owner trust gaps remain unknown and caller provenance cannot promote Core or Transcript resolution', { skip: !productionLoaded }, async () => {
  const coreWithoutTrust = { ...coreCard };
  delete coreWithoutTrust.sourceVerified;
  delete coreWithoutTrust.sourceProvenance;
  delete coreWithoutTrust.rightsStatus;
  const coreAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreWithoutTrust });
  const coreReference = coreAdapter.createRef(coreWithoutTrust);
  const forgedCoreReference = { ...coreReference, provenance: { origin: 'caller-forgery', verification: 'verified', rights: 'allowed', privacy: 'public' } };
  const coreResult = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [coreAdapter] }).resolve(forgedCoreReference);
  assert.equal(coreResult.code, 'PROVENANCE_INVALID');
  assert.equal(coreResult.executable, false);
  assert.deepEqual(coreResult.provenance, { origin: 'core-card-registry', verification: 'unknown', rights: 'unknown', privacy: 'private' });

  const transcriptWithoutRights = createTranscriptAggregate({
    source: { id: 'transcript-source:r5-trust-gap', namespace: 'private', status: 'verified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Canonical status may verify but cannot invent rights.', language: 'en', status: 'verified' }],
    createdAt: 50_003
  });
  const transcriptAdapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => transcriptWithoutRights });
  const transcriptReference = transcriptAdapter.createRef(transcriptWithoutRights);
  const transcriptResult = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [transcriptAdapter] }).resolve({ ...transcriptReference, provenance: { origin: 'caller-forgery', verification: 'verified', rights: 'allowed', privacy: 'public' } });
  assert.equal(transcriptResult.code, 'RESOLVED');
  assert.equal(transcriptResult.executable, true);
  assert.deepEqual(transcriptResult.provenance, { origin: 'canonical-transcript-registry', verification: 'verified', rights: 'unknown', privacy: 'private' });
});

test('R5 filters dangerous metadata by lexical boundary while preserving safe lookalikes', { skip: !productionLoaded }, () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA, version: 1, kind: 'core-card', authority: 'core-card-registry',
    sourceId: 'core-card:r5-key-boundaries', revisionId: 'revision-r5-key-boundaries', integrity: 'digest-r5-key-boundaries', locator: { cardId: 'r5-key-boundaries' },
    provenance: { verification: 'verified', rights: 'allowed', privacy: 'private' }
  };
  for (const key of ['secret', 'credential', 'authorization', 'password', 'apiKey', 'api_key', 'api-key', 'accessToken', 'access_token', 'access-token', 'refreshToken', 'session-token', 'privatePath', 'private_path', 'private-path', 'sourceBody', 'source_body', 'source-body']) {
    assert.throws(() => sourceRevisionRef.createSourceRevisionRef({ ...base, extensions: { [key]: 'R5_PROTECTED_SENTINEL' } }), error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR', key);
  }
  const safe = sourceRevisionRef.createSourceRevisionRef({
    ...base,
    extensions: { tokenizer: 'unicode-word', tokenizationModel: 'r5-model', secretaryNote: 'ordinary note', empathy: 'safe semantic field', pathology: 'safe domain term' }
  });
  assert.deepEqual(safe.extensions, { empathy: 'safe semantic field', pathology: 'safe domain term', secretaryNote: 'ordinary note', tokenizer: 'unicode-word', tokenizationModel: 'r5-model' });
});

test('R6 reserves canonical Core and Transcript ownership and keeps public-pack unsupported', { skip: !productionLoaded }, async () => {
  let forgedCalls = 0;
  const forgedCore = {
    kind: 'core-card',
    version: 1,
    authority: 'core-card-registry',
    resolve: async () => {
      forgedCalls += 1;
      return { code: 'NOT_FOUND' };
    }
  };
  const forgedTranscript = { ...forgedCore, kind: 'transcript', authority: 'canonical-transcript-registry' };
  const publicPack = { ...forgedCore, kind: 'public-pack', authority: 'public-pack' };
  for (const adapter of [forgedCore, forgedTranscript, publicPack]) {
    assert.throws(() => sourceRevisionRef.createSourceRevisionRegistry({ adapters: [adapter] }));
  }

  const canonicalCore = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard });
  assert.throws(() => sourceRevisionRef.createSourceRevisionRegistry({ adapters: [{ ...canonicalCore }] }));
  const canonicalRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [canonicalCore] });
  assert.deepEqual(canonicalRegistry.ownership(), [{ kind: 'core-card', version: 1, authority: 'core-card-registry' }]);

  const syntheticReference = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA,
    version: 1,
    kind: 'r6-synthetic',
    authority: 'r6-owner',
    sourceId: 'r6:synthetic',
    revisionId: 'r6-revision',
    integrity: 'r6-integrity',
    locator: { id: 'r6' }
  });
  const syntheticRegistry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [{
    kind: 'r6-synthetic', version: 1, authority: 'r6-owner', resolve: async () => ({ code: 'NOT_FOUND' })
  }] });
  assert.equal((await syntheticRegistry.resolve(syntheticReference)).code, 'NOT_FOUND');
  assert.equal(forgedCalls, 0, 'rejected canonical-owner forgeries must never execute');
});

test('R6 validates exact owner identity and integrity before projecting unavailable lifecycle state', { skip: !productionLoaded }, async () => {
  const coreAdapter = sourceRevisionRef.createCoreCardSourceAdapter({ getCard: () => coreCard });
  const coreReference = coreAdapter.createRef(coreCard);
  const mismatchedCore = await sourceRevisionRef.createCoreCardSourceAdapter({
    getCard: () => ({ ...coreCard, id: 'r6-wrong-core', availability: 'unavailable' })
  }).resolve(coreReference);
  assert.equal(mismatchedCore.code, 'NOT_FOUND');

  const changedCore = await sourceRevisionRef.createCoreCardSourceAdapter({
    getCard: () => ({ ...coreCard, front: `${coreCard.front} changed`, availability: 'unavailable' })
  }).resolve(coreReference);
  assert.equal(changedCore.code, 'INTEGRITY_MISMATCH');
  const identitylessCore = await sourceRevisionRef.createCoreCardSourceAdapter({
    getCard: () => ({ availability: 'unavailable' })
  }).resolve(coreReference);
  assert.equal(identitylessCore.code, 'AUTHORITY_UNAVAILABLE');

  const transcript = createTranscriptAggregate({
    source: { id: 'transcript-source:r6-owner-order', namespace: 'private', status: 'verified', complete: true },
    segments: [{ startMs: 0, endMs: 1000, text: 'Identity and integrity precede lifecycle.', language: 'en', status: 'verified' }],
    createdAt: 60_001
  });
  const transcriptAdapter = sourceRevisionRef.createTranscriptSourceAdapter({ getTranscriptAggregate: () => transcript });
  const transcriptReference = transcriptAdapter.createRef(transcript);
  const wrongTranscript = await sourceRevisionRef.createTranscriptSourceAdapter({
    getTranscriptAggregate: () => ({ ...transcript, availability: 'unavailable', source: { ...transcript.source, id: 'transcript-source:r6-wrong' } })
  }).resolve(transcriptReference);
  assert.equal(wrongTranscript.code, 'NOT_FOUND');

  const corruptTranscript = await sourceRevisionRef.createTranscriptSourceAdapter({
    getTranscriptAggregate: () => ({ ...transcript, availability: 'unavailable', revision: { ...transcript.revision, contentDigest: 'sha256:r6-corrupt' } })
  }).resolve(transcriptReference);
  assert.equal(corruptTranscript.code, 'INTEGRITY_MISMATCH');
  const identitylessTranscript = await sourceRevisionRef.createTranscriptSourceAdapter({
    getTranscriptAggregate: () => ({ availability: 'unavailable' })
  }).resolve(transcriptReference);
  assert.equal(identitylessTranscript.code, 'AUTHORITY_UNAVAILABLE');
});

test('R6 rejects every code-specific contradictory custom adapter envelope', { skip: !productionLoaded }, async () => {
  const reference = sourceRevisionRef.createSourceRevisionRef({
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA,
    version: 1,
    kind: 'r6-envelope',
    authority: 'r6-envelope-owner',
    sourceId: 'r6:envelope',
    revisionId: 'r6-envelope-revision',
    integrity: 'r6-envelope-integrity',
    locator: { id: 'r6-envelope' }
  });
  const verified = { verification: 'verified', rights: 'allowed', privacy: 'private' };
  const unknown = { verification: 'unknown', rights: 'unknown', privacy: 'private' };
  const ownerRecord = {
    kind: reference.kind,
    authority: reference.authority,
    sourceId: reference.sourceId,
    revisionId: reference.revisionId,
    integrity: reference.integrity,
    provenance: verified,
    locator: reference.locator
  };
  const contradictions = [
    { code: 'NOT_FOUND', record: ownerRecord, provenance: verified },
    { code: 'NOT_FOUND', provenance: verified },
    { code: 'INTEGRITY_MISMATCH', record: ownerRecord, provenance: verified },
    { code: 'PROVENANCE_INVALID', provenance: verified },
    { code: 'RIGHTS_BLOCKED', provenance: verified },
    { code: 'AUTHORITY_UNAVAILABLE', record: ownerRecord, provenance: verified },
    { code: 'UNSUPPORTED_KIND', record: ownerRecord, provenance: verified },
    { code: 'UNSUPPORTED_VERSION', record: ownerRecord, provenance: verified }
  ];
  for (const envelope of contradictions) {
    const registry = sourceRevisionRef.createSourceRevisionRegistry({ adapters: [{
      kind: reference.kind, version: 1, authority: reference.authority, resolve: async () => envelope
    }] });
    const result = await registry.resolve(reference);
    assert.equal(result.code, 'AUTHORITY_UNAVAILABLE', envelope.code);
    assert.equal(result.reason, 'adapter-returned-invalid-resolution', envelope.code);
    assert.equal(result.executable, false, envelope.code);
  }

  const validProvenanceFailure = await sourceRevisionRef.createSourceRevisionRegistry({ adapters: [{
    kind: reference.kind, version: 1, authority: reference.authority, resolve: async () => ({ code: 'PROVENANCE_INVALID', provenance: unknown })
  }] }).resolve(reference);
  assert.equal(validProvenanceFailure.code, 'PROVENANCE_INVALID');
});

test('R6 rejects flattened sensitive compound keys without rejecting safe lexical lookalikes', { skip: !productionLoaded }, () => {
  const base = {
    schema: sourceRevisionRef.SOURCE_REVISION_REF_SCHEMA,
    version: 1,
    kind: 'r6-privacy',
    authority: 'r6-owner',
    sourceId: 'r6:privacy',
    revisionId: 'r6-privacy-revision',
    integrity: 'r6-privacy-integrity',
    locator: { id: 'r6-privacy' }
  };
  for (const key of [
    'secretvalue', 'SecretValueArchive', 'clientsecret', 'myclientsecret', 'credentialvalue',
    'authorizationheader', 'passwordhash', 'bearertoken', 'cachedbearertokenvalue'
  ]) {
    assert.throws(
      () => sourceRevisionRef.createSourceRevisionRef({ ...base, extensions: { [key]: 'R6_PROTECTED_SENTINEL' } }),
      error => error.code === 'SOURCE_REVISION_VALIDATION_ERROR',
      key
    );
  }
  const safe = sourceRevisionRef.createSourceRevisionRef({
    ...base,
    extensions: { tokenizer: 'unicode-word', tokenizationModel: 'r6-model', secretaryNote: 'ordinary note', empathy: 'safe semantic field', pathology: 'safe domain term' }
  });
  assert.deepEqual(safe.extensions, { empathy: 'safe semantic field', pathology: 'safe domain term', secretaryNote: 'ordinary note', tokenizer: 'unicode-word', tokenizationModel: 'r6-model' });
});
