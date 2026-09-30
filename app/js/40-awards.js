/* Awards: Regeln, Plakettengrafik, Prüfung, Animation.
   Die Regeln stehen in inhalte/awards.md (Feld „regel:“). Jede Regel liefert
   {ok: erreicht?, f: Fortschritt 0–1}. Alles wird nur auf dem Gerät geprüft. */
(function () {
  var S = function () { return LT.S; };
  var grenze = function () { return LT.E.bestehensgrenze; };
  var anteil = function (ist, soll) { return Math.max(0, Math.min(1, soll ? ist / soll : 0)); };
  var stunde = function (l) { return new Date(l.t).getHours(); };

  function alleOperatoren() {
    var liste = [];
    LT.D.module.forEach(function (m) { m.operatoren.forEach(function (o) { liste.push(o); }); });
    return liste;
  }

  var REGELN = {
    modul_uhrzeit: function (von, bis) {
      var ok = S().laeufe.some(function (l) { var h = stunde(l); return h >= +von && h < +bis; });
      return { ok: ok, f: ok ? 1 : 0 };
    },
    operatoren_afb: function (afb) {
      var ops = alleOperatoren().filter(function (o) { return o.afb === afb; });
      var geschafft = ops.filter(function (o) { return S().operatoren[o.id]; }).length;
      return { ok: ops.length > 0 && geschafft === ops.length, f: anteil(geschafft, ops.length) };
    },
    modul_mehrfach: function (ids, anzahl, prozent) {
      var teile = ids.split(',').map(function (id) {
        return Math.min(+anzahl, LT.laeufeVon(id).filter(function (l) { return l.p >= +prozent; }).length);
      });
      var summe = teile.reduce(function (a, b) { return a + b; }, 0);
      return { ok: teile.every(function (n) { return n >= +anzahl; }), f: anteil(summe, teile.length * anzahl) };
    },
    bloecke_bestanden: function (nr) {
      var ms = LT.moduleImBlock(+nr);  // ALLE Module des Blocks, auch die in Vorbereitung
      var n = ms.filter(function (m) { return LT.bestanden(m.id); }).length;
      return { ok: ms.length > 0 && n === ms.length, f: anteil(n, ms.length) };
    },
    serie_richtig: function (n) { return { ok: S().serieMax >= +n, f: anteil(S().serieMax, +n) }; },
    verbesserung: function (pp) {
      var best = 0;
      LT.D.module.forEach(function (m) {
        var min = Infinity;
        LT.laeufeVon(m.id).forEach(function (l) { best = Math.max(best, l.p - min); min = Math.min(min, l.p); });
      });
      return { ok: best >= +pp, f: anteil(best, +pp) };
    },
    tage_in_folge: function (n) { var t = LT.laengsteTagesserie(); return { ok: t >= +n, f: anteil(t, +n) }; },
    unter_dann_ueber: function (unter, ueber) {
      var ok = LT.D.module.some(function (m) {
        var tief = false;
        return LT.laeufeVon(m.id).some(function (l) { if (tief && l.p > +ueber) return true; if (l.p < +unter) tief = true; return false; });
      });
      return { ok: ok, f: ok ? 1 : 0 };
    },
    modul_prozent: function (id, p) { var b = LT.bestes(id); return { ok: b >= +p, f: anteil(Math.max(b, 0), +p) }; },
    enzym_punkte: function (n) { return { ok: S().enzymBest >= +n, f: anteil(S().enzymBest, +n) }; },
    karten_fach5: function (n) {
      var k = Object.keys(S().leitner).filter(function (id) { return S().leitner[id].f >= 5; }).length;
      return { ok: k >= +n, f: anteil(k, +n) };
    },
    diagnosen: function (n) { return { ok: S().diagnosen.length >= +n, f: anteil(S().diagnosen.length, +n) }; },
    block_frei: function (nr) {
      // mindestens ein echt bestandenes Modul im Block davor – sonst wäre ein leerer Block „geschafft“
      var vorher = LT.moduleImBlock(+nr - 1).filter(function (m) { return m.status === 'aktiv'; });
      var n = vorher.filter(function (m) { return LT.bestanden(m.id); }).length;
      var ok = LT.blockOffen(+nr) && n > 0;
      return { ok: ok, f: ok ? 1 : anteil(n, vorher.length) };
    },
    modul_abschluesse: function (n) {
      var max = 0;
      LT.D.module.forEach(function (m) { max = Math.max(max, LT.laeufeVon(m.id).length); });
      return { ok: max >= +n, f: anteil(max, +n) };
    },
    reihenfolge_fehlerfrei: function (n) { return { ok: S().reihenfolgeOk >= +n, f: anteil(S().reihenfolgeOk, +n) }; },
    xp: function (n) { return { ok: S().xp >= +n, f: anteil(S().xp, +n) }; },
    quiz_serie: function (n) { return { ok: S().quizSerieMax >= +n, f: anteil(S().quizSerieMax, +n) }; },
    freitag13: function (p) {
      var ok = S().laeufe.some(function (l) { var d = new Date(l.t); return d.getDay() === 5 && d.getDate() === 13 && l.p >= +p; });
      return { ok: ok, f: ok ? 1 : 0 };
    },
    aprilscherz: function () { return { ok: !!S().aprilscherz, f: S().aprilscherz ? 1 : 0 }; }
  };

  LT.awardStand = function (a) {
    var fn = REGELN[a.regel[0]];
    if (!fn) return { ok: false, f: 0 };
    return fn.apply(null, a.regel.slice(1));
  };
  LT.awardName = function (a) { return a.name[LT.form()]; };

  /** Neue Awards vergeben. Liefert die Liste der neu erreichten Awards. */
  LT.neueAwards = [];
  LT.awardsPruefen = function () {
    var neu = [], weiter = true;
    while (weiter) {           // mehrfach, weil Award-XP weitere Awards auslösen kann
      weiter = false;
      LT.D.awards.forEach(function (a) {
        if (LT.S.awards[a.id]) return;
        if (LT.awardStand(a).ok) {
          LT.S.awards[a.id] = LT.iso();
          LT.xpDazu('award');
          neu.push(a); weiter = true;
        }
      });
    }
    LT.neueAwards = LT.neueAwards.concat(neu);
    LT.speichern();
    return neu;
  };

  /* ---------- Plakette als SVG (Stil der Garmin-Abzeichen) ---------- */
  var gid = 0;
  function formPfad(form) {
    var pkte = [], i, n, r1, r2, w;
    if (form === 'sechseck') {
      for (i = 0; i < 6; i++) { w = Math.PI / 3 * i - Math.PI / 2; pkte.push([60 + 56 * Math.cos(w), 60 + 56 * Math.sin(w)]); }
    } else if (form === 'zacken') {
      n = 16; r1 = 57; r2 = 49;
      for (i = 0; i < n * 2; i++) { w = Math.PI / n * i - Math.PI / 2; var r = i % 2 ? r2 : r1; pkte.push([60 + r * Math.cos(w), 60 + r * Math.sin(w)]); }
    } else if (form === 'schild') {
      return 'M60 4 L108 18 L108 58 C108 88 86 106 60 116 C34 106 12 88 12 58 L12 18 Z';
    } else {
      return null;
    }
    return 'M' + pkte.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z';
  }

  LT.plakette = function (a, klasse) {
    var id = 'pl' + (gid++), p = formPfad(a.form);
    var aussen = p ? '<path d="' + p + '" fill="url(#' + id + 'a)" stroke="url(#' + id + 'a)" stroke-width="4" stroke-linejoin="round"/>'
                   : '<circle cx="60" cy="60" r="57" fill="url(#' + id + 'a)"/>';
    return '<svg class="' + (klasse || 'plakette') + '" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a.farbe1 + '"/><stop offset="1" stop-color="' + a.farbe2 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a.farbe2 + '"/><stop offset="1" stop-color="' + a.farbe1 + '"/></linearGradient></defs>' +
      aussen +
      '<circle cx="60" cy="60" r="41" fill="url(#' + id + 'b)" stroke="rgba(255,255,255,.65)" stroke-width="2.5"/>' +
      '<circle cx="60" cy="60" r="36" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<path d="M26 50a35 35 0 0 1 68 0c-19-8-49-8-68 0z" fill="#fff" opacity=".15"/>' +
      '<g transform="translate(60 60) scale(1.9) translate(-12 -12)" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      (LT.ICONS[a.icon] || LT.ICONS.stern) + '</g></svg>';
  };

  /* ---------- Animation für neue Awards ---------- */
  LT.awardsFeiern = function (fertig) {
    var liste = LT.neueAwards.slice();
    LT.neueAwards = [];
    if (!liste.length) { if (fertig) fertig(); return; }
    var a = liste.shift();
    LT.neueAwards = liste;
    LT.dialog('Neuer Award!',
      '<div class="feier">' + LT.plakette(a, 'plakette gross') +
      '<h3>' + LT.esc(LT.awardName(a)) + '</h3>' +
      (a.fakt ? '<p class="fakt">' + LT.txt(a.fakt, { ohneKlammer: true }) + '</p>' + LT.liesNach(a.quelle) : '') +
      '<p class="chip gold">+' + LT.E.xp.award + ' XP</p></div>',
      [{ text: liste.length ? 'Nächster Award' : 'Weiter', klasse: 'primaer', aktion: function () { setTimeout(function () { LT.awardsFeiern(fertig); }, 50); } }]);
    LT.ansage('Neuer Award: ' + LT.awardName(a));
  };
})();
