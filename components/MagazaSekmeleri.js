"use client";

import { useEffect, useState, useCallback } from "react";
import PaketKarti from "./PaketKarti";
import { PAKETLER, KASALAR, KITLER, AFLAR, uyelikAktif } from "../lib/ayarlar";
import { benKim } from "../lib/kimlik";

const BOLUMLER = [
  {
    id: "rutbe",
    etiket: "VIP Paketleri",
    baslik: "Rütbeler",
    aciklama:
      "Dört paket var, hepsi tek seferlik ödemeyle alınır. Üst paketler alt paketlerin tüm ayrıcalıklarını kapsar.",
    urunler: PAKETLER,
  },
  {
    id: "kasa",
    etiket: "Kasalar",
    baslik: "Kasa anahtarları",
    aciklama:
      "Aldığın anahtar sandığına düşer. Etkinleştirdiğin an oyun içinde hesabına tanımlanır, dilediğin zaman açarsın.",
    urunler: KASALAR,
  },
  {
    id: "kit",
    etiket: "Set Kitleri",
    baslik: "Set kitleri",
    aciklama:
      "Komple setler. Sandıktan etkinleştirdiğinde doğrudan oyun içi envanterine gönderilir — oyunda olman yeterli.",
    urunler: KITLER,
  },
  {
    id: "af",
    etiket: "Unban & Blacklist Affı",
    baslik: "Unban ve blacklist affı",
    aciklama:
      "Cezan otomatik kalkar. Sandıktan etkinleştirdiğin anda uygulanır, yetkili onayı beklemene gerek yok.",
    urunler: AFLAR,
  },
];

export default function MagazaSekmeleri({ baslangic = "rutbe" }) {
  const [sekme, setSekme] = useState(baslangic);
  const [bakiye, setBakiye] = useState(null);
  const [girisli, setGirisli] = useState(false);

  const bakiyeCek = useCallback(async () => {
    if (!uyelikAktif) return;
    const oturum = await benKim();
    setGirisli(oturum.girisli);
    if (oturum.girisli) setBakiye(oturum.kredi ?? 0);
  }, []);

  useEffect(() => {
    bakiyeCek();
  }, [bakiyeCek]);

  const aktif = BOLUMLER.find((b) => b.id === sekme) || BOLUMLER[0];

  return (
    <>
      {uyelikAktif && girisli && (
        <div className="bakiye-serit">
          <span className="bakiye-etiket">Kredi bakiyen</span>
          <span className="bakiye-deger">{bakiye === null ? "…" : bakiye} 🪙</span>
        </div>
      )}

      <div className="magaza-sekmeler">
        {BOLUMLER.map((b) => (
          <button
            key={b.id}
            className={sekme === b.id ? "magaza-sekme aktif" : "magaza-sekme"}
            onClick={() => setSekme(b.id)}
          >
            {b.etiket}
            <span className="magaza-sekme-sayi">{b.urunler.length}</span>
          </button>
        ))}
      </div>

      <div className="magaza-aciklama">
        <h2 className="baslik-m">{aktif.baslik}</h2>
        <p className="sonuk">{aktif.aciklama}</p>
      </div>

      {aktif.urunler.length === 0 ? (
        <div className="bos-durum">
          <p>Bu bölümde henüz ürün yok.</p>
        </div>
      ) : (
        <div className="paketler">
          {aktif.urunler.map((u) => (
            <PaketKarti
              key={u.id}
              paket={u}
              bakiye={bakiye}
              girisli={girisli}
              onDegisim={bakiyeCek}
            />
          ))}
        </div>
      )}
    </>
  );
}
