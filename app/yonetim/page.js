"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uyelikAktif } from "../../lib/ayarlar";
import { oturumOku } from "../../lib/kimlik";
import { adminMi, tumSiparisler, siparisGuncelle, uyeleriGetir, krediAyarla } from "../../lib/veritabani";

const DURUM_ETIKET = {
  bekliyor: { metin: "Bekliyor", renk: "#f0a63c" },
  teslim: { metin: "Teslim edildi", renk: "#5fbf8b" },
  iptal: { metin: "İptal", renk: "#ef5a6f" },
};

function tarihYaz(ham) {
  if (!ham) return "—";
  return new Date(ham).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function YonetimSayfasi() {
  const router = useRouter();
  const [yetki, setYetki] = useState("kontrol"); // kontrol | yok | var
  const [sekme, setSekme] = useState("siparisler");
  const [siparisler, setSiparisler] = useState([]);
  const [uyeler, setUyeler] = useState([]);
  const [filtre, setFiltre] = useState("hepsi");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  const verileriCek = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [s, u] = await Promise.all([tumSiparisler(), uyeleriGetir()]);
      setSiparisler(s || []);
      setUyeler(u || []);
      setHata("");
    } catch (err) {
      setHata("Veriler alınamadı. Sayfayı yenilemeyi dene.");
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    if (!uyelikAktif) return;
    (async () => {
      const oturum = oturumOku();
      if (!oturum) {
        router.replace("/giris");
        return;
      }
      const admin = await adminMi();
      if (!admin) {
        setYetki("yok");
        return;
      }
      setYetki("var");
      verileriCek();
    })();
  }, [router, verileriCek]);

  const durumDegistir = async (id, yeniDurum) => {
    let aciklama = null;
    if (yeniDurum === "iptal") {
      aciklama = window.prompt("İptal sebebi (isteğe bağlı):") || null;
    }
    try {
      await siparisGuncelle(id, yeniDurum, aciklama);
      setSiparisler((liste) =>
        liste.map((s) => (s.id === id ? { ...s, durum: yeniDurum, aciklama } : s))
      );
    } catch (err) {
      alert("Güncellenemedi, tekrar dene.");
      console.error(err);
    }
  };

  const krediDegistir = async (uye) => {
    const girdi = window.prompt(
      `${uye.nick} için kredi ekle veya çıkar.\n\nEklemek için: 100\nÇıkarmak için: -50\n\nMevcut bakiye: ${uye.kredi ?? 0}`,
      ""
    );
    if (girdi === null) return;

    const miktar = parseInt(girdi, 10);
    if (Number.isNaN(miktar) || miktar === 0) {
      alert("Geçerli bir sayı yaz.");
      return;
    }

    try {
      const yeni = await krediAyarla(uye.id, miktar);
      setUyeler((liste) => liste.map((u) => (u.id === uye.id ? { ...u, kredi: yeni } : u)));
    } catch (err) {
      alert(err.message || "Kredi güncellenemedi.");
    }
  };

  if (!uyelikAktif) {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Üyelik kapalı</h1>
          <p className="alt-metin">
            Yönetim paneli için önce üyelik sistemini kurman gerekiyor. Kurulum adımları README.md
            dosyasında.
          </p>
        </div>
      </div>
    );
  }

  if (yetki === "kontrol") {
    return (
      <div className="kapsayici" style={{ padding: "90px 24px" }}>
        <p className="sonuk">Yetki kontrol ediliyor…</p>
      </div>
    );
  }

  if (yetki === "yok") {
    return (
      <div className="form-sayfa">
        <div className="form-kutu">
          <h1>Erişim yok</h1>
          <p className="alt-metin">
            Bu sayfa yönetim ekibine ait. Hesabın yönetici olarak tanımlı değil.
          </p>
          <button className="dugme dugme-genis" onClick={() => router.push("/")}>
            Ana sayfaya dön
          </button>
        </div>
      </div>
    );
  }

  const gosterilen =
    filtre === "hepsi" ? siparisler : siparisler.filter((s) => s.durum === filtre);

  const bekleyen = siparisler.filter((s) => s.durum === "bekliyor").length;
  const teslim = siparisler.filter((s) => s.durum === "teslim").length;
  const ciro = siparisler
    .filter((s) => s.durum === "teslim")
    .reduce((t, s) => t + (s.fiyat || 0), 0);

  return (
    <section className="bolum" style={{ borderTop: "none" }}>
      <div className="kapsayici">
        <div className="bolum-bas">
          <p className="gozkasi">Yönetim</p>
          <h1 className="baslik-l">Sipariş paneli</h1>
        </div>

        <div className="panel-kutular" style={{ marginBottom: 30 }}>
          <div className="panel-kutu">
            <span className="etiket">Bekleyen sipariş</span>
            <span className="deger" style={{ fontSize: "1.6rem", color: "var(--amber)" }}>
              {bekleyen}
            </span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Teslim edilen</span>
            <span className="deger" style={{ fontSize: "1.6rem", color: "var(--ok)" }}>
              {teslim}
            </span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Toplam ciro</span>
            <span className="deger" style={{ fontSize: "1.6rem" }}>{ciro}₺</span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Dağıtılan kredi</span>
            <span className="deger" style={{ fontSize: "1.6rem", color: "var(--amber)" }}>
              {uyeler.reduce((t, u) => t + (u.kredi || 0), 0)} 🪙
            </span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Kayıtlı üye</span>
            <span className="deger" style={{ fontSize: "1.6rem" }}>{uyeler.length}</span>
          </div>
        </div>

        <div className="sekmeler">
          <button
            className={sekme === "siparisler" ? "sekme aktif" : "sekme"}
            onClick={() => setSekme("siparisler")}
          >
            Siparişler ({siparisler.length})
          </button>
          <button
            className={sekme === "uyeler" ? "sekme aktif" : "sekme"}
            onClick={() => setSekme("uyeler")}
          >
            Üyeler ({uyeler.length})
          </button>
          <button className="dugme" style={{ marginLeft: "auto" }} onClick={verileriCek}>
            Yenile
          </button>
        </div>

        {hata && <div className="uyari uyari-hata">{hata}</div>}
        {yukleniyor && <p className="sonuk">Yükleniyor…</p>}

        {!yukleniyor && sekme === "siparisler" && (
          <>
            <div className="filtreler">
              {[
                ["hepsi", "Hepsi"],
                ["bekliyor", "Bekleyen"],
                ["teslim", "Teslim edilen"],
                ["iptal", "İptal"],
              ].map(([deger, etiket]) => (
                <button
                  key={deger}
                  className={filtre === deger ? "filtre aktif" : "filtre"}
                  onClick={() => setFiltre(deger)}
                >
                  {etiket}
                </button>
              ))}
            </div>

            {gosterilen.length === 0 ? (
              <div className="bos-durum">
                <p>Bu filtreye uyan sipariş yok.</p>
              </div>
            ) : (
              <div className="tablo-sar">
                <table className="tablo">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nick</th>
                      <th>Ürün</th>
                      <th>Ödeme</th>
                      <th>Tutar</th>
                      <th>Tarih</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gosterilen.map((s) => (
                      <tr key={s.id}>
                        <td className="mono sonuk">{s.id}</td>
                        <td>
                          <strong className="mono">{s.nick}</strong>
                          <br />
                          <span className="sonuk kucuk">{s.eposta}</span>
                        </td>
                        <td>
                          {s.tur === "kredi" ? (
                            <span style={{ color: "var(--amber)" }}>🪙 {s.paket_ad}</span>
                          ) : (
                            s.paket_ad
                          )}
                        </td>
                        <td>
                          {s.odeme === "kredi" ? (
                            <span className="rozet" style={{ color: "var(--amethyst)" }}>
                              Kredi
                            </span>
                          ) : s.odendi ? (
                            <span className="rozet" style={{ color: "var(--ok)" }}>
                              ✓ Ödendi
                            </span>
                          ) : (
                            <span className="rozet sonuk">Bekliyor</span>
                          )}
                        </td>
                        <td className="mono">{s.fiyat}₺</td>
                        <td className="sonuk kucuk">{tarihYaz(s.olusturma)}</td>
                        <td>
                          <span
                            className="rozet"
                            style={{ color: DURUM_ETIKET[s.durum]?.renk || "var(--muted)" }}
                          >
                            {DURUM_ETIKET[s.durum]?.metin || s.durum}
                          </span>
                          {s.aciklama && (
                            <>
                              <br />
                              <span className="sonuk kucuk">{s.aciklama}</span>
                            </>
                          )}
                        </td>
                        <td>
                          <div className="islem-butonlar">
                            {s.durum !== "teslim" && (
                              <button
                                className="mini-dugme yesil"
                                onClick={() => durumDegistir(s.id, "teslim")}
                              >
                                Teslim et
                              </button>
                            )}
                            {s.durum !== "iptal" && (
                              <button
                                className="mini-dugme kirmizi"
                                onClick={() => durumDegistir(s.id, "iptal")}
                              >
                                İptal
                              </button>
                            )}
                            {s.durum !== "bekliyor" && (
                              <button
                                className="mini-dugme"
                                onClick={() => durumDegistir(s.id, "bekliyor")}
                              >
                                Geri al
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {!yukleniyor && sekme === "uyeler" && (
          <div className="tablo-sar">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Nick</th>
                  <th>E-posta</th>
                  <th>Kayıt tarihi</th>
                  <th>Kredi</th>
                  <th>Siparişi</th>
                </tr>
              </thead>
              <tbody>
                {uyeler.map((u) => {
                  const kendiSiparisleri = siparisler.filter((s) => s.kullanici_id === u.id);
                  const teslimEdilen = kendiSiparisleri.filter((s) => s.durum === "teslim");
                  return (
                    <tr key={u.id}>
                      <td className="mono">
                        <strong>{u.nick}</strong>
                      </td>
                      <td className="sonuk kucuk">{u.eposta}</td>
                      <td className="sonuk kucuk">{tarihYaz(u.kayit_tarihi)}</td>
                      <td>
                        <div className="kredi-hucre">
                          <span className="mono" style={{ color: "var(--amber)" }}>
                            {u.kredi ?? 0} 🪙
                          </span>
                          <button className="mini-dugme" onClick={() => krediDegistir(u)}>
                            Düzenle
                          </button>
                        </div>
                      </td>
                      <td>
                        {teslimEdilen.length > 0 ? (
                          <span style={{ color: "var(--ok)" }}>
                            {teslimEdilen.map((s) => s.paket_ad).join(", ")}
                          </span>
                        ) : (
                          <span className="sonuk">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
