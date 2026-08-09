"use client";

import { useEffect, useState } from "react";
import { carpaniGetir, carpaniAyarla } from "../lib/veritabani";

export default function EtkinlikYonetimi() {
  const [durum, setDurum] = useState(null);
  const [carpan, setCarpan] = useState(2);
  const [bitis, setBitis] = useState("");
  const [baslik, setBaslik] = useState("2X KREDİ ETKİNLİĞİ");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  const yukle = async () => {
    const veri = await carpaniGetir();
    setDurum(veri);
    if (veri) {
      setCarpan(veri.carpan || 2);
      setBaslik(veri.baslik || "2X KREDİ ETKİNLİĞİ");
      setBitis(veri.bitis ? new Date(veri.bitis).toISOString().slice(0, 16) : "");
    }
  };

  useEffect(() => {
    yukle();
  }, []);

  const kaydet = async (aktif) => {
    setHata("");
    setMesaj("");
    setBekliyor(true);
    try {
      await carpaniAyarla({
        aktif,
        carpan: Number(carpan),
        bitis: bitis ? new Date(bitis).toISOString() : null,
        baslik,
      });
      setMesaj(aktif ? "Etkinlik başlatıldı." : "Etkinlik durduruldu.");
      await yukle();
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="guvenlik-kutu">
      <div className="guvenlik-bas" style={{ marginBottom: 20 }}>
        <div>
          <h3 className="baslik-m">Kredi çarpanı etkinliği</h3>
          <p className="sonuk kucuk" style={{ margin: "4px 0 0" }}>
            {durum?.aktif ? (
              <span style={{ color: "var(--ok)" }}>
                ✓ Şu an aktif — {durum.carpan}x kredi veriliyor
              </span>
            ) : (
              "Şu an kapalı"
            )}
          </p>
        </div>
      </div>

      {hata && <div className="uyari uyari-hata">{hata}</div>}
      {mesaj && <div className="uyari uyari-basari">{mesaj}</div>}

      <div className="etkinlik-alanlar">
        <div className="alan" style={{ marginBottom: 0 }}>
          <label htmlFor="carpan">Çarpan</label>
          <input
            id="carpan"
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={carpan}
            onChange={(e) => setCarpan(e.target.value)}
          />
          <p className="ipucu">2 yazarsan 50 kredi alan 100 alır.</p>
        </div>

        <div className="alan" style={{ marginBottom: 0 }}>
          <label htmlFor="bitis">Bitiş tarihi</label>
          <input
            id="bitis"
            type="datetime-local"
            value={bitis}
            onChange={(e) => setBitis(e.target.value)}
          />
          <p className="ipucu">Boş bırakırsan elle kapatana kadar sürer.</p>
        </div>

        <div className="alan" style={{ marginBottom: 0 }}>
          <label htmlFor="baslik">Sitede görünecek başlık</label>
          <input
            id="baslik"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            maxLength={40}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <button className="dugme dugme-vurgu" onClick={() => kaydet(true)} disabled={bekliyor}>
          {durum?.aktif ? "Ayarları güncelle" : "Etkinliği başlat"}
        </button>
        {durum?.aktif && (
          <button className="dugme" onClick={() => kaydet(false)} disabled={bekliyor}>
            Etkinliği durdur
          </button>
        )}
      </div>

      <p className="ipucu" style={{ marginTop: 16 }}>
        Çarpan sunucu tarafında uygulanır — kimse tarayıcıdan oynayıp fazla kredi alamaz. Etkinlik
        sırasında verilen siparişlerde bonus kredi otomatik hesaplanır.
      </p>
    </div>
  );
}
