"use client";

import { useState, useMemo } from "react";

type Mode = "names" | "count";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeGroups<T>(items: T[], groupSize: number): T[][] {
  if (items.length === 0 || groupSize < 1) return [];
  const shuffled = shuffle(items);
  const groups: T[][] = [];
  for (let i = 0; i < shuffled.length; i += groupSize) {
    groups.push(shuffled.slice(i, i + groupSize));
  }
  // Distribute the last small group if it's tiny
  if (groups.length >= 2 && groups[groups.length - 1].length === 1 && groupSize >= 3) {
    const last = groups.pop()!;
    groups[0].push(...last);
  }
  return groups;
}

export function GroupBuilder() {
  const [mode, setMode] = useState<Mode>("names");
  const [rawNames, setRawNames] = useState("");
  const [count, setCount] = useState(24);
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<string[][]>([]);
  const [seed, setSeed] = useState(0);

  const names = useMemo(
    () =>
      rawNames
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [rawNames],
  );

  const totalStudents = mode === "names" ? names.length : count;

  const generate = () => {
    const items =
      mode === "names"
        ? names
        : Array.from({ length: count }, (_, i) => `Elev ${i + 1}`);
    setGroups(makeGroups(items, groupSize));
    setSeed((s) => s + 1);
  };

  const clear = () => {
    setGroups([]);
    setRawNames("");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <>
      <div className="gb-card">
        <div className="gb-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "names"}
            className={mode === "names" ? "active" : ""}
            onClick={() => setMode("names")}
          >
            Lim inn navneliste
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "count"}
            className={mode === "count" ? "active" : ""}
            onClick={() => setMode("count")}
          >
            Bare antall
          </button>
        </div>

        {mode === "names" ? (
          <div className="gb-field">
            <label htmlFor="gb-names">
              Lim inn navnene — ett per linje (eller skill med komma)
            </label>
            <textarea
              id="gb-names"
              value={rawNames}
              onChange={(e) => setRawNames(e.target.value)}
              placeholder={"Aisha\nBjørn\nClara\nDavid\n…"}
            />
            <small style={{ color: "var(--ink-soft)" }}>
              {names.length} {names.length === 1 ? "navn" : "navn"} lest inn
            </small>
          </div>
        ) : (
          <div className="gb-field">
            <label htmlFor="gb-count">Antall elever</label>
            <input
              id="gb-count"
              type="number"
              min={1}
              max={120}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(120, Number(e.target.value) || 0)))}
            />
          </div>
        )}

        <div className="gb-row">
          <div className="gb-field">
            <label htmlFor="gb-size">Gruppestørrelse</label>
            <select
              id="gb-size"
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              style={{
                border: "1.5px solid var(--ink)",
                padding: "12px 14px",
                fontFamily: "Cabin, sans-serif",
                fontSize: 16,
                background: "#fff",
              }}
            >
              <option value={2}>2 i gruppe (par)</option>
              <option value={3}>3 i gruppe</option>
              <option value={4}>4 i gruppe</option>
              <option value={5}>5 i gruppe</option>
            </select>
          </div>
          <div className="gb-field">
            <label>Resultat</label>
            <div style={{ paddingTop: 12, fontFamily: "Kalam, sans-serif", fontSize: 18 }}>
              {totalStudents > 0
                ? `${Math.ceil(totalStudents / groupSize)} grupper på ~${groupSize} elever`
                : "— ingen elever ennå —"}
            </div>
          </div>
        </div>

        <div className="gb-actions">
          <button type="button" onClick={generate} disabled={totalStudents === 0}>
            {groups.length === 0 ? "Lag grupper" : "Stokk på nytt"}
          </button>
          <button type="button" className="ghost" onClick={clear}>
            Tøm
          </button>
          {groups.length > 0 && (
            <button type="button" className="ghost" onClick={handlePrint}>
              Skriv ut
            </button>
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <section className="gb-results">
          <h2>Forslag (stokket #{seed})</h2>
          <div className="gb-groups-grid">
            {groups.map((g, i) => (
              <div className="gb-group-card" key={i}>
                <h3>Gruppe {i + 1}</h3>
                <ul>
                  {g.map((name, j) => (
                    <li key={j}>{name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
