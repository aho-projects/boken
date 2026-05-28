"use client";

import { useState, useRef, useEffect } from "react";
import { createFeedback, attachExample } from "../actions";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Preview = { file: File; url: string };

export function FeedbackForm() {
  const [mode, setMode] = useState<"full" | "upload">("full");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [status, setStatus] = useState<
    null | { kind: "loading" | "success" | "error"; message: string }
  >(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  // iPhone photos default to HEIC, which browsers other than Safari can't
  // display. Convert HEIC → JPEG client-side before upload so the gallery
  // shows real images everywhere. We use heic-to (actively maintained libheif
  // wrapper) — heic2any v0.0.4 turned out to be unreliable in production.
  async function normalizeFile(f: File): Promise<File> {
    const isHeic =
      /\.(heic|heif)$/i.test(f.name) ||
      f.type === "image/heic" ||
      f.type === "image/heif" ||
      // iPhone Safari often sets type to "" or "application/octet-stream" for HEIC
      (f.type === "" && /\.(heic|heif)$/i.test(f.name));
    if (!isHeic) return f;

    console.log("[heic→jpeg] starting conversion of", f.name, "(", (f.size / 1024 / 1024).toFixed(2), "MB)");
    try {
      const { heicTo, isHeic: checkHeic } = await import("heic-to");
      // double-check it's actually HEIC bytes
      try {
        const actuallyHeic = await checkHeic(f);
        if (!actuallyHeic) {
          console.log("[heic→jpeg] file looked like HEIC by name/type but bytes say otherwise — using as-is");
          return f;
        }
      } catch {
        /* If the check throws, just try to convert anyway */
      }
      const converted = await heicTo({
        blob: f,
        type: "image/jpeg",
        quality: 0.85,
      });
      const newName = f.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
      const out = new File([converted], newName, { type: "image/jpeg" });
      console.log("[heic→jpeg] converted to", out.name, "(", (out.size / 1024 / 1024).toFixed(2), "MB)");
      return out;
    } catch (err) {
      console.error("[heic→jpeg] conversion FAILED, falling back to original HEIC file:", err);
      // Re-throw so handleFiles can show a user-visible error
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: Preview[] = [];
    const errors: string[] = [];
    // If any are HEIC, show a "Konverterer …" status while we work
    const hasHeic = Array.from(files).some(
      (f) => /\.(heic|heif)$/i.test(f.name) || f.type === "image/heic" || f.type === "image/heif",
    );
    if (hasHeic) {
      setStatus({ kind: "loading", message: "Konverterer iPhone-bilder (HEIC → JPEG) …" });
    }
    for (const raw of Array.from(files)) {
      if (!raw.type.startsWith("image/") && !/\.(heic|heif)$/i.test(raw.name)) continue;
      try {
        const f = await normalizeFile(raw);
        next.push({ file: f, url: URL.createObjectURL(f) });
      } catch (err) {
        errors.push(`${raw.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    setPreviews((prev) => [...prev, ...next]);
    if (errors.length > 0) {
      setStatus({
        kind: "error",
        message: `Klarte ikke å konvertere ${errors.length} HEIC-bilde${errors.length === 1 ? "" : "r"} — last gjerne opp som JPG fra telefonen din i stedet. Detaljer: ${errors.join("; ")}`,
      });
    } else if (hasHeic) {
      setStatus(null);
    }
  };

  const removePreview = (idx: number) => {
    setPreviews((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // "Last opp bok" mode = full book photo. "Del erfaring + bilder" = single
    // pages / general uploads. This replaces the explicit "Jeg har hengt hele
    // boka opp" checkbox — simpler UI, same outcome.
    const formMode = (String(fd.get("form-mode") || "full")) as "full" | "upload";
    const input = {
      mode: formMode,
      name: String(fd.get("name") || "").trim(),
      school: String(fd.get("school") || "").trim(),
      rate: fd.get("rate") ? Number(fd.get("rate")) : null,
      notes: String(fd.get("notes") || "").trim(),
      opplegg: fd.getAll("opplegg").map(String).filter(Boolean),
      wholeBook: formMode === "upload",
    };

    setStatus({ kind: "loading", message: "Sender inn …" });

    try {
      // Step 1: insert the feedback row. Always fast — no files involved.
      const feedbackRes = await createFeedback(input);
      if (!feedbackRes.ok) {
        setStatus({
          kind: "error",
          message: `Kunne ikke lagre tilbakemelding: ${feedbackRes.error}`,
        });
        return;
      }

      if (!feedbackRes.supabase) {
        setStatus({
          kind: "success",
          message:
            "Takk! (Supabase ikke konfigurert i dette miljøet — innholdet ditt ble ikke lagret, men skjemaet virker.)",
        });
        form.reset();
        setPreviews([]);
        setMode("full");
        return;
      }

      const feedbackId = feedbackRes.feedbackId;
      const filesToUpload = previews.length;

      // Step 2: upload files directly from the browser to Supabase Storage.
      // Bypasses the Vercel Server Action body limit entirely.
      let uploaded = 0;
      const uploadErrors: string[] = [];

      if (filesToUpload > 0 && feedbackId && isSupabaseConfigured()) {
        const sb = getSupabaseClient();
        if (!sb) {
          setStatus({
            kind: "error",
            message: "Supabase-klient ikke tilgjengelig. Last siden på nytt.",
          });
          return;
        }

        setStatus({
          kind: "loading",
          message: `Laster opp ${filesToUpload} bilde${filesToUpload === 1 ? "" : "r"} …`,
        });

        for (let i = 0; i < previews.length; i++) {
          const file = previews[i].file;
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const safeName = `${crypto.randomUUID()}.${ext}`;
          const path = `${new Date().toISOString().slice(0, 7)}/${safeName}`;

          setStatus({
            kind: "loading",
            message: `Laster opp bilde ${i + 1} av ${filesToUpload} (${(file.size / 1024 / 1024).toFixed(1)} MB) …`,
          });

          const { error: upErr } = await sb.storage
            .from("examples")
            .upload(path, file, {
              contentType: file.type || "application/octet-stream",
              upsert: false,
            });

          if (upErr) {
            console.error("[upload]", file.name, upErr);
            uploadErrors.push(`${file.name}: ${upErr.message}`);
            continue;
          }

          const { data: publicData } = sb.storage.from("examples").getPublicUrl(path);
          const url = publicData.publicUrl;

          // Step 3: stamp the example rows (one per opplegg tag) via server action.
          const attachRes = await attachExample({
            feedbackId,
            opplegg: input.opplegg,
            url,
            storagePath: path,
            originalName: file.name,
            wholeBook: input.wholeBook,
          });
          if (attachRes.ok) {
            uploaded += attachRes.inserted > 0 ? 1 : 0;
          } else {
            uploadErrors.push(`${file.name} (lagring i database): ${attachRes.error}`);
          }
        }
      }

      // Final status
      if (filesToUpload === 0) {
        setStatus({ kind: "success", message: "Takk for tilbakemeldingen!" });
      } else if (uploaded === filesToUpload) {
        setStatus({
          kind: "success",
          message: `Takk! Vi har lagret tilbakemeldingen og ${uploaded} bilde${uploaded === 1 ? "" : "r"}.`,
        });
      } else if (uploaded > 0) {
        setStatus({
          kind: "success",
          message: `Takk! ${uploaded} av ${filesToUpload} bilder ble lagret. ${uploadErrors.length > 0 ? "Feil: " + uploadErrors.join("; ") : ""}`,
        });
      } else {
        setStatus({
          kind: "error",
          message: `Tilbakemeldingen ble lagret, men ingen av ${filesToUpload} bildene ble lastet opp. ${uploadErrors.join("; ")}`,
        });
        return;
      }

      form.reset();
      setPreviews([]);
      setMode("full");
    } catch (err) {
      console.error("[FeedbackForm] submit error:", err);
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Noe gikk galt.",
      });
    }
  };

  return (
    <form className="feedback-form" ref={formRef} onSubmit={onSubmit} data-mode={mode}>
      <div className="grid">
        <div className="field">
          <label htmlFor="name">Navn</label>
          <input id="name" name="name" type="text" placeholder="Ola Normann" />
        </div>
        <div className="field">
          <label htmlFor="school">Skole</label>
          <input id="school" name="school" type="text" placeholder="Eksempel ungdomsskole" />
        </div>
        <div className="field full">
          <label>Hva vil du sende inn?</label>
          <div className="form-choice">
            <input
              type="radio"
              name="form-mode"
              value="full"
              id="mode-full"
              checked={mode === "full"}
              onChange={() => setMode("full")}
            />
            <label htmlFor="mode-full">
              <strong>Del erfaring + bilder</strong>
              <span>Skriv om hvordan opplegget gikk og last opp elevarbeid</span>
              <span className="check" />
            </label>
            <input
              type="radio"
              name="form-mode"
              value="upload"
              id="mode-upload"
              checked={mode === "upload"}
              onChange={() => setMode("upload")}
            />
            <label htmlFor="mode-upload">
              <strong>Last opp bok</strong>
              <span>Bare bilder av en utfylt bok — raskere</span>
              <span className="check" />
            </label>
          </div>
        </div>
        <div className="field full">
          <label>
            Hvilke opplegg brukte du?{" "}
            <span
              style={{
                fontWeight: 400,
                color: "rgba(255,255,255,.6)",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 13,
              }}
            >
              — huk av flere
            </span>
          </label>
          <div className="opplegg-chips">
            {[
              ["naturfag", "Naturfag"],
              ["sketchnoting", "Sketchnoting"],
              ["ut-og-titte", "Ut og titte"],
              ["isberg", "Isberg"],
              ["bytte-perspektiv", "Bytte perspektiv"],
              ["hjemmelagde-kilden", "Den hjemmelagde kilden"],
            ].map(([value, label]) => (
              <label key={value}>
                <input type="checkbox" name="opplegg" value={value} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {mode === "full" && (
          <>
            <div className="field full">
              <label>Hvordan gikk det? (1 = dårlig, 5 = supert)</label>
              <div className="rate-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n}>
                    <input type="radio" name="rate" value={n} />
                    <span>{n}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="field full">
              <label htmlFor="notes">Fortell oss om opplevelsen</label>
              <textarea id="notes" name="notes" placeholder="Hva fungerte? Hva ville du endret?" />
            </div>
          </>
        )}

        <div className="field full">
          <label>
            Last opp bilder av elevarbeid
            {mode === "full" && (
              <span
                style={{
                  fontWeight: 400,
                  color: "rgba(255,255,255,.6)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 13,
                }}
              >
                {" "}— frivillig
              </span>
            )}
          </label>
          <label
            className={`upload${previews.length ? " has-files" : ""}`}
            htmlFor="files-input"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFiles(e.dataTransfer.files);
            }}
            style={{ cursor: "pointer", display: "block" }}
          >
            <strong>Dra og slipp bilder her</strong>
            eller klikk for å velge filer · JPG/PNG, opptil ca. 50 MB pr fil
            <input
              id="files-input"
              type="file"
              name="files"
              accept="image/*,.heic,.heif"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.currentTarget.files)}
            />
          </label>
          {previews.length > 0 && (
            <div className="upload-previews">
              {previews.map((p, i) => (
                <div className="prev" key={i}>
                  <img src={p.url} alt="" />
                  <button
                    type="button"
                    aria-label="Fjern bilde"
                    onClick={() => removePreview(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <button type="submit" disabled={status?.kind === "loading"}>
        {status?.kind === "loading"
          ? "Sender …"
          : mode === "full"
          ? "Send inn tilbakemelding"
          : "Last opp bok"}
      </button>
      {status && status.kind !== "loading" && (
        <div className={`form-status ${status.kind}`}>{status.message}</div>
      )}
      {status?.kind === "loading" && (
        <div className="form-status loading">{status.message}</div>
      )}
    </form>
  );
}
