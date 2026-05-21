import Link from "next/link";

export function Footer() {
  return (
    <footer className="kr-footer">
      <div className="kr-footer-inner">
        <div className="kr-footer-brand">
          <div className="wordmark">Boken</div>
          <p className="tagline">Tegn det. Da sitter det.</p>
          <p className="credits">
            Et av oppleggene i KasseRommet, et designprosjekt med GK2-studenter ved
            Arkitektur- og designhøgskolen i Oslo, vår 2026.
          </p>
        </div>
        <div className="kr-footer-col">
          <h4>Opplegg</h4>
          <ul>
            <li><Link href="/naturfag-ute">Naturfag</Link></li>
            <li><Link href="/sketchnoting">Sketchnoting</Link></li>
            <li><Link href="/ut-og-titte">Ut og titte</Link></li>
            <li><Link href="/isberg">Isberg</Link></li>
            <li><Link href="/bytte-perspektiv">Bytte perspektiv</Link></li>
            <li><Link href="/hjemmelagde-kilden">Den hjemmelagde kilden</Link></li>
          </ul>
        </div>
        <div className="kr-footer-col">
          <h4>Kom i gang</h4>
          <ul>
            <li><Link href="/hvordan-lage-boka">Hvordan lage boka</Link></li>
            <li><Link href="/grupper">Lag grupper</Link></li>
            <li><Link href="/#feedback">Del erfaringer</Link></li>
            <li><a href="mailto:silin7698@aho.no">Kontakt oss</a></li>
            <li><Link href="/for-laerere">For lærere</Link></li>
            <li><Link href="/personvern">Personvern</Link></li>
          </ul>
        </div>
      </div>
      <div className="kr-footer-bottom">
        <div>© 2026 Boken · GK2 / AHO · Julie, Maria, Hilde og Simon</div>
      </div>
    </footer>
  );
}
