import { sanitizeCardInput,cardIdentityKey,normalizeText } from './learning.js';
import { persistCard } from './persistence.js';
import { V10_STORES,lemmaKey,senseKey,normalizeCaptureCandidate,normalizeSourceOccurrence } from './v10-contracts.js';
import { listV10Records,getV10Record,putV10Record,deleteV10Record,transactV10 } from './v10-persistence.js';

function coreState(){return globalThis.VocabMasterApp?.getState?.()||{cards:[],settings:{learningGoal:'passive'}};}
function activeCards(){return(coreState().cards||[]).filter(card=>!card.archivedAt);}
function notifyCore(cards,reason='lexical-core-v2'){const current=coreState();globalThis.dispatchEvent(new CustomEvent('vocab:external-change',{detail:{reason,state:{...current,cards}}}));}

export function matchLexicalCards({term='',meaning='',type='',partOfSpeech=''}={}){
  const lemma=lemmaKey(term),sense=senseKey({term,meaning,partOfSpeech,type});
  return activeCards().map(card=>({card,lemma:lemmaKey(card.front),sense:senseKey({term:card.front,meaning:card.back,partOfSpeech:card.partOfSpeech||'',type:card.type})}))
    .filter(row=>row.lemma===lemma)
    .sort((a,b)=>(a.sense===sense?-2:0)-(b.sense===sense?-2:0)||normalizeText(a.card.back).localeCompare(normalizeText(b.card.back)))
    .map(row=>({...row.card,matchKind:row.sense===sense?'same-sense':'same-lemma'}));
}

export async function captureLexicalCandidate(input={}){
  const matches=matchLexicalCards({term:input.term,meaning:input.proposedMeaning??input.meaning,type:input.proposedType??input.type,partOfSpeech:input.partOfSpeech});
  const exact=matches.find(card=>card.matchKind==='same-sense')||null;
  const candidate=normalizeCaptureCandidate({...input,matchedCardIds:matches.map(card=>card.id),duplicateOfCardId:exact?.id||null,status:exact?'needs-review':input.status});
  candidate.sourceOccurrence={...candidate.sourceOccurrence,candidateId:candidate.id};
  await putV10Record(V10_STORES.captureCandidates,candidate,'capture-candidate-added');
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
  if(current.cards.some(item=>cardIdentityKey(item)===cardIdentityKey(card)))throw new Error('Thẻ cùng từ, nghĩa và loại đã tồn tại.');
  await persistCard(card,'v10-capture-finalized');notifyCore([card,...current.cards],'v10-capture-finalized');return card;
}

export async function finalizeCaptureCandidate(candidateId,{action='create',cardId=null,overrides={}}={}){
  const candidate=await getV10Record(V10_STORES.captureCandidates,candidateId);if(!candidate)throw new Error('Không tìm thấy bản nháp từ vựng.');
  let card;
  if(action==='link'){
    card=activeCards().find(item=>item.id===(cardId||candidate.duplicateOfCardId));if(!card)throw new Error('Không tìm thấy card để liên kết.');
  }else card=await createCardFromCandidate(candidate,overrides);
  await addSourceOccurrence(card.id,{...candidate.sourceOccurrence,candidateId:candidate.id,verified:true});
  const linked={...candidate,status:'linked',duplicateOfCardId:card.id,matchedCardIds:[...new Set([...(candidate.matchedCardIds||[]),card.id])],updatedAt:Date.now()};
  await putV10Record(V10_STORES.captureCandidates,linked,'capture-candidate-linked');
  globalThis.dispatchEvent(new CustomEvent('vocab:v10-card-linked',{detail:{candidateId:candidate.id,cardId:card.id,action}}));
  return{candidate:linked,card};
}

export async function rejectCaptureCandidate(candidateId){const candidate=await getV10Record(V10_STORES.captureCandidates,candidateId);if(!candidate)return false;await putV10Record(V10_STORES.captureCandidates,{...candidate,status:'rejected',updatedAt:Date.now()},'capture-candidate-rejected');return true;}

export async function mergeDuplicateCards({keepCardId,removeCardId}={}){
  if(!keepCardId||!removeCardId||keepCardId===removeCardId)throw new Error('Cần hai card khác nhau để merge.');
  const current=coreState();const keep=current.cards.find(card=>card.id===keepCardId),remove=current.cards.find(card=>card.id===removeCardId);if(!keep||!remove)throw new Error('Không tìm thấy card cần merge.');
  const occurrences=await listSourceOccurrences(removeCardId);for(const occurrence of occurrences)await putV10Record(V10_STORES.sourceOccurrences,{...occurrence,lexicalItemId:keepCardId,updatedAt:Date.now()},'source-occurrence-relinked');
  await putV10Record(V10_STORES.lexicalTombstones,{id:`tombstone-${removeCardId}`,lexicalItemId:removeCardId,replacedBy:keepCardId,front:remove.front,back:remove.back,deletedAt:Date.now(),updatedAt:Date.now()},'lexical-tombstone-created');
  globalThis.dispatchEvent(new CustomEvent('vocab:v10-merge-requested',{detail:{keepCardId,removeCardId}}));
  return{keep,remove,occurrencesMoved:occurrences.length,requiresCoreDelete:true};
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
