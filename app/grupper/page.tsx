import Link from "next/link";
import { GroupBuilder } from "../components/GroupBuilder";

export const metadata = { title: "Lag grupper — Boken" };

export default function GrupperPage() {
  return (
    <main className="grupper-page">
      <div className="crumb">
        <Link href="/">Hjem</Link> &nbsp;/&nbsp; Grupper
      </div>

      <h1 className="opplegg-title">Lag grupper</h1>
      <div className="opplegg-sub">— stokk klassen i tilfeldige grupper på 2–5 elever —</div>

      <section className="desc-card yellow" style={{ marginBottom: 28 }}>
        <h2>Slik bruker du det</h2>
        <p>
          Lim inn navnelista — ett navn per linje — eller bare skriv inn hvor mange
          elever klassen din har. Velg gruppestørrelse, og trykk «Lag grupper».
          Klikk «Stokk på nytt» til dere er fornøyd, eller skriv ut resultatet.
        </p>
      </section>

      <GroupBuilder />

      <div className="continue" style={{ marginTop: 56 }}>
        <Link className="next" href="/">← Tilbake til forsiden</Link>
        <Link className="next" href="/naturfag-ute">Naturfag ute →</Link>
      </div>
    </main>
  );
}
