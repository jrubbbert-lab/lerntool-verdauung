/* Zuordnung, Reihenfolge, Lückentext */
(function () {
  var esc = LT.esc, icon = LT.icon;

  /* ---------- Zuordnung: zu jedem Begriff links eine Auswahlliste ---------- */
  LT.typ('zuordnung', {
    name: 'Zuordnung',
    bauen: function (a, el) {
      var rechts = LT.mischen(a.paare.map(function (p) { return p.rechts; }).filter(function (r, i, arr) { return arr.indexOf(r) === i; }));
      var paare = LT.mischen(a.paare);
      el.innerHTML = '<p class="frage">' + LT.txt(a.frage) + '</p><div class="zuordnung">' +
        paare.map(function (p, k) {
          return '<div class="zrow"><label for="z' + k + '">' + LT.txt(p.links, { ohneKlammer: true }) + '</label>' +
            '<select id="z' + k + '"><option value="">– bitte wählen –</option>' +
            rechts.map(function (r) { return '<option value="' + esc(r) + '">' + esc(r.replace(/\[\[(.+?)(\|(.+?))?\]\]/g, function (_, x, __, y) { return y || x; })) + '</option>'; }).join('') +
            '</select></div>';
        }).join('') + '</div>';
      var sel = LT.$$('select', el);
      return {
        bereit: function () { return sel.every(function (s) { return s.value; }); },
        pruefen: function () {
          var n = 0;
          sel.forEach(function (s, k) {
            var ok = s.value === paare[k].rechts;
            s.closest('.zrow').classList.add(ok ? 'richtig' : 'falsch');
            if (ok) n++;
          });
          return n / paare.length;
        },
        loesung: function () {
          return '<ul class="loesung">' + paare.map(function (p) { return '<li>' + LT.txt(p.links, { ohneKlammer: true }) + ' → <b>' + LT.txt(p.rechts, { ohneKlammer: true }) + '</b></li>'; }).join('') + '</ul>';
        }
      };
    }
  });

  /* ---------- Reihenfolge: Knöpfe ▲▼ oder Pfeiltasten ---------- */
  LT.typ('reihenfolge', {
    name: 'Reihenfolge',
    bauen: function (a, el) {
      var reihe = a.schritte.map(function (s, i) { return i; });
      do { reihe = LT.mischen(reihe); } while (reihe.length > 1 && reihe.every(function (x, i) { return x === i; }));
      el.innerHTML = '<p class="frage">' + LT.txt(a.frage) + '</p>' +
        '<p class="muted klein" id="rf-hilfe">Verschiebe mit den Pfeil-Knöpfen oder: Eintrag antippen bzw. mit Tab auswählen, dann Pfeiltaste ↑ ↓.</p>' +
        '<ol class="reihenfolge" aria-describedby="rf-hilfe"></ol>';
      var ol = LT.$('ol', el);
      function zeichnen(fokus) {
        ol.innerHTML = reihe.map(function (idx, pos) {
          return '<li tabindex="0" data-pos="' + pos + '" aria-label="Platz ' + (pos + 1) + ': ' + esc(a.schritte[idx].replace(/\[\[(.+?)(\|(.+?))?\]\]/g, function (_, x, __, y) { return y || x; })) + '">' +
            '<span class="nr">' + (pos + 1) + '</span><span class="t">' + LT.txt(a.schritte[idx], { ohneKlammer: true }) + '</span>' +
            '<button type="button" class="icon-btn" data-hoch aria-label="nach oben"' + (pos === 0 ? ' disabled' : '') + '>' + icon('hoch') + '</button>' +
            '<button type="button" class="icon-btn" data-runter aria-label="nach unten"' + (pos === reihe.length - 1 ? ' disabled' : '') + '>' + icon('runter') + '</button></li>';
        }).join('');
        if (fokus != null) { var li = ol.children[fokus]; if (li) li.focus(); }
      }
      function tauschen(pos, ziel) {
        if (ziel < 0 || ziel >= reihe.length) return;
        var t = reihe[pos]; reihe[pos] = reihe[ziel]; reihe[ziel] = t;
        zeichnen(ziel);
        LT.ansage('Jetzt auf Platz ' + (ziel + 1) + '.');
      }
      zeichnen();
      var gesperrt = false;
      ol.addEventListener('click', function (e) {
        if (gesperrt) return;
        var li = e.target.closest('li'); if (!li) return;
        var pos = +li.getAttribute('data-pos');
        if (e.target.closest('[data-hoch]')) tauschen(pos, pos - 1);
        if (e.target.closest('[data-runter]')) tauschen(pos, pos + 1);
      });
      ol.addEventListener('keydown', function (e) {
        if (gesperrt) return;
        var li = e.target.closest('li'); if (!li || e.target !== li) return;
        var pos = +li.getAttribute('data-pos');
        if (e.key === 'ArrowUp') { e.preventDefault(); tauschen(pos, pos - 1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); tauschen(pos, pos + 1); }
      });
      return {
        bereit: function () { return true; },
        pruefen: function () {
          gesperrt = true;
          var n = 0;
          LT.$$('li', ol).forEach(function (li, pos) {
            var ok = reihe[pos] === pos;
            li.classList.add(ok ? 'richtig' : 'falsch');
            if (ok) n++;
          });
          return n / reihe.length;
        },
        loesung: function () {
          return '<p><b>Richtige Reihenfolge:</b></p><ol class="loesung">' + a.schritte.map(function (s) { return '<li>' + LT.txt(s, { ohneKlammer: true }) + '</li>'; }).join('') + '</ol>';
        }
      };
    }
  });

  /* ---------- Lückentext: {{Lösung|Alternative}} ---------- */
  LT.normal = function (s) {
    return String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '').trim();
  };
  LT.typ('lückentext', {
    name: 'Lückentext',
    bauen: function (a, el) {
      var luecken = [];
      var mitMarken = a.text.replace(/\{\{(.+?)\}\}/g, function (_, innen) {
        luecken.push(innen.split('|').map(function (x) { return x.trim(); }));
        return '§' + (luecken.length - 1) + '§';
      });
      var html = LT.absaetze(mitMarken).replace(/§(\d+)§/g, function (_, k) {
        var laenge = Math.max(6, luecken[k][0].length + 2);
        return '<input type="text" class="luecke" data-k="' + k + '" size="' + laenge + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Lücke ' + (+k + 1) + '">';
      });
      el.innerHTML = '<p class="muted klein">Ergänze die Lücken. Groß- und Kleinschreibung ist egal.</p><div class="lueckentext">' + html + '</div>';
      var inputs = LT.$$('input', el);
      inputs.forEach(function (inp, k) {
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && inputs[k + 1]) { e.preventDefault(); inputs[k + 1].focus(); } });
      });
      return {
        bereit: function () { return inputs.every(function (i) { return i.value.trim(); }); },
        pruefen: function () {
          var n = 0;
          inputs.forEach(function (inp) {
            var erlaubt = luecken[+inp.getAttribute('data-k')];
            var ok = erlaubt.some(function (e) { return LT.normal(e) === LT.normal(inp.value); });
            inp.classList.add(ok ? 'richtig' : 'falsch');
            if (!ok) inp.insertAdjacentHTML('afterend', ' <span class="korrektur">' + esc(erlaubt[0]) + '</span>');
            if (ok) n++;
          });
          return n / inputs.length;
        }
      };
    }
  });
})();
