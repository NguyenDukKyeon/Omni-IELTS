export function reduceMetrics(events = []) {
  if (events.length === 0) {
    return { status: 'INSUFFICIENT_DATA', reason: 'No events provided' };
  }
  
  const eligibleEvents = events.filter(e => !e.assisted && (e.evidenceType === 'independent_review' || e.evidenceType === 'self_assessed_production'));
  if (eligibleEvents.length === 0) {
    return { status: 'INSUFFICIENT_DATA', reason: 'No eligible events' };
  }

  // Example deterministic projection logic required by P7-00
  return {
    numerator: eligibleEvents.filter(e => e.rating !== 'again').length,
    denominator: eligibleEvents.length,
    timeframe: 'all_time',
    eligibility: 'independent_only',
    sampleSize: eligibleEvents.length,
    provenance: eligibleEvents.map(e => e.metadata?.eventId || e.eventId || 'unknown'),
    retrieval: 0,
    delayedSuccess: 0,
    coverage: 0,
    stability: 0,
    recurrence: 0,
    contentCompletion: 0,
    activeDays: new Set(eligibleEvents.map(e => new Date(e.reviewedAt || e.createdAt).toISOString().split('T')[0])).size,
    duplicateHandling: 'kept',
    timezone: 'UTC',
    sparseData: false
  };
}
