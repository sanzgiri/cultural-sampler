# Cultural Sampler v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private cross-device weekly book/music/film sampler with real previews and transparent deterministic taste learning, without Jev or the YouTube Data API.

**Architecture:** A separate Next.js app backed by a dedicated Neon Postgres database. Reviewed editorial candidates feed pure taste/selection functions; a checkpointed weekly job selects first, then enriches previews and publishes atomically. GitHub sign-in admits exactly one configured account; history imports and learning stay private.

**Tech Stack:** Node 22+, Next.js 16 App Router, React 19, TypeScript 5, NextAuth v4, `pg`, Zod, `csv-parse`/`csv-stringify`, Vitest, Testing Library, Playwright; npm lockfile. Select current patched compatible releases within those major versions at installation, verify peer compatibility without `--force`/`--legacy-peer-deps`, and commit exact lockfile.

**Spec:** `docs/superpowers/specs/2026-10-06-cultural-sampler-v1-design.md` (read completely before execution).

## Global Constraints

- Workspace: `/Users/sanzgiri/projects/cultural-sampler`; separate repository/database/Vercel hostname. Do not modify `../eg-news` or deploy to `wider.vercel.app`.
- Planning is complete enough for review, not implementation authorization. User switches to Luna med before execution.
- v1 explicitly has no Jev, no LLM, no YouTube Data API, and no account-history OAuth connectors.
- Default edition: up to 5 books + 5 albums/recordings + 5 films per week; target 3 familiar-fit + 1 adjacent + 1 exploration per medium.
- Select before preview/access enrichment. Preview availability/free access never enters scoring or tie-breaking.
- Starter pilot: >=30 reviewed admitted works per medium, six primary genres, three origin regions and three release decades per medium; admit only declared quality >=0.7.
- Missing sample stays missing; underfill rather than violate exclusions, identity, quality or diversity.
- Max history upload 2 MiB/5,000 rows; stage expires after 24 hours; no raw uploads/logs/public personal fixtures.
- Provider request timeout 8 seconds; <=1 retry for 429/5xx; MusicBrainz globally <=1 request/second. Weekly enrichment <=20 seconds/10 external requests per invocation.
- Every personal route checks session, current GitHub-ID allowlist and owner; mutations require same origin/CSRF. Fail closed on absent auth/DB configuration.
- Local week: Monday date in configured IANA timezone; due Monday 08:00 local, default America/Los_Angeles. Daily cron is approximate, not minute-exact.
- Metadata cache 7 days, negative lookup 6 hours, availability 24 hours, subject to shorter provider terms. Browser renders do not call providers.
- No cron-triggered entire catalog crawl, media proxy, downloaded chapters/audio, continuous autoplay, or unpublished rights claims.

## Review Focus

1. Quoted/BOM CSV, series mistaken for movies, unsupported rating scales and Unicode homonyms: review instead of silent identity/taste merges (Tasks 4–5).
2. Repeated/contradictory feedback, borrowed books and deletion of the only imported evidence: no inflated counts or retained derived private data (Tasks 3, 6, 10).
3. Preview removal, recording mismatch, country restrictions or missing keys: same selected work remains; truthful fallback, zero page-load API calls (Tasks 7, 9, 10).
4. DST/week boundaries and overlapping cron/manual retries: one stable edition, no partial publication or duplicate requests from stale workers (Task 9).
5. Second GitHub identity, absent auth config, cross-origin writes and shared caches: zero personal data leakage (Tasks 2–3, 10–11).

## Deliverables and order

Tasks 1–3 form the private foundation; 4–5 normalize data; 6 supplies the pure recommendation engine; 7 supplies preview/access adapters; 8 verifies the live corpus; 9 publishes; 10 delivers the UI; 11 verifies and deploys only with user approval. Parallel work on 6/7 is safe only after the types in 4–5 are locked. Everything else is sequential by default for Luna med.

### File map

```
package.json, package-lock.json, tsconfig.json, next.config.ts, vitest.config.ts
.env.example, .gitignore, README.md, HANDOFF.md
src/app/{layout.tsx,globals.css,page.tsx}
src/app/{login,setup,edition,archive,learning,saved,imports,settings,catalog}/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/{settings,feedback,saves,imports,imports/[id]/commit,imports/[id],data/export,data/delete,profile/reset,catalog,lookup,samples/refresh,jobs/advance,cron,health}/route.ts
src/domain/{types,schemas,identity,imports,taste,selection,reasons,week}.ts
src/domain/taxonomy.json
src/server/{env,auth,guard,db,repositories,privacy,limits,http,cache}.ts
src/server/providers/{tmdb,books,musicbrainz,itunes,samples}.ts
src/server/jobs/{ingest,generation}.ts
src/components/{EditionCard,Preview,FeedbackControls,LearningPanel,ImportReview,SettingsForm}.tsx
migrations/{001_catalog_and_users,002_personal_data,003_jobs_and_cache}.sql
scripts/{migrate,ingest-catalog,import-booklist,prime-samples,advance-edition,export-data}.ts
catalog/seed-format.example.json
fixtures/{generic-history,imdb-ratings,library-history,catalog,providers}/...
tests/unit/*.test.ts, tests/integration/*.test.ts, tests/e2e/*.spec.ts
vercel.json, docs/acceptance-report.md, docs/deployment.md
```

Provider samples contain minimal synthetic/permitted facts, no raw private exports. `data/` and `imports/` are already ignored. All `src/server` modules import `server-only`; tests use a test-only module alias, never weaken production bundling. File responsibilities are represented by task ownership below.

### Task 1: Testable independent project foundation

**Files:** Create project configs, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/server/env.ts`, `src/domain/types.ts`, `tests/unit/env.test.ts`, `.env.example`; update README/.gitignore. No other repo changes.

**Interfaces:** `readServerEnv(raw: Record<string,string|undefined>): ServerConfig` validates Node/server configuration and distinguishes readiness from optional catalog keys. v1 env names are exactly those in spec section 5, plus `DATABASE_URL_TEST` for destructive integration fixtures. No Jev/YouTube variables.

- [ ] Create Node/npm project and test harness first; initialize a separate Git repository only after user review. Do not install an AI SDK or copy another project's `node_modules`/lockfile.
- [ ] Write `env_requires_auth_and_database` and `env_allows_absent_catalog_keys`; assert missing allowlist/secret/database produces `ready=false`, absent TMDB produces only a catalog capability warning, and invalid numeric allowlist is rejected. Timezone validation belongs to Task 4's settings schema. Add `no_model_or_youtube_dependencies` manifest assertion.
- [ ] Run `npm test -- tests/unit/env.test.ts`; expect RED for missing parser/exports, not a network error.
- [ ] Implement typed environment parser, minimal app shell, shared domain type contracts listed in Task 4 (define these now so repositories need no forward imports), and scripts `test`, `test:integration`, `test:e2e`, `typecheck`, `build`, `db:migrate`, `catalog:ingest`, `catalog:booklist`, `edition:advance`. Server secrets are not `NEXT_PUBLIC_*`.
- [ ] Run `npm test -- tests/unit/env.test.ts && npm run typecheck && npm run build`; expect PASS (build need not connect to live DB). Commit `chore: establish independent tested app foundation`.

### Task 2: Allowlisted private sign-in and request guards

**Files:** Create `src/server/auth.ts`, `src/server/guard.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `/login/page.tsx`, `/api/health/route.ts`, `tests/unit/auth.test.ts`, `tests/integration/guards.test.ts`.

**Interfaces:** `isAllowedGithubId(id: string|null, allowed: string): boolean`; `requireOwner(): Promise<{ownerId:string}>` (repository implementation in Task 3); `requireSameOrigin(request: Request, appOrigin:string): void`. NextAuth JWT/session carries only GitHub numeric ID and necessary identity, no provider access token. Auth errors produce 401/403, missing config 503.

- [ ] Write tests rejecting null session, `id='999'` against allowed `123`, removed allowlist, missing secret and hostile Origin; verify allowed `123` accepted and expired JWT rejected.
- [ ] Run `npm test -- tests/unit/auth.test.ts`; expect RED. Stub owner repository at the boundary, not an auth bypass flag.
- [ ] Adapt CosmoRSS's GitHub provider and JWT-session pattern, add allowlist at sign-in and every private request. Require all configured auth fields; never follow CosmoRSS's optional/no-provider behavior as a public demo mode. Use minimal profile OAuth scope, standard library CSRF/session handling, private/no-store response defaults.
- [ ] Run unit tests/typecheck; integration guards run with Task 3's test DB. Prove `/api/health` exposes booleans only, not counts/config values. Commit `feat: enforce private single-account access`.

### Task 3: Schema, transactional repositories and privacy deletion

**Files:** Create SQL migrations, `src/server/db.ts`, `src/server/repositories.ts`, `src/server/privacy.ts`, `scripts/migrate.ts`, `tests/integration/repositories.test.ts`, `tests/integration/privacy.test.ts`.

**Interfaces:** Stable UUID `WorkId`; `OwnerId` maps to `app_users.id` with unique GitHub ID. `getOrCreateOwner(githubId:string): Promise<OwnerId>`; `commitImport(ownerId,stageId,decisions:ImportCommitDecisions): Promise<ImportCommitResult>`; decision fields are `hideObservedWorks:boolean` and `rows:Array<{rowId:string,workId:WorkId|null,accept:boolean,ratingInterpretation:'positive'|'negative'|'neutral'|'none'}>`; result fields are `sourceId,committedCount,unresolvedCount,skippedCount`;  `recordObservation(ownerId,input): Promise<Observation>`; `deleteImportSource(ownerId,sourceId): Promise<void>`; `resetTaste(ownerId): Promise<void>`; `deleteAllPersonalData(ownerId): Promise<void>`; `exportPersonalData(ownerId): Promise<PersonalExport>`. Other methods are owner-qualified typed read/write functions, not raw SQL passed from UI.

- [ ] Write integration tests for identifier uniqueness, transactions rolling back on invalid work ID, cross-owner read/write rejection, source deletion clearing associated rows plus all derived profiles/predictions/editions while preserving independent feedback/saves, and full deletion leaving no personal records. Stage-only delete is separate from committed-source delete.
- [ ] Run `npm run test:integration -- tests/integration/repositories.test.ts tests/integration/privacy.test.ts`; expect RED in an explicitly dedicated test DB. Refuse reset scripts if test DB URL equals production or is absent.
- [ ] Implement spec tables, parameterized SQL, foreign keys, unique `(owner_id,week_key)`/`(provider,external_id)` and cascade policies. Add observation source ID/type/date; source settings include `hideObservedWorks`. Editions snapshot choices/reasons, not raw history. `pg` pool max 3 with Neon TLS verification intact; transactions use one checked-out client.
- [ ] Implement privacy actions transactionally. Deleting imported evidence invalidates all owner-derived learning/publication snapshots; profile reset preserves exposure/saves unless explicitly requested. Clear or abort active generation jobs referencing removed data. Candidate/public metadata may remain; histories/tokens may not.
- [ ] Run integration suite/typecheck; exercise migrations twice without data loss. Commit `feat: persist isolated catalog and auditable personal evidence`.

### Task 4: Canonical domain and review-first history parsing

**Files:** Extend `src/domain/types.ts` from Task 1; create `src/domain/schemas.ts`, `identity.ts`, `imports.ts`, `taxonomy.json`, sanitized history fixtures, `tests/unit/imports.test.ts`, `tests/unit/identity.test.ts`.

**Interfaces:** Validate/use shared Task 1 definitions and extend parser-specific types; the contract is:

- `Medium = 'book'|'music'|'film'`; `TraitKey = string` (normalized namespace such as `genre:jazz`).
- `Work`: `id,medium,title,creators,primaryCreatorKey,franchiseKey|null,primaryGenre|null,traits,language|null,originRegions,releaseYear|null,musicSubtype|null,verifiedIdentifiers`. Traits include each verified genre key as `genre:{canonical-key}`. No preview/access data; null primary genre cannot enter an edition.
- `QualityEvidence`: `workId,sourceUrl,sourceType,statement,verified,observedAt,score` with allowed scores `0.8|0.7|0.5`.
- `Observation`: `id,ownerId,workId,sourceId|null,kind,occurredAt,createdAt`; kinds `positive|negative|neutral|known|borrowed|viewed|finished|defer`, with required defer-until for defer. Kind mapping from UI/import is explicit.
- `NormalizedImportRow`: `rowId,medium,title,creator,year|null,identifiers,rating|null,ratingScale|null,observationKinds,observedAt|null,needsReview,errors`; no imported description.
- `parseHistory(input:Uint8Array,format:'generic-csv'|'generic-json'|'imdb-csv'|'library-json'): ImportParseResult`.
- `normalizeLookupText(text:string): string`; `proposeMatches(row,works): MatchProposal[]` with `exact-identifier|review-required` confidence (never made-up probability).

- [ ] Write named tests for quoted CSV/BOM/newlines, malformed JSON, >2MiB/>5,000 rows, IMDb series skipped, library `providerRating=5` giving no positive observation, unsupported scale giving no taste, title homonyms/Unicode not auto-merged, ISBN edition vs work distinction, and empty creators requiring review.
- [ ] Run `npm test -- tests/unit/imports.test.ts tests/unit/identity.test.ts`; expect RED.
- [ ] Implement parsing/validation using CSV library, explicit known format mappings and rating bins from spec. Normalize text without ASCII-only slugs; exact identifier equality is the only automatic identity match. Genre alias mapping is curated and versioned; no AI/substring classification. Keep parsed date unknown when missing, rather than turn fetch timestamps into consumption dates.
- [ ] Run tests/typecheck; commit `feat: normalize histories without inventing taste or identity`.

### Task 5: Reviewed catalog ingestion and canonical provider metadata

**Files:** Create `src/server/http.ts`, `cache.ts`, `limits.ts`, providers `tmdb.ts`, `books.ts`, `musicbrainz.ts`, jobs `ingest.ts`, scripts `ingest-catalog.ts`, `import-booklist.ts`, `catalog/seed-format.example.json`, `tests/unit/catalog.test.ts`, `tests/integration/provider-cache.test.ts`.

**Interfaces:** `CatalogAdapter.lookup(row:NormalizedImportRow,ctx:ProviderContext): Promise<LookupResult>` returns typed candidates, source/timestamp and warnings. `ProviderContext` defines `mode:'cache-only'|'live'`, injected clock, remaining request/time budget and source identifier. `ingestSeeds(ownerId,manifest:SeedManifest): Promise<IngestReport>` stages source-approved seeds then checkpoints batches with <=20 seconds/10 external calls; an empty manifest advances the existing catalog-ingest job. Seed schema: exact title/creator/medium/identifiers, primary genre/tags, optional origin/year/language, evidence URL/type/statement/approval. `importBooklistSummary(input): PendingSeed[]` produces pending candidates, never approved evidence when URL is absent. `fetchProviderJson(url,init,ctx): Promise<unknown>` performs timeout/status/rate checks; in cache-only mode it returns cached metadata or an explicit cache miss without any network call. Secrets never appear in logs/cache keys.

- [ ] Write tests for missing source URL remaining pending, duplicated source not increasing quality, `first_seen` not becoming publication year, absent/invalid keys yielding disabled connector, 429 honoring retry budget, globally serialized MusicBrainz slots across two workers, JSON-shape errors and unsafe/manual URLs not server-fetched.
- [ ] Run unit/cache integration tests; expect RED.
- [ ] Adapt only necessary TMDB types/requests, add movie-specific search/find/credits. Build Google Books and small optional Open Library lookup, MusicBrainz release-group/release/recording lookup. Use Zod response projections, 8-second request limit, durable cached values keyed by provider/operation/region/identity, and DB reservation for MusicBrainz's one-per-second rule.
- [ ] Implement approved-manifest ingestion in `generation_jobs` with kind `catalog_ingest`, metadata match review and minimal booklist importer; keep pending work separate from identity-verified admitted works. Do not access private raw rows unless the user supplies the path and permits it. `booklist` ASIN must not be treated as ISBN. Ambiguous matches stay pending. Catalog lookup/import limits: 20 authenticated lookup actions/day, 10 approved metadata records per ingestion invocation; further chunks require explicit advance.
- [ ] Run tests/typecheck; commit `feat: ingest verified candidates through bounded catalog adapters`.

### Task 6: Pure deterministic taste, diversity and grounded reasons

**Files:** Create `src/domain/taste.ts`, `selection.ts`, `reasons.ts`, `week.ts`, `tests/unit/taste.test.ts`, `selection.test.ts`, `week.test.ts`.

**Interfaces:** `buildProfile(works:Work[],observations:Observation[],now:Date): Profile`; profile keyed by medium/trait includes P/N counts, score, supporting work IDs and `untested|tentative|supported-interest|supported-aversion`. `scoreCandidate(work:Work,quality:QualityEvidence[],profile:Profile): ScoredCandidate`; `selectEdition(input:SelectionInput): SelectionResult`; `selectionReason(choice,profile,evidence): GroundedReason`; `getWeekKey(now:Date,timeZone:string): string`; `isWeekDue(now,timeZone): boolean`.

`SelectionInput` includes only approved works/evidence, profile, exposure and source-hide settings, active deferrals, explicit language/trait/creator/content blocks, prior editions, rediscovery flag and injected now; no sample/free/provider-entitlement fields. Output has per-medium choices `{workId,slot,fit,quality,baseScore,reason}` and underfill/unmet-slot diagnostics.

- [ ] Write `trait_beta_smoothing` asserting zero=>0.5, P=5/N=0=>6/7 and supported interest, P=0/N=5=>1/7 and aversion; two positives on the same work count once. Borrowed/save/defer/preview events do not change taste; latest neutral clears; first-party wins same-time conflict; music feedback does not change books.
- [ ] Write selection tests for explicit disliked work exclusion, no repeated canonical work/primary creator/franchise, <=2 same primary genre, >=3 genres at five works, quality floor, missing metadata underfill, deterministic output, adjacent/exploration slots and editorial cold start. Add a counterexample requiring backtracking rather than a naive greedy first five. Inject changed preview/free values into otherwise identical full catalog fixtures and assert selected IDs unchanged.
- [ ] Write timezone/DST tests: UTC Monday 06:30 is previous local Sunday in Los Angeles; local Monday 07:59 not due, 08:00 due; crossing DST yields Monday local date not a shifted UTC week.
- [ ] Run `npm test -- tests/unit/taste.test.ts tests/unit/selection.test.ts tests/unit/week.test.ts`; expect RED.
- [ ] Implement exact spec formula/base weights/stance precedence and exclusions. Candidate pool capped at 30 top base scores per medium; bounded search <=10,000 nodes. Optimize lexicographically: filled slots, genuine target-slot matches, summed base score, stable sorted work IDs. Prune violated constraints; report search-budget underfill explicitly. Reasons reference real evidence/support IDs and correct cold-start labels, never unsupported summaries.
- [ ] Run tests/typecheck; commit `feat: rank weekly editions with transparent deterministic preferences`.

### Task 7: Preview/access enrichment without search APIs

**Files:** Create `src/server/providers/itunes.ts`, `samples.ts`, extend TMDB/Books projections, `tests/unit/samples.test.ts`, synthetic provider fixtures.

**Interfaces:** `Sample = {provider,kind,url,embedId|null,storeUrl|null,status,region,observedAt,warning|null}`; `AccessOffer = {kind,providerName,url,region,observedAt}`. `resolveSamples(work:Work,region:string,ctx:ProviderContext): Promise<{samples:Sample[],offers:AccessOffer[],warnings:string[]}>`. Source `work_editions` keeps ISBN/language, album/recording identity and creator match; resolutions do not mutate primary work or ranking evidence.

- [ ] Write tests for TMDB official YouTube Trailer/Clip preference, invalid embed IDs rejected, unknown publisher labeled 'listed by TMDB', region-only watch providers and supplied watch page; Google Books `NO_PAGES` => unavailable; iTunes wrong live/cover recording rejected; missing previewURL retains store link; absent sample never changes work selection.
- [ ] Add network-spy tests asserting no requests to YouTube Data API, Spotify, TypeSafe/Jev or AI endpoints; no arbitrary PDF/audio download/proxy or YouTube HTML search.
- [ ] Run `npm test -- tests/unit/samples.test.ts`; expect RED.
- [ ] Implement post-selection resolutions plus a `prime-samples` CLI that advances bounded cache prewarming for already admitted works. Sample results do not alter admission/quality. In cache-only mode, attach existing results or unverified/missing states, never issue network requests. For music, resolve correct representative recording/storefront, keep promotion link/badge data proximate to audio; uncertain match => unverified/no player. Default book preview is an official outbound link. YouTube IDs originate from TMDB or a manually approved manifest, not guessed search results. Provider failure is a warning with a fallback, not item replacement.
- [ ] Run tests/typecheck; commit `feat: attach authorized samples independently of ranking`.

### Task 8: Live capability probe and reviewed starter corpus

**Files:** Write ignored `data/catalog-seeds.json`, `docs/capability-report.md` and minimal non-private summaries. No credentials/histories committed.

**Interfaces:** Uses Task 5's manifest and ingestion command, Task 7 resolutions. Outputs a verified database corpus and aggregate report, not hardcoded demo claims.

- [ ] Create a probe checklist for 10 actual works per medium including mainstream paid works, independent works, different decades/regions, a classical recording and missing-sample examples. Review terms/attribution and current API limits before activating live playback.
- [ ] With user approval to reuse catalog credentials, read existing TMDB/Books values locally and copy only approved env variables into ignored `.env.local` mode 600; do not print them or reuse the exposed Jev credential. If access is unavailable, mark live probe blocked and proceed only with fixtures, not fabricated successes.
- [ ] Verify real identities, selected representative recordings, country availability and desktop/mobile preview/link playback. Manually record rights/provenance and actual failures. A returned URL alone is not a playback pass.
- [ ] Build >=30 approved seeds/medium with corpus diversity targets from spec, verified source links and reviewed taxonomy; prewarm their sample metadata through bounded `prime-samples` batches even when previews are unavailable. Reuse booklist minimally only with correct URL/rights; do not equate recommender volume with quality. Ingest in bounded batches and review unmatched records.
- [ ] Report actual per-medium preview coverage, ambiguous/missing samples and corpus counts. No free-only substitutions to meet coverage. Commit only `docs/capability-report.md` and permitted format changes: `docs: record tested catalog and preview capabilities`.

### Task 9: Resumable, idempotent weekly generation

**Files:** Create `src/server/jobs/generation.ts`, `/api/jobs/advance/route.ts`, `/api/cron/route.ts`, `scripts/advance-edition.ts`, `tests/integration/generation.test.ts`.

**Interfaces:** `advanceGeneration(ownerId:OwnerId,now:Date): Promise<JobAdvanceResult>` performs one leased step; `publishEdition(ownerId,jobId): Promise<Edition>` is transactional and version/input-hash qualified; `getCurrentEdition(ownerId): Promise<Edition|null>` reads only DB. `JobAdvanceResult` has status, progress, diagnostics and next-action, not a secret. `edition:advance` uses server env/owner resolution, never accepts arbitrary user override.

- [ ] Write integration tests for two concurrent advances, unique owner/week publication, worker lease expiry/stale-worker compare-and-set rejection, crash after selected-ID checkpoint, preview provider outage without changed IDs, import deletion aborting stale job, failed transaction publishing no partial items, and known local-week boundaries. Assert response budget and <=10 external calls/step.
- [ ] Run `npm run test:integration -- tests/integration/generation.test.ts`; expect RED.
- [ ] Implement states/lease tokens/fenced writes with due-week check and frozen selections before enrichment. Automatic cron publication uses `ProviderContext.mode='cache-only'` and can traverse selecting/enriching/publishing within one <=20-second invocation; do not spend several daily cron ticks waiting on fresh preview fetches. Test zero external calls during automatic publication. Lease duration must outlast bounded work (60 seconds for <=20-second invocation); write checkpoints only when lease token matches. Make resolutions idempotent via provider cache. Advance multiple cache-only stage transitions or one live sample-refresh batch per invocation and stop before total time budget is exceeded. `/api/samples/refresh` explicitly advances <=10 external calls/20 seconds for selected-item metadata only; it cannot change IDs/reasons or republish the edition.
- [ ] Protect cron via constant-time `CRON_SECRET` comparison; protect browser advance via session/ownership/origin and persistent rate limit (one active job, <=6 advances/hour/owner). No duplicate weekly edition; no override for published weeks. Cleanup expired import stages in bounded cron step.
- [ ] Run integration/typecheck tests; commit `feat: publish checkpointed weekly editions atomically`.

### Task 10: Complete private UI and data actions

**Files:** Create pages/components and private API routes from file map, `tests/unit/feedback.test.ts`, `tests/integration/routes.test.ts`, `tests/e2e/sampler.spec.ts`, `learning.spec.ts`, `imports.spec.ts`.

**Interfaces:** All handlers call Task 2 guard + Task 3 typed owner repositories. `POST /api/feedback` input `{workId,action}` maps actions to stance/exposure/defer observations; `POST /api/saves` toggles save without taste. `/api/imports` stages; commit accepts reviewed work IDs/rating/source-hide decisions; delete handles staged vs committed source explicitly. `GET /api/data/export` returns private JSON; `POST /api/data/delete` confirmed full deletion. `/api/profile/reset` confirms taste-only scope. `/api/lookup` is an explicit rate-limited action, never invoked by ordinary rendering.

- [ ] Write tests proving `enjoyed` maps positive+known, favorite/dislike onboarding also known, `more_like_this` positive-only, `not_now` defer-until+28days, save/play/preview failure no taste. Export escaping and private/no-store headers are asserted. Full/source deletion removes derived data and retains only permitted independent actions.
- [ ] Write Playwright flows for cold-start editorial labels, <=15 cards/no load-more, match review/series skipped, corrected feedback reflected in learning, two browser contexts seeing same saves/profile, historical pagination and source deletion. For tests only, mint valid NextAuth test JWTs with a test-only secret/config for two known GitHub IDs; do not create a production auth-bypass flag.
- [ ] Run focused unit/route tests and Playwright; expect RED for missing handlers/pages.
- [ ] Implement setup, finite edition/archive, imports, saved list, learning/settings and reviewed catalog controls. Use accessible labels/keyboard states and responsive cards. Server-render private DB reads; preview player loads after click, handles failure, has official external fallback and attribution, and one audio sample at a time. No autoplay playlist.
- [ ] Show trait examples/counts/support status and untested areas; versioned snapshot changes; at >=20 distinct held-out outcomes per medium show recorded-fit Brier score vs constant 0.5, with sample-size/observed-only warnings. Count first post-prediction explicit positive/negative response per work, never onboarding/history or repeats; add tests for exclusion/counting and the 19/20 boundary. At fewer than 20 show insufficient evidence. Never call smoothed scores 'calibrated probabilities'.
- [ ] Assert two consecutive edition page loads make zero provider requests; stale availability shows date; empty/blocked jobs show last good edition and actionable status; low inventory warning at <10 unseen eligible works per medium. Run unit/integration/e2e/typecheck/build. Commit `feat: deliver finite sampler and editable evidence-backed learning`.

### Task 11: Release audit and explicitly approved deployment

**Files:** Create `docs/acceptance-report.md`, `docs/deployment.md`, proposed `vercel.json`; update README/HANDOFF. External changes require user approval and available credentials.

**Interfaces:** Release evidence report lists command/output/date, actual live probes, remaining limitations and production URL (only after verified deployment). No scripts refer to the Wider project/domain.

- [ ] Audit source/imports/exports, privacy deletion, literal model/YouTube API endpoints/dependencies, secret/client bundle leakage, provider attribution and all Review Focus cases. Unit tests should permit standard YouTube embed URLs, not its Data API. Check Git staged files contain no `.env`, histories or raw booklist data.
- [ ] Run `npm test`, `npm run test:integration`, `npm run test:e2e`, `npm run typecheck`, `npm run build`; require actual PASS outputs. Record fixture-only vs live-tested coverage separately. Do not claim deployment from a successful build.
- [ ] Ask approval before creating the dedicated Neon database, OAuth client, Vercel project or GitHub repository. Configure this app's GitHub callback and numeric allowlist, auth/cron secrets and catalog keys server-side. Confirm current Vercel cron duration/plan eligibility. Set one daily cron to `/api/cron` only if supported; otherwise document manual/CLI advance fallback without quietly buying a worker.
- [ ] Deploy on a new hostname. Verify public `/api/health` reveals readiness only; anonymous profile/edition/import/export blocked; wrong OAuth account refused; authorized desktop/mobile work; cron absent/wrong secret refused; valid job generates one real fixed edition; preview/store links and deletion work. Revisit from a second device.
- [ ] Record verified URL/tests/known limitations and commit `docs: record independently verified sampler release`. Production success is blocked until these checks run; no new model key is needed.

## Credential and setup boundary

Needed for film metadata: approved valid TMDB token/key (existing `tvguide` configuration, not tested yet). Google Books key optional for project quota identification (existing library tracker configuration). MusicBrainz/iTunes public lookup needs no key. Cloud persistence requires a dedicated `DATABASE_URL`; private GitHub sign-in requires **new app-specific OAuth client ID/secret**, numeric allowed user ID, `AUTH_SECRET` and callback URL. Cron uses a generated random secret. These are app/cloud setup credentials, not YouTube/Jev/media-account passwords.

The implementation worker can complete fixture-based code/tests before cloud setup. An actually usable cross-device live app and capability probe cannot be declared finished without auth/database/catalog access and real playback checks.

## Self-review and execution handoff

Coverage: all spec sections map to Tasks 1–11; constrained quality/diversity/learning to 6, catalog/identity to 4–5/8, previews to 7/10, private ownership/deletion to 2–3/10, bounded weekly publication to 9, and production checks to 11. Interfaces are defined before downstream use. Test commands/negative cases are task-specific; no model/data-search feature is silently restored.

Execution method supplied by user: switch to **Luna med** for implementation. After user reviews this draft, execute tasks sequentially with native tools and TDD, preserving task checkboxes and evidence. Do not ask the user to select another model or begin implementation on the current one. Review source/provider policy mismatches before release rather than assuming old research grants permission.
