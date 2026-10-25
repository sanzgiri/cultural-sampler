# The Weekly Margin — next steps

## Deployment status

- GitHub repository: https://github.com/sanzgiri/cultural-sampler
- Repository visibility: private
- Default branch: `main`
- Vercel project: `cultural-sampler`
- Production URL: https://cultural-sampler.vercel.app
- Current production deployment: healthy and publicly returns HTTP 200
- CLI deployment: works with `vercel --prod`
- Git-triggered deployment: **not connected yet**

## One-time Vercel/GitHub connection

The CLI connection attempt failed because the repository is private and Vercel's GitHub App has not been authorized for it:

```text
Failed to connect sanzgiri/cultural-sampler to project.
Make sure there aren't any typos and that you have access to the repository if it's private.
```

Complete this once in the Vercel dashboard:

1. Open the [Vercel Git settings for the project](https://vercel.com/sanzgiris-projects/cultural-sampler/settings/git).
2. Choose **Connect Git Repository**.
3. Choose **GitHub** and authorize/install the Vercel GitHub App.
4. Grant it access to `sanzgiri/cultural-sampler`.
5. Set the production branch to `main`.
6. Push a small change or use **Redeploy** to verify that the Git integration is active.
7. Confirm the canonical URL remains https://cultural-sampler.vercel.app and returns HTTP 200.

After this, pushes to `main` should create deployments automatically. Until then, deploy manually from this directory with:

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
