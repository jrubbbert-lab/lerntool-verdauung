/* Spiele: Enzym-Spiel und „Die Reise eines Brötchens“.
   Inhalte: inhalte/spiele/enzym-spiel.md und inhalte/spiele/broetchen-reise.md */
(function () {
  var esc = LT.esc, icon = LT.icon;
  var SP = LT.D.spiele || {};
  var norm = function (s) { return String(s).toLowerCase().trim(); };

  /* =================== Enzym-Spiel =================== */
  var ENZ = SP.enzym;
  if (ENZ && ENZ.enzyme.length) {
    LT.modus({
      id: 'enzym', titel: 'Enzym-Spiel', icon: 'enzym',
      text: function () { return 'Du bist ein Enzym: Klicke nur, was du spalten kannst! Bestwert: ' + LT.S.enzymBest; },
      verfuegbar: function (m) { return m.id === ENZ.modul; }
    });

    /** Welche Enzyme spalten dieses Substrat? */
    var spalter = function (substrat) {
      return ENZ.enzyme.filter(function (e) { return e.spaltet.some(function (p) { return norm(p.links) === norm(substrat); }); });
    };
    /** Erklärung, warum das gewählte Enzym dieses Substrat NICHT spaltet */
    var erklaerung = function (enzym, substrat) {
      var eigen = enzym.nicht.filter(function (p) { return norm(p.links) === norm(substrat); })[0];
      if (eigen) return { text: eigen.rechts, quelle: enzym.quelle };
      var andere = spalter(substrat);
      if (andere.length) {
        var p = andere[0].spaltet.filter(function (x) { return norm(x.links) === norm(substrat); })[0];
        return { text: '**' + substrat + '** wird nicht durch ' + enzym.name + ' gespalten, sondern durch ' +
          andere.map(function (e) { return e.name; }).join(' bzw. ') + '. ' + p.rechts, quelle: andere[0].quelle };
      }
      return { text: enzym.name + ' spaltet ' + substrat + ' nicht.', quelle: enzym.quelle };
    };

    LT.route(/^\/modul\/([^/]+)\/enzym$/, function (id) {
      var m = LT.modul(id);
      if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
      LT.modulKontext(m.id);
      var ruhig = LT.bewegungReduziert();
      var h = LT.zeige(LT.seitenkopf('Enzym-Spiel', { pfad: '/modul/' + m.id, text: m.titel }, 'Bestwert: ' + LT.S.enzymBest + ' Punkte') +
        (ENZ.einleitung ? '<p>' + LT.txt(ENZ.einleitung) + '</p>' : '') +
        '<fieldset class="optionen"><legend class="frage">Welches Enzym bist du?</legend>' +
        ENZ.enzyme.map(function (e, i) {
          return '<label class="opt"><input type="radio" name="enzym" value="' + i + '"' + (i === 0 ? ' checked' : '') + '> <span><b>' + esc(e.name) + '</b>' +
            (e.ort ? ' <span class="muted klein">· ' + esc(e.ort) + '</span>' : '') + (e.info ? '<br><span class="klein">' + LT.txt(e.info) + '</span>' : '') + '</span></label>';
        }).join('') + '</fieldset>' +
        '<label class="opt"><input type="checkbox" id="ruhig"' + (ruhig ? ' checked' : '') + '> <span><b>Ruhiger Modus</b><br><span class="klein muted">Nichts fliegt – die Stoffe stehen still. Gut mit Tastatur.</span></span></label>' +
        '<div><button class="btn primaer" type="button" id="enzym-los">' + icon('enzym') + 'Los geht’s (' + LT.E.enzym_sekunden + ' Sekunden)</button></div>');
      LT.$('#enzym-los', h).addEventListener('click', function () {
        spielen(m, ENZ.enzyme[+LT.$('input[name=enzym]:checked', h).value], LT.$('#ruhig', h).checked);
      });
    }, 'start');

    var spielen = function (m, enzym, ruhig) {
      var ziele = enzym.spaltet.map(function (p) { return p.links; });
      var falle = [];
      ENZ.enzyme.forEach(function (e) { if (e !== enzym) e.spaltet.forEach(function (p) { falle.push(p.links); }); });
      enzym.nicht.forEach(function (p) { falle.push(p.links); });
      falle = falle.filter(function (f, i, a) { return a.indexOf(f) === i && !ziele.some(function (z) { return norm(z) === norm(f); }); });
      var punkte = 0, fehler = 0, rest = LT.E.enzym_sekunden, pause = false, teile = [], raf, uhr, nachschub, zaehler = 0, bahnen = [];

      var h = LT.zeige(LT.seitenkopf('Du bist: ' + esc(enzym.name), { pfad: '/modul/' + m.id + '/enzym', text: 'Enzym-Spiel' }, 'Enzym-Spiel') +
        '<div class="reihe zw"><span class="chip" role="timer" id="e-zeit">' + rest + ' s</span><span class="chip ok" id="e-punkte">0 Punkte</span></div>' +
        '<p class="muted klein">Tippe nur auf Stoffe, die ' + esc(enzym.name) + ' spalten kann.</p>' +
        '<div class="spielfeld' + (ruhig ? ' ruhig' : '') + '" id="feld" role="group" aria-label="Spielfeld"></div>' +
        '<div id="e-info" aria-live="assertive"></div>');
      var feld = LT.$('#feld', h);

      function neuesTeil() {
        var istZiel = Math.random() < 0.45 || !falle.length;
        var name = istZiel ? ziele[Math.floor(Math.random() * ziele.length)] : falle[Math.floor(Math.random() * falle.length)];
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'teil'; b.textContent = name;
        b.setAttribute('data-id', ++zaehler);
        // Feste Bahnen, damit sich die Stoffe nicht überlappen; die zuletzt benutzten Bahnen bleiben frei
        var frei = [0, 1, 2, 3, 4, 5].filter(function (b) { return bahnen.indexOf(b) < 0; });
        var bahn = frei[Math.floor(Math.random() * frei.length)];
        bahnen.push(bahn); if (bahnen.length > 3) bahnen.shift();
        var t = { el: b, name: name, ziel: istZiel, x: 100, y: 9 + bahn * 16.4, v: 100 / (7000 + Math.random() * 2000) };
        if (!ruhig) { b.style.top = t.y + '%'; b.style.left = '100%'; }
        b.addEventListener('click', function () { treffer(t); });
        feld.appendChild(b);
        teile.push(t);
        return t;
      }
      function entfernen(t) { t.el.remove(); teile = teile.filter(function (x) { return x !== t; }); }

      function treffer(t) {
        if (pause || rest <= 0) return;
        if (t.ziel) {
          punkte++;
          LT.$('#e-punkte', h).textContent = punkte + ' Punkte';
          t.el.classList.add('weg');
          LT.ansage('Richtig, ' + t.name + ' gespalten. ' + punkte + ' Punkte.');
          setTimeout(function () { entfernen(t); if (ruhig) neuesTeil(); }, LT.bewegungReduziert() ? 0 : 250);
        } else {
          fehler++;
          pause = true;
          t.el.classList.add('falsch');
          var e = erklaerung(enzym, t.name);
          LT.$('#e-info', h).innerHTML = '<div class="rueck nein"><b>' + icon('kreuz') + esc(t.name) + ' kannst du nicht spalten</b><p>' +
            LT.txt(e.text) + '</p>' + LT.liesNach(e.quelle) +
            '<div><button class="btn primaer" type="button" id="e-weiter">Weiter spielen</button></div></div>';
          var w = LT.$('#e-weiter', h);
          w.focus({ preventScroll: false });
          w.addEventListener('click', function () {
            LT.$('#e-info', h).innerHTML = '';
            entfernen(t); if (ruhig) neuesTeil();
            pause = false; letzte = performance.now();
            var erstes = LT.$('.teil', feld); if (erstes) erstes.focus({ preventScroll: true });
          });
        }
      }

      var letzte = performance.now();
      function bewegen(jetzt) {
        var dt = jetzt - letzte; letzte = jetzt;
        if (!pause) {
          teile.slice().forEach(function (t) {
            t.x -= t.v * dt;
            t.el.style.left = t.x + '%';
            if (t.x < -30) entfernen(t);
          });
        }
        raf = requestAnimationFrame(bewegen);
      }

      if (ruhig) { for (var i = 0; i < 6; i++) neuesTeil(); var erstes = LT.$('.teil', feld); if (erstes) erstes.focus(); }
      else {
        neuesTeil();
        nachschub = setInterval(function () { if (!pause) neuesTeil(); }, 1100);
        raf = requestAnimationFrame(bewegen);
      }
      uhr = setInterval(function () {
        if (pause) return;
        rest--;
        LT.$('#e-zeit', h).textContent = rest + ' s';
        if (rest === 10) LT.ansage('Noch 10 Sekunden.');
        if (rest <= 0) ende();
      }, 1000);
      LT.aufraeumen = stopp;
      function stopp() { clearInterval(uhr); clearInterval(nachschub); cancelAnimationFrame(raf); }

      function ende() {
        stopp(); LT.aufraeumen = null;
        var rekord = punkte > LT.S.enzymBest;
        LT.S.enzymBest = Math.max(LT.S.enzymBest, punkte);
        var xp = LT.xpDazu('enzym_treffer', punkte);
        LT.uebungstag(); LT.speichern(); LT.awardsPruefen();
        LT.ergebnisSeite({
          titel: 'Zeit ist um!', eyebrow: 'Enzym-Spiel · ' + enzym.name, zurueck: { pfad: '/modul/' + m.id, text: m.titel },
          html: '<p class="prozent">' + punkte + '</p><p>Punkte mit ' + esc(enzym.name) + ' · ' + fehler + ' Fehlklick' + (fehler === 1 ? '' : 's') + '.' +
            (rekord ? ' <b>Neuer Bestwert!</b>' : ' Bestwert: ' + LT.S.enzymBest + '.') + '</p>' +
            '<p><b>' + esc(enzym.name) + ' spaltet:</b> ' + enzym.spaltet.map(function (p) { return esc(p.links); }).join(', ') + '</p>' + LT.liesNach(enzym.quelle) +
            (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : ''),
          knoepfe: '<a class="btn primaer" href="#/modul/' + esc(m.id) + '/enzym">Nochmal / Enzym wechseln</a><a class="btn" href="#/modul/' + esc(m.id) + '">Zum Modul</a>'
        });
      }
    };
  }

  /* =================== Die Reise eines Brötchens =================== */
  var REISE = SP.reise;
  if (REISE && REISE.stationen.length) {
    var naehrstoffe = REISE.stationen.map(function (s) { return s.naehrstoff; }).filter(function (n, i, a) { return a.indexOf(n) === i; });
    LT.modus({
      id: 'reise', titel: 'Die Reise eines Brötchens', icon: 'broetchen',
      text: 'Begleite ' + naehrstoffe.join(', ') + ' durch den Verdauungstrakt',
      verfuegbar: function (m) { return m.id === REISE.modul; }
    });

    LT.route(/^\/modul\/([^/]+)\/reise$/, function (id) {
      var m = LT.modul(id);
      if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
      LT.zeige(LT.seitenkopf('Die Reise eines Brötchens', { pfad: '/modul/' + m.id, text: m.titel }) +
        (REISE.einleitung ? '<div class="karte flach">' + LT.absaetze(REISE.einleitung) + '</div>' : '') +
        '<h2>Wen begleitest du?</h2><div class="modi">' + naehrstoffe.map(function (n) {
          var anz = REISE.stationen.filter(function (s) { return s.naehrstoff === n; }).length;
          return '<a class="modus" href="#/modul/' + esc(m.id) + '/reise/' + encodeURIComponent(n) + '">' + icon('broetchen') +
            '<div><b>' + esc(n) + '</b><span>' + anz + ' Stationen</span></div></a>';
        }).join('') + '</div>');
    }, 'start');

    LT.route(/^\/modul\/([^/]+)\/reise\/(.+)$/, function (id, n) {
      var m = LT.modul(id);
      if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
      LT.modulKontext(m.id);
      var stationen = REISE.stationen.filter(function (s) { return s.naehrstoff === n; });
      if (!stationen.length) { LT.gehe('/modul/' + id + '/reise'); return; }
      var i = 0, richtig = 0, xp = 0;
      var h = LT.zeige(LT.seitenkopf('Reise: ' + esc(n), { pfad: '/modul/' + m.id + '/reise', text: 'Die Reise eines Brötchens' }) +
        '<ol class="route" aria-label="Stationen">' + stationen.map(function (s, k) {
          return '<li data-k="' + k + '"><span class="punkt" aria-hidden="true"></span><span>' + esc(s.ort) + '</span></li>';
        }).join('') + '</ol><div id="station"></div>');

      function zeigen() {
        LT.$$('.route li', h).forEach(function (li, k) {
          li.classList.toggle('jetzt', k === i); li.classList.toggle('vorbei', k < i);
          if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });
        if (i >= stationen.length) return ende();
        var s = stationen[i];
        var box = LT.$('#station', h);
        box.innerHTML = '<section class="karte stapel"><p class="eyebrow">Station ' + (i + 1) + ' von ' + stationen.length + ': ' + esc(s.ort) + '</p>' +
          '<div class="a-inhalt"></div><div class="a-rueck" aria-live="polite"></div>' +
          '<div><button class="btn primaer" type="button" data-pruefen disabled>Prüfen</button></div></section>';
        var steuer = LT.typen['single-choice'].bauen(s, LT.$('.a-inhalt', box));
        var knopf = LT.$('[data-pruefen]', box);
        LT.$('.a-inhalt', box).addEventListener('change', function () { knopf.disabled = !steuer.bereit(); });
        knopf.addEventListener('click', function () {
          if (knopf.getAttribute('data-weiter')) { i++; zeigen(); return; }
          var anteil = steuer.pruefen();
          LT.$$('input', box).forEach(function (x) { x.disabled = true; });
          LT.uebungstag();
          if (anteil >= 1) { richtig++; xp += LT.xpDazu('richtige_aufgabe'); }
          LT.speichern();
          LT.$('.a-rueck', box).innerHTML = LT.rueckmeldung(anteil, s);
          LT.$('.a-rueck', box).scrollIntoView({ block: 'nearest', behavior: LT.bewegungReduziert() ? 'auto' : 'smooth' });
          knopf.textContent = i + 1 < stationen.length ? 'Weiter zur nächsten Station' : 'Ziel erreicht';
          knopf.setAttribute('data-weiter', '1');
          knopf.focus({ preventScroll: true });
          LT.kopfAktualisieren();
        });
      }
      function ende() {
        LT.awardsPruefen();
        LT.ergebnisSeite({
          titel: 'Angekommen!', eyebrow: 'Reise: ' + n, zurueck: { pfad: '/modul/' + m.id + '/reise', text: 'Die Reise eines Brötchens' },
          html: '<p class="prozent">' + richtig + ' / ' + stationen.length + '</p><p>Stationen richtig gemeistert.</p>' + (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : ''),
          knoepfe: '<a class="btn primaer" href="#/modul/' + esc(m.id) + '/reise">Anderen Nährstoff begleiten</a><a class="btn" href="#/modul/' + esc(m.id) + '">Zum Modul</a>'
        });
      }
      zeigen();
    }, 'start');
  }
})();
