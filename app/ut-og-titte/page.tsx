import { OppleggPage } from "../components/OppleggLayout";
import { UtOgTitteMap } from "../components/UtOgTitteMap";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Ut og titte — Boken" };

export default function UtOgTittePage() {
  const o = getOpplegg("ut-og-titte");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Blyant", "Telefon for kartet", "Ev. en time uten distraksjoner"]}
      laeringsmaal={{
        udir: "Tverrfaglig — kompetansemål kommer.",
        items: [
          "Eleven skal kunne observere og notere ned natur- og menneskeskapte fenomener i nærmiljøet sitt.",
          "Eleven skal kunne legge merke til hvor språk dukker opp i hverdagen — skilt, klistremerker, reklame.",
          "Eleven skal kunne sammenligne sine egne observasjoner med medelevers, og diskutere hvorfor de la merke til ulike ting.",
        ],
      }}
    >
      <section className="area-section">
        <h2>Hvor får dere lov til å gå?</h2>
        <p className="sub">
          Trykk «Finn meg» — kartet tegner en sirkel rundt dere. Det er deres område for denne timen.
          Bruk listene under til å huke av det dere finner. Tegn det fineste i boka.
        </p>
        <UtOgTitteMap />
      </section>
    </OppleggPage>
  );
}
