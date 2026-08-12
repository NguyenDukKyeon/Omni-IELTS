import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const IMPLEMENTATION_ID='W2-LISTENING-UI-FIXTURE-LOCAL-003-20260810T020824Z';
const GENERATOR_ID='wave2-listening-tone-generator';
const GENERATOR_VERSION=1;
const SAMPLE_RATE=8000;
const DURATION_MS=1800;
const SECTION_MS=600;
const TONE_MS=500;
const SILENCE_MS=100;
const FADE_MS=10;
const FREQUENCIES=Object.freeze([440,660,440]);
const CREATED_AT=1786320000000;
const JSON_PATH=fileURLToPath(new URL('./wave2-listening-tone-fixture.json',import.meta.url));
const WAV_PATH=fileURLToPath(new URL('./wave2-listening-tone-fixture.wav',import.meta.url));

function sha256(value){return createHash('sha256').update(value).digest('hex');}

export function generateWave2ToneWav(){
  const totalSamples=SAMPLE_RATE*DURATION_MS/1000;
  const sectionSamples=SAMPLE_RATE*SECTION_MS/1000;
  const toneSamples=SAMPLE_RATE*TONE_MS/1000;
  const fadeSamples=SAMPLE_RATE*FADE_MS/1000;
  const dataBytes=totalSamples*2;
  const wav=Buffer.alloc(44+dataBytes);
  wav.write('RIFF',0,'ascii');
  wav.writeUInt32LE(36+dataBytes,4);
  wav.write('WAVE',8,'ascii');
  wav.write('fmt ',12,'ascii');
  wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);
  wav.writeUInt16LE(1,22);
  wav.writeUInt32LE(SAMPLE_RATE,24);
  wav.writeUInt32LE(SAMPLE_RATE*2,28);
  wav.writeUInt16LE(2,32);
  wav.writeUInt16LE(16,34);
  wav.write('data',36,'ascii');
  wav.writeUInt32LE(dataBytes,40);
  const peak=0.25*32767;
  for(let section=0;section<FREQUENCIES.length;section+=1){
    const frequency=FREQUENCIES[section];
    for(let local=0;local<sectionSamples;local+=1){
      let sample=0;
      if(local<toneSamples){
        const fadeIn=Math.min(1,local/(fadeSamples-1));
        const fadeOut=Math.min(1,(toneSamples-1-local)/(fadeSamples-1));
        const gain=Math.max(0,Math.min(fadeIn,fadeOut));
        sample=Math.round(Math.sin(2*Math.PI*frequency*local/SAMPLE_RATE)*peak*gain);
      }
      wav.writeInt16LE(sample,44+((section*sectionSamples+local)*2));
    }
  }
  return wav;
}

export function generateWave2Fixture(){
  const wav=generateWave2ToneWav();
  const audioSha256=sha256(wav);
  const fixture={
    kind:'wave2-controlled-listening-fixture',
    version:1,
    implementationId:IMPLEMENTATION_ID,
    coverage:'ONE_LISTENING_MULTIPLE_CHOICE_CONTROL_FLOW_PROOF',
    audio:{
      kind:'canonical-pcm-wave',version:1,path:'/tests/fixtures/wave2-listening-tone-fixture.wav',
      audioFormat:1,channels:1,bitsPerSample:16,sampleRate:SAMPLE_RATE,durationMs:DURATION_MS,
      sectionDurationMs:SECTION_MS,toneDurationMs:TONE_MS,silenceDurationMs:SILENCE_MS,
      fadeDurationMs:FADE_MS,amplitude:0.25,frequencies:[...FREQUENCIES],
      byteLength:wav.byteLength,sha256:audioSha256,
      generator:{id:GENERATOR_ID,version:GENERATOR_VERSION,rounding:'Math.round',fade:'linear-endpoints-inclusive'}
    },
    source:{
      id:'wave2-controlled-tone-source-v1',namespace:'private',sourceType:'controlled-test-fixture',
      title:'Wave 2 controlled deterministic tone fixture',language:'en',status:'verified',complete:true,
      createdAt:CREATED_AT
    },
    transcript:{
      language:'en',complete:true,
      segments:[
        {startMs:0,endMs:600,text:'low tone',language:'en',status:'verified',aligned:true},
        {startMs:600,endMs:1200,text:'high tone',language:'en',status:'verified',aligned:true},
        {startMs:1200,endMs:1800,text:'low tone',language:'en',status:'verified',aligned:true}
      ],
      provenance:{
        origin:'project-generated-controlled-fixture',generator:GENERATOR_ID,generatorVersion:GENERATOR_VERSION,
        verification:'verified',rights:'allowed',privacy:'private',aligned:true,alignmentStatus:'timed',
        externalSource:false,provider:null,model:null,tts:false
      }
    },
    rights:{
      kind:'controlled-test-fixture-rights',version:1,basis:'project-created-mathematical-waveform',
      externalCopyrightedMedia:false,scope:'CONTROLLED_LOCAL_TEST_ONLY',publishable:false,productionCatalogAuthority:false
    },
    approval:{
      state:'APPROVED_FOR_CONTROLLED_TEST_ONLY',authority:IMPLEMENTATION_ID,basis:'local-governor-capsule',
      publication:false,learnerEvidence:false,productionCatalog:false,
      coverage:'ONE_LISTENING_MULTIPLE_CHOICE_CONTROL_FLOW_PROOF'
    },
    question:{
      id:'wave2-controlled-tone-sequence-mcq-v1',kind:'listening-multiple-choice',
      prompt:'Which sequence of tones is played?',
      target:{cardId:'wave2-controlled-tone-sequence-v1',senseId:null,skill:'listening'},
      options:[
        {id:'low-high-low',text:'Low, high, low',correct:true,rationale:'The first and third tones are 440 Hz; the middle tone is 660 Hz.'},
        {id:'high-low-high',text:'High, low, high',correct:false,rationale:'The selected order reverses all three fixture tones.'},
        {id:'low-low-high',text:'Low, low, high',correct:false,rationale:'The middle fixture tone is high and the final fixture tone is low.'}
      ],
      createdAt:CREATED_AT,updatedAt:CREATED_AT
    }
  };
  const json=Buffer.from(`${JSON.stringify(fixture,null,2)}\n`,'utf8');
  return Object.freeze({fixture,wav,json});
}

async function verify(){
  const generated=generateWave2Fixture();
  const [actualJson,actualWav]=await Promise.all([readFile(JSON_PATH),readFile(WAV_PATH)]);
  if(!actualJson.equals(generated.json))throw new Error('Wave 2 fixture JSON differs from deterministic generator output.');
  if(!actualWav.equals(generated.wav))throw new Error('Wave 2 fixture WAV differs from deterministic generator output.');
  console.log(`PASS wave2 tone fixture ${generated.wav.byteLength} bytes ${generated.fixture.audio.sha256}`);
}

async function write(){
  const generated=generateWave2Fixture();
  await Promise.all([writeFile(JSON_PATH,generated.json),writeFile(WAV_PATH,generated.wav)]);
  console.log(`WROTE wave2 tone fixture ${generated.wav.byteLength} bytes ${generated.fixture.audio.sha256}`);
}

const direct=process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1];
if(direct){if(process.argv.slice(2).some(arg=>arg!=='--verify'))throw new Error('Only --verify is supported.');await(process.argv.includes('--verify')?verify():write());}
