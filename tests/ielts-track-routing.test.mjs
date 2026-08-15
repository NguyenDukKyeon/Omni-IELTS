import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB = new IDBFactory();
globalThis.IDBKeyRange = IDBKeyRange;

const domain = await import('../src/ielts-domain.js');
const persistence = await import('../src/ielts-persistence.js');

test('IELTS tracks define academic and general-training and fail closed on invalid values', () => {
  assert.ok(Array.isArray(domain.IELTS_TRACKS));
  assert.deepEqual([...domain.IELTS_TRACKS].sort(), ['academic', 'general-training']);
  assert.equal(Object.isFrozen(domain.IELTS_TRACKS), true);

  assert.deepEqual(domain.validateIeltsTrack('academic'), { valid: true, track: 'academic' });
  assert.deepEqual(domain.validateIeltsTrack('general-training'), { valid: true, track: 'general-training' });

  assert.equal(domain.validateIeltsTrack('general').valid, false);
  assert.equal(domain.validateIeltsTrack('academic-ukvi').valid, false);
  assert.equal(domain.validateIeltsTrack('').valid, false);
  assert.equal(domain.validateIeltsTrack(null).valid, false);
  assert.equal(domain.validateIeltsTrack(undefined).valid, false);
  assert.equal(domain.validateIeltsTrack(123).valid, false);
});

test('track resolution respects launch-scoped override > saved preference > no silent default', () => {
  // 1. Launch override takes precedence over saved preference
  const overrideRes = domain.resolveIeltsTrack({
    launchOverride: 'general-training',
    savedPreference: 'academic'
  });
  assert.equal(overrideRes.valid, true);
  assert.equal(overrideRes.track, 'general-training');
  assert.equal(overrideRes.source, 'launch-override');

  // 2. Saved preference is used when no launch override provided
  const savedRes = domain.resolveIeltsTrack({
    launchOverride: null,
    savedPreference: 'academic'
  });
  assert.equal(savedRes.valid, true);
  assert.equal(savedRes.track, 'academic');
  assert.equal(savedRes.source, 'saved-preference');

  // 3. No silent default fallback when both are absent or invalid (fail closed)
  const emptyRes = domain.resolveIeltsTrack({
    launchOverride: null,
    savedPreference: null
  });
  assert.equal(emptyRes.valid, false);
  assert.equal(emptyRes.track, null);
  assert.match(emptyRes.error, /explicit track selection required/i);

  // 4. Invalid launch override fails closed even if saved preference is valid
  const invalidOverride = domain.resolveIeltsTrack({
    launchOverride: 'invalid-track',
    savedPreference: 'academic'
  });
  assert.equal(invalidOverride.valid, false);
  assert.match(invalidOverride.error, /invalid launch track override/i);
});

test('track settings persistence saves and restores active track preference', async () => {
  await persistence.clearIeltsData?.();

  // Initially unset
  const initial = await persistence.getSelectedIeltsTrack();
  assert.equal(initial, null);

  // Save preference
  const saved = await persistence.setSelectedIeltsTrack('general-training');
  assert.equal(saved, 'general-training');

  // Read back
  const retrieved = await persistence.getSelectedIeltsTrack();
  assert.equal(retrieved, 'general-training');

  // Switch to academic
  await persistence.setSelectedIeltsTrack('academic');
  assert.equal(await persistence.getSelectedIeltsTrack(), 'academic');

  // Invalid track rejected without mutating
  await assert.rejects(
    () => persistence.setSelectedIeltsTrack('invalid'),
    error => error.code === 'INVALID_IELTS_TRACK' || /invalid track/i.test(error.message)
  );
  assert.equal(await persistence.getSelectedIeltsTrack(), 'academic');
});
