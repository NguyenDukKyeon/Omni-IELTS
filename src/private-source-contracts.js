import { createSourceRevisionRef } from './source-revision-ref.js';

export const PRIVATE_SOURCE_STORE='privateSources';
export const PRIVATE_SOURCE_MAX_BYTES=262144;
export const PRIVATE_SOURCE_MAX_HEADS=100;
export const PRIVATE_SOURCE_MAX_TOTAL_BYTES=16777216;
export const PRIVATE_SOURCE_MAX_RECORDS=10000;
export const PRIVATE_SOURCE_KINDS=Object.freeze(['private-source-head','private-source-revision','private-source-approval','private-source-finding','private-source-tombstone']);
export const PRIVATE_SOURCE_FINDINGS=Object.freeze(['malformed-content','policy-warning','integrity-warning']);
const encoder=new TextEncoder();
const sha256Hex=value=>{
  const bytes=encoder.encode(String(value)),words=[],bitLength=bytes.length*8;
  for(let index=0;index<bytes.length;index++)words[index>>2]=(words[index>>2]||0)|(bytes[index]<<(24-(index%4)*8));
  words[bitLength>>5]=(words[bitLength>>5]||0)|(0x80<<(24-bitLength%32));words[(((bitLength+64)>>9)<<4)+15]=bitLength;
  const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const rotate=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let offset=0;offset<words.length;offset+=16){const w=new Array(64);for(let i=0;i<16;i++)w[i]=words[offset+i]|0;for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2],s0=rotate(a,7)^rotate(a,18)^(a>>>3),s1=rotate(b,17)^rotate(b,19)^(b>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0;}let[a,b,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){const s1=rotate(e,6)^rotate(e,11)^rotate(e,25),ch=(e&f)^(~e&g),t1=(hh+s1+ch+k[i]+w[i])|0,s0=rotate(a,2)^rotate(a,13)^rotate(a,22),maj=(a&b)^(a&c)^(b&c),t2=(s0+maj)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}h[0]=(h[0]+a)|0;h[1]=(h[1]+b)|0;h[2]=(h[2]+c)|0;h[3]=(h[3]+d)|0;h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0;}
  return h.map(word=>(word>>>0).toString(16).padStart(8,'0')).join('');
};
const SOURCE_ID=/^private-source:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export class PrivateSourceError extends Error { constructor(code,message=code){super(message);this.name='PrivateSourceError';this.code=code;} }
export const fail=(code,message)=>{throw new PrivateSourceError(code,message);};
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
function safe(value,path='input',seen=new Set()){
  if(value===null||['string','boolean','number'].includes(typeof value)){if(typeof value==='number'&&!Number.isFinite(value))fail('INVALID_INPUT',`${path} must be finite`);return;}
  if(typeof value!=='object'||seen.has(value)||Array.isArray(value)&&Object.keys(value).some(key=>!/^\d+$/.test(key)))fail('INVALID_INPUT',`${path} must be data only`);
  if(!Array.isArray(value)&&!plain(value))fail('INVALID_INPUT',`${path} must be a plain object`);seen.add(value);
  for(const key of Reflect.ownKeys(value)){if(typeof key!=='string'||Object.getOwnPropertyDescriptor(value,key)?.get||Object.getOwnPropertyDescriptor(value,key)?.set)fail('INVALID_INPUT',`${path} has unsafe fields`);safe(value[key],`${path}.${key}`,seen);}seen.delete(value);
}
const time=(value,name)=>{if(!Number.isSafeInteger(value)||value<0)fail('INVALID_INPUT',`${name} must be a non-negative safe integer`);return value;};
const id=(value,name)=>{if(typeof value!=='string'||!value||value.length>240)fail('INVALID_INPUT',`${name} is invalid`);return value;};
const sourceIdentity=value=>{if(!SOURCE_ID.test(value))fail('INVALID_INPUT','sourceId must be a private UUID-v4');return value;};
export function normalizePrivateSourceInput(input,{edit=false}={}){
  safe(input);if(!plain(input))fail('INVALID_INPUT');const allowed=new Set(edit?['sourceId','title','text','expectedRevisionId','updatedAt']:['sourceId','title','text','createdAt']);
  if(Object.keys(input).some(key=>!allowed.has(key)))fail('INVALID_INPUT','Unknown private source field');
  const title=typeof input.title==='string'?input.title.replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim():'';
  if(!title||title.length>200)fail('INVALID_INPUT','Title must be one to 200 characters');
  const text=typeof input.text==='string'?input.text.replace(/\r\n?/g,'\n'):null;
  if(text===null||!text.trim()||/\0|[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text))fail('INVALID_INPUT','Text is invalid');
  const utf8Bytes=encoder.encode(text).length;if(utf8Bytes>PRIVATE_SOURCE_MAX_BYTES)fail('QUOTA_EXCEEDED','Text exceeds 256 KiB');
  const sourceId=sourceIdentity(input.sourceId);const at=time(input[edit?'updatedAt':'createdAt'],edit?'updatedAt':'createdAt');
  const expectedRevisionId=edit?id(input.expectedRevisionId,'expectedRevisionId'):null;
  return{sourceId,title,text,utf8Bytes,textDigest:`sha256:${sha256Hex(text)}`,at,expectedRevisionId};
}
export function createPrivateSourceRef(revision){return createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'private-text-source',authority:'private-source-library',sourceId:revision.sourceId,revisionId:revision.id,integrity:revision.textDigest,locator:{sourceId:revision.sourceId,revisionId:revision.id,textDigest:revision.textDigest},provenance:{origin:'private-user-paste',verification:'unverified',rights:'unknown',privacy:'private'},tombstone:null,display:{},extensions:{}});}
const fields=Object.freeze({
  'private-source-head':['kind','id','sourceId','currentRevisionId','revisionCount','state','currentApprovalId','createdAt','updatedAt'],
  'private-source-revision':['kind','id','sourceId','revisionNumber','parentRevisionId','title','text','textDigest','utf8Bytes','sourceRevisionRef','createdAt'],
  'private-source-approval':['kind','id','sourceId','revisionId','status','scope','approvedAt'],
  'private-source-finding':['kind','id','sourceId','revisionId','code','severity','message','createdAt'],
  'private-source-tombstone':['kind','id','sourceId','lastRevisionId','lastTextDigest','deletedAt','reason']
});
const exact=(row,kind)=>Object.keys(row).length===fields[kind].length&&fields[kind].every(key=>Object.hasOwn(row,key));
export function validatePrivateSourceStore(rows=[]){
  safe(rows);if(!Array.isArray(rows)||rows.length>PRIVATE_SOURCE_MAX_RECORDS)fail(rows.length>PRIVATE_SOURCE_MAX_RECORDS?'RECORD_LIMIT':'CORRUPT_OWNER');
  const heads=new Map(), revisions=new Map(), tombstones=new Map(), approvals=[], findings=[];const ids=new Set();let bytes=0;
  for(const row of rows){if(!plain(row)||!PRIVATE_SOURCE_KINDS.includes(row.kind)||!exact(row,row.kind)||typeof row.id!=='string'||ids.has(row.id))fail('CORRUPT_OWNER');ids.add(row.id);try{sourceIdentity(row.sourceId);}catch{fail('CORRUPT_OWNER');}
    if(row.kind==='private-source-head'){if(row.id!==row.sourceId||heads.has(row.sourceId)||!['draft','approved-private','quarantined'].includes(row.state)||!Number.isSafeInteger(row.revisionCount)||row.revisionCount<1||!Number.isSafeInteger(row.createdAt)||row.createdAt<0||!Number.isSafeInteger(row.updatedAt)||row.updatedAt<row.createdAt||!(row.currentApprovalId===null||typeof row.currentApprovalId==='string'))fail('CORRUPT_OWNER');heads.set(row.sourceId,row);}
    if(row.kind==='private-source-revision'){let canonicalRef;try{canonicalRef=createSourceRevisionRef(row.sourceRevisionRef);}catch{fail('CORRUPT_OWNER');}if(!Number.isSafeInteger(row.revisionNumber)||row.revisionNumber<1||row.id!==`${row.sourceId}:revision:${row.revisionNumber}`||typeof row.title!=='string'||!row.title||row.title!==row.title.replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim()||row.title.length>200||typeof row.text!=='string'||!row.text.trim()||/\0|[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(row.text)||encoder.encode(row.text).length>PRIVATE_SOURCE_MAX_BYTES||row.textDigest!==`sha256:${sha256Hex(row.text)}`||encoder.encode(row.text).length!==row.utf8Bytes||!Number.isSafeInteger(row.createdAt)||row.createdAt<0||JSON.stringify(canonicalRef)!==JSON.stringify(createPrivateSourceRef(row)))fail('CORRUPT_OWNER');revisions.set(row.id,row);bytes+=row.utf8Bytes;}
    if(row.kind==='private-source-tombstone'){if(row.id!==row.sourceId||tombstones.has(row.sourceId)||row.reason!=='user-delete'||!Number.isSafeInteger(row.deletedAt)||row.deletedAt<0||row.lastRevisionId!==`${row.sourceId}:revision:${Number(row.lastRevisionId.split(':').at(-1))}`||!Number.isSafeInteger(Number(row.lastRevisionId.split(':').at(-1)))||Number(row.lastRevisionId.split(':').at(-1))<1||!/^sha256:[0-9a-f]{64}$/.test(row.lastTextDigest))fail('CORRUPT_OWNER');tombstones.set(row.sourceId,row);}
    if(row.kind==='private-source-approval'){if(row.status!=='approved-private'||row.scope!=='private-library-only'||!Number.isSafeInteger(row.approvedAt)||row.approvedAt<0)fail('CORRUPT_OWNER');approvals.push(row);}
    if(row.kind==='private-source-finding'){const mapping={'malformed-content':['error','Nội dung không hợp lệ.'],'policy-warning':['warning','Nguồn chỉ được dùng trong Thư viện riêng tư.'],'integrity-warning':['error','Không thể xác minh tính toàn vẹn của nguồn.']}[row.code];if(!mapping||row.severity!==mapping[0]||row.message!==mapping[1]||!Number.isSafeInteger(row.createdAt)||row.createdAt<0)fail('CORRUPT_OWNER');findings.push(row);}
  }
  if(heads.size>PRIVATE_SOURCE_MAX_HEADS)fail('SOURCE_LIMIT');if(bytes>PRIVATE_SOURCE_MAX_TOTAL_BYTES)fail('QUOTA_EXCEEDED');
  for(const [sourceId,head] of heads){const owned=[...revisions.values()].filter(revision=>revision.sourceId===sourceId);if(owned.length!==head.revisionCount||tombstones.has(sourceId)||!revisions.has(head.currentRevisionId)||head.currentRevisionId!==`${sourceId}:revision:${head.revisionCount}`)fail('CORRUPT_OWNER');let priorTime=-1;for(let n=1;n<=head.revisionCount;n++){const revision=revisions.get(`${sourceId}:revision:${n}`);if(!revision||revision.parentRevisionId!==(n===1?null:`${sourceId}:revision:${n-1}`)||revision.createdAt<priorTime||(n===1&&revision.createdAt!==head.createdAt)||head.updatedAt<revision.createdAt)fail('CORRUPT_OWNER');priorTime=revision.createdAt;}const current=revisions.get(head.currentRevisionId);if(head.updatedAt<current.createdAt||approvals.some(approval=>approval.sourceId===sourceId&&head.updatedAt<approval.approvedAt)||findings.some(finding=>finding.sourceId===sourceId&&head.updatedAt<finding.createdAt))fail('CORRUPT_OWNER');const currentApproval=approvals.find(a=>a.id===`${sourceId}:approval:${head.revisionCount}`&&a.revisionId===head.currentRevisionId&&a.sourceId===sourceId);if(head.state==='approved-private'&&(!currentApproval||head.currentApprovalId!==currentApproval.id))fail('CORRUPT_OWNER');if(head.state!=='approved-private'&&head.currentApprovalId!==null)fail('CORRUPT_OWNER');if(head.state==='quarantined'&&!findings.some(f=>f.revisionId===head.currentRevisionId&&f.sourceId===sourceId))fail('CORRUPT_OWNER');}
  for(const revision of revisions.values())if(!heads.has(revision.sourceId))fail('CORRUPT_OWNER');for(const approval of approvals){const revision=revisions.get(approval.revisionId);if(!revision||approval.sourceId!==revision.sourceId||approval.id!==`${approval.sourceId}:approval:${revision.revisionNumber}`||approval.approvedAt<revision.createdAt)fail('CORRUPT_OWNER');}for(const finding of findings){const revision=revisions.get(finding.revisionId);if(!revision||finding.sourceId!==revision.sourceId||finding.id!==`${finding.sourceId}:finding:${revision.revisionNumber}:${finding.code}`||finding.createdAt<revision.createdAt)fail('CORRUPT_OWNER');}
  return true;
}
