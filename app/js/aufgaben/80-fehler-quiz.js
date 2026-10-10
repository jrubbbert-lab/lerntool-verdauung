/* „Meine Fehler“ (nur falsch beantwortete Aufgaben) und „Quiz auf Zeit“ (freiwillig) */
(function () {
  var esc = LT.esc, icon = LT.icon;

  function aufgabeFinden(id, modulId) {
    var m = LT.modul(modulId);
    if (!m) return null;
    for (var i = 0; i < m.aufgaben.length; i++) if (m.aufgaben[i].id === id) return m.aufgaben[i];
    return null;
  }

  /* ---------- Meine Fehler ---------- */
  LT.route(/^\/fehler$/, function () {
    var liste = [];
    Object.keys(LT.S.falsch).forEach(function (id) {
      var modulId = LT.S.falsch[id], a = aufgabeFinden(id, modulId), m = LT.modul(modulId);
      if (a && m && LT.modulOffen(m)) liste.push({ a: a, modulId: modulId });
      else if (!a) delete LT.S.falsch[id];   // Aufgabe gibt es nicht mehr
    });
    liste = LT.mischen(liste).slice(0, 15);
    if (!liste.length) {
      LT.zeige(LT.seitenkopf('Meine Fehler', { pfad: '/', text: 'Übersicht' }) +
        '<section class="karte stapel"><p>Zurzeit hast du keine falsch beantworteten Aufgaben. Stark!</p>' +
        '<p class="muted">Aufgaben, die du in einem Modulcheck nicht ganz richtig löst, landen hier. Sobald du sie richtig beantwortest, verschwinden sie wieder.</p>' +
        '<div><a class="btn primaer" href="#/">Zur Übersicht</a></div></section>');
      return;
    }
    var xp = 0;
    LT.sitzung({
      titel: 'Meine Fehler', eyebrow: 'Wiederholen', zurueck: { pfad: '/', text: 'Übersicht' }, liste: liste,
      nachAntwort: function (e, anteil) { if (anteil >= 1) xp += LT.xpDazu('richtige_aufgabe'); },
      ende: function (erg) {
        LT.awardsPruefen();
        var richtig = erg.filter(function (e) { return e.anteil >= 1; }).length;
        var rest = Object.keys(LT.S.falsch).length;
        LT.ergebnisSeite({
          titel: 'Wiederholung geschafft', zurueck: { pfad: '/', text: 'Übersicht' },
          html: '<p class="prozent">' + richtig + ' / ' + erg.length + '</p><p>Aufgaben jetzt richtig gelöst. ' +
            (rest ? 'Noch ' + rest + ' Aufgabe' + (rest === 1 ? '' : 'n') + ' zum Wiederholen.' : 'Deine Fehlerliste ist leer!') + '</p>' +
            (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : ''),
          falsch: erg.filter(function (e) { return e.anteil < 1; }),
          knoepfe: '<a class="btn primaer" href="#/">Zur Übersicht</a>' + (rest ? '<button class="btn" type="button" onclick="LT.gehe(\'/fehler\')">Weiter wiederholen</button>' : '')
        });
      }
    });
  }, 'start');

  /* ---------- Quiz auf Zeit ---------- */
  function quizPool() {
    var pool = [];
    LT.D.module.forEach(function (m) {
      if (!LT.modulOffen(m)) return;
      m.aufgaben.forEach(function (a) { if (a.typ === 'single-choice') pool.push({ a: a, modulId: m.id }); });
    });
    return pool;
  }

  LT.route(/^\/quiz$/, function () {
    var pool = quizPool();
    var h = LT.zeige(LT.seitenkopf('Quiz auf Zeit', { pfad: '/', text: 'Übersicht' }, 'Freiwillig') +
      '<section class="karte stapel" id="quiz">' +
      (pool.length
        ? '<p>Beantworte in <b>' + LT.E.quiz_sekunden + ' Sekunden</b> so viele Fragen wie möglich. Die Fragen stammen aus allen Modulen, die du schon freigeschaltet hast. ' +
          'Das Quiz ist freiwillig und zählt nicht für das Bestehen eines Moduls.</p>' +
          '<p class="muted klein">Bestwert Serie: ' + LT.S.quizSerieMax + ' richtige Antworten in Folge</p>' +
          '<div><button class="btn primaer" type="button" id="quiz-los">' + icon('blitz') + 'Start</button></div>'
        : '<p class="muted">Sobald du ein Modul mit Single-Choice-Fragen freigeschaltet hast, kannst du hier spielen.</p>') +
      '</section>');
    if (!pool.length) return;
    LT.$('#quiz-los', h).addEventListener('click', function () { starten(pool); });
  }, 'start');

  function starten(pool) {
    var rest = LT.E.quiz_sekunden, richtig = 0, falsch = 0, serie = 0, xp = 0, reihe = LT.mischen(pool), k = 0, timer;
    var box = LT.$('#quiz');
    box.innerHTML = '<div class="reihe zw"><span class="chip" id="q-zeit" role="timer" aria-label="Verbleibende Zeit">' + rest + ' s</span>' +
      '<span class="chip ok" id="q-stand">0 richtig</span></div><div class="balken" aria-hidden="true"><i id="q-balken" style="width:100%"></i></div>' +
      '<div id="q-frage" aria-live="polite"></div>';
    timer = setInterval(function () {
      rest--;
      LT.$('#q-zeit').textContent = rest + ' s';
      LT.$('#q-balken').style.width = (rest / LT.E.quiz_sekunden * 100) + '%';
      if (rest === 10) LT.ansage('Noch 10 Sekunden.');
      if (rest <= 0) ende();
    }, 1000);
    LT.aufraeumen = function () { clearInterval(timer); };
    LT.zeitLaeuft = true;

    function frage() {
      if (k >= reihe.length) { reihe = LT.mischen(pool); k = 0; }
      var e = reihe[k++], a = e.a;
      LT.modulKontext(e.modulId);
      var opts = LT.mischen(a.optionen);
      LT.$('#q-frage').innerHTML = '<p class="frage">' + LT.txt(a.frage) + '</p><div class="quiz-opts">' +
        opts.map(function (o, i) { return '<button type="button" class="opt-btn" data-i="' + i + '">' + LT.txt(o.text, { ohneKlammer: true }) + '</button>'; }).join('') + '</div>';
      LT.$$('.opt-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          var o = opts[+b.getAttribute('data-i')];
          LT.$$('.opt-btn').forEach(function (x) { x.disabled = true; if (opts[+x.getAttribute('data-i')].richtig) x.classList.add('richtig'); });
          LT.uebungstag();
          if (o.richtig) {
            richtig++; serie++; xp += LT.xpDazu('quiz_richtig');
            LT.S.quizSerieMax = Math.max(LT.S.quizSerieMax, serie);
          } else { falsch++; serie = 0; b.classList.add('falsch'); }
          LT.$('#q-stand').textContent = richtig + ' richtig';
          setTimeout(function () { if (rest > 0) frage(); }, o.richtig ? 450 : 1400);
        });
      });
      var erstes = LT.$('.opt-btn'); if (erstes) erstes.focus({ preventScroll: true });
    }

    function ende() {
      clearInterval(timer); LT.aufraeumen = null; LT.zeitLaeuft = false;
      LT.speichern();
      LT.awardsPruefen();
      LT.ergebnisSeite({
        titel: 'Zeit ist um!', eyebrow: 'Quiz auf Zeit', zurueck: { pfad: '/', text: 'Übersicht' },
        html: '<p class="prozent">' + richtig + '</p><p>richtige Antworten (' + falsch + ' falsch). Beste Serie bisher: ' + LT.S.quizSerieMax + '.</p>' +
          (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : ''),
        knoepfe: '<button class="btn primaer" type="button" onclick="LT.gehe(\'/quiz\')">Nochmal</button><a class="btn" href="#/">Zur Übersicht</a>'
      });
    }
    frage();
  }
})();
