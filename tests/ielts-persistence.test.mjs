import test from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

globalThis.indexedDB=indexedDB;
globalThis.IDBKeyRange=IDBKeyRange;

const persistence=await import(`../src/ielts-persistence.js?test=${Date.now()}`);
const { IELTS_STORE_NAMES }=await import('../src/ielts-domain.js');

async function reset(){await persistence.clearIeltsData();}

test('IELTS database creates all phase stores',async()=>{
  await reset();const status=await persistence.initializeIeltsPersistence();
  for(const name of Object.values(IELTS_STORE_NAMES))assert.ok(Object.hasOwn(status.counts,name),`missing ${name}`);
});

test('Error Notebook deduplicates concurrent-equivalent errors and keeps evidence',async()=>{
  await reset();
  const first=await persistence.upsertErrorRecord({category:'collocation',prompt:'Use the phrase',learnerResponse:'economy growth',expectedResponse:'economic growth',correction:'economic growth',explanation:'Adjective + noun.',linkedCardIds:['card-1'],sourceRef:{type:'reading',sourceId:'p1',subId:'q1'},now:100});
  const second=await persistence.upsertErrorRecord({category:'collocation',prompt:'Another source',learnerResponse:'Economy growth!',expectedResponse:'Economic growth',linkedCardIds:['card-1'],sourceRef:{type:'media',sourceId:'m1',subId:'s1'},now:200});
  assert.equal(first.id,second.id);
  assert.equal(second.occurrenceCount,2);
  assert.equal(second.lastSeenAt,200);
  const rows=await persistence.listIeltsRecords(IELTS_STORE_NAMES.errors);assert.equal(rows.length,1);assert.equal(rows[0].learnerResponse.trim().toLowerCase().startsWith('economy'),true);
  const resolved=await persistence.setErrorStatus(rows[0].id,'resolved');assert.equal(resolved.status,'resolved');assert.ok(resolved.lastResolvedAt);
});

test('lexical, paraphrase and reading entities persist as real records',async()=>{
  await reset();
  await persistence.saveIeltsRecord(IELTS_STORE_NAMES.lexicalSets,{id:'set-1',name:'Trends',description:'Context',functions:['describe trends'],register:'formal',commonMistakes:['Do not overstate.'],productionTask:'Write three sentences.',itemIds:['c1','c2','c3'],status:'active',suggestedEntries:[{term:'reach a peak'}],updatedAt:1});
  await persistence.saveLabItem({id:'lab-1',kind:'paraphrase',prompt:'Choose',context:'Source',status:'verified',provenance:{status:'verified'},options:[{id:'a',text:'Correct',correct:true,rationale:'Same meaning.'},{id:'b',text:'Wrong',correct:false,rationale:'Changes degree.'}]});
  const passage='Cities need reliable public transport because it connects residents with work, education and essential services. When routes are infrequent, people may depend on private cars even when they would prefer a cheaper alternative. This can increase congestion and make journey times less predictable. Expanding a network, however, is not enough by itself. Services must also operate at useful times and remain affordable for low-income passengers. Some planners therefore recommend combining new routes with integrated tickets and clear passenger information. Such measures do not remove every transport problem, but they can make the system easier to use and reduce unnecessary car journeys over time.';
  await persistence.saveReadingPassage({id:'read-1',title:'Transport',passage,microSkill:'evidence matching',status:'verified',provenance:{status:'verified'},questions:[{id:'q1',type:'evidence-match',prompt:'What is required besides expansion?',evidenceText:'Services must also operate at useful times and remain affordable for low-income passengers.',explanation:'The sentence states two operating conditions.',options:[{id:'a',text:'Useful schedules and affordable fares',correct:true,rationale:'Matches the evidence.'},{id:'b',text:'Only more private cars',correct:false,rationale:'Contradicts the passage.'}]} ,{id:'q2',type:'main-idea',prompt:'What is the main point?',evidenceText:'Expanding a network, however, is not enough by itself.',explanation:'Quality and access matter as well as size.',options:[{id:'a',text:'Network size alone is insufficient',correct:true,rationale:'Matches the writer’s argument.'},{id:'b',text:'All transport problems can be removed',correct:false,rationale:'The passage explicitly rejects this.'}]}]});
  assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.lexicalSets)).length,1);
  assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.labItems)).length,1);
  assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.readingPassages)).length,1);
  await persistence.saveReadingAttempt({passageId:'read-1',answers:[{questionId:'q1',correct:true}],score:.5,evidence:['Services must also operate']});
  assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.readingAttempts))[0].passageId,'read-1');
});

test('media source, transcript, attempts and 20-minute progress survive reload reads',async()=>{
  await reset();
  const source=await persistence.saveMediaSource({id:'media-1',url:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',title:'Test video',durationMs:1_200_000,transcriptStatus:'needs-review'});
  assert.equal((await persistence.findMediaByVideoId('dQw4w9WgXcQ')).id,source.id);
  await persistence.saveTranscriptionJob({id:'job-1',mediaSourceId:source.id,cacheKey:'cache-1',model:'gemini-test',status:'processing'});
  const saved=await persistence.replaceTranscriptSegments(source.id,[{id:'s1',startMs:0,endMs:5000,text:'First sentence.',status:'verified'},{id:'s2',startMs:5000,endMs:10000,text:'Second sentence.',status:'needs-review'}],{durationMs:source.durationMs});
  assert.equal(saved.segments.length,2);
  assert.deepEqual((await persistence.listTranscriptSegments(source.id)).map(row=>row.id),['s1','s2']);
  await persistence.saveMediaAttempt({id:'attempt-1',mediaSourceId:source.id,segmentId:'s1',mode:'shadowing',result:'coaching',evidenceDecisions:[{affectsSchedule:false,reason:'shadowing-is-imitation'}]});
  await persistence.saveMediaProgress({mediaSourceId:source.id,lastSegmentId:'s2',lastPositionMs:9000,completedSegmentIds:['s1'],weakSegmentIds:['s2'],sessionMinutes:20,playbackRate:.75});
  const progress=await persistence.getMediaProgress(source.id);assert.equal(progress.sessionMinutes,20);assert.equal(progress.lastSegmentId,'s2');assert.deepEqual(progress.weakSegmentIds,['s2']);
  assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.mediaAttempts))[0].mode,'shadowing');
});

test('IELTS backup restores all stores and warns about orphan transcript links',async()=>{
  await reset();
  await persistence.upsertErrorRecord({id:'e1',category:'spelling',learnerResponse:'enviroment',expectedResponse:'environment'});
  await persistence.saveMediaSource({id:'m1',url:'https://youtu.be/dQw4w9WgXcQ',title:'Video',durationMs:20_000});
  await persistence.replaceTranscriptSegments('m1',[{id:'s1',startMs:0,endMs:3000,text:'Environment matters.'}],{durationMs:20_000});
  await persistence.saveMediaProgress({mediaSourceId:'m1',lastSegmentId:'s1',sessionMinutes:20});
  const backup=await persistence.buildIeltsBackup();assert.equal(backup.schemaVersion,3);assert.equal(backup.stores.errorRecords.length,1);assert.equal(backup.stores.transcriptSegments.length,1);assert.deepEqual(backup.stores.learnerArtifacts,[]);
  await reset();assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.errors)).length,0);
  const restored=await persistence.restoreIeltsBackup(backup);assert.equal(restored.valid,true);assert.equal((await persistence.listIeltsRecords(IELTS_STORE_NAMES.errors))[0].expectedResponse,'environment');assert.equal((await persistence.listTranscriptSegments('m1'))[0].text,'Environment matters.');
  const orphan=structuredClone(backup);orphan.stores.mediaSources=[];const validation=persistence.validateIeltsBackup(orphan);assert.equal(validation.valid,true);assert.ok(validation.warnings.some(message=>message.includes('tham chiếu media source không tồn tại')));
});

test('invalid verified content cannot be persisted through guarded APIs',async()=>{
  await reset();
  await assert.rejects(()=>persistence.saveLabItem({id:'bad',status:'verified',provenance:{status:'verified'},prompt:'Pick',options:[{id:'a',text:'One',correct:true,rationale:''},{id:'b',text:'Two',correct:true,rationale:''}]}),/đúng một đáp án|thiếu giải thích/);
  await assert.rejects(()=>persistence.saveReadingPassage({id:'bad-reading',status:'verified',provenance:{status:'verified'},passage:'short',questions:[]}),/80–220|2–4/);
});
