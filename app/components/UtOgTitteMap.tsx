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
          crossOrigin: "anonymous",
        }).addTo(map);
        L.tileLayer(`https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`, {
          attribution: "",
          maxZoom: 16,
          opacity: 0.75,
          crossOrigin: "anonymous",
        }).addTo(map);
      } else {
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> · © <a href=\"https://carto.com/attributions\">CARTO</a>",
          maxZoom: 19,
          subdomains: "abcd",
          crossOrigin: "anonymous",
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
    // Stick-man = actual Boken brand illustration. Save the PNG to
    // /public/assets/finn-meg.png and it'll render here.
    const icon = L.divIcon({
      className: "boken-pin-wrap",
      html: `<div class="boken-pin school is-person"><img src="/assets/finn-meg.png" alt="" class="boken-stickman" /></div>`,
      iconSize: [40, 56],
      iconAnchor: [20, 54],
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

  const handlePrint = async () => {
    if (typeof window === "undefined") return;
    const mapEl = mapRef.current?.parentElement; // .uot-map.area-map.live
    const target = document.querySelector<HTMLImageElement>(".uot-ps-map-live img");
    if (!mapEl || !target) {
      window.print();
      return;
    }
    try {
      // Capture the live Leaflet map as a PNG and stamp it into the print sheet.
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(mapEl, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#F4EFE3",
        filter: (node) => {
          // skip Leaflet controls in the snapshot so the printed map is clean
          if (node instanceof HTMLElement) {
            if (node.classList?.contains("leaflet-control-zoom")) return false;
            if (node.classList?.contains("leaflet-control-attribution")) return false;
            if (node.classList?.contains("legend")) return false;
          }
          return true;
        },
      });
      target.src = dataUrl;
      // Let the image paint, then print
      await new Promise((r) => setTimeout(r, 150));
      window.print();
    } catch (err) {
      console.warn("Map snapshot failed, falling back to plain print", err);
      window.print();
    }
  };

  const today = new Date().toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" });

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

          {center && (
            <button type="button" className="uot-print" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" />
              </svg>
              Skriv ut feltkort (PDF)
            </button>
          )}
        </div>
      </div>

      {/*
        Print-only feltkort. A4 LANDSCAPE — folds in half vertically.
        Left half: the map (captured PNG snapshot).
        Right half: "Hva så du?" title + writing space.
        Designed to be folded once and slipped into the student's notebook.
      */}
      <aside className="uot-print-sheet" aria-hidden="true">
        <div className="uot-ps-fold">
          <div className="uot-ps-left">
            <div className="uot-ps-map-frame">
              <span className="uot-ps-map-cap">Området ditt · ~{radius} m radius</span>
              <div className="uot-ps-map-live">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Snapshot av området" />
              </div>
            </div>
          </div>
          <div className="uot-ps-right">
            <h2>Hva så du?</h2>
            <div className="uot-ps-lines">
              {Array.from({ length: 9 }).map((_, i) => (
                <span className="uot-ps-line" key={i} />
              ))}
            </div>
            <div className="uot-ps-credit">Boken · KasseRommet</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
