/* ════════════════════════════════════════════════════════════════
   Enterprise enquiry form — posts JSON to the form's data-endpoint.
   Needs icons.js loaded first (shared ad-param allowlist, ZakshaAd).
   buildPayload / classify / send are pure and covered by
   lead-form.selfcheck.mjs; the DOM wiring below is not.
   No third-party scripts, no pixels.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var WA = 'https://wa.me/918919468618?text=Hi%2C%20I%27d%20like%20to%20talk%20about%20Zaksha%20for%20our%20organisation.';

  // Organisation email only (marketing#29). The same list as the API, kuchbhi
  // control-plane/internal/httpapi/personal_email.go: change both together.
  var PERSONAL_DOMAINS = ['gmail.com', 'googlemail.com', 'ymail.com', 'rocketmail.com', 'outlook.com', 'live.com', 'msn.com',
    'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'pm.me', 'zoho.com', 'zohomail.in',
    'zohomail.com', 'mail.com', 'tutanota.com', 'fastmail.com', 'rediffmail.com', 'rediff.com', 'indiatimes.com', 'sify.com'];
  var PERSONAL_PREFIXES = ['yahoo.', 'hotmail.', 'yandex.', 'gmx.']; // every country variant
  var ORG_EMAIL_MSG = "Please use your organisation's email address, not a personal one. No work email?";

  function isPersonalEmail(email) {
    var s = email == null ? '' : String(email);
    var at = s.lastIndexOf('@');
    if (at < 0) return false;
    var d = s.slice(at + 1).trim().toLowerCase();
    return PERSONAL_DOMAINS.indexOf(d) >= 0 || PERSONAL_PREFIXES.some(function (p) { return d.indexOf(p) === 0; });
  }

  function buildPayload(f, search) {
    var t = function (v) { return (v == null ? '' : String(v)).trim(); };
    var n = parseInt(t(f.devices), 10);
    var ref = t(f.ref) || new URLSearchParams(search).get('ref') || '';
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(ref)) ref = ''; // the API rejects anything else; drop it rather than lose the lead
    var demo = t(f.demo_requested) === '1';
    var out = {
      segment: t(f.segment), org_name: t(f.org_name), contact_name: t(f.contact_name),
      email: t(f.email), phone: t(f.phone), devices: isNaN(n) ? null : n, message: t(f.message),
      heard_from: t(f.heard_from), demo_requested: demo,
      ref: ref, ad_attribution: JSON.stringify(window.ZakshaAd.adParams(search)), website: f.website == null ? '' : String(f.website)
    };
    // terms travel only with a demo request (kuchbhi#368); an unticked box is absent from FormData
    if (demo) out.terms_accepted = t(f.terms_accepted) === '1';
    return out;
  }

  // the API names the terms tick "terms"; on the form it is the terms_accepted checkbox
  function fieldFor(apiField) { return apiField === 'terms' ? 'terms_accepted' : apiField; }

  // status null = the request never got an answer
  function classify(status, body) {
    body = body || {};
    if (status === 201 || status === 202) return { kind: 'success' };
    if (status === 429) return { kind: 'rate_limited', message: 'Too many attempts, please WhatsApp us.' };
    if (status === 400 && body.error === 'leads/personal_email') return { kind: 'field_error', field: 'email', message: ORG_EMAIL_MSG, wa: true };
    if (status === 400) return { kind: 'field_error', field: body.field || '', message: body.message || 'Please check this field.' };
    return { kind: 'network_error', message: "We couldn't send that. Your answers are still here: try again, or WhatsApp us." };
  }

  function send(endpoint, payload, fetchImpl) {
    return fetchImpl(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (body) { return classify(res.status, body); });
      })
      .catch(function () { return classify(null, null); });
  }

  var api = { buildPayload: buildPayload, classify: classify, send: send, fieldFor: fieldFor, isPersonalEmail: isPersonalEmail };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ZakshaLead = api;

  // ---- DOM wiring ----
  function wire(form) {
    var status = form.querySelector('.lead-form__status');
    var btn = form.querySelector('button[type="submit"]');
    function clearErrors() {
      form.querySelectorAll('.lead-form__err').forEach(function (e) { e.remove(); });
      status.textContent = '';
    }
    function waLink() {
      var a = document.createElement('a');
      a.href = WA; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Chat with us on WhatsApp';
      return a;
    }
    function say(text, withWa) {
      status.textContent = text + ' ';
      if (withWa) status.appendChild(waLink());
    }
    function fieldError(el, text, withWa) {
      var msg = document.createElement('span');
      msg.className = 'lead-form__err'; msg.setAttribute('role', 'alert'); msg.textContent = text;
      if (withWa) { msg.append(' ', waLink(), '.'); }
      var hint = el.nextElementSibling; // the error goes under the field's hint, if it has one
      (hint && hint.tagName === 'SMALL' ? hint : el).insertAdjacentElement('afterend', msg);
      el.focus();
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearErrors();
      var f = {};
      new FormData(form).forEach(function (v, k) { f[k] = v; });
      if (isPersonalEmail(f.email)) { fieldError(form.elements.email, ORG_EMAIL_MSG, true); return; }
      btn.disabled = true;
      send(form.dataset.endpoint, buildPayload(f, location.search), window.fetch.bind(window)).then(function (r) {
        btn.disabled = false;
        if (r.kind === 'success') {
          var done = document.createElement('div');
          done.className = 'lead-form lead-form--done';
          done.setAttribute('role', 'status');
          done.textContent = "Thanks. We'll reply within one working day. ";
          var a = document.createElement('a');
          a.href = WA; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Or WhatsApp us now';
          done.appendChild(a);
          form.replaceWith(done);
        } else if (r.kind === 'field_error' && r.field && form.elements[fieldFor(r.field)] && form.elements[fieldFor(r.field)].type !== 'hidden') {
          fieldError(form.elements[fieldFor(r.field)], r.message, r.wa);
        } else {
          say(r.kind === 'field_error' ? "We couldn't send that. Please try again, or WhatsApp us." : r.message, true);
        }
      });
    });
  }
  if (typeof document !== 'undefined') {
    var init = function () {
      document.querySelectorAll('form.lead-form').forEach(wire);
      // "Book a 15-minute demo" goes to the same form: marks the demo, asks for the terms tick, fills the message
      // "Start a free 30-day pilot" (schools hero) goes to the same form, with the message filled in
      document.querySelectorAll('a[data-pilot]').forEach(function (a) {
        a.addEventListener('click', function () {
          var m = document.querySelector('form.lead-form textarea[name="message"]');
          if (m && !m.value.trim()) m.value = "I'd like a free 30-day pilot.";
        });
      });
      document.querySelectorAll('a[data-demo]').forEach(function (a) {
        a.addEventListener('click', function () {
          var form = document.querySelector('form.lead-form');
          if (!form) return;
          form.elements.demo_requested.value = '1';
          var terms = form.querySelector('.lead-form__terms');
          terms.hidden = false;
          form.elements.terms_accepted.required = true;
          var m = form.elements.message;
          if (!m.value.trim()) m.value = "I'd like a 15-minute demo.";
        });
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
