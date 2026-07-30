import { learningContractDigest } from './learning-contracts.js';

export const CAPTION_NORMALIZER_VERSION=1;
const clean=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
const key=value=>clean(value).normalize('NFKC').toLocaleLowerCase();
const suffixOverlap=(left,right)=>{const a=key(left).split(' '),b=key(right).split(' ');for(let count=Math.min(a.length,b.length);count>0;count-=1)if(a.slice(-count).join(' ')===b.slice(0,count).join(' '))return count;return 0;};

export function normalizeRawCues(rawCues=[],{sourceId='source',language='en',normalizerVersion=CAPTION_NORMALIZER_VERSION}={}){
  const ordered=(Array.isArray(rawCues)?rawCues:[]).map((cue,index)=>({rawId:String(cue.id||`cue-${index+1}`),startMs:Math.max(0,Number(cue.startMs??cue.start??0)),endMs:Math.max(0,Number(cue.endMs??cue.end??0)),text:clean(cue.text),speaker:clean(cue.speaker)||null,language:clean(cue.language||language,32)||language,index})).filter(cue=>cue.text&&cue.endMs>cue.startMs).sort((a,b)=>a.startMs-b.startMs||a.endMs-b.endMs||a.index-b.index);
  const output=[];const rawIds=[];
  for(const cue of ordered){
    const previous=output.at(-1);const repeated=previous&&key(previous.text)===key(cue.text)&&cue.startMs<=previous.endMs+800;
    if(repeated){previous.endMs=Math.max(previous.endMs,cue.endMs);previous.rawCueIds.push(cue.rawId);continue;}
    const overlap=previous&&cue.speaker===previous.speaker&&cue.startMs<=previous.endMs+1600?suffixOverlap(previous.text,cue.text):0;
    const words=cue.text.split(' ');
    if(overlap&&overlap<words.length){previous.text=`${previous.text} ${words.slice(overlap).join(' ')}`;previous.endMs=Math.max(previous.endMs,cue.endMs);previous.rawCueIds.push(cue.rawId);continue;}
    const row={startMs:cue.startMs,endMs:cue.endMs,text:cue.text,speaker:cue.speaker,language:cue.language,rawCueIds:[cue.rawId]};output.push(row);rawIds.push(cue.rawId);
  }
  const sentences=output.map((row,index)=>{
    const lineage=learningContractDigest({sourceId,normalizerVersion,startMs:row.startMs,endMs:row.endMs,text:key(row.text),speaker:row.speaker,language:row.language});
    return Object.freeze({...row,id:`sentence:${sourceId}:${lineage}`,lineageId:`lineage:${sourceId}:${lineage}`,order:index,normalizerVersion});
  });
  const startMs=sentences[0]?.startMs??null,endMs=sentences.at(-1)?.endMs??null,coveredMs=sentences.reduce((sum,row)=>sum+row.endMs-row.startMs,0);
  return Object.freeze({normalizerVersion,sentences:Object.freeze(sentences),coverage:Object.freeze({startMs,endMs,coveredMs,complete:false,gaps:[]}),rawCueCount:ordered.length});
}
