import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createErrorRecord,mergeErrorRecords,resolveIeltsEvidence,validateLexicalSet,validateLabItem,validateReadingPassage,
  parseYouTubeUrl,validateTranscriptSegments,splitTranscriptSegment,mergeTranscriptSegments,diffWords,planMediaSession,validateRetellFeedback
} from '../src/ielts-domain.js';
import { CURATED_LEXICAL_SETS,CURATED_PARAPHRASE_ITEMS,CURATED_READING_PASSAGES } from '../src/ielts-content.js';

test('error records keep complete evidence and deterministic dedupe keys',()=>{
  const first=createErrorRecord({category:'collocation',prompt:'Choose a phrase',learnerResponse:'economy growth',expectedResponse:'economic growth',correction:'economic growth',explanation:'Use adjective + noun.',linkedCardIds:['economic-growth'],sourceRef:{type:'reading',sourceId:'p1',subId:'q1'},now:100});
  const second=createErrorRecord({category:'collocation',learnerResponse:' Economy  growth! ',expectedResponse:'Economic growth',linkedCardIds:['economic-growth'],sourceRef:{type:'media',sourceId:'different-source'},now:200});
  assert.equal(first.normalizedKey,second.normalizedKey);
  const merged=mergeErrorRecords(first,second);
  assert.equal(merged.occurrenceCount,2);
  assert.equal(merged.firstSeenAt,100);
  assert.equal(merged.lastSeenAt,200);
  assert.deepEqual(merged.linkedCardIds,['economic-growth']);
  assert.equal(merged.learnerResponse.trim().toLowerCase().startsWith('economy'),true);
});

test('resolved repeated errors reopen as monitoring instead of duplicating',()=>{
  const first=createErrorRecord({category:'spelling',learnerResponse:'enviroment',expectedResponse:'environment',status:'resolved',occurrenceCount:4,now:100});
  const merged=mergeErrorRecords(first,createErrorRecord({category:'spelling',learnerResponse:'enviroment',expectedResponse:'environment',now:200}));
  assert.equal(merged.status,'monitoring');
  assert.equal(merged.occurrenceCount,5);
});

test('IELTS evidence adapter requires canonical attempt and activity contracts',()=>{
  assert.equal(resolveIeltsEvidence({activityType:'dictation',targetCardId:'c1',verified:true,independent:true,result:'correct'}).affectsSchedule,false,'legacy caller claims must fail closed');
  const activitySpec={id:'ielts-dictation-1',type:'dictation',target:{cardId:'c1',skill:'listening',sourceId:'media-1',sourceRevision:'rev-1'}};
  const attempt={id:'attempt-1',activityId:activitySpec.id,receiptId:'receipt-1',activityType:'dictation',result:'wrong',target:{...activitySpec.target},assistance:{id:'trace-1',schemaVersion:1,collector:'ielts-lab',complete:true},errorType:'listening'};
  const verification={source:{id:'source-receipt-1',authority:'ielts-source-registry',status:'verified',sourceId:'media-1',sourceRevision:'rev-1'}};
  const decision=resolveIeltsEvidence({attempt,activitySpec,verification});
  assert.equal(decision.affectsSchedule,true);assert.equal(decision.rating,'again');assert.equal(decision.successful,false);assert.equal(decision.skill,'listening');
  assert.equal(resolveIeltsEvidence({attempt:{...attempt,assistance:{...attempt.assistance,transcriptViewed:true}},activitySpec,verification}).affectsSchedule,false);
});

test('every curated lexical set contains IELTS production metadata',()=>{
  assert.ok(CURATED_LEXICAL_SETS.length>=6);
  for(const set of CURATED_LEXICAL_SETS){
    const itemIds=set.suggestedEntries.slice(0,3).map((_,index)=>`${set.id}-${index}`);
    const result=validateLexicalSet({...set,itemIds});
    assert.equal(result.valid,true,result.errors.join(' '));
    assert.ok(set.suggestedEntries.every(item=>item.context&&item.register&&item.commonMistake&&item.function&&item.productionPrompt));
  }
});

test('paraphrase and distractor items require exactly one answer and rationales',()=>{
  for(const item of CURATED_PARAPHRASE_ITEMS)assert.equal(validateLabItem(item).valid,true);
  const ambiguous=validateLabItem({prompt:'Pick',context:'Context',status:'verified',provenance:{status:'verified'},options:[{id:'a',text:'One',correct:true,rationale:'A'},{id:'b',text:'Two',correct:true,rationale:'B'}]});
  assert.equal(ambiguous.valid,false);
  assert.match(ambiguous.errors.join(' '),/đúng một đáp án/);
  const missingRationale=validateLabItem({prompt:'Pick',context:'Context',options:[{id:'a',text:'One',correct:true,rationale:''},{id:'b',text:'Two',correct:false,rationale:'Wrong'}]});
  assert.equal(missingRationale.valid,false);
});

test('curated reading has bounded passage, evidence and distractor explanations',()=>{
  for(const passage of CURATED_READING_PASSAGES){const result=validateReadingPassage(passage);assert.equal(result.valid,true,result.errors.join(' '));}
  const invalid=validateReadingPassage({passage:'too short',questions:[]});
  assert.equal(invalid.valid,false);
  assert.match(invalid.errors.join(' '),/80–220/);
});

test('YouTube URL parser normalizes supported forms and rejects lookalikes',()=>{
  const id='dQw4w9WgXcQ';
  for(const url of [`https://www.youtube.com/watch?v=${id}&t=1m2s`,`https://youtu.be/${id}?t=62`,`https://youtube.com/shorts/${id}`,`https://youtube-nocookie.com/embed/${id}`]){
    const parsed=parseYouTubeUrl(url);assert.equal(parsed.valid,true,url);assert.equal(parsed.videoId,id);assert.equal(parsed.canonicalUrl,`https://www.youtube.com/watch?v=${id}`);
  }
  assert.equal(parseYouTubeUrl('https://example.com/watch?v=dQw4w9WgXcQ').valid,false);
  assert.equal(parseYouTubeUrl('javascript:alert(1)').valid,false);
  assert.equal(parseYouTubeUrl('https://youtube.com/watch?v=short').valid,false);
  assert.equal(parseYouTubeUrl(`https://youtu.be/${id}?t=1m2s`).startSeconds,62);
});

test('transcript validator blocks invalid timelines and supports split merge',()=>{
  const rows=[{id:'s1',mediaSourceId:'m1',startMs:0,endMs:5000,text:'This is the first sentence.',status:'verified'},{id:'s2',mediaSourceId:'m1',startMs:5000,endMs:10000,text:'This is the second sentence.',status:'verified'}];
  const result=validateTranscriptSegments(rows,{durationMs:12_000});assert.equal(result.valid,true,result.errors.join(' '));
  const [left,right]=splitTranscriptSegment(rows[0],2500);assert.equal(left.endMs,2500);assert.equal(right.startMs,2500);assert.ok(left.text&&right.text);
  const merged=mergeTranscriptSegments(left,right);assert.equal(merged.startMs,0);assert.equal(merged.endMs,5000);assert.match(merged.text,/first sentence/);
  const beyond=validateTranscriptSegments([{id:'x',startMs:0,endMs:20_000,text:'Too long for duration'}],{durationMs:10_000});assert.equal(beyond.valid,false);
  const repeated=validateTranscriptSegments([0,1,2].map(index=>({id:`r${index}`,startMs:0,endMs:900,text:'same'})));assert.equal(repeated.valid,false);
});

test('dictation word diff exposes missing, extra and replacement tokens',()=>{
  const result=diffWords('economic growth has slowed','economy growth slowed');
  assert.ok(result.accuracy<1);
  assert.ok(result.operations.some(row=>row.type==='replace'));
  assert.ok(result.operations.some(row=>row.type==='missing'));
});

test('media session defaults to twenty minutes and unlocks retell after comprehension work',()=>{
  const fresh=planMediaSession({availableSegments:40,completedSegments:0});assert.equal(fresh.minutes,20);assert.equal(fresh.retellSegments,0);assert.ok(fresh.dictationSegments>=8);
  const progressed=planMediaSession({minutes:20,availableSegments:40,completedSegments:12,weakSegments:3});assert.equal(progressed.retellSegments,1);assert.ok(progressed.dictationSegments>fresh.dictationSegments);
  assert.equal(planMediaSession({minutes:5,availableSegments:10}).minutes,20);
});

test('retell feedback rejects synthetic IELTS band scores',()=>{
  const safe=validateRetellFeedback({feedback:'Bạn đã nêu ý chính.',mainIdeas:[],targetAssessments:[],lexicalGaps:[],errors:[]});assert.equal(safe.valid,true);
  const unsafe=validateRetellFeedback({feedback:'Estimated IELTS band 7.0',mainIdeas:[],targetAssessments:[],lexicalGaps:[],errors:[]});assert.equal(unsafe.valid,false);assert.match(unsafe.errors.join(' '),/band score/);
});
