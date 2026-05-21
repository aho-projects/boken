import { OppleggPage } from "../components/OppleggLayout";
import { getOpplegg } from "../data/opplegg";

export const metadata = { title: "Isberg — Boken" };

export default function IsbergPage() {
  const o = getOpplegg("isberg");
  return (
    <OppleggPage
      opplegg={o}
      utstyrItems={["Boken", "Blyant og tusj"]}
      laeringsmaal={{
        udir: "Samfunnsfag — kompetansemål kommer.",
        items: [],
      }}
    />
  );
}
