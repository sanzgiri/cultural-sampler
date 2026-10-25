# Handoff to Luna med — The Weekly Margin

## Status

The product name is **The Weekly Margin**. The initial vertical slice is implemented; the remaining plan covers persistence, imports, real adapters, authentication and deployment. Review the design/plan before continuing. No cloud database, OAuth app or deployment has been created.

Working directory: `/Users/sanzgiri/projects/cultural-sampler`. This is a **separate app** from Wider/`eg-news`.

## Read in this order

1. `README.md` — scope and credentials.
2. `docs/superpowers/specs/2026-10-06-cultural-sampler-v1-design.md` — authoritative v1 design.
3. `docs/superpowers/plans/2026-10-06-cultural-sampler-v1.md` — exact files, interfaces, ordered tasks, test cases and commands.
4. `docs/cultural-sampler-taskboard.json` — current task states.

The earlier `docs/cultural-sampler-feasibility-plan.md` is background research and contains deferred features. It is not the v1 build contract.

## Confirmed user decisions

- Personal use, remotely accessible across devices.
- Books, music and films in a finite weekly sampler with authorized previews when possible.
- Quality/taste/breadth first; not a free-content recommender.
- Taste evidence and uncertainty visible/editable.
- Separate directory/app, not an expansion or rebrand of Wider.
- **Start without Jev and without YouTube Data API.** Both may be revisited later.
- Implementation will be done after switching to Luna med.

## Concrete v1 choices for review

- Next.js/TypeScript, dedicated Neon Postgres, GitHub single-account sign-in.
- Up to 5 books, 5 music albums/recordings, 5 films weekly; 3 fit + 1 adjacent + 1 exploration per medium.
- Product title: The Weekly Margin. Tagline: A small edition of things worth carrying into the week.
- Deterministic per-medium smoothed trait scores, reviewed editorial-quality rubric, constrained diversity, grounded reason templates; no AI model.
- TMDB metadata/trailer IDs/country offers, Google Books previews, MusicBrainz identity, iTunes promotional previews/store links.
- Generic CSV/JSON, IMDb ratings CSV and library-tracker JSON imports with match/rating review. No service passwords/live media-account OAuth.
- Automatic publication uses cached samples/availability or honest missing states. No model/provider calls on normal page refresh.
- Auth and database fail closed. No public personal demo/fallback.
- Reviewed starter corpus >=30 works/medium; warn at <10 unseen candidates. Unlimited automatic editorial discovery is not promised in v1.

## Execution protocol

After review and the requested model switch, begin Task 1; follow tasks sequentially, use TDD and update checkboxes/taskboard with actual evidence. Read relevant skills before execution. No subagent tool is assumed installed; native inline execution is sufficient.

Do not replace absent data/credentials with fake live results. Synthetic fixtures are explicitly labeled. Use a dedicated integration-test database, not a production data-reset shortcut.

No network deployment or repository publication until the user approves those external changes. Existing source projects are read-only references unless the user says otherwise.

## Reuse and credentials

Read-only reusable code/schema:

- `../tvguide/src/lib/tmdb.ts` — actual typed TMDB client.
- `../booklist/pipeline/schema.py`, `aggregate.py`, README — candidate facts/provenance; raw scraped content is private and cannot simply be republished.
- `../liby-books-tracker/src/wccls_tracker/export_site.py` — export schema; actual personal history has not been read.
- `../cosmorss/src/auth.ts` — GitHub NextAuth pattern, **not** its optional-auth behavior (add allowlist/fail-closed).

TMDB variable names are configured in `tvguide`; Google Books key configured in `liby-books-tracker`. Values were not copied; validity and permission to reuse must be checked during implementation. Never print them.

Cloud setup needs a new app-specific GitHub OAuth client, numeric allowed GitHub ID, auth/cron secrets and dedicated database URL. No YouTube/Jev key needed. No streaming-service passwords. The previously exposed Jev key must not be reused.

## Stop conditions

Stop and report if a live provider rejects access/terms, matching cannot identify the exact recording/edition, auth would be bypassed, tests require production reset, or credential values would be exposed. Preserve the last good edition and report missing samples instead of choosing inferior free replacements.
