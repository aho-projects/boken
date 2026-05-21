import { OppleggPage } from "../components/OppleggLayout";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Bytte perspektiv — Boken" };

export default function BytteperspektivPage() {
  const o = getOpplegg("bytte-perspektiv");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Blyant", "Telefon / kamera"]}
      laeringsmaal={{
        udir: "Samfunnsfag og kunst og håndverk — kompetansemål kommer.",
        items: [],
      }}
    />
  );
}
