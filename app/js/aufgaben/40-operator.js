/* Operatoraufgaben: Fallbeispiel → Freitext (Mindestlänge) → Selbstcheck → Musterlösung.
   DATENSCHUTZ: Der Freitext wird NIE gespeichert – weder im localStorage noch in der Spielstand-Datei.
   Gespeichert wird nur, DASS eine Aufgabe bestanden wurde (für den Award „Viszeralchirurgin“). */
(function () {
  var esc = LT.esc, icon = LT.icon;

  LT.modus({
    id: 'operatoren', titel: 'Operatoraufgaben', icon: 'stift',
    text: function (m) {
      var n = m.operatoren.filter(function (o) { return LT.S.operatoren[o.id]; }).length;
      return m.operatoren.length + ' Fallaufgaben mit Selbstcheck · ' + n + ' bestanden';
    },
    verfuegbar: function (m) { return m.operatoren.length > 0; }
  });

  LT.route(/^\/modul\/([^/]+)\/operatoren$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    LT.zeige(LT.seitenkopf('Operatoraufgaben: ' + esc(m.titel), { pfad: '/modul/' + m.id, text: m.titel }) +
      '<p class="muted">Du schreibst eine Antwort, prüfst sie selbst anhand von Kriterien und vergleichst sie dann mit der Musterlösung. ' +
      'Bestanden hast du ab ' + LT.E.operator_bestehensgrenze + ' % der Kriterien.</p>' +
      '<div class="modi">' + m.operatoren.map(function (o) {
        return '<a class="modus" href="#/modul/' + esc(m.id) + '/operator/' + esc(o.id) + '">' + icon('stift') +
          '<div><b>' + esc(o.operator.charAt(0).toUpperCase() + o.operator.slice(1)) + ' · AFB ' + esc(o.afb) + '</b><span>' +
          LT.txt(o.auftrag, { ohneKlammer: true }).replace(/<[^>]+>/g, '') + '</span>' +
          (LT.S.operatoren[o.id] ? '<span class="chip ok" style="margin-top:6px">' + icon('haken') + 'bestanden</span>' : '') + '</div></a>';
      }).join('') + '</div>');
  }, 'start');

  LT.route(/^\/modul\/([^/]+)\/operator\/([^/]+)$/, function (id, opId) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    var o = m.operatoren.filter(function (x) { return x.id === opId; })[0];
    if (!o) { LT.gehe('/modul/' + id + '/operatoren'); return; }
    LT.modulKontext(m.id);
    var h = LT.zeige(LT.seitenkopf('Operatoraufgabe', { pfad: '/modul/' + m.id + '/operatoren', text: 'Alle Operatoraufgaben' }, m.titel) +
      '<section class="karte stapel">' +
      '<div class="reihe"><span class="chip gold">Operator: ' + esc(o.operator) + '</span><span class="chip">AFB ' + esc(o.afb) + '</span></div>' +
      '<div class="fall"><p class="eyebrow">Fallbeispiel</p>' + LT.absaetze(o.fall) + '</div>' +
      '<div class="auftrag"><p class="eyebrow">Aufgabe</p><p class="frage">' + LT.txt(o.auftrag) + '</p></div>' +
      '<div class="feld"><label for="antwort">Deine Antwort <span class="muted klein">(mindestens ' + o.mindestlaenge + ' Zeichen)</span></label>' +
      '<textarea id="antwort" spellcheck="true" autocomplete="off" aria-describedby="zaehler datenschutz-op"></textarea>' +
      '<div class="reihe zw klein"><span id="zaehler" class="muted" aria-live="polite">0 / ' + o.mindestlaenge + ' Zeichen</span>' +
      '<span id="datenschutz-op" class="muted">' + icon('schild_ds') + ' Dein Text wird nicht gespeichert. Kopiere ihn, wenn du ihn behalten möchtest.</span></div></div>' +
      '<div><button class="btn primaer" type="button" id="selbstcheck" disabled>Weiter zum Selbstcheck</button></div>' +
      '<div id="check" hidden></div></section>');
    var feld = LT.$('#antwort', h), knopf = LT.$('#selbstcheck', h);
    feld.addEventListener('input', function () {
      var n = feld.value.trim().length;
      LT.$('#zaehler').textContent = n + ' / ' + o.mindestlaenge + ' Zeichen' + (n >= o.mindestlaenge ? ' ✓' : '');
      knopf.disabled = n < o.mindestlaenge;
    });
    // Beim Verlassen: Text sicher verwerfen
    LT.aufraeumen = function () { feld.value = ''; };

    knopf.addEventListener('click', function () {
      knopf.hidden = true;
      feld.readOnly = true;
      var box = LT.$('#check', h);
      box.hidden = false;
      box.innerHTML = '<fieldset class="optionen"><legend class="frage">Selbstcheck: Was trifft auf deine Antwort zu?' +
        '<span class="kennung">Sei ehrlich zu dir – nur du siehst das.</span></legend>' +
        o.kriterien.map(function (k, i) {
          return '<label class="opt"><input type="checkbox" value="' + i + '"> <span>' + LT.txt(k, { ohneKlammer: true }) + '</span></label>';
        }).join('') + '</fieldset><div><button class="btn primaer" type="button" id="auswerten">Auswerten und Musterlösung zeigen</button></div><div id="auswertung" aria-live="polite"></div>';
      LT.$('.opt input', box).focus();
      LT.$('#auswerten', box).addEventListener('click', function () {
        var n = LT.$$('.opt input', box).filter(function (c) { return c.checked; }).length;
        var prozent = Math.round(n / o.kriterien.length * 100);
        var bestanden = prozent >= LT.E.operator_bestehensgrenze;
        var xp = 0;
        LT.$$('input', box).forEach(function (c) { c.disabled = true; });
        this.hidden = true;
        LT.uebungstag();
        if (bestanden && !LT.S.operatoren[o.id]) { LT.S.operatoren[o.id] = LT.iso(); xp = LT.xpDazu('operator_bestanden'); }
        LT.speichern();
        LT.awardsPruefen();
        LT.kopfAktualisieren();
        LT.$('#auswertung', box).innerHTML =
          '<div class="rueck ' + (bestanden ? 'ok' : 'nein') + '"><b>' + icon(bestanden ? 'haken' : 'kreuz') +
          (bestanden ? 'Bestanden – ' : 'Noch nicht bestanden – ') + prozent + ' % der Kriterien</b>' +
          (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : '') +
          (bestanden ? '' : '<p>Vergleiche deine Antwort mit der Musterlösung und versuch es später noch einmal.</p>') + '</div>' +
          '<div class="muster"><p class="eyebrow">Musterlösung</p>' + LT.absaetze(o.musterloesung, { ohneKlammer: true }) + LT.liesNach(o.quelle) + '</div>' +
          '<div class="reihe"><a class="btn primaer" href="#/modul/' + esc(m.id) + '/operatoren">Zur Übersicht</a></div>';
        LT.$('#auswertung', box).scrollIntoView({ block: 'start', behavior: LT.bewegungReduziert() ? 'auto' : 'smooth' });
        setTimeout(function () { LT.awardsFeiern(); }, 400);
      });
    });
  }, 'start');
})();
