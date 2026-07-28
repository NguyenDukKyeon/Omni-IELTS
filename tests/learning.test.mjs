import test from 'node:test';
import assert from 'node:assert/strict';
import {
  seedCards,
  buildMatchingStep,
  buildOutputStep,
  calculateExamPacing,
  cardIdentityKey,
  checkAnswer,
  createSessionSteps,
  forecastWorkload,
  getTransferDueCards,
  parseImportText,
  sanitizeCardInput,
  summarizeErrorFingerprint,
  updateCardAfterRating,
  weakWordScore
} from '../src/learning.js';
import {
  DEFAULT_FSRS_CONFIG,
  FSRS_VERSION,
  getDueSkillItems,
  requiredSkillsForCard,
  skillHasReviews,
  validateFsrsConfig
} from '../src/fsrs-scheduler.js';

const DAY=86_400_000;

test('skill profiles distinguish passive, active and collocation goals',()=>{
  assert.deepEqual(requiredSkillsForCard({type:'word',learningGoal:'passive'}),['recognition','recall']);
  assert.deepEqual(requiredSkillsForCard({type:'word',learningGoal:'active'}),['recognition','recall','listening','production']);
  assert.deepEqual(requiredSkillsForCard({type:'collocation',learningGoal:'passive'}),['recognition','recall','collocation']);
  assert.deepEqual(requiredSkillsForCard({type:'word',targetSkills:['recall','listening','recall']}),['recall','listening']);
});

test('a reviewed card exposes its missing required skill as immediately due',()=>{
  const now=1_700_000_000_000;
  let card=sanitizeCardInput({id:'skill-gap',front:'reliable',back:'đáng tin',status:'learning',createdAt:now,learningGoal:'passive'});
  card=updateCardAfterRating(card,'good',now,'recognition').card;
  const items=getDueSkillItems([card],now+1_000,DEFAULT_FSRS_CONFIG);
  assert.equal(skillHasReviews(card,'recognition'),true);
  assert.equal(skillHasReviews(card,'recall'),false);
  assert.ok(items.some(item=>item.cardId===card.id&&item.skill==='recall'&&item.reviewed===false));
  const steps=createSessionSteps([card],'quick',4,{now:now+1_000,timeBudgetSeconds:300});
  assert.ok(steps.some(step=>step.cardId===card.id&&step.skill==='recall'&&['typing','sentence-cloze'].includes(step.kind)));
});

test('Hard is a successful retrieval while Again is the only failure',()=>{
  const now=1_700_000_000_000;
  let card=sanitizeCardInput({id:'ratings',front:'durable',back:'bền',status:'learning',createdAt:now});
  card=updateCardAfterRating(card,'hard',now,'recognition').card;
  assert.equal(card.correct,1);
  assert.equal(card.incorrect,0);
  card=updateCardAfterRating(card,'again',now+60_000,'recognition').card;
  assert.equal(card.correct,1);
  assert.equal(card.incorrect,1);
  assert.equal(card.fsrsVersion,FSRS_VERSION);
});

test('new-word acquisition is either complete or omitted under a time budget',()=>{
  const card=sanitizeCardInput({id:'fresh',front:'resilient',back:'kiên cường',status:'new'});
  const tooShort=createSessionSteps([card],'today',10,{newLimit:1,timeBudgetSeconds:80});
  assert.equal(tooShort.some(step=>step.cardId===card.id&&step.acquisition),false);
  const enough=createSessionSteps([card],'today',10,{newLimit:1,timeBudgetSeconds:220});
  const bundle=enough.filter(step=>step.cardId===card.id&&step.acquisition);
  assert.deepEqual(bundle.map(step=>step.kind),['intro','meaning-choice','typing']);
});

test('pronunciation and test practice never change FSRS',()=>{
  const cards=seedCards.map(sanitizeCardInput);
  const pronunciation=createSessionSteps(cards,'pronunciation',4,{timeBudgetSeconds:600});
  assert.ok(pronunciation.length>0);
  assert.ok(pronunciation.every(step=>step.kind==='pronunciation'&&step.affectsSchedule===false&&step.skill===null));
  assert.ok(createSessionSteps(cards,'test',4,{timeBudgetSeconds:600}).every(step=>step.affectsSchedule===false));
});

test('matching and output builders enforce bounded contracts',()=>{
  const cards=seedCards.map(sanitizeCardInput);
  const matching=buildMatchingStep(cards,20);
  assert.equal(matching.pairs.length,10);
  assert.equal(new Set(matching.pairs.map(pair=>pair.id)).size,10);
  assert.equal(matching.affectsSchedule,false);
  const output=buildOutputStep(cards,10);
  assert.equal(output.terms.length,5);
  assert.equal(output.skill,'production');
});

test('import supports quoted multiline CSV and reports incomplete rows',()=>{
  const input='front,back,example,deck\n"make progress","tiến bộ","We made\nsteady progress.",IELTS\nmissing-only';
  const result=parseImportText(input,'Imported');
  assert.equal(result.cards.length,1);
  assert.equal(result.cards[0].front,'make progress');
  assert.equal(result.cards[0].example,'We made\nsteady progress.');
  assert.equal(result.cards[0].deck,'IELTS');
  assert.equal(result.errors.length,1);
});

test('card identity permits multiple senses but rejects exact semantic duplicates',()=>{
  const noun=sanitizeCardInput({front:'bank',back:'ngân hàng',type:'word'});
  const river=sanitizeCardInput({front:'bank',back:'bờ sông',type:'word'});
  const duplicate=sanitizeCardInput({front:' Bank ',back:'Ngân hàng',type:'word'});
  assert.notEqual(cardIdentityKey(noun),cardIdentityKey(river));
  assert.equal(cardIdentityKey(noun),cardIdentityKey(duplicate));
});

test('answer checking accepts variants and small spelling slips without converting failure into success',()=>{
  const card=sanitizeCardInput({front:'well-being',back:'sự khỏe mạnh',accepted:['wellbeing']});
  assert.equal(checkAnswer(card,{answer:'well-being'},'wellbeing').status,'correct');
  assert.equal(checkAnswer(card,{answer:'well-being'},'well-bein').status,'near');
  assert.equal(checkAnswer(card,{answer:'well-being'},'unrelated').status,'wrong');
});

test('weak ranking, transfer checks and seven-day forecast expose actionable work',()=>{
  const now=1_700_000_000_000;
  const weak=sanitizeCardInput({id:'weak',front:'fragile',back:'mong manh',status:'learning',updatedAt:now-DAY,ratingCounts:{again:3,hard:2,good:1,easy:0},errorCounts:{spelling:3},transferDueAt:now-1});
  const strong=sanitizeCardInput({id:'strong',front:'simple',back:'đơn giản',status:'learning',updatedAt:now,ratingCounts:{again:0,hard:0,good:15,easy:5}});
  assert.ok(weakWordScore(weak,now)>weakWordScore(strong,now));
  assert.deepEqual(getTransferDueCards([weak,strong],now).map(card=>card.id),['weak']);
  const fingerprint=summarizeErrorFingerprint([weak,strong]);
  assert.equal(fingerprint.top[0].category,'spelling');
  const forecast=forecastWorkload([weak,strong],7,now);
  assert.equal(forecast.length,7);
  assert.ok(forecast.every(day=>day.reviews>=0&&day.estimatedMinutes>=0));
  const pacing=calculateExamPacing([weak,strong],'2023-11-20',now);
  assert.equal(pacing.configured,true);
  assert.ok(pacing.dailyMinimum>=0);
});

test('FSRS configuration is clamped and keeps a single short learning step',()=>{
  const config=validateFsrsConfig({requestRetention:2,maximumInterval:2,learningSteps:['bad','10m'],relearningSteps:[]});
  assert.equal(config.requestRetention,0.97);
  assert.equal(config.maximumInterval,30);
  assert.deepEqual(config.learningSteps,['10m']);
  assert.deepEqual(config.relearningSteps,DEFAULT_FSRS_CONFIG.relearningSteps);
});
