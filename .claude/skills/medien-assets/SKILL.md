---
name: medien-assets
description: Bilder, Poster und Videos für nikitakrebs.de einbauen, ersetzen oder optimieren - Dateinamen, WebP/JPG, srcset, Poster-Frames, MP4-Encoding, Ladeverhalten und Cache. Nutze das bei "Bild tauschen", "neues Video einbauen", "Galerie erweitern", "Seite lädt zu langsam", "Bild wird nicht angezeigt".
---

# Medien & Assets

`assets/` ist nach Typ sortiert und folgt festen Namensmustern. Halte dich daran —
`main.js` und das Menü leiten Dateinamen teilweise ab.

```
assets/img/      poster-<slug>.webp + poster-<slug>.jpg   Video-Poster (immer als Paar)
                 nikita-portrait-4.webp / -1000.webp      Hero-Porträt in zwei Breiten
                 og.jpg, favicon.png, apple-touch-icon.png, nk-mark.png, signature.png
assets/gallery/  gNN.jpg                                   Original
assets/gallery/w/gNN-800.webp, gNN-1400.webp               ausgelieferte Varianten
assets/logos/    <firma>.png                                Partner-Logos, transparent
assets/video/    <slug>.mp4                                 H.264/AAC, stumm geschnitten
```

## Bilder einbauen

```html
<img src="assets/gallery/w/g03-800.webp"
     srcset="assets/gallery/w/g03-800.webp 800w, assets/gallery/w/g03-1400.webp 1400w"
     sizes="(max-width:760px) 60vw, 34vw"
     alt="Hamburg, 2025" loading="lazy">
```

- **`alt` immer.** Deko-Bilder bekommen `alt=""` plus `aria-hidden="true"` am Container.
- `loading="lazy"` an alles unterhalb des ersten Bildschirms. Das Hero-Porträt ist die Ausnahme: `fetchpriority="high"` plus `<link rel="preload" as="image">` im `<head>`.
- `width`/`height` setzen, wo das Bild im Fluss liegt (Hero, Logos) — verhindert Layout-Shift.
- `sizes` muss zur tatsächlichen CSS-Breite passen, sonst lädt der Browser die falsche Variante.

## Video einbauen

```html
<video muted loop playsinline preload="none" data-autoplay poster="assets/img/poster-slug.webp">
  <source src="assets/video/slug.mp4" type="video/mp4">
</video>
```

Pflichtattribute: `muted` + `playsinline` (sonst kein Autoplay auf iOS),
`preload="none"` (sonst lädt die Seite dutzende MB beim Start), `poster`,
`data-autoplay` (aktiviert den IntersectionObserver in `main.js`).
Ausnahme: das Collage-Hintergrundvideo läuft mit `autoplay preload="metadata"`.

Ton: nur über den bestehenden `data-sound-toggle`-Button, nie `muted` weglassen.

## Neue Dateien erzeugen

ffmpeg und cwebp sind nicht Teil des Repos — lokal installieren
(`brew install ffmpeg webp`). In der Cloud-Session fehlen beide; das mit
Playwright ausgelieferte ffmpeg unter `/opt/pw-browsers/` kann nur VP8 und ist
für H.264 oder WebP nutzlos. Assets also lokal erzeugen und committen.

```bash
# Video: web-tauglich, stumm, gerade Maße (H.264 braucht das)
ffmpeg -i roh.mov -vf "scale=1280:-2" -c:v libx264 -profile:v high -crf 24 \
  -preset slow -pix_fmt yuv420p -movflags +faststart -an assets/video/slug.mp4

# Poster aus dem Video (Sekunde 2), als JPG und WebP
ffmpeg -i assets/video/slug.mp4 -ss 2 -frames:v 1 -vf "scale=1280:-2" assets/img/poster-slug.jpg
cwebp -q 82 assets/img/poster-slug.jpg -o assets/img/poster-slug.webp

# Galerie-Varianten
cwebp -q 80 -resize 800 0  assets/gallery/g18.jpg -o assets/gallery/w/g18-800.webp
cwebp -q 80 -resize 1400 0 assets/gallery/g18.jpg -o assets/gallery/w/g18-1400.webp
```

`-movflags +faststart` ist wichtig: sonst fängt das Video erst an zu spielen,
wenn es komplett geladen ist.

## Budget

`assets/video/` ist mit rund 100 MB der mit Abstand größte Teil des Repos
(größte Einzeldatei: `imagefilm.mp4`, 17 MB). Vor dem Hinzufügen eines Videos:

- Länge kürzen statt Qualität hochdrehen — Loops brauchen selten mehr als 10–15 s.
- Zielgröße: Kachel-Loops unter 3 MB, Showreels unter 10 MB.
- Kein Ton in Loop-Videos (`-an`) — spart Größe und verhindert Autoplay-Blocker.
- Nicht mehr benötigte Dateien im selben Commit löschen.

## Cache beim Austauschen beachten

`vercel.json` liefert `/assets/*` mit `Cache-Control: max-age=31536000, immutable`.
Ein Bild **unter gleichem Namen** zu ersetzen wirkt bei wiederkehrenden Besuchern
bis zu einem Jahr lang nicht. Beim Austausch also neuen Dateinamen vergeben
(`poster-slug-2.webp`) und alle Referenzen mitziehen — auch `data-img` im Menü
und `og:image`.

## Nach jeder Asset-Änderung

```bash
node .claude/skills/qa-deploy/scripts/check-assets.mjs
```

Prüft, dass jede referenzierte lokale Datei wirklich existiert (inkl. `srcset`,
`poster`, `data-img` und `url()` im CSS).
