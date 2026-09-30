# Enzym-Spiel

<!--
  So funktioniert das Spiel: Die SuS wählen ein Enzym. Über den Bildschirm fliegen Stoffe.
  Angeklickt werden dürfen nur die Stoffe unter „spaltet:“ des gewählten Enzyms.
  Alle anderen Stoffe (die „spaltet“-Stoffe der anderen Enzyme und die „nicht“-Stoffe des
  gewählten Enzyms) sind Fallen. Nach einem Fehlklick erscheint eine Erklärung:
    - steht der Stoff unter „nicht:“ des gewählten Enzyms, die Erklärung von dort,
    - sonst: „X wird nicht durch A gespalten, sondern durch B.“ + Erklärung von Enzym B.
  Format der Zeilen:  - Stoff => Erklärung
  Geprüft gegen: i-care S. 209, 214, 223, 238, 239, 240 · MKK S. 359
-->

modul: verdauung
einleitung: Du bist ein Verdauungsenzym! Wähle dein Enzym und tippe nur die Stoffe an, die du spalten kannst. Pass auf: Einige Stoffe sind schon so klein, dass sie gar nicht mehr gespalten werden müssen.

## Enzym: Amylase
ort: Mundspeichel und Pankreassaft
info: Spaltet Stärke in den Zweifachzucker Maltose.
quelle: i-care S. 214, 223, 238
spaltet:
- Stärke => Die Amylase spaltet den Vielfachzucker Stärke in den Zweifachzucker Maltose.
- Glykogen => Laut Tabelle spaltet die Amylase als Glykosidase Kohlenhydrate wie Stärke und Glykogen.
nicht:
- Glukose => Glukose ist schon ein Einfachzucker und kann direkt resorbiert werden.
- Zellulose => Zellulose ist ein Ballaststoff: ein Kohlenhydrat, das im Dünndarm nicht aufgeschlossen werden kann.

## Enzym: Pepsin
ort: Magen
info: Spaltet Eiweiße – aber erst, nachdem die Salzsäure sie denaturiert hat.
quelle: i-care S. 209, 239
spaltet:
- Eiweiße => Das Enzym Pepsin spaltet Eiweiße und spielt so in der Proteinverdauung eine Rolle.
- Pepsinogen => Pepsin kann Pepsinogen spalten und fördert so seine eigene Entstehung.
nicht:
- Aminosäuren => Aminosäuren sind die kleinsten Eiweißbausteine und werden direkt resorbiert.

## Enzym: Trypsin
ort: Pankreassaft (aktiv erst im Dünndarm)
info: Wichtigstes eiweißspaltendes Enzym des Pankreas. Es aktiviert auch die anderen Protease-Vorstufen.
quelle: i-care S. 223; MKK S. 359
spaltet:
- Eiweiße => Trypsin spaltet Peptidbindungen im Inneren des Eiweißmoleküls, dadurch entstehen kleinere Peptide.
- Trypsinogen => Trypsin überführt seine eigene Vorstufe Trypsinogen in die aktive Form.
- Chymotrypsinogen => Trypsin überführt Chymotrypsinogen in das aktive Chymotrypsin.
nicht:
- Aminosäuren => Aminosäuren sind die kleinsten Eiweißbausteine und werden direkt resorbiert.

## Enzym: Lipase
ort: Magen (Magenlipase) und Pankreassaft (Pankreaslipase)
info: Spaltet Fette. Die Pankreaslipase ist wichtiger als die Magenlipase.
quelle: i-care S. 240; MKK S. 359
spaltet:
- Triglyzeride => Die Lipase spaltet von den Neutralfetten (Triglyzeriden) Fettsäuren ab.
- Milchfett => Aus Milchfetten setzt die Magenlipase kurzkettige Fettsäuren frei.
nicht:
- Fettsäuren => Fettsäuren sind bereits Spaltprodukte der Fette und werden von den Enterozyten aufgenommen.
- Gallensäuren => Gallensäuren sind kein Nährstoff: Sie verteilen die Fette fein und bilden Mizellen.

## Enzym: Laktase
ort: Bürstensaum des Dünndarms
info: Spaltet Milchzucker. Fehlt sie, entsteht eine Laktoseintoleranz.
quelle: i-care S. 238–239
spaltet:
- Laktose => Die Laktase spaltet den Zweifachzucker Laktose („Milchzucker“) in Galaktose und Glukose.
nicht:
- Galaktose => Galaktose ist schon ein Einfachzucker und kann direkt resorbiert werden.

## Enzym: Maltase
ort: Bürstensaum des Dünndarms
info: Spaltet den Malzzucker, der beim Stärkeabbau entsteht.
quelle: i-care S. 238
spaltet:
- Maltose => Die Maltase spaltet den Zweifachzucker Maltose („Malzzucker“) in 2 Glukosemoleküle.
nicht:
- Glukose => Glukose ist schon ein Einfachzucker und kann direkt resorbiert werden.

## Enzym: Saccharase
ort: Bürstensaum des Dünndarms
info: Spaltet den Haushaltszucker.
quelle: i-care S. 238
spaltet:
- Saccharose => Die Saccharase spaltet den Zweifachzucker Saccharose („Rohrzucker“ oder „Rübenzucker“) in Glukose und Fruktose.
nicht:
- Fruktose => Fruktose ist schon ein Einfachzucker und kann direkt resorbiert werden.
