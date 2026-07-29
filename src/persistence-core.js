import { EVIDENCE_POLICY_VERSION,decideEvidence } from './evidence-policy.js';

export const BACKUP_SCHEMA_VERSION = 3;
export const LEARNING_PROGRESS_RESET_VERSION = 1;
export const TRACKED_STORAGE_KEYS = Object.freeze({
  cards: 'vocab-master-cards-v6',
  settings: 'vocab-master-settings-v6',
  fsrsConfig: 'vocab-master-fsrs-config-v1',
  dailyDone: 'vocab-master-daily-done',
  dailyTarget: 'vocab-master-daily-target',
  studyMinutes: 'vocab-master-study-minutes',
  completedReviews: 'vocab-master-completed-reviews',
  reviewEvents: 'vocab-master-review-events-v1',
  initialized: 'vocab-master-initialized-v1'
});

const VALID_SKILLS = new Set(['recognition', 'recall', 'listening', 'collocation', 'production']);
const MAX_CARDS = 100_000;
const MAX_REVIEW_EVENTS = 1_000_000;
const RATING_NAMES = Object.freeze({ 1:'again', 2:'hard', 3:'good', 4:'easy' });
const VALID_RATINGS = new Set(['again','hard','good','easy']);

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function finiteNumber(value) {
  return Number.isFinite(Number(value));
}

function normalizeRating(value) {
  if (VALID_RATINGS.has(value)) return value;
  return RATING_NAMES[Number(value)] || null;
}

export function normalizeSkill(skill, fallback = 'recognition') {
  return VALID_SKILLS.has(skill) ? skill : fallback;
}

export function stripEmbeddedReviewHistory(cards = []) {
  const cleanedCards = [];
  const reviewEvents = [];

  for (const rawCard of Array.isArray(cards) ? cards : []) {
    if (!plainObject(rawCard) || !String(rawCard.id || '').trim()) continue;
    const card = clone(rawCard);
    const history = Array.isArray(card.reviewHistory) ? card.reviewHistory : [];
    delete card.reviewHistory;
    card.reviewEventCount = Math.max(Number(card.reviewEventCount || 0), history.length);

    for (const rawLog of history) {
      if (!plainObject(rawLog)) continue;
      const reviewedAt = Number(rawLog.review || rawLog.reviewedAt || rawLog.createdAt || 0);
      const rating = Number(rawLog.rating || 0);
      const sourceId = String(rawLog.id || `${reviewedAt}-${rating}`);
      reviewEvents.push({
        ...clone(rawLog),
        id: `${card.id}:${sourceId}`,
        cardId: card.id,
        skill: normalizeSkill(rawLog.skill, card.type === 'collocation' ? 'collocation' : 'recognition'),
        rating: normalizeRating(rawLog.rating),
        fsrsRating: Number(rawLog.fsrsRating ?? rawLog.rating) || null,
        reviewedAt,
        review: reviewedAt,
        createdAt: reviewedAt || Date.now(),
        source: 'legacy-card-history'
      });
    }
    cleanedCards.push(card);
  }

  return { cards: cleanedCards, reviewEvents: dedupeReviewEvents(reviewEvents) };
}

export function createReviewEvent({ cardId, skill, exerciseType, sessionMode, resultLog, rating, reviewedAt = Date.now(), sessionId = null, assisted = false, metadata = null }) {
  if (!String(cardId || '').trim()) throw new TypeError('cardId is required');
  const sourceId = String(resultLog?.id || `${reviewedAt}-${rating || 'unknown'}`);
  const event = {
    ...(plainObject(resultLog) ? clone(resultLog) : {}),
    id: `${cardId}:${normalizeSkill(skill)}:${sourceId}`,
    cardId: String(cardId),
    skill: normalizeSkill(skill),
    exerciseType: String(exerciseType || 'flashcard'),
    sessionMode: String(sessionMode || 'today'),
    sessionId: sessionId == null ? null : String(sessionId),
    rating: normalizeRating(rating ?? resultLog?.rating),
    fsrsRating: Number(resultLog?.rating || 0) || null,
    reviewedAt: Number(resultLog?.review || reviewedAt),
    review: Number(resultLog?.review || reviewedAt),
    createdAt: Number(reviewedAt),
    assisted: Boolean(assisted),
    metadata: plainObject(metadata) ? clone(metadata) : null,
    fsrsVersion: Number(resultLog?.fsrsVersion || 6),
    schemaVersion: BACKUP_SCHEMA_VERSION
  };
  return Object.freeze(event);
}

export function assertEvidenceReviewWrite({card,event}={}){
  const decision=event?.evidenceDecision;
  if(!card?.id||!event?.id)throw new TypeError('Evidence review write cần card và event.');
  if(decision?.eligible!==true||decision?.affectsSchedule!==true)throw Object.assign(new Error('Schedule write bị từ chối: thiếu EvidenceDecision được chấp nhận.'),{code:'EVIDENCE_DECISION_REQUIRED'});
  if(decision.policyVersion!==EVIDENCE_POLICY_VERSION||!decision.receiptId||!decision.receiptBinding)throw Object.assign(new Error('Schedule write bị từ chối: EvidenceDecision thiếu version/receipt binding.'),{code:'EVIDENCE_DECISION_INVALID'});
  if(event.id!==`evidence:${decision.receiptId}`||event.receiptId!==decision.receiptId||event.attemptId!==decision.attemptId||event.activityId!==decision.activityId)throw Object.assign(new Error('Schedule write bị từ chối: event không khớp receipt/attempt/activity.'),{code:'EVIDENCE_EVENT_MISMATCH'});
  if(String(card.id)!==String(decision.target?.cardId)||String(event.cardId)!==String(card.id)||event.skill!==decision.skill||event.rating!==decision.rating)throw Object.assign(new Error('Schedule write bị từ chối: card/skill/rating không khớp EvidenceDecision.'),{code:'EVIDENCE_TARGET_MISMATCH'});
  if(JSON.stringify(event.target)!==JSON.stringify(decision.target)||event.metadata?.receiptBinding!==decision.receiptBinding||event.metadata?.evidenceReason!==decision.reason||event.qualifiedFailure!==!decision.successful)throw Object.assign(new Error('Schedule write bị từ chối: event metadata không khớp EvidenceDecision.'),{code:'EVIDENCE_EVENT_MISMATCH'});
  if(event.assisted===true||event.assistanceTrace?.exposed===true)throw Object.assign(new Error('Schedule write bị từ chối: attempt có assistance exposure.'),{code:'EVIDENCE_ASSISTED'});
  const recomputed=decideEvidence(event.evidence);
  if(recomputed.eligible!==true||JSON.stringify(recomputed)!==JSON.stringify(decision))throw Object.assign(new Error('Schedule write bị từ chối: EvidenceDecision không tái lập được từ evidence envelope.'),{code:'EVIDENCE_DECISION_UNVERIFIED'});
  if(JSON.stringify(event.assistanceTrace)!==JSON.stringify(event.evidence?.attempt?.assistance))throw Object.assign(new Error('Schedule write bị từ chối: assistance trace không khớp attempt.'),{code:'EVIDENCE_EVENT_MISMATCH'});
  return true;
}

export function dedupeReviewEvents(events = []) {
  const map = new Map();
  for (const event of Array.isArray(events) ? events : []) {
    if (!plainObject(event) || !String(event.id || '').trim()) continue;
    if (!map.has(event.id)) {
      const normalized=clone(event);
      normalized.rating=normalizeRating(normalized.rating ?? normalized.fsrsRating);
      normalized.fsrsRating=Number(normalized.fsrsRating || (typeof event.rating==='number' ? event.rating : 0)) || null;
      map.set(event.id, normalized);
    }
  }
  return [...map.values()].sort((a, b) => Number(a.reviewedAt || a.review || 0) - Number(b.reviewedAt || b.review || 0));
}

export function resetLearningProgress(cards = []) {
  return stripEmbeddedReviewHistory(cards).cards.map(rawCard => {
    const card = clone(rawCard);
    return {
      ...card,
      status: 'new',
      dueAt: null,
      intervalDays: 0,
      correct: 0,
      incorrect: 0,
      ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 },
      updatedAt: null,
      lastRating: null,
      lastSkill: null,
      lastError: null,
      errorCounts: {},
      stability: 0,
      difficulty: 0,
      retrievability: 0,
      skillCoverage: 0,
      fsrsVersion: 6,
      fsrs: null,
      fsrsBySkill: {},
      qualifiedEvidenceBySkill: {},
      nextSkill: null,
      reviewEventCount: 0,
      lastReviewEventId: null,
      transferDueAt: null,
      transferPassedAt: null,
      transferAttempts: 0,
      transferLastResult: null,
      pronunciationPractice: { attempts: 0, lastPracticedAt: null, lastIntelligibility: null, lastScore: null, bestScore: null, lastTranscript: '', lastRecognitionMatched: null, commonIssues: [], confidence: null, lastFeedback: '' }
    };
  });
}

export function buildBackupDocument({ cards = [], settings = {}, fsrsConfig = {}, metrics = {}, reviewEvents = [], meta = {}, exportedAt = new Date().toISOString() } = {}) {
  const migrated = stripEmbeddedReviewHistory(cards);
  return {
    app: 'Vocab Master',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    cards: migrated.cards,
    settings: plainObject(settings) ? clone(settings) : {},
    fsrsConfig: plainObject(fsrsConfig) ? clone(fsrsConfig) : {},
    metrics: plainObject(metrics) ? clone(metrics) : {},
    reviewEvents: dedupeReviewEvents([...migrated.reviewEvents, ...(Array.isArray(reviewEvents) ? reviewEvents : [])]),
    meta: { databaseInitialized: true, ...(plainObject(meta) ? clone(meta) : {}) }
  };
}

function validateSchedule(schedule, path, errors) {
  if (!plainObject(schedule)) { errors.push(`${path} phải là object.`); return; }
  for (const field of ['due','stability','difficulty','elapsed_days','scheduled_days','learning_steps','reps','lapses','state']) {
    if (schedule[field] != null && !finiteNumber(schedule[field])) errors.push(`${path}.${field} không hợp lệ.`);
  }
  if (Number(schedule.stability || 0) < 0) errors.push(`${path}.stability không được âm.`);
  for (const field of ['elapsed_days','scheduled_days','learning_steps','reps','lapses']) if (Number(schedule[field] || 0) < 0) errors.push(`${path}.${field} không được âm.`);
  if (schedule.state != null && ![0,1,2,3].includes(Number(schedule.state))) errors.push(`${path}.state không hợp lệ.`);
  if (schedule.due != null && Number(schedule.due) < 0) errors.push(`${path}.due không hợp lệ.`);
  if (Number(schedule.difficulty || 0) < 0 || Number(schedule.difficulty || 0) > 10) errors.push(`${path}.difficulty phải trong khoảng 0–10.`);
  if (schedule.last_review != null && !finiteNumber(schedule.last_review)) errors.push(`${path}.last_review không hợp lệ.`);
}

function validateCard(card, index, errors, ids) {
  const path=`cards[${index}]`;
  if (!plainObject(card)) { errors.push(`${path} phải là object.`); return; }
  const id=String(card.id||'').trim();
  if(!id)errors.push(`${path}.id bị thiếu.`);
  else if(ids.has(id))errors.push(`ID thẻ bị trùng: ${id}.`);
  else ids.add(id);
  if(!String(card.front||'').trim())errors.push(`${path}.front bị thiếu.`);
  if(!String(card.back||'').trim())errors.push(`${path}.back bị thiếu.`);
  if(String(card.front||'').length>500||String(card.back||'').length>2000)errors.push(`${path} vượt giới hạn độ dài.`);
  for(const field of ['createdAt','updatedAt','dueAt','suspendedAt','archivedAt','transferDueAt','transferPassedAt']){
    if(card[field]!=null&&!finiteNumber(card[field]))errors.push(`${path}.${field} không hợp lệ.`);
  }
  if(card.fsrsBySkill!=null){
    if(!plainObject(card.fsrsBySkill))errors.push(`${path}.fsrsBySkill phải là object.`);
    else for(const[skill,schedule]of Object.entries(card.fsrsBySkill)){
      if(!VALID_SKILLS.has(skill))errors.push(`${path}.fsrsBySkill chứa skill lạ: ${skill}.`);
      else validateSchedule(schedule,`${path}.fsrsBySkill.${skill}`,errors);
    }
  }
  if(card.targetSkills!=null&&(!Array.isArray(card.targetSkills)||card.targetSkills.some(skill=>!VALID_SKILLS.has(skill))))errors.push(`${path}.targetSkills không hợp lệ.`);
}

function validateEvent(event,index,errors,ids,cardIds,warnings){
  const path=`reviewEvents[${index}]`;
  if(!plainObject(event)){errors.push(`${path} phải là object.`);return;}
  const id=String(event.id||'').trim();
  if(!id)errors.push(`${path}.id bị thiếu.`);else if(ids.has(id))errors.push(`ID lượt ôn bị trùng: ${id}.`);else ids.add(id);
  const cardId=String(event.cardId||'').trim();
  if(!cardId)errors.push(`${path}.cardId bị thiếu.`);
  else if(!cardIds.has(cardId))warnings.push(`${path} tham chiếu thẻ đã bị xóa hoặc không có trong backup.`);
  if(!VALID_SKILLS.has(event.skill))errors.push(`${path}.skill không hợp lệ.`);
  if(!VALID_RATINGS.has(event.rating))errors.push(`${path}.rating không hợp lệ.`);
  if(!finiteNumber(event.reviewedAt??event.review)||Number(event.reviewedAt??event.review)<=0)errors.push(`${path}.reviewedAt không hợp lệ.`);
}

export function validateBackupDocument(input) {
  if (!plainObject(input)) return { valid: false, errors: ['Backup phải là một JSON object.'], warnings: [], value: null };
  const errors = [];
  const warnings = [];
  if (!Array.isArray(input.cards)) errors.push('Thiếu mảng cards.');
  if (input.reviewEvents != null && !Array.isArray(input.reviewEvents)) errors.push('reviewEvents phải là một mảng.');
  if (input.settings != null && !plainObject(input.settings)) errors.push('settings phải là object.');
  if (input.fsrsConfig != null && !plainObject(input.fsrsConfig)) errors.push('fsrsConfig phải là object.');
  if (Number(input.schemaVersion || 0) > BACKUP_SCHEMA_VERSION) errors.push(`Backup dùng schema mới hơn (${input.schemaVersion}) và chưa được hỗ trợ.`);
  if (Array.isArray(input.cards) && input.cards.length > MAX_CARDS) errors.push(`Backup vượt giới hạn ${MAX_CARDS} thẻ.`);
  if (Array.isArray(input.reviewEvents) && input.reviewEvents.length > MAX_REVIEW_EVENTS) errors.push(`Backup vượt giới hạn ${MAX_REVIEW_EVENTS} lượt ôn.`);

  const migrated = stripEmbeddedReviewHistory(Array.isArray(input.cards) ? input.cards : []);
  const cardIds=new Set();
  migrated.cards.forEach((card,index)=>validateCard(card,index,errors,cardIds));
  const explicitEventIds=new Set();
  for(const event of Array.isArray(input.reviewEvents)?input.reviewEvents:[]){
    const id=String(event?.id||'').trim();
    if(id&&explicitEventIds.has(id))errors.push(`ID lượt ôn bị trùng: ${id}.`);
    if(id)explicitEventIds.add(id);
  }
  const reviewEvents = dedupeReviewEvents([...migrated.reviewEvents, ...(Array.isArray(input.reviewEvents) ? input.reviewEvents : [])]);
  const eventIds=new Set();
  reviewEvents.forEach((event,index)=>validateEvent(event,index,errors,eventIds,cardIds,warnings));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    value: errors.length ? null : buildBackupDocument({
      cards:migrated.cards,
      settings: input.settings || {},
      fsrsConfig: input.fsrsConfig || {},
      metrics: input.metrics || {},
      reviewEvents,
      meta: input.meta || {},
      exportedAt: input.exportedAt || new Date().toISOString()
    })
  };
}

export function shouldCreateDailySnapshot(lastSnapshotAt, now = Date.now(), minimumHours = 20) {
  const previous = Number(lastSnapshotAt || 0);
  return !previous || now - previous >= minimumHours * 3_600_000;
}

export function compactSnapshot({ cards = [], settings = {}, fsrsConfig = {}, metrics = {}, reviewEvents = [], reason = 'automatic', createdAt = Date.now(), revision = 0 } = {}) {
  return {
    id: `${createdAt}-${reason}`,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    createdAt,
    reason,
    revision:Number(revision||0),
    cards: stripEmbeddedReviewHistory(cards).cards,
    settings: clone(settings || {}),
    fsrsConfig: clone(fsrsConfig || {}),
    metrics: clone(metrics || {}),
    reviewEvents: dedupeReviewEvents(reviewEvents)
  };
}
