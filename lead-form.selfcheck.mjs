// Self-check for the pure functions in lead-form.js (payload building, response handling).
// Loads the real icons.js for the shared ad-param allowlist. Run: node lead-form.selfcheck.mjs
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
globalThis.location = { search: '' };
globalThis.document = { readyState: 'complete', querySelectorAll: () => [], addEventListener() {} };
require('./icons.js');
const lead = require('./lead-form.js');
const { buildPayload, classify, send } = lead;

const fields = {
  segment: 'college', org_name: ' Sunrise College ', contact_name: 'A. Rao', email: 'a@sunrise.edu',
  phone: '', devices: '200', message: '', ref: 'BIZ-COL', website: '',
};

// field mapping, trimming, devices as a number
let p = buildPayload(fields, '');
assert.deepEqual(p, {
  segment: 'college', org_name: 'Sunrise College', contact_name: 'A. Rao', email: 'a@sunrise.edu',
  phone: '', devices: 200, message: '', heard_from: '', demo_requested: false, ref: 'BIZ-COL', ad_attribution: '{}', website: '',
});
// devices select values pass through as numbers
for (const v of ['10', '50', '200', '500']) assert.equal(buildPayload({ ...fields, devices: v }, '').devices, Number(v));
// optional devices left blank or non-numeric -> null
assert.equal(buildPayload({ ...fields, devices: '' }, '').devices, null);
assert.equal(buildPayload({ ...fields, devices: 'lots' }, '').devices, null);
// ad_attribution: only allowlisted params from the page URL, as a JSON string
p = buildPayload(fields, '?gclid=G1&utm_source=google&evil=1&utm_campaign=ent');
assert.equal(typeof p.ad_attribution, 'string');
assert.deepEqual(JSON.parse(p.ad_attribution), { gclid: 'G1', utm_source: 'google', utm_campaign: 'ent' });
// ref falls back to ?ref= when the form has none; the form's own value wins
assert.equal(buildPayload({ ...fields, ref: '' }, '?ref=IG-1').ref, 'IG-1');
assert.equal(buildPayload(fields, '?ref=IG-1').ref, 'BIZ-COL');
// honeypot value is passed through untouched
assert.equal(buildPayload({ ...fields, website: 'http://spam' }, '').website, 'http://spam');

// marketing#26 / kuchbhi#368 wire contract: heard_from passes through; a plain enquiry sends demo_requested:false
// and no terms_accepted; a demo request sends both, terms_accepted true only when the box was ticked
p = buildPayload({ ...fields, segment: 'education', heard_from: 'linkedin' }, '');
assert.equal(p.segment, 'education');
assert.equal(p.heard_from, 'linkedin');
assert.equal(p.demo_requested, false);
assert.ok(!('terms_accepted' in p), 'plain enquiry must not send terms_accepted');
p = buildPayload({ ...fields, demo_requested: '1', terms_accepted: '1' }, '');
assert.deepEqual([p.demo_requested, p.terms_accepted], [true, true]);
p = buildPayload({ ...fields, demo_requested: '1' }, '');
assert.deepEqual([p.demo_requested, p.terms_accepted], [true, false]);
p = buildPayload({ ...fields, demo_requested: '', terms_accepted: '1' }, '');
assert.ok(!('terms_accepted' in p) && p.demo_requested === false, 'terms only travel with a demo');
// the API reports a missing terms tick as field "terms"; the form shows it on the checkbox
assert.equal(lead.fieldFor('terms'), 'terms_accepted');
assert.equal(lead.fieldFor('email'), 'email');

// ad URL ?ref=GS-ENT-… plus the click id reach the payload (the page's hidden ref stays empty)
p = buildPayload({ ...fields, ref: '' }, '?ref=GS-ENT-SCH1&gclid=G1&utm_campaign=GS-Ent-01');
assert.equal(p.ref, 'GS-ENT-SCH1');
assert.deepEqual(JSON.parse(p.ad_attribution), { gclid: 'G1', utm_campaign: 'GS-Ent-01' });
// no ad params: no ref, empty attribution (organic visits aren't labelled as ads)
p = buildPayload({ ...fields, ref: '' }, '');
assert.deepEqual([p.ref, p.ad_attribution], ['', '{}']);
// a ref the API would reject (it accepts ^[A-Za-z0-9_-]{1,40}$) is dropped, so the lead still goes through
assert.equal(buildPayload({ ...fields, ref: '' }, '?ref=GS%20ENT.1&gclid=G1').ref, '');
assert.equal(buildPayload({ ...fields, ref: '' }, '?ref=' + 'A'.repeat(41)).ref, '');
assert.equal(buildPayload({ ...fields, ref: '' }, '?ref=' + 'A'.repeat(40)).ref, 'A'.repeat(40));
// the ?for= audience variants are gone (ADR 0087: one page per buyer)
assert.equal(lead.audienceFor, undefined);

// response handling per status
assert.equal(classify(201, {}).kind, 'success');
assert.equal(classify(202, {}).kind, 'success');
assert.equal(classify(429, {}).kind, 'rate_limited');
assert.match(classify(429, {}).message, /Too many attempts, please WhatsApp us/);
let r = classify(400, { field: 'email', message: 'Enter a valid email' });
assert.deepEqual([r.kind, r.field, r.message], ['field_error', 'email', 'Enter a valid email']);
// the real control-plane 400 is {error:'leads/invalid', field}: never show the machine code to a visitor
assert.equal(classify(400, { field: 'email', error: 'leads/invalid' }).message, 'Please check this field.');
assert.equal(classify(400, {}).kind, 'field_error'); // no field named: still an error, shown at form level
assert.equal(classify(400, {}).field, '');
assert.equal(classify(null, null).kind, 'network_error');
assert.equal(classify(503, null).kind, 'network_error'); // server trouble: keep input, offer retry

// send(): POSTs JSON, classifies the reply, survives a thrown fetch
let seen;
const ok = async (url, init) => { seen = { url, init }; return { status: 201, json: async () => ({}) }; };
r = await send('https://x.test/leads', { a: 1 }, ok);
assert.equal(r.kind, 'success');
assert.equal(seen.url, 'https://x.test/leads');
assert.equal(seen.init.method, 'POST');
assert.equal(seen.init.headers['Content-Type'], 'application/json');
assert.equal(seen.init.body, '{"a":1}');
r = await send('u', {}, async () => { throw new TypeError('offline'); });
assert.equal(r.kind, 'network_error');
r = await send('u', {}, async () => ({ status: 400, json: async () => ({ field: 'org_name', message: 'Required' }) }));
assert.deepEqual([r.kind, r.field], ['field_error', 'org_name']);
r = await send('u', {}, async () => ({ status: 429, json: async () => { throw new Error('no body'); } }));
assert.equal(r.kind, 'rate_limited');

// marketing#29 / kuchbhi#377: organisation email only, same list as the API (personal_email.go)
const ORG_MSG = "Please use your organisation's email address."; // Vasu 2026-10-21; the WhatsApp link follows it
const { isPersonalEmail } = lead;
for (const e of ['a@gmail.com', 'A@Gmail.COM', 'a@googlemail.com', 'a@outlook.com', 'a@icloud.com', 'a@proton.me', 'a@zohomail.in',
  'a@rediffmail.com', 'a@indiatimes.com', 'a@yahoo.co.in', 'a@hotmail.co.uk', 'a@yandex.ru', 'a@gmx.de', ' a@gmail.com '])
  assert.equal(isPersonalEmail(e), true, `${e} is personal`);
for (const e of ['a@sunrise.edu', 'a@gmail.com.example.org', 'a@notgmail.com', 'a@zaksha.com', 'no-at-sign', ''])
  assert.equal(isPersonalEmail(e), false, `${e} is not personal`);
// the API's code becomes the issue's copy on the email field, with the WhatsApp link (the 400 has no message)
r = classify(400, { error: 'leads/personal_email', field: 'email' });
assert.deepEqual([r.kind, r.field, r.message, r.wa], ['field_error', 'email', ORG_MSG, true]);
assert.equal(classify(400, { error: 'leads/invalid', field: 'email' }).wa, undefined); // other 400s unchanged

// the WhatsApp fallback link never shows the number (Vasu, marketing#25)
const src = (await import('node:fs')).readFileSync(new URL('./lead-form.js', import.meta.url), 'utf8');
assert.ok(!/textContent\s*=\s*'[^']*\d{5}/.test(src), 'WhatsApp link text must not show the number');
assert.ok(src.includes("'Chat with us on WhatsApp'"), 'WhatsApp link text is "Chat with us on WhatsApp"');

console.log('lead-form self-check OK');
