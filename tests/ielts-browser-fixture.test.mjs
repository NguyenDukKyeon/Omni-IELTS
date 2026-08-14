import assert from 'node:assert/strict';
import test from 'node:test';
import { browserLaunchArguments } from '../scripts/browser-harness.mjs';
import { YouTubeSegmentPlayer } from '../src/ielts-media-player.js';

const youtubeResolverRule='--host-resolver-rules=MAP *.youtube.com ~NOTFOUND, MAP youtube.com ~NOTFOUND, MAP *.youtube-nocookie.com ~NOTFOUND, MAP youtube-nocookie.com ~NOTFOUND';

async function withPlayer(run){
  const originals={document:globalThis.document,location:globalThis.location,addEventListener:globalThis.addEventListener,removeEventListener:globalThis.removeEventListener};
  const listeners=new Map();
  const iframe={id:'',dataset:{},contentWindow:{postMessage(){}},addEventListener(){},remove(){}};
  const host={replaceChildren(){},append(node){this.iframe=node;}};
  globalThis.document={createElement(tag){assert.equal(tag,'iframe');return iframe;}};
  globalThis.location={origin:'http://127.0.0.1:3010'};
  globalThis.addEventListener=(type,listener)=>listeners.set(type,listener);
  globalThis.removeEventListener=(type,listener)=>{if(listeners.get(type)===listener)listeners.delete(type);};
  const errors=[];
  const player=new YouTubeSegmentPlayer({host,pollMs:500,onError:(error,code)=>errors.push({message:error.message,code})});
  try{
    const mounting=player.mount('dQw4w9WgXcQ');
    await new Promise(resolve=>setImmediate(resolve));
    const dispatch=data=>listeners.get('message')?.({origin:'https://www.youtube-nocookie.com',data:JSON.stringify({...data,id:iframe.id})});
    dispatch({event:'onReady'});
    await mounting;
    await run({player,dispatch,errors,iframe});
  }finally{
    player.destroy();
    for(const [key,value] of Object.entries(originals)){
      if(value===undefined)delete globalThis[key];else globalThis[key]=value;
    }
  }
}

test('CI407 reproduction: delayed player denial can replace transient Retell success after durable completion',async()=>{
  let status='Đã lưu Retell coaching, learner output, lexical gaps và lỗi; không thay đổi FSRS.';
  const durableAttempt={result:'coaching',evaluationStatus:'completed'};
  await withPlayer(async({dispatch,errors})=>{
    dispatch({event:'onError',info:150});
    status=errors.at(-1).message;
  });
  assert.equal(durableAttempt.result,'coaching');
  assert.equal(durableAttempt.evaluationStatus,'completed');
  assert.equal(status.includes('Đã lưu Retell coaching'),false,'shared transient status no longer represents already-durable Retell completion');
  assert.equal(status,'Chủ video không cho phép nhúng.');
});

test('CI407 happy path blocks mutable YouTube hosts at the browser-process boundary',()=>{
  const args=browserLaunchArguments({profileDir:'/tmp/ielts-ci407',debugPort:9344,appUrl:'http://127.0.0.1:3010/#today',extra:['--enable-automation']});
  assert.ok(args.includes(youtubeResolverRule),'CI407 false-negative remains possible: the acceptance browser can still resolve mutable YouTube embed hosts');
});

test('YouTube 101/150 product error mapping remains independently covered',async()=>{
  await withPlayer(async({dispatch,errors})=>{
    dispatch({event:'onError',info:101});
    dispatch({event:'onError',info:150});
    assert.deepEqual(errors,[
      {code:101,message:'Chủ video không cho phép nhúng.'},
      {code:150,message:'Chủ video không cho phép nhúng.'}
    ]);
  });
});
