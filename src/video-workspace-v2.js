import { createYoutubeSentencePlayer } from './youtube-sentence-player.js';
import { getTranscriptAggregate,createChildAndActivate } from './transcript-aggregate.js';
import { phase5RecoveryMessage,phase5RequestPolicy } from './phase5-fallback-ui.js';

const MAX_FULL_VIDEO_SECONDS=4*60*60;
const RESTORE_KEY='vocab-master:phase3-video-workspace';
const MODE_CONFIG=Object.freeze({
  normal:{label:'Normal',step:'listening',dictationMode:'strict'},
  noticing:{label:'Noticing',step:'noticing',dictationMode:'strict'},
  shadowing:{label:'Shadowing',step:'shadowing',dictationMode:'strict'},
  'dictation-strict':{label:'Strict Practice',step:'dictation',dictationMode:'strict'},
  'dictation-practice':{label:'Dictation Practice',step:'dictation',dictationMode:'practice'},
  retell:{label:'Retell',step:'retell',dictationMode:'strict'}
});
let activeWorkspace=null;
let activeResolver=null;

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();

function ensureStyles(){if(!globalThis.__v10WorkspacePlaybackSync){globalThis.__v10WorkspacePlaybackSync=true;document.addEventListener('click',event=>{if(!event.target.closest?.('[data-video-loop]'))return;queueMicrotask(()=>{const state=activeWorkspace;if(state)globalThis.VocabMasterWorkspacePlayback={revisionId:state.row.transcriptRevisionId,mode:state.mode,rate:state.rate,loop:state.loop};});});}if(document.querySelector('link[href="/video-workspace-v2.css"]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='/video-workspace-v2.css';document.head.append(link);}
function formatDuration(seconds=0){const value=Math.max(0,Math.round(Number(seconds||0))),minutes=Math.floor(value/60),rest=value%60;return`${minutes}:${String(rest).padStart(2,'0')}`;}
function setHubStatus(markup){const node=$('#v10VideoStatus');if(node)node.innerHTML=markup;}
function setWorkspaceError(message){setHubStatus(`<p class="error">${escape(message)}</p>`);if(typeof document==='undefined')return;let node=document.querySelector('#v10WorkspaceError');if(!node){node=document.createElement('div');node.id='v10WorkspaceError';node.className='v10-workspace-error';node.setAttribute('role','alert');node.setAttribute('aria-live','assertive');document.body.append(node);}node.textContent=String(message);node.hidden=false;}
function clearWorkspaceError(){const node=typeof document==='undefined'?null:document.querySelector('#v10WorkspaceError');if(node)node.hidden=true;}
function setFormBusy(form,busy){for(const control of $$('input,button,select',form))control.disabled=busy;const button=$('button[type="submit"],button:not([type])',form);if(button)button.textContent=busy?'Đang lấy toàn bộ transcript…':'Dán URL và học';}
function persistRestoreState(value){try{const next=value?{...value,language:value.language||activeWorkspace?.row?.language||null}:null;next?sessionStorage.setItem(RESTORE_KEY,JSON.stringify(next)):sessionStorage.removeItem(RESTORE_KEY);}catch{}}
function updateDeepLink(row=null){try{const url=new URL(location.href);if(row){url.searchParams.set('videoWorkspace',row.videoId);if(row.transcriptRevisionId)url.searchParams.set('transcriptRevision',row.transcriptRevisionId);if(row.language)url.searchParams.set('transcriptLanguage',row.language);}else{url.searchParams.delete('videoWorkspace');url.searchParams.delete('transcriptRevision');url.searchParams.delete('transcriptLanguage');}history.replaceState(history.state,'',url);}catch{}}

const normalizeLanguage=value=>String(value||'').trim().toLowerCase().replace('_','-');
const languageMatches=(actual,requested)=>{const left=normalizeLanguage(actual),right=normalizeLanguage(requested);return!right||left===right||left.split('-')[0]===right.split('-')[0];};
const validSegments=segments=>Array.isArray(segments)&&segments.length>0&&segments.every((segment,index,rows)=>String(segment?.text||'').trim()&&Number(segment.endMs)>Number(segment.startMs)&&(!index||Number(segment.startMs)>=Number(rows[index-1].endMs)));
const eligibleStatus=status=>!['rejected','quarantined','corrupt','partial','failed'].includes(String(status||'').toLowerCase());
export function validateWorkspaceAggregate(aggregate,{videoId=null,language=null,revisionId=null}={}){if(!aggregate?.source||!aggregate?.revision)return{ok:false,code:'TRANSCRIPT_REVISION_MISSING'};if(revisionId&&aggregate.revision.id!==revisionId)return{ok:false,code:'TRANSCRIPT_REVISION_MISMATCH'};if(videoId&&aggregate.source.externalId!==videoId)return{ok:false,code:'TRANSCRIPT_SOURCE_MISMATCH'};if(!languageMatches(aggregate.source.language,language))return{ok:false,code:'TRANSCRIPT_LANGUAGE_MISMATCH'};const activeRevisionId=aggregate.source.activeRevisionId||aggregate.source.latestRevisionId;if(activeRevisionId!==aggregate.revision.id)return{ok:false,code:'TRANSCRIPT_REVISION_INACTIVE'};if(aggregate.revision.coverage?.complete!==true)return{ok:false,code:'TRANSCRIPT_INCOMPLETE'};if(!eligibleStatus(aggregate.source.status)||!eligibleStatus(aggregate.revision.status)||!validSegments(aggregate.segments))return{ok:false,code:'TRANSCRIPT_INELIGIBLE'};return{ok:true};}
export function validateWorkspaceCache(row,{videoId=null,language=null}={}){if(!row||row.complete!==true||row.qualityStatus!=='available'||!row.transcriptSourceId||!row.transcriptRevisionId||!validSegments(row.segments))return{ok:false,code:'TRANSCRIPT_INELIGIBLE'};if(videoId&&row.videoId!==videoId)return{ok:false,code:'TRANSCRIPT_SOURCE_MISMATCH'};if(!languageMatches(row.language,language))return{ok:false,code:'TRANSCRIPT_LANGUAGE_MISMATCH'};return{ok:true};}
function aggregateWorkspaceRow(aggregate,{videoId=null}={}){return{videoId:videoId||aggregate.source.externalId,title:aggregate.source.title||'YouTube video',url:aggregate.source.url,language:aggregate.source.language,segments:aggregate.segments,transcriptSourceId:aggregate.source.id,transcriptRevisionId:aggregate.revision.id,durationSeconds:Number(aggregate.revision.coverage?.endMs||0)/1000,complete:true,qualityStatus:'available'};}
async function lookupEligibleWorkspace({resolver,videoId=null,language=null,revisionId=null,cacheId=null}={}){if(revisionId){const aggregate=await getTranscriptAggregate(revisionId).catch(()=>null),eligibility=validateWorkspaceAggregate(aggregate,{videoId,language,revisionId});return eligibility.ok?{row:aggregateWorkspaceRow(aggregate,{videoId}),error:null}:{row:null,error:eligibility.code};}if(!videoId)return{row:null,error:'TRANSCRIPT_SOURCE_MISMATCH'};const rows=await resolver?.list?.(videoId).catch(()=>[])||[],candidate=cacheId?rows.find(row=>row.id===cacheId):rows.find(row=>validateWorkspaceCache(row,{videoId,language}).ok),cached=validateWorkspaceCache(candidate,{videoId,language});if(!cached.ok)return{row:null,error:cached.code};const aggregate=await getTranscriptAggregate(candidate.transcriptRevisionId).catch(()=>null),canonical=validateWorkspaceAggregate(aggregate,{videoId,language,revisionId:candidate.transcriptRevisionId});return canonical.ok?{row:{...aggregateWorkspaceRow(aggregate,{videoId}),durationSeconds:candidate.durationSeconds||Number(aggregate.revision.coverage?.endMs||0)/1000},error:null}:{row:null,error:canonical.code};}
function syncWorkspacePlayback(state=activeWorkspace){if(!state)return;globalThis.VocabMasterWorkspacePlayback={revisionId:state.row.transcriptRevisionId,mode:state.mode,rate:state.rate,loop:state.loop};}

function splitPracticeSegment(row){
  const text=String(row.text||'').replace(/\s+/g,' ').trim();
  if(!text||/^\[?(?:music|applause|laughter)\]?$/i.test(text))return[];
  const words=text.split(/\s+/),duration=Math.max(400,Number(row.endMs||0)-Number(row.startMs||0));
  const clauses=text.match(/[^,;.!?]+[,;.!?]?/g)?.map(value=>value.trim()).filter(Boolean)||[text],pieces=[];
  for(const clause of clauses){const clauseWords=clause.split(/\s+/).filter(Boolean);if(clauseWords.length<=14){pieces.push(clause);continue;}for(let index=0;index<clauseWords.length;index+=11)pieces.push(clauseWords.slice(index,index+11).join(' '));}
  if(pieces.length===1&&words.length<=14&&duration<=10_000)return[{...row,text}];
  const weights=pieces.map(value=>Math.max(1,value.split(/\s+/).length)),total=weights.reduce((sum,value)=>sum+value,0);let cursor=Number(row.startMs||0);
  return pieces.map((value,index)=>{const end=index===pieces.length-1?Number(row.endMs||cursor+800):cursor+Math.max(500,Math.round(duration*weights[index]/total));const result={...row,id:`${row.id}:practice:${index+1}`,startMs:cursor,endMs:end,text:value};cursor=end;return result;});
}

export function preparePracticeSegments(chunks=[]){
  const rows=chunks.flatMap(row=>Array.isArray(row?.segments)?row.segments:[]).sort((a,b)=>Number(a.startMs||0)-Number(b.startMs||0)),deduped=[];
  for(const row of rows){const text=String(row.text||'').replace(/\s+/g,' ').trim();if(!text)continue;const previous=deduped.at(-1);if(previous&&Math.abs(Number(previous.startMs||0)-Number(row.startMs||0))<1200&&normalize(previous.text)===normalize(text))continue;deduped.push({...row,text});}
  return deduped.flatMap(splitPracticeSegment).filter(row=>row.text&&row.endMs>row.startMs);
}

export function findActiveSentenceIndex(sentences=[],timeSeconds=0){
  const timeMs=Math.max(0,Number(timeSeconds||0)*1000);let low=0,high=sentences.length-1,candidate=0;
  while(low<=high){const middle=(low+high)>>1;if(Number(sentences[middle]?.startMs||0)<=timeMs){candidate=middle;low=middle+1;}else high=middle-1;}
  const row=sentences[candidate];if(!row)return-1;if(timeMs>=Number(row.startMs||0)&&timeMs<Number(row.endMs||Infinity))return candidate;
  return Math.max(0,Math.min(sentences.length-1,candidate));
}

export function virtualWindow(total,index,{radius=28}={}){const safe=Math.max(0,Math.min(Math.max(0,total-1),Number(index||0)));return{start:Math.max(0,safe-radius),end:Math.min(total,safe+radius+1),active:safe};}

export function applyTranscriptEdit(segments,index,{text,startMs,endMs,action='update'}={}){
  const rows=segments.map(row=>({...row})),at=Math.max(0,Math.min(rows.length-1,Number(index||0))),current=rows[at];if(!current)throw new Error('Không tìm thấy câu để sửa.');
  if(action==='split'){const cleanText=String(text??current.text).trim(),parts=cleanText.split(/\s+/),cut=Math.max(1,Math.floor(parts.length/2)),middle=Math.round((Number(current.startMs)+Number(current.endMs))/2);if(parts.length<2)throw new Error('Cần ít nhất hai từ để tách câu.');rows.splice(at,1,{...current,id:`${current.id}:split:1`,text:parts.slice(0,cut).join(' '),endMs:middle},{...current,id:`${current.id}:split:2`,text:parts.slice(cut).join(' '),startMs:middle});}
  else if(action==='merge'){const next=rows[at+1];if(!next)throw new Error('Không có câu kế tiếp để gộp.');rows.splice(at,2,{...current,id:`${current.id}:merge:${next.id}`,text:`${current.text} ${next.text}`.replace(/\s+/g,' ').trim(),endMs:next.endMs});}
  else rows[at]={...current,text:String(text??current.text).replace(/\s+/g,' ').trim(),startMs:Math.max(0,Number(startMs??current.startMs)),endMs:Math.max(0,Number(endMs??current.endMs))};
  if(rows.some(row=>!row.text||Number(row.endMs)<=Number(row.startMs)))throw new Error('Text và timestamp phải hợp lệ.');
  for(let cursor=1;cursor<rows.length;cursor+=1)if(Number(rows[cursor].startMs)<Number(rows[cursor-1].endMs))throw new Error('Các câu không được chồng timestamp.');
  return rows;
}

async function legacyLoadWholeTranscript({url,startSeconds=0,onProgress=()=>{},signal=null,resumeJobId=null,policy={},sharing=null}={}){
  const resolver=globalThis.VocabMasterTranscriptResolver,resolve=resolver?.resolveWithFallback||resolver?.resolve;if(!resolve||!resolver?.continue)throw new Error('Transcript Resolver chưa sẵn sàng.');
  const videoId=resolver.parseVideoId(url);if(!videoId)throw new Error('URL YouTube không hợp lệ.');
  if(!resumeJobId){const cached=await resolver.list(videoId).catch(()=>[]),completeCached=cached.find(row=>row.complete&&row.segments?.length);if(completeCached){onProgress({stage:'complete',segments:completeCached.segments.length,durationSeconds:completeCached.durationSeconds,cached:true});return{...completeCached,segments:preparePracticeSegments([completeCached])};}}
  onProgress({stage:'first'});
  const first=await resolve({url,startSeconds,firstChunkSeconds:180,providers:['indexeddb','shared-cache','backend-provider'],policy,sharing,signal,resumeJobId,onProgress:event=>onProgress({stage:'resolver',...event})});
  const durationSeconds=Math.min(MAX_FULL_VIDEO_SECONDS,Math.max(0,Number(first.durationSeconds||first.metadata?.durationSeconds||0))),chunks=[first],firstEnd=Math.max(startSeconds,Number(first.clip?.endSeconds||durationSeconds||startSeconds+180));
  if(!first.complete&&durationSeconds>firstEnd+1){onProgress({stage:'remaining',durationSeconds,loadedSeconds:firstEnd-startSeconds,segments:first.segments.length});try{const more=await resolver.continue({url,startSeconds:firstEnd,totalSeconds:durationSeconds-firstEnd,chunkSeconds:180,onChunk:(row,completed)=>onProgress({stage:'remaining',durationSeconds,loadedSeconds:firstEnd-startSeconds+completed.reduce((sum,item)=>sum+Math.max(0,Number(item.clip?.endSeconds||0)-Number(item.clip?.startSeconds||0)),0),segments:first.segments.length+completed.reduce((sum,item)=>sum+(item.segments?.length||0),0)})});chunks.push(...more);}catch(error){if(signal?.aborted)throw error;console.warn('[video workspace] progressive transcript partial',error);}}
  const segments=preparePracticeSegments(chunks),lastEnd=Math.max(0,...segments.map(row=>Number(row.endMs||0)/1000)),complete=Boolean(first.complete||(durationSeconds&&lastEnd>=durationSeconds-2));onProgress({stage:'complete',segments:segments.length,durationSeconds,complete});
  return{...first,videoId,url,title:first.title||'YouTube video',segments,durationSeconds,complete,clip:{startSeconds,endSeconds:lastEnd}};
}

function modeOptions(){return Object.entries(MODE_CONFIG).map(([value,row])=>`<option value="${value}">${escape(row.label)}</option>`).join('');}
function railMarkup(row,index,masked){const active=index===activeWorkspace?.index;return`<button class="v10-transcript-row${active?' active':''}" data-video-sentence-index="${index}" aria-current="${active}" aria-label="Câu ${index+1}, ${formatDuration(Number(row.startMs||0)/1000)}"><span>${index+1}</span><p>${masked?'Đáp án đang ẩn trong Dictation Strict':escape(row.text)}</p><small>${formatDuration(Number(row.startMs||0)/1000)}</small></button>`;}
function strictMaskActive(){return activeWorkspace?.mode==='dictation-strict'&&Boolean($('#v10DictationForm',activeWorkspace.layout));}

function renderRail({scroll=false}={}){
  const state=activeWorkspace;if(!state)return;const list=$('.v10-transcript-list',state.layout),windowed=virtualWindow(state.sentences.length,state.index);state.window=windowed;const masked=strictMaskActive();
  list.innerHTML=`<div class="v10-virtual-spacer" style="height:${windowed.start*64}px"></div>${state.sentences.slice(windowed.start,windowed.end).map((row,offset)=>railMarkup(row,windowed.start+offset,masked)).join('')}<div class="v10-virtual-spacer" style="height:${(state.sentences.length-windowed.end)*64}px"></div>`;
  if(scroll)$(`[data-video-sentence-index="${state.index}"]`,list)?.scrollIntoView({block:'nearest'});
}

function updateActiveRail(index,{scroll=true,fromPlayer=false}={}){
  const state=activeWorkspace;if(!state)return;const next=Math.max(0,Math.min(state.sentences.length-1,Number(index||0)));if(next===state.index&&$(`[data-video-sentence-index="${next}"]`,state.layout))return;state.index=next;renderRail({scroll});persistRestoreState({videoId:state.row.videoId,revisionId:state.row.transcriptRevisionId,index:next,mode:state.mode,url:state.row.url});if(fromPlayer)return;state.player.setSegment?.(state.sentences[next],{seek:false});
}

function editorMarkup(row,index){return`<section class="v10-transcript-editor" aria-label="Sửa transcript revision"><header><strong>Sửa câu ${index+1}</strong><button type="button" class="ielts-icon-button" data-video-editor-close aria-label="Đóng trình sửa">×</button></header><label>Nội dung<textarea data-video-edit-text rows="4">${escape(row.text)}</textarea></label><div><label>Bắt đầu (ms)<input data-video-edit-start type="number" min="0" value="${Number(row.startMs||0)}"></label><label>Kết thúc (ms)<input data-video-edit-end type="number" min="1" value="${Number(row.endMs||0)}"></label></div><p class="muted">Lưu tạo immutable child revision; bản cũ vẫn tái hiện được.</p><div class="v10-loop-actions"><button type="button" class="secondary-button" data-video-edit-action="split">Tách</button><button type="button" class="secondary-button" data-video-edit-action="merge">Gộp câu sau</button><button type="button" class="primary-button" data-video-edit-action="update">Lưu revision</button></div><p class="error" data-video-editor-error></p></section>`;}

function mountWorkspaceLayout(context){
  resetWorkspaceLayout();const dialog=$('#v10SentenceLoopDialog'),host=$('#v10SentenceYoutubeHost'),panel=$('#v10SentenceLoopPanel');if(!dialog||!host||!panel)return;
  const layout=document.createElement('div');layout.id='v10VideoStudyLayout';layout.className='v10-video-study-layout';layout.innerHTML=`<section class="v10-video-study-main"><nav class="v10-workspace-toolbar" aria-label="Chế độ luyện video"><label>Chế độ<select data-video-mode>${modeOptions()}</select></label><label>Tốc độ<select data-video-rate><option>.75</option><option>.9</option><option selected>1</option><option>1.1</option><option>1.25</option></select></label><button type="button" class="secondary-button" data-video-loop>↻ Lặp A–B</button><button type="button" class="secondary-button" data-video-toggle-rail>Transcript</button><span data-video-live-status aria-live="polite">Sẵn sàng</span></nav></section><aside class="v10-transcript-rail"><header><div><strong>${context.sentences.length} câu</strong><small>${context.complete?'Toàn bộ transcript':'Transcript một phần'} · ${formatDuration(context.durationSeconds)}</small></div><button class="secondary-button" data-video-edit-transcript>✎ Sửa</button></header><p class="v10-transcript-tip">Chọn câu để seek chính xác. Rail chỉ render cửa sổ gần câu hiện tại.</p><div class="v10-transcript-list" role="list"></div></aside>`;
  const main=$('.v10-video-study-main',layout);dialog.insertBefore(layout,host);main.append($('.v10-workspace-toolbar',layout),host,panel);dialog.classList.add('v10-video-workspace-dialog');
  const observer=new MutationObserver(()=>{const match=$('.v10-sentence-top h3',panel)?.textContent?.match(/Câu\s+(\d+)\//i);if(match){const next=Number(match[1])-1;if(next!==activeWorkspace?.index)updateActiveRail(next,{scroll:false});}renderRail();});observer.observe(panel,{childList:true,subtree:true,characterData:true});
  activeWorkspace={...context,layout,observer,index:context.startIndex||0,mode:context.mode||'normal',loop:false,rate:1,editorOpen:false};syncWorkspacePlayback(activeWorkspace);$('[data-video-mode]',layout).value=activeWorkspace.mode;renderRail({scroll:true});layout.addEventListener('click',event=>void handleWorkspaceClick(event));layout.addEventListener('change',event=>void handleWorkspaceChange(event));updateDeepLink(context.row);persistRestoreState({videoId:context.row.videoId,revisionId:context.row.transcriptRevisionId,index:activeWorkspace.index,mode:activeWorkspace.mode,url:context.row.url,language:context.row.language});
}

function resetWorkspaceLayout(){const dialog=$('#v10SentenceLoopDialog'),layout=$('#v10VideoStudyLayout'),host=$('#v10SentenceYoutubeHost'),panel=$('#v10SentenceLoopPanel');activeWorkspace?.observer?.disconnect?.();activeWorkspace=null;if(!dialog||!layout)return;if(host)dialog.insertBefore(host,layout);if(panel)dialog.insertBefore(panel,layout);layout.remove();dialog.classList.remove('v10-video-workspace-dialog');}

async function legacyOpenMode(index=activeWorkspace?.index||0){
  const state=activeWorkspace;if(!state)return;const config=MODE_CONFIG[state.mode]||MODE_CONFIG.normal;await globalThis.VocabMasterSentenceLoop.open({...state.loopOptions,startIndex:index,startStep:config.step,dictationMode:config.dictationMode,transcriptRevisionId:state.row.transcriptRevisionId});updateActiveRail(index,{scroll:true});await state.player.playSegment(state.sentences[index],{rate:state.rate,loop:state.loop}).catch(()=>{});
}

async function openMode(index=activeWorkspace?.index||0){
  const state=activeWorkspace;if(!state)return;const config=MODE_CONFIG[state.mode]||MODE_CONFIG.normal;
  await globalThis.VocabMasterSentenceLoop.flush?.();syncWorkspacePlayback(state);
  await globalThis.VocabMasterSentenceLoop.open({...state.loopOptions,startIndex:index,startStep:config.step,dictationMode:config.dictationMode,transcriptRevisionId:state.row.transcriptRevisionId,learningMode:state.mode,workspacePlayback:true,playbackRate:state.rate});updateActiveRail(index,{scroll:true});await state.player.playSegment(state.sentences[index],{rate:state.rate,loop:state.loop}).catch(()=>{});
}

async function legacySaveEditor(action){
  const state=activeWorkspace,editor=$('.v10-transcript-editor',state?.layout);if(!state||!editor)return;const error=$('[data-video-editor-error]',editor);error.textContent='';
  try{const source=await getV10Record(V10_STORES.transcriptSources,state.row.transcriptSourceId);if(!source||source.latestRevisionId!==state.row.transcriptRevisionId)throw Object.assign(new Error('Transcript đã có revision mới. Mở lại revision mới nhất trước khi sửa.'),{code:'TRANSCRIPT_EDIT_CONFLICT'});const segments=applyTranscriptEdit(state.sentences,state.index,{text:$('[data-video-edit-text]',editor).value,startMs:$('[data-video-edit-start]',editor).value,endMs:$('[data-video-edit-end]',editor).value,action});const aggregate=await reviseTranscript(state.row.transcriptRevisionId,segments,{provenance:{surface:'video-workspace',action}});state.row={...state.row,transcriptRevisionId:aggregate.revision.id,segments:aggregate.segments};state.sentences=aggregate.segments;state.loopOptions={...state.loopOptions,sentences:state.sentences};state.index=Math.min(state.index,state.sentences.length-1);editor.remove();state.editorOpen=false;updateDeepLink(state.row);persistRestoreState({videoId:state.row.videoId,revisionId:aggregate.revision.id,index:state.index,mode:state.mode,url:state.row.url});renderRail({scroll:true});await openMode(state.index);$('[data-video-live-status]',state.layout).textContent='Đã tạo revision mới';}catch(reason){error.textContent=reason.message;}}

async function saveEditor(action){
  const state=activeWorkspace,editor=$('.v10-transcript-editor',state?.layout);if(!state||!editor)return;
  const error=$('[data-video-editor-error]',editor);error.textContent='';
  try{
    const segments=applyTranscriptEdit(state.sentences,state.index,{text:$('[data-video-edit-text]',editor).value,startMs:$('[data-video-edit-start]',editor).value,endMs:$('[data-video-edit-end]',editor).value,action});
    const aggregate=await createChildAndActivate(state.row.transcriptRevisionId,segments,{provenance:{surface:'video-workspace',action}});
    state.row={...state.row,transcriptRevisionId:aggregate.revision.id,segments:aggregate.segments};state.sentences=aggregate.segments;state.loopOptions={...state.loopOptions,sentences:state.sentences};state.index=Math.min(state.index,state.sentences.length-1);editor.remove();state.editorOpen=false;updateDeepLink(state.row);persistRestoreState({videoId:state.row.videoId,revisionId:aggregate.revision.id,index:state.index,mode:state.mode,url:state.row.url});renderRail({scroll:true});await openMode(state.index);$('[data-video-live-status]',state.layout).textContent='Đã tạo revision mới';
  }catch(reason){error.textContent=reason.message;}
}

async function handleWorkspaceClick(event){
  const state=activeWorkspace;if(!state)return;
  if(event.target.closest('[data-video-toggle-rail]')){state.layout.classList.toggle('rail-open');return;}
  if(event.target.closest('[data-video-loop]')){state.loop=!state.loop;syncWorkspacePlayback(state);event.target.closest('button').setAttribute('aria-pressed',String(state.loop));await state.player.playSegment(state.sentences[state.index],{rate:state.rate,loop:state.loop});return;}
  if(event.target.closest('[data-video-edit-transcript]')){const rail=$('.v10-transcript-rail',state.layout);$('.v10-transcript-editor',rail)?.remove();rail.insertAdjacentHTML('afterbegin',editorMarkup(state.sentences[state.index],state.index));state.editorOpen=true;return;}
  if(event.target.closest('[data-video-editor-close]')){$('.v10-transcript-editor',state.layout)?.remove();state.editorOpen=false;return;}
  const action=event.target.closest('[data-video-edit-action]')?.dataset.videoEditAction;if(action){await saveEditor(action);return;}
  const row=event.target.closest('[data-video-sentence-index]');if(!row)return;await openMode(Number(row.dataset.videoSentenceIndex));
}

async function legacyHandleWorkspaceChange(event){
  const state=activeWorkspace;if(!state)return;
  if(event.target.matches('[data-video-rate]')){state.rate=Math.max(.5,Math.min(2,Number(event.target.value||1)));state.player.setPlaybackRate(state.rate);return;}
  if(event.target.matches('[data-video-mode]')){state.mode=MODE_CONFIG[event.target.value]?event.target.value:'normal';await openMode(state.index);}
}

async function handleWorkspaceChange(event){
  const state=activeWorkspace;if(!state)return;
  if(event.target.matches('[data-video-rate]')){state.rate=Math.max(.5,Math.min(2,Number(event.target.value||1)));syncWorkspacePlayback(state);state.player.setPlaybackRate(state.rate);persistRestoreState({videoId:state.row.videoId,revisionId:state.row.transcriptRevisionId,index:state.index,mode:state.mode,url:state.row.url,language:state.row.language});return;}
  if(event.target.matches('[data-video-mode]')){const nextMode=MODE_CONFIG[event.target.value]?event.target.value:'normal';await globalThis.VocabMasterSentenceLoop.flush?.();state.mode=nextMode;syncWorkspacePlayback(state);persistRestoreState({videoId:state.row.videoId,revisionId:state.row.transcriptRevisionId,index:state.index,mode:state.mode,url:state.row.url,language:state.row.language});await openMode(state.index);}
}

export async function openVideoWorkspace(row,{startIndex=0,mode='normal'}={}){
  if(!row?.videoId||!row?.segments?.length)throw new Error('Video chưa có transcript để học.');ensureStyles();resetWorkspaceLayout();
  const sentences=preparePracticeSegments([row]),onTimeUpdate=seconds=>{const state=activeWorkspace;if(!state)return;const index=findActiveSentenceIndex(state.sentences,seconds);if(index>=0&&index!==state.index)updateActiveRail(index,{scroll:true,fromPlayer:true});};
  const player=createYoutubeSentencePlayer(row.videoId,sentences[startIndex]||sentences[0],{onTimeUpdate});const loopOptions={sourceId:`youtube:${row.videoId}`,sourceType:'video',title:row.title||'YouTube video',sentences,player};
  const initialMode=MODE_CONFIG[mode]?mode:'normal',config=MODE_CONFIG[initialMode];globalThis.VocabMasterWorkspacePlayback={revisionId:row.transcriptRevisionId,mode:initialMode,rate:1,loop:false};await globalThis.VocabMasterSentenceLoop.open({...loopOptions,startIndex,startStep:config.step,dictationMode:config.dictationMode,transcriptRevisionId:row.transcriptRevisionId,learningMode:initialMode,workspacePlayback:true,playbackRate:1});mountWorkspaceLayout({row:{...row,segments:sentences},sentences,player,loopOptions,startIndex,mode:initialMode,durationSeconds:row.durationSeconds||0,complete:Boolean(row.complete)});clearWorkspaceError();
}

async function loadWholeTranscript(options={}){const row=await legacyLoadWholeTranscript(options);if(row.complete!==true||row.qualityStatus&&row.qualityStatus!=='available')throw Object.assign(new Error('Transcript chưa hoàn chỉnh hoặc chưa qua kiểm tra; không thể kích hoạt workspace.'),{code:'TRANSCRIPT_INCOMPLETE'});return row;}

function progressMarkup(progress){
  const status=progress.status||progress.stage;if(status==='reconnecting')return`<p>● Đang nối lại progress stream (lần ${progress.reconnects})…</p><button class="secondary-button" data-video-cancel-job>Hủy</button>`;
  if(status==='queued'||status==='resolving'||status==='partial'||progress.stage==='resolver')return`<p>● Resolver: ${escape(status||'đang xử lý')}</p><p>Job được lưu bền; có thể reload rồi tiếp tục.</p><button class="secondary-button" data-video-cancel-job>Hủy</button>`;
  if(progress.stage==='remaining'){const percent=progress.durationSeconds?Math.min(99,Math.round(progress.loadedSeconds/progress.durationSeconds*100)):0;return`<p>✓ Đã tìm thấy caption</p><p>● Chuẩn bị phần còn lại: ${percent}% · ${progress.segments||0} câu</p><button class="secondary-button" data-video-cancel-job>Hủy</button>`;}
  if(progress.stage==='complete')return`<p>✓ Đã chuẩn bị ${progress.segments||0} câu${progress.complete?' cho toàn bộ video':' (một phần)'}</p>`;
  return'<p>● Đang tìm caption…</p>';
}

async function startResolver({url,startSeconds=0,resumeJobId=null,form=null,policy=null,sharing=null}){
  if(!policy){const request=await phase5RequestPolicy(document.getElementById('v10IeltsHubDialog')||document);policy=request.policy;sharing=request.sharing;}
  activeResolver?.controller?.abort();const controller=new AbortController();activeResolver={controller,jobId:resumeJobId,url,startSeconds,form,policy,sharing};if(form)setFormBusy(form,true);
  setHubStatus('<p>● Đang tìm caption-first transcript…</p><p>Thông thường mất khoảng 10–30 giây với video có caption.</p><button class="secondary-button" data-video-cancel-job>Hủy</button>');
  try{const row=await loadWholeTranscript({url,startSeconds,resumeJobId,policy,sharing,signal:controller.signal,onProgress:progress=>{if(progress.jobId)activeResolver.jobId=progress.jobId;setHubStatus(progressMarkup(progress));}});activeResolver=null;await openVideoWorkspace(row);}
  catch(error){if(error.name==='AbortError'||error.code==='CANCELLED')setHubStatus('<p>Đã hủy resolver. Bạn có thể tiếp tục từ job đã lưu hoặc thử lại.</p>');else setHubStatus(`<p class="error">${escape(error.message)}</p><p>${escape(phase5RecoveryMessage(error))}</p><button class="secondary-button" data-video-retry-resolver>Thử lại</button>`);}
  finally{if(form)setFormBusy(form,false);}
}

async function handleVideoForm(form){const data=new FormData(form),url=String(data.get('url')||''),startSeconds=Math.max(0,Number(data.get('startMinutes')||0)*60);await startResolver({url,startSeconds,form});}
async function handleCachedVideo(button){const videoId=button.dataset.v10CachedVideo,cacheId=button.dataset.v10CachedId;if(!videoId||!cacheId)return;const result=await lookupEligibleWorkspace({resolver:globalThis.VocabMasterTranscriptResolver,videoId,cacheId});if(!result.row)throw Object.assign(new Error('Transcript cache không đủ điều kiện để mở.'),{code:result.error});return openVideoWorkspace(result.row);}

async function legacyRestoreWorkspace(){
  const resolver=globalThis.VocabMasterTranscriptResolver;if(!resolver)return;
  let saved=null;try{saved=JSON.parse(sessionStorage.getItem(RESTORE_KEY)||'null');}catch{}
  const params=new URL(location.href).searchParams,videoId=params.get('videoWorkspace')||saved?.videoId,revisionId=params.get('transcriptRevision')||saved?.revisionId;
  if(revisionId){const aggregate=await getTranscriptAggregate(revisionId).catch(()=>null);if(aggregate?.segments?.length){await openVideoWorkspace({videoId,title:aggregate.source.title||'YouTube video',url:aggregate.source.url,language:aggregate.source.language,segments:aggregate.segments,transcriptSourceId:aggregate.source.id,transcriptRevisionId:aggregate.revision.id,durationSeconds:Number(aggregate.revision.coverage?.endMs||0)/1000,complete:Boolean(aggregate.revision.coverage?.complete)},{startIndex:saved?.index||0,mode:saved?.mode||'normal'});return;}}
  if(videoId){const rows=await resolver.list(videoId).catch(()=>[]),row=rows.find(item=>item.complete&&item.segments?.length)||rows.find(item=>item.segments?.length);if(row){await openVideoWorkspace(row,{startIndex:saved?.index||0,mode:saved?.mode||'normal'});return;}}
  const jobs=await resolver.listRecoverableJobs?.().catch(()=>[]);if(jobs?.[0]){const job=jobs[0],url=job.request?.source?.canonicalUrl;if(url){setHubStatus(`<p>Resolver job trước đó ${escape(job.status)}.</p><button class="secondary-button" data-video-resume-job="${escape(job.id)}" data-video-resume-url="${escape(url)}">Tiếp tục</button>`);}}
}

async function restoreWorkspace(){
  const resolver=globalThis.VocabMasterTranscriptResolver;if(!resolver)return;
  let saved=null;try{saved=JSON.parse(sessionStorage.getItem(RESTORE_KEY)||'null');}catch{}
  const params=new URL(location.href).searchParams,requestedRevision=params.get('transcriptRevision'),videoId=params.get('videoWorkspace')||saved?.videoId,language=params.get('transcriptLanguage')||saved?.language||null,revisionId=requestedRevision||saved?.revisionId;if(!revisionId&&!videoId)return;const result=await lookupEligibleWorkspace({resolver,videoId,language,revisionId});
  if(!result.row){setWorkspaceError(revisionId?'Không tìm thấy hoặc không thể kích hoạt transcript revision đã yêu cầu.':'Không có transcript hoàn chỉnh, hợp lệ để khôi phục.');return;}
  await openVideoWorkspace(result.row,{startIndex:saved?.index||0,mode:saved?.mode||'normal'});
}

function interceptSubmit(event){const form=event.target;if(form?.id!=='v10VideoForm')return;event.preventDefault();event.stopImmediatePropagation();void handleVideoForm(form);}
function interceptClick(event){
  const cached=event.target.closest?.('[data-v10-cached-video]');if(cached){event.preventDefault();event.stopImmediatePropagation();void handleCachedVideo(cached).catch(error=>setWorkspaceError(error.message));return;}
  if(event.target.closest?.('[data-video-cancel-job]')){event.preventDefault();const current=activeResolver;current?.controller.abort();if(current?.jobId)void globalThis.VocabMasterTranscriptResolver.cancel(current.jobId).catch(()=>{});return;}
  if(event.target.closest?.('[data-video-retry-resolver]')){event.preventDefault();if(activeResolver?.url)void startResolver(activeResolver);return;}
  const resume=event.target.closest?.('[data-video-resume-job]');if(resume){event.preventDefault();void startResolver({url:resume.dataset.videoResumeUrl,resumeJobId:resume.dataset.videoResumeJob});}
}

export function mountVideoWorkspaceV2(){ensureStyles();document.addEventListener('submit',interceptSubmit,true);document.addEventListener('click',interceptClick,true);$('#v10SentenceLoopDialog')?.addEventListener('close',()=>{if(!activeWorkspace)return;activeWorkspace.observer?.disconnect?.();activeWorkspace=null;persistRestoreState(null);updateDeepLink(null);});globalThis.VocabMasterVideoWorkspace={open:openVideoWorkspace,load:loadWholeTranscript,prepareSegments:preparePracticeSegments,restore:restoreWorkspace,getState:()=>activeWorkspace&&{videoId:activeWorkspace.row.videoId,revisionId:activeWorkspace.row.transcriptRevisionId,index:activeWorkspace.index,mode:activeWorkspace.mode}};setTimeout(()=>void restoreWorkspace().catch(error=>console.warn('[video workspace restore]',error)),0);}
