import { createYoutubeSentencePlayer } from './youtube-sentence-player.js';

const MAX_FULL_VIDEO_SECONDS=4*60*60;
let activeWorkspace=null;

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();

function ensureStyles(){
  if(document.querySelector('link[href="/video-workspace-v2.css"]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='/video-workspace-v2.css';document.head.append(link);
}

function formatDuration(seconds=0){
  const value=Math.max(0,Math.round(Number(seconds||0))),minutes=Math.floor(value/60),rest=value%60;
  return`${minutes}:${String(rest).padStart(2,'0')}`;
}

function splitPracticeSegment(row){
  const text=String(row.text||'').replace(/\s+/g,' ').trim();
  if(!text||/^\[?(?:music|applause|laughter)\]?$/i.test(text))return[];
  const words=text.split(/\s+/),duration=Math.max(400,Number(row.endMs||0)-Number(row.startMs||0));
  const clauses=text.match(/[^,;.!?]+[,;.!?]?/g)?.map(value=>value.trim()).filter(Boolean)||[text];
  const pieces=[];
  for(const clause of clauses){
    const clauseWords=clause.split(/\s+/).filter(Boolean);
    if(clauseWords.length<=14){pieces.push(clause);continue;}
    for(let index=0;index<clauseWords.length;index+=11)pieces.push(clauseWords.slice(index,index+11).join(' '));
  }
  if(pieces.length===1&&words.length<=14&&duration<=10_000)return[{...row,text}];
  const weights=pieces.map(value=>Math.max(1,value.split(/\s+/).length)),total=weights.reduce((sum,value)=>sum+value,0);let cursor=Number(row.startMs||0);
  return pieces.map((value,index)=>{
    const end=index===pieces.length-1?Number(row.endMs||cursor+800):cursor+Math.max(500,Math.round(duration*weights[index]/total));
    const result={...row,id:`${row.id}:practice:${index+1}`,startMs:cursor,endMs:end,text:value};cursor=end;return result;
  });
}

function preparePracticeSegments(chunks=[]){
  const rows=chunks.flatMap(row=>Array.isArray(row?.segments)?row.segments:[]).sort((a,b)=>Number(a.startMs||0)-Number(b.startMs||0));
  const deduped=[];
  for(const row of rows){
    const text=String(row.text||'').replace(/\s+/g,' ').trim();if(!text)continue;
    const key=normalize(text),previous=deduped.at(-1);
    if(previous&&Math.abs(Number(previous.startMs||0)-Number(row.startMs||0))<1200&&normalize(previous.text)===key)continue;
    deduped.push({...row,text});
  }
  return deduped.flatMap(splitPracticeSegment).filter(row=>row.text&&row.endMs>row.startMs);
}

function setHubStatus(markup){const node=$('#v10VideoStatus');if(node)node.innerHTML=markup;}
function setFormBusy(form,busy){for(const control of $$('input,button,select',form))control.disabled=busy;const button=$('button[type="submit"],button:not([type])',form);if(button)button.textContent=busy?'Đang lấy toàn bộ transcript…':'Dán URL và học';}

async function loadWholeTranscript({url,startSeconds=0,onProgress=()=>{}}={}){
  const resolver=globalThis.VocabMasterTranscriptResolver;if(!resolver?.resolve||!resolver?.continue)throw new Error('Transcript Resolver chưa sẵn sàng.');
  const videoId=resolver.parseVideoId(url);if(!videoId)throw new Error('URL YouTube không hợp lệ.');
  const cached=await resolver.list(videoId).catch(()=>[]),completeCached=cached.find(row=>row.complete&&row.segments?.length);
  if(completeCached){onProgress({stage:'complete',segments:completeCached.segments.length,durationSeconds:completeCached.durationSeconds,cached:true});return{...completeCached,segments:preparePracticeSegments([completeCached])};}
  onProgress({stage:'first'});
  const first=await resolver.resolve({url,startSeconds,firstChunkSeconds:180,providers:['shared-cache','local-companion','backend-provider'],allowGeminiFallback:true});
  const durationSeconds=Math.min(MAX_FULL_VIDEO_SECONDS,Math.max(0,Number(first.durationSeconds||first.metadata?.durationSeconds||0)));
  const chunks=[first],firstEnd=Math.max(startSeconds,Number(first.clip?.endSeconds||startSeconds+180));
  if(durationSeconds>firstEnd+1){
    onProgress({stage:'remaining',durationSeconds,loadedSeconds:firstEnd-startSeconds,segments:first.segments.length});
    try{
      const more=await resolver.continue({url,startSeconds:firstEnd,totalSeconds:durationSeconds-firstEnd,chunkSeconds:180,onChunk:(row,completed)=>onProgress({stage:'remaining',durationSeconds,loadedSeconds:Math.min(durationSeconds-startSeconds,firstEnd-startSeconds+completed.reduce((sum,item)=>sum+Math.max(0,Number(item.clip?.endSeconds||0)-Number(item.clip?.startSeconds||0)),0)),segments:first.segments.length+completed.reduce((sum,item)=>sum+(item.segments?.length||0),0)})});
      chunks.push(...more);
    }catch(error){console.warn('[video workspace] Không lấy đủ các chunk còn lại',error);}
  }
  const segments=preparePracticeSegments(chunks),lastEnd=Math.max(0,...segments.map(row=>Number(row.endMs||0)/1000)),complete=Boolean(durationSeconds&&lastEnd>=durationSeconds-2);
  onProgress({stage:'complete',segments:segments.length,durationSeconds,complete});
  return{...first,videoId,url,title:first.title||'YouTube video',segments,durationSeconds,complete,clip:{startSeconds,endSeconds:lastEnd}};
}

function resetWorkspaceLayout(){
  const dialog=$('#v10SentenceLoopDialog'),layout=$('#v10VideoStudyLayout'),host=$('#v10SentenceYoutubeHost'),panel=$('#v10SentenceLoopPanel');
  activeWorkspace?.observer?.disconnect?.();activeWorkspace=null;
  if(!dialog||!layout)return;
  if(host)dialog.insertBefore(host,layout);if(panel)dialog.insertBefore(panel,layout);layout.remove();dialog.classList.remove('v10-video-workspace-dialog');
}

function railMarkup(row,index){return`<button class="v10-transcript-row" data-video-sentence-index="${index}" aria-current="false"><span>${index+1}</span><p>${escape(row.text)}</p><small>${formatDuration(Number(row.startMs||0)/1000)}</small></button>`;}

function updateActiveRail(index,{scroll=true}={}){
  if(!activeWorkspace)return;activeWorkspace.index=Math.max(0,Math.min(activeWorkspace.sentences.length-1,Number(index||0)));
  for(const row of $$('.v10-transcript-row',activeWorkspace.layout)){const active=Number(row.dataset.videoSentenceIndex)===activeWorkspace.index;row.classList.toggle('active',active);row.setAttribute('aria-current',String(active));if(active&&scroll)row.scrollIntoView({block:'nearest'});}
}

function mountWorkspaceLayout(context){
  resetWorkspaceLayout();const dialog=$('#v10SentenceLoopDialog'),host=$('#v10SentenceYoutubeHost'),panel=$('#v10SentenceLoopPanel');if(!dialog||!host||!panel)return;
  const layout=document.createElement('div');layout.id='v10VideoStudyLayout';layout.className='v10-video-study-layout';
  const main=document.createElement('section');main.className='v10-video-study-main';
  const rail=document.createElement('aside');rail.className='v10-transcript-rail';rail.innerHTML=`<header><div><strong>${context.sentences.length} câu</strong><small>${context.complete?'Toàn bộ transcript':'Transcript có thể chưa đầy đủ'} · ${formatDuration(context.durationSeconds)}</small></div><button class="secondary-button" data-video-edit-transcript>✎ Sửa</button></header><p class="v10-transcript-tip">Bấm vào câu bất kỳ để video nhảy tới đúng timestamp và luyện câu đó.</p><div class="v10-transcript-list">${context.sentences.map(railMarkup).join('')}</div>`;
  dialog.insertBefore(layout,host);layout.append(main,rail);main.append(host,panel);dialog.classList.add('v10-video-workspace-dialog');
  const observer=new MutationObserver(()=>{const match=$('.v10-sentence-top h3',panel)?.textContent?.match(/Câu\s+(\d+)\//i);if(match)updateActiveRail(Number(match[1])-1,{scroll:false});});observer.observe(panel,{childList:true,subtree:true,characterData:true});
  activeWorkspace={...context,layout,rail,observer,index:context.startIndex||0};updateActiveRail(activeWorkspace.index);
  layout.addEventListener('click',event=>void handleWorkspaceClick(event));
}

async function handleWorkspaceClick(event){
  const edit=event.target.closest('[data-video-edit-transcript]');if(edit){globalThis.VocabMasterSentenceLoop?.close?.();globalThis.VocabMasterIeltsLauncher?.openLegacy?.('media');return;}
  const row=event.target.closest('[data-video-sentence-index]');if(!row||!activeWorkspace)return;
  const index=Number(row.dataset.videoSentenceIndex),sentence=activeWorkspace.sentences[index];if(!sentence)return;
  updateActiveRail(index);await globalThis.VocabMasterSentenceLoop.open({...activeWorkspace.loopOptions,startIndex:index});await activeWorkspace.player.playSegment(sentence,{rate:1,loop:false}).catch(()=>{});
}

async function openVideoWorkspace(row,{startIndex=0}={}){
  if(!row?.videoId||!row?.segments?.length)throw new Error('Video chưa có transcript để học.');ensureStyles();resetWorkspaceLayout();
  const player=createYoutubeSentencePlayer(row.videoId,row.segments[startIndex]||row.segments[0]);const loopOptions={sourceId:`youtube:${row.videoId}`,sourceType:'video',title:row.title||'YouTube video',sentences:row.segments,player};
  await globalThis.VocabMasterSentenceLoop.open({...loopOptions,startIndex});mountWorkspaceLayout({sentences:row.segments,player,loopOptions,startIndex,durationSeconds:row.durationSeconds||0,complete:Boolean(row.complete)});
}

async function handleVideoForm(form){
  const data=new FormData(form),url=String(data.get('url')||''),startSeconds=Math.max(0,Number(data.get('startMinutes')||0)*60);setFormBusy(form,true);
  setHubStatus('<p>● Đang lấy caption và chia toàn bộ video thành các câu luyện…</p><p>Thông thường mất khoảng 10–30 giây với video có caption.</p>');
  try{
    const row=await loadWholeTranscript({url,startSeconds,onProgress:progress=>{if(progress.stage==='first')setHubStatus('<p>● Đang tìm caption nhanh…</p><p>Chưa mở bài cho tới khi có danh sách câu đủ dùng.</p>');else if(progress.stage==='remaining'){const percent=progress.durationSeconds?Math.min(99,Math.round(progress.loadedSeconds/progress.durationSeconds*100)):0;setHubStatus(`<p>✓ Đã tìm thấy caption</p><p>● Đang chuẩn bị phần còn lại: ${percent}% · khoảng ${progress.segments||0} câu thô</p>`);}else if(progress.stage==='complete')setHubStatus(`<p>✓ Đã chuẩn bị ${progress.segments||0} câu${progress.complete?' cho toàn bộ video':''}</p>`);}});
    await openVideoWorkspace(row);
  }catch(error){setHubStatus(`<p class="error">${escape(error.message)}</p><p>Mở tùy chọn cứu hộ nếu video không có caption hoặc provider bị chặn.</p>`);}finally{setFormBusy(form,false);}
}

async function handleCachedVideo(button){
  const videoId=button.dataset.v10CachedVideo;if(!videoId)return;const resolver=globalThis.VocabMasterTranscriptResolver,rows=await resolver.list(videoId),url=rows.find(row=>row.url)?.url||`https://www.youtube.com/watch?v=${videoId}`;
  const complete=rows.find(row=>row.complete&&row.segments?.length);if(complete){await openVideoWorkspace({...complete,segments:preparePracticeSegments([complete])});return;}
  const combined=preparePracticeSegments(rows);if(combined.length){const durationSeconds=Math.max(...rows.map(row=>Number(row.durationSeconds||0)),0),lastEnd=Math.max(...combined.map(row=>Number(row.endMs||0)/1000),0);if(durationSeconds&&lastEnd>=durationSeconds-2){await openVideoWorkspace({...rows[0],videoId,url,segments:combined,durationSeconds,complete:true});return;}}
  const row=await loadWholeTranscript({url});await openVideoWorkspace(row);
}

function interceptSubmit(event){const form=event.target;if(form?.id!=='v10VideoForm')return;event.preventDefault();event.stopImmediatePropagation();void handleVideoForm(form);}
function interceptClick(event){const cached=event.target.closest?.('[data-v10-cached-video]');if(!cached)return;event.preventDefault();event.stopImmediatePropagation();void handleCachedVideo(cached).catch(error=>setHubStatus(`<p class="error">${escape(error.message)}</p>`));}

export function mountVideoWorkspaceV2(){ensureStyles();document.addEventListener('submit',interceptSubmit,true);document.addEventListener('click',interceptClick,true);globalThis.VocabMasterVideoWorkspace={open:openVideoWorkspace,load:loadWholeTranscript,prepareSegments:preparePracticeSegments};}
