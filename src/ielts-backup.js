import { exportBackupPackage,restoreBackupDocument } from './persistence.js';
import { buildIeltsBackup,restoreIeltsBackup,validateIeltsBackup } from './ielts-persistence.js';

export const COMBINED_BACKUP_VERSION=1;

export async function buildCombinedBackup(){
  const[core,ielts]=await Promise.all([exportBackupPackage(),buildIeltsBackup()]);
  return{app:'Vocab Master',kind:'combined-core-ielts',schemaVersion:COMBINED_BACKUP_VERSION,exportedAt:new Date().toISOString(),core,ielts};
}

export function validateCombinedBackup(input){
  const errors=[];const warnings=[];
  if(!input||typeof input!=='object'||Array.isArray(input))return{valid:false,errors:['Backup kết hợp phải là object.'],warnings,value:null};
  if(input.kind!=='combined-core-ielts')errors.push('Không phải backup kết hợp Vocab Master.');
  if(Number(input.schemaVersion||0)>COMBINED_BACKUP_VERSION)errors.push('Backup kết hợp dùng schema mới hơn ứng dụng.');
  if(!input.core||typeof input.core!=='object')errors.push('Thiếu core backup.');
  const ieltsValidation=validateIeltsBackup(input.ielts);
  if(!ieltsValidation.valid)errors.push(...ieltsValidation.errors.map(error=>`IELTS: ${error}`));
  warnings.push(...ieltsValidation.warnings.map(warning=>`IELTS: ${warning}`));
  return{valid:errors.length===0,errors,warnings,value:{...input,ielts:ieltsValidation.value}};
}

export async function restoreCombinedBackup(input){
  const validation=validateCombinedBackup(input);if(!validation.valid)throw new Error(validation.errors.join('\n'));
  const before=await buildCombinedBackup();
  try{
    const coreResult=await restoreBackupDocument(validation.value.core);
    const ieltsResult=await restoreIeltsBackup(validation.value.ielts);
    return{valid:true,warnings:validation.warnings,coreResult,ieltsResult};
  }catch(error){
    try{await restoreBackupDocument(before.core);await restoreIeltsBackup(before.ielts);}catch(rollbackError){error.message+=` Khôi phục rollback thất bại: ${rollbackError.message}`;}
    throw error;
  }
}

export async function downloadCombinedBackup(){
  const backup=await buildCombinedBackup();const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`vocab-master-full-${new Date().toISOString().slice(0,10)}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return backup;
}
