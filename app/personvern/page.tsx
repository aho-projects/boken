import Link from "next/link";

export const metadata = { title: "Personvern — Boken" };

export default function PersonvernPage() {
  return (
    <main className="opplegg-page">
      <div className="crumb">
        <Link href="/">Hjem</Link> &nbsp;/&nbsp; Personvern
      </div>
      <h1 className="opplegg-title">Personvern</h1>
      <div className="opplegg-sub">— hva vi lagrer, og hva vi ikke gjør —</div>

      <section className="desc-card yellow">
        <h2>Kort oppsummert</h2>
        <p>
          Vi lagrer bare det du selv skriver i feedback-skjemaet, og bildene
          du selv laster opp. Vi har ingen sporing, ingen cookies, og ingen
          tredjepartsanalytics.
        </p>
      </section>

      <section style={{ marginTop: 56 }}>
        <h2 className="h-section" style={{ marginBottom: 18 }}>Bilder av elevarbeid</h2>
        <p>
          Last bare opp bilder der ingen elev kan identifiseres — eller der du har
          samtykke fra elev og foresatte. Vi bruker bildene til å vise eksempler
          på siden og til å videreutvikle oppleggene. Du kan be oss slette et
          bilde ved å sende en e-post til <a href="mailto:silin7698@aho.no" style={{ textDecoration: "underline" }}>silin7698@aho.no</a>.
        </p>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 className="h-section" style={{ marginBottom: 18 }}>Kart</h2>
        <p>
          Kartet på naturfag-sida bruker OpenStreetMap. Om du klikker «Finn meg»
          spør vi nettleseren din om posisjon. Den brukes kun lokalt for å sette
          kartet — vi sender ikke posisjonen din videre.
        </p>
      </section>

      <div className="continue" style={{ marginTop: 56 }}>
        <Link className="next" href="/">← Tilbake til forsiden</Link>
        <Link className="next" href="/for-laerere">For lærere →</Link>
      </div>
    </main>
  );
}
