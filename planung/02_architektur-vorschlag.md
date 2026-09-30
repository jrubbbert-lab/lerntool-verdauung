# Architekturvorschlag und Umsetzungsplan

Stand: 30.09.2026 · **Status: freigegeben und als MVP umgesetzt** (siehe README.md)

**Nachträgliche Entscheidungen:**
- Öffentliche Version (`docs/index.html`, GitHub Pages) **ohne** Buchabbildungen. Kursversion (`dist/`, `--kursversion`) **mit** Abbildungen, nur im geschlossenen Kurs.
- Neutrale Formen mit Doppelpunkt (Praktikant:in).
- Die 21er Klinge bekommt einen anderen Buchfakt (Perforation, MKK S. 357).
- Planungsunterlagen liegen in `planung/`. `docs/` ist für GitHub Pages reserviert.
- Spiele-Inhalte im Markdown-Format statt JSON.

## Entscheidungen (30.09.2026)

| Thema | Entscheidung |
|---|---|
| Verteilung | Öffentliche GitHub Pages |
| Abbildungen | Nur i-care, Beschriftungen abgedeckt, keine MKK-Bilder |
| Lücken (Diabetes, Hepatitis, Adipositas) | Lehrkraft liefert Kapitel nach; Module bis dahin „in Vorbereitung“ |
| Speicherort | Repo bleibt im Google-Drive-Ordner, GitHub als Backup |
| ~~OFFEN~~ gelöst | Öffentliche Pages ohne Abbildungen + separate Kursversion mit Abbildungen |

## 1. Leitidee

Du bearbeitest nur **Textdateien im Ordner `inhalte/`**. Sie sind im Markdown-Stil geschrieben und lassen sich mit jedem Editor öffnen (TextEdit, VS Code, sogar im Browser auf GitHub).
Ein Build-Skript prüft diese Dateien, meldet Fehler auf Deutsch mit Zeilennummer und baut daraus **eine einzige HTML-Datei**.

```
Inhalte (Markdown)  ─┐
App-Logik (JS/CSS)  ─┼──►  python3 build.py  ──►  dist/lerntool-verdauung.html
Bilder, Glossar     ─┘       (prüft + bündelt)        (alles eingebettet, offline)
```

## 2. Technik-Entscheidungen

| Frage | Vorschlag | Begründung |
|---|---|---|
| Build-Werkzeug | **Python 3** (`build.py`, nur Standardbibliothek) | Ist auf deinem Mac schon installiert, Node.js dagegen nicht. Keine Zusatzpakete, nichts zu installieren. |
| App-Logik | **Reines JavaScript ohne Framework**, in mehrere kleine Dateien aufgeteilt | Keine Abhängigkeiten, die veralten. Die Einzeldatei bleibt klein und läuft auch in Jahren noch. |
| Inhaltsformat | **Markdown mit festen Schlüsselwörtern** (siehe Abschnitt 4) | Für Menschen besser lesbar als JSON (keine Klammern und Kommas). YAML bräuchte in Python ein Zusatzpaket. |
| Schriften | **Systemschriften** (San Francisco, Segoe UI, Roboto) | Keine Google Fonts erlaubt. Optional kann ich später die freie Schrift *Barlow* aus dem Prototyp einbetten (OFL-Lizenz, ca. 60 KB). |
| Grafiken | Award-Plaketten und Icons als **SVG im Code**, wie im Prototyp (`badgeSVG`) | Gestochen scharf, winzig, einfärbbar, kein Bildrecht-Problem. |
| Abbildungen aus Büchern | JPG in `inhalte/bilder/`, beim Build **als Base64 eingebettet** | Die HTML-Datei bleibt eine Einzeldatei. |
| Speicher | `localStorage` + Spielstand-Datei (JSON) | Wie gefordert. Details in Abschnitt 6. |

## 3. Ordnerstruktur

```
99_Lerntool_Verdauung/
├── CLAUDE.md                    Regeln für künftige Sitzungen mit Claude
├── README.md                    Anleitung für dich (Deutsch)
├── build.py                     Build-Skript: prüfen + bündeln
├── .gitignore                   schließt quellen/ und dist/ aus
│
├── inhalte/                     ◄── HIER arbeitest du
│   ├── einstellungen.md         Ränge, XP-Werte, Bestehensgrenze 80 %, Schwellen
│   ├── glossar.md               Fachbegriff = deutscher Begriff | Erklärung | Quelle
│   ├── awards.md                Name, Bedingung, Fachfakt, Quelle, Form, Farben, Icon
│   ├── abbildungen.md           Rechte-Liste: Buch, Seite, Abb.-Nr., wo verwendet
│   ├── bilder/                  zugeschnittene Abbildungen
│   ├── spiele/
│   │   ├── enzym-spiel.md       Enzyme, Substrate, Erklärungen bei Fehlklick
│   │   └── broetchen-reise.md   Stationen und Auswahlmöglichkeiten
│   └── module/
│       ├── 1-1-naehrstoffe.md
│       ├── 2-2-magen.md
│       └── 3-1-verdauung-der-naehrstoffe.md
│
├── app/                         App-Logik (musst du nicht anfassen)
│   ├── vorlage.html
│   ├── stil/                    CSS: Farben, Hell/Dunkel, Layout
│   └── js/                      speicher, xp-raenge, awards, router, aufgaben/*.js …
│
├── dist/
│   └── lerntool-verdauung.html  ◄── das fertige Produkt
│
├── docs/                        Planungsunterlagen (diese Datei)
├── quellen/                     Bücher – NICHT in Git (Urheberrecht, 67 MB)
└── referenz/                    Prototyp
```

## 4. Format der Inhaltsdateien (Beispiel Modul Magen)

```markdown
# Modul: Magen
id: magen
block: 2
quellen: i-care S. 205–209; MKK S. 353–357

## Single-Choice
id: magen-sc-01
frage: Welche Zellen der Magendrüsen bilden die Salzsäure?
- [ ] Hauptzellen
- [x] Belegzellen
- [ ] Nebenzellen
- [ ] G-Zellen
erklärung: Die [[Belegzellen]] bilden die Salzsäure des Magensafts.
quelle: MKK S. 354

## Multiple-Choice
id: magen-mc-01
frage: Welche Abschnitte gehören zum Magen?
- [x] Kardia
- [x] Fundus
- [ ] Zäkum
- [x] Antrum
quelle: MKK S. 354

## Zuordnung
id: magen-zu-01
frage: Ordne jeder Zellart ihr Produkt zu.
- Hauptzellen => Pepsinogen
- Belegzellen => Salzsäure
- Nebenzellen => Schleim
quelle: MKK S. 354

## Reihenfolge
id: aufbau-rf-01
frage: Bring die Abschnitte in die Reihenfolge, die der Speisebrei durchläuft.
1. Magen
2. Duodenum
3. Jejunum
4. Ileum
5. Dickdarm
quelle: i-care S. 188

## Lückentext
id: magen-lt-01
text: Den Abschluss des Magens bildet der {{Pylorus}}. Er gibt den Speisebrei portionsweise an das {{Duodenum|Zwölffingerdarm}} ab.
quelle: MKK S. 354–355

## Karteikarte
vorne: Was ist der [[Pylorus]]?
hinten: Der Magenpförtner, der Übergang vom Magen zum Dünndarm.
quelle: i-care S. 205

## Operator
id: magen-op-01
operator: erläutern
afb: II
fall: Robartina begleitet Frau Abda zu einem Patienten, der über Sodbrennen klagt …
auftrag: Erläutere, wie die Magenschleimhaut sich selbst vor der Salzsäure schützt.
mindestlänge: 400
kriterien:
- Ich nenne die Nebenzellen als Schleimbildner.
- Ich erkläre, dass der Schleim die Oberfläche bedeckt.
- …
musterlösung: …
quelle: MKK S. 354
```

*(Die Fachinhalte in diesem Beispiel sind nur zur Veranschaulichung und noch nicht gegen das Buch geprüft.)*

**Sonderzeichen, die die App versteht:**
- `[[Pylorus]]` = Fachbegriff aus dem Glossar. Die App ergänzt beim **ersten Auftreten im Modul** automatisch „(Magenpförtner)“ und macht das Wort antippbar. Die Fachbegriff-Regel wird so technisch erzwungen und du musst nicht selbst darauf achten.
- `{{Lösung|Alternative}}` = Lücke im Lückentext mit erlaubten Schreibweisen.
- `- [x]` / `- [ ]` = richtige / falsche Antwort.

**Das Build-Skript prüft u. a.:** jede Aufgabe hat eine `quelle`, Single-Choice hat genau eine richtige Antwort, Multiple-Choice mindestens zwei richtige, IDs sind eindeutig, jeder `[[Begriff]]` steht im Glossar, jedes Bild steht in `abbildungen.md`. Fehler sehen z. B. so aus:
`FEHLER in module/2-2-magen.md, Zeile 42: Single-Choice „magen-sc-03“ hat 2 richtige Antworten (erlaubt: genau 1).`

## 5. Spielmechanik (Vorschlag, alle Zahlen in `einstellungen.md` änderbar)

**Modul-Durchgang** („Modulcheck“): 12 zufällig gezogene, automatisch bewertbare Aufgaben (SC, MC, Zuordnung, Reihenfolge, Lückentext, Bildzuordnung, Fehlerfahndung) → Prozentwert. **Bestanden ab 80 %.**
Karteikarten, Quiz auf Zeit, Enzym-Spiel, Brötchen-Reise und Operatoraufgaben sind **Übungsmodi**. Sie bringen XP und zählen für Awards, aber nicht für den Modul-Prozentwert.

**Freischaltung:** Ein Block öffnet sich, wenn **alle vorhandenen** Module des vorherigen Blocks bestanden sind. Im MVP fehlt z. B. „Aufbau“ in Block 1, deshalb genügt dort „Nährstoffe“. Jede Erkrankung öffnet sich erst, wenn ihr Organmodul bestanden ist.

**XP (Vorschlag):**

| Aktion | XP |
|---|---|
| richtige Aufgabe im Modulcheck | 10 |
| Modulcheck bestanden | +50 (beim ersten Mal +100) |
| Karteikarte ein Fach weiter | 2 |
| Operatoraufgabe bestanden (Selbstcheck ≥ 60 %) | 30 |
| Quiz auf Zeit: richtige Antwort | 5 |
| Enzym-Spiel: Treffer | 1 |
| Award erhalten | 25 |

**Rangschwellen (Vorschlag):** Praktikantin 0 · Famulantin 150 · PJlerin 400 · Assistenzärztin 800 · Oberärztin 1.400 · Chefärztin 2.200 · Gesundheitsministerin 3.200 XP.
Mikrovilli-Millionärin (1.000 XP) liegt damit zwischen Assistenz- und Oberärztin.

**Awards, die im MVP noch nicht erreichbar sind** (weil Module fehlen): Darmcharmeur, Gastroenterologin, Zottenkönigin, Diagnose-Detektivin, Insulin-Ass, Gut gekaut ist halb verdaut, Karteikarten-Königin (100 Karten in Fach 5 brauchen mehr Karten als 3 Module liefern). Sie erscheinen trotzdem grau mit Fortschrittsbalken auf der Wand.

## 6. Speichern, Laden, Datenschutz

- **localStorage-Schlüssel** `verdauung-lerntool` speichert nur: Formwahl (w/m/n), XP, Modulergebnisse (Datum, %), Leitner-Fächer (Karten-IDs), IDs falsch beantworteter Aufgaben, Award-Daten, Serien-Tage. **Keine Freitexte, keine Namen.**
- **Spielstand-Datei** `verdauung-spielstand-2026-09-30.json`:
  ```json
  { "app": "verdauung-lerntool", "formatversion": 1,
    "gespeichert": "2026-09-30T14:03:00", "daten": { … }, "pruefsumme": "a1b2c3d4e5f6" }
  ```
  Die Prüfsumme ist ein Hash über die Daten plus ein fest eingebautes „Salz“.
  **Ehrliche Einordnung:** Das verhindert Handänderungen in der Datei. Wer den Quelltext liest, kann es aber umgehen. Gegen „einfache Manipulation“ reicht das, fälschungssicher ist es ohne Server nicht.
- **`formatversion`**: Beim Laden wandelt eine Migrationsfunktion alte Formate schrittweise um (1 → 2 → 3 …).
- **Vorschau vor dem Laden:** Datum, Rang, Anzahl Awards. Eine Warnung erscheint, wenn die Datei älter ist als der aktuelle Stand.
- **Erinnerung nach jedem Modulabschluss:** „Sichere deinen Spielstand“ mit Knopf.
- **Anleitung** „Wo landet die Datei?“ für iPad (Dateien-App → Downloads), Android (Downloads-Ordner) und PC (Downloads-Ordner).
- **Nachweis-Ansicht** (nur Bildschirm, kein Druck- oder Export-Button): Rang, XP, Awards mit Datum, **Prüfcode** (8 Zeichen, aus dem Spielstand berechnet).
- **Operatoraufgaben:** Der Text lebt nur im Arbeitsspeicher und ist nach dem Verlassen der Aufgabe weg. Vorher erscheint ein Hinweis.

## 7. Barrierearmut und Design

- Mobile first (ab 320 px), Tastatur überall (Reihenfolge: Pfeiltasten und Knöpfe „nach oben/unten“, kein Drag-and-Drop nötig), sichtbarer Fokus, Kontrast AA.
- `prefers-reduced-motion`: Die Award-Animation wird dann zu einer einfachen Einblendung, im Enzym-Spiel „fliegen“ die Substrate langsam oder stehen still.
- Hell/Dunkel: automatisch nach Systemeinstellung, zusätzlich ein Umschalter.
- Farbwelt und Award-Plaketten übernehme ich aus dem Prototyp. Die Google-Fonts-Einbindung entfällt.

## 8. Umsetzungsplan

| Phase | Inhalt | Ergebnis / Commit |
|---|---|---|
| **0** | Deine Freigabe + Antworten auf die offenen Fragen | – |
| **1** | Git-Repository, `.gitignore`, `CLAUDE.md`, `build.py` mit Parser und Prüfungen, App-Grundgerüst (Navigation, Hell/Dunkel, Datenschutzhinweis) | Baubare leere App |
| **2** | Aufgaben-Engine: SC, MC, Zuordnung, Reihenfolge, Lückentext, Karteikarten/Leitner, „Meine Fehler“, Quiz auf Zeit | Aufgaben mit Testinhalten spielbar |
| **3** | XP, Ränge (w/m/n), Awards + Wand + Animation, Spielstand speichern/laden, Nachweis-Ansicht | Gamification komplett |
| **4** | Operatoraufgaben, Enzym-Spiel, Brötchen-Reise, Fehlerfahndung, Bildzuordnung | Alle MVP-Aufgabentypen |
| **5** | Inhalte der 3 MVP-Module, **jede Aufgabe gegen die Buchseite geprüft**, Glossar, Award-Fakten, Abbildungsliste | MVP fertig |
| **6** | README, Test auf Handy-/Tablet-/PC-Breite, Barrierefreiheits-Check | Abgabe an dich |

**Geplanter Umfang pro MVP-Modul:** ca. 20 Karteikarten, 10 SC, 6 MC, 3 Zuordnungen, 2–3 Reihenfolgen, 3 Lückentexte, 3 Operatoraufgaben (AFB I–III), 1 Fehlerfahndung, 1 Bildzuordnung (falls freigegeben).

**Aufgabentypen je MVP-Modul:**

| Typ | Nährstoffe | Magen | Verdauung der Nährstoffe |
|---|---|---|---|
| Karteikarten | ✓ | ✓ | ✓ |
| Single-/Multiple-Choice | ✓ | ✓ | ✓ |
| Operatoraufgaben | ✓ | ✓ | ✓ |
| Zuordnung | ✓ (Vitamin → Funktion) | ✓ (Zelle → Produkt) | ✓ (Enzym → Substrat) |
| Reihenfolge | – (fachlich wenig sinnvoll) | ✓ (Magenabschnitte, Entleerung) | ✓ (Abbauschritte) |
| Lückentext | ✓ | ✓ | ✓ |
| Quiz auf Zeit | ✓ | ✓ | ✓ |
| Enzym-Spiel | – | – | ✓ |
| Brötchen-Reise | – | – | ✓ |
| Bildzuordnung | ◐ (Ernährungsdreieck) | ✓ (Magen) | ✓ (Abb. 9.31–9.33) |
| Fehlerfahndung | ✓ | ✓ | – |
| Diagnose-Detektivin | – | – | – (nur Erkrankungen) |
| Meine Fehler | ✓ | ✓ | ✓ |
