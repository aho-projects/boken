import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { opplegg as oppleggList, type OppleggId } from "../data/opplegg";

type ExampleRow = {
  id: string;
  url: string | null;
  opplegg: string | null;
  original_name: string | null;
  created_at: string | null;
  feedback?: { name: string | null; school: string | null } | null;
};

const oppleggSlug: Record<string, string> = {
  naturfag: "/naturfag-ute",
  sketchnoting: "/sketchnoting",
  "ut-og-titte": "/ut-og-titte",
  isberg: "/isberg",
  "bytte-perspektiv": "/bytte-perspektiv",
  "hjemmelagde-kilden": "/hjemmelagde-kilden",
};

const oppleggLabel: Record<string, string> = {
  naturfag: "Naturfag",
  sketchnoting: "Sketchnoting",
  "ut-og-titte": "Ut og titte",
  isberg: "Isberg",
  "bytte-perspektiv": "Bytte perspektiv",
  "hjemmelagde-kilden": "Den hjemmelagde kilden",
};

async function fetchExamples(opts: { opplegg?: OppleggId; limit: number }) {
  const supabase = await getSupabaseServer();
  if (!supabase) return [] as ExampleRow[];

  let query = supabase
    .from("examples")
    .select("id, url, opplegg, original_name, created_at, feedback:feedback_id(name, school)")
    .order("created_at", { ascending: false })
    .limit(opts.limit);

  if (opts.opplegg) query = query.eq("opplegg", opts.opplegg);

  const { data, error } = await query;
  if (error || !data) return [] as ExampleRow[];
  return data as unknown as ExampleRow[];
}

export async function PerOppleggExamples({ opplegg }: { opplegg: OppleggId }) {
  const rows = await fetchExamples({ opplegg, limit: 6 });

  if (rows.length === 0) {
    return (
      <div className="eks-students-empty">
        <strong>Ingen elev-eksempler ennå</strong>
        Bli den første — last opp bilder via skjemaet på{" "}
        <Link href="/#feedback" style={{ textDecoration: "underline" }}>
          forsiden
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="eks-students-grid">
      {rows.map((r) => (
        <div className="eks-stu-card" key={r.id}>
          <div className={`img${r.url ? " has-img" : ""}`}>
            {r.url ? <img src={r.url} alt={r.original_name ?? ""} /> : "Bilde av elevarbeid"}
          </div>
          <div className="body">
            <div className="name">{r.original_name?.replace(/\.[^.]+$/, "") ?? "Elevarbeid"}</div>
            <div className="by">
              {[r.feedback?.school, r.feedback?.name].filter(Boolean).join(" · ") || "Anonym lærer"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export async function HomeExamples() {
  const rows = await fetchExamples({ limit: 24 });

  // Random cross-section across opplegg
  const shuffled = [...rows].sort(() => Math.random() - 0.5).slice(0, 4);

  if (shuffled.length === 0) {
    // Show the seeded placeholders from the original site
    return (
      <div className="home-eks-grid">
        {[
          {
            href: "/sketchnoting",
            name: "Det visuelle alfabetet",
            meta: "Sketchnoting — 9. trinn",
          },
          {
            href: "/naturfag-ute",
            name: "Feltarbeid om mose",
            meta: "Naturfag — 8. trinn",
          },
          { href: "/isberg", name: "Isberg om mobbing", meta: "Samfunn — 10. trinn" },
          {
            href: "/hjemmelagde-kilden",
            name: "Intervju med bestemor",
            meta: "Den hjemmelagde kilden — 9. trinn",
          },
        ].map((card) => (
          <Link className="home-eks-card" href={card.href} key={card.name}>
            <div className="img">Bilde av elevarbeid</div>
            <div className="body">
              <div className="name">{card.name}</div>
              <div className="meta">{card.meta}</div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="home-eks-grid">
      {shuffled.map((r) => {
        const slug = r.opplegg && oppleggSlug[r.opplegg] ? oppleggSlug[r.opplegg] : "/";
        const label = r.opplegg && oppleggLabel[r.opplegg] ? oppleggLabel[r.opplegg] : "Elevarbeid";
        return (
          <Link className="home-eks-card" href={slug} key={r.id}>
            <div className={`img${r.url ? " has-img" : ""}`}>
              {r.url ? (
                <img src={r.url} alt={r.original_name ?? ""} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              ) : (
                "Bilde av elevarbeid"
              )}
            </div>
            <div className="body">
              <div className="name">{r.original_name?.replace(/\.[^.]+$/, "") ?? "Elevarbeid"}</div>
              <div className="meta">{label} — {r.feedback?.school ?? "Anonym skole"}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export { oppleggList };
