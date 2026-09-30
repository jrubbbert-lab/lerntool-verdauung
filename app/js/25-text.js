/* Text aus den Inhaltsdateien darstellen.
   [[Begriff]] bzw. [[Begriff|Anzeige]] → antippbarer Fachbegriff. Beim ERSTEN Auftreten
   im aktuellen Modul wird der deutsche Begriff in Klammern ergänzt (Fachbegriff-Regel). */
(function () {
  var glossarIndex = {};
  Object.keys(LT.D.glossar).forEach(function (k) { glossarIndex[k.toLowerCase()] = k; });

  LT.kontext = { modul: null, gesehen: {} };
  /** Beim Betreten eines Moduls aufrufen: Fachbegriffe gelten wieder als „neu“. */
  LT.modulKontext = function (modulId) { LT.kontext = { modul: modulId, gesehen: {} }; };

  LT.glossarEintrag = function (begriff) {
    var k = glossarIndex[String(begriff).toLowerCase()];
    return k ? { begriff: k, eintrag: LT.D.glossar[k] } : null;
  };

  /** Inline-Text (ohne Absätze) */
  LT.txt = function (roh, optionen) {
    optionen = optionen || {};
    var s = LT.esc(roh || '');
    s = s.replace(/\[\[(.+?)\]\]/g, function (_, innen) {
      var teile = innen.split('|');
      var g = LT.glossarEintrag(teile[0].trim());
      var anzeige = (teile[1] || teile[0]).trim();
      if (!g) return anzeige;
      var zusatz = '';
      if (!optionen.ohneKlammer && !LT.kontext.gesehen[g.begriff]) {
        LT.kontext.gesehen[g.begriff] = true;
        zusatz = ' (' + LT.esc(g.eintrag.deutsch) + ')';
      }
      return '<button type="button" class="begriff" data-begriff="' + LT.esc(g.begriff) + '">' + anzeige + '</button>' + zusatz;
    });
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return s;
  };

  /** Mehrzeiliger Text: Leerzeile = neuer Absatz */
  LT.absaetze = function (roh, optionen) {
    return String(roh || '').split(/\n\s*\n/).map(function (a) {
      return '<p>' + LT.txt(a.trim(), optionen).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  };

  /** „Lies nach: I care Anatomie, Physiologie, S. 205“ */
  LT.quelleText = function (quellen) {
    return (quellen || []).map(function (q) {
      var m = /^(i-care|MKK) (S\. .+)$/.exec(q);
      return m ? LT.D.buecher[m[1]] + ', ' + m[2] : q;
    }).join('; ');
  };
  LT.liesNach = function (quellen) {
    if (!quellen || !quellen.length) return '';
    return '<p class="lies">' + LT.icon('buch') + '<span>Lies nach: ' + LT.esc(LT.quelleText(quellen)) + '</span></p>';
  };

  /* ---------- Dialog (Glossar, Bestätigungen, Award-Details) ---------- */
  LT.dialog = function (titel, html, knoepfe) {
    var d = LT.$('#dialog');
    d.innerHTML = '<div class="d-innen"><div class="d-kopf"><h2 id="dialog-titel">' + titel + '</h2>' +
      '<button type="button" class="icon-btn" data-schliessen aria-label="Schließen">' + LT.icon('kreuz') + '</button></div>' +
      html + '<div class="reihe" data-knoepfe></div></div>';
    var leiste = LT.$('[data-knoepfe]', d);
    (knoepfe || []).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ' + (k.klasse || ''); b.textContent = k.text;
      b.addEventListener('click', function () { if (k.aktion() !== false) LT.dialogZu(); });
      leiste.appendChild(b);
    });
    LT.$('[data-schliessen]', d).addEventListener('click', LT.dialogZu);
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  };
  LT.dialogZu = function () {
    var d = LT.$('#dialog');
    if (typeof d.close === 'function' && d.open) d.close(); else d.removeAttribute('open');
  };

  LT.glossarZeigen = function (begriff) {
    var g = LT.glossarEintrag(begriff);
    if (!g) return;
    LT.dialog(LT.esc(g.begriff),
      '<p><b>Deutsch:</b> ' + LT.esc(g.eintrag.deutsch) + '</p>' +
      (g.eintrag.erklaerung ? '<p>' + LT.txt(g.eintrag.erklaerung, { ohneKlammer: true }) + '</p>' : '') +
      LT.liesNach(g.eintrag.quelle));
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.begriff');
    if (b) { e.preventDefault(); LT.glossarZeigen(b.getAttribute('data-begriff')); }
  });
})();
