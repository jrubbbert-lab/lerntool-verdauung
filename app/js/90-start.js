/* Start: Thema (hell/dunkel), Navigation, erste Anzeige */
(function () {
  var THEMA = 'verdauung-thema';
  function themaSetzen(t) {
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
    var dunkel = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var b = LT.$('#thema-btn');
    b.innerHTML = LT.icon(dunkel ? 'sonne' : 'mond');
    b.setAttribute('aria-label', dunkel ? 'Hellen Modus einschalten' : 'Dunklen Modus einschalten');
  }
  var gespeichert = null;
  try { gespeichert = localStorage.getItem(THEMA); } catch (e) { /* egal */ }
  themaSetzen(gespeichert);
  LT.$('#thema-btn').addEventListener('click', function () {
    var dunkel = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var neu = dunkel ? 'light' : 'dark';
    try { localStorage.setItem(THEMA, neu); } catch (e) { /* egal */ }
    themaSetzen(neu);
  });

  LT.$$('.leiste .ni').forEach(function (s) { s.innerHTML = LT.icon(s.getAttribute('data-icon')); });

  // Klick auf den abgedunkelten Hintergrund schließt den Dialog
  LT.$('#dialog').addEventListener('click', function (e) { if (e.target === this) LT.dialogZu(); });

  window.addEventListener('hashchange', LT.navigieren);
  LT.navigieren();
})();
