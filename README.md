# Zaksha — marketing site

Static marketing site for Zaksha (managed DNS content filtering for families, businesses
and schools). Plain HTML/CSS/JS, no build step.

> **Editing this site?** Read **[AGENTS.md](./AGENTS.md)** first — it explains the persona
> system and the truth/legal constraints that are easy to break.

## Pages
- `index.html` — home
- `pricing.html` — plans (Home / Team / Enterprise)
- `terms.html` — Terms & Conditions
- `privacy.html` — Privacy Policy

## Run locally
Open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy to GitHub Pages
1. Create a repo and push **the contents of this folder to the repo root**
   (so `index.html` is at the top level).
2. In the repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**,
   pick your branch (e.g. `main`) and **folder `/ (root)`**. Save.
3. Custom domain: the included **`CNAME`** sets `zaksha.codeunbound.dev`. Point a DNS
   `CNAME` record for that host at `<your-org>.github.io`. (Delete the `CNAME` file if you
   don't want a custom domain.)
4. **`.nojekyll`** is included so GitHub serves all files as-is (no Jekyll processing).

Pushing to root vs. a `/docs` folder both work — just match the Pages "folder" setting.

## Notes
- Fonts load from Google Fonts; icons are inline SVG via `icons.js` (no webfont).
- The site remembers a visitor's persona (family/business/school) in `localStorage` and
  pivots copy accordingly — see AGENTS.md §2.
