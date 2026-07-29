import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createIeltsApiHandler } from '../server/ielts-api.mjs';

function request(body,path,{remoteAddress='127.0.0.44'}={}){
  const req=Readable.from([JSON.stringify(body)]);req.method='POST';req.headers={host:'localhost:3000',origin:'http://localhost:3000','x-gemini-key':'test-key','x-gemini-model':'gemini-test'};req.socket={remoteAddress};
  let status=0;let headers={};let text='';
  const res={writeHead(value,nextHeaders){status=value;headers=nextHeaders;},end(value=''){text+=String(value);}};
  return{req,res,path,result:()=>({status,headers,text,json:JSON.parse(text||'{}')})};
}

function geminiResponse(value){return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(value)}]}}]}),{status:200,headers:{'content-type':'application/json'}});}

const securityHeaders=contentType=>({'content-type':contentType,'x-content-type-options':'nosniff'});
const handler=createIeltsApiHandler({securityHeaders,aiModels:new Set(['gemini-test']),defaultAiModel:'gemini-test'});

test('auto transcript sends a public YouTube URL directly with a twenty-minute clip contract',async()=>{
  const originalFetch=globalThis.fetch;let outbound;
  globalThis.fetch=async(url,options)=>{outbound={url:String(url),body:JSON.parse(options.body)};return geminiResponse({title:'Contract video',language:'en',durationSeconds:1200,segments:[{startMs:0,endMs:4200,text:'A verified transcript sentence.',confidence:.91},{startMs:4200,endMs:8500,text:'A second sentence for dictation.',confidence:.84}]});};
  try{
    const call=request({url:'https://youtu.be/dQw4w9WgXcQ',mediaSourceId:'media-contract',startSeconds:0,minutes:20,language:'en'},'/api/ielts/transcript');await handler(call.req,call.res,call.path);const result=call.result();
    assert.equal(result.status,200,result.text);assert.equal(result.json.videoId,'dQw4w9WgXcQ');assert.equal(result.json.clip.endSeconds,1200);assert.equal(result.json.durationSeconds,1200);assert.equal(result.json.segments.length,2);assert.equal(result.json.segments[0].status,'needs-review');assert.equal(result.json.segments[0].confidenceSource,'model-estimate');
    const parts=outbound.body.contents[0].parts;assert.equal(parts[0].fileData.fileUri,'https://www.youtube.com/watch?v=dQw4w9WgXcQ');assert.equal(parts[0].videoMetadata.startOffset,'0s');assert.equal(parts[0].videoMetadata.endOffset,'1200s');assert.match(parts[1].text,/absolute milliseconds/);assert.match(outbound.url,/gemini-test:generateContent/);
  }finally{globalThis.fetch=originalFetch;}
});

test('transcript route rejects non-YouTube URLs before calling Gemini',async()=>{
  const originalFetch=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return geminiResponse({});};
  try{const call=request({url:'https://example.com/watch?v=dQw4w9WgXcQ',minutes:20},'/api/ielts/transcript',{remoteAddress:'127.0.0.45'});await handler(call.req,call.res,call.path);const result=call.result();assert.equal(result.status,400);assert.equal(calls,0);assert.match(result.json.error,/video ID|URL/);}finally{globalThis.fetch=originalFetch;}
});

test('retell route blocks a model response containing a synthetic IELTS band',async()=>{
  const originalFetch=globalThis.fetch;globalThis.fetch=async()=>geminiResponse({mainIdeas:[],targetAssessments:[],lexicalGaps:[],errors:[],feedback:'Estimated IELTS band 7.0'});
  try{const call=request({sourceTranscript:'This source transcript contains enough material to analyse accurately.',learnerTranscript:'I explained the main idea in my own words.',targets:[]},'/api/ielts/retell',{remoteAddress:'127.0.0.46'});await handler(call.req,call.res,call.path);const result=call.result();assert.equal(result.status,502);assert.match(result.json.error,/band score/);}finally{globalThis.fetch=originalFetch;}
});

test('AI paraphrase output remains draft even when its schema is valid',async()=>{
  const originalFetch=globalThis.fetch;globalThis.fetch=async()=>geminiResponse({item:{prompt:'Choose the matching meaning.',context:'The figure declined gradually.',options:[{id:'a',text:'The number fell slowly.',correct:true,rationale:'Same direction and degree.'},{id:'b',text:'The number rose sharply.',correct:false,rationale:'Changes direction and degree.'},{id:'c',text:'The number stayed constant.',correct:false,rationale:'Changes the trend.'}]}});
  try{const call=request({kind:'paraphrase',sourceText:'The figure declined gradually.',context:'A chart description.'},'/api/ielts/paraphrase-draft',{remoteAddress:'127.0.0.47'});await handler(call.req,call.res,call.path);const result=call.result();assert.equal(result.status,200,result.text);assert.equal(result.json.item.status,'draft');assert.equal(result.json.item.provenance.status,'draft');assert.equal(result.json.validation.valid,true);}finally{globalThis.fetch=originalFetch;}
});
