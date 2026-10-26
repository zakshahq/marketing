// Ad params must survive an internal hop: land on page 1 with ?gclid, click to
// page 2 (no query), and page 2's app CTAs still carry the gclid.
// Runs the real icons.js in a stub DOM. Run: node tests/ad-forward-hop.selfcheck.mjs
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SRC = readFileSync(new URL('../icons.js', import.meta.url), 'utf8');

function memStore() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
const blockedStore = {
  getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); },
};

// Load one page: returns the CTA hrefs after icons.js has run.
function visit(search, store, hrefs = ['https://app.zaksha.com/signup']) {
  const links = hrefs.map((href) => ({ href }));
  const document = {
    readyState: 'complete',
    addEventListener() {},
    querySelectorAll: (sel) => (sel.includes('app.zaksha.com') ? links : []),
  };
  const window = { sessionStorage: store };
  vm.runInNewContext(SRC, { window, document, location: { search }, sessionStorage: store, URL, URLSearchParams, console });
  return links.map((l) => l.href);
}

// landing page: params forwarded (today's behaviour)
let s = memStore();
assert.deepEqual(visit('?gclid=X&utm_source=google', s), ['https://app.zaksha.com/signup?gclid=X&utm_source=google']);
// page 2, same tab, empty query → still forwarded
assert.deepEqual(visit('', s), ['https://app.zaksha.com/signup?gclid=X&utm_source=google']);

// nothing saved, nothing in the URL → links untouched
assert.deepEqual(visit('', memStore()), ['https://app.zaksha.com/signup']);

// non-ad params are never saved or forwarded
s = memStore();
visit('?evil=1', s);
assert.deepEqual(visit('', s), ['https://app.zaksha.com/signup']);

// a gclid already on the link is not clobbered by the saved one
s = memStore();
visit('?gclid=NEW', s);
assert.deepEqual(visit('', s, ['https://app.zaksha.com/signup?gclid=OLD']), ['https://app.zaksha.com/signup?gclid=OLD']);

// a fresh ad click in the same tab replaces the saved params
s = memStore();
visit('?gclid=FIRST', s);
visit('?gclid=SECOND', s);
assert.deepEqual(visit('', s), ['https://app.zaksha.com/signup?gclid=SECOND']);

// storage blocked → same as before: landing page forwards, page 2 untouched, no crash
assert.deepEqual(visit('?gclid=X', blockedStore), ['https://app.zaksha.com/signup?gclid=X']);
assert.deepEqual(visit('', blockedStore), ['https://app.zaksha.com/signup']);

console.log('ad-forward hop self-check OK');
