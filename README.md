# Boken — live build

The live (non-WordPress) version of the Boken site, built with Next.js + Supabase + Leaflet, designed to deploy to Vercel.

The static HTML in `../boken/` and `../boken-wp/` is untouched and is still the WordPress-paste target.

## Local dev

```bash
npm run dev
# open http://localhost:3000
```

The site runs without Supabase configured — uploads and the examples grids fall back to placeholder UI.

## Supabase setup (optional, for real uploads + examples)

1. Create a new Supabase project at https://supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Go to Storage and create a **public** bucket named `examples`.
4. Copy your project URL + anon key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

5. Restart `npm run dev`.

## Real downloads

Placeholder PDFs live in `public/downloads/`. To replace one with a real file, just drop the file in with the same name. The generator script that creates the placeholders is at `scripts/make-placeholder-pdfs.mjs`.

## The map (naturfag-ute)

Uses OpenStreetMap tiles via Leaflet, with a warm CSS filter to fit Boken's paper aesthetic. School-name lookup uses Nominatim, nearby parks/skog/vann come from the Overpass API. Both are free and need no API key.

Geolocation is purely client-side — the position never leaves the browser.

## Deploy

```bash
npx vercel link
npx vercel --prod
```

Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel dashboard for the production environment.
