import { readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { webcrypto } from 'node:crypto';

const root=resolve(import.meta.dirname,'..');
const channel=(process.argv.find(value=>value.startsWith('--channel='))||'').split('=')[1];
if(!['staging','production'].includes(channel))throw new Error('Use --channel=staging or --channel=production.');
const privateKeyBase64=process.env.CONTENT_SIGNING_PRIVATE_KEY_PKCS8_BASE64;
const keyId=process.env.CONTENT_SIGNING_KEY_ID;
if(!privateKeyBase64||!keyId)throw new Error('Protected Ed25519 signing key and key ID are required through environment variables.');
const inputPath=resolve(root,'publication',channel,'catalog.unsigned.json');
const outputPath=resolve(root,'publication',channel,'catalog.signed.json');
const payload=JSON.parse(await readFile(inputPath,'utf8'));
if(payload.keyId!==keyId||!payload.supportedKeyIds?.includes(keyId))throw new Error('Catalog key-rotation metadata does not bind the protected signing key.');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const key=await webcrypto.subtle.importKey('pkcs8',Buffer.from(privateKeyBase64,'base64'),{name:'Ed25519'},false,['sign']);
const signature=await webcrypto.subtle.sign({name:'Ed25519'},key,new TextEncoder().encode(JSON.stringify(canonical(payload))));
const envelope={
  kind:'vocab-master-signed-catalog',
  signatureVersion:1,
  algorithm:'Ed25519',
  keyId,
  payload,
  signature:Buffer.from(signature).toString('base64')
};
await writeFile(outputPath,`${JSON.stringify(envelope,null,2)}\n`,{flag:'wx'});
console.log(`Signed ${channel} catalog without persisting the private key: ${outputPath}`);
