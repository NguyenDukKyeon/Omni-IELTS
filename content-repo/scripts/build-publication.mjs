import { cp,mkdir,readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateRepository } from './validate-content.mjs';

const root=resolve(import.meta.dirname,'..');
const channel=(process.argv.find(value=>value.startsWith('--channel='))||'').split('=')[1];
if(!['staging','production'].includes(channel))throw new Error('Use --channel=staging or --channel=production.');
const mode=channel==='production'?'publish':'draft';
const report=await validateRepository({root,mode});
if(!report.valid)throw new Error(report.errors.join('\n'));
const source=JSON.parse(await readFile(resolve(root,'catalog-source',`${channel}.json`),'utf8'));
if(!process.env.CONTENT_SIGNING_KEY_ID)throw new Error('CONTENT_SIGNING_KEY_ID is required to assemble rotation metadata.');
const now=new Date();
const payload={
  ...source,
  issuedAt:now.toISOString(),
  expiresAt:new Date(now.getTime()+30*86_400_000).toISOString(),
  keyId:process.env.CONTENT_SIGNING_KEY_ID,
  supportedKeyIds:[process.env.CONTENT_SIGNING_KEY_ID],
  entries:report.catalogEntries
};
delete payload.packManifestPaths;
const output=resolve(root,'publication',channel);
await mkdir(output,{recursive:true});
await cp(resolve(root,'assets','immutable'),resolve(output,'immutable'),{recursive:true,force:true});
await writeFile(resolve(output,'catalog.unsigned.json'),`${JSON.stringify(payload,null,2)}\n`,{flag:'wx'});
console.log(`Built unsigned ${channel} publication at ${output}; signing remains a separate protected step.`);
