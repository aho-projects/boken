import { OppleggPage } from "../components/OppleggLayout";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Den hjemmelagde kilden — Boken" };

export default function HjemmelagdeKildenPage() {
  const o = getOpplegg("hjemmelagde-kilden");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Blyant", "Lydopptaker / telefon for intervju"]}
      laeringsmaal={{
        udir: "Samfunnsfag og norsk — kompetansemål kommer.",
        items: [],
      }}
    />
  );
}
