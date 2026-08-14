import { getDueSkillItems,requiredSkillsForCard,skillHasReviews,getCardRetrievability } from './fsrs-scheduler.js';
import { IELTS_STORE_NAMES,ieltsSourceRevision } from './ielts-domain.js';
import { getIeltsRecord,listIeltsRecords } from './ielts-persistence.js';
import { evidenceDigest } from './evidence-policy.js';
import { coreSourceRevision } from './schedule-gateway.js';
import { V10_STORES,normalizeActivity } from './v10-contracts.js';
import { getV10Record,listV10Records,putV10Records } from './v10-persistence.js';
import { composeTodayPlan,dateKeyInTimezone } from './today-composer.js';
import { composeRepairQueue,importLegacyErrorRecord } from './error-repository.js';
import { cancelTodayRun,launchTodayActivity,listTodayRuns,registerTodayExecutor,skipTodayRun } from './today-runner.js';
import { contentTodayInventory,openContentLesson } from './content-platform.js';
import { loadCanonicalProgressProjection } from './progress.js';
import { FOCUS_REASON_CODE,selectCanonicalFocus,validateFocusSelectionBinding } from './focus-selector.js';
import { isCompleteLearningTarget,learningContractDigest } from './learning-contracts.js';

const PLAN_VERSION='phase1-today-v2';
const READY_EXECUTORS=new Set(['core-card','core-intro','ielts-error','repair','content','sentences']);
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const core=()=>globalThis.VocabMasterApp?.getState?.()||{cards:[],settings:{minutes:10,newLimit:5},fsrsConfig:{}};
const activeCards=()=>core().cards.filter(card=>!card.suspendedAt&&!card.archivedAt);
let todayActionTail=Promise.resolve();
let pendingTodayRenders=0;
let todayStatus={message:'',kind:'neutral'};
let executorsRegistered=false;

export function localDateKey(now=Date.now()){
  return dateKeyInTimezone(now,core().settings?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC');
}

function stableRevision(prefix,value){
  return`${prefix}:${evidenceDigest(JSON.stringify(value))}`;
}

function errorRevision(error={}){
  return ieltsSourceRevision('ielts-error-v1',{
    id:error.id,correction:error.correction||error.expectedResponse||'',linkedCardIds:error.linkedCardIds||[],lastSeenAt:error.lastSeenAt
  });
}

function assetRevision(row={}){
  return stableRevision('v10-content-asset-v1',{
    id:row.id,lessonId:row.lessonId,assetType:row.assetType,status:row.status,updatedAt:row.updatedAt,data:row.data
  });
}

function cardTarget(card,skill=null){
  return{
    cardId:card.id,
    senseId:card.senseId||null,
    skill,
    sourceId:`core-card:${card.id}`,
    sourceRevision:coreSourceRevision(card)
  };
}

function sourceTarget({sourceId,sourceRevision,cardId=null,senseId=null,skill=null}){
  return{cardId,senseId,skill,sourceId,sourceRevision};
}

function exactActivity(input,kind){
  return normalizeActivity({...input,execution:{kind,status:'ready',reason:null}});
}

function blockedActivity(input,reason='missing-exact-executor'){
  return normalizeActivity({
    ...input,
    evidencePolicy:{affectsSchedule:false,reason},
    execution:{kind:'blocked',status:'blocked',reason}
  });
}

function cardPriority(card,skill,now,config){
  const reviewed=skillHasReviews(card,skill);
  const retrievability=reviewed?getCardRetrievability(card,now,config,skill):0;
  const due=Number(card.fsrsBySkill?.[skill]?.due||card.dueAt||0);
  const overdue=due&&due<now?Math.min(40,(now-due)/86_400_000*5):0;
  return 100+overdue+(1-retrievability)*30;
}

function activityId(date,type,sourceId='',cardIds=[]){
  return`today:${date}:${type}:${sourceId||cardIds.join(',')||'general'}`;
}

const FOCUS_PROJECTION_MAX_DEPTH=100;
const FOCUS_PROJECTION_MAX_NODES=10_000;

function ownDataValue(value,key){
  try{
    if(!value||typeof value!=='object'||Array.isArray(value))return{valid:false,present:false,value:undefined};
    const descriptor=Object.getOwnPropertyDescriptor(value,key);
    if(!descriptor)return{valid:true,present:false,value:undefined};
    if(!Object.hasOwn(descriptor,'value'))return{valid:false,present:true,value:undefined};
    return{valid:true,present:true,value:descriptor.value};
  }catch{return{valid:false,present:false,value:undefined};}
}

function focusMarkerState(activity){
  if(!activity||typeof activity!=='object'||Array.isArray(activity))return{valid:true,marked:false};
  const top=ownDataValue(activity,'reasonCode');if(!top.valid)return{valid:false,marked:false};
  let marked=top.value===FOCUS_REASON_CODE;
  const payload=ownDataValue(activity,'payload');if(!payload.valid)return{valid:false,marked:false};
  if(payload.present&&payload.value!=null){
    const reason=ownDataValue(payload.value,'reasonCode'),selection=ownDataValue(payload.value,'focusSelection');
    if(!reason.valid||!selection.valid)return{valid:false,marked:false};
    marked||=reason.value===FOCUS_REASON_CODE||selection.present;
  }
  const spec=ownDataValue(activity,'activitySpec');if(!spec.valid)return{valid:false,marked:false};
  if(spec.present&&spec.value!=null){
    const metadata=ownDataValue(spec.value,'metadata');if(!metadata.valid)return{valid:false,marked:false};
    if(metadata.present&&metadata.value!=null){
      const reason=ownDataValue(metadata.value,'reasonCode'),payload=ownDataValue(metadata.value,'payload');
      if(!reason.valid||!payload.valid)return{valid:false,marked:false};
      marked||=reason.value===FOCUS_REASON_CODE;
      if(payload.present&&payload.value!=null){
        const selection=ownDataValue(payload.value,'focusSelection');if(!selection.valid)return{valid:false,marked:false};
        marked||=selection.present;
      }
    }
  }
  return{valid:true,marked};
}

function safeFocusProjectionData(value,{seen=new Set(),depth=0,count={value:0}}={}){
  if(value===null||typeof value==='string'||typeof value==='boolean')return true;
  if(typeof value==='number')return Number.isFinite(value)&&Math.abs(value)<=Number.MAX_SAFE_INTEGER;
  if(typeof value!=='object'||depth>FOCUS_PROJECTION_MAX_DEPTH||++count.value>FOCUS_PROJECTION_MAX_NODES||seen.has(value))return false;
  try{
    if(Object.getOwnPropertySymbols(value).length)return false;
    if(Array.isArray(value)){
      const names=Object.getOwnPropertyNames(value);if(names.length!==value.length+1||!names.includes('length'))return false;
      seen.add(value);
      for(let index=0;index<value.length;index++){
        const descriptor=Object.getOwnPropertyDescriptor(value,String(index));
        if(!descriptor||!Object.hasOwn(descriptor,'value')||!safeFocusProjectionData(descriptor.value,{seen,depth:depth+1,count})){seen.delete(value);return false;}
      }
      seen.delete(value);return true;
    }
    const prototype=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==null)return false;
    seen.add(value);
    for(const key of Object.getOwnPropertyNames(value)){
      const descriptor=Object.getOwnPropertyDescriptor(value,key);
      if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,'value')||!safeFocusProjectionData(descriptor.value,{seen,depth:depth+1,count})){seen.delete(value);return false;}
    }
    seen.delete(value);return true;
  }catch{return false;}
}

function canonicalProjectionValue(value){
  if(Array.isArray(value))return value.map(canonicalProjectionValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalProjectionValue(value[key])]));
  return value;
}

function launchProjection(activity={}){
  const marker=focusMarkerState(activity);
  if(!marker.valid||(marker.marked&&!safeFocusProjectionData(activity)))return null;
  const focus=marker.marked;
  return{
    id:activity.id,type:activity.type,sourceType:activity.sourceType,sourceId:activity.sourceId,
    cardIds:activity.cardIds||[],target:activity.target||null,execution:activity.execution||null,
    payload:focus?canonicalProjectionValue(activity.payload||{}):activity.payload||{},evidencePolicy:activity.evidencePolicy||{},planId:activity.planId||null,
    planDate:activity.planDate||null,plannedAt:Number(activity.plannedAt||0),timezone:activity.timezone||'UTC',
    reasonCode:activity.reasonCode||null,activitySpec:focus?canonicalProjectionValue(activity.activitySpec):activity.activitySpec||null
  };
}

export function activityLaunchBinding(activity={}){
  return evidenceDigest(JSON.stringify(launchProjection(activity)));
}

function projectFocusCandidates(activities=[]){
  return activities
    .filter(row=>(row.type==='error-correction'||!['card-review','new-card'].includes(row.type))&&row.execution?.status==='ready'&&isCompleteLearningTarget(row.target)&&row.target?.skill)
    .map(row=>({
      id:row.id,type:row.type,target:row.target,executor:row.execution?.kind,estimatedSeconds:row.estimatedSeconds,
      category:row.type==='error-correction'?'repair':'content',originReasonCode:row.reasonCode||(row.type==='error-correction'?'error-repair':'available-content')
    }));
}

function planResult(activities,budgetSeconds){
  const estimatedSeconds=activities.reduce((sum,row)=>sum+Number(row.estimatedSeconds||0),0);
  return{
    activities,estimatedSeconds,budgetSeconds,
    coverage:{
      cards:activities.filter(row=>row.cardIds.length).length,
      errors:activities.filter(row=>row.type==='error-correction').length,
      listening:activities.filter(row=>row.type==='dictation').length,
      coaching:activities.filter(row=>!row.evidencePolicy?.affectsSchedule).length,
      content:activities.filter(row=>['reading','paraphrase'].includes(row.type)||row.sourceType==='personal-content').length
    }
  };
}

async function resumeTodayPlan(date,budgetSeconds){
  const rows=(await listV10Records(V10_STORES.activities,{sortBy:null}).catch(()=>[]))
    .filter(row=>row.planDate===date&&row.planId&&row.payload?.planVersion===PLAN_VERSION&&row.launchBinding);
  const groups=new Map();
  for(const row of rows){
    const marker=focusMarkerState(row);
    if(!marker.valid||(marker.marked&&!safeFocusProjectionData(row)))continue;
    const normalized=normalizeActivity(row);
    if(activityLaunchBinding(normalized)!==normalized.launchBinding)continue;
    if(marker.marked&&!validateFocusSelectionBinding(normalized.payload?.focusSelection,{activity:normalized}).valid)continue;
    const group=groups.get(normalized.planId)||[];
    group.push(normalized);groups.set(normalized.planId,group);
  }
  const complete=[...groups.values()].filter(group=>{
    const expected=Number(group[0]?.payload?.planCount||0);
    return expected>0&&group.length===expected&&group.every(row=>Number(row.payload?.planCount||0)===expected);
  }).sort((left,right)=>Number(right[0]?.plannedAt||0)-Number(left[0]?.plannedAt||0));
  const activities=complete[0]?.sort((a,b)=>Number(a.payload?.planOrder||0)-Number(b.payload?.planOrder||0))||[];
  return activities.length?planResult(activities,budgetSeconds):null;
}

export async function buildTodayActivityPlan({minutes=null,maxActivities=18,force=false,now=Date.now()}={}){
  const state=core();
  const timeZone=state.settings?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  const date=dateKeyInTimezone(now,timeZone);
  const budgetSeconds=Math.max(180,Number(minutes??state.settings?.minutes??10)*60);
  if(!force){
    const resumed=await resumeTodayPlan(date,budgetSeconds);
    if(resumed)return resumed;
  }

  const cards=activeCards();
  const activities=[];
  const due=getDueSkillItems(cards,now,state.fsrsConfig)||[];
  for(const row of due){
    const card=cards.find(item=>item.id===(row.cardId||row.card?.id))||row.card;
    if(!card)continue;
    const skill=row.skill||card.nextSkill||requiredSkillsForCard(card)[0]||'recognition';
    activities.push(exactActivity({
      id:activityId(date,'card-review',`${card.id}:${skill}`,[card.id]),
      type:'card-review',cardIds:[card.id],target:cardTarget(card,skill),
      estimatedSeconds:skill==='production'?75:skill==='listening'?48:40,
      priority:cardPriority(card,skill,now,state.fsrsConfig),dueAt:row.dueAt||card.dueAt,
      payload:{label:`${card.front} · ${skill}`},
      evidencePolicy:{affectsSchedule:true,skill,requiresIndependentRetrieval:true}
    },'core-card'));
  }

  const newLimit=Math.max(0,Number(state.settings?.newLimit||0));
  for(const card of cards.filter(item=>item.status==='new').slice(0,newLimit)){
    activities.push(exactActivity({
      id:activityId(date,'new-card',card.id,[card.id]),type:'new-card',cardIds:[card.id],
      target:cardTarget(card,'recognition'),estimatedSeconds:55,priority:55,payload:{label:`Làm quen ${card.front}`},
      evidencePolicy:{affectsSchedule:false,reason:'new-card-introduction-is-coaching'}
    },'core-intro'));
  }

  const legacyErrors=await listIeltsRecords(IELTS_STORE_NAMES.errors,{sortBy:'lastSeenAt'}).catch(()=>[]);
  for(const legacyError of legacyErrors)await importLegacyErrorRecord(legacyError).catch(()=>null);
  const[repairs,mediaProgress,readings,labs,sentenceProgress,remoteContent,personalAssets]=await Promise.all([
    composeRepairQueue({now,limit:3,perTargetCap:1}).catch(()=>[]),
    listIeltsRecords(IELTS_STORE_NAMES.mediaProgress,{sortBy:'updatedAt'}).catch(()=>[]),
    listIeltsRecords(IELTS_STORE_NAMES.readingPassages,{sortBy:'updatedAt'}).catch(()=>[]),
    listIeltsRecords(IELTS_STORE_NAMES.labItems,{sortBy:'updatedAt'}).catch(()=>[]),
    listV10Records(V10_STORES.sentenceProgress,{sortBy:'updatedAt'}).catch(()=>[]),
    contentTodayInventory().catch(()=>[]),
    listV10Records(V10_STORES.contentAssets,{sortBy:'updatedAt'}).then(rows=>rows.filter(row=>row.lessonId==='personal-next-session')).catch(()=>[])
  ]);

  for(const repair of repairs){
    const error=await getV10Record(V10_STORES.globalErrorRecords,repair.errorRecordId);
    if(!error)continue;
    const legacyId=error.legacyAliases?.[0]||null;
    const legacyError=legacyId?legacyErrors.find(row=>row.id===legacyId)||await getIeltsRecord(IELTS_STORE_NAMES.errors,legacyId):null;
    const cardId=repair.target?.cardId||`error-record:${error.id}`;
    const card=cards.find(row=>row.id===cardId);
    const plannedTarget=legacyError
      ?sourceTarget({cardId,senseId:card?.senseId||null,skill:repair.target?.skill||'production',sourceId:`ielts-error:${legacyError.id}`,sourceRevision:errorRevision(legacyError)})
      :sourceTarget({...repair.target,cardId,senseId:repair.target?.senseId||card?.senseId||null});
    activities.push(exactActivity({
      id:activityId(date,'error-correction',error.id,[cardId].filter(Boolean)),type:'error-correction',
      sourceType:'error',sourceId:error.id,cardIds:[cardId].filter(Boolean),
      target:plannedTarget,
      estimatedSeconds:55,priority:90+Math.min(20,Number(error.totalOccurrences||1)*3),
      payload:{errorRecordId:error.id,errorId:legacyId,label:`Sửa lỗi: ${error.category}`},
      evidencePolicy:{affectsSchedule:false,reason:'repair-requires-independent-correction-evidence'}
    },legacyId?'ielts-error':'repair'));
  }

  const weakSentenceIds=new Set(sentenceProgress.filter(row=>row.weak).map(row=>row.sentenceId));
  for(const progress of mediaProgress.filter(row=>(row.weakSegmentIds||[]).length).slice(0,2)){
    const count=(progress.weakSegmentIds||[]).filter(id=>!weakSentenceIds.size||weakSentenceIds.has(id)).length||progress.weakSegmentIds.length;
    const target=sourceTarget({
      sourceId:`ielts-media:${progress.mediaSourceId}`,
      sourceRevision:stableRevision('ielts-media-progress-v1',{mediaSourceId:progress.mediaSourceId,weakSegmentIds:progress.weakSegmentIds||[],updatedAt:progress.updatedAt})
    });
    activities.push(blockedActivity({
      id:activityId(date,'dictation',progress.mediaSourceId),type:'dictation',sourceType:'media',sourceId:progress.mediaSourceId,
      target,estimatedSeconds:Math.min(240,Math.max(60,count*48)),priority:88,payload:{label:`Ôn ${count} câu nghe yếu`}
    },'media-segment-exact-executor-not-supported'));
    activities.push(blockedActivity({
      id:activityId(date,'shadowing',progress.mediaSourceId),type:'shadowing',sourceType:'media',sourceId:progress.mediaSourceId,
      target,estimatedSeconds:Math.min(180,Math.max(45,count*35)),priority:48,payload:{label:`Shadowing ${Math.min(3,count)} câu yếu`}
    },'media-segment-exact-executor-not-supported'));
  }

  const verifiedReading=readings.find(row=>row.status==='verified');
  if(verifiedReading)activities.push(blockedActivity({
    id:activityId(date,'reading',verifiedReading.id),type:'reading',sourceType:'reading',sourceId:verifiedReading.id,
    target:sourceTarget({sourceId:`ielts-reading:${verifiedReading.id}`,sourceRevision:stableRevision('ielts-reading-v1',{id:verifiedReading.id,status:verifiedReading.status,updatedAt:verifiedReading.updatedAt})}),
    estimatedSeconds:180,priority:45,payload:{label:`Reading: ${verifiedReading.title}`}
  },'reading-exact-executor-not-supported'));

  const verifiedLab=labs.find(row=>row.status==='verified');
  if(verifiedLab)activities.push(blockedActivity({
    id:activityId(date,'paraphrase',verifiedLab.id,verifiedLab.sourceCardIds),type:'paraphrase',sourceType:'lab',sourceId:verifiedLab.id,
    cardIds:verifiedLab.sourceCardIds||[],
    target:sourceTarget({sourceId:`ielts-lab:${verifiedLab.id}`,sourceRevision:stableRevision('ielts-lab-v1',{id:verifiedLab.id,status:verifiedLab.status,updatedAt:verifiedLab.updatedAt})}),
    estimatedSeconds:75,priority:52,payload:{label:'Paraphrase & distractor'}
  },'paraphrase-exact-executor-not-supported'));

  for(const inventory of remoteContent)activities.push(exactActivity({
    id:activityId(date,inventory.type,inventory.id),type:inventory.type,sourceType:'content',sourceId:inventory.lessonId,
    target:sourceTarget(inventory.target),
    estimatedSeconds:inventory.estimatedSeconds,priority:42,payload:inventory.payload,
    evidencePolicy:{affectsSchedule:false,reason:'content-open-is-coaching'}
  },'content'));

  for(const asset of personalAssets.slice(0,4)){
    if(asset.assetType==='personal-error'&&asset.data){
      activities.push(blockedActivity({
        id:activityId(date,'error-correction',asset.id,asset.data.linkedCardIds),type:'error-correction',
        sourceType:'personal-content',sourceId:asset.id,cardIds:asset.data.linkedCardIds||[],
        target:sourceTarget({sourceId:`v10-content-asset:${asset.id}`,sourceRevision:assetRevision(asset)}),
        estimatedSeconds:55,priority:84,payload:{label:`Bài sửa lỗi đã chuẩn bị: ${asset.data.answer||asset.data.prompt}`}
      },'prepared-error-exact-executor-not-supported'));
    }
    if(asset.assetType==='personal-sentences'&&Array.isArray(asset.data)&&asset.data.length){
      const targetIds=[...new Set(asset.data.flatMap(row=>(row.targets||[]).map(target=>target.cardId)).filter(Boolean))];
      activities.push(exactActivity({
        id:activityId(date,'dictation',asset.id,targetIds),type:'dictation',sourceType:'personal-content',sourceId:asset.id,
        cardIds:targetIds,target:sourceTarget({sourceId:`v10-content-asset:${asset.id}`,sourceRevision:assetRevision(asset)}),
        estimatedSeconds:Math.min(180,asset.data.length*55),priority:58,
        payload:{
          label:'Câu transfer đã chuẩn bị cho hôm nay',
          sentences:asset.data.map(row=>({
            id:row.id,text:row.text,status:'needs-review',verified:false,
            lexicalTargets:(row.targets||[]).map(target=>({term:target.term,meaning:target.meaning,type:String(target.term||'').includes(' ')?'collocation':'word'})),
            linkedCardIds:(row.targets||[]).map(target=>target.cardId).filter(Boolean)
          }))
        },
      evidencePolicy:{affectsSchedule:false,reason:'personal-ai-content-is-validated-but-not-source-verified'}
      },'sentences'));
    }
  }

  const productionCards=cards
    .filter(card=>card.status!=='new'&&card.learningGoal==='active'&&requiredSkillsForCard(card).includes('production'))
    .sort((a,b)=>Number(a.fsrsBySkill?.production?.due||0)-Number(b.fsrsBySkill?.production?.due||0))
    .slice(0,3);
  for(const card of productionCards){
    if(activities.some(row=>row.type==='card-review'&&row.target?.cardId===card.id&&row.target?.skill==='production'))continue;
    activities.push(exactActivity({
      id:activityId(date,'production',`${card.id}:production`,[card.id]),type:'production',cardIds:[card.id],
      target:cardTarget(card,'production'),estimatedSeconds:75,priority:50,payload:{label:`Production với ${card.front}`},
      evidencePolicy:{affectsSchedule:true,skill:'production',requiresIndependentRetrieval:true}
    },'core-card'));
  }

  const toComposerRow=row=>({
    id:row.id,type:row.type,target:row.target,executor:row.execution?.kind,
    estimatedSeconds:row.estimatedSeconds,priority:row.priority,dueAt:row.dueAt,sourceId:row.sourceId,payload:row.payload
  });
  let focusDecision=null;
  try{
    const profile=await loadCanonicalProgressProjection({timeZone});
    const candidates=projectFocusCandidates(activities);
    focusDecision=selectCanonicalFocus({weaknessProfile:profile.weaknessProfile,candidates,acceptedExecutors:[...READY_EXECUTORS],dayKey:date});
  }catch(cause){
    if(cause?.code==='FOCUS_INVALID_INPUT')throw cause;
  }
  const composed=composeTodayPlan({
    dueReviews:activities.filter(row=>row.type==='card-review').map(toComposerRow),
    repairs:activities.filter(row=>row.type==='error-correction').map(toComposerRow),
    content:activities.filter(row=>!['card-review','error-correction','new-card'].includes(row.type)).map(toComposerRow),
    newCards:activities.filter(row=>row.type==='new-card').map(toComposerRow),
    minutes:Number(minutes??state.settings?.minutes??10),
    maxActivities,
    repairCap:3,
    focusDecision,
    timezone:state.settings?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',
    now
  });
  const byId=new Map(activities.map(row=>[row.id,row]));
  const finalized=composed.activities.map((plannedActivity,index)=>{
    const row=byId.get(plannedActivity.id);
    const planned=normalizeActivity({
      ...row,planId:composed.planId,planDate:composed.planDate,plannedAt:Number(now),timezone:composed.timezone,
      reasonCode:plannedActivity.reasonCode,activitySpec:plannedActivity.activitySpec,
      payload:{...row.payload,...plannedActivity.payload,planVersion:PLAN_VERSION,planOrder:index,planCount:composed.activities.length,reasonCode:plannedActivity.reasonCode}
    });
    const durable=normalizeActivity(planned);
    return {...durable,launchBinding:activityLaunchBinding(durable)};
  });
  if(finalized.length)await putV10Records(V10_STORES.activities,finalized,'today-plan-built');
  return planResult(finalized,budgetSeconds);
}

function activityIcon(type){
  return({'card-review':'🧠','new-card':'🌱',dictation:'🎧',shadowing:'🎙️','error-correction':'🛠️',reading:'📖',paraphrase:'🔁',production:'✍️'})[type]||'•';
}

function launchError(code,message){
  return Object.assign(new Error(message),{code,productFailure:true});
}

async function durableActivity(displayed){
  const raw=await getV10Record(V10_STORES.activities,displayed.id);
  const marker=focusMarkerState(raw);
  if(!marker.valid||(marker.marked&&!safeFocusProjectionData(raw)))throw launchError('TODAY_FOCUS_BINDING_INVALID','Focus binding invalid; refresh the plan.');
  const stored=normalizeActivity(raw);
  if(!stored.id||!stored.launchBinding)throw launchError('TODAY_PLAN_MISSING','Không tìm thấy durable Today activity.');
  if(marker.marked&&!validateFocusSelectionBinding(stored.payload?.focusSelection,{activity:stored}).valid)throw launchError('TODAY_FOCUS_BINDING_INVALID','Focus binding invalid; refresh the plan.');
  if(stored.launchBinding!==displayed.launchBinding||activityLaunchBinding(stored)!==stored.launchBinding)throw launchError('TODAY_PLAN_BINDING_MISMATCH','Today activity đã thay đổi sau khi render; hãy làm mới kế hoạch.');
  if(stored.planDate!==localDateKey())throw launchError('TODAY_PLAN_STALE','Today activity thuộc ngày khác; hãy làm mới kế hoạch.');
  return stored;
}

async function executeActivityTarget(activity){
  if(activity.execution?.status!=='ready'||!READY_EXECUTORS.has(activity.execution.kind))throw launchError('TODAY_EXECUTOR_UNSUPPORTED','Hoạt động này đang coaching-only hoặc chưa có exact executor an toàn.');
  if(activity.execution.kind==='core-card'||activity.execution.kind==='core-intro'){
    const result=globalThis.VocabMasterApp?.startPlannedActivity?.(activity);
    if(!result?.started)throw launchError(result?.code||'TODAY_CORE_LAUNCH_FAILED',result?.message||'Không thể mở exact Core target.');
    return result;
  }
  if(activity.execution.kind==='ielts-error'){
    const result=await globalThis.VocabMasterIeltsLab?.openErrorTarget?.({
      errorId:activity.payload.errorId,sourceId:activity.target?.sourceId,sourceRevision:activity.target?.sourceRevision
    });
    if(!result?.opened)throw launchError(result?.code||'TODAY_ERROR_LAUNCH_FAILED',result?.message||'Không thể mở exact error target.');
    return result;
  }
  if(activity.execution.kind==='repair'){
    globalThis.dispatchEvent(new CustomEvent('vocab:v10-open-error-repair',{detail:{errorRecordId:activity.payload.errorRecordId,activityId:activity.id,plannedTarget:activity.target}}));
    return{started:true,activityId:activity.id,target:activity.target};
  }
  if(activity.execution.kind==='content'){
    const row=await getV10Record(V10_STORES.contentManifests,activity.payload.contentId);
    if(!row||row.qualityStatus!=='verified'||row.installState!=='installed')throw launchError('TODAY_SOURCE_STALE','Content target không còn installed và verified.');
    const exact=row.activities?.find(candidate=>candidate.id===activity.payload.activityId);
    if(
      !exact
      ||activity.payload.packId!==row.packId
      ||Number(activity.payload.packRevision)!==Number(row.packRevision)
      ||Number(activity.payload.lessonRevision)!==Number(row.contentRevision)
      ||['cardId','senseId','skill','sourceId','sourceRevision'].some(field=>activity.target?.[field]!==exact.target?.[field])
    )throw launchError('TODAY_REVISION_STALE','Content target đã thay đổi sau khi lập kế hoạch.');
    await openContentLesson(row.id);
    return{started:true,activityId:activity.id,target:activity.target};
  }
  const asset=await getV10Record(V10_STORES.contentAssets,activity.sourceId);
  if(!asset||activity.target?.sourceId!==`v10-content-asset:${asset.id}`||activity.target?.sourceRevision!==assetRevision(asset))throw launchError('TODAY_REVISION_STALE','Sentence target đã thay đổi sau khi lập kế hoạch.');
  globalThis.dispatchEvent(new CustomEvent('vocab:v10-open-sentence-loop',{detail:{
    activityId:activity.id,plannedTarget:activity.target,sourceId:asset.id,sourceType:activity.sourceType,
    title:activity.payload.label,sentences:activity.payload.sentences
  }}));
  return{started:true,activityId:activity.id,target:activity.target};
}

function ensureTodayExecutors(){
  if(executorsRegistered)return;
  executorsRegistered=true;
  for(const kind of READY_EXECUTORS)registerTodayExecutor(kind,({activity})=>executeActivityTarget(activity));
}

function todayTabId(){
  const storage=globalThis.sessionStorage;
  if(!storage)return'default-tab';
  const key='vocab-master-today-tab-id';
  let id=storage.getItem(key);
  if(!id){id=globalThis.crypto?.randomUUID?.()||`today-tab-${Date.now()}`;storage.setItem(key,id);}
  return id;
}

async function launchActivity(displayed){
  const activity=await durableActivity(displayed);
  ensureTodayExecutors();
  const launched=await launchTodayActivity(activity,{tabId:todayTabId()});
  return launched.result||launched;
}

function applyTodayStatus(){
  const node=document.querySelector('#v10TodayStatus');
  if(node){node.textContent=todayStatus.message;node.dataset.kind=todayStatus.kind;}
}

function setTodayStatus(message='',kind='neutral'){
  todayStatus={message:String(message||''),kind:String(kind||'neutral')};
  applyTodayStatus();
}

function setTodayRenderBusy(busy){
  const host=document.querySelector('#v10TodayPlan');if(!host)return;
  host.setAttribute('aria-busy',String(Boolean(busy)));
  if(busy){
    host.onclick=null;
    host.querySelectorAll('button').forEach(button=>{button.disabled=true;});
    return;
  }
  const refresh=host.querySelector('#v10RefreshPlan');if(refresh)refresh.disabled=false;
  const morePractice=host.querySelector('#v10MorePractice');if(morePractice)morePractice.disabled=false;
}

function enqueueTodayAction(operation){
  const task=todayActionTail.catch(()=>undefined).then(operation);
  todayActionTail=task;
  return task;
}

function enqueueRender(options={}){
  pendingTodayRenders+=1;
  setTodayRenderBusy(true);
  const task=enqueueTodayAction(()=>renderPlan(options));
  return task.finally(()=>{
    pendingTodayRenders-=1;
    setTodayRenderBusy(pendingTodayRenders>0);
  });
}

function enqueueLaunch(activity){
  return enqueueTodayAction(()=>launchActivity(activity));
}

async function renderPlan({force=false,degraded=false}={}){
  const host=document.querySelector('#v10TodayPlan');if(!host)return;
  if(degraded){
    host.innerHTML='<div class="v10-today-head"><div><p class="eyebrow">TODAY · SAFE MODE</p><h3>Today tạm dừng trong Core-only degraded mode</h3><p>Không mở phiên học vì V10 durable plan/target verification không khả dụng. Quick Capture vẫn dùng adapter degraded đã verify.</p></div></div><p id="v10TodayStatus" data-kind="error">Không có schedule write hoặc RAM-only fallback.</p>';
    setTodayStatus('Không có schedule write hoặc RAM-only fallback.','error');
    return;
  }
  const plan=await buildTodayActivityPlan({force});
  const minutes=Math.max(1,Math.round(plan.estimatedSeconds/60));
  const firstReady=plan.activities.find(row=>row.execution?.status==='ready');
  host.innerHTML=`<div class="v10-today-head"><div><p class="eyebrow">CANONICAL TODAY</p><h3>Phiên exact-target ${minutes} phút</h3><p>Mỗi launcher được bind vào durable activity, card/sense/skill/source revision; target stale sẽ fail closed.</p></div><div><button class="secondary-button" id="v10MorePractice">Luyện thêm</button><button class="secondary-button" id="v10RefreshPlan">Lập kế hoạch mới</button><button class="primary-button" id="v10StartPlan" ${firstReady?'':'disabled'}>Bắt đầu target khả dụng đầu tiên</button></div></div><div class="v10-activity-strip">${plan.activities.length?plan.activities.map((row,index)=>`<button data-v10-activity="${escape(row.id)}" data-focus-reason="${row.reasonCode===FOCUS_REASON_CODE?'observed-weakness-focus':''}" data-today-execution="${escape(row.execution?.status||'blocked')}" ${row.execution?.status==='ready'?'':'disabled'}><span>${activityIcon(row.type)}</span><strong>${escape(row.payload?.label||row.type)}</strong><small>${row.reasonCode===FOCUS_REASON_CODE?'Focus · ':''}${Math.max(1,Math.round(row.estimatedSeconds/60))} phút · ${row.execution?.status==='ready'?(row.evidencePolicy?.affectsSchedule?'exact evidence target':'exact coaching target'):`blocked: ${escape(row.execution?.reason||'unsupported')}`}</small><em>${index+1}</em></button>`).join(''):'<p class="muted">Chưa có exact activity. Không mở phiên tổng hợp thay thế.</p>'}</div><p id="v10TodayStatus" aria-live="polite"></p><small class="v10-plan-coverage">${plan.coverage.cards} hoạt động gắn card · ${plan.coverage.errors} lỗi · ${plan.coverage.listening} nghe · ${plan.coverage.coaching} coaching · ${plan.coverage.content} content</small>`;
  applyTodayStatus();
  host.dataset.activities=JSON.stringify(plan.activities.map(row=>row.id));
  const byId=new Map(plan.activities.map(row=>[row.id,row]));
  host.onclick=event=>{
    const button=event.target.closest('[data-v10-activity]');
    if(!button)return;
    const activity=byId.get(button.dataset.v10Activity);
    void enqueueLaunch(activity).then(()=>setTodayStatus('Đã mở đúng durable planned target.','success')).catch(error=>setTodayStatus(`${error.code||'TODAY_LAUNCH_FAILED'}: ${error.message}`,'error'));
  };
  document.querySelector('#v10StartPlan')?.addEventListener('click',()=>void enqueueLaunch(firstReady).then(()=>setTodayStatus('Đã mở đúng durable planned target.','success')).catch(error=>setTodayStatus(`${error.code||'TODAY_LAUNCH_FAILED'}: ${error.message}`,'error')));
  document.querySelector('#v10MorePractice')?.addEventListener('click',()=>globalThis.VocabMasterApp?.openPractice?.());
  document.querySelector('#v10RefreshPlan')?.addEventListener('click',()=>{
    setTodayStatus();
    void enqueueRender({force:true}).catch(error=>setTodayStatus(`${error.code||'TODAY_RENDER_FAILED'}: ${error.message}`,'error'));
  });
}

function mountSection(){
  const today=document.querySelector('[data-view="today"]');
  if(!today)return null;
  document.documentElement.dataset.todayCanonical='true';
  today.dataset.todayEntry='canonical';
  today.setAttribute('aria-label','Today');
  const section=document.createElement('section');
  section.id='v10TodaySection';
  section.className='section-block v10-today-section';
  section.innerHTML='<div id="v10TodayPlan" aria-live="polite"></div>';
  today.replaceChildren(section);
  return section;
}

export async function mountTodayPlannerV2({degraded=false}={}){
  ensureTodayExecutors();
  if(!document.querySelector('#v10TodaySection'))mountSection();
  await enqueueRender({degraded});
  if(!degraded){
    const refresh=()=>void enqueueRender().catch(error=>setTodayStatus(`${error.code||'TODAY_RENDER_FAILED'}: ${error.message}`,'error'));
    globalThis.addEventListener('vocab:external-change',refresh);
    globalThis.addEventListener('vocab:ielts-data-saved',refresh);
    globalThis.addEventListener('vocab:v10-personal-content-ready',refresh);
    globalThis.addEventListener('hashchange',()=>{if(location.hash==='#today')refresh();});
  }
  globalThis.VocabMasterTodayV2={
    build:options=>enqueueTodayAction(()=>buildTodayActivityPlan(options)),
    refresh:options=>enqueueRender(options),
    launch:activity=>enqueueLaunch(activity),
    skip:(runId,options)=>skipTodayRun(runId,options),
    cancel:(runId,options)=>cancelTodayRun(runId,options),
    runs:options=>listTodayRuns(options),
    binding:activityLaunchBinding
  };
  return globalThis.VocabMasterTodayV2;
}

export const __testing=Object.freeze({assetRevision,cardTarget,errorRevision,launchProjection,projectFocusCandidates,resumeTodayPlan,launchActivity});
