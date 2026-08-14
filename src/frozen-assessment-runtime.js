import {
  FROZEN_ASSESSMENT_BLUEPRINT_KIND,
  FROZEN_ASSESSMENT_ERROR_CODES,
  FROZEN_ASSESSMENT_MODE,
  FROZEN_ASSESSMENT_PURPOSE,
  FROZEN_ASSESSMENT_RUN_KIND,
  assertSafeAssessmentData,
  deepFreeze,
  frozenAssessmentError
} from './frozen-assessment-contracts.js';
import { scoreQuestionActivity, validateQuestionActivity } from './question-activity-contracts.js';

export function createFrozenAssessmentRuntime({
  ownerAdapter,
  questionRegistry,
  resolveQuestion
} = {}) {
  if (!ownerAdapter || typeof ownerAdapter !== 'object') {
    throw frozenAssessmentError(
      FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
      'createFrozenAssessmentRuntime requires a valid ownerAdapter.'
    );
  }
  if (!questionRegistry || typeof questionRegistry !== 'object') {
    throw frozenAssessmentError(
      FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
      'createFrozenAssessmentRuntime requires a valid questionRegistry.'
    );
  }

  const defaultResolve = async binding => {
    if (typeof resolveQuestion === 'function') {
      return resolveQuestion(binding);
    }
    return null;
  };

  return Object.freeze({
    async createBlueprint(input) {
      assertSafeAssessmentData(input);

      if (typeof input.id !== 'string' || !input.id.trim()) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
          'Blueprint requires a non-empty string id.'
        );
      }
      if (typeof input.profile !== 'string' || !input.profile.trim()) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
          'Blueprint requires a non-empty string profile.'
        );
      }
      if (!Array.isArray(input.questions) || input.questions.length === 0) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
          'Blueprint requires at least one question.'
        );
      }

      const items = [];

      for (let idx = 0; idx < input.questions.length; idx += 1) {
        const q = input.questions[idx];
        const validation = validateQuestionActivity(q);
        if (!validation.valid) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
            `Question at index ${idx} is invalid: ${validation.errors.join(' ')}`
          );
        }
        if (!questionRegistry.supports(q)) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
            `Question at index ${idx} is not supported by questionRegistry.`
          );
        }

        const ordinal = idx + 1;
        items.push({
          ordinal,
          id: String(q.id),
          questionId: String(q.id),
          kind: String(q.kind),
          promptRevision: String(q.promptRevision || ''),
          promptDigest: String(q.promptDigest || ''),
          prompt: String(q.item?.prompt || q.prompt || ''),
          context: String(q.item?.context || q.context || ''),
          options: (q.item?.options || []).map(opt => ({
            id: String(opt.id),
            text: String(opt.text)
          }))
        });
      }

      const blueprint = {
        kind: FROZEN_ASSESSMENT_BLUEPRINT_KIND,
        id: String(input.id),
        profile: String(input.profile),
        mode: FROZEN_ASSESSMENT_MODE,
        purpose: FROZEN_ASSESSMENT_PURPOSE,
        coverage: {
          itemCount: input.questions.length
        },
        items,
        representative: false,
        bandScore: null,
        readiness: null,
        mastery: null,
        affectsSchedule: false,
        evidenceEligible: false,
        createdAt: Number(input.createdAt || Date.now()),
        updatedAt: Number(input.createdAt || Date.now())
      };

      const existing = await ownerAdapter.getBlueprint(blueprint.id);
      if (existing) {
        if (JSON.stringify(existing) === JSON.stringify(blueprint)) {
          return deepFreeze(structuredClone(existing));
        }
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.COLLISION,
          `Blueprint collision for id: ${blueprint.id}`
        );
      }

      await ownerAdapter.saveBlueprint(blueprint);
      return deepFreeze(structuredClone(blueprint));
    },

    async startRun({ id, blueprintId, at = Date.now() } = {}) {
      assertSafeAssessmentData({ id, blueprintId, at });

      if (typeof id !== 'string' || !id.trim()) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
          'startRun requires a non-empty string id.'
        );
      }
      if (typeof blueprintId !== 'string' || !blueprintId.trim()) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
          'startRun requires a non-empty string blueprintId.'
        );
      }

      const blueprint = await ownerAdapter.getBlueprint(blueprintId);
      if (!blueprint) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.NOT_FOUND,
          `Blueprint not found: ${blueprintId}`
        );
      }

      const existingRun = await ownerAdapter.getRun(id);
      if (existingRun) {
        if (existingRun.blueprintId !== blueprintId) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.COLLISION,
            `Run ${id} already bound to blueprint ${existingRun.blueprintId}`
          );
        }
        return deepFreeze(structuredClone(existingRun));
      }

      const run = {
        kind: FROZEN_ASSESSMENT_RUN_KIND,
        id: String(id),
        blueprintId: String(blueprintId),
        status: 'ACTIVE',
        startedAt: Number(at),
        updatedAt: Number(at),
        representative: false,
        bandScore: null,
        readiness: null,
        mastery: null,
        affectsSchedule: false,
        evidenceEligible: false
      };

      await ownerAdapter.saveRun(run);
      return deepFreeze(structuredClone(run));
    },

    async completeRun({ runId, responses, at = Date.now() } = {}) {
      assertSafeAssessmentData({ runId, responses, at });

      if (typeof runId !== 'string' || !runId.trim()) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
          'completeRun requires a non-empty string runId.'
        );
      }

      const run = await ownerAdapter.getRun(runId);
      if (!run) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.NOT_FOUND,
          `Run not found: ${runId}`
        );
      }

      const blueprint = await ownerAdapter.getBlueprint(run.blueprintId);
      if (!blueprint) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.NOT_FOUND,
          `Blueprint not found: ${run.blueprintId}`
        );
      }

      if (run.status === 'COMPLETED') {
        if (JSON.stringify(run.responses) === JSON.stringify(responses)) {
          return deepFreeze(structuredClone(run));
        }
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.TERMINAL_CONFLICT,
          `Run ${runId} already completed with different terminal responses.`
        );
      }

      if (!Array.isArray(responses) || responses.length !== blueprint.coverage.itemCount) {
        throw frozenAssessmentError(
          FROZEN_ASSESSMENT_ERROR_CODES.INCOMPLETE,
          `Responses count (${responses?.length}) does not match blueprint item count (${blueprint.coverage.itemCount}).`
        );
      }

      const sortedResponses = [];
      let numerator = 0;
      let denominator = 0;

      for (let ord = 1; ord <= blueprint.coverage.itemCount; ord += 1) {
        const itemResponse = responses.find(r => r && r.ordinal === ord);
        if (!itemResponse || !itemResponse.response) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.INCOMPLETE,
            `Missing response for item ordinal ${ord}.`
          );
        }

        const item = (blueprint.items || []).find(b => b.ordinal === ord);
        if (!item) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.NOT_FOUND,
            `Question item not found for ordinal ${ord}.`
          );
        }

        const question = await defaultResolve({
          questionId: item.questionId || item.id,
          ordinal: item.ordinal
        });
        if (
          !question ||
          (item.promptDigest && question.promptDigest !== item.promptDigest)
        ) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.BINDING_CHANGED,
            `Question binding changed or unavailable for ordinal ${ord}.`
          );
        }

        const score = scoreQuestionActivity(question, itemResponse.response);
        if (!score.valid) {
          throw frozenAssessmentError(
            FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT,
            `Invalid question response for ordinal ${ord}: ${score.errors?.join(' ')}`
          );
        }

        numerator += score.numerator || 0;
        denominator += score.denominator || 1;

        sortedResponses.push({
          ordinal: ord,
          response: structuredClone(itemResponse.response)
        });
      }

      const winner = {
        kind: FROZEN_ASSESSMENT_RUN_KIND,
        id: run.id,
        blueprintId: blueprint.id,
        status: 'COMPLETED',
        aggregate: {
          numerator,
          denominator,
          answeredCount: sortedResponses.length,
          itemCount: blueprint.coverage.itemCount
        },
        responses: sortedResponses,
        representative: false,
        bandScore: null,
        readiness: null,
        mastery: null,
        affectsSchedule: false,
        evidenceEligible: false,
        startedAt: run.startedAt,
        completedAt: Number(at),
        updatedAt: Number(at)
      };

      await ownerAdapter.saveRun(winner);
      return deepFreeze(structuredClone(winner));
    },

    async getRun(id) {
      if (typeof id !== 'string' || !id.trim()) return null;
      const run = await ownerAdapter.getRun(id);
      if (!run) return null;
      return deepFreeze(structuredClone(run));
    },

    async getBlueprint(id) {
      if (typeof id !== 'string' || !id.trim()) return null;
      const blueprint = await ownerAdapter.getBlueprint(id);
      if (!blueprint) return null;
      return deepFreeze(structuredClone(blueprint));
    }
  });
}
