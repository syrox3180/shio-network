"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU } from "../../lib/ayarlar";
import { kayitOl } from "../../lib/kimlik";
import { sifreKontrol, nickKontrol } from "../../lib/sifre";
import SifreAlani from "../../components/SifreAlani";

export default function KayitSayfasi() {
  const router = useRouter();
  const [nick, setNick] = useState("");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  if (!uyelikAktif) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Üyelik kapalı</h1>
          <p className="alt-metin">
            Üyelik sistemi henüz açılmadı. Sunucuya bağlanmak için üyelik gerekmiyor.
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

    const nickHatasi = nickKontrol(temizNick);
    if (nickHatasi) return setHata(nickHatasi);

    const sifreHatasi = sifreKontrol(sifre, { nick: temizNick, eposta });
    if (sifreHatasi) return setHata(sifreHatasi);

    if (sifre !== sifreTekrar) return setHata("Şifreler birbirini tutmuyor.");

    setBekliyor(true);
    try {
      const sonuc = await kayitOl({ eposta: eposta.trim(), sifre, nick: temizNick });
      if (sonuc.girisYapildi) {
        router.push("/panel");
        router.refresh();
      } else {
        setBasari(sonuc.mesaj || "Hesabın oluşturuldu.");
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
            maxLength={16}
            required
          />
          <p className="ipucu">Paketler bu nicke tanımlanır. Her nick sadece bir hesapta olabilir.</p>
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
          <p className="ipucu">Şifreni unutursan buraya yenileme bağlantısı göndeririz.</p>
        </div>

        <SifreAlani
          id="sifre"
          label="Şifre"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="En az 8 karakter"
          gucGoster
          ipucu="En az 8 karakter, bir harf ve bir rakam içermeli."
        />

        <SifreAlani
          id="sifreTekrar"
          label="Şifre tekrar"
          value={sifreTekrar}
          onChange={(e) => setSifreTekrar(e.target.value)}
          placeholder="Şifreni tekrar yaz"
        />

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
