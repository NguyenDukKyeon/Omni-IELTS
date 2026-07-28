import { createEmptyCard, fsrs, Rating, State } from 'ts-fsrs';

export const FSRS_VERSION = 6;
export const FSRS_CONFIG_KEY = 'vocab-master-fsrs-config-v1';
export const FSRS_SKILLS = Object.freeze(['recognition', 'recall', 'listening', 'collocation', 'production']);
export const MASTERED_STABILITY_DAYS = 60;

export const DEFAULT_FSRS_CONFIG = Object.freeze({
  requestRetention: 0.9,
  maximumInterval: 36500,
  enableFuzz: true,
  enableShortTerm: true,
  learningSteps: ['10m'],
  relearningSteps: ['10m']
});

const RATING_MAP = Object.freeze({
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy
});

const EXERCISE_SKILLS = Object.freeze({
  flashcard: 'recognition',
  choice: 'recognition',
  'meaning-choice': 'recognition',
  typing: 'recall',
  'sentence-cloze': 'recall',
  'listening-choice': 'listening',
  dictation: 'listening',
  cloze: 'collocation',
  production: 'production',
  output: 'production',
  intro: 'recognition'
});

let runtimeConfig = { ...DEFAULT_FSRS_CONFIG };

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeFsrsSkill(skill, card = null) {
  if (FSRS_SKILLS.includes(skill)) return skill;
  return card?.type === 'collocation' ? 'collocation' : 'recognition';
}

export function skillForExercise(kind, card = null) {
  return normalizeFsrsSkill(EXERCISE_SKILLS[kind], card);
}

export function requiredSkillsForCard(card = {}) {
  const explicit = Array.isArray(card.targetSkills)
    ? [...new Set(card.targetSkills.filter(skill => FSRS_SKILLS.includes(skill)))]
    : [];
  if (explicit.length) return explicit;

  const active = card.learningGoal === 'active';
  if (card.type === 'collocation') {
    return active
      ? ['recognition', 'recall', 'collocation', 'listening', 'production']
      : ['recognition', 'recall', 'collocation'];
  }
  return active
    ? ['recognition', 'recall', 'listening', 'production']
    : ['recognition', 'recall'];
}

export function skillIsRequired(card, skill) {
  return requiredSkillsForCard(card).includes(normalizeFsrsSkill(skill, card));
}

export function validateFsrsConfig(input = {}) {
  const requestRetention = clamp(Number(input.requestRetention ?? DEFAULT_FSRS_CONFIG.requestRetention), 0.75, 0.97);
  const maximumInterval = Math.round(clamp(Number(input.maximumInterval ?? DEFAULT_FSRS_CONFIG.maximumInterval), 30, 36500));
  const learningSteps = Array.isArray(input.learningSteps) && input.learningSteps.length
    ? input.learningSteps.filter(step => /^\d+(?:\.\d+)?[mhd]$/.test(String(step))).slice(0, 4)
    : [...DEFAULT_FSRS_CONFIG.learningSteps];
  const relearningSteps = Array.isArray(input.relearningSteps) && input.relearningSteps.length
    ? input.relearningSteps.filter(step => /^\d+(?:\.\d+)?[mhd]$/.test(String(step))).slice(0, 4)
    : [...DEFAULT_FSRS_CONFIG.relearningSteps];

  return {
    requestRetention,
    maximumInterval,
    enableFuzz: input.enableFuzz !== false,
    enableShortTerm: input.enableShortTerm !== false,
    learningSteps: learningSteps.length ? learningSteps : [...DEFAULT_FSRS_CONFIG.learningSteps],
    relearningSteps: relearningSteps.length ? relearningSteps : [...DEFAULT_FSRS_CONFIG.relearningSteps]
  };
}

// IndexedDB is the persistent source of truth. These functions only keep a
// process-local default for callers that do not pass a config explicitly.
export function loadFsrsConfig() {
  return { ...runtimeConfig };
}

export function saveFsrsConfig(config) {
  runtimeConfig = validateFsrsConfig(config);
  return { ...runtimeConfig };
}

function makeScheduler(config = runtimeConfig) {
  const validated = validateFsrsConfig(config);
  return fsrs({
    request_retention: validated.requestRetention,
    maximum_interval: validated.maximumInterval,
    enable_fuzz: validated.enableFuzz,
    enable_short_term: validated.enableShortTerm,
    learning_steps: validated.learningSteps,
    relearning_steps: validated.relearningSteps
  });
}

function finiteDate(value, fallback) {
  const date = new Date(value ?? fallback);
  return Number.isFinite(date.getTime()) ? date : new Date(fallback);
}

function legacyState(card, repetitions) {
  if (!repetitions) return State.New;
  if (card.status === 'learning') return Number(card.incorrect || 0) > 0 ? State.Relearning : State.Learning;
  return State.Review;
}

function deserializeValue(value, now = Date.now()) {
  return {
    due: finiteDate(value?.due, now),
    stability: Math.max(0, Number(value?.stability || 0)),
    difficulty: clamp(Number(value?.difficulty || 0), 0, 10),
    elapsed_days: Math.max(0, Number(value?.elapsed_days || 0)),
    scheduled_days: Math.max(0, Number(value?.scheduled_days || 0)),
    learning_steps: Math.max(0, Number(value?.learning_steps || 0)),
    reps: Math.max(0, Number(value?.reps || 0)),
    lapses: Math.max(0, Number(value?.lapses || 0)),
    state: [State.New, State.Learning, State.Review, State.Relearning].includes(Number(value?.state)) ? Number(value.state) : State.New,
    last_review: value?.last_review == null ? undefined : finiteDate(value.last_review, now)
  };
}

function legacyFsrsCard(card, now = Date.now()) {
  if (card?.fsrs && typeof card.fsrs === 'object') return deserializeValue(card.fsrs, now);
  const repetitions = Math.max(0, Number(card?.correct || 0) + Number(card?.incorrect || 0));
  if (!repetitions) return createEmptyCard(new Date(card?.createdAt || now));
  const scheduledDays = Math.max(1, Number(card?.intervalDays || 1));
  const due = finiteDate(card?.dueAt, now);
  const lastReviewFallback = due.getTime() - scheduledDays * 86_400_000;
  return {
    due,
    stability: Math.max(0.1, Number(card?.stability || scheduledDays)),
    difficulty: clamp(Number(card?.difficulty || 5), 1, 10),
    elapsed_days: Math.max(0, Number(card?.elapsedDays || 0)),
    scheduled_days: scheduledDays,
    learning_steps: 0,
    reps: repetitions,
    lapses: Math.max(0, Number(card?.incorrect || 0)),
    state: legacyState(card, repetitions),
    last_review: finiteDate(card?.updatedAt, lastReviewFallback)
  };
}

function existingSkillMap(card, now = Date.now()) {
  const map = {};
  if (card?.fsrsBySkill && typeof card.fsrsBySkill === 'object') {
    for (const [skill, value] of Object.entries(card.fsrsBySkill)) {
      if (FSRS_SKILLS.includes(skill) && value && typeof value === 'object') map[skill] = { ...value };
    }
  }
  if (!Object.keys(map).length && (card?.fsrs || Number(card?.correct || 0) + Number(card?.incorrect || 0) > 0)) {
    const primary = normalizeFsrsSkill(card?.lastSkill, card);
    map[primary] = serializeFsrsCard(legacyFsrsCard(card, now));
  }
  return map;
}

export function skillHasReviews(card, skill) {
  const value = existingSkillMap(card)[normalizeFsrsSkill(skill, card)];
  return Number(value?.reps || 0) > 0;
}

export function deserializeFsrsCard(card, now = Date.now(), skill = null) {
  const normalizedSkill = normalizeFsrsSkill(skill, card);
  const map = existingSkillMap(card, now);
  if (map[normalizedSkill]) return deserializeValue(map[normalizedSkill], now);
  return createEmptyCard(new Date(card?.createdAt || now));
}

export function serializeFsrsCard(card) {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.getTime() ?? null
  };
}

function serializeLog(log, skill) {
  return {
    id: `${log.review.getTime()}-${log.rating}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10)}`,
    skill,
    rating: log.rating,
    state: log.state,
    due: log.due.getTime(),
    stability: log.stability,
    difficulty: log.difficulty,
    elapsed_days: log.elapsed_days,
    last_elapsed_days: log.last_elapsed_days,
    scheduled_days: log.scheduled_days,
    learning_steps: log.learning_steps,
    review: log.review.getTime(),
    fsrsVersion: FSRS_VERSION
  };
}

export function formatIntervalFromDates(now, due) {
  const milliseconds = Math.max(0, new Date(due).getTime() - new Date(now).getTime());
  const minutes = Math.max(1, Math.round(milliseconds / 60_000));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.max(1, Math.round(hours / 24));
  return `${days} ngày`;
}

function statusFromSkillMap(card, fsrsBySkill) {
  const required = requiredSkillsForCard(card);
  const values = required.map(skill => deserializeValue(fsrsBySkill[skill]));
  const reviewed = values.filter(value => value.reps > 0);
  if (!reviewed.length) return 'new';
  if (reviewed.length < required.length) return 'learning';
  if (values.some(value => value.state === State.Learning || value.state === State.Relearning)) return 'learning';
  return values.every(value => value.stability >= MASTERED_STABILITY_DAYS) ? 'mastered' : 'familiar';
}

function aggregateSkillMap(card, fsrsBySkill, now, scheduler) {
  const required = requiredSkillsForCard(card);
  const entries = required.map(skill => [skill, deserializeValue(fsrsBySkill[skill], now)]);
  entries.sort((a, b) => a[1].due.getTime() - b[1].due.getTime());
  const [nextSkill, nextCard] = entries[0] || ['recognition', createEmptyCard(new Date(now))];
  const reviewed = entries.filter(([, value]) => value.reps > 0);
  const stabilityValues = reviewed.map(([, value]) => value.stability);
  const difficultyValues = reviewed.map(([, value]) => value.difficulty);
  const retrievability = nextCard.reps > 0 && nextCard.state !== State.New
    ? scheduler.get_retrievability(nextCard, new Date(now), false)
    : 0;
  return {
    nextSkill,
    dueAt: nextCard.due.getTime(),
    intervalDays: nextCard.scheduled_days,
    stability: stabilityValues.length ? Math.min(...stabilityValues) : 0,
    difficulty: difficultyValues.length ? difficultyValues.reduce((sum, value) => sum + value, 0) / difficultyValues.length : 0,
    retrievability,
    status: statusFromSkillMap(card, fsrsBySkill),
    skillCoverage: required.length ? reviewed.length / required.length : 0
  };
}

function missingSkillDueAt(card, now) {
  const createdAt = Number(card?.createdAt || now);
  const startedAt = Number(card?.updatedAt || createdAt);
  return Math.min(now, startedAt);
}

export function getSkillDueAt(card, skill, now = Date.now()) {
  const normalizedSkill = normalizeFsrsSkill(skill, card);
  const map = existingSkillMap(card, now);
  const value = map[normalizedSkill];
  if (value && Number(value.reps || 0) > 0) return deserializeValue(value, now).due.getTime();
  return missingSkillDueAt(card, now);
}

export function getEarliestSkillDue(card, now = Date.now()) {
  const required = requiredSkillsForCard(card);
  if (!required.length) return Number(card?.dueAt || 0);
  return Math.min(...required.map(skill => getSkillDueAt(card, skill, now)));
}

export function getDueSkillItems(cards = [], now = Date.now(), config = runtimeConfig) {
  const scheduler = makeScheduler(config);
  const items = [];
  for (const card of cards) {
    if (!card || card.status === 'new' || card.suspendedAt || card.archivedAt) continue;
    for (const skill of requiredSkillsForCard(card)) {
      const fsrsCard = deserializeFsrsCard(card, now, skill);
      const reviewed = fsrsCard.reps > 0;
      const dueAt = reviewed ? fsrsCard.due.getTime() : missingSkillDueAt(card, now);
      if (dueAt > now) continue;
      let retrievability = 0;
      if (reviewed && fsrsCard.state !== State.New && fsrsCard.stability > 0) {
        try { retrievability = scheduler.get_retrievability(fsrsCard, new Date(now), false); } catch { retrievability = 0; }
      }
      const overdueDays = Math.max(0, (now - dueAt) / 86_400_000);
      const priority = (reviewed ? 100 : 135) + overdueDays * 8 + (1 - retrievability) * 40 + Number(card.ratingCounts?.again || 0) * 2;
      items.push({ cardId: card.id, skill, dueAt, reviewed, retrievability, priority });
    }
  }
  return items.sort((a, b) => b.priority - a.priority || a.dueAt - b.dueAt);
}

export function getCardRetrievability(card, now = Date.now(), config = runtimeConfig, skill = null) {
  const fsrsCard = deserializeFsrsCard(card, now, skill || card?.nextSkill);
  if (fsrsCard.state === State.New || fsrsCard.reps === 0 || fsrsCard.stability <= 0) return 0;
  try {
    return makeScheduler(config).get_retrievability(fsrsCard, new Date(now), false);
  } catch {
    return 0;
  }
}

export function previewFsrsRatings(card, now = Date.now(), config = runtimeConfig, skill = null) {
  const scheduler = makeScheduler(config);
  const fsrsCard = deserializeFsrsCard(card, now, skill || card?.nextSkill);
  const preview = scheduler.repeat(fsrsCard, new Date(now));
  return {
    again: formatIntervalFromDates(now, preview[Rating.Again].card.due),
    hard: formatIntervalFromDates(now, preview[Rating.Hard].card.due),
    good: formatIntervalFromDates(now, preview[Rating.Good].card.due),
    easy: formatIntervalFromDates(now, preview[Rating.Easy].card.due)
  };
}

export function applyFsrsRating(card, rating, now = Date.now(), config = runtimeConfig, skill = null) {
  const normalizedSkill = normalizeFsrsSkill(skill, card);
  const normalizedRating = RATING_MAP[rating] ? rating : 'good';
  const grade = RATING_MAP[normalizedRating];
  const scheduler = makeScheduler(config);
  const current = deserializeFsrsCard(card, now, normalizedSkill);
  const result = scheduler.next(current, new Date(now), grade);
  const nextFsrs = serializeFsrsCard(result.card);
  const fsrsBySkill = { ...existingSkillMap(card, now), [normalizedSkill]: nextFsrs };
  const aggregate = aggregateSkillMap(card, fsrsBySkill, now, scheduler);
  const interval = {
    days: result.card.scheduled_days,
    minutes: result.card.scheduled_days === 0 ? Math.max(1, Math.round((result.card.due.getTime() - now) / 60_000)) : 0,
    label: formatIntervalFromDates(now, result.card.due)
  };
  const log = serializeLog(result.log, normalizedSkill);
  const becameMastered = card.status !== 'mastered' && aggregate.status === 'mastered';

  return {
    card: {
      ...card,
      fsrsVersion: FSRS_VERSION,
      fsrs: nextFsrs,
      fsrsBySkill,
      nextSkill: aggregate.nextSkill,
      dueAt: aggregate.dueAt,
      intervalDays: aggregate.intervalDays,
      stability: aggregate.stability,
      difficulty: aggregate.difficulty,
      retrievability: aggregate.retrievability,
      skillCoverage: aggregate.skillCoverage,
      status: aggregate.status,
      lastRating: normalizedRating,
      lastSkill: normalizedSkill,
      lastReviewEventId: log.id,
      reviewEventCount: Number(card.reviewEventCount || 0) + 1,
      updatedAt: now,
      correct: Number(card.correct || 0) + (normalizedRating === 'again' ? 0 : 1),
      incorrect: Number(card.incorrect || 0) + (normalizedRating === 'again' ? 1 : 0),
      transferDueAt: becameMastered && !card.transferPassedAt ? now + 7 * 86_400_000 : (card.transferDueAt ?? null),
      reviewHistory: undefined
    },
    interval,
    log
  };
}

export function createFsrsCard(now = Date.now()) {
  return serializeFsrsCard(createEmptyCard(new Date(now)));
}
