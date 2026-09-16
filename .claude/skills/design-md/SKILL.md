---
name: design-md
description: Mit DESIGN.md arbeiten - dem Designsystem der Seite als Datei, die Design-Agenten wie Claude Design lesen können. Nutze das beim Pflegen von DESIGN.md, bei "Designsystem", "Styleguide", "neue Microsite/Marke aufsetzen", "Look von X übernehmen", "Designsystem an Claude Design übergeben" oder wenn Tokens in style.css geändert wurden.
---

# DESIGN.md

`DESIGN.md` beschreibt das visuelle System einer Marke so, dass ein Agent danach
handeln kann: Token, Regel und Begründung in einer Datei. Eine Figma-Datei sagt
*was*, ein Marken-PDF sagt *ungefähr wie es sich anfühlen soll* — DESIGN.md sagt
beides präzise genug, dass ein Agent auch bei einem Fall entscheiden kann, den
die Datei nicht ausdrücklich beschreibt.

| Datei | Wer liest sie | Was sie festlegt |
|---|---|---|
| `CLAUDE.md` / `AGENTS.md` | Coding-Agenten | Wie das Projekt gebaut wird |
| `DESIGN.md` | Design-Agenten (Claude Design, Stitch) | Wie es aussehen und sich anfühlen soll |
| `.claude/skills/design-system/SKILL.md` | Claude Code in diesem Repo | Welche Tokens im CSS stehen und wie man sie benutzt |

Im Projekt liegt `DESIGN.md` in der Wurzel. Sie beschreibt nikitakrebs.de
vollständig: Atmosphäre, Farben samt Marken-Rot und VENTURE-Verlauf, Typoskala,
Komponenten, Layout, Tiefe, Guardrails, Responsive-Verhalten und fertige Prompts.

## Die neun Abschnitte

Jede DESIGN.md folgt derselben Gliederung — halte dich beim Ergänzen daran,
sonst findet der Agent die Information nicht an der erwarteten Stelle:

| # | Abschnitt | Wofür der Agent ihn liest |
|---|---|---|
| 1 | Visual Theme & Atmosphere | Ton, Dichte, Stimmung |
| 2 | Color Palette & Roles | CSS-Variablen mit semantischen Namen |
| 3 | Typography Rules | Typoskala und Font-Fallbacks |
| 4 | Component Stylings | Buttons, Karten, Inputs, Navigation samt Zuständen |
| 5 | Layout Principles | Abstände, Raster, Weißraum |
| 6 | Depth & Elevation | Schatten und Flächenhierarchie |
| 7 | Do's and Don'ts | Leitplanken für neue Screens |
| 8 | Responsive Behavior | Breakpoints, Touch-Ziele, Umbruchverhalten |
| 9 | Agent Prompt Guide | Wiederverwendbare Prompts |

## Regel: Der Code gewinnt

`style.css` ist die Wahrheit, `DESIGN.md` die Beschreibung davon. Wer Tokens,
Schriftgrößen, Radien oder Breakpoints im CSS ändert, zieht DESIGN.md im selben
Commit nach — sonst scaffoldet ein Design-Agent später Seiten, die zur
bestehenden nicht passen. Umgekehrt gilt das auch: Eine neue Regel gehört erst
in DESIGN.md, dann ins CSS.

Beim Pflegen gegenprüfen:

```bash
grep -A 18 '^:root{' style.css          # Tokens
grep -o '@media[^{]*' style.css | sort -u   # Breakpoints
grep -o 'box-shadow:[^;}]*' style.css | sort -u
```

## An Claude Design übergeben

[Claude Design](https://claude.ai/design) hält ein dauerhaftes Designsystem statt
einzelner Screens. Zwei Wege, DESIGN.md hineinzugeben:

- **A — neues Designsystem:** `claude.ai/design/#org` → *Create new design system* → Datei unter *Add assets* hochladen.
- **B — aus einem Prototyp:** Prototyp anlegen, Datei in den Chat hängen, „Create a design system from this DESIGN.md".

Heraus kommt ein Paket aus README mit Markenkontext, `colors_and_type.css`,
Google-Fonts-Ersatz für proprietäre Schriften, Preview-Karten, einem UI-Kit und
einer `SKILL.md`, die den Look in späteren Projekten wieder abrufbar macht.

Vier Dinge, die die Ergebnisse besser machen:

1. **In einem frischen Projekt starten** — Claude Design verankert das System im Projekt; zwei Marken im selben Projekt vermischen die Tokens.
2. **Weiter Screens anfragen** („jetzt eine Pricing-Seite") — sie bleiben automatisch auf dem System.
3. **Varianten anfordern** — hell/dunkel, kompakt/luftig, Marketing/App verzweigen sauber aus den Basis-Tokens.
4. **Die erzeugte `SKILL.md` sichern** — damit lässt sich derselbe Look später ohne erneuten Upload abrufen.

## Vorlagen als Ausgangspunkt

`CATALOG.md` in diesem Ordner listet 68 fertige DESIGN.md-Vorlagen aus
[VoltAgent/awesome-claude-design](https://github.com/VoltAgent/awesome-claude-design)
(MIT), sortiert nach Branche — von terminalartig-dunkel bis redaktionell-hell.
Die Dateien selbst liegen auf getdesign.md und werden dort heruntergeladen;
aus dieser Cloud-Session ist die Domain gesperrt, das geht also lokal.

Zwei Einschränkungen, die ernst zu nehmen sind:

- Die Vorlagen sind von **öffentlich sichtbaren Mustern** fremder Marken inspiriert, nicht autorisiert. Als Inspiration für ein eigenes System verwenden, nicht als Klon — Schriften, Logos und Marken gehören den jeweiligen Firmen.
- Sie beschreiben Produkt-UIs. Diese Seite ist eine redaktionelle Landingpage; übernimm einzelne Ideen (Dichte, Tiefe, Zustände), nicht das ganze System.

## Neue Marke oder Microsite

Wenn für ein Schwesterprojekt (etwa incub:FRAME oder ein Kundenauftritt) ein
eigenes System entsteht:

1. Eigene `DESIGN.md` im jeweiligen Repo anlegen, wieder nach den neun Abschnitten.
2. Werte aus dem **tatsächlichen** Material ableiten — bestehende Seite, Logo, Filmmaterial —, nicht aus Wunschbildern. Ein Agent kann mit `#D6392E` arbeiten, mit „ein kräftiges Rot" nicht.
3. Abschnitt 9 mit echten Prompts füllen, die im Projekt wirklich vorkommen.
4. Am Ende `neue-webseite` für das Gerüst und `design-system` für die Umsetzung im CSS.
