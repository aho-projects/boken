# WordPress paste-snippets

The hybrid plan: easy/static content is paste-ready HTML, technical features (map, group builder, feedback) are iframes pointing at the live Vercel deployment.

## How to use

1. Deploy `boken-live/` to Vercel — you'll get a URL like `https://boken-live.vercel.app`.
2. Open `_iframe-resizer.html` and change `BOKEN_HOST` to your real Vercel URL.
3. For each WordPress page, create a Custom HTML block and paste in the matching file from this folder. The snippet already contains the auto-resize listener.

## Files

| File | Goes on this WP page |
|---|---|
| `home.html` | Homepage (Boken landing) |
| `naturfag-ute.html` | Naturfag opplegg page (with live map iframe) |
| `ut-og-titte.html` | Ut og titte opplegg page (with radius map + checklist iframe) |
| `grupper.html` | Lag grupper page (group builder iframe) |
| `sketchnoting.html` | Sketchnoting opplegg page |
| `isberg.html` | Isberg opplegg page |
| `bytte-perspektiv.html` | Bytte perspektiv opplegg page |
| `hjemmelagde-kilden.html` | Den hjemmelagde kilden opplegg page |
| `hvordan-lage-boka.html` | Hvordan lage boka page |
| `_iframe-resizer.html` | Reference: paste once per page that has a Boken iframe |

## What's iframed vs inlined

**Iframed (lives on Vercel):**
- `/embed/naturfag-map` — the Leaflet map with school search + Overpass spots, used on Naturfag
- `/embed/ut-og-titte` — the radius map + 3-category checklist
- `/embed/grupper` — the group builder
- `/embed/feedback` — the upload + feedback form

**Inlined HTML (pasted directly in WP):**
- Hero, "Hva er boka", stats, "Slik fungerer det" steps
- Opplegg grid + cards
- "Hvordan lage boka" CTA
- Roadmap placeholder
- Examples grid (placeholder cards — when ready, swap to `/embed/examples` for live data)
- All static opplegg page content: description, læringsmål, utstyr, tips, "continue" row

## Images and PDFs

The snippet files reference images at `WP_MEDIA_BASE/...`. Replace this prefix with your WordPress media URL (e.g. `https://kasserommet.no/wp-content/uploads/2026/05/`) using a single find-and-replace before pasting. Same for `WP_DOWNLOAD_BASE/` (for PDFs).

PDFs are also reachable directly from the Vercel deployment at `https://boken-live.vercel.app/downloads/<name>.pdf` if you'd rather skip the WP media upload.
