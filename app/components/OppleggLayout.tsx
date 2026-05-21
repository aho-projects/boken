import Link from "next/link";
import type { ReactNode } from "react";
import type { Opplegg } from "../data/opplegg";
import { PerOppleggExamples } from "./ExamplesGrid";

export function OppleggMetaRow({ duration, subject, location, group }: { duration: string; subject: string; location: string; group: string }) {
  return (
    <div className="meta-row" aria-label="Opplegg-detaljer">
      <div className="meta-item">
        <svg viewBox="0 0 32 32"><circle cx="16" cy="17" r="11" /><path d="M16 11v6l4 3" /><path d="M14 4h4" /></svg>
        <span className="label">{duration}</span>
      </div>
      <div className="meta-item">
        <svg viewBox="0 0 32 32"><path d="M5 7c4-2 8-2 11 0v18c-3-2-7-2-11 0z" /><path d="M27 7c-4-2-8-2-11 0v18c3-2 7-2 11 0z" /></svg>
        <span className="label">{subject}</span>
      </div>
      <div className="meta-item">
        <svg viewBox="0 0 32 32"><path d="M16 4c-5 0-9 4-9 9 0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z" /><circle cx="16" cy="13" r="3" /></svg>
        <span className="label">{location}</span>
      </div>
      <div className="meta-item">
        <svg viewBox="0 0 32 32"><circle cx="12" cy="12" r="4" /><circle cx="22" cy="14" r="3" /><path d="M5 24c1-4 5-6 7-6s6 2 7 6" /><path d="M19 24c1-3 3-4 5-4s4 1 5 4" /></svg>
        <span className="label">{group}</span>
      </div>
    </div>
  );
}

export function ContinueRow({ prev, next }: { prev?: { href: string; label: string }; next?: { href: string; label: string } }) {
  return (
    <div className="continue">
      {prev ? (
        <Link className="next" href={prev.href}>{prev.label}</Link>
      ) : <span />}
      {next ? (
        <Link className="next" href={next.href}>{next.label}</Link>
      ) : <span />}
    </div>
  );
}

export function MaterialsRow({ slug }: { slug: string }) {
  return (
    <div className="materials-row">
      <a className="btn-dl" href={`/downloads/${slug}-intro.pdf`} download>
        ↓ Intro powerpoint (PDF)
      </a>
      <a className="btn-dl" href={`/downloads/${slug}-oppgaver.pdf`} download>
        ↓ Oppgaver (PDF)
      </a>
      <a className="btn-dl alt" href="/downloads/boken-a4.pdf" download>
        ↓ Last ned hele boka som A4-ark
      </a>
    </div>
  );
}

export function OppleggPage({
  opplegg,
  utstyrItems,
  laeringsmaal,
  children,
}: {
  opplegg: Opplegg;
  utstyrItems: string[];
  laeringsmaal: { udir: string; items: string[] };
  children?: ReactNode;
}) {
  return (
    <main className="opplegg-page">
      <div className="crumb">
        <Link href="/">Hjem</Link> &nbsp;/&nbsp; <Link href="/#opplegg">Opplegg</Link> &nbsp;/&nbsp; {opplegg.title}
      </div>

      <h1 className="opplegg-title">{opplegg.title}</h1>
      <div className="opplegg-sub">— {opplegg.sub} —</div>

      <section className="desc-card">
        <h2>Beskrivelse av oppgaven</h2>
        <p>{opplegg.description}</p>
      </section>

      <OppleggMetaRow
        duration={opplegg.duration}
        subject={opplegg.tagLabel}
        location={opplegg.id === "naturfag" ? "Ute og inne" : "Klasserommet"}
        group="2–4 i gruppe"
      />

      <div style={{ marginBottom: 36 }}>
        <Link href="/grupper" className="btn-dl" style={{ background: "var(--blue)", color: "var(--ink)" }}>
          ✎ Lag grupper for klassen
        </Link>
      </div>

      <section className="laeringsmaal">
        <h2>Læringsmål</h2>
        <p className="udir">{laeringsmaal.udir}</p>
        <ul className="lm-list">
          {laeringsmaal.items.length > 0 ? (
            laeringsmaal.items.map((it, i) => <li key={i}>{it}</li>)
          ) : (
            <li className="empty">Læringsmål kommer snart.</li>
          )}
        </ul>
        <aside className="utstyr">
          <h3>Utstyr</h3>
          <ul>
            {utstyrItems.length > 0 ? (
              utstyrItems.map((it, i) => <li key={i}>{it}</li>)
            ) : (
              <li className="empty">Utstyrsliste kommer snart.</li>
            )}
          </ul>
        </aside>
      </section>

      {children}

      <section className="pdfs-section">
        <h2>Materiale</h2>
        <MaterialsRow slug={opplegg.slug} />
      </section>

      <section className="eksempler-students-section">
        <h2>Eksempler fra elever</h2>
        <p className="sub">Slik har andre klasser løst opplegget — last opp dine egne via skjemaet på hovedsiden.</p>
        <PerOppleggExamples opplegg={opplegg.id} />
      </section>

      <ContinueRow prev={opplegg.prev} next={opplegg.next} />
    </main>
  );
}
