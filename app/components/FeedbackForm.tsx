"use client";

import { useState, useRef, useEffect } from "react";
import { submitFeedback, type SubmitResult } from "../actions";

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

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: Preview[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      next.push({ file: f, url: URL.createObjectURL(f) });
    }
    setPreviews((prev) => [...prev, ...next]);
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
    // ensure files come from our previews list (filtered to images)
    fd.delete("files");
    for (const p of previews) fd.append("files", p.file);

    setStatus({ kind: "loading", message: "Sender inn …" });
    try {
      const result: SubmitResult = await submitFeedback(fd);
      if (!result.ok) {
        setStatus({ kind: "error", message: result.error });
        return;
      }
      if (!result.supabase) {
        setStatus({
          kind: "success",
          message:
            "Takk! (Supabase ikke konfigurert i dette miljøet — innholdet ditt ble ikke lagret, men skjemaet virker.)",
        });
      } else if (result.uploaded > 0) {
        setStatus({
          kind: "success",
          message: `Takk! Vi har lagret tilbakemeldingen og ${result.uploaded} bilde${result.uploaded === 1 ? "" : "r"}.`,
        });
      } else {
        setStatus({ kind: "success", message: "Takk for tilbakemeldingen!" });
      }
      form.reset();
      setPreviews([]);
      setMode("full");
    } catch (err) {
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
            eller klikk for å velge filer · JPG/PNG, maks 10 MB
            <input
              id="files-input"
              type="file"
              name="files"
              accept="image/*"
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
          <label className="upload-option" style={{ marginTop: 14 }}>
            <input type="checkbox" name="whole-book" />
            <span>
              <strong>Jeg har hengt hele boka opp og tatt fullbilde</strong>
              <span>(da blir hele oppslaget vist på samme kort)</span>
            </span>
          </label>
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
    </form>
  );
}
