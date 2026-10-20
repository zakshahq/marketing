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
  'colleges.html',
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
  'https://zaksha.com/schools-and-colleges',
  'https://zaksha.com/security',
  'https://zaksha.com/small-business',
  'https://zaksha.com/enterprise',
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
  'colleges',
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
  'schools-and-colleges.html': 'https://zaksha.com/schools-and-colleges',
  'security.html': 'https://zaksha.com/security',
  'small-business.html': 'https://zaksha.com/small-business',
  'enterprise.html': 'https://zaksha.com/enterprise',
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
  'schools.html': { canonical: 'https://zaksha.com/schools-and-colleges', to: '/schools-and-colleges' },
  'colleges.html': { canonical: 'https://zaksha.com/schools-and-colleges', to: '/schools-and-colleges' },
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
const REMOVED_REF = /href="\/?(schools|offices)(\.html)?["#?]|(lp-(schools|colleges|offices)|offices)\.html|zaksha\.com\/(schools|offices)(?![\w-])/;
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
  'business.html', 'schools-and-colleges.html',
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

// --- j. Business pages: indexable (ADR 0087 site shape: /business hub + one page per buyer) ---
const ENT_INDEXED = ['business.html', 'schools-and-colleges.html', 'small-business.html', 'enterprise.html'];
// the Business side of the switch: solution pages plus /security
const BUSINESS_SIDE = [...ENT_INDEXED, 'security.html'];
for (const page of BUSINESS_SIDE) {
  if (!exists(page)) { fail(`${page}: file missing`); continue; }
  if (/<meta name="robots"[^>]*noindex/i.test(read(page))) fail(`${page}: must be indexable (no noindex)`);
}

// --- k. "Home | Business" switch in every page header; Business pages mark Business ---
const ALL_PAGES = readdirSync(ROOT).filter((f) => f.endsWith('.html') && !Object.hasOwn(REDIRECTS, f));
for (const page of ALL_PAGES) {
  const html = read(page);
  const sw = html.match(/<div class="aud"[^>]*>([\s\S]*?)<\/div>/);
  if (!sw) { fail(`${page}: missing Home | Business switch (<div class="aud">)`); continue; }
  const links = [...sw[1].matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)].map((m) => ({ attrs: m[1], text: m[2].trim() }));
  const home = links.find((l) => l.text === 'Home' && /href="\/"/.test(l.attrs));
  const biz = links.find((l) => l.text === 'Business' && /href="\/business"/.test(l.attrs));
  if (!home || !biz || links.length !== 2) { fail(`${page}: switch must be exactly "Home" -> / and "Business" -> /business`); continue; }
  const marked = links.filter((l) => /aria-current="page"/.test(l.attrs));
  const want = BUSINESS_SIDE.includes(page) ? biz : home;
  if (marked.length !== 1 || marked[0] !== want) fail(`${page}: switch must mark exactly "${want.text}" with aria-current="page"`);
}

// --- k2. no ?for= audience variants left anywhere (ads use ?ref=GS-ENT-… on the solution page) ---
for (const file of [...readdirSync(ROOT).filter((f) => /\.(html|js)$/.test(f)), 'README.md']) {
  const hit = read(file).match(/[?&]for=|audienceFor|hero-(school|college|team)/);
  if (hit) fail(`${file}: leftover ?for= audience wiring ("${hit[0]}")`);
}

// --- k3. every root-relative page link resolves to a file in the site ---
for (const page of ALL_PAGES) {
  for (const m of read(page).matchAll(/href="\/([a-z0-9-]+)(?:[?#][^"]*)?"/g)) {
    if (!exists(`${m[1]}.html`)) fail(`${page}: links to /${m[1]}, which has no ${m[1]}.html`);
  }
}

// --- l. Business header on every Business page: Solutions menu + page links ---
const SOLUTIONS = [['/schools-and-colleges', 'Schools and colleges'], ['/small-business', 'Small businesses and startups'], ['/enterprise', 'Enterprise']];
for (const page of ENT_INDEXED) {
  if (!exists(page)) continue;
  const header = (read(page).match(/<header\b[\s\S]*?<\/header>/) || [''])[0];
  const menu = header.match(/<details\b[^>]*>\s*<summary\b[^>]*>[^<]*Solutions[\s\S]*?<\/details>/);
  if (!menu) { fail(`${page}: header needs a "Solutions" menu`); continue; }
  for (const [href, text] of SOLUTIONS) {
    if (!new RegExp(`href="${href}"[^>]*>${text}<`).test(menu[0])) fail(`${page}: Solutions menu needs "${text}" -> ${href}`);
  }
  if (!menu[0].includes('Wi-Fi filtering for any of these, on request.')) fail(`${page}: Solutions menu needs the Wi-Fi note`);
  if (!header.includes('href="#enquire"')) fail(`${page}: header CTA must go to #enquire`);
}

// --- l2. the enquiry form, the same on every page that has one ---
for (const page of ALL_PAGES) {
  const html = read(page);
  const form = html.match(/<form\b[^>]*class="lead-form"[^>]*>([\s\S]*?)<\/form>/);
  if (!form) { if (ENT_INDEXED.includes(page)) fail(`${page}: missing <form class="lead-form">`); continue; }
  const body = form[1];
  if (!/<script src="\/?lead-form\.js"><\/script>/.test(html)) fail(`${page}: missing lead-form.js`);
  if (!/id="enquire"/.test(html)) fail(`${page}: missing #enquire anchor`);
  if (!/data-endpoint="https:\/\/api\.zaksha\.com\/api\/v1\/public\/leads"/.test(form[0])) fail(`${page}: form needs the default data-endpoint`);
  for (const n of ['segment', 'org_name', 'contact_name', 'email', 'phone', 'devices', 'message', 'ref', 'website']) {
    if (!new RegExp(`name="${n}"`).test(body)) fail(`${page}: form missing field "${n}"`);
  }
  const hp = body.match(/<input\b[^>]*name="website"[^>]*>/);
  if (!hp || !/tabindex="-1"/.test(hp[0]) || !/autocomplete="off"/.test(hp[0])) fail(`${page}: honeypot "website" needs tabindex="-1" and autocomplete="off"`);
  const opts = (name) => {
    const sel = body.match(new RegExp(`<select[^>]*name="${name}"[^>]*>([\\s\\S]*?)</select>`));
    return sel ? [...sel[1].matchAll(/<option\b([^>]*)>([^<]*)<\/option>/g)].map((m) => [(m[1].match(/value="([^"]*)"/) || [])[1], m[2].trim(), /\bselected\b/.test(m[1])]) : null;
  };
  const seg = opts('segment');
  if (!seg) fail(`${page}: segment must be a <select>`);
  else {
    if (JSON.stringify(seg.map((o) => o.slice(0, 2))) !== JSON.stringify([['', 'Choose one'], ['school', 'A school'], ['college', 'A college or institute'], ['team', 'A company or team']])) fail(`${page}: segment options wrong: ${JSON.stringify(seg)}`);
    if (!seg[0][2] || seg.filter((o) => o[2]).length !== 1) fail(`${page}: segment must default to the "Choose one" placeholder (no preselect)`);
  }
  if (!/<select[^>]*name="segment"[^>]*required/.test(body)) fail(`${page}: segment must be required`);
  const dev = opts('devices');
  if (!dev) fail(`${page}: devices must be a <select>`);
  else if (JSON.stringify(dev.map((o) => o.slice(0, 2))) !== JSON.stringify([['', ''], ['10', 'Up to 10'], ['50', '11–50'], ['200', '51–200'], ['500', 'More than 200']])) fail(`${page}: devices options wrong: ${JSON.stringify(dev)}`);
  // ref stays empty in the page; lead-form.js takes it from ?ref= on the ad URL
  if (!/<input type="hidden" name="ref" value=""/.test(body)) fail(`${page}: hidden ref must be empty`);
  if (/elements\.ref\.value\s*=/.test(html)) fail(`${page}: page script must not set the form's ref (it comes from ?ref=)`);
  if (!/<button[^>]*type="submit"[^>]*>Talk to us<\/button>/.test(body)) fail(`${page}: submit button must read "Talk to us"`);
  if (!html.includes('wa.me/918919468618')) fail(`${page}: missing WhatsApp link`);
}

// --- m. /business hub: one hero, a card per solution, pricing, pilot, device honesty ---
if (exists('business.html')) {
  const html = read('business.html');
  if ((html.match(/<h1\b/g) || []).length !== 1) fail('business.html: the hub has exactly one <h1>');
  const main = html.replace(/<header\b[\s\S]*?<\/header>/, '').replace(/<footer\b[\s\S]*?<\/footer>/, '');
  for (const [href] of SOLUTIONS) if (!main.includes(`href="${href}"`)) fail(`business.html: hub needs a solution card linking ${href}`);
  if (!html.includes('From ₹79')) fail('business.html: missing "From ₹79" pricing');
  if (!/3-month pilot at 10%/.test(html)) fail('business.html: missing pilot terms');
  if (!/VPN/.test(html)) fail('business.html: Wi-Fi mention needs the VPN caveat');
  if (!/Private DNS/.test(html)) fail('business.html: Android Private DNS caveat missing');
  if (!/public Wi-Fi/i.test(html)) fail('business.html: missing the public Wi-Fi "talk to us" line (ADR 0087)');
  if (/app-business\.png|app-fleetpack\.png/.test(html)) fail('business.html: must not use the old-brand screenshots');
  for (const needle of ['id="how"', 'id="pricing"', 'id="enquire"']) if (!html.includes(needle)) fail(`business.html: missing section ${needle}`);
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

// --- o. claim rules on the Business pages (MESSAGING.md) ---
const BANNED_CLAIMS = /SOC ?2|ISO ?27|compliance-ready|exam mode|exam lockdown|lockdown|allow-?list|seamless|robust|comprehensive|leverage|empower|unlock|elevate|streamline|crucial|pivotal/i;
for (const page of ENT_INDEXED) {
  if (!exists(page)) continue;
  const text = read(page);
  const hit = text.match(BANNED_CLAIMS);
  if (hit) fail(`${page}: banned claim or word "${hit[0]}"`);
  if (/tamper-proof/i.test(text)) fail(`${page}: "tamper-proof" is not used on the Business pages`);
}

// --- q. schools-and-colleges page: family-page layout ---
if (exists('schools-and-colleges.html')) {
  const P = 'schools-and-colleges.html';
  const html = read(P);
  if (!/<section\b[^>]*class="fhero"[\s\S]*?<img\b[^>]*src="\/?img\/lifestyle\/[^"]+\.jpg"/.test(html)) fail(`${P}: hero needs a photo <img> under img/lifestyle/`);
  if (!/class="marquee"/.test(html)) fail(`${P}: missing the app-logo marquee (.marquee)`);
  for (const needle of ['id="enquire"', 'id="how"', 'id="pricing"', 'id="faq"']) if (!html.includes(needle)) fail(`${P}: missing anchor ${needle}`);
}

// --- p. privacy discloses the enquiry-form Google Ads conversion; MESSAGING has the ref scheme ---
if (exists('privacy.html') && !/enquiry form[^<]*Google Ads[^<]*qualified lead/i.test(read('privacy.html'))) {
  fail('privacy.html: missing the enquiry-form Google Ads qualified-lead disclosure');
}
{
  const msg = read('MESSAGING.md');
  if (!msg.includes('?ref=GS-ENT-')) fail('MESSAGING.md: must document the ?ref=GS-ENT-… ad scheme');
  const old = msg.match(/\?for=|BIZ-(SCH|COL|TEAM)|lp-(schools|colleges|offices)|one Enterprise page/);
  if (old) fail(`MESSAGING.md: stale entry "${old[0]}"`);
}

// --- r. /security: the data-handling page (kuchbhi#136 one-pager), linked from every Business page ---
if (exists('security.html')) {
  const html = read('security.html');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const fact of ['AWS', 'Mumbai', '30 days', 'up to a year', 'every hour', 'Backups are kept for 7 days', 'at most 8 hours', 'never beyond 24',
    'data processing agreement', 'data fiduciary', 'support@zaksha.com', 'Grievance Officer', 'Only people your organisation adds']) {
    if (!text.includes(fact)) fail(`security.html: missing the fact "${fact}"`);
  }
  if (!/href="\/privacy"/.test(html)) fail('security.html: must link the full privacy policy');
  if (/SOC ?2|ISO ?27|certified|DPDP[- ]compliant|compliance-ready/i.test(text)) fail('security.html: no certification or compliance claims');
  if (/dedicated VPS/i.test(text)) fail('security.html: "dedicated VPS" is not how Enterprise runs (ADR 0087)');
}
for (const page of ENT_INDEXED) {
  if (exists(page) && !/href="\/security"/.test(read(page))) fail(`${page}: must link /security`);
}

// --- s. privacy.html: shared hosting by default, and an Organisations section ---
if (exists('privacy.html')) {
  const html = read('privacy.html');
  if (/dedicated VPS/i.test(html)) fail('privacy.html: remove "dedicated VPS" (Enterprise runs on the shared plane by default, ADR 0087)');
  const org = html.match(/<section id="organisations">([\s\S]*?)<\/section>/);
  if (!org) fail('privacy.html: missing <section id="organisations">');
  else {
    for (const fact of ['data fiduciary', 'data processing agreement', 'chooses who']) if (!org[1].includes(fact)) fail(`privacy.html: Organisations section must say "${fact}"`);
  }
}

// --- t. no GST line on any price card (no GSTIN yet, ADR 0087 Consequences; Vasu 2026-10-20) ---
for (const page of ALL_PAGES.filter((f) => !['privacy.html', 'terms.html'].includes(f))) {
  const hit = read(page).match(/[^<>]{0,40}GST[^<>]{0,40}/);
  if (hit) fail(`${page}: remove the GST line ("${hit[0].trim()}")`);
}

// --- u. solution pages (approved decks, 2026-10-20): problem-first hero, demo + pilot by the main button ---
const textOf = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ');
const HEROES = {
  'schools-and-colleges.html': 'Classroom tablets and lab PCs, kept for classes and tests.',
  'small-business.html': 'No IT person, and a work laptop just opened a fake bank page.',
  'enterprise.html': 'Someone asks if your web policy holds at every office. Show them.',
};
for (const [page, h1] of Object.entries(HEROES)) {
  if (!exists(page)) continue;
  const html = read(page);
  const hero = (html.match(/<section\b[^>]*class="fhero"[\s\S]*?<\/section>/) || [''])[0];
  if (!hero) { fail(`${page}: missing the photo hero (.fhero)`); continue; }
  const h = hero.match(/<h1>([\s\S]*?)<\/h1>/);
  if (!h || textOf(h[1]).trim() !== h1) fail(`${page}: hero h1 must be "${h1}"`);
  if (!/<a\b[^>]*href="#enquire"[^>]*>Talk to us<\/a>/.test(hero)) fail(`${page}: hero needs "Talk to us" -> #enquire`);
  if (!/<a\b[^>]*href="#enquire"[^>]*data-demo[^>]*>Book a 15-minute demo<\/a>/.test(hero)) fail(`${page}: hero needs "Book a 15-minute demo" (href="#enquire" data-demo)`);
  if (!/3-month pilot at 10% of the quote/.test(textOf(hero))) fail(`${page}: hero needs the pilot line`);
  if (!/From ₹79 per device per month/.test(textOf(hero))) fail(`${page}: hero needs "From ₹79 per device per month"`);
  if (!/class="marquee"/.test(html)) fail(`${page}: missing the category marquee`);
  if (!html.includes('id="faq"')) fail(`${page}: missing #faq`);
}
// sb and ent follow the segment-page order
for (const page of ['small-business.html', 'enterprise.html']) {
  if (!exists(page)) continue;
  const html = read(page);
  const order = ['problem', 'why', 'how', 'uses', 'setup', 'proof', 'faq', 'pricing', 'enquire'];
  const at = order.map((id) => html.indexOf(`id="${id}"`));
  if (at.some((i) => i < 0)) fail(`${page}: needs sections ${order.map((i) => '#' + i).join(' ')} (missing ${order.filter((_, i) => at[i] < 0).join(', ')})`);
  else if (at.some((v, i) => i > 0 && v < at[i - 1])) fail(`${page}: sections out of order; want ${order.join(' → ')}`);
}
if (exists('small-business.html')) {
  const t = textOf(read('small-business.html'));
  for (const n of ['Three ways offices try this today', 'Set up without an IT team', 'Not watching your staff', 'every support sign-in is recorded']) if (!t.includes(n)) fail(`small-business.html: missing "${n}"`);
  if (!/per person per month/i.test(t)) fail('small-business.html: monitoring software is priced "per person per month"');
  if (/₹ ?2[0-9]{2}/.test(t)) fail('small-business.html: no price figure for monitoring software (Vasu: no number)');
}
if (exists('enterprise.html')) {
  const t = textOf(read('enterprise.html'));
  for (const n of ['The questions you get asked', 'Okta', 'Microsoft Entra ID', 'Google Workspace', 'On-premise: ask us', 'every support sign-in is recorded', 'up to a year', 'Moving from a firewall or proxy you already run']) if (!t.includes(n)) fail(`enterprise.html: missing "${n}"`);
  if (/\bSLA\b|audit log|SIEM|DPDP[- ]compliant/i.test(t)) fail('enterprise.html: claims left off by the deck (SLA, audit log, SIEM, DPDP compliant)');
}
// schools diff: problems before the block list, CBSE section with the 2017 circular, 30-day records
if (exists('schools-and-colleges.html')) {
  const html = read('schools-and-colleges.html'), t = textOf(html);
  const wrong = html.indexOf('What goes wrong on shared devices'), block = html.indexOf('Block a whole category in one go.'), cbse = html.indexOf('CBSE asks schools to filter their computers.');
  if (wrong < 0 || block < 0 || wrong > block) fail('schools-and-colleges.html: "What goes wrong" must come before "What you can block"');
  if (cbse < 0 || cbse < wrong || cbse > block) fail('schools-and-colleges.html: CBSE section goes between the problems and the block list');
  if (!/deccanherald\.com\/india\/cbse-issues-guidelines-over-blue-2021678/.test(html)) fail('schools-and-colleges.html: CBSE section must cite the 2017 circular');
  if (/NEP|CBSE[- ]compliant|approved by CBSE/.test(t)) fail('schools-and-colleges.html: no NEP, no compliance claim');
  if (!t.includes('in the last 30 days') || /7-day record|last 7 days and what was blocked/.test(t)) fail('schools-and-colleges.html: records are 30 days');
}

// --- v. legal pages: shared hosting by default, no GST promise, real host, dated today ---
if (exists('terms.html')) {
  const t = textOf(read('terms.html'));
  if (/dedicated, isolated instance/.test(t)) fail('terms.html: dedicated instance is quoted per deal, not a plan feature');
  if (/GST/.test(t)) fail('terms.html: remove the GST invoicing line');
}
if (exists('privacy.html') && /GitHub Pages/.test(read('privacy.html'))) fail('privacy.html: the site is served by Cloudflare, not GitHub Pages');
for (const page of ['terms.html', 'privacy.html']) if (exists(page) && !read(page).includes('Effective 20 October 2026')) fail(`${page}: Effective date must be 20 October 2026`);

// --- report ---
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
} else {
  console.log('PASS: all SEO baseline checks passed.');
}
