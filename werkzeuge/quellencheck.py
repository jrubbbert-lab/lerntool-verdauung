#!/usr/bin/env python3
"""Quellencheck: Stehen die Inhaltswörter der RICHTIGEN Antworten auf der zitierten Buchseite?

Aufruf:  python3 werkzeuge/quellencheck.py                 alle Module
         python3 werkzeuge/quellencheck.py magen           nur ein Modul (ID)
         python3 werkzeuge/quellencheck.py magen --alle    auch Aufgaben ohne Auffälligkeiten zeigen

Das Werkzeug ersetzt NICHT das eigene Nachlesen. Es findet aber schnell Aufgaben,
bei denen die Seitenangabe vermutlich nicht stimmt oder ein Begriff im Buch nicht vorkommt.
Voraussetzung: einmal  python3 werkzeuge/texte_erzeugen.py  ausgeführt.
"""
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import build  # noqa: E402  (nutzt den Parser des Build-Skripts)
import suche  # noqa: E402

STOPP = set("""aber alle allem allen aller alles also andere anderen auch auf aus bei beim bereits besonders bis
dabei damit dann darin dass davon dazu dem den denen der deren des deshalb die dies diese diesem diesen dieser
doch durch eine einem einen einer eines etwa etwas für gegen haben hier ihre ihren ihrer immer indem jede jedem
jeden jeder kann können mehr mit nach nicht noch nur oder ohne schon sehr sein seine seinen seiner sich sie sind
sodass sowie über unter viel vom von vor wird werden wenn wie wieder zum zur zwischen zwei drei vier fünf ich
richtig falsch wähle nenne ordne welche welcher welches wann warum wofür bringe reihenfolge dabei dort
kleine kleinen großen große gibt heißt bzw""".split())


def woerter(text):
    text = re.sub(r"\[\[(.+?)(\|(.+?))?\]\]", lambda m: m.group(3) or m.group(1), str(text))
    text = re.sub(r"\{\{(.+?)\}\}", lambda m: m.group(1).split("|")[0], text)
    text = re.sub(r"\*\*|[„“\"()]", " ", text)
    return [w for w in re.findall(r"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß\-]{4,}", text) if w.lower() not in STOPP]


def seitentexte():
    texte = {}
    for buch, seite, text in suche.seiten():
        texte[(buch, seite)] = re.sub(r"\s+", " ", text).lower()
    return texte


def seiten_aus(quellen):
    """'i-care S. 205, 240' / 'MKK S. 354–355' → [(buch, seite), …]"""
    aus = []
    for q in quellen:
        m = re.match(r"(i-care|MKK) S\. (.+)$", q)
        if not m:
            continue
        for teil in m.group(2).split(","):
            von_bis = [int(x) for x in re.findall(r"\d{3}", teil)]
            if len(von_bis) == 2:
                aus += [(m.group(1), s) for s in range(von_bis[0], von_bis[1] + 1)]
            elif von_bis:
                aus.append((m.group(1), von_bis[0]))
    return aus


def kernaussagen(a):
    """Die Textteile, die fachlich stimmen MÜSSEN (richtige Antworten, Lösungen)."""
    t = a["typ"]
    if t == "karteikarte":
        return [a["hinten"]]
    if t in ("single-choice", "multiple-choice"):
        return [o["text"] for o in a["optionen"] if o["richtig"]]
    if t == "zuordnung":
        return [p["links"] + " " + p["rechts"] for p in a["paare"]]
    if t == "reihenfolge":
        return a["schritte"]
    if t == "lückentext":
        return [a["text"]]
    if t == "operator":
        return [a["musterloesung"]]
    if t == "fehlerfahndung":
        return [f.get("loesung", f["rechts"]) for f in a["fehler"]]
    if t == "diagnose":
        return [a["diagnose"]] + a["hinweise"]
    return []


def main():
    nur = [x for x in sys.argv[1:] if not x.startswith("--")]
    alle = "--alle" in sys.argv
    texte = seitentexte()
    glossar = build.lies_glossar()
    gesamt, auffaellig = 0, 0
    for pfad in sorted(os.listdir(os.path.join(build.INHALTE, "module"))):
        m = build.lies_modul(os.path.join(build.INHALTE, "module", pfad), glossar, True)
        if nur and m["id"] not in nur:
            continue
        for a in m["aufgaben"] + m["karten"] + m["operatoren"]:
            gesamt += 1
            seiten = seiten_aus(a["quelle"])
            text = " ".join(texte.get(s, "") for s in seiten)
            fehlend = []
            for satz in kernaussagen(a):
                for w in woerter(satz):
                    stamm = w.lower()[: max(5, len(w) - 3)]   # grobe Stammform: Endungen ignorieren
                    if stamm not in text:
                        fehlend.append(w)
            fehlend = list(dict.fromkeys(fehlend))
            if fehlend or alle:
                auffaellig += bool(fehlend)
                titel = a.get("frage") or a.get("vorne") or a.get("text") or a.get("auftrag") or a.get("titel")
                print(f"[{m['id']}] {a['typ']} · {a['quelle']}\n   {str(titel)[:90]}")
                if fehlend:
                    print(f"   nicht auf der Seite gefunden: {', '.join(fehlend)}")
    print(f"\n{gesamt} Aufgaben geprüft, {auffaellig} mit Wörtern, die auf der zitierten Seite nicht vorkommen.")
    print("Bitte diese Aufgaben von Hand gegen das Buch prüfen (Synonyme und Umformulierungen sind oft in Ordnung).")


if __name__ == "__main__":
    main()
