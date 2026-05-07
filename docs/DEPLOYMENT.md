# Deployment

## How It Works

Every push to `main` triggers an automatic deploy:

```
git push main
  → GitHub Actions (.github/workflows/deploy.yml)
    → npm ci && npm run build
      → wrangler pages deploy dist/ --project-name=nathanrumsey-dev
        → Cloudflare Pages CDN
```

The site is fully static — `dist/` contains HTML, CSS, and JS files with no server dependency.

---

## First-Time Setup

### 1. Create a Cloudflare account

Sign up at cloudflare.com if you don't have one. No paid plan required — Cloudflare Pages has a generous free tier sufficient for this site.

### 2. Create the Pages project

Run this once locally (requires Wrangler to be authenticated):

```bash
npx wrangler login                          # opens browser for Cloudflare login
npx wrangler pages project create nathanrumsey-dev
```

This registers the project name on Cloudflare. All subsequent deploys via GitHub Actions will use this name.

### 3. Get your credentials

**API Token**: Cloudflare dashboard → My Profile → API Tokens → Create Token → use the "Edit Cloudflare Pages" template. Scope it to your account.

**Account ID**: Visible in the Cloudflare dashboard URL when viewing your account (`dash.cloudflare.com/[ACCOUNT_ID]/...`), or in the right sidebar of the Pages overview.

### 4. Add GitHub Actions secrets

In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `CF_API_TOKEN` | Your Cloudflare API token |
| `CF_ACCOUNT_ID` | Your Cloudflare account ID |

These are the only values that must live outside the repository.

### 5. Set the custom domain

In Cloudflare Pages dashboard → your project → **Custom domains** → **Add domain** → enter `nathanrumsey.dev`.

If your domain is managed in Cloudflare DNS (same account), the DNS records are added automatically. If the domain is registered elsewhere, Cloudflare will show you the CNAME records to add at your registrar.

### 6. Push to main

Any push to `main` after the above setup will trigger a deploy. The URL is visible in the GitHub Actions run log and in the Cloudflare Pages dashboard.

---

## Workflow File Explained

`.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: [main]      # Only main branch deploys; PRs don't
```

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '24'    # Matches local dev environment (NVM default)
    cache: 'npm'          # Caches node_modules between runs; speeds up builds
```

```yaml
- run: npm ci             # Exact install from package-lock.json (reproducible)
- run: npm run build      # astro build → outputs to dist/
```

```yaml
- uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CF_API_TOKEN }}
    accountId: ${{ secrets.CF_ACCOUNT_ID }}
    command: pages deploy dist --project-name=nathanrumsey-dev
```

---

## wrangler.toml

```toml
name = "nathanrumsey-dev"
pages_build_output_dir = "dist"
```

`pages_build_output_dir` tells Wrangler where Astro's build output lives. This is also used if you run `npx wrangler pages dev dist` locally (Cloudflare local emulation), though `npm run preview` via Astro is simpler for most development.

---

## Local vs Production

| | `npm run dev` | `npm run preview` | Production |
|---|---|---|---|
| Build | No (hot reload) | Yes (`dist/`) | Yes (`dist/`) |
| Server | Astro dev server | Astro static serve | Cloudflare Pages CDN |
| Use for | Development | Pre-deploy verification | — |

**Before pushing changes**, run `npm run build && npm run preview` to verify the static build behaves correctly. The dev server (`npm run dev`) can mask issues that only appear in the static build.

---

## Troubleshooting

**Build fails in CI but passes locally**: Check Node version. CI uses Node 24 (set in the workflow). Run `node --version` locally to confirm they match.

**Wrangler auth error**: Verify `CF_API_TOKEN` and `CF_ACCOUNT_ID` are set correctly in GitHub Actions secrets. The token must have Pages edit permissions.

**Site not updating after deploy**: Cloudflare Pages propagates to the CDN within seconds. If changes aren't showing, try a hard refresh (Ctrl+Shift+R) or check the Cloudflare Pages dashboard to confirm the deploy completed successfully.

**Custom domain not working**: Confirm the custom domain was added in the Cloudflare Pages dashboard and that DNS records are correct. Cloudflare-managed domains auto-configure; external registrars need manual CNAME setup.
