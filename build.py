#!/usr/bin/env python3
"""Build-Skript für das Lerntool Verdauung.

Aufrufe (im Projektordner):
  python3 build.py                 prüft alle Inhalte und baut die öffentliche Version  → docs/index.html
  python3 build.py --kursversion   baut zusätzlich die Kursversion mit Abbildungen       → dist/lerntool-verdauung-kurs.html
  python3 build.py --pruefen       prüft nur, baut nichts

Benötigt nur Python 3 (ab 3.8), keine Zusatzpakete.
"""
import base64
import datetime
import glob
import hashlib
import json
import os
import re
import sys

PROJEKT = os.path.dirname(os.path.abspath(__file__))
# Für Tests kann ein anderer Inhaltsordner bzw. Ausgabepfad gesetzt werden (LT_INHALTE, LT_AUSGABE)
INHALTE = os.environ.get("LT_INHALTE") or os.path.join(PROJEKT, "inhalte")
APP = os.path.join(PROJEKT, "app")
AUSGABE_OEFFENTLICH = os.environ.get("LT_AUSGABE") or os.path.join(PROJEKT, "docs", "index.html")
AUSGABE_KURS = os.path.join(PROJEKT, "dist", "lerntool-verdauung-kurs.html")

BUECHER = {"i-care": "I care Anatomie, Physiologie", "MKK": "Mensch Körper Krankheit"}

# ---------------------------------------------------------------------------
# Meldungen
# ---------------------------------------------------------------------------
FEHLER, WARNUNGEN = [], []


def fehler(ort, text):
    FEHLER.append(f"FEHLER   {ort}: {text}")


def warnung(ort, text):
    WARNUNGEN.append(f"WARNUNG  {ort}: {text}")


def rel(pfad):
    return os.path.relpath(pfad, INHALTE)


# ---------------------------------------------------------------------------
# Welche Schlüssel gibt es in welchem Abschnitt?
# ---------------------------------------------------------------------------
GEMEINSAM = {"id", "quelle", "erklärung"}
TYPEN = {
    "karteikarte": {"vorne", "hinten"},
    "single-choice": {"frage"},
    "multiple-choice": {"frage"},
    "zuordnung": {"frage", "paare"},
    "reihenfolge": {"frage"},
    "lückentext": {"text"},
    "operator": {"operator", "afb", "fall", "auftrag", "mindestlänge", "kriterien", "musterlösung"},
    "bildzuordnung": {"frage", "bild", "marker"},
    "fehlerfahndung": {"titel", "bericht", "fehler"},
    "diagnose": {"titel", "hinweise", "diagnose", "optionen"},
}
# Kurznamen, die in IDs verwendet werden
KUERZEL = {"karteikarte": "kk", "single-choice": "sc", "multiple-choice": "mc", "zuordnung": "zu",
           "reihenfolge": "rf", "lückentext": "lt", "operator": "op", "bildzuordnung": "bz",
           "fehlerfahndung": "ff", "diagnose": "dx"}
MODULKOPF = {"id", "titel", "block", "nr", "organ", "status", "beschreibung", "quellen", "icon", "farbe"}
GLOSSAR = {"deutsch", "erklärung", "quelle"}
AWARD = {"id", "name", "geheim", "regel", "bedingung", "fakt", "quelle", "form", "farbe1", "farbe2", "icon"}
ABBILDUNG = {"datei", "buch", "seite", "abbildung", "titel", "fremdquelle", "verwendet", "bildnr"}
EINSTELLUNGEN = {"bestehensgrenze", "modulcheck_aufgaben", "operator_bestehensgrenze", "quiz_sekunden",
                 "enzym_sekunden", "xp", "raenge", "bloecke"}

# Regeln, die app/js/40-awards.js versteht (Name → Anzahl Parameter)
AWARD_REGELN = {
    "modul_uhrzeit": 2, "operatoren_afb": 1, "modul_mehrfach": 3, "bloecke_bestanden": 1,
    "serie_richtig": 1, "verbesserung": 1, "tage_in_folge": 1, "unter_dann_ueber": 2,
    "modul_prozent": 2, "enzym_punkte": 1, "karten_fach5": 1, "diagnosen": 1, "block_frei": 1,
    "modul_abschluesse": 1, "reihenfolge_fehlerfrei": 1, "xp": 1, "quiz_serie": 1,
    "freitag13": 1, "aprilscherz": 0,
}
FORMEN = {"rund", "sechseck", "zacken", "schild"}

RE_SCHLUESSEL = re.compile(r"^([A-Za-zÄÖÜäöüß_][A-Za-zÄÖÜäöüß_0-9]*):\s?(.*)$")
RE_OPTION = re.compile(r"^-\s*\[( |x|X)\]\s+(.+)$")
RE_PAAR = re.compile(r"^-\s+(.+?)\s*=>\s*(.+)$")
RE_NUMMER = re.compile(r"^\d+\.\s+(.+)$")
RE_PUNKT = re.compile(r"^-\s+(.+)$")
RE_QUELLE = re.compile(r"^(i-care|MKK) S\. \d{3}(–\d{3})?(, \d{3}(–\d{3})?)*$")


# ---------------------------------------------------------------------------
# Parser für das Markdown-Format
# ---------------------------------------------------------------------------
class Abschnitt:
    """Ein Block unter einer ##-Überschrift (bzw. der Dateikopf)."""

    def __init__(self, typ, datei, zeile):
        self.typ, self.datei, self.zeile = typ, datei, zeile
        self.werte, self.listen, self.zeilen = {}, {}, {}

    def ort(self, schluessel=None):
        z = self.zeilen.get(schluessel, self.zeile)
        return f"{rel(self.datei)}, Zeile {z}"

    def get(self, schluessel, standard=""):
        return self.werte.get(schluessel, standard).strip()


def lies_datei(pfad, erlaubt):
    """Zerlegt eine Inhaltsdatei in Kopf, Titel und Abschnitte.

    erlaubt: Funktion (abschnittstyp) → Menge erlaubter Schlüssel, oder None bei unbekanntem Typ.
    """
    titel, kopf = "", Abschnitt("kopf", pfad, 1)
    abschnitte, aktuell = [], kopf
    listen_besitzer, letzter = None, None
    im_kommentar = False
    with open(pfad, encoding="utf-8") as f:
        for nr, roh in enumerate(f, start=1):
            zeile = roh.rstrip("\n").rstrip()
            s = zeile.strip()
            # HTML-Kommentare <!-- … --> überspringen
            if im_kommentar:
                im_kommentar = "-->" not in s
                continue
            if s.startswith("<!--"):
                im_kommentar = "-->" not in s
                continue
            if s.startswith("# ") and not titel:
                titel = s[2:].strip()
                continue
            if s.startswith("## "):
                typ = s[3:].strip()
                aktuell = Abschnitt(typ, pfad, nr)
                abschnitte.append(aktuell)
                listen_besitzer, letzter = None, None
                if erlaubt(typ.lower()) is None:
                    fehler(f"{rel(pfad)}, Zeile {nr}", f"Unbekannter Abschnitt „## {typ}“.")
                continue
            if not s:
                if letzter and aktuell.werte.get(letzter):
                    aktuell.werte[letzter] += "\n"
                continue
            erlaubte = erlaubt(aktuell.typ.lower()) or set()
            m = RE_SCHLUESSEL.match(s)
            if m and m.group(1).lower() in erlaubte:
                schluessel = m.group(1).lower()
                if schluessel in aktuell.werte:
                    fehler(f"{rel(pfad)}, Zeile {nr}", f"„{schluessel}:“ steht doppelt im selben Abschnitt.")
                aktuell.werte[schluessel] = m.group(2)
                aktuell.zeilen[schluessel] = nr
                letzter = schluessel
                listen_besitzer = schluessel if not m.group(2).strip() else None
                continue
            for muster, art in ((RE_OPTION, "option"), (RE_PAAR, "paar"), (RE_NUMMER, "nummer"), (RE_PUNKT, "punkt")):
                m = muster.match(s)
                if m:
                    besitzer = listen_besitzer or "_liste"
                    if art == "option":
                        eintrag = {"text": m.group(2).strip(), "richtig": m.group(1).lower() == "x"}
                    elif art == "paar":
                        eintrag = {"links": m.group(1).strip(), "rechts": m.group(2).strip()}
                    else:
                        eintrag = m.group(1).strip()
                    aktuell.listen.setdefault(besitzer, []).append((art, eintrag, nr))
                    aktuell.zeilen.setdefault(besitzer, nr)
                    break
            else:
                if letzter is None:
                    fehler(f"{rel(pfad)}, Zeile {nr}",
                           f"Zeile gehört zu keinem Feld: „{s[:60]}“. Fehlt ein „schlüssel:“ davor?")
                else:
                    trenner = "" if aktuell.werte[letzter].endswith("\n") or not aktuell.werte[letzter] else " "
                    aktuell.werte[letzter] += trenner + s
    return titel, kopf, abschnitte


def liste(abschnitt, besitzer, art=None):
    """Einträge einer Liste, optional nur einer bestimmten Art."""
    return [(a, e, z) for a, e, z in abschnitt.listen.get(besitzer, []) if art is None or a == art]


# ---------------------------------------------------------------------------
# Prüfhilfen
# ---------------------------------------------------------------------------
def pruefe_quelle(abschnitt, pflicht=True):
    q = abschnitt.get("quelle")
    if not q:
        if pflicht:
            fehler(abschnitt.ort(), f"„{abschnitt.typ}“ ohne „quelle:“. Jede Aufgabe braucht Buch und Seite.")
        return []
    teile = [t.strip().replace(" - ", "–").replace("-", "–").replace("i–care", "i-care") for t in q.split(";")]
    for t in teile:
        if not RE_QUELLE.match(t):
            fehler(abschnitt.ort("quelle"),
                   f"Quelle „{t}“ hat nicht das Format „i-care S. 205“ oder „MKK S. 354–355“.")
    return teile


def begriffe_in(text):
    return [b.split("|")[0].strip() for b in re.findall(r"\[\[(.+?)\]\]", text)]


def neue_id(abschnitt, modul_id, grundlage):
    kurz = hashlib.sha1(grundlage.encode("utf-8")).hexdigest()[:6]
    return f"{modul_id}-{KUERZEL.get(abschnitt.typ.lower(), 'x')}-{kurz}"


# ---------------------------------------------------------------------------
# Einzelne Aufgabentypen
# ---------------------------------------------------------------------------
def baue_aufgabe(a, modul_id, kursversion):
    typ = a.typ.lower()
    d = {"typ": typ, "quelle": pruefe_quelle(a), "erklaerung": a.get("erklärung")}
    grundlage = a.get("frage") or a.get("vorne") or a.get("text") or a.get("auftrag") or a.get("titel")
    d["id"] = a.get("id") or neue_id(a, modul_id, grundlage)
    if a.get("id") and not a.get("id").startswith(modul_id + "-"):
        warnung(a.ort("id"), f"ID „{a.get('id')}“ beginnt nicht mit dem Modulkürzel „{modul_id}-“.")

    def pflicht(*schluessel):
        for s in schluessel:
            if not a.get(s):
                fehler(a.ort(), f"„{a.typ}“ braucht das Feld „{s}:“.")

    if typ == "karteikarte":
        pflicht("vorne", "hinten")
        d.update(vorne=a.get("vorne"), hinten=a.get("hinten"))
    elif typ in ("single-choice", "multiple-choice"):
        pflicht("frage")
        opts = [e for _, e, _ in liste(a, "_liste", "option")]
        richtige = sum(o["richtig"] for o in opts)
        if len(opts) < 3:
            fehler(a.ort(), f"{a.typ} braucht mindestens 3 Antworten (gefunden: {len(opts)}).")
        if typ == "single-choice" and richtige != 1:
            fehler(a.ort(), f"Single-Choice hat {richtige} richtige Antworten (erlaubt: genau 1).")
        if typ == "multiple-choice" and richtige < 2:
            fehler(a.ort(), f"Multiple-Choice hat {richtige} richtige Antworten (nötig: mindestens 2). "
                            "Bei genau einer richtigen Antwort nimm „## Single-Choice“.")
        d.update(frage=a.get("frage"), optionen=opts)
    elif typ == "zuordnung":
        pflicht("frage")
        paare = [e for _, e, _ in liste(a, "_liste", "paar") + liste(a, "paare", "paar")]
        if len(paare) < 3:
            fehler(a.ort(), f"Zuordnung braucht mindestens 3 Paare „- links => rechts“ (gefunden: {len(paare)}).")
        d.update(frage=a.get("frage"), paare=paare)
    elif typ == "reihenfolge":
        pflicht("frage")
        schritte = [e for _, e, _ in liste(a, "_liste", "nummer")]
        if len(schritte) < 3:
            fehler(a.ort(), f"Reihenfolge braucht mindestens 3 nummerierte Schritte „1. …“ (gefunden: {len(schritte)}).")
        d.update(frage=a.get("frage"), schritte=schritte)
    elif typ == "lückentext":
        pflicht("text")
        luecken = re.findall(r"\{\{(.+?)\}\}", a.get("text"))
        if not luecken:
            fehler(a.ort("text"), "Lückentext ohne Lücke. Markiere Lücken mit {{Lösung}} oder {{Lösung|Alternative}}.")
        d.update(text=a.get("text"))
    elif typ == "operator":
        pflicht("operator", "afb", "fall", "auftrag", "musterlösung")
        afb = a.get("afb").upper()
        if afb not in ("I", "II", "III"):
            fehler(a.ort("afb"), f"AFB „{a.get('afb')}“ ist ungültig (erlaubt: I, II, III).")
        kriterien = [e for _, e, _ in liste(a, "kriterien", "punkt")]
        if not 4 <= len(kriterien) <= 6:
            fehler(a.ort("kriterien"), f"Operatoraufgaben brauchen 4–6 Kriterien (gefunden: {len(kriterien)}).")
        try:
            laenge = int(a.get("mindestlänge") or 300)
        except ValueError:
            fehler(a.ort("mindestlänge"), "Mindestlänge muss eine Zahl sein (Anzahl Zeichen).")
            laenge = 300
        d.update(operator=a.get("operator"), afb=afb, fall=a.get("fall"), auftrag=a.get("auftrag"),
                 mindestlaenge=laenge, kriterien=kriterien, musterloesung=a.get("musterlösung"))
    elif typ == "bildzuordnung":
        pflicht("frage", "bild")
        marker = [e for _, e, _ in liste(a, "marker", "paar")]
        if len(marker) < 3:
            fehler(a.ort(), "Bildzuordnung braucht unter „marker:“ mindestens 3 Zeilen „- x% y% => Begriff“.")
        punkte = []
        for m in marker:
            k = re.match(r"^(\d+(?:[.,]\d+)?)\s*%?\s+(\d+(?:[.,]\d+)?)\s*%?$", m["links"])
            if not k:
                fehler(a.ort("marker"), f"Marker „{m['links']}“: erwartet „x% y%“, z. B. „42% 17%“.")
                continue
            punkte.append({"x": float(k.group(1).replace(",", ".")), "y": float(k.group(2).replace(",", ".")),
                           "begriff": m["rechts"]})
        d.update(frage=a.get("frage"), bild=a.get("bild"), marker=punkte)
    elif typ == "fehlerfahndung":
        pflicht("titel", "bericht")
        fehlerliste = [e for _, e, _ in liste(a, "fehler", "paar")]
        if len(fehlerliste) < 2:
            fehler(a.ort(), "Fehlerfahndung braucht unter „fehler:“ mindestens 2 Zeilen „- falsch => richtig“.")
        for f in fehlerliste:
            # Format: - falsch => Musterkorrektur || schlüsselwort1|schlüsselwort2
            if "||" in f["rechts"]:
                f["loesung"], f["rechts"] = [t.strip() for t in f["rechts"].split("||", 1)]
            if f["links"] not in a.get("bericht"):
                fehler(a.ort("fehler"), f"Fehler „{f['links']}“ kommt im Bericht nicht wörtlich vor.")
        d.update(titel=a.get("titel"), bericht=a.get("bericht"), fehler=fehlerliste)
    elif typ == "diagnose":
        pflicht("titel", "diagnose")
        hinweise = [e for _, e, _ in liste(a, "hinweise", "punkt")]
        optionen = [e for _, e, _ in liste(a, "optionen", "punkt")]
        if len(hinweise) < 3:
            fehler(a.ort(), "Diagnose braucht unter „hinweise:“ mindestens 3 Hinweise.")
        if a.get("diagnose") not in optionen:
            fehler(a.ort("optionen"), "Die richtige Diagnose muss auch unter „optionen:“ stehen.")
        d.update(titel=a.get("titel"), hinweise=hinweise, diagnose=a.get("diagnose"), optionen=optionen)
    return d


# ---------------------------------------------------------------------------
# Dateien einlesen
# ---------------------------------------------------------------------------
def lies_einstellungen():
    pfad = os.path.join(INHALTE, "einstellungen.md")
    _, kopf, abschnitte = lies_datei(pfad, lambda t: EINSTELLUNGEN if t == "kopf" else None)
    e = {}
    for s in ("bestehensgrenze", "modulcheck_aufgaben", "operator_bestehensgrenze", "quiz_sekunden", "enzym_sekunden"):
        try:
            e[s] = int(kopf.get(s))
        except ValueError:
            fehler(kopf.ort(s), f"„{s}:“ muss eine ganze Zahl sein.")
    e["xp"] = {p["links"]: int(p["rechts"]) for _, p, _ in liste(kopf, "xp", "paar")}
    e["raenge"] = []
    for _, p, z in liste(kopf, "raenge", "paar"):
        formen = [f.strip() for f in p["rechts"].split("/")]
        if len(formen) != 3:
            fehler(f"einstellungen.md, Zeile {z}", "Rang braucht drei Formen: „weiblich / männlich / neutral“.")
            continue
        e["raenge"].append({"xp": int(p["links"]), "w": formen[0], "m": formen[1], "n": formen[2]})
    e["bloecke"] = [{"nr": int(p["links"]), "titel": p["rechts"]} for _, p, _ in liste(kopf, "bloecke", "paar")]
    return e


def lies_glossar():
    pfad = os.path.join(INHALTE, "glossar.md")
    _, _, abschnitte = lies_datei(pfad, lambda t: GLOSSAR)
    g = {}
    for a in abschnitte:
        if not a.get("deutsch"):
            fehler(a.ort(), f"Glossarbegriff „{a.typ}“ braucht „deutsch:“.")
        if a.typ.lower() in {k.lower() for k in g}:
            fehler(a.ort(), f"Glossarbegriff „{a.typ}“ steht doppelt.")
        g[a.typ] = {"deutsch": a.get("deutsch"), "erklaerung": a.get("erklärung"), "quelle": pruefe_quelle(a)}
    return g


def lies_awards():
    pfad = os.path.join(INHALTE, "awards.md")
    _, _, abschnitte = lies_datei(pfad, lambda t: AWARD)
    awards, ids = [], set()
    for a in abschnitte:
        for s in ("id", "name", "regel", "bedingung"):
            if not a.get(s):
                fehler(a.ort(), f"Award „{a.typ}“ braucht „{s}:“.")
        regel = a.get("regel").split()
        if regel and regel[0] not in AWARD_REGELN:
            fehler(a.ort("regel"), f"Unbekannte Regel „{regel[0]}“. Bekannt: {', '.join(sorted(AWARD_REGELN))}.")
        elif regel and len(regel) - 1 != AWARD_REGELN[regel[0]]:
            fehler(a.ort("regel"), f"Regel „{regel[0]}“ braucht {AWARD_REGELN[regel[0]]} Angabe(n).")
        if a.get("id") in ids:
            fehler(a.ort("id"), f"Award-ID „{a.get('id')}“ doppelt.")
        ids.add(a.get("id"))
        form = a.get("form") or "rund"
        if form not in FORMEN:
            fehler(a.ort("form"), f"Form „{form}“ unbekannt (erlaubt: {', '.join(sorted(FORMEN))}).")
        namen = [n.strip() for n in a.get("name").split("/")]
        if len(namen) not in (1, 3):
            fehler(a.ort("name"), "Name: entweder eine Form oder drei Formen „weiblich / männlich / neutral“.")
        namen = (namen * 3)[:3] if len(namen) == 1 else namen
        quelle = pruefe_quelle(a, pflicht=bool(a.get("fakt")))
        if not a.get("fakt"):
            warnung(a.ort(), f"Award „{a.get('id')}“ hat noch keinen Fachfakt.")
        awards.append({"id": a.get("id"), "name": {"w": namen[0], "m": namen[1], "n": namen[2]},
                       "geheim": a.get("geheim").lower() == "ja", "regel": regel, "bedingung": a.get("bedingung"),
                       "fakt": a.get("fakt"), "quelle": quelle, "form": form,
                       "farbe1": a.get("farbe1") or "#f2b544", "farbe2": a.get("farbe2") or "#c9820f",
                       "icon": a.get("icon") or "stern"})
    return awards


def lies_abbildungen():
    pfad = os.path.join(INHALTE, "abbildungen.md")
    if not os.path.exists(pfad):
        return {}
    _, _, abschnitte = lies_datei(pfad, lambda t: ABBILDUNG)
    abb = {}
    for a in abschnitte:
        for s in ("datei", "buch", "seite", "abbildung"):
            if not a.get(s):
                fehler(a.ort(), f"Abbildung „{a.typ}“ braucht „{s}:“.")
        if a.get("buch") and a.get("buch") != "i-care":
            fehler(a.ort("buch"), "Abbildungen nur aus i-care (MKK-Bilder tragen ein Wasserzeichen).")
        abb[a.get("datei")] = {k: a.get(k) for k in ABBILDUNG}
    return abb


def lies_modul(pfad, glossar, kursversion):
    def erlaubt(typ):
        if typ == "kopf":
            return MODULKOPF
        return (TYPEN[typ] | GEMEINSAM) if typ in TYPEN else None

    titel, kopf, abschnitte = lies_datei(pfad, erlaubt)
    mid = kopf.get("id")
    if not mid:
        fehler(kopf.ort(), "Modul ohne „id:“ im Kopf.")
    m = {"id": mid, "titel": kopf.get("titel") or titel.replace("Modul:", "").strip(),
         "block": int(kopf.get("block") or 0), "nr": int(kopf.get("nr") or 0), "organ": kopf.get("organ"),
         "beschreibung": kopf.get("beschreibung"), "quellen": kopf.get("quellen"),
         "icon": kopf.get("icon") or "magen", "farbe": kopf.get("farbe") or "#c9820f",
         "aufgaben": [], "karten": [], "operatoren": [], "status": "aktiv"}
    if (kopf.get("status") or "").lower() == "in vorbereitung":
        m["status"] = "vorbereitung"
    if m["block"] not in (1, 2, 3, 4):
        fehler(kopf.ort("block"), "„block:“ muss 1, 2, 3 oder 4 sein.")
    if m["block"] == 4 and not m["organ"]:
        fehler(kopf.ort(), "Erkrankungsmodule (Block 4) brauchen „organ:“ mit der ID des Organmoduls.")
    ids = set()
    for a in abschnitte:
        if a.typ.lower() not in TYPEN:
            continue
        d = baue_aufgabe(a, mid, kursversion)
        if d["id"] in ids:
            fehler(a.ort(), f"ID „{d['id']}“ kommt in diesem Modul doppelt vor.")
        ids.add(d["id"])
        for feld in ("frage", "vorne", "hinten", "text", "erklaerung", "fall", "auftrag", "musterloesung", "bericht"):
            for b in begriffe_in(str(d.get(feld, ""))):
                if b.lower() not in {k.lower() for k in glossar}:
                    fehler(a.ort(), f"Fachbegriff [[{b}]] fehlt in glossar.md.")
        if d["typ"] == "bildzuordnung" and not kursversion:
            continue  # öffentliche Version: keine Buchabbildungen
        ziel = {"karteikarte": "karten", "operator": "operatoren"}.get(d["typ"], "aufgaben")
        m[ziel].append(d)
    if m["status"] == "aktiv" and not (m["aufgaben"] or m["karten"]):
        m["status"] = "vorbereitung"
    return m



# ---------------------------------------------------------------------------
# Spiele: Enzym-Spiel, Brötchen-Reise, Aprilscherz
# ---------------------------------------------------------------------------
ENZYM = {"id", "ort", "info", "quelle", "spaltet", "nicht"}
STATION = {"id", "nährstoff", "ort", "frage", "erklärung", "quelle"}


def lies_spiele(glossar):
    spiele = {}
    ordner = os.path.join(INHALTE, "spiele")

    pfad = os.path.join(ordner, "enzym-spiel.md")
    if os.path.exists(pfad):
        _, kopf, abschnitte = lies_datei(pfad, lambda t: ENZYM if t.startswith("enzym:") else (
            {"modul", "einleitung"} if t == "kopf" else None))
        enzyme = []
        for a in abschnitte:
            name = a.typ.split(":", 1)[1].strip()
            spaltet = [e for _, e, _ in liste(a, "spaltet", "paar")]
            nicht = [e for _, e, _ in liste(a, "nicht", "paar")]
            if not spaltet:
                fehler(a.ort(), f"Enzym „{name}“ braucht unter „spaltet:“ mindestens eine Zeile „- Substrat => Erklärung“.")
            enzyme.append({"name": name, "id": a.get("id") or name.lower(), "ort": a.get("ort"), "info": a.get("info"),
                           "quelle": pruefe_quelle(a), "spaltet": spaltet, "nicht": nicht})
        spiele["enzym"] = {"modul": kopf.get("modul"), "einleitung": kopf.get("einleitung"), "enzyme": enzyme}

    pfad = os.path.join(ordner, "broetchen-reise.md")
    if os.path.exists(pfad):
        _, kopf, abschnitte = lies_datei(pfad, lambda t: STATION if t == "station" else (
            {"modul", "einleitung"} if t == "kopf" else None))
        stationen = []
        for a in abschnitte:
            opts = [e for _, e, _ in liste(a, "_liste", "option")]
            if sum(o["richtig"] for o in opts) != 1 or len(opts) < 3:
                fehler(a.ort(), "Station braucht mindestens 3 Antworten, genau eine mit [x].")
            for f in ("nährstoff", "ort", "frage"):
                if not a.get(f):
                    fehler(a.ort(), f"Station braucht „{f}:“.")
            stationen.append({"typ": "single-choice", "id": a.get("id") or "reise-" + hashlib.sha1(a.get("frage").encode()).hexdigest()[:6],
                              "naehrstoff": a.get("nährstoff"), "ort": a.get("ort"), "frage": a.get("frage"),
                              "optionen": opts, "erklaerung": a.get("erklärung"), "quelle": pruefe_quelle(a)})
        spiele["reise"] = {"modul": kopf.get("modul"), "einleitung": kopf.get("einleitung"), "stationen": stationen}

    pfad = os.path.join(ordner, "aprilscherz.md")
    if os.path.exists(pfad):
        _, _, abschnitte = lies_datei(pfad, lambda t: (TYPEN[t] | GEMEINSAM) if t == "single-choice" else None)
        for a in abschnitte:
            d = baue_aufgabe(a, "aprilscherz", False)
            d["id"] = "aprilscherz"
            spiele["aprilscherz"] = d
    return spiele

# ---------------------------------------------------------------------------
# Zusammenbauen
# ---------------------------------------------------------------------------
def daten_erzeugen(kursversion):
    einstellungen = lies_einstellungen()
    glossar = lies_glossar()
    awards = lies_awards()
    abbildungen = lies_abbildungen()
    module = [lies_modul(p, glossar, kursversion)
              for p in sorted(glob.glob(os.path.join(INHALTE, "module", "*.md")))]
    module.sort(key=lambda m: (m["block"], m["nr"]))
    ids = [m["id"] for m in module]
    for m in module:
        if m["organ"]:
            for o in m["organ"].split(","):
                if o.strip() not in ids:
                    fehler(f"module/{m['id']}", f"„organ: {o.strip()}“ ist keine Modul-ID.")
    bilder = {}
    for m in module:
        for a in m["aufgaben"]:
            if a["typ"] != "bildzuordnung":
                continue
            if a["bild"] not in abbildungen:
                fehler(f"module/{m['id']}", f"Bild „{a['bild']}“ fehlt in abbildungen.md (Rechte-Liste).")
            datei = os.path.join(INHALTE, "bilder", a["bild"])
            if not os.path.exists(datei):
                fehler(f"module/{m['id']}", f"Bilddatei inhalte/bilder/{a['bild']} nicht gefunden.")
                continue
            art = "image/png" if datei.lower().endswith(".png") else "image/jpeg"
            bilder[a["bild"]] = f"data:{art};base64," + base64.b64encode(open(datei, "rb").read()).decode()
    spiele = lies_spiele(glossar)
    return {
        "erstellt": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M"),
        "variante": "kurs" if kursversion else "oeffentlich",
        "buecher": BUECHER, "einstellungen": einstellungen, "glossar": glossar,
        "awards": awards, "module": module, "bilder": bilder, "spiele": spiele,
    }


def js_dateien():
    basis = sorted(glob.glob(os.path.join(APP, "js", "*.js")))
    aufgaben = sorted(glob.glob(os.path.join(APP, "js", "aufgaben", "*.js")))
    vorne = [p for p in basis if os.path.basename(p) < "50"]
    hinten = [p for p in basis if os.path.basename(p) >= "50"]
    return vorne + aufgaben + hinten


def html_erzeugen(daten):
    vorlage = open(os.path.join(APP, "vorlage.html"), encoding="utf-8").read()
    stil = "\n".join(open(p, encoding="utf-8").read() for p in sorted(glob.glob(os.path.join(APP, "stil", "*.css"))))
    skript = "\n".join(f"/* ---- {os.path.relpath(p, APP)} ---- */\n" + open(p, encoding="utf-8").read()
                       for p in js_dateien())
    json_text = json.dumps(daten, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = (vorlage.replace("/*__STIL__*/", stil)
                   .replace("/*__DATEN__*/", "window.INHALT=" + json_text + ";")
                   .replace("/*__SKRIPT__*/", skript))
    for extern in re.findall(r'(?:src|href)="(https?:[^"]+)"', html):
        fehler("app/", f"Externe Ressource gefunden: {extern}. Zur Laufzeit ist nichts Externes erlaubt.")
    return html


def zusammenfassung(daten):
    print(f"\nVariante: {'Kursversion (mit Abbildungen)' if daten['variante'] == 'kurs' else 'öffentlich (ohne Abbildungen)'}")
    for m in daten["module"]:
        zaehler = {}
        for a in m["aufgaben"]:
            zaehler[a["typ"]] = zaehler.get(a["typ"], 0) + 1
        teile = [f"{len(m['karten'])} Karteikarten"] if m["karten"] else []
        teile += [f"{n} {t}" for t, n in sorted(zaehler.items())]
        teile += [f"{len(m['operatoren'])} Operator"] if m["operatoren"] else []
        status = "in Vorbereitung" if m["status"] == "vorbereitung" else ", ".join(teile)
        print(f"  Block {m['block']} · {m['titel']:<42} {status}")
    print(f"  Glossar: {len(daten['glossar'])} Begriffe · Awards: {len(daten['awards'])}")


def main():
    nur_pruefen = "--pruefen" in sys.argv
    kurs = "--kursversion" in sys.argv
    varianten = [False, True] if kurs else [False]
    ergebnisse = [(v, daten_erzeugen(v)) for v in varianten]
    htmls = [(v, d, html_erzeugen(d)) for v, d in ergebnisse]
    for w in dict.fromkeys(WARNUNGEN):
        print(w)
    if FEHLER:
        for f in dict.fromkeys(FEHLER):
            print(f)
        print(f"\n{len(set(FEHLER))} Fehler – nichts gebaut. Bitte korrigieren und erneut ausführen.")
        sys.exit(1)
    zusammenfassung(ergebnisse[-1][1])
    if nur_pruefen:
        print("\nAlles in Ordnung (nur geprüft, nichts gebaut).")
        return
    for v, d, html in htmls:
        ziel = AUSGABE_KURS if v else AUSGABE_OEFFENTLICH
        os.makedirs(os.path.dirname(ziel), exist_ok=True)
        with open(ziel, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"\nGebaut: {os.path.relpath(ziel, PROJEKT)} ({len(html.encode()) // 1024} KB)")
    if kurs:
        print("Die Kursversion enthält Buchabbildungen: nur im geschlossenen Kurs verteilen, nicht veröffentlichen.")


if __name__ == "__main__":
    main()
