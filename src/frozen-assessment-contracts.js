export const FROZEN_ASSESSMENT_PURPOSE = 'provider-off-practice-assessment';
export const FROZEN_ASSESSMENT_MODE = 'UNTIMED';
export const FROZEN_ASSESSMENT_BLUEPRINT_KIND = 'frozen-assessment-blueprint';
export const FROZEN_ASSESSMENT_RUN_KIND = 'frozen-assessment-run';

export const FROZEN_ASSESSMENT_ERROR_CODES = Object.freeze({
  COLLISION: 'FROZEN_ASSESSMENT_BLUEPRINT_COLLISION',
  TERMINAL_CONFLICT: 'FROZEN_ASSESSMENT_TERMINAL_CONFLICT',
  INCOMPLETE: 'FROZEN_ASSESSMENT_INCOMPLETE',
  INVALID_INPUT: 'FROZEN_ASSESSMENT_INVALID_INPUT',
  NOT_FOUND: 'FROZEN_ASSESSMENT_NOT_FOUND',
  BINDING_CHANGED: 'FROZEN_ASSESSMENT_BINDING_CHANGED',
  STORAGE: 'FROZEN_ASSESSMENT_STORAGE_ERROR'
});

export function frozenAssessmentError(code, message, cause = null) {
  const error = new Error(message);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

const SECRET_KEY_NAMES = new Set([
  'clientsecret',
  'apikey',
  'geminikey',
  'password',
  'authtoken',
  'accesstoken',
  'refreshtoken',
  'sessiontoken'
]);

export function assertSafeAssessmentData(value, path = 'input', seen = new Set(), depth = 0) {
  if (depth > 100) {
    throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path} exceeds maximum nesting depth.`);
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path} contains non-finite number.`);
    }
    return;
  }
  if (typeof value !== 'object' || value === undefined) {
    throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path} contains unsupported type: ${typeof value}.`);
  }
  if (seen.has(value)) {
    throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path} contains circular reference.`);
  }
  seen.add(value);

  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path} contains symbol properties.`);
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const [key, desc] of Object.entries(descriptors)) {
    if (desc.get || desc.set) {
      throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path}.${key} contains accessor property.`);
    }
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (
      SECRET_KEY_NAMES.has(normalizedKey) ||
      normalizedKey.includes('clientsecret') ||
      normalizedKey.includes('apikey') ||
      normalizedKey.includes('geminikey') ||
      normalizedKey.includes('authtoken')
    ) {
      throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path}.${key} contains secret or forbidden key.`);
    }
    assertSafeAssessmentData(desc.value, `${path}.${key}`, seen, depth + 1);
  }

  seen.delete(value);

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null && proto !== Array.prototype) {
    throw frozenAssessmentError(FROZEN_ASSESSMENT_ERROR_CODES.INVALID_INPUT, `${path} is not a plain data structure.`);
  }
}

export function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

export function stripItemSecrets(item) {
  if (!item || typeof item !== 'object') return item;
  const copy = {
    id: String(item.id || ''),
    kind: String(item.kind || ''),
    prompt: String(item.prompt || ''),
    context: String(item.context || '')
  };
  if (Array.isArray(item.options)) {
    copy.options = item.options.map(opt => ({
      id: String(opt.id || ''),
      text: String(opt.text || '')
    }));
  }
  return copy;
}
