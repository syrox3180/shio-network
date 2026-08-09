"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sifreYenile } from "../../lib/kimlik";
import { sifreKontrol } from "../../lib/sifre";
import SifreAlani from "../../components/SifreAlani";

export default function SifreYenileSayfasi() {
  const router = useRouter();
  const [token, setToken] = useState(undefined);
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState(false);
  const [bekliyor, setBekliyor] = useState(false);

  /* Supabase token'ı adres çubuğunun # kısmında gönderir */
  useEffect(() => {
    const parca = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setToken(parca.get("access_token") || null);
    // Token adres çubuğunda kalmasın
    if (parca.get("access_token")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const gonder = async (e) => {
    e.preventDefault();
    setHata("");

    const sifreHatasi = sifreKontrol(sifre);
    if (sifreHatasi) return setHata(sifreHatasi);
    if (sifre !== sifreTekrar) return setHata("Şifreler birbirini tutmuyor.");

    setBekliyor(true);
    try {
      await sifreYenile({ token, sifre });
      setBasari(true);
      setTimeout(() => router.push("/giris"), 2500);
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  if (token === undefined) {
    return (
      <div className="kapsayici" style={{ padding: "90px 24px" }}>
        <p className="sonuk">Yükleniyor…</p>
      </div>
    );
  }

  if (token === null) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Bağlantı geçersiz</h1>
          <p className="alt-metin">
            Şifre yenileme bağlantısı geçersiz ya da süresi dolmuş. Yeni bir bağlantı isteyebilirsin.
          </p>
          <Link href="/sifremi-unuttum" className="dugme dugme-mor dugme-genis">
            Yeni bağlantı iste
          </Link>
        </div>
      </div>
    );
  }

  if (basari) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu" style={{ textAlign: "center" }}>
          <h1 style={{ color: "var(--ok)" }}>Şifren değişti</h1>
          <p className="alt-metin">Yeni şifrenle giriş yapabilirsin. Giriş sayfasına yönlendiriliyorsun…</p>
          <Link href="/giris" className="dugme dugme-mor dugme-genis">
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-sayfa">
      <form className="form-kutu" onSubmit={gonder}>
        <h1>Yeni şifre</h1>
        <p className="alt-metin">Hesabın için yeni bir şifre belirle.</p>

        {hata && <div className="uyari uyari-hata">{hata}</div>}

        <SifreAlani
          id="sifre"
          label="Yeni şifre"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="En az 8 karakter"
          gucGoster
        />

        <SifreAlani
          id="sifreTekrar"
          label="Yeni şifre tekrar"
          value={sifreTekrar}
          onChange={(e) => setSifreTekrar(e.target.value)}
          placeholder="Tekrar yaz"
        />

        <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
          {bekliyor ? "Kaydediliyor" : "Şifreyi değiştir"}
        </button>
      </form>
    </div>
  );
}
