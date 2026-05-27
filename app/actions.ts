"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

export type SubmitResult =
  | {
      ok: true;
      uploaded: number;
      attempted: number;
      supabase: boolean;
      uploadErrors?: string[];
    }
  | { ok: false; error: string };

export async function submitFeedback(formData: FormData): Promise<SubmitResult> {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return { ok: true, uploaded: 0, attempted: 0, supabase: false };
  }

  const mode = String(formData.get("form-mode") || "full");
  const name = String(formData.get("name") || "").trim();
  const school = String(formData.get("school") || "").trim();
  const rateRaw = formData.get("rate");
  const rate = rateRaw ? Number(rateRaw) : null;
  const notes = String(formData.get("notes") || "").trim();
  const wholeBookRaw = formData.get("whole-book");
  const wholeBook = wholeBookRaw === "on" || wholeBookRaw === "true";
  const opplegg = formData.getAll("opplegg").map(String).filter(Boolean);
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  console.log("[submitFeedback]", {
    mode,
    name,
    school,
    opplegg,
    wholeBook,
    fileCount: files.length,
    fileSizes: files.map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`),
  });

  const { data: feedbackInsert, error: feedbackError } = await supabase
    .from("feedback")
    .insert({
      mode,
      name: name || null,
      school: school || null,
      rate,
      notes: notes || null,
      opplegg,
      whole_book: wholeBook,
    })
    .select("id")
    .single();

  if (feedbackError) {
    console.error("[submitFeedback] feedback insert failed:", feedbackError);
    return { ok: false, error: `Kunne ikke lagre tilbakemelding: ${feedbackError.message}` };
  }

  const feedbackId = feedbackInsert?.id as string | undefined;
  let uploaded = 0;
  const uploadErrors: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = `${crypto.randomUUID()}.${ext}`;
    const path = `${new Date().toISOString().slice(0, 7)}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("examples")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      const msg = `${file.name}: ${uploadError.message}`;
      console.error("[submitFeedback] storage upload failed:", msg);
      uploadErrors.push(msg);
      continue;
    }

    const { data: publicData } = supabase.storage.from("examples").getPublicUrl(path);
    const url = publicData.publicUrl;

    for (const tag of opplegg.length ? opplegg : [null]) {
      const { error: rowError } = await supabase.from("examples").insert({
        feedback_id: feedbackId,
        opplegg: tag,
        url,
        storage_path: path,
        original_name: file.name,
        whole_book: wholeBook,
      });
      if (rowError) {
        console.error("[submitFeedback] examples insert failed:", rowError);
        uploadErrors.push(`${file.name} (DB row): ${rowError.message}`);
      } else {
        uploaded += 1;
      }
    }
  }

  revalidatePath("/");
  for (const tag of opplegg) {
    revalidatePath(`/${tag === "naturfag" ? "naturfag-ute" : tag}`);
  }

  return {
    ok: true,
    uploaded,
    attempted: files.length,
    supabase: true,
    uploadErrors: uploadErrors.length > 0 ? uploadErrors : undefined,
  };
}
