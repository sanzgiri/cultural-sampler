import { describe, expect, it } from 'vitest';
import { readServerEnv } from '../../src/server/env';

describe('server environment', () => {
  it('fails closed when auth and database configuration is absent', () => {
    const env = readServerEnv({});
    expect(env.ready).toBe(false);
    expect(env.missingRequired).toEqual(expect.arrayContaining(['DATABASE_URL', 'AUTH_SECRET', 'AUTH_ALLOWED_GITHUB_ID']));
  });
  it('allows catalog credentials to be absent during fixture development', () => {
    const env = readServerEnv({ DATABASE_URL: 'postgres://x', AUTH_SECRET: 'secret', AUTH_ALLOWED_GITHUB_ID: '123' });
    expect(env.ready).toBe(true);
    expect(env.catalog.tmdb).toBe(false);
  });
});
