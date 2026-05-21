import { OppleggPage } from "../components/OppleggLayout";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Sketchnoting — Boken" };

export default function SketchnotingPage() {
  const o = getOpplegg("sketchnoting");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Tynn tusj / fineliner", "Blyant", "Fargeblyanter (valgfritt)"]}
      laeringsmaal={{
        udir: "Tverrfaglig — kompetansemål fra norsk, kunst og håndverk og digitale ferdigheter.",
        items: [
          "Eleven skal kunne ta notater visuelt og kombinere tekst og bilde for å forstå og huske et fagstoff.",
          "Eleven skal kunne bruke fem grunnformer (sirkel, firkant, trekant, strek, prikk) til å tegne ikoner og enkle illustrasjoner.",
          "Eleven skal kunne lage en sketchnote som oppsummerer en muntlig presentasjon eller en tekst.",
        ],
      }}
    />
  );
}
