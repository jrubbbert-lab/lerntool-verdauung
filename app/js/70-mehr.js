/* „Mehr“: Spielstand speichern/laden, Anleitung, Nachweis für die Lehrkraft, Datenschutz */
(function () {
  var esc = LT.esc, icon = LT.icon;

  function rangName(daten) {
    var formAlt = LT.S.form; LT.S.form = daten.form;
    var n = LT.rang(daten.xp).name;
    LT.S.form = formAlt;
    return n;
  }

  var ANLEITUNG =
    '<details class="karte flach"><summary><b>Wo landet meine Spielstand-Datei?</b></summary><div class="stapel" style="margin-top:10px">' +
    '<p><b>iPad / iPhone:</b> Nach „Spielstand speichern“ fragt Safari, ob du die Datei laden willst. Tippe auf „Laden“. ' +
    'Die Datei liegt dann in der App <i>Dateien</i> unter <i>Auf meinem iPad → Downloads</i> (bzw. <i>iCloud Drive → Downloads</i>). ' +
    'Zum Laden wählst du sie dort wieder aus.</p>' +
    '<p><b>Android:</b> Die Datei landet im Ordner <i>Downloads</i>. Du findest sie in der App <i>Dateien</i> bzw. <i>Eigene Dateien</i>.</p>' +
    '<p><b>PC / Mac:</b> Die Datei landet im Ordner <i>Downloads</i>. Speichere sie am besten zusätzlich auf einem USB-Stick oder in deinem Schul-Cloudspeicher.</p>' +
    '<p class="muted klein">Tipp: Behalte immer die neueste Datei. Das Datum steht im Dateinamen, z. B. <code>verdauung-spielstand-' + LT.tag() + '.json</code>.</p>' +
    '</div></details>';

  /* ---------- Übersicht „Mehr“ ---------- */
  LT.route(/^\/mehr$/, function () {
    var s = LT.S;
    LT.zeige(LT.seitenkopf('Mehr', null, 'Spielstand & Einstellungen') +
      '<section class="karte stapel" aria-labelledby="ss-t"><h2 id="ss-t">Spielstand</h2>' +
      '<p>Dein Fortschritt wird automatisch in diesem Browser gespeichert. Wenn du den Browserverlauf löschst oder das Gerät wechselst, ist er aber weg. ' +
      'Sichere ihn deshalb regelmäßig als Datei.</p>' +
      '<p class="muted klein">' + (s.gesichert ? 'Zuletzt gesichert: ' + LT.datum(s.gesichert) + ', ' + LT.uhrzeit(s.gesichert) + ' Uhr' : 'Noch nie als Datei gesichert.') + '</p>' +
      '<div class="reihe"><button class="btn primaer" id="export" type="button">' + icon('download') + 'Spielstand speichern</button>' +
      '<a class="btn" href="#/mehr/laden">' + icon('upload') + 'Spielstand laden</a></div>' + ANLEITUNG + '</section>' +
      '<section class="modi" aria-label="Weitere Bereiche">' +
      '<a class="modus" href="#/nachweis">' + icon('auge') + '<div><b>Nachweis für die Lehrkraft</b><span>Rang, Awards und Prüfcode auf einen Blick</span></div></a>' +
      '<a class="modus" href="#/datenschutz">' + icon('schild_ds') + '<div><b>Datenschutz</b><span>Was gespeichert wird und was nicht</span></div></a>' +
      '</section>' +
      '<section class="karte stapel" aria-labelledby="form-t"><h2 id="form-t">Anrede der Ränge</h2><div class="wahl">' +
      [['w', 'weiblich (Praktikantin …)'], ['m', 'männlich (Praktikant …)'], ['n', 'neutral (Praktikant:in …)']].map(function (f) {
        return '<label><input type="radio" name="form" value="' + f[0] + '"' + (s.form === f[0] ? ' checked' : '') + '> ' + f[1] + '</label>';
      }).join('') + '</div></section>' +
      '<section class="karte stapel" aria-labelledby="rs-t"><h2 id="rs-t">Neu anfangen</h2>' +
      '<p class="muted">Löscht deinen gesamten Fortschritt in diesem Browser. Eine gesicherte Datei bleibt erhalten.</p>' +
      '<div><button class="btn gefahr" id="reset" type="button">Fortschritt löschen</button></div></section>' +
      '<p class="muted klein">Version vom ' + LT.datum(LT.D.erstellt) + (LT.D.variante === 'kurs' ? ' · Kursversion' : '') + '</p>');
    LT.$('#export').addEventListener('click', function () {
      LT.exportieren();
      LT.ansage('Spielstand wurde als Datei gespeichert.');
      LT.navigieren();
    });
    LT.$$('input[name=form]').forEach(function (r) {
      r.addEventListener('change', function () { LT.S.form = r.value; LT.speichern(); LT.kopfAktualisieren(); LT.ansage('Anrede geändert.'); });
    });
    LT.$('#reset').addEventListener('click', function () {
      LT.dialog('Wirklich alles löschen?', '<p>Dein Rang, deine XP, Awards und Karteikarten-Fächer werden in diesem Browser gelöscht. Das kann nicht rückgängig gemacht werden.</p>', [
        { text: 'Abbrechen', aktion: function () {} },
        { text: 'Ja, alles löschen', klasse: 'gefahr', aktion: function () { LT.zuruecksetzen(); LT.gehe('/'); } }
      ]);
    });
  }, 'mehr');

  /* ---------- Spielstand laden ---------- */
  LT.route(/^\/mehr\/laden$/, function () {
    var h = LT.zeige(LT.seitenkopf('Spielstand laden', { pfad: LT.S.form ? '/mehr' : '/willkommen', text: 'Zurück' }) +
      '<section class="karte stapel"><p>Wähle deine Spielstand-Datei aus (<code>verdauung-spielstand-….json</code>). ' +
      'Du siehst vorher, was darin steht, und entscheidest dann.</p>' +
      '<div class="feld"><label for="datei">Datei auswählen</label><input type="file" id="datei" accept=".json,application/json"></div>' +
      '<div id="vorschau" aria-live="polite"></div></section>' + ANLEITUNG);
    LT.$('#datei', h).addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var leser = new FileReader();
      leser.onload = function () { vorschau(LT.dateiPruefen(String(leser.result))); };
      leser.readAsText(f);
    });
  }, 'mehr');

  function vorschau(erg) {
    var ziel = LT.$('#vorschau');
    if (!erg.ok) { ziel.innerHTML = '<div class="hinweis nein">' + esc(erg.meldung) + '</div>'; return; }
    var d = erg.daten, aktuell = LT.S;
    var aelter = aktuell.laeufe.length && new Date(erg.gespeichert) < new Date(aktuell.geaendert);
    ziel.innerHTML = '<div class="karte flach stapel"><h2>Vorschau</h2><table class="liste"><tbody>' +
      '<tr><th scope="row">Gespeichert am</th><td>' + LT.datum(erg.gespeichert) + ', ' + LT.uhrzeit(erg.gespeichert) + ' Uhr</td></tr>' +
      '<tr><th scope="row">Rang</th><td>' + esc(rangName(d)) + ' (' + LT.zahl(d.xp) + ' XP)</td></tr>' +
      '<tr><th scope="row">Awards</th><td>' + Object.keys(d.awards).length + '</td></tr>' +
      '<tr><th scope="row">Abgeschlossene Modulchecks</th><td>' + d.laeufe.length + '</td></tr></tbody></table>' +
      (aelter ? '<div class="hinweis nein"><b>Achtung:</b> Diese Datei ist älter als dein aktueller Stand in diesem Browser (' +
        LT.datum(aktuell.geaendert) + ', ' + LT.uhrzeit(aktuell.geaendert) + ' Uhr). Wenn du sie lädst, geht neuerer Fortschritt verloren.</div>' : '') +
      (aktuell.laeufe.length ? '<p class="muted klein">Dein aktueller Stand: ' + esc(LT.rang().name) + ', ' + LT.zahl(aktuell.xp) + ' XP, ' +
        Object.keys(aktuell.awards).length + ' Awards. Er wird ersetzt.</p>' : '') +
      '<div class="reihe"><button class="btn primaer" id="uebernehmen" type="button">Spielstand übernehmen</button>' +
      '<button class="btn" id="abbrechen" type="button">Abbrechen</button></div></div>';
    LT.$('#uebernehmen').addEventListener('click', function () {
      LT.uebernehmen(d);
      LT.awardsPruefen(); LT.neueAwards = [];
      LT.S.rangGesehen = Math.max(LT.S.rangGesehen || 0, LT.rang().stufe); LT.speichern();
      LT.ansage('Spielstand geladen.');
      LT.gehe('/');
    });
    LT.$('#abbrechen').addEventListener('click', function () { ziel.innerHTML = ''; LT.$('#datei').value = ''; });
  }

  /* ---------- Erinnerung ans Sichern (nach jedem Modulabschluss) ---------- */
  LT.sichernErinnerung = function () {
    return '<div class="hinweis gold stapel"><p><b>Denk ans Sichern!</b> Speichere deinen Spielstand als Datei, damit nichts verloren geht.</p>' +
      '<div><button class="btn klein" type="button" data-export>' + icon('download') + 'Spielstand speichern</button></div></div>';
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-export]');
    if (b) { LT.exportieren(); b.outerHTML = '<span class="chip ok">' + icon('haken') + 'gespeichert</span>'; }
  });

  /* ---------- Nachweis für die Lehrkraft (nur Bildschirm) ---------- */
  LT.route(/^\/nachweis$/, function () {
    var s = LT.S, r = LT.rang();
    var erreichte = LT.D.awards.filter(function (a) { return s.awards[a.id]; })
      .sort(function (a, b) { return s.awards[a.id] < s.awards[b.id] ? -1 : 1; });
    var module = LT.D.module.filter(function (m) { return LT.laeufeVon(m.id).length; });
    LT.zeige(LT.seitenkopf('Nachweis', { pfad: '/mehr', text: 'Mehr' }, 'Für die Lehrkraft') +
      '<section class="karte stapel nachweis">' +
      '<div class="reihe zw"><div><p class="eyebrow">Rang</p><p class="stufe" style="font-family:var(--f-display);font-size:1.6rem;font-weight:700">' + esc(r.name) + '</p>' +
      '<p class="muted">' + LT.zahl(s.xp) + ' XP</p></div>' +
      '<div style="text-align:right"><p class="eyebrow">Prüfcode</p><p class="pruefcode">' + LT.pruefcode() + '</p>' +
      '<p class="muted klein">Stand: ' + LT.datum(LT.iso()) + ', ' + LT.uhrzeit(LT.iso()) + ' Uhr</p></div></div>' +
      '<h2>Awards (' + erreichte.length + ')</h2>' +
      (erreichte.length ? '<table class="liste"><thead><tr><th>Award</th><th>erreicht am</th></tr></thead><tbody>' +
        erreichte.map(function (a) { return '<tr><td>' + esc(LT.awardName(a)) + '</td><td>' + LT.datum(s.awards[a.id]) + '</td></tr>'; }).join('') +
        '</tbody></table>' : '<p class="muted">Noch keine Awards.</p>') +
      '<h2>Module</h2>' +
      (module.length ? '<table class="liste"><thead><tr><th>Modul</th><th>bestes Ergebnis</th><th>Durchgänge</th></tr></thead><tbody>' +
        module.map(function (m) {
          return '<tr><td>' + esc(m.titel) + '</td><td>' + LT.bestes(m.id) + ' %' + (LT.bestanden(m.id) ? ' ✓' : '') + '</td><td>' + LT.laeufeVon(m.id).length + '</td></tr>';
        }).join('') + '</tbody></table>' : '<p class="muted">Noch kein Modulcheck abgeschlossen.</p>') +
      '<p class="muted klein">Der Prüfcode wird aus Rang, Awards und Modulergebnissen berechnet. Ändert sich etwas daran, ändert sich auch der Code.</p>' +
      '</section>');
  }, 'mehr');

  /* ---------- Datenschutz ---------- */
  LT.route(/^\/datenschutz$/, function () {
    LT.zeige(LT.seitenkopf('Datenschutz', { pfad: LT.S.form ? '/mehr' : '/willkommen', text: 'Zurück' }) +
      '<section class="karte stapel">' +
      '<h2>Kurz gesagt</h2><ul>' +
      '<li>Du brauchst <b>kein Konto</b> und gibst <b>keinen Namen, keine Klasse und keinen Standort</b> an.</li>' +
      '<li>Das Lerntool <b>sendet nichts ins Internet</b>. Es lädt keine Schriften, keine Bilder und keine Statistik-Dienste nach.</li>' +
      '<li>Dein Fortschritt liegt <b>nur in diesem Browser</b> (localStorage) und in Dateien, die du selbst speicherst.</li>' +
      '<li><b>Texte, die du in Operatoraufgaben schreibst, werden nie gespeichert.</b> Sie sind weg, sobald du die Aufgabe verlässt.</li>' +
      '<li>Uhrzeit und Datum für manche Awards werden nur auf deinem Gerät geprüft.</li></ul>' +
      '<h2>Was genau gespeichert wird</h2><ul>' +
      '<li>deine gewählte Anrede (weiblich / männlich / neutral)</li>' +
      '<li>XP, Ergebnisse der Modulchecks (Datum, Uhrzeit, Prozent)</li>' +
      '<li>Fächer deiner Karteikarten, Kennungen falsch beantworteter Aufgaben („Meine Fehler“)</li>' +
      '<li>erreichte Awards mit Datum, Übungstage, Bestwerte in den Spielen</li></ul>' +
      '<p class="muted">Alles löschen kannst du unter „Mehr → Neu anfangen“.</p></section>');
  }, 'mehr');
})();
