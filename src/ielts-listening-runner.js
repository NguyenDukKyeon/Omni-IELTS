import {
  convertIeltsListeningRawToBand,
  validateIeltsTestBlueprint,
  IELTS_STORE_NAMES
} from './ielts-domain.js';
import { saveIeltsRecord } from './ielts-persistence.js';
import { createErrorCandidate } from './error-candidate.js';
import { IeltsAudioController } from './ielts-media-player.js';

export const IELTS_LISTENING_EXAM_MODE = 'exam';
export const IELTS_LISTENING_PRACTICE_MODE = 'practice';
export const REVIEW_MINUTES = 2;

export function createSyntheticListeningBlueprint({
  id = `ielts-lis-${Date.now()}`,
  title = 'IELTS Listening Practice Test',
  track = 'academic'
} = {}) {
  const sections = [];
  for (let part = 1; part <= 4; part++) {
    const questions = [];
    const startQ = (part - 1) * 10 + 1;
    for (let q = startQ; q < startQ + 10; q++) {
      questions.push({
        id: `q-${q}`,
        order: q,
        partNumber: part,
        prompt: `Question ${q}: Listen to the audio and answer.`,
        taskType: 'listening-multiple-choice',
        options: [
          { id: 'a', text: `Option A for question ${q}`, correct: true },
          { id: 'b', text: `Option B for question ${q}` },
          { id: 'c', text: `Option C for question ${q}` },
          { id: 'd', text: `Option D for question ${q}` }
        ],
        sealedKey: {
          acceptedOptionId: 'a'
        }
      });
    }

    sections.push({
      partNumber: part,
      title: `Part ${part}`,
      context: part === 1 ? 'Social dialogue' : part === 2 ? 'Social monologue' : part === 3 ? 'Educational dialogue' : 'Academic lecture',
      questions
    });
  }

  return Object.freeze({
    id,
    kind: 'ielts-test-blueprint',
    schemaVersion: 1,
    skill: 'listening',
    track,
    hierarchyLevel: 'SKILL_TEST',
    title,
    timing: {
      testMinutes: 30,
      reviewMinutes: REVIEW_MINUTES,
      totalSeconds: (30 + REVIEW_MINUTES) * 60
    },
    sections
  });
}

export class IeltsListeningRunner {
  #blueprint;
  #mode;
  #currentPart;
  #playedParts;
  #audioCurrentTime;
  #isAudioPlaying;
  #sealedKeys;
  #answers;
  #testRunId;
  #errorRepository;

  constructor({
    blueprint,
    mode = IELTS_LISTENING_EXAM_MODE,
    errorRepository = null,
    testRunId = `run-${Date.now()}`
  } = {}) {
    if (!blueprint || typeof blueprint !== 'object') {
      throw new Error('IeltsListeningRunner requires a valid blueprint object.');
    }
    const validation = validateIeltsTestBlueprint(blueprint);
    if (!validation.valid) {
      throw new Error(`Invalid blueprint: ${validation.errors.join(' ')}`);
    }
    if (!Array.isArray(blueprint.sections) || blueprint.sections.length !== 4) {
      throw new Error('IELTS Listening test requires exactly 4 sections (Parts 1 to 4).');
    }
    const totalQ = blueprint.sections.reduce(
      (sum, s) => sum + (Array.isArray(s.questions) ? s.questions.length : 0),
      0
    );
    if (totalQ !== 40) {
      throw new Error(`IELTS Listening test requires exactly 40 items total. Found: ${totalQ}.`);
    }

    this.#blueprint = blueprint;
    this.#mode = mode === IELTS_LISTENING_PRACTICE_MODE ? IELTS_LISTENING_PRACTICE_MODE : IELTS_LISTENING_EXAM_MODE;
    this.#currentPart = 1;
    this.#playedParts = new Set();
    this.#audioCurrentTime = 0;
    this.#isAudioPlaying = false;
    this.#answers = new Map();
    this.#testRunId = testRunId;
    this.#errorRepository = errorRepository;

    // Seal answer keys privately internally
    this.#sealedKeys = new Map();
    for (const section of blueprint.sections) {
      for (const q of section.questions) {
        if (q.sealedKey) {
          this.#sealedKeys.set(q.id, q.sealedKey);
        } else if (Array.isArray(q.options)) {
          const correctOpt = q.options.find(o => o.correct === true);
          this.#sealedKeys.set(q.id, { acceptedOptionId: correctOpt?.id || 'a' });
        }
      }
    }
  }

  get mode() { return this.#mode; }
  get blueprint() { return this.#blueprint; }
  get currentPart() { return this.#currentPart; }
  get testRunId() { return this.#testRunId; }
  get authoritativeAudioSeconds() { return this.#audioCurrentTime; }

  is1PlayOnly() {
    return this.#mode === IELTS_LISTENING_EXAM_MODE;
  }

  async startSection(partNumber) {
    const part = Math.max(1, Math.min(4, Number(partNumber) || 1));
    if (this.is1PlayOnly() && this.#playedParts.has(part)) {
      throw new Error(`Exam mode permits 1-play only. Part ${part} has already been played.`);
    }
    this.#currentPart = part;
    this.#isAudioPlaying = true;
    return { part: this.#currentPart, status: 'playing' };
  }

  async completeSection(partNumber) {
    const part = Math.max(1, Math.min(4, Number(partNumber) || this.#currentPart));
    this.#playedParts.add(part);
    this.#isAudioPlaying = false;
    return { part, status: 'completed' };
  }

  updateAudioPosition(seconds) {
    const s = Number(seconds);
    if (!Number.isFinite(s) || s < 0) {
      throw new Error('RELOAD_RECOVERY_UNSAFE: Invalid audio position seconds.');
    }
    this.#audioCurrentTime = s;
  }

  recordAnswer(questionId, answer) {
    if (answer === undefined || answer === null) {
      this.#answers.delete(questionId);
    } else {
      this.#answers.set(questionId, answer);
    }
  }

  getAnswer(questionId) {
    return this.#answers.get(questionId);
  }

  createCheckpoint() {
    const answersObj = {};
    for (const [k, v] of this.#answers.entries()) {
      answersObj[k] = v;
    }
    return {
      testRunId: this.#testRunId,
      activePart: this.#currentPart,
      answers: answersObj,
      authoritativeAudioSeconds: this.#audioCurrentTime,
      playedParts: Array.from(this.#playedParts),
      mode: this.#mode
    };
  }

  static restoreFromCheckpoint(blueprint, checkpoint) {
    if (!checkpoint || typeof checkpoint !== 'object') {
      throw new Error('RELOAD_RECOVERY_UNSAFE: Missing checkpoint payload.');
    }
    if (typeof checkpoint.authoritativeAudioSeconds !== 'number' || checkpoint.authoritativeAudioSeconds < 0) {
      throw new Error('RELOAD_RECOVERY_UNSAFE: Checkpoint has invalid authoritative audio seconds.');
    }

    const runner = new IeltsListeningRunner({
      blueprint,
      mode: checkpoint.mode,
      testRunId: checkpoint.testRunId
    });

    runner.#currentPart = Math.max(1, Math.min(4, Number(checkpoint.activePart) || 1));
    runner.#audioCurrentTime = checkpoint.authoritativeAudioSeconds;

    if (Array.isArray(checkpoint.playedParts)) {
      for (const p of checkpoint.playedParts) runner.#playedParts.add(p);
    }
    if (checkpoint.answers && typeof checkpoint.answers === 'object') {
      for (const [k, v] of Object.entries(checkpoint.answers)) {
        runner.recordAnswer(k, v);
      }
    }

    return runner;
  }

  getPublicQuestionProjection() {
    return {
      id: this.#blueprint.id,
      title: this.#blueprint.title,
      skill: this.#blueprint.skill,
      track: this.#blueprint.track,
      hierarchyLevel: this.#blueprint.hierarchyLevel,
      timing: this.#blueprint.timing,
      sections: this.#blueprint.sections.map(section => ({
        partNumber: section.partNumber,
        title: section.title,
        context: section.context,
        questions: section.questions.map(q => {
          const projected = {
            id: q.id,
            order: q.order,
            partNumber: q.partNumber,
            prompt: q.prompt,
            taskType: q.taskType
          };
          if (Array.isArray(q.options)) {
            projected.options = q.options.map(opt => ({
              id: opt.id,
              text: opt.text
            }));
          }
          return projected;
        })
      }))
    };
  }

  async submitTest({ answers = {} } = {}) {
    // Merge answers
    if (answers && typeof answers === 'object') {
      for (const [k, v] of Object.entries(answers)) {
        this.recordAnswer(k, v);
      }
    }

    let rawScore = 0;
    const results = [];

    for (const section of this.#blueprint.sections) {
      for (const q of section.questions) {
        const learnerAns = this.#answers.get(q.id);
        const sealed = this.#sealedKeys.get(q.id);
        let isCorrect = false;

        if (sealed) {
          if (sealed.acceptedOptionId && String(learnerAns).toLowerCase() === String(sealed.acceptedOptionId).toLowerCase()) {
            isCorrect = true;
          } else if (sealed.acceptedText && String(learnerAns).trim().toLowerCase() === String(sealed.acceptedText).trim().toLowerCase()) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          rawScore++;
        } else {
          // Emit Error Candidate
          if (this.#errorRepository) {
            let candidate;
            try {
              candidate = await createErrorCandidate({
                id: `err-lis-${this.#testRunId}-${q.id}`,
                category: 'listening',
                target: { skill: 'listening', cardId: q.id },
                learnerOutput: learnerAns || '',
                advisory: {
                  producer: 'ielts-listening-runner',
                  testRunId: this.#testRunId,
                  blueprintId: this.#blueprint.id,
                  part: section.partNumber,
                  questionNumber: q.order
                }
              });
            } catch {
              candidate = {
                id: `err-lis-${this.#testRunId}-${q.id}`,
                category: 'listening',
                target: { skill: 'listening', cardId: q.id },
                learnerOutput: learnerAns || '',
                advisory: {
                  producer: 'ielts-listening-runner',
                  testRunId: this.#testRunId,
                  blueprintId: this.#blueprint.id,
                  part: section.partNumber,
                  questionNumber: q.order
                }
              };
            }
            try {
              this.#errorRepository.add(candidate);
            } catch (err) {
              console.warn('[ErrorCandidate repository add error]', err);
            }
          }
        }

        results.push({
          questionId: q.id,
          partNumber: section.partNumber,
          correct: isCorrect,
          learnerAnswer: learnerAns || null
        });
      }
    }

    const estimatedBand = convertIeltsListeningRawToBand(rawScore);

    const testRunRecord = {
      id: this.#testRunId,
      testRunId: this.#testRunId,
      blueprintId: this.#blueprint.id,
      skill: 'listening',
      track: this.#blueprint.track || 'academic',
      rawScore,
      totalQuestions: 40,
      estimatedBand,
      scoreLabel: 'Estimated Band Score — Practice Reference',
      status: 'completed',
      submittedAt: new Date().toISOString(),
      affectsSchedule: false,
      evidenceEligible: false,
      results
    };

    try {
      await saveIeltsRecord(IELTS_STORE_NAMES.testRuns, testRunRecord);
    } catch {
      // In-memory fallback
    }

    return testRunRecord;
  }
}

export function renderListeningRunnerDOM({ blueprint, mode = IELTS_LISTENING_EXAM_MODE, currentPart = 1 } = {}) {
  const activePart = Math.max(1, Math.min(4, Number(currentPart) || 1));
  const activeSection = blueprint?.sections?.find(s => s.partNumber === activePart) || blueprint?.sections?.[activePart - 1];
  const questions = activeSection?.questions || [];

  return `
    <div class="v10-ielts-listening-runner" data-mode="${mode}">
      <header class="ielts-listening-header">
        <div class="ielts-listening-title-row">
          <h2>${blueprint?.title || 'IELTS Listening Test'}</h2>
          <div class="ielts-listening-timer" data-test-timer>
            <span>Time Left: <strong>30:00</strong></span>
          </div>
        </div>
        <nav class="ielts-listening-part-tabs" role="tablist">
          ${[1, 2, 3, 4].map(p => `
            <button role="tab" class="ielts-part-tab ${p === activePart ? 'active' : ''}" data-part="${p}" aria-selected="${p === activePart}">
              Part ${p}
            </button>
          `).join('')}
        </nav>
      </header>

      <div class="ielts-listening-media-container" id="ieltsListeningAudioHost">
        <div class="ielts-audio-bar">
          <button type="button" class="ielts-audio-play-btn" data-audio-action="play">Play Audio</button>
          <span class="ielts-audio-status">${mode === IELTS_LISTENING_EXAM_MODE ? 'Exam Mode (1-Play)' : 'Practice Mode'}</span>
        </div>
      </div>

      <div class="ielts-listening-body">
        <main class="ielts-listening-content">
          <div class="ielts-active-section-content" data-active-part="${activePart}">
            <div class="ielts-section-instructions">
              <p>Listen to Part ${activePart} and answer Questions ${(activePart - 1) * 10 + 1}–${activePart * 10}.</p>
            </div>
            <div class="ielts-questions-list">
              ${questions.map(q => `
                <article class="ielts-question-card" id="card-${q.id}" data-question-id="${q.id}">
                  <p class="ielts-q-prompt"><strong>Question ${q.order}:</strong> ${q.prompt}</p>
                  ${Array.isArray(q.options) ? `
                    <div class="ielts-q-options">
                      ${q.options.map(opt => `
                        <label class="ielts-option-label">
                          <input type="radio" name="${q.id}" value="${opt.id}" />
                          <span>${opt.text}</span>
                        </label>
                      `).join('')}
                    </div>
                  ` : `
                    <div class="ielts-q-input-wrap">
                      <input type="text" name="${q.id}" placeholder="Type answer..." />
                    </div>
                  `}
                </article>
              `).join('')}
            </div>
          </div>
        </main>

        <aside class="ielts-listening-sidebar">
          <div class="ielts-listening-question-grid">
            ${Array.from({ length: 40 }, (_, i) => `
              <button class="ielts-q-btn" data-question-num="${i + 1}" data-part="${Math.floor(i / 10) + 1}">
                ${i + 1}
              </button>
            `).join('')}
          </div>
          <div class="ielts-listening-actions">
            <button class="ielts-listening-submit-btn">Submit Test</button>
          </div>
        </aside>
      </div>
    </div>
  `;
}

export function mountListeningRunnerUI(host, { blueprint, mode = IELTS_LISTENING_EXAM_MODE, onComplete, onExit } = {}) {
  const runner = new IeltsListeningRunner({ blueprint, mode });
  let activePart = 1;
  let audioController = null;

  function render() {
    if (!host) return;
    host.innerHTML = renderListeningRunnerDOM({
      blueprint,
      mode,
      currentPart: activePart
    });

    const mediaHost = host.querySelector?.('#ieltsListeningAudioHost');
    if (mediaHost) {
      audioController = new IeltsAudioController({
        host: mediaHost,
        media: blueprint?.media,
        is1PlayOnly: runner.is1PlayOnly(),
        onTimeUpdate: (t) => runner.updateAudioPosition(t)
      });
      void audioController.mount({ section: activePart });
    }
  }

  render();

  return {
    runner,
    navigateToPart(part) {
      activePart = Math.max(1, Math.min(4, Number(part) || 1));
      runner.startSection(activePart);
      render();
    },
    async submitTest(answers = {}) {
      const result = await runner.submitTest({ answers });
      onComplete?.(result);
      return result;
    },
    destroy() {
      audioController?.destroy();
      if (host) host.innerHTML = '';
      onExit?.();
    }
  };
}
