"use client";

import { useState } from "react";
import Link from "next/link";
import { uyelikAktif } from "../../lib/ayarlar";
import { sifreSifirlamaIste } from "../../lib/kimlik";

export default function SifremiUnuttumSayfasi() {
  const [eposta, setEposta] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  if (!uyelikAktif) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Üyelik kapalı</h1>
          <p className="alt-metin">Üyelik sistemi henüz açılmadı.</p>
        </div>
      </div>
    );
  }

  const gonder = async (e) => {
    e.preventDefault();
    setHata("");
    setMesaj("");
    setBekliyor(true);
    try {
      const sonuc = await sifreSifirlamaIste(eposta.trim());
      setMesaj(sonuc.mesaj || "Bağlantı gönderildi.");
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="form-sayfa">
      <form className="form-kutu" onSubmit={gonder}>
        <h1>Şifremi unuttum</h1>
        <p className="alt-metin">
          Hesabının e-posta adresini yaz, sana şifre yenileme bağlantısı gönderelim.
        </p>

        {hata && <div className="uyari uyari-hata">{hata}</div>}
        {mesaj && <div className="uyari uyari-basari">{mesaj}</div>}

        <div className="alan">
          <label htmlFor="eposta">E-posta</label>
          <input
            id="eposta"
            type="email"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            placeholder="ornek@eposta.com"
            autoComplete="email"
            required
          />
        </div>

        <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
          {bekliyor ? "Gönderiliyor" : "Bağlantı gönder"}
        </button>

        <p className="form-alt">
          <Link href="/giris">Giriş sayfasına dön</Link>
        </p>
      </form>
    </div>
  );
}
