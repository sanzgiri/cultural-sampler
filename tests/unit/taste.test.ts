import { describe, expect, it } from 'vitest';
import { buildProfile, scoreCandidate } from '../../src/domain/taste';
import type { Observation, Work, QualityEvidence } from '../../src/domain/types';

const work = (id: string, medium: Work['medium'], traits: string[]): Work => ({ id, medium, title: id, creators: ['Creator'], primaryCreatorKey: 'creator', franchiseKey: null, primaryGenre: traits[0]?.replace('genre:', '') ?? null, traits, language: 'en', originRegions: ['US'], releaseYear: 2020, musicSubtype: medium === 'music' ? 'album' : null, verifiedIdentifiers: {} });
const evidence = (workId: string): QualityEvidence[] => [{ workId, sourceUrl: 'https://example.com/evidence', sourceType: 'editorial', statement: 'Reviewed selection', verified: true, observedAt: '2026-01-01', score: 0.8 }];
const obs = (workId: string, kind: Observation['kind'], occurredAt = '2026-01-01'): Observation => ({ id: `${workId}-${kind}`, ownerId: 'owner', workId, sourceId: null, kind, occurredAt, createdAt: occurredAt });

describe('deterministic taste', () => {
  it('smooths distinct positive and negative work evidence', () => {
    const works = [work('a', 'book', ['genre:fiction']), work('b', 'book', ['genre:fiction']), work('c', 'book', ['genre:fiction']), work('d', 'book', ['genre:fiction']), work('e', 'book', ['genre:fiction'])];
    const profile = buildProfile(works, works.map((w) => obs(w.id, 'positive')), new Date('2026-01-02'));
    expect(profile.book['genre:fiction'].score).toBe(6 / 7);
    expect(profile.book['genre:fiction'].status).toBe('supported-interest');
  });
  it('does not let preview or free-access metadata affect candidate score', () => {
    const candidate = work('new', 'book', ['genre:fiction']);
    const profile = buildProfile([candidate], [obs(candidate.id, 'positive')], new Date('2026-01-02'));
    const score = scoreCandidate(candidate, evidence(candidate.id), profile);
    expect(score.baseScore).toBeCloseTo(0.72);
  });
});
