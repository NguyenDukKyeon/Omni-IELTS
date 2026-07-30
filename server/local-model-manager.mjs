import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir,readFile,rename,rm,stat,writeFile } from 'node:fs/promises';
import { dirname,relative,resolve } from 'node:path';
import { resolverError } from '../src/resolver-contracts.js';

const digestValue=value=>String(value||'').trim().toLowerCase().replace(/^sha256:/,'');
const isOwned=(root,target)=>{const value=relative(resolve(root),resolve(target));return value!==''&&!value.startsWith('..')&&!value.includes(':');};

export async function verifyModelArtifact({path,expectedBytes,expectedDigest,fileStat=stat,openReadStream=createReadStream}={}){
  const bytes=Number(expectedBytes),digest=digestValue(expectedDigest);
  if(!path||!Number.isSafeInteger(bytes)||bytes<=0||!/^[a-f0-9]{64}$/.test(digest))throw resolverError('MODEL_UNAVAILABLE','Local model metadata is incomplete; digest and byte length are required.');
  let info;
  try{info=await fileStat(path);}catch{throw resolverError('MODEL_UNAVAILABLE','The configured local model is missing.');}
  if(!info.isFile?.()||info.size!==bytes)throw resolverError('MODEL_INTEGRITY_FAILED','Local model length does not match its trusted manifest.');
  const hash=createHash('sha256');
  try{for await(const chunk of openReadStream(path))hash.update(chunk);}catch{throw resolverError('MODEL_INTEGRITY_FAILED','Local model could not be verified.');}
  if(hash.digest('hex')!==digest)throw resolverError('MODEL_INTEGRITY_FAILED','Local model digest does not match its trusted manifest.');
  return Object.freeze({path,modelBytes:bytes,modelDigest:`sha256:${digest}`});
}

export class LocalModelManager{
  constructor({modelRoot,fileStat=stat,openReadStream=createReadStream,makeDirectory=mkdir,move=rename,remove=rm,read=readFile,write=writeFile}={}){
    if(!modelRoot)throw resolverError('MODEL_UNAVAILABLE','A local model root is required.');
    this.modelRoot=resolve(modelRoot);this.fileStat=fileStat;this.openReadStream=openReadStream;this.makeDirectory=makeDirectory;this.move=move;this.remove=remove;this.read=read;this.write=write;
    this.stagingRoot=resolve(this.modelRoot,'staging');this.modelsRoot=resolve(this.modelRoot,'models');this.manifestPath=resolve(this.modelRoot,'active-model.json');
  }
  async activate({stagedPath,expectedBytes,expectedDigest,engine='faster-whisper'}={}){
    const staged=resolve(stagedPath||'');
    if(!isOwned(this.stagingRoot,staged))throw resolverError('MODEL_INTEGRITY_FAILED','Only files in the owned staging directory may be activated.');
    const verified=await verifyModelArtifact({path:staged,expectedBytes,expectedDigest,fileStat:this.fileStat,openReadStream:this.openReadStream});
    await this.makeDirectory(this.modelsRoot,{recursive:true});
    const activePath=resolve(this.modelsRoot,`${digestValue(verified.modelDigest)}.bin`);
    if(!isOwned(this.modelsRoot,activePath))throw resolverError('MODEL_INTEGRITY_FAILED','Invalid model activation target.');
    try{await this.move(staged,activePath);}catch(error){
      if(error?.code!=='EEXIST')throw error;
      await verifyModelArtifact({path:activePath,expectedBytes,expectedDigest,fileStat:this.fileStat,openReadStream:this.openReadStream});
      await this.remove(staged,{force:true});
    }
    const manifest={schemaVersion:1,engine:String(engine),path:activePath,modelBytes:verified.modelBytes,modelDigest:verified.modelDigest,activatedAt:Date.now()};
    const stagedManifest=`${this.manifestPath}.staged`;
    await this.makeDirectory(dirname(this.manifestPath),{recursive:true});
    await this.write(stagedManifest,JSON.stringify(manifest,null,2),'utf8');
    await this.move(stagedManifest,this.manifestPath);
    return Object.freeze(manifest);
  }
  async resolveActive(){
    let manifest;
    try{manifest=JSON.parse(await this.read(this.manifestPath,'utf8'));}catch{throw resolverError('MODEL_UNAVAILABLE','No activated local model manifest is available.');}
    const active=resolve(manifest.path||'');
    if(!isOwned(this.modelsRoot,active))throw resolverError('MODEL_INTEGRITY_FAILED','The active model manifest points outside owned model storage.');
    const verified=await verifyModelArtifact({path:active,expectedBytes:manifest.modelBytes,expectedDigest:manifest.modelDigest,fileStat:this.fileStat,openReadStream:this.openReadStream});
    return Object.freeze({...manifest,...verified});
  }
}
