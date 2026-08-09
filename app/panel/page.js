"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU } from "../../lib/ayarlar";
import { benKim, cikisYap, sifreDegistir } from "../../lib/kimlik";
import { siparislerimiGetir } from "../../lib/veritabani";
import { sifreKontrol } from "../../lib/sifre";
import SifreAlani from "../../components/SifreAlani";

const DURUM_ETIKET = {
  bekliyor: { metin: "Onay bekliyor", renk: "#f0a63c" },
  teslim: { metin: "Teslim edildi", renk: "#5fbf8b" },
  iptal: { metin: "İptal edildi", renk: "#ef5a6f" },
};

function tarihYaz(ham) {
  if (!ham) return "—";
  return new Date(ham).toLocaleDateString("tr-TR");
}

/* Şifre değiştirme bölümü */
function SifreBolumu() {
  const [acik, setAcik] = useState(false);
  const [eski, setEski] = useState("");
  const [yeni, setYeni] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  const gonder = async (e) => {
    e.preventDefault();
    setHata("");
    setBasari("");

    const sifreHatasi = sifreKontrol(yeni);
    if (sifreHatasi) return setHata(sifreHatasi);
    if (yeni !== tekrar) return setHata("Yeni şifreler birbirini tutmuyor.");

    setBekliyor(true);
    try {
      await sifreDegistir({ eskiSifre: eski, yeniSifre: yeni });
      setBasari("Şifren güncellendi.");
      setEski("");
      setYeni("");
      setTekrar("");
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="guvenlik-kutu">
      <div className="guvenlik-bas">
        <div>
          <h3 className="baslik-m">Şifre</h3>
          <p className="sonuk kucuk" style={{ margin: "4px 0 0" }}>
            Şifreni düzenli olarak değiştirmen hesabını güvende tutar.
          </p>
        </div>
        <button className="dugme" onClick={() => setAcik((v) => !v)}>
          {acik ? "Kapat" : "Şifre değiştir"}
        </button>
      </div>

      {acik && (
        <form onSubmit={gonder} style={{ marginTop: 24, maxWidth: 420 }}>
          {hata && <div className="uyari uyari-hata">{hata}</div>}
          {basari && <div className="uyari uyari-basari">{basari}</div>}

          <SifreAlani
            id="eskiSifre"
            label="Mevcut şifren"
            value={eski}
            onChange={(e) => setEski(e.target.value)}
            placeholder="Şu anki şifren"
            autoComplete="current-password"
          />
          <SifreAlani
            id="yeniSifre"
            label="Yeni şifre"
            value={yeni}
            onChange={(e) => setYeni(e.target.value)}
            placeholder="En az 8 karakter"
            gucGoster
          />
          <SifreAlani
            id="yeniTekrar"
            label="Yeni şifre tekrar"
            value={tekrar}
            onChange={(e) => setTekrar(e.target.value)}
            placeholder="Tekrar yaz"
          />

          <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
            {bekliyor ? "Kaydediliyor" : "Şifreyi güncelle"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function PanelSayfasi() {
  const router = useRouter();
  const [oturum, setOturum] = useState(undefined);
  const [siparisler, setSiparisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!uyelikAktif) return;
    (async () => {
      const o = await benKim();
      if (!o.girisli) {
        router.replace("/giris");
        return;
      }
      setOturum(o);
      try {
        setSiparisler((await siparislerimiGetir()) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [router]);

  if (!uyelikAktif) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Üyelik kapalı</h1>
          <p className="alt-metin">Üyelik sistemi henüz açılmadı.</p>
          <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme dugme-mor dugme-genis">
            Discord'a katıl
          </a>
        </div>
      </div>
    );
  }

  if (oturum === undefined) {
    return (
      <div className="kapsayici" style={{ padding: "90px 24px" }}>
        <p className="sonuk">Yükleniyor…</p>
      </div>
    );
  }

  const nick = oturum.kullanici?.nick || "—";
  const eposta = oturum.kullanici?.eposta || "—";
  const aktifPaketler = siparisler.filter((s) => s.durum === "teslim" && s.tur === "paket");

  const cikis = async (tumCihazlar) => {
    await cikisYap(tumCihazlar);
    router.push("/");
    router.refresh();
  };

  return (
    <section className="bolum" style={{ borderTop: "none" }}>
      <div className="kapsayici">
        <div className="bolum-bas">
          <p className="gozkasi">Hesabım</p>
          <h1 className="baslik-l">Merhaba {nick}</h1>
        </div>

        <div className="panel-ust">
          <div>
            <span className="etiket">Oyun içi nick</span>
            <span className="panel-nick">{nick}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {oturum.admin && (
              <Link href="/yonetim" className="dugme dugme-vurgu">
                Yönetim paneli
              </Link>
            )}
            <button className="dugme" onClick={() => cikis(false)}>
              Çıkış yap
            </button>
          </div>
        </div>

        <div className="panel-kutular">
          <div className="panel-kutu panel-kredi">
            <span className="etiket">Kredi bakiyen</span>
            <span className="deger" style={{ fontSize: "1.7rem", color: "var(--amber)" }}>
              {oturum.kredi ?? 0} 🪙
            </span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">E-posta</span>
            <span className="deger">{eposta}</span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Aktif paketin</span>
            <span className="deger" style={{ color: aktifPaketler.length ? "var(--ok)" : undefined }}>
              {aktifPaketler.length ? aktifPaketler.map((s) => s.paket_ad).join(", ") : "Yok"}
            </span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Sunucu adresi</span>
            <span className="deger mono">{SUNUCU.adres}</span>
          </div>
        </div>

        <h2 className="baslik-m" style={{ margin: "48px 0 20px" }}>
          Siparişlerim
        </h2>

        {yukleniyor ? (
          <p className="sonuk">Yükleniyor…</p>
        ) : siparisler.length === 0 ? (
          <div className="discord-serit">
            <div>
              <h3 className="baslik-m">Henüz siparişin yok</h3>
              <p>Mağazadan bir paket alıp oyun içi ayrıcalıkların kilidini açabilirsin.</p>
            </div>
            <Link href="/magaza" className="dugme dugme-vurgu">
              Mağazaya git
            </Link>
          </div>
        ) : (
          <div className="tablo-sar">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Tutar</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {siparisler.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.paket_ad}</strong>
                    </td>
                    <td className="mono">
                      {s.odeme === "kredi" ? `${s.fiyat} 🪙` : `${s.fiyat}₺`}
                    </td>
                    <td className="sonuk kucuk">{tarihYaz(s.olusturma)}</td>
                    <td>
                      <span className="rozet" style={{ color: DURUM_ETIKET[s.durum]?.renk }}>
                        {DURUM_ETIKET[s.durum]?.metin || s.durum}
                      </span>
                      {s.aciklama && (
                        <>
                          <br />
                          <span className="sonuk kucuk">{s.aciklama}</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="baslik-m" style={{ margin: "48px 0 20px" }}>
          Hesap güvenliği
        </h2>

        <SifreBolumu />

        <div className="guvenlik-kutu" style={{ marginTop: 16 }}>
          <div className="guvenlik-bas">
            <div>
              <h3 className="baslik-m">Tüm cihazlardan çık</h3>
              <p className="sonuk kucuk" style={{ margin: "4px 0 0" }}>
                Ortak bir bilgisayarda oturum açık kaldıysa hepsini birden kapat.
              </p>
            </div>
            <button className="dugme" onClick={() => cikis(true)}>
              Her yerden çık
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
