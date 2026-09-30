#!/usr/bin/env python3
"""Erzeugt durchsuchbare Buchtexte mit gedruckten Seitenzahlen in quellen/_text/.

Aufruf (im Projektordner):  python3 werkzeuge/texte_erzeugen.py

- i-care: Das PDF enthält eine Textebene (OCR). Doppelt gescannte Seiten werden
  übersprungen, die gedruckte Seitenzahl wird mitgezählt (erste Seite = S. 188).
- MKK: Das PDF besteht nur aus Bildschirmfotos. Die Bilder werden herausgelöst und
  mit der Texterkennung von macOS (Vision, siehe ocr.swift) gelesen. Die Seitenmarken
  „Seite NNN“ im Bild bestimmen die gedruckte Seite.

Benötigt: pypdf (für beide Bücher) und Pillow (für MKK), außerdem macOS mit swiftc (für MKK).
Ergebnis: quellen/_text/i-care-seiten.txt und quellen/_text/mkk-seiten.txt
"""
import hashlib
import os
import re
import subprocess
import sys
import tempfile

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
QUELLEN = os.path.join(PROJEKT, "quellen")
ZIEL = os.path.join(QUELLEN, "_text")

ICARE_PDF = os.path.join(QUELLEN, "01_Verdauung_i-care.pdf")
ICARE_ERSTE_SEITE = 188
MKK_PDF = os.path.join(QUELLEN, "02_Verdauung_MKK.pdf")
MKK_ERSTE_SEITE = 343

FUSSZEILEN = ("I care Anatomie", "Dieses Dokument ist nur", "Usage subject to")


def icare():
    import pypdf
    leser = pypdf.PdfReader(ICARE_PDF)
    seite, vorher, teile = ICARE_ERSTE_SEITE, None, []
    for nr, blatt in enumerate(leser.pages, start=1):
        text = blatt.extract_text() or ""
        kennung = hashlib.md5(text.encode()).hexdigest()
        if kennung == vorher:  # doppelt gescannt
            continue
        vorher = kennung
        zeilen = [z for z in text.splitlines() if not z.startswith(FUSSZEILEN)]
        teile.append(f"\n===== i-care S. {seite} (PDF-Seite {nr}) =====\n" + "\n".join(zeilen))
        seite += 1
    return "".join(teile)


def mkk():
    import pypdf
    leser = pypdf.PdfReader(MKK_PDF)
    with tempfile.TemporaryDirectory() as tmp:
        for nr, blatt in enumerate(leser.pages, start=1):
            for bild in blatt.images:
                bild.image.convert("RGB").save(os.path.join(tmp, f"p{nr:03d}.png"))
        programm = os.path.join(tmp, "ocr")
        subprocess.run(["swiftc", "-O", os.path.join(HIER, "ocr.swift"), "-o", programm], check=True)
        ergebnis = os.path.join(tmp, "ocr-ergebnis.txt")
        subprocess.run([programm, tmp, ergebnis], check=True)
        roh = open(ergebnis, encoding="utf-8").read()
    # Seitenmarken auswerten: alles nach „Seite NNN“ gehört zur Seite NNN
    seite, aus = MKK_ERSTE_SEITE, [f"\n===== MKK S. {MKK_ERSTE_SEITE} =====\n"]
    for zeile in roh.splitlines():
        treffer = re.search(r"Seite (\d{3})", zeile)
        if treffer and int(treffer.group(1)) > seite:
            vor, nach = zeile[:treffer.start()], zeile[treffer.end():]
            if vor.strip():
                aus.append(vor.rstrip(" (|") + "\n")
            seite = int(treffer.group(1))
            aus.append(f"\n===== MKK S. {seite} =====\n")
            zeile = nach.lstrip(" )")
        if zeile.startswith("=====BILD"):
            aus.append(f"[{zeile.strip('= ')}]\n")
        elif zeile.strip():
            aus.append(zeile + "\n")
    return "".join(aus)


def main():
    os.makedirs(ZIEL, exist_ok=True)
    with open(os.path.join(ZIEL, "i-care-seiten.txt"), "w", encoding="utf-8") as f:
        f.write(icare())
    print("i-care fertig")
    if sys.platform == "darwin":
        with open(os.path.join(ZIEL, "mkk-seiten.txt"), "w", encoding="utf-8") as f:
            f.write(mkk())
        print("MKK fertig")
    else:
        print("MKK übersprungen: Texterkennung braucht macOS.")


if __name__ == "__main__":
    main()
