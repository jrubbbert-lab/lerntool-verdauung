# Enzym-Spiel

<!--
  So funktioniert das Spiel: Die SuS wählen ein Enzym. Über den Bildschirm fliegen Stoffe.
  Angeklickt werden dürfen nur die Stoffe unter „spaltet:“ des gewählten Enzyms.
  Alle anderen Stoffe (die „spaltet“-Stoffe der anderen Enzyme und die „nicht“-Stoffe des
  gewählten Enzyms) sind Fallen. Nach einem Fehlklick erscheint eine Erklärung:
    - steht der Stoff unter „nicht:“ des gewählten Enzyms, die Erklärung von dort,
    - sonst: „X wird nicht durch A gespalten, sondern durch B.“ + Erklärung von Enzym B.
  Format der Zeilen:  - Stoff => Erklärung
  Bewusst einfach gehalten: nur Alltagsbegriffe als Stoffe (keine Enzymvorstufen).
  Geprüft gegen: i-care S. 209, 214, 223, 238, 239, 240
-->

modul: verdauung
einleitung: Du bist ein Verdauungsenzym! Wähle dein Enzym und tippe nur die Stoffe an, die du spalten kannst. Pass auf: Einige Stoffe sind schon so klein, dass sie gar nicht mehr gespalten werden müssen.

## Enzym: Amylase
ort: Mundspeichel und Pankreassaft
info: Spaltet Stärke.
quelle: i-care S. 214, 238
spaltet:
- Stärke => Die Amylase spaltet den Vielfachzucker Stärke in den Zweifachzucker Maltose.
nicht:
- Glukose => Glukose ist schon ein Einfachzucker und kann direkt aufgenommen werden.
- Zellulose => Zellulose ist ein Ballaststoff: Sie kann im Dünndarm nicht verdaut werden.

## Enzym: Pepsin
ort: Magen
info: Spaltet Eiweiße im Magen.
quelle: i-care S. 209, 239
spaltet:
- Eiweiße => Das Enzym Pepsin spaltet im Magen Eiweiße.
nicht:
- Aminosäuren => Aminosäuren sind die kleinsten Eiweißbausteine und werden direkt aufgenommen.

## Enzym: Trypsin
ort: Pankreassaft (aktiv erst im Dünndarm)
info: Spaltet Eiweiße im Dünndarm.
quelle: i-care S. 223, 240
spaltet:
- Eiweiße => Trypsin aus dem Pankreassaft spaltet im Dünndarm Eiweiße.
nicht:
- Aminosäuren => Aminosäuren sind die kleinsten Eiweißbausteine und werden direkt aufgenommen.

## Enzym: Lipase
ort: Magen und Pankreassaft
info: Spaltet Fette.
quelle: i-care S. 240
spaltet:
- Fette => Die Lipase spaltet die Nahrungsfette. Die Lipase aus dem Pankreas ist dabei wichtiger als die des Magens.
nicht:
- Fettsäuren => Fettsäuren sind schon Bausteine der Fette und werden von den Darmzellen aufgenommen.
- Gallensäuren => Gallensäuren sind kein Nährstoff: Sie verteilen die Fette nur fein.

## Enzym: Laktase
ort: Dünndarmschleimhaut
info: Spaltet Milchzucker. Fehlt sie, entsteht eine Laktoseintoleranz.
quelle: i-care S. 238–239
spaltet:
- Laktose => Die Laktase spaltet den Milchzucker (Laktose) in Einfachzucker.
nicht:
- Galaktose => Galaktose ist schon ein Einfachzucker und kann direkt aufgenommen werden.

## Enzym: Maltase
ort: Dünndarmschleimhaut
info: Spaltet Malzzucker, der beim Abbau der Stärke entsteht.
quelle: i-care S. 238
spaltet:
- Maltose => Die Maltase spaltet den Malzzucker (Maltose) in zwei Glukosemoleküle.
nicht:
- Glukose => Glukose ist schon ein Einfachzucker und kann direkt aufgenommen werden.

## Enzym: Saccharase
ort: Dünndarmschleimhaut
info: Spaltet Haushaltszucker.
quelle: i-care S. 238
spaltet:
- Saccharose => Die Saccharase spaltet den Rohr- bzw. Rübenzucker (Saccharose) in Glukose und Fruktose.
nicht:
- Fruktose => Fruktose ist schon ein Einfachzucker und kann direkt aufgenommen werden.
