/* Sitzung: zeigt eine Folge von Aufgaben mit Prüfen → Rückmeldung → Weiter.
   Aufgabentypen melden sich mit LT.typ(name, {name, bauen}) an.
   bauen(aufgabe, element) liefert {bereit(): bool, pruefen(): Anteil 0–1, loesung?: () => HTML}. */
(function () {
  var esc = LT.esc, icon = LT.icon;
  LT.typen = {};
  LT.typ = function (typ, def) { LT.typen[typ] = def; };

  /** Rückmeldungstext je nach Anteil */
  LT.rueckmeldung = function (anteil, a, extraHtml) {
    var klasse = anteil >= 1 ? 'ok' : 'nein';
    var kopf = anteil >= 1 ? 'Richtig!' : anteil > 0 ? 'Teilweise richtig (' + Math.round(anteil * 100) + ' %)' : 'Leider nicht richtig.';
    return '<div class="rueck ' + klasse + '"><b>' + icon(anteil >= 1 ? 'haken' : 'kreuz') + kopf + '</b>' +
      (extraHtml || '') + (a.erklaerung ? LT.absaetze(a.erklaerung) : '') + LT.liesNach(a.quelle) + '</div>';
  };

  /**
   * opt: {titel, eyebrow, zurueck:{pfad,text}, liste:[{a, modulId}], nachAntwort(eintrag, anteil),
   *       ende(ergebnisse) → wird nach der letzten Aufgabe aufgerufen}
   */
  LT.sitzung = function (opt) {
    var i = 0, ergebnisse = [];
    var h = LT.zeige(LT.seitenkopf(esc(opt.titel), opt.zurueck, opt.eyebrow) + '<div id="sitzung"></div>');
    var ziel = LT.$('#sitzung', h);

    function zeigeAufgabe() {
      var eintrag = opt.liste[i], a = eintrag.a, def = LT.typen[a.typ];
      if (eintrag.modulId && eintrag.modulId !== LT.kontext.modul) LT.modulKontext(eintrag.modulId);
      ziel.innerHTML =
        '<section class="karte aufgabe stapel" aria-labelledby="a-titel">' +
        '<div class="reihe zw"><span class="eyebrow" id="a-titel">Aufgabe ' + (i + 1) + ' von ' + opt.liste.length + '</span>' +
        '<span class="chip">' + esc(def.name) + '</span></div>' +
        '<div class="balken" aria-hidden="true"><i style="width:' + (i / opt.liste.length * 100) + '%"></i></div>' +
        '<div class="a-inhalt"></div><div class="a-rueck" aria-live="polite"></div>' +
        '<div class="reihe"><button class="btn primaer" type="button" data-pruefen disabled>Prüfen</button></div></section>';
      var inhalt = LT.$('.a-inhalt', ziel), knopf = LT.$('[data-pruefen]', ziel);
      var steuer = def.bauen(a, inhalt);
      var aktualisieren = function () { knopf.disabled = !steuer.bereit(); };
      ['input', 'change', 'click', 'keyup'].forEach(function (ev) { inhalt.addEventListener(ev, function () { setTimeout(aktualisieren, 0); }); });
      aktualisieren();
      var erstes = LT.$('input,select,button', inhalt);
      if (erstes) erstes.focus({ preventScroll: true });

      knopf.addEventListener('click', function pruefen() {
        if (knopf.getAttribute('data-weiter')) { weiter(); return; }
        var anteil = steuer.pruefen();
        LT.$$('input,select,textarea', inhalt).forEach(function (el) { el.disabled = true; });
        LT.$$('button', inhalt).forEach(function (el) { if (!el.classList.contains('begriff')) el.disabled = true; });
        LT.antwortErfassen(a, eintrag.modulId, anteil);
        if (opt.nachAntwort) opt.nachAntwort(eintrag, anteil);
        LT.speichern();
        ergebnisse.push({ a: a, modulId: eintrag.modulId, anteil: anteil });
        var rueck = LT.$('.a-rueck', ziel);
        rueck.innerHTML = LT.rueckmeldung(anteil, a, steuer.loesung && anteil < 1 ? steuer.loesung() : '');
        rueck.scrollIntoView({ block: 'nearest', behavior: LT.bewegungReduziert() ? 'auto' : 'smooth' });
        LT.ansage(anteil >= 1 ? 'Richtig.' : anteil > 0 ? 'Teilweise richtig.' : 'Leider nicht richtig.');
        knopf.textContent = i + 1 < opt.liste.length ? 'Weiter' : 'Ergebnis anzeigen';
        knopf.setAttribute('data-weiter', '1');
        knopf.focus({ preventScroll: true });
        LT.kopfAktualisieren();
      });
    }

    function weiter() {
      i++;
      if (i < opt.liste.length) { zeigeAufgabe(); window.scrollTo(0, 0); }
      else opt.ende(ergebnisse);
    }

    if (!opt.liste.length) { ziel.innerHTML = '<p class="muted">Hier gibt es gerade keine Aufgaben.</p>'; return; }
    zeigeAufgabe();
  };

  /** Ergebnisseite nach einer Sitzung */
  LT.ergebnisSeite = function (opt) {
    LT.zeige(LT.seitenkopf(esc(opt.titel), opt.zurueck, opt.eyebrow) +
      '<section class="karte stapel ergebnis" aria-live="polite">' + opt.html + '</section>' +
      (opt.falsch && opt.falsch.length ? '<section class="stapel"><h2>Das solltest du wiederholen</h2><ul class="wiederholen">' +
        opt.falsch.map(function (e) {
          return '<li>' + LT.txt(e.a.frage || e.a.vorne || (e.a.text || '').replace(/\{\{.+?\}\}/g, '…'), { ohneKlammer: true }) + LT.liesNach(e.a.quelle) + '</li>';
        }).join('') + '</ul></section>' : '') +
      '<div class="reihe">' + (opt.knoepfe || '') + '</div>');
    LT.kopfAktualisieren();
    setTimeout(function () { LT.awardsFeiern(); }, LT.bewegungReduziert() ? 50 : 400);
  };

  /** Aufgaben für Checks mischen: möglichst verschiedene Typen */
  LT.ziehen = function (aufgaben, n) {
    var nachTyp = {};
    LT.mischen(aufgaben).forEach(function (a) { (nachTyp[a.typ] = nachTyp[a.typ] || []).push(a); });
    var typen = LT.mischen(Object.keys(nachTyp)), aus = [];
    while (aus.length < n && typen.some(function (t) { return nachTyp[t].length; })) {
      typen.forEach(function (t) { if (aus.length < n && nachTyp[t].length) aus.push(nachTyp[t].shift()); });
    }
    return LT.mischen(aus);
  };
})();
