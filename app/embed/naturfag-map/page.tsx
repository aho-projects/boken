import { AreaMap } from "../../components/AreaMap";

export const metadata = { title: "Boken — Naturfag-kart" };

export default function EmbedNaturfagMap() {
  return (
    <section className="area-section embed-pad">
      <AreaMap />
      <div className="area-types" aria-label="Type områder" style={{ marginTop: 16 }}>
        <div className="area-chip"><span className="dot park" />Park / grøntområde</div>
        <div className="area-chip"><span className="dot skog" />Skog / trær</div>
        <div className="area-chip"><span className="dot vann" />Vann / dam / bekk</div>
      </div>
    </section>
  );
}
