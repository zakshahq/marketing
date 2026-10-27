#!/usr/bin/env node
// Brand + homepage checks from the 2026-10 site review. Run: node tests/site-check.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

// --- a. one logo everywhere: the plain shield (same path as favicon.svg) ---
const SHIELD = 'M18 11 H46 Q53 11 53 18 V34 Q53 51 32 62 Q11 51 11 34 V18 Q11 11 18 11 Z';
if (!read('favicon.svg').includes(SHIELD)) fail('favicon.svg: no longer the plain shield, update SHIELD');
for (const page of readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  const html = read(page);
  const marks = html.match(/<svg class="brand__mark"[\s\S]*?<\/svg>/g) || [];
  if (html.includes('class="brand"') && marks.length === 0) fail(`${page}: brand link without a logo mark`);
  for (const svg of marks) {
    if (!svg.includes(SHIELD)) fail(`${page}: logo mark is not the plain shield`);
  }
}

// --- b. "What Zaksha does" subline stays legible (no faded text on teal) ---
const home = read('index.html');
const subRule = home.match(/\.panel \.sub\{([^}]*)\}/);
if (!subRule) fail('index.html: .panel .sub rule not found');
else {
  if (/opacity:\s*(0?\.\d+)/.test(subRule[1])) fail('index.html: .panel .sub fades text with opacity (fails contrast on teal)');
  const size = parseFloat((subRule[1].match(/font-size:\s*([\d.]+)px/) || [])[1]);
  if (!(size >= 14)) fail(`index.html: .panel .sub font-size ${size}px, want >= 14px`);
}


// --- c. no pre-signup app download on the homepage: the app is installed
//     during guided setup after signup, so CTAs stay on the trial.
const hero = (home.match(/<section class="fhero">[\s\S]*?<\/section>/) || [''])[0];
if (hero.includes('apps.apple.com')) fail('index.html: hero links to the App Store before signup');

// --- c2. "why pay when YouTube / Family Link are free?" is answered up front, before the feature tour ---
const compareAt = home.indexOf('id="compare"'), blockAt = home.indexOf('id="block"');
if (compareAt < 0) fail('index.html: no #compare section answering "why pay when built-in controls are free?"');
else if (compareAt > blockAt) fail('index.html: #compare comes after #block, should be up front');

// --- d. trial terms are honest: payment is set up to start the trial ---
for (const page of readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  if (/no card/i.test(read(page))) fail(`${page}: claims "no card" but the trial needs UPI or a card to start`);
}
if (!/remind you 3 days before/.test(hero)) fail('index.html: hero trial line does not say we remind before the first charge');

// --- d2. ads/trackers count matches what prod loads (malware 24 Lakh+ / total 30 Lakh+ kept by decision, see MESSAGING.md) ---
for (const page of ['index.html', 'family.html']) {
  if (!readdirSync(ROOT).includes(page)) continue;
  const t = read(page);
  for (const bad of ['2.2 Lakh+']) if (t.includes(bad)) fail(`${page}: "${bad}" overstates the block lists prod loads (see MESSAGING.md)`);
}

// --- e. /family: ad lander for the whole-family promise (ad test arm B, ?ref=GS-FAM1) ---
const famExists = readdirSync(ROOT).includes('family.html');
if (!famExists) fail('family.html: missing (ad test arm B lands on /family)');
else {
  const fam = read('family.html');
  if (!fam.includes('<meta name="robots" content="noindex, nofollow" />')) fail('family.html: ad lander must be noindex');
  if (read('sitemap.xml').includes('/family')) fail('sitemap.xml: lists the noindex /family lander');
  const signups = fam.match(/href="https:\/\/app\.zaksha\.com\/signup[^"]*"/g) || [];
  if (!signups.length) fail('family.html: no signup CTA');
  for (const s of signups) if (!s.includes('ref=GS-FAM1')) fail(`family.html: signup CTA without ref=GS-FAM1: ${s}`);
  const famHero = (fam.match(/<section class="fhero">[\s\S]*?<\/section>/) || [''])[0];
  const famH1 = ((famHero.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '');
  if (!/whole family/i.test(famH1)) fail(`family.html: hero h1 should promise the whole family (got "${famH1}")`);
  if (!/scam/i.test(famHero) || !/adult content/i.test(famHero)) fail('family.html: hero must name both scam sites and adult content');
  if (!fam.includes('id="scams"')) fail('family.html: no #scams section explaining scam protection');
  if (/stop(s)? every scam|all scams|100%/i.test(fam.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' '))) fail('family.html: overclaims scam protection');
}

// --- e. /small-business starts a self-serve Business trial (kuchbhi ADR 0114, marketing#34) ---
const smb = read('small-business.html');
const smbHero = (smb.match(/<section class="fhero">[\s\S]*?<\/section>/) || [''])[0];
const trialLinks = smb.match(/<a [^>]*href="https:\/\/app\.zaksha\.com\/signup\?type=business"[^>]*>[^<]*<\/a>/g) || [];
if (!/>Start 14-day free trial</.test(smbHero) || !smbHero.includes('href="https://app.zaksha.com/signup?type=business"'))
  fail('small-business.html: hero has no "Start 14-day free trial" link to app.zaksha.com/signup?type=business');
if (!/href="#enquire"[^>]*>Talk to us</.test(smbHero)) fail('small-business.html: hero lost the secondary "Talk to us"');
if (smbHero.indexOf('Start 14-day free trial') > smbHero.indexOf('>Talk to us<')) fail('small-business.html: trial CTA must come before "Talk to us"');
if (/Request a 15-minute demo/.test(smbHero)) fail('small-business.html: hero still has a third (demo) button');
if (/Free 30-day pilot<\/span>/.test(smbHero)) fail('small-business.html: hero chip offers the pilot next to the trial');
if (!/30-day pilot/.test(smbHero)) fail('small-business.html: hero no longer points larger teams at the 30-day pilot');
if (trialLinks.length < 2) fail('small-business.html: the pricing card has no trial link');
for (const page of ['enterprise.html', 'schools-and-colleges.html'])
  if (read(page).includes('signup?type=business')) fail(`${page}: self-serve trial is small business only`);
for (const bad of [/100%/, /tamper-proof/i, /unbreakable/i, /monitor employees/i, /compliance/i])
  if (bad.test(smb)) fail(`small-business.html: banned claim ${bad}`);

if (failures.length) {
  console.error(`FAIL (${failures.length})\n- ` + failures.join('\n- '));
  process.exit(1);
}
console.log('site-check: all passed');
