import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSpeakingRubricCriteria,
  calculateOverallSpeakingBand,
  validateIeltsSpeakingPrompt,
  SPEAKING_RUBRIC_LABEL
} from '../src/ielts-domain.js';
import {
  IeltsSpeakingRunner,
  createSyntheticSpeakingBlueprint,
  IELTS_SPEAKING_EXAM_MODE,
  IELTS_SPEAKING_PRACTICE_MODE,
  SPEAKING_PART2_PREP_SECONDS,
  SPEAKING_PART2_SPEAKING_SECONDS,
  IELTS_SPEAKING_CHECKPOINT_SCHEMA
} from '../src/ielts-speaking-runner.js';

describe('Stage 2 Wave W5: IELTS Interactive Speaking Platform (W5-IELTS-SPK-001)', () => {
  describe('3-Part Speaking Structure & Synthetic Blueprint', () => {
    it('creates a complete synthetic speaking blueprint with Part 1, Part 2 (Cue Card + Rounding), and Part 3 prompts', () => {
      const blueprint = createSyntheticSpeakingBlueprint({
        id: 'spk-bp-test-01',
        title: 'IELTS Academic Speaking Test'
      });

      assert.equal(blueprint.kind, 'ielts-test-blueprint');
      assert.equal(blueprint.skill, 'speaking');
      assert.equal(blueprint.schemaVersion, 1);
      assert.ok(blueprint.part1, 'Must include Part 1 configuration');
      assert.ok(blueprint.part2, 'Must include Part 2 configuration');
      assert.ok(blueprint.part3, 'Must include Part 3 configuration');

      // Part 1
      assert.ok(Array.isArray(blueprint.part1.questions) && blueprint.part1.questions.length >= 4, 'Part 1 must have at least 4 questions');
      assert.ok(blueprint.part1.topics && blueprint.part1.topics.length >= 2, 'Part 1 must cover at least 2 familiar topics');

      // Part 2 (Cue card + Rounding)
      assert.ok(blueprint.part2.cueCard, 'Part 2 must contain a cue card prompt');
      assert.ok(blueprint.part2.cueCard.topic, 'Cue card must have a main topic');
      assert.ok(Array.isArray(blueprint.part2.cueCard.bulletPoints) && blueprint.part2.cueCard.bulletPoints.length >= 3, 'Cue card must have 3-4 bullet points');
      assert.equal(blueprint.part2.prepSeconds, SPEAKING_PART2_PREP_SECONDS);
      assert.equal(blueprint.part2.speakingSeconds, SPEAKING_PART2_SPEAKING_SECONDS);
      assert.ok(Array.isArray(blueprint.part2.roundingQuestions) && blueprint.part2.roundingQuestions.length >= 1, 'Part 2 must include rounding questions');

      // Part 3
      assert.ok(Array.isArray(blueprint.part3.questions) && blueprint.part3.questions.length >= 4, 'Part 3 must have at least 4 analytical questions');
      assert.ok(blueprint.part3.thematicLink, 'Part 3 must link thematically to Part 2');
    });

    it('validates Part 1, Part 2, and Part 3 prompts with validateIeltsSpeakingPrompt', () => {
      const p1 = {
        kind: 'ielts-speaking-prompt',
        part: 1,
        topic: 'Hometown & Daily Life',
        questions: ['Where is your hometown?', 'What do you like most about living there?']
      };
      const validP1 = validateIeltsSpeakingPrompt(p1);
      assert.equal(validP1.valid, true);

      const p2 = {
        kind: 'ielts-speaking-prompt',
        part: 2,
        topic: 'Describe a memorable journey you took',
        bulletPoints: ['Where you went', 'Who you went with', 'What you did', 'Explain why it was memorable'],
        prepSeconds: 60,
        speakingSeconds: 120
      };
      const validP2 = validateIeltsSpeakingPrompt(p2);
      assert.equal(validP2.valid, true);

      const p3 = {
        kind: 'ielts-speaking-prompt',
        part: 3,
        topic: 'Tourism & Travel Trends',
        questions: ['How has international travel changed in recent decades?', 'What are the environmental impacts of mass tourism?']
      };
      const validP3 = validateIeltsSpeakingPrompt(p3);
      assert.equal(validP3.valid, true);
    });
  });

  describe('Speaking State Machine & Runner Orchestration', () => {
    it('manages 3-part guided simulation state transitions cleanly', () => {
      const blueprint = createSyntheticSpeakingBlueprint();
      const runner = new IeltsSpeakingRunner({
        blueprint,
        mode: IELTS_SPEAKING_EXAM_MODE
      });

      assert.equal(runner.state, 'part1');
      assert.equal(runner.activePart, 1);
      assert.equal(runner.part1QuestionIndex, 0);

      // Advance through Part 1 questions
      const p1Count = blueprint.part1.questions.length;
      for (let i = 0; i < p1Count - 1; i++) {
        runner.nextQuestion();
        assert.equal(runner.part1QuestionIndex, i + 1);
      }

      // Transition to Part 2 prep
      runner.advancePart();
      assert.equal(runner.state, 'part2-prep');
      assert.equal(runner.activePart, 2);
      assert.equal(runner.prepSecondsRemaining, SPEAKING_PART2_PREP_SECONDS);

      // Record scratch notes during prep
      runner.updateScratchNotes('Key points: Summer trip to mountains, hiking trails, peaceful lake.');
      assert.equal(runner.scratchNotes, 'Key points: Summer trip to mountains, hiking trails, peaceful lake.');

      // Start Part 2 speaking
      runner.startPart2Speaking();
      assert.equal(runner.state, 'part2-speak');
      assert.equal(runner.speakingSecondsRemaining, SPEAKING_PART2_SPEAKING_SECONDS);

      // Finish Part 2 speaking -> Rounding questions
      runner.finishPart2Speaking();
      assert.equal(runner.state, 'part2-rounding');

      // Transition to Part 3
      runner.advancePart();
      assert.equal(runner.state, 'part3');
      assert.equal(runner.activePart, 3);
      assert.equal(runner.part3QuestionIndex, 0);

      // Finish Part 3 -> Completed
      const p3Count = blueprint.part3.questions.length;
      for (let i = 0; i < p3Count - 1; i++) {
        runner.nextQuestion();
      }
      const summary = runner.complete();
      assert.equal(runner.state, 'completed');
      assert.ok(summary, 'Must return simulation summary');
    });

    it('records audio segments per part and provides playback access', () => {
      const blueprint = createSyntheticSpeakingBlueprint();
      const runner = new IeltsSpeakingRunner({ blueprint });

      // Mock audio recordings
      runner.recordAudioSegment(1, 0, { duration: 15.5, blobUrl: 'blob:mock-p1-q0' });
      runner.recordAudioSegment(1, 1, { duration: 18.2, blobUrl: 'blob:mock-p1-q1' });
      runner.recordAudioSegment(2, null, { duration: 110.0, blobUrl: 'blob:mock-p2-cue' });
      runner.recordAudioSegment(3, 0, { duration: 25.0, blobUrl: 'blob:mock-p3-q0' });

      const p1Audios = runner.getAudioSegmentsForPart(1);
      assert.equal(p1Audios.length, 2);
      assert.equal(p1Audios[0].blobUrl, 'blob:mock-p1-q0');

      const p2Audio = runner.getAudioSegmentForPart2();
      assert.ok(p2Audio);
      assert.equal(p2Audio.duration, 110.0);

      const allAudios = runner.getAllAudioSegments();
      assert.equal(allAudios.length, 4);
    });

    it('exports and restores checkpoints cleanly for reload recovery (IELTS_SPEAKING_CHECKPOINT_V1)', () => {
      const blueprint = createSyntheticSpeakingBlueprint({ id: 'spk-chk-01' });
      let savedCheckpoint = null;

      const runner = new IeltsSpeakingRunner({
        blueprint,
        onAutosave: (chk) => { savedCheckpoint = chk; }
      });

      runner.advancePart(); // go to Part 2 prep
      runner.updateScratchNotes('Important vocabulary: breathtaking scenery, hospitable locals');
      runner.recordAudioSegment(1, 0, { duration: 12.0, blobUrl: 'blob:p1-audio' });

      assert.ok(savedCheckpoint, 'Autosave must emit checkpoint');
      assert.equal(savedCheckpoint.schemaVersion, IELTS_SPEAKING_CHECKPOINT_SCHEMA);
      assert.equal(savedCheckpoint.activePart, 2);
      assert.equal(savedCheckpoint.state, 'part2-prep');
      assert.equal(savedCheckpoint.scratchNotes, 'Important vocabulary: breathtaking scenery, hospitable locals');

      // Restore into new runner instance
      const restoredRunner = IeltsSpeakingRunner.restoreFromCheckpoint(blueprint, savedCheckpoint);
      assert.equal(restoredRunner.activePart, 2);
      assert.equal(restoredRunner.state, 'part2-prep');
      assert.equal(restoredRunner.scratchNotes, 'Important vocabulary: breathtaking scenery, hospitable locals');
      assert.equal(restoredRunner.getAllAudioSegments().length, 1);
    });
  });

  describe('4-Dimension Rubric Evaluation & Scoring Honesty', () => {
    it('evaluates Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation', () => {
      const feedback = evaluateSpeakingRubricCriteria({
        criteria: {
          fc: 7.0,
          lr: 6.5,
          gra: 7.0,
          pr: 6.5
        },
        strengths: ['Good sentence complexity', 'Clear pronunciation on multisyllabic words'],
        improvements: ['Reduce occasional hesitation when searching for abstract terminology']
      });

      assert.equal(feedback.criteria.fc, 7.0);
      assert.equal(feedback.criteria.lr, 6.5);
      assert.equal(feedback.criteria.gra, 7.0);
      assert.equal(feedback.criteria.pr, 6.5);
      assert.equal(feedback.overallBand, 7.0); // (7 + 6.5 + 7 + 6.5)/4 = 6.75 -> round to half band = 7.0
      assert.equal(feedback.disclaimer, SPEAKING_RUBRIC_LABEL);
      assert.equal(feedback.disclaimerPresent, true);
    });

    it('calculates overall band with correct IELTS half-band rounding algorithm', () => {
      // (6.0 + 6.0 + 6.0 + 6.0)/4 = 6.0
      assert.equal(calculateOverallSpeakingBand({ fc: 6.0, lr: 6.0, gra: 6.0, pr: 6.0 }), 6.0);

      // (6.0 + 6.5 + 6.0 + 6.0)/4 = 6.125 -> rounds down to 6.0
      assert.equal(calculateOverallSpeakingBand({ fc: 6.0, lr: 6.5, gra: 6.0, pr: 6.0 }), 6.0);

      // (6.5 + 6.5 + 6.0 + 6.0)/4 = 6.25 -> rounds up to 6.5
      assert.equal(calculateOverallSpeakingBand({ fc: 6.5, lr: 6.5, gra: 6.0, pr: 6.0 }), 6.5);

      // (7.0 + 7.5 + 7.0 + 7.5)/4 = 7.25 -> rounds up to 7.5
      assert.equal(calculateOverallSpeakingBand({ fc: 7.0, lr: 7.5, gra: 7.0, pr: 7.5 }), 7.5);

      // (7.5 + 8.0 + 7.5 + 8.0)/4 = 7.75 -> rounds up to 8.0
      assert.equal(calculateOverallSpeakingBand({ fc: 7.5, lr: 8.0, gra: 7.5, pr: 8.0 }), 8.0);
    });

    it('guarantees scoring honesty and zero claims of official certification', () => {
      const evaluation = evaluateSpeakingRubricCriteria({
        criteria: { fc: 8.0, lr: 8.0, gra: 8.0, pr: 8.0 }
      });

      assert.ok(evaluation.disclaimer.includes('Practice Reference') || evaluation.disclaimer.includes('Estimated Band Score'), 'Must include practice reference disclaimer');
      assert.ok(!evaluation.disclaimer.toLowerCase().includes('certified examiner'), 'Must never claim certified examiner score');
      assert.ok(!evaluation.disclaimer.toLowerCase().includes('official ielts certificate'), 'Must never claim official certificate');
    });
  });

  describe('Error Candidate Emission & Schedule Isolation', () => {
    it('emits Speaking error candidates with speaking categories into ErrorRepository without schedule impact', () => {
      const blueprint = createSyntheticSpeakingBlueprint();
      const runner = new IeltsSpeakingRunner({ blueprint });

      const candidate = runner.emitSpeakingErrorCandidate({
        category: 'speaking-fluency',
        prompt: 'Part 2 Cue Card: Describe a journey',
        learnerResponse: '[Transcript excerpt with excessive filled pauses "um, ah, like"]',
        correction: 'Use structured transition phrases: "First of all", "Another reason why", "Looking back on it"',
        explanation: 'Avoid excessive filled pauses; use discourse markers to maintain continuity.'
      });

      assert.ok(candidate);
      assert.equal(candidate.category, 'speaking-fluency');
      assert.ok(['speaking-fluency', 'speaking-lexical', 'speaking-grammar', 'speaking-pronunciation'].includes(candidate.category));

      // Evidence policy compliance
      assert.equal(candidate.affectsSchedule, false);
      assert.equal(candidate.evidenceEligible, false);
    });

    it('enforces KEY_LEAK_BEFORE_SUBMIT === 0 for model answers and examiner notes', () => {
      const blueprint = createSyntheticSpeakingBlueprint({
        part2ModelSample: 'Model speaking response text for cue card'
      });

      const runner = new IeltsSpeakingRunner({ blueprint });
      const publicProjection = runner.getPublicItemProjection();

      assert.equal(publicProjection._confidential, undefined);
      assert.equal(publicProjection.part2ModelSample, undefined);
      assert.equal(JSON.stringify(publicProjection).includes('Model speaking response text'), false);
    });
  });
});
