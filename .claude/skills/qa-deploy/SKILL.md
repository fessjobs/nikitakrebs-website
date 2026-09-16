---
name: qa-deploy
description: Seite lokal starten, prüfen und auf Vercel deployen - Preview-Server, Screenshot- und Konsolencheck über mehrere Breiten, tote Asset-Referenzen, Deploy-Ablauf und Cache. Nutze das vor jedem Commit oder Deploy und bei "Seite testen", "Screenshots machen", "sieht auf dem Handy kaputt aus", "deployen", "live stellen".
---

# Prüfen & Deployen

## Lokal starten

```bash
python3 -m http.server 5190          # aus der Projektwurzel
# → http://127.0.0.1:5190
```

Kein Build, kein Watcher — Datei speichern, Seite neu laden. Bei hartnäckigem
Cache: Reload mit gedrückter Shift-Taste.

## Automatische Checks

```bash
# 1. Tote lokale Referenzen (src, href, srcset, poster, data-img, url() im CSS)
node .claude/skills/qa-deploy/scripts/check-assets.mjs

# 2. Screenshots + Konsolenfehler + Overflow-Check über mehrere Breiten
node .claude/skills/qa-deploy/scripts/shots.mjs
node .claude/skills/qa-deploy/scripts/shots.mjs --widths=390,1440 --steps=6 --out=.claude/screenshots
```

`shots.mjs` braucht einen laufenden Server und Playwright
(`npm i -D playwright && npx playwright install chromium`; in der Cloud-Session
ist Chromium bereits installiert). Das Skript scrollt in Stufen durch die Seite,
schießt pro Position ein Bild und meldet Konsolenfehler, Requests ab Status 400
und horizontalen Overflow. Beide Skripte geben Exit 1 zurück, wenn etwas fehlt —
so lassen sie sich in einen Hook oder eine Pipeline hängen. Die Screenshots
landen unter `.claude/` und damit außerhalb von Git und Deploy.

**Wichtig:** GSAP, Lenis und die Fonts kommen per CDN. In einer Umgebung ohne
Netz bleibt der Preloader stehen und die Seite ist komplett dunkel — der
Screenshot zeigt dann nicht die Seite, sondern den Ladezustand. Für eine echte
Prüfung braucht der Browser Internetzugang.

## Manuelle Runde

- [ ] 390px, 768px, 1440px — einmal langsam ganz runter **und wieder hoch** scrollen
- [ ] Kein horizontaler Overflow, keine abgeschnittenen Headlines
- [ ] Nav-Farbe wechselt an jeder Sektionsgrenze korrekt (heller Text auf dunklem Grund)
- [ ] Menü öffnet und schließt, Links springen an die richtige Stelle
- [ ] Videos starten beim Reinscrollen, der Ton-Button funktioniert
- [ ] Konsole leer
- [ ] `impressum.html` und `datenschutz.html` erreichbar, Footer-Links stimmen
- [ ] Mit aktivierter Systemeinstellung „Bewegung reduzieren“ ist die Seite noch lesbar

## Deploy

```bash
npx vercel --prod --yes
```

Vor dem Deploy: beide Skripte grün, Änderungen committet. Nach dem Deploy die
Live-URL öffnen und einmal durchscrollen — der Unterschied zu lokal sind die
Header aus `vercel.json`:

- `cleanUrls: true` — `/impressum` statt `/impressum.html`
- `/assets/*` wird ein Jahr `immutable` gecacht. **Ein ersetztes Asset unter
  gleichem Namen sieht ein wiederkehrender Besucher nicht.** Neuer Dateiname,
  siehe `medien-assets`.
- Security-Header (`X-Frame-Options: DENY`, `nosniff`, Referrer-Policy) gelten
  für alle Routen.

`.vercelignore` hält `.claude/`, die README und die unbenutzte Cutout-Grafik aus
dem Deployment. Neue Arbeitsdateien, die nicht ausgeliefert werden sollen, dort
eintragen.

## Wenn etwas live anders aussieht als lokal

1. Hard Reload — meistens ist es der Asset-Cache.
2. Netzwerk-Tab: lädt eine CDN-Datei nicht (GSAP, Lenis, Fonts)?
3. `check-assets.mjs` gegen die Wurzel laufen lassen — Groß-/Kleinschreibung in
   Dateinamen ist lokal auf dem Mac egal, auf Vercel nicht.
