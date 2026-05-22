import Link from "next/link";

export const metadata = { title: "Hvordan lage boka — Boken" };

export default function HvordanLageBokaPage() {
  return (
    <main className="opplegg-page">
      <div className="crumb">
        <Link href="/">Hjem</Link> &nbsp;/&nbsp; Hvordan lage boka
      </div>
      <h1 className="opplegg-title">Hvordan lage boka</h1>
      <div className="opplegg-sub">— 10 A4-ark, en stiftemaskin og fem minutter —</div>

      <section className="desc-card orange">
        <h2>Det du trenger</h2>
        <p>
          <strong>10 A4-ark</strong> (gjerne kraftig 80–100 g), <strong>en stiftemaskin</strong> og
          eventuelt en linjal for å brette pent. Det er det.
        </p>
      </section>

      <section className="video-wrap" style={{ padding: 0, marginTop: 32 }}>
        <div className="video" role="img" aria-label="Video som viser hvordan boka lages">
          <div className="video-inner">
            <button className="play-btn" type="button" aria-label="Spill video">
              <svg viewBox="0 0 24 24"><path d="M5 3v18l16-9z" fill="#fff" /></svg>
            </button>
            <div className="video-label">Video — hvordan lage boka · ca. 1 min</div>
            <div className="video-caption">— placeholder, video kommer snart —</div>
          </div>
        </div>
      </section>

      <section className="steps" style={{ marginTop: 56 }}>
        <div className="step">
          <div className="num">1</div>
          <div className="step-card">
            <img src="/assets/oppskrift-notatbok.png" alt="" />
            <h4>Grunnboka</h4>
            <p>Stable ti A4-ark, brett alle midt på. Sett tre stifter langs bretten — fra utsiden inn. Stift slik at klipsen ligger inni boka.</p>
          </div>
        </div>
        <div className="step">
          <div className="num blue">2</div>
          <div className="step-card">
            <img src="/assets/oppskrift-lomme.png" alt="" />
            <h4>Lommer for løse lapper</h4>
            <p>Brett ett av arkene til en lomme før du stifter. Perfekt til løse blader, småstein og post-it-lapper.</p>
          </div>
        </div>
        <div className="step">
          <div className="num yellow">3</div>
          <div className="step-card">
            <img src="/assets/oppskrift-utbrettbar.png" alt="" />
            <h4>Utbrettbare sider</h4>
            <p>Brett ekstra ark i akkordeon før du stifter — så får elevene store flater for sketchnotes.</p>
          </div>
        </div>
      </section>

      <section className="pdfs-section" style={{ marginTop: 72 }}>
        <h2>Last ned oppskriftene</h2>
        <div className="materials-row">
          <a className="btn-dl" href="/downloads/boken-grunnbok.pdf" download>↓ Grunnboka (PDF)</a>
          <a className="btn-dl" href="/downloads/boken-lomme.pdf" download>↓ Lomme-oppskrift</a>
          <a className="btn-dl" href="/downloads/boken-utbrettbar.pdf" download>↓ Utbrettbar side</a>
          <a className="btn-dl alt" href="/downloads/boken-a4.pdf" download>↓ Hele boka som A4-ark</a>
        </div>
      </section>

      <div className="continue" style={{ marginTop: 56 }}>
        <Link className="next" href="/">← Tilbake til forsiden</Link>
        <Link className="next" href="/#opplegg">Se opplegg →</Link>
      </div>
    </main>
  );
}
