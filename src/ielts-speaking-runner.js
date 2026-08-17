import {
  validateIeltsSpeakingPrompt,
  evaluateSpeakingRubricCriteria,
  calculateOverallSpeakingBand,
  SPEAKING_RUBRIC_LABEL,
  createErrorRecord
} from './ielts-domain.js';
import { createAudioRecorder } from './audio-manager.js';

export const IELTS_SPEAKING_EXAM_MODE = 'exam';
export const IELTS_SPEAKING_PRACTICE_MODE = 'practice';
export const SPEAKING_PART2_PREP_SECONDS = 60;
export const SPEAKING_PART2_SPEAKING_SECONDS = 120;
export const IELTS_SPEAKING_CHECKPOINT_SCHEMA = 'IELTS_SPEAKING_CHECKPOINT_V1';

export const IELTS_SPEAKING_PART1_DEFAULT_PROMPT = Object.freeze({
  id: 'standard-ielts-speaking-part1',
  kind: 'ielts-speaking-prompt',
  part: 1,
  topic: 'Hometown & Daily Life',
  topics: ['Hometown', 'Work & Studies', 'Daily Routine'],
  questions: [
    'Where is your hometown and what is it like?',
    'What do you like most about living there?',
    'Has your hometown changed much since you were a child?',
    'Do you work or are you a student?',
    'What is your favorite time of the day and why?'
  ],
  recommendedMinutes: 5
});

export const IELTS_SPEAKING_PART2_DEFAULT_PROMPT = Object.freeze({
  id: 'standard-ielts-speaking-part2',
  kind: 'ielts-speaking-prompt',
  part: 2,
  topic: 'Describe a memorable journey or trip you took',
  cueCard: {
    topic: 'Describe a memorable journey or trip you took',
    bulletPoints: [
      'where you went and who you went with',
      'how you traveled to that place',
      'what you did during the trip',
      'and explain why this journey was memorable to you'
    ]
  },
  prepSeconds: SPEAKING_PART2_PREP_SECONDS,
  speakingSeconds: SPEAKING_PART2_SPEAKING_SECONDS,
  roundingQuestions: [
    'Do you often travel to this place?',
    'Would you recommend this journey to other people?'
  ],
  recommendedMinutes: 4
});

export const IELTS_SPEAKING_PART3_DEFAULT_PROMPT = Object.freeze({
  id: 'standard-ielts-speaking-part3',
  kind: 'ielts-speaking-prompt',
  part: 3,
  topic: 'Tourism, Travel Trends & Cultural Exchange',
  thematicLink: 'Tourism, Travel Trends & Cultural Exchange',
  questions: [
    'How has international travel changed in your country over the past few decades?',
    'What are the positive and negative impacts of tourism on local communities?',
    'Do you think people will travel more or less in the future due to technological advances?',
    'Why is it important for travelers to respect local customs and traditions?',
    'How can governments promote sustainable eco-tourism effectively?'
  ],
  recommendedMinutes: 5
});

export function createSyntheticSpeakingBlueprint(options = {}) {
  const id = options.id || `synthetic-speaking-blueprint-${Date.now()}`;
  const title = options.title || 'IELTS Speaking Test Simulation';
  const track = options.track || 'academic';

  const part1 = {
    ...IELTS_SPEAKING_PART1_DEFAULT_PROMPT,
    id: `${id}-part1`,
    ...(options.part1 || {})
  };

  const part2 = {
    ...IELTS_SPEAKING_PART2_DEFAULT_PROMPT,
    id: `${id}-part2`,
    ...(options.part2 || {})
  };

  const part3 = {
    ...IELTS_SPEAKING_PART3_DEFAULT_PROMPT,
    id: `${id}-part3`,
    ...(options.part3 || {})
  };

  return Object.freeze({
    id,
    kind: 'ielts-test-blueprint',
    schemaVersion: 1,
    skill: 'speaking',
    track,
    hierarchyLevel: 'SKILL_TEST',
    title,
    part1: Object.freeze(part1),
    part2: Object.freeze(part2),
    part3: Object.freeze(part3),
    _confidential: {
      part1ModelSample: options.part1ModelSample || null,
      part2ModelSample: options.part2ModelSample || null,
      part3ModelSample: options.part3ModelSample || null
    }
  });
}

export class IeltsSpeakingRunner {
  constructor(config = {}) {
    this.blueprint = config.blueprint || createSyntheticSpeakingBlueprint();
    this.mode = config.mode || IELTS_SPEAKING_EXAM_MODE;
    this.state = config.state || 'part1';
    this.activePart = Number(config.activePart || 1);
    this.part1QuestionIndex = Number(config.part1QuestionIndex || 0);
    this.part3QuestionIndex = Number(config.part3QuestionIndex || 0);
    this.scratchNotes = String(config.scratchNotes || '');
    this.prepSecondsRemaining = config.prepSecondsRemaining ?? SPEAKING_PART2_PREP_SECONDS;
    this.speakingSecondsRemaining = config.speakingSecondsRemaining ?? SPEAKING_PART2_SPEAKING_SECONDS;
    this.audioSegments = Array.isArray(config.audioSegments) ? [...config.audioSegments] : [];
    this.startedAt = (config.now || (() => Date.now()))();
    this.completedAt = null;
    this.rubricFeedback = config.rubricFeedback || null;
    this.onAutosave = config.onAutosave || null;
    this.onComplete = config.onComplete || null;
    this.audioRecorder = config.audioRecorder || createAudioRecorder();
  }

  nextQuestion() {
    if (this.activePart === 1) {
      const maxIdx = (this.blueprint.part1.questions?.length || 1) - 1;
      if (this.part1QuestionIndex < maxIdx) {
        this.part1QuestionIndex += 1;
        this.notifyAutosave();
      }
    } else if (this.activePart === 3) {
      const maxIdx = (this.blueprint.part3.questions?.length || 1) - 1;
      if (this.part3QuestionIndex < maxIdx) {
        this.part3QuestionIndex += 1;
        this.notifyAutosave();
      }
    }
  }

  advancePart() {
    if (this.activePart === 1) {
      this.activePart = 2;
      this.state = 'part2-prep';
      this.prepSecondsRemaining = SPEAKING_PART2_PREP_SECONDS;
    } else if (this.activePart === 2) {
      if (this.state === 'part2-prep') {
        this.state = 'part2-speak';
      } else if (this.state === 'part2-speak') {
        this.state = 'part2-rounding';
      } else if (this.state === 'part2-rounding') {
        this.activePart = 3;
        this.state = 'part3';
        this.part3QuestionIndex = 0;
      }
    } else if (this.activePart === 3) {
      this.complete();
      return;
    }
    this.notifyAutosave();
  }

  startPart2Speaking() {
    this.state = 'part2-speak';
    this.speakingSecondsRemaining = SPEAKING_PART2_SPEAKING_SECONDS;
    this.notifyAutosave();
  }

  finishPart2Speaking() {
    this.state = 'part2-rounding';
    this.notifyAutosave();
  }

  updateScratchNotes(text) {
    this.scratchNotes = String(text ?? '');
    this.notifyAutosave();
  }

  recordAudioSegment(part, questionIndex, segmentData = {}) {
    const segment = {
      part: Number(part),
      questionIndex: questionIndex !== null && questionIndex !== undefined ? Number(questionIndex) : null,
      duration: Number(segmentData.duration || 0),
      blobUrl: segmentData.blobUrl || `blob:speaking-audio-${Date.now()}`,
      recordedAt: Date.now()
    };
    this.audioSegments.push(segment);
    this.notifyAutosave();
    return segment;
  }

  getAudioSegmentsForPart(part) {
    return this.audioSegments.filter(s => s.part === Number(part));
  }

  getAudioSegmentForPart2() {
    return this.audioSegments.find(s => s.part === 2) || null;
  }

  getAllAudioSegments() {
    return [...this.audioSegments];
  }

  exportCheckpoint() {
    return {
      schemaVersion: IELTS_SPEAKING_CHECKPOINT_SCHEMA,
      blueprintId: this.blueprint.id,
      mode: this.mode,
      state: this.state,
      activePart: this.activePart,
      part1QuestionIndex: this.part1QuestionIndex,
      part3QuestionIndex: this.part3QuestionIndex,
      scratchNotes: this.scratchNotes,
      prepSecondsRemaining: this.prepSecondsRemaining,
      speakingSecondsRemaining: this.speakingSecondsRemaining,
      audioSegments: [...this.audioSegments],
      startedAt: this.startedAt,
      savedAt: Date.now()
    };
  }

  static restoreFromCheckpoint(blueprint, checkpoint = {}) {
    if (checkpoint.schemaVersion !== IELTS_SPEAKING_CHECKPOINT_SCHEMA) {
      throw new Error(`Invalid checkpoint schema version: ${checkpoint.schemaVersion}`);
    }
    return new IeltsSpeakingRunner({
      blueprint,
      mode: checkpoint.mode,
      state: checkpoint.state,
      activePart: checkpoint.activePart,
      part1QuestionIndex: checkpoint.part1QuestionIndex,
      part3QuestionIndex: checkpoint.part3QuestionIndex,
      scratchNotes: checkpoint.scratchNotes,
      prepSecondsRemaining: checkpoint.prepSecondsRemaining,
      speakingSecondsRemaining: checkpoint.speakingSecondsRemaining,
      audioSegments: checkpoint.audioSegments,
      now: () => checkpoint.startedAt || Date.now()
    });
  }

  emitSpeakingErrorCandidate(input = {}) {
    const category = input.category || 'speaking-fluency';
    const errorRecord = createErrorRecord({
      category,
      prompt: input.prompt || 'IELTS Speaking Session',
      learnerResponse: input.learnerResponse || '[Learner audio recording excerpt]',
      correction: input.correction || 'Use cohesive transition markers',
      explanation: input.explanation || 'Maintain fluency and lexical range throughout the response.',
      severity: input.severity || 'medium'
    });

    return {
      ...errorRecord,
      affectsSchedule: false,
      evidenceEligible: false
    };
  }

  getPublicItemProjection() {
    const projection = {
      id: this.blueprint.id,
      kind: this.blueprint.kind,
      schemaVersion: this.blueprint.schemaVersion,
      skill: this.blueprint.skill,
      track: this.blueprint.track,
      title: this.blueprint.title,
      part1: {
        id: this.blueprint.part1.id,
        kind: this.blueprint.part1.kind,
        part: this.blueprint.part1.part,
        topic: this.blueprint.part1.topic,
        questions: [...this.blueprint.part1.questions]
      },
      part2: {
        id: this.blueprint.part2.id,
        kind: this.blueprint.part2.kind,
        part: this.blueprint.part2.part,
        topic: this.blueprint.part2.topic,
        cueCard: { ...this.blueprint.part2.cueCard },
        prepSeconds: this.blueprint.part2.prepSeconds,
        speakingSeconds: this.blueprint.part2.speakingSeconds,
        roundingQuestions: [...(this.blueprint.part2.roundingQuestions || [])]
      },
      part3: {
        id: this.blueprint.part3.id,
        kind: this.blueprint.part3.kind,
        part: this.blueprint.part3.part,
        topic: this.blueprint.part3.topic,
        thematicLink: this.blueprint.part3.thematicLink,
        questions: [...this.blueprint.part3.questions]
      }
    };
    return Object.freeze(projection);
  }

  complete() {
    this.state = 'completed';
    this.completedAt = Date.now();

    // Generate practice rubric feedback
    const totalRecorded = this.audioSegments.reduce((acc, s) => acc + (s.duration || 0), 0);
    const feedback = evaluateSpeakingRubricCriteria({
      criteria: {
        fc: totalRecorded > 60 ? 6.5 : 6.0,
        lr: 6.5,
        gra: 6.5,
        pr: 6.5
      },
      strengths: [
        'Good communicative response addressing all parts of the cue card',
        'Clear rhythm and intelligible pronunciation'
      ],
      improvements: [
        'Practice expanding Part 3 analytical arguments with more concrete examples'
      ]
    });

    this.rubricFeedback = feedback;
    const summary = {
      blueprintId: this.blueprint.id,
      mode: this.mode,
      totalAudioSegments: this.audioSegments.length,
      totalDurationSeconds: totalRecorded,
      rubricFeedback: feedback,
      completedAt: this.completedAt
    };

    if (typeof this.onComplete === 'function') {
      this.onComplete(summary);
    }
    this.notifyAutosave();
    return summary;
  }

  notifyAutosave() {
    if (typeof this.onAutosave === 'function') {
      this.onAutosave(this.exportCheckpoint());
    }
  }
}

export function renderSpeakingRunnerDOM(options = {}) {
  const blueprint = options.blueprint || createSyntheticSpeakingBlueprint();
  const activePart = options.activePart || 1;
  const state = options.state || 'part1';

  return `
    <div class="v10-ielts-speaking-runner" data-active-part="${activePart}" data-state="${state}">
      <header class="ielts-speaking-header">
        <div class="ielts-speaking-parts-nav">
          <button type="button" class="ielts-speaking-part-btn ${activePart === 1 ? 'active' : ''}" data-part="1">Part 1 (Interview)</button>
          <button type="button" class="ielts-speaking-part-btn ${activePart === 2 ? 'active' : ''}" data-part="2">Part 2 (Cue Card)</button>
          <button type="button" class="ielts-speaking-part-btn ${activePart === 3 ? 'active' : ''}" data-part="3">Part 3 (Discussion)</button>
        </div>
        <div class="ielts-speaking-timer-display">
          ${state === 'part2-prep' ? '<span class="prep-timer" data-prep-timer="60">01:00 (Prep)</span>' : '<span class="speaking-timer" data-speaking-timer="120">02:00 (Speaking)</span>'}
        </div>
      </header>

      <div class="ielts-speaking-split-pane">
        <section class="ielts-speaking-stage-pane">
          ${activePart === 1 ? `
            <div class="ielts-speaking-part1-container">
              <h3>Part 1: Introduction & Interview</h3>
              <p class="topic-title">Topic: ${blueprint.part1?.topic || 'Familiar Topics'}</p>
              <div class="prompt-card">
                <p class="question-text">${blueprint.part1?.questions?.[0] || 'Please introduce yourself.'}</p>
              </div>
            </div>
          ` : activePart === 2 ? `
            <div class="ielts-speaking-part2-container ielts-speaking-cue-card">
              <h3>Part 2: Individual Long Turn</h3>
              <p class="cue-card-topic"><strong>${blueprint.part2?.cueCard?.topic || 'Describe a memorable experience'}</strong></p>
              <p>You should say:</p>
              <ul>
                ${(blueprint.part2?.cueCard?.bulletPoints || ['where it was', 'who was there', 'what happened']).map(b => `<li>${b}</li>`).join('')}
              </ul>
              <div class="scratch-notes-container">
                <label for="scratchNotes">Scratchpad Notes (1-min prep):</label>
                <textarea id="scratchNotes" name="scratch-notes" placeholder="Jot down bullet points, key vocabulary, and timeline..."></textarea>
              </div>
            </div>
          ` : `
            <div class="ielts-speaking-part3-container">
              <h3>Part 3: Two-Way Analytical Discussion</h3>
              <p class="thematic-link">Theme: ${blueprint.part3?.thematicLink || 'Abstract Discussion'}</p>
              <div class="prompt-card">
                <p class="question-text">${blueprint.part3?.questions?.[0] || 'How do societal trends influence this area?'}</p>
              </div>
            </div>
          `}
        </section>

        <section class="ielts-speaking-control-pane">
          <div class="audio-recorder-panel">
            <button type="button" class="primary-button" data-action="record" data-record-btn>Record Audio</button>
            <button type="button" class="secondary-button" data-action="play" data-play-btn>Play Recording</button>
            <button type="button" class="primary-button" data-action="next-question">Next Question</button>
            <button type="button" class="primary-button" data-action="advance-part">Next Part</button>
            <button type="button" class="secondary-button" data-action="submit" data-finish-btn>Finish & Get Rubric Feedback</button>
          </div>
          <div class="rubric-feedback-panel" id="speakingRubricFeedbackHost"></div>
        </section>
      </div>
    </div>
  `;
}

export function mountSpeakingRunnerUI(container, options = {}) {
  const blueprint = options.blueprint || createSyntheticSpeakingBlueprint();
  const runner = new IeltsSpeakingRunner({
    blueprint,
    mode: options.mode || IELTS_SPEAKING_EXAM_MODE,
    onAutosave: options.onAutosave,
    onComplete: options.onComplete
  });

  const renderUI = () => {
    container.innerHTML = renderSpeakingRunnerDOM({
      blueprint,
      mode: runner.mode,
      activePart: runner.activePart,
      state: runner.state
    });
  };

  renderUI();

  const controller = {
    runner,
    advancePart: () => {
      runner.advancePart();
      renderUI();
    },
    updateScratchNotes: (text) => {
      runner.updateScratchNotes(text);
    },
    startPart2Speaking: () => {
      runner.startPart2Speaking();
      renderUI();
    },
    finishPart2Speaking: () => {
      runner.finishPart2Speaking();
      renderUI();
    },
    recordAudioSegment: (part, qIdx, data) => {
      return runner.recordAudioSegment(part, qIdx, data);
    },
    submit: async () => {
      return runner.complete();
    }
  };

  return controller;
}
