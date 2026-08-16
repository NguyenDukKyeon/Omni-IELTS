import {
  convertIeltsListeningRawToBand,
  validateIeltsTestBlueprint,
  validateIeltsTestRun,
  createIeltsId,
  cleanText
} from './ielts-domain.js';
import { createErrorCandidate } from './error-candidate.js';

export const IELTS_LISTENING_EXAM_MODE = 'exam';
export const IELTS_LISTENING_PRACTICE_MODE = 'practice';

export function createSyntheticListeningBlueprint({
  id = null,
  title = 'Authentic IELTS Listening Practice Test',
  track = 'academic'
} = {}) {
  const blueprintId = id || createIeltsId('lis-bp');
  const sections = [];

  const partDescriptions = [
    { part: 1, topic: 'Social Dialogue - Accommodation Booking Form', type: 'form-completion' },
    { part: 2, topic: 'Social Monologue - Local Park & Recreation Guide', type: 'mcq' },
    { part: 3, topic: 'Educational Dialogue - Research Project Discussion', type: 'matching' },
    { part: 4, topic: 'Academic Lecture - Marine Biodiversity Trends', type: 'note-completion' }
  ];

  for (let p = 1; p <= 4; p++) {
    const desc = partDescriptions[p - 1];
    const questions = [];
    for (let q = 1; q <= 10; q++) {
      const qNum = (p - 1) * 10 + q;
      const qId = `${blueprintId}-p${p}-q${q}`;
      if (desc.type === 'mcq') {
        questions.push({
          id: qId,
          number: qNum,
          prompt: `Question ${qNum}: Select the most appropriate option based on the recording.`,
          options: [
            { id: 'a', text: 'Option A (Correct answer)', correct: true },
            { id: 'b', text: 'Option B (Distractor)', correct: false },
            { id: 'c', text: 'Option C (Distractor)', correct: false }
          ],
          sealedKey: { acceptedOptionId: 'a' }
        });
      } else {
        questions.push({
          id: qId,
          number: qNum,
          prompt: `Question ${qNum}: Write NO MORE THAN TWO WORDS and/or A NUMBER for the answer.`,
          sealedKey: { acceptedAnswers: [`answer ${qNum}`, `ans ${qNum}`] }
        });
      }
    }

    sections.push({
      id: `${blueprintId}-part-${p}`,
      partNumber: p,
      title: `Part ${p}: ${desc.topic}`,
      audioCue: {
        startSeconds: (p - 1) * 600,
        endSeconds: p * 600,
        duration: 600
      },
      transcript: `[Part ${p} Transcript: Dialogue and monologue commentary for ${desc.topic}. Answers are embedded within the spoken discourse.]`,
      questions
    });
  }

  return Object.freeze({
    id: blueprintId,
    kind: 'ielts-test-blueprint',
    schemaVersion: 1,
    skill: 'listening',
    track: track === 'general-training' ? 'general-training' : 'academic',
    hierarchyLevel: 'SKILL_TEST',
    title: cleanText(title, 240),
    timing: {
      testMinutes: 30,
      transferMinutes: 10,
      totalSeconds: 2400
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

  constructor({ blueprint, mode = IELTS_LISTENING_EXAM_MODE, options = {} } = {}) {
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
    const totalQ = blueprint.sections.reduce((sum, s) => sum + (Array.isArray(s.questions) ? s.questions.length : 0), 0);
    if (totalQ !== 40) {
      throw new Error(`IELTS Listening test requires exactly 40 items total. Found: ${totalQ}.`);
    }

    this.#blueprint = blueprint;
    this.#mode = mode === IELTS_LISTENING_PRACTICE_MODE ? IELTS_LISTENING_PRACTICE_MODE : IELTS_LISTENING_EXAM_MODE;
    this.#currentPart = 1;
    this.#playedParts = new Set();
    this.#audioCurrentTime = 0;
    this.#isAudioPlaying = false;

    // Seal private answer keys internally
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

  get mode() {
    return this.#mode;
  }

  get blueprint() {
    return this.#blueprint;
  }

  get currentPart() {
    return this.#currentPart;
  }

  is1PlayOnly() {
    return this.#mode === IELTS_LISTENING_EXAM_MODE;
  }

  async startSection(partNumber) {
    const part = Math.max(1, Math.min(4, Number(partNumber) || 1));
    if (this.is1PlayOnly() && this.#playedParts.has(part)) {
      throw new Error(`Exam mode permits 1-play only. Part ${part} has already been played.`);
    }
    this.#currentPart = part;
    this.#playedParts.add(part);
    this.#isAudioPlaying = true;
    this.#audioCurrentTime = 0;
    return { part: this.#currentPart, status: 'playing' };
  }

  seekAudio(seconds) {
    if (this.is1PlayOnly()) {
      throw new Error('Exam mode prevents audio seek during section playback.');
    }
    this.#audioCurrentTime = Math.max(0, Number(seconds) || 0);
    return this.#audioCurrentTime;
  }

  replaySection(partNumber) {
    const part = Number(partNumber) || this.#currentPart;
    if (this.is1PlayOnly()) {
      throw new Error(`Exam mode permits 1-play only. Cannot replay Part ${part}.`);
    }
    this.#audioCurrentTime = 0;
    this.#isAudioPlaying = true;
    return { part, status: 'replaying' };
  }

  pauseAudio() {
    if (this.is1PlayOnly() && this.#isAudioPlaying) {
      // In Exam mode, pausing is not permitted during timed section audio
      return { status: 'exam-pause-blocked' };
    }
    this.#isAudioPlaying = false;
    return { status: 'paused' };
  }

  canRevealTranscript() {
    return this.#mode === IELTS_LISTENING_PRACTICE_MODE;
  }

  getPublicProjection() {
    return {
      id: this.#blueprint.id,
      title: this.#blueprint.title,
      track: this.#blueprint.track,
      skill: this.#blueprint.skill,
      timing: this.#blueprint.timing,
      sections: this.#blueprint.sections.map(s => ({
        id: s.id,
        partNumber: s.partNumber,
        title: s.title,
        audioCue: s.audioCue,
        questions: s.questions.map(q => {
          const publicQ = {
            id: q.id,
            number: q.number,
            prompt: q.prompt
          };
          if (Array.isArray(q.options)) {
            publicQ.options = q.options.map(opt => ({
              id: opt.id,
              text: opt.text
            }));
          }
          return publicQ;
        })
      }))
    };
  }

  getCorrectAnswerForTesting(questionId) {
    const key = this.#sealedKeys.get(questionId);
    if (!key) return 'a';
    if (key.acceptedOptionId) return key.acceptedOptionId;
    if (Array.isArray(key.acceptedAnswers) && key.acceptedAnswers.length > 0) return key.acceptedAnswers[0];
    return 'a';
  }

  getWrongAnswerForTesting(questionId) {
    const key = this.#sealedKeys.get(questionId);
    if (!key) return 'wrong';
    if (key.acceptedOptionId) {
      return key.acceptedOptionId === 'a' ? 'b' : 'a';
    }
    return 'incorrect random noise';
  }

  async submitTest({ answers = {} } = {}) {
    let rawScore = 0;
    const itemResults = [];
    let emittedErrorCount = 0;
    const testRunId = createIeltsId('lis-run');

    for (const section of this.#blueprint.sections) {
      for (const q of section.questions) {
        const userAns = String(answers[q.id] ?? '').trim().toLowerCase();
        const key = this.#sealedKeys.get(q.id);
        let isCorrect = false;

        if (key?.acceptedOptionId) {
          isCorrect = userAns === key.acceptedOptionId.toLowerCase();
        } else if (Array.isArray(key?.acceptedAnswers)) {
          isCorrect = key.acceptedAnswers.some(ans => userAns === ans.toLowerCase());
        }

        if (isCorrect) {
          rawScore += 1;
          itemResults.push({
            questionId: q.id,
            questionNumber: q.number,
            part: section.partNumber,
            disposition: 'correct',
            userAnswer: userAns
          });
        } else {
          itemResults.push({
            questionId: q.id,
            questionNumber: q.number,
            part: section.partNumber,
            disposition: 'wrong',
            userAnswer: userAns
          });

          // Emit ErrorCandidate for wrong / partial responses
          try {
            await createErrorCandidate({
              id: `err-lis-${testRunId}-q${q.number}`,
              target: {
                cardId: null,
                senseId: null,
                skill: 'listening',
                sourceId: this.#blueprint.id,
                sourceRevision: '1'
              },
              category: 'listening',
              claim: `Wrong response in Listening Part ${section.partNumber} Item ${q.number}`,
              learnerOutput: userAns,
              expectedResponse: key?.acceptedOptionId || (key?.acceptedAnswers ? key.acceptedAnswers[0] : 'correct'),
              advisory: {
                producer: 'ielts-listening-runner',
                producerVersion: '1.0.0',
                configDigest: this.#blueprint.id,
                observedAt: Date.now()
              }
            });
            emittedErrorCount += 1;
          } catch {
            // Error candidate idempotency or collision safety
          }
        }
      }
    }

    const bandScore = convertIeltsListeningRawToBand(rawScore);

    const receipt = {
      id: createIeltsId('receipt'),
      testRunId,
      skill: 'listening',
      rawScore,
      bandScore,
      totalQuestions: 40,
      affectsSchedule: false,
      evidenceEligible: false,
      completedAt: Date.now()
    };

    return {
      testRunId,
      rawScore,
      bandScore,
      totalQuestions: 40,
      correctCount: rawScore,
      wrongCount: 40 - rawScore,
      emittedErrorCandidateCount: emittedErrorCount,
      receipt,
      itemResults
    };
  }

  async createRunRecord() {
    const runId = createIeltsId('run-lis');
    const run = {
      id: runId,
      blueprintId: this.#blueprint.id,
      track: this.#blueprint.track,
      skill: 'listening',
      status: 'active',
      mode: this.#mode,
      startedAt: Date.now(),
      answers: {},
      affectsSchedule: false,
      evidenceEligible: false
    };

    const validation = validateIeltsTestRun(run);
    if (!validation.valid) {
      throw new Error(`Invalid test run record: ${validation.errors.join(' ')}`);
    }
    return validation.value;
  }
}

export function renderListeningRunnerDOM({ blueprint, mode = IELTS_LISTENING_EXAM_MODE, currentPart = 1 } = {}) {
  const title = blueprint?.title || 'IELTS Listening Test';
  const track = blueprint?.track === 'general-training' ? 'General Training' : 'Academic';

  return `
    <div class="ielts-listening-container" data-mode="${mode}">
      <header class="ielts-listening-header">
        <div class="ielts-listening-track-badge">${track}</div>
        <h2 class="ielts-listening-title">${title}</h2>
        <div class="ielts-listening-timers">
          <div class="ielts-listening-timer" aria-label="Test Time Remaining">30:00</div>
          <div class="ielts-listening-transfer-timer" aria-label="Transfer Time">10:00</div>
        </div>
      </header>

      <nav class="ielts-listening-section-tabs">
        <button class="ielts-section-tab ${currentPart === 1 ? 'active' : ''}" data-part="1">Part 1</button>
        <button class="ielts-section-tab ${currentPart === 2 ? 'active' : ''}" data-part="2">Part 2</button>
        <button class="ielts-section-tab ${currentPart === 3 ? 'active' : ''}" data-part="3">Part 3</button>
        <button class="ielts-section-tab ${currentPart === 4 ? 'active' : ''}" data-part="4">Part 4</button>
      </nav>

      <div class="ielts-listening-player-area">
        <div class="ielts-listening-player" id="ielts-listening-audio-player">
          <span class="ielts-player-status">Audio Track Part ${currentPart}</span>
        </div>
      </div>

      <main class="ielts-listening-content">
        <div class="ielts-listening-questions-container">
          <!-- Active Section Questions -->
          <div class="ielts-active-section-content" data-active-part="${currentPart}">
            <p>Listen to the audio recording carefully and answer Questions ${(currentPart - 1) * 10 + 1}–${currentPart * 10}.</p>
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
  `;
}

export function mountListeningRunnerUI(host, { blueprint, mode = IELTS_LISTENING_EXAM_MODE, onComplete, onExit } = {}) {
  const runner = new IeltsListeningRunner({ blueprint, mode });
  let activePart = 1;

  function render() {
    if (!host) return;
    host.innerHTML = renderListeningRunnerDOM({
      blueprint,
      mode,
      currentPart: activePart
    });
  }

  render();

  return {
    runner,
    navigateToPart(part) {
      activePart = Math.max(1, Math.min(4, Number(part) || 1));
      render();
    },
    async submitTest(answers = {}) {
      const result = await runner.submitTest({ answers });
      onComplete?.(result);
      return result;
    },
    destroy() {
      if (host) host.innerHTML = '';
      onExit?.();
    }
  };
}
