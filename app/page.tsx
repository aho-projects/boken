import Link from "next/link";
import { HomeExamples } from "./components/ExamplesGrid";
import { FeedbackForm } from "./components/FeedbackForm";
import { opplegg } from "./data/opplegg";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <Link href="/" className="kr-logo hero-logo" aria-label="Boken">
          <img className="f-closed" src="/assets/logo-closed.png" alt="" />
          <img className="f-opening" src="/assets/logo-opening.png" alt="" />
          <img className="f-open" src="/assets/logo-open.png" alt="" />
        </Link>
        <div className="hero-eyebrow">Boken · for ungdomsskolen</div>
        <h1>Hva husker du fra forrige uke?</h1>
        <p className="lede">
          Folk som tegner det de skal lære, husker nesten dobbelt så mye. Det er ikke
          fordi de er flinke til å tegne — det er fordi hjernen jobber annerledes
          når hendene er med. Boka er stedet elevene noterer på sin egen måte.
        </p>
        <div className="hero-ctas">
          <Link href="#opplegg" className="btn-primary">Se alle opplegg</Link>
          <Link href="/hvordan-lage-boka" className="btn-secondary">Lag boka</Link>
        </div>
      </section>

      <div className="video-wrap">
        <div className="video" role="img" aria-label="Introduksjonsvideo kommer snart">
          <div className="video-inner">
            <button className="play-btn" type="button" aria-label="Spill introvideo">
              <svg viewBox="0 0 24 24"><path d="M5 3v18l16-9z" fill="#fff" /></svg>
            </button>
            <div className="video-label">Introduksjonsvideo · ca. 2 min</div>
            <div className="video-caption">— placeholder, video kommer snart —</div>
          </div>
        </div>
      </div>

      <div className="tagstrip">
        <div className="track">
          {[...Array(2)].map((_, pass) => (
            <span key={pass} style={{ display: "inline" }}>
              <Link href="/sketchnoting">Sketchnoting</Link><span className="divider">/</span>
              <Link href="/naturfag-ute">Naturfag</Link><span className="divider">/</span>
              <Link href="/ut-og-titte">Ut og titte</Link><span className="divider">/</span>
              <Link href="/isberg">Isberg</Link><span className="divider">/</span>
              <Link href="/bytte-perspektiv">Bytte perspektiv</Link><span className="divider">/</span>
              <Link href="/hjemmelagde-kilden">Den hjemmelagde kilden</Link><span className="divider">/</span>
            </span>
          ))}
        </div>
      </div>

      <section className="what-section">
        <div className="what-inner">
          <div>
            <h2>Hva er boka?</h2>
            <div className="what-book-img">Bilde av boka</div>
          </div>
          <div className="body">
            <p>
              <strong>Boka</strong> er en hjemmelaget notatbok elevene stifter
              sammen av ti A4-ark — på under fem minutter. Den er deres egen, og
              følger dem gjennom alle opplegg vi tilbyr.
            </p>
            <p>
              Hvert opplegg fyller boka med noe nytt: en sketchnote om fast fashion,
              feltobservasjoner fra naturfag, et perspektivbytte, en hjemmelagd kilde.
              Det er en skissebok, et tankerom og et minne fra året — alt i ett.
            </p>
            <p>
              Vi tror på <span className="marker">dybdelæring</span>: at det du tegner og
              snakker om, henger med på en annen måte enn det du bare leser.
            </p>
          </div>
        </div>
      </section>

      <section className="how-section">
        <h2>Slik fungerer det</h2>
        <div className="how-grid">
          <div className="how-step">
            <div className="illu"><img src="/assets/oppskrift-notatbok.png" alt="" /></div>
            <div className="step-num">Steg 01</div>
            <h3>Lag boka</h3>
            <p>10 A4-ark, en stiftemaskin og fem minutter. Følg oppskriften nederst på siden — alle elever lager sin egen.</p>
          </div>
          <div className="how-step">
            <div className="illu"><img src="/assets/dypdykk.png" alt="" /></div>
            <div className="step-num">Steg 02</div>
            <h3>Velg et opplegg</h3>
            <p>Læreren plukker ett av oppleggene under. Hvert opplegg har en oppgave, læringsmål, utstyrsliste og PDF til klasserommet.</p>
          </div>
          <div className="how-step">
            <div className="illu"><img src="/assets/sitter-og-tegner.png" alt="" /></div>
            <div className="step-num">Steg 03</div>
            <h3>Fyll inn</h3>
            <p>Elevene fyller boka med tegninger, sketchnotes, foldbare sider og lommer for løse lapper — gjennom hele året.</p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-illu"><img src="/assets/stat-sitter.png" alt="" /></div>
            <div className="stat-num">29%</div>
            <div className="stat-text">Husker 29% mer når man tegner mens man lytter</div>
          </div>
          <div className="stat-item">
            <div className="stat-illu"><img src="/assets/stat-hand.png" alt="" /></div>
            <div className="stat-num">↗</div>
            <div className="stat-text">Øker tegneferdigheter</div>
          </div>
          <div className="stat-item">
            <div className="stat-illu"><img src="/assets/stat-bok.png" alt="" /></div>
            <div className="stat-num">x2</div>
            <div className="stat-text">Husker dobbelt så mye når du tegner det du skal lære deg</div>
          </div>
        </div>
      </section>

      <section className="book-cta" id="lage-boka">
        <div className="panel-visual" aria-hidden="true">
          <div className="stack"><img src="/assets/oppskrift-notatbok.png" alt="" /></div>
          <div className="stack two"><img src="/assets/oppskrift-lomme.png" alt="" /></div>
        </div>
        <div className="panel">
          <div style={{ fontFamily: "Kalam, sans-serif", color: "#fff", opacity: 0.85, marginBottom: 8, fontSize: 18 }}>
            — gjøres på 5 minutter —
          </div>
          <h3>Hvordan lage boka</h3>
          <p>
            Ti A4-ark, en stiftemaskin og en bordkant. Vi har laget tre oppskrifter:
            grunnboka, lommer for løse lapper, og utbrettbare sider for store skisser.
          </p>
          <Link href="/hvordan-lage-boka" className="btn">Slik lager du boken →</Link>
        </div>
      </section>

      <section className="opplegg-section" id="opplegg">
        <div className="inner">
          <div className="head">
            <div>
              <div className="hero-eyebrow">Velg et opplegg</div>
              <h2>Seks måter å fylle boka på.</h2>
            </div>
            <p>Hvert opplegg står på egne ben og kan kjøres i en eller flere skoletimer. Klikk inn for oppgave, læringsmål og utstyr.</p>
          </div>

          <div className="opplegg-grid">
            {opplegg.map((o) => (
              <Link className="opplegg-card" key={o.id} href={`/${o.slug}`}>
                <div className={`illu ${o.illuBg === "default" ? "" : o.illuBg}`}>
                  <img src={o.illustration} alt="" />
                </div>
                <div className="tags">
                  <span className={`tag ${o.tagColor === "default" ? "" : o.tagColor}`}>{o.tagLabel}</span>
                  <span className="tag">{o.duration}</span>
                </div>
                <div className="title">{o.title}</div>
                <div className="sub">{o.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="roadmap-section">
        <div className="head">
          <div>
            <div className="hero-eyebrow">Veikart</div>
            <h2>Det som kommer.</h2>
          </div>
          <p>Vi tegner roadmappen som en sketchnote i samme stil som resten av boka — kommer snart!</p>
        </div>

        <div className="roadmap-placeholder" aria-label="Roadmap-placeholder">
          <div className="pl-corner">— placeholder —</div>
          <div className="pl-inner">
            <div className="pl-icon">✎</div>
            <div className="pl-label">Roadmap kommer her</div>
            <div className="pl-caption">— tegnes for hånd som en sketchnote, i samme stil som resten av boka —</div>
          </div>
        </div>
      </section>

      <section className="home-eksempler-section">
        <div className="home-eksempler-inner">
          <div className="head">
            <div>
              <div className="hero-eyebrow">Fra klasserommet</div>
              <h2>Eksempler fra lærere</h2>
            </div>
            <p>Hva har elevene laget? Et utvalg sider, sketchnotes og notatbøker fra lærere som har testet oppleggene.</p>
          </div>
          <HomeExamples />
        </div>
      </section>

      <section className="feedback-section" id="feedback">
        <div className="feedback-inner">
          <div className="intro">
            <div className="hero-eyebrow" style={{ color: "var(--orange)" }}>Til læreren</div>
            <h2>Del erfaringene dine.</h2>
            <p>
              Brukte du et av oppleggene i klassen? Vi vil veldig gjerne høre hvordan
              det gikk — og se hva elevene laget. Tilbakemeldingene former neste
              versjon av KasseRommet.
            </p>
            <p>
              Du kan også laste opp bilder av elevbøker (med samtykke), så vi får vise
              fram det fineste på sikt.
            </p>
            <div className="tip">
              Tips: bilde av et helt oppslag funker fint — eller heng hele boka opp og fang flere sider i étt skudd.
            </div>
          </div>
          <FeedbackForm />
        </div>
      </section>
    </>
  );
}
