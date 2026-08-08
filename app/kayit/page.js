"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU } from "../../lib/ayarlar";
import { kayitOl } from "../../lib/kimlik";

export default function KayitSayfasi() {
  const router = useRouter();
  const [nick, setNick] = useState("");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  if (!uyelikAktif) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Üyelik kapalı</h1>
          <p className="alt-metin">
            Üyelik sistemi henüz açılmadı. Sunucuya bağlanmak veya paket almak için üyelik gerekmiyor — Discord'dan bize
            ulaşabilirsin.
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
    setBasari("");

    const temizNick = nick.trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(temizNick)) {
      setHata("Nick 3-16 karakter olmalı ve sadece harf, rakam ve alt çizgi içerebilir.");
      return;
    }
    if (sifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalı.");
      return;
    }

    setBekliyor(true);
    try {
      const veri = await kayitOl({ eposta: eposta.trim(), sifre, nick: temizNick });
      if (veri.access_token) {
        router.push("/panel");
      } else {
        setBasari("Hesabın oluşturuldu. E-postana gelen doğrulama bağlantısına tıkla, sonra giriş yapabilirsin.");
      }
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="form-sayfa">
      <form className="form-kutu" onSubmit={gonder}>
        <h1>Kayıt ol</h1>
        <p className="alt-metin">Hesabını oyun içi nickinle eşleştir, paketlerini tek yerden takip et.</p>

        {hata && <div className="uyari uyari-hata">{hata}</div>}
        {basari && <div className="uyari uyari-basari">{basari}</div>}

        <div className="alan">
          <label htmlFor="nick">Oyun içi nick</label>
          <input
            id="nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="Minecraft nickin"
            autoComplete="username"
            required
          />
          <p className="ipucu">Paketler bu nicke tanımlanır, doğru yazdığından emin ol.</p>
        </div>

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
            placeholder="En az 6 karakter"
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
          {bekliyor ? "Oluşturuluyor" : "Hesabı oluştur"}
        </button>

        <p className="form-alt">
          Zaten hesabın var mı? <Link href="/giris">Giriş yap</Link>
        </p>
      </form>
    </div>
  );
}
