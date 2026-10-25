import type { Medium, Observation, Profile, QualityEvidence, ScoredCandidate, TraitProfile, Work } from './types';
const mediums: Medium[] = ['book','music','film'];
const positive = new Set(['positive']);
const negative = new Set(['negative']);
export function buildProfile(works: Work[], observations: Observation[], _now: Date): Profile {
  const byId = new Map(works.map((w) => [w.id, w]));
  const stance = new Map<string, Observation>();
  for (const item of [...observations].sort((a,b) => a.occurredAt.localeCompare(b.occurredAt) || a.createdAt.localeCompare(b.createdAt))) {
    if (positive.has(item.kind) || negative.has(item.kind) || item.kind === 'neutral') stance.set(item.workId, item);
  }
  const result = { book:{}, music:{}, film:{} } as Profile;
  for (const [workId, observation] of stance) {
    const work = byId.get(workId); if (!work || observation.kind === 'neutral') continue;
    const direction = positive.has(observation.kind) ? 'positive' : 'negative';
    for (const trait of new Set(work.traits)) {
      const current = result[work.medium][trait] ?? { positive:0, negative:0, score:0.5, status:'untested', supportingPositive:[], supportingNegative:[] } satisfies TraitProfile;
      if (direction === 'positive' && !current.supportingPositive.includes(work.id)) { current.positive++; current.supportingPositive.push(work.id); }
      if (direction === 'negative' && !current.supportingNegative.includes(work.id)) { current.negative++; current.supportingNegative.push(work.id); }
      current.score = (1 + current.positive) / (2 + current.positive + current.negative);
      current.status = current.positive + current.negative === 0 ? 'untested' : current.positive >= 5 && current.score >= 0.7 ? 'supported-interest' : current.negative >= 5 && current.score <= 0.3 ? 'supported-aversion' : 'tentative';
      result[work.medium][trait] = current;
    }
  }
  return result;
}
export function scoreCandidate(work: Work, evidence: QualityEvidence[], profile: Profile): ScoredCandidate {
  const traits = [...new Set(work.traits)];
  const fit = traits.length ? traits.reduce((sum, trait) => sum + (profile[work.medium][trait]?.score ?? 0.5), 0) / traits.length : 0.5;
  const quality = evidence.length ? Math.max(...evidence.map((item) => item.verified ? item.score : 0.5)) : 0.5;
  return { work, fit, quality, baseScore: 0.6 * fit + 0.4 * quality };
}
