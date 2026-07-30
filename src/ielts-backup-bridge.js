import { downloadCombinedBackup,restoreCombinedBackup,validateCombinedBackup } from './ielts-backup.js';
import { restoreIeltsBackup,validateIeltsBackup } from './ielts-persistence.js';
import { FULL_BACKUP_KIND } from './backup-registry.js';

let mounted=false;
function announce(message,kind='info'){const node=document.getElementById('ieltsLabStatus');if(!node)return;node.className=`ielts-status ${kind}`;node.textContent=message;}

export function mountIeltsBackupBridge(){
  if(mounted)return;mounted=true;
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('[data-ielts-action="backup"]');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();button.disabled=true;
    try{await downloadCombinedBackup();announce('Đã tạo full backup gồm Core, IELTS, V10, drafts và outbox.','success');}
    catch(error){announce(error.message,'error');}finally{button.disabled=false;}
  },true);
  document.addEventListener('change',async event=>{
    const input=event.target.closest?.('[data-ielts-restore]');if(!input)return;
    event.stopImmediatePropagation();const file=input.files?.[0];if(!file)return;
    try{
      const value=JSON.parse(await file.text());
      if(value.kind==='combined-core-ielts'||value.kind===FULL_BACKUP_KIND){
        const validation=validateCombinedBackup(value);if(!validation.valid)throw new Error(validation.errors.join('\n'));
        const result=await restoreCombinedBackup(value);announce(`Đã khôi phục backup kết hợp${result.warnings.length?` với ${result.warnings.length} cảnh báo`:''}. Tải lại giao diện để đồng bộ toàn bộ Library.`,'success');globalThis.location.reload();
      }else{
        const validation=validateIeltsBackup(value);if(!validation.valid)throw new Error(validation.errors.join('\n'));await restoreIeltsBackup(value);announce(`Đã khôi phục IELTS backup cũ${validation.warnings.length?` với ${validation.warnings.length} cảnh báo`:''}.`,'success');globalThis.dispatchEvent(new CustomEvent('vocab:ielts-external-change',{detail:{reason:'ielts-backup-restored'}}));
      }
    }catch(error){announce(error.message,'error');}finally{input.value='';}
  },true);
}
