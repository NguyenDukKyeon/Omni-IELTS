import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { indexedDB,IDBKeyRange } from 'fake-indexeddb';
globalThis.indexedDB=indexedDB;globalThis.IDBKeyRange=IDBKeyRange;
import { createSourceRevisionRef } from '../src/source-revision-ref.js';
import { createObjectiveMatchingResponseOwnerAdapter,createObjectiveMatchingResponseQuestion,scoreObjectiveMatchingResponse } from '../src/objective-matching-response.js';
import { learningContractDigest } from '../src/learning-contracts.js';
import { __testing as listeningUiTesting,createControlledListeningSpatialProof } from '../src/listening-value-slice-ui.js';
import { buildCombinedBackup,restoreCombinedBackup,validateCombinedBackup } from '../src/ielts-backup.js';
import { canonicalBackupDigest,sha256Hex } from '../src/backup-registry.js';
import { V10_STORES } from '../src/v10-contracts.js';
import { getV10Record,putV10Record,deleteV10Record,reopenV10Database } from '../src/v10-persistence.js';
import { IELTS_STORE_NAMES } from '../src/ielts-domain.js';
import { getIeltsObjectiveInventoryItem,listIeltsObjectiveInventoryItems,reopenIeltsDatabase,__testing as ieltsTesting } from '../src/ielts-persistence.js';
import { getTranscriptAggregate } from '../src/transcript-aggregate.js';

const fixture=JSON.parse(await readFile(new URL('./fixtures/wave4-listening-spatial-fixture.json',import.meta.url),'utf8'));
const responseFor=(item,name)=>({slots:item.slots.map((slot,index)=>({slotId:slot.id,optionId:{correct:index===0?'low':'high',partial:index===0?'low':null,wrong:index===0?'high':'low',null:null}[name]}))});

function recomputeBackupIntegrity(envelope){
  for(const entry of envelope.manifest.stores){
    if(entry.backupRule==='exclude')continue;
    const rows=envelope.domains[entry.owner].stores[entry.store];
    entry.recordCount=rows.length;
    entry.contentDigest=`sha256:${sha256Hex(JSON.stringify(rows))}`;
  }
  envelope.payloadDigest=canonicalBackupDigest(envelope.domains);
  return envelope;
}

function fixtureReference(row){
  return createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'test-source',authority:'test-source',sourceId:row.sourceAnchor.sourceId,revisionId:row.sourceAnchor.revisionId,integrity:`sha256:${row.sourceAnchor.revisionId}`,locator:{},provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'},tombstone:null,extensions:{},display:null});
}

function exactQuestion(row,{reusePolicy=row.reusePolicy,slots=row.slots}={}){
  const source=fixtureReference(row),id=`ielts-objective:${String(fixture.definitions.indexOf(row)+1).repeat(64)}`,definition={id,kind:row.kind,prompt:row.prompt,slots:structuredClone(slots),options:structuredClone(row.options),reusePolicy,spatialPrompt:structuredClone(row.spatialPrompt),target:{schemaVersion:2,targetType:'ielts-objective-item',targetId:id,cardId:null,senseId:null,skill:'listening',sourceId:source.sourceId,sourceRevision:source.revisionId},sourceRevisionRef:source,createdAt:1,updatedAt:1};
  return createObjectiveMatchingResponseQuestion(definition,{ownerAdapter:createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>structuredClone(definition)})});
}

test('Listening spatial fixture freezes full transcript-bound canonical definitions and digest',()=>{
  assert.deepEqual(Object.keys(fixture).sort(),['approval','audio','claims','definitions','kind','manifestDigest','publication','scope','source','timestamps','transcript','version']);assert.equal(fixture.manifestDigest,'fnv1a64:5979:986e411faa7e7b36');assert.equal(fixture.definitions.length,3);assert.deepEqual(fixture.definitions.map(row=>row.spatialPrompt.mode),['plan','map','diagram']);for(const row of fixture.definitions){assert.equal(row.kind,'listening-plan-map-diagram-labelling');assert.equal(row.sourceAnchor.sourceId,fixture.transcript.sourceId);assert.equal(row.sourceAnchor.revisionId,fixture.transcript.revisionId);assert.equal(row.slots.length,2);assert.equal(row.spatialPrompt.anchors.length,row.slots.length);assert.equal(row.options.length,2);assert.equal(row.reusePolicy,'SINGLE_USE');}
});

test('Listening spatial fixture rejects recomputed containment and approval tampering',()=>{const tampered=structuredClone(fixture);tampered.claims.externalCopyrightedMedia=true;tampered.claims.projectCreatedMathematicalWaveform=false;tampered.approval.productionCatalog=true;const {manifestDigest,...manifest}=tampered;tampered.manifestDigest=learningContractDigest(manifest);assert.equal(listeningUiTesting.spatialFixture(tampered),null,'recomputed digest cannot authorize changed containment semantics');});

test('Listening spatial exact frozen definitions cover plan/map/diagram, response matrix, invalid zero-Run semantics, and ALLOW_REUSE',async()=>{
  for(const row of fixture.definitions){const question=exactQuestion(row);assert.equal(question.registryRevision,'qar-objective-spatial-matching-response-registry-v1');assert.deepEqual(question.item.spatialPrompt,row.spatialPrompt);assert.equal(JSON.stringify(question).includes('acceptedOptionId'),false);for(const [name,disposition] of [['correct','correct'],['partial','partial'],['wrong','wrong'],['null','wrong']]){const score=scoreObjectiveMatchingResponse(question,responseFor(question.item,name));assert.equal(score.valid,true,`${row.id}:${name}`);assert.equal(score.disposition,disposition,`${row.id}:${name}`);}const duplicate={slots:row.slots.map(slot=>({slotId:slot.id,optionId:'low'}))};assert.equal(scoreObjectiveMatchingResponse(question,duplicate).valid,false,`${row.id}:single-use`);assert.equal(scoreObjectiveMatchingResponse(question,{slots:[{slotId:row.slots[0].id,optionId:'not-an-option'},{slotId:row.slots[1].id,optionId:'high'}]}).valid,false,`${row.id}:invalid`);}
  const base=fixture.definitions[0],reusedSlots=base.slots.map((slot,index)=>({...slot,acceptedOptionId:'low'})),reusable=exactQuestion(base,{reusePolicy:'ALLOW_REUSE',slots:reusedSlots}),reused=scoreObjectiveMatchingResponse(reusable,{slots:reusedSlots.map(slot=>({slotId:slot.id,optionId:'low'}))});assert.equal(reused.valid,true);assert.equal(reused.disposition,'correct');
  const proof=await createControlledListeningSpatialProof({fixture}),opened=await proof.open(),item=opened.items.find(value=>value.spatialPrompt.mode==='plan'),before=await getV10Record(V10_STORES.todayRuns,`today-run:wave4-listening-matching:${item.id}`);await assert.rejects(proof.submit(item.id,{slots:item.slots.map(slot=>({slotId:slot.id,optionId:'low'}))}),error=>error.code==='QUESTION_ACTIVITY_RESPONSE_INVALID');assert.equal(await getV10Record(V10_STORES.todayRuns,`today-run:wave4-listening-matching:${item.id}`),before);
});

test('Listening spatial durable backup rejects inventory, prompt, and terminal tampering before mutation then restores exact source, owner, and authenticated first winner',async()=>{
  const proof=await createControlledListeningSpatialProof({fixture}),opened=await proof.open(),item=opened.items.find(value=>value.spatialPrompt.mode==='plan'),response=responseFor(item,'correct'),terminal=item.result?{result:item.result}:await proof.submit(item.id,response),run=await getV10Record(V10_STORES.todayRuns,terminal.result.runId),inventory=(await listIeltsObjectiveInventoryItems({skill:'listening',status:'verified'})).find(row=>row.id===item.id),aggregate=await getTranscriptAggregate(inventory.sourceRevisionRef.revisionId),backup=await buildCombinedBackup(),beforeDigest=(await buildCombinedBackup()).payloadDigest;
  assert.ok(run);assert.ok(inventory);assert.ok(aggregate);assert.equal(run.evidenceDecision.eligible,false);assert.equal(run.evidenceDecision.affectsSchedule,false);assert.equal(JSON.stringify(run).includes('acceptedOptionId'),false);assert.equal(JSON.stringify(run).includes('low tone'),false);assert.equal(JSON.stringify(terminal.result).includes('answerBindingDigest'),false);assert.deepEqual(terminal.result.selected,response.slots.map((slot,index)=>({slotId:slot.slotId,optionId:slot.optionId,optionLabel:index===0?'Low tone':'High tone'})));
  for(const mutate of [value=>value.domains.ielts.stores.objectiveInventory.find(row=>row.id===inventory.id).questionPayload.spatialPrompt.title='tampered',value=>value.domains.ielts.stores.objectiveInventory.find(row=>row.id===inventory.id).questionBinding.keyDigest='tampered',value=>value.domains.v10.stores.todayRuns.find(row=>row.id===run.id).envelope.receipt.metadata.questionResult.keyDigest='tampered']){const tampered=structuredClone(backup);mutate(tampered);await assert.rejects(restoreCombinedBackup(tampered),error=>error.code==='BACKUP_INVALID');assert.equal((await buildCombinedBackup()).payloadDigest,beforeDigest);}
  for(const mutate of [value=>value.domains.ielts.stores.objectiveInventory.find(row=>row.id===inventory.id).questionPayload.spatialPrompt.title='tampered-recomputed',value=>value.domains.ielts.stores.objectiveInventory.find(row=>row.id===inventory.id).questionBinding.keyDigest='tampered-recomputed',value=>value.domains.v10.stores.todayRuns.find(row=>row.id===run.id).envelope.receipt.metadata.questionResult.keyDigest='tampered-recomputed',value=>value.domains.v10.stores.todayRuns.find(row=>row.id===run.id).activitySpec.target.targetId='ielts-objective:missing-spatial-owner']){const recomputedTamper=recomputeBackupIntegrity(structuredClone(backup));mutate(recomputedTamper);recomputeBackupIntegrity(recomputedTamper);assert.equal(validateCombinedBackup(recomputedTamper).valid,false,'a recomputed outer digest cannot authenticate a tampered spatial owner or terminal');await assert.rejects(restoreCombinedBackup(recomputedTamper),error=>error.code==='BACKUP_INVALID');assert.equal((await buildCombinedBackup()).payloadDigest,beforeDigest);}
  await ieltsTesting.deleteOne(IELTS_STORE_NAMES.objectiveInventory,inventory.id);await deleteV10Record(V10_STORES.todayRuns,run.id,'wave4-listening-spatial-backup-delete');for(const segment of aggregate.segments)await deleteV10Record(V10_STORES.canonicalTranscriptSegments,segment.id,'wave4-listening-spatial-transcript-delete');await deleteV10Record(V10_STORES.transcriptRevisions,aggregate.revision.id,'wave4-listening-spatial-transcript-delete');await deleteV10Record(V10_STORES.transcriptSources,aggregate.source.id,'wave4-listening-spatial-transcript-delete');await reopenIeltsDatabase();await reopenV10Database();assert.equal(await getIeltsObjectiveInventoryItem(inventory.id),null);assert.equal(await getV10Record(V10_STORES.todayRuns,run.id),undefined);assert.equal(await getTranscriptAggregate(aggregate.revision.id),null);
  await restoreCombinedBackup(backup);await reopenIeltsDatabase();await reopenV10Database();assert.deepEqual(await getIeltsObjectiveInventoryItem(inventory.id),inventory);assert.deepEqual(await getV10Record(V10_STORES.todayRuns,run.id),run);assert.deepEqual(await getTranscriptAggregate(aggregate.revision.id),aggregate);
  const restored=await createControlledListeningSpatialProof({fixture}),reopened=await restored.open();assert.deepEqual(reopened.items.find(value=>value.id===item.id).result,terminal.result);assert.equal((await restored.submit(item.id,response)).result.runId,run.id);await assert.rejects(restored.submit(item.id,responseFor(item,'wrong')),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  const tamperedRun=structuredClone(run);tamperedRun.envelope.receipt.metadata.questionResult.keyDigest='tampered-live';await putV10Record(V10_STORES.todayRuns,tamperedRun,'wave4-listening-spatial-terminal-tamper');await assert.rejects((await createControlledListeningSpatialProof({fixture})).open(),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');await putV10Record(V10_STORES.todayRuns,run,'wave4-listening-spatial-terminal-recover');const recovered=await (await createControlledListeningSpatialProof({fixture})).open();assert.equal(recovered.items.find(value=>value.id===item.id).result.runId,run.id);
});
