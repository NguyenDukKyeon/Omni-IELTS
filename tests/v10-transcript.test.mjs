import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYouTubeVideoId,transcriptCacheKey,repairCaptionTimeline } from '../src/transcript-resolver-v2.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('YouTube parser supports watch, short and shorts URLs',()=>{
  const id='dQw4w9WgXcQ';
  assert.equal(parseYouTubeVideoId(`https://www.youtube.com/watch?v=${id}`),id);
  assert.equal(parseYouTubeVideoId(`https://youtu.be/${id}?t=2`),id);
  assert.equal(parseYouTubeVideoId(`https://www.youtube.com/shorts/${id}`),id);
  assert.equal(parseYouTubeVideoId('https://example.com/watch?v=x'),null);
});

test('transcript cache key separates language and clip range',()=>{
  const base={videoId:'dQw4w9WgXcQ',language:'en',startSeconds:0,endSeconds:60};
  assert.equal(transcriptCacheKey(base),transcriptCacheKey({...base}));
  assert.notEqual(transcriptCacheKey(base),transcriptCacheKey({...base,startSeconds:60,endSeconds:120}));
  assert.notEqual(transcriptCacheKey(base),transcriptCacheKey({...base,language:'vi'}));
});

test('overlapping YouTube auto captions are repaired instead of rejecting the transcript',()=>{
  const repaired=repairCaptionTimeline([
    {id:'segment:1',startMs:0,endMs:4200,text:'But now I have got to ask.'},
    {id:'segment:2',startMs:1800,endMs:6100,text:'What has the BBC ever done for me?'},
    {id:'segment:3',startMs:4300,endMs:8200,text:'Sure, it is great if you are a fan.'},
    {id:'segment:4',startMs:6800,endMs:9900,text:'Who cares if they raised money?'}
  ]);
  assert.equal(repaired.length,4);
  for(let index=1;index<repaired.length;index++)assert.ok(repaired[index].startMs>=repaired[index-1].endMs-500);
  assert.equal(repaired[0].endMs,1800);
  assert.equal(repaired[1].endMs,4300);
});

test('server yt-dlp resolver is subtitle-only and never requests audio extraction',async()=>{
  const source=await readFile(resolve(root,'server/transcript-resolver.mjs'),'utf8');
  assert.match(source,/--skip-download/);
  assert.match(source,/subtitles/);
  assert.match(source,/automatic_captions/);
  assert.doesNotMatch(source,/--extract-audio|\s-x['"\s,]/);
  assert.doesNotMatch(source,/ffmpeg|audio-only|bestaudio/);
});

test('client resolver uses deterministic caption-first order before explicit private fallback',async()=>{
  const [source,policy,gemini]=await Promise.all([readFile(resolve(root,'src/transcript-resolver-v2.js'),'utf8'),readFile(resolve(root,'src/asr-fallback-policy.js'),'utf8'),readFile(resolve(root,'server/gemini-asr-provider.mjs'),'utf8')]);
  const caption=source.indexOf('try{return await resolveTranscriptFast');
  const fallback=source.indexOf('startResolverFallback(captionError.jobId',caption);
  assert.ok(caption>=0);
  assert.ok(fallback>caption);
  assert.match(source,/policy\.localAsr===true/);
  assert.match(source,/policy\.gemini===true/);
  assert.match(policy,/cloudEnabled:bool\(input\.cloudEnabled\)/);
  assert.doesNotMatch(source,/GEMINI_API_KEY|x-goog-api-key/);
  assert.match(gemini,/server-only/);
  assert.match(source,/firstChunkSeconds=60/);
  assert.match(source,/continueTranscriptProgressively/);
  assert.match(source,/durationSeconds/);
  assert.match(source,/25_000/);
  assert.match(source,/v10-sentence-segmenter-2/);
});

test('video learning loop plays timestamped YouTube segments instead of TTS',async()=>{
  const [bridge,hub]=await Promise.all([readFile(resolve(root,'src/youtube-sentence-player.js'),'utf8'),readFile(resolve(root,'src/ielts-hub-v2.js'),'utf8')]);
  assert.match(bridge,/YouTubeSegmentPlayer/);
  assert.match(bridge,/player\.setSegment/);
  assert.match(bridge,/player\.playSegment/);
  assert.match(bridge,/void ready\.catch/);
  assert.match(hub,/createYoutubeSentencePlayer/);
  assert.match(hub,/openVideoLoop\(row\)/);
  assert.doesNotMatch(bridge,/yt-dlp|extract-audio|bestaudio/);
});

test('full-video workspace waits for caption chunks and exposes a clickable sentence rail',async()=>{
  const [workspace,runtime,css]=await Promise.all([
    readFile(resolve(root,'src/video-workspace-v2.js'),'utf8'),
    readFile(resolve(root,'src/v10-runtime.js'),'utf8'),
    readFile(resolve(root,'public/video-workspace-v2.css'),'utf8')
  ]);
  assert.match(runtime,/mountVideoWorkspaceV2/);
  assert.match(runtime,/full-video-workspace/);
  assert.match(workspace,/firstChunkSeconds:180/);
  assert.match(workspace,/durationSeconds-firstEnd/);
  assert.match(workspace,/data-video-sentence-index/);
  assert.match(workspace,/VocabMasterSentenceLoop\.open/);
  assert.match(workspace,/Đang lấy toàn bộ transcript/);
  assert.match(css,/grid-template-columns:minmax\(0,1\.7fr\)/);
  assert.match(css,/\.v10-transcript-row\.active/);
});
