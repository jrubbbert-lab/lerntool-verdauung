#!/usr/bin/env python3
"""Sucht einen Begriff in beiden Büchern und zeigt Buch, gedruckte Seite und Kontext.

Aufruf:  python3 werkzeuge/suche.py Belegzellen
         python3 werkzeuge/suche.py "Magen.*pförtner"      (regulärer Ausdruck)
         python3 werkzeuge/suche.py --seite "MKK S. 354"   (ganze Seite anzeigen)

Voraussetzung: einmal  python3 werkzeuge/texte_erzeugen.py  ausgeführt.
Silbentrennungen am Zeilenende („Magen-\\npförtner“) werden vor der Suche zusammengefügt.
"""
import os
import re
import sys

TEXTE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "quellen", "_text")
DATEIEN = ["i-care-seiten.txt", "mkk-seiten.txt"]
KOPF = re.compile(r"^===== (i-care|MKK) S\. (\d+)[^=]*=====$", re.M)


def seiten():
    """Liefert (Buch, Seite, Text) für jede gedruckte Seite."""
    for datei in DATEIEN:
        pfad = os.path.join(TEXTE, datei)
        if not os.path.exists(pfad):
            sys.exit(f"{pfad} fehlt – bitte zuerst werkzeuge/texte_erzeugen.py ausführen.")
        inhalt = open(pfad, encoding="utf-8").read()
        teile = KOPF.split(inhalt)
        for i in range(1, len(teile), 3):
            text = teile[i + 2].replace("ﬀ", "ff").replace("ﬁ", "fi").replace("ﬂ", "fl").replace("ﬃ", "ffi")
            text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)   # Silbentrennung entfernen
            text = re.sub(r"(\w) (ff|fi|fl)", r"\1\2", text)  # OCR-Lücken bei Ligaturen
            yield teile[i], int(teile[i + 1]), text


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == "--seite":
        buch, seite = re.match(r"(i-care|MKK) S\. (\d+)", sys.argv[2]).groups()
        for b, s, text in seiten():
            if b == buch and s == int(seite):
                print(text)
        return
    muster = re.compile(sys.argv[1], re.I)
    anzahl = 0
    for buch, seite, text in seiten():
        flach = re.sub(r"\s+", " ", text)
        for treffer in muster.finditer(flach):
            a, e = max(0, treffer.start() - 90), min(len(flach), treffer.end() + 90)
            print(f"{buch} S. {seite}:  …{flach[a:e]}…")
            anzahl += 1
    print(f"\n{anzahl} Treffer")


if __name__ == "__main__":
    main()
