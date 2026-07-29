import { readFile,stat } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const failures=[];const checks=[];
const read=path=>readFile(resolve(root,path),'utf8');
async function exists(path){try{await stat(resolve(root,path));return true;}catch{return false;}}
function check(label,condition,detail=''){checks.push({label,ok:Boolean(condition),detail});if(!condition)failures.push(`${label}${detail?`: ${detail}`:''}`);}

const phaseFiles={
  0:['src/v10-contracts.js','src/v10-persistence.js','src/v10-audit.js'],
  1:['src/lexical-core-v2.js'],
  2:['src/unified-capture-v2.js','src/library-v2-runtime.js'],
  3:['src/today-planner-v2.js','src/ielts-hub-v2.js','src/ielts-launcher-override.js'],
  4:['src/sentence-learning-loop.js'],
  5:['src/transcript-resolver-v2.js','src/youtube-sentence-player.js','server/transcript-resolver.mjs','scripts/transcript-companion.mjs'],
  6:['src/content-platform.js','public/content/catalog.json'],
  7:['public/content/lessons/starter-b1-travel-plans/transcript.json','public/content/lessons/starter-b2-urban-trees/transcript.json','public/content/lessons/starter-b2-course-enquiry/transcript.json'],
  8:['src/ai-content-factory.js'],
  9:['src/ai-content-factory.js','src/today-planner-v2.js'],
  10:['src/coaching-engine-v2.js']
};
for(const[phase,files]of Object.entries(phaseFiles)){for(const file of files)check(`Phase ${phase} file ${file}`,await exists(file));}

const [mainSource,serverSource,clientTranscript,videoPlayer,ieltsHub,launcherOverride,todayPlanner,contentPlatform,aiFactory,sentenceLoop,contracts,serviceWorker,packageText,catalogText]=await Promise.all([
  read('src/main.js'),read('server/server.mjs'),read('src/transcript-resolver-v2.js'),read('src/youtube-sentence-player.js'),read('src/ielts-hub-v2.js'),read('src/ielts-launcher-override.js'),read('src/today-planner-v2.js'),read('src/content-platform.js'),read('src/ai-content-factory.js'),read('src/sentence-learning-loop.js'),read('src/v10-contracts.js'),read('public/sw.js'),read('package.json'),read('public/content/catalog.json')
]);
const pkg=JSON.parse(packageText),catalog=JSON.parse(catalogText),lessons=(catalog.packs||[]).flatMap(pack=>pack.lessons||[]);

check('Main mounts v10 runtime',mainSource.includes("import('./v10-runtime.js')")&&mainSource.includes('mountV10Runtime()'));
check('V10 runtime is outside AI Studio preview',mainSource.indexOf("import('./v10-runtime.js')")>mainSource.indexOf('}else{'));
check('Server exposes transcript resolver',serverSource.includes("/api/transcript/")&&serverSource.includes('createTranscriptResolverHandler'));
check('yt-dlp path is subtitle-only',serverSource.includes('transcriptResolver')&&await read('server/transcript-resolver.mjs').then(text=>text.includes('--skip-download')&&!/--extract-audio|bestaudio|ffmpeg/.test(text)));
const fastProviderIndex=clientTranscript.indexOf("providers=['indexeddb','shared-cache','local-companion','backend-provider']");
const geminiFallbackIndex=clientTranscript.indexOf('result=await geminiProvider(context)',fastProviderIndex);
check('Client fast path precedes Gemini fallback',fastProviderIndex>=0&&geminiFallbackIndex>fastProviderIndex);
check('Transcript is progressive',clientTranscript.includes('firstChunkSeconds=60')&&clientTranscript.includes('continueTranscriptProgressively'));
check('YouTube sentence loop uses real segment player',videoPlayer.includes("import { YouTubeSegmentPlayer }")&&videoPlayer.includes('player.setSegment')&&ieltsHub.includes('createYoutubeSentencePlayer')&&ieltsHub.includes('openVideoLoop(row)'));
check('YouTube embed failures are contained',videoPlayer.includes('void ready.catch')&&videoPlayer.includes("host.dataset.status='error'"));
check('IELTS Hub launcher is deterministic',launcherOverride.includes('cloneNode(true)')&&launcherOverride.includes('openLegacyDialog')&&launcherOverride.includes('stopImmediatePropagation'));
check('Content is not imported into JS bundle',!mainSource.includes('/content/')&&!contentPlatform.includes("import '../public"));
check('Content catalog has verified starter lessons',lessons.length>=3&&lessons.every(row=>row.verified&&row.qualityStatus==='verified'&&row.license&&row.assets?.transcript));
check('Service worker caches content on demand',serviceWorker.includes("url.pathname.startsWith('/content/')")&&serviceWorker.includes('contentCacheFirst'));
check('AI artifacts require validation before publish',aiFactory.includes("job.status!=='ready'||!job.validation?.valid")&&aiFactory.includes("'quarantined'")&&aiFactory.includes('MAX_RETRIES'));
check('Personal content is prepared during idle time',aiFactory.includes('requestIdleCallback')&&aiFactory.includes('prepareAndRunPersonalContent')&&aiFactory.includes('runPendingAiJobs'));
check('Today consumes prepared personal content conservatively',todayPlanner.includes("lessonId==='personal-next-session'")&&todayPlanner.includes('personal-ai-content-is-validated-but-not-source-verified')&&todayPlanner.includes('vocab:v10-personal-content-ready'));
check('AI is not required to start sentence loop',!sentenceLoop.includes('/api/ai/')&&!sentenceLoop.includes('/api/ielts/reading-draft'));
check('Shadowing copy states coaching only',sentenceLoop.includes('SHADOWING · COACHING ONLY')&&sentenceLoop.includes('không tạo FSRS review'));
check('V10 contracts separate source occurrences',contracts.includes("sourceOccurrences:'sourceOccurrences'")&&contracts.includes('lexicalItemId'));
check('Package has v10 test and audit scripts',Boolean(pkg.scripts?.['test:v10'])&&Boolean(pkg.scripts?.['audit:v10'])&&Boolean(pkg.scripts?.['test:v10-browser']));
check('App version advanced to v10',pkg.version==='10.0.0');

const forbiddenBundlePatterns=['CURATED_V10_LESSONS','STARTER_TRANSCRIPTS','CONTENT_PACK_PAYLOAD'];for(const pattern of forbiddenBundlePatterns)check(`No bundled content constant ${pattern}`,!mainSource.includes(pattern)&&!contracts.includes(pattern));
const allContentPaths=lessons.flatMap(row=>Object.values(row.assets||{}));for(const path of allContentPaths)check(`Catalog asset exists ${path}`,await exists(`public${path}`));

console.log(JSON.stringify({ok:failures.length===0,checks:checks.length,passed:checks.filter(row=>row.ok).length,failures},null,2));if(failures.length){console.error('\nV10 AUDIT FAILED\n- '+failures.join('\n- '));process.exitCode=1;}else console.log('\nV10 AUDIT PASSED');
