"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUNUCU, uyelikAktif } from "../lib/ayarlar";
import { oturumOku } from "../lib/kimlik";
import { adminMi } from "../lib/veritabani";

export default function Ust() {
  const [acik, setAcik] = useState(false);
  const [girisli, setGirisli] = useState(false);
  const [admin, setAdmin] = useState(false);
  const yol = usePathname();

  useEffect(() => {
    if (!uyelikAktif) return;
    const oturum = oturumOku();
    setGirisli(Boolean(oturum));
    if (oturum) {
      adminMi().then(setAdmin).catch(() => setAdmin(false));
    } else {
      setAdmin(false);
    }
  }, [yol]);

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

          {uyelikAktif &&
            (girisli ? (
              <>
                <Link href="/panel" onClick={kapat}>
                  Hesabım
                </Link>
                {admin && (
                  <Link href="/yonetim" onClick={kapat}>
                    Yönetim
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/giris" onClick={kapat}>
                  Giriş yap
                </Link>
                <Link href="/kayit" onClick={kapat}>
                  Kayıt ol
                </Link>
              </>
            ))}

          <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme dugme-mor" onClick={kapat}>
            Discord
          </a>
        </nav>
      </div>
    </header>
  );
}
