"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

// =============================================================================
// FEEDBACK + EXAMPLES SERVER ACTIONS
// -----------------------------------------------------------------------------
// Important: we do NOT receive file blobs through Server Actions anymore.
// Vercel's platform caps Server Action bodies at 4.5 MB on the Hobby tier
// (and Next.js Server Actions default to 1 MB) — phone photos blow through
// that and the upload would silently fail with "an unexpected error from the
// server". Instead, files upload directly from the browser to Supabase
// Storage using the anon key + RLS policies we set up, and these actions
// only handle the lightweight metadata.
// =============================================================================

export type CreateFeedbackInput = {
  mode: "full" | "upload";
  name: string;
  school: string;
  rate: number | null;
  notes: string;
  opplegg: string[];
  wholeBook: boolean;
};

export type CreateFeedbackResult =
  | { ok: true; feedbackId: string | null; supabase: boolean }
  | { ok: false; error: string };

/** Insert the feedback row. Returns the row ID so the client can link uploads to it. */
export async function createFeedback(
  input: CreateFeedbackInput,
): Promise<CreateFeedbackResult> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { ok: true, feedbackId: null, supabase: false };

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      mode: input.mode,
      name: input.name || null,
      school: input.school || null,
      rate: input.rate,
      notes: input.notes || null,
      opplegg: input.opplegg,
      whole_book: input.wholeBook,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createFeedback] insert failed:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, feedbackId: (data?.id as string) ?? null, supabase: true };
}

export type AttachExampleInput = {
  feedbackId: string;
  opplegg: string[]; // tags that should each get an examples row
  url: string;
  storagePath: string;
  originalName: string;
  wholeBook: boolean;
};

export type AttachExampleResult =
  | { ok: true; inserted: number }
  | { ok: false; error: string };

/** Insert one or more `examples` rows pointing at a file already in Supabase Storage. */
export async function attachExample(
  input: AttachExampleInput,
): Promise<AttachExampleResult> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { ok: true, inserted: 0 };

  const tags = input.opplegg.length ? input.opplegg : [null];
  let inserted = 0;
  for (const tag of tags) {
    const { error } = await supabase.from("examples").insert({
      feedback_id: input.feedbackId,
      opplegg: tag,
      url: input.url,
      storage_path: input.storagePath,
      original_name: input.originalName,
      whole_book: input.wholeBook,
    });
    if (error) {
      console.error("[attachExample] insert failed:", error);
      return { ok: false, error: error.message };
    }
    inserted += 1;
  }

  revalidatePath("/");
  for (const tag of input.opplegg) {
    revalidatePath(`/${tag === "naturfag" ? "naturfag-ute" : tag}`);
  }
  return { ok: true, inserted };
}
