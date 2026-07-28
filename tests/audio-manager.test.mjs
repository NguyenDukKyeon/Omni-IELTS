import test from 'node:test';
import assert from 'node:assert/strict';
import {AUDIO_RATES,chooseBestVoice,createAudioManager,rateForMode,voiceScore} from '../src/audio-manager.js';

const voices=[
  {name:'Basic English',lang:'en-US',voiceURI:'basic',default:true,localService:true},
  {name:'Microsoft Aria Natural Online',lang:'en-US',voiceURI:'aria',default:false,localService:false},
  {name:'Google UK English Female',lang:'en-GB',voiceURI:'uk',default:false,localService:true},
  {name:'Giọng Việt',lang:'vi-VN',voiceURI:'vi',default:false,localService:true}
];

test('saved voiceURI wins over automatic ranking',()=>{
  assert.equal(chooseBestVoice(voices,{language:'en-US',voiceURI:'basic'}).voiceURI,'basic');
});

test('automatic selection prefers Natural/Neural voice in the requested accent',()=>{
  assert.equal(chooseBestVoice(voices,{language:'en-US'}).voiceURI,'aria');
  assert.equal(chooseBestVoice(voices,{language:'en-GB'}).voiceURI,'uk');
  assert.ok(voiceScore(voices[1],'en-US')>voiceScore(voices[0],'en-US'));
});

test('audio rates follow the proposed normal, slow and example values',()=>{
  assert.equal(rateForMode('normal','medium'),0.9);
  assert.equal(rateForMode('slow','medium'),0.7);
  assert.equal(rateForMode('example','medium'),0.95);
  assert.equal(rateForMode('normal','natural'),1);
  assert.deepEqual(AUDIO_RATES,{slow:0.7,normal:0.9,medium:0.9,natural:1,example:0.95});
});

test('audio manager cancels the previous utterance and applies selected voice',async()=>{
  class FakeUtterance{
    constructor(text){this.text=text;}
  }
  const spoken=[];
  const synthesis={
    cancelCount:0,
    getVoices:()=>voices,
    addEventListener(){},
    cancel(){this.cancelCount+=1;},
    speak(utterance){spoken.push(utterance);utterance.onstart?.();queueMicrotask(()=>utterance.onend?.());}
  };
  const manager=createAudioManager({synthesis,Utterance:FakeUtterance,delay:0});
  const result=await manager.speakText('reliable',{language:'en-US',voiceURI:'aria',mode:'normal',defaultRate:'medium'});
  assert.equal(spoken.length,1);
  assert.equal(spoken[0].voice.voiceURI,'aria');
  assert.equal(spoken[0].rate,0.9);
  assert.equal(spoken[0].pitch,1);
  assert.equal(spoken[0].volume,1);
  assert.ok(synthesis.cancelCount>=1);
  assert.equal(result.voice.voiceURI,'aria');
});

test('voiceschanged refreshes the available voice list',()=>{
  let callback;
  let current=[voices[0]];
  const synthesis={getVoices:()=>current,addEventListener(name,handler){if(name==='voiceschanged')callback=handler;},cancel(){},speak(){}};
  const manager=createAudioManager({synthesis,Utterance:class{},delay:0});
  assert.equal(manager.getVoices('en').length,1);
  current=voices;
  callback();
  assert.equal(manager.getVoices('en').length,3);
});
