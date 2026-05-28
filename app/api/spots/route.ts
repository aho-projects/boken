/**
 * Server-side proxy for Overpass API queries.
 *
 * Why this exists: the public Overpass instance (overpass-api.de) rejects
 * browser requests that include an Origin header (returns 406 Not Acceptable).
 * The community mirrors (kumi.systems, private.coffee, mail.ru) are slow or
 * unreachable from many networks. By proxying through our Vercel function,
 * we make a server-to-server call with the proper User-Agent + Accept headers
 * that Overpass actually accepts — no CORS, no preflight, no Origin header.
 *
 * Bonus: this route can be cached at the edge for popular queries.
 */
export const dynamic = "force-dynamic";

type OverpassResp = {
  elements: Array<{
    id: number;
    type: string;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  }>;
};

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lng = parseFloat(url.searchParams.get("lng") || "");
  const radius = Math.max(50, Math.min(5000, parseInt(url.searchParams.get("r") || "1600", 10)));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: "lat and lng query params required" }, { status: 400 });
  }

  const query = `
    [out:json][timeout:25];
    (
      node["leisure"~"park|nature_reserve|garden"](around:${radius},${lat},${lng});
      way["leisure"~"park|nature_reserve|garden"](around:${radius},${lat},${lng});
      node["landuse"~"forest|meadow|grass"](around:${radius},${lat},${lng});
      way["landuse"~"forest|meadow|grass"](around:${radius},${lat},${lng});
      node["natural"~"wood|water|wetland|pond|stream"](around:${radius},${lat},${lng});
      way["natural"~"wood|water|wetland|pond|stream"](around:${radius},${lat},${lng});
    );
    out center 60;
  `;

  // Try each Overpass endpoint with a hard 12-second timeout
  for (const endpoint of ENDPOINTS) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12_000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "User-Agent": "BokenMap/1.0 (kasserommet.no/08-gruppe)",
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        console.warn(`[spots] ${endpoint} returned ${res.status}`);
        continue;
      }
      const data = (await res.json()) as OverpassResp;
      return Response.json(data, {
        headers: {
          // Same coords + radius → cache for 5 minutes at the edge
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (e) {
      console.warn(`[spots] ${endpoint} threw:`, e);
    }
  }

  return Response.json(
    { error: "Alle Overpass-tjenere svarte ikke. Prøv igjen om litt." },
    { status: 503 },
  );
}
