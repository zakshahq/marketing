// The header nav stays on one row at desktop widths (Vasu 2026-10-21: "Home | Business" pushed it to two lines).
// Needs Playwright, which this repo doesn't install: PLAYWRIGHT_DIR=<a dir with node_modules/playwright> node tests/nav-check.mjs
// SHOT_DIR=<dir> also saves a header screenshot per page and width.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const require = createRequire(join(process.env.PLAYWRIGHT_DIR || root, 'x.js'));
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('nav-check: Playwright not found; set PLAYWRIGHT_DIR'); process.exit(2); }

const WIDTHS = [1024, 1280, 1366, 1440];
const pages = readdirSync(root).filter((f) => f.endsWith('.html') && /<header class="nav"/.test(readFileSync(join(root, f), 'utf8')));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  if (!extname(p)) p += '.html';
  const f = join(root, p);
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }).end(readFileSync(f));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch();
const fails = [];
for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  for (const f of pages) {
    await page.goto(base + f, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const bad = await page.evaluate(() => {
      const nav = document.querySelector('header.nav .nav__in');
      const out = [];
      if (nav.scrollWidth > nav.clientWidth + 1) out.push(`overflows (${nav.scrollWidth} > ${nav.clientWidth})`);
      const walk = document.createTreeWalker(nav, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 2) });
      for (let n; (n = walk.nextNode());) {
        const el = n.parentElement;
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; // hidden
        const r = document.createRange(); r.selectNodeContents(n);
        const lines = new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
        if (lines.size > 1) out.push(`"${n.textContent.trim()}" wraps to ${lines.size} lines`);
      }
      return out;
    });
    if (bad.length) fails.push(`${f} @${w}: ${bad.join('; ')}`);
    if (process.env.SHOT_DIR) await page.screenshot({ path: join(process.env.SHOT_DIR, `nav-${f.replace('.html', '')}-${w}.png`), clip: { x: 0, y: 0, width: w, height: 130 } });
  }
  await page.close();
}
await browser.close();
server.close();
if (fails.length) { console.log(`FAIL: header nav not one row:\n  - ${fails.join('\n  - ')}`); process.exit(1); }
console.log(`nav-check OK (${pages.length} pages x ${WIDTHS.join('/')})`);
