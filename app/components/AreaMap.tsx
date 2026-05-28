"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, LayerGroup } from "leaflet";

type SpotKind = "park" | "skog" | "vann";

type Spot = {
  id: number;
  kind: SpotKind;
  name: string;
  lat: number;
  lng: number;
  distance: number;
};

type Suggestion = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
};

const KIND_LABEL: Record<SpotKind, string> = {
  park: "Park / grøntområde",
  skog: "Skog / trær",
  vann: "Vann / dam / bekk",
};

const KIND_COLOR: Record<SpotKind, string> = {
  park: "#9DC489",
  skog: "#4F7A47",
  vann: "#84B2C9",
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// User/school marker = the actual Boken stick-man PNG (saved to public/assets/finn-meg.png).
// We use <img> so the marker is pixel-perfect with the brand illustration instead
// of an SVG approximation. Drop the file in /public/assets/ and it'll render.
const STICK_FIGURE_SVG = `
  <img src="/assets/finn-meg.png" alt="" class="boken-stickman" />
`;

// Classic teardrop pin used for the park/forest/water numbered spots
const TEARDROP_SVG = `
  <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8 1 2 7 2 15c0 11 14 24 14 24s14-13 14-24c0-8-6-14-14-14z" stroke="#1A1A1A" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="5" fill="#fff" stroke="#1A1A1A" stroke-width="1.6"/>
  </svg>
`;

function makeDivIcon(L: typeof import("leaflet"), kind: SpotKind | "school" | "you", label?: string) {
  const cls = `boken-pin ${kind}`;
  const isPerson = kind === "school" || kind === "you";
  const html = `
    <div class="${cls}${isPerson ? " is-person" : ""}">
      ${isPerson ? STICK_FIGURE_SVG : TEARDROP_SVG}
      ${label ? `<span class="label">${label}</span>` : ""}
    </div>
  `;
  // The stick figure has its "feet" anchor at the bottom-center; the teardrop
  // anchors slightly above its tip so the pin point lands on the location.
  const size: [number, number] = isPerson ? [40, 56] : [32, 40];
  const anchor: [number, number] = isPerson ? [20, 54] : [16, 38];
  return L.divIcon({
    className: "boken-pin-wrap",
    html,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -32],
  });
}

/**
 * Geocode a school. Tries Photon (Komoot's reliable OSM-backed geocoder) first,
 * falls back to Nominatim. Both are free + no API key.
 * Photon is much more stable in practice — the public Nominatim instance is
 * frequently rate-limited or returns 503.
 */
async function geocodeSearch(school: string, city: string, limit = 6): Promise<Suggestion[]> {
  const variants: string[] = [];
  const trimmedSchool = school.trim();
  const trimmedCity = city.trim();

  if (trimmedSchool) {
    variants.push([trimmedSchool, trimmedCity].filter(Boolean).join(" "));
    if (/ungdomsskole|barneskole|videregående/i.test(trimmedSchool)) {
      const simpler = trimmedSchool.replace(/ungdomsskole|barneskole|videregående( skole)?/i, "skole").trim();
      variants.push([simpler, trimmedCity].filter(Boolean).join(" "));
    }
    if (!/skole/i.test(trimmedSchool)) {
      variants.push([`${trimmedSchool} skole`, trimmedCity].filter(Boolean).join(" "));
    }
  } else if (trimmedCity) {
    variants.push(trimmedCity);
  }

  // --- Primary: Photon (more reliable, GeoJSON FeatureCollection) ---
  for (const q of variants) {
    if (!q) continue;
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=no`,
      );
      if (!res.ok) continue;
      const data = (await res.json()) as {
        features: Array<{
          properties: {
            osm_id?: number;
            name?: string;
            city?: string;
            district?: string;
            country?: string;
            type?: string;
            osm_value?: string;
          };
          geometry: { coordinates: [number, number] };
        }>;
      };
      const features = data.features ?? [];
      const norwegian = features.filter(
        (f) => f.properties.country === "Norge" || f.properties.country === "Norway",
      );
      const pick = norwegian.length > 0 ? norwegian : features;
      if (pick.length > 0) {
        return pick.map((f, i) => {
          const p = f.properties;
          const [lon, lat] = f.geometry.coordinates;
          const placeBits = [p.district, p.city, p.country].filter(Boolean).join(", ");
          return {
            place_id: p.osm_id ?? i,
            lat: String(lat),
            lon: String(lon),
            display_name: `${p.name ?? "?"}${placeBits ? ", " + placeBits : ""}`,
            name: p.name,
            type: p.osm_value,
          };
        });
      }
    } catch {
      // try next variant
    }
  }

  // --- Fallback: Nominatim ---
  for (const q of variants) {
    if (!q) continue;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=no&limit=${limit}&addressdetails=0`,
        { headers: { "Accept-Language": "nb-NO" } },
      );
      if (!res.ok) continue;
      const data = (await res.json()) as Suggestion[];
      if (data.length > 0) return data;
    } catch {
      // try next variant
    }
  }

  return [];
}

export function AreaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const schoolMarkerRef = useRef<Marker | null>(null);
  const spotsLayerRef = useRef<LayerGroup | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [LeafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);
  const [status, setStatus] = useState<string>("Skriv inn skolen din, bruk «Finn meg», eller klikk direkte på kartet.");
  const [busy, setBusy] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filterType, setFilterType] = useState<"all" | "park" | "skog" | "vann">("all");
  const [radiusMinutes, setRadiusMinutes] = useState<10 | 20 | 30>(20);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCity, setSchoolCity] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Init Leaflet
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;
      setLeafletModule(L);

      const map = L.map(mapRef.current, {
        center: [59.9139, 10.7522], // Oslo default
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      // Replace Leaflet's default attribution prefix (which includes a Ukraine flag SVG)
      // with a plain text credit.
      map.attributionControl.setPrefix("<a href=\"https://leafletjs.com\" title=\"Leaflet\">Leaflet</a>");

      // Tile choice: if a Stadia Maps API key is set, use Stamen Watercolor (hand-painted look);
      // otherwise fall back to CARTO Voyager (clean, modern, no key required, works on any domain).
      const stadiaKey = process.env.NEXT_PUBLIC_STADIA_API_KEY;
      if (stadiaKey) {
        L.tileLayer(`https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=${stadiaKey}`, {
          attribution: "Map: © <a href=\"https://stadiamaps.com/\">Stadia Maps</a> · © <a href=\"https://stamen.com\">Stamen</a> · © <a href=\"https://openstreetmap.org/copyright\">OpenStreetMap</a>",
          maxZoom: 16,
          minZoom: 1,
        }).addTo(map);
        L.tileLayer(`https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`, {
          attribution: "",
          maxZoom: 16,
          opacity: 0.75,
        }).addTo(map);
      } else {
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> · © <a href=\"https://carto.com/attributions\">CARTO</a>",
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);
      }

      spotsLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      // Click-on-map fallback: if geocoders are down or the school isn't in OSM,
      // teachers can just click their school location directly on the map.
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        showSchoolAt(L, lat, lng, "Valgt sted");
        setStatus(`Plassert manuelt. Leter etter parker, skog og vann i nærheten …`);
        void fetchSpots(lat, lng);
      });

      setTimeout(() => map.invalidateSize(), 100);
    })();
    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = schoolName.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const found = await geocodeSearch(schoolName, schoolCity, 6);
      setSuggestions(found);
      setShowSuggestions(found.length > 0);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [schoolName, schoolCity]);

  const showSchoolAt = (L: typeof import("leaflet"), lat: number, lng: number, label = "Skolen") => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.remove();
      schoolMarkerRef.current = null;
    }
    const marker = L.marker([lat, lng], { icon: makeDivIcon(L, "school") }).addTo(map);
    marker.bindPopup(`<strong>${label}</strong>`);
    schoolMarkerRef.current = marker;
    map.setView([lat, lng], 14, { animate: true });
  };

  const renderSpots = (L: typeof import("leaflet"), allSpots: Spot[]) => {
    const layer = spotsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const schoolMarker = schoolMarkerRef.current;
    const visible = filterType === "all" ? allSpots : allSpots.filter((s) => s.kind === filterType);
    visible.forEach((spot, i) => {
      // Dashed line from school → spot
      if (schoolMarker) {
        const schoolLatLng = schoolMarker.getLatLng();
        L.polyline(
          [
            [schoolLatLng.lat, schoolLatLng.lng],
            [spot.lat, spot.lng],
          ],
          {
            color: "#1A1A1A",
            weight: 2,
            opacity: 0.7,
            dashArray: "6 6",
            lineCap: "round",
          },
        ).addTo(layer);
      }
      const marker = L.marker([spot.lat, spot.lng], { icon: makeDivIcon(L, spot.kind, String(i + 1)) });
      marker.bindPopup(`<strong>${spot.name}</strong><br>${KIND_LABEL[spot.kind]}<br><em>~${Math.round(spot.distance)} m</em>`);
      marker.addTo(layer);
    });
  };

  useEffect(() => {
    if (LeafletModule) renderSpots(LeafletModule, spots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, spots, LeafletModule]);

  async function pickSuggestion(s: Suggestion) {
    if (!LeafletModule) return;
    setShowSuggestions(false);
    setSchoolName(s.name || s.display_name.split(",")[0]);
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setBusy(true);
    setStatus(`Viser kart rundt ${s.display_name}.`);
    showSchoolAt(LeafletModule, lat, lng, s.display_name);
    await fetchSpots(lat, lng);
  }

  async function searchSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!LeafletModule) return;
    const q = [schoolName, schoolCity].filter(Boolean).join(", ");
    if (!q.trim()) {
      setStatus("Skriv inn skolen din først.");
      return;
    }
    setBusy(true);
    setShowSuggestions(false);
    setStatus(`Søker etter «${q}» …`);
    const found = await geocodeSearch(schoolName, schoolCity, 1);
    if (found.length === 0) {
      setStatus(`Fant ikke «${q}». Prøv et annet søk, bruk «Finn meg», eller klikk direkte på kartet der skolen er.`);
      setBusy(false);
      return;
    }
    const { lat, lon, display_name } = found[0];
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lon);
    showSchoolAt(LeafletModule, latNum, lngNum, display_name);
    await fetchSpots(latNum, lngNum);
  }

  function useMyLocation() {
    if (!LeafletModule) return;
    if (!("geolocation" in navigator)) {
      setStatus("Nettleseren din støtter ikke posisjon. Prøv å søke på skolens navn i stedet.");
      return;
    }
    setBusy(true);
    setStatus("Henter posisjonen din …");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (LeafletModule) {
          showSchoolAt(LeafletModule, latitude, longitude, "Du er her");
          await fetchSpots(latitude, longitude);
        }
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Du må gi tilgang til posisjon — eller søk på skolens navn over."
            : "Klarte ikke å finne posisjonen din. Prøv å søke på skolens navn.",
        );
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  async function fetchSpots(lat: number, lng: number) {
    const radiusMeters = radiusMinutes * 80;
    setStatus(`Leter etter parker, skog og vann innenfor ${radiusMinutes} minutter til fots …`);
    const query = `
      [out:json][timeout:25];
      (
        node["leisure"~"park|nature_reserve|garden"](around:${radiusMeters},${lat},${lng});
        way["leisure"~"park|nature_reserve|garden"](around:${radiusMeters},${lat},${lng});
        node["landuse"~"forest|meadow|grass"](around:${radiusMeters},${lat},${lng});
        way["landuse"~"forest|meadow|grass"](around:${radiusMeters},${lat},${lng});
        node["natural"~"wood|water|wetland|pond|stream"](around:${radiusMeters},${lat},${lng});
        way["natural"~"wood|water|wetland|pond|stream"](around:${radiusMeters},${lat},${lng});
      );
      out center 60;
    `;
    // Call our server-side proxy at /api/spots — it queries Overpass for us
    // with proper User-Agent + Accept headers. Browsers can't talk to
    // overpass-api.de directly because it rejects requests with an Origin
    // header (returns 406). Going through our own function fixes that.
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

    let data: OverpassResp | null = null;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15_000);
      // /api/spots is on the same Vercel deploy as this embed — works
      // from inside the iframe regardless of the host page domain.
      const res = await fetch(
        `/api/spots?lat=${lat}&lng=${lng}&r=${radiusMeters}`,
        { signal: ctrl.signal },
      );
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = (await res.json()) as OverpassResp;
    } catch (e) {
      console.warn("[spots] proxy call failed:", e);
    }

    try {
      if (!data) throw new Error("Klarte ikke å hente områder akkurat nå. Prøv igjen om litt.");

      const found: Spot[] = [];
      for (const el of data.elements ?? []) {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (typeof elLat !== "number" || typeof elLon !== "number") continue;
        const tags = el.tags ?? {};
        let kind: SpotKind | null = null;
        if (tags.leisure === "park" || tags.leisure === "garden" || tags.landuse === "grass") kind = "park";
        else if (tags.natural === "wood" || tags.landuse === "forest" || tags.leisure === "nature_reserve" || tags.landuse === "meadow") kind = "skog";
        else if (tags.natural === "water" || tags.natural === "wetland" || tags.natural === "pond" || tags.natural === "stream") kind = "vann";
        if (!kind) continue;

        const name = tags.name ?? tags["name:nb"] ?? KIND_LABEL[kind];
        const distance = haversine(lat, lng, elLat, elLon);
        if (distance < 30) continue;
        found.push({ id: el.id, kind, name, lat: elLat, lng: elLon, distance });
      }

      found.sort((a, b) => a.distance - b.distance);
      const top = found.slice(0, 15);
      setSpots(top);
      if (LeafletModule) renderSpots(LeafletModule, top);
      setStatus(
        top.length > 0
          ? `Fant ${top.length} områder innenfor ${radiusMinutes} minutter til fots.`
          : `Fant ingen tydelige parker eller skoger i nærheten. Prøv en lengre gå-avstand.`,
      );
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Klarte ikke å hente områder fra OpenStreetMap: ${err.message}`
          : "Klarte ikke å hente områder.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="area-grid">
      <form className="area-form" onSubmit={searchSchool}>
        <div className="field" style={{ position: "relative" }}>
          <label htmlFor="naturfag-skole">Skolen din</label>
          <input
            id="naturfag-skole"
            type="text"
            placeholder="F.eks. Jordal skole"
            autoComplete="off"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggest">
              {suggestions.map((s) => (
                <li
                  key={s.place_id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickSuggestion(s);
                  }}
                >
                  <strong>{s.name || s.display_name.split(",")[0]}</strong>
                  <span>{s.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="field">
          <label htmlFor="naturfag-by">By / kommune</label>
          <input
            id="naturfag-by"
            type="text"
            placeholder="F.eks. Oslo"
            autoComplete="off"
            value={schoolCity}
            onChange={(e) => setSchoolCity(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="naturfag-radius">Gå-avstand</label>
          <select
            id="naturfag-radius"
            value={radiusMinutes}
            onChange={(e) => setRadiusMinutes(Number(e.target.value) as 10 | 20 | 30)}
          >
            <option value={10}>10 minutter til fots</option>
            <option value={20}>20 minutter til fots</option>
            <option value={30}>30 minutter til fots</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="naturfag-type">Hva ser dere etter?</label>
          <select
            id="naturfag-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          >
            <option value="all">Alt — biologisk mangfold</option>
            <option value="park">Park / planter</option>
            <option value="skog">Skog / trær</option>
            <option value="vann">Vann / dammer / bekker</option>
          </select>
        </div>
        <div className="area-controls">
          <button type="submit" disabled={busy}>
            {busy ? "Søker …" : "Vis forslag på kart"}
          </button>
          <button type="button" className="geo" onClick={useMyLocation} disabled={busy}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            Finn meg
          </button>
        </div>
        <p className="area-status">{status}</p>
      </form>

      <div className="area-map live" aria-label="Kart over nærmiljø">
        <div className="legend">Kart over nærmiljø</div>
        <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />
      </div>

      {spots.length > 0 && (
        <ul className="area-results-list" style={{ gridColumn: "1 / -1" }}>
          {spots
            .filter((s) => filterType === "all" || s.kind === filterType)
            .map((spot, i) => (
              <li key={spot.id}>
                <span className="dot" style={{ background: KIND_COLOR[spot.kind] }} />
                <span className="name">
                  {i + 1}. {spot.name}
                </span>
                <span className="dist">~{Math.round(spot.distance)} m</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
