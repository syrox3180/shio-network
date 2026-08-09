"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KREDI_PAKETLERI, uyelikAktif, shopierAktif, SUNUCU } from "../lib/ayarlar";
import { oturumOku } from "../lib/kimlik";
import { profilimiGetir, krediSiparisiOlustur, shopierOdemeyeGit } from "../lib/veritabani";

function KrediKarti({ paket, girisli, onDegisim }) {
  const router = useRouter();
  const [durum, setDurum] = useState("hazir");
  const [mesaj, setMesaj] = useState("");
  const [hataMi, setHataMi] = useState(false);

  const toplam = paket.kredi + (paket.bonus || 0);

  const siparisVer = async () => {
    if (!girisli) {
      router.push("/giris");
      return;
    }

    setDurum("bekliyor");
    setMesaj("");
    setHataMi(false);

    try {
      const siparis = await krediSiparisiOlustur(paket.id);

      // 1) Kendi Shopier ürün linki varsa oraya gönder
      if (paket.satinAlLinki) {
        setDurum("tamam");
        setMesaj("Sipariş kaydın oluştu. Ödeme sayfasında oyun içi nickini yazmayı unutma.");
        window.open(paket.satinAlLinki, "_blank", "noopener");
        onDegisim?.();
        return;
      }

      // 2) Shopier API kuruluysa doğrudan ödeme sayfası
      if (shopierAktif) {
        setMesaj("Ödeme sayfasına yönlendiriliyorsun…");
        await shopierOdemeyeGit(siparis.id);
        return;
      }

      // 3) Hiçbiri yoksa Discord
      setDurum("tamam");
      setMesaj("Siparişin alındı. Ödemen onaylanınca kredin yüklenecek.");
      window.open(SUNUCU.discord, "_blank", "noopener");
      onDegisim?.();
    } catch (err) {
      setDurum("hazir");
      setHataMi(true);
      setMesaj(err.message || "İşlem tamamlanamadı.");
    }
  };

  return (
    <div className={paket.populer ? "kredi-kart kredi-populer" : "kredi-kart"}>
      {paket.populer && <span className="kredi-rozet">En çok tercih edilen</span>}

      <div className="kredi-miktar">
        {toplam}
        <span>🪙</span>
      </div>

      {paket.bonus > 0 ? (
        <p className="kredi-bonus">
          {paket.kredi} + <strong>{paket.bonus} bonus</strong>
        </p>
      ) : (
        <p className="kredi-bonus sonuk">Bonussuz paket</p>
      )}

      <div className="kredi-fiyat">{paket.fiyat}₺</div>

      <button
        onClick={siparisVer}
        disabled={durum === "bekliyor" || durum === "tamam"}
        className={paket.populer ? "dugme dugme-vurgu dugme-genis" : "dugme dugme-genis"}
      >
        {durum === "bekliyor" ? "İşleniyor" : durum === "tamam" ? "Sipariş verildi" : "Kredi al"}
      </button>

      {mesaj && (
        <p className="paket-mesaj" style={{ color: hataMi ? "var(--err)" : "var(--ok)" }}>
          {mesaj}
        </p>
      )}
    </div>
  );
}

export default function KrediBolumu() {
  const [bakiye, setBakiye] = useState(null);
  const [girisli, setGirisli] = useState(false);

  const bakiyeCek = useCallback(async () => {
    if (!uyelikAktif) return;
    const oturum = oturumOku();
    setGirisli(Boolean(oturum));
    if (!oturum) return;
    try {
      const profil = await profilimiGetir();
      setBakiye(profil?.kredi ?? 0);
    } catch {
      setBakiye(0);
    }
  }, []);

  useEffect(() => {
    bakiyeCek();
  }, [bakiyeCek]);

  if (!uyelikAktif) return null;

  return (
    <section className="bolum">
      <div className="kapsayici">
        <div className="bolum-bas">
          <p className="gozkasi">Kredi</p>
          <h2 className="baslik-l">Kredi yükle</h2>
          <p>
            Kredi, sitedeki para birimimiz. 1 kredi = 1 ₺ değerinde. Yüklediğin krediyle istediğin
            VIP paketini anında alabilirsin — büyük paketlerde bonus kredi hediye.
          </p>
        </div>

        {girisli && (
          <div className="bakiye-serit" style={{ marginBottom: 24 }}>
            <span className="bakiye-etiket">Kredi bakiyen</span>
            <span className="bakiye-deger">{bakiye === null ? "…" : bakiye} 🪙</span>
          </div>
        )}

        <div className="kredi-liste">
          {KREDI_PAKETLERI.map((p) => (
            <KrediKarti key={p.id} paket={p} girisli={girisli} onDegisim={bakiyeCek} />
          ))}
        </div>

        <p className="sonuk kucuk" style={{ marginTop: 22 }}>
          {shopierAktif
            ? "Ödemeni tamamladığın anda kredin hesabına otomatik yüklenir, beklemene gerek yok."
            : "Kredi siparişi verdiğinde Discord'a yönlendirilirsin. Ödemeni yaptıktan sonra yetkili ekibi siparişini onaylar ve kredin hesabına yüklenir."}
        </p>
      </div>
    </section>
  );
}
