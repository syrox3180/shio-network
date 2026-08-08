"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU } from "../../lib/ayarlar";
import { girisYap } from "../../lib/kimlik";

export default function GirisSayfasi() {
  const router = useRouter();
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  if (!uyelikAktif) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Üyelik kapalı</h1>
          <p className="alt-metin">
            Üyelik sistemi henüz açılmadı. Sunucuya bağlanmak veya paket almak için üyelik gerekmiyor.
          </p>
          <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme dugme-mor dugme-genis">
            Discord'a katıl
          </a>
        </div>
      </div>
    );
  }

  const gonder = async (e) => {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    try {
      await girisYap({ eposta: eposta.trim(), sifre });
      router.push("/panel");
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="form-sayfa">
      <form className="form-kutu" onSubmit={gonder}>
        <h1>Giriş yap</h1>
        <p className="alt-metin">Hesabına giriş yap ve bilgilerini görüntüle.</p>

        {hata && <div className="uyari uyari-hata">{hata}</div>}

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

        <div className="alan">
          <label htmlFor="sifre">Şifre</label>
          <input
            id="sifre"
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            placeholder="Şifren"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
          {bekliyor ? "Giriş yapılıyor" : "Giriş yap"}
        </button>

        <p className="form-alt">
          Hesabın yok mu? <Link href="/kayit">Kayıt ol</Link>
        </p>
      </form>
    </div>
  );
}
