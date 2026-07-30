import { exportBackupPackage,buildCoreBackupStores,restoreBackupDocument } from './persistence.js';
import { validateBackupDocument } from './persistence-core.js';
import { buildIeltsBackup,restoreIeltsBackup,validateIeltsBackup } from './ielts-persistence.js';
import { buildV10BackupStores } from './v10-persistence.js';
import { FULL_BACKUP_KIND,FULL_BACKUP_VERSION,buildFullBackupEnvelope,validateFullBackupEnvelope } from './backup-registry.js';

export const COMBINED_BACKUP_VERSION=FULL_BACKUP_VERSION;

export async function buildCombinedBackup(){
  const[core,ielts,v10]=await Promise.all([buildCoreBackupStores(),buildIeltsBackup(),buildV10BackupStores()]);
  return buildFullBackupEnvelope({core,ielts:ielts.stores,v10});
}

export function validateCombinedBackup(input){
  if(input?.kind===FULL_BACKUP_KIND)return{...validateFullBackupEnvelope(input),format:'vnext'};
  const errors=[];const warnings=[];
  if(!input||typeof input!=='object'||Array.isArray(input))return{valid:false,errors:['Backup kết hợp phải là object.'],warnings,value:null};
  if(input.kind!=='combined-core-ielts')errors.push('Không phải backup kết hợp Vocab Master.');
  if(Number(input.schemaVersion||0)!==1)errors.push(Number(input.schemaVersion||0)>1?'Backup kết hợp legacy dùng schema mới hơn ứng dụng cũ.':'Backup kết hợp legacy thiếu hoặc sai schema version.');
  if(!input.core||typeof input.core!=='object')errors.push('Thiếu core backup.');
  const coreValidation=validateBackupDocument(input.core);if(!coreValidation.valid)errors.push(...coreValidation.errors.map(error=>`Core: ${error}`));warnings.push(...coreValidation.warnings.map(warning=>`Core: ${warning}`));
  const ieltsValidation=validateIeltsBackup(input.ielts);
  if(!ieltsValidation.valid)errors.push(...ieltsValidation.errors.map(error=>`IELTS: ${error}`));
  warnings.push(...ieltsValidation.warnings.map(warning=>`IELTS: ${warning}`));
  return{valid:errors.length===0,errors,warnings,value:{...input,core:coreValidation.value,ielts:ieltsValidation.value},format:'legacy-v1'};
}

export async function restoreCombinedBackup(input){
  const validation=validateCombinedBackup(input);if(!validation.valid)throw new Error(validation.errors.join('\n'));
  if(validation.format==='vnext')throw Object.assign(new Error('Full backup vNext đã hợp lệ nhưng cần staged restore/rollback của P0-05 trước khi có thể áp dụng an toàn.'),{code:'VNEXT_STAGED_RESTORE_REQUIRED'});
  const[beforeCore,beforeIelts]=await Promise.all([exportBackupPackage(),buildIeltsBackup()]);
  try{
    const coreResult=await restoreBackupDocument(validation.value.core);
    const ieltsResult=await restoreIeltsBackup(validation.value.ielts);
    return{valid:true,warnings:validation.warnings,coreResult,ieltsResult};
  }catch(error){
    try{await restoreBackupDocument(beforeCore);await restoreIeltsBackup(beforeIelts);}catch(rollbackError){error.message+=` Khôi phục rollback thất bại: ${rollbackError.message}`;}
    throw error;
  }
}

export async function downloadCombinedBackup(){
  const backup=await buildCombinedBackup();const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`vocab-master-full-v${COMBINED_BACKUP_VERSION}-${new Date().toISOString().slice(0,10)}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return backup;
}
