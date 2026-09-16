# DESIGN.md — nikitakrebs.de

Personal brand site of Nikita Krebs: founder from Hamburg, media production
(incub:FRAME), software (incub:GRID), venture building (incub:VENTURE).
This file is the visual language of that site in the [DESIGN.md](https://getdesign.md/what-is-design-md)
format — token, rule, and rationale in one place — so a design agent can scaffold
new pages, microsites, or sub-brand systems that stay on-system.

**Voice:** German, direct, first person. Short sentences, concrete outcomes, no
agency vocabulary. Brand names are always written `incub:FRAME`, `incub:GRID`,
`incub:VENTURE` — lowercase prefix, colon, uppercase suffix.

**Live reference:** `index.html`, `style.css`, `main.js` in this repository.
When the site and this file disagree, the site wins and this file gets updated.

---

## 1. Visual Theme & Atmosphere

Editorial and cinematic, not app-like. A warm paper canvas carries oversized
condensed headlines set against small, quiet body copy — the contrast between
poster-scale type and calm text is the signature. Photography and silent video
loops carry the emotion; the layout stays restrained and keeps a lot of air.

Sections alternate light and dark deliberately, like chapters. Motion is
scroll-driven, long, and continuous: a pinned hero that darkens and frames the
portrait, text revealing word by word, horizontal case sequences, a collage that
parallaxes. The page should read like a title sequence, not like a dashboard.

Density: low. One idea per screen. Nothing is decorative without a reason —
the exceptions are the topographic hero lines and the marquee bands, which exist
to create depth and movement.

## 2. Color Palette & Roles

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F5F4EF` | Default page background, warm off-white |
| `--paper-2` | `#ECEBE4` | Raised surfaces on paper |
| `--ink` | `#0B0B0C` | Text, borders, icons |
| `--ink-2` | `#5A5A5C` | Body copy, secondary text |
| `--ink-3` | `#8A8A8C` | Meta, captions, decoration |
| `--accent` | `#6AAEFD` | Accent **surface**: button fill, highlights, tiles |
| `--accent-2` | `#4E9BFC` | Hover/pressed depth of the accent |
| `--accent-text` | `#1F6BD6` | Blue **text** on light backgrounds |
| `--dark` | `#0C0E12` | Dark section background |
| `--dark-2` | `#15181F` | Surfaces inside dark sections |

Brand extensions (not tokens, used literally in component scope):

| Hex | Role |
|---|---|
| `#D6392E` | incub:FRAME red — category labels, play dot, active sound button |
| `#FF6B61` | The same red, but on dark backgrounds where `#D6392E` goes muddy |
| `#3D7BFF → #1F3A8A → #0A1024` | incub:VENTURE radial gradient, `radial-gradient(120% 120% at 15% 0%, …)` |
| `#1B2540` | Hero dark state, also written into `meta[name=theme-color]` while scrolling |
| `#F3F4F6` / `#EDEFF3` | Light beds behind product/software media |
| `#FFFFFF` | Card surface on paper — pure white, so cards separate from the warm canvas |

Rules:

- `--accent` is a surface color. As text on `--paper` it fails contrast — use `--accent-text`. On dark backgrounds `--accent` may be text.
- One accent per section. Blue and red never carry meaning in the same block; red belongs to FRAME, blue to GRID and VENTURE.
- Dark sections must declare `data-nav-theme="dark"` so the navigation and the browser status bar invert with them.
- No gray UI chrome. Separation comes from spacing and background switches, not from gray boxes.

## 3. Typography Rules

| Token | Family | Role |
|---|---|---|
| `--display` | Barlow Condensed 600–900 | Headlines, buttons, years, numbers — always uppercase |
| `--body` | Montserrat 400–700 | Body copy, labels, navigation |
| `--script` | Caveat 600 | Handwriting accents, signature |
| `--serif` | Instrument Serif (incl. italic) | Emphasis inside callouts |

Scale (all fluid, `clamp()` instead of breakpoint steps):

| Element | Size | Leading / tracking |
|---|---|---|
| Hero wordmark | `clamp(120px,22vw,420px)` | `line-height:.8`, `-.02em`, `opacity:.11` behind the portrait |
| Section headline `.sec-h` | `clamp(52px,8vw,130px)` | `line-height:1`, `-.015em` |
| Callout headline | `clamp(64px,12vw,200px)` | `line-height:.88`, `-.02em` |
| Sub-headline `h3` | `clamp(30px,3.2vw,48px)` | `line-height:.95` |
| Lead paragraph | `clamp(16px,1.3vw,19px)` | `line-height:1.6` |
| Body copy | `15.5px` | `line-height:1.65–1.7` |
| Eyebrow / label | `12px`, weight 700 | `letter-spacing:.14em`, uppercase |
| Mono tag | `13px`, `'SF Mono', Menlo, monospace` | `letter-spacing:.08em` |

- Headlines run tight and negative-tracked; labels run wide and positive-tracked. That opposition is the type system.
- Display type is uppercase without exception. Sentence case in a headline reads as a bug.
- Line breaks in headlines are authored (`<br>`), not left to the browser.
- Only these four families. New weights must be added to the Google Fonts link, otherwise the browser fakes them.
- Fallbacks: `Impact, 'Arial Narrow'` for display, system sans for body — condensed width matters more than exact shape.

## 4. Component Stylings

**Buttons** — `.btn` base: `--display`, weight 800, uppercase, `font-size:20px`,
`padding:16px 26px`, `border-radius:12px`, `gap:10px`, transition
`.25s cubic-bezier(.22,.61,.36,1)`.

- `.btn--accent`: `background:var(--accent)`, `color:var(--ink)`, `border:2px solid var(--ink)`. Hover inverts to ink-on-paper and lifts `translateY(-2px)`.
- `.btn--ghost`: transparent with `2px solid rgba(255,255,255,.25)` for dark sections; hover raises the border to solid white.
- `.btn--lg`: `font-size:24px`, `padding:20px 32px` — page-level calls to action only.
- Nav buttons are `60px` tall with `border-radius:14px`; they do not lift on hover (the nav must stay still).

**Cards** (`.venture`): white surface, `1px solid rgba(11,11,12,.12)`,
`border-radius:18px`, clipped media at `aspect-ratio:16/10`. Hover:
`translateY(-8px)` plus `box-shadow:0 40px 70px -40px rgba(11,11,12,.5)`, and the
arrow in the link moves `5px` right. The whole card is one `<a>`.

**Media frames**: `aspect-ratio:16/9`, `border-radius:var(--r)`,
`object-fit:cover`, dark placeholder background so nothing flashes white while
loading. Videos are always `muted loop playsinline preload="none"` with a poster.

**Labels**: eyebrows are colored text, not pills. The one exception is the mono
tag in dark sections: `1px solid rgba(245,244,239,.3)`, `border-radius:8px`,
`padding:8px 14px`.

**Links in prose**: text plus a trailing `→` that moves on hover. No underlines
outside legal pages.

## 5. Layout Principles

- Side gutter is a single token: `--gutter: clamp(20px,3vw,48px)`. Every section uses it; nothing sits flush to the edge except full-bleed media.
- Vertical rhythm: `clamp(80px,12vh,160px)` for standard sections, up to `clamp(110px,14vw,200px)` for the final callout. Hero, intro and explain sections fill `100svh`.
- Measure: `1100px` for centered intro blocks, `760px` for long-form story text, `460–520px` for paragraphs next to media. Body copy never runs the full window width.
- Grids: three equal columns for the venture cards, a `120px 1fr 1.15fr` zigzag for story rows (mirrored on even rows), a horizontally pinned track for cases, absolutely positioned percentage coordinates for the collage.
- Whitespace is the separator. Dividing lines are rare and deliberate.

## 6. Depth & Elevation

The surface is flat by default — depth comes from scale, overlap and motion,
not from stacked shadows.

| Use | Value |
|---|---|
| Card hover lift | `0 40px 70px -40px rgba(11,11,12,.5)` |
| Static raised media | `0 30px 60px -30px rgba(11,11,12,.45)` |
| Cut-out portrait | `drop-shadow(0 30px 60px rgba(11,11,12,.18))` |
| Accent glow (active states) | `0 0 0 6px rgba(106,174,253,.18), 0 0 26px 8px rgba(106,174,253,.55)` |
| Focus ring on colored dots | `0 0 0 4px rgba(<accent>,.2)` |

Radii: `8px` tags, `12px` buttons, `14px` (`--r`) media and nav controls, `18px`
cards, `22px` large panels, `50%` dots. Borders are either hairline
(`1px rgba(11,11,12,.12)`) or deliberate poster outlines (`1.5–2px solid var(--ink)`).
Nothing in between.

## 7. Do's and Don'ts

**Do**

- Put every color, font and spacing value through the tokens in `:root`.
- Alternate light and dark sections for chapter rhythm, and set `data-nav-theme` on every one.
- Animate `transform` and `opacity`; keep reveals long (0.8–1.3s) because this is marketing, not UI.
- Give every media element a poster, an `alt`, and explicit dimensions where it sits in the flow.
- Let one element be loud per screen; everything else supports it.

**Don't**

- Don't use `--accent` as text on paper, and don't introduce a second blue.
- Don't set headlines in sentence case, don't use a fifth typeface, don't reach for system UI fonts.
- Don't add gray card chrome, dividers or badges to fill space.
- Don't animate `width`, `height`, `top` or `left`, and never scale from `0`.
- Don't hide critical content (contact details, legal text) behind a scroll reveal.
- Don't ship a section that only works on a 1440px desktop.

## 8. Responsive Behavior

- Breakpoints: `1024px` (layout collapse), `900px`, `860px`, `760px` (mobile). Desktop is the base; queries scale down.
- At `≤1024px`: multi-column grids drop to two columns, the zigzag story rows become `90px 1fr` with the media below the text.
- At `≤760px`: everything is single column, the story text loses its column split, the gutter shrinks to `20px`, footer columns stack and center.
- Use `100svh`, never `100vh` — the mobile address bar otherwise cuts the hero. `viewport-fit=cover` plus safe-area padding for full-bleed sections.
- Touch targets stay at `60px` for nav controls, `44px` minimum elsewhere.
- Parallax amplitude drops from `160px` to `36px` on mobile, and the pinned hero shortens from `+=140%` to `+=100%`.
- Smooth scrolling (Lenis) is desktop-only; touch devices scroll natively.
- Everything must survive `prefers-reduced-motion: reduce`, which kills CSS transitions and animations globally.

## 9. Agent Prompt Guide

Prompts that stay on-system with this file attached:

- "Build a case-study page for a client project using this design system: hero with a full-bleed silent video loop, a three-row zigzag story, and a contact callout at the end."
- "Add a pricing section to the landing page. Paper background, one white card per tier, accent fill only on the recommended tier."
- "Create a dark variant of the venture cards for use inside a dark section, keeping the same radius, border weight and hover lift."
- "Draft a microsite for incub:FRAME: same type system, red (`#D6392E`) as the accent instead of blue, media-heavy, four sections."
- "Write the mobile rules for this section" — expects the collapse order, the gutter, touch targets, and reduced-motion behavior.

When a request is not covered here, choose the option that keeps the page
quieter: less chrome, fewer colors, more space, longer motion.
