import {
  applyFsrsRating,
  createFsrsCard,
  getCardRetrievability,
  getDueSkillItems,
  getEarliestSkillDue,
  getSkillDueAt,
  requiredSkillsForCard,
  plannedSkillsForCard,
  skillHasReviews,
  skillForExercise
} from './fsrs-scheduler.js';

const DAY = 86_400_000;

export const SESSION_EXERCISE_SECONDS = Object.freeze({
  matching: 45,
  intro: 18,
  flashcard: 28,
  choice: 28,
  'meaning-choice': 28,
  typing: 42,
  'sentence-cloze': 42,
  'listening-choice': 38,
  dictation: 48,
  cloze: 42,
  production: 75,
  pronunciation: 70,
  output: 150,
  transfer: 65
});

export const seedCards = [
  { id:'efficient', deck:'Cốt lõi B1', type:'word', front:'efficient', back:'hiệu quả', pronunciation:'/ɪˈfɪʃ.ənt/', example:'The new system is more efficient.', translation:'Hệ thống mới hiệu quả hơn.', cefr:'B1' },
  { id:'take-account', deck:'Collocation', type:'collocation', front:'take into account', back:'tính đến, cân nhắc', pronunciation:'/teɪk ˌɪn.tuː əˈkaʊnt/', example:'Take the cost into account before deciding.', translation:'Hãy tính đến chi phí trước khi quyết định.', cefr:'B2' },
  { id:'reliable', deck:'Cốt lõi B1', type:'word', front:'reliable', back:'đáng tin cậy', pronunciation:'/rɪˈlaɪ.ə.bəl/', example:'We need a reliable source of information.', translation:'Chúng ta cần một nguồn thông tin đáng tin cậy.', cefr:'B1' },
  { id:'make-decision', deck:'Collocation', type:'collocation', front:'make a decision', back:'đưa ra quyết định', pronunciation:'/meɪk ə dɪˈsɪʒ.ən/', example:'She made a difficult decision.', translation:'Cô ấy đã đưa ra một quyết định khó khăn.', cefr:'A2' },
  { id:'retain', deck:'Cốt lõi B2', type:'word', front:'retain', back:'giữ lại, ghi nhớ', pronunciation:'/rɪˈteɪn/', example:'Images help learners retain new words.', translation:'Hình ảnh giúp người học ghi nhớ từ mới.', cefr:'B2' },
  { id:'carry-out', deck:'Collocation', type:'collocation', front:'carry out', back:'thực hiện', pronunciation:'/ˈkær.i aʊt/', example:'The team carried out the experiment.', translation:'Nhóm đã thực hiện thí nghiệm.', cefr:'B1' },
  { id:'accurate', deck:'Cốt lõi B1', type:'word', front:'accurate', back:'chính xác', pronunciation:'/ˈæk.jə.rət/', example:'Please provide accurate information.', translation:'Vui lòng cung cấp thông tin chính xác.', cefr:'B1' },
  { id:'pay-attention', deck:'Collocation', type:'collocation', front:'pay attention', back:'chú ý', pronunciation:'/peɪ əˈten.ʃən/', example:'Pay attention to the word stress.', translation:'Hãy chú ý đến trọng âm của từ.', cefr:'A2' },
  { id:'significant', deck:'Cốt lõi B2', type:'word', front:'significant', back:'đáng kể, quan trọng', pronunciation:'/sɪɡˈnɪf.ɪ.kənt/', example:'There was a significant improvement.', translation:'Đã có một sự cải thiện đáng kể.', cefr:'B2' },
  { id:'on-behalf', deck:'Collocation', type:'collocation', front:'on behalf of', back:'thay mặt cho', pronunciation:'/ɒn bɪˈhɑːf əv/', example:'I am writing on behalf of the team.', translation:'Tôi viết thư thay mặt cho nhóm.', cefr:'B2' },
  { id:'achieve', deck:'Cốt lõi A2', type:'word', front:'achieve', back:'đạt được', pronunciation:'/əˈtʃiːv/', example:'Small steps help you achieve your goal.', translation:'Những bước nhỏ giúp bạn đạt được mục tiêu.', cefr:'A2' },
  { id:'raise-awareness', deck:'Collocation', type:'collocation', front:'raise awareness', back:'nâng cao nhận thức', pronunciation:'/reɪz əˈweə.nəs/', example:'The campaign raised awareness of the issue.', translation:'Chiến dịch đã nâng cao nhận thức về vấn đề.', cefr:'B2' }
].map(card => ({
  ...card,
  status: 'new',
  learningGoal: card.type === 'collocation' ? 'active' : 'passive',
  dueAt: null,
  intervalDays: 0,
  correct: 0,
  incorrect: 0
}));

export function normalizeText(value='') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[’']/g,"'")
    .replace(/[–—]/g,'-')
    .replace(/[^a-z0-9\s'-]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

export function cardIdentityKey(card = {}) {
  return `${normalizeText(card.front)}::${normalizeText(card.back)}::${normalizeText(card.type || '')}`;
}

export function isDue(card, now=Date.now()) {
  if (!card || card.status === 'new' || card.suspendedAt || card.archivedAt) return false;
  const dueAt = Number(getEarliestSkillDue(card, now) || card?.dueAt || 0);
  return !dueAt || dueAt <= now;
}

export function nextInterval(rating, previousDays=0, now=Date.now()) {
  const legacyCard = {
    id:'interval-preview', front:'preview', back:'preview', status:previousDays > 0 ? 'familiar' : 'new',
    dueAt:now, intervalDays:Number(previousDays||0), correct:previousDays > 0 ? 1 : 0, incorrect:0,
    createdAt:now-Math.max(0,Number(previousDays||0))*DAY
  };
  return applyFsrsRating(legacyCard,rating,now,undefined,'recognition').interval;
}

export function updateCardAfterRating(card, rating, now=Date.now(), skill=null) {
  return applyFsrsRating(card,rating,now,undefined,skill);
}

function cleanText(value) {
  return String(value ?? '').trim().replace(/\s+/g,' ');
}
function cleanMultiline(value) {
  return String(value ?? '').replace(/\r\n?/g,'\n').split('\n').map(line=>line.trim().replace(/[ \t]+/g,' ')).join('\n').replace(/\n{3,}/g,'\n\n').trim();
}

function normalizeProvenance(input={}) {
  const source = ['manual','imported','ai','sample'].includes(input.source) ? input.source : 'manual';
  return {
    source,
    generatedAt: Number(input.generatedAt || 0) || null,
    model: cleanText(input.model) || null,
    confirmedByUser: input.confirmedByUser !== false,
    sourceContext: cleanText(input.sourceContext) || null
  };
}

export function sanitizeCardInput(input={}) {
  const front=cleanText(input.front);
  const createdAt=Number(input.createdAt||Date.now());
  const fsrsBySkill=input.fsrsBySkill&&typeof input.fsrsBySkill==='object'
    ? Object.fromEntries(Object.entries(input.fsrsBySkill).filter(([,value])=>value&&typeof value==='object').map(([skill,value])=>[skill,{...value}]))
    : {};
  const ratingCounts=input.ratingCounts&&typeof input.ratingCounts==='object'
    ? {again:Number(input.ratingCounts.again||0),hard:Number(input.ratingCounts.hard||0),good:Number(input.ratingCounts.good||0),easy:Number(input.ratingCounts.easy||0)}
    : {again:Number(input.incorrect||0),hard:0,good:Number(input.correct||0),easy:0};
  const type=['word','collocation'].includes(input.type) ? input.type : (front.includes(' ') ? 'collocation' : 'word');
  const learningGoal=input.learningGoal==='active'?'active':'passive';
  const targetSkills=Array.isArray(input.targetSkills) ? [...new Set(input.targetSkills.map(cleanText).filter(Boolean))] : [];
  const legacyAccepted=Array.isArray(input.accepted) ? [...new Set(input.accepted.map(cleanText).filter(Boolean))] : [];
  const acceptedBySkill=input.acceptedBySkill&&typeof input.acceptedBySkill==='object'
    ? Object.fromEntries(Object.entries(input.acceptedBySkill).map(([skill,values])=>[skill,[...new Set((Array.isArray(values)?values:[]).map(cleanText).filter(Boolean))]]))
    : {};
  const acceptedByExercise=input.acceptedByExercise&&typeof input.acceptedByExercise==='object'
    ? Object.fromEntries(Object.entries(input.acceptedByExercise).map(([kind,values])=>[kind,[...new Set((Array.isArray(values)?values:[]).map(cleanText).filter(Boolean))]]))
    : {};
  const qualifiedEvidenceBySkill=input.qualifiedEvidenceBySkill&&typeof input.qualifiedEvidenceBySkill==='object'
    ? Object.fromEntries(Object.entries(input.qualifiedEvidenceBySkill).filter(([skill,value])=>['recognition','recall','listening','collocation','production'].includes(skill)&&value&&typeof value==='object').map(([skill,value])=>[skill,{
      attempts:Math.max(0,Number(value.attempts||0)),successes:Math.max(0,Number(value.successes||0)),failures:Math.max(0,Number(value.failures||0)),
      lastDecisionId:cleanText(value.lastDecisionId)||null,lastReceiptId:cleanText(value.lastReceiptId)||null,lastAttemptAt:Number(value.lastAttemptAt||0)||null,lastSuccessfulAt:Number(value.lastSuccessfulAt||0)||null,policyVersion:cleanText(value.policyVersion)||null
    }]))
    : {};
  if(!Object.keys(acceptedByExercise).length&&legacyAccepted.length){for(const kind of ['choice','typing','dictation','sentence-cloze'])acceptedByExercise[kind]=[...legacyAccepted];}
  const provenance=normalizeProvenance(input.provenance || {source: input.aiGenerated ? 'ai' : input.imported ? 'imported' : 'manual'});

  return {
    id:cleanText(input.id) || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    senseId:cleanText(input.senseId) || null,
    deck:cleanText(input.deck)||'Cá nhân',
    type,
    front,
    back:cleanText(input.back),
    pronunciation:cleanText(input.pronunciation),
    example:cleanMultiline(input.example),
    translation:cleanMultiline(input.translation),
    cefr:cleanText(input.cefr)||'—',
    accepted:legacyAccepted,
    acceptedBySkill,
    acceptedByExercise,
    mnemonic:cleanText(input.mnemonic),
    mnemonicAssociation:cleanText(input.mnemonicAssociation),
    mnemonicImagePrompt:cleanText(input.mnemonicImagePrompt),
    contextTopic:cleanText(input.contextTopic),
    sourceContext:cleanMultiline(input.sourceContext),
    usageNote:cleanText(input.usageNote),
    provenance,
    aiFields:input.aiFields&&typeof input.aiFields==='object'?structuredClone(input.aiFields):{},
    learningGoal,
    targetSkills,
    status:input.status||'new',
    dueAt:input.dueAt??input.fsrs?.due??null,
    intervalDays:Number(input.intervalDays||input.fsrs?.scheduled_days||0),
    correct:Number(input.correct||0),
    incorrect:Number(input.incorrect||0),
    ratingCounts,
    createdAt,
    updatedAt:input.updatedAt??null,
    storageUpdatedAt:Number(input.storageUpdatedAt||0)||null,
    storageBaseUpdatedAt:Number(input.storageBaseUpdatedAt||0)||null,
    suspendedAt:Number(input.suspendedAt||0)||null,
    archivedAt:Number(input.archivedAt||0)||null,
    lastRating:input.lastRating??null,
    lastSkill:input.lastSkill??null,
    lastError:input.lastError??null,
    errorCounts:input.errorCounts&&typeof input.errorCounts==='object'?structuredClone(input.errorCounts):{},
    stability:Number(input.stability||input.fsrs?.stability||0),
    difficulty:Number(input.difficulty||input.fsrs?.difficulty||0),
    retrievability:Number(input.retrievability||0),
    skillCoverage:Number(input.skillCoverage||0),
    fsrsVersion:Number(input.fsrsVersion||0),
    fsrs:input.fsrs&&typeof input.fsrs==='object' ? {...input.fsrs} : (input.status==='new'&&!input.correct&&!input.incorrect ? createFsrsCard(createdAt) : null),
    fsrsBySkill,
    qualifiedEvidenceBySkill,
    nextSkill:input.nextSkill??null,
    reviewEventCount:Number(input.reviewEventCount||0),
    lastReviewEventId:input.lastReviewEventId??null,
    transferDueAt:Number(input.transferDueAt||0)||null,
    transferPassedAt:Number(input.transferPassedAt||0)||null,
    transferAttempts:Number(input.transferAttempts||0),
    transferLastResult:input.transferLastResult??null,
    pronunciationPractice:input.pronunciationPractice&&typeof input.pronunciationPractice==='object'?structuredClone(input.pronunciationPractice):{attempts:0,lastPracticedAt:null,lastIntelligibility:null,lastFeedback:''}
  };
}

function parseDelimitedRecords(raw, delimiter) {
  const rows=[];
  let row=[];
  let value='';
  let quoted=false;
  for(let index=0;index<raw.length;index+=1){
    const char=raw[index];
    if(char==='"'){
      if(quoted&&raw[index+1]==='"'){value+='"';index+=1;}
      else quoted=!quoted;
      continue;
    }
    if(char===delimiter&&!quoted){row.push(value.trim());value='';continue;}
    if((char==='\n'||char==='\r')&&!quoted){
      if(char==='\r'&&raw[index+1]==='\n')index+=1;
      row.push(value.trim());
      if(row.some(cell=>cell!==''))rows.push(row);
      row=[];value='';continue;
    }
    value+=char;
  }
  row.push(value.trim());
  if(row.some(cell=>cell!==''))rows.push(row);
  return rows;
}

function headerAlias(value) {
  const key=normalizeText(value);
  const aliases={
    word:'front',front:'front',lemma:'front',phrase:'front',tu:'front','cum tu':'front',
    meaning:'back',back:'back',translation:'back',nghia:'back',
    example:'example','vi du':'example',exampletranslation:'translation','dich vi du':'translation',
    deck:'deck','bo tu':'deck',cefr:'cefr','cap do':'cefr',ipa:'pronunciation',pronunciation:'pronunciation',
    type:'type',accepted:'accepted',goal:'learningGoal','muc tieu':'learningGoal',context:'sourceContext','ngu canh':'sourceContext'
  };
  return aliases[key]||key;
}

export function parseImportText(text, defaultDeck='Imported') {
  const raw=String(text||'').replace(/^\uFEFF/,'').trim();
  if (!raw) return { cards:[], errors:['Không có dữ liệu để nhập.'], columns:[] };
  if (raw.startsWith('[')) {
    try {
      const data=JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('JSON phải là một mảng.');
      const cards=[];const errors=[];
      data.forEach((item,index)=>{
        const card=sanitizeCardInput({
          ...item,
          front:item.front||item.word||item.lemma||item.phrase,
          back:item.back||item.meaning||item.meaningVietnamese||item.translation,
          example:item.example,
          translation:item.exampleTranslation||item.translationExample,
          pronunciation:item.pronunciation||item.ipa,
          deck:item.deck||defaultDeck,
          provenance:{source:'imported',confirmedByUser:true,sourceContext:item.sourceContext||''}
        });
        if(!card.front||!card.back)errors.push(`Mục JSON ${index+1}: thiếu từ/cụm hoặc nghĩa.`);else cards.push(card);
      });
      return { cards, errors, columns:[] };
    } catch (error) { return { cards:[], errors:[`JSON không hợp lệ: ${error.message}`], columns:[] }; }
  }

  const firstLine=raw.split(/\r?\n/,1)[0]||'';
  const delimiter=firstLine.includes('\t')?'\t':firstLine.includes(';')?';':firstLine.includes(',')?',':null;
  let records;
  if(delimiter)records=parseDelimitedRecords(raw,delimiter);
  else records=raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const split=line.split(/\s+(?:-|–|—|:)\s+/);
    return split.length>=2?[split.shift(),split.join(' - ')]:[];
  });

  const knownHeaders=new Set(['front','back','example','translation','deck','cefr','pronunciation','type','accepted','learningGoal','sourceContext']);
  const first=(records[0]||[]).map(headerAlias);
  const hasHeader=first.some(value=>knownHeaders.has(value));
  const header=hasHeader?first:['front','back','example','deck','cefr'];
  const start=hasHeader?1:0;
  const cards=[];const errors=[];
  for(let index=start;index<records.length;index+=1){
    const values=records[index];
    const row=Object.fromEntries(header.map((key,column)=>[key,values[column]||'']));
    const card=sanitizeCardInput({
      ...row,
      accepted:String(row.accepted||'').split(/[|;]/).map(value=>value.trim()).filter(Boolean),
      deck:row.deck||defaultDeck,
      provenance:{source:'imported',confirmedByUser:true,sourceContext:row.sourceContext||''}
    });
    if(!card.front||!card.back)errors.push(`Dòng ${index+1}: thiếu từ/cụm hoặc nghĩa.`);else cards.push(card);
  }
  return { cards, errors, columns:header };
}

export function weakWordScore(card, now=Date.now()) {
  if(card?.suspendedAt||card?.archivedAt)return-1;
  const counts=card?.ratingCounts||{};
  const again=Number(counts.again??card?.incorrect??0);
  const hard=Number(counts.hard||0);
  const good=Number(counts.good??card?.correct??0);
  const easy=Number(counts.easy||0);
  const total=Math.max(1,again+hard+good+easy);
  const failureRate=(again+hard*0.35)/total;
  const retrievability=card.status==='new'?1:getCardRetrievability(card,now);
  const overdue=isDue(card,now)?Math.max(0,(now-Number(getEarliestSkillDue(card,now)||now))/DAY):0;
  return failureRate*70+(1-retrievability)*25+Math.min(20,overdue*3)+again*2+hard*0.5;
}

function cardPriority(card, now=Date.now()) {
  const dueAt=Number(getEarliestSkillDue(card,now)||card.dueAt||now);
  const overdue=isDue(card,now)?Math.max(0,(now-dueAt)/DAY):0;
  const retrievability=getCardRetrievability(card,now);
  const memoryRisk=card.status==='new'?0:(1-retrievability)*35;
  return (isDue(card,now)?100:0)+overdue*8+memoryRisk+weakWordScore(card,now)*0.45+(card.status==='learning'?22:0);
}

function seededNumber(value='') {
  let hash=2166136261;for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;
}
function seededOrder(values,seed=''){return[...values].sort((a,b)=>seededNumber(`${seed}:${a}`)-seededNumber(`${seed}:${b}`));}
function choicePool(card, cards, useFront=false, seed='') {
  const key=useFront?'front':'back';
  const sameLevel=cards.filter(item=>item.id!==card.id&&item.type===card.type&&item.cefr===card.cefr);
  const candidates=(sameLevel.length>=3?sameLevel:cards.filter(item=>item.id!==card.id&&item.type===card.type))
    .filter(item=>normalizeText(item[key])!==normalizeText(card[key]))
    .sort((a,b)=>{
      const deckPenaltyA=a.deck===card.deck?0:20;const deckPenaltyB=b.deck===card.deck?0:20;
      return deckPenaltyA+Math.abs(String(a[key]).length-String(card[key]).length)-(deckPenaltyB+Math.abs(String(b[key]).length-String(card[key]).length));
    });
  const distractors=[];const seen=new Set([normalizeText(card[key])]);
  for(const item of candidates){const value=item[key];const normalized=normalizeText(value);if(!normalized||seen.has(normalized))continue;seen.add(normalized);distractors.push(value);if(distractors.length===3)break;}
  return seededOrder([card[key],...distractors],`${seed}:${card.id}:${key}`);
}

const CLOZE_STOP_WORDS = new Set(['a','an','the','to','of','for','in','on','at','with','by','into','from','as']);

function chooseCollocationBlankIndex(words,ordinal=0) {
  const candidates=words.map((word,index)=>({index,normalized:normalizeText(word)})).filter(item=>item.normalized&&!CLOZE_STOP_WORDS.has(item.normalized));
  const pool=candidates.length?candidates:words.map((word,index)=>({index,normalized:normalizeText(word)}));
  pool.sort((a,b)=>b.normalized.length-a.normalized.length||a.index-b.index);
  return pool[Math.abs(Number(ordinal||0))%Math.max(1,pool.length)]?.index||0;
}

function wordVariants(answer) {
  const value=String(answer||'').toLowerCase();
  const variants=new Set([value]);
  if(/[^aeiou]y$/.test(value)){
    const stem=value.slice(0,-1);variants.add(`${stem}ied`);variants.add(`${stem}ies`);variants.add(`${value}ing`);
  }else if(value.endsWith('e')){
    variants.add(`${value}d`);variants.add(`${value}s`);variants.add(`${value.slice(0,-1)}ing`);
  }else{
    variants.add(`${value}s`);variants.add(`${value}ed`);variants.add(`${value}ing`);
    if(/[^aeiou][aeiou][^aeiouwxy]$/.test(value)){const last=value.at(-1);variants.add(`${value}${last}ed`);variants.add(`${value}${last}ing`);}
  }
  const irregular={make:['made','makes','making'],take:['took','taken','takes','taking'],carry:['carried','carries','carrying'],pay:['paid','pays','paying'],raise:['raised','raises','raising'],write:['wrote','written','writes','writing']};
  for(const item of irregular[value]||[])variants.add(item);
  return [...variants].sort((a,b)=>b.length-a.length);
}

function phraseVariants(answer) {
  const words=String(answer||'').trim().split(/\s+/);
  if(words.length<=1)return wordVariants(answer);
  const [first,...rest]=words;
  return wordVariants(first).map(value=>[value,...rest].join(' '));
}

function maskAnswerInContext(example,answer) {
  let masked=String(example||'').trim();
  if(!masked)return'';
  let replaced=false;
  for(const variant of phraseVariants(answer)){
    const escaped=variant.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const regex=new RegExp(`\\b${escaped}\\b`,'gi');
    masked=masked.replace(regex,()=>{replaced=true;return'_____';});
  }
  return replaced?masked:'';
}

export function collocationCloze(card,ordinal=0) {
  const words=String(card.front||'').trim().split(/\s+/).filter(Boolean);
  const hiddenIndex=chooseCollocationBlankIndex(words,ordinal);
  const answer=words[hiddenIndex]||card.front;
  words[hiddenIndex]='_____';
  return { prompt:words.join(' '), answer, context:maskAnswerInContext(card.example,answer) };
}

function sentenceCloze(card) {
  const example=String(card.example||'').trim();
  if (!example) return { prompt:`_____ = ${card.back}`, answer:card.front };
  const masked=maskAnswerInContext(example,card.front);
  if(masked)return{prompt:masked,answer:card.front};
  return { prompt:`${example}\nTừ phù hợp với nghĩa “${card.back}”: _____`, answer:card.front };
}

function baseStep(card,kind,extra={}) {
  const defaultSkill=kind==='pronunciation'||kind==='transfer'?null:skillForExercise(kind,card);
  return {
    id:`${card.id}-${kind}-${Math.random().toString(36).slice(2,7)}`,
    cardId:card.id,
    kind,
    skill:extra.skill??defaultSkill,
    affectsSchedule:extra.affectsSchedule ?? !['intro','pronunciation','transfer'].includes(kind),
    estimatedSeconds:SESSION_EXERCISE_SECONDS[kind]||40,
    ...extra
  };
}

function step(card, kind, cards, extra={}) {
  const base=baseStep(card,kind,extra);
  if (kind==='choice') return { ...base, prompt:`“${card.back}” nghĩa là từ/cụm nào?`, answer:card.front, choices:choicePool(card,cards,true,base.id) };
  if (kind==='meaning-choice') return { ...base, prompt:`${card.front} có nghĩa là gì?`, answer:card.back, choices:choicePool(card,cards,false,base.id) };
  if (kind==='typing') return { ...base, prompt:`Nhập từ/cụm tiếng Anh có nghĩa: “${card.back}”`, answer:card.front };
  if (kind==='listening-choice') return { ...base, prompt:'Nghe và chọn nghĩa đúng.', answer:card.back, choices:choicePool(card,cards,false,base.id), playAudio:true };
  if (kind==='dictation') return { ...base, prompt:'Nghe rồi nhập lại từ hoặc cụm từ.', answer:card.front, playAudio:true };
  if (kind==='cloze') { const value=collocationCloze(card,Number(card.reviewEventCount||0)); return { ...base, prompt:`Hoàn thành collocation: ${value.prompt}`, answer:value.answer, context:value.context, meaning:card.back }; }
  if (kind==='sentence-cloze') { const value=sentenceCloze(card); return { ...base, prompt:value.prompt, answer:value.answer, context:card.translation }; }
  if (kind==='production') return { ...base, prompt:`Viết một câu tự nhiên sử dụng “${card.front}”.`, answer:card.front };
  if (kind==='pronunciation') return { ...base, prompt:`Nghe mẫu, đọc to “${card.front}” rồi thử lại sau phản hồi.`, answer:card.front, playAudio:true };
  if (kind==='transfer') return { ...base, prompt:`Dùng “${card.front}” trong một câu mới, không lặp lại ví dụ đã học.`, answer:card.front, transfer:true };
  if (kind==='intro') return { ...base, prompt:'Làm quen từ mới' };
  return { ...base, kind:'flashcard', skill:extra.skill??skillForExercise('flashcard',card) };
}

export function buildMatchingStep(cards, count=6) {
  const chosen=[...cards].filter(card=>!card.suspendedAt&&!card.archivedAt).slice(0,Math.max(2,Math.min(10,count)));
  if (chosen.length<2) return null;
  return {
    id:`matching-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    cardId:chosen[0].id,
    cardIds:chosen.map(card=>card.id),
    kind:'matching',
    skill:'recognition',
    affectsSchedule:false,
    estimatedSeconds:SESSION_EXERCISE_SECONDS.matching,
    pairs:chosen.map(card=>({id:card.id,front:card.front,back:card.back}))
  };
}

export function buildOutputStep(cards,count=4) {
  const chosen=[...cards].filter(card=>!card.suspendedAt&&!card.archivedAt).slice(0,Math.max(3,Math.min(5,count)));
  if (chosen.length<3) return null;
  return {
    id:`output-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    cardId:chosen[0].id,
    cardIds:chosen.map(card=>card.id),
    kind:'output',
    skill:'production',
    affectsSchedule:true,
    estimatedSeconds:SESSION_EXERCISE_SECONDS.output,
    terms:chosen.map(card=>({id:card.id,front:card.front,back:card.back})),
    prompt:'Viết 2–3 câu có sử dụng các từ/cụm bên dưới.'
  };
}

function preferredWeakExercise(card) {
  if (card.lastError==='spelling'||card.lastSkill==='listening') return 'dictation';
  if (card.type==='collocation'||card.lastError==='collocation') return 'cloze';
  if (card.lastSkill==='production') return 'production';
  return Number(card.ratingCounts?.again||card.incorrect||0)>Number(card.ratingCounts?.hard||0)+1?'typing':'sentence-cloze';
}

function exerciseForSkill(card, skill, ordinal=0) {
  if(skill==='recognition')return ordinal%3===0?'flashcard':'meaning-choice';
  if(skill==='recall')return card.example&&ordinal%2?'sentence-cloze':'typing';
  if(skill==='listening')return ordinal%2?'listening-choice':'dictation';
  if(skill==='collocation')return'cloze';
  if(skill==='production')return'production';
  return'flashcard';
}

function budgetFor(limit,options={}) {
  const seconds=Number(options.timeBudgetSeconds||0)||Math.max(120,Number(options.minutes||0)*60)||Math.max(180,Number(limit||12)*38);
  return {seconds,maxSteps:Math.max(1,Number(limit||12))};
}

function addIfFits(steps,candidate,budget,used) {
  if(!candidate||steps.length>=budget.maxSteps)return false;
  const duration=Number(candidate.estimatedSeconds||40);
  if(used.value+duration>budget.seconds)return false;
  steps.push(candidate);used.value+=duration;return true;
}

function addBundleIfFits(steps,bundle,budget,used) {
  if(!bundle.length||steps.length+bundle.length>budget.maxSteps)return false;
  const duration=bundle.reduce((sum,item)=>sum+Number(item.estimatedSeconds||40),0);
  if(used.value+duration>budget.seconds)return false;
  steps.push(...bundle);used.value+=duration;return true;
}

export function getTransferDueCards(cards,now=Date.now()) {
  return cards.filter(card=>!card.suspendedAt&&!card.archivedAt&&Number(card.transferDueAt||0)>0&&Number(card.transferDueAt)<=now&&!card.transferPassedAt);
}

export function createSessionSteps(cards, mode='today', limit=12, options={}) {
  const deck=options.deck||'all';
  const now=Number(options.now||Date.now());
  const pool=cards.filter(card=>(deck==='all'||card.deck===deck)&&!card.suspendedAt&&!card.archivedAt);
  const fresh=pool.filter(card=>card.status==='new').slice(0,Math.max(0,Number(options.newLimit??2)));
  const weak=pool.filter(card=>card.status!=='new'&&(Number(card.ratingCounts?.again||card.incorrect||0)>0||Number(card.ratingCounts?.hard||0)>0))
    .sort((a,b)=>weakWordScore(b,now)-weakWordScore(a,now));
  const active=pool.filter(card=>card.status!=='new').sort((a,b)=>cardPriority(b,now)-cardPriority(a,now));
  const dueItems=getDueSkillItems(pool,now,options.fsrsConfig);
  // Deliberate practice modes operate only on cards that have completed the
  // introduction step. New cards enter through a complete acquisition bundle.
  const practicePool=active;
  const budget=budgetFor(limit,options);const used={value:0};const steps=[];

  if(mode==='planned-exact'){
    const targetCardId=String(options.targetCardId||'');
    const targetSkill=String(options.targetSkill||'');
    const card=pool.find(item=>item.id===targetCardId);
    if(card&&options.activityType==='new-card'&&card.status==='new'){
      addIfFits(steps,step(card,'intro',pool,{
        id:String(options.activityId||`${card.id}-intro`),
        skill:null,affectsSchedule:false,
        plannedActivityType:'new-card',
        plannedTarget:options.plannedTarget&&typeof options.plannedTarget==='object'?structuredClone(options.plannedTarget):null
      }),budget,used);
    }else if(card&&requiredSkillsForCard(card).includes(targetSkill)){
      const kind=exerciseForSkill(card,targetSkill,0);
      addIfFits(steps,step(card,kind,pool,{
        id:String(options.activityId||`${card.id}-${kind}`),
        skill:targetSkill,
        affectsSchedule:options.affectsSchedule===true,
        plannedActivityType:String(options.activityType||'card-review'),
        plannedTarget:options.plannedTarget&&typeof options.plannedTarget==='object'?structuredClone(options.plannedTarget):null
      }),budget,used);
    }
  }else if(mode==='today'||mode==='deck'){
    const warmupCandidates=[...new Map([...dueItems.map(item=>pool.find(card=>card.id===item.cardId)),...fresh].filter(Boolean).map(card=>[card.id,card])).values()];
    if(budget.seconds>=360){const warmup=buildMatchingStep(warmupCandidates,Math.min(6,warmupCandidates.length));if(warmup)addIfFits(steps,warmup,budget,used);}
    dueItems.forEach((item,index)=>{
      const card=pool.find(value=>value.id===item.cardId);if(!card)return;
      addIfFits(steps,step(card,exerciseForSkill(card,item.skill,index),pool,{skill:item.skill,dueReason:item.reviewed?'scheduled':'skill-gap'}),budget,used);
    });
    for(const card of fresh){
      const bundle=[
        step(card,'intro',pool,{affectsSchedule:false,acquisition:true}),
        step(card,'meaning-choice',pool,{skill:'recognition',acquisition:true}),
        step(card,'typing',pool,{skill:'recall',acquisition:true})
      ];
      addBundleIfFits(steps,bundle,budget,used);
    }
    for(const card of getTransferDueCards(pool,now))addIfFits(steps,step(card,'transfer',pool,{affectsSchedule:false}),budget,used);
    if(!steps.length&&weak[0])addIfFits(steps,step(weak[0],preferredWeakExercise(weak[0]),pool,{weak:true}),budget,used);
  }else if(mode==='quick'){
    if(dueItems.length){
      dueItems.forEach((item,index)=>{const card=pool.find(value=>value.id===item.cardId);if(card)addIfFits(steps,step(card,exerciseForSkill(card,item.skill,index),pool,{skill:item.skill}),budget,used);});
    }else{
      for(const card of fresh){
        addBundleIfFits(steps,[
          step(card,'intro',pool,{affectsSchedule:false,acquisition:true}),
          step(card,'meaning-choice',pool,{skill:'recognition',acquisition:true}),
          step(card,'typing',pool,{skill:'recall',acquisition:true})
        ],budget,used);
      }
    }
  }else if(mode==='matching'){
    addIfFits(steps,buildMatchingStep(active.length?active:pool,Math.min(10,limit)),budget,used);
  }else if(mode==='typing'){
    practicePool.forEach((card,index)=>addIfFits(steps,step(card,index%3===0?'dictation':'typing',pool,{skill:index%3===0?'listening':'recall'}),budget,used));
  }else if(mode==='cloze'){
    practicePool.forEach(card=>addIfFits(steps,step(card,card.type==='collocation'?'cloze':'sentence-cloze',pool,{skill:card.type==='collocation'?'collocation':'recall'}),budget,used));
  }else if(mode==='pronunciation'){
    practicePool.forEach(card=>addIfFits(steps,step(card,'pronunciation',pool,{affectsSchedule:false}),budget,used));
  }else if(mode==='listening'){
    practicePool.filter(card=>plannedSkillsForCard(card).includes('listening')&&Number.isFinite(getSkillDueAt(card,'listening',now))).forEach((card,index)=>addIfFits(steps,step(card,index%2?'dictation':'listening-choice',pool,{skill:'listening'}),budget,used));
  }else if(mode==='collocation'){
    pool.filter(card=>card.type==='collocation'&&plannedSkillsForCard(card).includes('collocation')&&Number.isFinite(getSkillDueAt(card,'collocation',now))).sort((a,b)=>cardPriority(b,now)-cardPriority(a,now)).forEach(card=>addIfFits(steps,step(card,'cloze',pool,{skill:'collocation'}),budget,used));
  }else if(mode==='production'){
    practicePool.filter(card=>plannedSkillsForCard(card).includes('production')&&Number.isFinite(getSkillDueAt(card,'production',now))).forEach(card=>addIfFits(steps,step(card,'production',pool,{skill:'production'}),budget,used));
  }else if(mode==='output'){
    const productionPool=practicePool.filter(card=>plannedSkillsForCard(card).includes('production')&&Number.isFinite(getSkillDueAt(card,'production',now)));
    addIfFits(steps,buildOutputStep(productionPool,Math.min(5,Math.max(3,options.outputCount||4))),budget,used);
  }else if(mode==='weak'||mode==='mistakes'){
    weak.forEach(card=>addIfFits(steps,step(card,preferredWeakExercise(card),pool,{weak:true}),budget,used));
  }else if(mode==='transfer'){
    getTransferDueCards(pool,now).forEach(card=>addIfFits(steps,step(card,'transfer',pool,{affectsSchedule:false}),budget,used));
  }else if(mode==='test'){
    practicePool.forEach((card,index)=>addIfFits(steps,step(card,index%3===0?(card.type==='collocation'?'cloze':'sentence-cloze'):index%2?'typing':'meaning-choice',pool,{affectsSchedule:false}),budget,used));
  }else{
    practicePool.forEach((card,index)=>addIfFits(steps,step(card,exerciseForSkill(card,requiredSkillsForCard(card)[0],index),pool),budget,used));
  }
  return steps;
}

export function createStudyQueue(cards, mode='today', limit=12) {
  const ids=createSessionSteps(cards,mode,limit).flatMap(item=>item.cardIds||[item.cardId]);
  return [...new Set(ids)].map(id=>cards.find(card=>card.id===id)).filter(Boolean);
}

function levenshtein(a,b){
  if(a===b)return 0;if(!a)return b.length;if(!b)return a.length;
  const previous=Array.from({length:b.length+1},(_,index)=>index);
  for(let i=1;i<=a.length;i+=1){let diagonal=previous[0];previous[0]=i;for(let j=1;j<=b.length;j+=1){const old=previous[j];previous[j]=Math.min(previous[j]+1,previous[j-1]+1,diagonal+(a[i-1]===b[j-1]?0:1));diagonal=old;}}
  return previous[b.length];
}

export function checkAnswer(card, stepData, answer) {
  const expected=stepData.answer||card.front;
  const scope=stepData.skill||skillForExercise(stepData.kind,card);
  const exerciseScoped=Array.isArray(card.acceptedByExercise?.[stepData.kind])?card.acceptedByExercise[stepData.kind]:[];
  const skillFallback=['typing','dictation','sentence-cloze'].includes(stepData.kind)&&Array.isArray(card.acceptedBySkill?.[scope])?card.acceptedBySkill[scope]:[];
  const accepted=[expected,...exerciseScoped,...skillFallback].map(normalizeText).filter(Boolean);
  const actual=normalizeText(answer);
  if (!actual) return { status:'empty', correct:false, expected };
  if (accepted.includes(actual)) return { status:'correct', correct:true, expected };
  const closeSpelling=accepted.some(value=>value.length>=4&&levenshtein(value,actual)<=Math.max(1,Math.floor(value.length*0.12)));
  if(closeSpelling)return{status:'near',correct:false,expected,reason:'spelling'};
  const expectedTokens=normalizeText(expected).split(' ').filter(Boolean);
  const actualTokens=actual.split(' ').filter(Boolean);
  const shared=actualTokens.filter(token=>expectedTokens.includes(token)).length;
  const near=Math.max(expectedTokens.length,actualTokens.length)>1&&shared/Math.max(expectedTokens.length,actualTokens.length)>=0.8;
  return { status:near?'near':'wrong', correct:false, expected, reason:near?'partial':'mismatch' };
}

export function filterCards(cards, query='', filter='all', deck='all') {
  const normalized=normalizeText(query);
  return cards.filter(card=>{
    const matchesQuery=!normalized||[card.front,card.back,card.example,card.deck,card.mnemonic,card.sourceContext].some(value=>normalizeText(value).includes(normalized));
    const matchesFilter=filter==='all'||
      (filter==='mastered'?card.status==='mastered':
        filter==='weak'?weakWordScore(card)>=30:
          filter==='suspended'?Boolean(card.suspendedAt):card.type===filter);
    const matchesDeck=deck==='all'||card.deck===deck;
    return matchesQuery&&matchesFilter&&matchesDeck;
  });
}

export function getModeDueCount(cards,mode,now=Date.now()) {
  if(mode==='weak')return cards.filter(card=>weakWordScore(card,now)>=30).length;
  if(mode==='pronunciation')return cards.filter(card=>card.front&&!card.suspendedAt&&!card.archivedAt).length;
  if(mode==='transfer')return getTransferDueCards(cards,now).length;
  if(['listening','production','collocation','typing'].includes(mode)){
    const skill={listening:'listening',production:'production',collocation:'collocation',typing:'recall'}[mode];
    return cards.filter(card=>requiredSkillsForCard(card).includes(skill)&&getSkillDueAt(card,skill,now)<=now).length;
  }
  return getDueSkillItems(cards,now).length;
}

export function estimateSessionMinutes(steps=[]) {
  return Math.max(1,Math.ceil(steps.reduce((sum,item)=>sum+Number(item.estimatedSeconds||40),0)/60));
}

export function forecastWorkload(cards,days=7,now=Date.now()) {
  const result=Array.from({length:days},(_,offset)=>({
    date:new Date(now+offset*DAY),
    dateKey:new Date(now+offset*DAY).toISOString().slice(0,10),
    reviews:0,
    estimatedMinutes:0
  }));
  for(const card of cards){
    if(card.status==='new'||card.suspendedAt||card.archivedAt)continue;
    for(const skill of requiredSkillsForCard(card)){
      const dueAt=getSkillDueAt(card,skill,now);
      const offset=Math.max(0,Math.floor((dueAt-now)/DAY));
      if(offset>=days)continue;
      const seconds=skill==='production'?75:skill==='listening'?45:40;
      result[offset].reviews+=1;result[offset].estimatedMinutes+=seconds/60;
    }
  }
  return result.map(day=>({...day,estimatedMinutes:Math.ceil(day.estimatedMinutes)}));
}


export function calculateExamPacing(cards=[],examDate='',now=Date.now()) {
  const target=Date.parse(`${String(examDate||'').trim()}T23:59:59`);
  if(!Number.isFinite(target))return{configured:false,daysRemaining:null,skillGaps:0,dueNow:0,dailyMinimum:0,label:'Chưa đặt ngày mục tiêu'};
  const active=cards.filter(card=>!card.suspendedAt&&!card.archivedAt);
  const skillGaps=active.reduce((sum,card)=>sum+plannedSkillsForCard(card).filter(skill=>!skillHasReviews(card,skill)).length,0);
  const dueNow=getDueSkillItems(active,now).length;
  const daysRemaining=Math.max(0,Math.ceil((target-now)/DAY));
  const dailyMinimum=daysRemaining>0?Math.ceil((skillGaps+dueNow)/daysRemaining):skillGaps+dueNow;
  const label=daysRemaining===0?'Đã đến ngày mục tiêu':dailyMinimum===0?'Đang đúng nhịp':dailyMinimum<=5?'Nhịp nhẹ':dailyMinimum<=15?'Cần học đều':'Khối lượng cao';
  return{configured:true,daysRemaining,skillGaps,dueNow,dailyMinimum,label};
}

export function summarizeErrorFingerprint(cards=[]) {
  const counts={meaning:0,spelling:0,listening:0,collocation:0,production:0};
  for(const card of cards){
    for(const [key,value] of Object.entries(card.errorCounts||{}))if(key in counts)counts[key]+=Number(value||0);
    if(card.lastError&&card.lastError in counts&&!(card.errorCounts&&card.lastError in card.errorCounts))counts[card.lastError]+=1;
  }
  const labels={meaning:'Nhầm nghĩa',spelling:'Sai chính tả',listening:'Không nhận ra khi nghe',collocation:'Sai cấu trúc cụm',production:'Dùng chưa tự nhiên'};
  return Object.entries(counts).map(([key,count])=>({key,label:labels[key],count})).sort((a,b)=>b.count-a.count);
}
