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

const cleanCi = `name: CI
on:
  push:
    branches: ['main', 'agent/roadmap-v9']
  pull_request:
    branches: ['main']
permissions:
  contents: read
  pull-requests: write
  issues: write
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci --no-audit --no-fund
      - name: Run tests
        id: tests
        continue-on-error: true
        run: npm test > test-output.txt 2>&1
      - name: Run cross-check
        id: crosscheck
        continue-on-error: true
        if: steps.tests.outcome == 'success'
        run: npm run check > check-output.txt 2>&1
      - name: Audit roadmap contracts
        id: roadmap
        continue-on-error: true
        if: steps.tests.outcome == 'success' && steps.crosscheck.outcome == 'success'
        run: npm run audit:roadmap > roadmap-output.txt 2>&1
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: verification-output
          path: |
            test-output.txt
            check-output.txt
            roadmap-output.txt
          if-no-files-found: ignore
      - name: Report verification failure
        if: (steps.tests.outcome == 'failure' || steps.crosscheck.outcome == 'failure' || steps.roadmap.outcome == 'failure') && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const testOutput = fs.existsSync('test-output.txt') ? fs.readFileSync('test-output.txt', 'utf8') : '';
            const checkOutput = fs.existsSync('check-output.txt') ? fs.readFileSync('check-output.txt', 'utf8') : '';
            const roadmapOutput = fs.existsSync('roadmap-output.txt') ? fs.readFileSync('roadmap-output.txt', 'utf8') : '';
            const output = \`\${testOutput}\\n\${checkOutput}\\n\${roadmapOutput}\`.slice(-12000);
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: \`<!-- roadmap-v9-ci-report -->\\n### CI verification failure\\n\\n\\`\\`\\`text\\n\${output}\\n\\`\\`\\`\`
            });
      - name: Fail on verification errors
        if: steps.tests.outcome == 'failure' || steps.crosscheck.outcome == 'failure' || steps.roadmap.outcome == 'failure'
        run: cat test-output.txt check-output.txt roadmap-output.txt 2>/dev/null || true; exit 1
      - run: npm run build
      - run: npm run test:serve
      - run: npm run test:preview
      - name: Run browser interaction smoke
        id: browser
        continue-on-error: true
        timeout-minutes: 2
        shell: bash
        run: |
          set -o pipefail
          timeout --signal=TERM --kill-after=10s 100s npm run test:browser 2>&1 | tee browser-output.txt
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: browser-smoke-output
          path: browser-output.txt
          if-no-files-found: ignore
      - name: Report browser smoke failure
        if: steps.browser.outcome == 'failure' && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const output = fs.existsSync('browser-output.txt') ? fs.readFileSync('browser-output.txt', 'utf8').slice(-12000) : 'No browser output was produced.';
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: \`<!-- browser-smoke-report -->\\n### Browser interaction smoke failure\\n\\n\\`\\`\\`text\\n\${output}\\n\\`\\`\\`\`
            });
      - name: Fail on browser interaction errors
        if: steps.browser.outcome == 'failure'
        run: cat browser-output.txt; exit 1
      - name: Run hardening browser smoke
        id: hardening
        continue-on-error: true
        timeout-minutes: 2
        shell: bash
        run: |
          set -o pipefail
          timeout --signal=TERM --kill-after=10s 100s npm run test:hardening 2>&1 | tee hardening-output.txt
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: hardening-browser-output
          path: hardening-output.txt
          if-no-files-found: ignore
      - name: Report hardening failure
        if: steps.hardening.outcome == 'failure' && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const output = fs.existsSync('hardening-output.txt') ? fs.readFileSync('hardening-output.txt', 'utf8').slice(-12000) : 'No hardening output was produced.';
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: \`<!-- hardening-smoke-report -->\\n### Hardening browser smoke failure\\n\\n\\`\\`\\`text\\n\${output}\\n\\`\\`\\`\`
            });
      - name: Fail on hardening browser errors
        if: steps.hardening.outcome == 'failure'
        run: cat hardening-output.txt; exit 1
`;
await writeFile('.github/workflows/ci.yml', cleanCi);
console.log('Final audit fixes staged successfully.');
