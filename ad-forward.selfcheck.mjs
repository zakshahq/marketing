// Self-check for the ad-attribution forwarding in icons.js.
// forwardHref below is a copy of the one in icons.js — keep them in sync.
// Run: node ad-forward.selfcheck.mjs
import assert from 'node:assert';

const ALLOW = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_term', 'utm_campaign', 'gclsrc', 'gad_source', 'gad_campaignid'];
function forwardHref(href, search) {
  const here = new URLSearchParams(search);
  let u;
  try { u = new URL(href); } catch (e) { return href; }
  ALLOW.forEach((k) => { if (here.has(k) && !u.searchParams.has(k)) u.searchParams.set(k, here.get(k)); });
  return u.toString();
}

// gclid appended to a bare app link
assert.equal(forwardHref('https://app.zaksha.com/signup', '?gclid=ABC123'), 'https://app.zaksha.com/signup?gclid=ABC123');
// existing ?ref preserved, gclid merged alongside it
assert.equal(forwardHref('https://app.zaksha.com?ref=SEO-IPHONE', '?gclid=ABC'), 'https://app.zaksha.com/?ref=SEO-IPHONE&gclid=ABC');
// non-allowlisted param dropped
assert.equal(forwardHref('https://app.zaksha.com/signup', '?evil=1'), 'https://app.zaksha.com/signup');
// empty search → href unchanged
assert.equal(forwardHref('https://app.zaksha.com/signup', ''), 'https://app.zaksha.com/signup');
// a gclid already on the link is not clobbered
assert.equal(forwardHref('https://app.zaksha.com/signup?gclid=OLD', '?gclid=NEW'), 'https://app.zaksha.com/signup?gclid=OLD');
// multiple params (utm + gclid) all carried
assert.equal(forwardHref('https://app.zaksha.com/signup', '?gclid=G&utm_source=google&utm_campaign=iphone'), 'https://app.zaksha.com/signup?gclid=G&utm_source=google&utm_campaign=iphone');

console.log('ad-forward self-check OK');
