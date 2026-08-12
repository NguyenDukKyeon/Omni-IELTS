import { coreSourceRevision } from './schedule-gateway.js';
import { validateActivitySpec } from './learning-contracts.js';

export const SOURCE_REVISION_REF_SCHEMA = 'SourceRevisionRef';
export const SOURCE_REVISION_REF_VERSION = 1;
export const SOURCE_RESOLUTION_CODES = Object.freeze({
  RESOLVED: 'RESOLVED',
  NOT_FOUND: 'NOT_FOUND',
  TOMBSTONED: 'TOMBSTONED',
  UNSUPPORTED_KIND: 'UNSUPPORTED_KIND',
  UNSUPPORTED_VERSION: 'UNSUPPORTED_VERSION',
  INTEGRITY_MISMATCH: 'INTEGRITY_MISMATCH',
  PROVENANCE_INVALID: 'PROVENANCE_INVALID',
  RIGHTS_BLOCKED: 'RIGHTS_BLOCKED',
  AUTHORITY_UNAVAILABLE: 'AUTHORITY_UNAVAILABLE'
});

const CODE_SET = new Set(Object.values(SOURCE_RESOLUTION_CODES));
const MUTABLE_ALIASES = new Set(['active', 'latest', 'current']);
const OWNER_FIELDS = new Set(['schema', 'version', 'kind', 'authority', 'sourceId', 'revisionId', 'integrity', 'locator', 'provenance', 'tombstone']);
const CURRENT_FIELDS = new Set([...OWNER_FIELDS, 'extensions', 'display']);
const MAX_SERIALIZED_LOCATOR_BYTES = 16 * 1024;
const MAX_SERIALIZED_EXTENSIONS_BYTES = 16 * 1024;
const MAX_SERIALIZED_CORE_OWNER_BYTES = 256 * 1024;
const MAX_SERIALIZED_ACTIVITY_BYTES = 64 * 1024;
const MAX_ARRAY_ENTRIES = 256;
const MAX_OBJECT_KEYS = 256;
const MAX_NESTING_DEPTH = 20;
const UNKNOWN_PROVENANCE = Object.freeze({ origin: null, verification: 'unknown', rights: 'unknown', privacy: 'unknown' });
const REGISTRY_INSTANCES = new WeakSet();
const CORE_ADAPTER_INSTANCES = new WeakSet();
const TRANSCRIPT_ADAPTER_INSTANCES = new WeakSet();
const clean = (value, maximum = 500) => String(value ?? '').trim().slice(0, maximum);
const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const CORE_OWNER_CONSUMED_FIELDS = Object.freeze([
  'id', 'senseId', 'front', 'back', 'type', 'example', 'translation', 'sourceContext', 'accepted', 'acceptedBySkill', 'acceptedByExercise',
  'sourceProvenance', 'sourceVerified', 'rightsStatus', 'privacy', 'tombstone', 'deleted', 'redacted', 'availability', 'authorityUnavailable'
]);
const SENSITIVE_KEY_TOKENS = new Set(['secret', 'credential', 'credentials', 'authorization', 'password', 'token', 'path']);
const SENSITIVE_KEY_SEQUENCES = Object.freeze([
  ['api', 'key'], ['gemini', 'key'], ['access', 'token'], ['refresh', 'token'], ['session', 'token'],
  ['source', 'body'], ['source', 'text'], ['transcript', 'text'], ['caption', 'text'], ['raw', 'text'],
  ['private', 'path'], ['absolute', 'path'], ['source', 'path']
]);
const SENSITIVE_COMPACT_PREFIXES = Object.freeze([
  'apikey', 'geminikey', 'accesstoken', 'refreshtoken', 'sessiontoken',
  'sourcebody', 'sourcetext', 'transcripttext', 'captiontext', 'rawtext',
  'privatepath', 'absolutepath', 'sourcepath'
]);
const SENSITIVE_COMPACT_MARKERS = Object.freeze([
  'secretvalue', 'clientsecret', 'credentialvalue', 'authorizationheader', 'passwordhash', 'bearertoken'
]);

function normalizedKey(key) {
  return String(key).replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function lexicalKeyTokens(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(token => token.toLowerCase());
}

function hasKeySequence(tokens, sequence) {
  return tokens.some((token, index) => token === sequence[0] && sequence.every((part, offset) => tokens[index + offset] === part));
}

function forbiddenKey(key) {
  const tokens = lexicalKeyTokens(key);
  const normalized = normalizedKey(key);
  return tokens.some(token => SENSITIVE_KEY_TOKENS.has(token))
    || SENSITIVE_KEY_SEQUENCES.some(sequence => hasKeySequence(tokens, sequence))
    || SENSITIVE_COMPACT_PREFIXES.some(prefix => normalized.startsWith(prefix))
    || SENSITIVE_COMPACT_MARKERS.some(marker => normalized.includes(marker));
}

function validationError(message, detail = null) {
  return Object.assign(new TypeError(message), { code: 'SOURCE_REVISION_VALIDATION_ERROR', detail });
}

function ownerFieldOverride(field) {
  return Object.assign(new TypeError(`SourceRevision owner field ${field} cannot be overridden.`), { code: 'SOURCE_REVISION_OWNER_FIELD_OVERRIDE', field });
}

function privateFilesystemValue(value) {
  return typeof value === 'string' && /^(?:[a-z]:[\\/]|\\\\|\/|file:\/\/)/i.test(value.trim());
}

function dataPropertyDescriptors(value, label) {
  if (!value || typeof value !== 'object') return {};
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor.get || descriptor.set) throw validationError(`${label} contains an accessor property.`, { key });
  }
  return descriptors;
}

function normalizeJson(value, { key = '', depth = 0, label = 'SourceRevisionRef', filterSensitiveKeys = true, rejectPrivateFilesystemValues = true, ancestors = new Set() } = {}) {
  if (depth > MAX_NESTING_DEPTH) throw validationError(`${label} exceeds maximum nesting depth.`, { depth, maximum: MAX_NESTING_DEPTH });
  if (filterSensitiveKeys && forbiddenKey(key)) throw validationError(`${label} contains a sensitive field.`, { key });
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (rejectPrivateFilesystemValues && privateFilesystemValue(value)) throw validationError(`${label} contains a private filesystem location.`, { key });
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw validationError(`${label} contains a non-finite number.`, { key });
    return value;
  }
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') throw validationError(`${label} contains a non-JSON value.`, { key, type: typeof value });
  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw validationError(`${label} contains a cycle.`, { key });
    if (Object.getOwnPropertySymbols(value).length) throw validationError(`${label} contains unsupported property keys.`, { key });
    const descriptors = dataPropertyDescriptors(value, label);
    if (value.length > MAX_ARRAY_ENTRIES) throw validationError(`${label} exceeds maximum array entries.`, { key, maximum: MAX_ARRAY_ENTRIES });
    const unexpected = Object.getOwnPropertyNames(value).filter(name => name !== 'length' && (!/^(?:0|[1-9]\d*)$/.test(name) || Number(name) >= value.length));
    if (unexpected.length) throw validationError(`${label} contains unsupported array properties.`, { key, properties: unexpected.sort() });
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(value);
    const entries = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = descriptors[String(index)];
      if (!descriptor) throw validationError(`${label} contains a sparse array.`, { key, index });
      entries.push(normalizeJson(descriptor.value, { key: String(index), depth: depth + 1, label, filterSensitiveKeys, rejectPrivateFilesystemValues, ancestors: nextAncestors }));
    }
    return entries;
  }
  if (!isPlainObject(value)) throw validationError(`${label} contains an unsupported object prototype.`, { key });
  if (ancestors.has(value)) throw validationError(`${label} contains a cycle.`, { key });
  if (Object.getOwnPropertySymbols(value).length || Object.getOwnPropertyNames(value).some(name => !Object.prototype.propertyIsEnumerable.call(value, name))) throw validationError(`${label} contains unsupported property keys.`, { key });
  const descriptors = dataPropertyDescriptors(value, label);
  const keys = Object.keys(value);
  if (keys.length > MAX_OBJECT_KEYS) throw validationError(`${label} exceeds maximum object keys.`, { key, maximum: MAX_OBJECT_KEYS });
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(value);
  return Object.fromEntries(keys.sort().map(childKey => [childKey, normalizeJson(descriptors[childKey].value, { key: childKey, depth: depth + 1, label, filterSensitiveKeys, rejectPrivateFilesystemValues, ancestors: nextAncestors })]));
}

function serializedBytes(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

function boundedJson(value, label, maximumBytes, { filterSensitiveKeys = true, rejectPrivateFilesystemValues = true } = {}) {
  const normalized = normalizeJson(value, { label, filterSensitiveKeys, rejectPrivateFilesystemValues });
  const bytes = serializedBytes(normalized);
  if (bytes > maximumBytes) throw validationError(`${label} exceeds maximum serialized size.`, { bytes, maximumBytes });
  return normalized;
}

function coreOwnerSnapshot(card, label = 'core card') {
  if (!isPlainObject(card)) throw validationError('card must be an object.');
  const descriptors = dataPropertyDescriptors(card, label);
  const snapshot = {};
  for (const field of CORE_OWNER_CONSUMED_FIELDS) {
    const descriptor = descriptors[field];
    if (!descriptor) continue;
    if (!descriptor.enumerable) throw validationError(`${label} contains a non-enumerable consumed field.`, { field });
    snapshot[field] = normalizeJson(descriptor.value, { key: field, label, filterSensitiveKeys: false, rejectPrivateFilesystemValues: false });
  }
  return boundedJson(snapshot, label, MAX_SERIALIZED_CORE_OWNER_BYTES, { filterSensitiveKeys: false, rejectPrivateFilesystemValues: false });
}

function requiredText(value, label, maximum = 1000) {
  if (typeof value !== 'string') throw validationError(`${label} must be a string.`);
  const normalized = value.trim();
  if (!normalized) throw validationError(`${label} is required.`);
  if (normalized.length > maximum) throw validationError(`${label} exceeds maximum length.`, { maximum });
  if (privateFilesystemValue(normalized)) throw validationError(`${label} cannot be a private filesystem location.`);
  return normalized;
}

function deepFreeze(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const descriptor of Object.values(dataPropertyDescriptors(value, 'SourceRevisionRef'))) deepFreeze(descriptor.value, seen);
  return Object.freeze(value);
}

function safeDisplay(input) {
  if (input == null) return {};
  if (!isPlainObject(input)) throw validationError('display must be an object.');
  dataPropertyDescriptors(input, 'display');
  const keys = Object.keys(input);
  if (keys.some(key => !['title', 'label'].includes(key))) throw validationError('display contains unsupported fields.');
  const display = {};
  for (const key of keys) {
    if (typeof input[key] !== 'string') throw validationError(`display.${key} must be a string.`);
    const value = input[key].trim();
    if (value.length > 240) throw validationError(`display.${key} exceeds maximum length.`);
    if (value) display[key] = value;
  }
  return display;
}

function immutable(value, label) {
  const normalized = requiredText(value, label);
  if (MUTABLE_ALIASES.has(normalized.toLowerCase())) throw new TypeError(`${label} must be an immutable revision, not an active/latest/current alias.`);
  return normalized;
}

function projectProvenance(input = {}) {
  if (input == null) return { origin: null, verification: 'unknown', rights: 'unknown', privacy: 'unknown' };
  if (!isPlainObject(input)) throw validationError('provenance must be an object.');
  dataPropertyDescriptors(input, 'provenance');
  const keys = Object.keys(input);
  if (keys.some(key => !['origin', 'verification', 'rights', 'privacy'].includes(key))) throw validationError('provenance contains unsupported fields.');
  const origin = input.origin == null ? null : requiredText(input.origin, 'provenance.origin', 240);
  const verification = input.verification == null ? 'unknown' : requiredText(input.verification, 'provenance.verification', 40);
  const rights = input.rights == null ? 'unknown' : requiredText(input.rights, 'provenance.rights', 40);
  const privacy = input.privacy == null ? 'unknown' : requiredText(input.privacy, 'provenance.privacy', 40);
  if (!['verified', 'unverified', 'unknown'].includes(verification) || !['allowed', 'blocked', 'unknown'].includes(rights) || !['private', 'shared', 'public', 'unknown'].includes(privacy)) throw validationError('provenance contains unsupported authority values.');
  return { origin, verification, rights, privacy };
}

function projectTombstone(input) {
  if (input == null) return null;
  if (input !== true && !isPlainObject(input)) throw validationError('tombstone must be true or an object.');
  const value = input === true ? {} : input;
  dataPropertyDescriptors(value, 'tombstone');
  if (Object.keys(value).some(key => !['kind', 'reason', 'redacted'].includes(key))) throw validationError('tombstone contains unsupported fields.');
  const reason = value.reason == null ? '' : requiredText(value.reason, 'tombstone.reason', 120);
  const kind = value.kind == null ? reason || 'deleted' : requiredText(value.kind, 'tombstone.kind', 120);
  if (value.redacted != null && typeof value.redacted !== 'boolean') throw validationError('tombstone.redacted must be boolean.');
  return { kind, redacted: value.redacted === true || reason.toLowerCase() === 'redacted' };
}

function ownerProjection({ kind, authority, sourceId, revisionId, integrity, provenance, tombstone = null, locator = null }) {
  const projection = { kind, authority, sourceId, revisionId, integrity, provenance: projectProvenance(provenance), tombstone: projectTombstone(tombstone) };
  if (locator != null) projection.locator = boundedJson(locator, 'owner resolution locator', MAX_SERIALIZED_LOCATOR_BYTES);
  return deepFreeze(projection);
}

function ownerOptions(input = {}) {
  if (!isPlainObject(input)) throw validationError('SourceRevision owner options must be an object.');
  dataPropertyDescriptors(input, 'SourceRevision owner options');
  for (const field of Object.keys(input)) if (OWNER_FIELDS.has(field)) throw ownerFieldOverride(field);
  if (Object.keys(input).some(field => !['display', 'extensions'].includes(field))) throw validationError('SourceRevision owner options contain unsupported fields.');
  normalizeJson(input, { label: 'SourceRevision owner options' });
  return { display: input.display, extensions: input.extensions };
}

function resolution(code, reference = null, { provenance, tombstone, record, reason = null } = {}) {
  const normalizedCode = CODE_SET.has(code) ? code : SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE;
  const value = {
    code: normalizedCode,
    executable: normalizedCode === SOURCE_RESOLUTION_CODES.RESOLVED,
    sourceId: reference?.sourceId ?? null,
    revisionId: reference?.revisionId ?? null,
    integrity: reference?.integrity ?? null,
    provenance: provenance === undefined ? { ...UNKNOWN_PROVENANCE } : projectProvenance(provenance),
    tombstone: tombstone === undefined ? null : projectTombstone(tombstone),
    record: record == null ? null : normalizeJson(record, { label: 'resolution record' }),
    reason: clean(reason, 240) || null
  };
  return deepFreeze(value);
}

export function createSourceRevisionRef(input = {}) {
  if (!isPlainObject(input)) throw validationError('SourceRevisionRef must be an object.');
  normalizeJson(input, { label: 'SourceRevisionRef' });
  const schema = requiredText(input.schema, 'schema', 120);
  if (schema !== SOURCE_REVISION_REF_SCHEMA) throw validationError(`SourceRevisionRef schema must be ${SOURCE_REVISION_REF_SCHEMA}.`);
  const version = input.version;
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) throw validationError('SourceRevisionRef version must be a positive integer.');
  const kind = requiredText(input.kind, 'kind', 120);
  const authority = requiredText(input.authority, 'authority', 180);
  const sourceId = immutable(input.sourceId, 'sourceId');
  const revisionId = immutable(input.revisionId, 'revisionId');
  const integrity = immutable(input.integrity, 'integrity');
  const unknownTopLevel = Object.keys(input).filter(key => !CURRENT_FIELDS.has(key));
  if (version === SOURCE_REVISION_REF_VERSION && unknownTopLevel.length) throw validationError('Current SourceRevisionRef version contains unknown top-level fields.', { fields: unknownTopLevel.sort() });
  if (!isPlainObject(input.locator)) throw validationError('locator must be an object.');
  const locator = boundedJson(input.locator, 'locator', MAX_SERIALIZED_LOCATOR_BYTES);
  if (input.extensions != null && !isPlainObject(input.extensions)) throw validationError('extensions must be an object.');
  const extensions = boundedJson({ ...(input.extensions ?? {}), ...(version === SOURCE_REVISION_REF_VERSION ? {} : Object.fromEntries(unknownTopLevel.map(key => [key, input[key]])) ) }, 'extensions', MAX_SERIALIZED_EXTENSIONS_BYTES);
  const ref = {
    schema,
    version,
    kind,
    authority,
    sourceId,
    revisionId,
    integrity,
    locator,
    provenance: projectProvenance(input.provenance),
    tombstone: projectTombstone(input.tombstone),
    display: safeDisplay(input.display),
    extensions
  };
  return deepFreeze(ref);
}

function coreOwnerProvenance(card = {}) {
  const projected = projectProvenance(card.sourceProvenance);
  const sourceVerified = card.sourceVerified;
  const rightsStatus = clean(card.rightsStatus, 40);
  const privacy = clean(card.privacy, 40);
  return {
    origin: projected.origin || 'core-card-registry',
    verification: sourceVerified === false || projected.verification === 'unverified'
      ? 'unverified'
      : sourceVerified === true || projected.verification === 'verified'
        ? 'verified'
        : 'unknown',
    rights: rightsStatus === 'blocked' || projected.rights === 'blocked'
      ? 'blocked'
      : rightsStatus === 'allowed'
        ? 'allowed'
        : projected.rights,
    privacy: ['private', 'shared', 'public'].includes(privacy) ? privacy : projected.privacy === 'unknown' ? 'private' : projected.privacy
  };
}

function exactLocator(locator, expected) {
  const expectedKeys = Object.keys(expected);
  return isPlainObject(locator)
    && Object.keys(locator).length === expectedKeys.length
    && expectedKeys.every(key => locator[key] === expected[key]);
}

function fenceBuiltInReference(reference, adapter) {
  let canonical;
  try {
    canonical = createSourceRevisionRef(reference);
  } catch {
    return { result: resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'immutable-reference-required' }) };
  }
  if (canonical.version !== adapter.version) return { result: resolution(SOURCE_RESOLUTION_CODES.UNSUPPORTED_VERSION, canonical, { reason: 'future-reference-version' }) };
  if (canonical.kind !== adapter.kind) return { result: resolution(SOURCE_RESOLUTION_CODES.UNSUPPORTED_KIND, canonical, { reason: 'source-kind-mismatch' }) };
  if (canonical.authority !== adapter.authority) return { result: resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'source-authority-mismatch' }) };
  if (canonical.tombstone) return { result: resolution(SOURCE_RESOLUTION_CODES.TOMBSTONED, canonical, { tombstone: canonical.tombstone, reason: 'source-reference-tombstoned' }) };
  return { canonical };
}

function adapterConfiguration(input, readerName, defaultAuthority, label) {
  if (!isPlainObject(input)) throw validationError(`${label} options must be an object.`);
  dataPropertyDescriptors(input, `${label} options`);
  if (Object.keys(input).some(key => ![readerName, 'authority'].includes(key))) throw validationError(`${label} options contain unsupported fields.`);
  const reader = input[readerName];
  if (typeof reader !== 'function') throw new TypeError(`${label} requires ${readerName}.`);
  const authority = input.authority === undefined ? defaultAuthority : requiredText(input.authority, `${label}.authority`, 180);
  return { reader, authority };
}

export function createCoreCardSourceAdapter(input = {}) {
  const { reader: getCard, authority } = adapterConfiguration(input, 'getCard', 'core-card-registry', 'Core source adapter');
  if (typeof getCard !== 'function') throw new TypeError('Core source adapter requires getCard.');
  const adapter = {
    kind: 'core-card',
    version: SOURCE_REVISION_REF_VERSION,
    authority,
    createRef(card = {}, input = {}) {
      const options = ownerOptions(input);
      const owner = coreOwnerSnapshot(card);
      const cardId = immutable(owner.id, 'card.id');
      const revisionId = coreSourceRevision(owner);
      const reference = {
        schema: SOURCE_REVISION_REF_SCHEMA,
        version: SOURCE_REVISION_REF_VERSION,
        kind: 'core-card',
        authority: adapter.authority,
        sourceId: `core-card:${cardId}`,
        revisionId,
        integrity: revisionId,
        locator: { cardId },
        provenance: coreOwnerProvenance(owner)
      };
      if (owner.tombstone != null) reference.tombstone = owner.tombstone;
      if (options.display !== undefined) reference.display = options.display;
      if (options.extensions !== undefined) reference.extensions = options.extensions;
      return createSourceRevisionRef(reference);
    },
    async resolve(reference) {
      const fenced = fenceBuiltInReference(reference, adapter);
      if (fenced.result) return fenced.result;
      const { canonical } = fenced;
      const cardId = canonical.sourceId.startsWith('core-card:') ? canonical.sourceId.slice('core-card:'.length) : '';
      if (!cardId || !exactLocator(canonical.locator, { cardId })) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'source-locator-mismatch' });
      let card;
      try {
        card = await getCard(cardId);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'core-card-owner-unavailable' });
      }
      if (!card) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'core-card-not-found' });
      if (!isPlainObject(card)) return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'core-card-owner-invalid' });
      let owner;
      try {
        owner = coreOwnerSnapshot(card);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'core-card-owner-invalid' });
      }
      const unavailable = owner.availability === 'unavailable' || owner.authorityUnavailable === true;
      const ownerId = clean(owner.id, 240);
      if (!ownerId && unavailable) return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'core-card-owner-unavailable' });
      if (`core-card:${ownerId}` !== canonical.sourceId) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'core-card-source-mismatch' });
      let actualRevision;
      try {
        actualRevision = coreSourceRevision(owner);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'core-card-owner-invalid' });
      }
      if (canonical.revisionId !== actualRevision || canonical.integrity !== actualRevision) return resolution(SOURCE_RESOLUTION_CODES.INTEGRITY_MISMATCH, canonical, { reason: 'core-card-revision-mismatch' });
      if (unavailable) return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'core-card-owner-unavailable' });
      const provenance = coreOwnerProvenance(owner);
      if (owner.tombstone || owner.deleted === true || owner.redacted === true) return resolution(SOURCE_RESOLUTION_CODES.TOMBSTONED, canonical, { provenance, tombstone: owner.tombstone ?? { kind: owner.redacted ? 'redacted' : 'deleted', redacted: owner.redacted === true }, reason: 'core-card-tombstoned' });
      if (provenance.rights === 'blocked') return resolution(SOURCE_RESOLUTION_CODES.RIGHTS_BLOCKED, canonical, { provenance, reason: 'core-card-rights-blocked' });
      if (provenance.verification !== 'verified') return resolution(SOURCE_RESOLUTION_CODES.PROVENANCE_INVALID, canonical, { provenance, reason: 'core-card-provenance-unverified' });
      return resolution(SOURCE_RESOLUTION_CODES.RESOLVED, canonical, {
        provenance,
        record: ownerProjection({ kind: adapter.kind, authority: adapter.authority, sourceId: canonical.sourceId, revisionId: canonical.revisionId, integrity: canonical.integrity, provenance, locator: { cardId, senseId: immutable(owner.senseId, 'card.senseId') } })
      });
    }
  };
  CORE_ADAPTER_INSTANCES.add(adapter);
  return Object.freeze(adapter);
}

function transcriptOwnerProvenance(aggregate = {}) {
  const revisionProvenance = projectProvenance(aggregate.revision?.provenance);
  const sourceProvenance = projectProvenance(aggregate.source?.provenance);
  const revisionStatus = clean(aggregate.revision?.status, 40);
  const revisionRights = clean(aggregate.revision?.rightsStatus, 40);
  const sourceRights = clean(aggregate.source?.rightsStatus, 40);
  const verification = [
    revisionStatus === 'verified' ? 'verified' : revisionStatus === 'unverified' ? 'unverified' : 'unknown',
    revisionProvenance.verification,
    sourceProvenance.verification
  ];
  const rights = [revisionRights, sourceRights, revisionProvenance.rights, sourceProvenance.rights];
  return {
    origin: revisionProvenance.origin || sourceProvenance.origin || 'canonical-transcript-registry',
    verification: verification.includes('unverified')
      ? 'unverified'
      : verification.includes('verified')
        ? 'verified'
        : 'unknown',
    rights: rights.includes('blocked')
      ? 'blocked'
      : rights.includes('allowed')
        ? 'allowed'
        : 'unknown',
    privacy: ['private', 'shared', 'public'].includes(clean(aggregate.source?.namespace, 40))
      ? clean(aggregate.source.namespace, 40)
      : revisionProvenance.privacy !== 'unknown'
        ? revisionProvenance.privacy
        : sourceProvenance.privacy === 'unknown' ? 'private' : sourceProvenance.privacy
  };
}

export function createTranscriptSourceAdapter(input = {}) {
  const { reader: getTranscriptAggregate, authority } = adapterConfiguration(input, 'getTranscriptAggregate', 'canonical-transcript-registry', 'Transcript source adapter');
  if (typeof getTranscriptAggregate !== 'function') throw new TypeError('Transcript source adapter requires getTranscriptAggregate.');
  const adapter = {
    kind: 'transcript',
    version: SOURCE_REVISION_REF_VERSION,
    authority,
    createRef(aggregate = {}, input = {}) {
      const options = ownerOptions(input);
      if (!isPlainObject(aggregate)) throw validationError('transcript aggregate must contain source and revision objects.');
      dataPropertyDescriptors(aggregate, 'transcript aggregate');
      if (!isPlainObject(aggregate.source) || !isPlainObject(aggregate.revision)) throw validationError('transcript aggregate must contain source and revision objects.');
      dataPropertyDescriptors(aggregate.source, 'transcript source');
      dataPropertyDescriptors(aggregate.revision, 'transcript revision');
      const sourceId = immutable(aggregate.source?.id, 'transcript.source.id');
      const revisionId = immutable(aggregate.revision?.id, 'transcript.revision.id');
      const integrity = immutable(aggregate.revision?.contentDigest, 'transcript.revision.contentDigest');
      const reference = {
        schema: SOURCE_REVISION_REF_SCHEMA,
        version: SOURCE_REVISION_REF_VERSION,
        kind: 'transcript',
        authority: adapter.authority,
        sourceId,
        revisionId,
        integrity,
        locator: { revisionId },
        provenance: transcriptOwnerProvenance(aggregate)
      };
      const tombstone = aggregate.revision?.tombstone ?? aggregate.source?.tombstone;
      if (tombstone != null) reference.tombstone = tombstone;
      if (options.display !== undefined) reference.display = options.display;
      if (options.extensions !== undefined) reference.extensions = options.extensions;
      return createSourceRevisionRef(reference);
    },
    async resolve(reference) {
      const fenced = fenceBuiltInReference(reference, adapter);
      if (fenced.result) return fenced.result;
      const { canonical } = fenced;
      if (!exactLocator(canonical.locator, { revisionId: canonical.revisionId })) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'source-locator-mismatch' });
      let aggregate;
      try {
        aggregate = await getTranscriptAggregate(canonical.revisionId);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-unavailable' });
      }
      if (!aggregate) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'transcript-revision-not-found' });
      if (!isPlainObject(aggregate)) return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-invalid' });
      try {
        dataPropertyDescriptors(aggregate, 'transcript aggregate');
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-invalid' });
      }
      const aggregateUnavailable = aggregate.availability === 'unavailable';
      if (!aggregate.source || !aggregate.revision) {
        return aggregateUnavailable
          ? resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-unavailable' })
          : resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'transcript-revision-not-found' });
      }
      if (!isPlainObject(aggregate.source) || !isPlainObject(aggregate.revision)) return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-invalid' });
      try {
        dataPropertyDescriptors(aggregate.source, 'transcript source');
        dataPropertyDescriptors(aggregate.revision, 'transcript revision');
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-invalid' });
      }
      if (aggregate.source.id !== canonical.sourceId || aggregate.revision.id !== canonical.revisionId) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'transcript-identity-mismatch' });
      if (aggregate.revision.contentDigest !== canonical.integrity) return resolution(SOURCE_RESOLUTION_CODES.INTEGRITY_MISMATCH, canonical, { reason: 'transcript-content-digest-mismatch' });
      if (aggregateUnavailable || aggregate.source.availability === 'unavailable') return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'transcript-owner-unavailable' });
      const provenance = transcriptOwnerProvenance(aggregate);
      const tombstone = aggregate.revision.tombstone ?? aggregate.source.tombstone ?? (aggregate.revision.redacted || aggregate.source.redacted ? { kind: 'redacted', redacted: true } : null);
      if (tombstone || aggregate.revision.deleted === true || aggregate.source.deleted === true) return resolution(SOURCE_RESOLUTION_CODES.TOMBSTONED, canonical, { provenance, tombstone: tombstone ?? { kind: 'deleted' }, reason: 'transcript-tombstoned' });
      if (provenance.rights === 'blocked') return resolution(SOURCE_RESOLUTION_CODES.RIGHTS_BLOCKED, canonical, { provenance, reason: 'transcript-rights-blocked' });
      if (provenance.verification !== 'verified') return resolution(SOURCE_RESOLUTION_CODES.PROVENANCE_INVALID, canonical, { provenance, reason: 'transcript-provenance-unverified' });
      return resolution(SOURCE_RESOLUTION_CODES.RESOLVED, canonical, {
        provenance,
        record: ownerProjection({ kind: adapter.kind, authority: adapter.authority, sourceId: canonical.sourceId, revisionId: canonical.revisionId, integrity: canonical.integrity, provenance, locator: { revisionId: canonical.revisionId } })
      });
    }
  };
  TRANSCRIPT_ADAPTER_INSTANCES.add(adapter);
  return Object.freeze(adapter);
}

function adapterHeader(adapter) {
  if (!isPlainObject(adapter)) throw new TypeError('SourceRevision adapter must be an object.');
  dataPropertyDescriptors(adapter, 'SourceRevision adapter');
  if (typeof adapter.resolve !== 'function') throw new TypeError('SourceRevision adapter requires a resolve function.');
  if (typeof adapter.kind !== 'string' || typeof adapter.authority !== 'string' || typeof adapter.version !== 'number') throw new TypeError('SourceRevision adapter requires string kind/authority and numeric version.');
  const kind = adapter.kind.trim();
  const authority = adapter.authority.trim();
  const version = adapter.version;
  if (!kind || !authority || !Number.isSafeInteger(version) || version < 1) throw new TypeError('SourceRevision adapter requires kind, positive version and authority.');
  return { kind, version, authority, resolve: adapter.resolve };
}

function registryResolveFunction(registry) {
  if (!registry || (typeof registry !== 'object' && typeof registry !== 'function')) return null;
  if (!REGISTRY_INSTANCES.has(registry)) return null;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(registry, 'resolve');
    if (!descriptor || descriptor.get || descriptor.set || typeof descriptor.value !== 'function') return null;
    return descriptor.value;
  } catch {
    return null;
  }
}

function validatedOwnerRecord(record, reference) {
  const normalized = boundedJson(record, 'adapter resolution record', MAX_SERIALIZED_LOCATOR_BYTES);
  if (!isPlainObject(normalized)) throw validationError('adapter resolution record must be an object.');
  const allowed = new Set(['kind', 'authority', 'sourceId', 'revisionId', 'integrity', 'provenance', 'tombstone', 'locator']);
  if (Object.keys(normalized).some(key => !allowed.has(key))) throw validationError('adapter resolution record contains unsupported fields.');
  for (const key of ['kind', 'authority', 'sourceId', 'revisionId', 'integrity']) {
    if (typeof normalized[key] !== 'string' || normalized[key] !== reference[key]) throw validationError('adapter resolution record is not exactly bound to the reference.', { key });
  }
  const provenance = projectProvenance(normalized.provenance);
  const tombstone = projectTombstone(normalized.tombstone);
  const locator = normalized.locator === undefined ? undefined : boundedJson(normalized.locator, 'adapter resolution record locator', MAX_SERIALIZED_LOCATOR_BYTES);
  return {
    record: { ...normalized, provenance, tombstone, ...(locator === undefined ? {} : { locator }) },
    provenance,
    tombstone,
    hasTombstone: Object.prototype.hasOwnProperty.call(normalized, 'tombstone')
  };
}

function validatedAdapterResolution(result, reference) {
  const normalized = normalizeJson(result, { label: 'adapter resolution' });
  if (!isPlainObject(normalized) || typeof normalized.code !== 'string' || !CODE_SET.has(normalized.code)) throw validationError('adapter returned an invalid resolution code.');
  const allowed = new Set(['code', 'executable', 'sourceId', 'revisionId', 'integrity', 'provenance', 'tombstone', 'record', 'reason']);
  if (Object.keys(normalized).some(key => !allowed.has(key))) throw validationError('adapter resolution contains unsupported fields.');
  if (normalized.executable !== undefined && (typeof normalized.executable !== 'boolean' || normalized.executable !== (normalized.code === SOURCE_RESOLUTION_CODES.RESOLVED))) throw validationError('adapter resolution executable state contradicts its code.');
  for (const key of ['sourceId', 'revisionId', 'integrity']) {
    if (normalized[key] !== undefined && (typeof normalized[key] !== 'string' || normalized[key] !== reference[key])) throw validationError('adapter resolution is not exactly bound to the reference.', { key });
  }
  if (normalized.reason != null && typeof normalized.reason !== 'string') throw validationError('adapter resolution reason must be a string.');
  let provenance = normalized.provenance === undefined ? undefined : projectProvenance(normalized.provenance);
  const tombstone = normalized.tombstone === undefined ? undefined : projectTombstone(normalized.tombstone);
  let record = null;
  let owner = null;
  if (normalized.record != null) {
    owner = validatedOwnerRecord(normalized.record, reference);
    record = owner.record;
    if (provenance === undefined) provenance = owner.provenance;
    if (JSON.stringify(provenance) !== JSON.stringify(owner.provenance)) throw validationError('adapter resolution provenance must match its owner record.');
  }
  if (owner && tombstone !== undefined && owner.hasTombstone && JSON.stringify(tombstone) !== JSON.stringify(owner.tombstone)) throw validationError('adapter resolution tombstone must match its owner record.');
  const effectiveTombstone = tombstone === undefined ? owner?.tombstone : tombstone;
  if (normalized.code === SOURCE_RESOLUTION_CODES.TOMBSTONED) {
    if (effectiveTombstone == null) throw validationError('tombstoned adapter result requires tombstone metadata.');
  } else if (tombstone != null || owner?.tombstone != null) {
    throw validationError('non-tombstoned adapter result cannot carry tombstone metadata.');
  }
  if (normalized.code === SOURCE_RESOLUTION_CODES.RESOLVED) {
    if (!record || !owner || effectiveTombstone != null || provenance?.verification !== 'verified' || provenance.rights === 'blocked') throw validationError('resolved adapter result requires a verified, non-tombstoned owner record.');
  }
  const provenanceIsUnknown = provenance === undefined
    || (provenance.origin === null && provenance.verification === 'unknown' && provenance.rights === 'unknown' && provenance.privacy === 'unknown');
  if ([SOURCE_RESOLUTION_CODES.NOT_FOUND, SOURCE_RESOLUTION_CODES.UNSUPPORTED_KIND, SOURCE_RESOLUTION_CODES.UNSUPPORTED_VERSION].includes(normalized.code)) {
    if (record || !provenanceIsUnknown) throw validationError('unresolved adapter result cannot carry owner state or promoted provenance.');
  }
  if (normalized.code === SOURCE_RESOLUTION_CODES.INTEGRITY_MISMATCH && record) throw validationError('integrity mismatch cannot carry an exactly matching owner record.');
  if (normalized.code === SOURCE_RESOLUTION_CODES.PROVENANCE_INVALID && provenance?.verification === 'verified') throw validationError('invalid provenance result cannot claim verified provenance.');
  if (normalized.code === SOURCE_RESOLUTION_CODES.RIGHTS_BLOCKED && provenance?.rights !== 'blocked') throw validationError('rights-blocked result requires blocked owner rights.');
  if (normalized.code === SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE && record) throw validationError('unavailable authority result cannot carry an available owner record.');
  return { code: normalized.code, provenance, tombstone: effectiveTombstone, record, reason: normalized.reason ?? null };
}

function assertAdapterOwnership(adapter, kind) {
  if (kind === 'public-pack') throw validationError('public-pack source adapters are not supported by this package.');
  if (kind === 'core-card' && !CORE_ADAPTER_INSTANCES.has(adapter)) throw validationError('core-card adapter ownership is reserved for the canonical Core adapter.');
  if (kind === 'transcript' && !TRANSCRIPT_ADAPTER_INSTANCES.has(adapter)) throw validationError('transcript adapter ownership is reserved for the canonical Transcript adapter.');
}

export function createSourceRevisionRegistry(input = {}) {
  if (!isPlainObject(input)) throw validationError('SourceRevision registry options must be an object.');
  dataPropertyDescriptors(input, 'SourceRevision registry options');
  if (Object.keys(input).some(key => key !== 'adapters')) throw validationError('SourceRevision registry options contain unsupported fields.');
  const adapters = input.adapters === undefined ? [] : input.adapters;
  if (!Array.isArray(adapters)) throw validationError('SourceRevision registry adapters must be an array.');
  dataPropertyDescriptors(adapters, 'SourceRevision registry adapters');
  const owners = new Map();
  const ownerKey = ({ kind, version }) => `${kind}@${version}`;
  const registry = {
    register(adapter) {
      const { kind, version, authority, resolve } = adapterHeader(adapter);
      assertAdapterOwnership(adapter, kind);
      const key = ownerKey({ kind, version });
      if (owners.has(key)) throw Object.assign(new Error(`SourceRevision adapter ownership is duplicate for ${key}.`), { code: 'SOURCE_REVISION_DUPLICATE_OWNER', key });
      owners.set(key, Object.freeze({ kind, version, authority, resolve }));
      return registry;
    },
    async resolve(input) {
      let reference;
      try {
        reference = createSourceRevisionRef(input);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'immutable-reference-required' });
      }
      if (reference.version !== SOURCE_REVISION_REF_VERSION) return resolution(SOURCE_RESOLUTION_CODES.UNSUPPORTED_VERSION, reference, { reason: 'future-reference-version' });
      if (reference.tombstone) return resolution(SOURCE_RESOLUTION_CODES.TOMBSTONED, reference, { tombstone: reference.tombstone, reason: 'source-reference-tombstoned' });
      const sameKind = [...owners.values()].filter(owner => owner.kind === reference.kind);
      if (!sameKind.length) return resolution(SOURCE_RESOLUTION_CODES.UNSUPPORTED_KIND, reference, { reason: 'unregistered-source-kind' });
      const adapter = owners.get(ownerKey(reference));
      if (!adapter) return resolution(SOURCE_RESOLUTION_CODES.UNSUPPORTED_KIND, reference, { reason: 'unregistered-source-kind' });
      if (adapter.authority !== reference.authority) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, reference, { reason: 'source-authority-mismatch' });
      let result;
      try {
        result = await adapter.resolve(reference);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, reference, { reason: 'adapter-resolution-failed' });
      }
      try {
        const validated = validatedAdapterResolution(result, reference);
        return resolution(validated.code, reference, validated);
      } catch {
        return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, reference, { reason: 'adapter-returned-invalid-resolution' });
      }
    },
    ownership() {
      return Object.freeze([...owners.values()].map(({ kind, version, authority }) => Object.freeze({ kind, version, authority })).sort((left, right) => ownerKey(left).localeCompare(ownerKey(right))));
    }
  };
  for (const adapter of adapters) registry.register(adapter);
  REGISTRY_INSTANCES.add(registry);
  return Object.freeze(registry);
}

export async function validateSourceRevisionForExecution(input = {}) {
  if (!isPlainObject(input)) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'activity-spec-invalid' });
  try {
    dataPropertyDescriptors(input, 'execution validation options');
  } catch {
    return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'activity-spec-invalid' });
  }
  const { activitySpec = null, sourceRevisionRef = null, ref = null, registry = null } = input;
  let activityValidation;
  try {
    activityValidation = validateActivitySpec(boundedJson(activitySpec, 'execution ActivitySpec', MAX_SERIALIZED_ACTIVITY_BYTES, { filterSensitiveKeys: false }));
  } catch {
    return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'activity-spec-invalid' });
  }
  if (!activityValidation.valid) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'activity-spec-invalid' });
  const target = activityValidation.value.target;
  const targetSourceId = clean(target?.sourceId, 1000);
  const targetRevision = clean(target?.sourceRevision, 1000);
  if (!targetSourceId || !targetRevision || MUTABLE_ALIASES.has(targetRevision.toLowerCase())) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'activity-spec-invalid' });
  const reference = sourceRevisionRef ?? ref;
  if (!reference) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'immutable-reference-required' });
  let canonical;
  try {
    canonical = createSourceRevisionRef(reference);
  } catch {
    return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, null, { reason: 'immutable-reference-required' });
  }
  if (targetSourceId !== canonical.sourceId || targetRevision !== canonical.revisionId) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'activity-target-is-not-exactly-bound-to-reference' });
  if (canonical.kind === 'core-card' && target.cardId !== canonical.locator.cardId) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { reason: 'activity-target-is-not-exactly-bound-to-reference' });
  const resolveRegistry = registryResolveFunction(registry);
  if (!resolveRegistry) return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'source-registry-unavailable' });
  let result;
  try {
    result = await resolveRegistry.call(registry, canonical);
  } catch {
    return resolution(SOURCE_RESOLUTION_CODES.AUTHORITY_UNAVAILABLE, canonical, { reason: 'source-registry-unavailable' });
  }
  if (canonical.kind !== 'core-card' || result.code !== SOURCE_RESOLUTION_CODES.RESOLVED) return result;
  if (result.record?.locator?.cardId !== target.cardId || result.record?.locator?.senseId !== target.senseId) return resolution(SOURCE_RESOLUTION_CODES.NOT_FOUND, canonical, { provenance: result.provenance, reason: 'activity-target-is-not-exactly-bound-to-reference' });
  return result;
}
