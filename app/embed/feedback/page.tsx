import { FeedbackForm } from "../../components/FeedbackForm";

export const metadata = { title: "Boken — Tilbakemelding" };

export default function EmbedFeedback() {
  return (
    <section className="embed-pad feedback-section" style={{ background: "transparent", color: "var(--ink)", padding: "24px 0" }}>
      <FeedbackForm />
    </section>
  );
}
