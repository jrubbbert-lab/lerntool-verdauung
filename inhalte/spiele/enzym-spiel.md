# Enzym-Spiel

<!--
  So funktioniert das Spiel: Die SuS wählen ein Enzym. Lebensmittel fliegen kreuz und quer
  über das Spielfeld. Angetippt werden dürfen nur Lebensmittel unter „spaltet:“ – also solche,
  in denen ein Nährstoff steckt, den das Enzym spalten kann.
  Fallen sind NUR die Lebensmittel unter „nicht:“ des gewählten Enzyms.

  WICHTIG beim Ergänzen: Viele Lebensmittel enthalten mehrere Nährstoffe (z. B. Ei: Fett UND
  Eiweiß; Kartoffeln: Stärke UND Eiweiß). Als Falle („nicht:“) deshalb nur Lebensmittel eintragen,
  die den Nährstoff des Enzyms praktisch nicht enthalten. Sonst würde ein richtiger Klick als
  Fehler gewertet.

  Format:  - Symbol Lebensmittel => Erklärung (erscheint nach dem Antippen bzw. Fehlklick)
  Lebensmittel und Nährstoffe laut Buch:
    Stärke: Kartoffeln, Reis (MKK S. 361), Brot (i-care S. 197)
    Saccharose (Kristallzucker): Cola (i-care S. 249)
    Laktose (Milchzucker): Milch; lange gereifter Käse enthält kaum noch Milchzucker (i-care S. 238–239)
    Fett: Wurst, Eier, Milch, Nüsse, Butter, Öl (MKK S. 362)
    Eiweiß: Fleisch, Milchprodukte, Eier (i-care S. 243); Bohnen, Rindfleisch, Kuhmilch (i-care S. 246)
  Maltase fehlt bewusst: Die Bücher nennen kein Lebensmittel, das Maltose enthält.
-->

modul: verdauung
einleitung: Du bist ein Verdauungsenzym! Lebensmittel fliegen kreuz und quer über den Bildschirm. Überlege bei jedem: Steckt darin etwas, das du spalten kannst? Dann tippe es an. Wähle zuerst dein Enzym.

## Enzym: Amylase
ort: Mundspeichel und Pankreassaft
info: Spaltet Stärke.
quelle: MKK S. 361, 362; i-care S. 197, 238, 243, 249
spaltet:
- 🥔 Kartoffeln => Kartoffeln enthalten Stärke. Die Amylase spaltet sie in Malzzucker (Maltose).
- 🍚 Reis => Reis enthält Stärke. Die Amylase spaltet sie in Malzzucker (Maltose).
- 🍞 Brot => Brot enthält Stärke. Deshalb schmeckt es beim langen Kauen süßlich: Die Amylase spaltet Malzzucker ab.
nicht:
- 🧈 Butter => Butter liefert Fett – das spaltet nicht die Amylase, sondern die Lipase.
- 🫒 Öl => Öl liefert Fett – das spaltet nicht die Amylase, sondern die Lipase.
- 🥩 Fleisch => Fleisch liefert vor allem Eiweiß – das spalten Pepsin und Trypsin.
- 🥤 Cola => Cola enthält Kristallzucker (Saccharose), aber keine Stärke. Den Zucker spaltet die Saccharase.
- 🥛 Milch => Milch enthält Milchzucker (Laktose), aber keine Stärke. Den Milchzucker spaltet die Laktase.

## Enzym: Pepsin
ort: Magen
info: Spaltet Eiweiße im Magen.
quelle: i-care S. 209, 243, 246, 249; MKK S. 362
spaltet:
- 🥩 Fleisch => Fleisch enthält Eiweiß. Pepsin beginnt im Magen, es zu spalten.
- 🥚 Ei => Eier enthalten Eiweiß. Pepsin beginnt im Magen, es zu spalten.
- 🫘 Bohnen => Bohnen enthalten Eiweiß. Pepsin beginnt im Magen, es zu spalten.
- 🥛 Milch => Milch enthält Eiweiß. Pepsin beginnt im Magen, es zu spalten.
nicht:
- 🫒 Öl => Öl liefert Fett – das spaltet die Lipase.
- 🥤 Cola => Cola enthält Kristallzucker (Saccharose) – den spaltet die Saccharase.
- 🍬 Kristallzucker => Kristallzucker ist Saccharose – die spaltet die Saccharase.

## Enzym: Trypsin
ort: Pankreassaft (aktiv erst im Dünndarm)
info: Spaltet Eiweiße im Dünndarm.
quelle: i-care S. 223, 238, 240, 243, 246, 249; MKK S. 362
spaltet:
- 🥩 Fleisch => Fleisch enthält Eiweiß. Trypsin spaltet es im Dünndarm weiter.
- 🥚 Ei => Eier enthalten Eiweiß. Trypsin spaltet es im Dünndarm weiter.
- 🫘 Bohnen => Bohnen enthalten Eiweiß. Trypsin spaltet es im Dünndarm weiter.
- 🥛 Milch => Milch enthält Eiweiß. Trypsin spaltet es im Dünndarm weiter.
nicht:
- 🫒 Öl => Öl liefert Fett – das spaltet die Lipase.
- 🥤 Cola => Cola enthält Kristallzucker (Saccharose) – den spaltet die Saccharase.
- 🍬 Kristallzucker => Kristallzucker ist Saccharose – die spaltet die Saccharase.

## Enzym: Lipase
ort: Magen und Pankreassaft
info: Spaltet Fette.
quelle: MKK S. 361, 362; i-care S. 238, 240, 249
spaltet:
- 🧈 Butter => Butter enthält Fett. Die Lipase spaltet es.
- 🫒 Öl => Öl enthält Fett. Die Lipase spaltet es.
- 🥜 Nüsse => Nüsse enthalten Fett. Die Lipase spaltet es.
- 🌭 Wurst => Wurst enthält Fett. Die Lipase spaltet es.
- 🥚 Ei => Eier enthalten Fett. Die Lipase spaltet es.
- 🥛 Milch => Milch enthält Fett. Die Lipase spaltet es.
nicht:
- 🥤 Cola => Cola enthält Kristallzucker (Saccharose), aber kein Fett. Den Zucker spaltet die Saccharase.
- 🍬 Kristallzucker => Kristallzucker ist Saccharose und enthält kein Fett. Ihn spaltet die Saccharase.
- 🥔 Kartoffeln => Kartoffeln liefern vor allem Stärke – die spaltet die Amylase.

## Enzym: Laktase
ort: Dünndarmschleimhaut
info: Spaltet Milchzucker (Laktose). Fehlt sie, entsteht eine Laktoseintoleranz.
quelle: i-care S. 238, 239, 243, 249; MKK S. 361, 362
spaltet:
- 🥛 Milch => Milch enthält Milchzucker (Laktose). Die Laktase spaltet ihn in Einfachzucker.
nicht:
- 🧀 lange gereifter Käse => Lange gereifter Käse enthält meist keinen oder nur sehr wenig Milchzucker. Deshalb vertragen ihn viele Menschen mit Laktoseintoleranz.
- 🥤 Cola => Cola enthält Kristallzucker (Saccharose), keinen Milchzucker. Den spaltet die Saccharase.
- 🥔 Kartoffeln => Kartoffeln liefern Stärke, keinen Milchzucker. Die Stärke spaltet die Amylase.
- 🫒 Öl => Öl liefert Fett, keinen Milchzucker. Das Fett spaltet die Lipase.
- 🥩 Fleisch => Fleisch liefert Eiweiß, keinen Milchzucker. Das Eiweiß spalten Pepsin und Trypsin.

## Enzym: Saccharase
ort: Dünndarmschleimhaut
info: Spaltet Kristallzucker (Saccharose, Rohr- bzw. Rübenzucker).
quelle: i-care S. 238, 243, 249; MKK S. 361, 362
spaltet:
- 🥤 Cola => Cola enthält reichlich Kristallzucker (Saccharose). Die Saccharase spaltet ihn in Glukose und Fruktose.
- 🍬 Kristallzucker => Kristallzucker ist Saccharose (Rohr- bzw. Rübenzucker). Die Saccharase spaltet ihn in Glukose und Fruktose.
nicht:
- 🥛 Milch => Milch enthält Milchzucker (Laktose) – den spaltet die Laktase, nicht die Saccharase.
- 🥔 Kartoffeln => Kartoffeln liefern Stärke – die spaltet die Amylase.
- 🧈 Butter => Butter liefert Fett – das spaltet die Lipase.
- 🥩 Fleisch => Fleisch liefert Eiweiß – das spalten Pepsin und Trypsin.
