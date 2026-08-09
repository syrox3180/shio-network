"use client";

import { useEffect } from "react";

export default function OdemeSecimi({ paket, bakiye, onKapat, onShopier, onKredi }) {
  const krediYeter = typeof bakiye === "number" && bakiye >= paket.fiyat;
  const eksik = typeof bakiye === "number" ? Math.max(0, paket.fiyat - bakiye) : paket.fiyat;

  useEffect(() => {
    const tusa = (e) => {
      if (e.key === "Escape") onKapat();
    };
    document.addEventListener("keydown", tusa);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tusa);
      document.body.style.overflow = "";
    };
  }, [onKapat]);

  return (
    <div className="pencere-fon" onClick={onKapat} role="dialog" aria-modal="true">
      <div className="pencere" onClick={(e) => e.stopPropagation()}>
        <button className="pencere-kapat" onClick={onKapat} aria-label="Kapat">
          ✕
        </button>

        <p className="gozkasi" style={{ marginBottom: 10 }}>
          {paket.ad} · {paket.fiyat}₺
        </p>
        <h2 className="pencere-baslik">Nasıl ödemek istersin?</h2>

        <button className="secenek" onClick={onShopier}>
          <span className="secenek-ikon">💳</span>
          <span className="secenek-metin">
            <strong>Shopier ile öde</strong>
            <small>Kredi kartı, banka kartı veya havale · {paket.fiyat}₺</small>
          </span>
          <span className="secenek-ok">›</span>
        </button>

        <button
          className={krediYeter ? "secenek secenek-kredi" : "secenek secenek-pasif"}
          onClick={krediYeter ? onKredi : undefined}
          disabled={!krediYeter}
        >
          <span className="secenek-ikon">🪙</span>
          <span className="secenek-metin">
            <strong>Kredi ile öde</strong>
            <small>
              {krediYeter
                ? `Bakiyenden ${paket.fiyat} kredi düşülür · Kalan: ${bakiye - paket.fiyat}`
                : `Bakiyen: ${bakiye ?? 0} · ${eksik} kredi eksik`}
            </small>
          </span>
          <span className="secenek-ok">›</span>
        </button>

        {!krediYeter && (
          <p className="pencere-not">
            Kredi bakiyeni mağazadaki <strong>Kredi yükle</strong> bölümünden artırabilirsin.
          </p>
        )}
      </div>
    </div>
  );
}
