import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildActivityMap,
  buildHeatmapDays,
  calculateKnowledgeStrength,
  calculateSkillCoverage,
  calculateStreak,
  summarizeActivity,
  summarizeReviewQuality
} from '../src/progress.js';
import { sanitizeCardInput, updateCardAfterRating } from '../src/learning.js';

const DAY=86_400_000;
const noonUtc=date=>Date.parse(`${date}T12:00:00Z`);

test('activity ignores assisted corrective steps and streak counts consecutive days',()=>{
  const now=noonUtc('2026-07-27');
  const events=[
    {reviewedAt:now-2*DAY,rating:'good'},
    {reviewedAt:now-DAY,rating:'hard'},
    {reviewedAt:now-DAY+1000,rating:'again',assisted:true},
    {reviewedAt:now,rating:'good'}
  ];
  const map=buildActivityMap(events,'UTC');
  assert.equal(map.get('2026-07-26'),1);
  assert.equal(calculateStreak(map,now,'UTC'),3);
});

test('streak tolerates today not studied but stops after a true gap',()=>{
  const now=noonUtc('2026-07-27');
  const consecutive=buildActivityMap([{reviewedAt:now-DAY},{reviewedAt:now-2*DAY}],'UTC');
  const gap=buildActivityMap([{reviewedAt:now-2*DAY}],'UTC');
  assert.equal(calculateStreak(consecutive,now,'UTC'),2);
  assert.equal(calculateStreak(gap,now,'UTC'),0);
});

test('skill coverage exposes unreviewed required skills separately from strength',()=>{
  const start=1_700_000_000_000;
  let card=sanitizeCardInput({front:'reliable',back:'đáng tin',createdAt:start,learningGoal:'active',status:'learning'});
  card=updateCardAfterRating(card,'good',start,'recognition').card;
  const coverage=calculateSkillCoverage([card]);
  assert.equal(coverage.required,4);
  assert.equal(coverage.reviewed,1);
  assert.equal(coverage.percent,25);
  const strength=calculateKnowledgeStrength([card],start+1_000);
  assert.equal(strength.sampleSize,1);
  assert.ok(strength.percent>=0&&strength.percent<=100);
});

test('knowledge strength reports an explicit no-evidence state',()=>{
  const knowledge=calculateKnowledgeStrength([sanitizeCardInput({front:'new',back:'mới'})]);
  assert.deepEqual(knowledge,{percent:0,sampleSize:0,label:'Chưa đủ dữ liệu'});
});

test('review quality treats Hard as successful and Again as failure',()=>{
  const quality=summarizeReviewQuality([
    {rating:'hard',skill:'recall'},
    {rating:'good',skill:'recall'},
    {rating:'again',skill:'listening'},
    {rating:'again',skill:'recall',assisted:true}
  ]);
  assert.equal(quality.reviews,3);
  assert.equal(quality.successful,2);
  assert.equal(quality.again,1);
  assert.equal(quality.successRate,67);
  assert.equal(quality.bySkill.recall.successRate,100);
});

test('heatmap and activity summary remain bounded and deterministic',()=>{
  const now=noonUtc('2026-07-27');
  const events=Array.from({length:5},(_,index)=>({reviewedAt:now-index*1000}));
  const heatmap=buildHeatmapDays(events,12,now,'UTC');
  assert.equal(heatmap.length,84);
  assert.equal(heatmap.at(-1).level,4);
  assert.ok(heatmap.every(day=>day.level>=0&&day.level<=4));
  const summary=summarizeActivity([{reviewedAt:now},{reviewedAt:now-DAY},{reviewedAt:now-DAY}],now,'UTC');
  assert.equal(summary.reviewsLast7,3);
  assert.equal(summary.activeDaysLast7,2);
  assert.equal(summary.streak,2);
});
