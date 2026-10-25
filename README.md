# The Weekly Margin

**Live prototype:** https://cultural-sampler.vercel.app

Deployment status and remaining work: [`docs/next-steps.md`](docs/next-steps.md)

**The Weekly Margin** is a separate personal app: a finite weekly selection of **books, music and films**, authorized previews when available, and visible/editable taste learning.

> A small edition of things worth carrying into the week.

**Not Wider.** `../eg-news`, its repository and `wider.vercel.app` remain unchanged. This app will have its own repository, database, OAuth client and deployment.

## Current status

Concrete v1 design and implementation plan ready for review. **Planning only:** no application code, dependencies, Git repository, database or deployment created. Implementation is reserved for the user's switch to **Luna med**.

## Start here

- [Luna med handoff](HANDOFF.md)
- [Authoritative v1 design](docs/superpowers/specs/2026-10-06-cultural-sampler-v1-design.md)
- [Task-by-task implementation plan](docs/superpowers/plans/2026-10-06-cultural-sampler-v1.md)
- [Taskboard](docs/cultural-sampler-taskboard.json)
- [Design workflow and visual review](docs/design-workflow.md)
- [Earlier feasibility research — background only](docs/cultural-sampler-feasibility-plan.md)

## v1 scope

- Up to 5 books, 5 albums/recordings and 5 films weekly; finite editions and saved works.
- Reviewed editorial seeds, deterministic per-medium preference matching, diversity constraints and evidence-backed explanations.
- Generic CSV/JSON, IMDb ratings and library-tracker imports with review; exposure is not liking.
- TMDB film metadata/trailers/offers, Google Books previews, MusicBrainz identity and iTunes promotional music samples.
- Cloud persistence and GitHub sign-in restricted to one account.
- **No Jev, LLM, YouTube Data API, or live media-account history connectors.** Public YouTube playback via already known trailer IDs is allowed without a Data API key.

## Credentials and cloud setup

| Item | v1 use | Current status |
|---|---|---|
| `TMDB_READ_TOKEN` or `TMDB_API_KEY` | Film metadata/trailers/offers | Variable names configured in `../tvguide`; reuse approval/validity not yet checked |
| `GOOGLE_BOOKS_API_KEY` | Optional Google project quota identification | Configured in `../liby-books-tracker`; reuse approval/validity not yet checked |
| `MUSICBRAINZ_USER_AGENT` | Identifying app/contact string, not a secret | Set during implementation |
| MusicBrainz/iTunes API key | None for documented public lookups | Not required |
| `DATABASE_URL` | Dedicated managed Postgres | New app database setup required |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | App sign-in, not media access | New app-specific GitHub OAuth registration required |
| `AUTH_ALLOWED_GITHUB_ID` | Single allowed numeric account ID | Set during setup |
| `AUTH_SECRET`, `CRON_SECRET`, `NEXTAUTH_URL` | Session/job protection and callback URL | Generate/configure during setup |
| Jev/YouTube API credentials | Deferred | Not needed in v1 |

Code and fixture tests can start before cloud setup; real cross-device operation cannot. No streaming-service, Amazon or Spotify passwords are needed. No credentials were copied into this directory. Never paste secrets into chat or commit histories/raw imports/`.env` files.
