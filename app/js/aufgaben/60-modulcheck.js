/* Modulcheck: zufällige, automatisch bewertbare Aufgaben → Prozentwert → bestanden ab Grenze */
(function () {
  var esc = LT.esc, icon = LT.icon;
  LT.CHECK_TYPEN = ['single-choice', 'multiple-choice', 'zuordnung', 'reihenfolge', 'lückentext', 'bildzuordnung'];
  var checkAufgaben = function (m) { return m.aufgaben.filter(function (a) { return LT.CHECK_TYPEN.indexOf(a.typ) >= 0; }); };

  LT.modus({
    id: 'check', titel: 'Modulcheck', icon: 'check',
    text: function (m) { return Math.min(LT.E.modulcheck_aufgaben, checkAufgaben(m).length) + ' gemischte Aufgaben – bestehe mit mindestens ' + LT.E.bestehensgrenze + ' %'; },
    verfuegbar: function (m) { return checkAufgaben(m).length > 0; }
  });

  /** Aprilscherz: nur am 1. April wird die Scherzfrage (falls vorhanden) vorne eingefügt */
  function aprilscherz() {
    var d = new Date(), f = LT.D.spiele && LT.D.spiele.aprilscherz;
    return d.getMonth() === 3 && d.getDate() === 1 && f ? f : null;
  }

  LT.route(/^\/modul\/([^/]+)\/check$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    LT.modulKontext(m.id);
    var liste = LT.ziehen(checkAufgaben(m), LT.E.modulcheck_aufgaben).map(function (a) { return { a: a, modulId: m.id }; });
    var scherz = aprilscherz();
    if (scherz) liste.unshift({ a: scherz, modulId: m.id, scherz: true });
    var richtigeXp = 0;
    LT.sitzung({
      titel: 'Modulcheck: ' + m.titel, eyebrow: 'Bestehen ab ' + LT.E.bestehensgrenze + ' %',
      zurueck: { pfad: '/modul/' + m.id, text: m.titel }, liste: liste,
      nachAntwort: function (e, anteil) {
        if (e.scherz) { if (anteil >= 1) LT.S.aprilscherz = true; return; }
        if (anteil >= 1) richtigeXp += LT.xpDazu('richtige_aufgabe');
      },
      ende: function (erg) {
        var gewertet = erg.filter(function (e, i) { return !liste[i].scherz; });
        var summe = gewertet.reduce(function (s, e) { return s + e.anteil; }, 0);
        var prozent = Math.round(summe / gewertet.length * 100);
        var lauf = LT.laufBeenden(m.id, prozent);
        LT.speichern();
        LT.awardsPruefen();
        LT.ergebnisSeite({
          titel: lauf.bestanden ? 'Bestanden!' : 'Noch nicht bestanden', eyebrow: 'Modulcheck ' + m.titel,
          zurueck: { pfad: '/modul/' + m.id, text: m.titel },
          html: '<p class="prozent ' + (lauf.bestanden ? 'ok' : 'nein') + '">' + prozent + ' %</p>' +
            '<p>' + (lauf.bestanden
              ? (lauf.erstmals ? 'Stark! Du hast das Modul zum ersten Mal bestanden.' : 'Du hast das Modul erneut bestanden.')
              : 'Du brauchst mindestens ' + LT.E.bestehensgrenze + ' %. Schau dir die Aufgaben unten noch einmal an und versuch es erneut.') + '</p>' +
            '<p class="chip gold">+' + (richtigeXp + lauf.xp) + ' XP</p>' + LT.sichernErinnerung(),
          falsch: gewertet.filter(function (e) { return e.anteil < 1; }),
          knoepfe: '<a class="btn primaer" href="#/modul/' + esc(m.id) + '">Zurück zum Modul</a>' +
            '<button class="btn" type="button" onclick="LT.gehe(\'/modul/' + esc(m.id) + '/check\')">Neuer Durchgang</button>'
        });
      }
    });
  }, 'start');
})();
