import test from 'node:test';
import assert from 'node:assert/strict';
import { composeTodayPlan,dateKeyInTimezone } from '../src/today-composer.js';
import { validateActivitySpec } from '../src/learning-contracts.js';

const target=(id,skill='recall',revision='revision-1')=>({cardId:id,senseId:`sense-${id}`,skill,sourceId:`core-card:${id}`,sourceRevision:revision});
const row=(id,overrides={})=>({id,type:'typing',target:target(id),executor:'core-card',estimatedSeconds:60,priority:1,...overrides});
const now=Date.UTC(2026,6,30,16,30);

test('same input produces the same plan and exact ActivitySpec bindings',()=>{
  const input={dueReviews:[row('due-1')],repairs:[row('repair-1')],minutes:5,timezone:'Asia/Saigon',now};
  const first=composeTodayPlan(input);
  const second=composeTodayPlan(input);
  assert.deepEqual(second,first);
  assert.equal(first.activities.every(activity=>validateActivitySpec(activity.activitySpec).valid),true);
  assert.equal(first.activities.every(activity=>activity.activitySpec.target.cardId===activity.target.cardId),true);
  assert.equal(first.activities.every(activity=>activity.reasonCode),true);
});

test('due maintenance cannot be displaced by repair or new content under a tight budget',()=>{
  const plan=composeTodayPlan({
    dueReviews:[row('due-early',{dueAt:100,priority:1}),row('due-late',{dueAt:200,priority:1})],
    repairs:[row('repair-high',{priority:999})],
    content:[row('content-high',{priority:999})],
    minutes:2,
    now
  });
  assert.deepEqual(plan.activities.map(activity=>activity.id),['due-early','due-late']);
  assert.equal(plan.excluded.some(row=>row.id==='repair-high'&&row.reason==='time-budget'),true);
});

test('repair cap, stale targets and missing content are explicit without requiring AI',()=>{
  const plan=composeTodayPlan({
    dueReviews:[row('due-offline')],
    repairs:[row('repair-1'),row('repair-2'),row('repair-3')],
    content:[],
    repairCap:1,
    minutes:10,
    now
  });
  assert.equal(plan.activities.some(activity=>activity.id==='due-offline'),true);
  assert.equal(plan.activities.filter(activity=>activity.reasonCode==='error-repair').length,1);
  assert.equal(plan.excluded.filter(row=>row.reason==='repair-cap').length,2);
  const stale=composeTodayPlan({dueReviews:[{...row('stale'),target:{cardId:'stale'}}],now});
  assert.equal(stale.activities.length,0);
  assert.deepEqual(stale.excluded,[{id:'stale',reason:'missing-exact-target'}]);
});

test('timezone day boundaries are stable and explicit',()=>{
  assert.equal(dateKeyInTimezone(now,'Asia/Saigon'),'2026-07-30');
  assert.equal(dateKeyInTimezone(now,'America/Los_Angeles'),'2026-07-30');
  const later=Date.UTC(2026,6,30,18,30);
  assert.equal(dateKeyInTimezone(later,'Asia/Saigon'),'2026-07-31');
  assert.equal(dateKeyInTimezone(later,'America/Los_Angeles'),'2026-07-30');
});

test('non-finite estimatedSeconds falls back before time-budget accounting',()=>{
  const plan=composeTodayPlan({
    dueReviews:[
      row('due-finite',{dueAt:100,estimatedSeconds:60}),
      row('due-non-finite',{dueAt:200,estimatedSeconds:'not-a-number'})
    ],
    minutes:1,
    now
  });

  assert.deepEqual(
    plan.activities.map(activity=>activity.id),
    ['due-finite']
  );
  assert.equal(
    plan.excluded.some(
      entry=>entry.id==='due-non-finite'&&entry.reason==='time-budget'
    ),
    true
  );
  assert.equal(Number.isFinite(plan.estimatedSeconds),true);
  assert.equal(
    plan.activities.every(
      activity=>Number.isFinite(activity.estimatedSeconds)
    ),
    true
  );
});
