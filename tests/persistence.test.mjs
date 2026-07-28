import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import {
  BACKUP_SCHEMA_VERSION,
  buildBackupDocument,
  createReviewEvent,
  resetLearningProgress,
  shouldCreateDailySnapshot,
  stripEmbeddedReviewHistory,
  validateBackupDocument
} from '../src/persistence-core.js';

globalThis.indexedDB=new IDBFactory();
const persistence=await import('../src/persistence.js');

test('legacy history migration is deduplicated without resetting learning evidence',()=>{
  const source=[{id:'card-1',front:'reliable',back:'đáng tin',status:'review',reviewHistory:[{id:'r1',rating:3,review:1000},{id:'r1',rating:3,review:1000}]}];
  const migrated=stripEmbeddedReviewHistory(source);
  assert.equal(migrated.cards[0].status,'review');
  assert.equal(migrated.cards[0].reviewHistory,undefined);
  assert.equal(migrated.cards[0].reviewEventCount,2);
  assert.equal(migrated.reviewEvents.length,1);
});

test('backup validation rejects duplicate IDs and normalizes schema v3',()=>{
  const duplicate=validateBackupDocument({cards:[{id:'x',front:'a',back:'b'},{id:'x',front:'c',back:'d'}]});
  assert.equal(duplicate.valid,false);
  assert.match(duplicate.errors.join(' '),/trùng/);
  const backup=buildBackupDocument({cards:[{id:'x',front:'x',back:'nghĩa'}],settings:{minutes:10}});
  const validation=validateBackupDocument(backup);
  assert.equal(validation.valid,true);
  assert.equal(validation.value.schemaVersion,BACKUP_SCHEMA_VERSION);
  assert.equal(validation.value.meta.databaseInitialized,true);
});

test('daily snapshot policy avoids excessive snapshots',()=>{
  const now=100*3_600_000;
  assert.equal(shouldCreateDailySnapshot(0,now),true);
  assert.equal(shouldCreateDailySnapshot(now-2*3_600_000,now),false);
  assert.equal(shouldCreateDailySnapshot(now-21*3_600_000,now),true);
});

test('empty initialized database remains empty and review write is atomic/idempotent',async()=>{
  const initial=await persistence.initializePersistence();
  assert.deepEqual(initial.cards,[]);
  assert.equal(initial.initialized,true);

  const card={id:'atomic-card',front:'durable',back:'bền',deck:'Cá nhân',status:'learning',fsrsBySkill:{}};
  const event=createReviewEvent({cardId:card.id,skill:'recall',exerciseType:'typing',sessionMode:'today',rating:'good',reviewedAt:2000,resultLog:{id:'log-1',rating:3,review:2000,fsrsVersion:6}});
  const first=await persistence.persistReviewResult({card,event,metrics:{dailyDone:1,completedReviews:1}});
  const duplicate=await persistence.persistReviewResult({card:{...card,back:'bền vững'},event,metrics:{dailyDone:1,completedReviews:1}});
  assert.equal(first.inserted,true);
  assert.equal(duplicate.inserted,false);
  const backup=await persistence.exportBackupPackage();
  assert.equal(backup.cards.length,1);
  assert.equal(backup.cards[0].back,'bền vững');
  assert.equal(backup.reviewEvents.length,1);
  assert.equal(backup.metrics.completedReviews,1);
  assert.equal((await persistence.getPersistenceStatus()).pendingWrites,0);
});

test('snapshots contain review events and can restore a complete state',async()=>{
  const snapshot=await persistence.createAutomaticSnapshot('integration-test');
  assert.equal(snapshot.cards.length,1);
  assert.equal(snapshot.reviewEvents.length,1);

  await persistence.persistCard({id:'other',front:'other',back:'khác'},'test-mutation');
  await persistence.restoreSnapshot(snapshot.id);
  const backup=await persistence.exportBackupPackage();
  assert.deepEqual(backup.cards.map(card=>card.id),['atomic-card']);
  assert.equal(backup.reviewEvents.length,1);
});

test('full restore validates references and manual reset preserves a recovery snapshot',async()=>{
  const backup=buildBackupDocument({
    cards:[{id:'restored',front:'resilient',back:'kiên cường',status:'learning'}],
    settings:{minutes:15},
    reviewEvents:[createReviewEvent({cardId:'restored',skill:'recognition',exerciseType:'flashcard',sessionMode:'quick',rating:'easy',reviewedAt:3000,resultLog:{id:'restore-log',rating:4,review:3000,fsrsVersion:6}})]
  });
  await persistence.restoreBackupDocument(backup);
  const before=(await persistence.listSnapshots()).length;
  await persistence.resetLearningProgressNow();
  const exported=await persistence.exportBackupPackage();
  assert.equal(exported.cards[0].status,'new');
  assert.equal(exported.reviewEvents.length,0);
  assert.ok((await persistence.listSnapshots()).length>before);
});

test('learning reset clears schedules but preserves lexical content',()=>{
  const [card]=resetLearningProgress([{id:'x',front:'bank',back:'ngân hàng',status:'mastered',fsrsBySkill:{recognition:{reps:4}},transferPassedAt:123}]);
  assert.equal(card.front,'bank');
  assert.equal(card.status,'new');
  assert.deepEqual(card.fsrsBySkill,{});
  assert.equal(card.transferPassedAt,null);
});
