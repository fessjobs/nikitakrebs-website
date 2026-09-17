# nikitakrebs.de v2

Statische One-Page-Landing im landonorris.com-Aufbau (GSAP + ScrollTrigger + Lenis + Three.js via CDN).

- `index.html` / `style.css` / `main.js` – die Seite
- `assets/` – Bilder, Videos, Logos (Videos ~183 MB)
- `DESIGN.md` – das visuelle System als Datei für Design-Agenten
- `.claude/skills/` – Arbeitsanleitungen für Claude Code (siehe deren README)
- `kemna/` – eigenständige Kundenseite (Relaunch-Konzept für kemna.de), gleicher Stack, eigenes Deploy (siehe `kemna/README.md`)
- Lokal: `python3 -m http.server 5190` und http://127.0.0.1:5190
- Deploy: `npx vercel --prod --yes`
