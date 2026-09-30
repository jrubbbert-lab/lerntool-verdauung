/* Karteikarten mit Leitner-System (5 Fächer).
   Gewusst → ein Fach weiter. Nicht gewusst → zurück in Fach 1.
   Karten eines Fachs sind erst nach einer Pause wieder dran (Fach 1: sofort … Fach 5: 14 Tage). */
(function () {
  var esc = LT.esc, icon = LT.icon;
  var PAUSE_TAGE = [0, 1, 3, 7, 14];   // Index = Fach − 1
  var PRO_RUNDE = 15;

  function fach(id) { return (LT.S.leitner[id] && LT.S.leitner[id].f) || 1; }
  function faellig(id) {
    var k = LT.S.leitner[id];
    if (!k) return true;
    var tage = (new Date(LT.tag()) - new Date(k.t)) / 864e5;
    return tage >= PAUSE_TAGE[k.f - 1];
  }
  function faecher(m) {
    var z = [0, 0, 0, 0, 0];
    m.karten.forEach(function (k) { z[fach(k.id) - 1]++; });
    return z;
  }
  function faecherHtml(m) {
    return '<div class="faecher" aria-label="Karten pro Fach">' + faecher(m).map(function (n, i) {
      return '<div class="fach"><span class="muted klein">Fach ' + (i + 1) + '</span><b>' + n + '</b></div>';
    }).join('') + '</div>';
  }

  LT.modus({
    id: 'karten', titel: 'Karteikarten', icon: 'karten',
    text: function (m) {
      var n = m.karten.filter(function (k) { return faellig(k.id); }).length;
      return m.karten.length + ' Karten · ' + (n ? n + ' heute dran' : 'heute alles gelernt');
    },
    verfuegbar: function (m) { return m.karten.length > 0; }
  });

  LT.route(/^\/modul\/([^/]+)\/karten$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    LT.modulKontext(m.id);
    var dran = LT.mischen(m.karten.filter(function (k) { return faellig(k.id); }))
      .sort(function (a, b) { return fach(a.id) - fach(b.id); }).slice(0, PRO_RUNDE);
    var extra = !dran.length;
    if (extra) dran = LT.mischen(m.karten).sort(function (a, b) { return fach(a.id) - fach(b.id); }).slice(0, PRO_RUNDE);
    var i = 0, gewusst = 0, xp = 0;
    var h = LT.zeige(LT.seitenkopf('Karteikarten: ' + esc(m.titel), { pfad: '/modul/' + m.id, text: m.titel }, 'Leitner-System') +
      (extra ? '<p class="hinweis">Heute ist keine Karte fällig. Du kannst trotzdem freiwillig wiederholen.</p>' : '') +
      '<div id="faecher">' + faecherHtml(m) + '</div><div id="karte"></div>');

    function zeigen() {
      if (i >= dran.length) return ende();
      var k = dran[i];
      LT.$('#karte', h).innerHTML =
        '<section class="karte stapel kk" aria-labelledby="kk-t"><div class="reihe zw"><span class="eyebrow" id="kk-t">Karte ' + (i + 1) + ' von ' + dran.length + '</span>' +
        '<span class="chip">Fach ' + fach(k.id) + '</span></div>' +
        '<div class="kk-seite"><p class="eyebrow">Frage</p><div class="kk-text">' + LT.absaetze(k.vorne) + '</div></div>' +
        '<div class="kk-seite kk-hinten" hidden><p class="eyebrow">Antwort</p><div class="kk-text">' + LT.absaetze(k.hinten) + '</div>' + LT.liesNach(k.quelle) + '</div>' +
        '<div class="reihe" data-vorne><button class="btn primaer" type="button" data-umdrehen>Umdrehen</button></div>' +
        '<div class="reihe" data-hinten hidden><button class="btn primaer" type="button" data-ja>' + icon('haken') + 'Gewusst</button>' +
        '<button class="btn" type="button" data-nein>' + icon('kreuz') + 'Nicht gewusst</button></div></section>';
      var karte = LT.$('.kk', h);
      LT.$('[data-umdrehen]', karte).focus({ preventScroll: true });
      LT.$('[data-umdrehen]', karte).addEventListener('click', function () {
        LT.$('.kk-hinten', karte).hidden = false;
        LT.$('[data-vorne]', karte).hidden = true;
        LT.$('[data-hinten]', karte).hidden = false;
        LT.$('[data-ja]', karte).focus({ preventScroll: true });
      });
      LT.$('[data-ja]', karte).addEventListener('click', function () { bewerten(k, true); });
      LT.$('[data-nein]', karte).addEventListener('click', function () { bewerten(k, false); });
    }

    function bewerten(k, ok) {
      var alt = fach(k.id);
      var neu = ok ? Math.min(5, alt + 1) : 1;
      LT.S.leitner[k.id] = { f: neu, t: LT.tag() };
      if (ok) { gewusst++; if (neu > alt) xp += LT.xpDazu('karte_weiter'); }
      LT.uebungstag();
      LT.speichern();
      LT.ansage(ok ? 'Gewusst. Jetzt in Fach ' + neu + '.' : 'Zurück in Fach 1.');
      LT.$('#faecher', h).innerHTML = faecherHtml(m);
      LT.kopfAktualisieren();
      i++;
      zeigen();
    }

    function ende() {
      LT.awardsPruefen();
      LT.ergebnisSeite({
        titel: 'Runde geschafft', eyebrow: 'Karteikarten ' + m.titel, zurueck: { pfad: '/modul/' + m.id, text: m.titel },
        html: '<p class="prozent">' + gewusst + ' / ' + dran.length + '</p><p>Karten gewusst.</p>' + faecherHtml(m) +
          (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : ''),
        knoepfe: '<a class="btn primaer" href="#/modul/' + esc(m.id) + '">Zurück zum Modul</a>'
      });
    }
    zeigen();
  }, 'start');
})();
