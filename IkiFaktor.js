"use client";

import { useState } from "react";

/* Yönetici hesabı için iki adımlı doğrulama */
export default function IkiFaktor({ kurulu, dogrulandi, onTamam }) {
  const [asama, setAsama] = useState(kurulu ? "kod" : "kapali");
  const [gizli, setGizli] = useState("");
  const [adres, setAdres] = useState("");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  const cagir = async (islem, ekstra = {}) => {
    const res = await fetch("/api/oturum/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ islem, ...ekstra }),
    });
    const veri = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(veri.hata || "İşlem tamamlanamadı.");
    return veri;
  };

  const kurulumaBasla = async () => {
    setHata("");
    setBekliyor(true);
    try {
      const veri = await cagir("baslat");
      setGizli(veri.gizli);
      setAdres(veri.adres);
      setAsama("kurulum");
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  const kodGonder = async (e) => {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    try {
      await cagir("dogrula", { kod });
      setKod("");
      onTamam?.();
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  const kapat = async () => {
    const girilen = window.prompt("Kapatmak için uygulamadaki 6 haneli kodu gir:");
    if (!girilen) return;
    setHata("");
    try {
      await cagir("kapat", { kod: girilen });
      setAsama("kapali");
      onTamam?.();
    } catch (err) {
      alert(err.message);
    }
  };

  /* Kurulu ve doğrulanmış → sadece durum göster */
  if (kurulu && dogrulandi) {
    return (
      <div className="guvenlik-kutu">
        <div className="guvenlik-bas">
          <div>
            <h3 className="baslik-m">İki adımlı doğrulama</h3>
            <p className="sonuk kucuk" style={{ margin: "4px 0 0", color: "var(--ok)" }}>
              ✓ Aktif — hesabın telefonundaki kodla korunuyor
            </p>
          </div>
          <button className="dugme" onClick={kapat}>
            Kapat
          </button>
        </div>
      </div>
    );
  }

  /* Kurulu ama bu oturumda doğrulanmamış → kod iste */
  if (kurulu && !dogrulandi) {
    return (
      <div className="form-sayfa">
        <form className="form-kutu" onSubmit={kodGonder}>
          <h1>Doğrulama kodu</h1>
          <p className="alt-metin">
            Yönetim paneline girmek için doğrulama uygulamandaki 6 haneli kodu gir.
          </p>

          {hata && <div className="uyari uyari-hata">{hata}</div>}

          <div className="alan">
            <label htmlFor="kod">6 haneli kod</label>
            <input
              id="kod"
              value={kod}
              onChange={(e) => setKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="kod-alani"
              autoFocus
              required
            />
          </div>

          <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
            {bekliyor ? "Kontrol ediliyor" : "Doğrula"}
          </button>
        </form>
      </div>
    );
  }

  /* Kurulum ekranı */
  if (asama === "kurulum") {
    return (
      <div className="guvenlik-kutu">
        <h3 className="baslik-m" style={{ marginBottom: 14 }}>
          İki adımlı doğrulama kurulumu
        </h3>

        {hata && <div className="uyari uyari-hata">{hata}</div>}

        <ol className="kurulum-liste">
          <li>
            Telefonuna <strong>Google Authenticator</strong> veya <strong>Authy</strong> indir.
          </li>
          <li>
            Uygulamada "hesap ekle" → "kurulum anahtarı gir" seçeneğini kullan ve aşağıdaki anahtarı
            yaz:
            <code className="gizli-anahtar">{gizli}</code>
          </li>
          <li>
            Hesap adı olarak <strong>Shio Network</strong> yazabilirsin. Süre tipi:{" "}
            <strong>Zaman bazlı</strong>.
          </li>
          <li>Uygulamada beliren 6 haneli kodu aşağıya gir.</li>
        </ol>

        <form onSubmit={kodGonder} style={{ maxWidth: 300, marginTop: 20 }}>
          <div className="alan">
            <label htmlFor="kurulumKod">Uygulamadaki kod</label>
            <input
              id="kurulumKod"
              value={kod}
              onChange={(e) => setKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              className="kod-alani"
              required
            />
          </div>
          <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
            {bekliyor ? "Doğrulanıyor" : "Kurulumu tamamla"}
          </button>
        </form>

        <p className="ipucu" style={{ marginTop: 16 }}>
          Anahtarı bir yere not et. Telefonunu kaybedersen hesabına giremezsin.
        </p>
      </div>
    );
  }

  /* Kurulu değil → teklif et */
  return (
    <div className="guvenlik-kutu">
      <div className="guvenlik-bas">
        <div>
          <h3 className="baslik-m">İki adımlı doğrulama</h3>
          <p className="sonuk kucuk" style={{ margin: "4px 0 0" }}>
            Şifren çalınsa bile telefonun olmadan yönetim paneline girilemez.
          </p>
        </div>
        <button className="dugme dugme-vurgu" onClick={kurulumaBasla} disabled={bekliyor}>
          {bekliyor ? "Hazırlanıyor" : "Kur"}
        </button>
      </div>
      {hata && (
        <div className="uyari uyari-hata" style={{ marginTop: 16, marginBottom: 0 }}>
          {hata}
        </div>
      )}
    </div>
  );
}
