import fs from 'node:fs';
const read=path=>fs.readFileSync(path,'utf8');
const checks=[
  ['CI dùng npm ci',read('.github/workflows/ci.yml').includes('npm ci --no-audit --no-fund')],
  ['Không còn claim 40%',!read('index.html').includes('40%')],
  ['Skill ladder có planned/unlocked',read('src/fsrs-scheduler.js').includes('unlockedSkillsForCard')],
  ['Accepted answer theo skill',read('src/learning.js').includes('acceptedBySkill')],
  ['Import provenance đúng',!read('src/app.js').includes("source:'import'" )],
  ['Import atomic',read('src/app.js').includes('persistImportBatch')],
  ['Production self-assessment bị giới hạn Hard',read('src/app.js').includes("commitManual('hard','correct')")],
  ['Daily progress dựa trên independent review',read('src/app.js').includes('independentReviewsDone')],
  ['Quick Capture tách khỏi card',fs.existsSync('src/capture-inbox.js')],
  ['PWA không skipWaiting lúc install',!read('public/sw.js').includes('cache.addAll(PRECACHE)).then(()=>self.skipWaiting())')],
  ['AI key disclosure',read('src/roadmap-runtime.js').includes('truyền qua server')],
  ['Calibration có mặt',read('src/progress.js').includes('summarizeCalibration')]
];
let failed=0;for(const[label,ok]of checks){console.log((ok?'✓':'✗')+' '+label);if(!ok)failed++;}if(failed){console.error(failed+' kiểm tra roadmap thất bại.');process.exit(1);}console.log('Đạt '+checks.length+'/'+checks.length+' kiểm tra roadmap.');
