# Awards

<!--
  Jeder Award ist ein Abschnitt. Felder:
    id:        feste Kennung (nie ändern, sonst verlieren SuS den Award)
    name:      eine Form für alle – oder „weiblich / männlich / neutral“
    geheim:    ja = steht bis zum Erreichen nur als „???“ auf der Wand
    regel:     wird von der App ausgewertet (Liste siehe README)
    bedingung: Text für die SuS: Wie bekomme ich den Award?
    fakt:      Fachfakt aus den Büchern (Mini-Karteikarte) – Pflicht
    quelle:    Buch und Seite des Fakts
    form:      rund | sechseck | zacken | schild
    farbe1, farbe2: Farbverlauf der Plakette
    icon:      Symbol in der Mitte
-->

## Nachteule
id: nachteule
name: Nachteule
geheim: ja
regel: modul_uhrzeit 0 4
bedingung: Schließe ein Modul zwischen 0 und 4 Uhr ab.
fakt: Den Grundumsatz bestimmt man morgens, 12–14 Stunden nach der letzten Mahlzeit – liegend und in völliger Ruhe.
quelle: i-care S. 244
form: zacken
farbe1: #3d4f9e
farbe2: #1b2352
icon: mond

## Früher Vogel
id: frueher-vogel
name: Früher Vogel
geheim: nein
regel: modul_uhrzeit 5 7
bedingung: Schließe ein Modul zwischen 5 und 7 Uhr ab.
fakt: Kohlenhydratreiche Speisen wie das Frühstücksbrötchen verweilen am kürzesten im Magen, fettreiche Speisen wie die Weihnachtsgans am längsten.
quelle: MKK S. 355
form: rund
farbe1: #f6c453
farbe2: #e0782f
icon: sonne

## Viszeralchirurgin
id: viszeralchirurgin
name: Viszeralchirurgin / Viszeralchirurg / Viszeralchirurg:in
geheim: nein
regel: operatoren_afb III
bedingung: Bestehe alle Operatoraufgaben aus Anforderungsbereich III.
fakt: Die Gallenblase wird heute meist minimal-invasiv entfernt („Schlüsselloch-Chirurgie“): Die Operation findet durch kleinste Zugänge statt.
quelle: MKK S. 361
form: sechseck
farbe1: #5b6b82
farbe2: #2b3445
icon: skalpell

## Darmcharmeur
id: darmcharmeur
name: Darmcharmeur
geheim: nein
regel: modul_mehrfach duenndarm,dickdarm 2 80
bedingung: Schaffe Dünndarm und Dickdarm jeweils zweimal mit mindestens 80 %.
fakt: Der Dünndarm ist insgesamt 3–5 m lang, Dickdarm und Rektum zusammen etwa 1,5 m.
quelle: i-care S. 210; MKK S. 362
form: rund
farbe1: #e57aa6
farbe2: #9c3466
icon: darm

## Gastroenterologin
id: gastroenterologin
name: Gastroenterologin / Gastroenterologe / Gastroenterolog:in
geheim: nein
regel: bloecke_bestanden 2
bedingung: Bestehe alle Organmodule.
fakt: Jede länger bestehende [[Dysphagie]] sollte endoskopisch abgeklärt werden.
quelle: MKK S. 353
form: schild
farbe1: #2f9e6b
farbe2: #17573a
icon: stethoskop

## 21er Klinge
id: klinge-21
name: 21er Klinge
geheim: nein
regel: serie_richtig 21
bedingung: Beantworte 21 Aufgaben in Folge richtig.
fakt: Durchbricht ein Geschwür die Magen- oder Duodenalwand (Perforation), gelangt [[Chymus]] in die Peritonealhöhle. Es drohen ein akutes Abdomen und eine lebensgefährliche Peritonitis.
quelle: MKK S. 357
form: zacken
farbe1: #b9c3cf
farbe2: #5d6978
icon: klinge

## Hoch hinaus
id: hoch-hinaus
name: Hoch hinaus
geheim: nein
regel: verbesserung 30
bedingung: Verbessere dich in einem Modul um mindestens 30 Prozentpunkte.
fakt: Der [[Fundus]] ist beim stehenden Menschen die höchstgelegene Region des Magens. Dort sammelt sich die beim Essen mitgeschluckte Luft.
quelle: MKK S. 354
form: sechseck
farbe1: #56b4e9
farbe2: #1f5f9e
icon: pfeil

## 3-Tage-Meisterin
id: drei-tage
name: 3-Tage-Meisterin / 3-Tage-Meister / 3-Tage-Meister:in
geheim: nein
regel: tage_in_folge 3
bedingung: Übe an drei Tagen in Folge.
fakt: Schon nach einer Fastenperiode von 24 Stunden sind die Glykogenvorräte der Leber erschöpft.
quelle: MKK S. 370
form: rund
farbe1: #f2b544
farbe2: #c9820f
icon: kalender

## Ballaststoff
id: ballaststoff
name: Ballaststoff
geheim: nein
regel: tage_in_folge 14
bedingung: Übe an 14 Tagen in Folge.
fakt: Täglich sollte man mindestens 30 g Ballaststoffe essen. Sie quellen im Verdauungstrakt auf und tragen zum Sättigungsgefühl bei.
quelle: i-care S. 214, 246
form: zacken
farbe1: #8fbf4a
farbe2: #4b7a1f
icon: aehre

## Beleidigte Leberwurst
id: leberwurst
name: Beleidigte Leberwurst
geheim: nein
regel: unter_dann_ueber 50 90
bedingung: Schaffe ein Modul, in dem du einmal unter 50 % lagst, später mit über 90 %.
fakt: Die Leber bildet kontinuierlich über den Tag etwa 0,5 l Galle.
quelle: MKK S. 359
form: schild
farbe1: #c47a5a
farbe2: #7a3a22
icon: leber

## Säurefest
id: saeurefest
name: Säurefest
geheim: nein
regel: modul_prozent magen 100
bedingung: Schaffe das Modul Magen mit 100 %.
fakt: Bei maximaler Salzsäuresekretion sinkt der pH-Wert des Magensafts auf Werte um pH 1.
quelle: MKK S. 354
form: sechseck
farbe1: #d6e04a
farbe2: #8a9a1a
icon: tropfen

## Zottenkönigin
id: zottenkoenigin
name: Zottenkönigin / Zottenkönig / Zottenkönig:in
geheim: nein
regel: modul_mehrfach duenndarm 2 80
bedingung: Schaffe das Modul Dünndarm zweimal mit mindestens 80 %.
fakt: Auf einem Quadratmillimeter Dünndarmmukosa sitzen bis zu 40 Zotten. Jede Zotte besitzt eigene kleine Blut- und Lymphgefäße.
quelle: i-care S. 210
form: zacken
farbe1: #f2b544
farbe2: #b8478a
icon: krone

## Enzym-Jägerin
id: enzym-jaegerin
name: Enzym-Jägerin / Enzym-Jäger / Enzym-Jäger:in
geheim: nein
regel: enzym_punkte 25
bedingung: Erreiche im Enzym-Spiel mindestens 25 Punkte in einer Runde.
fakt: Die Enzyme des Bürstensaums sind nach dem Zucker benannt, den sie spalten: Laktase spaltet Laktose, Maltase Maltose, Saccharase Saccharose.
quelle: i-care S. 238
form: rund
farbe1: #1f8fa3
farbe2: #0e4f5c
icon: enzym

## Karteikarten-Königin
id: karteikarten-koenigin
name: Karteikarten-Königin / Karteikarten-König / Karteikarten-König:in
geheim: nein
regel: karten_fach5 100
bedingung: Bringe 100 Karteikarten ins letzte Leitner-Fach.
fakt: 8 der 20 Aminosäuren sind [[essenziell]] – der Körper kann sie nicht selbst bilden.
quelle: i-care S. 243
form: schild
farbe1: #9b7be0
farbe2: #4d2f9e
icon: karten

## Diagnose-Detektivin
id: diagnose-detektivin
name: Diagnose-Detektivin / Diagnose-Detektiv / Diagnose-Detektiv:in
geheim: nein
regel: diagnosen 5
bedingung: Stelle in fünf Fallbeispielen die richtige Diagnose.
fakt: Beim H2-Atemtest wird Wasserstoff in der Ausatemluft gemessen: Je schlechter ein Kohlenhydrat resorbiert wird, desto mehr davon bauen Bakterien im Dickdarm ab und desto mehr H2 entsteht.
quelle: MKK S. 362
form: sechseck
farbe1: #4a5a73
farbe2: #1c2533
icon: lupe

## Insulin-Ass
id: insulin-ass
name: Insulin-Ass
geheim: nein
regel: modul_prozent diabetes 100
bedingung: Schaffe das Modul Diabetes mellitus ohne Fehler.
fakt: Die B-Zellen der Langerhans-Inseln bilden das blutzuckersenkende Insulin, die A-Zellen das blutzuckersteigernde Glukagon.
quelle: MKK S. 367
form: rund
farbe1: #d0a21a
farbe2: #8a6400
icon: spritze

## Pförtnerin
id: pfoertnerin
name: Pförtnerin / Pförtner / Pförtner:in
geheim: nein
regel: block_frei 2
bedingung: Schalte den Block „Organe“ frei.
fakt: [[Pylorus]] bedeutet „Magenpförtner“. Dort sitzt der Magensphinkter, der den Magen gegenüber dem Dünndarm verschließt.
quelle: i-care S. 205
form: schild
farbe1: #c9820f
farbe2: #7a4a05
icon: tor

## Enterohepatischer Kreislauf
id: enterohepatisch
name: Enterohepatischer Kreislauf
geheim: nein
regel: modul_abschluesse 3
bedingung: Schließe dasselbe Modul dreimal ab.
fakt: Etwa 90 % der Gallensäuren werden im terminalen Ileum zurückgewonnen. Durch dieses „Recycling“ (bis 14-mal pro Tag) muss die Leber nur wenige Gallensäuren neu herstellen.
quelle: MKK S. 359
form: rund
farbe1: #6bbf7a
farbe2: #2d7a3c
icon: kreislauf

## Gut gekaut ist halb verdaut
id: gut-gekaut
name: Gut gekaut ist halb verdaut
geheim: nein
regel: modul_prozent mundhoehle 100
bedingung: Schaffe das Modul Mundhöhle und Ösophagus mit 100 %.
fakt: Brot schmeckt beim langen Kauen süßlich, weil die Amylase des Speichels [[Maltose]] von der Stärke abspaltet.
quelle: i-care S. 197
form: zacken
farbe1: #f07c5a
farbe2: #b03a1e
icon: mund

## Peristaltik-Profi
id: peristaltik-profi
name: Peristaltik-Profi
geheim: nein
regel: reihenfolge_fehlerfrei 10
bedingung: Löse zehn Reihenfolgeaufgaben ohne Fehler.
fakt: Im Magen laufen etwa alle 20 Sekunden peristaltische Wellen in Richtung Pylorus und durchmischen den [[Chymus]].
quelle: MKK S. 355
form: sechseck
farbe1: #e57aa6
farbe2: #7a52c7
icon: welle

## Mikrovilli-Millionärin
id: mikrovilli
name: Mikrovilli-Millionärin / Mikrovilli-Millionär / Mikrovilli-Millionär:in
geheim: nein
regel: xp 1000
bedingung: Sammle 1.000 XP.
fakt: Durch Kerckring-Falten, Zotten, Krypten und [[Mikrovilli]] erreicht die resorbierende Oberfläche des Dünndarms etwa 200 m² – so viel wie zwei Vierzimmerwohnungen!
quelle: MKK S. 358
form: zacken
farbe1: #f6d365
farbe2: #d4a017
icon: mikrovilli

## Bauchgefühl
id: bauchgefuehl
name: Bauchgefühl
geheim: nein
regel: quiz_serie 10
bedingung: Beantworte im Quiz auf Zeit zehn Fragen in Folge richtig.
fakt: „Magenknurren“ ist kein Hungerzeichen: Im verdauungsfreien Intervall läuft alle 1,5–2 Stunden eine kräftige Welle über Magen und Dünndarm und entfernt Bakterien und Speisereste.
quelle: MKK S. 358
form: rund
farbe1: #ff9a76
farbe2: #c4452b
icon: blitz

## Pechvogel-Bezwingerin
id: pechvogel
name: Pechvogel-Bezwingerin / Pechvogel-Bezwinger / Pechvogel-Bezwinger:in
geheim: ja
regel: freitag13 80
bedingung: Schaffe an einem Freitag, dem 13., ein Modul mit mindestens 80 %.
fakt: Glück im Unglück: Bei der Hälfte der gesunden Erwachsenen findet man eine Besiedlung mit Helicobacter pylori, ohne dass sie Beschwerden haben.
quelle: MKK S. 356
form: schild
farbe1: #2b2b2b
farbe2: #6b6b6b
icon: kleeblatt

## Aprilscherz
id: aprilscherz
name: Aprilscherz
geheim: ja
regel: aprilscherz
bedingung: Durchschaue am 1. April die Scherzfrage.
fakt: Ein zäher Schleimfilm mit puffernden Bikarbonat-Ionen schützt die Magenmukosa vor Salzsäure und Pepsin und verhindert so eine Selbstverdauung.
quelle: MKK S. 355
form: zacken
farbe1: #ff6fb5
farbe2: #7a5cff
icon: narr
