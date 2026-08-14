import crypto from 'node:crypto';

export function createWeaknessProfile(metrics) {
  if (metrics?.status === 'INSUFFICIENT_DATA') {
    return {
      schemaVersion: '1.0',
      taxonomyVersion: '1.0',
      projectorVersion: '1.0',
      insufficientData: true,
      uncertainty: 'high',
      canonicalInputs: [],
      reasonCodes: ['NO_ELIGIBLE_EVENTS']
    };
  }

  const payload = JSON.stringify(metrics);
  const outputDigest = crypto.createHash('sha256').update(payload).digest('hex');
  const inputDigest = crypto.createHash('sha256').update(JSON.stringify(metrics.provenance || [])).digest('hex');

  return {
    schemaVersion: '1.0',
    taxonomyVersion: '1.0',
    projectorVersion: '1.0',
    canonicalInputs: metrics.provenance || [],
    denominator: metrics.denominator || 0,
    sampleSize: metrics.sampleSize || 0,
    timeframe: metrics.timeframe || 'all_time',
    reasonCodes: ['OK'],
    uncertainty: 'low',
    insufficientData: false,
    conflictHandling: 'latest_wins',
    inputDigest,
    outputDigest
  };
}
