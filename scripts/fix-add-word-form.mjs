import { readFile, writeFile } from 'node:fs/promises';

const appPath='src/app.js';
let app=await readFile(appPath,'utf8');
const start="$('#addWordForm').addEventListener('submit',async event=>{event.preventDefault();const card=";
if(app.includes(start))app=app.replace(start,"$('#addWordForm').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const card=",1);
if(app.includes('event.currentTarget.reset();'))app=app.replace('event.currentTarget.reset();','form.reset();',1);
if(!app.includes('const form=event.currentTarget;')||app.includes('event.currentTarget.reset();'))throw new Error('Add-word form async reset fix was not applied.');
await writeFile(appPath,app);

const checkPath='scripts/check.mjs';
let check=await readFile(checkPath,'utf8');
const guard="assert.ok(app.includes('const form=event.currentTarget;')&&!app.includes('event.currentTarget.reset();'),'Async form handler must keep a stable form reference');";
if(!check.includes(guard))check+=`\n${guard}\n`;
await writeFile(checkPath,check);
console.log('Add-word form reset fix staged.');
