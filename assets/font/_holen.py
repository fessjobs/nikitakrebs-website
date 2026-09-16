#!/usr/bin/env python3
"""Holt die Schriften von Google und legt sie lokal ab.

Damit lädt die Seite im Betrieb nichts mehr von fonts.googleapis.com oder
fonts.gstatic.com nach — kein Drittanbieter, keine IP-Übermittlung.
"""
import os, re, subprocess, io

ZIEL = os.path.dirname(os.path.abspath(__file__))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
URL = ("https://fonts.googleapis.com/css2?"
       "family=Barlow+Condensed:wght@600;700;800;900"
       "&family=Montserrat:wght@400;500;600;700;800"
       "&family=Caveat:wght@600"
       "&family=Instrument+Serif:ital@0;1&display=swap")

css = subprocess.run(["curl", "-sS", "--max-time", "30", "-A", UA, URL],
                     capture_output=True, text=True, check=True).stdout

# Nur latin und latin-ext behalten; die anderen Subsets braucht die Seite nicht.
bloecke = re.findall(r"/\*\s*([\w\-\[\]]+)\s*\*/\s*(@font-face\s*\{[^}]*\})", css)
behalten = [(sub, blk) for sub, blk in bloecke if sub in ("latin", "latin-ext")]

raus, geholt = [], {}
for sub, blk in behalten:
    fam = re.search(r"font-family:\s*'([^']+)'", blk).group(1)
    wgt = re.search(r"font-weight:\s*(\d+)", blk).group(1)
    ital = "italic" in re.search(r"font-style:\s*(\w+)", blk).group(1)
    url = re.search(r"url\((https://[^)]+)\)", blk).group(1)
    name = "%s-%s%s-%s.woff2" % (fam.lower().replace(" ", "-"), wgt,
                                 "-italic" if ital else "", sub)
    pfad = os.path.join(ZIEL, name)
    if name not in geholt:
        subprocess.run(["curl", "-sS", "--max-time", "30", "-o", pfad, url], check=True)
        geholt[name] = os.path.getsize(pfad)
    blk = blk.replace(url, "../font/" + name).replace("url(", "url(", 1)
    raus.append(blk)

kopf = ("/* Schriften lokal. Erzeugt aus der Google-Fonts-Ausgabe, nur latin\n"
        "   und latin-ext. Die Seite ruft im Betrieb keine Google-Domain auf. */\n")
io.open(os.path.join(ZIEL, "schriften.css"), "w", encoding="utf-8").write(
    kopf + "\n".join(raus) + "\n")

print("%d Dateien, %.0f kB gesamt" % (len(geholt), sum(geholt.values()) / 1024))
for n, g in sorted(geholt.items()):
    print("  %-44s %5.1f kB" % (n, g / 1024))
