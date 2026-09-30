/* Fortschritt: XP, Ränge, bestandene Module, Freischaltung */
(function () {
  var E = LT.E = LT.D.einstellungen;

  LT.form = function () { return LT.S.form || 'n'; };

  /** Aktueller Rang, nächster Rang und Fortschritt dazwischen (0–1) */
  LT.rang = function (xp) {
    xp = xp == null ? LT.S.xp : xp;
    var r = E.raenge, i = 0;
    while (i + 1 < r.length && xp >= r[i + 1].xp) i++;
    var naechster = r[i + 1] || null;
    var anteil = naechster ? (xp - r[i].xp) / (naechster.xp - r[i].xp) : 1;
    return { stufe: i, name: r[i][LT.form()], naechster: naechster && naechster[LT.form()], naechsterXp: naechster && naechster.xp, anteil: anteil };
  };

  /** XP gutschreiben. aktion = Name aus einstellungen.md (xp:) */
  LT.xpDazu = function (aktion, anzahl) {
    var n = (E.xp[aktion] || 0) * (anzahl == null ? 1 : anzahl);
    LT.S.xp += Math.round(n);
    return Math.round(n);
  };

  LT.modul = function (id) {
    for (var i = 0; i < LT.D.module.length; i++) if (LT.D.module[i].id === id) return LT.D.module[i];
    return null;
  };
  LT.moduleImBlock = function (nr) { return LT.D.module.filter(function (m) { return m.block === nr; }); };
  LT.blockTitel = function (nr) {
    var b = E.bloecke.filter(function (x) { return x.nr === nr; })[0];
    return b ? b.titel : 'Block ' + nr;
  };

  LT.laeufeVon = function (id) { return LT.S.laeufe.filter(function (l) { return l.m === id; }); };
  LT.bestes = function (id) {
    return LT.laeufeVon(id).reduce(function (a, l) { return Math.max(a, l.p); }, -1);
  };
  LT.bestanden = function (id) { return LT.bestes(id) >= E.bestehensgrenze; };

  /** Block 1 ist immer offen. Jeder weitere öffnet sich, wenn alle VORHANDENEN Module
      (Status aktiv) des vorherigen Blocks bestanden sind. */
  LT.blockOffen = function (nr) {
    if (nr <= 1) return true;
    if (!LT.blockOffen(nr - 1)) return false;
    return LT.moduleImBlock(nr - 1).every(function (m) { return m.status !== 'aktiv' || LT.bestanden(m.id); });
  };

  /** Organmodule, die für eine Erkrankung noch fehlen */
  LT.fehlendeOrgane = function (m) {
    if (!m.organ) return [];
    return m.organ.split(',').map(function (s) { return s.trim(); })
      .filter(function (id) { return !LT.bestanden(id); })
      .map(function (id) { var o = LT.modul(id); return o ? o.titel : id; });
  };

  LT.modulOffen = function (m) {
    return m.status === 'aktiv' && LT.blockOffen(m.block) && LT.fehlendeOrgane(m).length === 0;
  };

  /** Heute als Übungstag vermerken */
  LT.uebungstag = function () {
    var t = LT.tag();
    if (LT.S.tage.indexOf(t) < 0) { LT.S.tage.push(t); if (LT.S.tage.length > 400) LT.S.tage.shift(); }
  };

  /** Nach jeder bewerteten Aufgabe aufrufen. anteil: 0–1 (1 = vollständig richtig). */
  LT.antwortErfassen = function (aufgabe, modulId, anteil) {
    var richtig = anteil >= 1;
    LT.uebungstag();
    if (richtig) {
      LT.S.serie += 1;
      LT.S.serieMax = Math.max(LT.S.serieMax, LT.S.serie);
      delete LT.S.falsch[aufgabe.id];
    } else {
      LT.S.serie = 0;
      LT.S.falsch[aufgabe.id] = modulId;
    }
    if (aufgabe.typ === 'reihenfolge' && richtig) LT.S.reihenfolgeOk += 1;
    return richtig;
  };

  /** Modulcheck abschließen. Liefert {prozent, bestanden, erstmals, xp} */
  LT.laufBeenden = function (modulId, prozent) {
    var warBestanden = LT.bestanden(modulId);
    LT.S.laeufe.push({ m: modulId, t: LT.iso(), p: prozent });
    var bestanden = prozent >= E.bestehensgrenze;
    var xp = 0;
    if (bestanden) xp += LT.xpDazu(warBestanden ? 'modul_bestanden' : 'modul_erstmals_bestanden');
    return { prozent: prozent, bestanden: bestanden, erstmals: bestanden && !warBestanden, xp: xp };
  };

  /** Längste Serie aufeinanderfolgender Übungstage */
  LT.laengsteTagesserie = function () {
    var tage = LT.S.tage.slice().sort(), best = 0, lauf = 0, vorher = null;
    tage.forEach(function (t) {
      var d = new Date(t + 'T12:00:00');
      lauf = (vorher && Math.round((d - vorher) / 864e5) === 1) ? lauf + 1 : 1;
      best = Math.max(best, lauf);
      vorher = d;
    });
    return best;
  };
})();
