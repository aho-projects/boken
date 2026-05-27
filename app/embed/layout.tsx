import type { Metadata } from "next";
import { Manrope, Cabin } from "next/font/google";
import "../globals.css";
import "./embed.css";
import { EmbedResize } from "./EmbedResize";

// Manrope matches the WordPress Twenty Twenty-Five theme on kasserommet.no,
// so the embedded iframes blend into the WP page seamlessly.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
// Cabin kept as fallback for any inline `var(--font-cabin)` references in shared CSS.
const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cabin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boken — embed",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${manrope.variable} ${cabin.variable}`}>
      <body className="embed-body">
        <EmbedResize />
        <main className="embed-main">{children}</main>
      </body>
    </html>
  );
}
