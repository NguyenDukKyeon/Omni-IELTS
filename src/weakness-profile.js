import { learningContractDigest } from './learning-contracts.js';

export const WEAKNESS_PROFILE_SCHEMA_VERSION='WKN_PROFILE_V1';
export const WEAKNESS_TAXONOMY_VERSION='wkn-taxonomy-v1';

export function createWeaknessProfile(metrics={},options={}){
  const taxonomyVersion=String(options.taxonomyVersion||WEAKNESS_TAXONOMY_VERSION);
  const projectorVersion=String(options.projectorVersion||metrics.projectorVersion||'p7-00-v1');
  const denominator=Number(metrics.denominator||0);
  const sampleSize=Number(metrics.sampleSize||0);
  const conflictTargets=Array.isArray(metrics.conflicts?.targets)?[...metrics.conflicts.targets]:[];
  const hasConflict=Number(metrics.conflicts?.count||0)>0;
  const reasonCodes=[];
  if(denominator===0)reasonCodes.push('NO_ELIGIBLE_EVIDENCE');
  else if(denominator<3)reasonCodes.push('SPARSE_EVIDENCE');
  if(hasConflict)reasonCodes.push('CONFLICTING_EVIDENCE');
  if(!reasonCodes.length)reasonCodes.push('SUFFICIENT_EVIDENCE');

  const insufficientData=denominator<3;
  const uncertainty=hasConflict||insufficientData?'high':denominator<8?'medium':'low';
  const canonicalInputRefs=Array.isArray(metrics.canonicalInputRefs)?[...metrics.canonicalInputRefs]:[];
  const conflictHandling={policy:'surface-conflict-without-silent-resolution',result:hasConflict?'CONFLICT_PRESENT':'NO_CONFLICT',targets:conflictTargets};
  const inputBinding={schemaVersion:WEAKNESS_PROFILE_SCHEMA_VERSION,taxonomyVersion,projectorVersion,metricsInputDigest:metrics.inputDigest||null,canonicalInputRefs};
  const inputDigest=learningContractDigest(inputBinding);
  const profile={schemaVersion:WEAKNESS_PROFILE_SCHEMA_VERSION,taxonomyVersion,projectorVersion,canonicalInputRefs,denominator,sampleSize,timeframe:metrics.timeframe||'all_time',reasonCodes,uncertainty,insufficientData,conflictHandling,inputDigest};
  return Object.freeze({...profile,outputDigest:learningContractDigest(profile)});
}
