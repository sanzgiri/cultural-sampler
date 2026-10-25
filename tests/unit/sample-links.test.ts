import { describe, expect, it } from 'vitest';
import { sampleLinks } from '../../src/domain/samples';

describe('sample links', () => {
  it('provides either a verified HTTPS destination or an honest unavailable state', () => {
    expect(sampleLinks).toHaveLength(3);
    expect(sampleLinks.every((sample) => sample.status === 'available')).toBe(true);
    for (const sample of sampleLinks) {
      if (sample.status === 'available') expect(sample.href).toMatch(/^https:\/\//);
      if (sample.status === 'unavailable') expect(sample.href).toBeUndefined();
      expect(sample.blurb.length).toBeGreaterThan(20);
      expect(sample.provider.length).toBeGreaterThan(2);
    }
  });
});
