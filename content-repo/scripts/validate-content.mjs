import { createHash } from 'node:crypto';
import { readFile,readdir,stat } from 'node:fs/promises';
import { resolve,relative,sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPPORTED_ACTIVITIES=new Set([
  'listening-comprehension','dictation','strict-practice','shadowing','retell-coaching',
  'reading-comprehension','paraphrase-recognition','distractor-recognition','micro-reading',
  'controlled-recall','sentence-production','paragraph-production','lexical-choice'
]);
const ADDRESS=/^sha256:([a-f0-9]{64})$/;
const SECRET_PATTERNS=[
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\bgh[oprsu]_[0-9A-Za-z]{30,}\b/,
  /\bsk-[0-9A-Za-z]{20,}\b/,
  /CONTENT_SIGNING_PRIVATE_KEY_PKCS8_BASE64\s*=\s*\S+/
];
const REQUIRED_CHECKS=['rights','pedagogy','accuracy'];
const codeUnitCompare=(left,right)=>left<right?-1:left>right?1:0;
const LESSON_PUBLICATION_FIELDS=new Set(['contentAddress','sha256','byteLength','rights','provenance','humanReview','publishedAt']);
const ACTIVITY_SKILLS={
  'listening-comprehension':'listening','dictation':'listening','strict-practice':'listening',
  'shadowing':'listening','retell-coaching':'production','reading-comprehension':'recognition',
  'paraphrase-recognition':'recognition','distractor-recognition':'recognition','micro-reading':'recognition',
  'controlled-recall':'recall','sentence-production':'production','paragraph-production':'production',
  'lexical-choice':'collocation'
};

function canonical(value){
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort(codeUnitCompare).map(key=>[key,canonical(value[key])]));
  return Object.is(value,-0)?0:value;
}

export function canonicalLessonBytes(lesson){
  const identity=Object.fromEntries(Object.entries(lesson||{}).filter(([key])=>!LESSON_PUBLICATION_FIELDS.has(key)));
  return Buffer.from(JSON.stringify(canonical(identity)));
}

function exactActivityTarget(manifest,lesson,activity){
  const identity={
    contract:'RemoteContentActivityTarget',
    schemaVersion:2,
    packId:manifest.id,
    packRevision:Number(manifest.contentRevision),
    lessonId:lesson.id,
    lessonRevision:Number(lesson.contentRevision),
    activityId:activity.id
  };
  return{
    ...identity,
    contentRevision:Number(lesson.contentRevision),
    cardId:activity.id,
    senseId:null,
    skill:ACTIVITY_SKILLS[activity.type]||null,
    sourceId:`remote-content:${lesson.id}`,
    sourceRevision:`sha256:${createHash('sha256').update(JSON.stringify(canonical(identity))).digest('hex')}`
  };
}

async function filesUnder(directory){
  const result=[];
  let entries=[];
  try{entries=await readdir(directory,{withFileTypes:true});}catch{return result;}
  for(const entry of entries.sort((left,right)=>codeUnitCompare(left.name,right.name))){
    const path=resolve(directory,entry.name);
    if(entry.isDirectory())result.push(...await filesUnder(path));
    else result.push(path);
  }
  return result;
}

async function json(path,errors){
  try{return JSON.parse(await readFile(path,'utf8'));}
  catch(error){errors.push(`${path}: invalid JSON (${error.message}).`);return null;}
}

function recordMap(document){
  return new Map((document?.records||[]).map(record=>[record.id,record]));
}

function checkRecord(item,path,{rights,provenance,reviews,mode,errors}){
  const rightsRecord=rights.get(item.rightsRecordId);
  const provenanceRecord=provenance.get(item.provenanceRecordId);
  const reviewRecord=reviews.get(item.humanReviewRecordId);
  if(!rightsRecord)errors.push(`${path}: missing rights record ${item.rightsRecordId||'none'}.`);
  if(!provenanceRecord)errors.push(`${path}: missing provenance record ${item.provenanceRecordId||'none'}.`);
  if(!reviewRecord)errors.push(`${path}: missing human review record ${item.humanReviewRecordId||'none'}.`);
  if(mode==='publish'){
    if(rightsRecord?.status!=='approved')errors.push(`${path}: rights are not approved.`);
    if(rightsRecord?.aiAsserted)errors.push(`${path}: AI cannot assert rights.`);
    if(provenanceRecord?.sourceType==='generated-draft'||provenanceRecord?.aiDraft)errors.push(`${path}: AI-assisted draft provenance is not publishable.`);
    if(reviewRecord?.status!=='approved'||reviewRecord?.reviewerType!=='human'||!reviewRecord?.reviewerId)errors.push(`${path}: named human approval is missing.`);
    if(reviewRecord?.scopeDigest!==item.contentAddress)errors.push(`${path}: review digest does not bind the immutable item.`);
    for(const check of REQUIRED_CHECKS)if(!reviewRecord?.checks?.includes(check))errors.push(`${path}: human review omits ${check}.`);
  }else{
    if(!['pending','approved','changes-requested','rejected'].includes(reviewRecord?.status))errors.push(`${path}: draft review status is invalid.`);
    if(!['pending','approved','rejected','expired'].includes(rightsRecord?.status))errors.push(`${path}: draft rights status is invalid.`);
  }
}

function validateActivities(lesson,path,lessonAssetIds,manifest,errors){
  const activities=Array.isArray(lesson.activities)?lesson.activities:[];
  if(!activities.length)errors.push(`${path}: activities are missing.`);
  const ids=new Set();
  for(const [index,activity] of activities.entries()){
    const activityPath=`${path}.activities[${index}]`;
    if(!activity?.id||ids.has(activity.id))errors.push(`${activityPath}: activity ID is missing or duplicate.`);
    ids.add(activity?.id);
    if(!SUPPORTED_ACTIVITIES.has(activity?.type))errors.push(`${activityPath}: unsupported activity type ${activity?.type||'missing'}.`);
    if(!activity?.prompt)errors.push(`${activityPath}: prompt is missing.`);
    if(activity?.answer==null)errors.push(`${activityPath}: answer is missing.`);
    const target=activity?.target;
    const expected=exactActivityTarget(manifest,lesson,activity);
    if(
      !target
      ||[
        'packId','packRevision','lessonId','lessonRevision','activityId',
        'cardId','senseId','skill','sourceId','sourceRevision'
      ].some(field=>target[field]!==expected[field])
    )errors.push(`${activityPath}: invalid exact ActivitySpec target.`);
    for(const assetId of activity?.assetIds||[])if(!lessonAssetIds.has(assetId))errors.push(`${activityPath}: asset ${assetId} is outside the lesson declaration.`);
  }
}

function validateTranscript(assetData,path,errors){
  const transcript=assetData?.transcript||assetData?.segments;
  if(!transcript)return;
  const segments=Array.isArray(transcript)?transcript:transcript.segments;
  if(!Array.isArray(segments))return errors.push(`${path}: transcript segments are invalid.`);
  let previousEnd=-1;
  for(const [index,segment] of segments.entries()){
    const start=Number(segment.startMs),end=Number(segment.endMs);
    if(!segment.id||!segment.text||!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||start<previousEnd)errors.push(`${path}: invalid transcript timing at segment ${index}.`);
    previousEnd=end;
  }
}

function distribution(lessons){
  return Object.fromEntries(['listening','reading','lexical-paraphrase'].map(skill=>[skill,lessons.filter(lesson=>lesson.skill===skill).length]));
}

export async function validateRepository({root=resolve(import.meta.dirname,'..'),mode='draft'}={}){
  const errors=[],warnings=[];
  if(!['draft','publish'].includes(mode))throw new Error('Validation mode must be draft or publish.');
  const allFiles=(await filesUnder(root)).filter(path=>!path.includes(`${sep}publication${sep}`)&&!path.includes(`${sep}node_modules${sep}`));
  for(const path of allFiles){
    const info=await stat(path);
    if(info.size>10*1024*1024)errors.push(`${relative(root,path)} exceeds the 10 MB per-file limit.`);
    if(/\.(?:json|md|mjs|yml|yaml|txt)$/i.test(path)){
      const text=await readFile(path,'utf8');
      for(const pattern of SECRET_PATTERNS)if(pattern.test(text))errors.push(`${relative(root,path)} appears to contain a secret or private signing key.`);
    }
  }

  const [rightsDocument,provenanceDocument,reviewsDocument]=await Promise.all([
    json(resolve(root,'registries','rights.json'),errors),
    json(resolve(root,'registries','provenance.json'),errors),
    json(resolve(root,'registries','human-reviews.json'),errors)
  ]);
  const registries={
    rights:recordMap(rightsDocument),
    provenance:recordMap(provenanceDocument),
    reviews:recordMap(reviewsDocument),
    mode,
    errors
  };
  for(const [label,map] of [['rights',registries.rights],['provenance',registries.provenance],['review',registries.reviews]]){
    if(map.size!==(label==='rights'?rightsDocument:label==='provenance'?provenanceDocument:reviewsDocument)?.records?.length)errors.push(`${label} registry contains duplicate IDs.`);
  }

  const packDirectories=['sampler','foundations-week-1','foundations-week-2','foundations-week-3','foundations-week-4'];
  const manifests=[];
  const globalIds=new Set();
  for(const directory of packDirectories){
    const manifestPath=resolve(root,'packs',directory,'manifest.json');
    const manifest=await json(manifestPath,errors);
    if(!manifest)continue;
    manifests.push(manifest);
    const path=`packs/${directory}/manifest.json`;
    if(Number(manifest.schemaVersion)!==2||!manifest.id||!Number.isInteger(Number(manifest.contentRevision)))errors.push(`${path}: pack identity/schema is invalid.`);
    if(globalIds.has(manifest.id))errors.push(`${path}: duplicate pack ID ${manifest.id}.`);globalIds.add(manifest.id);
    if(!ADDRESS.test(manifest.contentAddress||''))errors.push(`${path}: pack content address is invalid.`);
    checkRecord(manifest,path,registries);
    const assets=Array.isArray(manifest.assets)?manifest.assets:[];
    const assetIds=new Set();
    let packBytes=0;
    for(const [index,asset] of assets.entries()){
      const assetPath=`${path}.assets[${index}]`;
      if(!asset.id||assetIds.has(asset.id)||globalIds.has(asset.id))errors.push(`${assetPath}: asset ID is missing or duplicate.`);
      assetIds.add(asset.id);globalIds.add(asset.id);
      const match=ADDRESS.exec(asset.contentAddress||'');
      if(!match||asset.sha256!==match?.[1])errors.push(`${assetPath}: content address and SHA-256 disagree.`);
      if(!Number.isInteger(Number(asset.byteLength))||Number(asset.byteLength)<0)errors.push(`${assetPath}: byte length is invalid.`);
      if(!asset.mediaType||!asset.accessibilityLabel)errors.push(`${assetPath}: media type or accessible label is missing.`);
      checkRecord(asset,assetPath,registries);
      const assetFile=resolve(root,asset.path||'');
      try{
        const bytes=await readFile(assetFile);
        const digest=createHash('sha256').update(bytes).digest('hex');
        if(digest!==asset.sha256)errors.push(`${assetPath}: file digest mismatch.`);
        if(bytes.byteLength!==Number(asset.byteLength))errors.push(`${assetPath}: file length mismatch.`);
        packBytes+=bytes.byteLength;
        if(asset.mediaType==='application/json')validateTranscript(JSON.parse(bytes.toString('utf8')),assetPath,errors);
      }catch(error){errors.push(`${assetPath}: asset file missing or invalid (${error.message}).`);}
    }
    if(packBytes>8*1024*1024)errors.push(`${path}: pack exceeds 8 MB.`);
    const lessons=Array.isArray(manifest.lessons)?manifest.lessons:[];
    for(const [index,lesson] of lessons.entries()){
      const lessonPath=`${path}.lessons[${index}]`;
      if(!lesson.id||globalIds.has(lesson.id))errors.push(`${lessonPath}: lesson ID is missing or duplicate.`);
      globalIds.add(lesson.id);
      const lessonAddress=ADDRESS.exec(lesson.contentAddress||'');
      const lessonBytes=canonicalLessonBytes(lesson);
      const lessonDigest=createHash('sha256').update(lessonBytes).digest('hex');
      if(!lessonAddress)errors.push(`${lessonPath}: lesson content address is invalid.`);
      if(lesson.sha256!==lessonDigest)errors.push(`${lessonPath}: lesson SHA-256 does not match canonical bytes.`);
      if(lessonAddress?.[1]!==lessonDigest)errors.push(`${lessonPath}: lesson content address does not bind canonical bytes.`);
      if(Number(lesson.byteLength)!==lessonBytes.byteLength)errors.push(`${lessonPath}: lesson byte length does not match canonical bytes.`);
      if(!['listening','reading','lexical-paraphrase'].includes(lesson.skill))errors.push(`${lessonPath}: invalid skill.`);
      if(!lesson.learningObjective||!lesson.estimatedMinutes||!lesson.difficulty)errors.push(`${lessonPath}: objective, time or difficulty is missing.`);
      if(!lesson.accessibility?.label||!lesson.accessibility?.language)errors.push(`${lessonPath}: accessibility metadata is incomplete.`);
      if(!lesson.originalityDeclaration?.includes('not copied'))errors.push(`${lessonPath}: original/non-copied declaration is missing.`);
      checkRecord(lesson,lessonPath,registries);
      const targets=(lesson.lexicalTargets||[]).map(target=>String(target.term||'').trim().toLowerCase());
      if(!targets.length||new Set(targets).size!==targets.length)errors.push(`${lessonPath}: lexical targets are missing or duplicated.`);
      const lessonAssetIds=new Set(Array.isArray(lesson.assetIds)?lesson.assetIds:[]);
      if(!lessonAssetIds.size)errors.push(`${lessonPath}: lesson asset declaration is missing.`);
      for(const assetId of lessonAssetIds)if(!assetIds.has(assetId))errors.push(`${lessonPath}: undeclared asset ${assetId}.`);
      validateActivities(lesson,lessonPath,lessonAssetIds,manifest,errors);
      if(lesson.skill==='listening'&&!lesson.assetIds?.some(id=>assets.find(asset=>asset.id===id)?.mediaType.startsWith('audio/')))errors.push(`${lessonPath}: Listening audio is missing.`);
      for(const link of lesson.internalLinks||[])if(!lessons.some(candidate=>candidate.id===link))errors.push(`${lessonPath}: broken internal link ${link}.`);
    }
  }

  const sampler=manifests.find(manifest=>manifest.id==='pack:vocab-master-sampler');
  const samplerDistribution=distribution(sampler?.lessons||[]);
  if((sampler?.lessons||[]).length!==3||Object.values(samplerDistribution).some(count=>count!==1))errors.push('Sampler must contain exactly one Listening, one Reading and one Lexical/Paraphrase lesson.');
  const weekly=manifests.filter(manifest=>/^pack:ielts-foundations-week-[1-4]$/.test(manifest.id||''));
  for(const [index,manifest] of weekly.entries()){
    const counts=distribution(manifest.lessons||[]);
    if(manifest.lessons?.length!==6||counts.listening!==2||counts.reading!==2||counts['lexical-paraphrase']!==2)errors.push(`Foundations week ${index+1} must contain 2/2/2 lessons.`);
    const weekReviewIds=new Set((manifest.lessons||[]).map(lesson=>lesson.humanReviewRecordId));
    if(weekReviewIds.size!==(manifest.lessons||[]).length)errors.push(`Foundations week ${index+1} must not use one synthetic review for all lessons.`);
  }
  const starterLessons=weekly.flatMap(manifest=>manifest.lessons||[]);
  const starterDistribution=distribution(starterLessons);
  if(starterLessons.length!==24||starterDistribution.listening!==8||starterDistribution.reading!==8||starterDistribution['lexical-paraphrase']!==8)errors.push('Starter Pack must contain exactly 24 lessons with 8/8/8 distribution.');

  if(mode==='publish'){
    for(let index=1;index<weekly.length;index++){
      const prior=weekly[index-1];
      if(!prior?.weeklyDefectReviewRecordId||registries.reviews.get(prior.weeklyDefectReviewRecordId)?.status!=='approved')errors.push(`Week ${index} defect review must be approved before Week ${index+1} publication.`);
    }
  }else if(manifests.length)warnings.push('Draft validation permits pending rights/review records; production validation remains fail-closed.');

  const catalogEntries=manifests.map(manifest=>({
    id:manifest.id,
    packId:manifest.id,
    schemaVersion:2,
    contentRevision:manifest.contentRevision,
    title:manifest.title,
    summary:manifest.summary,
    lessonCount:manifest.lessons.length,
    byteLength:Buffer.byteLength(JSON.stringify(manifest)),
    contentAddress:`sha256:${createHash('sha256').update(JSON.stringify(manifest)).digest('hex')}`,
    manifestUrl:null,
    compatibility:manifest.compatibility,
    rightsRecordId:manifest.rightsRecordId,
    provenanceRecordId:manifest.provenanceRecordId,
    humanReviewRecordId:manifest.humanReviewRecordId
  }));
  return{
    valid:errors.length===0,
    mode,
    errors,
    warnings,
    packs:manifests.length,
    samplerLessons:sampler?.lessons?.length||0,
    starterLessons:starterLessons.length,
    starterDistribution,
    catalogEntries
  };
}

const executedPath=process.argv[1]?resolve(process.argv[1]):'';
if(executedPath===fileURLToPath(import.meta.url)){
  const mode=(process.argv.find(value=>value.startsWith('--mode='))||'--mode=draft').split('=')[1];
  const report=await validateRepository({mode});
  console.log(JSON.stringify(report,null,2));
  if(!report.valid)process.exitCode=1;
}
