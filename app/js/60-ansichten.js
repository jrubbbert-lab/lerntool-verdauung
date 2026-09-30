/* Ansichten: Start, Modul, Awards, Glossar, Mehr (Spielstand, Nachweis, Datenschutz) */
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

  /* ---------- Willkommen / Formwahl ---------- */
  LT.route(/^\/willkommen$/, function () {
    var h = LT.zeige(
      LT.seitenkopf('Willkommen!', null, 'Lerntool Verdauung') +
      '<section class="karte stapel">' +
      '<p>Hier lernst du alles über das Verdauungssystem, von den Nährstoffen bis zu den Erkrankungen. ' +
      'Für richtige Antworten bekommst du XP, steigst im Rang auf und sammelst Awards.</p>' +
      '<fieldset class="stapel" style="border:0;padding:0;margin:0"><legend><h2>Wie sollen wir deinen Rang nennen?</h2></legend>' +
      '<div class="wahl">' +
      '<label><input type="radio" name="form" value="w"> Praktikantin → … → Gesundheitsministerin</label>' +
      '<label><input type="radio" name="form" value="m"> Praktikant → … → Gesundheitsminister</label>' +
      '<label><input type="radio" name="form" value="n"> Praktikant:in → … → Gesundheitsminister:in</label>' +
      '</div></fieldset>' +
      '<p class="muted klein">Deine Wahl wird nur auf diesem Gerät gespeichert. Du kannst sie unter „Mehr“ jederzeit ändern.</p>' +
      LT.datenschutzKurz() +
      '<div class="reihe"><button class="btn primaer" id="los" type="button" disabled>Los geht’s</button>' +
      '<a class="btn" href="#/mehr/laden">Ich habe schon einen Spielstand</a></div>' +
      '</section>');
    LT.$$('input[name=form]', h).forEach(function (r) {
      r.addEventListener('change', function () { LT.$('#los').disabled = false; });
    });
    LT.$('#los').addEventListener('click', function () {
      var w = LT.$('input[name=form]:checked', h);
      if (!w) return;
      LT.S.form = w.value;
      LT.speichern();
      LT.gehe('/');
    });
  }, 'start');

  LT.datenschutzKurz = function () {
    return '<div class="hinweis">' +
      '<p><b>Datenschutz:</b> Das Lerntool speichert keinen Namen, keine Klasse und keinen Standort und sendet nichts ins Internet. ' +
      'Dein Fortschritt bleibt nur in diesem Browser. Sichere ihn regelmäßig als Datei. <a href="#/datenschutz">Mehr erfahren</a></p></div>';
  };

  /* ---------- Startseite ---------- */
  function modulKarte(m) {
    var offen = LT.modulOffen(m), bestes = LT.bestes(m.id), bestanden = LT.bestanden(m.id);
    var status;
    if (m.status !== 'aktiv') status = '<span class="chip">in Vorbereitung</span>';
    else if (!LT.blockOffen(m.block)) status = '<span class="chip">' + icon('schloss') + 'Block gesperrt</span>';
    else if (!offen) status = '<span class="chip">' + icon('schloss') + 'erst ' + esc(LT.fehlendeOrgane(m).join(' + ')) + '</span>';
    else if (bestanden) status = '<span class="chip ok">' + icon('haken') + 'bestanden · ' + bestes + ' %</span>';
    else if (bestes >= 0) status = '<span class="chip">bestes Ergebnis ' + bestes + ' %</span>';
    else status = '<span class="chip gold">neu</span>';
    var inhalt = '<span class="ic" style="background:' + esc(m.farbe) + '">' + icon(m.icon) + '</span>' +
      '<h3>' + esc(m.titel) + '</h3><p class="muted klein">' + esc(m.beschreibung) + '</p><div class="fuss">' + status + '</div>';
    return offen ? '<a class="modul" href="#/modul/' + esc(m.id) + '">' + inhalt + '</a>'
                 : '<div class="modul zu" aria-disabled="true">' + inhalt + '</div>';
  }

  LT.route(/^\/$/, function () {
    var r = LT.rang();
    var fehler = Object.keys(LT.S.falsch).length;
    var html = LT.seitenkopf('Verdauung lernen', null, 'Dein Lernstand') +
      '<section class="karte rangkarte" aria-label="Dein Rang">' +
      '<div><p class="eyebrow">Rang</p><p class="stufe">' + esc(r.name) + '</p></div>' +
      '<p class="muted" style="text-align:right">' + LT.zahl(LT.S.xp) + ' XP' +
      (r.naechster ? '<br><span class="klein">noch ' + LT.zahl(r.naechsterXp - LT.S.xp) + ' XP bis ' + esc(r.naechster) + '</span>' : '') + '</p>' +
      '<div class="balken" role="progressbar" aria-label="Fortschritt zum nächsten Rang" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      Math.round(r.anteil * 100) + '"><i style="width:' + (r.anteil * 100).toFixed(1) + '%"></i></div></section>' +
      '<section class="modi" aria-label="Übergreifende Übungen">' +
      '<a class="modus" href="#/fehler">' + icon('wiederholen') + '<div><b>Meine Fehler</b><span>' +
      (fehler ? fehler + ' Aufgabe' + (fehler === 1 ? '' : 'n') + ' zum Wiederholen' : 'Zurzeit nichts zu wiederholen') + '</span></div></a>' +
      '<a class="modus" href="#/quiz">' + icon('blitz') + '<div><b>Quiz auf Zeit</b><span>Freiwillig: Wie viele schaffst du in ' + LT.E.quiz_sekunden + ' Sekunden?</span></div></a>' +
      '</section>';
    LT.E.bloecke.forEach(function (b) {
      var offen = LT.blockOffen(b.nr);
      html += '<section aria-labelledby="block-' + b.nr + '"><div class="block-kopf"><h2 id="block-' + b.nr + '">' +
        b.nr + ' · ' + esc(b.titel) + '</h2>' +
        (offen ? '' : '<span class="chip">' + icon('schloss') + 'Bestehe erst alle Module aus Block ' + (b.nr - 1) + '</span>') +
        '</div><div class="module">' + LT.moduleImBlock(b.nr).map(modulKarte).join('') + '</div></section>';
    });
    if (LT.S.laeufe.length && !LT.S.gesichert) {
      html += '<div class="hinweis gold reihe zw"><span>Du hast deinen Spielstand noch nie als Datei gesichert.</span>' +
        '<a class="btn klein" href="#/mehr">Jetzt sichern</a></div>';
    }
    if (!LT.speicherOk) {
      html += '<div class="hinweis nein">Dein Browser erlaubt kein Speichern (z. B. privater Modus). Sichere deinen Spielstand deshalb unbedingt als Datei.</div>';
    }
    LT.zeige(html);
  }, 'start');

  /* ---------- Modulseite ---------- */
  LT.modi = [];  // wird von den Aufgabentypen gefüllt: {id, titel, text, icon, verfuegbar(m)}
  LT.modus = function (def) { LT.modi.push(def); };

  LT.route(/^\/modul\/([^/]+)$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    LT.modulKontext(m.id);
    var laeufe = LT.laeufeVon(m.id);
    var modi = LT.modi.filter(function (d) { return d.verfuegbar(m); });
    LT.zeige(
      LT.seitenkopf(esc(m.titel), { pfad: '/', text: 'Übersicht' }, 'Block ' + m.block + ' · ' + LT.blockTitel(m.block)) +
      '<p>' + esc(m.beschreibung) + '</p>' +
      '<div class="reihe">' +
      (LT.bestanden(m.id) ? '<span class="chip ok">' + icon('haken') + 'bestanden</span>' : '<span class="chip">Bestehen ab ' + LT.E.bestehensgrenze + ' %</span>') +
      (laeufe.length ? '<span class="chip">bestes Ergebnis ' + LT.bestes(m.id) + ' %</span><span class="chip">' + laeufe.length + '× abgeschlossen</span>' : '') +
      '</div>' +
      '<section aria-labelledby="modi-t"><h2 id="modi-t" class="sr-only">Übungen</h2><div class="modi">' +
      modi.map(function (d) {
        return '<a class="modus" href="#/modul/' + esc(m.id) + '/' + d.id + '">' + icon(d.icon) +
          '<div><b>' + esc(d.titel) + '</b><span>' + esc(typeof d.text === 'function' ? d.text(m) : d.text) + '</span></div></a>';
      }).join('') + '</div></section>' +
      '<p class="lies">' + icon('buch') + '<span>Quellen: ' + esc(LT.quelleText(m.quellen.split(';').map(function (s) { return s.trim(); }))) + '</span></p>');
  }, 'start');

  /* ---------- Award-Wand ---------- */
  LT.route(/^\/awards$/, function () {
    var anzahl = Object.keys(LT.S.awards).length;
    LT.zeige(LT.seitenkopf('Deine Awards', null, anzahl + ' von ' + LT.D.awards.length + ' erreicht') +
      '<p class="muted">Tippe einen Award an: Jeder Award verrät dir einen Fachfakt aus den Büchern.</p>' +
      '<div class="wand">' + LT.D.awards.map(function (a) {
        var datum = LT.S.awards[a.id], stand = LT.awardStand(a);
        var geheim = a.geheim && !datum;
        return '<button type="button" class="award' + (datum ? '' : ' zu') + '" data-award="' + esc(a.id) + '">' +
          LT.plakette(geheim ? { form: a.form, farbe1: '#888', farbe2: '#555', icon: 'info' } : a) +
          (datum ? '' : '<span class="schloss">' + icon('schloss') + '</span>') +
          '<span class="n">' + (geheim ? '???' : esc(LT.awardName(a))) + '</span>' +
          (datum ? '<span class="d">' + LT.datum(datum) + '</span>'
                 : (geheim ? '<span class="d">geheim</span>' : '<span class="mini" aria-hidden="true"><i style="width:' + Math.round(stand.f * 100) + '%"></i></span>' +
                   '<span class="sr-only">Fortschritt ' + Math.round(stand.f * 100) + ' Prozent</span>')) +
          '</button>';
      }).join('') + '</div>');
    LT.$$('.award').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = LT.D.awards.filter(function (x) { return x.id === b.getAttribute('data-award'); })[0];
        var datum = LT.S.awards[a.id];
        if (a.geheim && !datum) { LT.dialog('???', '<p>Dieser Award ist geheim. Vielleicht findest du ihn ja zufällig …</p>'); return; }
        LT.dialog(esc(LT.awardName(a)),
          '<div class="feier">' + LT.plakette(a, 'plakette gross' + (datum ? '' : ' grau')) +
          '<p><b>So bekommst du ihn:</b> ' + esc(a.bedingung) + '</p>' +
          (datum ? '<p class="chip ok">erreicht am ' + LT.datum(datum) + '</p>' : '<p class="chip">' + Math.round(LT.awardStand(a).f * 100) + ' % geschafft</p>') +
          (a.fakt ? '<div class="hinweis gold"><p class="eyebrow">Fachfakt</p><p>' + LT.txt(a.fakt, { ohneKlammer: true }) + '</p>' + LT.liesNach(a.quelle) + '</div>' : '') +
          '</div>');
      });
    });
  }, 'awards');

  /* ---------- Glossar ---------- */
  LT.route(/^\/glossar$/, function () {
    var begriffe = Object.keys(LT.D.glossar).sort(function (a, b) { return a.localeCompare(b, 'de'); });
    LT.zeige(LT.seitenkopf('Glossar', null, begriffe.length + ' Fachbegriffe') +
      '<div class="feld"><label for="gsuche">Suchen</label><input type="text" id="gsuche" autocomplete="off" placeholder="z. B. Pylorus oder Magenpförtner"></div>' +
      '<dl class="glossar">' + begriffe.map(function (b) {
        var g = LT.D.glossar[b];
        return '<div class="g-eintrag" data-suche="' + esc((b + ' ' + g.deutsch).toLowerCase()) + '"><dt>' + esc(b) + ' <span class="muted">(' + esc(g.deutsch) + ')</span></dt>' +
          '<dd>' + LT.txt(g.erklaerung, { ohneKlammer: true }) + LT.liesNach(g.quelle) + '</dd></div>';
      }).join('') + '</dl>' + (begriffe.length ? '' : '<p class="muted">Das Glossar wird gerade aufgebaut.</p>'));
    LT.$('#gsuche').addEventListener('input', function (e) {
      var q = e.target.value.trim().toLowerCase();
      LT.$$('.g-eintrag').forEach(function (el) { el.hidden = q && el.getAttribute('data-suche').indexOf(q) < 0; });
    });
  }, 'glossar');
})();
