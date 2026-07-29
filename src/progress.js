import { FSRS_SKILLS, getCardRetrievability, plannedSkillsForCard, skillHasReviews } from './fsrs-scheduler.js';

function dayKey(timestamp,timeZone){
  const date=new Date(timestamp);
  if(timeZone){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
    return`${values.year}-${values.month}-${values.day}`;
  }
  return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function isLearningEvidence(event={}){
  const type=event.evidenceType||event.metadata?.evidenceType;
  return type?['independent_review','self_assessed_production','ai_verified_production','transfer_check'].includes(type):!event.assisted;
}

export function buildActivityMap(events=[],timeZone=undefined){
  const map=new Map();
  for(const event of events){
    const timestamp=Number(event.reviewedAt||event.createdAt||0);
    if(!timestamp||event.assisted||!isLearningEvidence(event))continue;
    const key=dayKey(timestamp,timeZone);
    map.set(key,(map.get(key)||0)+1);
  }
  return map;
}

export function calculateStreak(activity,now=Date.now(),timeZone=undefined){
  let streak=0;
  const cursor=new Date(now);
  for(let offset=0;offset<3660;offset+=1){
    const key=dayKey(cursor.getTime(),timeZone);
    if(activity.get(key)>0)streak+=1;
    else if(offset>0)break;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}

export function buildHeatmapDays(events=[],weeks=12,now=Date.now(),timeZone=undefined){
  const activity=buildActivityMap(events,timeZone);
  const totalDays=weeks*7;
  const days=[];
  const cursor=new Date(now);
  cursor.setDate(cursor.getDate()-totalDays+1);
  for(let index=0;index<totalDays;index+=1){
    const key=dayKey(cursor.getTime(),timeZone);
    const count=activity.get(key)||0;
    days.push({key,count,level:count===0?0:count<3?1:count<7?2:count<12?3:4});
    cursor.setDate(cursor.getDate()+1);
  }
  return days;
}

export function calculateSkillCoverage(cards=[]){
  let required=0;
  let reviewed=0;
  const bySkill=Object.fromEntries(FSRS_SKILLS.map(skill=>[skill,{required:0,reviewed:0}]));
  for(const card of cards){
    if(card.suspendedAt||card.archivedAt)continue;
    for(const skill of plannedSkillsForCard(card)){
      required+=1;
      bySkill[skill].required+=1;
      if(skillHasReviews(card,skill)){
        reviewed+=1;
        bySkill[skill].reviewed+=1;
      }
    }
  }
  return{
    required,
    reviewed,
    percent:required?Math.round(reviewed/required*100):0,
    bySkill:Object.fromEntries(Object.entries(bySkill).map(([skill,row])=>[skill,{...row,percent:row.required?Math.round(row.reviewed/row.required*100):0}]))
  };
}

export function calculateKnowledgeStrength(cards=[],now=Date.now(),fsrsConfig=undefined){
  const values=[];
  for(const card of cards){
    if(card.suspendedAt||card.archivedAt)continue;
    for(const skill of plannedSkillsForCard(card)){
      if(skillHasReviews(card,skill))values.push(getCardRetrievability(card,now,fsrsConfig,skill));
    }
  }
  const average=values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0;
  const percent=Math.round(average*100);
  return{
    percent,
    sampleSize:values.length,
    label:!values.length?'Chưa đủ dữ liệu':percent>=90?'Rất bền':percent>=80?'Ổn định':percent>=65?'Đang củng cố':'Cần ôn'
  };
}

export function summarizeReviewQuality(events=[]){
  const ratingName=value=>['again','hard','good','easy'].includes(value)?value:({1:'again',2:'hard',3:'good',4:'easy'})[Number(value)]||null;
  const eligible=events.filter(event=>!event.assisted&&isLearningEvidence(event)).map(event=>({...event,rating:ratingName(event.rating??event.fsrsRating)})).filter(event=>event.rating);
  const successful=eligible.filter(event=>event.rating!=='again').length;
  const again=eligible.filter(event=>event.rating==='again').length;
  const bySkill=Object.fromEntries(FSRS_SKILLS.map(skill=>{
    const rows=eligible.filter(event=>event.skill===skill);
    return[skill,{reviews:rows.length,successRate:rows.length?Math.round(rows.filter(event=>event.rating!=='again').length/rows.length*100):0}];
  }));
  return{reviews:eligible.length,successful,again,successRate:eligible.length?Math.round(successful/eligible.length*100):0,bySkill};
}

export function summarizeActivity(events=[],now=Date.now(),timeZone=undefined){
  const activity=buildActivityMap(events,timeZone);
  const cutoff=now-7*86400000;
  const recent=events.filter(event=>!event.assisted&&isLearningEvidence(event)&&Number(event.reviewedAt||event.createdAt||0)>=cutoff);
  return{
    streak:calculateStreak(activity,now,timeZone),
    activeDaysLast7:new Set(recent.map(event=>dayKey(Number(event.reviewedAt||event.createdAt||0),timeZone))).size,
    reviewsLast7:recent.length,
    heatmap:buildHeatmapDays(events,12,now,timeZone)
  };
}

export function summarizeCalibration(events=[]){
  const rows=events.filter(event=>!event.assisted&&Number.isFinite(Number(event.metadata?.predictedRetrievability))&&event.rating);
  if(!rows.length)return{sampleSize:0,predicted:0,observed:0,gap:0,label:'Chưa đủ dữ liệu'};
  const predicted=rows.reduce((sum,event)=>sum+Number(event.metadata.predictedRetrievability),0)/rows.length;
  const observed=rows.filter(event=>String(event.rating)!=='again'&&Number(event.rating)!==1).length/rows.length;
  const gap=observed-predicted;
  return{sampleSize:rows.length,predicted:Math.round(predicted*100),observed:Math.round(observed*100),gap:Math.round(gap*100),label:Math.abs(gap)<=8?'Khớp tương đối':gap>0?'Mô hình đang thận trọng':'Mô hình đang quá lạc quan hoặc bài kiểm tra khó hơn'};
}
