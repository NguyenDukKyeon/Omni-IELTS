import { recordContentProgress } from './content-platform.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const objectUrls=new Set();

function dialog(){return document.querySelector('#phase4ContentLessonDialog');}
function status(message,kind='neutral'){
  const node=document.querySelector('#phase4LessonStatus');
  if(node){node.textContent=String(message||'');node.dataset.kind=kind;}
}

function answerMarkup(answer){
  if(answer==null)return'';
  if(typeof answer==='string')return escape(answer);
  if(Array.isArray(answer))return answer.map(escape).join(', ');
  return escape(answer.text||answer.value||answer.correctOption||JSON.stringify(answer));
}

function findStructuredAsset(assets={}){
  return Object.values(assets).find(value=>value&&typeof value==='object'&&!value.bytes)||{};
}

function audioMarkup(assets={}){
  for(const value of Object.values(assets)){
    if(!value?.bytes||!String(value.mediaType).startsWith('audio/'))continue;
    const url=URL.createObjectURL(new Blob([value.bytes],{type:value.mediaType}));
    objectUrls.add(url);
    return`<figure class="phase4-audio"><figcaption>Audio đã xác minh · có transcript kèm theo</figcaption><audio controls preload="metadata" src="${escape(url)}" aria-label="Audio bài Listening"></audio><a href="#phase4Transcript">Bỏ qua audio và đọc transcript</a></figure>`;
  }
  return'';
}

function sourceMarkup(lesson,content){
  if(lesson.skill==='listening'){
    const transcript=content.transcript||content.segments||[];
    const segments=Array.isArray(transcript)?transcript:transcript.segments||[];
    return`<section id="phase4Transcript" tabindex="-1"><h3>Transcript</h3>${segments.length?`<ol>${segments.map(row=>`<li>${escape(row.text||row)}</li>`).join('')}</ol>`:'<p>Transcript nằm trong activity data của bài.</p>'}</section>`;
  }
  if(lesson.skill==='reading')return`<section><h3>Reading passage</h3><p>${escape(content.passage||content.readingPassage||lesson.readingPassage||'Passage được lưu trong asset đã xác minh.')}</p></section>`;
  const targets=content.lexicalTargets||lesson.lexicalTargets||[];
  return`<section><h3>Lexical & paraphrase targets</h3><dl>${targets.map(row=>`<div><dt>${escape(row.term||row.label)}</dt><dd>${escape(row.meaning||row.note||row.usage||'Target đã khai báo')}</dd></div>`).join('')}</dl></section>`;
}

function activitiesMarkup(lesson,progress={}){
  return(lesson.activities||[]).map((activity,index)=>{
    const completed=progress.completedActivityIds?.includes(activity.id);
    return`<article class="phase4-activity" data-phase4-activity="${escape(activity.id)}"><span>Hoạt động ${index+1} · ${escape(activity.type)}</span><h4>${escape(activity.prompt)}</h4>${Array.isArray(activity.options)?`<ul>${activity.options.map(option=>`<li>${escape(option.label||option)}</li>`).join('')}</ul>`:''}<details><summary>Hiện đáp án & feedback</summary><p>${answerMarkup(activity.answer)}</p>${activity.feedback?`<p>${escape(activity.feedback)}</p>`:''}</details><button class="secondary-button" data-phase4-complete="${escape(activity.id)}" ${completed?'disabled':''}>${completed?'Đã hoàn thành':'Đánh dấu hoàn thành'}</button></article>`;
  }).join('');
}

function releaseObjectUrls(){
  for(const url of objectUrls)URL.revokeObjectURL(url);
  objectUrls.clear();
}

function close(){
  dialog()?.close();
  releaseObjectUrls();
}

async function open(detail){
  const lesson=detail?.lesson;
  if(!lesson)return;
  ensureDialog();
  const node=dialog();
  const content=findStructuredAsset(detail.assets);
  node.innerHTML=`<form method="dialog" class="phase4-lesson-shell"><header><div><p class="eyebrow">IMMUTABLE OFFLINE LESSON</p><h2 tabindex="-1">${escape(lesson.title)}</h2><p>${escape(lesson.learningObjective)}</p><span>${escape(lesson.difficulty)} · ${escape(lesson.skill)} · ${lesson.estimatedMinutes} phút · revision ${lesson.contentRevision}</span></div><button value="close" aria-label="Đóng bài học">×</button></header><div class="phase4-lesson-meta"><span>Đã xác minh</span><span>Đã cài offline</span><span>${escape(lesson.rights?.licenseId||'rights approved')}</span></div>${audioMarkup(detail.assets)}${sourceMarkup(lesson,content)}<section><h3>Hoạt động</h3><div class="phase4-activities">${activitiesMarkup(lesson,detail.progress||{})}</div></section><p id="phase4LessonStatus" role="status" aria-live="polite"></p></form>`;
  node.dataset.lessonId=lesson.id;
  if(!node.open)node.showModal();
  node.querySelector('h2')?.focus();
}

function ensureDialog(){
  if(dialog())return dialog();
  const node=document.createElement('dialog');
  node.id='phase4ContentLessonDialog';
  node.className='phase4-lesson-dialog';
  node.addEventListener('close',releaseObjectUrls);
  node.addEventListener('click',event=>{
    if(event.target.closest('[value="close"]')){close();return;}
    const button=event.target.closest('[data-phase4-complete]');
    if(!button)return;
    button.disabled=true;
    status('Đang lưu tiến độ…');
    void recordContentProgress(node.dataset.lessonId,button.dataset.phase4Complete,{status:'completed'})
      .then(()=>{button.textContent='Đã hoàn thành';status('Tiến độ đã được lưu bền vững.','success');})
      .catch(error=>{button.disabled=false;status(`${error.code||'CONTENT_PROGRESS_FAILED'}: ${error.message}`,'error');});
  });
  document.body.append(node);
  return node;
}

export function mountContentExperience(){
  ensureDialog();
  globalThis.addEventListener('vocab:phase4-open-lesson',event=>void open(event.detail));
  globalThis.addEventListener('vocab:phase4-content-error',event=>status(`${event.detail?.code}: ${event.detail?.message}`,'error'));
  globalThis.VocabMasterContentExperience=Object.freeze({open,close});
  return globalThis.VocabMasterContentExperience;
}
