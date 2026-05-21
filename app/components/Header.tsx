"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="kr-header">
      <Link className="kr-logo" href="/" aria-label="Boken — til forsiden">
        <img className="f-closed" src="/assets/logo-closed.png" alt="" />
        <img className="f-opening" src="/assets/logo-opening.png" alt="" />
        <img className="f-open" src="/assets/logo-open.png" alt="" />
      </Link>
      <nav className="kr-nav">
        <Link href="/" className={isActive("/") && pathname === "/" ? "active" : ""}>
          Hjem
        </Link>
        <Link href="/#opplegg">Opplegg</Link>
        <Link href="/hvordan-lage-boka" className={isActive("/hvordan-lage-boka") ? "active" : ""}>
          Hvordan lage boka
        </Link>
        <Link href="/grupper" className={isActive("/grupper") ? "active" : ""}>
          Grupper
        </Link>
        <Link href="/#feedback">Del erfaringer</Link>
        <Link href="/hvordan-lage-boka" className="cta">
          Lag boka
        </Link>
      </nav>
    </header>
  );
}
