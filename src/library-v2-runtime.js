import { V10_STORES,lemmaKey } from './v10-contracts.js';
import { listV10Records,putV10Record } from './v10-persistence.js';
import { listSourceOccurrences,lexicalIntegrityAudit } from './lexical-core-v2.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function cards(){return globalThis.VocabMasterApp?.getState?.().cards||[];}
function activeCards(){return cards().filter(card=>!card.archivedAt);}
function openCard(id){globalThis.VocabMasterApp?.openWordDetail?.(id);}

async function sourceSummary(){
  const occurrences=await listV10Records(V10_STORES.sourceOccurrences,{sortBy:'encounteredAt'});const groups=new Map();
  for(const row of occurrences){const key=row.sourceType||'unknown';if(!groups.has(key))groups.set(key,{sourceType:key,count:0,cardIds:new Set(),lastEncounteredAt:0});const group=groups.get(key);group.count+=1;if(row.lexicalItemId)group.cardIds.add(row.lexicalItemId);group.lastEncounteredAt=Math.max(group.lastEncounteredAt,Number(row.encounteredAt||0));}
  return[...groups.values()].map(row=>({...row,cardIds:[...row.cardIds]})).sort((a,b)=>b.count-a.count);
}

async function cardRowsForSource(sourceType){
  const occurrences=(await listV10Records(V10_STORES.sourceOccurrences,{sortBy:'encounteredAt'})).filter(row=>row.sourceType===sourceType);const map=new Map(activeCards().map(card=>[card.id,card]));const groups=new Map();
  for(const row of occurrences){if(!row.lexicalItemId||!map.has(row.lexicalItemId))continue;const current=groups.get(row.lexicalItemId)||{card:map.get(row.lexicalItemId),count:0,last:0,contexts:[]};current.count+=1;current.last=Math.max(current.last,Number(row.encounteredAt||0));if(row.context&&!current.contexts.includes(row.context))current.contexts.push(row.context);groups.set(row.lexicalItemId,current);}
  return[...groups.values()].sort((a,b)=>b.last-a.last||b.count-a.count);
}

async function renderSourceDetail(sourceType){
  const host=document.querySelector('#v10LibrarySourceDetail');if(!host)return;const rows=await cardRowsForSource(sourceType);
  host.innerHTML=`<div class="v10-library-detail-head"><strong>${escape(sourceType)}</strong><span>${rows.length} mục từ</span></div>${rows.length?rows.map(row=>`<button class="v10-source-card" data-v10-open-card="${escape(row.card.id)}"><span><strong>${escape(row.card.front)}</strong><small>${escape(row.card.back)}</small></span><em>${row.count} lần gặp</em><p>${escape(row.contexts[0]||'')}</p></button>`).join(''):'<p class="muted">Chưa có mục từ ở nguồn này.</p>'}`;
}

async function renderLibraryV2(){
  const host=document.querySelector('#v10LibraryDashboard');if(!host)return;const [sources,audit,candidates]=await Promise.all([sourceSummary(),lexicalIntegrityAudit(),listV10Records(V10_STORES.captureCandidates)]);const active=activeCards();
  const lemmaGroups=new Map();for(const card of active){const key=lemmaKey(card.front);if(!lemmaGroups.has(key))lemmaGroups.set(key,[]);lemmaGroups.get(key).push(card);}const multiSense=[...lemmaGroups.values()].filter(group=>group.length>1).length;
  host.innerHTML=`<div class="v10-library-metrics"><article><strong>${active.length}</strong><span>Mục từ trung tâm</span></article><article><strong>${audit.occurrences}</strong><span>Lần gặp có nguồn</span></article><article><strong>${multiSense}</strong><span>Lemma nhiều nghĩa</span></article><article><strong>${candidates.filter(row=>!['linked','rejected'].includes(row.status)).length}</strong><span>Chờ xác nhận</span></article></div><div class="v10-library-layout"><section><div class="section-heading"><div><p class="eyebrow">THEO NGUỒN</p><h3>Từ vựng đến từ đâu?</h3></div></div><div class="v10-source-chips">${sources.length?sources.map((row,index)=>`<button data-v10-source="${escape(row.sourceType)}" class="${index===0?'active':''}"><strong>${escape(row.sourceType)}</strong><span>${row.cardIds.length} từ · ${row.count} lần gặp</span></button>`).join(''):'<p class="muted">Các nguồn mới sẽ xuất hiện sau khi lưu từ từ video hoặc IELTS content.</p>'}</div></section><section id="v10LibrarySourceDetail" class="v10-library-source-detail"></section></div><div class="v10-integrity ${audit.valid?'good':'warning'}"><strong>${audit.valid?'✓ Kho từ nhất quán':'⚠ Cần xử lý dữ liệu'}</strong><span>${audit.orphanOccurrences.length} nguồn mồ côi · ${audit.duplicateCards.length} cặp trùng chính xác</span></div>`;
  if(sources[0])await renderSourceDetail(sources[0].sourceType);
}

function mountDashboard(){
  const route=document.querySelector('[data-view="library"]');if(!route||document.querySelector('#v10LibrarySection'))return;
  const section=document.createElement('section');section.id='v10LibrarySection';section.className='section-block v10-library-section';section.innerHTML='<div class="section-heading"><div><p class="eyebrow">LEXICAL CORE V2</p><h2>Kho từ kết nối nguồn, lỗi và nội dung</h2><p class="muted">Một mục từ có thể xuất hiện trong nhiều video và bài học nhưng chỉ giữ một lịch FSRS.</p></div></div><div id="v10LibraryDashboard"></div>';
  const first=route.querySelector('.library-hero-header,.library-header,.section-block');if(first)first.insertAdjacentElement('afterend',section);else route.prepend(section);
  section.addEventListener('click',event=>{const source=event.target.closest('[data-v10-source]');if(source){section.querySelectorAll('[data-v10-source]').forEach(node=>node.classList.toggle('active',node===source));void renderSourceDetail(source.dataset.v10Source);return;}const card=event.target.closest('[data-v10-open-card]');if(card)openCard(card.dataset.v10OpenCard);});
}

let previousCardIds=new Set();
async function detectDeletedCards(){
  const current=new Set(cards().map(card=>card.id));for(const id of previousCardIds){if(current.has(id))continue;await putV10Record(V10_STORES.lexicalTombstones,{id:`tombstone-${id}`,lexicalItemId:id,replacedBy:null,deletedAt:Date.now(),updatedAt:Date.now()},'core-card-delete-observed');}
  previousCardIds=current;
}

export async function mountLibraryV2(){
  mountDashboard();previousCardIds=new Set(cards().map(card=>card.id));await renderLibraryV2();
  globalThis.addEventListener('vocab:external-change',()=>{void detectDeletedCards().then(renderLibraryV2);});
  globalThis.addEventListener('vocab:v10-data-saved',()=>void renderLibraryV2());
  globalThis.addEventListener('hashchange',()=>{if(location.hash==='#library')void renderLibraryV2();});
  globalThis.VocabMasterLibraryV2={refresh:renderLibraryV2,audit:lexicalIntegrityAudit,listSourceOccurrences};
}
