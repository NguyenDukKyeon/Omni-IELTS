import {
  calculateWritingWordCount,
  validateIeltsWritingPrompt,
  evaluateWritingRubricCriteria,
  calculateOverallWritingBand,
  WRITING_RUBRIC_LABEL
} from './ielts-domain.js';

export const IELTS_WRITING_EXAM_MODE = 'exam';
export const IELTS_WRITING_PRACTICE_MODE = 'practice';
export const WRITING_FULL_TEST_MINUTES = 60;
export const WRITING_TASK1_MINUTES = 20;
export const WRITING_TASK2_MINUTES = 40;
export const IELTS_WRITING_CHECKPOINT_SCHEMA = 'IELTS_WRITING_CHECKPOINT_V1';

export const IELTS_WRITING_TASK1_ACADEMIC_PROMPT = Object.freeze({
  id: 'standard-ielts-academic-writing-task1',
  kind: 'ielts-writing-prompt',
  track: 'academic',
  taskNumber: 1,
  visualFamily: 'line-graph',
  title: 'Academic Writing Task 1: Energy Consumption Trends',
  instructions: 'The graph below shows energy consumption by source from 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  minWords: 150,
  recommendedMinutes: 20,
  visualData: {
    type: 'line-graph',
    labels: ['2000', '2005', '2010', '2015', '2020'],
    datasets: [
      { label: 'Solar & Wind', data: [12, 18, 30, 48, 70] },
      { label: 'Fossil Fuels', data: [85, 82, 78, 72, 60] }
    ]
  }
});

export const IELTS_WRITING_TASK1_GT_PROMPT = Object.freeze({
  id: 'standard-ielts-gt-writing-task1',
  kind: 'ielts-writing-prompt',
  track: 'general-training',
  taskNumber: 1,
  letterRegister: 'formal',
  title: 'General Training Writing Task 1: Letter to Landlord',
  situation: 'You recently moved into a new flat and found several maintenance problems with the heating and plumbing.',
  instructions: 'Write a letter to your landlord. In your letter:\n- explain the situation\n- describe the problems in detail\n- state what action you expect the landlord to take.\nWrite at least 150 words.',
  bulletPrompts: [
    'explain the situation',
    'describe the problems in detail',
    'state what action you expect the landlord to take'
  ],
  minWords: 150,
  recommendedMinutes: 20
});

export const IELTS_WRITING_TASK2_PROMPT = Object.freeze({
  id: 'standard-ielts-writing-task2',
  kind: 'ielts-writing-prompt',
  track: 'academic',
  taskNumber: 2,
  essayType: 'agree-disagree',
  title: 'Writing Task 2: Renewable Energy Transition',
  statement: 'Some people argue that governments should ban petrol and diesel vehicles within the next decade to combat climate change, while others believe this transition should be gradual.',
  instructions: 'To what extent do you agree or disagree? Give reasons for your answer and include relevant examples from your knowledge or experience. Write at least 250 words.',
  minWords: 250,
  recommendedMinutes: 40
});

export function createSyntheticWritingBlueprint(options = {}) {
  const track = options.track || 'academic';
  const id = options.id || `synthetic-writing-blueprint-${track}-${Date.now()}`;
  const title = options.title || `IELTS ${track === 'academic' ? 'Academic' : 'General Training'} Writing Test`;

  const task1 = track === 'academic'
    ? { ...IELTS_WRITING_TASK1_ACADEMIC_PROMPT, id: `${id}-t1`, visualFamily: options.visualFamily || 'line-graph' }
    : { ...IELTS_WRITING_TASK1_GT_PROMPT, id: `${id}-t1`, letterRegister: options.letterRegister || 'formal' };

  const task2 = {
    ...IELTS_WRITING_TASK2_PROMPT,
    id: `${id}-t2`,
    track,
    essayType: options.essayType || 'agree-disagree'
  };

  return Object.freeze({
    id,
    kind: 'ielts-test-blueprint',
    schemaVersion: 1,
    skill: 'writing',
    track,
    hierarchyLevel: 'SKILL_TEST',
    title,
    timing: { testMinutes: WRITING_FULL_TEST_MINUTES, totalSeconds: WRITING_FULL_TEST_MINUTES * 60 },
    task1Prompt: Object.freeze(task1),
    task2Prompt: Object.freeze(task2),
    _confidential: {
      task1ModelAnswer: options.task1ModelAnswer || null,
      task2ModelAnswer: options.task2ModelAnswer || null
    }
  });
}

export class IeltsWritingRunner {
  constructor(config = {}) {
    this.blueprint = config.blueprint || createSyntheticWritingBlueprint();
    this.mode = config.mode || IELTS_WRITING_EXAM_MODE;
    this.totalSeconds = config.totalSeconds || WRITING_FULL_TEST_MINUTES * 60;
    this.remainingSeconds = this.totalSeconds;
    this.activeTaskNumber = 1;
    this.task1Draft = config.task1Draft || '';
    this.task2Draft = config.task2Draft || '';
    this.status = 'active';
    this.startedAt = (config.now || (() => Date.now()))();
    this.onAutosave = config.onAutosave || null;
    this.onComplete = config.onComplete || null;
  }

  updateDraft(taskNumber, text) {
    if (this.status !== 'active') return;
    const normalized = String(text ?? '');
    if (taskNumber === 1) {
      this.task1Draft = normalized;
    } else if (taskNumber === 2) {
      this.task2Draft = normalized;
    }
    if (typeof this.onAutosave === 'function') {
      this.onAutosave(this.exportCheckpoint());
    }
  }

  getDraft(taskNumber) {
    return taskNumber === 1 ? this.task1Draft : this.task2Draft;
  }

  getWordCount(taskNumber) {
    return calculateWritingWordCount(this.getDraft(taskNumber));
  }

  switchTask(taskNumber) {
    if (taskNumber === 1 || taskNumber === 2) {
      this.activeTaskNumber = taskNumber;
    }
  }

  getActivePrompt() {
    return this.activeTaskNumber === 1 ? this.blueprint.task1Prompt : this.blueprint.task2Prompt;
  }

  exportCheckpoint() {
    return {
      schemaVersion: IELTS_WRITING_CHECKPOINT_SCHEMA,
      blueprintId: this.blueprint.id,
      track: this.blueprint.track,
      activeTaskNumber: this.activeTaskNumber,
      remainingSeconds: this.remainingSeconds,
      task1Draft: this.task1Draft,
      task2Draft: this.task2Draft,
      updatedAt: Date.now()
    };
  }

  restoreFromCheckpoint(checkpoint) {
    if (!checkpoint || checkpoint.schemaVersion !== IELTS_WRITING_CHECKPOINT_SCHEMA) {
      throw new Error('Invalid IELTS writing checkpoint.');
    }
    if (checkpoint.activeTaskNumber === 1 || checkpoint.activeTaskNumber === 2) {
      this.activeTaskNumber = checkpoint.activeTaskNumber;
    }
    if (typeof checkpoint.task1Draft === 'string') {
      this.task1Draft = checkpoint.task1Draft;
    }
    if (typeof checkpoint.task2Draft === 'string') {
      this.task2Draft = checkpoint.task2Draft;
    }
    if (typeof checkpoint.remainingSeconds === 'number') {
      this.remainingSeconds = checkpoint.remainingSeconds;
    }
  }

  getPublicProjection() {
    const { _confidential, ...publicBlueprint } = this.blueprint;
    return Object.freeze({
      blueprint: publicBlueprint,
      mode: this.mode,
      activeTaskNumber: this.activeTaskNumber,
      remainingSeconds: this.remainingSeconds,
      task1WordCount: this.getWordCount(1),
      task2WordCount: this.getWordCount(2),
      status: this.status
    });
  }

  evaluateSubmission(criteria = {}) {
    const t1Evaluation = evaluateWritingRubricCriteria({
      taskKind: this.blueprint.track === 'academic' ? 'task1-academic' : 'task1-letter',
      text: this.task1Draft,
      criteria: criteria.task1 || { ta: 6.5, cc: 6.5, lr: 6.5, gra: 6.5 }
    });

    const t2Evaluation = evaluateWritingRubricCriteria({
      taskKind: 'task2-essay',
      text: this.task2Draft,
      criteria: criteria.task2 || { tr: 7.0, cc: 7.0, lr: 7.0, gra: 7.0 }
    });

    const overall = calculateOverallWritingBand({
      task1Band: t1Evaluation.estimatedBand,
      task2Band: t2Evaluation.estimatedBand
    });

    return {
      blueprintId: this.blueprint.id,
      track: this.blueprint.track,
      task1: {
        draft: this.task1Draft,
        wordCount: t1Evaluation.wordCount,
        underLength: t1Evaluation.underLength,
        warnings: t1Evaluation.warnings,
        criteria: t1Evaluation.criteria,
        estimatedBand: t1Evaluation.estimatedBand
      },
      task2: {
        draft: this.task2Draft,
        wordCount: t2Evaluation.wordCount,
        underLength: t2Evaluation.underLength,
        warnings: t2Evaluation.warnings,
        criteria: t2Evaluation.criteria,
        estimatedBand: t2Evaluation.estimatedBand
      },
      overallBand: overall.overallBand,
      label: WRITING_RUBRIC_LABEL,
      disclaimerPresent: true,
      affectsSchedule: false,
      evidenceEligible: false
    };
  }

  async submit(criteria = {}) {
    this.status = 'submitted';
    const evaluation = this.evaluateSubmission(criteria);
    const payload = {
      completed: true,
      blueprintId: this.blueprint.id,
      track: this.blueprint.track,
      rubricFeedback: evaluation,
      task1Draft: this.task1Draft,
      task2Draft: this.task2Draft,
      submittedAt: Date.now()
    };
    if (typeof this.onComplete === 'function') {
      await this.onComplete(payload);
    }
    return payload;
  }
}

export function renderWritingRunnerDOM(options = {}) {
  const blueprint = options.blueprint || createSyntheticWritingBlueprint();
  const activeTaskNumber = options.activeTaskNumber || 1;
  const activePrompt = activeTaskNumber === 1 ? blueprint.task1Prompt : blueprint.task2Prompt;
  const minWords = activePrompt.minWords || (activeTaskNumber === 1 ? 150 : 250);
  const currentDraft = options.runner ? options.runner.getDraft(activeTaskNumber) : '';
  const wordCount = calculateWritingWordCount(currentDraft);

  let promptDetailsHtml = '';
  if (activeTaskNumber === 1) {
    if (blueprint.track === 'academic') {
      promptDetailsHtml = `
        <div class="ielts-writing-visual-container" data-visual-type="${activePrompt.visualFamily || 'chart'}">
          <div class="ielts-visual-header"><strong>${activePrompt.title}</strong></div>
          <div class="ielts-visual-placeholder">
            <svg width="100%" height="160" viewBox="0 0 300 160" class="ielts-visual-svg">
              <rect width="100%" height="100%" fill="#f8fafc" rx="6" />
              <text x="150" y="80" text-anchor="middle" fill="#64748b" font-size="12">Visual Chart: [${activePrompt.visualFamily || 'line-graph'}]</text>
            </svg>
          </div>
          <p class="ielts-visual-instructions">${activePrompt.instructions}</p>
        </div>`;
    } else {
      const bullets = (activePrompt.bulletPrompts || []).map(b => `<li>${b}</li>`).join('');
      promptDetailsHtml = `
        <div class="ielts-writing-letter-container" data-register="${activePrompt.letterRegister || 'formal'}">
          <div class="ielts-letter-situation"><p>${activePrompt.situation || ''}</p></div>
          <p class="ielts-letter-instructions">In your letter:</p>
          <ul class="ielts-letter-bullets">${bullets}</ul>
        </div>`;
    }
  } else {
    promptDetailsHtml = `
      <div class="ielts-writing-essay-container" data-essay-type="${activePrompt.essayType || 'agree-disagree'}">
        <div class="ielts-essay-statement"><blockquote>${activePrompt.statement || ''}</blockquote></div>
        <p class="ielts-essay-instructions">${activePrompt.instructions}</p>
      </div>`;
  }

  return `
    <div class="v10-ielts-writing-runner" data-track="${blueprint.track}">
      <div class="ielts-writing-header">
        <div class="ielts-writing-nav-tabs">
          <button type="button" class="ielts-wrt-tab ${activeTaskNumber === 1 ? 'active' : ''}" data-task-tab="1">Task 1 (${blueprint.track === 'academic' ? 'Report' : 'Letter'})</button>
          <button type="button" class="ielts-wrt-tab ${activeTaskNumber === 2 ? 'active' : ''}" data-task-tab="2">Task 2 (Essay)</button>
        </div>
        <div class="ielts-writing-timer" data-test-timer="true">60:00</div>
      </div>
      <div class="ielts-writing-split-pane">
        <div class="ielts-writing-prompt-pane">
          <h3 class="ielts-prompt-title">${activePrompt.title}</h3>
          ${promptDetailsHtml}
        </div>
        <div class="ielts-writing-editor-pane">
          <div class="ielts-editor-toolbar">
            <div class="ielts-writing-word-counter" data-word-count="${wordCount}" data-min-words="${minWords}">
              <span class="wrt-count-val">${wordCount}</span> words (Minimum: ${minWords})
            </div>
          </div>
          <textarea name="writing-draft" class="ielts-writing-textarea" rows="16" placeholder="Type your response here...">${currentDraft}</textarea>
          <div class="ielts-editor-actions">
            <button type="button" class="ielts-wrt-submit-btn primary-button">Submit Writing Test</button>
          </div>
        </div>
      </div>
    </div>`;
}

export function mountWritingRunnerUI(container, options = {}) {
  const runner = options.runner || new IeltsWritingRunner(options);
  let timerInterval = null;

  function render() {
    container.innerHTML = renderWritingRunnerDOM({
      blueprint: runner.blueprint,
      activeTaskNumber: runner.activeTaskNumber,
      runner
    });

    const tabButtons = container.querySelectorAll ? container.querySelectorAll('[data-task-tab]') : [];
    for (const tab of tabButtons) {
      if (typeof tab.addEventListener === 'function') {
        tab.addEventListener('click', (e) => {
          e.preventDefault?.();
          const tabNum = Number(tab.dataset?.taskTab || tab.getAttribute?.('data-task-tab'));
          runner.switchTask(tabNum);
          render();
        });
      }
    }

    const textarea = container.querySelector ? container.querySelector('textarea[name="writing-draft"]') : null;
    if (textarea && typeof textarea.addEventListener === 'function') {
      textarea.addEventListener('input', (e) => {
        runner.updateDraft(runner.activeTaskNumber, e.target?.value || textarea.value);
        const countNode = container.querySelector ? container.querySelector('.wrt-count-val') : null;
        if (countNode) {
          countNode.textContent = String(runner.getWordCount(runner.activeTaskNumber));
        }
      });
    }

    const submitBtn = container.querySelector ? container.querySelector('.ielts-wrt-submit-btn') : null;
    if (submitBtn) {
      const onSubmit = async (e) => {
        e?.preventDefault?.();
        submitBtn.disabled = true;
        try {
          await runner.submit();
        } finally {
          submitBtn.disabled = false;
        }
      };
      if (typeof submitBtn.addEventListener === 'function') {
        submitBtn.addEventListener('click', onSubmit);
      } else {
        submitBtn.onclick = onSubmit;
      }
    }
  }

  render();

  return {
    runner,
    switchTask: (taskNumber) => {
      runner.switchTask(taskNumber);
      render();
    },
    updateDraft: (taskNumber, text) => {
      runner.updateDraft(taskNumber, text);
      render();
    },
    submit: async () => {
      return await runner.submit();
    },
    destroy: () => {
      if (timerInterval) clearInterval(timerInterval);
    }
  };
}
