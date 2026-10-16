#!/usr/bin/env node
// SEO baseline checks for the Zaksha marketing site. Run: node tests/seo-check.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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
  'parental-control-windows.html',
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
  'https://zaksha.com/business',
  'https://zaksha.com/colleges',
];
const FORBIDDEN_SITEMAP_SLUGS = [
  'block',
  'parental-control-android',
  'parental-control-iphone',
  'parental-control-windows',
  'lp-schools',
  'lp-colleges',
  'lp-offices',
  'schools',
  'offices',
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
  'business.html': 'https://zaksha.com/business',
  'colleges.html': 'https://zaksha.com/colleges',
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

// --- e. redirect pages: canonical + target ---
const REDIRECTS = {
  'pricing.html': { canonical: 'https://zaksha.com/', to: '/#pricing' },
  'schools.html': { canonical: 'https://zaksha.com/business', to: '/business?for=school' },
};
for (const [page, { canonical, to }] of Object.entries(REDIRECTS)) {
  if (!exists(page)) {
    fail(`${page}: file missing`);
    continue;
  }
  const html = read(page);
  const matches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/g)];
  if (matches.length !== 1) {
    fail(`${page}: expected exactly one <link rel="canonical">, found ${matches.length}`);
  } else if (matches[0][1] !== canonical) {
    fail(`${page}: canonical href is "${matches[0][1]}", expected "${canonical}"`);
  }
  if (!html.includes(`<meta http-equiv="refresh" content="0; url=${to}" />`)) fail(`${page}: missing meta refresh to ${to}`);
  if (!html.includes(`location.replace('${to}')`)) fail(`${page}: missing location.replace('${to}')`);
}

// --- e2. removed enterprise pages are gone, and nothing links to them ---
const REMOVED = ['offices.html', 'lp-schools.html', 'lp-colleges.html', 'lp-offices.html'];
for (const page of REMOVED) if (exists(page)) fail(`${page}: must be removed (one unified /business page)`);
const REMOVED_REF = /href="\/?(schools|offices)(\.html)?["#?]|(lp-(schools|colleges|offices)|offices)\.html|zaksha\.com\/(schools|offices)\b/;
const SCAN = [...readdirSync(ROOT).filter((f) => /\.(html|js|xml)$/.test(f) && f !== 'schools.html'), 'README.md'];
for (const file of SCAN) {
  const hit = read(file).match(REMOVED_REF);
  if (hit) fail(`${file}: still links to a removed page ("${hit[0]}")`);
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
  'business.html', 'colleges.html',
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

// --- i. homepage ad ref-forwarding ---
// Ad channels (AG3/AG4) point at the homepage with ?ref=<code>. The PWA only captures ?ref on
// its /signup route (persistFirstTouchRef runs in SignupPage), so the homepage must (a) send its
// "Get started" CTAs to app.zaksha.com/signup and (b) carry an inbound ?ref into those links.
if (indexHtml === null && exists('index.html')) indexHtml = read('index.html');
if (indexHtml) {
  if (!indexHtml.includes('app.zaksha.com/signup')) {
    fail('index.html: "Get started" CTAs must point to app.zaksha.com/signup (so ?ref is captured)');
  }
  if (!/zaksha_ref/.test(indexHtml)) {
    fail('index.html: missing the ref-forwarding script (carries ?ref= into the signup CTAs)');
  }
}

// --- j. enterprise page: indexable ---
const ENT_INDEXED = ['business.html', 'colleges.html'];
const INSTITUTION_PAGES = ENT_INDEXED;
for (const page of ENT_INDEXED) {
  if (!exists(page)) { fail(`${page}: file missing`); continue; }
  if (/<meta name="robots"[^>]*noindex/i.test(read(page))) fail(`${page}: must be indexable (no noindex)`);
}

// --- k. audience switch ("For families | For institutions") in every page header ---
const ALL_PAGES = readdirSync(ROOT).filter((f) => f.endsWith('.html') && !Object.hasOwn(REDIRECTS, f));
for (const page of ALL_PAGES) {
  const html = read(page);
  const sw = html.match(/<div class="aud"[^>]*>([\s\S]*?)<\/div>/);
  if (!sw) { fail(`${page}: missing audience switch (<div class="aud">)`); continue; }
  const links = [...sw[1].matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)].map((m) => ({ attrs: m[1], text: m[2].trim() }));
  const fam = links.find((l) => l.text === 'For families' && /href="\/"/.test(l.attrs));
  const inst = links.find((l) => l.text === 'For institutions' && /href="\/business"/.test(l.attrs));
  if (!fam || !inst) { fail(`${page}: audience switch needs "For families" -> / and "For institutions" -> /business`); continue; }
  const marked = links.filter((l) => /aria-current="page"/.test(l.attrs));
  const want = INSTITUTION_PAGES.includes(page) ? inst : fam;
  if (marked.length !== 1 || marked[0] !== want) {
    fail(`${page}: audience switch must mark exactly "${want.text}" with aria-current="page"`);
  }
}

// --- l. one unified page: four heros, one form, ?for= wiring ---
if (exists('business.html')) {
  const html = read('business.html');
  if (!/<script src="\/?lead-form\.js"><\/script>/.test(html)) fail('business.html: missing lead-form.js');
  const form = html.match(/<form\b[^>]*class="lead-form"[^>]*>([\s\S]*?)<\/form>/);
  if (!form) fail('business.html: missing <form class="lead-form">');
  else {
    const body = form[1];
    if (!/id="enquire"/.test(html)) fail('business.html: missing #enquire anchor');
    if (!/data-endpoint="https:\/\/api\.zaksha\.com\/api\/v1\/public\/leads"/.test(form[0])) fail('business.html: form needs the default data-endpoint');
    for (const n of ['segment', 'org_name', 'contact_name', 'email', 'phone', 'devices', 'message', 'ref', 'website']) {
      if (!new RegExp(`name="${n}"`).test(body)) fail(`business.html: form missing field "${n}"`);
    }
    if (!/name="website"[^>]*tabindex="-1"[^>]*autocomplete="off"|autocomplete="off"[^>]*name="website"[^>]*tabindex="-1"|tabindex="-1"[^>]*autocomplete="off"[^>]*name="website"|name="website"[^>]*autocomplete="off"[^>]*tabindex="-1"/.test(body)) {
      fail('business.html: honeypot "website" needs tabindex="-1" and autocomplete="off"');
    }
    const opts = (name) => {
      const sel = body.match(new RegExp(`<select[^>]*name="${name}"[^>]*>([\\s\\S]*?)</select>`));
      return sel ? [...sel[1].matchAll(/<option\b([^>]*)>([^<]*)<\/option>/g)].map((m) => [(m[1].match(/value="([^"]*)"/) || [])[1], m[2].trim()]) : null;
    };
    const seg = opts('segment');
    if (!seg) fail('business.html: segment must be a <select>');
    else if (JSON.stringify(seg) !== JSON.stringify([['', 'Choose one'], ['school', 'A school'], ['college', 'A college or institute'], ['team', 'A company or team']])) fail(`business.html: segment options wrong: ${JSON.stringify(seg)}`);
    const dev = opts('devices');
    if (!dev) fail('business.html: devices must be a <select>');
    else if (JSON.stringify(dev) !== JSON.stringify([['', ''], ['10', 'Up to 10'], ['50', '11–50'], ['200', '51–200'], ['500', 'More than 200']])) fail(`business.html: devices options wrong: ${JSON.stringify(dev)}`);
    if (/value="(office|schools|colleges)"/.test(body)) fail('business.html: old segment value in form');
    if (!/<input type="hidden" name="ref" value=""/.test(body)) fail('business.html: hidden ref must start empty (the page script sets it)');
    if (!/<button[^>]*type="submit"[^>]*>Talk to us<\/button>/.test(body)) fail('business.html: submit button must read "Talk to us"');
  }
  if (!html.includes('wa.me/918919468618')) fail('business.html: missing WhatsApp link');
  // hero variants: default visible without JS, others hidden until the script picks one
  for (const id of ['hero-default', 'hero-school', 'hero-college', 'hero-team']) {
    const m = html.match(new RegExp(`<section\\b[^>]*id="${id}"[^>]*>`));
    if (!m) { fail(`business.html: missing hero #${id}`); continue; }
    const hidden = /\bhidden\b/.test(m[0]);
    if (id === 'hero-default' && hidden) fail('business.html: default hero must be visible without JS');
    if (id !== 'hero-default' && !hidden) fail(`business.html: #${id} must carry the hidden attribute`);
    if (!new RegExp(`id="${id}"[\\s\\S]*?<h1>`).test(html)) fail(`business.html: #${id} needs an <h1>`);
  }
  if (!/ZakshaLead\.audienceFor\(/.test(html)) fail('business.html: page script must call ZakshaLead.audienceFor');
  if (/app-business\.png|app-fleetpack\.png/.test(html)) fail('business.html: must not use the old-brand screenshots');
  for (const needle of ['id="how"', 'id="devices"', 'id="pricing"']) if (!html.includes(needle)) fail(`business.html: missing section ${needle}`);
}

// --- m. business page: pricing, pilot, device honesty ---
if (exists('business.html')) {
  const html = read('business.html');
  if (!html.includes('From ₹79')) fail('business.html: missing "From ₹79" pricing');
  if (!/3-month pilot at 10%/.test(html)) fail('business.html: missing pilot terms');
  if (!/VPN/.test(html)) fail('business.html: campus Wi-Fi mention needs the VPN caveat');
  if (!/Private DNS/.test(html)) fail('business.html: Android Private DNS caveat missing');
}

// --- n. pricing cards and footers send Enterprise to the enquiry form ---
for (const page of ALL_PAGES) {
  const html = read(page);
  if (/Zaksha%20Enterprise%20enquiry/.test(html)) fail(`${page}: Enterprise mailto still present; use /business#enquire`);
  if (html.includes('plan__tag">Offices &amp; schools')) {
    for (const needle of ['From ₹79', 'minimum 10 devices', '3-month pilot at 10%', 'href="/business#enquire"']) {
      if (!html.includes(needle)) fail(`${page}: Enterprise pricing card missing "${needle}"`);
    }
  }
}

// --- o. claim rules on the new pages (MESSAGING.md) ---
const BANNED_CLAIMS = /SOC ?2|ISO ?27|compliance-ready|exam mode|exam lockdown|allow-?list|seamless|robust|comprehensive|leverage|empower|unlock|elevate|streamline|crucial|pivotal/i;
for (const page of ENT_INDEXED) {
  if (!exists(page)) continue;
  const text = read(page);
  const hit = text.match(BANNED_CLAIMS);
  if (hit) fail(`${page}: banned claim or word "${hit[0]}"`);
  if (/tamper-proof/i.test(text)) fail(`${page}: "tamper-proof" is not used on the enterprise page`);
}

// --- q. colleges page: one problem-first page with the enquiry form preselected to college ---
if (exists('colleges.html')) {
  const html = read('colleges.html');
  for (const needle of ['id="enquire"', 'id="how"']) if (!html.includes(needle)) fail(`colleges.html: missing anchor ${needle}`);
  const form = html.match(/<form\b[^>]*class="lead-form"[^>]*>([\s\S]*?)<\/form>/);
  if (!form) fail('colleges.html: missing <form class="lead-form">');
  else {
    const sel = form[1].match(/<select[^>]*name="segment"[^>]*>([\s\S]*?)<\/select>/);
    const picked = sel && [...sel[1].matchAll(/<option\b([^>]*)>/g)].filter((m) => /\bselected\b/.test(m[1]));
    if (!sel) fail('colleges.html: segment must stay a visible <select>');
    else if (picked.length !== 1 || !/value="college"/.test(picked[0][1])) fail('colleges.html: segment must be preselected to college');
  }
  if (!/<script src="\/?lead-form\.js"><\/script>/.test(html)) fail('colleges.html: missing lead-form.js');
  if (/exam mode|lockdown|allow-?list/i.test(html)) fail('colleges.html: contains exam mode / lockdown / allow-list wording');
}

// --- p. privacy discloses the enquiry-form Google Ads conversion; MESSAGING has the ref codes ---
if (exists('privacy.html') && !/enquiry form[^<]*Google Ads[^<]*qualified lead/i.test(read('privacy.html'))) {
  fail('privacy.html: missing the enquiry-form Google Ads qualified-lead disclosure');
}
for (const code of ['BIZ-SCH', 'BIZ-COL', 'BIZ-TEAM', '?for=']) {
  if (!read('MESSAGING.md').includes(code)) fail(`MESSAGING.md: missing ${code}`);
}

if (/GS-ENT|lp-(schools|colleges|offices)/.test(read('MESSAGING.md'))) fail('MESSAGING.md: old GS-ENT-* / lp-* lander entries must go');

// --- report ---
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
} else {
  console.log('PASS: all SEO baseline checks passed.');
}
