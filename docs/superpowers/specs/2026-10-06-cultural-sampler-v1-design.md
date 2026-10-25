# Cultural Sampler v1 — design and implementation brief

Status: concrete review draft for Luna med handoff. User approved the direction and requested planning only. Implementation must wait for user review and model switch.

This document supersedes the earlier feasibility proposal where they differ. `cultural-sampler` is the working name, not Wider. Workspace: `/Users/sanzgiri/projects/cultural-sampler`. Separate repository, database, Vercel project and hostname. Do not modify `../eg-news` or deploy to `wider.vercel.app`.

## 1. Intent and scope

One person, accessible across devices, wants a curated weekly selection of books, music and films that expands understanding and makes trying recommendations easy. Quality and personal fit take precedence over free availability. Make preference learning visible without pretending that consumption, classification or previews imply liking.

**v1 explicitly has no Jev, no LLM, no YouTube Data API, and no account-history OAuth connectors.** No AI SDK, model API key, YouTube API key, scraped YouTube search or hidden fallback to an LLM. Public YouTube embeds with TMDB-supplied or manually reviewed video IDs remain allowed; that is playback, not the Data API.

Build a single Next.js application with an authenticated finite edition, first-party feedback, imports, saved works, learning dashboard and settings. Deterministic scoring is inspectable and replaceable later. No news, infinite scroll, full-media streaming, subscription purchases, social features, multi-user signup, or private service passwords.

Default edition: up to **5 books + 5 albums/recordings + 5 films per week**. Per medium target **3 familiar-fit + 1 adjacent + 1 exploration** slots. Prefer novel-to-user over recently released. These are design defaults adjustable later, not newly asserted personal preferences.

## 2. Screens and user flows

### Sign-in and setup

Use NextAuth v4's existing supported GitHub provider pattern from `../cosmorss/src/auth.ts`, but add a required numeric GitHub-account-ID allowlist and fail-closed configuration. App OAuth is for sign-in only; it is not a media connector. New GitHub OAuth client callback belongs to this app. Request minimal profile permission; do not request repo access or persist GitHub access tokens.

Once signed in, ask region (default US), timezone (default America/Los_Angeles), languages (no restriction until selected), subtitle tolerance (default allow), streaming services (empty), content exclusions (empty), and rediscovery (off). Offer five favorites and two dislikes per medium, but permit skipping. Do not hardcode literary, music or film preferences. If setup is skipped, display 'Editorial starting point — not yet personalized'.

### This week's edition

Three finite medium sections and a visible total count. Card: exact work/recording, creator, year if known, labeled fit/adjacent/exploration slot, grounded selection reason, quality-evidence link, preview state, access links and explicit feedback/save controls. No continuous autoplay or load-more. Older editions are a finite list, paginated 12 weeks per page.

Book sample: open the provider-authorized preview; an in-page Google Books reader is optional after browser validation, not essential for launch. Film: click-to-load standard visible YouTube player from TMDB's official trailer/clip reference; external link fallback. Music: individual iTunes promotional audio preview with proximate Apple store badge/link, stopped when another sample starts. Never imply full access is free. Ads, country/account restrictions and failed playback can still occur.

Preview state: `available`, `unavailable`, `unverified`, or `failed`; 'available' means provider reports a usable sample, not a guarantee of playback in every browser. Runtime failure is reported honestly. Previews are enriched after selection and never influence ranking or slot assignment. Without a sample, retain the selected card.

### History import and matching

Support these exact v1 inputs:

- Generic CSV: `medium,title,creator,year,external_id,rating,rating_scale,status,date`; only medium/title required. `medium` is `book|music|film`; `rating_scale` must be 5 or 10 when rating is present. Music rows must describe an album or an explicitly identified recording, not inferred albums from track scrobbles.
- Generic JSON: the same records in an array.
- IMDb ratings CSV: `Const`, `Your Rating`, `Date Rated`, `Title`, `Title Type`, `Year`; accept only `Title Type=movie`, report skipped series/episodes.
- Library tracker JSON: array exported by `../liby-books-tracker/src/wccls_tracker/export_site.py`; use `title`, `author`, `id`, `status`, `checkoutDate`, `returnDate` as observations. Ignore `providerRating` for taste. Do not use its description as a review or permission to republish text.

Do not promise dedicated Goodreads, Netflix, Letterboxd or Spotify parsers without tested formats and policy review. They can be manually converted to the generic schema. Netflix titles frequently identify series/episodes, so never silently treat every title as a film.

Max upload 2 MiB and 5,000 rows. Parse in memory, stage only normalized records for review; never store the original upload or log it. Stage expires after 24 hours. Validate MIME and content, parse CSV with a library (quoted commas/BOM supported), constrain lengths, render plain text, and guard spreadsheet-formula injection in exported CSV.

Review proposed matches, duplicates, ambiguous/missing records, skipped records, event type and rating interpretation before commit. No low-confidence automatic merge. ISBN is an edition identifier, IMDb movie ID maps to TMDB film, MBID identifies a music entity. Unicode title/creator normalization is only a search aid, not an identity guarantee. Accept exact verified provider identifiers automatically; title-only candidates require review. A user may retain an unresolved history row to review later, but it must not silently affect ranking or de-duplication.

Rating defaults shown for confirmation: 5-point scale: 4–5 positive, 1–2 negative, 3 neutral; 10-point scale: 8–10 positive, 1–4 negative, 5–7 neutral. Unsupported/missing scale creates no taste signal. Borrowed/viewed/finished/known is exposure, not liking. Imported library and known exposure can be hidden from recommendations by a clearly labeled source setting (default on); user can undo it.

### Learning, saved works and settings

Separate profiles per medium. Show genres/curated traits, supporting positive/negative work examples, count of distinct works, explicit source of evidence, tentative/supported status, untested traits and changes since the previous profile snapshot. Show exactly why known works were hidden. Clicking, saving, sample playback/failure and 'not now' never create a positive/negative taste observation.

Feedback actions: `more_like_this`, `not_for_me`, `already_known`, `not_now`, `sample_unavailable`, `enjoyed`. Favorite/dislike onboarding is first-party taste evidence and also marks that exact work known; `enjoyed` also marks it known. `more_like_this` expresses interest without claiming completed consumption. `not_now` defers that work for 28 days; `already_known` excludes it until reset. Saving is a separate list, not a rating.

Users can correct/delete any observation, disconnect/delete an import source, reset the profile and export all personal data. Deleting a source removes its staged rows, observations and derived personal snapshots/predictions/editions; preserves independent first-party feedback and saves. Recompute from remaining evidence. Historical selected lists are normally immutable, but privacy deletion overrides archival retention. Profile reset deletes only taste observations/snapshots, not saved works or exposure unless explicitly selected. Full account deletion is a separate confirmed operation covering all personal tables.

## 3. Catalog, evidence and previews

### Candidate supply and quality

v1 uses a reviewed starter corpus and source-tagged editorial imports, not an invented autonomous critic. First live pilot requires at least **30 admitted works per medium**, six primary genres per medium, three origin regions per medium, and three release decades per medium. Include commercial/mainstream and independent work; no quota for free items. These are corpus targets, not permission to label unknown origins as facts. Label missing metadata explicitly.

Store manifests under ignored `data/`; public fixtures are synthetic or minimal permitted factual test records only. Each admitted seed needs exact title/creator/identity, primary genre, optional tags, source URL, source type, verified evidence statement, observation date and manual approval. Genres/topics are multi-label; primary genre is a reviewed selection-control field. Work traits contain the verified primary genre as `genre:{canonical-key}`, plus any other verified genre/tag keys. Unresolved works may have a null primary genre and empty traits, but cannot enter an edition. Unknown traits are empty arrays, not an `other` bucket. Do not infer moods or sensitive themes from substring matches.

Seed paths: manually reviewed manifests; `booklist` minimal title/author/recommender facts after rights/provenance review; catalog search for exact user-curated candidates. `booklist` summary lacks per-item source URLs in many rows: request a real supporting URL or leave those rows pending. Do not fabricate a URL, treat its `rec_count` as an objective quality measure, mistake `first_seen` for release date, or copy raw quotes. Creator biography and origin must come from verified metadata, not name guesses.

Quality score is a declared editorial rubric, not artistic truth: `0.8` for a verified editorial/award selection from a configured trusted source; `0.7` for an explicitly reviewed curator selection (reason+source required); otherwise `0.5` unknown evidence. Only `>=0.7` candidates are admitted to v1 editions. Multiple copies of the same source do not inflate quality. Personal favorites inform taste and exposure, not global artistic quality.

This yields a useful six-week starter pilot, not unlimited automatic discovery. Warn when fewer than 10 unseen eligible works remain per medium. Catalog management allows adding and approving future candidates, and accepting a reviewed booklist import. Do not silently replace exhausted inventory with generic popular/free content. Fully automated editorial-source refresh is deferred.

### Adapters

- Films: adapt `tvguide` typed client; `/search/movie`, `/find/{imdb_id}?external_source=imdb_id`, `/movie/{id}`, `/movie/{id}/credits`, `/movie/{id}/videos`, `/movie/{id}/watch/providers`. Pick `site=YouTube`, `official=true`, type Trailer/Teaser/Clip, safe ID, relevant language; public standard embed only. A TMDB flag is not independently verified publisher authenticity; label 'Trailer listed by TMDB', and permit a manually verified reference. Country-specific providers point to the supplied TMDB watch page; show observed date and TMDB/JustWatch attribution.
- Books: Google Books ISBN/search metadata, preview/access flags and country-appropriate outbound preview. Open Library optional identified small cached lookup for work/edition canonicalization, not bulk/backend crawling. Manual publisher excerpt links permitted; authorize them without server-fetching arbitrary URLs. No Archive lending bypass or downloaded chapters.
- Music: MusicBrainz release-group/release/recording identity; identify album vs recording and credits for classical. iTunes Search and Lookup resolve a representative track/preview/store link; confirm recording, artist, album and storefront. Cover/live versions are not interchangeable. Uncertain recording match yields no preview until reviewed. Public iTunes search and MusicBrainz need no credentials; confirm current promotional terms before live preview release. No Apple subscriber OAuth, no Spotify API, no YouTube searches.

Adapters are server-only. Provider requests timeout after 8 seconds; retry at most once for 429/5xx within job limits and `Retry-After`, otherwise defer. No retries for auth/validation errors. MusicBrainz requests must be globally paced to <=1/second, with an identifying User-Agent; use a database-backed reservation or single ingestion worker, not only a process-local sleep. Durable metadata cache: 7 days; negative lookup: 6 hours; film availability: 24 hours. Honor shorter provider limits; never log full credential-bearing URLs.

Permit only HTTPS links with validated provider/manual-review origins. No arbitrary server-side preview URL fetches, audio proxying, media downloads or scraped YouTube pages. Escape all source metadata and outbound text. Third-party players load after a click; disclose privacy implications.

## 4. Deterministic taste and selection

Pure functions, separately versioned `taste-v1` and `selector-v1`, with injected time. For each work use the latest active explicit taste stance: favorite/more-like/enjoyed/confirmed positive rating = +1; dislike/not-for-me/confirmed negative rating = -1; neutral clears the earlier stance. Additional 'enjoyed' events must not double-count the same work. Exposure/save/defer events remain independent. Imported rating uses its event date; on equal timestamp, first-party feedback wins. Corrections and source deletion rebuild, not subtract blindly from stale totals.

Each work contributes once per unique verified genre/tag to its medium only. For trait with P distinct positive and N negative works:

`affinity = (1 + P) / (2 + P + N)`

Call this a smoothed preference score, **not a calibrated probability**. No observations => 0.5 and 'untested'. At least 5 distinct rated works and affinity >=0.7 => supported interest; <=0.3 => supported aversion; otherwise tentative/mixed. Counts and supporting work IDs always accompany the score. A genre dislike is not a hard exclusion unless the user explicitly blocks the genre/trait in settings.

Candidate fit is mean affinity over its unique known traits; no traits => 0.5. `baseScore = 0.6 * fit + 0.4 * quality`. No preview/access/free field is accepted by the scoring input. Explicit language/content blocks, exact works with an active negative stance, prior selected works, known works with hiding enabled and active deferrals are excluded first. Rediscovery may relax prior-selection/known exclusions, never explicit negative stances or settings blocks. Subscription availability is informational in v1; no service-only filter that would require preview/access lookups during selection.

For each medium choose deterministically:

1. Familiar-fit: three highest base scores having at least one trait with positive evidence. If fewer than three, fill remaining slots using editorial base score with label 'Editorial starting point', not 'familiar fit'.
2. Adjacent: highest score with a positively evidenced trait plus an untested trait; else editorial fallback with explicit unmet-slot reason.
3. Exploration: highest quality/base-scored candidate whose primary genre is untested or least represented over the last four published editions; tie-break by stable work ID.

Whole edition constraints: no duplicate canonical work; at most one primary creator and one franchise per medium; at most two works sharing primary genre per medium; at least three primary genres when five works are published. Bounded lookahead/backtracking across 30 highest scoring eligible candidates makes slots satisfy constraints together; never relax exclusions/quality to reach five. Underfill with a reason. Historical repetition excludes selected works until user explicitly enables rediscovery, independent of whether they were consumed. Preserve exact slot decisions, input version/hash and reasons as publication snapshots.

Recommendation reasons use templates backed by records ('Matches your positive feedback on X', 'Selected by curator Y', 'Explores an untested genre'); no generated summaries or invented personal assertions. Cold start is editorial and exploratory, not false inferred preference.

Log fit score before recommendation feedback. For each medium, the dashboard can compare held-out feedback against a constant 0.5 baseline only after 20 distinct explicit outcomes. Use Brier score (mean squared error of the recorded pre-feedback fit versus a binary positive/negative outcome), counting only the first explicit non-neutral taste response after a prediction per work, never onboarding/import history or repeated responses. Show sample size, observed-only bias and 'exploratory, not validated'. No accuracy/superiority claim when insufficient. Quality is excluded from predicted taste so the comparison measures taste, not curator approval.

## 5. Persistence and security

Next.js 16 App Router, React 19, TypeScript 5, NextAuth v4, Postgres via `pg`, Zod validation, CSV library, Vitest and Playwright. Node 22+. Managed database: a dedicated Neon Postgres database, not the Wider or CosmoRSS database. SQL migrations; pool at most 3 connections; parameterized queries and transactions. Use a distinct test database for integration tests.

Tables: `app_users`, `user_settings`, `works`, `work_identifiers`, `work_editions`, `quality_evidence`, `import_sources`, `import_rows`, `observations`, `saved_works`, `profile_snapshots`, `editions`, `edition_items`, `predictions`, `generation_jobs`, `provider_cache`, `provider_request_slots`.

Canonical work UUID; `(provider, external_id)` uniqueness in identifier table; work-edition details attach sample/access to the correct language/recording. Work kind is book/music/film, music entity subtype album/recording. `quality_evidence` and tags have provenance and verification status. Personal rows have `owner_id` checked in every query. Single-user auth is not permission to omit ownership guards.

Required cloud environment: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_ALLOWED_GITHUB_ID`, `NEXTAUTH_URL`, `CRON_SECRET`; catalog environment: `TMDB_READ_TOKEN` or `TMDB_API_KEY`, optional quota-identified `GOOGLE_BOOKS_API_KEY`, `MUSICBRAINZ_USER_AGENT`. Missing auth/DB config blocks access; never exposes a local demo in production. Missing catalog keys degrades a connector without weakening authentication. Existing local TMDB/Books variables are configured but validity/reuse is not yet verified. Copy only approved values into ignored `.env.local`, mode 600, not into docs/chat/Git. Jev and YouTube keys do not appear in v1 environment examples.

All personal routes require server-side session/allowlist plus ownership. Mutating browser requests require same-origin checks and CSRF protection; sign-in uses NextAuth's protection. Personal pages/responses are dynamic/private/no-store, never shared Next.js cache. Protect imports, export, learning, settings, catalog approval and job triggers equally. Login allowlist is checked on every request/session use, not only at original sign-in. Public health returns boolean readiness, not environment values/profile counts. Protected diagnostics redact payloads. Rate-limit authenticated imports and generation with persisted counters, not IP-only/in-memory state.

Default privacy: no analytics; third-party requests only for catalog retrieval and chosen sample playback. No histories in public Git, build fixtures, browser persistent storage or logs. Auth tokens remain library-managed HttpOnly secure cookies; no provider credentials in client bundles.

## 6. Weekly publication and failure behavior

Local-week key: Monday date in configured IANA timezone; stable across DST. Due after Monday 08:00 local. Do not apply news freshness limits to classic books/music/films.

Daily protected cron performs one bounded invocation, checks if a week is due and exits otherwise. Automatic publication uses already cached sample/access metadata (or honest unverified/unavailable states) and never waits for provider calls. It can select, attach cached samples and publish in that same invocation; persisted stage checkpoints still permit crash recovery. Approved ingestion prewarms sample metadata independently of quality approval; sample failure cannot remove an admitted candidate. Explicit protected sample-refresh operations may update sample/access status afterward, never selected works/reasons. Daily cadence is sufficient for v1; do not promise minute-exact Monday delivery. An authenticated 'Prepare edition' button/CLI may advance the same job for onboarding. Cron Authorization uses `CRON_SECRET`; browser cannot pass the cron secret.

Job states: `pending -> selecting -> enriching -> publishing -> complete` or `blocked/failed`. Store stable selected IDs before previews. Inputs/candidate metadata must already be cached; weekly selection never launches a whole catalog crawl. Candidate ingestion is a separate bounded approved operation. Stage source-approved manifests in the database, then resolve identities/metadata in resumable batches; reuse `generation_jobs` with a distinct `catalog_ingest` job kind. Unresolved works remain pending. Ingestion and explicit sample-refresh requests also use <=20-second/10-external-request invocation limits. CLI tools may advance multiple such batches sequentially, while HTTP routes advance one batch. Each invocation has <=20-second total budget, <=10 external requests; automatic edition publication has zero external requests. Explicit preview refresh is optional and bounded; MusicBrainz normally zero because identities were resolved during ingestion. Persistent leases and compare-and-set checkpoints prevent overlap; retry after lease expiry without duplicate side effects. Preview failures produce labeled cards, not unbounded retries.

A unique `(owner_id, week_key)` edition plus transactionally inserted items prevents duplicate publication. No override/regeneration of a published week in v1; only the next due week or explicit first-edition onboarding. Display last good edition and dated status if current generation fails. Refreshing a page causes zero recommendation/provider API calls. Access data updates only through a protected refresh job, not public rendering; picked works/reasons do not change silently. Stale links show their observed date.

Vercel cron configuration, duration, plan eligibility and actual preview policies must be checked during deployment, not assumed verified by this document. If daily cron is unavailable, use an authenticated manual advance/CLI initially rather than add a paid queue silently.

## 7. Acceptance and non-goals

- One real edition across three media; <=15 correct, distinct, grounded cards, or explicit underfill explanations.
- Permuting preview/free fields changes no selection; no sample failure replaces a selected work.
- All five personal input cases (imports, repeated feedback, source deletion, timezone boundary, concurrent generation) have integration tests.
- Same profile/saves/edition on two devices; browser refresh triggers zero provider calls.
- No Jev/LLM/YouTube Data API dependencies, secrets, endpoints or job calls.
- Auth rejects second GitHub identity, expired/disallowed sessions, missing config and unauthenticated personal requests. Cross-origin mutations rejected.
- Authorized samples verified on desktop/mobile, including blocked/absent sample fallback; store attribution present.
- Safe import review, edition/recording matching, no fabricated quality statements or release dates, full privacy deletion.
- `npm test`, integration tests, Playwright checks, typecheck and production build pass. Production smoke checks are required before 'deployed/working' claims.

Deferred: Jev/LLM ranking, YouTube Data API search, live account histories, Spotify/Apple/Trakt/Last.fm OAuth, direct JustWatch licensing, automated bulk curator crawls, service-only filtering, sensitive theme inference, advanced calibrated learning, and public self-service.

## 8. Review and handoff

User can review this design and the companion implementation plan together before switching to Luna med. Neither document grants permission to deploy or publish a repository. User-supplied history files, actual credentials, curator choices and cloud registrations remain execution inputs; absence must yield a fixture-tested pilot rather than fabricated live results. The old feasibility report is background research only.
