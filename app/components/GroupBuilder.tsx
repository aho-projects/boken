"use client";

import { useState, useMemo, useEffect } from "react";

const TEAM_COLORS = [
  { name: "Gul", bg: "var(--yellow)" },
  { name: "Blå", bg: "var(--blue)" },
  { name: "Oransje", bg: "var(--orange)", text: "#fff" },
  { name: "Hvit", bg: "#fff" },
  { name: "Lilla", bg: "#D7BDE2" },
  { name: "Grønn", bg: "#B7E0A8" },
  { name: "Rosa", bg: "#F4C2C2" },
  { name: "Krem", bg: "var(--paper-warm)" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distributeRespectingLocks(
  students: string[],
  groupSize: number,
  locks: Record<string, number>, // student name → group index
): string[][] {
  if (students.length === 0 || groupSize < 1) return [];
  const groupCount = Math.max(1, Math.ceil(students.length / groupSize));
  const groups: string[][] = Array.from({ length: groupCount }, () => []);

  // Place locked students first
  const lockedNames = new Set<string>();
  for (const name of students) {
    const lockIdx = locks[name];
    if (typeof lockIdx === "number" && lockIdx < groupCount && groups[lockIdx].length < groupSize) {
      groups[lockIdx].push(name);
      lockedNames.add(name);
    }
  }

  // Shuffle remaining and fill in
  const remaining = shuffle(students.filter((s) => !lockedNames.has(s)));
  let idx = 0;
  for (const name of remaining) {
    let tries = 0;
    while (groups[idx % groupCount].length >= groupSize && tries < groupCount) {
      idx += 1;
      tries += 1;
    }
    groups[idx % groupCount].push(name);
    idx += 1;
  }

  // Merge single-student trailing group into first group if size allows
  if (groups.length >= 2 && groups[groups.length - 1].length === 1 && groupSize >= 3) {
    const last = groups.pop()!;
    groups[0].push(...last);
  }
  return groups;
}

export function GroupBuilder() {
  const [raw, setRaw] = useState("");
  const [groupSize, setGroupSize] = useState(3);
  const [generated, setGenerated] = useState(false);
  const [groups, setGroups] = useState<string[][]>([]);
  const [locks, setLocks] = useState<Record<string, number>>({});
  const [stokket, setStokket] = useState(0);
  const [copied, setCopied] = useState(false);

  // Parse input: if it's pure digits → generate Elev 1..N, else split by newline/comma
  const { students, isNumeric } = useMemo(() => {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Math.max(0, Math.min(120, parseInt(trimmed, 10)));
      return {
        students: Array.from({ length: n }, (_, i) => `Elev ${i + 1}`),
        isNumeric: true,
      };
    }
    const names = trimmed
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return { students: names, isNumeric: false };
  }, [raw]);

  // Live preview group count + empty slots
  const previewGroups = useMemo(() => {
    if (students.length === 0) return [];
    const count = Math.max(1, Math.ceil(students.length / groupSize));
    return Array.from({ length: count }, (_, i) => Array<string>(groupSize).fill(""));
  }, [students.length, groupSize]);

  const generate = () => {
    const result = distributeRespectingLocks(students, groupSize, locks);
    setGroups(result);
    setGenerated(true);
    setStokket((s) => s + 1);
  };

  const toggleLock = (name: string, groupIdx: number) => {
    setLocks((prev) => {
      const next = { ...prev };
      if (next[name] === groupIdx) {
        delete next[name];
      } else {
        next[name] = groupIdx;
      }
      return next;
    });
  };

  const clear = () => {
    setRaw("");
    setGroups([]);
    setGenerated(false);
    setLocks({});
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleCopy = async () => {
    const text = groups
      .map((g, i) => {
        const team = TEAM_COLORS[i % TEAM_COLORS.length];
        return `${team.name} gruppe:\n  ${g.join("\n  ")}`;
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const displayGroups = generated ? groups : previewGroups;

  return (
    <>
      <div className="gb-card">
        <div className="gb-field">
          <label htmlFor="gb-raw">
            Lim inn klasselista — eller bare skriv et tall
          </label>
          <textarea
            id="gb-raw"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"Aisha\nBjørn\nClara\nDavid\n…\n\n— eller bare skriv «24» —"}
          />
          <small style={{ color: "var(--ink-soft)" }}>
            {students.length > 0
              ? isNumeric
                ? `${students.length} anonyme elever`
                : `${students.length} navn`
              : "Ingen elever ennå"}
          </small>
        </div>

        <div className="gb-size">
          <label>Gruppestørrelse</label>
          <div className="gb-size-chips" role="radiogroup">
            {[2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={groupSize === n}
                className={groupSize === n ? "active" : ""}
                onClick={() => setGroupSize(n)}
              >
                {n} elever
              </button>
            ))}
          </div>
        </div>

        <div className="gb-actions">
          <button
            type="button"
            className="primary"
            onClick={generate}
            disabled={students.length === 0}
          >
            {generated ? "Stokk på nytt ↻" : "Stokk! ✨"}
          </button>
          {generated && (
            <>
              <button type="button" className="ghost" onClick={handleCopy}>
                {copied ? "Kopiert! ✓" : "Kopier"}
              </button>
              <button type="button" className="ghost" onClick={handlePrint}>
                Skriv ut
              </button>
            </>
          )}
          <button type="button" className="ghost" onClick={clear}>
            Tøm
          </button>
        </div>

        {Object.keys(locks).length > 0 && generated && (
          <div className="gb-locks-note">
            🔒 Låst: {Object.keys(locks).join(", ")}. De holder gruppa si når du
            stokker på nytt — trykk på navnet igjen for å låse opp.
          </div>
        )}
      </div>

      {displayGroups.length > 0 && (
        <section className="gb-results">
          <h2>
            {generated
              ? `${groups.length} grupper · stokket ${stokket} ${stokket === 1 ? "gang" : "ganger"}`
              : "Forhåndsvisning"}
          </h2>
          {!generated && (
            <p className="gb-preview-hint">
              Slik vil grupperingen se ut. Trykk «Stokk!» for å fylle dem med navn.
            </p>
          )}
          <div className="gb-groups-grid">
            {displayGroups.map((g, i) => {
              const team = TEAM_COLORS[i % TEAM_COLORS.length];
              return (
                <div
                  className={`gb-team-card ${team.name.toLowerCase()}`}
                  key={i}
                  style={{
                    background: team.bg,
                    color: team.text ?? "var(--ink)",
                  }}
                >
                  <h3>{team.name} gruppe</h3>
                  <ul>
                    {generated
                      ? g.map((name, j) => {
                          const locked = locks[name] === i;
                          return (
                            <li key={j}>
                              <button
                                type="button"
                                className={`gb-name ${locked ? "locked" : ""}`}
                                onClick={() => toggleLock(name, i)}
                                title={locked ? "Klikk for å låse opp" : "Klikk for å låse i denne gruppa"}
                              >
                                {locked ? "🔒 " : ""}
                                {name}
                              </button>
                            </li>
                          );
                        })
                      : g.map((_, j) => (
                          <li key={j} className="gb-empty">
                            —
                          </li>
                        ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
