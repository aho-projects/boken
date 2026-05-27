import type { Metadata } from "next";
import { Cabin, Caveat } from "next/font/google";
import "../globals.css";
import "./embed.css";
import { EmbedResize } from "./EmbedResize";

// Cabin = body type (matches the public Boken site).
const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cabin",
  display: "swap",
});
// Caveat = web fallback for Bradley Hand. Bradley Hand only exists on macOS,
// so we use it when present and fall back to Caveat (similar wavy hand-written
// vibe) everywhere else.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boken — embed",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${cabin.variable} ${caveat.variable}`}>
      <body className="embed-body">
        <EmbedResize />
        <main className="embed-main">{children}</main>
      </body>
    </html>
  );
}
