import { OppleggPage } from "../components/OppleggLayout";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Ut og titte — Boken" };

export default function UtOgTittePage() {
  const o = getOpplegg("ut-og-titte");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Blyant", "Ev. en time uten mobil"]}
      laeringsmaal={{
        udir: "Tverrfaglig — kompetansemål kommer.",
        items: [],
      }}
    />
  );
}
