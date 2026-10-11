# Lerntool Verdauung

Ein digitales Lern-Tool zum Verdauungssystem für den Bildungsgang Gesundheit am Paul-Ehrlich-Berufskolleg Dortmund. Es läuft im Browser auf Handy, Tablet und PC. Server, Login und Datenbank braucht es nicht.

- **Fertige Datei (öffentlich, ohne Buchabbildungen):** `docs/index.html`
- **Kursversion (mit Buchabbildungen, nur für den geschlossenen Kurs):** `dist/lerntool-verdauung-kurs.html`

---

## Inhalt

1. [Schnellstart](#1-schnellstart)
2. [So ist das Projekt aufgebaut](#2-so-ist-das-projekt-aufgebaut)
3. [Neue Aufgaben hinzufügen](#3-neue-aufgaben-hinzufügen)
4. [Alle Aufgabentypen mit Vorlage](#4-alle-aufgabentypen-mit-vorlage)
5. [Fachbegriffe und Glossar](#5-fachbegriffe-und-glossar)
6. [Ein neues Modul freischalten](#6-ein-neues-modul-freischalten)
7. [Quellen prüfen](#7-quellen-prüfen)
8. [Einstellungen, Ränge und Awards](#8-einstellungen-ränge-und-awards)
9. [Spiele: Enzym-Spiel, Brötchen-Reise, Aprilscherz](#9-spiele-enzym-spiel-brötchen-reise-aprilscherz)
10. [Abbildungen und Kursversion](#10-abbildungen-und-kursversion)
11. [Veröffentlichen über GitHub Pages](#11-veröffentlichen-über-github-pages)
12. [Häufige Fehlermeldungen](#12-häufige-fehlermeldungen)
13. [Datenschutz](#13-datenschutz)

---

## 1. Schnellstart

Du brauchst nur **Python 3**. Auf dem Mac ist es in der Regel vorhanden. Prüfen kannst du das im Terminal:

```bash
python3 --version
```

Falls macOS anbietet, die „Befehlszeilenentwickler-Tools“ zu installieren, bestätige das einmal.

**Die HTML-Datei erzeugen:** Öffne das Terminal im Projektordner (im Finder: Rechtsklick auf den Ordner → „Neues Terminal beim Ordner“) und tippe:

```bash
python3 build.py
```

Das Skript prüft alle Inhalte und schreibt die fertige Datei nach `docs/index.html`. Mit einem Doppelklick öffnest du sie im Browser.

**Nur prüfen, ohne zu bauen:**

```bash
python3 build.py --pruefen
```

**Kursversion mit Abbildungen bauen** (siehe [Abschnitt 10](#10-abbildungen-und-kursversion)):

```bash
python3 build.py --kursversion
```

---

## 2. So ist das Projekt aufgebaut

```
99_Lerntool_Verdauung/
├── inhalte/                ◄── HIER arbeitest du
│   ├── module/             eine Datei pro Modul, z. B. 2-2-magen.md
│   ├── glossar.md          Fachbegriffe mit deutschem Begriff
│   ├── awards.md           alle Awards mit Fachfakt
│   ├── einstellungen.md    Ränge, XP, Bestehensgrenze
│   ├── abbildungen.md      Rechte-Liste der Buchabbildungen
│   ├── spiele/             Enzym-Spiel, Brötchen-Reise, Aprilscherz
│   └── bilder/             Abbildungen (nicht in Git)
├── app/                    Programmcode – musst du nicht anfassen
├── werkzeuge/              Suche in den Büchern, Quellencheck, Abbildungen holen
├── build.py                prüft und baut alles
├── docs/index.html         fertige öffentliche Version
├── dist/                   Kursversion (nicht in Git)
├── quellen/                die Bücher (nicht in Git)
├── planung/                Inhaltsübersicht und Architektur
└── CLAUDE.md               Projektregeln für Claude
```

Alle Inhaltsdateien sind einfache Textdateien. Du kannst sie mit **TextEdit** (Format → „In reinen Text umwandeln“), mit **VS Code** oder direkt auf GitHub bearbeiten.

---

## 3. Neue Aufgaben hinzufügen

1. Öffne die passende Moduldatei in `inhalte/module/`, z. B. `2-2-magen.md`.
2. Kopiere eine Vorlage aus [Abschnitt 4](#4-alle-aufgabentypen-mit-vorlage) ans Ende der Datei.
3. Fülle die Felder aus. **Jede Aufgabe braucht eine `quelle:`**, z. B. `quelle: i-care S. 207` oder `quelle: MKK S. 354–355`.
4. Speichern und `python3 build.py` ausführen.
5. Meldet das Skript Fehler, steht dort die Datei und die Zeile. Korrigiere sie und baue erneut.

### Die Grundregeln des Formats

- Jede Aufgabe beginnt mit einer Überschrift `## Typ`, z. B. `## Single-Choice`.
- Felder schreibst du als `name: Inhalt`, z. B. `frage: Welche Zellen …?`.
- Langer Text darf über mehrere Zeilen gehen. Eine **Leerzeile** erzeugt einen neuen Absatz.
- Antworten und Listen beginnen mit `- ` oder `1. `.
- `**fett**` wird fett dargestellt.
- `<!-- Kommentar -->` wird ignoriert. Hier kannst du Notizen für dich hinterlassen.
- **Quellenformat:** `i-care S. 205` · `MKK S. 354–355` · mehrere Seiten: `i-care S. 205, 240` · mehrere Bücher: `i-care S. 207; MKK S. 354`
  - `i-care` = *I care Anatomie, Physiologie* (Thieme 2020)
  - `MKK` = *Mensch Körper Krankheit*
  - Es zählt immer die **gedruckte** Buchseite, nicht die PDF-Seite.

### Das Feld `id:`

`id:` ist **freiwillig**. Lässt du es weg, bildet das Skript die Kennung aus dem Fragetext.

> **Achtung:** Änderst du später den Fragetext einer Aufgabe ohne `id:`, beginnt der Lernstand dieser einen Aufgabe (Karteikarten-Fach, „Meine Fehler“) für die SuS neu. Wenn dir das wichtig ist, vergib eine feste `id:`, die mit dem Modulkürzel beginnt, z. B. `id: magen-sc-belegzellen`.

---

## 4. Alle Aufgabentypen mit Vorlage

Welche Typen in den **Modulcheck** (bewertet, entscheidet über „bestanden“) eingehen:

| Typ | im Modulcheck | eigener Übungsbereich |
|---|---|---|
| Single-Choice, Multiple-Choice, Zuordnung, Reihenfolge, Lückentext | ✓ | – |
| Bildzuordnung | ✓ (nur Kursversion) | – |
| Karteikarte | – | Karteikarten (Leitner) |
| Operator | – | Operatoraufgaben |
| Fehlerfahndung | – | Fehlerfahndung |
| Diagnose | – | Diagnose-Detektiv:in |

Single-Choice-Fragen erscheinen außerdem im freiwilligen **Quiz auf Zeit**. Falsch gelöste Modulcheck-Aufgaben landen in **„Meine Fehler“**.

### Karteikarte

```markdown
## Karteikarte
vorne: Was bilden die Belegzellen der Magendrüsen?
hinten: Salzsäure und den Intrinsic Factor.
quelle: i-care S. 207
```

### Single-Choice (genau eine richtige Antwort)

```markdown
## Single-Choice
frage: Welche Zellen der Magendrüsen bilden die Salzsäure?
- [ ] Hauptzellen
- [x] Belegzellen
- [ ] Nebenzellen
erklärung: Die Belegzellen bilden Salzsäure und Intrinsic Factor.
quelle: i-care S. 207
```

`[x]` markiert die richtige Antwort. Du brauchst mindestens 3 Antworten, genau eine mit `[x]`. Die App mischt die Reihenfolge. `erklärung:` ist freiwillig und erscheint nach dem Prüfen.

### Multiple-Choice (mindestens zwei richtige Antworten)

```markdown
## Multiple-Choice
frage: Was fördert die Freisetzung der Salzsäure?
- [x] der Parasympathikus
- [x] Gastrin
- [ ] Somatostatin
quelle: i-care S. 209
```

Die App zeigt automatisch „Mehrere Antworten möglich“ an. Gewertet wird nach dem Prinzip „alles oder nichts“.

### Zuordnung

```markdown
## Zuordnung
frage: Ordne jeder Zellart ihr Produkt zu.
- Belegzellen => Salzsäure
- Hauptzellen => Pepsinogen
- Nebenzellen => Schleim
quelle: i-care S. 207
```

Links steht der Begriff, rechts die Zuordnung. Du brauchst mindestens 3 Paare. Die SuS wählen rechts aus einer Liste.

### Reihenfolge

```markdown
## Reihenfolge
frage: Ordne die Muskelschichten der Magenwand von außen nach innen.
1. Längsmuskelfasern
2. ringförmig verlaufende Muskelfasern
3. schräg verlaufende Muskelfasern
quelle: MKK S. 354
```

Schreibe die Schritte in der **richtigen** Reihenfolge, die App mischt sie. Die SuS sortieren mit Pfeil-Knöpfen oder Pfeiltasten.

### Lückentext

```markdown
## Lückentext
text: Die Belegzellen bilden {{Salzsäure|HCl}}. Die Hauptzellen bilden {{Pepsinogen}}.
quelle: i-care S. 207
```

`{{Lösung}}` ist eine Lücke. Mit `|` trennst du weitere erlaubte Schreibweisen ab. Groß- und Kleinschreibung ist egal.

> Tipp: Mach keine Aufzählungen aus mehreren Lücken („{{Glukose}}, {{Fruktose}} und {{Galaktose}}“). Wer die Wörter in anderer Reihenfolge schreibt, würde sonst als falsch gewertet.

### Operatoraufgabe

```markdown
## Operator
operator: erläutern
afb: II
fall: Ein Patient fragt Robartina: „Warum verdaut sich mein Magen nicht selbst?“
auftrag: Erläutere, wie sich die Magenschleimhaut vor Salzsäure und Pepsin schützt.
mindestlänge: 400
kriterien:
- Ich nenne den zähen Schleim als Schutzfilm.
- Ich erkläre die Wirkung des Bikarbonats.
- Ich nenne die Nebenzellen als Schleimbildner.
- Ich nenne die ausreichende Durchblutung.
musterlösung: Der Magensaft enthält Salzsäure und Pepsin …
quelle: MKK S. 355
```

- `afb:` ist `I`, `II` oder `III`.
- `mindestlänge:` gibt die Mindestzahl an Zeichen an.
- Du brauchst **4 bis 6 Kriterien**. Bestanden ist die Aufgabe ab 60 % (einstellbar).
- Figuren in Fallbeispielen: Robartina Müller (20, Praktikum im Krankenhaus), Mitschüler Alaa, Praxisanleiterin Frau Abda.

### Fehlerfahndung (Pflegebericht von Robartina)

```markdown
## Fehlerfahndung
titel: Robartinas Pflegebericht: Herr K. hat erbrochen
bericht: Herr K. hat einmal erbrochen. Ich habe ihn flach in Rückenlage gebracht. …
fehler:
- flach in Rückenlage gebracht => aufrecht sitzen lassen oder Seitenlage || aufrecht|sitz|seitenlage
erklärung: Bei Erbrechen besteht Aspirationsgefahr …
quelle: MKK S. 355
```

Jede Fehlerzeile hat die Form `- falscher Text => Musterkorrektur || Schlüsselwort1|Schlüsselwort2`:
- Der **falsche Text** muss wörtlich im Bericht stehen.
- Die **Musterkorrektur** sehen die SuS am Ende.
- Die Korrektur der SuS zählt als richtig, wenn sie eines der **Schlüsselwörter** enthält.

### Diagnose-Detektiv:in (für die Krankheitsmodule)

```markdown
## Diagnose
titel: Fall 1: Frau T. hat starke Oberbauchschmerzen
hinweise:
- erster Hinweis (Symptom)
- zweiter Hinweis (Befund)
- dritter Hinweis (Laborwert)
diagnose: akute Pankreatitis
optionen:
- akute Pankreatitis
- Gallenkolik
- Ulkuskrankheit
quelle: MKK S. 367
```

Die Hinweise werden nacheinander aufgedeckt. Die richtige `diagnose:` muss auch unter `optionen:` stehen.

### Bildzuordnung (nur Kursversion)

```markdown
## Bildzuordnung
frage: Ordne jedem Marker den richtigen Begriff zu.
bild: abb-9-16-magen-innen.jpg
marker:
- 48% 9% => Speiseröhre (Ösophagus)
- 80% 22% => Magengrund (Fundus)
- 20% 72% => Magenpförtner (Pylorus)
quelle: i-care S. 207
```

Die Marker-Position gibst du in Prozent von links und von oben an. Das Bild muss in `inhalte/abbildungen.md` eingetragen sein (siehe [Abschnitt 10](#10-abbildungen-und-kursversion)).

---

## 5. Fachbegriffe und Glossar

Die App setzt die **Fachbegriff-Regel automatisch** um. Schreibe Fachbegriffe in doppelte eckige Klammern:

```markdown
frage: Welche Aufgabe hat der [[Pylorus]]?
```

Beim **ersten Auftreten im Modul** zeigt die App dann „Pylorus (Magenpförtner)“, danach nur noch „Pylorus“. Jeder so markierte Begriff ist antippbar und öffnet den Glossareintrag.

Braucht der Satz eine andere Wortform, schreibst du `[[Pylorus|Pylorusdrüsen]]`.

Jeder `[[Begriff]]` muss in `inhalte/glossar.md` stehen:

```markdown
## Pylorus
deutsch: Magenpförtner
erklärung: Abschluss des Magens zum Dünndarm. Hier liegt der Magensphinkter.
quelle: i-care S. 205
```

Fehlt ein Begriff, meldet das Build-Skript: `Fachbegriff [[…]] fehlt in glossar.md.`

---

## 6. Ein neues Modul freischalten

Für alle 16 Module gibt es schon eine Datei in `inhalte/module/`. Ein Modul ohne Aufgaben erscheint in der App automatisch als „in Vorbereitung“.

1. Öffne die Moduldatei, z. B. `2-3-duenndarm.md`.
2. Trage Aufgaben ein.
3. Bei Diabetes, Hepatitis und Adipositas steht zusätzlich `status: in Vorbereitung` im Kopf. Diese Zeile löschst du, sobald die fehlenden Buchkapitel vorliegen und die Aufgaben fertig sind.
4. `python3 build.py`

**So funktioniert die Freischaltung:**
- Block 1 ist immer offen.
- Jeder weitere Block öffnet sich, wenn alle **vorhandenen** Module (mit Aufgaben) des vorherigen Blocks mit mindestens 80 % bestanden sind.
- Erkrankungen (Block 4) brauchen zusätzlich ihr Organmodul (`organ:` im Kopf). Bei Morbus Crohn (`organ: duenndarm, dickdarm`) müssen **beide** bestanden sein.

Der Kopf einer Moduldatei:

```markdown
# Modul: Magen
id: magen
block: 2
nr: 2
quellen: i-care S. 205–209; MKK S. 353–357
beschreibung: Magensaft, Magenschleimhaut und Magenentleerung.
icon: magen
farbe: #c9820f
```

Mögliche Icons: `ernaehrung`, `verdauungstrakt`, `mund`, `magen`, `darm`, `pankreas`, `leber`, `enzym`.

---

## 7. Quellen prüfen

Die Bücher liegen in `quellen/`. Damit du und Claude darin suchen könnt, gibt es drei Werkzeuge.

**Einmalig: Buchtexte mit gedruckten Seitenzahlen erzeugen.** Beim MKK nutzt das die Texterkennung von macOS und dauert ein paar Minuten.

```bash
python3 werkzeuge/texte_erzeugen.py
```

**Einen Begriff in beiden Büchern suchen:**

```bash
python3 werkzeuge/suche.py Belegzellen
```

**Eine ganze Buchseite anzeigen:**

```bash
python3 werkzeuge/suche.py --seite "MKK S. 354"
```

**Quellencheck:** Stehen die Wörter der richtigen Antworten wirklich auf der zitierten Seite?

```bash
python3 werkzeuge/quellencheck.py magen
```

Der Quellencheck findet falsche Seitenangaben schnell. Ein Treffer ist aber nicht automatisch ein Fehler, oft ist nur umformuliert. Er ersetzt das eigene Nachlesen nicht.

---

## 8. Einstellungen, Ränge und Awards

### `inhalte/einstellungen.md`

Hier stellst du ein:
- die Bestehensgrenze (80 %),
- die Zahl der Aufgaben im Modulcheck (12),
- die Grenze für Operatoraufgaben (60 %),
- die Spieldauer von Quiz und Enzym-Spiel,
- die XP je Aktion,
- die Ränge in drei Formen (weiblich / männlich / neutral).

```markdown
raenge:
- 0 => Praktikantin / Praktikant / Praktikant:in
- 150 => Famulantin / Famulant / Famulant:in
```

### `inhalte/awards.md`

```markdown
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
```

- `name:` enthält eine Form für alle oder drei Formen `weiblich / männlich / neutral`.
- `id:` bitte nie ändern, sonst verlieren die SuS den Award.
- `form:` kann `rund`, `sechseck`, `zacken` oder `schild` sein.

**Verfügbare Regeln:**

| Regel | Bedeutung | Beispiel |
|---|---|---|
| `modul_uhrzeit VON BIS` | ein Modulcheck zwischen VON und BIS Uhr abgeschlossen | `modul_uhrzeit 0 4` |
| `operatoren_afb AFB` | alle Operatoraufgaben dieses AFB bestanden | `operatoren_afb III` |
| `modul_mehrfach IDS ANZAHL PROZENT` | jedes genannte Modul ANZAHL-mal mit mind. PROZENT | `modul_mehrfach duenndarm,dickdarm 2 80` |
| `bloecke_bestanden NR` | alle Module des Blocks bestanden | `bloecke_bestanden 2` |
| `serie_richtig N` | N richtige Antworten in Folge | `serie_richtig 21` |
| `verbesserung PP` | in einem Modul um PP Prozentpunkte verbessert | `verbesserung 30` |
| `tage_in_folge N` | an N Tagen in Folge geübt | `tage_in_folge 14` |
| `unter_dann_ueber A B` | ein Modul erst unter A %, später über B % | `unter_dann_ueber 50 90` |
| `modul_prozent ID P` | Modul mit mindestens P % | `modul_prozent magen 100` |
| `enzym_punkte N` | N Punkte in einer Runde Enzym-Spiel | `enzym_punkte 25` |
| `karten_fach5 N` | N Karteikarten im letzten Fach | `karten_fach5 100` |
| `diagnosen N` | N Diagnosefälle richtig | `diagnosen 5` |
| `block_frei NR` | Block NR freigeschaltet | `block_frei 2` |
| `modul_abschluesse N` | dasselbe Modul N-mal abgeschlossen | `modul_abschluesse 3` |
| `reihenfolge_fehlerfrei N` | N Reihenfolgeaufgaben fehlerfrei | `reihenfolge_fehlerfrei 10` |
| `xp N` | N XP gesammelt | `xp 1000` |
| `quiz_serie N` | N richtige in Folge im Quiz auf Zeit | `quiz_serie 10` |
| `freitag13 P` | an einem Freitag, dem 13., ein Modul mit mind. P % | `freitag13 80` |
| `aprilscherz` | am 1. April die Scherzfrage durchschaut | `aprilscherz` |

---

## 9. Spiele: Enzym-Spiel, Brötchen-Reise, Aprilscherz

Dazu kommt das Geschicklichkeitsspiel **„Durch den Verdauungstrakt“** (siehe unten).

- **`inhalte/spiele/enzym-spiel.md`:** ein Abschnitt `## Enzym: Name` pro Enzym.
  - Unter `spaltet:` stehen die Stoffe, die das Enzym spalten kann.
  - Unter `nicht:` stehen Fallen mit Erklärung.
  - Format: `- Stoff => Erklärung`.
- **`inhalte/spiele/broetchen-reise.md`:** Jede `## Station` ist eine Single-Choice-Frage mit `nährstoff:` und `ort:`. Die Stationen erscheinen in der Reihenfolge der Datei.
- **`inhalte/spiele/aprilscherz.md`:** Eine Single-Choice-Frage, die nur am 1. April vor jedem Modulcheck erscheint.
- **`inhalte/spiele/trakt-spiel.md`:** Texte für das Spiel „Durch den Verdauungstrakt“. Die SuS steuern einen Bissen von der Mundhöhle bis zum After, an Sphinktern, Salzsäure und Enzymen vorbei.
  - Jede `## Station` hat `id:`, `name:`, `fakt:` und `quelle:`. Der Fakt erscheint beim Erreichen der Station und am Ende in der Übersicht.
  - Die `id:` bitte nicht ändern: Sie legt fest, zu welcher Stelle im Spiel der Text gehört.
  - `modul:` im Kopf bestimmt, bei welchem Modul das Spiel erscheint (Standard: `aufbau`).
  - Tempo, Abstände und Rhythmus der Sphinkter stehen im Programm (`app/js/aufgaben/55-trakt.js`, Listen `TORE`, `LAEUFER`, `SAEURE` am Anfang der Datei).
  - Die XP für einen geschafften Durchgang stehen in `einstellungen.md` unter `trakt_geschafft`.

---

## 10. Abbildungen und Kursversion

Buchabbildungen dürfen **nicht** in die öffentliche Version. Sie stehen deshalb:
- nur in der **Kursversion**,
- nur aus **i-care**: Die MKK-Seiten tragen ein Wasserzeichen mit deiner E-Mail-Adresse,
- in der **Rechte-Liste** `inhalte/abbildungen.md`.

```markdown
## Innenansicht des Magens
datei: abb-9-16-magen-innen.jpg
buch: i-care
seite: 207
abbildung: 9.16
bildnr: 2
titel: Innenansicht des Magens.
fremdquelle: Aus: Schünke M, Schulte E, Schumacher U: Prometheus LernAtlas der Anatomie …
verwendet: Modul Magen, Bildzuordnung „magen-bz-innen“
```

Im i-care-PDF sind die Abbildungen als Bilder **ohne Beschriftung** eingebettet. So holst du sie:

**Zeigen, welche Bilder auf einer Seite liegen:**

```bash
python3 werkzeuge/abbildungen_holen.py --liste 207
```

**Alle eingetragenen Abbildungen nach `inhalte/bilder/` holen:**

```bash
python3 werkzeuge/abbildungen_holen.py
```

**Kursversion bauen:**

```bash
python3 build.py --kursversion
```

Die Datei `dist/lerntool-verdauung-kurs.html` verteilst du **nur im geschlossenen Kurs**, z. B. über LOGINEO NRW oder Moodle.

> Einige Abbildungen (z. B. 9.31–9.34) sind im PDF als Grafik gezeichnet und nicht als Bild eingebettet. Sie lassen sich mit diesem Werkzeug nicht holen.

---

## 11. Veröffentlichen über GitHub Pages

> **Wichtig:** Bei GitHub Pages im kostenlosen Tarif ist das Repository öffentlich. `.gitignore` schließt deshalb `quellen/`, `inhalte/bilder/`, `dist/` und `referenz/` aus. Diese Einträge bitte nie entfernen.

**Einmalig einrichten:**
1. Lege auf github.com ein neues Repository an, z. B. `lerntool-verdauung`.
2. Verbinde es im Terminal mit dem Projekt (Adresse anpassen):

   ```bash
   git remote add origin https://github.com/DEIN-NAME/lerntool-verdauung.git
   ```

   ```bash
   git push -u origin main
   ```

3. Auf GitHub: **Settings → Pages → Branch `main`, Ordner `/docs` → Save**.

Nach ein bis zwei Minuten ist das Tool unter `https://DEIN-NAME.github.io/lerntool-verdauung/` erreichbar.

**Nach jeder Änderung:**

```bash
python3 build.py
```

```bash
git add -A
```

```bash
git commit -m "Neue Aufgaben zum Magen"
```

```bash
git push
```

Die Git-Autorenangaben dieses Projekts sind neutral eingestellt („Lerntool Verdauung“). So erscheint deine Gmail-Adresse nicht im öffentlichen Repository.

> Das Projekt liegt in einem Google-Drive-Ordner. Arbeite bitte nicht gleichzeitig auf zwei Rechnern daran, sonst können Synchronisationskonflikte das Git-Repository beschädigen. GitHub dient als Sicherung.

---

## 12. Häufige Fehlermeldungen

| Meldung | Lösung |
|---|---|
| `„Single-Choice“ ohne „quelle:“` | Zeile `quelle: i-care S. …` ergänzen. |
| `Single-Choice hat 2 richtige Antworten` | Genau eine `[x]`, oder den Typ `Multiple-Choice` verwenden. |
| `Zeile gehört zu keinem Feld` | Vor dem Text fehlt `feld:` oder ein Tippfehler im Feldnamen. |
| `Fachbegriff [[…]] fehlt in glossar.md` | Begriff im Glossar ergänzen oder die Klammern entfernen. |
| `Quelle „…“ hat nicht das Format …` | Format `i-care S. 205` bzw. `MKK S. 354–355` (Gedankenstrich oder Bindestrich). |
| `Fehler „…“ kommt im Bericht nicht wörtlich vor` | Fehlertext exakt so schreiben, wie er im Bericht steht. |
| `ID „…“ kommt in diesem Modul doppelt vor` | Eine der beiden `id:` ändern. |

---

## Design

Das Tool ist im **PEBK-Design** gestaltet (Farben und Schrift aus der offiziellen PowerPoint-Vorlage).
- Die Farben stehen in `app/stil/10-grundlagen.css`.
- Das Schullogo liegt als `app/pebk-logo.png` im Projekt und wird beim Bauen in die Kopfleiste eingebettet. Wenn du die Datei löschst, wird ohne Logo gebaut.
- Die Farbe eines Moduls änderst du im Modulkopf mit `farbe: #2A473B`.

---

## 13. Datenschutz

- Kein Login, keine Namen, keine Klassen, kein Standort. Das Tool lädt nichts aus dem Internet nach. Eine Content-Security-Policy blockiert jede Verbindung nach außen.
- Der Fortschritt liegt im `localStorage` des Browsers. Zusätzlich gibt es die **Spielstand-Datei** (`verdauung-spielstand-JJJJ-MM-TT.json`) mit Formatversion und Prüfsumme.
- **Texte aus Operatoraufgaben werden nie gespeichert.** Gespeichert wird nur, *dass* eine Aufgabe bestanden wurde.
- Die **Nachweis-Ansicht** (Mehr → Nachweis) zeigt Rang, Awards mit Datum und einen Prüfcode, nur auf dem Bildschirm.
- **Ehrliche Einordnung der Prüfsumme:** Sie verhindert Handänderungen in der Datei. Wer den Quelltext liest, kann sie aber nachbilden. Ohne Server ist das nicht vermeidbar.

### Wenn sich das Speicherformat ändert

Werden neue Felder im Spielstand nötig, erhöht man in `app/js/20-speicher.js` die `FORMATVERSION` und ergänzt unter `MIGRATIONEN` einen Umwandlungsschritt. Alte Spielstand-Dateien lassen sich dann weiter laden.
