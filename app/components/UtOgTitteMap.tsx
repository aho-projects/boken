"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, Circle } from "leaflet";

export function UtOgTitteMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const meMarkerRef = useRef<Marker | null>(null);
  const radiusCircleRef = useRef<Circle | null>(null);
  const [LeafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);
  const [radius, setRadius] = useState(200);
  const [status, setStatus] = useState<string>("Trykk «Finn meg» for å sette utgangspunktet.");
  const [busy, setBusy] = useState(false);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;
      setLeafletModule(L);

      const map = L.map(mapRef.current, {
        center: [59.9139, 10.7522],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      map.attributionControl.setPrefix("<a href=\"https://leafletjs.com\" title=\"Leaflet\">Leaflet</a>");

      const stadiaKey = process.env.NEXT_PUBLIC_STADIA_API_KEY;
      if (stadiaKey) {
        L.tileLayer(`https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=${stadiaKey}`, {
          attribution: "Map: © Stadia Maps · © Stamen · © OpenStreetMap",
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

      leafletMapRef.current = map;
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

  const renderMe = (lat: number, lng: number) => {
    const L = LeafletModule;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    if (meMarkerRef.current) {
      meMarkerRef.current.remove();
      meMarkerRef.current = null;
    }
    const icon = L.divIcon({
      className: "boken-pin-wrap",
      html: `<div class="boken-pin school"><svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 1C8 1 2 7 2 15c0 11 14 24 14 24s14-13 14-24c0-8-6-14-14-14z" stroke="#1A1A1A" stroke-width="1.8"/><circle cx="16" cy="15" r="5" fill="#fff" stroke="#1A1A1A" stroke-width="1.6"/></svg></div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 38],
    });
    meMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map).bindPopup("Du står her");

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }
    radiusCircleRef.current = L.circle([lat, lng], {
      radius,
      color: "#1A1A1A",
      weight: 2,
      dashArray: "8 6",
      fillColor: "#F5EFA0",
      fillOpacity: 0.18,
    }).addTo(map);
    map.fitBounds(radiusCircleRef.current.getBounds(), { padding: [30, 30], animate: true });
  };

  useEffect(() => {
    if (radiusCircleRef.current && leafletMapRef.current) {
      radiusCircleRef.current.setRadius(radius);
      leafletMapRef.current.fitBounds(radiusCircleRef.current.getBounds(), { padding: [30, 30], animate: true });
    }
  }, [radius]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("Nettleseren støtter ikke posisjon.");
      return;
    }
    setBusy(true);
    setStatus("Henter posisjonen din …");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
        renderMe(latitude, longitude);
        setStatus(`Du står her. Gå rundt innenfor ${radius} meter og tegn det dere finner i boka.`);
        setBusy(false);
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Du må gi tilgang til posisjon. (Eller dra kartet manuelt for å markere et sted.)"
            : "Klarte ikke å finne posisjonen din.",
        );
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  return (
    <div className="uot-wrap">
      <div className="uot-grid">
        <div className="uot-map area-map live" aria-label="Kart med radius rundt deg">
          <div className="legend">Området ditt</div>
          <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />
        </div>

        <div className="uot-controls">
          <div className="uot-status">{status}</div>
          <button type="button" className="uot-find" onClick={useMyLocation} disabled={busy}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            {busy ? "Henter posisjon …" : center ? "Oppdater posisjon" : "Finn meg"}
          </button>

          <div className="uot-radius">
            <label htmlFor="uot-r">Hvor langt får dere gå?</label>
            <input
              id="uot-r"
              type="range"
              min={50}
              max={500}
              step={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
            <div className="uot-radius-value">{radius} meter</div>
          </div>
        </div>
      </div>
    </div>
  );
}
