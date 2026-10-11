/* Single-Choice (Radio-Buttons) und Multiple-Choice (Checkboxen) */
(function () {
  var esc = LT.esc;
  var zaehler = 0;

  /**
   * Bewertung einer Multiple-Choice-Aufgabe.
   * optionen: [{text, richtig}], gewaehlt: [true/false je Option, gleiche Reihenfolge]
   * Rückgabe: Anteil 0–1. Nur 1 zählt als „richtig“ (Serien, „Meine Fehler“, Awards).
   *
   * Aktuelle Regel: alles oder nichts – jede Option muss stimmen.
   */
  LT.bewerteMC = function (optionen, gewaehlt) {
    var alleRichtig = optionen.every(function (o, i) { return o.richtig === gewaehlt[i]; });
    return alleRichtig ? 1 : 0;
  };

  function auswahl(mehrfach) {
    return {
      name: mehrfach ? 'Multiple-Choice' : 'Single-Choice',
      bauen: function (a, el) {
        var gruppe = 'opt' + (zaehler++);
        var opts = LT.mischen(a.optionen.map(function (o, i) { return { o: o, i: i }; }));
        el.innerHTML = '<fieldset class="optionen"><legend class="frage">' + LT.txt(a.frage) +
          '<span class="kennung">' + (mehrfach ? 'Mehrere Antworten möglich' : 'Wähle genau eine Antwort') + '</span></legend>' +
          opts.map(function (x, k) {
            return '<label class="opt"><input type="' + (mehrfach ? 'checkbox' : 'radio') + '" name="' + gruppe + '" value="' + k + '"> <span>' +
              LT.txt(x.o.text, { ohneKlammer: true }) + '</span></label>';
          }).join('') + '</fieldset>';
        var inputs = LT.$$('input', el);
        return {
          bereit: function () { return inputs.some(function (i) { return i.checked; }); },
          pruefen: function () {
            inputs.forEach(function (inp, k) {
              var o = opts[k].o, lab = inp.closest('.opt');
              if (o.richtig) lab.classList.add('richtig');
              if (inp.checked && !o.richtig) lab.classList.add('falsch');
              if (o.richtig && !inp.checked && mehrfach) lab.classList.add('fehlt');
            });
            if (!mehrfach) return inputs.some(function (inp, k) { return inp.checked && opts[k].o.richtig; }) ? 1 : 0;
            // in Originalreihenfolge zurückübersetzen
            var gewaehlt = a.optionen.map(function () { return false; });
            inputs.forEach(function (inp, k) { gewaehlt[opts[k].i] = inp.checked; });
            return LT.bewerteMC(a.optionen, gewaehlt);
          }
        };
      }
    };
  }
  LT.typ('single-choice', auswahl(false));
  LT.typ('multiple-choice', auswahl(true));
})();
