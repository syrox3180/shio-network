"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU, urunBul, urunKategorisi, KATEGORI_ADI, OYUN_MODLARI, modAdi } from "../../lib/ayarlar";
import { benKim } from "../../lib/kimlik";
import { sandigimiGetir, esyaEtkinlestir } from "../../lib/veritabani";
import { NICK_KURALI } from "../../lib/sifre";

function tarihYaz(ham) {
  if (!ham) return "—";
  return new Date(ham).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function aciklamaYaz(kategori, sure, elleMi) {
  if (kategori === "af" && elleMi)
    return "Bu ürün yetkili tarafından elle işleniyor. Etkinleştirdiğinde talebin ekibe iletilir, sonra Discord'dan destek talebi açarsın.";
  if (elleMi)
    return "Bu ürün yetkili tarafından elle teslim ediliyor. Etkinleştirdiğinde talebin ekibe iletilir, sonra Discord'dan destek talebi açarsın.";
  if (kategori === "af")
    return "Etkinleştirdiğin an cezan sunucudan otomatik kaldırılır. Nickini doğru yazdığından emin ol.";
  return `${sure} gün süreyle geçerli. Süre, etkinleştirdiğin andan itibaren başlar.`;
}

function kalanGun(bitis) {
  if (!bitis) return 0;
  return Math.max(0, Math.ceil((new Date(bitis) - Date.now()) / 86400000));
}

function ModSecici({ deger, onDegis, id }) {
  return (
    <div className="alan">
      <label htmlFor={id}>Hangi sunucuya etkinleştirilsin?</label>
      <div className="filtreler" role="radiogroup" aria-label="Sunucu seç" id={id}>
        {OYUN_MODLARI.map((m) => (
          <button
            key={m.id}
            type="button"
            className={deger === m.id ? "filtre aktif" : "filtre"}
            onClick={() => onDegis(m.id)}
            aria-pressed={deger === m.id}
          >
            {m.ad}
          </button>
        ))}
      </div>
    </div>
  );
}

function EsyaKarti({ esya, varsayilanNick, onGuncelle }) {
  const [acik, setAcik] = useState(false);
  const [nick, setNick] = useState(varsayilanNick || "");
  const [mod, setMod] = useState(OYUN_MODLARI.length === 1 ? OYUN_MODLARI[0].id : "");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  const urun = urunBul(esya.paket_id);
  const kategori = urunKategorisi(urun);
  const renk = urun?.renk || "#9d5cff";
  const sureli = kategori === "rutbe";
  const sure = urun?.sureGun || 30;

  const etkinlestir = async (e) => {
    e.preventDefault();
    setHata("");

    if (!mod) {
      setHata("Önce hangi sunucuya (GenPvP) etkinleştirileceğini seç.");
      return;
    }

    if (!NICK_KURALI.test(nick.trim())) {
      setHata("Nick 3-16 karakter olmalı, sadece harf, rakam ve alt çizgi.");
      return;
    }

    setBekliyor(true);
    try {
      const sonuc = await esyaEtkinlestir(esya.id, nick.trim(), mod);
      await onGuncelle();
      if (sonuc?.elle && sonuc?.mesaj) {
        alert(sonuc.mesaj);
      }
    } catch (err) {
      setHata(err.message);
    } finally {
      setBekliyor(false);
    }
  };

  /* Etkinleştirilmiş eşya */
  if (esya.durum === "etkin") {
    const kalan = kalanGun(esya.bitis);
    return (
      <div className="esya esya-etkin">
        <span className="esya-serit" style={{ background: renk }} />
        <div className="esya-ust">
          <div>
            <span className="kategori-rozet">{KATEGORI_ADI[kategori] || "Ürün"}</span>
            <h3 className="esya-ad" style={{ color: renk }}>
              {esya.paket_ad}
            </h3>
          </div>
          <span className="rozet" style={{ color: "var(--ok)" }}>
            {esya.bitis ? "✓ Etkin" : "✓ Teslim edildi"}
          </span>
        </div>

        <dl className="esya-bilgi">
          <div>
            <dt>Oyuncu</dt>
            <dd className="mono">{esya.nick}</dd>
          </div>
          <div>
            <dt>Sunucu</dt>
            <dd>{modAdi(esya.sunucu)}</dd>
          </div>
          {esya.bitis ? (
            <>
              <div>
                <dt>Bitiş</dt>
                <dd>{tarihYaz(esya.bitis)}</dd>
              </div>
              <div>
                <dt>Kalan</dt>
                <dd style={{ color: kalan <= 3 ? "var(--err)" : "var(--text)" }}>{kalan} gün</dd>
              </div>
            </>
          ) : (
            <div>
              <dt>Teslim</dt>
              <dd>{tarihYaz(esya.etkinlestirme)}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  /* Yetkili işlemi bekleyen eşya (blacklist affı gibi) */
  if (esya.durum === "yetkili") {
    return (
      <div className="esya">
        <span className="esya-serit" style={{ background: "var(--amber)" }} />
        <div className="esya-ust">
          <div>
            <span className="kategori-rozet">{KATEGORI_ADI[kategori] || "Ürün"}</span>
            <h3 className="esya-ad" style={{ color: renk }}>
              {esya.paket_ad}
            </h3>
          </div>
          <span className="rozet" style={{ color: "var(--amber)" }}>
            Yetkili bekleniyor
          </span>
        </div>

        <dl className="esya-bilgi">
          <div>
            <dt>Oyuncu</dt>
            <dd className="mono">{esya.nick}</dd>
          </div>
          <div>
            <dt>Sunucu</dt>
            <dd>{modAdi(esya.sunucu)}</dd>
          </div>
          <div>
            <dt>Talep tarihi</dt>
            <dd>{tarihYaz(esya.etkinlestirme)}</dd>
          </div>
        </dl>

        <p className="sonuk kucuk" style={{ marginTop: 12 }}>
          Talebin ekibe iletildi. Discord'dan destek talebi açarsan işlem daha hızlı tamamlanır.
        </p>

        <a
          href={SUNUCU.discord}
          target="_blank"
          rel="noreferrer"
          className="dugme dugme-mor dugme-genis"
          style={{ marginTop: 14 }}
        >
          Discord'dan destek aç
        </a>
      </div>
    );
  }

  /* Hata almış eşya */
  if (esya.durum === "hata") {
    return (
      <div className="esya">
        <span className="esya-serit" style={{ background: "var(--err)" }} />
        <div className="esya-ust">
          <div>
            <span className="kategori-rozet">{KATEGORI_ADI[kategori] || "Ürün"}</span>
            <h3 className="esya-ad" style={{ color: renk }}>
              {esya.paket_ad}
            </h3>
          </div>
          <span className="rozet" style={{ color: "var(--err)" }}>
            Hata
          </span>
        </div>
        <p className="sonuk kucuk">
          Etkinleştirme sırasında sunucuya ulaşılamadı. Yetkili ekibi bilgilendirildi. Sunucu açıkken
          tekrar deneyebilirsin.
        </p>
        <button className="dugme dugme-genis" onClick={() => setAcik(true)} style={{ marginTop: 14 }}>
          Tekrar dene
        </button>
        {acik && (
          <form onSubmit={etkinlestir} style={{ marginTop: 14 }}>
            {hata && <div className="uyari uyari-hata">{hata}</div>}
            <ModSecici deger={mod} onDegis={setMod} id={`mod-${esya.id}`} />
            <div className="alan">
              <label htmlFor={`nick-${esya.id}`}>Oyun içi nick</label>
              <input
                id={`nick-${esya.id}`}
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                placeholder="Minecraft nickin"
                maxLength={16}
                required
              />
            </div>
            <button type="submit" className="dugme dugme-mor dugme-genis" disabled={bekliyor}>
              {bekliyor ? "Gönderiliyor" : "Etkinleştir"}
            </button>
          </form>
        )}
      </div>
    );
  }

  /* Bekleyen eşya */
  return (
    <div className="esya">
      <span className="esya-serit" style={{ background: renk }} />
      <div className="esya-ust">
        <div>
          <span className="kategori-rozet">{KATEGORI_ADI[kategori] || "Ürün"}</span>
          <h3 className="esya-ad" style={{ color: renk }}>
            {esya.paket_ad}
          </h3>
        </div>
        <span className="rozet" style={{ color: "var(--amber)" }}>
          Kullanılmadı
        </span>
      </div>

      <p className="sonuk kucuk">{aciklamaYaz(kategori, sure, Boolean(urun?.elle))}</p>

      {!acik ? (
        <button
          className="dugme dugme-vurgu dugme-genis"
          onClick={() => setAcik(true)}
          style={{ marginTop: 16 }}
        >
          Etkinleştir
        </button>
      ) : (
        <form onSubmit={etkinlestir} style={{ marginTop: 16 }}>
          {hata && <div className="uyari uyari-hata">{hata}</div>}

          <ModSecici deger={mod} onDegis={setMod} id={`mod-${esya.id}`} />

          <div className="alan">
            <label htmlFor={`nick-${esya.id}`}>Hangi nicke tanımlansın?</label>
            <input
              id={`nick-${esya.id}`}
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Minecraft nickin"
              maxLength={16}
              autoFocus
              required
            />
            <p className="ipucu">
              Dikkat: bir kez etkinleştirdikten sonra nick değiştirilemez.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="dugme dugme-mor" style={{ flex: 1 }} disabled={bekliyor}>
              {bekliyor ? "Gönderiliyor" : "Onayla"}
            </button>
            <button type="button" className="dugme" onClick={() => setAcik(false)}>
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SandikSayfasi() {
  const router = useRouter();
  const [oturum, setOturum] = useState(undefined);
  const [esyalar, setEsyalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yenile = async () => {
    try {
      setEsyalar((await sandigimiGetir()) || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!uyelikAktif) return;
    (async () => {
      const o = await benKim();
      if (!o.girisli) {
        router.replace("/giris");
        return;
      }
      setOturum(o);
      await yenile();
      setYukleniyor(false);
    })();
  }, [router]);

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

  if (oturum === undefined) {
    return (
      <div className="kapsayici" style={{ padding: "90px 24px" }}>
        <p className="sonuk">Yükleniyor…</p>
      </div>
    );
  }

  const bekleyen = esyalar.filter((e) => e.durum === "bekliyor" || e.durum === "hata").length;

  return (
    <section className="bolum" style={{ borderTop: "none" }}>
      <div className="kapsayici">
        <div className="bolum-bas">
          <p className="gozkasi">Sandık</p>
          <h1 className="baslik-l">Eşyaların</h1>
          <p>
            Satın aldığın rütbeler, Raid Alert ve aflar burada birikir.
            Etkinleştirdiğin an oyun içi hesabına otomatik tanımlanır — hazır olmadan açmana gerek yok.
          </p>
        </div>

        {bekleyen > 0 && (
          <div className="bakiye-serit" style={{ marginBottom: 24 }}>
            <span className="bakiye-etiket">Kullanılmayı bekleyen</span>
            <span className="bakiye-deger">{bekleyen} eşya</span>
          </div>
        )}

        {yukleniyor ? (
          <p className="sonuk">Yükleniyor…</p>
        ) : esyalar.length === 0 ? (
          <div className="discord-serit">
            <div>
              <h2 className="baslik-m">Sandığın boş</h2>
              <p>
                Mağazadan bir ürün aldığında ve ödemen onaylandığında burada görünecek.
              </p>
            </div>
            <Link href="/magaza" className="dugme dugme-vurgu">
              Mağazaya git
            </Link>
          </div>
        ) : (
          <div className="sandik">
            {esyalar.map((e) => (
              <EsyaKarti
                key={e.id}
                esya={e}
                varsayilanNick={oturum.kullanici?.nick}
                onGuncelle={yenile}
              />
            ))}
          </div>
        )}

        <p className="sonuk kucuk" style={{ marginTop: 26 }}>
          Sunucu adresi: <span className="mono">{SUNUCU.adres}</span> — Etkinleştirdikten sonra oyuna
          girip çıkman gerekebilir.
        </p>
      </div>
    </section>
  );
}
