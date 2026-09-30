/* Hilfsfunktionen, die überall gebraucht werden. Alles hängt am Namensraum LT. */
'use strict';
var LT = window.LT = {};
LT.D = window.INHALT;

LT.$ = function (sel, wurzel) { return (wurzel || document).querySelector(sel); };
LT.$$ = function (sel, wurzel) { return Array.prototype.slice.call((wurzel || document).querySelectorAll(sel)); };

/** HTML-sicher machen */
LT.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

/** Zufällige Reihenfolge (Fisher-Yates), gibt eine Kopie zurück */
LT.mischen = function (arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
};

/** Datumshilfen – alles in lokaler Gerätezeit */
LT.jetzt = function () { return new Date(); };
LT.iso = function (d) { return (d || new Date()).toISOString(); };
LT.tag = function (d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
LT.datum = function (iso) { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
LT.uhrzeit = function (iso) { return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); };
LT.zahl = function (n) { return Number(n).toLocaleString('de-DE'); };

/** Einfacher, schneller 53-Bit-Hash (cyrb53). Kein Krypto – reicht gegen Handänderungen. */
LT.hash = function (str, seed) {
  var h1 = 0xdeadbeef ^ (seed || 0), h2 = 0x41c6ce57 ^ (seed || 0);
  for (var i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
};

/** Screenreader-Ansage */
LT.ansage = function (text) {
  var el = LT.$('#ansage');
  el.textContent = '';
  setTimeout(function () { el.textContent = text; }, 30);
};

LT.bewegungReduziert = function () {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/* ---------------------------------------------------------------------------
   Icons (24×24, Linien). Eigene Zeichnungen – keine Bildrechte nötig.
--------------------------------------------------------------------------- */
LT.ICONS = {
  haus: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  pokal: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 20h8M9 20l1-3h4l1 3"/>',
  buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  menue: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sonne: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  mond: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  zurueck: '<path d="M15 5l-7 7 7 7"/>',
  weiter: '<path d="M9 5l7 7-7 7"/>',
  schloss: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  haken: '<path d="M4 12l5 5L20 6"/>',
  kreuz: '<path d="M6 6l12 12M18 6L6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 19h14"/>',
  upload: '<path d="M12 16V5M7 10l5-5 5 5"/><path d="M5 19h14"/>',
  auge: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  schild_ds: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  hoch: '<path d="M6 15l6-6 6 6"/>',
  runter: '<path d="M6 9l6 6 6-6"/>',
  stern: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  /* Module */
  ernaehrung: '<path d="M12 7c-3-3-8-1-8 4 0 5 4 10 8 9 4 1 8-4 8-9 0-5-5-7-8-4z"/><path d="M12 7c0-2 1-4 3-4"/>',
  verdauungstrakt: '<path d="M12 2v5c0 2-4 2-4 5 0 2 2 3 4 3s5 1 5 3-3 3-5 3-4 1-4 1"/><circle cx="12" cy="3" r="1"/>',
  mund: '<path d="M3 11c3 4 15 4 18 0"/><path d="M3 11c3-2 6-2 9 0 3-2 6-2 9 0"/><path d="M8 14v2M12 15v2M16 14v2"/>',
  magen: '<path d="M9 3v4c0 2-4 3-4 8a6 6 0 0 0 11 3c1-2 3-2 4-1"/><path d="M9 7c3 0 6 1 6 4"/>',
  darm: '<path d="M5 5h14v4H7v4h12v4H5"/><path d="M5 17v3"/>',
  pankreas: '<path d="M3 13c2-4 6-5 9-4s7 0 9-2c0 5-4 8-9 8-3 0-5 1-7 3-2-1-3-3-2-5z"/>',
  leber: '<path d="M3 9c3-3 10-4 18-2-1 6-5 11-11 11-4 0-7-4-7-9z"/><path d="M13 7v9"/>',
  enzym: '<path d="M4 12a6 6 0 0 1 10-4.5L10 12l4 4.5A6 6 0 0 1 4 12z"/><circle cx="18" cy="12" r="3"/>',
  /* Übungsmodi */
  karten: '<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v10"/>',
  check: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8l1.5 1.5L12 7M8 14l1.5 1.5L12 13M14 8h3M14 14h3"/>',
  stift: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  blitz: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  lupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  bild: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  broetchen: '<path d="M3 15c0-5 4-9 9-9s9 4 9 9v1H3z"/><path d="M8 10l2 3M12 9v4M16 10l-2 3"/>',
  fehler: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
  wiederholen: '<path d="M4 12a8 8 0 0 1 14-5l2 2"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M4 20v-5h5"/>',
  /* Awards */
  skalpell: '<path d="M4 20l9-9"/><path d="M13 11l6-6c1 3 0 6-3 8z"/>',
  stethoskop: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>',
  klinge: '<path d="M5 19L17 7c2-2 3 1 2 2L9 19z"/><path d="M11 13l2 2"/>',
  pfeil: '<path d="M4 18l6-6 4 4 6-8"/><path d="M15 8h5v5"/>',
  kalender: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M8 14h2M12 14h2M16 14h0"/>',
  aehre: '<path d="M12 21V8"/><path d="M12 8c-3 0-4-2-4-4 3 0 4 2 4 4zM12 8c3 0 4-2 4-4-3 0-4 2-4 4z"/><path d="M12 13c-3 0-4-2-4-4 3 0 4 2 4 4zM12 13c3 0 4-2 4-4-3 0-4 2-4 4z"/>',
  tropfen: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/>',
  krone: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  spritze: '<path d="M14 4l6 6M17 7l-9 9-3 1 1-3 9-9M4 20l2-2M11 10l3 3"/>',
  tor: '<path d="M4 21V10a8 8 0 0 1 16 0v11"/><path d="M8 21v-9a4 4 0 0 1 8 0v9"/>',
  kreislauf: '<path d="M4 12a8 8 0 0 1 13-6"/><path d="M17 2v4h-4"/><path d="M20 12a8 8 0 0 1-13 6"/><path d="M7 22v-4h4"/>',
  zahn: '<path d="M7 3c-3 0-4 3-3 6l2 11c.5 1 2 1 2.5 0L10 14h4l1.5 6c.5 1 2 1 2.5 0l2-11c1-3 0-6-3-6-2 0-3 1-5 1S9 3 7 3z"/>',
  welle: '<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M2 17c2-4 4-4 6 0s4 4 6 0 4-4 6 0" opacity=".5"/>',
  mikrovilli: '<path d="M4 20h16"/><path d="M6 20V9a1 1 0 0 1 2 0v11M10 20V6a1 1 0 0 1 2 0v14M14 20V8a1 1 0 0 1 2 0v12M18 20v-9"/>',
  kleeblatt: '<circle cx="9" cy="9" r="3"/><circle cx="15" cy="9" r="3"/><circle cx="9" cy="15" r="3"/><circle cx="15" cy="15" r="3"/><path d="M15 15l5 6"/>',
  narr: '<path d="M4 18l2-10 6 4 6-4 2 10z"/><circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="12" cy="9" r="1.5"/>'
};

LT.icon = function (name, klasse) {
  return '<svg class="' + (klasse || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (LT.ICONS[name] || LT.ICONS.stern) + '</svg>';
};
