# The Weekly Margin — next steps

## Deployment status

- GitHub repository: https://github.com/sanzgiri/cultural-sampler
- Repository visibility: private
- Default branch: `main`
- Vercel project: `cultural-sampler`
- Production URL: https://cultural-sampler.vercel.app
- Current production deployment: healthy and publicly returns HTTP 200
- CLI deployment: works with `vercel --prod`
- Git-triggered deployment: **connected to GitHub `sanzgiri/cultural-sampler`**

## One-time Vercel/GitHub connection

Completed via the Vercel CLI after authorizing the GitHub App for the private repository:

```text
> Connected
```

Repository: `sanzgiri/cultural-sampler`
Branch: `main`
Vercel project: `cultural-sampler`

Verify the integration by pushing a commit and confirming a new Vercel production deployment. The canonical URL should remain https://cultural-sampler.vercel.app and return HTTP 200.

After this, pushes to `main` create deployments automatically. Before the connection was active, manual deployment was required:

```bash
vercel --prod
```

## Product work remaining

1. Persist saves, feedback, taste evidence, and editions with authentication/database.
2. Replace the static starter edition with live book, music, film, podcast, and RSS adapters.
3. Verify every destination before edition publication and replace failed candidates.
4. Add scheduled edition generation and a frozen weekly archive.
5. Add imports for IMDb, library history, and generic CSV/JSON data.
6. Add privacy controls, export/delete, durable caching, and failure monitoring.
7. Decide later whether to add images, Jev, YouTube, or other media sources.
