import { learningContractDigest } from './learning-contracts.js';

export const OBJECTIVE_SPATIAL_PROMPT_SCHEMA='objective-spatial-prompt';
export const OBJECTIVE_SPATIAL_PROMPT_VERSION=1;
const MAX_BYTES=32_768;
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const invalid=()=>{throw new TypeError('ObjectiveSpatialPrompt v1 is invalid.');};
const plain=value=>{try{return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));}catch{return false;}};
const nonblank=(value,max)=>typeof value==='string'&&value.trim().length>0&&value.length<=max;
const integer=value=>Number.isSafeInteger(value);
const unsafeKey=key=>{const normalized=key.replace(/[^a-z0-9]/gi,'').toLowerCase();return /^(html|rawhtml|svg|rawsvg|url|uri|css|style|class|script|foreignobject|eventhandler|on[a-z]+|api(key|secret|token)?|access(token)?|clientsecret(value)?|authorization(header)?|credential(value)?|password(hash)?|bearertoken|token|private(key|path)|file(path)?|absolute(path)?|source(body|text|content))$/.test(normalized);};

function descriptors(value){
  try{if(Object.getOwnPropertySymbols(value).length)return null;return Object.getOwnPropertyDescriptors(value);}catch{return null;}
}
function record(value,keys){
  if(!plain(value))return null;const found=descriptors(value);if(!found)return null;const actual=Object.keys(found);
  if(actual.length!==keys.length||!keys.every(key=>own(found,key)&&own(found[key],'value'))||actual.some(unsafeKey))return null;
  return found;
}
function array(value){
  if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)return null;const found=descriptors(value);if(!found||!own(found,'length')||!own(found.length,'value')||!Number.isSafeInteger(found.length.value)||found.length.value<0)return null;
  const keys=Object.keys(found).filter(key=>key!=='length');if(keys.length!==found.length.value||!keys.every((key,index)=>key===String(index)&&own(found[key],'value')))return null;
  return Array.from({length:found.length.value},(_,index)=>found[String(index)].value);
}
function safeTree(value,seen=new Set(),depth=0){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number')return Number.isFinite(value)?value:null;
  if(typeof value!=='object'||depth>50||seen.has(value))return null;
  if(Array.isArray(value)){const rows=array(value);if(!rows)return null;seen.add(value);const output=[];for(const row of rows){const next=safeTree(row,seen,depth+1);if(next===null&&row!==null){seen.delete(value);return null;}output.push(next);}seen.delete(value);return output;}
  if(!plain(value))return null;const found=descriptors(value);if(!found)return null;seen.add(value);const output={};for(const key of Object.keys(found)){if(unsafeKey(key)||!own(found[key],'value')){seen.delete(value);return null;}const next=safeTree(found[key].value,seen,depth+1);if(next===null&&found[key].value!==null){seen.delete(value);return null;}output[key]=next;}seen.delete(value);return output;
}
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
function point(value,width,height){const row=record(value,['x','y']);return Boolean(row)&&integer(row.x.value)&&integer(row.y.value)&&row.x.value>=0&&row.x.value<=width&&row.y.value>=0&&row.y.value<=height;}
function canonicalElement(value,width,height){
  if(!plain(value))return null;const base=descriptors(value);if(!base||Object.keys(base).some(unsafeKey)||!own(base,'id')||!own(base,'kind')||!own(base.id,'value')||!own(base.kind,'value')||!nonblank(base.id.value,120)||typeof base.kind.value!=='string')return null;
  if(base.kind.value==='line'){const row=record(value,['id','kind','x1','y1','x2','y2']);if(!row||![row.x1.value,row.y1.value,row.x2.value,row.y2.value].every(integer)||row.x1.value<0||row.x1.value>width||row.x2.value<0||row.x2.value>width||row.y1.value<0||row.y1.value>height||row.y2.value<0||row.y2.value>height)return null;return {id:row.id.value,kind:'line',x1:row.x1.value,y1:row.y1.value,x2:row.x2.value,y2:row.y2.value};}
  if(base.kind.value==='rect'){const row=record(value,['id','kind','x','y','width','height','label']);if(!row||!point({x:row.x.value,y:row.y.value},width,height)||!integer(row.width.value)||!integer(row.height.value)||row.width.value<1||row.height.value<1||row.x.value+row.width.value>width||row.y.value+row.height.value>height||!nonblank(row.label.value,500))return null;return {id:row.id.value,kind:'rect',x:row.x.value,y:row.y.value,width:row.width.value,height:row.height.value,label:row.label.value};}
  if(base.kind.value==='text'){const row=record(value,['id','kind','x','y','text']);if(!row||!point({x:row.x.value,y:row.y.value},width,height)||!nonblank(row.text.value,500))return null;return {id:row.id.value,kind:'text',x:row.x.value,y:row.y.value,text:row.text.value};}
  if(base.kind.value==='polyline'){const row=record(value,['id','kind','points','closed']),points=row&&array(row.points.value);if(!row||!points||points.length<2||points.length>64||typeof row.closed.value!=='boolean')return null;const canonical=[];for(const item of points){if(!point(item,width,height))return null;const pointRow=record(item,['x','y']);canonical.push({x:pointRow.x.value,y:pointRow.y.value});}return {id:row.id.value,kind:'polyline',points:canonical,closed:row.closed.value};}
  return null;
}

export function createObjectiveSpatialPrompt(input,{slotIds}={}){
  const root=record(input,['schema','version','mode','title','description','width','height','elements','anchors']);
  if(!root||root.schema.value!==OBJECTIVE_SPATIAL_PROMPT_SCHEMA||root.version.value!==OBJECTIVE_SPATIAL_PROMPT_VERSION||!['diagram','plan','map'].includes(root.mode.value)||!nonblank(root.title.value,240)||!nonblank(root.description.value,4000)||!integer(root.width.value)||!integer(root.height.value)||root.width.value<1||root.width.value>2000||root.height.value<1||root.height.value>2000||!Array.isArray(slotIds))invalid();
  const safeInput=safeTree(input);if(!safeInput)invalid();const suppliedSlots=array(slotIds);if(!suppliedSlots||suppliedSlots.some(value=>!nonblank(value,180))||new Set(suppliedSlots).size!==suppliedSlots.length)invalid();
  const rawElements=array(root.elements.value),rawAnchors=array(root.anchors.value);if(!rawElements||rawElements.length<1||rawElements.length>128||!rawAnchors||rawAnchors.length!==suppliedSlots.length)invalid();
  const ids=new Set(),elements=[];for(const item of rawElements){const element=canonicalElement(item,root.width.value,root.height.value);if(!element||ids.has(element.id))invalid();ids.add(element.id);elements.push(element);}
  const anchors=[];const anchorIds=new Set();for(let index=0;index<rawAnchors.length;index++){const row=record(rawAnchors[index],['slotId','x','y','label']);if(!row||row.slotId.value!==suppliedSlots[index]||anchorIds.has(row.slotId.value)||!point({x:row.x.value,y:row.y.value},root.width.value,root.height.value)||!nonblank(row.label.value,240))invalid();anchorIds.add(row.slotId.value);anchors.push({slotId:row.slotId.value,x:row.x.value,y:row.y.value,label:row.label.value});}
  const output={schema:OBJECTIVE_SPATIAL_PROMPT_SCHEMA,version:OBJECTIVE_SPATIAL_PROMPT_VERSION,mode:root.mode.value,title:root.title.value,description:root.description.value,width:root.width.value,height:root.height.value,elements,anchors};
  if(new TextEncoder().encode(JSON.stringify(output)).length>MAX_BYTES)invalid();return freeze(output);
}

export const objectiveSpatialPromptDigest=learningContractDigest;
