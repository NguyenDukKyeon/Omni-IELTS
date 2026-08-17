import {
  convertIeltsAcademicReadingRawToBand,
  convertIeltsGeneralReadingRawToBand,
  validateIeltsTestBlueprint,
  IELTS_STORE_NAMES
} from './ielts-domain.js';
import { saveIeltsRecord } from './ielts-persistence.js';
import { createErrorCandidate } from './error-candidate.js';

export const IELTS_READING_EXAM_MODE = 'exam';
export const IELTS_READING_PRACTICE_MODE = 'practice';
export const READING_TEST_MINUTES = 60;

export function createSyntheticReadingBlueprint({
  id = `ielts-rdg-${Date.now()}`,
  title = 'IELTS Reading Practice Test',
  track = 'academic'
} = {}) {
  const isAcademic = track !== 'general-training';
  const sections = [];

  const taskTypes = [
    'reading-true-false-not-given',
    'reading-yes-no-not-given',
    'reading-multiple-choice',
    'reading-identifying-information',
    'reading-identifying-writers-views',
    'reading-matching-information',
    'reading-matching-headings',
    'reading-matching-features',
    'reading-matching-sentence-endings',
    'reading-sentence-completion',
    'reading-summary-completion',
    'reading-note-completion',
    'reading-table-completion',
    'reading-flow-chart-completion',
    'reading-diagram-label-completion',
    'reading-short-answer'
  ];

  // 3 passages / sections: 13 + 13 + 14 = 40 questions total
  const questionCounts = [13, 13, 14];
  let currentQNum = 1;

  for (let part = 1; part <= 3; part++) {
    const qCount = questionCounts[part - 1];
    const questions = [];

    for (let q = 0; q < qCount; q++) {
      const qIndex = currentQNum++;
      const taskType = taskTypes[(qIndex - 1) % taskTypes.length];
      const isMultipleChoice = taskType === 'reading-multiple-choice';
      const isTFNG = taskType === 'reading-true-false-not-given';

      const questionObj = {
        id: `q-${qIndex}`,
        order: qIndex,
        passageNumber: part,
        sectionNumber: part,
        prompt: `Question ${qIndex}: Refer to Passage ${part} and choose the correct answer.`,
        taskType
      };

      if (isMultipleChoice) {
        questionObj.options = [
          { id: 'A', text: `Option A for Question ${qIndex}`, correct: true },
          { id: 'B', text: `Option B for Question ${qIndex}` },
          { id: 'C', text: `Option C for Question ${qIndex}` },
          { id: 'D', text: `Option D for Question ${qIndex}` }
        ];
        questionObj.sealedKey = { acceptedOptionId: 'A' };
      } else if (isTFNG) {
        questionObj.options = [
          { id: 'A', text: 'TRUE', correct: true },
          { id: 'B', text: 'FALSE' },
          { id: 'C', text: 'NOT GIVEN' }
        ];
        questionObj.sealedKey = { acceptedOptionId: 'A', acceptedText: 'A' };
      } else {
        questionObj.options = [
          { id: 'A', text: 'Choice A', correct: true },
          { id: 'B', text: 'Choice B' },
          { id: 'C', text: 'Choice C' }
        ];
        questionObj.sealedKey = { acceptedText: 'A', acceptedOptionId: 'A' };
      }

      questions.push(questionObj);
    }

    const passageTitle = isAcademic
      ? `Passage ${part}: Academic Research & Investigation ${part}`
      : `Section ${part}: ${part === 1 ? 'Social Survival & Public Information' : part === 2 ? 'Workplace Training & Context' : 'General Interest Article'}`;

    const passageText = `
${passageTitle}

Paragraph A
This text provides extensive reading material reflecting authentic IELTS ${isAcademic ? 'Academic' : 'General Training'} specifications. Learners must read the passage attentively to identify main ideas, supporting details, author perspective, and implied meanings across diverse contexts.

Paragraph B
Scientific and observational studies demonstrate that systematic reading comprehension develops most effectively when coupled with structured question-answer relationships. Analyzing paragraph headings, factual statements, and nuanced claims enables accurate responses within strict examination conditions.

Paragraph C
Furthermore, managing the 60-minute duration across 3 distinct sections requires consistent pacing, rapid skimming for central themes, and detailed scanning for specific terms, proper nouns, and numerical data.

Paragraph D
In conclusion, disciplined reading practice with authentic item families establishes genuine linguistic competence and reliable practice benchmarks.
    `.trim();

    sections.push({
      passageNumber: part,
      sectionNumber: part,
      title: passageTitle,
      passageText,
      wordCount: 800,
      questions
    });
  }

  return Object.freeze({
    id,
    kind: 'ielts-test-blueprint',
    schemaVersion: 1,
    skill: 'reading',
    track,
    hierarchyLevel: 'SKILL_TEST',
    title,
    timing: {
      testMinutes: READING_TEST_MINUTES,
      reviewMinutes: 0,
      totalSeconds: READING_TEST_MINUTES * 60
    },
    sections
  });
}

export class IeltsReadingRunner {
  #blueprint;
  #mode;
  #currentPassage;
  #elapsedSeconds;
  #answers;
  #sealedKeys;
  #testRunId;
  #errorRepository;

  constructor({
    blueprint,
    mode = IELTS_READING_EXAM_MODE,
    errorRepository = null,
    testRunId = `run-rdg-${Date.now()}`
  } = {}) {
    if (!blueprint || typeof blueprint !== 'object') {
      throw new Error('IeltsReadingRunner requires a valid blueprint object.');
    }
    const validation = validateIeltsTestBlueprint(blueprint);
    if (!validation.valid) {
      throw new Error(`Invalid blueprint: ${validation.errors.join(' ')}`);
    }
    if (!Array.isArray(blueprint.sections) || blueprint.sections.length !== 3) {
      throw new Error('IELTS Reading test requires exactly 3 sections/passages.');
    }
    const totalQ = blueprint.sections.reduce(
      (sum, s) => sum + (Array.isArray(s.questions) ? s.questions.length : 0),
      0
    );
    if (totalQ !== 40) {
      throw new Error(`IELTS Reading test requires exactly 40 items total. Found: ${totalQ}.`);
    }

    this.#blueprint = blueprint;
    this.#mode = mode === IELTS_READING_PRACTICE_MODE ? IELTS_READING_PRACTICE_MODE : IELTS_READING_EXAM_MODE;
    this.#currentPassage = 1;
    this.#elapsedSeconds = 0;
    this.#answers = new Map();
    this.#testRunId = testRunId;
    this.#errorRepository = errorRepository;

    // Privately seal answer keys internally
    this.#sealedKeys = new Map();
    for (const section of blueprint.sections) {
      for (const q of section.questions) {
        if (q.sealedKey) {
          this.#sealedKeys.set(q.id, q.sealedKey);
        } else if (Array.isArray(q.options)) {
          const correctOpt = q.options.find(o => o.correct === true);
          this.#sealedKeys.set(q.id, { acceptedOptionId: correctOpt?.id || 'A' });
        }
      }
    }
  }

  get mode() { return this.#mode; }
  get blueprint() { return this.#blueprint; }
  get currentPassage() { return this.#currentPassage; }
  get elapsedSeconds() { return this.#elapsedSeconds; }
  get testRunId() { return this.#testRunId; }

  navigateToPassage(passageNumber) {
    const p = Math.max(1, Math.min(3, Number(passageNumber) || 1));
    this.#currentPassage = p;
    return this.#currentPassage;
  }

  setElapsedSeconds(seconds) {
    const s = Number(seconds);
    if (!Number.isFinite(s) || s < 0) {
      throw new Error('Invalid elapsed seconds.');
    }
    this.#elapsedSeconds = s;
  }

  recordAnswer(questionId, answer) {
    if (answer === undefined || answer === null) {
      this.#answers.delete(questionId);
    } else {
      this.#answers.set(questionId, answer);
    }
  }

  getAnswer(questionId) {
    return this.#answers.get(questionId) ?? null;
  }

  getPublicProjection() {
    return {
      id: this.#blueprint.id,
      title: this.#blueprint.title,
      skill: this.#blueprint.skill,
      track: this.#blueprint.track,
      hierarchyLevel: this.#blueprint.hierarchyLevel,
      timing: this.#blueprint.timing,
      currentPassage: this.#currentPassage,
      answeredCount: this.#answers.size,
      totalQuestions: 40,
      sections: this.#blueprint.sections.map(section => ({
        passageNumber: section.passageNumber || section.sectionNumber,
        sectionNumber: section.sectionNumber || section.passageNumber,
        title: section.title,
        passageText: section.passageText,
        wordCount: section.wordCount,
        questions: section.questions.map(q => {
          const projected = {
            id: q.id,
            order: q.order,
            passageNumber: q.passageNumber || q.sectionNumber,
            sectionNumber: q.sectionNumber || q.passageNumber,
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

  createAutosaveCheckpoint() {
    const answersObj = {};
    for (const [k, v] of this.#answers.entries()) {
      answersObj[k] = v;
    }
    return {
      schemaVersion: 'IELTS_READING_CHECKPOINT_V1',
      testRunId: this.#testRunId,
      testId: this.#blueprint.id,
      track: this.#blueprint.track,
      mode: this.#mode,
      currentPassage: this.#currentPassage,
      elapsedSeconds: this.#elapsedSeconds,
      answers: answersObj,
      timestamp: new Date().toISOString()
    };
  }

  restoreFromCheckpoint(checkpoint) {
    if (!checkpoint || typeof checkpoint !== 'object') {
      throw new Error('RELOAD_RECOVERY_UNSAFE: Missing checkpoint payload.');
    }
    if (typeof checkpoint.elapsedSeconds !== 'number' || checkpoint.elapsedSeconds < 0) {
      throw new Error('RELOAD_RECOVERY_UNSAFE: Checkpoint has invalid elapsed seconds.');
    }

    this.#currentPassage = Math.max(1, Math.min(3, Number(checkpoint.currentPassage) || 1));
    this.#elapsedSeconds = checkpoint.elapsedSeconds;

    if (checkpoint.answers && typeof checkpoint.answers === 'object') {
      for (const [k, v] of Object.entries(checkpoint.answers)) {
        this.recordAnswer(k, v);
      }
    }
  }

  async submitTest(answers = {}) {
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
          // Emit Error Candidate into ErrorRepository without schedule impact
          if (this.#errorRepository) {
            let candidate;
            try {
              candidate = await createErrorCandidate({
                id: `err-rdg-${this.#testRunId}-${q.id}`,
                category: 'reading',
                target: { skill: 'reading', cardId: q.id },
                learnerOutput: learnerAns || '',
                advisory: {
                  producer: 'ielts-reading-runner',
                  testRunId: this.#testRunId,
                  blueprintId: this.#blueprint.id,
                  passage: section.passageNumber || section.sectionNumber,
                  questionNumber: q.order
                }
              });
            } catch {
              candidate = {
                id: `err-rdg-${this.#testRunId}-${q.id}`,
                category: 'reading',
                target: { skill: 'reading', cardId: q.id },
                learnerOutput: learnerAns || '',
                questionId: q.id,
                attemptedAnswer: learnerAns || '',
                advisory: {
                  producer: 'ielts-reading-runner',
                  testRunId: this.#testRunId,
                  blueprintId: this.#blueprint.id,
                  passage: section.passageNumber || section.sectionNumber,
                  questionNumber: q.order
                }
              };
            }
            try {
              if (typeof this.#errorRepository.recordErrorCandidate === 'function') {
                this.#errorRepository.recordErrorCandidate(candidate);
              } else if (typeof this.#errorRepository.add === 'function') {
                this.#errorRepository.add(candidate);
              }
            } catch (err) {
              console.warn('[ErrorCandidate repository error]', err);
            }
          }
        }

        results.push({
          questionId: q.id,
          passageNumber: section.passageNumber || section.sectionNumber,
          correct: isCorrect,
          learnerAnswer: learnerAns || null
        });
      }
    }

    const isAcademic = this.#blueprint.track !== 'general-training';
    const bandScore = isAcademic
      ? convertIeltsAcademicReadingRawToBand(rawScore)
      : convertIeltsGeneralReadingRawToBand(rawScore);

    const testRunRecord = {
      id: this.#testRunId,
      testRunId: this.#testRunId,
      blueprintId: this.#blueprint.id,
      skill: 'reading',
      track: this.#blueprint.track || 'academic',
      rawScore,
      totalQuestions: 40,
      bandScore,
      estimatedBand: bandScore,
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

export function renderReadingRunnerDOM({ blueprint, mode = IELTS_READING_EXAM_MODE, currentPassage = 1 } = {}) {
  const activePassageNum = Math.max(1, Math.min(3, Number(currentPassage) || 1));
  const activeSection = blueprint?.sections?.find(
    s => (s.passageNumber || s.sectionNumber) === activePassageNum
  ) || blueprint?.sections?.[activePassageNum - 1];

  const questions = activeSection?.questions || [];
  const passageText = activeSection?.passageText || 'Passage text not available.';

  return `
    <div class="v10-ielts-reading-runner" data-mode="${mode}">
      <header class="ielts-reading-header">
        <div class="ielts-reading-title-row">
          <h2>${blueprint?.title || 'IELTS Reading Test'}</h2>
          <div class="ielts-reading-timer" data-test-timer>
            <span>Time Left: <strong>60:00</strong></span>
          </div>
        </div>
        <nav class="ielts-reading-passage-tabs" role="tablist">
          ${[1, 2, 3].map(p => `
            <button role="tab" class="ielts-passage-tab ${p === activePassageNum ? 'active' : ''}" data-passage="${p}" aria-selected="${p === activePassageNum}">
              Passage ${p}
            </button>
          `).join('')}
        </nav>
      </header>

      <div class="ielts-reading-split-pane">
        <aside class="ielts-reading-passage-pane" id="ieltsReadingPassageHost">
          <div class="ielts-passage-article">
            <h3>${activeSection?.title || `Passage ${activePassageNum}`}</h3>
            <div class="ielts-passage-body">
              ${passageText.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`).join('')}
            </div>
          </div>
        </aside>

        <main class="ielts-reading-questions-pane">
          <div class="ielts-active-passage-questions" data-active-passage="${activePassageNum}">
            <div class="ielts-questions-list">
              ${questions.map(q => `
                <article class="ielts-question-card" id="card-${q.id}" data-question-id="${q.id}">
                  <p class="ielts-q-prompt"><strong>Question ${q.order}:</strong> ${q.prompt}</p>
                  ${Array.isArray(q.options) ? `
                    <div class="ielts-q-options">
                      ${q.options.map(opt => `
                        <label class="ielts-option-label">
                          <input type="radio" name="${q.id}" value="${opt.id}" />
                          <span class="ielts-option-text">${opt.text}</span>
                        </label>
                      `).join('')}
                    </div>
                  ` : `
                    <div class="ielts-q-text-input">
                      <input type="text" name="${q.id}" placeholder="Type answer here..." class="ielts-text-answer-input" />
                    </div>
                  `}
                </article>
              `).join('')}
            </div>
          </div>
        </main>
      </div>

      <footer class="ielts-reading-footer">
        <div class="ielts-reading-nav-matrix" aria-label="Question Navigation">
          ${Array.from({ length: 40 }, (_, i) => i + 1).map(num => `
            <button type="button" class="ielts-nav-btn" data-question-num="${num}">
              ${num}
            </button>
          `).join('')}
        </div>
        <div class="ielts-reading-action-bar">
          <button type="button" class="ielts-submit-btn" id="ieltsReadingSubmitBtn">
            Submit Test
          </button>
        </div>
      </footer>
    </div>
  `.trim();
}

export function mountReadingRunnerUI(container, {
  blueprint,
  mode = IELTS_READING_PRACTICE_MODE,
  errorRepository = null,
  onComplete = null
} = {}) {
  if (!container) throw new Error('Container is required to mount Reading Runner UI.');

  const runner = new IeltsReadingRunner({
    blueprint,
    mode,
    errorRepository
  });

  const render = () => {
    container.innerHTML = renderReadingRunnerDOM({
      blueprint,
      mode,
      currentPassage: runner.currentPassage
    });
  };

  render();

  const controller = {
    runner,
    navigateToPassage(passageNumber) {
      runner.navigateToPassage(passageNumber);
      render();
    },
    async submitTest(answers = {}) {
      const result = await runner.submitTest(answers);
      if (typeof onComplete === 'function') {
        onComplete(result);
      }
      return result;
    },
    destroy() {
      container.innerHTML = '';
    }
  };

  return controller;
}
