import Link from "next/link";

export const metadata = { title: "For lærere — Boken" };

export default function ForLaerereePage() {
  return (
    <main className="opplegg-page">
      <div className="crumb">
        <Link href="/">Hjem</Link> &nbsp;/&nbsp; For lærere
      </div>
      <h1 className="opplegg-title">For lærere</h1>
      <div className="opplegg-sub">— bakgrunn, prinsipper og hvordan du tar boka i bruk —</div>

      <section className="desc-card">
        <h2>Hvorfor boka?</h2>
        <p>
          Boka er hjemmelaget med vilje. Det elevene lager med egne hender, eier de
          litt mer enn det de får utdelt. Den blir både skissebok, fagdagbok og
          minne fra året — i ett.
        </p>
      </section>

      <section style={{ marginTop: 56 }}>
        <h2 className="h-section" style={{ marginBottom: 18 }}>Prinsipper</h2>
        <ul className="lm-list">
          <li>Tegning er notering, ikke kunst. Det handler ikke om å være «flink til å tegne».</li>
          <li>Boka skal være elevens egen — la dem klusse, brette og ødelegge.</li>
          <li>Færre regler, flere oppgaver. Vi gir rammen, dere fyller den.</li>
          <li>Repetisjon over tid: jo flere opplegg samme bok bærer, jo bedre.</li>
        </ul>
      </section>

      <section className="pdfs-section" style={{ marginTop: 72 }}>
        <h2>Materiale</h2>
        <div className="materials-row">
          <a className="btn-dl" href="/downloads/larer-guide.pdf" download>↓ Lærer-guide (PDF)</a>
          <a className="btn-dl alt" href="/downloads/boken-a4.pdf" download>↓ Hele boka som A4-ark</a>
        </div>
      </section>

      <div className="continue" style={{ marginTop: 56 }}>
        <Link className="next" href="/">← Tilbake til forsiden</Link>
        <Link className="next" href="/hvordan-lage-boka">Hvordan lage boka →</Link>
      </div>
    </main>
  );
}
