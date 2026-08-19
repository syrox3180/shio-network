"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SUNUCU } from "../lib/ayarlar";
import DiscordSayac from "./DiscordSayac";

/* Tıklayınca kopyalanan, blok gibi "kırılan" IP kutusu */
function IpKutusu() {
  const [kopyalandi, setKopyalandi] = useState(false);

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(SUNUCU.adres);
    } catch {
      const alan = document.createElement("textarea");
      alan.value = SUNUCU.adres;
      document.body.appendChild(alan);
      alan.select();
      document.execCommand("copy");
      document.body.removeChild(alan);
    }
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 1800);
  };

  return (
    <button
      className={kopyalandi ? "ip-kutu kirildi" : "ip-kutu"}
      onClick={kopyala}
      aria-label={`Sunucu adresini kopyala: ${SUNUCU.adres}`}
    >
      <span>
        <span className="ip-etiket">{kopyalandi ? "Kopyalandı" : "Sunucu adresi"}</span>
        <span className="ip-adres">{SUNUCU.adres}</span>
      </span>
      <span className="ip-ikon" aria-hidden="true">
        {kopyalandi ? "✓" : "⧉"}
      </span>
    </button>
  );
}

/* Canlı oyuncu sayısı */
function DurumKutusu() {
  const [durum, setDurum] = useState(null);

  useEffect(() => {
    let iptal = false;
    const cek = async () => {
      try {
        const res = await fetch("/api/durum");
        const veri = await res.json();
        if (!iptal) setDurum(veri);
      } catch {
        if (!iptal) setDurum({ online: false });
      }
    };
    cek();
    const zamanlayici = setInterval(cek, 60000);
    return () => {
      iptal = true;
      clearInterval(zamanlayici);
    };
  }, []);

  const acik = durum?.online;

  return (
    <div className="durum-kutu">
      <span className="durum-ust">
        <span className={acik ? "nokta acik" : "nokta"} />
        {durum === null ? "Kontrol ediliyor" : acik ? "Sunucu açık" : "Sunucu kapalı"}
      </span>
      <span className="durum-sayi">
        {acik ? durum.oyuncu : "—"}
        {acik && <small> / {durum.maks} oyuncu</small>}
      </span>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="kapsayici hero-ic">
        <div className="hero-logo">
          <Image
            src="/logo.png"
            alt={`${SUNUCU.ad} logosu`}
            width={800}
            height={802}
            priority
            sizes="(max-width: 720px) 200px, 260px"
          />
        </div>

        <p className="gozkasi">Türk boxmining sunucusu · {SUNUCU.surum}</p>

        <h1 className="baslik-xl">
          Kaz. Sat.
          <br />
          <span className="vurgu-kelime">Yüksel.</span>
        </h1>

        <p className="giris">{SUNUCU.aciklama}</p>

        <div className="ip-alan">
          <IpKutusu />
          <DurumKutusu />
          <DiscordSayac kutu />
        </div>

        <div className="hero-alt">
          <Link href="/magaza" className="dugme dugme-vurgu">
            VIP paketleri
          </Link>
          <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme">
            Discord'a katıl
          </a>
        </div>

        <div className="rozet-satir">
          <span>
            <strong>Sürüm</strong> · {SUNUCU.surum}
          </span>
          <span>
            <strong>Konum</strong> · Türkiye
          </span>
          <span>
            <strong>Mod</strong> · Boxmining
          </span>
        </div>
      </div>
    </section>
  );
}
