/* Spiel „Durch den Verdauungstrakt“: Ein Bissen wird von der Mundhöhle bis zum After gesteuert.
   Sphinkter öffnen und schließen sich, die Salzsäure im Magen steigt und fällt, Enzyme sind unterwegs.
   Texte der Stationen: inhalte/spiele/trakt-spiel.md. Hier steht nur der Spielablauf. */
(function () {
  var esc = LT.esc, icon = LT.icon;
  var TR = (LT.D.spiele || {}).trakt;
  if (!TR) return;

  var STATION = {};
  TR.stationen.forEach(function (s) { STATION[s.id] = s; });
  function station(id) { return STATION[id] || { id: id, name: id, fakt: '', quelle: [] }; }

  /* ---------- Spielwelt (Einheiten: Breite 360, Länge 2940; y wächst nach unten) ---------- */
  var BREITE = 360, ZIEL = 2915, LAENGE = 2960;
  // Verlauf des Verdauungstrakts: [y, Mitte, halbe Breite]
  var PROFIL = [
    [0, 180, 118], [120, 180, 118], [165, 180, 46], [200, 180, 40],          // Mundhöhle, Rachen
    [330, 166, 37], [470, 194, 37], [600, 180, 38], [645, 180, 40],          // Ösophagus
    [670, 176, 62], [735, 185, 150], [1150, 185, 150], [1215, 150, 92], [1250, 110, 42],   // Magen
    [1285, 110, 48], [1400, 122, 62], [1520, 230, 62], [1680, 130, 62], [1840, 232, 62], [1960, 180, 56], [2000, 180, 46],   // Dünndarm
    [2035, 180, 62], [2095, 180, 100], [2560, 180, 100], [2625, 180, 60],    // Kolon
    [2740, 180, 50], [2860, 180, 46], [LAENGE, 180, 46]                      // Rektum, Analkanal
  ];
  // Sphinkter und Klappen: Dauer eines Zyklus und Zeit in geöffnetem Zustand (Sekunden)
  var TORE = [
    { id: 'oesophagus_oben', y: 178, zyklus: 2.6, offen: 1.2, versatz: 0 },
    { id: 'oesophagus_unten', y: 645, zyklus: 3.0, offen: 1.2, versatz: 0.8 },
    { id: 'pylorus', y: 1250, zyklus: 2.0, offen: 0.9, versatz: 0 },
    { id: 'bauhin', y: 2000, zyklus: 3.0, offen: 1.1, versatz: 0.4 },
    { id: 'anal_innen', y: 2762, zyklus: 3.2, offen: 1.3, versatz: 0 },
    { id: 'anal_aussen', y: 2842, zyklus: 2.2, offen: 0.9, versatz: 0.7 }
  ];
  // Fachfakt erscheint, sobald der Bissen diese Höhe erreicht
  var MARKEN = [
    { y: 0, id: 'mund' }, { y: 200, id: 'oesophagus_oben' }, { y: 340, id: 'oesophagus' }, { y: 668, id: 'oesophagus_unten' },
    { y: 770, id: 'magen' }, { y: 1272, id: 'pylorus' }, { y: 1370, id: 'duodenum' }, { y: 1570, id: 'duenndarm' },
    { y: 2022, id: 'bauhin' }, { y: 2160, id: 'kolon' }, { y: 2784, id: 'anal_innen' }, { y: 2864, id: 'anal_aussen' }
  ];
  var ABSCHNITTE = [[0, 'Mundhöhle'], [178, 'Ösophagus'], [645, 'Magen'], [1250, 'Duodenum'], [1480, 'Jejunum und Ileum'], [2000, 'Kolon'], [2625, 'Rektum']];
  // Falten des Dünndarms und Haustren des Kolons: ragen von der Wand in den Weg
  var FALTEN = [
    [1445, 'l', 64], [1505, 'r', 64], [1600, 'l', 64], [1655, 'r', 64], [1760, 'l', 64], [1815, 'r', 64], [1915, 'l', 58],
    [2140, 'l', 112], [2225, 'r', 112], [2310, 'l', 112], [2395, 'r', 112], [2480, 'l', 112]
  ].map(function (f) { return { y: f[0], seite: f[1], laenge: f[2] }; });
  // Bewegliche Hindernisse: achse x = pendelt zwischen den Wänden, achse y = pendelt zwischen von/bis
  var LAEUFER = [
    { art: 'reflux', name: 'Magensäure', achse: 'y', von: 485, bis: 625, dx: -13, tempo: 95 },
    { art: 'reflux', name: 'Magensäure', achse: 'y', von: 520, bis: 628, dx: 14, tempo: 120 },
    { art: 'enzym', name: 'Pepsin', achse: 'x', y: 772, tempo: 115 },
    { art: 'enzym', name: 'Pepsin', achse: 'x', y: 1010, tempo: 140 },
    { art: 'enzym', name: 'Trypsin', achse: 'x', y: 1552, tempo: 95 },
    { art: 'enzym', name: 'Lipase', achse: 'x', y: 1708, tempo: 110 },
    { art: 'enzym', name: 'Amylase', achse: 'x', y: 1866, tempo: 100 },
    { art: 'bakterie', name: 'Darmbakterien', achse: 'x', y: 2182, tempo: 70 },
    { art: 'bakterie', name: 'Darmbakterien', achse: 'x', y: 2352, tempo: 85 },
    { art: 'bakterie', name: 'Darmbakterien', achse: 'x', y: 2520, tempo: 75 }
  ];
  // Galle und Pankreassaft schießen im Duodenum in Schüben quer durch den Darm
  var STRAHL = { y: 1325, zyklus: 2.8, an: 1.1, warnung: 0.6 };
  var SAEURE = { oben: 800, unten: 1420, boden: 1250, von: 690, zyklus: 8 };   // Spiegel pendelt zwischen oben und unten
  var RADIUS = 11, TEMPO = 190, TORDICKE = 7;
  var BISSEN = [['🥖', 'Brötchen'], ['🍎', 'Apfel'], ['🧀', 'Käse'], ['🍫', 'Schokolade']];

  function profil(y) {
    var p = PROFIL, i = 0;
    while (i < p.length - 2 && y > p[i + 1][0]) i++;
    var a = p[i], b = p[i + 1], t = Math.max(0, Math.min(1, (y - a[0]) / (b[0] - a[0])));
    t = t * t * (3 - 2 * t);   // weicher Übergang
    return { m: a[1] + (b[1] - a[1]) * t, h: a[2] + (b[2] - a[2]) * t };
  }
  /** Öffnung eines Tors: 0 = zu, 1 = ganz offen */
  function oeffnung(tor, zeit) {
    var rampe = 0.3, zu = tor.zyklus - tor.offen - 2 * rampe, t = (zeit + tor.versatz) % tor.zyklus;
    if (t < zu) return 0;
    if (t < zu + rampe) return (t - zu) / rampe;
    if (t < zu + rampe + tor.offen) return 1;
    return 1 - (t - zu - rampe - tor.offen) / rampe;
  }
  function saeureSpiegel(zeit) {
    return SAEURE.oben + (SAEURE.unten - SAEURE.oben) * (0.5 - 0.5 * Math.cos(zeit / SAEURE.zyklus * 2 * Math.PI));
  }
  function zeitText(zehntel) {
    var s = Math.floor(zehntel / 10);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2) + ',' + (zehntel % 10);
  }
  function dunkel() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' || (t !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  LT.modus({
    id: 'trakt', titel: 'Durch den Verdauungstrakt', icon: 'verdauungstrakt',
    text: function () { return 'Steuere einen Bissen an Sphinktern, Salzsäure und Enzymen vorbei.' + (LT.S.traktBest ? ' Bestzeit: ' + zeitText(LT.S.traktBest) : ''); },
    verfuegbar: function (m) { return m.id === TR.modul; }
  });

  /* ---------- Startseite ---------- */
  LT.route(/^\/modul\/([^/]+)\/trakt$/, function (id) {
    var m = LT.modul(id);
    if (!m || !LT.modulOffen(m)) { LT.gehe('/'); return; }
    LT.modulKontext(m.id);
    var h = LT.zeige(LT.seitenkopf('Durch den Verdauungstrakt', { pfad: '/modul/' + m.id, text: m.titel }, LT.S.traktBest ? 'Bestzeit: ' + zeitText(LT.S.traktBest) : 'Spiel') +
      (TR.einleitung ? '<p>' + LT.txt(TR.einleitung) + '</p>' : '') +
      '<fieldset class="optionen"><legend class="frage">Welcher Bissen bist du?</legend><div class="bissenwahl">' +
      BISSEN.map(function (b, i) {
        return '<label class="opt"><input type="radio" name="bissen" value="' + i + '"' + (i === 0 ? ' checked' : '') + '> <span><span class="emoji" aria-hidden="true">' + b[0] + '</span> ' + esc(b[1]) + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="hinweis"><p><b>So steuerst du:</b> mit den Pfeiltasten, mit den Pfeilknöpfen unter dem Spielfeld oder indem du den Finger auf dem Spielfeld hältst – der Bissen folgt ihm.</p>' +
      '<p><b>Achtung:</b> Geschlossene Sphinkter lassen dich nicht durch. Salzsäure, Enzyme und Verdauungssäfte kosten Substanz. Ist sie aufgebraucht, wurdest du verdaut und startest am letzten Sphinkter neu.</p></div>' +
      '<div><button class="btn primaer" type="button" id="trakt-los">' + icon('verdauungstrakt') + 'Los geht’s</button></div>');
    LT.$('#trakt-los', h).addEventListener('click', function () {
      spielen(m, BISSEN[+LT.$('input[name=bissen]:checked', h).value]);
    });
  }, 'start');

  /* ---------- Spiel ---------- */
  function spielen(m, bissen) {
    var h = LT.zeige(LT.seitenkopf('Durch den Verdauungstrakt', { pfad: '/modul/' + m.id + '/trakt', text: 'Spiel verlassen' }) +
      '<div class="reihe zw trakt-hud"><span class="chip" id="t-ort">Mundhöhle</span><span class="chip" role="timer" id="t-zeit">0:00,0</span></div>' +
      '<div class="trakt-leben" role="img" id="t-leben" aria-label="Substanz 100 Prozent"><span id="t-balken"></span></div>' +
      '<div class="trakt-feld"><canvas id="t-feld" role="img" aria-label="Spielfeld: Der Bissen wandert durch den Verdauungstrakt. Die Stationen werden unter dem Spielfeld angesagt."></canvas></div>' +
      '<div class="trakt-steuer" role="group" aria-label="Steuerung">' +
      '<button type="button" class="btn" data-r="l" aria-label="nach links">' + icon('zurueck') + '</button>' +
      '<div class="mitte"><button type="button" class="btn" data-r="o" aria-label="nach oben">' + icon('hoch') + '</button>' +
      '<button type="button" class="btn" data-r="u" aria-label="nach unten">' + icon('runter') + '</button></div>' +
      '<button type="button" class="btn" data-r="r" aria-label="nach rechts">' + icon('weiter') + '</button>' +
      '<button type="button" class="btn" id="t-pause" aria-pressed="false">Pause</button></div>' +
      '<div id="t-info" class="trakt-info" aria-live="polite"></div>');

    var feld = LT.$('#t-feld', h), ctx = feld.getContext('2d'), rahmen = feld.parentNode;
    var ruhig = LT.bewegungReduziert();
    var s = { x: 180, y: 60, leben: 100, zeit: 0, schutz: 0, versuche: 0, pause: false, fertig: false,
              halt: { x: 180, y: 60 }, marke: 0, tor: 0, besucht: [] };
    var tasten = {}, knopf = {}, zeiger = null, raf = null, letzte = performance.now(), mass = 1, sichtH = 500, kamera = 0;
    var laeufer = LAEUFER.map(function (l, i) { return { def: l, pos: i * 0.37 % 1, dir: i % 2 ? 1 : -1, x: 0, y: l.y || l.von }; });

    function groesse() {
      var b = Math.min(rahmen.clientWidth || 320, 460), hoehe = Math.max(320, Math.min(window.innerHeight * 0.58, 560));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      feld.style.width = b + 'px'; feld.style.height = hoehe + 'px';
      feld.width = Math.round(b * dpr); feld.height = Math.round(hoehe * dpr);
      mass = feld.width / BREITE; sichtH = feld.height / mass;
    }
    groesse();

    function ansage(id) {
      var st = station(id);
      if (s.besucht.indexOf(id) < 0) s.besucht.push(id);
      LT.$('#t-info', h).innerHTML = '<p><b>' + esc(st.name) + '</b>' + (st.fakt ? ' – ' + LT.txt(st.fakt, { ohneKlammer: true }) : '') + '</p>';
    }
    function meldung(text) { LT.$('#t-info', h).innerHTML = '<p><b>' + esc(text) + '</b></p>'; }

    function schaden(menge, sofort) {
      if (s.schutz > 0 && !sofort) return;
      s.leben -= menge;
      if (!sofort) s.schutz = 0.9;
      if (s.leben <= 0) {
        s.versuche++; s.leben = 100; s.schutz = 1.6;
        s.x = s.halt.x; s.y = s.halt.y; zeiger = null;
        meldung('Du wurdest verdaut! Weiter geht es am letzten Sphinkter.');
      }
    }

    function schritt(dt) {
      s.zeit += dt;
      if (s.schutz > 0) s.schutz -= dt;
      // Richtung: Tasten/Knöpfe oder Finger
      var dx = (tasten.r || knopf.r ? 1 : 0) - (tasten.l || knopf.l ? 1 : 0), dy = (tasten.u || knopf.u ? 1 : 0) - (tasten.o || knopf.o ? 1 : 0);
      if (!dx && !dy && zeiger) {
        var zx = zeiger.x - s.x, zy = zeiger.y - s.y, d = Math.sqrt(zx * zx + zy * zy);
        if (d > 5) { dx = zx / d; dy = zy / d; }
      } else if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
      var altY = s.y;
      s.x += dx * TEMPO * dt; s.y += dy * TEMPO * dt;
      s.y = Math.max(RADIUS + 4, Math.min(LAENGE - RADIUS, s.y));

      // Sphinkter und Klappen
      TORE.forEach(function (tor, i) {
        var p = profil(tor.y), luecke = oeffnung(tor, s.zeit) * (p.h - 5), rand = TORDICKE + RADIUS;
        var passt = luecke > RADIUS + 2 && Math.abs(s.x - p.m) < luecke - RADIUS + 3;
        if (passt) { if (Math.abs(s.y - tor.y) < rand) s.x = Math.max(p.m - luecke + RADIUS, Math.min(p.m + luecke - RADIUS, s.x)); }
        else if (altY <= tor.y - rand && s.y > tor.y - rand) s.y = tor.y - rand;
        else if (altY >= tor.y + rand && s.y < tor.y + rand) s.y = tor.y + rand;
        else if (Math.abs(s.y - tor.y) < rand) {          // der Sphinkter schließt sich um den Bissen
          s.y = tor.y - rand - 16;
          schaden(25);
          meldung('Eingeklemmt! Der Sphinkter hat sich geschlossen.');
        }
        if (s.tor <= i && s.y > tor.y + rand + 4) {       // geschafft: neuer Startpunkt
          s.tor = i + 1;
          var q = profil(tor.y + 34);
          s.halt = { x: q.m, y: tor.y + 34 };
        }
      });

      // Falten und Haustren
      FALTEN.forEach(function (f) {
        var p = profil(f.y), x0 = f.seite === 'l' ? p.m - p.h : p.m + p.h - f.laenge, x1 = x0 + f.laenge, y0 = f.y - 6, y1 = f.y + 6;
        var nx = Math.max(x0, Math.min(x1, s.x)), ny = Math.max(y0, Math.min(y1, s.y)), ax = s.x - nx, ay = s.y - ny, d2 = ax * ax + ay * ay;
        if (d2 >= RADIUS * RADIUS) return;
        if (d2 > 0.01) { var d = Math.sqrt(d2); s.x = nx + ax / d * RADIUS; s.y = ny + ay / d * RADIUS; }
        else s.y = altY <= f.y ? y0 - RADIUS : y1 + RADIUS;
      });

      // Wände
      var w = profil(s.y);
      s.x = Math.max(w.m - w.h + RADIUS, Math.min(w.m + w.h - RADIUS, s.x));

      // Salzsäure im Magen
      if (s.y > SAEURE.von && s.y < SAEURE.boden && s.y + 3 > saeureSpiegel(s.zeit)) schaden(46 * dt, true);

      // Galle und Pankreassaft
      var st = s.zeit % STRAHL.zyklus;
      if (st > STRAHL.warnung && st < STRAHL.warnung + STRAHL.an && Math.abs(s.y - STRAHL.y) < 9 + RADIUS) schaden(40 * dt, true);

      // Enzyme, Reflux, Bakterien
      laeufer.forEach(function (l) {
        var d = l.def, strecke;
        if (d.achse === 'x') {
          var p = profil(d.y); strecke = 2 * (p.h - 14);
          l.pos += l.dir * d.tempo * dt / strecke;
          if (l.pos > 1) { l.pos = 1; l.dir = -1; } else if (l.pos < 0) { l.pos = 0; l.dir = 1; }
          l.x = p.m - p.h + 14 + l.pos * strecke; l.y = d.y;
        } else {
          strecke = d.bis - d.von;
          l.pos += l.dir * d.tempo * dt / strecke;
          if (l.pos > 1) { l.pos = 1; l.dir = -1; } else if (l.pos < 0) { l.pos = 0; l.dir = 1; }
          l.y = d.von + l.pos * strecke; l.x = profil(l.y).m + d.dx;
        }
        var ax = s.x - l.x, ay = s.y - l.y;
        if (ax * ax + ay * ay < (RADIUS + 10) * (RADIUS + 10) && s.schutz <= 0) {
          schaden(20);
          if (s.leben < 100 || s.versuche === 0) meldung(d.name + ' hat dich erwischt!');
        }
      });

      // Stationen ansagen
      while (s.marke < MARKEN.length && s.y >= MARKEN[s.marke].y) { ansage(MARKEN[s.marke].id); s.marke++; }
      if (s.y >= ZIEL) ende();
    }

    /* ---------- Zeichnen ---------- */
    function zeichnen() {
      var D = dunkel(), F = D
        ? { aussen: '#1b1413', wand: '#b9605c', innen: '#3b2523', falte: '#a4514e', text: '#f3e3e0', leise: '#c9aaa5', tor: '#e0707a' }
        : { aussen: '#f6e7e2', wand: '#c9605b', innen: '#fff6f3', falte: '#d98580', text: '#3a2320', leise: '#8a625c', tor: '#9c2f3a' };
      kamera = Math.max(0, Math.min(LAENGE - sichtH, s.y - sichtH * 0.42));
      ctx.setTransform(mass, 0, 0, mass, 0, -kamera * mass);
      ctx.fillStyle = F.aussen; ctx.fillRect(0, kamera, BREITE, sichtH);
      var oben = kamera - 10, unten = kamera + sichtH + 10, y, p;

      // Hohlraum des Verdauungstrakts
      function pfad() {
        ctx.beginPath();
        for (y = oben; y <= unten; y += 6) { p = profil(y); if (y === oben) ctx.moveTo(p.m - p.h, y); else ctx.lineTo(p.m - p.h, y); }
        for (y = unten; y >= oben; y -= 6) { p = profil(y); ctx.lineTo(p.m + p.h, y); }
        ctx.closePath();
      }
      pfad(); ctx.fillStyle = F.innen; ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = F.wand; ctx.lineJoin = 'round'; ctx.stroke();

      // Salzsäure
      var sp = saeureSpiegel(s.zeit);
      if (sp < SAEURE.boden && unten > SAEURE.von && oben < SAEURE.boden + 20) {
        ctx.save(); pfad(); ctx.clip();
        ctx.beginPath(); ctx.moveTo(0, SAEURE.boden + 12);
        for (var x = 0; x <= BREITE; x += 12) ctx.lineTo(x, sp + (ruhig ? 0 : Math.sin(x / 26 + s.zeit * 3) * 3));
        ctx.lineTo(BREITE, SAEURE.boden + 12); ctx.closePath();
        ctx.fillStyle = D ? 'rgba(196,214,60,.5)' : 'rgba(176,196,26,.5)'; ctx.fill();
        ctx.restore();
        if (sp < SAEURE.boden - 26) { ctx.fillStyle = F.text; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Salzsäure (HCl)', 185, sp + 20); }
      }

      // Galle und Pankreassaft
      if (STRAHL.y > oben && STRAHL.y < unten) {
        var st = s.zeit % STRAHL.zyklus; p = profil(STRAHL.y);
        ctx.fillStyle = F.leise; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Galle und Pankreassaft', p.m + p.h + 10, STRAHL.y + 3);
        if (st < STRAHL.warnung) {
          ctx.setLineDash([5, 5]); ctx.strokeStyle = '#8a9a1a'; ctx.lineWidth = 2;
          ctx.strokeRect(p.m - p.h + 4, STRAHL.y - 9, 2 * p.h - 8, 18); ctx.setLineDash([]);
        } else if (st < STRAHL.warnung + STRAHL.an) {
          ctx.fillStyle = D ? 'rgba(150,190,40,.85)' : 'rgba(122,160,20,.85)';
          ctx.fillRect(p.m - p.h + 4, STRAHL.y - 9, 2 * p.h - 8, 18);
        }
      }

      // Falten und Haustren
      ctx.fillStyle = F.falte;
      FALTEN.forEach(function (f) {
        if (f.y < oben || f.y > unten) return;
        p = profil(f.y);
        var x0 = f.seite === 'l' ? p.m - p.h : p.m + p.h - f.laenge;
        ctx.beginPath(); ctx.rect(x0, f.y - 6, f.laenge, 12); ctx.fill();
        ctx.beginPath(); ctx.arc(f.seite === 'l' ? x0 + f.laenge : x0, f.y, 6, 0, 6.3); ctx.fill();
      });

      // Sphinkter und Klappen
      TORE.forEach(function (tor) {
        if (tor.y < oben || tor.y > unten) return;
        p = profil(tor.y);
        var o = oeffnung(tor, s.zeit), luecke = o * (p.h - 5);
        ctx.fillStyle = F.tor;
        ctx.fillRect(p.m - p.h - 2, tor.y - TORDICKE, p.h - luecke + 2, 2 * TORDICKE);
        ctx.fillRect(p.m + luecke, tor.y - TORDICKE, p.h - luecke + 2, 2 * TORDICKE);
        ctx.fillStyle = F.leise; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
        var name = station(tor.id).name, breit = ctx.measureText(name).width;
        ctx.fillText(name, p.m + p.h + 10 + breit < BREITE ? p.m + p.h + 10 : Math.max(4, p.m - p.h - 10 - breit), tor.y + 3);
      });

      // Ziel
      if (ZIEL < unten) {
        p = profil(ZIEL);
        for (var k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? F.text : F.innen; ctx.fillRect(p.m - p.h + k * p.h / 4, ZIEL, p.h / 4, 8); }
        ctx.fillStyle = F.text; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Ziel', p.m, ZIEL + 26);
      }

      // Enzyme, Reflux, Bakterien
      laeufer.forEach(function (l) {
        if (l.y < oben || l.y > unten) return;
        var d = l.def;
        ctx.textAlign = 'center';
        if (d.art === 'bakterie') { ctx.font = '20px sans-serif'; ctx.fillStyle = F.text; ctx.fillText('🦠', l.x, l.y + 7); }
        else {
          ctx.beginPath(); ctx.arc(l.x, l.y, 10, 0, 6.3);
          ctx.fillStyle = d.art === 'reflux' ? (D ? '#c4d63c' : '#a9bd18') : (D ? '#b08cf0' : '#6f47c7'); ctx.fill();
          if (d.art === 'enzym') { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(d.name.charAt(0), l.x, l.y + 4); }
        }
        if (d.art !== 'reflux') { ctx.fillStyle = F.leise; ctx.font = '10px sans-serif'; ctx.fillText(d.name, l.x, l.y + 23); }
      });

      // Bissen
      if (s.schutz <= 0 || Math.floor(s.zeit * 10) % 2) {
        ctx.beginPath(); ctx.arc(s.x, s.y, RADIUS + 2, 0, 6.3); ctx.fillStyle = D ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.08)'; ctx.fill();
        ctx.font = '21px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = F.text; ctx.fillText(bissen[0], s.x, s.y + 7);
      }

      // Anzeigen
      LT.$('#t-zeit', h).textContent = zeitText(Math.floor(s.zeit * 10));
      LT.$('#t-balken', h).style.width = Math.max(0, s.leben) + '%';
      var ort = ABSCHNITTE[0][1];
      ABSCHNITTE.forEach(function (a) { if (s.y >= a[0]) ort = a[1]; });
      var chip = LT.$('#t-ort', h);
      if (chip.textContent !== ort) { chip.textContent = ort; LT.$('#t-leben', h).setAttribute('aria-label', 'Substanz ' + Math.round(s.leben) + ' Prozent'); }
    }

    function bild(jetzt) {
      var dt = Math.min(0.05, (jetzt - letzte) / 1000); letzte = jetzt;
      if (!s.pause && !s.fertig) schritt(dt);
      if (!s.fertig) { zeichnen(); raf = requestAnimationFrame(bild); }
    }

    /* ---------- Eingaben ---------- */
    var TASTE = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'o', ArrowDown: 'u', a: 'l', d: 'r', w: 'o', s: 'u', A: 'l', D: 'r', W: 'o', S: 'u' };
    function runter(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (TASTE[e.key]) { tasten[TASTE[e.key]] = true; e.preventDefault(); }
      else if (e.key === 'p' || e.key === 'P') pause();
    }
    function hoch(e) { if (TASTE[e.key]) tasten[TASTE[e.key]] = false; }
    function punkt(e) {
      var r = feld.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * BREITE, y: kamera + (e.clientY - r.top) / r.height * sichtH };
    }
    function pause(an) {
      s.pause = typeof an === 'boolean' ? an : !s.pause;
      var b = LT.$('#t-pause', h);
      if (b) { b.textContent = s.pause ? 'Weiter' : 'Pause'; b.setAttribute('aria-pressed', s.pause ? 'true' : 'false'); }
      letzte = performance.now();
    }
    function verborgen() { if (document.hidden) pause(true); }
    window.addEventListener('keydown', runter); window.addEventListener('keyup', hoch);
    window.addEventListener('resize', groesse); document.addEventListener('visibilitychange', verborgen);
    feld.addEventListener('pointerdown', function (e) { zeiger = punkt(e); try { feld.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } e.preventDefault(); });
    feld.addEventListener('pointermove', function (e) { if (zeiger) zeiger = punkt(e); });
    ['pointerup', 'pointercancel'].forEach(function (n) { feld.addEventListener(n, function () { zeiger = null; }); });
    LT.$$('[data-r]', h).forEach(function (b) {
      var r = b.getAttribute('data-r');
      b.addEventListener('pointerdown', function (e) { knopf[r] = true; e.preventDefault(); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { b.addEventListener(n, function () { knopf[r] = false; }); });
      // Tastatur: Enter/Leertaste auf dem Knopf bewegt ein Stück
      b.addEventListener('click', function (e) { if (e.detail === 0) { knopf[r] = true; setTimeout(function () { knopf[r] = false; }, 220); } });
    });
    LT.$('#t-pause', h).addEventListener('click', function () { pause(); });

    function stopp() {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', runter); window.removeEventListener('keyup', hoch);
      window.removeEventListener('resize', groesse); document.removeEventListener('visibilitychange', verborgen);
    }
    LT.aufraeumen = stopp;
    LT.zeitLaeuft = true;

    function ende() {
      s.fertig = true;
      stopp(); LT.aufraeumen = null; LT.zeitLaeuft = false;
      var zehntel = Math.max(1, Math.floor(s.zeit * 10));
      var rekord = !LT.S.traktBest || zehntel < LT.S.traktBest;
      if (rekord) LT.S.traktBest = zehntel;
      var xp = LT.xpDazu('trakt_geschafft');
      LT.uebungstag(); LT.speichern(); LT.awardsPruefen();
      LT.ergebnisSeite({
        titel: 'Geschafft!', eyebrow: 'Durch den Verdauungstrakt', zurueck: { pfad: '/modul/' + m.id, text: m.titel },
        html: '<p class="prozent">' + zeitText(zehntel) + '</p><p>Minuten für den ganzen Weg · ' +
          (s.versuche ? s.versuche + '-mal verdaut' : 'kein einziges Mal verdaut') + '.' +
          (rekord ? ' <b>Neue Bestzeit!</b>' : ' Bestzeit: ' + zeitText(LT.S.traktBest) + '.') + '</p>' +
          (xp ? '<p class="chip gold">+' + xp + ' XP</p>' : '') +
          '<h2>Deine Stationen</h2><ul class="wiederholen">' + TR.stationen.map(function (st) {
            return '<li><b>' + esc(st.name) + ':</b> ' + LT.txt(st.fakt, { ohneKlammer: true }) + LT.liesNach(st.quelle) + '</li>';
          }).join('') + '</ul>',
        knoepfe: '<a class="btn primaer" href="#/modul/' + esc(m.id) + '/trakt">Nochmal</a><a class="btn" href="#/modul/' + esc(m.id) + '">Zum Modul</a>'
      });
    }

    ansage('mund'); s.marke = 1;
    raf = requestAnimationFrame(bild);
  }
})();
