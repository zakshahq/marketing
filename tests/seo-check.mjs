#!/usr/bin/env node
// SEO baseline checks for the Zaksha marketing site. Run: node tests/seo-check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(rel) {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return existsSync(path.join(ROOT, rel));
}

// --- a. noindex landers untouched ---
const NOINDEX_PAGES = [
  'block.html',
  'parental-control-android.html',
  'parental-control-iphone.html',
  'schools.html',
];
for (const page of NOINDEX_PAGES) {
  if (!exists(page)) {
    fail(`${page}: file missing`);
    continue;
  }
  const html = read(page);
  if (!html.includes('<meta name="robots" content="noindex, nofollow" />')) {
    fail(`${page}: missing noindex robots meta tag`);
  }
}

// --- b. robots.txt ---
if (!exists('robots.txt')) {
  fail('robots.txt: file missing');
} else {
  const robots = read('robots.txt');
  if (!robots.includes('Sitemap: https://zaksha.com/sitemap.xml')) {
    fail('robots.txt: missing "Sitemap: https://zaksha.com/sitemap.xml" line');
  }
  if (/Disallow:/.test(robots)) {
    fail('robots.txt: contains a Disallow: directive (must be allow-all)');
  }
}

// --- c. sitemap.xml ---
const EXPECTED_SITEMAP_URLS = [
  'https://zaksha.com/',
  'https://zaksha.com/get',
  'https://zaksha.com/privacy',
  'https://zaksha.com/terms',
  'https://zaksha.com/best-parental-control-app-india',
  'https://zaksha.com/google-family-link-alternative',
  'https://zaksha.com/block-adult-content-android',
  'https://zaksha.com/block-adult-content-iphone',
];
const FORBIDDEN_SITEMAP_SLUGS = [
  'block',
  'parental-control-android',
  'parental-control-iphone',
  'schools',
  'pricing',
];
function urlToFile(url) {
  const pathname = url.replace('https://zaksha.com', '');
  if (pathname === '' || pathname === '/') return 'index.html';
  return pathname.replace(/^\//, '') + '.html';
}
if (!exists('sitemap.xml')) {
  fail('sitemap.xml: file missing');
} else {
  const sitemap = read('sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    if (!loc.startsWith('https://zaksha.com')) {
      fail(`sitemap.xml: <loc>${loc}</loc> does not start with https://zaksha.com`);
    }
    if (/\.html$/.test(loc)) {
      fail(`sitemap.xml: <loc>${loc}</loc> is not extensionless`);
    }
    const file = urlToFile(loc);
    if (!exists(file)) {
      fail(`sitemap.xml: <loc>${loc}</loc> maps to missing file ${file}`);
    }
    const locPath = loc.replace('https://zaksha.com', '').replace(/^\//, '');
    for (const slug of FORBIDDEN_SITEMAP_SLUGS) {
      if (locPath === slug) {
        fail(`sitemap.xml: must not contain forbidden URL for "${slug}" (got ${loc})`);
      }
    }
  }
  for (const url of EXPECTED_SITEMAP_URLS) {
    if (!locs.includes(url)) {
      fail(`sitemap.xml: missing expected <loc>${url}</loc>`);
    }
  }
  if (locs.length !== EXPECTED_SITEMAP_URLS.length) {
    fail(`sitemap.xml: expected exactly ${EXPECTED_SITEMAP_URLS.length} URLs, found ${locs.length}`);
  }
}

// --- d. canonical tags ---
const CANONICAL_PAGES = {
  'index.html': 'https://zaksha.com/',
  'get.html': 'https://zaksha.com/get',
  'privacy.html': 'https://zaksha.com/privacy',
  'terms.html': 'https://zaksha.com/terms',
  'best-parental-control-app-india.html': 'https://zaksha.com/best-parental-control-app-india',
  'google-family-link-alternative.html': 'https://zaksha.com/google-family-link-alternative',
  'block-adult-content-android.html': 'https://zaksha.com/block-adult-content-android',
  'block-adult-content-iphone.html': 'https://zaksha.com/block-adult-content-iphone',
};
for (const [page, expected] of Object.entries(CANONICAL_PAGES)) {
  if (!exists(page)) {
    fail(`${page}: file missing`);
    continue;
  }
  const html = read(page);
  const matches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/g)];
  if (matches.length !== 1) {
    fail(`${page}: expected exactly one <link rel="canonical">, found ${matches.length}`);
  } else if (matches[0][1] !== expected) {
    fail(`${page}: canonical href is "${matches[0][1]}", expected "${expected}"`);
  }
}

// --- e. pricing.html canonical ---
if (!exists('pricing.html')) {
  fail('pricing.html: file missing');
} else {
  const html = read('pricing.html');
  const matches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/g)];
  if (matches.length !== 1) {
    fail(`pricing.html: expected exactly one <link rel="canonical">, found ${matches.length}`);
  } else if (matches[0][1] !== 'https://zaksha.com/') {
    fail(`pricing.html: canonical href is "${matches[0][1]}", expected "https://zaksha.com/"`);
  }
}

// --- f/g. JSON-LD on index.html ---
let indexHtml = null;
if (!exists('index.html')) {
  fail('index.html: file missing');
} else {
  indexHtml = read('index.html');
  const blocks = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => m[1]
  );
  if (blocks.length === 0) {
    fail('index.html: no JSON-LD <script type="application/ld+json"> blocks found');
  }
  const parsed = [];
  for (const [i, block] of blocks.entries()) {
    try {
      parsed.push(JSON.parse(block));
    } catch (e) {
      fail(`index.html: JSON-LD block ${i} does not parse as JSON (${e.message})`);
    }
  }
  const flat = parsed.flatMap((p) => (Array.isArray(p['@graph']) ? p['@graph'] : [p]));

  const org = flat.find((n) => n['@type'] === 'Organization');
  if (!org) fail('index.html: JSON-LD missing @type Organization');

  const app = flat.find((n) => n['@type'] === 'SoftwareApplication');
  if (!app) {
    fail('index.html: JSON-LD missing @type SoftwareApplication');
  } else {
    const offers = app.offers;
    if (!offers || String(offers.price) !== '199' || offers.priceCurrency !== 'INR') {
      fail('index.html: SoftwareApplication.offers must have price "199" and priceCurrency "INR"');
    }
  }

  const faqEntity = flat.find((n) => n['@type'] === 'FAQPage');
  if (!faqEntity) {
    fail('index.html: JSON-LD missing @type FAQPage');
  } else {
    // --- g. FAQPage question names must match visible <summary> text ---
    const summaries = [...indexHtml.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) =>
      m[1].replace(/<i[^>]*>[\s\S]*?<\/i>/g, '').replace(/\s+/g, ' ').trim()
    );
    const questionNames = (faqEntity.mainEntity || []).map((q) => q.name && q.name.trim());
    if (summaries.length === 0) {
      fail('index.html: no <details class="faq__item"> <summary> elements found');
    }
    if (questionNames.length !== summaries.length) {
      fail(
        `index.html: FAQPage has ${questionNames.length} questions, page has ${summaries.length} visible FAQ items`
      );
    } else {
      for (let i = 0; i < summaries.length; i++) {
        if (questionNames[i] !== summaries[i]) {
          fail(
            `index.html: FAQPage question ${i} ("${questionNames[i]}") does not match visible summary ("${summaries[i]}")`
          );
        }
      }
    }
  }
}

// --- h. no internal .html links on the four public pages ---
const LINK_CHECK_PAGES = [
  'index.html', 'get.html', 'privacy.html', 'terms.html',
  'best-parental-control-app-india.html', 'google-family-link-alternative.html',
  'block-adult-content-android.html', 'block-adult-content-iphone.html',
];
for (const page of LINK_CHECK_PAGES) {
  if (!exists(page)) continue;
  const html = read(page);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    if (href === 'index.html' || /^[\w.-]+\.html(#.*)?$/.test(href)) {
      fail(`${page}: internal link "${href}" should be root-relative and extensionless`);
    }
  }
}

// --- report ---
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
} else {
  console.log('PASS: all SEO baseline checks passed.');
}
