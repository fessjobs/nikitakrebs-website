#!/usr/bin/env python3
"""Generates the vehicle artwork for KREBS PERFORMANCE.

One parametric side view. Each model is a silhouette in normalised
coordinates (u = along the car, v = 0 at the sill, 1 at the roof), mapped onto
real proportions — wheelbase, overhangs, wheel diameter and overall height are
derived from the car's length, the way a package drawing works.

Two styles:
  solid  flat paint, dark glass, light rims  -> model cards, gallery
  line   stroke only                         -> hero, technical drawings

Run:  python3 assets/car/_build.py
"""
import os, math

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, GROUND, X0 = 1200, 500, 430, 60
LEN = 1080


# ------------------------------------------------------------------ colour
def _rgb(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def shade(c, f):
    """f < 0 darkens, f > 0 lightens. Always returns a solid colour, so the
    paint never washes out against the paper."""
    r, g, b = _rgb(c)
    if f >= 0:
        vals = (v + (255 - v) * f for v in (r, g, b))
    else:
        vals = (v * (1 + f) for v in (r, g, b))
    return "#%02X%02X%02X" % tuple(round(v) for v in vals)


# ------------------------------------------------------------------ curves
def smooth(pts, tension=0.22):
    """Catmull-Rom through the points, emitted as cubic beziers."""
    p = list(pts)
    if len(p) < 3:
        return "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in p)
    ext = [p[0]] + p + [p[-1]]
    d = f"M {p[0][0]:.1f} {p[0][1]:.1f}"
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension, p1[1] + (p2[1] - p0[1]) * tension)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension, p2[1] - (p3[1] - p1[1]) * tension)
        d += (f" C {c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f}"
              f" {p2[0]:.1f} {p2[1]:.1f}")
    return d


# ------------------------------------------------------------------ package
# height  : overall height / length   (coupé .285 · saloon .30 · SUV .355)
# wheel   : wheel diameter / length
# f_ovh   : front overhang / length
# wbase   : wheelbase / length
# belt    : beltline, as a fraction of the sill→roof distance
# glass   : indices of the outline that form the greenhouse
MODELS = {
    "k1": dict(  # low fastback coupé
        height=.285, wheel=.163, f_ovh=.180, wbase=.605, belt=.40, glass=(5, 11),
        profile=[(.000, .00), (.000, .34), (.030, .52), (.115, .57), (.245, .61),
                 (.320, .65), (.394, .83), (.472, .96), (.580, 1.0), (.690, .98),
                 (.800, .86), (.890, .68), (.955, .52), (.992, .38), (1.00, .00)],
        handles=(.40, .66), port=.885, name="K1"),
    "k4": dict(  # upright executive saloon, notchback
        height=.302, wheel=.168, f_ovh=.175, wbase=.612, belt=.40, glass=(5, 12),
        profile=[(.000, .00), (.000, .30), (.024, .50), (.110, .55), (.245, .58),
                 (.320, .62), (.385, .82), (.462, .97), (.575, 1.0), (.700, .99),
                 (.780, .94), (.852, .76), (.902, .60), (.958, .55), (.993, .44),
                 (1.00, .00)],
        handles=(.39, .65), port=.900, name="K4"),
    "kx": dict(  # raised crossover
        height=.352, wheel=.190, f_ovh=.150, wbase=.625, belt=.42, glass=(5, 12),
        profile=[(.000, .00), (.000, .38), (.026, .60), (.115, .66), (.245, .69),
                 (.318, .73), (.378, .87), (.448, .98), (.545, 1.0), (.700, .99),
                 (.808, .95), (.898, .84), (.956, .66), (.990, .48), (1.00, .00)],
        handles=(.40, .66), port=.895, name="KX"),
}


# Ausbaustufen. "drop" senkt die Karosserie gegenüber den Rädern ab, "gap"
# ist der verbleibende Radhausspalt, "rim" das Felgen-/Reifen-Verhältnis.
TUNE = {
    0: dict(drop=0,  rim=.76, gap=5, splitter=False, skirt=False, diffuser=False,
            wing=False, tint=.00, label="Serie"),
    1: dict(drop=10, rim=.82, gap=3, splitter=False, skirt=True,  diffuser=False,
            wing=False, tint=.22, label="Stufe 1"),
    2: dict(drop=18, rim=.85, gap=2, splitter=True,  skirt=True,  diffuser=True,
            wing=False, tint=.40, label="Stufe 2"),
    3: dict(drop=25, rim=.87, gap=1, splitter=True,  skirt=True,  diffuser=True,
            wing=True,  tint=.55, label="Stufe 3"),
}


def geometry(m, drop=0):
    """Normalised profile -> pixel geometry."""
    wr = LEN * m["wheel"] / 2
    sill = GROUND - wr * 0.62 + drop
    roof = GROUND - LEN * m["height"] + drop
    belt = roof + (sill - roof) * (1 - m["belt"])
    fx = X0 + LEN * m["f_ovh"]
    return dict(wr=wr, sill=sill, roof=roof, belt=belt, fx=fx,
                rx=fx + LEN * m["wbase"], cy=GROUND - wr,
                pt=lambda u, v: (X0 + u * LEN, sill - v * (sill - roof)))


# ------------------------------------------------------------------ wheel
def wheel(cx, cy, r, style, rim_col, tyre_col, i=0, ratio=0.76, caliper=None):
    rim = r * ratio
    o = []
    if style == "line":
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}"/>')
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{rim:.0f}"/>')
    else:
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="{tyre_col}"/>')
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{rim:.0f}" fill="{rim_col}"/>')
    for k in range(5):
        a = k * 2 * math.pi / 5 + i * 0.35
        x1, y1 = cx + math.cos(a) * rim * .26, cy + math.sin(a) * rim * .26
        x2, y2 = cx + math.cos(a + .30) * rim * .92, cy + math.sin(a + .30) * rim * .92
        x3, y3 = cx + math.cos(a - .18) * rim * .92, cy + math.sin(a - .18) * rim * .92
        d = f"M {x1:.1f} {y1:.1f} L {x2:.1f} {y2:.1f} L {x3:.1f} {y3:.1f} Z"
        if style == "line":
            o.append(f'<path d="{d}"/>')
        else:
            o.append(f'<path d="{d}" fill="#0B0B0C" fill-opacity=".20"/>')
    if caliper and style != "line":
        cr = rim * .60
        a0, a1 = -0.75, 0.75
        x0, y0 = cx + math.cos(a0) * cr, cy + math.sin(a0) * cr
        x1, y1 = cx + math.cos(a1) * cr, cy + math.sin(a1) * cr
        o.append(f'<path d="M {x0:.1f} {y0:.1f} A {cr:.1f} {cr:.1f} 0 0 1 '
                 f'{x1:.1f} {y1:.1f}" stroke="{caliper}" stroke-width="{rim*.22:.1f}" '
                 f'stroke-linecap="round" fill="none"/>')
    hub = f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*.13:.0f}"'
    o.append(hub + ('/>' if style == "line" else f' fill="#0B0B0C" fill-opacity=".45"/>'))
    return "".join(o)


# ------------------------------------------------------------------ render
def render(model, paint="#1E2A4A", glass_col="#121A2C", accent="#6AAEFD",
           style="solid", stroke="#0B0B0C", ground=True, shadow=True, crop=None,
           tune=0, caliper="#D6392E"):
    m = MODELS[model]
    t = TUNE[tune]
    g = geometry(m, t["drop"])
    pt, wr, sill, belt = g["pt"], g["wr"], g["sill"], g["belt"]
    arch = wr + t["gap"]
    outline = [pt(u, v) for u, v in m["profile"]]
    uid = model + paint.lstrip("#") + style + str(tune)

    # greenhouse: the roof run of the outline, pulled in and down a touch, then
    # closed along the beltline. Points below the belt are clamped onto it, so
    # the glass always stays a closed shape inside the body.
    a, b = m["glass"]
    roofrun = outline[a:b + 1]
    inset = (sill - g["roof"]) * .06
    glass_pts = []
    for k, (x, y) in enumerate(roofrun):
        f = k / max(1, len(roofrun) - 1)
        glass_pts.append((x + (1 - f) * 30 - f * 30, min(max(y + inset, 0), belt - 4)))

    body = smooth(outline) + f' L {outline[0][0]:.1f} {outline[0][1]:.1f} Z'

    def arch_path(cx, drop):
        return (f'M {cx-arch:.1f} {drop:.1f} L {cx-arch:.1f} {g["cy"]:.1f} '
                f'A {arch:.1f} {arch:.1f} 0 0 1 {cx+arch:.1f} {g["cy"]:.1f} '
                f'L {cx+arch:.1f} {drop:.1f} Z')

    arches = " " + " ".join(arch_path(cx, sill + 30) for cx in (g["fx"], g["rx"]))
    glass_d = (smooth(glass_pts) + f' L {glass_pts[-1][0]:.1f} {belt:.1f}'
               f' L {glass_pts[0][0]:.1f} {belt:.1f} Z')

    vb = crop or (0, 0, W, H)
    label = "Seitenansicht" if not crop else "Detail"
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {vb[2]} '
         f'{vb[3]}" fill="none" role="img" aria-label="KREBS {m["name"]}, {label}">']

    # ---- line style -----------------------------------------------------
    if style == "line":
        s.append(f'<g stroke="{stroke}" stroke-width="3" stroke-linejoin="round" '
                 f'stroke-linecap="round">')
        s.append(f'<path d="{body}"/>')
        for cx in (g["fx"], g["rx"]):
            s.append(f'<path d="M {cx-arch:.1f} {sill:.1f} L {cx-arch:.1f} '
                     f'{g["cy"]:.1f} A {arch:.1f} {arch:.1f} 0 0 1 {cx+arch:.1f} '
                     f'{g["cy"]:.1f} L {cx+arch:.1f} {sill:.1f}"/>')
        s.append(f'<path d="{glass_d}"/>')
        s.append(wheel(g["fx"], g["cy"], wr, "line", "", "", 0, t["rim"]))
        s.append(wheel(g["rx"], g["cy"], wr, "line", "", "", 1, t["rim"]))
        s.append('</g>')
        s.append(f'<path d="M {X0-20} {GROUND+.5} L {X0+LEN+20} {GROUND+.5}" '
                 f'stroke="{stroke}" stroke-opacity=".35" stroke-width="2"/>')
        s.append("</svg>")
        return "".join(s)

    # ---- solid style ----------------------------------------------------
    dark = shade(paint, -.22)
    deep = shade(paint, -.48)
    light = shade(paint, .22)

    s.append('<defs>'
             f'<mask id="bc{uid}" maskUnits="userSpaceOnUse" x="0" y="0" '
             f'width="{W}" height="{H}">'
             f'<path d="{body}" fill="#fff"/>'
             f'<path d="{arches}" fill="#000"/></mask>'
             f'<radialGradient id="sh{uid}" cx=".5" cy=".5" r=".5">'
             '<stop offset="0" stop-color="#0B0B0C" stop-opacity=".28"/>'
             '<stop offset=".7" stop-color="#0B0B0C" stop-opacity=".07"/>'
             '<stop offset="1" stop-color="#0B0B0C" stop-opacity="0"/>'
             '</radialGradient></defs>')
    if shadow:
        s.append(f'<ellipse cx="{X0 + LEN/2:.0f}" cy="{GROUND + 7}" '
                 f'rx="{LEN*.47:.0f}" ry="16" fill="url(#sh{uid})"/>')

    cal = caliper if tune else None
    s.append(wheel(g["fx"], g["cy"], wr, "solid", "#DCDEE3", "#17181C", 0, t["rim"], cal))
    s.append(wheel(g["rx"], g["cy"], wr, "solid", "#DCDEE3", "#17181C", 1, t["rim"], cal))
    # body and every piece of trim share one mask, so nothing escapes the
    # silhouette and the wheel arches stay open
    s.append(f'<g mask="url(#bc{uid})">')
    s.append(f'<path d="{body}" fill="{paint}"/>')
    # skirt below the shoulder line
    s.append(f'<path d="M {X0-40} {sill - (sill-belt)*.26:.1f} '
             f'L {X0+LEN+40} {sill - (sill-belt)*.32:.1f} L {X0+LEN+40} {sill+40:.1f} '
             f'L {X0-40} {sill+40:.1f} Z" fill="{dark}"/>')
    # shoulder highlight
    s.append(f'<path d="M {X0-40} {belt+(sill-belt)*.22:.0f} '
             f'L {X0+LEN+40} {belt+(sill-belt)*.15:.0f}" stroke="{light}" '
             f'stroke-width="3" stroke-opacity=".65"/>')
    # door shut lines + handles
    for u in (m["handles"][0] - .055, m["handles"][1] - .055):
        x = X0 + LEN * u
        s.append(f'<path d="M {x:.0f} {belt:.0f} L {x+5:.0f} {sill+20:.0f}" '
                 f'stroke="{deep}" stroke-width="2.4" stroke-opacity=".75"/>')
    for u in m["handles"]:
        x = X0 + LEN * u
        s.append(f'<rect x="{x:.0f}" y="{belt+13:.0f}" width="36" height="7" '
                 f'rx="3.5" fill="{deep}"/>')
    # lights, drawn oversized and clipped so they meet the body edge exactly
    hx, hy = pt(.012, .46)
    s.append(f'<path d="M {hx-40:.0f} {hy+3:.0f} l 92 -11 l 2 15 l -94 10 Z" '
             f'fill="#F2F5FF"/>')
    tx, ty = pt(.990, .46)
    s.append(f'<path d="M {tx-74:.0f} {ty-7:.0f} l 104 10 l -1 15 l -104 -11 Z" '
             f'fill="{accent}"/>')
    # charge port
    px, py = pt(m["port"], .30)
    s.append(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="9" fill="none" '
             f'stroke="{deep}" stroke-width="2.5"/>')
    s.append('</g>')

    s.append(f'<path d="{glass_d}" fill="{shade(glass_col, -t["tint"])}"/>')
    bp = glass_pts[0][0] + (glass_pts[-1][0] - glass_pts[0][0]) * .52
    s.append(f'<path d="M {bp:.0f} {min(p[1] for p in glass_pts)+10:.0f} '
             f'L {bp:.0f} {belt:.0f}" stroke="{paint}" stroke-width="11"/>')
    # mirror sits on the body side, outside the silhouette by design
    mxp, myp = pt(.352, .705)
    s.append(f'<path d="M {mxp:.0f} {myp:.0f} l -30 -4 l -3 15 l 32 4 Z" fill="{dark}"/>')

    carbon = "#1A1C20"
    fx, rx = g["fx"], g["rx"]
    if t["skirt"]:
        s.append(f'<path d="M {fx+arch+2:.0f} {sill-5:.0f} L {rx-arch-2:.0f} '
                 f'{sill-5:.0f} L {rx-arch-6:.0f} {sill+9:.0f} '
                 f'L {fx+arch+6:.0f} {sill+9:.0f} Z" fill="{carbon}"/>')
    if t["splitter"]:
        nx = outline[0][0]
        s.append(f'<path d="M {nx-16:.0f} {sill-1:.0f} L {fx-arch-4:.0f} {sill-5:.0f} '
                 f'L {fx-arch-8:.0f} {sill+10:.0f} L {nx-22:.0f} {sill+11:.0f} Z" '
                 f'fill="{carbon}"/>')
    if t["diffuser"]:
        tx0 = max(X0 + LEN * .88, rx + arch + 4)
        s.append(f'<path d="M {tx0:.0f} {sill-3:.0f} L {outline[-1][0]+14:.0f} '
                 f'{sill+1:.0f} L {outline[-1][0]+8:.0f} {sill+13:.0f} '
                 f'L {tx0:.0f} {sill+13:.0f} Z" fill="{carbon}"/>')
        for k in range(4):
            fxx = tx0 + 18 + k * 26
            s.append(f'<path d="M {fxx:.0f} {sill+1:.0f} L {fxx+5:.0f} {sill+12:.0f}" '
                     f'stroke="{shade(carbon, .28)}" stroke-width="3"/>')
    if t["wing"]:
        wx, wy = pt(.93, .42)
        top = wy - (sill - g["roof"]) * .30
        s.append(f'<path d="M {wx-96:.0f} {top+9:.0f} L {wx+54:.0f} {top:.0f} '
                 f'L {wx+56:.0f} {top+12:.0f} L {wx-94:.0f} {top+21:.0f} Z" '
                 f'fill="{carbon}"/>')
        for ux in (wx - 66, wx + 24):
            s.append(f'<path d="M {ux:.0f} {top+14:.0f} L {ux+7:.0f} {wy+6:.0f} '
                     f'L {ux+19:.0f} {wy+6:.0f} L {ux+12:.0f} {top+12:.0f} Z" '
                     f'fill="{carbon}"/>')

    if ground:
        s.append(f'<path d="M {X0-30} {GROUND+.5} L {X0+LEN+30} {GROUND+.5}" '
                 f'stroke="#0B0B0C" stroke-opacity=".14" stroke-width="1.5"/>')
    s.append("</svg>")
    return "".join(s)


PAINTS = {
    "nachtblau":   ("#1E2A4A", "#0E1626"),
    "graphit":     ("#31353C", "#15171B"),
    "silber":      ("#C2C6CD", "#3E4655"),
    "signalblau":  ("#2F7BE0", "#10305E"),
    "papierweiss": ("#ECEBE4", "#464E5E"),
    "karminrot":   ("#9A2438", "#320D16"),
}

# rear axle sits at X0 + LEN*(f_ovh + wbase); crops are expressed in that space
DETAILS = {
    "rad":    ("k1", "nachtblau", (690, 290, 370, 190)),
    "front":  ("k1", "nachtblau", (40, 250, 400, 200)),
    "heck":   ("k4", "silber",    (840, 230, 340, 210)),
    "fluegel":("k1", "graphit",   (830, 180, 360, 220)),
    "profil": ("k4", "nachtblau", (180, 150, 700, 300)),
}

if __name__ == "__main__":
    n = 0
    # Serienwagen und Vollausbau je Modell und Farbe
    for model in MODELS:
        for name, (paint, glass) in PAINTS.items():
            for tune, suffix in ((0, ""), (3, "-tuned")):
                fn = f"{model}-{name}{suffix}.svg"
                with open(os.path.join(HERE, fn), "w") as fh:
                    fh.write(render(model, paint, glass, tune=tune))
                n += 1
        with open(os.path.join(HERE, f"{model}-linie.svg"), "w") as fh:
            fh.write(render(model, style="line"))
        n += 1
    # die drei Ausbaustufen am selben Wagen
    for tune in (1, 2, 3):
        with open(os.path.join(HERE, f"stufe-{tune}.svg"), "w") as fh:
            fh.write(render("k1", *PAINTS["nachtblau"], tune=tune))
        n += 1
    for key, (model, paint, box) in DETAILS.items():
        with open(os.path.join(HERE, f"detail-{key}.svg"), "w") as fh:
            fh.write(render(model, *PAINTS[paint], crop=box, ground=False,
                            shadow=False, tune=3))
        n += 1
    print(f"wrote {n} svg files")
