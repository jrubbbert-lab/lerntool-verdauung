# Durch den Verdauungstrakt

<!--
  So funktioniert das Spiel: Die SuS steuern einen Bissen von der Mundhöhle bis zum After.
  Die Sphinkter öffnen und schließen sich, die Salzsäure im Magen steigt und fällt, Enzyme und
  Verdauungssäfte sind unterwegs. Wer zu viel abbekommt, wird „verdaut“ und startet am letzten
  Sphinkter neu. Gemessen wird die Zeit.

  In dieser Datei stehen nur die TEXTE zu den Stationen (Name, Fachfakt, Quelle). Der Fakt
  erscheint beim Erreichen der Station und am Ende in der Übersicht.
  Die „id:“ legt fest, zu welcher Stelle im Spiel der Text gehört – bitte nicht ändern.
  Der Spielablauf selbst (Tempo, Abstände) steht in app/js/aufgaben/55-trakt.js.
-->

modul: aufbau
einleitung: Du bist ein Bissen auf dem Weg durch den Verdauungstrakt. Die Sphinkter öffnen und schließen sich, die Salzsäure im Magen steigt und fällt, und überall warten Enzyme. Weiche aus, warte den richtigen Moment ab und komm unverdaut bis zum Ziel!

## Station
id: mund
name: Mundhöhle
fakt: In der Mundhöhle wird die Nahrung zerkleinert und mit Speichel vermischt.
quelle: i-care S. 193

## Station
id: oesophagus_oben
name: Oberer Ösophagussphinkter
fakt: Er verschließt den Eingang des Ösophagus, damit beim Einatmen keine Luft hineingelangt. Beim Schlucken öffnet er sich.
quelle: i-care S. 204

## Station
id: oesophagus
name: Ösophagus
fakt: Ring- und Längsmuskulatur spannen sich abwechselnd an. Diese Peristaltik schiebt die Nahrung in Richtung Magen.
quelle: i-care S. 204

## Station
id: oesophagus_unten
name: Unterer Ösophagussphinkter
fakt: Er verhindert, dass Magensaft in den Ösophagus zurückfließt. Ist er geschwächt, kommt es zu Sodbrennen.
quelle: i-care S. 204

## Station
id: magen
name: Magen
fakt: Die Salzsäure ist der Hauptbestandteil des Magensafts. Sie wandelt Pepsinogen in Pepsin um und wirkt gegen Bakterien.
quelle: i-care S. 209

## Station
id: pylorus
name: Pylorus
fakt: Erreicht eine Welle der Magenperistaltik den Sphinkter am Pylorus, öffnet er sich kurz. Dann tritt eine kleine Menge Chymus in das Duodenum über.
quelle: i-care S. 209

## Station
id: duodenum
name: Duodenum
fakt: In das Duodenum werden Galle und Pankreassaft abgegeben. Der basische Pankreassaft neutralisiert die Magensäure.
quelle: i-care S. 224, 236

## Station
id: duenndarm
name: Jejunum und Ileum
fakt: Falten, Zotten und Mikrovilli vergrößern die Oberfläche der Dünndarmmukosa für die Resorption der Nährstoffe.
quelle: i-care S. 210; MKK S. 358

## Station
id: bauhin
name: Bauhin-Klappe
fakt: Die Bauhin-Klappe am Ende des Ileums wirkt wie ein Ventil. Sie verhindert, dass Keime aus dem Dickdarm in den Dünndarm aufsteigen.
quelle: i-care S. 213

## Station
id: kolon
name: Kolon
fakt: Die Ringmuskulatur des Kolons zieht sich stellenweise zusammen. Die Ausbuchtungen dazwischen heißen Haustren.
quelle: i-care S. 215

## Station
id: anal_innen
name: Innerer Analsphinkter
fakt: Der innere Sphinkter des Afters arbeitet unwillkürlich. Man kann ihn nicht bewusst steuern.
quelle: i-care S. 219

## Station
id: anal_aussen
name: Äußerer Analsphinkter
fakt: Den äußeren Sphinkter des Afters kann man willentlich anspannen und entspannen.
quelle: i-care S. 219
