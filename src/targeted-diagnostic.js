import { validateWeaknessProfile } from './weakness-profile.js';
import { assertSafeAssessmentData } from './frozen-assessment-contracts.js';

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