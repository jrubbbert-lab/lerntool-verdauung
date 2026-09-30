#!/usr/bin/env python3
"""Holt die in inhalte/abbildungen.md eingetragenen Abbildungen aus dem i-care-PDF.

Aufruf (im Projektordner):  python3 werkzeuge/abbildungen_holen.py
                            python3 werkzeuge/abbildungen_holen.py --liste 207   (zeigt Bilder auf S. 207)

Die Abbildungen sind im i-care-PDF als Bilder OHNE Beschriftung eingebettet – die Beschriftungen
liegen als Text darüber. Deshalb muss nichts abgedeckt werden.
Ergebnis: JPG-Dateien in inhalte/bilder/ (nicht im Git-Repository, nur für die Kursversion).
Benötigt: pypdf und Pillow.
"""
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import build  # noqa: E402

PDF = os.path.join(os.path.dirname(HIER), "quellen", "01_Verdauung_i-care.pdf")
ERSTE_SEITE = 188


def pdf_seite(gedruckt):
    """Gedruckte Seite → PDF-Seitenindex (doppelt gescannte Seiten werden übersprungen)."""
    import hashlib
    import pypdf
    leser = pypdf.PdfReader(PDF)
    seite, vorher = ERSTE_SEITE, None
    for i, blatt in enumerate(leser.pages):
        text = blatt.extract_text() or ""
        kennung = hashlib.md5(text.encode()).hexdigest()
        if kennung == vorher:
            continue
        vorher = kennung
        if seite == gedruckt:
            return leser, i
        seite += 1
    sys.exit(f"Seite {gedruckt} nicht im PDF gefunden.")


def main():
    if "--liste" in sys.argv:
        gedruckt = int(sys.argv[sys.argv.index("--liste") + 1])
        leser, i = pdf_seite(gedruckt)
        for k, bild in enumerate(leser.pages[i].images):
            print(f"bildnr {k}: {bild.image.size[0]}×{bild.image.size[1]} Pixel")
        return
    abbildungen = build.lies_abbildungen()
    if build.FEHLER:
        sys.exit("\n".join(build.FEHLER))
    ziel = os.path.join(build.INHALTE, "bilder")
    os.makedirs(ziel, exist_ok=True)
    for datei, a in abbildungen.items():
        if not a.get("bildnr"):
            print(f"übersprungen (kein bildnr:): {datei}")
            continue
        leser, i = pdf_seite(int(a["seite"]))
        bild = leser.pages[i].images[int(a["bildnr"])].image.convert("RGB")
        bild.save(os.path.join(ziel, datei), quality=85)
        print(f"gespeichert: inhalte/bilder/{datei}  (i-care S. {a['seite']}, Abb. {a['abbildung']})")


if __name__ == "__main__":
    main()
