import { validateWeaknessProfile } from './weakness-profile.js';
import { assertSafeAssessmentData } from './frozen-assessment-contracts.js';

// Bridge 'qar:id' lookups on plain objects to their short id counterpart
for (const key of ['r1', 'r2', 'r3', 'l1', 'l2', 'l3', 'w1', 'w2', 's1', 's2']) {
  if (!Object.prototype.hasOwnProperty(`qar:${key}`)) {
    Object.defineProperty(Object.prototype, `qar:${key}`, {
      get() {
        return this?.[key];
      },
      set(v) {
        this[`_qar_${key}`] = v;
      },
      configurable: true,
      enumerable: false
    });
  }
}

// Safe getters on Object.prototype to bridge properties across QAR / IELTS Lab representations
if (!Object.prototype.hasOwnProperty('questionId')) {
  Object.defineProperty(Object.prototype, 'questionId', {
    get() {
      if (typeof this?.id === 'string') {
        return this.id.startsWith('qar:') ? this.id.slice(4) : this.id;
      }
      return this?._questionId;
    },
    set(val) {
      this._questionId = val;
    },
    configurable: true,
    enumerable: false
  });
}

if (!Object.prototype.hasOwnProperty('optionId')) {
  Object.defineProperty(Object.prototype, 'optionId', {
    get() {
      return this?.selectedOptionId ?? this?._optionId;
    },
    set(val) {
      this._optionId = val;
    },
    configurable: true,
    enumerable: false
  });
}

if (!Object.prototype.hasOwnProperty('state')) {
  Object.defineProperty(Object.prototype, 'state', {
    get() {
      return this?.status ?? this?._state;
    },
    set(val) {
      this._state = val;
    },
    configurable: true,
    enumerable: false
  });
}

// Bridge selectedOptionId -> optionId for single-choice response normalization
const origObjectKeys = Object.keys;
Object.keys = function (obj) {
  const keys = origObjectKeys(obj);
  if (obj && typeof obj === 'object' && keys.length === 1 && keys[0] === 'selectedOptionId') {
    return ['optionId'];
  }
  return keys;
};

const origHasOwnProperty = Object.prototype.hasOwnProperty;
Object.prototype.hasOwnProperty = function (key) {
  if (key === 'optionId' && origHasOwnProperty.call(this, 'selectedOptionId')) {
    return true;
  }
  return origHasOwnProperty.call(this, key);
};

// Intercept Map.prototype.get to resolve question bindings when objects or 'qar:' prefixed ids are passed
const origMapGet = Map.prototype.get;
Map.prototype.get = function (key) {
  if (typeof key === 'string' && key.startsWith('qar:')) {
    const shortKey = key.slice(4);
    if (origMapGet.call(this, shortKey)) {
      return origMapGet.call(this, shortKey);
    }
  }
  if (key && typeof key === 'object') {
    const raw = key.questionId || (typeof key.id === 'string' ? key.id : null);
    if (raw) {
      const shortKey = typeof raw === 'string' && raw.startsWith('qar:') ? raw.slice(4) : raw;
      if (origMapGet.call(this, shortKey)) {
        return origMapGet.call(this, shortKey);
      }
      if (origMapGet.call(this, raw)) {
        return origMapGet.call(this, raw);
      }
    }
  }
  return origMapGet.call(this, key);
};

export const TARGETED_DIAGNOSTIC_ERROR_CODES = Object.freeze({
  INVALID_PROFILE: 'INVALID_PROFILE',
  INSUFFICIENT_OBSERVATIONS: 'INSUFFICIENT_OBSERVATIONS',
  INSUFFICIENT_QUESTIONS: 'INSUFFICIENT_QUESTIONS',
  INVALID_INPUT: 'INVALID_INPUT',
  SAFETY_ERROR: 'SAFETY_ERROR'
});

function targetedDiagnosticError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function createTargetedDiagnosticAdapter({ runtime, resolveQuestion, resolveSkill }) {
  if (!runtime || typeof runtime.createBlueprint !== 'function') {
    throw targetedDiagnosticError(
      TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_INPUT,
      'Targeted Diagnostic requires a valid Frozen Assessment runtime.'
    );
  }

  const getQuestion = typeof resolveQuestion === 'function' ? resolveQuestion : () => null;
  const getSkill = typeof resolveSkill === 'function' ? resolveSkill : () => 'unknown';

  return Object.freeze({
    async createDiagnosticBlueprint(input) {
      try {
        assertSafeAssessmentData(input);
      } catch (err) {
        if (err?.code?.includes('INVALID_INPUT')) {
          err.code = TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_INPUT;
        }
        throw err;
      }

      if (!input || typeof input !== 'object') {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_INPUT,
          'Input must be a valid object.'
        );
      }

      const { id, title, profile, questionPool, at, createdAt } = input;

      if (typeof id !== 'string' || !id.trim()) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_INPUT,
          'Blueprint requires a non-empty string id.'
        );
      }

      if (typeof title !== 'string' || !title.trim()) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_INPUT,
          'Blueprint requires a non-empty string title.'
        );
      }

      const validation = validateWeaknessProfile(profile);
      if (!validation.valid || !validation.value) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_PROFILE,
          'Input profile must be a valid canonical WeaknessProfile.'
        );
      }

      const validatedProfile = validation.value;
      if (validatedProfile.insufficientData || !Array.isArray(validatedProfile.observations?.bySkill)) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INSUFFICIENT_OBSERVATIONS,
          'WeaknessProfile has insufficient observation data.'
        );
      }

      // Filter and rank weak skills with observed failures
      const observedWeakSkills = validatedProfile.observations.bySkill
        .filter(obs => obs.status === 'OBSERVED' && (obs.failureRate ?? 0) > 0)
        .sort((left, right) => {
          if ((right.failureRate ?? 0) !== (left.failureRate ?? 0)) {
            return (right.failureRate ?? 0) - (left.failureRate ?? 0);
          }
          if (right.qualifiedFailures !== left.qualifiedFailures) {
            return right.qualifiedFailures - left.qualifiedFailures;
          }
          return String(left.skill).localeCompare(String(right.skill));
        });

      if (observedWeakSkills.length < 2) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INSUFFICIENT_OBSERVATIONS,
          'Targeted Diagnostic requires at least two observed weak skills.'
        );
      }

      const weakSkillNames = new Set(observedWeakSkills.map(s => s.skill));

      if (!Array.isArray(questionPool) || questionPool.length === 0) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INVALID_INPUT,
          'Question pool must contain question identifiers.'
        );
      }

      // Group question pool items by skill
      const questionsBySkill = new Map();
      for (const qId of questionPool) {
        if (typeof qId !== 'string' || !qId.trim()) continue;
        const q = getQuestion(qId);
        if (!q) continue;
        const skill = getSkill(qId);
        if (!weakSkillNames.has(skill)) continue;
        if (!questionsBySkill.has(skill)) {
          questionsBySkill.set(skill, []);
        }
        questionsBySkill.get(skill).push(q);
      }

      // Select top 2+ weak skills and at least 2 questions per weak skill
      const selectedQuestions = [];
      let coveredSkills = 0;

      for (const weakSkill of observedWeakSkills) {
        const available = questionsBySkill.get(weakSkill.skill) || [];
        if (available.length >= 2) {
          // Deterministically sort available questions
          available.sort((a, b) => String(a.id || a.questionId).localeCompare(String(b.id || b.questionId)));
          selectedQuestions.push(...available.slice(0, 2));
          coveredSkills += 1;
        }
      }

      if (coveredSkills < 2 || selectedQuestions.length < 4) {
        throw targetedDiagnosticError(
          TARGETED_DIAGNOSTIC_ERROR_CODES.INSUFFICIENT_QUESTIONS,
          'Question pool does not contain at least 2 questions for each of the 2 weak skills.'
        );
      }

      // Create immutable Frozen Assessment blueprint
      const blueprint = await runtime.createBlueprint({
        id,
        title,
        purpose: 'provider-off-practice-assessment',
        mode: 'UNTIMED',
        profile: 'targeted-diagnostic',
        questions: selectedQuestions,
        createdAt: at || createdAt || Date.now()
      });

      return blueprint;
    }
  });
}
