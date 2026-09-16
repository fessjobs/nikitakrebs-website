/* design-auslesen.js — liest das Gestaltungsraster einer fremden Seite aus.

   Anwendung: Referenzseite öffnen, Entwicklerwerkzeuge (F12), Reiter "Console",
   den gesamten Inhalt dieser Datei einfügen, Enter. Das Ergebnis landet in der
   Zwischenablage und lässt sich hier in den Chat einfügen.

   Gelesen wird nur, was der Browser ohnehin schon berechnet hat. Die Seite
   wird nicht verändert und nichts nachgeladen.                               */

(function () {
  'use strict';

  const alle = Array.from(document.querySelectorAll('body *'))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 &&
             cs.visibility !== 'hidden' && cs.display !== 'none' &&
             parseFloat(cs.opacity) > 0.05 &&
             !el.closest('[aria-hidden="true"],[hidden]');
    });

  /* --- Zählhilfe: Werte nach Häufigkeit, die seltenen fallen weg --- */
  const zaehler = () => {
    const m = new Map();
    return {
      add: (v) => { if (v) m.set(v, (m.get(v) || 0) + 1); },
      top: (n = 12, mindestens = 2) => [...m.entries()]
        .filter(([, c]) => c >= mindestens)
        .sort((a, b) => b[1] - a[1]).slice(0, n)
        .map(([wert, anzahl]) => ({ wert, anzahl })),
      // Abstände sind als aufsteigende Reihe brauchbarer denn als Rangliste
      reihe: (n = 12, mindestens = 2) => [...m.entries()]
        .filter(([, c]) => c >= mindestens)
        .sort((a, b) => b[1] - a[1]).slice(0, n)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .map(([wert, anzahl]) => ({ wert, anzahl })),
    };
  };

  const schrift = zaehler(), textfarbe = zaehler(), grundfarbe = zaehler();
  const rahmen = zaehler(), radius = zaehler(), schatten = zaehler();
  const abstand = zaehler(), luecke = zaehler();
  const groessen = new Map();          // Schriftgrad -> Beispiel
  const durchsichtig = /^(rgba\(0, 0, 0, 0\)|transparent)$/;

  for (const el of alle) {
    const cs = getComputedStyle(el);
    schrift.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());

    const text = (el.textContent || '').trim();
    const eigenerText = Array.from(el.childNodes)
      .some((n) => n.nodeType === 3 && n.textContent.trim());
    if (eigenerText) {
      textfarbe.add(cs.color);
      const grad = Math.round(parseFloat(cs.fontSize));
      const schl = grad + '|' + cs.fontWeight;
      if (!groessen.has(schl)) {
        groessen.set(schl, {
          grad: grad + 'px',
          gewicht: cs.fontWeight,
          zeilenhoehe: cs.lineHeight,
          laufweite: cs.letterSpacing,
          versalien: cs.textTransform,
          schrift: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
          auswahl: el.tagName.toLowerCase() +
            (el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
          beispiel: text.slice(0, 40),
        });
      }
    }
    if (!durchsichtig.test(cs.backgroundColor)) grundfarbe.add(cs.backgroundColor);
    if (parseFloat(cs.borderTopWidth) > 0 && !durchsichtig.test(cs.borderTopColor)) {
      rahmen.add(cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor);
    }
    if (parseFloat(cs.borderTopLeftRadius) > 0) radius.add(cs.borderTopLeftRadius);
    if (cs.boxShadow !== 'none') schatten.add(cs.boxShadow);
    [cs.paddingTop, cs.paddingLeft].forEach((v) => {
      const n = parseFloat(v); if (n >= 8) abstand.add(Math.round(n) + 'px');
    });
    if (cs.display === 'flex' || cs.display === 'grid') {
      if (parseFloat(cs.gap) > 0) luecke.add(cs.gap);
    }
  }

  /* --- Grobaufbau: die Abschnitte von oben nach unten --- */
  const aufbau = Array.from(
    document.querySelectorAll('body > *, main > *, body > div > section, body > div > div'))
    .filter((el) => el.getBoundingClientRect().height > 120 &&
                    !el.closest('[aria-hidden="true"],[hidden]') &&
                    parseFloat(getComputedStyle(el).opacity) > 0.05)
    .slice(0, 30)
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const ueber = el.querySelector('h1,h2,h3');
      return {
        tag: el.tagName.toLowerCase(),
        klasse: (typeof el.className === 'string' ? el.className : '').slice(0, 50),
        hoehe: Math.round(r.height) + 'px',
        grund: cs.backgroundColor,
        ueberschrift: ueber ? ueber.textContent.trim().slice(0, 60) : null,
        bilder: el.querySelectorAll('img,picture,video').length,
      };
    });

  const typoskala = [...groessen.values()]
    .sort((a, b) => parseFloat(b.grad) - parseFloat(a.grad)).slice(0, 18);

  const ergebnis = {
    seite: location.href,
    titel: document.title,
    fensterbreite: innerWidth,
    schriften: schrift.top(8),
    typoskala: typoskala,
    textfarben: textfarbe.top(10),
    hintergrundfarben: grundfarbe.top(10),
    rahmen: rahmen.top(6),
    eckenradien: radius.top(6),
    schatten: schatten.top(4),
    innenabstaende: abstand.reihe(10),
    spaltenabstaende: luecke.reihe(8),
    aufbau: aufbau,
  };

  const text = JSON.stringify(ergebnis, null, 1);
  console.log('%cDesign ausgelesen — %d Elemente, %d Zeichen',
    'font-weight:bold;color:#E30613', alle.length, text.length);
  console.log(ergebnis);

  if (typeof copy === 'function') {
    copy(text);
    console.log('%c→ liegt in der Zwischenablage, einfach einfügen',
      'color:#0a0');
  } else {
    console.log('Zum Kopieren:  copy(' + 'JSON.stringify(window.__design,null,1))');
  }
  window.__design = ergebnis;
  return ergebnis;
})();
