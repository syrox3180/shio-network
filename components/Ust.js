"use client";

import { useState } from "react";
import Link from "next/link";
import { SUNUCU, uyelikAktif } from "../lib/ayarlar";

export default function Ust() {
  const [acik, setAcik] = useState(false);
  const kapat = () => setAcik(false);

  return (
    <header className="ust">
      <div className="kapsayici ust-ic">
        <Link href="/" className="logo" onClick={kapat}>
          <span className="logo-kup" aria-hidden="true" />
          SHIO <span>NETWORK</span>
        </Link>

        <button
          className="menu-ac"
          onClick={() => setAcik((v) => !v)}
          aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={acik}
        >
          {acik ? "✕" : "☰"}
        </button>

        <nav className={acik ? "menu acik" : "menu"}>
          <Link href="/" onClick={kapat}>
            Ana sayfa
          </Link>
          <Link href="/magaza" onClick={kapat}>
            Mağaza
          </Link>
          {uyelikAktif && (
            <Link href="/panel" onClick={kapat}>
              Hesabım
            </Link>
          )}
          <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme dugme-mor" onClick={kapat}>
            Discord
          </a>
        </nav>
      </div>
    </header>
  );
}
