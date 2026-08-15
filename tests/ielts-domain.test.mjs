import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as domain from '../src/ielts-domain.js';
import { CURATED_LEXICAL_SETS,CURATED_PARAPHRASE_ITEMS,CURATED_READING_PASSAGES } from '../src/ielts-content.js';

const {
  createErrorRecord,mergeErrorRecords,resolveIeltsEvidence,buildIeltsEvidenceEnvelope,ieltsSourceRevision,sanitizeMediaAttempt,validateLexicalSet,validateLabItem,validateReadingPassage,
  parseYouTubeUrl,validateTranscriptSegments,splitTranscriptSegment,mergeTranscriptSegments,diffWords,planMediaSession,validateRetellFeedback,
  IELTS_TRACKS,validateIeltsTrack,normalizeIeltsTrack,IELTS_PRACTICE_HIERARCHY_LEVELS,
  IELTS_TEST_BLUEPRINT_KIND,IELTS_TEST_BLUEPRINT_VERSION,IELTS_SECTION_BLUEPRINT_KIND,IELTS_SECTION_BLUEPRINT_VERSION,
  createIeltsTestBlueprint,validateIeltsTestBlueprint,createIeltsSectionBlueprint,validateIeltsSectionBlueprint,ieltsBlueprintId,
  IELTS_TEST_RUN_KIND,IELTS_TEST_RUN_VERSION,IELTS_RUN_STATUSES,createIeltsTestRun,validateIeltsTestRun
} = domain;

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

test('IELTS coaching envelopes retain canonical denied evidence without fabricating evaluation',()=>{
  const sourceRevision=ieltsSourceRevision('segment',{id:'s1',text:'A verified transcript.',updatedAt:10});
  const envelope=buildIeltsEvidenceEnvelope({
    activityId:'ielts-dictation:s1',receiptId:'receipt:s1',activityType:'dictation',cardId:'card-1',skill:'listening',
    sourceId:'segment:s1',sourceRevision,result:'correct',learnerOutput:'A verified transcript.',sourceVerified:true,
    assistance:{coaching:true,transcriptViewed:true,answerExposed:true}
  });
  assert.equal(envelope.decision.affectsSchedule,false);
  assert.equal(envelope.decision.reason,'assistance-exposed');
  assert.equal(envelope.verification.evaluation,undefined);
  const saved=sanitizeMediaAttempt({mediaSourceId:'media-1',segmentId:'s1',mode:'dictation',result:'correct',evidenceAttempts:[envelope],evidenceDecisions:[envelope.decision]});
  assert.equal(saved.evidenceAttempts[0].attempt.receiptId,'receipt:s1');
  assert.equal(saved.evidenceDecisions[0].affectsSchedule,false);
  assert.notEqual(sourceRevision,ieltsSourceRevision('segment',{id:'s1',text:'A changed transcript.',updatedAt:11}));
  const failedRetell=sanitizeMediaAttempt({mediaSourceId:'media-1',segmentId:'s1',mode:'retell',learnerResponse:'Durable output',result:'coaching',evaluationStatus:'failed',evaluationError:'provider timeout'});
  assert.equal(failedRetell.learnerResponse,'Durable output');
  assert.equal(failedRetell.evaluationStatus,'failed');
  assert.equal(failedRetell.evaluationError,'provider timeout');
});

test('revealed correction and unverified transcript cannot create independent evidence',()=>{
  const correction=buildIeltsEvidenceEnvelope({activityId:'repair:1',receiptId:'repair-receipt:1',activityType:'error-correction',cardId:'card-1',skill:'production',sourceId:'error:1',sourceRevision:'error-rev:1',result:'correct',learnerOutput:'corrected answer',sourceVerified:true,assistance:{correctionExposed:true,answerExposed:true,coaching:true}});
  assert.equal(correction.decision.affectsSchedule,false);
  assert.equal(correction.decision.reason,'assistance-exposed');
  const unverified=buildIeltsEvidenceEnvelope({activityId:'dictation:2',receiptId:'dictation-receipt:2',activityType:'dictation',cardId:'card-1',skill:'listening',sourceId:'segment:2',sourceRevision:'segment-rev:2',result:'correct',learnerOutput:'answer',sourceVerified:false});
  assert.equal(unverified.decision.affectsSchedule,false);
  assert.equal(unverified.decision.reason,'source-is-not-verified');
});

test('error record merge keeps bounded coaching evidence audit trail',()=>{
  const base={category:'meaning',learnerResponse:'wrong',expectedResponse:'right',linkedCardIds:['card-1']};
  const first=createErrorRecord({...base,evidenceAttempts:[{attempt:{receiptId:'repair-1'},decision:{affectsSchedule:false}}],now:1});
  const second=createErrorRecord({...base,evidenceAttempts:[{attempt:{receiptId:'repair-2'},decision:{affectsSchedule:false}}],now:2});
  const merged=mergeErrorRecords(first,second);
  assert.deepEqual(merged.evidenceAttempts.map(row=>row.attempt.receiptId),['repair-1','repair-2']);
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

test('IELTS track domain defines academic and general-training and fails closed on invalid tracks',()=>{
  assert.ok(Array.isArray(IELTS_TRACKS),'IELTS_TRACKS must be an array');
  assert.deepEqual([...IELTS_TRACKS].sort(),['academic','general-training']);
  assert.equal(validateIeltsTrack('academic').valid,true);
  assert.equal(validateIeltsTrack('general-training').valid,true);
  assert.equal(validateIeltsTrack('invalid-track').valid,false);
  assert.equal(validateIeltsTrack('').valid,false);
  assert.equal(validateIeltsTrack(null).valid,false);
  assert.equal(normalizeIeltsTrack('academic'),'academic');
  assert.equal(normalizeIeltsTrack('general-training'),'general-training');
  assert.equal(normalizeIeltsTrack('other'),null);
});

test('IELTS practice hierarchy levels contain all 4 Stage 2 practice granularities',()=>{
  assert.ok(Array.isArray(IELTS_PRACTICE_HIERARCHY_LEVELS),'IELTS_PRACTICE_HIERARCHY_LEVELS must be an array');
  assert.deepEqual([...IELTS_PRACTICE_HIERARCHY_LEVELS],['TASK_FAMILY','PART_OR_SECTION','SKILL_TEST','FULL_MOCK']);
});

test('synthetic test blueprints validate against IELTS blueprint schema v1',async()=>{
  const raw=await readFile(new URL('./fixtures/synthetic-ielts-blueprints.json',import.meta.url),'utf8');
  const blueprints=JSON.parse(raw);
  assert.ok(Array.isArray(blueprints));
  assert.equal(blueprints.length,2);
  for(const bp of blueprints){
    const validation=validateIeltsTestBlueprint(bp);
    assert.equal(validation.valid,true,validation.errors?.join('\n'));
    assert.equal(bp.kind,IELTS_TEST_BLUEPRINT_KIND);
    assert.equal(bp.schemaVersion,IELTS_TEST_BLUEPRINT_VERSION);
    assert.ok(IELTS_TRACKS.includes(bp.track));
    assert.ok(IELTS_PRACTICE_HIERARCHY_LEVELS.includes(bp.hierarchyLevel));
    assert.ok(Array.isArray(bp.sections)&&bp.sections.length>0);
    for(const section of bp.sections){
      const secValidation=validateIeltsSectionBlueprint(section);
      assert.equal(secValidation.valid,true,secValidation.errors?.join('\n'));
      assert.equal(section.kind,IELTS_SECTION_BLUEPRINT_KIND);
      assert.equal(section.schemaVersion,IELTS_SECTION_BLUEPRINT_VERSION);
    }
  }
});

test('IELTS test blueprint validation rejects invalid schema, track, hierarchy, or missing sections',()=>{
  assert.equal(validateIeltsTestBlueprint(null).valid,false);
  assert.equal(validateIeltsTestBlueprint({}).valid,false);
  assert.equal(validateIeltsTestBlueprint({kind:'wrong-kind'}).valid,false);
  assert.equal(validateIeltsTestBlueprint({kind:IELTS_TEST_BLUEPRINT_KIND,schemaVersion:99}).valid,false);
  assert.equal(validateIeltsTestBlueprint({kind:IELTS_TEST_BLUEPRINT_KIND,schemaVersion:1,track:'invalid'}).valid,false);
  assert.equal(validateIeltsTestBlueprint({kind:IELTS_TEST_BLUEPRINT_KIND,schemaVersion:1,track:'academic',hierarchyLevel:'INVALID'}).valid,false);
  assert.equal(validateIeltsTestBlueprint({kind:IELTS_TEST_BLUEPRINT_KIND,schemaVersion:1,track:'academic',hierarchyLevel:'FULL_MOCK',sections:[]}).valid,false);
});

test('IELTS section blueprint validation rejects invalid skill, order, or sourceRevisionRef',()=>{
  assert.equal(validateIeltsSectionBlueprint(null).valid,false);
  assert.equal(validateIeltsSectionBlueprint({}).valid,false);
  assert.equal(validateIeltsSectionBlueprint({kind:'wrong-kind'}).valid,false);
  assert.equal(validateIeltsSectionBlueprint({kind:IELTS_SECTION_BLUEPRINT_KIND,schemaVersion:1,skill:'invalid-skill'}).valid,false);
  assert.equal(validateIeltsSectionBlueprint({kind:IELTS_SECTION_BLUEPRINT_KIND,schemaVersion:1,skill:'reading',order:0}).valid,false);
  assert.equal(validateIeltsSectionBlueprint({kind:IELTS_SECTION_BLUEPRINT_KIND,schemaVersion:1,skill:'reading',order:1,sourceRevisionRef:null}).valid,false);
});

test('IELTS test run lifecycle separates blueprint, run, checkpoint, and completed attempt with invariant affectsSchedule: false',()=>{
  const run=createIeltsTestRun({
    blueprintId:'ielts-blueprint:0000000000000000000000000000000000000000000000000000000000000001',
    track:'academic',
    hierarchyLevel:'FULL_MOCK',
    status:'active'
  });
  assert.equal(run.kind,IELTS_TEST_RUN_KIND);
  assert.equal(run.schemaVersion,IELTS_TEST_RUN_VERSION);
  assert.equal(run.status,'active');
  assert.equal(run.affectsSchedule,false,'Active test run must not affect schedule');
  assert.equal(run.evidenceEligible,false,'Active test run must not be evidence eligible');
  assert.ok(run.id.startsWith('ielts-run:'));
  assert.ok(run.checkpoint!==undefined);
  assert.equal(run.checkpoint.elapsedSeconds,0);

  const validation=validateIeltsTestRun(run);
  assert.equal(validation.valid,true,validation.errors?.join('\n'));

  // Test run validation rejects schedule/evidence mutation on non-finalized runs
  const illegalScheduleRun={...run,affectsSchedule:true};
  assert.equal(validateIeltsTestRun(illegalScheduleRun).valid,false,'Active checkpoint must reject affectsSchedule: true');
  const illegalEvidenceRun={...run,evidenceEligible:true};
  assert.equal(validateIeltsTestRun(illegalEvidenceRun).valid,false,'Active checkpoint must reject evidenceEligible: true');
});

test('deterministic blueprint ID calculation produces consistent sha256 identifier',()=>{
  const id1=ieltsBlueprintId({track:'academic',title:'Test Mock 1'});
  const id2=ieltsBlueprintId({track:'academic',title:'Test Mock 1'});
  assert.equal(id1,id2);
  assert.match(id1,/^ielts-blueprint:[a-f0-9]{64}$/);
});
