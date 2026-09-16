# Skills für nikitakrebs.de

Arbeitsanleitungen für Claude Code. Jede Skill beschreibt die Konventionen eines
Bereichs — Claude lädt sie automatisch, wenn die Aufgabe dazu passt, aufrufen
lassen sie sich auch direkt über ihren Namen.

## Projekt-Skills

Selbst geschrieben, auf diesen Code gemünzt.

| Skill | Wofür |
|---|---|
| `sektion-bauen` | Neue Sektion auf der Landingpage bauen oder umbauen: Markup, BEM, Menü, Checkliste |
| `design-system` | Farben, Tokens, Typografie, Buttons, Abstände, Breakpoints |
| `scroll-motion` | GSAP/ScrollTrigger/Lenis: Reveals, Pinning, Scrub, Parallax, Video-Autoplay |
| `medien-assets` | Bilder und Videos: Namen, WebP/JPG, srcset, Encoding, Größenbudget, Cache |
| `seo-meta` | Titel, Description, Open Graph, Canonical, Sitemap, neue Unterseiten |
| `design-md` | `DESIGN.md` pflegen und an Claude Design übergeben, Vorlagen-Katalog |
| `qa-deploy` | Lokal starten, Screenshot-/Konsolencheck, tote Referenzen, Deploy auf Vercel |
| `neue-webseite` | Den Stack für ein neues Projekt aufsetzen |

Zwei Prüfskripte, projektunabhängig und ohne Abhängigkeiten im Repo:

```bash
node .claude/skills/qa-deploy/scripts/check-assets.mjs   # tote lokale Referenzen
node .claude/skills/qa-deploy/scripts/shots.mjs          # Screenshots + Konsolenfehler (Server muss laufen)
```

## Animations-Skills von Emil Kowalski

Aus [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT,
© 2026 Emil Kowalski — Lizenztext in `UPSTREAM-LICENSE-emilkowalski.txt`).
Sie liefern die Entscheidungen — welche Kurve, welche Dauer, überhaupt
animieren? —, die Projekt-Skills liefern die Mechanik dafür.

| Skill | Wofür |
|---|---|
| `animate` | Eine Animation von Grund auf bauen: Gate, Zweck, Werkzeug, Eigenschaften, Kurve, Dauer |
| `review-animations` | Bestehende Animationen streng gegen diese Maßstäbe prüfen (nur manuell) |
| `improve-animations` | Alle Animationen im Projekt auditieren und priorisierte Pläne erzeugen |
| `find-animation-opportunities` | Stellen finden, die von Bewegung profitieren — und die, die es nicht tun |
| `animation-vocabulary` | Vom vagen „das Federnde beim Aufklappen" zum richtigen Begriff |
| `apple-design` | Apples Gestaltungs- und Bewegungsprinzipien, übersetzt fürs Web |
| `emil-design-eng` | UI-Politur und die unsichtbaren Details |
| `mobile-native` | Damit sich die Seite auf dem Handy nicht wie eine Webseite anfühlt |

Installiert und aktualisiert werden sie über die CLI von skills.sh:

```bash
npx skills@latest add emilkowalski/skills --skill animate --agent claude-code --copy -y
npx skills@latest update      # alle installierten Skills auf den neuesten Stand
npx skills@latest list
```

`--skill` akzeptiert nur einen Namen pro Flag (mehrfach angeben), `--copy`
verhindert Symlinks, `--agent claude-code` ist nötig, sonst listet die CLI nur.
Der Stand steht in `skills-lock.json` in der Projektwurzel.

Nicht installiert, weil sie zu diesem Stack nichts beitragen: `animate-expo`
(React Native), `write-swift`, `ask-sonner` (React-Toast-Library),
`pick-ui-library` und `prototype` (beide React-lastig). `animate` verweist an
einer Stelle auf `pick-ui-library` — der Verweis läuft hier ins Leere, das ist
gewollt, denn Komponenten-Libraries kommen in eine Seite ohne Build-Schritt
nicht hinein.

## Designsystem als Datei

`DESIGN.md` in der Projektwurzel beschreibt das visuelle System der Seite in dem
Format, das Design-Agenten wie [Claude Design](https://claude.ai/design) lesen:
Atmosphäre, Farben, Typo, Komponenten, Layout, Tiefe, Guardrails, Responsive,
Prompts. Wer Tokens im CSS ändert, zieht die Datei im selben Commit nach.

`design-md/CATALOG.md` listet 68 fertige DESIGN.md-Vorlagen aus
[VoltAgent/awesome-claude-design](https://github.com/VoltAgent/awesome-claude-design)
(MIT, © 2026 VoltAgent) als Inspirationsquelle. Der Katalog ist eine Linkliste —
die Dateien selbst liegen auf getdesign.md. Dieses Repo enthält keine
installierbare Skill; übernommen wurden das Format und die Liste.

## Eigene Skill anlegen

Ordner unter `.claude/skills/<name>/` mit einer `SKILL.md`, im Frontmatter
`name` und `description` — die `description` entscheidet, ob Claude die Skill
zur Aufgabe findet, also konkrete Auslöser hineinschreiben.
