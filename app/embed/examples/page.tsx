import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Boken — Eksempler fra lærere" };

type ExampleRow = {
  id: string;
  url: string | null;
  opplegg: string | null;
  original_name: string | null;
  whole_book: boolean | null;
  created_at: string | null;
  feedback?: { name: string | null; school: string | null } | null;
};

const oppleggLabel: Record<string, string> = {
  naturfag: "Naturfag",
  sketchnoting: "Sketchnoting",
  "ut-og-titte": "Ut og titte",
  isberg: "Isberg",
  "bytte-perspektiv": "Bytte perspektiv",
  "hjemmelagde-kilden": "Den hjemmelagde kilden",
};

// Static fallback shown when Supabase isn't configured / no rows yet
const PLACEHOLDER_ROWS: Array<{ name: string; meta: string }> = [
  { name: "Det visuelle alfabetet", meta: "Sketchnoting — 9. trinn" },
  { name: "Feltarbeid om mose", meta: "Naturfag — 8. trinn" },
  { name: "Isberg om mobbing", meta: "Samfunn — 10. trinn" },
  { name: "Intervju med bestemor", meta: "Den hjemmelagde kilden — 9. trinn" },
];

export default async function EmbedExamples({
  searchParams,
}: {
  searchParams: Promise<{ opplegg?: string; mode?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const oppleggFilter = params.opplegg?.trim() || null;
  // When mode=fullbooks we only show full-spread photos (used on WP homepage gallery)
  const fullBooksOnly = params.mode === "fullbooks";
  const limit = Math.min(48, Math.max(4, Number(params.limit) || 24));

  const supabase = await getSupabaseServer();

  let rows: ExampleRow[] = [];
  if (supabase) {
    let query = supabase
      .from("examples")
      .select("id, url, opplegg, original_name, whole_book, created_at, feedback:feedback_id(name, school)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (oppleggFilter) query = query.eq("opplegg", oppleggFilter);
    if (fullBooksOnly) query = query.eq("whole_book", true);
    const { data, error } = await query;
    if (!error && data) rows = data as unknown as ExampleRow[];
  }

  const title = oppleggFilter
    ? `Eksempler fra ${oppleggLabel[oppleggFilter] ?? oppleggFilter}`
    : fullBooksOnly
    ? "Eksempler fra lærere — fulle bøker"
    : "Eksempler fra lærere";

  const subtitle = oppleggFilter
    ? `Slik har andre klasser løst opplegget. Last opp dine egne via skjemaet på hovedsiden.`
    : `Et utvalg sider, sketchnotes og notatbøker fra lærere som har testet oppleggene.`;

  return (
    <section className="examples-embed">
      <header className="examples-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {rows.length > 0 ? (
        <div className="examples-grid">
          {rows.map((r) => {
            const oppleggName = r.opplegg ? oppleggLabel[r.opplegg] ?? r.opplegg : "Elevarbeid";
            const credit = [r.feedback?.school, r.feedback?.name].filter(Boolean).join(" · ");
            return (
              <article className="example-card" key={r.id}>
                <div className={`example-img${r.url ? " has-img" : ""}`}>
                  {r.url ? (
                    <img src={r.url} alt={r.original_name ?? "Elevarbeid"} loading="lazy" />
                  ) : (
                    <span>Bilde av elevarbeid</span>
                  )}
                </div>
                <div className="example-body">
                  <div className="example-name">
                    {r.original_name?.replace(/\.[^.]+$/, "") ?? "Elevarbeid"}
                  </div>
                  <div className="example-meta">
                    {oppleggName}
                    {credit ? ` — ${credit}` : ""}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="examples-empty">
          <strong>Ingen eksempler ennå</strong>
          <p>
            Bli den første — last opp bilder via skjemaet på{" "}
            <Link href="/#feedback">forsiden</Link>.
          </p>
          {!supabase && (
            <p className="examples-fallback">
              {/* Soft placeholder grid so the layout doesn't collapse */}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
