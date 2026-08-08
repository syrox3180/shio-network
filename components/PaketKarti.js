"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUNUCU, uyelikAktif } from "../lib/ayarlar";
import { oturumOku } from "../lib/kimlik";
import { siparisOlustur } from "../lib/veritabani";

export default function PaketKarti({ paket }) {
  const router = useRouter();
  const [durum, setDurum] = useState("hazir"); // hazir | bekliyor | tamam | hata
  const [mesaj, setMesaj] = useState("");

  const link = paket.satinAlLinki || SUNUCU.discord;

  const satinAl = async () => {
    // Üyelik kapalıysa eski davranış: doğrudan linke git
    if (!uyelikAktif) {
      window.open(link, "_blank", "noopener");
      return;
    }

    const oturum = oturumOku();
    if (!oturum) {
      router.push("/giris");
      return;
    }

    setDurum("bekliyor");
    setMesaj("");

    try {
      await siparisOlustur(paket);
      setDurum("tamam");
      setMesaj("Siparişin oluşturuldu. Ödeme sayfası açılıyor…");
      window.open(link, "_blank", "noopener");
    } catch (err) {
      setDurum("hata");
      setMesaj("Sipariş oluşturulamadı. Tekrar dener misin?");
      console.error(err);
    }
  };

  const butonMetni = () => {
    if (durum === "bekliyor") return "Oluşturuluyor";
    if (durum === "tamam") return "Sipariş verildi";
    if (!uyelikAktif) return paket.satinAlLinki ? "Satın al" : "Discord'dan al";
    return paket.satinAlLinki ? "Satın al" : "Sipariş ver";
  };

  return (
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
      <p className="paket-tek">Tek seferlik · Süresiz</p>

      <ul className="paket-liste">
        {paket.devami && <li className="paket-devam">{paket.devami} paketindeki her şey</li>}
        {paket.ayricaliklar.map((madde) => (
          <li key={madde} style={{ "--isaret": paket.renk }}>
            {madde}
          </li>
        ))}
      </ul>

      <button
        onClick={satinAl}
        disabled={durum === "bekliyor"}
        className={paket.oneCikan ? "dugme dugme-vurgu dugme-genis" : "dugme dugme-genis"}
      >
        {butonMetni()}
      </button>

      {mesaj && (
        <p className="paket-mesaj" style={{ color: durum === "hata" ? "var(--err)" : "var(--ok)" }}>
          {mesaj}
        </p>
      )}
    </div>
  );
}
