import { OppleggPage } from "../components/OppleggLayout";
import { AreaMap } from "../components/AreaMap";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Naturfag ute — Boken" };

export default function NaturfagUtePage() {
  const o = getOpplegg("naturfag");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Blyant og fargeblyanter", "Telefon for å ta bilde", "Mikroskop", "En liten pose for å samle"]}
      laeringsmaal={{
        udir: "Kompetansemål fra Udirs læreplan i naturfag (NAT01-04, etter 10. trinn)",
        items: [
          "Eleven skal kunne stille spørsmål og formulere hypoteser om naturfaglige fenomener, identifisere avhengige og uavhengige variabler og samle inn data for å finne svar.",
          "Eleven skal kunne analysere og bruke innsamlede data til å lage forklaringer, diskutere forklaringene i lys av relevant teori og vurdere kvaliteten på egne og andres utforskinger.",
          "Eleven skal kunne sammenligne celler i ulike organismer og beskrive sammenhengen mellom struktur og funksjon.",
          "Eleven skal kunne forklare hvordan fotosyntesen og celleånding produserer energi for alle levende organismer gjennom karbonkretsløpet.",
          "Eleven skal kunne bruke og lage modeller for å forutsi eller beskrive naturfaglige prosesser og systemer og forklare styrker og begrensninger ved modellene.",
          "Eleven skal kunne gi eksempler på aktuell forskning og forklare hvordan ny kunnskap genereres gjennom samarbeid og en kritisk tilnærming til eksisterende kunnskap.",
          "Eleven skal kunne utforske sammenhenger mellom abiotiske og biotiske faktorer i et økosystem og diskutere hvordan energi og materie omdannes i kretsløp.",
        ],
      }}
    >
      <section className="area-section">
        <h2>Hvor i nærmiljøet?</h2>
        <p className="sub">
          Slå opp skolen din eller bruk posisjonen din, så viser vi forslag til
          parker, skog og vann dere kan dra ut til. Data fra OpenStreetMap.
        </p>
        <AreaMap />
        <div className="area-types" aria-label="Type områder">
          <div className="area-chip"><span className="dot park" />Park / grøntområde</div>
          <div className="area-chip"><span className="dot skog" />Skog / trær</div>
          <div className="area-chip"><span className="dot vann" />Vann / dam / bekk</div>
        </div>
      </section>
    </OppleggPage>
  );
}
