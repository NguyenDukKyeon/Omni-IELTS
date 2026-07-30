import { learningContractDigest } from './learning-contracts.js';
import { normalizeCaptureCandidate } from './v10-contracts.js';

export const CAPTURE_ITEM_VERSION=1;
export const CAPTURE_SOURCE_TYPES=Object.freeze(['quick-capture','manual','import','video','reading','ielts','retell','lexical-set','legacy-capture']);
export const CAPTURE_TRANSITIONS=Object.freeze({
  captured:new Set(['needs-review','ready','rejected']),
  'needs-review':new Set(['ready','rejected']),
  ready:new Set(['finalizing','rejected']),
  finalizing:new Set(['linked','quarantined']),
  quarantined:new Set(['finalizing','rejected']),
  linked:new Set(),
  rejected:new Set()
});

const clone=value=>value==null?value:structuredClone(value);

export function assessCaptureQuality(input={}){
  const issues=[];
  if(!String(input.term||'').trim())issues.push('missing-term');
  if(!String(input.proposedMeaning||'').trim())issues.push('missing-meaning');
  const occurrence=input.sourceOccurrence||{};
  if(!String(occurrence.sourceType||'').trim())issues.push('missing-source-type');
  if(!String(occurrence.sourceId||'').trim())issues.push('missing-source-id');
  if(!String(occurrence.context||'').trim())issues.push('missing-source-context');
  if(String(input.term||'').length>240)issues.push('term-too-long');
  if(String(input.proposedMeaning||'').length>500)issues.push('meaning-too-long');
  return Object.freeze({eligible:issues.length===0,issues:Object.freeze(issues)});
}

export function createCaptureItem(input={}){
  const candidate=normalizeCaptureCandidate(input);
  const assessed=assessCaptureQuality(candidate);
  const issues=[...new Set([...assessed.issues,...(Array.isArray(input.quality?.issues)?input.quality.issues:[])])];
  if(String(input.term||'').length>240&&!issues.includes('term-too-long'))issues.push('term-too-long');
  if(String(input.proposedMeaning??input.meaning??'').length>500&&!issues.includes('meaning-too-long'))issues.push('meaning-too-long');
  const quality={eligible:issues.length===0,issues};
  const requested=candidate.status;
  const status=candidate.duplicateOfCardId&&['captured','needs-review'].includes(requested)
    ?'needs-review'
    :quality.eligible&&['captured','ready'].includes(requested)?'ready':requested;
  const item={
    ...candidate,
    schemaVersion:CAPTURE_ITEM_VERSION,
    kind:'capture-item',
    quality:{eligible:quality.eligible,issues:[...quality.issues],checkedAt:Number(input.quality?.checkedAt||input.updatedAt||input.createdAt||Date.now())},
    stateReason:input.stateReason?String(input.stateReason).slice(0,240):null,
    status
  };
  item.finalizeKey=`capture-finalize:${item.id}:${learningContractDigest({
    term:item.term,
    proposedMeaning:item.proposedMeaning,
    proposedType:item.proposedType,
    sourceOccurrence:item.sourceOccurrence
  })}`;
  return item;
}

export function transitionCaptureItem(input,nextStatus,{now=Date.now(),reason=null}={}){
  const current=createCaptureItem(input);
  const next=String(nextStatus||'');
  if(current.status===next)return current;
  if(!CAPTURE_TRANSITIONS[current.status]?.has(next)){
    throw Object.assign(new Error(`CaptureItem không thể chuyển ${current.status} → ${next}.`),{
      code:'CAPTURE_STATE_TRANSITION_INVALID',
      captureItemId:current.id,
      from:current.status,
      to:next
    });
  }
  if(['ready','finalizing','linked'].includes(next)&&!current.quality.eligible){
    throw Object.assign(new Error('CaptureItem chưa vượt quality gate.'),{
      code:'CAPTURE_QUALITY_GATE_FAILED',
      captureItemId:current.id,
      issues:clone(current.quality.issues)
    });
  }
  return{
    ...current,
    status:next,
    stateReason:reason?String(reason).slice(0,240):null,
    updatedAt:Number(now)
  };
}

export function assertCaptureFinalization(input){
  const item=createCaptureItem(input);
  if(!['ready','finalizing','linked'].includes(item.status))throw Object.assign(new Error('CaptureItem chưa sẵn sàng để finalize.'),{
    code:'CAPTURE_NOT_READY',
    captureItemId:item.id,
    status:item.status,
    issues:clone(item.quality.issues)
  });
  if(!item.quality.eligible)throw Object.assign(new Error('CaptureItem không đạt quality gate.'),{code:'CAPTURE_QUALITY_GATE_FAILED',captureItemId:item.id});
  return item;
}
