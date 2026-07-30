import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { parseTranscriptImport,importTranscriptRescue } from '../src/transcript-import.js';
import { getTranscriptAggregate } from '../src/transcript-aggregate.js';
import { validateWorkspaceAggregate,validateWorkspaceCache } from '../src/video-workspace-v2.js';

test('SRT and VTT imports are validated into private unverified segments',async()=>{
  const srt='1\n00:00:00,000 --> 00:00:02,000\nFirst sentence.\n\n2\n00:00:02,000 --> 00:00:05,000\nSecond sentence.';
  const parsed=parseTranscriptImport({text:srt,format:'srt'});assert.equal(parsed.segments.length,2);assert.equal(parsed.private,true);assert.equal(parsed.verified,false);
  const row=await importTranscriptRescue({text:srt,format:'srt',videoId:'import-phase5',title:'Private import'}),aggregate=await getTranscriptAggregate(row.transcriptRevisionId);
  assert.equal(aggregate.source.namespace,'private');assert.equal(aggregate.source.status,'unverified');assert.equal(aggregate.revision.status,'unverified');assert.equal(aggregate.segments.every(segment=>segment.status==='unverified'),true);
});

test('timingless text is explicitly unaligned and cannot enter timing-dependent activity',async()=>{
  const parsed=parseTranscriptImport({text:'First sentence.\nSecond sentence.',format:'text'});assert.deepEqual(parsed.segments.map(row=>[row.startMs,row.endMs]),[[0,4000],[4000,8000]]);assert.equal(parsed.aligned,false);assert.equal(parsed.segments.every(row=>row.aligned===false),true);
  const row=await importTranscriptRescue({text:'First sentence.\nSecond sentence.',format:'text',videoId:'phase5-unaligned'}),aggregate=await getTranscriptAggregate(row.transcriptRevisionId);
  assert.equal(row.aligned,false);assert.equal(row.qualityStatus,'unaligned');assert.equal(aggregate.revision.provenance.aligned,false);
  assert.equal(validateWorkspaceCache(row).code,'TRANSCRIPT_UNALIGNED');
  assert.equal(validateWorkspaceAggregate(aggregate).code,'TRANSCRIPT_UNALIGNED');
});

test('malformed, overlapping and duplicate timed imports fail closed',()=>{
  assert.throws(()=>parseTranscriptImport({text:'1\nnot-a-time --> 00:00:01,000\nBad',format:'srt'}),error=>error.code==='IMPORT_INVALID');
  assert.throws(()=>parseTranscriptImport({text:'00:00:00,000 --> 00:00:03,000\nOne\n\n00:00:02,000 --> 00:00:04,000\nTwo',format:'srt'}),error=>error.code==='IMPORT_OVERLAP');
  assert.throws(()=>parseTranscriptImport({text:'00:00:00,000 --> 00:00:02,000\nSame\n\n00:00:00,000 --> 00:00:02,000\nSame',format:'srt'}),error=>error.code==='IMPORT_DUPLICATE');
});
