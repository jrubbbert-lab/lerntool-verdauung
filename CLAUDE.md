# Lerntool Verdauung – Regeln für Claude

Digitales Lern-Tool zum Verdauungstrakt für SuS im Bildungsgang Gesundheit (Höhere Berufsfachschule und Berufliches Gymnasium) am Paul-Ehrlich-Berufskolleg Dortmund (NRW). Die Lehrkraft pflegt das Tool langfristig selbst und ergänzt Inhalte ohne Programmierkenntnisse.

Planungsunterlagen: `planung/01_inhaltsuebersicht.md` (Buchseiten je Modul, Lücken, Abbildungen) und `planung/02_architektur-vorschlag.md` (Architektur, Entscheidungen).

## Arbeitsweise
- Bei Unklarheiten **nachfragen statt raten**.
- Fehlen fachliche Informationen für ein Modul oder einen Aufgabentyp: Lücke markieren und die Lehrkraft fragen.
- **Jede Aufgabe vor dem Eintragen gegen die angegebene Buchseite prüfen.**
- Kommunikation und gesamte Oberfläche auf **Deutsch**; die SuS werden mit **„du“** angesprochen.

## Technik
- Keine Server-Komponente, kein Login, keine Datenbank.
- Endprodukt: **eine einzelne HTML-Datei**, alles eingebettet. Keine externen Ressourcen zur Laufzeit (keine CDNs, keine Google Fonts, kein Tracking).
- Möglichst wenige Abhängigkeiten: App in reinem JavaScript ohne Framework, Build mit `python3 build.py` (nur Python-Standardbibliothek).
- Inhalte und App-Logik sind getrennt:
  - `inhalte/` enthält Inhalte (Markdown-Format, siehe README),
  - `app/` enthält Logik (JS/CSS),
  - `build.py` prüft und bündelt.
- Build-Ausgaben:
  - `docs/index.html` ist die **öffentliche Version** für GitHub Pages, **ohne Buchabbildungen**.
  - `dist/lerntool-verdauung-kurs.html` ist die **Kursversion mit Abbildungen** (`python3 build.py --kursversion`). Sie ist nur für den geschlossenen Kurs und nicht in Git.
- Git von Anfang an. `quellen/`, `inhalte/bilder/`, `dist/` und `referenz/` kommen **nie** ins Repository (Urheberrecht; das Repo ist öffentlich).
- Das Repo liegt in einem Google-Drive-Ordner. Nicht parallel auf zwei Rechnern arbeiten, GitHub dient als Backup.
- Mobile first, barrierearm (Tastatur, Kontrast AA, `prefers-reduced-motion`), Hell- und Dunkelmodus.
- Reihenfolgeaufgaben müssen ohne Drag & Drop per Tastatur bzw. Pfeiltasten bedienbar sein.

## Werkzeuge und Arbeitsablauf
- `python3 werkzeuge/texte_erzeugen.py` erzeugt die Buchtexte mit **gedruckten** Seitenzahlen in `quellen/_text/`. Nötig nach neuem Checkout; MKK per macOS-Vision-OCR über `werkzeuge/ocr.swift`.
- `python3 werkzeuge/suche.py BEGRIFF` sucht in beiden Büchern. `--seite "MKK S. 354"` zeigt eine ganze Seite.
- `python3 werkzeuge/quellencheck.py [modul-id]` prüft, ob die Wörter der richtigen Antworten auf der zitierten Seite stehen. **Nach jeder neuen Aufgabe ausführen und jeden Treffer von Hand prüfen.**
- `python3 werkzeuge/abbildungen_holen.py` holt die in `inhalte/abbildungen.md` eingetragenen i-care-Abbildungen. `--liste SEITE` zeigt die Bilder einer Seite. Die Bilder sind im PDF **ohne Beschriftung** eingebettet.
- Seitengrenzen im MKK: Die Marke „Seite NNN“ steht im Bild **vor** dem Text der neuen Seite. Bei Zweifeln das Originalbild prüfen; Bilder mit pypdf aus dem PDF lösen.
- Testmodus: `LT_INHALTE=<ordner> LT_AUSGABE=<datei> python3 build.py` baut mit anderen Inhalten, z. B. einem Testmodul im Scratchpad. **Testinhalte nie in `inhalte/` ablegen.**
- Vorschau: `.claude/launch.json` (nicht in Git). Der Vorschau-Server hat keinen Zugriff auf den Google-Drive-Ordner, deshalb `docs/index.html` vorher in ein temporäres Verzeichnis kopieren.
- Git-Identität ist repo-lokal neutral gesetzt (`Lerntool Verdauung`, noreply). Nicht durch die private E-Mail ersetzen.

## Bekannte Quellen-Besonderheiten
- i-care ist in sich widersprüchlich:
  - S. 192: Muskularis von Magen **und** Speiseröhre dreischichtig.
  - S. 205: Speiseröhre zweischichtig.
  - → keine Aufgaben dazu.
- i-care S. 242: Die Formulierung zur Vitamin-D-Umwandlung („in der Leber in Vitamin D2“) ist missverständlich → nicht verwenden.
- Die Bücher weichen voneinander ab:
  - Verweildauer im Magen: i-care S. 209 vs. MKK S. 355.
  - Menge des Pankreassafts: i-care S. 223 (1,5–2 l) vs. MKK S. 359 (1,5 l).
  - → Immer das Buch zitieren, dessen Aussage verwendet wird.

## Datenschutz (zwingend)
- Keine personenbezogenen Daten: kein Name, keine Klasse, kein Standort, keine Übertragung an Dritte.
- Fortschritt automatisch im `localStorage`.
- „Spielstand speichern“ lädt eine JSON-Datei herunter (`verdauung-spielstand-JJJJ-MM-TT.json`), mit `formatversion` für Migrationen und `pruefsumme` gegen einfache Manipulation.
- „Spielstand laden“ per Datei-Upload. Vorher erscheint eine Vorschau (Datum, Rang, Anzahl Awards) und eine Warnung, wenn die Datei älter ist als der aktuelle Stand.
- Nach jedem abgeschlossenen Modul erinnert das Tool ans Sichern. Eine kurze Anleitung erklärt, wo die Datei auf iPad, Android und PC landet.
- **Texte aus Operatoraufgaben werden nie gespeichert.**
- Nachweis-Ansicht für die Lehrkraft (Rang, Awards mit Datum, Prüfcode), **nur auf dem Bildschirm**.
- Ein kurzer Datenschutzhinweis ist in der App sichtbar.
- Uhrzeit und Datum für Awards werden nur auf dem Gerät geprüft.

## Fachliche Regeln (zwingend)
- **Einzige fachliche Quelle: die Bücher in `quellen/`.** Nichts erfinden.
  - `i-care` = *I care Anatomie, Physiologie*, Thieme 2020, Kap. 9, S. 188–249. Der Text ist per OCR im PDF enthalten; einige Seiten sind doppelt gescannt.
  - `MKK` = *Mensch Körper Krankheit*, Kap. 17, S. 343–374. Das PDF besteht nur aus Bildern. Seitenmarken „Seite NNN“ stehen im Bild, Text per macOS-Vision-OCR lesbar (siehe `werkzeuge/`).
- **Immer Fachbegriffe verwenden.** Beim ersten Auftreten in einem Modul steht der deutsche Begriff in Klammern dahinter. Technisch wird das über `[[Begriff]]` + `inhalte/glossar.md` gelöst; die App ergänzt die Klammer automatisch. Ein Glossar ist in der App antippbar.
- Jede Aufgabe speichert ihre Quelle (Buch + gedruckte Seite). Die Rückmeldung zeigt „Lies nach: [Buch], S. xx“.
- Abbildungen **nur aus i-care** (MKK-Bilder tragen Wasserzeichen mit der E-Mail der Lehrkraft und werden nicht verwendet). Beschriftungen werden abgedeckt. Jede verwendete Abbildung steht in `inhalte/abbildungen.md` (Buch, Seite, Abbildungsnummer, Fremdquelle).
- **Schwierigkeit (Wunsch der Lehrkraft):** Keine Zahlenwerte abfragen (kJ/kcal, Prozent, pH, Liter, Gramm, Stunden, Millimeter, Abstände …). Zahlen dürfen nur als Zusatzinfo in Erklärungen oder Musterlösungen stehen.
  - Keine Spezialbegriffe abfragen, die über das Grundverständnis hinausgehen (z. B. Somatostatin, ECL-Zellen, Enteropeptidase, Nukleasen, Nervennamen).
  - Fragen kurz und alltagsnah formulieren, mit höchstens 3–4 klaren Antwortoptionen.
- Figuren in Fallbeispielen und Operatoraufgaben:
  - **Robartina Müller** (20, Berufskolleg Gesundheit, Praktikum im Krankenhaus),
  - ihr Mitschüler **Alaa**,
  - ihre Praxisanleiterin **Frau Abda**.

## Module (4 Blöcke, nacheinander freigeschaltet)
1. **Grundlagen:** Nährstoffe; Aufgaben und Aufbau des Verdauungssystems
2. **Organe:** Mundhöhle und Speiseröhre; Magen; Dünndarm; Dickdarm; Pankreas; Leber und Gallenblase
3. **Physiologie:** Verdauung der Nährstoffe
4. **Erkrankungen:** Morbus Crohn (→ Dünndarm/Dickdarm); Adipositas (→ Nährstoffe); Hepatitis (→ Leber und Gallenblase); Diabetes mellitus (→ Pankreas); Leberzirrhose (→ Leber und Gallenblase); Pankreatitis (→ Pankreas); Magenkarzinom (→ Magen)

Freischaltung:
- Ein Block öffnet sich, wenn **alle vorhandenen** Module des vorherigen Blocks bestanden sind (≥ 80 %).
- Eine Erkrankung öffnet sich erst, wenn ihr Organmodul bestanden ist.

Nicht jedes Modul braucht jeden Aufgabentyp; nur fachlich sinnvolle Typen verwenden.

Stand der Inhalte:
- Das **MVP** umfasst die Module Nährstoffe, Magen und Verdauung der Nährstoffe.
- **Diabetes, Hepatitis (Virusformen) und Adipositas (Ursachen/Therapie)** sind Lücken. Die Lehrkraft liefert Kapitel nach; bis dahin gelten diese Module als „in Vorbereitung“.

## Aufgabentypen
1. Karteikarten mit Leitner-System (5 Fächer)
2. Single-Choice (genau eine richtige Antwort, gekennzeichnet)
3. Multiple-Choice (gekennzeichnet mit „Mehrere Antworten möglich“)
4. Operatoraufgaben: Operator + AFB + Fallbeispiel, Freitext mit Mindestlänge, Selbstcheck mit 4–6 Kriterien (bestanden ab ca. 60 %), danach Musterlösung
5. Zuordnung
6. Reihenfolge (tastaturbedienbar)
7. Quiz auf Zeit (freiwillig, keine Voraussetzung für Modul-Awards)
8. Enzym-Spiel (Amylase, Pepsin, Trypsin, Lipase, Laktase; nach Fehlklick eine kurze fachliche Erklärung)
9. Bildzuordnung (nur Kursversion)
10. Fehlerfahndung im Pflegebericht von Robartina
11. Diagnose-Detektivin (nur Krankheitsmodule)
12. Die Reise eines Brötchens (Stärke, Eiweiß, Fett)
13. Lückentext
14. „Meine Fehler“ (wiederholt nur falsch beantwortete Aufgaben)

## Ränge und Formen
Praktikantin → Famulantin → PJlerin → Assistenzärztin → Oberärztin → Chefärztin → Gesundheitsministerin (nach XP).
- **Keine Auswahl beim Start** (Wunsch der Lehrkraft): Standard ist die weibliche Form. Unter „Mehr“ lässt sich die Anrede auf männlich / neutral umstellen; die Wahl wird nur lokal gespeichert.
- **Neutral mit Doppelpunkt** (Praktikant:in).
- Award-Namen passen sich der Form ebenfalls an.
- **Rangaufstieg erscheint sofort als großer Dialog** („Neuer Rang!“), nicht erst auf der Ergebnisseite. Ausnahme: Im Quiz auf Zeit und im Enzym-Spiel erscheint er direkt nach der Runde. Steht gleichzeitig ein Award an, kommt der Rang zuerst.

## Design (PEBK-Corporate-Design)
- Farben aus der offiziellen PEBK-PowerPoint-Vorlage: Dunkelgrün `#2A473B` (Kopfleiste, Knöpfe), Mittelgrün `#4DAF8E`, Hellgrün `#CCE4D8`, Graugrün `#6C887C`, Logo-Grün `#1BA57E`. Definiert in `app/stil/10-grundlagen.css`.
- Schrift: Calibri (Ersatz: Carlito bzw. Systemschrift) – nichts wird nachgeladen.
- Logo: `app/pebk-logo.png` wird beim Build in die Kopfleiste eingebettet. Datei löschen = Build ohne Logo.
- Parallelogramm-Motiv (wie im Logo) über den Seitenüberschriften.
- Modulfarben je Block in Grüntönen (`farbe:` im Modulkopf). Award-Plaketten bleiben bunt (Garmin-Stil).

## Awards
- Stil der Garmin-Abzeichen: runde, sechseckige oder gezackte Plaketten mit Farbverlauf und Icon. Referenz: `referenz/prototyp-anatomie-abzeichen.html` (nur Design, nicht als Code-Basis).
- Nicht erreichte Awards: grau mit Schloss und Fortschrittsbalken. Erreichte Awards: mit Datum. Am Modulende erscheinen neue Awards mit Animation.
- Jede Award-Beschreibung enthält einen **Fachfakt aus den Büchern** mit Quelle (Mini-Karteikarte).
- Geheime Awards stehen bis zum Erreichen als „???“ auf der Wand.
- Liste und Bedingungen: `inhalte/awards.md`.
- Die 21er Klinge bekommt einen anderen Fachfakt aus den Büchern, weil die Bücher nichts zur Skalpellklinge enthalten.
