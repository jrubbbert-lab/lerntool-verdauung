/* Router: #/pfad → Ansicht. Andere Dateien melden Ansichten mit LT.route(muster, funktion, nav) an. */
(function () {
  var esc = LT.esc, icon = LT.icon;

  /* ---------- Router ---------- */
  LT.routen = [];
  LT.route = function (muster, ansicht, nav) { LT.routen.push({ muster: muster, ansicht: ansicht, nav: nav || 'start' }); };
  LT.gehe = function (pfad) { if (location.hash === '#' + pfad) LT.navigieren(); else location.hash = pfad; };
  LT.aufraeumen = null;  // Funktion, die beim Verlassen einer Ansicht läuft (z. B. Timer stoppen)

  LT.navigieren = function () {
    if (LT.aufraeumen) { try { LT.aufraeumen(); } catch (e) { /* weiter */ } LT.aufraeumen = null; }
    LT.dialogZu();
    var pfad = (location.hash || '#/').slice(1) || '/';
    if (!LT.S.form && ['/datenschutz', '/mehr/laden'].indexOf(pfad) < 0) pfad = '/willkommen';
    for (var i = 0; i < LT.routen.length; i++) {
      var m = LT.routen[i].muster.exec(pfad);
      if (m) {
        LT.$$('.leiste a').forEach(function (a) {
          if (a.getAttribute('data-nav') === LT.routen[i].nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        LT.routen[i].ansicht.apply(null, m.slice(1).map(decodeURIComponent));
        LT.kopfAktualisieren();
        var h1 = LT.$('#haupt h1');
        LT.$('#haupt').focus({ preventScroll: true });
        window.scrollTo(0, 0);
        document.title = h1 && h1.textContent !== 'Verdauung lernen' ? h1.textContent + ' · Verdauung lernen' : 'Verdauung lernen';
        return;
      }
    }
    LT.gehe('/');
  };

  LT.zeige = function (html) { LT.$('#haupt').innerHTML = html; return LT.$('#haupt'); };

  LT.kopfAktualisieren = function () {
    var r = LT.rang();
    LT.$('#rang-chip').innerHTML = LT.S.form ? '<b>' + esc(r.name) + '</b><span class="xpz">' + LT.zahl(LT.S.xp) + ' XP</span>' : '';
  };

  LT.seitenkopf = function (titel, zurueck, eyebrow) {
    return '<div class="seitenkopf">' +
      (zurueck ? '<a class="zurueck" href="#' + zurueck.pfad + '">' + icon('zurueck') + esc(zurueck.text) + '</a>' : '') +
      (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') + '<h1>' + titel + '</h1></div>';
  };

  /* Übungsmodi einer Modulseite: {id, titel, text, icon, verfuegbar(m)} */
  LT.modi = [];  // wird von den Aufgabentypen gefüllt: {id, titel, text, icon, verfuegbar(m)}
  LT.modus = function (def) { LT.modi.push(def); };
})();
