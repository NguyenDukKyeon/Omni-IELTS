import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const child=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','0.0.0.0','--port','3000','--strictPort'],{
  stdio:['ignore','pipe','pipe'],
  env:{...process.env,NODE_ENV:'development'}
});
let output='';
child.stdout.on('data',chunk=>output+=chunk);
child.stderr.on('data',chunk=>output+=chunk);

async function waitForServer(){
  for(let attempt=0;attempt<60;attempt+=1){
    try{const response=await fetch('http://127.0.0.1:3000/');if(response.ok)return;}
    catch{}
    await delay(250);
  }
  throw new Error(`Vite preview did not start.\n${output}`);
}

try{
  await waitForServer();
  for(const path of ['/','/styles.css','/src/main.js','/src/app.js']){
    const response=await fetch(`http://127.0.0.1:3000${path}`);
    if(!response.ok)throw new Error(`${path} returned ${response.status}`);
    if(response.headers.get('x-frame-options'))throw new Error(`${path} sends X-Frame-Options`);
    const csp=response.headers.get('content-security-policy')||'';
    if(/frame-ancestors\s+['\"]?none/i.test(csp))throw new Error(`${path} blocks iframe ancestors`);
  }
  const html=await (await fetch('http://127.0.0.1:3000/')).text();
  if(!html.includes('/src/main.js'))throw new Error('index.html does not load /src/main.js');
  if(!html.includes('bootStatus'))throw new Error('boot diagnostic panel is missing');
  console.log('AI Studio Vite preview smoke passed.');
}finally{
  child.kill('SIGTERM');
  await delay(150);
  if(!child.killed)child.kill('SIGKILL');
}
