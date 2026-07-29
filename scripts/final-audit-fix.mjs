import { readFile, writeFile } from 'node:fs/promises';

async function replaceOnce(path, before, after, marker) {
  const source = await readFile(path, 'utf8');
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`${marker}: replacement target not found in ${path}`);
  await writeFile(path, source.replace(before, after));
}

await replaceOnce(
  'src/persistence.js',
  `      const cards=[...getCurrentState().cards.filter(item=>item.id!==card.id),clone(card)];
      const events=dedupeReviewEvents([...readFallbackReviewEvents(),review]);`,
  `      const cards=[...getCurrentState().cards.filter(item=>item.id!==card.id),clone(operation.card)];
      card.storageBaseUpdatedAt=operation.card.storageUpdatedAt;card.storageUpdatedAt=operation.card.storageUpdatedAt;
      const events=dedupeReviewEvents([...readFallbackReviewEvents(),review]);`,
  'fallback review version sync'
);

await replaceOnce(
  'src/persistence.js',
  `      }else currentState=await readStateFromDatabase();
      emitStatus('saved');return result;`,
  `      }else currentState=await readStateFromDatabase();
      const persistedCard=getCurrentState().cards.find(item=>item.id===card.id)||operation.card;
      if(card&&typeof card==='object'){card.storageBaseUpdatedAt=Number(persistedCard.storageUpdatedAt||0);card.storageUpdatedAt=Number(persistedCard.storageUpdatedAt||0);}
      emitStatus('saved');return result;`,
  'review version sync'
);

await replaceOnce(
  'src/persistence.js',
  `    }catch(error){
      error.outboxQueued=Boolean(outbox);
      emitStatus(outbox?'pending':'error',{pendingId:outbox?.id,message:error.message});
      if(error.code==='STALE_REVIEW_WRITE')globalThis.dispatchEvent?.(new CustomEvent('vocab:write-conflict',{detail:{code:error.code,message:error.message}}));
      throw error;
    }`,
  `    }catch(error){
      if(error.code==='STALE_REVIEW_WRITE'&&outbox)await deleteOne(STORE_NAMES.outbox,outbox.id).catch(()=>{});
      error.outboxQueued=Boolean(outbox&&error.code!=='STALE_REVIEW_WRITE');
      emitStatus(error.outboxQueued?'pending':'error',{pendingId:error.outboxQueued?outbox.id:null,message:error.message});
      if(error.code==='STALE_REVIEW_WRITE')globalThis.dispatchEvent?.(new CustomEvent('vocab:write-conflict',{detail:{code:error.code,message:error.message}}));
      throw error;
    }`,
  'stale review outbox cleanup'
);

await replaceOnce(
  'src/app.js',
  `  try{await persistReviewResult({card:savedCard,event,metrics:step.persistMetrics===false?null:state.metrics});}catch(error){console.warn('[persistence] Không thể lưu lượt ôn',error);showToast(error.outboxQueued?'Lượt ôn chưa ghi xong; outbox sẽ thử lại khi mở ứng dụng.':'Không thể bảo vệ lượt ôn này. Hãy tải backup trước khi tiếp tục.');}`,
  `  try{await persistReviewResult({card:savedCard,event,metrics:step.persistMetrics===false?null:state.metrics});}catch(error){if(!error.outboxQueued)replaceCard(card);console.warn('[persistence] Không thể lưu lượt ôn',error);showToast(error.outboxQueued?'Lượt ôn chưa ghi xong; outbox sẽ thử lại khi mở ứng dụng.':'Không thể bảo vệ lượt ôn này. Trạng thái thẻ đã được hoàn tác; hãy tải lại nếu tab khác vừa sửa dữ liệu.');}`,
  'review state rollback'
);

await replaceOnce(
  'scripts/browser-smoke.mjs',
  `    await evaluate("document.querySelector('#wordList [data-card-id]').click()");`,
  `    await waitFor("document.querySelector('#wordList [data-open-card]')",'library detail control');
    await evaluate("document.querySelector('#wordList [data-open-card]').click()");`,
  'library detail selector'
);

await replaceOnce(
  'tests/persistence.test.mjs',
  `  assert.equal(duplicate.inserted,false);
  const backup=await persistence.exportBackupPackage();
  assert.equal(backup.cards.length,1);
  assert.equal(backup.cards[0].back,'bền');
  assert.equal(backup.reviewEvents.length,1);`,
  `  assert.equal(duplicate.inserted,false);
  assert.ok(Number(card.storageUpdatedAt)>0);
  const secondEvent=createReviewEvent({cardId:card.id,skill:'recognition',exerciseType:'meaning-choice',sessionMode:'today',rating:'hard',reviewedAt:3000,resultLog:{id:'log-2',rating:2,review:3000,fsrsVersion:6}});
  const second=await persistence.persistReviewResult({card,event:secondEvent,metrics:{dailyDone:1,completedReviews:1}});
  assert.equal(second.inserted,true);
  const backup=await persistence.exportBackupPackage();
  assert.equal(backup.cards.length,1);
  assert.equal(backup.cards[0].back,'bền');
  assert.equal(backup.reviewEvents.length,2);`,
  'consecutive review regression'
);

let tests = await readFile('tests/persistence.test.mjs', 'utf8');
tests = tests.replace("assert.equal(snapshot.reviewEvents.length,1);", "assert.equal(snapshot.reviewEvents.length,2);");
tests = tests.replace("assert.equal(backup.reviewEvents.length,1);\n});\n\ntest('full restore", "assert.equal(backup.reviewEvents.length,2);\n});\n\ntest('full restore");
await writeFile('tests/persistence.test.mjs', tests);

console.log('Final audit fixes staged successfully.');
