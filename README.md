# MTM — Motoren Technik Mayer

Statische Landingpage für MTM Motoren-Technik-Mayer GmbH, Wettstetten.
Aufbau nach dem bestehenden Auftritt: schwarze Servicezeile, graues
Navigationsband mit Untermenüs, Slider mit Leistungszahlen, Kachelraster.
Technik: GSAP + ScrollTrigger + Lenis via CDN, sonst keine Abhängigkeiten.

- `index.html` / `style.css` / `main.js` – die Seite
- `impressum.html`, `datenschutz.html`, `agb.html`, `barrierefreiheit.html`
- `assets/car/`, `assets/parts/` – **Blindmuster**, siehe unten
- `assets/foto/` – hier kommen die Originalaufnahmen hinein
- Lokal: `python3 -m http.server 5190` und http://127.0.0.1:5190
- Deploy: `npx vercel --prod --yes`

## Was noch vom Kunden kommen muss

Diese Punkte sind im Quelltext als Platzhalter markiert und müssen vor dem
Livegang ersetzt werden:

1. ~~**Logo.**~~ **Erledigt** — das Wappen des Kunden liegt als
   `assets/img/mtm_wappen.png` vor und versorgt Kopfzeile, Vorschalter,
   Favicon, die vier Rechtsseiten und das Vorschaubild. Die Datei misst nur
   128 × 150 px; für scharfe Darstellung auf hochauflösenden Bildschirmen
   wäre eine SVG- oder eine größere PNG-Fassung besser.
2. **Alle Bilder.** Sämtliche Fahrzeug- und Produktaufnahmen sind SVG-
   Zeichnungen aus `assets/car/` und `assets/parts/`. Sie halten die
   Bildplätze offen und ersetzen keine Fotografie. Jedes `alt` beginnt
   deshalb mit „Platzhalter:". Die Originale kommen nach `assets/foto/`;
   das Verfahren steht in `assets/foto/README.md`.
3. **Garantie.** Der Abschnitt `#garantie` enthält nur eine Hilfszeile; die
   Garantiebedingungen im Wortlaut fehlen.
4. **AGB.** Die Seite ist ein Rumpf, damit die Verlinkung nicht ins Leere
   läuft. Die Erklärung zur Barrierefreiheit ist inzwischen ausgearbeitet und
   durch Messwerte gedeckt; der rote Hinweiskasten dort gehört nach der
   rechtlichen Prüfung entfernt.
5. **Impressum und Datenschutz prüfen.** Anschrift, Geschäftsführer,
   Handelsregister und Kontakt wurden aus öffentlich zugänglichen Quellen
   übernommen, nicht von mtm-online.de selbst — die Domain war aus der
   Entwicklungsumgebung nicht erreichbar. Vor dem Livegang gegen das
   eigene Impressum abgleichen. Umsatzsteuer-ID fehlt.
6. **Kennzahlen im Slider.** „8xx PS / 1xxx NM" für den RS5 B10 stammt aus
   dem Entwurf des Kunden und ist bewusst unscharf.

## Zeichnungen

Beide Bildstrecken sind parametrisch erzeugt und lassen sich anpassen,
solange noch keine Fotos vorliegen:

    python3 assets/car/_build.py      # Fahrzeuge, 3 Modelle × 6 Lacke × Serie/Umbau
    python3 assets/parts/_build.py    # 12 Produktkacheln

Die Fahrzeuge sind ein einziges Seitenprofil in normierten Koordinaten;
Radstand, Überhänge, Raddurchmesser und Höhe werden daraus wie in einer
Paketzeichnung abgeleitet. Vier Ausbaustufen senken die Karosserie ab,
vergrößern die Felge und ergänzen Bremssattel, Schweller, Splitter,
Diffusor und Heckflügel.

## Farben

Die Palette liegt in den `:root`-Variablen von `style.css`: Weiß als Grund,
Schwarz und ein Grauband für das Chrom, Rot als Akzent. `--accent-text` ist
der rote Ton für Schrift auf Weiß, `--accent-light` der hellere für Schrift
auf Schwarz — beide braucht es, weil ein Rot nicht auf beiden Gründen
lesbar bleibt. Die Generatoren nehmen den Akzent als Parameter.

## Originalaufnahmen einsetzen

Jeder der 53 Bildplätze trägt im Quelltext ein `data-foto="…"` mit einem
festen Namen. Beim Laden liest die Seite `assets/foto/index.json` und tauscht
jede Zeichnung gegen die Datei, die dort unter demselben Namen steht. Ohne
Eintrag bleibt die Zeichnung; die Bilder können also nach und nach kommen.

    # Aufnahmen nach Bildplatz benannt in assets/foto/ legen, dann:
    python3 assets/foto/_index.py

`assets/foto/README.md` listet alle Plätze mit Motiv und empfohlener Größe,
`assets/foto/slots.json` dasselbe maschinenlesbar. Ein Foto bekommt beim
Einsetzen die Klasse `is-foto` und füllt seinen Platz randlos aus, während
die Zeichnungen mit Innenabstand freigestellt stehen.

## Datenschutz und Sicherheit

Die Seite lädt **nichts von Dritten**. Schriften (`assets/font/`) und
Programmbibliotheken (`assets/lib/`) liegen lokal; Google Fonts, cdnjs und
jsDelivr sind vollständig entfernt. Nachgeprüft: kein Cookie, kein Local
Storage, kein Session Storage, keine fremde Domain im Netzwerkmitschnitt.
Daraus folgt, dass kein Einwilligungsbanner nötig ist.

`vercel.json` setzt die Kopfzeilen, darunter eine Content-Security-Policy
ohne `unsafe-inline` für Skripte (die Seite hat keine Inline-Skripte),
HSTS, `frame-ancestors 'none'` und eine Permissions-Policy. Die Richtlinie
ist gegen alle fünf Seiten geprüft — keine Verstöße.

**Wer eingebettete Inhalte nachrüstet** (YouTube-Video, Google Maps,
Meta-Pixel, Reichweitenmessung), macht die Seite einwilligungspflichtig.
Dann braucht es eine Lösung nach § 25 TDDDG, und die CSP muss die Quellen
aufnehmen. Die Verweise auf Instagram, Facebook und YouTube im Fußbereich
sind bewusst **nur Links**, keine Einbettungen.

### Schriften erneuern

    python3 assets/font/_holen.py  # lädt woff2, schreibt assets/font/schriften.css

Nur latin und latin-ext. Die Bibliotheken in `assets/lib/` stammen aus npm
(gsap 3.12.5, lenis 1.1.14) und entsprechen den Versionen, die vorher vom
CDN kamen.

## Noch zu bestätigen

- **Profile in den sozialen Netzen.** Die drei Adressen im Fußbereich sind
  recherchiert, nicht bestätigt — mtm-online.de ist aus der Entwicklungs-
  umgebung nicht erreichbar, ein Abgleich war nicht möglich. Vor dem
  Livegang prüfen, insbesondere Instagram.
- **Bilder.** Alle 53 Bildplätze warten weiter auf die Originalaufnahmen,
  siehe `assets/foto/README.md`.

## Barrierefreiheit

Geprüft mit axe-core gegen WCAG 2.0/2.1 A und AA sowie 2.2 AA — alle fünf
Seiten ohne Befund. Die Prüfung liegt im Scratchpad als `a11y.mjs`; sie
startet einen lokalen Server, wartet den Vorschalter ab und misst jede Seite
einzeln.

Behoben wurden dabei:

- Die Wörter der Abschnittsüberschriften standen vor dem Scrollen auf 15 %
  Deckkraft (1,46:1). Der Ausgangswert liegt jetzt bei 0,48 — der schwächste
  Wert, der auf allen drei Gründen der Seite 3:1 erreicht; der helle Abschnitt
  ist der strengere Fall. Der Einblendeffekt ist dadurch dezenter.
- Die Vorbelegung `opacity:0` steht nicht mehr in der CSS, sondern kommt von
  GSAP (`fromTo`). Fällt die Animation aus, bleibt der Inhalt lesbar.
- `@media (prefers-reduced-motion: reduce)` zwingt alle vorbelegten Zustände
  auf sichtbar — mit `!important`, weil GSAP inline schreibt. Nachgemessen:
  0 von 25 Elementen zu blass.
- Die Punkte unter dem Slider waren 10 px groß; die Schaltfläche misst jetzt
  24 px, der sichtbare Punkt weiterhin 10 px.
- `--ink-3` (#8C8C8C) erreicht auf Weiß nur 3,36:1 und wurde für Kleintext an
  vier Stellen durch `--steel` (5,10:1) ersetzt.
- Eine Sprungmarke „Zum Inhalt springen" — der Kopfbereich kostete sonst
  14-mal Tab.

Nicht geprüft: Bildschirmlesegeräte. Automatische Prüfungen erfassen nur
einen Teil; das steht auch so in der Erklärung.
