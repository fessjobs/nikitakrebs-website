#!/usr/bin/env python3
"""Generates the product tile artwork for KREBS PERFORMANCE.

Twelve flat illustrations in the same visual language as the vehicles:
paper ground, ink outlines, steel greys, blue as the brand accent and red
reserved for the brake caliper. Canvas is 600 x 400 throughout.

Run:  python3 assets/parts/_build.py
"""
import os, math

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 600, 400

INK, STEEL, LIGHT, DARK = "#0B0B0C", "#8A9099", "#DCDEE3", "#2A2E35"
ACCENT, RED, BRASS = "#2F7BE0", "#C8332B", "#B08D4F"


def svg(body, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'fill="none" role="img" aria-label="{label}">{body}</svg>')


def ground(y=330):
    return (f'<ellipse cx="300" cy="{y+16}" rx="215" ry="17" fill="{INK}" '
            f'fill-opacity=".09"/>')


def bolts(cx, cy, r, n=5, rr=6, col=DARK):
    o = ""
    for k in range(n):
        a = k * 2 * math.pi / n - math.pi / 2
        o += (f'<circle cx="{cx+math.cos(a)*r:.1f}" cy="{cy+math.sin(a)*r:.1f}" '
              f'r="{rr}" fill="{col}"/>')
    return o


# ---------------------------------------------------------------- 01 ECU
def steuergeraet():
    b = [ground(318)]
    b.append(f'<rect x="132" y="128" width="336" height="190" rx="14" fill="{DARK}"/>')
    b.append(f'<rect x="132" y="128" width="336" height="44" rx="14" fill="{STEEL}" fill-opacity=".30"/>')
    for k in range(11):           # Kühlrippen
        x = 158 + k * 28
        b.append(f'<rect x="{x}" y="186" width="13" height="108" rx="5" fill="{INK}" fill-opacity=".45"/>')
    b.append(f'<rect x="150" y="146" width="128" height="14" rx="7" fill="{LIGHT}" fill-opacity=".55"/>')
    b.append(f'<circle cx="440" cy="153" r="9" fill="{ACCENT}"/>')
    # Steckerleiste
    b.append(f'<rect x="96" y="196" width="46" height="88" rx="9" fill="{STEEL}"/>')
    for k in range(6):
        b.append(f'<rect x="104" y="{206+k*13}" width="30" height="6" rx="3" fill="{DARK}"/>')
    b.append(f'<path d="M 76 240 C 44 240 40 194 66 186" stroke="{DARK}" '
             f'stroke-width="11" stroke-linecap="round"/>')
    return svg("".join(b), "Steuergerät mit Steckerleiste")


# ------------------------------------------------------- 02 Antriebstechnik
def antriebstechnik():
    b = [ground(318)]
    b.append(f'<rect x="150" y="196" width="300" height="34" rx="17" fill="{STEEL}"/>')
    b.append(f'<rect x="150" y="196" width="300" height="13" rx="7" fill="{LIGHT}"/>')
    for x in (150, 414):          # Kreuzgelenke
        b.append(f'<rect x="{x-36}" y="172" width="72" height="82" rx="16" fill="{DARK}"/>')
        b.append(f'<circle cx="{x}" cy="213" r="17" fill="{STEEL}"/>')
        b.append(f'<circle cx="{x}" cy="213" r="7" fill="{INK}"/>')
    b.append(f'<circle cx="452" cy="213" r="62" fill="{DARK}"/>')   # Flansch
    b.append(f'<circle cx="452" cy="213" r="44" fill="{STEEL}"/>')
    b.append(bolts(452, 213, 30, 6, 7, INK))
    b.append(f'<circle cx="452" cy="213" r="13" fill="{INK}"/>')
    b.append(f'<path d="M 128 213 L 78 213" stroke="{ACCENT}" stroke-width="9" '
             f'stroke-linecap="round"/>')
    return svg("".join(b), "Gelenkwelle mit Flansch")


# ---------------------------------------------------------- 03 Abgasanlage
def abgasanlage():
    b = [ground(322)]
    b.append(f'<path d="M 74 214 L 190 214" stroke="{STEEL}" stroke-width="30" '
             f'stroke-linecap="round"/>')
    b.append(f'<rect x="186" y="164" width="188" height="104" rx="26" fill="{STEEL}"/>')
    b.append(f'<rect x="186" y="164" width="188" height="34" rx="17" fill="{LIGHT}"/>')
    b.append(f'<rect x="232" y="206" width="96" height="9" rx="4.5" fill="{INK}" fill-opacity=".25"/>')
    b.append(f'<path d="M 374 200 L 418 186" stroke="{STEEL}" stroke-width="26" '
             f'stroke-linecap="round"/>')
    b.append(f'<path d="M 374 236 L 418 250" stroke="{STEEL}" stroke-width="26" '
             f'stroke-linecap="round"/>')
    for cy in (184, 252):         # Endrohre
        b.append(f'<ellipse cx="452" cy="{cy}" rx="21" ry="34" fill="{DARK}"/>')
        b.append(f'<ellipse cx="452" cy="{cy}" rx="21" ry="34" fill="none" '
                 f'stroke="{LIGHT}" stroke-width="7"/>')
        b.append(f'<ellipse cx="452" cy="{cy}" rx="10" ry="19" fill="{INK}"/>')
    b.append(f'<circle cx="280" cy="140" r="15" fill="{ACCENT}"/>')  # Klappenstellmotor
    b.append(f'<path d="M 280 155 L 280 168" stroke="{ACCENT}" stroke-width="7"/>')
    return svg("".join(b), "Klappenabgasanlage mit Doppelendrohr")


# ------------------------------------------------------------ 04 Kolben
def entwicklung():
    b = [ground(330)]
    for i, (cx, s) in enumerate(((160, 1.0), (300, 1.0), (440, 1.0))):
        top, wdt = 120 + i * 6, 84
        b.append(f'<rect x="{cx-wdt/2}" y="{top}" width="{wdt}" height="116" rx="10" '
                 f'fill="{STEEL}"/>')
        b.append(f'<rect x="{cx-wdt/2}" y="{top}" width="{wdt}" height="22" rx="10" '
                 f'fill="{LIGHT}"/>')
        for k in range(3):        # Kolbenringe
            b.append(f'<rect x="{cx-wdt/2}" y="{top+30+k*13}" width="{wdt}" height="6" '
                     f'fill="{INK}" fill-opacity=".38"/>')
        b.append(f'<circle cx="{cx}" cy="{top+92}" r="13" fill="{INK}" fill-opacity=".55"/>')
        b.append(f'<path d="M {cx-13} {top+104} L {cx-8} {top+188} L {cx+8} {top+188} '
                 f'L {cx+13} {top+104} Z" fill="{DARK}"/>')
        b.append(f'<circle cx="{cx}" cy="{top+196}" r="20" fill="{DARK}"/>')
        b.append(f'<circle cx="{cx}" cy="{top+196}" r="9" fill="{LIGHT}"/>')
    return svg("".join(b), "Kolben mit Pleuel")


# ------------------------------------------------------- 05/06 Räder (frontal)
def rad(spokes, name, twist=0.34, hub=BRASS):
    b = [ground(340)]
    cx, cy, r = 300, 200, 152
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{DARK}"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r-18}" fill="{LIGHT}"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r-30}" fill="{STEEL}" fill-opacity=".35"/>')
    for k in range(spokes):
        a = k * 2 * math.pi / spokes
        pts = []
        for t, wd in ((0.22, .052), (0.62, .040), (0.92, .026)):
            pts.append((cx + math.cos(a) * r * t, cy + math.sin(a) * r * t, wd))
        poly = []
        for x, y, wd in pts:
            poly.append((x + math.cos(a + 1.57 + twist) * r * wd,
                         y + math.sin(a + 1.57 + twist) * r * wd))
        for x, y, wd in reversed(pts):
            poly.append((x - math.cos(a + 1.57 + twist) * r * wd,
                         y - math.sin(a + 1.57 + twist) * r * wd))
        d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in poly) + " Z"
        b.append(f'<path d="{d}" fill="{DARK}" fill-opacity=".30"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="46" fill="{LIGHT}"/>')
    b.append(bolts(cx, cy, 30, 5, 8, STEEL))
    b.append(f'<circle cx="{cx}" cy="{cy}" r="17" fill="{hub}"/>')
    return svg("".join(b), name)


# --------------------------------------------------------- 07 Fahrwerk
def fahrwerk():
    b = [ground(346)]
    cx = 300
    b.append(f'<rect x="{cx-52}" y="62" width="104" height="26" rx="13" fill="{DARK}"/>')
    b.append(f'<circle cx="{cx}" cy="75" r="9" fill="{LIGHT}"/>')
    b.append(f'<rect x="{cx-13}" y="86" width="26" height="46" fill="{STEEL}"/>')
    # Feder
    d = ""
    for k in range(9):
        y = 128 + k * 19
        d += (f'M {cx-62} {y} C {cx-30} {y-16} {cx+30} {y-16} {cx+62} {y} '
              f'C {cx+30} {y+16} {cx-30} {y+16} {cx-62} {y} ')
    b.append(f'<path d="{d}" stroke="{ACCENT}" stroke-width="13" stroke-linecap="round"/>')
    b.append(f'<rect x="{cx-26}" y="212" width="52" height="118" rx="11" fill="{DARK}"/>')
    b.append(f'<rect x="{cx-26}" y="212" width="52" height="118" rx="11" fill="none" '
             f'stroke="{STEEL}" stroke-width="4"/>')
    for k in range(5):            # Gewinde für die Höhenverstellung
        b.append(f'<path d="M {cx-26} {236+k*17} L {cx+26} {236+k*17}" '
                 f'stroke="{STEEL}" stroke-width="3" stroke-opacity=".8"/>')
    b.append(f'<rect x="{cx-40}" y="326" width="80" height="22" rx="11" fill="{STEEL}"/>')
    return svg("".join(b), "Gewindefahrwerk mit Feder und Dämpfer")


# ------------------------------------------------------ 08 Bremsanlage
def bremsanlage():
    b = [ground(346)]
    cx, cy, r = 296, 200, 148
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{STEEL}"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{DARK}" stroke-width="8"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r-30}" fill="none" stroke="{LIGHT}" stroke-width="4"/>')
    for ring, count in ((r - 16, 22), (r - 48, 18)):    # Lochbohrungen
        for k in range(count):
            a = k * 2 * math.pi / count + (0.14 if ring < r - 20 else 0)
            b.append(f'<circle cx="{cx+math.cos(a)*ring:.1f}" cy="{cy+math.sin(a)*ring:.1f}" '
                     f'r="7" fill="{DARK}" fill-opacity=".55"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="72" fill="{LIGHT}"/>')
    b.append(bolts(cx, cy, 44, 5, 9, STEEL))
    b.append(f'<circle cx="{cx}" cy="{cy}" r="24" fill="{DARK}"/>')
    # Sattel
    b.append(f'<path d="M 404 130 L 470 124 C 492 122 500 138 498 160 L 492 246 '
             f'C 490 268 478 280 456 278 L 400 272 Z" fill="{RED}"/>')
    b.append(f'<path d="M 420 152 L 482 148" stroke="#FFFFFF" stroke-opacity=".5" '
             f'stroke-width="7" stroke-linecap="round"/>')
    for k in range(3):
        b.append(f'<circle cx="{470}" cy="{178+k*34}" r="7" fill="{INK}" fill-opacity=".35"/>')
    return svg("".join(b), "Bremsscheibe mit Sechskolbensattel")


# --------------------------------------------------------- 09 Wartung
def wartung():
    b = [ground(340)]
    # Ringschlüssel: Schaft, Ringmaul oben, Gabelmaul unten
    b.append(f'<path d="M 152 300 L 344 116" stroke="{STEEL}" stroke-width="40" '
             f'stroke-linecap="round"/>')
    b.append(f'<path d="M 166 290 L 330 132" stroke="{LIGHT}" stroke-width="11" '
             f'stroke-linecap="round" stroke-opacity=".7"/>')
    # Ringmaul
    b.append(f'<circle cx="360" cy="100" r="56" fill="{STEEL}"/>')
    hx, hy, hr = 360, 100, 31
    pts = [(hx + math.cos(math.pi/6 + k*math.pi/3) * hr,
            hy + math.sin(math.pi/6 + k*math.pi/3) * hr) for k in range(6)]
    b.append('<path d="M ' + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
             ' Z" fill="#F5F4EF"/>')
    # Gabelmaul
    b.append(f'<path d="M 96 250 L 150 306 L 122 334 L 68 278 Z" fill="{STEEL}"/>')
    b.append(f'<path d="M 74 262 L 108 296 L 96 308 L 62 274 Z" fill="#F5F4EF"/>')
    # Schraube daneben
    cx, cy, rr = 452, 274, 62
    pts = [(cx + math.cos(math.pi/6 + k*math.pi/3) * rr,
            cy + math.sin(math.pi/6 + k*math.pi/3) * rr) for k in range(6)]
    b.append('<path d="M ' + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts) +
             f' Z" fill="{DARK}"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="28" fill="{ACCENT}"/>')
    return svg("".join(b), "Ringschlüssel und Schraube")


# ------------------------------------------------------------ 10 Sportsitz
def individual():
    b = [ground(348)]
    # Lehne, nach hinten geneigt, mit Schulterwangen
    b.append(f'<path d="M 268 318 L 276 148 C 279 96 300 68 344 62 '
             f'L 382 57 C 406 54 418 68 416 96 L 400 300 '
             f'C 398 318 388 326 370 326 Z" fill="{DARK}"/>')
    b.append(f'<path d="M 288 312 L 295 154 C 297 110 314 88 350 83 '
             f'L 378 79 C 394 77 402 86 400 106 L 386 296 '
             f'C 385 308 378 313 366 313 Z" fill="{STEEL}" fill-opacity=".5"/>')
    # Kopfstützen-Durchlass
    b.append(f'<rect x="322" y="92" width="58" height="26" rx="13" fill="#F5F4EF" '
             f'fill-opacity=".85"/>')
    # Steppnähte quer über die Lehne
    for k in range(5):
        y = 158 + k * 30
        b.append(f'<path d="M {300+k} {y} L {392-k} {y-7}" stroke="{ACCENT}" '
                 f'stroke-width="3.5" stroke-dasharray="10 9" stroke-linecap="round"/>')
    # Sitzfläche
    b.append(f'<path d="M 150 296 C 150 280 162 272 182 272 L 286 276 L 292 330 '
             f'L 176 336 C 158 337 150 328 150 314 Z" fill="{DARK}"/>')
    b.append(f'<path d="M 168 292 C 168 284 174 281 186 281 L 280 285 L 284 318 '
             f'L 182 322 C 172 322 168 318 168 310 Z" fill="{STEEL}" fill-opacity=".5"/>')
    b.append(f'<path d="M 186 300 L 274 303" stroke="{ACCENT}" stroke-width="3.5" '
             f'stroke-dasharray="10 9" stroke-linecap="round"/>')
    # Konsole
    b.append(f'<rect x="206" y="336" width="128" height="16" rx="8" fill="{LIGHT}" '
             f'fill-opacity=".6"/>')
    return svg("".join(b), "Sportsitz mit Steppnaht")


# ------------------------------------------------- 11 Teilegutachten
def teilegutachten():
    b = [ground(352)]
    b.append(f'<rect x="150" y="54" width="272" height="296" rx="10" fill="{LIGHT}"/>')
    b.append(f'<rect x="150" y="54" width="272" height="296" rx="10" fill="none" '
             f'stroke="{DARK}" stroke-width="5"/>')
    b.append(f'<rect x="182" y="90" width="150" height="15" rx="7.5" fill="{DARK}"/>')
    for k in range(7):
        wd = 208 if k % 3 else 156
        b.append(f'<rect x="182" y="{130+k*22}" width="{wd}" height="9" rx="4.5" '
                 f'fill="{STEEL}" fill-opacity=".8"/>')
    b.append(f'<circle cx="360" cy="286" r="54" fill="none" stroke="{ACCENT}" stroke-width="7"/>')
    b.append(f'<circle cx="360" cy="286" r="40" fill="none" stroke="{ACCENT}" '
             f'stroke-width="4" stroke-opacity=".6"/>')
    b.append(f'<path d="M 336 286 L 353 304 L 386 268" stroke="{ACCENT}" stroke-width="9" '
             f'stroke-linecap="round" stroke-linejoin="round"/>')
    return svg("".join(b), "Teilegutachten mit Prüfstempel")


# ---------------------------------------------------------- 12 Turbolader
def turbolader():
    b = [ground(346)]
    cx, cy = 246, 206
    # Spirale des Verdichtergehäuses
    d = ""
    for k in range(120):
        t = k / 119
        a = t * math.pi * 2.1 - 2.2
        rr = 40 + t * 122
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
        d += ("M " if not k else "L ") + f"{x:.1f} {y:.1f} "
    b.append(f'<path d="{d}" stroke="{STEEL}" stroke-width="46" stroke-linecap="round" '
             f'stroke-linejoin="round"/>')
    b.append(f'<path d="{d}" stroke="{LIGHT}" stroke-width="18" stroke-linecap="round" '
             f'stroke-linejoin="round"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="74" fill="{DARK}"/>')
    for k in range(9):            # Verdichterrad
        a = k * 2 * math.pi / 9
        x1, y1 = cx + math.cos(a) * 18, cy + math.sin(a) * 18
        x2, y2 = cx + math.cos(a + .5) * 66, cy + math.sin(a + .5) * 66
        x3, y3 = cx + math.cos(a + .05) * 66, cy + math.sin(a + .05) * 66
        b.append(f'<path d="M {x1:.1f} {y1:.1f} L {x2:.1f} {y2:.1f} L {x3:.1f} {y3:.1f} Z" '
                 f'fill="{STEEL}"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="17" fill="{LIGHT}"/>')
    b.append(f'<rect x="392" y="176" width="66" height="62" rx="12" fill="{DARK}"/>')
    b.append(f'<circle cx="470" cy="207" r="46" fill="{STEEL}"/>')
    b.append(f'<circle cx="470" cy="207" r="46" fill="none" stroke="{DARK}" stroke-width="6"/>')
    b.append(f'<circle cx="470" cy="207" r="15" fill="{DARK}"/>')
    return svg("".join(b), "Turbolader mit Verdichterrad")


TILES = {
    "steuergeraet": steuergeraet,
    "antriebstechnik": antriebstechnik,
    "abgasanlage": abgasanlage,
    "kolben": entwicklung,
    "rad-elbe": lambda: rad(5, "Schmiederad Elbe, fünf Doppelspeichen"),
    "rad-harburg": lambda: rad(10, "Leichtrad Harburg, zehn Speichen", .18, STEEL),
    "fahrwerk": fahrwerk,
    "bremsanlage": bremsanlage,
    "wartung": wartung,
    "individual": individual,
    "teilegutachten": teilegutachten,
    "turbolader": turbolader,
}

if __name__ == "__main__":
    for name, fn in TILES.items():
        with open(os.path.join(HERE, f"{name}.svg"), "w") as fh:
            fh.write(fn())
    print(f"wrote {len(TILES)} svg files")
