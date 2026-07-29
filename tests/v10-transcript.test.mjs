import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYouTubeVideoId,transcriptCacheKey } from '../src/transcript-resolver-v2.js';

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

test('server yt-dlp resolver is subtitle-only and never requests audio extraction',async()=>{
  const source=await readFile(resolve(root,'server/transcript-resolver.mjs'),'utf8');
  assert.match(source,/--skip-download/);
  assert.match(source,/subtitles/);
  assert.match(source,/automatic_captions/);
  assert.doesNotMatch(source,/--extract-audio|\s-x['"\s,]/);
  assert.doesNotMatch(source,/ffmpeg|audio-only|bestaudio/);
});

test('client resolver uses cache/provider race before Gemini fallback',async()=>{
  const source=await readFile(resolve(root,'src/transcript-resolver-v2.js'),'utf8');
  const fast=source.indexOf("providers=['indexeddb','shared-cache','local-companion','backend-provider']");
  const fallback=source.indexOf('geminiProvider(context)');
  assert.ok(fast>=0);
  assert.ok(fallback>fast);
  assert.match(source,/firstChunkSeconds=60/);
  assert.match(source,/continueTranscriptProgressively/);
});
