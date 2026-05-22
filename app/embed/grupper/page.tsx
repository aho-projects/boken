import { GroupBuilder } from "../../components/GroupBuilder";

export const metadata = { title: "Boken — Lag grupper" };

export default function EmbedGrupper() {
  return (
    <section className="embed-pad">
      <GroupBuilder />
    </section>
  );
}
