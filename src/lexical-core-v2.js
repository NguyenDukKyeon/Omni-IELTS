import { sanitizeCardInput,cardIdentityKey,normalizeText } from './learning.js';
import { deleteCard,getCurrentState,persistCard } from './persistence.js';
import { V10_STORES,lemmaKey,senseKey,normalizeCaptureCandidate,normalizeSourceOccurrence } from './v10-contracts.js';
import { listV10Records,getV10Record,putV10Record } from './v10-persistence.js';
import { executeCrossDbIntent,reconcileCrossDbIntents } from './cross-db-reconciler.js';
import { assertCaptureFinalization,createCaptureItem,transitionCaptureItem } from './capture-domain.js';

function coreState(){return globalThis.VocabMasterApp?.getState?.()||{cards:[],settings:{learningGoal:'passive'}};}
function activeCards(){
  const cards=new Map([...(getCurrentState().cards||[]),...(coreState().cards||[])].map(card=>[card.id,card]));
  return[...cards.values()].filter(card=>!card.archivedAt);
}
function notifyCore(cards,reason='lexical-core-v2'){const current=coreState();globalThis.dispatchEvent(new CustomEvent('vocab:external-change',{detail:{reason,state:{...current,cards}}}));}

export function matchLexicalCards({term='',meaning='',type='',partOfSpeech=''}={}){
  const lemma=lemmaKey(term),sense=senseKey({term,meaning,partOfSpeech,type});
  return activeCards().map(card=>({card,lemma:lemmaKey(card.front),sense:senseKey({term:card.front,meaning:card.back,partOfSpeech:card.partOfSpeech||'',type:card.type})}))
    .filter(row=>row.lemma===lemma)
    .sort((a,b)=>(a.sense===sense?-2:0)-(b.sense===sense?-2:0)||normalizeText(a.card.back).localeCompare(normalizeText(b.card.back)))
    .map(row=>({...row.card,matchKind:row.sense===sense?'same-sense':'same-lemma'}));
}

export async function captureLexicalCandidate(input={},options={}){
  const matches=matchLexicalCards({term:input.term,meaning:input.proposedMeaning??input.meaning,type:input.proposedType??input.type,partOfSpeech:input.partOfSpeech});
  const exact=matches.find(card=>card.matchKind==='same-sense')||null;
  const candidate=createCaptureItem({...input,matchedCardIds:matches.map(card=>card.id),duplicateOfCardId:exact?.id||null,status:exact?'needs-review':input.status});
  candidate.sourceOccurrence={...candidate.sourceOccurrence,candidateId:candidate.id};
  await putV10Record(V10_STORES.captureCandidates,candidate,'capture-candidate-added',options);
  return candidate;
}

export async function listCaptureInbox({status=null}={}){
  const rows=await listV10Records(V10_STORES.captureCandidates,{sortBy:'updatedAt'});return status?rows.filter(row=>row.status===status):rows.filter(row=>!['linked','rejected'].includes(row.status));
}

export async function addSourceOccurrence(lexicalItemId,input={}){
  if(!lexicalItemId)throw new Error('Thiếu lexicalItemId.');
  const occurrence=normalizeSourceOccurrence({...input,lexicalItemId});
  const existing=await listV10Records(V10_STORES.sourceOccurrences,{index:'lexicalItemId',query:lexicalItemId,sortBy:'encounteredAt'});
  const duplicate=existing.find(row=>row.sourceType===occurrence.sourceType&&row.sourceId===occurrence.sourceId&&row.sourceSubId===occurrence.sourceSubId&&normalizeText(row.context)===normalizeText(occurrence.context));
  if(duplicate)return duplicate;
  await putV10Record(V10_STORES.sourceOccurrences,occurrence,'source-occurrence-added');return occurrence;
}

export async function listSourceOccurrences(lexicalItemId){return listV10Records(V10_STORES.sourceOccurrences,{index:'lexicalItemId',query:lexicalItemId,sortBy:'encounteredAt'});}

async function createCardFromCandidate(candidate,overrides={}){
  const current=coreState();const card=sanitizeCardInput({
    id:overrides.id,
    front:overrides.front??candidate.term,
    back:overrides.back??candidate.proposedMeaning,
    pronunciation:overrides.pronunciation??candidate.pronunciation,
    example:overrides.example??candidate.example??candidate.sourceOccurrence?.context,
    translation:overrides.translation??candidate.translation,
    sourceContext:candidate.sourceOccurrence?.context||'',
    deck:overrides.deck||'Cá nhân',
    cefr:overrides.cefr??candidate.cefr,
    type:['word','collocation'].includes(overrides.type??candidate.proposedType)?(overrides.type??candidate.proposedType):(candidate.term.includes(' ')?'collocation':'word'),
    learningGoal:overrides.learningGoal??candidate.proposedGoal??current.settings?.learningGoal,
    senseId:senseKey({term:overrides.front??candidate.term,meaning:overrides.back??candidate.proposedMeaning,partOfSpeech:overrides.partOfSpeech??candidate.partOfSpeech,type:overrides.type??candidate.proposedType}),
    provenance:{source:candidate.provenance?.source==='ai'?'ai':'manual',model:candidate.provenance?.model||'',generatedAt:candidate.provenance?.generatedAt||0,confirmedByUser:true,sourceContext:candidate.sourceOccurrence?.context||''}
  });
  if(!card.front||!card.back)throw new Error('Từ/cụm và nghĩa là bắt buộc.');
  const existing=activeCards().find(item=>item.id===card.id);
  if(existing)return existing;
  if(activeCards().some(item=>cardIdentityKey(item)===cardIdentityKey(card)))throw new Error('Thẻ cùng từ, nghĩa và loại đã tồn tại.');
  await persistCard(card,'v10-capture-finalized');notifyCore([card,...current.cards],'v10-capture-finalized');return card;
}

const captureIntentHandlers=Object.freeze({
  'ensure-card':async({payload})=>{
    const candidate=payload.candidate;
    const card=payload.action==='link'
      ?activeCards().find(item=>item.id===payload.targetCardId)
      :await createCardFromCandidate(candidate,{...payload.overrides,id:payload.targetCardId});
    if(!card)throw Object.assign(new Error('Không tìm thấy card để liên kết.'),{code:'CROSS_DB_CORE_CARD_MISSING'});
    return{context:{cardId:card.id}};
  },
  'ensure-occurrence':async({payload,context})=>{
    if(!context.cardId)throw Object.assign(new Error('Intent chưa có cardId từ step trước.'),{code:'CROSS_DB_CONTEXT_MISSING'});
    const occurrence=await addSourceOccurrence(context.cardId,{...payload.candidate.sourceOccurrence,candidateId:payload.candidate.id,verified:true});
    return{context:{occurrenceId:occurrence.id}};
  },
  'link-candidate':async({payload,context})=>{
    const candidate=await getV10Record(V10_STORES.captureCandidates,payload.candidate.id);
    if(!candidate)throw Object.assign(new Error('Candidate đã mất trong lúc reconcile.'),{code:'CROSS_DB_CANDIDATE_MISSING',poison:true});
    if(candidate.status==='linked'&&candidate.duplicateOfCardId===context.cardId)return{context:{candidateId:candidate.id}};
    const linked=transitionCaptureItem({...candidate,duplicateOfCardId:context.cardId,matchedCardIds:[...new Set([...(candidate.matchedCardIds||[]),context.cardId])]},'linked',{reason:'cross-db-finalize-completed'});
    await putV10Record(V10_STORES.captureCandidates,linked,'capture-candidate-linked');
    return{context:{candidateId:linked.id}};
  }
});

const mergeIntentHandlers=Object.freeze({
  'move-occurrences':async({payload})=>{
    const occurrences=await listSourceOccurrences(payload.removeCardId);
    for(const occurrence of occurrences)await putV10Record(V10_STORES.sourceOccurrences,{...occurrence,lexicalItemId:payload.keepCardId,updatedAt:Date.now()},'source-occurrence-relinked');
    return{context:{occurrencesMoved:occurrences.length}};
  },
  'write-tombstone':async({payload})=>{
    const existing=await getV10Record(V10_STORES.lexicalTombstones,`tombstone-${payload.removeCardId}`);
    const tombstone=existing||{id:`tombstone-${payload.removeCardId}`,lexicalItemId:payload.removeCardId,replacedBy:payload.keepCardId,front:payload.remove.front,back:payload.remove.back,deletedAt:Date.now(),updatedAt:Date.now()};
    await putV10Record(V10_STORES.lexicalTombstones,tombstone,'lexical-tombstone-created');
    return{context:{tombstoneId:tombstone.id}};
  },
  'delete-core-card':async({payload})=>{
    if(activeCards().some(card=>card.id===payload.removeCardId))await deleteCard(payload.removeCardId,'lexical-merge-completed');
    return{context:{deletedCardId:payload.removeCardId}};
  }
});

export async function finalizeCaptureCandidate(candidateId,{action='create',cardId=null,overrides={},hooks={}}={}){
  const stored=await getV10Record(V10_STORES.captureCandidates,candidateId);if(!stored)throw new Error('Không tìm thấy bản nháp từ vựng.');
  if(!['create','link'].includes(action))throw new Error('Capture action không hợp lệ.');
  if(stored.status==='linked'){
    const existingCard=activeCards().find(item=>item.id===stored.duplicateOfCardId)||null;
    return{candidate:stored,card:existingCard,intent:await getV10Record(V10_STORES.workflowIntents,`capture-finalize:${stored.id}`)};
  }
  const reviewed=stored.status==='needs-review'?transitionCaptureItem(stored,'ready',{reason:'explicit-link-confirmed'}):stored;
  const candidate=assertCaptureFinalization(reviewed);
  const targetCardId=action==='link'?(cardId||candidate.duplicateOfCardId):`capture-card:${candidate.id}`;
  if(!targetCardId)throw new Error('Không tìm thấy card để liên kết.');
  const finalizing=candidate.status==='finalizing'?candidate:transitionCaptureItem(candidate,'finalizing',{reason:`finalize-${action}`});
  await putV10Record(V10_STORES.captureCandidates,finalizing,'capture-candidate-finalizing');
  const intent=await executeCrossDbIntent({
    id:`capture-finalize:${candidate.id}`,
    kind:'capture-finalize',
    stepIds:['ensure-card','ensure-occurrence','link-candidate'],
    payload:{candidate:finalizing,action,targetCardId,overrides}
  },{handlers:captureIntentHandlers,hooks});
  const linked=await getV10Record(V10_STORES.captureCandidates,candidate.id);
  const card=activeCards().find(item=>item.id===intent.context.cardId)||null;
  globalThis.dispatchEvent(new CustomEvent('vocab:v10-card-linked',{detail:{candidateId:candidate.id,cardId:intent.context.cardId,action}}));
  return{candidate:linked,card,intent};
}

export async function rejectCaptureCandidate(candidateId){
  const candidate=await getV10Record(V10_STORES.captureCandidates,candidateId);if(!candidate)return false;
  await putV10Record(V10_STORES.captureCandidates,transitionCaptureItem(candidate,'rejected',{reason:'user-rejected'}),'capture-candidate-rejected');
  return true;
}

export async function mergeDuplicateCards({keepCardId,removeCardId,hooks={}}={}){
  if(!keepCardId||!removeCardId||keepCardId===removeCardId)throw new Error('Cần hai card khác nhau để merge.');
  const keep=activeCards().find(card=>card.id===keepCardId),remove=activeCards().find(card=>card.id===removeCardId);
  const tombstone=await getV10Record(V10_STORES.lexicalTombstones,`tombstone-${removeCardId}`);
  if(!keep||(!remove&&!tombstone))throw new Error('Không tìm thấy card cần merge.');
  const intent=await executeCrossDbIntent({
    id:`lexical-merge:${keepCardId}:${removeCardId}`,
    kind:'lexical-merge',
    stepIds:['move-occurrences','write-tombstone','delete-core-card'],
    payload:{keepCardId,removeCardId,keep,remove:remove||tombstone}
  },{handlers:mergeIntentHandlers,hooks});
  globalThis.dispatchEvent(new CustomEvent('vocab:v10-merge-completed',{detail:{keepCardId,removeCardId,intentId:intent.id}}));
  return{keep,remove:remove||tombstone,occurrencesMoved:Number(intent.context.occurrencesMoved||0),requiresCoreDelete:false,intent};
}

export async function reconcileLexicalIntents(options={}){
  return reconcileCrossDbIntents({handlersByKind:{'capture-finalize':captureIntentHandlers,'lexical-merge':mergeIntentHandlers},...options});
}

export async function migrateExistingCardsToOccurrences(){
  const cards=activeCards();let created=0;
  for(const card of cards){
    const existing=await listSourceOccurrences(card.id);if(existing.length||!card.sourceContext)continue;
    await addSourceOccurrence(card.id,{sourceType:card.provenance?.source||'legacy',sourceId:'legacy-card',title:card.deck||'Legacy library',context:card.sourceContext,encounteredAt:card.createdAt||Date.now(),verified:true});created+=1;
  }
  await putV10Record(V10_STORES.meta,{key:'lexical-migration-v1',completedAt:Date.now(),cardsScanned:cards.length,occurrencesCreated:created,updatedAt:Date.now()},'lexical-migration-complete');
  return{cardsScanned:cards.length,occurrencesCreated:created};
}

export async function lexicalIntegrityAudit(){
  const cards=activeCards();const occurrences=await listV10Records(V10_STORES.sourceOccurrences);const candidates=await listV10Records(V10_STORES.captureCandidates);const ids=new Set(cards.map(card=>card.id));
  const orphanOccurrences=occurrences.filter(row=>row.lexicalItemId&&!ids.has(row.lexicalItemId));
  const duplicateCards=[];const identities=new Map();for(const card of cards){const key=cardIdentityKey(card);if(identities.has(key))duplicateCards.push([identities.get(key),card.id]);else identities.set(key,card.id);}
  return{cards:cards.length,occurrences:occurrences.length,candidates:candidates.length,orphanOccurrences,duplicateCards,valid:orphanOccurrences.length===0&&duplicateCards.length===0};
}

export const __testing=Object.freeze({captureIntentHandlers,mergeIntentHandlers});
