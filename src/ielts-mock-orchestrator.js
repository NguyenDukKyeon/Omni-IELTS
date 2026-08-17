/**
 * src/ielts-mock-orchestrator.js
 *
 * Core IELTS Full Mock Exam & Section Practice Orchestrator:
 * - Multi-skill sequential orchestration: Listening -> Reading -> Writing -> Speaking
 * - 4-tier practice hierarchy: Task Family -> Section -> Skill Test -> Full Mock
 * - Checkpoint persistence and reload recovery (S15-F005)
 * - Composite multi-skill score calculation with official half-band rounding
 * - Honest practice reference disclaimer & zero certification claims
 * - Schedule isolation (affectsSchedule: false) & zero answer key leaks
 */

import {
  calculateOverallSpeakingBand,
  calculateOverallWritingBand,
  rawScoreToIeltsBand,
  roundToNearestHalfBand,
  createIeltsId,
  cleanText
} from './ielts-domain.js';

export const IELTS_MOCK_CHECKPOINT_SCHEMA = 'ielts-mock-checkpoint-v1';

export const IELTS_PRACTICE_TIER = Object.freeze({
  TASK_FAMILY: 'task-family',
  SECTION: 'section',
  SKILL_TEST: 'skill-test',
  FULL_MOCK: 'full-mock'
});

export const IELTS_MOCK_STATE = Object.freeze({
  INITIALIZED: 'initialized',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed'
});

export const IELTS_MOCK_DISCLAIMER = 'Estimated Band Score & Practice Feedback — Practice Reference';

const SKILL_SEQUENCE = Object.freeze(['listening', 'reading', 'writing', 'speaking']);

const SKILL_DURATION_SECONDS = Object.freeze({
  listening: 1800, // 30 mins
  reading: 3600,   // 60 mins
  writing: 3600,   // 60 mins
  speaking: 900    // 15 mins
});

export function calculateCompositeIeltsBand(skillBands = {}) {
  const listening = Number(skillBands.listening ?? 6.0);
  const reading = Number(skillBands.reading ?? 6.0);
  const writing = Number(skillBands.writing ?? 6.0);
  const speaking = Number(skillBands.speaking ?? 6.0);

  const rawAverage = (listening + reading + writing + speaking) / 4;
  return roundToNearestHalfBand(rawAverage);
}

export function createSyntheticFullMockBlueprint(options = {}) {
  const track = options.track === 'general-training' ? 'general-training' : 'academic';
  const id = options.id || createIeltsId('mock-bp');
  const title = options.title || `IELTS ${track === 'academic' ? 'Academic' : 'General Training'} Full Mock Test`;

  return {
    kind: 'ielts-mock-blueprint',
    schemaVersion: 1,
    id,
    title,
    track,
    tier: IELTS_PRACTICE_TIER.FULL_MOCK,
    totalDurationMinutes: 165,
    listening: {
      totalQuestions: 40,
      parts: [
        { partNumber: 1, questionCount: 10, taskFamily: 'form-completion', context: 'Social Survival / Factual Inquiry' },
        { partNumber: 2, questionCount: 10, taskFamily: 'plan-map-diagram-labelling', context: 'Monologue / Campus Tour Guide' },
        { partNumber: 3, questionCount: 10, taskFamily: 'multiple-choice-multiple', context: 'Academic Discussion / 2-3 Speakers' },
        { partNumber: 4, questionCount: 10, taskFamily: 'summary-completion', context: 'Academic Lecture / Natural Science' }
      ]
    },
    reading: {
      totalQuestions: 40,
      track,
      passages: track === 'academic' ? [
        { passageNumber: 1, questionCount: 13, title: 'The Origins of Early Agriculture', taskFamilies: ['identifying-information-true-false-not-given', 'note-completion'] },
        { passageNumber: 2, questionCount: 13, title: 'Biomimicry in Architecture', taskFamilies: ['matching-headings', 'sentence-completion'] },
        { passageNumber: 3, questionCount: 14, title: 'Artificial Intelligence and Cognitive Linguistics', taskFamilies: ['multiple-choice-single', 'summary-completion-box', 'identifying-writer-views-yes-no-not-given'] }
      ] : [
        { passageNumber: 1, questionCount: 14, title: 'Community Centre Timetables & Notices', taskFamilies: ['identifying-information-true-false-not-given', 'short-answer'] },
        { passageNumber: 2, questionCount: 13, title: 'Staff Health & Safety Regulations', taskFamilies: ['matching-information', 'sentence-completion'] },
        { passageNumber: 3, questionCount: 13, title: 'The History of Windmills', taskFamilies: ['matching-headings', 'multiple-choice-single'] }
      ]
    },
    writing: {
      track,
      totalMinutes: 60,
      task1: track === 'academic' ? {
        visualType: 'bar-chart',
        title: 'Global Renewable Energy Investment (2010-2025)',
        minWords: 150,
        suggestedMinutes: 20
      } : {
        register: 'formal',
        title: 'Letter to Landlord Requesting Urgent Repairs',
        bulletPrompts: [
          'Explain why you are writing',
          'Describe the problem in the apartment',
          'State what action you require the landlord to take'
        ],
        minWords: 150,
        suggestedMinutes: 20
      },
      task2: {
        essayType: 'agree-disagree',
        prompt: 'Some people believe that universities should focus solely on graduate employment, while others think education is valuable for personal development. Discuss both views and give your opinion.',
        minWords: 250,
        suggestedMinutes: 40
      }
    },
    speaking: {
      track,
      totalMinutes: 14,
      part1: {
        topics: ['Hometown & Living Environment', 'Work & Studies', 'Daily Habits'],
        questions: [
          'Where is your hometown located?',
          'What do you enjoy most about living in your area?',
          'Do you prefer studying in the morning or in the evening?',
          'How do you usually spend your weekends?'
        ]
      },
      part2: {
        cueCard: {
          topic: 'Describe an important life decision you made recently',
          bulletPoints: [
            'What the decision was',
            'When and why you made it',
            'What difficulties you encountered',
            'Explain why you think it was the right decision'
          ]
        },
        prepSeconds: 60,
        speakingSeconds: 120,
        roundingQuestions: ['Did anyone help you make that decision?']
      },
      part3: {
        thematicLink: 'Decision Making & Risk Assessment',
        questions: [
          'What factors should young people consider when choosing a career path?',
          'Do you think society puts too much pressure on individuals to make decisions quickly?',
          'How has technology changed the way organizations make strategic decisions?',
          'Is it better to make decisions based on logic or intuition?'
        ]
      }
    }
  };
}

export class IeltsMockOrchestrator {
  constructor(options = {}) {
    this.blueprint = options.blueprint || createSyntheticFullMockBlueprint(options);
    this.tier = options.tier || this.blueprint.tier || IELTS_PRACTICE_TIER.FULL_MOCK;
    this.track = options.track || this.blueprint.track || 'academic';
    this.state = IELTS_MOCK_STATE.INITIALIZED;
    this.activeSkillIndex = 0;
    this.activeSkill = null;
    this.isSectionPractice = this.tier === IELTS_PRACTICE_TIER.SECTION;
    this.targetSkill = options.targetSkill || null;
    this.targetSectionIndex = options.targetSectionIndex ?? 0;

    this.completedSkills = {};
    this.currentSectionResponses = {};
    this.remainingSeconds = 0;
    this.attemptRecords = [];
    this.skillProgress = {
      listening: { completed: false, responses: {}, rawScore: 0, band: 0 },
      reading: { completed: false, responses: {}, rawScore: 0, band: 0 },
      writing: { completed: false, task1Draft: '', task2Draft: '', rubricScores: {}, band: 0 },
      speaking: { completed: false, recordedAudio: {}, rubricScores: {}, band: 0 }
    };
  }

  start() {
    this.state = IELTS_MOCK_STATE.IN_PROGRESS;
    if (this.isSectionPractice && this.targetSkill) {
      this.activeSkill = this.targetSkill;
      this.remainingSeconds = SKILL_DURATION_SECONDS[this.targetSkill] || 1800;
    } else {
      this.activeSkillIndex = 0;
      this.activeSkill = SKILL_SEQUENCE[0];
      this.remainingSeconds = SKILL_DURATION_SECONDS[this.activeSkill];
    }
  }

  completeActiveSkillSection(sectionResult = {}) {
    if (this.state !== IELTS_MOCK_STATE.IN_PROGRESS || !this.activeSkill) return;

    const skill = this.activeSkill;
    const now = Date.now();

    if (skill === 'listening') {
      const rawScore = Number(sectionResult.rawScore ?? 0);
      const band = rawScoreToIeltsBand(rawScore, 'listening', this.track);
      this.skillProgress.listening = {
        completed: true,
        responses: { ...sectionResult.responses },
        rawScore,
        band,
        completedAt: now
      };
      this.completedSkills.listening = { rawScore, band };
    } else if (skill === 'reading') {
      const rawScore = Number(sectionResult.rawScore ?? 0);
      const band = rawScoreToIeltsBand(rawScore, 'reading', this.track);
      this.skillProgress.reading = {
        completed: true,
        responses: { ...sectionResult.responses },
        rawScore,
        band,
        completedAt: now
      };
      this.completedSkills.reading = { rawScore, band };
    } else if (skill === 'writing') {
      const rubric = sectionResult.rubricScores || { ta: 6.0, cc: 6.0, lr: 6.0, gra: 6.0 };
      const task1Band = Number(sectionResult.task1Score ?? 6.0);
      const task2Band = Number(sectionResult.task2Score ?? 6.0);
      const composite = calculateOverallWritingBand({ task1Band, task2Band });
      this.skillProgress.writing = {
        completed: true,
        rubricScores: rubric,
        task1Band,
        task2Band,
        band: composite.overallBand,
        completedAt: now
      };
      this.completedSkills.writing = { band: composite.overallBand, rubric };
    } else if (skill === 'speaking') {
      const rubric = sectionResult.rubricScores || { fc: 6.0, lr: 6.0, gra: 6.0, pr: 6.0 };
      const band = calculateOverallSpeakingBand(rubric);
      this.skillProgress.speaking = {
        completed: true,
        rubricScores: rubric,
        band,
        completedAt: now
      };
      this.completedSkills.speaking = { band, rubric };
    }

    // Record Schedule-isolated Attempt Record
    this.attemptRecords.push({
      skill,
      track: this.track,
      completedAt: now,
      affectsSchedule: false,
      evidenceEligible: false,
      disclaimer: IELTS_MOCK_DISCLAIMER
    });

    if (this.isSectionPractice) {
      this.state = IELTS_MOCK_STATE.COMPLETED;
      this.activeSkill = null;
      return;
    }

    // Advance to next skill
    this.activeSkillIndex += 1;
    if (this.activeSkillIndex < SKILL_SEQUENCE.length) {
      this.activeSkill = SKILL_SEQUENCE[this.activeSkillIndex];
      this.remainingSeconds = SKILL_DURATION_SECONDS[this.activeSkill];
      this.currentSectionResponses = {};
    } else {
      this.state = IELTS_MOCK_STATE.COMPLETED;
      this.activeSkill = null;
    }
  }

  recordSectionProgress(skill, responses = {}, remainingSeconds = 0) {
    if (this.skillProgress[skill]) {
      this.skillProgress[skill].responses = { ...responses };
    }
    this.currentSectionResponses = { ...responses };
    this.remainingSeconds = remainingSeconds;
  }

  getScoreReport() {
    const listeningBand = this.skillProgress.listening.band || 0;
    const readingBand = this.skillProgress.reading.band || 0;
    const writingBand = this.skillProgress.writing.band || 0;
    const speakingBand = this.skillProgress.speaking.band || 0;

    const overallBand = calculateCompositeIeltsBand({
      listening: listeningBand,
      reading: readingBand,
      writing: writingBand,
      speaking: speakingBand
    });

    return {
      kind: 'ielts-mock-score-report',
      track: this.track,
      tier: this.tier,
      listening: {
        rawScore: this.skillProgress.listening.rawScore,
        band: listeningBand
      },
      reading: {
        rawScore: this.skillProgress.reading.rawScore,
        band: readingBand
      },
      writing: {
        band: writingBand,
        rubric: this.skillProgress.writing.rubricScores
      },
      speaking: {
        band: speakingBand,
        rubric: this.skillProgress.speaking.rubricScores
      },
      overallBand,
      disclaimer: IELTS_MOCK_DISCLAIMER,
      disclaimerPresent: true
    };
  }

  exportCheckpoint() {
    return {
      schema: IELTS_MOCK_CHECKPOINT_SCHEMA,
      blueprintId: this.blueprint.id,
      track: this.track,
      tier: this.tier,
      state: this.state,
      activeSkill: this.activeSkill,
      activeSkillIndex: this.activeSkillIndex,
      remainingSeconds: this.remainingSeconds,
      skillProgress: structuredClone(this.skillProgress),
      completedSkills: structuredClone(this.completedSkills),
      currentSectionResponses: structuredClone(this.currentSectionResponses),
      updatedAt: Date.now()
    };
  }

  static restoreFromCheckpoint(blueprint, checkpoint = {}) {
    if (!checkpoint || checkpoint.schema !== IELTS_MOCK_CHECKPOINT_SCHEMA) {
      throw new Error(`Invalid mock checkpoint schema: expected '${IELTS_MOCK_CHECKPOINT_SCHEMA}'.`);
    }

    const orchestrator = new IeltsMockOrchestrator({
      blueprint,
      track: checkpoint.track,
      tier: checkpoint.tier
    });

    orchestrator.state = checkpoint.state || IELTS_MOCK_STATE.IN_PROGRESS;
    orchestrator.activeSkill = checkpoint.activeSkill;
    orchestrator.activeSkillIndex = checkpoint.activeSkillIndex || 0;
    orchestrator.remainingSeconds = checkpoint.remainingSeconds || 0;
    orchestrator.skillProgress = structuredClone(checkpoint.skillProgress || {});
    orchestrator.completedSkills = structuredClone(checkpoint.completedSkills || {});
    orchestrator.currentSectionResponses = structuredClone(checkpoint.currentSectionResponses || {});

    return orchestrator;
  }

  getAttemptRecords() {
    return [...this.attemptRecords];
  }

  getPublicItemProjection() {
    // Sanitized projection without answers or model texts
    return {
      title: this.blueprint.title,
      track: this.track,
      tier: this.tier,
      activeSkill: this.activeSkill,
      state: this.state,
      remainingSeconds: this.remainingSeconds
    };
  }
}

export function mountIeltsFullMockLauncher(container, options = {}) {
  if (!container) return;
  const onStartMock = options.onStartMock || (() => {});

  container.innerHTML = `
    <div class="ielts-full-mock-launcher p-4 border rounded-xl bg-slate-900 text-white">
      <h3 class="text-xl font-bold mb-2">IELTS Full Mock Exam & Section Practice</h3>
      <p class="text-sm text-slate-400 mb-4">Official 4-skill timed simulation and focused section practice with comprehensive rubric feedback.</p>
      
      <div class="mb-4">
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Select Track</label>
        <select class="mock-track-select w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="academic">IELTS Academic (Higher Education & Professional)</option>
          <option value="general-training">IELTS General Training (Migration & Workplace)</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button class="btn-start-full-mock w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold text-sm transition">
          Start Full Mock Exam (165m)
        </button>
        <button class="btn-start-section-practice w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-lg font-semibold text-sm transition">
          Section Practice (10–60m)
        </button>
      </div>

      <div class="text-xs text-slate-400 border-t border-slate-800 pt-3">
        <p>• Academic Full Mock: 4 Parts Listening (40Q) + 3 Academic Passages (40Q) + Task 1 Visual & Task 2 Essay + 3-Part Speaking.</p>
        <p>• General Training Full Mock: 4 Parts Listening (40Q) + 3 GT Sections (40Q) + Task 1 Letter & Task 2 Essay + 3-Part Speaking.</p>
        <p>• Disclaimer: ${IELTS_MOCK_DISCLAIMER}</p>
      </div>
    </div>
  `;

  const trackSelect = container.querySelector?.('.mock-track-select');
  const startFullMockBtn = container.querySelector?.('.btn-start-full-mock');
  const startSectionBtn = container.querySelector?.('.btn-start-section-practice');

  if (typeof startFullMockBtn?.addEventListener === 'function') {
    startFullMockBtn.addEventListener('click', () => {
      const track = trackSelect ? trackSelect.value : 'academic';
      onStartMock({ track, tier: IELTS_PRACTICE_TIER.FULL_MOCK });
    });
  }

  if (typeof startSectionBtn?.addEventListener === 'function') {
    startSectionBtn.addEventListener('click', () => {
      const track = trackSelect ? trackSelect.value : 'academic';
      onStartMock({ track, tier: IELTS_PRACTICE_TIER.SECTION });
    });
  }
}

export function renderMockSessionProgress(sessionInfo = {}) {
  const {
    track = 'academic',
    activeSkill = 'listening',
    currentSectionIndex = 1,
    totalSections = 4,
    remainingSeconds = 1800
  } = sessionInfo;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return `
    <div class="ielts-mock-stepper flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 text-white text-sm">
      <div class="flex items-center space-x-3">
        <span class="font-semibold uppercase text-xs tracking-wider px-2 py-0.5 bg-indigo-900 text-indigo-200 rounded">${track}</span>
        <span class="font-medium capitalize text-slate-200">Active: ${activeSkill} (${currentSectionIndex}/${totalSections})</span>
      </div>
      <div class="flex items-center space-x-2 font-mono text-amber-400">
        <span>⏱</span>
        <span>${timerStr}</span>
      </div>
    </div>
  `;
}

export function renderCompositeScoreReportModal(reportData = {}) {
  const {
    track = 'academic',
    listening = { band: 6.0, raw: 0 },
    reading = { band: 6.0, raw: 0 },
    writing = { band: 6.0 },
    speaking = { band: 6.0 },
    overallBand = 6.0,
    disclaimer = IELTS_MOCK_DISCLAIMER
  } = reportData;

  return `
    <div class="ielts-composite-score-card p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white max-w-xl mx-auto">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold mb-1">IELTS ${track === 'academic' ? 'Academic' : 'General Training'} Test Report</h2>
        <p class="text-xs text-amber-400 font-medium">${disclaimer}</p>
      </div>

      <div class="flex justify-center items-center p-6 bg-indigo-950/60 border border-indigo-800/50 rounded-xl mb-6">
        <div class="text-center">
          <span class="text-xs uppercase tracking-wider text-indigo-300 font-semibold block">Overall Band: ${overallBand.toFixed(1)}</span>
          <span class="text-5xl font-black text-white">${overallBand.toFixed(1)}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="text-xs text-slate-400 block">Listening</span>
          <span class="text-lg font-bold text-white">Listening: ${listening.band.toFixed(1)}</span>
          <span class="text-xs text-slate-400 block mt-0.5">Raw: ${listening.raw}/40</span>
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="text-xs text-slate-400 block">Reading</span>
          <span class="text-lg font-bold text-white">Reading: ${reading.band.toFixed(1)}</span>
          <span class="text-xs text-slate-400 block mt-0.5">Raw: ${reading.raw}/40</span>
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="text-xs text-slate-400 block">Writing</span>
          <span class="text-lg font-bold text-white">Writing: ${writing.band.toFixed(1)}</span>
          <span class="text-xs text-slate-400 block mt-0.5">4-Dimension Rubric</span>
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="text-xs text-slate-400 block">Speaking</span>
          <span class="text-lg font-bold text-white">Speaking: ${speaking.band.toFixed(1)}</span>
          <span class="text-xs text-slate-400 block mt-0.5">4-Dimension Rubric</span>
        </div>
      </div>

      <div class="text-xs text-slate-400 border-t border-slate-800 pt-3 text-center">
        ${disclaimer}
      </div>
    </div>
  `;
}
