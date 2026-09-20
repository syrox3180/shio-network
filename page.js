"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SUNUCU } from "../../lib/ayarlar";

const DURUMLAR = {
  basarili: {
    baslik: "Ödemen alındı",
    renk: "var(--ok)",
    metin:
      "Teşekkürler! Kredi aldıysan bakiyene çoktan yüklendi. VIP paketi aldıysan yetkili ekibi rütbeni en kısa sürede oyun içinde tanımlayacak.",
  },
  basarisiz: {
    baslik: "Ödeme tamamlanmadı",
    renk: "var(--err)",
    metin:
      "İşlem yarıda kaldı ya da banka onaylamadı. Hesabından para çekilmediyse tekrar deneyebilirsin.",
  },
  hata: {
    baslik: "Bir sorun oluştu",
    renk: "var(--amber)",
    metin:
      "Ödemen alınmış olabilir ama siparişini eşleştiremedik. Discord'dan destek talebi açarsan hemen kontrol ederiz.",
  },
  bilinmiyor: {
    baslik: "Sipariş durumu",
    renk: "var(--muted)",
    metin: "Siparişinin güncel durumunu hesabım sayfasından takip edebilirsin.",
  },
};

function Icerik() {
  const parametreler = useSearchParams();
  const durum = parametreler.get("durum") || "bilinmiyor";
  const no = parametreler.get("no");
  const bilgi = DURUMLAR[durum] || DURUMLAR.bilinmiyor;

  return (
    <div className="form-sayfa">
      <div className="form-kutu" style={{ textAlign: "center" }}>
        <h1 style={{ color: bilgi.renk }}>{bilgi.baslik}</h1>
        <p className="alt-metin">{bilgi.metin}</p>

        {no && (
          <p className="mono sonuk" style={{ marginBottom: 26 }}>
            Sipariş no: #{no}
          </p>
        )}

        <Link href="/panel" className="dugme dugme-mor dugme-genis">
          Hesabıma git
        </Link>

        <p className="form-alt">
          Sorun mu var?{" "}
          <a href={SUNUCU.discord} target="_blank" rel="noreferrer">
            Discord'dan yaz
          </a>
        </p>
      </div>
    </div>
  );
}

export default function OdemeSonucSayfasi() {
  return (
    <Suspense
      fallback={
        <div className="kapsayici" style={{ padding: "90px 24px" }}>
          <p className="sonuk">Yükleniyor…</p>
        </div>
      }
    >
      <Icerik />
    </Suspense>
  );
}
