import {
  buildFallbackPolicy,
  capabilityMatrix,
  cloudConsentIsCurrent,
  loadPhase5Preferences,
  saveCloudConsent,
  saveFallbackSettings
} from './asr-fallback-policy.js';
import { getResolverCapabilities,parseYouTubeVideoId } from './transcript-resolver-v2.js';
import { importTranscriptRescue } from './transcript-import.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function detectPhase5Device(){
  const narrow=Number(globalThis.innerWidth||1024)<=700,mobileAgent=/Android|iPhone|iPad|Mobile/i.test(globalThis.navigator?.userAgent||'');
  return narrow||mobileAgent?'mobile':'desktop';
}

export async function loadPhase5ViewModel(){
  const [{settings,consent},health]=await Promise.all([loadPhase5Preferences(),getResolverCapabilities()]);
  const device=detectPhase5Device(),capability=capabilityMatrix({device,online:globalThis.navigator?.onLine!==false,companionAvailable:health.local?.available===true,modelInstalled:health.local?.modelInstalled===true,cloudConfigured:health.cloud?.configured===true});
  return{device,settings,consent,capability,health};
}

export async function phase5FallbackMarkup(){
  const model=await loadPhase5ViewModel(),local=model.capability.localAsr,cloud=model.capability.gemini,currentConsent=cloudConsentIsCurrent(model.consent||{});
  const localCopy=model.device==='mobile'
    ?'Thiết bị di động không chạy yt-dlp/Whisper cục bộ. Hãy dùng caption server, Gemini có đồng thuận, hoặc import.'
    :local.available?'Companion và model cục bộ sẵn sàng. Audio thô chỉ tồn tại trong thư mục tạm của task.':`ASR cục bộ chưa sẵn sàng (${escape(local.reason||'UNKNOWN')}); ứng dụng không tự tải model.`;
  return`<details class="v10-video-fallback" data-phase5-fallback><summary>Tùy chọn cứu hộ an toàn</summary>
    <p><strong>Caption luôn được thử trước.</strong> Fallback chỉ bắt đầu sau lỗi caption và yêu cầu xác nhận quyền cho nguồn cụ thể.</p>
    <p data-phase5-device="${model.device}">${escape(localCopy)}</p>
    ${model.device==='desktop'?`<label><input type="checkbox" data-phase5-local ${model.settings.localAsrEnabled&&local.available?'checked':''} ${local.available?'':'disabled'}> Cho phép Local Whisper cho nguồn đủ quyền (riêng tư, chưa xác minh)</label>`:''}
    <label><input type="checkbox" data-phase5-cloud ${model.settings.cloudEnabled&&currentConsent&&cloud.available?'checked':''} ${currentConsent&&cloud.available?'':'disabled'}> Cho phép Gemini fallback (riêng tư, chưa xác minh)</label>
    <p>${cloud.available?'Gemini đã được cấu hình bằng khóa phía server.':'Gemini chưa được cấu hình phía server; không có yêu cầu cloud nào được gửi.'}</p>
    <details data-phase5-consent-panel><summary>Xem thông báo dữ liệu, lưu giữ và chi phí</summary>
      <p>Dữ liệu: URL video công khai và nội dung media được gửi đến Gemini để tạo transcript. Không hỗ trợ nguồn cần đăng nhập/cookie.</p>
      <p>Lưu giữ: VocabMaster không upload file trung gian và không giữ audio cloud; transcript được lưu riêng tư trong IndexedDB. Chính sách lưu giữ của provider vẫn áp dụng.</p>
      <p>Chi phí: một lần chạy tối đa 20 phút và tối đa một yêu cầu tính phí; provider có thể tính phí tài khoản server.</p>
      <label><input type="checkbox" data-phase5-ack-data> Tôi đồng ý truyền dữ liệu media công khai tới provider.</label>
      <label><input type="checkbox" data-phase5-ack-retention> Tôi đã đọc phạm vi lưu giữ.</label>
      <label><input type="checkbox" data-phase5-ack-cost> Tôi hiểu giới hạn và khả năng phát sinh chi phí.</label>
      <div><button type="button" class="primary-button" data-phase5-consent-accept>Đồng ý phiên bản hiện hành</button><button type="button" class="secondary-button" data-phase5-consent-decline>Từ chối / tắt cloud</button></div>
    </details>
    <fieldset data-phase5-source-policy><legend>Xác nhận nguồn cho fallback</legend>
      <label><input type="checkbox" data-phase5-source-public> Video công khai</label>
      <label><input type="checkbox" data-phase5-source-no-auth> Không cần đăng nhập</label>
      <label><input type="checkbox" data-phase5-source-no-cookies> Không dùng cookie</label>
      <label><input type="checkbox" data-phase5-source-rights> Tôi có quyền xử lý nội dung này</label>
    </fieldset>
    <div data-phase5-import>
      <label>Import riêng tư SRT/VTT/text<textarea data-phase5-import-text rows="5" maxlength="2000000" placeholder="Dán SRT, VTT hoặc transcript văn bản"></textarea></label>
      <input type="file" data-phase5-import-file accept=".srt,.vtt,.txt,text/plain,text/vtt,application/x-subrip">
      <button type="button" class="secondary-button" data-phase5-import-submit>Kiểm tra và import</button>
    </div>
    <p data-phase5-status role="status" aria-live="polite"></p>
  </details>`;
}

export async function phase5RequestPolicy(root=document){
  const model=await loadPhase5ViewModel(),source={
    visibility:root.querySelector('[data-phase5-source-public]')?.checked?'public':'unknown',
    requiresAuth:root.querySelector('[data-phase5-source-no-auth]')?.checked?false:true,
    cookiesUsed:root.querySelector('[data-phase5-source-no-cookies]')?.checked?false:true,
    rights:root.querySelector('[data-phase5-source-rights]')?.checked?'eligible':'unknown',
    explicitShareOptIn:false
  };
  const settings={...model.settings,localAsrEnabled:root.querySelector('[data-phase5-local]')?.checked===true,cloudEnabled:root.querySelector('[data-phase5-cloud]')?.checked===true};
  return{policy:buildFallbackPolicy({settings,consent:model.consent,capabilities:{device:model.device,online:globalThis.navigator?.onLine!==false,companionAvailable:model.capability.localAsr.available,modelInstalled:model.capability.localAsr.available,cloudConfigured:model.capability.gemini.available},source}),sharing:source};
}

export async function handlePhase5FallbackChange(target){
  const {settings}=await loadPhase5Preferences();
  if(target.matches('[data-phase5-local]'))await saveFallbackSettings({...settings,localAsrEnabled:target.checked});
  else if(target.matches('[data-phase5-cloud]'))await saveFallbackSettings({...settings,cloudEnabled:target.checked});
  else return false;
  return true;
}

export async function handlePhase5FallbackClick(target,root=document){
  const status=root.querySelector('[data-phase5-status]'),setStatus=value=>{if(status)status.textContent=value;};
  if(target.closest('[data-phase5-consent-accept]')){
    const accepted=['data','retention','cost'].every(name=>root.querySelector(`[data-phase5-ack-${name}]`)?.checked);
    if(!accepted){setStatus('Cần xác nhận đủ dữ liệu, lưu giữ và chi phí trước khi bật Gemini.');return{handled:true,refresh:false};}
    const consent=await saveCloudConsent({decision:'accepted',acknowledgesDataTransfer:true,acknowledgesRetention:true,acknowledgesProviderCost:true,maxDurationSeconds:1200}),{settings}=await loadPhase5Preferences();
    await saveFallbackSettings({...settings,cloudEnabled:true});setStatus(`Đã lưu consent ${consent.consentVersion}; cloud chỉ chạy khi server có khóa và nguồn đủ quyền.`);return{handled:true,refresh:true};
  }
  if(target.closest('[data-phase5-consent-decline]')){
    await saveCloudConsent({decision:'declined'});const {settings}=await loadPhase5Preferences();await saveFallbackSettings({...settings,cloudEnabled:false});setStatus('Đã tắt Gemini; caption và import vẫn hoạt động.');return{handled:true,refresh:true};
  }
  if(target.closest('[data-phase5-import-submit]')){
    try{
      const file=root.querySelector('[data-phase5-import-file]')?.files?.[0],text=file?await file.text():root.querySelector('[data-phase5-import-text]')?.value||'',extension=file?.name?.split('.').pop()?.toLowerCase(),format=['srt','vtt','txt'].includes(extension)?(extension==='txt'?'text':extension):'auto',url=root.querySelector('#v10VideoForm [name="url"]')?.value||'',videoId=parseYouTubeVideoId(url)||null;
      const row=await importTranscriptRescue({text,format,url,videoId,title:file?.name||'Imported transcript'});setStatus(`Đã import ${row.segments.length} câu vào revision riêng tư, chưa xác minh.`);return{handled:true,refresh:false,row};
    }catch(error){setStatus(`${error.code||'IMPORT_INVALID'}: ${error.message}`);return{handled:true,refresh:false,error};}
  }
  return{handled:false,refresh:false};
}

export function phase5RecoveryMessage(error={}){
  const messages={PRIVATE_VIDEO:'Video riêng tư không được tải bằng cookie. Hãy import transcript bạn có quyền sử dụng.',AGE_RESTRICTED:'Video giới hạn tuổi không được xử lý tự động. Hãy import transcript hợp lệ.',DELETED:'Video đã bị xóa. Bạn vẫn có thể import transcript riêng tư.',NO_CAPTION:'Không có caption phù hợp. Kiểm tra Local/Gemini có đồng thuận hoặc import.',YTDLP_UNAVAILABLE:'Caption server tạm không khả dụng. Dữ liệu hiện có không bị mất; hãy thử lại hoặc import.',CLOUD_UNAVAILABLE:'Gemini chưa được cấu hình phía server. Dùng Local ASR trên desktop hoặc import.',RIGHTS_INELIGIBLE:'Fallback bị chặn vì chưa xác nhận nguồn công khai, không cookie và đủ quyền; bạn vẫn có thể import transcript riêng tư.'};
  return messages[error.code]||'Không thể tạo transcript an toàn. Bạn có thể import SRT/VTT/text riêng tư.';
}
