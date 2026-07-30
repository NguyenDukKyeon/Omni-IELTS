import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PHASE4_CONTRACTS,
  canonicalContentJson,
  contentAddressFor,
  normalizeContentAddress,
  validateAssetDescriptor,
  validateLessonManifest,
  validatePackManifest,
  validateRemoteCatalog
} from '../src/content-contracts-v2.js';

const now='2026-07-30T12:00:00.000Z';
const future='2027-07-30T12:00:00.000Z';
const address=hex=>`sha256:${hex.repeat(64).slice(0,64)}`;
const publication=(id,scopeDigest)=>({
  publishedAt:now,
  rights:{
    id:`rights:${id}`,schemaVersion:2,status:'approved',licenseId:'test-original',
    rightsHolder:'Phase 4 test fixture author',basis:'Original fixture used only by deterministic tests.',
    assertedAt:now,expiresAt:null,aiAsserted:false
  },
  provenance:{
    id:`provenance:${id}`,schemaVersion:2,sourceType:'original-human-authored',
    sourceDescription:'Purpose-built deterministic acceptance fixture.',authorOrOrigin:'Phase 4 test fixture author',
    createdAt:now,aiDraft:false
  },
  humanReview:{
    id:`review:${id}`,schemaVersion:2,status:'approved',reviewerType:'human',
    reviewerId:'test-human-reviewer',reviewedAt:now,scopeDigest,
    checks:['rights','pedagogy','accuracy'],selfApprovedByAi:false
  }
});

function asset(){
  const contentAddress=address('a');
  return{
    id:'asset:listening-audio',schemaVersion:2,contentRevision:1,contentAddress,
    sha256:normalizeContentAddress(contentAddress).digest,byteLength:4,mediaType:'audio/wav',
    retrievalUrl:`https://content.example.test/sha256/${normalizeContentAddress(contentAddress).digest}.wav`,
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation','shadowing']},
    ...publication('asset-listening-audio',contentAddress)
  };
}

function lesson(declaredAsset=asset()){
  const contentAddress=address('b');
  return{
    id:'lesson:listening-01',schemaVersion:2,contentRevision:1,contentAddress,
    title:'Test listening lesson',learningObjective:'Identify a scheduling change.',
    estimatedMinutes:8,difficulty:'B1',skill:'listening',
    lexicalTargets:[{id:'lex:move-forward',term:'move forward'}],
    assetIds:[declaredAsset.id],
    activities:[{
      id:'activity:listening-01:dictation',type:'dictation',
      prompt:'Write the sentence you hear.',answer:{text:'The meeting moved forward.'},
      assetIds:[declaredAsset.id]
    }],
    accessibility:{label:'Test listening lesson',language:'en',transcriptAssetId:declaredAsset.id},
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation']},
    ...publication('lesson-listening-01',contentAddress)
  };
}

function pack(){
  const packAddress=address('c');
  const declaredAsset=asset();
  return{
    id:'pack:test-week',schemaVersion:2,contentRevision:1,contentAddress:packAddress,
    title:'Test week',assets:[declaredAsset],lessons:[lesson(declaredAsset)],
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation','shadowing']},
    ...publication('pack-test-week',packAddress)
  };
}

test('Phase 4 exports every required versioned contract and canonical JSON is deterministic',async()=>{
  assert.deepEqual(Object.keys(PHASE4_CONTRACTS).sort(),[
    'AssetDescriptor','CatalogEntry','ContentAddress','ContentProgress','HumanReviewRecord','InstalledPack',
    'LessonManifest','PackActivationReceipt','PackInstallJournal','PackManifest','PackRevocation',
    'ProvenanceRecord','RemoteCatalog','RightsRecord'
  ].sort());
  assert.equal(canonicalContentJson({z:1,a:{y:2,x:3}}),'{"a":{"x":3,"y":2},"z":1}');
  assert.equal(await contentAddressFor('abc'),'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('published asset, lesson, pack and catalog contracts accept complete rights and human review evidence',()=>{
  const manifest=pack();
  assert.equal(validateAssetDescriptor(manifest.assets[0],{at:Date.parse(now)}).valid,true);
  assert.equal(validateLessonManifest(manifest.lessons[0],{declaredAssets:manifest.assets,at:Date.parse(now)}).valid,true);
  assert.equal(validatePackManifest(manifest,{at:Date.parse(now)}).valid,true);
  const entryAddress=address('d');
  const entry={
    id:manifest.id,packId:manifest.id,schemaVersion:2,contentRevision:1,contentAddress:entryAddress,
    manifestUrl:`https://content.example.test/sha256/${normalizeContentAddress(entryAddress).digest}.json`,
    byteLength:5000,
    compatibility:{minimumAppVersion:'10.0.0',supportedActivityTypes:['dictation']},
    ...publication('entry-test-week',entryAddress)
  };
  const catalog={
    schemaVersion:2,catalogId:'catalog:phase4-test',sequence:1,catalogRevision:1,
    issuedAt:now,expiresAt:future,keyId:'phase4-test-key',supportedKeyIds:['phase4-test-key'],
    entries:[entry],revocations:[]
  };
  const result=validateRemoteCatalog(catalog,{at:Date.parse(now)});
  assert.equal(result.valid,true,result.errors.join('\n'));
});

test('publication fails closed for absent approval, mutable identity, undeclared assets and digest inconsistency',()=>{
  const descriptor=asset();
  descriptor.humanReview.status='pending';
  descriptor.id='https://mutable.example.test/latest.wav';
  descriptor.sha256='0'.repeat(64);
  const assetResult=validateAssetDescriptor(descriptor,{at:Date.parse(now)});
  assert.equal(assetResult.valid,false);
  assert.match(assetResult.errors.join(' '),/unstable|approval|inconsistent/i);

  const lessonFixture=lesson();
  lessonFixture.assetIds=['asset:undeclared'];
  lessonFixture.activities[0].assetIds=['asset:undeclared'];
  const lessonResult=validateLessonManifest(lessonFixture,{declaredAssets:[asset()],at:Date.parse(now)});
  assert.equal(lessonResult.valid,false);
  assert.match(lessonResult.errors.join(' '),/undeclared asset/);
});

test('pending, rejected, expired and AI-asserted publication evidence is rejected',()=>{
  for(const status of ['pending','rejected','expired']){
    const descriptor=asset();
    descriptor.rights.status=status;
    const result=validateAssetDescriptor(descriptor,{at:Date.parse(now)});
    assert.equal(result.valid,false,status);
  }
  const aiDraft=asset();
  aiDraft.provenance.sourceType='generated-draft';
  aiDraft.provenance.aiDraft=true;
  aiDraft.rights.aiAsserted=true;
  aiDraft.humanReview.reviewerType='ai';
  aiDraft.humanReview.reviewerId='ai-reviewer';
  const result=validateAssetDescriptor(aiDraft,{at:Date.parse(now)});
  assert.equal(result.valid,false);
  assert.match(result.errors.join(' '),/AI|draft|human/i);
});
