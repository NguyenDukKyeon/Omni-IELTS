import { normalizeComparableText } from './ielts-domain.js';
import { upsertErrorRecord } from './ielts-persistence.js';

let mounted=false;
let pending=null;
const processed=new Set();

function appState(){return globalThis.VocabMasterApp?.getState?.()||{cards:[]};}
function inferCard(expected,prompt){
  const expectedKey=normalizeComparableText(expected),promptKey=normalizeComparableText(prompt);
  const cards=(appState().cards||[]).filter(card=>!card.archivedAt&&!card.suspendedAt);
  return cards.find(card=>[card.front,card.back].some(value=>normalizeComparableText(value)===expectedKey))
    ||cards.find(card=>[card.front,card.back].some(value=>{const key=normalizeComparableText(value);return key&&promptKey.includes(key);}));
}

async function inspectFeedback(){
  if(!pending||Date.now()-pending.createdAt>12_000)return;
  const feedback=document.getElementById('answerFeedback');const text=feedback?.textContent?.trim()||'';
  if(!/Chưa đúng|Gần đúng/.test(text))return;
  const expected=feedback.querySelector('b')?.textContent?.trim()||'';if(!expected)return;
  const signature=[pending.prompt,pending.learnerResponse,expected].map(normalizeComparableText).join('::');if(processed.has(signature))return;processed.add(signature);
  const card=inferCard(expected,pending.prompt);const category=/NGHE/i.test(pending.label)?'listening':'meaning';const snapshot=pending;pending=null;
  await upsertErrorRecord({
    category,
    prompt:snapshot.prompt,
    learnerResponse:snapshot.learnerResponse,
    expectedResponse:expected,
    correction:expected,
    explanation:'Lỗi được ghi từ bài chọn đáp án. Lượt review gốc đã tự xử lý FSRS; Notebook không tạo thêm rating.',
    linkedCardIds:card?[card.id]:[],
    sourceRef:{type:'exercise',sourceId:'core-choice',title:'Choice exercise',context:snapshot.prompt}
  });
}

export function mountIeltsChoiceErrorBridge(){
  if(mounted)return;mounted=true;
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-choice]');if(!button)return;
    pending={learnerResponse:button.dataset.choice||button.textContent||'',prompt:document.querySelector('.exercise-card h2')?.textContent||'',label:document.querySelector('.exercise-type')?.textContent||'',createdAt:Date.now()};
  },true);
  const observer=new MutationObserver(()=>{void inspectFeedback();});observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}

export const __testing=Object.freeze({inferCard});
