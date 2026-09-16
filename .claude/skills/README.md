# Skills für nikitakrebs.de

Arbeitsanleitungen für Claude Code. Jede Skill beschreibt die Konventionen eines
Bereichs — Claude lädt sie automatisch, wenn die Aufgabe dazu passt, aufrufen
lassen sie sich auch direkt über ihren Namen.

| Skill | Wofür |
|---|---|
| `sektion-bauen` | Neue Sektion auf der Landingpage bauen oder umbauen: Markup, BEM, Menü, Checkliste |
| `design-system` | Farben, Tokens, Typografie, Buttons, Abstände, Breakpoints |
| `scroll-motion` | GSAP/ScrollTrigger/Lenis: Reveals, Pinning, Scrub, Parallax, Video-Autoplay |
| `medien-assets` | Bilder und Videos: Namen, WebP/JPG, srcset, Encoding, Größenbudget, Cache |
| `seo-meta` | Titel, Description, Open Graph, Canonical, Sitemap, neue Unterseiten |
| `qa-deploy` | Lokal starten, Screenshot-/Konsolencheck, tote Referenzen, Deploy auf Vercel |
| `neue-webseite` | Den Stack für ein neues Projekt aufsetzen |

Zwei Prüfskripte, projektunabhängig und ohne Abhängigkeiten im Repo:

```bash
node .claude/skills/qa-deploy/scripts/check-assets.mjs   # tote lokale Referenzen
node .claude/skills/qa-deploy/scripts/shots.mjs          # Screenshots + Konsolenfehler (Server muss laufen)
```

Neue Skill anlegen: Ordner unter `.claude/skills/<name>/` mit einer `SKILL.md`,
im Frontmatter `name` und `description` — die `description` entscheidet, ob
Claude die Skill zur Aufgabe findet, also konkrete Auslöser hineinschreiben.
