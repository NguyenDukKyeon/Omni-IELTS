import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKUP_SCHEMA_VERSION,
  buildBackupDocument,
  compactSnapshot,
  createReviewEvent,
  resetLearningProgress,
  stripEmbeddedReviewHistory,
  validateBackupDocument
} from '../src/persistence-core.js';

const baseCard = {
  id: 'card-1',
  front: 'make a decision',
  back: 'đưa ra quyết định',
  type: 'collocation',
  createdAt: 1_700_000_000_000,
  targetSkills: ['recognition', 'recall', 'collocation']
};

test('legacy embedded history migrates without discarding review evidence', () => {
  const { cards, reviewEvents } = stripEmbeddedReviewHistory([{
    ...baseCard,
    reviewHistory: [{ id: 'legacy-1', rating: 3, review: 1_700_000_100_000, skill: 'recall' }]
  }]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].reviewHistory, undefined);
  assert.equal(cards[0].reviewEventCount, 1);
  assert.equal(reviewEvents.length, 1);
  assert.equal(reviewEvents[0].rating, 'good');
  assert.equal(reviewEvents[0].fsrsRating, 3);
});

test('review event has semantic rating, stable identity and assisted metadata', () => {
  const event = createReviewEvent({
    cardId: baseCard.id,
    skill: 'recall',
    exerciseType: 'typing',
    sessionMode: 'today',
    sessionId: 'session-1',
    rating: 1,
    reviewedAt: 1_700_000_200_000,
    assisted: true,
    resultLog: { id: 'log-1', rating: 1, review: 1_700_000_200_000 }
  });
  assert.equal(event.id, 'card-1:recall:log-1');
  assert.equal(event.rating, 'again');
  assert.equal(event.fsrsRating, 1);
  assert.equal(event.assisted, true);
  assert.equal(Object.isFrozen(event), true);
});

test('backup validator rejects duplicate card and review IDs', () => {
  const duplicateCards = validateBackupDocument({
    schemaVersion: BACKUP_SCHEMA_VERSION,
    cards: [baseCard, { ...baseCard }],
    reviewEvents: []
  });
  assert.equal(duplicateCards.valid, false);
  assert.match(duplicateCards.errors.join('\n'), /ID thẻ bị trùng/);

  const event = createReviewEvent({
    cardId: baseCard.id,
    skill: 'recognition',
    exerciseType: 'meaning-choice',
    sessionMode: 'today',
    rating: 3,
    reviewedAt: 1_700_000_300_000,
    resultLog: { id: 'same', rating: 3, review: 1_700_000_300_000 }
  });
  const duplicateEvents = validateBackupDocument({
    schemaVersion: BACKUP_SCHEMA_VERSION,
    cards: [baseCard],
    reviewEvents: [event, { ...event }]
  });
  assert.equal(duplicateEvents.valid, false);
  assert.match(duplicateEvents.errors.join('\n'), /ID lượt ôn bị trùng/);
});

test('backup validator preserves an intentionally empty initialized library', () => {
  const result = validateBackupDocument({
    schemaVersion: BACKUP_SCHEMA_VERSION,
    cards: [],
    reviewEvents: [],
    settings: {},
    fsrsConfig: {},
    metrics: {},
    meta: { databaseInitialized: true }
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.value.cards, []);
  assert.equal(result.value.meta.databaseInitialized, true);
});

test('backup and snapshot contain review events needed for recovery', () => {
  const event = createReviewEvent({
    cardId: baseCard.id,
    skill: 'collocation',
    exerciseType: 'context-cloze',
    sessionMode: 'today',
    rating: 4,
    reviewedAt: 1_700_000_400_000,
    resultLog: { id: 'event-1', rating: 4, review: 1_700_000_400_000 }
  });
  const backup = buildBackupDocument({ cards: [baseCard], reviewEvents: [event] });
  const snapshot = compactSnapshot({ cards: [baseCard], reviewEvents: [event], revision: 7 });
  assert.equal(backup.reviewEvents.length, 1);
  assert.equal(snapshot.reviewEvents.length, 1);
  assert.equal(snapshot.revision, 7);
});

test('explicit reset removes schedules and transfer state but preserves card content', () => {
  const [reset] = resetLearningProgress([{
    ...baseCard,
    status: 'mastered',
    fsrsBySkill: { recall: { due: 1_800_000_000_000, stability: 70, difficulty: 4 } },
    transferPassedAt: 1_700_000_000_000,
    reviewEventCount: 12
  }]);
  assert.equal(reset.front, baseCard.front);
  assert.equal(reset.status, 'new');
  assert.deepEqual(reset.fsrsBySkill, {});
  assert.equal(reset.transferPassedAt, null);
  assert.equal(reset.reviewEventCount, 0);
  assert.equal(reset.pronunciationPractice.lastScore, null);
  assert.equal(reset.pronunciationPractice.bestScore, null);
  assert.deepEqual(reset.pronunciationPractice.commonIssues, []);
});
