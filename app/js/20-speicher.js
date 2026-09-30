/* Speicher: localStorage + Spielstand-Datei. Es werden KEINE personenbezogenen Daten
   und KEINE Freitexte aus Operatoraufgaben gespeichert. */
(function () {
  var SCHLUESSEL = 'verdauung-lerntool';
  var FORMATVERSION = 1;
  // „Salz“ für die Prüfsumme. Schützt nur gegen Handänderungen in der Datei, nicht gegen
  // jemanden, der den Quelltext liest. Nicht ändern, sonst werden alte Dateien abgelehnt.
  var SALZ = 'PEBK-Verdauung-2026';

  function leer() {
    return {
      v: FORMATVERSION,
      form: null,            // 'w' | 'm' | 'n' – nur für die Anrede der Ränge und Awards
      xp: 0,
      erstellt: LT.iso(),
      geaendert: LT.iso(),
      laeufe: [],            // Modulchecks: {m: Modul-ID, t: Zeitpunkt, p: Prozent}
      leitner: {},           // Karten-ID → {f: Fach 1–5, t: Tag der letzten Wiederholung}
      falsch: {},            // Aufgaben-ID → Modul-ID („Meine Fehler“)
      awards: {},            // Award-ID → Zeitpunkt
      tage: [],              // Tage, an denen geübt wurde (JJJJ-MM-TT)
      serie: 0, serieMax: 0, // richtige Antworten in Folge
      quizSerieMax: 0,
      reihenfolgeOk: 0,      // fehlerfrei gelöste Reihenfolgeaufgaben
      operatoren: {},        // Operator-ID → Zeitpunkt des Bestehens (kein Text!)
      diagnosen: [],         // IDs richtig gelöster Diagnosefälle
      fehlerfahndung: {},    // Bericht-ID → Zeitpunkt der fehlerfreien Lösung
      enzymBest: 0,
      aprilscherz: false,
      gesichert: null,       // Zeitpunkt der letzten Sicherung als Datei
      rangGesehen: 0         // höchste Rangstufe, deren Aufstieg schon angezeigt wurde
    };
  }

  /** Alte Formate schrittweise auf das aktuelle heben. Neue Version → neuen Schritt ergänzen. */
  var MIGRATIONEN = {
    // 1: function (d) { d.neuesFeld = ...; d.v = 2; return d; }
  };
  function migrieren(d) {
    while (d.v < FORMATVERSION) {
      if (!MIGRATIONEN[d.v]) throw new Error('Keine Migration von Version ' + d.v);
      d = MIGRATIONEN[d.v](d);
    }
    // fehlende Felder mit Standardwerten auffüllen
    var basis = leer();
    Object.keys(basis).forEach(function (k) { if (d[k] === undefined) d[k] = basis[k]; });
    return d;
  }

  function gueltig(d) {
    return d && typeof d === 'object' && typeof d.v === 'number' && Array.isArray(d.laeufe) &&
      typeof d.awards === 'object' && typeof d.xp === 'number';
  }

  LT.speicherOk = true;
  LT.laden = function () {
    try {
      var roh = localStorage.getItem(SCHLUESSEL);
      if (roh) {
        var d = JSON.parse(roh);
        if (gueltig(d)) return migrieren(d);
      }
    } catch (e) { LT.speicherOk = false; }
    return leer();
  };

  LT.S = LT.laden();

  LT.speichern = function () {
    LT.S.geaendert = LT.iso();
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(LT.S)); LT.speicherOk = true; }
    catch (e) { LT.speicherOk = false; }
  };

  LT.zuruecksetzen = function () {
    LT.S = leer();
    try { localStorage.removeItem(SCHLUESSEL); } catch (e) { /* egal */ }
  };

  function pruefsumme(daten) { return LT.hash(JSON.stringify(daten) + SALZ, 7); }

  /** Spielstand als JSON-Datei herunterladen */
  LT.exportieren = function () {
    var daten = JSON.parse(JSON.stringify(LT.S));
    var datei = {
      app: 'verdauung-lerntool', formatversion: FORMATVERSION, gespeichert: LT.iso(),
      daten: daten, pruefsumme: pruefsumme(daten)
    };
    var blob = new Blob([JSON.stringify(datei, null, 1)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'verdauung-spielstand-' + LT.tag() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    LT.S.gesichert = LT.iso();
    LT.speichern();
  };

  /** Datei prüfen. Liefert {ok, meldung, daten, gespeichert} – übernimmt noch nichts. */
  LT.dateiPruefen = function (text) {
    var datei;
    try { datei = JSON.parse(text); } catch (e) { return { ok: false, meldung: 'Das ist keine gültige Spielstand-Datei.' }; }
    if (!datei || datei.app !== 'verdauung-lerntool' || !datei.daten) {
      return { ok: false, meldung: 'Diese Datei gehört nicht zu diesem Lerntool.' };
    }
    if (datei.formatversion > FORMATVERSION) {
      return { ok: false, meldung: 'Die Datei stammt aus einer neueren Version des Lerntools. Bitte nutze die aktuelle Version.' };
    }
    if (pruefsumme(datei.daten) !== datei.pruefsumme) {
      return { ok: false, meldung: 'Die Prüfsumme stimmt nicht. Die Datei wurde verändert oder ist beschädigt.' };
    }
    if (!gueltig(datei.daten)) return { ok: false, meldung: 'Die Datei ist unvollständig.' };
    var daten;
    try { daten = migrieren(datei.daten); } catch (e) { return { ok: false, meldung: 'Die Datei kann nicht umgewandelt werden.' }; }
    return { ok: true, daten: daten, gespeichert: datei.gespeichert };
  };

  LT.uebernehmen = function (daten) { LT.S = daten; LT.speichern(); };

  /** Prüfcode für die Nachweis-Ansicht: 8 Zeichen aus Rang-relevanten Daten */
  LT.pruefcode = function (S) {
    S = S || LT.S;
    var kern = JSON.stringify({ xp: S.xp, a: S.awards, l: S.laeufe.map(function (l) { return [l.m, l.t, l.p]; }) });
    var h = LT.hash(kern + SALZ, 21).toUpperCase().replace(/[01]/g, function (c) { return c === '0' ? 'Q' : 'L'; });
    return h.slice(0, 4) + '-' + h.slice(4, 8);
  };
})();
