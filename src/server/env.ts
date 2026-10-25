export type ServerEnv = { ready: boolean; missingRequired: string[]; catalog: { tmdb: boolean; googleBooks: boolean; musicbrainz: boolean } };
export function readServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  const required = ['DATABASE_URL', 'AUTH_SECRET', 'AUTH_ALLOWED_GITHUB_ID'];
  const missingRequired = required.filter((key) => !raw[key]?.trim());
  return { ready: missingRequired.length === 0, missingRequired, catalog: { tmdb: Boolean(raw.TMDB_READ_TOKEN || raw.TMDB_API_KEY), googleBooks: Boolean(raw.GOOGLE_BOOKS_API_KEY), musicbrainz: Boolean(raw.MUSICBRAINZ_USER_AGENT) } };
}
