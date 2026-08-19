"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SUNUCU, uyelikAktif } from "../lib/ayarlar";
import { benKim } from "../lib/kimlik";

export default function Ust() {
  const [acik, setAcik] = useState(false);
  const [oturum, setOturum] = useState({ girisli: false });
  const yol = usePathname();

  useEffect(() => {
    if (!uyelikAktif) return;
    benKim().then(setOturum);
  }, [yol]);

  const kapat = () => setAcik(false);

  return (
    <header className="ust">
      <div className="kapsayici ust-ic">
        <Link href="/" className="logo" onClick={kapat}>
          <Image
            className="logo-resim"
            src="/logo-kucuk.png"
            alt=""
            width={512}
            height={514}
            priority
          />
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
            (oturum.girisli ? (
              <>
                <Link href="/sandik" onClick={kapat}>
                  Sandık
                </Link>
                <Link href="/panel" onClick={kapat}>
                  Hesabım
                </Link>
                {oturum.admin && (
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
