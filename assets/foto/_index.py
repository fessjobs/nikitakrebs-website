#!/usr/bin/env python3
"""Liest assets/foto/ aus und schreibt index.json — die Karte, die die Seite lädt.

Ablauf für echte Aufnahmen:
  1. Datei nach dem Bildplatz benennen, den sie füllt (slots.json listet alle auf),
     z. B. slider-01.jpg, kachel-03.webp, galerie-07.jpg
  2. In dieses Verzeichnis legen
  3. python3 assets/foto/_index.py

Fehlt zu einem Bildplatz eine Datei, bleibt dort die Zeichnung stehen.
"""
import json, os

HIER = os.path.dirname(os.path.abspath(__file__))
ENDUNGEN = (".jpg", ".jpeg", ".png", ".webp", ".avif")

karte = {}
for name in sorted(os.listdir(HIER)):
    stamm, endung = os.path.splitext(name)
    if endung.lower() in ENDUNGEN:
        karte[stamm] = name

with open(os.path.join(HIER, "index.json"), "w", encoding="utf-8") as f:
    json.dump(karte, f, ensure_ascii=False, indent=1, sort_keys=True)
    f.write("\n")

bekannt = set()
slots = os.path.join(HIER, "slots.json")
if os.path.exists(slots):
    with open(slots, encoding="utf-8") as f:
        bekannt = {e["slot"] for e in json.load(f)}

unbekannt = sorted(set(karte) - bekannt) if bekannt else []
print("%d Foto(s) eingetragen, %d Bildplätze noch offen."
      % (len(karte), len(bekannt - set(karte)) if bekannt else 0))
for n in unbekannt:
    print("  ACHTUNG: '%s' passt zu keinem Bildplatz — Name prüfen." % n)
