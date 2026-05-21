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

function makeDivIcon(L: typeof import("leaflet"), kind: SpotKind | "school" | "you", label?: string) {
  const cls = `boken-pin ${kind}`;
  const html = `
    <div class="${cls}">
      <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1C8 1 2 7 2 15c0 11 14 24 14 24s14-13 14-24c0-8-6-14-14-14z" stroke="#1A1A1A" stroke-width="1.8"/>
        <circle cx="16" cy="15" r="5" fill="#fff" stroke="#1A1A1A" stroke-width="1.6"/>
      </svg>
      ${label ? `<span class="label">${label}</span>` : ""}
    </div>
  `;
  return L.divIcon({
    className: "boken-pin-wrap",
    html,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -32],
  });
}

export function AreaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const schoolMarkerRef = useRef<Marker | null>(null);
  const spotsLayerRef = useRef<LayerGroup | null>(null);
  const [LeafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);
  const [status, setStatus] = useState<string>("Skriv inn skolen din, eller la oss bruke posisjonen din.");
  const [busy, setBusy] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filterType, setFilterType] = useState<"all" | "park" | "skog" | "vann">("all");
  const [radiusMinutes, setRadiusMinutes] = useState<10 | 20 | 30>(20);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCity, setSchoolCity] = useState("");

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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      spotsLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      // Resize fix after mount
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
    const visible = filterType === "all" ? allSpots : allSpots.filter((s) => s.kind === filterType);
    visible.forEach((spot, i) => {
      const marker = L.marker([spot.lat, spot.lng], { icon: makeDivIcon(L, spot.kind, String(i + 1)) });
      marker.bindPopup(`<strong>${spot.name}</strong><br>${KIND_LABEL[spot.kind]}<br><em>~${Math.round(spot.distance)} m</em>`);
      marker.addTo(layer);
    });
  };

  // Re-render markers when filter changes
  useEffect(() => {
    if (LeafletModule) renderSpots(LeafletModule, spots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, spots, LeafletModule]);

  async function searchSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!LeafletModule) return;
    const q = [schoolName, schoolCity].filter(Boolean).join(", ");
    if (!q) {
      setStatus("Skriv inn skolen din først.");
      return;
    }
    setBusy(true);
    setStatus(`Søker etter «${q}» …`);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=no&limit=1`,
        { headers: { "Accept-Language": "nb-NO" } },
      );
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (data.length === 0) {
        setStatus(`Fant ikke «${q}». Prøv et annet navn eller bruk «Finn meg».`);
        setBusy(false);
        return;
      }
      const { lat, lon, display_name } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      showSchoolAt(LeafletModule, latNum, lngNum, display_name);
      await fetchSpots(latNum, lngNum);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Søket feilet.");
      setBusy(false);
    }
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
    const radiusMeters = radiusMinutes * 80; // ~5 km/h gå-fart
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
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      const data = await res.json() as { elements: Array<{ id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> };

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
        if (distance < 30) continue; // skip the school itself
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
        <div className="field">
          <label htmlFor="naturfag-skole">Skolen din</label>
          <input
            id="naturfag-skole"
            type="text"
            placeholder="F.eks. Ullern ungdomsskole"
            autoComplete="off"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
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
