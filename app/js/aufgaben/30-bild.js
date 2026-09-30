/* Bildzuordnung: nummerierte Marker auf einer Buchabbildung (nur Kursversion).
   Jeder Marker bekommt eine Auswahlliste – barrierearm und ohne Drag & Drop. */
(function () {
  var esc = LT.esc;
  LT.typ('bildzuordnung', {
    name: 'Bildzuordnung',
    bauen: function (a, el) {
      var begriffe = LT.mischen(a.marker.map(function (k) { return k.begriff; }));
      el.innerHTML = '<p class="frage">' + LT.txt(a.frage) + '</p>' +
        '<figure class="bildbox"><img src="' + (LT.D.bilder[a.bild] || '') + '" alt="Abbildung mit ' + a.marker.length + ' nummerierten Markern">' +
        a.marker.map(function (k, i) {
          return '<span class="marker" style="left:' + k.x + '%;top:' + k.y + '%" aria-hidden="true">' + (i + 1) + '</span>';
        }).join('') + '</figure>' +
        '<div class="zuordnung">' + a.marker.map(function (k, i) {
          return '<div class="zrow"><label for="bz' + i + '">Marker ' + (i + 1) + '</label><select id="bz' + i + '"><option value="">– bitte wählen –</option>' +
            begriffe.map(function (b) { return '<option value="' + esc(b) + '">' + esc(b) + '</option>'; }).join('') + '</select></div>';
        }).join('') + '</div>';
      var sel = LT.$$('select', el);
      return {
        bereit: function () { return sel.every(function (s) { return s.value; }); },
        pruefen: function () {
          var n = 0;
          sel.forEach(function (s, i) {
            var ok = s.value === a.marker[i].begriff;
            s.closest('.zrow').classList.add(ok ? 'richtig' : 'falsch');
            if (ok) n++;
          });
          return n / sel.length;
        },
        loesung: function () {
          return '<ol class="loesung">' + a.marker.map(function (k) { return '<li>' + esc(k.begriff) + '</li>'; }).join('') + '</ol>';
        }
      };
    }
  });
})();
