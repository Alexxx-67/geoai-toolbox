# 地学AI工具箱 / GeoAI Toolbox — v1 (local)

Zero-dependency static site (Node ≥18). Chinese-first, EN toggle (top-right).

## Structure
- `data/site.json` — site name / tagline, and `base` (URL prefix; `/` locally)
- `data/categories.json` — research-task categories
- `data/tools/<slug>.json` — **one file per tool** (add a tool = add a file)
- `src/style.css`, `src/app.js` — styles + search/filter/lang toggle
- `build.js` — generator → `dist/`
- `scripts/seed_tools.py` — the script that created the initial 36 tool files
- `screenshots/` — local screenshots

## Tool fields
slug, name, url, category, desc_zh, desc_en, pricing (free|freemium|paid|unknown), pricing_note,
geo (yes|partial|general), geo_note, test_notes ("待实测" until tested), test_status (pending|tested),
verified_on, verified_source, tags[]

## Build & preview
Internal links and assets are prefixed with a base path. `BASE_PATH` overrides `data/site.json` → `base` (default `/`), so a plain local build still serves at the site root.

    node build.js
    python3 -m http.server 8765 --directory dist   # http://localhost:8765

Preview the GitHub Pages subpath (same layout CI publishes):

    BASE_PATH=/geoai-toolbox/ node build.js
    mkdir -p /tmp/geoai-preview && rm -rf /tmp/geoai-preview/geoai-toolbox
    cp -a dist /tmp/geoai-preview/geoai-toolbox
    python3 -m http.server 8765 --directory /tmp/geoai-preview
    # http://localhost:8765/geoai-toolbox/

## Deploy
Pushing to `main` runs `.github/workflows/pages.yml`: `BASE_PATH=/geoai-toolbox/ node build.js`, then `actions/upload-pages-artifact` (`dist/`) and `actions/deploy-pages`.

The site is published at `https://alexxx-67.github.io/geoai-toolbox/`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Submit form + newsletter are placeholders (no backend).
