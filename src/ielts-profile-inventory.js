import { canonicalContentJson, validateHumanReviewRecord, validateProvenanceRecord, validateRightsRecord } from './content-contracts-v2.js';
import { createSourceRevisionRef, SOURCE_REVISION_REF_VERSION } from './source-revision-ref.js';
import { IELTS_READING_OBJECTIVE_TEXT_KINDS,IELTS_READING_MATCHING_KINDS } from './ielts-domain.js';
import { createObjectiveTextResponseOwnerAdapter,createObjectiveTextResponseQuestion } from './objective-text-response.js';
import { createObjectiveMatchingResponseOwnerAdapter,createObjectiveMatchingResponseQuestion } from './objective-matching-response.js';

export const IELTS_LISTENING_OBJECTIVE_TEXT_KINDS=Object.freeze(['listening-form-completion','listening-note-completion','listening-table-completion','listening-flow-chart-completion','listening-summary-completion','listening-sentence-completion','listening-short-answer']);
export const IELTS_LISTENING_MATCHING_KINDS=Object.freeze(['listening-matching','listening-plan-map-diagram-labelling']);

export const IELTS_OBJECTIVE_INVENTORY_KIND='ielts-objective-inventory-item';
export const IELTS_OBJECTIVE_INVENTORY_VERSION=1;
export const IELTS_OBJECTIVE_PROFILES=Object.freeze(['academic','general-training']);
export const IELTS_OBJECTIVE_SKILLS=Object.freeze(['reading','listening']);
export const IELTS_OBJECTIVE_INVENTORY_STATUSES=Object.freeze(['draft','verified','retired']);

const MAX_RECORD_BYTES=64*1024;
const MAX_EXTENSIONS_BYTES=16*1024;
const SAFE_TOKEN=/^[a-z0-9][a-z0-9._:-]{2,159}$/;
const SHA256=/^sha256:[a-f0-9]{64}$/;
const isoAt=value=>new Date(Number(value)).toISOString();
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const code=(code,message)=>Object.assign(new Error(message),{code});
const stable=(value)=>canonicalContentJson(value);
const byteLength=value=>new TextEncoder().encode(stable(value)).length;
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};

function ownData(value,path='$',seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return;
  if(typeof value==='number'){if(!Number.isFinite(value))throw new TypeError(`${path} must be finite.`);return;}
  if(typeof value!=='object')throw new TypeError(`${path} must be plain JSON data.`);
  if(seen.has(value))throw new TypeError(`${path} must not be cyclic.`);seen.add(value);
  if(Array.isArray(value)){
    if(Object.getOwnPropertySymbols(value).length||Object.keys(value).some(key=>!/^0$|^[1-9]\d*$/.test(key)))throw new TypeError(`${path} array has unsupported properties.`);
    for(let index=0;index<value.length;index++){const descriptor=Object.getOwnPropertyDescriptor(value,String(index));if(!descriptor||descriptor.get||descriptor.set)throw new TypeError(`${path} must contain data-only array entries.`);ownData(descriptor.value,`${path}[${index}]`,seen);}
  }else{
    const proto=Object.getPrototypeOf(value);if(proto!==Object.prototype&&proto!==null)throw new TypeError(`${path} must have a plain object prototype.`);
    if(Object.getOwnPropertySymbols(value).length)throw new TypeError(`${path} must not contain symbols.`);
    for(const key of Object.keys(value)){
      const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!descriptor||descriptor.get||descriptor.set)throw new TypeError(`${path}.${key} must be a data property.`);
      ownData(value[key],`${path}.${key}`,seen);
    }
  }
  seen.delete(value);
}

function cleanToken(value,label){if(typeof value!=='string'||!SAFE_TOKEN.test(value))throw new TypeError(`${label} must be a bounded stable token.`);return value;}
function positive(value,label){if(!Number.isSafeInteger(value)||value<1)throw new TypeError(`${label} must be a positive integer.`);return value;}
function digest(value,label){if(typeof value!=='string'||!SHA256.test(value))throw new TypeError(`${label} must be sha256:<64 lowercase hex>.`);return value;}
function timestamp(value,label,{required=false}={}){
  if(value==null){if(required)throw new TypeError(`${label} is required.`);return null;}
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))throw new TypeError(`${label} must be an exact ISO instant.`);const parsed=Date.parse(value);if(!Number.isFinite(parsed)||new Date(parsed).toISOString()!==value)throw new TypeError(`${label} must be an exact ISO instant.`);return value;
}
function string(value,label,{required=true,max=1_000}={}){if(value==null&&!required)return null;if(typeof value!=='string'||!value.trim()||value.length>max)throw new TypeError(`${label} must be a bounded non-empty string.`);return value;}

function rejectSensitive(value,path='$'){
  if(Array.isArray(value)){value.forEach((child,index)=>rejectSensitive(child,`${path}[${index}]`));return;}
  if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)){
    const normalized=key.replace(/[^a-z0-9]/gi,'').toLowerCase();
    if(/(?:^|(?:client|session|access|refresh|bearer|api|authorization)?)(?:secret|credential|credentials|password|token)(?:value|archive|backup|hash)?$/.test(normalized)||/(?:clientsecret|secretvalue|credentialvalue|passwordhash|bearertoken|sessiontoken|accesstoken|refreshtoken|apikey)/.test(normalized))throw new TypeError(`${path}.${key} is not permitted in inventory data.`);
    if(/(?:source|raw|caption|transcript|audio)(?:text|body|content|path|url)|(?:sourcepath|absolutepath|privatepath|filepath|mutableurl)/.test(normalized))throw new TypeError(`${path}.${key} is not permitted in inventory data.`);
    if(typeof child==='string'){const trimmed=child.trim();if(/^(?:file:\/\/|[a-z]:[\\/]|\\\\|\/)/i.test(trimmed)||/\b(?:authorization|bearer)\s+[a-z0-9._-]+/i.test(trimmed))throw new TypeError(`${path}.${key} contains private or credential material.`);}
    rejectSensitive(child,`${path}.${key}`);
  }
}

function correctSha256Hex(value=''){
  const bytes=new TextEncoder().encode(String(value));const words=[];const bitLength=bytes.length*8;for(let index=0;index<bytes.length;index++)words[index>>2]=(words[index>>2]||0)|(bytes[index]<<(24-(index%4)*8));words[bitLength>>5]=(words[bitLength>>5]||0)|(0x80<<(24-bitLength%32));words[(((bitLength+64)>>9)<<4)+15]=bitLength;
  const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2],rotate=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let offset=0;offset<words.length;offset+=16){const w=new Array(64);for(let i=0;i<16;i++)w[i]=words[offset+i]|0;for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2],s0=rotate(a,7)^rotate(a,18)^(a>>>3),s1=rotate(b,17)^rotate(b,19)^(b>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0;}let[a,b,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){const s1=rotate(e,6)^rotate(e,11)^rotate(e,25),ch=(e&f)^(~e&g),t1=(hh+s1+ch+k[i]+w[i])|0,s0=rotate(a,2)^rotate(a,13)^rotate(a,22),maj=(a&b)^(a&c)^(b&c),t2=(s0+maj)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}h[0]=(h[0]+a)|0;h[1]=(h[1]+b)|0;h[2]=(h[2]+c)|0;h[3]=(h[3]+d)|0;h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0;}return h.map(word=>(word>>>0).toString(16).padStart(8,'0')).join('');
}
function sha256(value){
  return `sha256:${correctSha256Hex(stable(value))}`;
}

function normalizeProfiles(skill,input){
  if(!Array.isArray(input)||input.some(value=>!IELTS_OBJECTIVE_PROFILES.includes(value)))throw new TypeError('profiles must contain only exact IELTS profiles.');
  if(skill==='reading'&&(input.length!==1||!['academic','general-training'].includes(input[0])))throw new TypeError('reading profiles must contain exactly academic or general-training.');
  if(skill==='listening'&&(input.length!==2||input[0]!=='academic'||input[1]!=='general-training'))throw new TypeError('listening profiles must be academic then general-training.');
  return [...input];
}

function normalizeSource(input){
  const ref=createSourceRevisionRef(input);
  if(ref.version!==SOURCE_REVISION_REF_VERSION)throw new TypeError('sourceRevisionRef must use the current SourceRevisionRef v1.');
  if(['active','latest','current'].includes(ref.revisionId.toLowerCase()))throw new TypeError('sourceRevisionRef revision must be exact, not an alias.');
  return structuredClone(ref);
}

function boundedText(value,label,max=240){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new TypeError(`${label} must be a bounded non-empty string.`);return value.trim();}
function normalizeBinding(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('questionBinding must be an object.');
  ownData(input,'questionBinding');
  const allowed=['kind','schemaVersion','registryRevision','questionId','promptRevision','promptDigest','keyRevision','keyDigest','rubricRevision','rubricDigest','scorer','reviewPolicyRevision','requiredCapabilities'];
  if(Object.keys(input).some(key=>!allowed.includes(key)))throw new TypeError('questionBinding contains unsupported fields.');
  if(!input.scorer||typeof input.scorer!=='object'||Array.isArray(input.scorer)||Object.keys(input.scorer).some(key=>!['id','version'].includes(key)))throw new TypeError('questionBinding.scorer must be exact.');
  if(!Array.isArray(input.requiredCapabilities)||input.requiredCapabilities.length>32)throw new TypeError('questionBinding.requiredCapabilities must be a bounded array.');
  const capabilities=[...new Set(input.requiredCapabilities.map(value=>cleanToken(value,'required capability')))];
  if(capabilities.length!==input.requiredCapabilities.length)throw new TypeError('questionBinding.requiredCapabilities must not contain duplicates.');
  return {kind:cleanToken(input.kind,'questionBinding.kind'),schemaVersion:positive(input.schemaVersion,'questionBinding.schemaVersion'),registryRevision:boundedText(input.registryRevision,'questionBinding.registryRevision'),questionId:cleanToken(input.questionId,'questionBinding.questionId'),promptRevision:boundedText(input.promptRevision,'questionBinding.promptRevision'),promptDigest:boundedText(input.promptDigest,'questionBinding.promptDigest'),keyRevision:boundedText(input.keyRevision,'questionBinding.keyRevision'),keyDigest:boundedText(input.keyDigest,'questionBinding.keyDigest'),rubricRevision:boundedText(input.rubricRevision,'questionBinding.rubricRevision'),rubricDigest:boundedText(input.rubricDigest,'questionBinding.rubricDigest'),scorer:{id:cleanToken(input.scorer.id,'questionBinding.scorer.id'),version:positive(input.scorer.version,'questionBinding.scorer.version')},reviewPolicyRevision:boundedText(input.reviewPolicyRevision,'questionBinding.reviewPolicyRevision'),requiredCapabilities:capabilities};
}

function validateOptionalApproval(input,at,{publication,scopeDigest}){
  if(input?.value==null)return null;
  const validators={rights:validateRightsRecord,provenance:validateProvenanceRecord,humanReview:validateHumanReviewRecord};
  const validator=validators[input.name];
  const result=input.name==='rights'?validator(input.value,{at,publication}):input.name==='humanReview'?validator(input.value,{publication,scopeDigest}):validator(input.value,{publication});
  if(!result.valid)throw new TypeError(result.errors.join(' '));return structuredClone(result.value);
}

function canonicalImmutable(value){return{skill:value.skill,profiles:value.profiles,form:value.form,section:value.section,order:value.order,itemId:value.itemId,itemRevision:value.itemRevision,sourceRevisionRef:value.sourceRevisionRef,questionBinding:value.questionBinding,questionPayload:value.questionPayload,extensions:value.extensions};}
export function deriveIeltsObjectiveInventoryId(input={}){
  ownData(input,'inventory identity');if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==7||!['skill','profiles','form','section','order','itemId','itemRevision'].every(key=>own(input,key)))throw new TypeError('inventory identity input must be exact.');
  const {skill,profiles,form,section,order,itemId,itemRevision}=input;
  if(!IELTS_OBJECTIVE_SKILLS.includes(skill))throw new TypeError('identity skill must be reading or listening.');const canonicalProfiles=normalizeProfiles(skill,profiles);
  if(!form||typeof form!=='object'||Array.isArray(form)||Object.keys(form).length!==2||!own(form,'id')||!own(form,'revision'))throw new TypeError('identity form must be exact.');
  if(!section||typeof section!=='object'||Array.isArray(section)||Object.keys(section).length!==3||!own(section,'id')||!own(section,'revision')||!own(section,'number'))throw new TypeError('identity section must be exact.');
  return `ielts-objective:${sha256({skill,profiles:canonicalProfiles,form:{id:cleanToken(form.id,'form.id'),revision:positive(form.revision,'form.revision')},section:{id:cleanToken(section.id,'section.id'),revision:positive(section.revision,'section.revision'),number:positive(section.number,'section.number')},order:positive(order,'order'),itemId:cleanToken(itemId,'itemId'),itemRevision:positive(itemRevision,'itemRevision')}).slice('sha256:'.length)}`;
}
function validateReadingObjectiveTextPayload(payload,{id,sourceRevisionRef,profiles,questionBinding}){
  const bindingOtr=IELTS_READING_OBJECTIVE_TEXT_KINDS.includes(questionBinding.kind),payloadOtr=IELTS_READING_OBJECTIVE_TEXT_KINDS.includes(payload?.kind);if(bindingOtr!==payloadOtr)throw new TypeError('Reading OTR payload and binding kinds must match exactly.');if(!bindingOtr)return;
  const spatial=payload?.kind==='reading-diagram-label-completion',keys=spatial?['id','kind','prompt','slots','spatialPrompt','target','sourceRevisionRef','createdAt','updatedAt']:['id','kind','prompt','slots','target','sourceRevisionRef','createdAt','updatedAt'];if(profiles.length!==1||!exactPayload(payload,keys)||payload.id!==id||payload.kind!==questionBinding.kind||canonicalContentJson(createSourceRevisionRef(payload.sourceRevisionRef))!==canonicalContentJson(sourceRevisionRef))throw new TypeError('Reading OTR private owner definition is invalid.');
  let question;try{question=createObjectiveTextResponseQuestion(payload,{ownerAdapter:createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>payload})});}catch{throw new TypeError('Reading OTR private owner definition is invalid.');}
  const expected={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};if(canonicalContentJson(questionBinding)!==canonicalContentJson(expected))throw new TypeError('Reading OTR binding must exactly match the accepted QAR projection.');
}
const READING_MATCHING_KINDS=Object.freeze([...IELTS_READING_MATCHING_KINDS,'reading-summary-completion-box']);
function validateReadingMatchingPayload(payload,{id,sourceRevisionRef,profiles,questionBinding}){
  const bindingMatching=READING_MATCHING_KINDS.includes(questionBinding.kind),payloadMatching=READING_MATCHING_KINDS.includes(payload?.kind);if(bindingMatching!==payloadMatching)throw new TypeError('Reading matching payload and binding kinds must match exactly.');if(!bindingMatching)return;
  if(profiles.length!==1||!exactPayload(payload,['id','kind','prompt','slots','options','reusePolicy','target','sourceRevisionRef','createdAt','updatedAt'])||payload.id!==id||payload.kind!==questionBinding.kind||canonicalContentJson(createSourceRevisionRef(payload.sourceRevisionRef))!==canonicalContentJson(sourceRevisionRef))throw new TypeError('Reading matching private owner definition is invalid.');
  let question;try{question=createObjectiveMatchingResponseQuestion(payload,{ownerAdapter:createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>payload})});}catch{throw new TypeError('Reading matching private owner definition is invalid.');}
  const expected={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};if(canonicalContentJson(questionBinding)!==canonicalContentJson(expected))throw new TypeError('Reading matching binding must exactly match the accepted QAR projection.');
}
function validateListeningObjectiveTextPayload(payload,{id,sourceRevisionRef,profiles,questionBinding}){
  const bindingOtr=IELTS_LISTENING_OBJECTIVE_TEXT_KINDS.includes(questionBinding.kind),payloadOtr=IELTS_LISTENING_OBJECTIVE_TEXT_KINDS.includes(payload?.kind);if(bindingOtr!==payloadOtr)throw new TypeError('Listening OTR payload and binding kinds must match exactly.');if(!bindingOtr)return;
  if(profiles.length!==2||profiles[0]!=='academic'||profiles[1]!=='general-training'||!exactPayload(payload,['id','kind','prompt','slots','target','sourceRevisionRef','createdAt','updatedAt'])||payload.id!==id||payload.kind!==questionBinding.kind||canonicalContentJson(createSourceRevisionRef(payload.sourceRevisionRef))!==canonicalContentJson(sourceRevisionRef))throw new TypeError('Listening OTR private owner definition is invalid.');
  let question;try{question=createObjectiveTextResponseQuestion(payload,{ownerAdapter:createObjectiveTextResponseOwnerAdapter({readVerifiedQuestion:()=>payload})});}catch{throw new TypeError('Listening OTR private owner definition is invalid.');}
  const expected={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};if(canonicalContentJson(questionBinding)!==canonicalContentJson(expected))throw new TypeError('Listening OTR binding must exactly match the accepted QAR projection.');
}
function validateListeningMatchingPayload(payload,{id,sourceRevisionRef,profiles,questionBinding}){
  const bindingMatching=IELTS_LISTENING_MATCHING_KINDS.includes(questionBinding.kind),payloadMatching=IELTS_LISTENING_MATCHING_KINDS.includes(payload?.kind);if(bindingMatching!==payloadMatching)throw new TypeError('Listening matching payload and binding kinds must match exactly.');if(!bindingMatching)return;
  const canonicalTranscriptRef=reference=>exactPayload(reference,['schema','version','kind','authority','sourceId','revisionId','integrity','locator','provenance','tombstone','display','extensions'])&&reference.schema==='SourceRevisionRef'&&reference.version===SOURCE_REVISION_REF_VERSION&&reference.kind==='transcript'&&reference.authority==='canonical-transcript-registry'&&exactPayload(reference.locator,['revisionId'])&&reference.locator.revisionId===reference.revisionId&&exactPayload(reference.provenance,['origin','verification','rights','privacy'])&&reference.provenance.verification==='verified'&&reference.provenance.rights==='allowed'&&reference.tombstone===null;
  const spatial=payload?.kind==='listening-plan-map-diagram-labelling',keys=spatial?['id','kind','prompt','slots','options','reusePolicy','spatialPrompt','target','sourceRevisionRef','createdAt','updatedAt']:['id','kind','prompt','slots','options','reusePolicy','target','sourceRevisionRef','createdAt','updatedAt'];if(profiles.length!==2||profiles[0]!=='academic'||profiles[1]!=='general-training'||!canonicalTranscriptRef(sourceRevisionRef)||!exactPayload(payload,keys)||payload.id!==id||payload.kind!==questionBinding.kind||canonicalContentJson(createSourceRevisionRef(payload.sourceRevisionRef))!==canonicalContentJson(sourceRevisionRef))throw new TypeError('Listening matching private owner definition is invalid.');
  let question;try{question=createObjectiveMatchingResponseQuestion(payload,{ownerAdapter:createObjectiveMatchingResponseOwnerAdapter({readVerifiedQuestion:()=>payload})});}catch{throw new TypeError('Listening matching private owner definition is invalid.');}
  const expected={kind:question.kind,schemaVersion:question.version,registryRevision:question.registryRevision,questionId:question.id,promptRevision:question.promptRevision,promptDigest:question.promptDigest,keyRevision:question.keyRevision,keyDigest:question.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scorer:question.scorer,reviewPolicyRevision:question.reviewPolicyRevision,requiredCapabilities:question.requiredCapabilities};if(canonicalContentJson(questionBinding)!==canonicalContentJson(expected))throw new TypeError('Listening matching binding must exactly match the accepted QAR projection.');
}
function exactPayload(value,keys){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>own(value,key));}

export function validateIeltsObjectiveInventoryItem(input={}, {at=Date.now(),historical=false}={}){
  const errors=[];let value=null;
  try{
    ownData(input,'inventory');
    const allowed=['id','kind','schemaVersion','itemId','itemRevision','skill','profiles','form','section','order','sourceRevisionRef','questionBinding','questionPayload','contentDigest','status','rights','provenance','humanReview','createdAt','verifiedAt','retiredAt','retirementReason','extensions'];
    if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!allowed.includes(key)))throw new TypeError('Inventory record contains unsupported fields.');
    if(input.kind!==IELTS_OBJECTIVE_INVENTORY_KIND)throw new TypeError('Inventory kind is invalid.');
    if(input.schemaVersion!==IELTS_OBJECTIVE_INVENTORY_VERSION)throw code(Number(input.schemaVersion)>IELTS_OBJECTIVE_INVENTORY_VERSION?'IELTS_INVENTORY_UNSUPPORTED_VERSION':'IELTS_INVENTORY_INVALID','Inventory schema version is unsupported.');
    const skill=IELTS_OBJECTIVE_SKILLS.includes(input.skill)?input.skill:(()=>{throw new TypeError('skill must be reading or listening.');})();
    const profiles=normalizeProfiles(skill,input.profiles);
    const form=input.form,section=input.section;
    if(!form||typeof form!=='object'||Object.keys(form).some(key=>!['id','revision'].includes(key)))throw new TypeError('form must be exact.');
    if(!section||typeof section!=='object'||Object.keys(section).some(key=>!['id','revision','number'].includes(key)))throw new TypeError('section must be exact.');
    const extensions=input.extensions??{};ownData(extensions,'extensions');if(!extensions||typeof extensions!=='object'||Array.isArray(extensions)||byteLength(extensions)>MAX_EXTENSIONS_BYTES)throw new TypeError('extensions must be a bounded object.');
    const questionPayload=input.questionPayload;ownData(questionPayload,'questionPayload');if(!questionPayload||typeof questionPayload!=='object'||Array.isArray(questionPayload))throw new TypeError('questionPayload must be plain data.');
    rejectSensitive({questionPayload,extensions},'inventory');
    const questionBinding=normalizeBinding(input.questionBinding);
    if(questionPayload.questionBinding!==undefined&&canonicalContentJson(normalizeBinding(questionPayload.questionBinding))!==canonicalContentJson(questionBinding))throw new TypeError('questionPayload.questionBinding must exactly mirror questionBinding when supplied.');
    const base={kind:IELTS_OBJECTIVE_INVENTORY_KIND,schemaVersion:IELTS_OBJECTIVE_INVENTORY_VERSION,itemId:cleanToken(input.itemId,'itemId'),itemRevision:positive(input.itemRevision,'itemRevision'),skill,profiles,form:{id:cleanToken(form.id,'form.id'),revision:positive(form.revision,'form.revision')},section:{id:cleanToken(section.id,'section.id'),revision:positive(section.revision,'section.revision'),number:positive(section.number,'section.number')},order:positive(input.order,'order'),sourceRevisionRef:normalizeSource(input.sourceRevisionRef),questionBinding,questionPayload:structuredClone(questionPayload),extensions:structuredClone(extensions)};
    if(byteLength(base)>MAX_RECORD_BYTES)throw new TypeError('Inventory record exceeds 64KiB.');
    const id=deriveIeltsObjectiveInventoryId({skill:base.skill,profiles:base.profiles,form:base.form,section:base.section,order:base.order,itemId:base.itemId,itemRevision:base.itemRevision});
    if(input.id!=null&&input.id!==id)throw new TypeError('Inventory id does not match deterministic identity.');
    const contentDigest=sha256(canonicalImmutable(base));
    if(skill==='reading'){validateReadingObjectiveTextPayload(base.questionPayload,{id,sourceRevisionRef:base.sourceRevisionRef,profiles:base.profiles,questionBinding:base.questionBinding});validateReadingMatchingPayload(base.questionPayload,{id,sourceRevisionRef:base.sourceRevisionRef,profiles:base.profiles,questionBinding:base.questionBinding});}
    if(skill==='listening'){validateListeningObjectiveTextPayload(base.questionPayload,{id,sourceRevisionRef:base.sourceRevisionRef,profiles:base.profiles,questionBinding:base.questionBinding});validateListeningMatchingPayload(base.questionPayload,{id,sourceRevisionRef:base.sourceRevisionRef,profiles:base.profiles,questionBinding:base.questionBinding});}
    if(input.contentDigest!=null&&input.contentDigest!==contentDigest)throw new TypeError('contentDigest does not match immutable inventory content.');
    const status=IELTS_OBJECTIVE_INVENTORY_STATUSES.includes(input.status)?input.status:(()=>{throw new TypeError('Inventory status is invalid.');})();
    const createdAt=timestamp(input.createdAt,'createdAt',{required:true});const verifiedAt=timestamp(input.verifiedAt,'verifiedAt');const retiredAt=timestamp(input.retiredAt,'retiredAt');const retirementReason=string(input.retirementReason,'retirementReason',{required:false,max:500});
    const publication=status!=='draft',approvalAt=historical&&verifiedAt?Date.parse(verifiedAt):Number(at);
    const rights=validateOptionalApproval({name:'rights',value:input.rights},approvalAt,{publication,scopeDigest:contentDigest});
    const provenance=validateOptionalApproval({name:'provenance',value:input.provenance},approvalAt,{publication,scopeDigest:contentDigest});
    const humanReview=validateOptionalApproval({name:'humanReview',value:input.humanReview},approvalAt,{publication,scopeDigest:contentDigest});
    if(status==='draft'&&(verifiedAt||retiredAt||retirementReason))throw new TypeError('Draft inventory cannot have lifecycle completion fields.');
    if(status==='verified'&&(!rights||!provenance||!humanReview||!verifiedAt||retiredAt||retirementReason))throw new TypeError('Verified inventory requires publication approvals and verifiedAt only.');
    if(status==='retired'&&(!rights||!provenance||!humanReview||!verifiedAt||!retiredAt||!retirementReason))throw new TypeError('Retired inventory preserves approvals and requires retirement metadata.');
    if((verifiedAt&&createdAt>verifiedAt)||(retiredAt&&(!verifiedAt||verifiedAt>retiredAt)))throw new TypeError('Inventory lifecycle timestamps are out of order.');
    value={id,kind:base.kind,schemaVersion:base.schemaVersion,itemId:base.itemId,itemRevision:base.itemRevision,skill:base.skill,profiles:base.profiles,form:base.form,section:base.section,order:base.order,sourceRevisionRef:base.sourceRevisionRef,questionBinding:base.questionBinding,questionPayload:base.questionPayload,contentDigest,status,rights,provenance,humanReview,createdAt,verifiedAt,retiredAt,retirementReason,extensions:base.extensions};
    if(byteLength(value)>MAX_RECORD_BYTES)throw new TypeError('Inventory record exceeds 64KiB.');
    value=deepFreeze(structuredClone(value));
  }catch(error){errors.push(error?.message||'Inventory validation failed.');}
  return{valid:errors.length===0,errors,value:errors.length?null:value};
}

export function createIeltsObjectiveInventoryItem(input={},options={}){
  const result=validateIeltsObjectiveInventoryItem(input,options);
  if(!result.valid)throw code(result.errors.some(error=>/future|unsupported/i.test(error))?'IELTS_INVENTORY_UNSUPPORTED_VERSION':'IELTS_INVENTORY_INVALID',result.errors.join(' '));
  return result.value;
}

export function transitionIeltsObjectiveInventoryItem(current,transition={}){
  const checked=validateIeltsObjectiveInventoryItem(current,{at:transition.at??Date.now(),historical:true});
  if(!checked.valid)throw code('IELTS_INVENTORY_INVALID',checked.errors.join(' '));
  if(checked.value.status!=='verified'||transition.status!=='retired')throw code('IELTS_INVENTORY_LIFECYCLE_CONFLICT','Only VERIFIED inventory may transition to RETIRED.');
  const at=transition.at??Date.now();let retiredAt;try{retiredAt=isoAt(at);}catch{throw code('IELTS_INVENTORY_INVALID','retirement at must be valid.');}const next={...checked.value,status:'retired',retiredAt,retirementReason:string(transition.reason,'reason',{max:500})};
  return createIeltsObjectiveInventoryItem(next,{at,historical:true});
}
