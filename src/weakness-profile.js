import { learningContractDigest } from './learning-contracts.js';

export const WEAKNESS_PROFILE_SCHEMA_VERSION='WKN_PROFILE_V1';
export const WEAKNESS_TAXONOMY_VERSION='wkn-taxonomy-v1';
export const WEAKNESS_PROJECTOR_VERSION='p7-00-wkn-v1';

export function createWeaknessProfile(metrics={},options={}){
  const taxonomyVersion=String(options.taxonomyVersion||WEAKNESS_TAXONOMY_VERSION);
  const projectorVersion=String(options.projectorVersion||WEAKNESS_PROJECTOR_VERSION);
  const denominator=Number(metrics.denominator||0);
  const sampleSize=Number(metrics.sampleSize||0);
  const conflictTargets=Array.isArray(metrics.conflicts?.targets)?[...metrics.conflicts.targets].sort():[];
  const hasConflict=conflictTargets.length>0;
  const insufficientData=denominator<3;
  const reasonCodes=[];
  if(denominator===0)reasonCodes.push('NO_ELIGIBLE_EVIDENCE');
  else if(insufficientData)reasonCodes.push('SPARSE_EVIDENCE');
  if(hasConflict)reasonCodes.push('CONFLICTING_EVIDENCE');
  if(!reasonCodes.length)reasonCodes.push('EVIDENCE_SUPPORTED');

  const uncertainty=hasConflict||insufficientData?'high':denominator<8?'medium':'low';
  const canonicalInputRefs=Array.isArray(metrics.canonicalInputRefs)
    ?metrics.canonicalInputRefs.map(ref=>structuredClone(ref))
    :[];
  const conflictHandling={
    policy:'same-target-observation-conflict-v1',
    result:hasConflict?'CONFLICT_PRESENT':'NO_CONFLICT',
    targets:conflictTargets
  };
  const inputBinding={
    schemaVersion:WEAKNESS_PROFILE_SCHEMA_VERSION,
    taxonomyVersion,
    projectorVersion,
    metricsSchemaVersion:metrics.schemaVersion||null,
    metricsProjectorVersion:metrics.projectorVersion||null,
    metricsInputDigest:metrics.inputDigest||null,
    canonicalInputRefs
  };
  const inputDigest=learningContractDigest(inputBinding);
  const profile={
    schemaVersion:WEAKNESS_PROFILE_SCHEMA_VERSION,
    taxonomyVersion,
    projectorVersion,
    canonicalInputRefs,
    denominator,
    sampleSize,
    timeframe:metrics.timeframe||'all_time',
    recency:{timeZone:metrics.timeZone||'UTC',timeframe:metrics.timeframe||'all_time'},
    reasonCodes,
    uncertainty,
    insufficientData,
    conflictHandling,
    inputDigest
  };
  return Object.freeze({...profile,outputDigest:learningContractDigest(profile)});
}
