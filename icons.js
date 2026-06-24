/* ════════════════════════════════════════════════════════════════
   Zaksha — inline SVG icon system for the marketing site.
   Reuses the app's line-icon language (24×24, stroke=currentColor),
   extended with the icons the site needs. Hydrates the existing
   <i class="ph ... ph-NAME"> markup in place — no webfont, so icons
   render in screenshots, PDF export and offline bundles too.
   ════════════════════════════════════════════════════════════════ */
(function () {
  // line icons: stroke inherits from the wrapper (fill:none, stroke:currentColor)
  var I = {
    'arrow-right': '<path d="M5 12h14M13 5l7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5M11 5l-7 7 7 7"/>',
    'caret-right': '<path d="M9 6l6 6-6 6"/>',
    'caret-down': '<path d="M6 9l6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>',
    'warning-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/>',
    warning: '<path d="M10.3 4.3 2 18.3A2 2 0 0 0 3.7 21h16.6a2 2 0 0 0 1.7-2.7L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.5M12 17.5h.01"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    'house-line': '<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V19h12V9.5"/><path d="M4 21h16"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12.5h18"/>',
    'graduation-cap': '<path d="M2 9l10-4 10 4-10 4-10-4z"/><path d="M6 11v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5V11"/><path d="M22 9v5"/>',
    books: '<path d="M5 4h4v16H5zM9 4h4v16H9z"/><path d="M14.5 4.6l3.9 1 3.1 14.8-3.9-1z"/>',
    'moon-stars': '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/><path d="M18 4l.6 1.6L20 6l-1.4.4L18 8l-.6-1.6L16 6l1.4-.4z"/>',
    'eye-slash': '<path d="M9.6 5.2A9.6 9.6 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-2.4 3.1M6 6.8A15 15 0 0 0 3 12s3.5 7 9 7a9 9 0 0 0 3.3-.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/>',
    'chats-circle': '<path d="M8.5 14H6l-3 3V7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v0"/><path d="M11 11a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9l-3-3h-5a2 2 0 0 1-2-2z"/>',
    buildings: '<path d="M3 21V8l7-3v16M10 21V3l11 4v14M3 21h18"/><path d="M6 11h.01M6 15h.01M14 9h.01M17 9h.01M14 13h.01M17 13h.01M14 17h.01M17 17h.01"/>',
    'chart-bar': '<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/>',
    exam: '<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v4h4"/><path d="M8 12l2 2 3.5-3.5"/><path d="M8 17h6"/>',
    'hard-drives': '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/>',
    'calendar-check': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M9 14.5l2 2 4-4"/>',
    'calendar-dots': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/>',
    'calendar-blank': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    'clock-afternoon': '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/><path d="M3 20h18"/>',
    'clock-counter-clockwise': '<path d="M3 5v5h5"/><path d="M3.5 10a9 9 0 1 1-1 5.5"/><path d="M12 8v4l3 2"/>',
    broadcast: '<circle cx="12" cy="12" r="2.5"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M3.5 3.5a12 12 0 0 0 0 17M20.5 3.5a12 12 0 0 1 0 17"/>',
    'poker-chip': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    'game-controller': '<path d="M7 11h4M9 9v4M15.5 11h.01M18 13h.01" /><path d="M17.5 6H6.5a4 4 0 0 0-3.96 3.4L2 14a3 3 0 0 0 5.5 1.6h9A3 3 0 0 0 22 14l-.54-4.6A4 4 0 0 0 17.5 6z"/>',
    television: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/>',
    prohibit: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    'squares-four': '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    fingerprint: '<path d="M12 11v3a8 8 0 0 1-1.2 4.2"/><path d="M8.5 6.8a6 6 0 0 1 9.5 4.9v1.8M6 12a6 6 0 0 1 .8-3"/><path d="M12 11v2.5a11 11 0 0 1-1.7 6M15.5 12v1.5a14 14 0 0 1-.8 4.6M4.5 16.5A12 12 0 0 0 5 12a7 7 0 0 1 .3-2"/>',
    'device-mobile-camera': '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 5h.01M10 18.5h4"/>',
    faders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1.5 14h5M9.5 8h5M17.5 16h5"/>',
    'faders-horizontal': '<path d="M3 6h9M16 6h5M3 12h3M10 12h11M3 18h13M20 18h1"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17.5 9.5 4.25 4.25 0 0 1 17 18z"/>',
    'lock-key': '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.4"/><path d="M12 16.4V18"/>',
    'seal-check': '<path d="M12 2.5l2.3 1.8 2.9-.2 1 2.7 2.4 1.6-.8 2.8.8 2.8-2.4 1.6-1 2.7-2.9-.2L12 21.5l-2.3-1.8-2.9.2-1-2.7L3.4 15.6l.8-2.8-.8-2.8 2.4-1.6 1-2.7 2.9.2z"/><path d="M9 12l2 2 4-4"/>',
    scales: '<path d="M12 3v18M7 21h10M12 5l-7 2 7-2 7 2-7-2z"/><path d="M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zM19 7l-2.5 6a3 3 0 0 0 5 0L19 7z"/>',
    'file-text': '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v6h6M16 13H8M16 17H8M10 9H8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    'desktop': '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    'wifi-high': '<path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M2 9.5a15 15 0 0 1 20 0M12 19h.01"/>',
    // solid marks (own fill)
    'cell-signal-full': '<g fill="currentColor" stroke="none"><rect x="2" y="16" width="3" height="5" rx=".6"/><rect x="7" y="12.5" width="3" height="8.5" rx=".6"/><rect x="12" y="8.5" width="3" height="12.5" rx=".6"/><rect x="17" y="4" width="3" height="17" rx=".6"/></g>',
    'battery-high': '<rect x="2" y="7" width="18" height="10" rx="2.5"/><path d="M22 10.5v3" stroke-width="2.4"/><rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none"/>',
    'apple-logo': '<g fill="currentColor" stroke="none"><path d="M16.4 12.6c0-2.3 1.8-3.4 1.9-3.5-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.8-3.6 2.1-1.5 2.7-.4 6.6 1.1 8.8.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7c1.1 0 1.9-1 2.6-2 .8-1.2 1.2-2.3 1.2-2.4-.1 0-2.2-.9-2.2-3.3z"/><path d="M14.3 6c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2z"/></g>',
    'android-logo': '<g fill="currentColor" stroke="none"><path d="M5 11h14a1 1 0 0 1 1 1v5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 17v-5a1 1 0 0 1 1-1z"/><rect x="4" y="13" width="2.4" height="6" rx="1.2"/><rect x="17.6" y="13" width="2.4" height="6" rx="1.2"/><rect x="8" y="18" width="2.4" height="4.5" rx="1.2"/><rect x="13.6" y="18" width="2.4" height="4.5" rx="1.2"/><path d="M7 10a5 5 0 0 1 10 0z"/></g><path d="M8.5 4.2 7.4 2.6M15.5 4.2l1.1-1.6" stroke-width="1.6"/><circle cx="9.5" cy="7.5" r=".7" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7.5" r=".7" fill="currentColor" stroke="none"/>',
    'windows-logo': '<g fill="currentColor" stroke="none"><path d="M3 5.6 11 4.5v7H3zM13 4.2 21 3v8.5h-8zM3 13h8v7l-8-1.1zM13 13h8v8l-8-1.1z"/></g>',
    'linux-logo': '<g fill="currentColor" stroke="none"><path d="M12 2.2c-2.1 0-3.6 1.6-3.6 3.9 0 .8.1 1.5.1 2.2 0 1.1-1.5 2.6-2.4 4.5-.9 1.9-1.6 3.4-1.3 4.4.2.7.8.8 1.4.6.3 1.1 1.1 2 2.2 2.6 1 .6 2.2.9 3.6.9s2.6-.3 3.6-.9c1.1-.6 1.9-1.5 2.2-2.6.6.2 1.2.1 1.4-.6.3-1-.4-2.5-1.3-4.4-.9-1.9-2.4-3.4-2.4-4.5 0-.7.1-1.4.1-2.2 0-2.3-1.5-3.9-3.6-3.9z"/><ellipse cx="9.6" cy="21.3" rx="1.6" ry=".8"/><ellipse cx="14.4" cy="21.3" rx="1.6" ry=".8"/></g><g fill="#ffffff" stroke="none"><circle cx="10.5" cy="6.7" r=".95"/><circle cx="13.5" cy="6.7" r=".95"/></g><g fill="currentColor" stroke="none"><circle cx="10.6" cy="6.8" r=".4"/><circle cx="13.4" cy="6.8" r=".4"/><path d="M11.1 8.2 12 9.1l.9-.9z"/></g>',
    'monitor-check': '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m8.4 10.4 2.2 2.2 4.4-4.4"/>',
    'map-pin': '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'
  };
  // aliases (Phosphor name → existing key)
  var ALIAS = {
    'sliders-horizontal': 'faders-horizontal',
    'arrow-up-right': 'arrow-right',
    'caret-up': 'caret-down'
  };

  function svg(name) {
    var key = ALIAS[name] || name;
    var inner = I[key];
    if (inner == null) { return ''; }
    return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'style="display:inline-block;vertical-align:-0.14em;flex:0 0 auto">' + inner + '</svg>';
  }

  function nameFrom(el) {
    var cls = el.className || '';
    var parts = cls.split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.indexOf('ph-') === 0 && p !== 'ph-fill' && p !== 'ph-duotone' && p !== 'ph-bold' && p !== 'ph-thin' && p !== 'ph-light') {
        return p.slice(3);
      }
    }
    return null;
  }

  function hydrate(root) {
    (root || document).querySelectorAll('i[class*="ph-"]').forEach(function (el) {
      if (el.dataset.icDone) return;
      var name = nameFrom(el);
      if (!name) return;
      var markup = svg(name);
      if (markup) { el.innerHTML = markup; el.dataset.icDone = '1'; el.dataset.icName = name; }
      else if (!I[name]) {
        // graceful fallback: a neutral dot so layout never collapses, and a console hint
        el.innerHTML = svg('check-circle');
        el.dataset.icDone = '1';
        if (window.console) console.warn('[zaksha icons] missing icon:', name);
      }
    });
  }

  window.ZakshaIcons = { hydrate: hydrate, svg: svg, has: function (n) { return !!(I[ALIAS[n] || n]); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { hydrate(); });
  else hydrate();
})();
