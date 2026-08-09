"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU } from "../../lib/ayarlar";
import { oturumOku, cikisYap } from "../../lib/kimlik";
import { siparislerimiGetir, adminMi, profilimiGetir } from "../../lib/veritabani";

const DURUM_ETIKET = {
  bekliyor: { metin: "Onay bekliyor", renk: "#f0a63c" },
  teslim: { metin: "Teslim edildi", renk: "#5fbf8b" },
  iptal: { metin: "İptal edildi", renk: "#ef5a6f" },
};

function tarihYaz(ham) {
  if (!ham) return "—";
  return new Date(ham).toLocaleDateString("tr-TR");
}

export default function PanelSayfasi() {
  const router = useRouter();
  const [oturum, setOturum] = useState(undefined);
  const [siparisler, setSiparisler] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [kredi, setKredi] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!uyelikAktif) return;
    const o = oturumOku();
    if (!o) {
      router.replace("/giris");
      return;
    }
    setOturum(o);

    (async () => {
      try {
        const [s, a, pr] = await Promise.all([siparislerimiGetir(), adminMi(), profilimiGetir()]);
        setSiparisler(s || []);
        setAdmin(a);
        setKredi(pr?.kredi ?? 0);
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

  const nick = oturum.kullanici?.user_metadata?.nick || "—";
  const eposta = oturum.kullanici?.email || "—";
  const kayitTarihi = tarihYaz(oturum.kullanici?.created_at);
  const aktifPaketler = siparisler.filter((s) => s.durum === "teslim");

  const cikis = () => {
    cikisYap();
    router.push("/");
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
            {admin && (
              <Link href="/yonetim" className="dugme dugme-vurgu">
                Yönetim paneli
              </Link>
            )}
            <button className="dugme" onClick={cikis}>
              Çıkış yap
            </button>
          </div>
        </div>

        <div className="panel-kutular">
          <div className="panel-kutu panel-kredi">
            <span className="etiket">Kredi bakiyen</span>
            <span className="deger" style={{ fontSize: "1.7rem", color: "var(--amber)" }}>
              {kredi === null ? "…" : kredi} 🪙
            </span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">E-posta</span>
            <span className="deger">{eposta}</span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Kayıt tarihi</span>
            <span className="deger">{kayitTarihi}</span>
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
                  <th>Paket</th>
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
                    <td className="mono">{s.fiyat}₺</td>
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

        <p className="sonuk kucuk" style={{ marginTop: 22 }}>
          Ödemeni yaptıysan ve siparişin hâlâ onay bekliyorsa Discord'dan destek talebi aç.
        </p>
      </div>
    </section>
  );
}
