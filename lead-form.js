/* ════════════════════════════════════════════════════════════════
   Enterprise enquiry form — posts JSON to the form's data-endpoint.
   Needs icons.js loaded first (shared ad-param allowlist, ZakshaAd).
   buildPayload / classify / send / audienceFor are pure and covered by
   lead-form.selfcheck.mjs; the DOM wiring below is not.
   No third-party scripts, no pixels.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var WA = 'https://wa.me/918919468618?text=Hi%2C%20I%27d%20like%20to%20talk%20about%20Zaksha%20for%20our%20organisation.';

  function buildPayload(f, search) {
    var t = function (v) { return (v == null ? '' : String(v)).trim(); };
    var n = parseInt(t(f.devices), 10);
    var ref = t(f.ref) || new URLSearchParams(search).get('ref') || '';
    return {
      segment: t(f.segment), org_name: t(f.org_name), contact_name: t(f.contact_name),
      email: t(f.email), phone: t(f.phone), devices: isNaN(n) ? null : n, message: t(f.message),
      ref: ref, ad_attribution: JSON.stringify(window.ZakshaAd.adParams(search)), website: f.website == null ? '' : String(f.website)
    };
  }

  // ?for= on an ad URL picks the hero, the form's segment and the default ref; an explicit ?ref= wins
  var AUDIENCES = {
    school: { ref: 'BIZ-SCH', hero: 'hero-school' },
    college: { ref: 'BIZ-COL', hero: 'hero-college' },
    team: { ref: 'BIZ-TEAM', hero: 'hero-team' }
  };
  function audienceFor(search) {
    var q = new URLSearchParams(search), a = Object.prototype.hasOwnProperty.call(AUDIENCES, q.get('for')) && AUDIENCES[q.get('for')];
    if (!a) return { segment: '', ref: '', hero: 'hero-default' };
    return { segment: q.get('for'), ref: q.get('ref') || a.ref, hero: a.hero };
  }

  // status null = the request never got an answer
  function classify(status, body) {
    body = body || {};
    if (status === 201 || status === 202) return { kind: 'success' };
    if (status === 429) return { kind: 'rate_limited', message: 'Too many attempts, please WhatsApp us.' };
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

  var api = { buildPayload: buildPayload, classify: classify, send: send, audienceFor: audienceFor };
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
    function say(text, withWa) {
      status.textContent = text + ' ';
      if (withWa) {
        var a = document.createElement('a');
        a.href = WA; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'WhatsApp +91 89194 68618';
        status.appendChild(a);
      }
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearErrors();
      var f = {};
      new FormData(form).forEach(function (v, k) { f[k] = v; });
      btn.disabled = true;
      send(form.dataset.endpoint, buildPayload(f, location.search), window.fetch.bind(window)).then(function (r) {
        btn.disabled = false;
        if (r.kind === 'success') {
          var done = document.createElement('div');
          done.className = 'lead-form lead-form--done';
          done.setAttribute('role', 'status');
          done.textContent = "Thanks. We'll call you within one working day. ";
          var a = document.createElement('a');
          a.href = WA; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Or WhatsApp us now';
          done.appendChild(a);
          form.replaceWith(done);
        } else if (r.kind === 'field_error' && r.field && form.elements[r.field]) {
          var el = form.elements[r.field];
          var msg = document.createElement('span');
          msg.className = 'lead-form__err'; msg.setAttribute('role', 'alert'); msg.textContent = r.message;
          el.insertAdjacentElement('afterend', msg);
          el.focus();
        } else {
          say(r.message, r.kind !== 'field_error');
        }
      });
    });
  }
  if (typeof document !== 'undefined') {
    var init = function () { document.querySelectorAll('form.lead-form').forEach(wire); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
