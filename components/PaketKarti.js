"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUNUCU, uyelikAktif, shopierAktif } from "../lib/ayarlar";
import { siparisOlustur, krediIleAl, shopierOdemeyeGit } from "../lib/veritabani";
import OdemeSecimi from "./OdemeSecimi";

export default function PaketKarti({ paket, bakiye, girisli, onDegisim }) {
  const router = useRouter();
  const [durum, setDurum] = useState("hazir");
  const [mesaj, setMesaj] = useState("");
  const [hataMi, setHataMi] = useState(false);
  const [pencere, setPencere] = useState(false);

  const link = paket.satinAlLinki || SUNUCU.discord;

  /* Ana butona basıldığında */
  const basla = () => {
    // Üyelik kapalıysa doğrudan linke git
    if (!uyelikAktif) {
      window.open(link, "_blank", "noopener");
      return;
    }
    if (!girisli) {
      router.push("/giris");
      return;
    }
    setPencere(true);
  };

  /* Shopier ile ödeme */
  const shopierIle = async () => {
    setPencere(false);
    setDurum("bekliyor");
    setMesaj("");
    setHataMi(false);

    try {
      const siparis = await siparisOlustur(paket);

      // Shopier API kuruluysa doğrudan ödeme sayfasına gönder
      if (shopierAktif && !paket.satinAlLinki) {
        setMesaj("Ödeme sayfasına yönlendiriliyorsun…");
        await shopierOdemeyeGit(siparis.id);
        return;
      }

      setDurum("tamam");
      setMesaj(
        paket.satinAlLinki
          ? "Sipariş kaydın oluştu. Ödeme sayfasında oyun içi nickini yazmayı unutma."
          : "Siparişin oluşturuldu. Discord'dan yetkiliyle iletişime geç."
      );
      window.open(link, "_blank", "noopener");
      onDegisim?.();
    } catch (err) {
      setDurum("hazir");
      setHataMi(true);
      setMesaj("Sipariş oluşturulamadı, tekrar dene.");
      console.error(err);
    }
  };

  /* Kredi ile ödeme */
  const krediIle = async () => {
    setPencere(false);
    setDurum("bekliyor");
    setMesaj("");
    setHataMi(false);

    try {
      await krediIleAl(paket.id);
      setDurum("tamam");
      setMesaj(`${paket.fiyat} kredi düşüldü. Paketin en kısa sürede tanımlanacak.`);
      onDegisim?.();
    } catch (err) {
      setDurum("hazir");
      setHataMi(true);
      setMesaj(err.message || "İşlem tamamlanamadı.");
    }
  };

  const butonMetni = () => {
    if (durum === "bekliyor") return "İşleniyor";
    if (durum === "tamam") return "Sipariş verildi";
    if (!uyelikAktif) return paket.satinAlLinki ? "Satın al" : "Discord'dan al";
    if (!girisli) return "Giriş yap ve al";
    return `Satın al · ${paket.fiyat}₺`;
  };

  return (
    <>
      <div className={paket.oneCikan ? "paket paket-one" : "paket"}>
        <span className="paket-serit" style={{ background: paket.renk }} />
        {paket.oneCikan && <span className="paket-etiket">En üst seviye</span>}

        <h3 className="paket-ad" style={{ color: paket.renk }}>
          {paket.ad}
        </h3>
        <p className="paket-ozet">{paket.ozet}</p>

        <div className="paket-fiyat">
          {paket.fiyat}
          <span>₺</span>
        </div>
        <p className="paket-tek">
          Tek seferlik · Süresiz{uyelikAktif ? ` · ${paket.fiyat} 🪙` : ""}
        </p>

        <ul className="paket-liste">
          {paket.devami && <li className="paket-devam">{paket.devami} paketindeki her şey</li>}
          {paket.ayricaliklar.map((madde) => (
            <li key={madde} style={{ "--isaret": paket.renk }}>
              {madde}
            </li>
          ))}
        </ul>

        <button
          onClick={basla}
          disabled={durum === "bekliyor"}
          className={paket.oneCikan ? "dugme dugme-vurgu dugme-genis" : "dugme dugme-genis"}
        >
          {butonMetni()}
        </button>

        {mesaj && (
          <p className="paket-mesaj" style={{ color: hataMi ? "var(--err)" : "var(--ok)" }}>
            {mesaj}
          </p>
        )}
      </div>

      {pencere && (
        <OdemeSecimi
          paket={paket}
          bakiye={bakiye}
          onKapat={() => setPencere(false)}
          onShopier={shopierIle}
          onKredi={krediIle}
        />
      )}
    </>
  );
}
