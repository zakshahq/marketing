# Zaksha — marketing site

Static marketing site for Zaksha (managed DNS content filtering for families, businesses
and schools). Plain HTML/CSS/JS, no build step.

> **Editing this site?** Read **[MESSAGING.md](./MESSAGING.md)** first — it's the Home
> messaging spine: what we claim, what we must not claim, and the anti-bypass language
> rules. Check every copy change against it.

## Pages
- `index.html` — home (Home/family landing)
- `get.html` — install steps per platform
- `block.html`, `parental-control-android.html`, `parental-control-iphone.html`, `parental-control-windows.html` — unlisted ad landers
- `schools.html` — unlisted Enterprise/schools page
- `pricing.html` — redirect to `/#pricing`
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
3. Custom domain: the included **`CNAME`** sets `zaksha.com`. Point a DNS
   `CNAME` record for that host at `<your-org>.github.io`. (Delete the `CNAME` file if you
   don't want a custom domain.)
4. **`.nojekyll`** is included so GitHub serves all files as-is (no Jekyll processing).

Pushing to root vs. a `/docs` folder both work — just match the Pages "folder" setting.

## Notes
- Fonts load from Google Fonts; icons are inline SVG via `icons.js` (no webfont).
