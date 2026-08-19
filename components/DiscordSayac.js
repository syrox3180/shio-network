"use client";

import { useEffect, useState } from "react";
import { SUNUCU } from "../lib/ayarlar";

/*
  Discord üye sayacı — 60 saniyede bir kendini yeniler.
  Sekme arka plandayken istek atmaz, kullanıcı geri dönünce hemen tazeler.
*/
export default function DiscordSayac({ kutu = false }) {
  const [veri, setVeri] = useState(null);

  useEffect(() => {
    let iptal = false;

    const cek = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/discord", { cache: "no-store" });
        const gelen = await res.json();
        if (!iptal) setVeri(gelen);
      } catch {
        if (!iptal) setVeri({ toplam: null, online: null });
      }
    };

    cek();
    const zamanlayici = setInterval(cek, 60000);
    const gorunurluk = () => {
      if (!document.hidden) cek();
    };
    document.addEventListener("visibilitychange", gorunurluk);

    return () => {
      iptal = true;
      clearInterval(zamanlayici);
      document.removeEventListener("visibilitychange", gorunurluk);
    };
  }, []);

  const yukleniyor = veri === null;
  const toplam = veri?.toplam;
  const online = veri?.online;
  const ulasildi = toplam !== null && toplam !== undefined;

  const sayiYaz = (s) => (typeof s === "number" ? s.toLocaleString("tr-TR") : "—");

  /* Hero'daki kutu görünümü */
  if (kutu) {
    return (
      <a
        href={SUNUCU.discord}
        target="_blank"
        rel="noreferrer"
        className="durum-kutu discord-kutu"
        aria-label="Discord sunucusuna katıl"
      >
        <span className="durum-ust">
          <span className="nokta acik" />
          Discord
        </span>
        <span className="durum-sayi">
          {yukleniyor ? "…" : sayiYaz(ulasildi ? toplam : online)}
          <small>
            {" "}
            {ulasildi ? "üye" : "çevrimiçi"}
            {typeof online === "number" && ulasildi ? ` · ${sayiYaz(online)} aktif` : ""}
          </small>
        </span>
      </a>
    );
  }

  /* Satır içi rozet görünümü */
  return (
    <span className="discord-rozet">
      <span className="nokta acik" />
      {yukleniyor ? (
        "Discord üyeleri yükleniyor…"
      ) : ulasildi ? (
        <>
          <strong>{sayiYaz(toplam)}</strong> üye
          {typeof online === "number" && (
            <>
              {" · "}
              <strong>{sayiYaz(online)}</strong> şu an çevrimiçi
            </>
          )}
        </>
      ) : typeof online === "number" ? (
        <>
          <strong>{sayiYaz(online)}</strong> üye çevrimiçi
        </>
      ) : (
        "Discord sayacı şu an ulaşılamıyor"
      )}
    </span>
  );
}
