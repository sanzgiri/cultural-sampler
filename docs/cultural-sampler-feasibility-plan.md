# Cultural sampler — feasibility and proposed build plan

Status: historical feasibility research, not the v1 implementation contract. Superseded for implementation by `superpowers/specs/2026-10-06-cultural-sampler-v1-design.md` and `superpowers/plans/2026-10-06-cultural-sampler-v1.md`. User now explicitly defers Jev and YouTube Data API; all references below describe researched future possibilities, not v1 requirements. Separate application at `~/projects/cultural-sampler`; Wider's news app, repository and deployment remain unchanged.

## 1. Brief and recommendation

This separate app should provide a finite weekly cultural edition: books, music, and films selected for personal fit, quality evidence, and breadth, with an authorized sample when available. Audience confirmed: one person, remotely accessible across devices.

Recommendation: build a **catalog-first, preview-enriched personal sampler**. Do not build a universal account scraper or make a Spotify/JustWatch partnership a prerequisite. A free metadata API does not imply a free-content catalog: TMDB, Google Books, and MusicBrainz describe mainstream, paid, contemporary, and independent works.

Three possible approaches:

1. Account-connector-first: richest automatic history, but blocked by uneven APIs, policy restrictions, permissions and missing previews. Not recommended as the foundation.
2. Catalog + imported history + optional connectors: works immediately with exports and explicit favorites; preview resolution is independent. Recommended.
3. Fully licensed commercial aggregation: paid JustWatch/Watchmode and commercial catalogs can improve coverage, but pricing and contracts must be justified after personal-use validation.

Suggested initial edition: **5 books, 5 music discoveries, 5 films per week**, not 5 per genre. Each category aims for 3 familiar-fit items, 1 adjacent discovery, and 1 broader exploration. These are configurable defaults, not user-approved requirements. New to the reader matters more than newly released. News stays in the existing Wider app; this app does not replace or modify it.

## 2. Feasibility matrix

### Films

**TMDB — ready for MVP.** Catalog, search, genres, language, credits, runtime, similar/recommended titles, and video references. `/3/movie/{id}/videos` supplies provider/site, video key, type, language, and an `official` flag. Prefer official trailers/teasers/clips, then verify the actual publisher and video playability. A community flag alone is not rights verification.

**TMDB watch providers — ready for MVP.** `/3/movie/{id}/watch/providers` returns subscription/rent/buy/free/ad-supported availability by country, powered by JustWatch. It does not supply full streaming-service deep links; use the supplied TMDB watch page URL. Attribute TMDB and JustWatch. Availability is not evidence of an individual user's entitlement and can be stale.

**JustWatch direct partner API — defer.** Official docs require a concluded contract and partner token. This is a catalog/offer API, not documented consumer-account OAuth. A personal JustWatch login does not provide partner API access. Consumer watchlist import is a capability to investigate, not an MVP promise; allow manual titles or a user-obtained export if supported.

**IMDb — use user exports.** IMDb explicitly supports ratings CSV export. Import title IDs, personal ratings, and dates; resolve IDs through TMDB. No ordinary consumer-account OAuth connector was verified. IMDb's separate catalog datasets are personal/non-commercial and subject to their license; commercial offerings are separate. No need for a paid IMDb catalog subscription in the MVP.

**Netflix and other streaming services — no password connectors.** Netflix officially offers viewing-history CSV download. Treat that as watched/exposure evidence, not proof of liking a film. Do not promise similar exports from every provider. Manually select subscribed services and region; resolve offers through TMDB. Use official outbound links for login/playback on the provider site. No blanket connector to Netflix, Prime Video, Disney+, etc. was verified.

**Trakt — good phase-two candidate.** Official repository documents registered API applications and OAuth support. Validate history, ratings, and watchlist endpoints against a real account before implementation; approval/limits are a capability test, not an assumption. The current developer portal is client-rendered, so endpoint access was not tested in this research.

**Letterboxd — exports first.** Official CSV documentation supports film IDs, ratings and diary dates. Confirm the user's actual export format. API access was not verified; do not depend on immediate API approval.

**YouTube — preview delivery, not taste-model foundation.** Public embedded trailers do not require the user's YouTube account. Use official player, with video/region/embed checks, attribution, privacy disclosure, and click-to-load. OAuth can expose supported playlists/likes, but watch history and Watch Later are unavailable through the Data API. User-obtained Takeout is an optional later import, not continuous history sync. Do not derive popularity/taste metrics from YouTube API data without resolving its derived-data restrictions.

### Books

**Google Books — ready for MVP.** Search/ISBN lookup, edition metadata, `previewLink`, `accessInfo.viewability`, `embeddable`, country and authorized reader links. Use the supported Embedded Viewer only for previewable/embeddable editions; otherwise provide the preview link or an honest unavailable state. A preview is not a downloadable full text. Browser country may differ from the Vercel server country, so reader success/failure must be handled in the browser.

**Open Library / Internet Archive — supplemental.** Strong work/edition identity and covers; use search/work APIs and current availability. A `preview_url` alone does not prove readability: Open Library's own docs warn it may point to a non-readable catalog record. Do not route around lending, territorial, DRM, or rights restrictions. Public-domain titles may be included on merit, not used as automatic substitutes for paid books. Open Library discourages use as a bulk/high-traffic backend; use small cached lookups and identify the app.

**Publisher/author excerpts — valuable supplemental previews.** Link authorized sample chapters/PDFs from publisher or author pages. First version permits curated preview URLs; there is no verified universal publisher-preview API. Do not scrape or republish protected chapters. Excerpts must match the book/edition and language.

**Amazon/Kindle — outbound links initially.** Consumer Amazon credentials do not grant a general Kindle-library or sample API. Amazon Creators API is an Associates product-catalog API, not a reader-history/Kindle-text connector; its docs currently list qualifying-sales prerequisites. Kindle sample links/embed support vary and need per-title validation. Provide an Amazon title link where known, but do not advertise an inline sample merely because an ASIN exists. Do not base this project on outdated PA-API instructions or sales eligibility.

**Goodreads and other shelves — import files initially.** Support exported CSV or generic title/author/ISBN/rating files. Goodreads' authenticated export workflow was not accessible in this research; confirm the actual file before calling that connector complete. Avoid requiring a new Goodreads developer key. Google Books library OAuth is officially supported if the user actually keeps shelves there, but it does not expose Kindle purchases.

### Music

**MusicBrainz — ready for catalog identity.** Canonical artists, works, recordings, releases/release groups, genres, credits and ISRCs. Free non-commercial API with meaningful User-Agent and at most one request per second. It supplies metadata, not playable music. Classical works require composer, performer, movement and recording distinctions; title-only matching is not safe.

**Apple iTunes Search — practical preview resolver.** A live public query for Miles Davis returned a commercially sold recording and an actual `previewUrl`. Archived official documentation permits preview use for promoting store content, not entertainment, with a proximate store badge/link. Build a per-item try-before-buy card, not a continuous radio player or downloaded audio library. Confirm current applicable terms before launch. Availability varies by storefront and recording.

**Apple Music/MusicKit — optional phase two.** Official support exists for catalog search, authorized library/recent plays, and web playback. Requires developer-token setup; full streaming requires subscriber entitlement. Do not confuse the public iTunes Search API with MusicKit authorization or assume all Apple catalog data may be sent to Jev. Confirm current developer agreement and setup cost before activation.

**Spotify — optional handoff, not the recommender backend.** OAuth endpoints exist for supported personal data; development mode currently requires the app owner to have Premium and allows up to five authenticated users. New-development-app endpoint/field restrictions must be tested, not inferred from older tutorials. `preview_url` is nullable/deprecated. Policy prohibits Spotify content ingestion into ML/AI models, restricts user profiling, restricts integration with other services' streams/content, and prohibits using audio preview clips for personalization products. Therefore do not feed Spotify API data to Jev, build an AI taste profile from it, or make a mixed Spotify/YouTube player. Outbound Spotify links from independently selected items are the simplest MVP. Embeds, account imports and playlist write-back are separately gated on policy fit. Personal use does not waive developer policy. Exporting API data is not a policy workaround.

**YouTube — supplemental authorized music videos/performances.** Resolve official artist/label/orchestra videos; keep the video visible in the standard player. No audio stripping, downloading, background player, ad suppression, or automatic cross-service queues. Do not substitute covers or bootleg uploads for the intended recording. This is free promotional access to independently selected mainstream content, not selection for free-content availability.

**Last.fm — optional personal-history connector.** Official `user.getRecentTracks` exposes scrobbles; related documented top/loved methods can support imports after access tests. Attribution, use/storage and privacy terms apply; public pages using its API require approval under its published terms. For the personal first version, keep history private and process it deterministically. Do not automatically transmit raw Last.fm data to a third-party model. No assumption that it grants music-streaming rights. A new account cannot reconstruct past listening it never recorded. ListenBrainz and other history sources remain optional future candidates, not verified deliverables here.

## 3. Reuse from this workspace

- `~/projects/tvguide/src/lib/tmdb.ts`: actual typed TMDB metadata and country-offer client. Extend/adapt with tests for trailers and matching; do not import its whole application or unfinished roadmap.
- `~/projects/booklist`: existing editorial/expert recommendation pipeline (BookReporter, selected news/book RSS, Five Books and recommender graph). This is candidate provenance, not personal reading history. Its README labels raw data private, several sources blocked/non-extracting, and historical dates unreliable. Audit provenance/rights and validate parser output before reuse; never publish private raw scraped reports into Wider's public GitHub repository. A robots.txt allowance is not a content reuse license.
- `~/projects/liby-books-tracker`: SQLite loan history and `site/public/library.json` exporter; Google Books/Open Library enrichment. Import a user-provided file from its existing output, not WCCLS credentials. Borrowed does not mean completed or liked. Library histories may include household activity.
- `~/projects/cosmorss`: actual Auth.js, saved-items database and durable-cache modules can inform cloud persistence. Do not treat all optional auth setup as already configured for Wider.
- Wider: retain finite-edition UI concepts, save/feedback and diagnostics. Replace the news-only schema, duplicated category insertion behavior and pooled interest predictor before using them for cultural recommendations. Current `topicProbability` ignores its topic argument; current `quality` starts at 1, so it is not a quality assessment.

## 4. Catalog and ranking: avoid a free-content trap

Pipeline:

```
editorial/award/curated seeds + related catalog retrieval
 -> canonical identity + permitted metadata + evidence provenance
 -> remove known works / blocked content / mismatches
 -> quality-evidence and personal-fit assessment
 -> constrained breadth/novelty selection
 -> attach authorized preview and access options
 -> freeze the week's edition
```

Discovery cannot be delegated to Jev alone. Jev may score supplied candidates; it cannot be relied on to invent titles, reviews, awards, identifiers or working preview URLs.

Seed inventory with verified award/festival lists, user-selected curators and editorial feeds, and catalog neighbors. Examples: literary prize longlists plus expert picks; film festival selections alongside crowd evidence and curated director lists; albums/recordings from trusted music curators plus MusicBrainz relationships. Award lists are quality signals, not mandatory eligibility or a universal taste standard. Include mainstream and independent works across eras/languages; do not make English-language popularity the only quality proxy.

Store a source URL, evidence type, observed date, and confidence/verification status for every quality claim. An unreviewed title is unknown, not bad. Use provider-native genres first and multi-label themes/moods second. Format, genre, language, origin, availability region and news subject must remain separate fields.

Apply explicit dislikes and language/access preferences as hard constraints. Relevance, quality evidence and diversity determine selection. Preview/free-access availability is displayed afterward; it must not silently control the candidate pool. A rare high-fit unavailable item may be included with a clear label. An optional 'only available on my services' filter is a user choice, not an invisible default.

Music unit: recommend an album or distinct recording, with one representative track; not five arbitrary songs by one artist. Films: trailer or official excerpt. Books: real authorized pages, not an AI-generated synopsis labeled 'sample'.

Breadth defaults: cap repeated creators/franchises; rotate genres over four editions; distinguish familiar, adjacent and exploration slots. If breadth cannot be met with suitable inventory, publish fewer items and explain the gap rather than pad with weak material.

Jev can provide structured fit/novelty/theme assessments using only permitted candidate metadata and explicit first-party preferences. Record model ID, rubric version and output distributions. Treat model confidence as uncalibrated until evaluated. A source-policy allowlist must determine what is eligible for model input; no raw media, passwords, provider tokens or unauthorized histories are model inputs.

## 5. Cold start and visible learning

1. Ask region, languages, subscribed services, subtitle tolerance, content exclusions and desired discovery intensity.
2. Import one available history file per medium; show a match-review screen and distinguish rating, finished, borrowed, wishlisted, viewed and household records.
3. Request approximately five favorites and two dislikes per medium, optionally with reasons. These are direct first-party taste evidence, not passively inferred provider data.
4. Start with an editorial prior and wider uncertainty. Prioritize unconsumed works; repeat only if the user opts into rediscovery.
5. Offer actions: 'want more like this', 'not for me', 'already know it', 'not now', 'sample unavailable' and 'finished/enjoyed'. None should be inferred from clicking or playing a preview. 'Not now' is not a permanent genre dislike.

Keep separate book/music/film profiles. Cross-medium connections are explicitly tentative: liking a philosophical novel does not prove liking philosophical cinema. Imported exposure informs de-duplication more strongly than positive taste.

'What Wider has learned' should show traits, supporting examples/counts, negative preferences, tentative hypotheses, untested genres, source of evidence and weekly changes. Allow correction/reset, deleting an imported source and exporting personal data. Predictions must be recorded before feedback and compared against a simple baseline on observed outcomes; do not claim statistical validation from a handful of interactions.

## 6. Cloud architecture

Use a separate repository and Vercel project/domain; do not reuse `wider.vercel.app`. Require app-level sign-in with a single allowed user before any personal imports, profile or edition endpoints; a publicly reachable deployment must not expose personal data.

Use managed Postgres (Neon or Supabase; choose one at implementation approval) for canonical works, evidence, histories, feedback, profile versions, authorized connector grants and weekly editions. Store connector refresh tokens encrypted server-side, never in localStorage. Store sample URLs/metadata, not copyrighted preview files. First-party personal feedback persists cross-device.

Split server-only adapters: discovery catalog, history import/connector, preview resolver, availability resolver and ranking. Every response declares source, retrieval date, region, access restrictions and schema/rubric version.

Generate once weekly using a protected scheduled job, not during a page visit. On Vercel Hobby, a daily cron that checks whether the edition is due can be used after verifying current plan limits. Chunk jobs and checkpoint to the database; if function duration is insufficient, use a managed workflow/queue instead of waiting indefinitely in one route. Atomic publication, uniqueness locks and last-good-edition fallback prevent partial editions and repeated bills. Refresh time-sensitive availability before display within quotas; do not mutate the week's chosen works silently.

Cache metadata and classifications persistently with source/rubric/model versions. Cap API/model requests per generation and globally, not merely per IP. Authenticated manual regeneration has a cooldown. A browser refresh must produce zero new model-ranking calls. Monitor connector quota, preview failures, generation duration and spend.

## 7. Concrete phased plan

Effort is an engineering estimate, not a delivery guarantee; API registration, policy clarification and user data export are external dependencies.

| Phase | Build | Exit check | Estimate |
|---|---|---|---|
| 0: access and quality probe | Test 10 representative works per medium (paid/mainstream + indie, languages/eras); get one history/export per medium; validate preview/identity/terms | Capability matrix has real responses and preview results; unsupported integration explicitly disabled | 1–2 focused days + account setup waits |
| 1: private foundation | Auth, database, canonical schema, imports/match review, first-party favorites/dislikes, candidate provenance | Same profile across devices; unmatched records reviewed; private endpoints reject unauthenticated access | 3–5 days |
| 2: complete weekly sampler | TMDB film/trailers/offers, Google Books previews, existing booklist seed import, MusicBrainz + iTunes preview cards/official YouTube links, 15-item weekly edition | One real edition, no fabricated samples/evidence, mainstream paid works preserved when previews missing | 4–6 days |
| 3: taste model + learning display | Media-specific evidence model, constrained selection, Jev on allowed inputs, versioned cached results, weekly changes and editable profile | Explicit feedback changes correct medium/traits, duplicate and known works suppressed, uncertainty visible | 3–4 days |
| 4: selective automation | Trakt and/or Last.fm; Apple Music if useful; Spotify only policy-approved functionality | Disconnect deletes imported/provider data and invalidates derived state; token refresh works; no unsupported history claims | 2–5 days per selected connector, access-dependent |

Phase 0–3 comprise the useful product. Start with all three media in a thin vertical slice rather than implementing every connector first. Treat the ~2–4 working week envelope as provisional; a manually curated preview-first pilot can precede the full personalized version.

Acceptance targets for the pilot: all item identities correct in a reviewed test set; every available preview actually resolves to the right work/recording; zero invented review/award/sample claims; no duplicate works; no known-consumed recommendations without consent; no free-only fallback; breadth constraints either met or explained; full data deletion tested; no secrets or histories in public source/client bundles.

## 8. Cost and blockers

No GPU or local host required. Personal/non-commercial TMDB and MusicBrainz use is documented; Google API quotas and iTunes permitted use need project/runtime checks. Vercel + managed database may initially fit free allowances; this is not a guarantee of zero monthly cost or future commercial eligibility.

Jev is metered. Budget from a measured pilot rather than inventing a price: at most ~30 reranking candidates per medium per week gives 90 calls per edition, about 360 calls per four weeks if one call per candidate; initial metadata/theme classification is separately capped and cached. Batch questions only after verifying contract, answer quality and actual usage. Fix a monthly cap with the user before enabling recurring ranking.

Direct JustWatch licensing, commercial TMDB licensing, Apple developer enrollment/entitlements, premium subscription requirements and paid availability APIs are optional costs, not prerequisites. Existing media subscriptions/purchases are separate from app hosting/API spend.

Unresolved before implementation: product name, preferred languages/region, actual streaming/music services, history files available, willingness to pay for rentals/books, trusted curators, model request budget, and which optional connector is worth its policy/setup complexity. News remains exclusively in Wider.

## 9. Sources and verification limits

First-party documentation checked for this proposal:

- TMDB API use/licensing: https://developer.themoviedb.org/docs/faq
- TMDB movie videos: https://developer.themoviedb.org/reference/movie-videos
- TMDB/JustWatch country offers and attribution: https://developer.themoviedb.org/reference/movie-watch-providers
- JustWatch partner API contract/token requirement: https://apis.justwatch.com/docs/api/
- IMDb ratings export: https://help.imdb.com/article/imdb/track-movies-tv/ratings-faq/G67Y87TFYYP6TWAV
- IMDb dataset licensing: https://data.imdb.com/non-commercial-datasets/
- Netflix viewing history download: https://help.netflix.com/en/node/101917
- Trakt official API repository: https://github.com/trakt/trakt-api
- Letterboxd CSV matching fields: https://letterboxd.com/about/importing-data/
- Google Books metadata, library OAuth and access restrictions: https://developers.google.com/books/docs/v1/using?hl=en
- Google Books Embedded Viewer: https://developers.google.com/books/docs/viewer/developers_guide?hl=en
- Open Library API usage/rate limits: https://openlibrary.org/developers/api
- Open Library preview-state warning: https://openlibrary.org/dev/docs/api/books
- Amazon Creators API prerequisites and product scope: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction
- MusicBrainz API: https://musicbrainz.org/doc/MusicBrainz_API
- iTunes preview/promotional terms (archived documentation): https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
- Live iTunes preview query: https://itunes.apple.com/search?term=kind%20of%20blue&entity=song&limit=2
- MusicKit account and playback capabilities: https://developer.apple.com/musickit/
- Spotify policy (AI ingestion, profiles, previews, multi-service restrictions): https://developer.spotify.com/policy
- Spotify development/extended quota modes: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Spotify February 2026 developer migration: https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
- Spotify nullable/deprecated preview field: https://developer.spotify.com/documentation/web-api/reference/get-track
- YouTube history/Watch Later unsupported: https://developers.google.com/youtube/v3/revision_history?hl=en (January 28, 2021 entry)
- YouTube supported playlist OAuth: https://developers.google.com/youtube/v3/guides/implementation/playlists?hl=en
- YouTube data/derived-metric/player restrictions: https://developers.google.com/youtube/terms/developer-policies?hl=en
- Last.fm history endpoint: https://www.last.fm/api/show/user.getRecentTracks
- Last.fm license/public-display/storage conditions: https://www.last.fm/api/tos

These document capabilities, not completed integrations. Only the public iTunes lookup was live-tested as a sample resolver. No paid subscription was created, no service credentials were collected, no personal history was read, no product code was changed, and no new deployment was made. Current terms and real account access must be rechecked during Phase 0.
