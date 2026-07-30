export function durableStorageUnavailable(database){
  return Object.assign(new Error(`${database} cần IndexedDB để lưu bền; RAM fallback không được coi là thành công.`),{code:'DURABLE_STORAGE_UNAVAILABLE',database,durable:false});
}

export function databaseBlocked(database){
  return Object.assign(new Error(`${database} đang bị tab khác khóa. Hãy đóng các tab Vocab Master khác rồi thử lại.`),{code:'DATABASE_BLOCKED',database,durable:false});
}

export function databaseReadOnly(database,{actualVersion=0,supportedVersion=0}={}){
  return Object.assign(new Error(`${database} đang dùng schema ${actualVersion}, mới hơn schema ${supportedVersion} của build này. Dữ liệu chỉ được đọc; hãy mở bằng phiên bản ứng dụng tương thích để tiếp tục ghi.`),{
    code:'DATABASE_READ_ONLY_FUTURE_SCHEMA',
    database,
    actualVersion,
    supportedVersion,
    durable:false,
    readOnly:true,
    recovery:'use-compatible-build'
  });
}

export function normalizeDatabaseOpenError(error,{database,supportedVersion}={}){
  if(error?.name==='VersionError')return Object.assign(new Error(`${database} dùng schema mới hơn bản ứng dụng này (supported version ${supportedVersion}). Không chuyển sang RAM.`),{code:'DATABASE_SCHEMA_TOO_NEW',database,supportedVersion,durable:false,cause:error});
  if(error?.name==='QuotaExceededError')return Object.assign(new Error(`${database} không đủ dung lượng lưu trữ.`),{code:'DURABLE_STORAGE_QUOTA_EXCEEDED',database,supportedVersion,durable:false,cause:error});
  if(typeof error?.code==='string')return error;
  return Object.assign(new Error(error?.message||`Không thể mở ${database}.`),{code:'DATABASE_OPEN_FAILED',database,supportedVersion,durable:false,cause:error});
}
