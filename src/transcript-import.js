import { createV10Id,normalizeKey } from './v10-contracts.js';
import { importTranscript } from './transcript-resolver-v2.js';

export const TRANSCRIPT_IMPORT_MAX_CHARS=2_000_000;
export const TRANSCRIPT_IMPORT_MAX_SEGMENTS=2000;

const importError=(code,message,detail={})=>Object.assign(new Error(message),{code,...detail});
const cleanText=value=>String(value??'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,10_000);

function timestampMs(value){
  const match=String(value||'').trim().match(/^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})[,.](\d{3})$/);
  if(!match)return null;
  const hours=Number(match[1]||0),minutes=Number(match[2]),seconds=Number(match[3]),milliseconds=Number(match[4]);
  if(minutes>59||seconds>59)return null;
  return ((hours*60+minutes)*60+seconds)*1000+milliseconds;
}

function validateSegments(segments=[]){
  if(!segments.length)throw importError('IMPORT_INVALID','Transcript import không có nội dung hợp lệ.');
  if(segments.length>TRANSCRIPT_IMPORT_MAX_SEGMENTS)throw importError('IMPORT_INVALID',`Transcript import vượt quá ${TRANSCRIPT_IMPORT_MAX_SEGMENTS} đoạn.`);
  const seen=new Set(),ordered=[...segments].sort((left,right)=>left.startMs-right.startMs||left.endMs-right.endMs);
  for(let index=0;index<ordered.length;index+=1){
    const row=ordered[index],previous=ordered[index-1],key=`${row.startMs}:${row.endMs}:${normalizeKey(row.text)}`;
    if(!row.text||!Number.isFinite(row.startMs)||!Number.isFinite(row.endMs)||row.startMs<0||row.endMs<=row.startMs)throw importError('IMPORT_INVALID',`Mốc thời gian không hợp lệ ở đoạn ${index+1}.`);
    if(seen.has(key))throw importError('IMPORT_DUPLICATE',`Transcript có đoạn trùng tại ${row.startMs} ms.`);
    if(previous&&row.startMs<previous.endMs)throw importError('IMPORT_OVERLAP',`Transcript có đoạn chồng thời gian tại ${row.startMs} ms.`);
    seen.add(key);
  }
  return ordered.map((row,index)=>({...row,id:`import-segment:${index+1}`,language:row.language||'en',status:'unverified',verified:false,confidence:null}));
}

function parseTimed(text,language){
  const blocks=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split(/\n{2,}/),segments=[];
  for(const rawBlock of blocks){
    const lines=rawBlock.split('\n').map(line=>line.trim()).filter(Boolean);
    if(!lines.length||/^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/i.test(lines[0]))continue;
    const timingIndex=lines.findIndex(line=>line.includes('-->'));
    if(timingIndex<0)throw importError('IMPORT_INVALID','SRT/VTT có cue thiếu mốc thời gian.');
    const match=lines[timingIndex].match(/^(\S+)\s*-->\s*(\S+)/),startMs=timestampMs(match?.[1]),endMs=timestampMs(match?.[2]),cueText=cleanText(lines.slice(timingIndex+1).join(' '));
    if(startMs===null||endMs===null||!cueText)throw importError('IMPORT_INVALID','SRT/VTT có cue hoặc mốc thời gian không hợp lệ.');
    segments.push({startMs,endMs,text:cueText,language});
  }
  return validateSegments(segments);
}

function parsePlainText(text,language){
  const compact=String(text||'').replace(/^\uFEFF/,'').trim();
  const rows=compact.includes('\n')
    ?compact.split(/\r?\n+/)
    :compact.match(/[^.!?]+(?:[.!?]+|$)/g)||[];
  const segments=rows.map(cleanText).filter(Boolean).map((value,index)=>({startMs:index*4000,endMs:(index+1)*4000,text:value,language}));
  return validateSegments(segments);
}

export function parseTranscriptImport({text='',format='auto',language='en'}={}){
  const value=String(text??'');
  if(!value.trim())throw importError('IMPORT_INVALID','Transcript import đang trống.');
  if(value.length>TRANSCRIPT_IMPORT_MAX_CHARS)throw importError('IMPORT_INVALID','Transcript import vượt quá giới hạn 2 MB ký tự.');
  const selected=format==='auto'?(value.includes('-->')||/^\uFEFF?WEBVTT/i.test(value)?'timed':'text'):format;
  if(!['srt','vtt','timed','text'].includes(selected))throw importError('IMPORT_INVALID','Định dạng transcript không được hỗ trợ.');
  const aligned=selected!=='text';
  return{format:selected==='text'?'text':selected,segments:(selected==='text'?parsePlainText(value,language):parseTimed(value,language)).map(row=>({...row,aligned})),aligned,alignmentStatus:aligned?'cue-timed':'unaligned',private:true,verified:false};
}

export async function importTranscriptRescue({text,format='auto',language='en',url='',videoId=null,title='Imported transcript'}={}){
  const parsed=parseTranscriptImport({text,format,language});
  const row=await importTranscript({videoId:videoId||createV10Id('imported'),url,title,language,segments:parsed.segments,aligned:parsed.aligned,alignmentStatus:parsed.alignmentStatus});
  return{...row,importFormat:parsed.format,aligned:parsed.aligned,alignmentStatus:parsed.alignmentStatus};
}

export const __testing=Object.freeze({timestampMs,validateSegments});
