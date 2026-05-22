import type { Metadata } from "next";
import { Cabin, Kalam } from "next/font/google";
import "../globals.css";
import { EmbedResize } from "./EmbedResize";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cabin",
  display: "swap",
});
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boken — embed",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${cabin.variable} ${kalam.variable}`}>
      <body className="embed-body">
        <EmbedResize />
        <main className="embed-main">{children}</main>
      </body>
    </html>
  );
}
