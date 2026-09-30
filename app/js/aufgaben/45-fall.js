/* Fallarbeit: Fehlerfahndung (Pflegebericht von Robartina) und Diagnose-Detektivin */
(function () {
  var esc = LT.esc, icon = LT.icon;
  /** Text in Sätze zerlegen (ohne Lookbehind – läuft auch auf älteren iPads).
      Abkürzungen wie „z. B.“ oder „S.“ beenden keinen Satz. */
  LT.saetze = function (text) {
    var t = String(text).replace(/\s+/g, ' ').trim(), aus = [], start = 0;
    for (var i = 0; i < t.length; i++) {
      if ('.!?'.indexOf(t[i]) >= 0 && t[i + 1] === ' ' && /[A-ZÄÖÜ„"(]/.test(t[i + 2] || '') &&
          !/(^|[\s.])([A-Za-zÄÖÜäöü]|ca|bzw|ggf|evtl|vgl|Fr|Hr|Dr|Nr|Abb|Tab)$/.test(t.slice(start, i))) {
        aus.push(t.slice(start, i + 1)); start = i + 2;
      }
    }
    if (start < t.length) aus.push(t.slice(start));
    return aus;
  };
  var nurTyp = function (m, typ) { return m.aufgaben.filter(function (a) { return a.typ === typ; }); };

  function uebersicht(m, typ, titel, einleitung, erledigt) {
    var liste = nurTyp(m, typ);
    LT.zeige(LT.seitenkopf(esc(titel) + ': ' + esc(m.titel), { pfad: '/modul/' + m.id, text: m.titel }) +
      '<p class="muted">' + einleitung + '</p><div class="modi">' + liste.map(function (a) {
        return '<a class="modus" href="#/modul/' + esc(m.id) + '/' + typ + '/' + esc(a.id) + '">' + icon(typ === 'diagnose' ? 'lupe' : 'fehler') +
          '<div><b>' + esc(a.titel) + '</b>' + (erledigt(a) ? '<span class="chip ok" style="margin-top:6px">' + icon('haken') + 'gelöst</span>' : '') + '</div></a>';
      }).join('') + '</div>');
  }

  /* =================== Fehlerfahndung =================== */
  LT.modus({
    id: 'fehlerfahndung', titel: 'Fehlerfahndung', icon: 'fehler',
    text: 'Finde und korrigiere die Fachfehler in Robartinas Pflegebericht',
    verfuegbar: function (m) { return nurTyp(m, 'fehlerfahndung').length > 0; }
  });
  LT.route(/^\/modul\/([^/]+)\/fehlerfahndung$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    uebersicht(m, 'fehlerfahndung', 'Fehlerfahndung',
      'Robartina hat einen Pflegebericht geschrieben, aber es haben sich Fachfehler eingeschlichen. Findest du sie?',
      function (a) { return !!LT.S.fehlerfahndung[a.id]; });
  }, 'start');

  LT.route(/^\/modul\/([^/]+)\/fehlerfahndung\/([^/]+)$/, function (id, aid) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    var a = nurTyp(m, 'fehlerfahndung').filter(function (x) { return x.id === aid; })[0];
    if (!a) { LT.gehe('/modul/' + id); return; }
    LT.modulKontext(m.id);
    // Bericht in Sätze zerlegen; jeder Fehler gehört zu dem Satz, in dem er steht
    var saetze = LT.saetze(a.bericht);
    var fehlerIn = saetze.map(function (s) { return a.fehler.filter(function (f) { return s.indexOf(f.links) >= 0; }); });
    var h = LT.zeige(LT.seitenkopf(esc(a.titel), { pfad: '/modul/' + m.id + '/fehlerfahndung', text: 'Fehlerfahndung' }, m.titel) +
      '<section class="karte stapel"><p><b>Schritt 1:</b> Tippe alle Sätze an, die einen Fachfehler enthalten. Es sind <b>' + a.fehler.length + ' Fehler</b> versteckt.</p>' +
      '<div class="bericht" role="group" aria-label="Pflegebericht">' + saetze.map(function (s, i) {
        return '<button type="button" class="satz" aria-pressed="false" data-i="' + i + '">' + esc(s) + '</button>';
      }).join(' ') + '</div>' +
      '<div><button class="btn primaer" type="button" id="ff-pruefen">Auswahl prüfen</button></div><div id="ff-schritt2"></div></section>');
    LT.$$('.satz', h).forEach(function (b) {
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
    });
    LT.$('#ff-pruefen', h).addEventListener('click', function () {
      this.hidden = true;
      var gefunden = [], falschMarkiert = 0;
      LT.$$('.satz', h).forEach(function (b, i) {
        var an = b.getAttribute('aria-pressed') === 'true', hatFehler = fehlerIn[i].length > 0;
        b.disabled = true;
        if (an && hatFehler) { b.classList.add('richtig'); gefunden = gefunden.concat(fehlerIn[i]); }
        else if (an) { b.classList.add('falsch'); falschMarkiert++; }
        else if (hatFehler) b.classList.add('fehlt');
      });
      var verpasst = a.fehler.filter(function (f) { return gefunden.indexOf(f) < 0; });
      var ziel = LT.$('#ff-schritt2', h);
      ziel.innerHTML = '<p><b>Schritt 2:</b> ' + (gefunden.length
        ? 'Du hast ' + gefunden.length + ' von ' + a.fehler.length + ' Fehlern gefunden. Wie muss es richtig heißen?'
        : 'Du hast keinen Fehler gefunden. Hier sind die Korrekturen:') + '</p>' +
        gefunden.map(function (f, k) {
          return '<div class="feld korr"><label for="korr' + k + '">Statt „<mark>' + esc(f.links) + '</mark>“ richtig:</label>' +
            '<input type="text" id="korr' + k + '" autocomplete="off" spellcheck="false"></div>';
        }).join('') +
        (gefunden.length ? '<div><button class="btn primaer" type="button" id="ff-korr">Korrekturen prüfen</button></div>' : '') +
        '<div id="ff-ende" aria-live="polite"></div>';
      function abschluss(korrigiert) {
        var n = a.fehler.length;
        var anteil = Math.max(0, Math.min(1, (gefunden.length + korrigiert - falschMarkiert) / (2 * n)));
        LT.uebungstag();
        var xp = LT.xpDazu('richtige_aufgabe', korrigiert);
        if (anteil >= 1) LT.S.fehlerfahndung[a.id] = LT.iso();
        LT.speichern(); LT.awardsPruefen(); LT.kopfAktualisieren();
        LT.$('#ff-ende', h).innerHTML = LT.rueckmeldung(anteil, a,
          '<p><b>Alle Korrekturen:</b></p><ul class="loesung">' + a.fehler.map(function (f) {
            return '<li><s>' + esc(f.links) + '</s> → <b>' + esc(f.loesung || f.rechts.split('|')[0]) + '</b></li>';
          }).join('') + '</ul>' + (falschMarkiert ? '<p>' + falschMarkiert + ' Satz/Sätze hast du markiert, obwohl sie richtig sind.</p>' : '') +
          (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : '')) +
          '<div class="reihe"><a class="btn primaer" href="#/modul/' + esc(m.id) + '/fehlerfahndung">Zur Übersicht</a></div>';
        setTimeout(function () { LT.awardsFeiern(); }, 400);
      }
      if (!gefunden.length) { abschluss(0); return; }
      LT.$('#korr0', h).focus();
      LT.$('#ff-korr', h).addEventListener('click', function () {
        this.hidden = true;
        var korrigiert = 0;
        gefunden.forEach(function (f, k) {
          var inp = LT.$('#korr' + k, h);
          // Richtig, wenn die Eingabe eines der erlaubten Schlüsselwörter enthält (z. B. „nüchtern“)
          var eingabe = LT.normal(inp.value);
          var ok = eingabe.length > 1 && f.rechts.split('|').some(function (r) { return eingabe.indexOf(LT.normal(r)) >= 0; });
          inp.classList.add(ok ? 'richtig' : 'falsch'); inp.disabled = true;
          if (ok) korrigiert++;
        });
        abschluss(korrigiert);
      });
      if (verpasst.length) LT.ansage(verpasst.length + ' Fehler hast du übersehen.');
    });
  }, 'start');

  /* =================== Diagnose-Detektivin =================== */
  LT.modus({
    id: 'diagnose', titel: 'Diagnose-Detektiv:in', icon: 'lupe',
    text: 'Decke Hinweise auf und stelle die Diagnose',
    verfuegbar: function (m) { return nurTyp(m, 'diagnose').length > 0; }
  });
  LT.route(/^\/modul\/([^/]+)\/diagnose$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    uebersicht(m, 'diagnose', 'Diagnose-Detektiv:in',
      'Symptome, Befunde und Laborwerte werden Schritt für Schritt aufgedeckt. Je weniger Hinweise du brauchst, desto besser.',
      function (a) { return LT.S.diagnosen.indexOf(a.id) >= 0; });
  }, 'start');

  LT.route(/^\/modul\/([^/]+)\/diagnose\/([^/]+)$/, function (id, aid) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    var a = nurTyp(m, 'diagnose').filter(function (x) { return x.id === aid; })[0];
    if (!a) { LT.gehe('/modul/' + id); return; }
    LT.modulKontext(m.id);
    var offen = 1, fertig = false;
    var opts = LT.mischen(a.optionen);
    var h = LT.zeige(LT.seitenkopf(esc(a.titel), { pfad: '/modul/' + m.id + '/diagnose', text: 'Diagnose-Detektiv:in' }, m.titel) +
      '<section class="karte stapel"><ol class="hinweise" aria-live="polite"></ol>' +
      '<div><button class="btn" type="button" id="dx-mehr">' + icon('lupe') + 'Nächsten Hinweis aufdecken</button></div>' +
      '<fieldset class="optionen"><legend class="frage">Deine Diagnose<span class="kennung">Wähle genau eine Antwort</span></legend>' +
      opts.map(function (o, i) { return '<label class="opt"><input type="radio" name="dx" value="' + i + '"> <span>' + esc(o) + '</span></label>'; }).join('') +
      '</fieldset><div><button class="btn primaer" type="button" id="dx-stellen" disabled>Diagnose stellen</button></div><div id="dx-ende" aria-live="polite"></div></section>');
    function hinweise() {
      LT.$('.hinweise', h).innerHTML = a.hinweise.slice(0, offen).map(function (x) { return '<li>' + LT.txt(x) + '</li>'; }).join('');
      LT.$('#dx-mehr', h).disabled = offen >= a.hinweise.length || fertig;
      LT.$('#dx-mehr', h).textContent = offen >= a.hinweise.length ? 'Alle Hinweise aufgedeckt' : 'Nächsten Hinweis aufdecken (' + offen + '/' + a.hinweise.length + ')';
    }
    hinweise();
    LT.$('#dx-mehr', h).addEventListener('click', function () { offen++; hinweise(); });
    LT.$$('input[name=dx]', h).forEach(function (r) { r.addEventListener('change', function () { LT.$('#dx-stellen', h).disabled = false; }); });
    LT.$('#dx-stellen', h).addEventListener('click', function () {
      var w = LT.$('input[name=dx]:checked', h); if (!w) return;
      fertig = true; this.hidden = true;
      var richtig = opts[+w.value] === a.diagnose;
      LT.$$('.opt', h).forEach(function (l, i) {
        LT.$('input', l).disabled = true;
        if (opts[i] === a.diagnose) l.classList.add('richtig'); else if (LT.$('input', l).checked) l.classList.add('falsch');
      });
      var gebraucht = offen;
      offen = a.hinweise.length; hinweise();
      LT.uebungstag();
      var xp = 0;
      if (richtig) {
        xp = LT.xpDazu('richtige_aufgabe');
        if (LT.S.diagnosen.indexOf(a.id) < 0) LT.S.diagnosen.push(a.id);
      }
      LT.speichern(); LT.awardsPruefen(); LT.kopfAktualisieren();
      LT.$('#dx-ende', h).innerHTML = LT.rueckmeldung(richtig ? 1 : 0, a,
        '<p>Du hast ' + gebraucht + ' von ' + a.hinweise.length + ' Hinweisen gebraucht.</p>' + (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : '')) +
        '<div class="reihe"><a class="btn primaer" href="#/modul/' + esc(m.id) + '/diagnose">Zur Übersicht</a></div>';
      setTimeout(function () { LT.awardsFeiern(); }, 400);
    });
  }, 'start');
})();
