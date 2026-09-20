"use client";

import { useEffect, useRef, useState } from "react";

/* Cevher renkleri — mor ağırlıklı, brand'e sadık */
const CEVHERLER = [
  { ad: "safir", zemin: "rgba(47, 128, 237, 0.16)", golge: "inset 0 0 26px rgba(47, 128, 237, 0.35), 0 0 20px rgba(47, 128, 237, 0.12)" },
  { ad: "safir", zemin: "rgba(47, 128, 237, 0.16)", golge: "inset 0 0 26px rgba(47, 128, 237, 0.35), 0 0 20px rgba(47, 128, 237, 0.12)" },
  { ad: "zumrut", zemin: "rgba(31, 157, 99, 0.14)", golge: "inset 0 0 26px rgba(31, 157, 99, 0.3), 0 0 20px rgba(31, 157, 99, 0.1)" },
  { ad: "altin", zemin: "rgba(184, 115, 15, 0.14)", golge: "inset 0 0 26px rgba(184, 115, 15, 0.3), 0 0 20px rgba(184, 115, 15, 0.1)" },
  { ad: "elmas", zemin: "rgba(79, 190, 216, 0.14)", golge: "inset 0 0 26px rgba(79, 190, 216, 0.3), 0 0 20px rgba(79, 190, 216, 0.1)" },
];

const HUCRE = 62; // blok boyutu (px)

function Izgara() {
  const ref = useRef(null);
  const [adet, setAdet] = useState(0);

  useEffect(() => {
    let zamanlayici;
    const hesapla = () => {
      const sutun = Math.ceil(window.innerWidth / HUCRE) + 1;
      const satir = Math.ceil(window.innerHeight / HUCRE) + 1;
      setAdet(sutun * satir);
    };
    const gecikmeli = () => {
      clearTimeout(zamanlayici);
      zamanlayici = setTimeout(hesapla, 200);
    };
    hesapla();
    window.addEventListener("resize", gecikmeli);
    return () => {
      clearTimeout(zamanlayici);
      window.removeEventListener("resize", gecikmeli);
    };
  }, []);

  useEffect(() => {
    if (!adet) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const zamanlayici = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const cocuklar = el.children;
      if (!cocuklar.length) return;

      // Her turda 1-3 blok birden yansın
      const kac = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < kac; i++) {
        const hedef = cocuklar[Math.floor(Math.random() * cocuklar.length)];
        if (!hedef || hedef.dataset.aktif === "1") continue;

        const cevher = CEVHERLER[Math.floor(Math.random() * CEVHERLER.length)];
        hedef.dataset.aktif = "1";
        hedef.style.background = cevher.zemin;
        hedef.style.boxShadow = cevher.golge;

        setTimeout(() => {
          hedef.style.background = "";
          hedef.style.boxShadow = "";
          delete hedef.dataset.aktif;
        }, 1600 + Math.random() * 1400);
      }
    }, 220);

    return () => clearInterval(zamanlayici);
  }, [adet]);

  return (
    <div className="ap-izgara" ref={ref}>
      {Array.from({ length: adet }).map((_, i) => (
        <div className="ap-blok" key={i} />
      ))}
    </div>
  );
}

function Parcaciklar() {
  const [zerreler, setZerreler] = useState([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renkler = ["rgba(47, 128, 237, 0.75)", "rgba(184, 115, 15, 0.55)", "rgba(91, 113, 137, 0.4)"];
    const liste = Array.from({ length: 34 }).map((_, i) => ({
      id: i,
      sol: Math.random() * 100,
      boyut: 1.5 + Math.random() * 3,
      sure: 14 + Math.random() * 16,
      gecikme: -Math.random() * 30,
      kayma: (Math.random() - 0.5) * 90,
      renk: renkler[Math.floor(Math.random() * renkler.length)],
    }));
    setZerreler(liste);
  }, []);

  return (
    <div className="ap-parcaciklar">
      {zerreler.map((z) => (
        <span
          key={z.id}
          className="ap-zerre"
          style={{
            left: `${z.sol}%`,
            width: `${z.boyut}px`,
            height: `${z.boyut}px`,
            background: z.renk,
            boxShadow: `0 0 ${z.boyut * 4}px ${z.renk}`,
            animationDuration: `${z.sure}s`,
            animationDelay: `${z.gecikme}s`,
            "--kayma": `${z.kayma}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function Arkaplan() {
  return (
    <div className="arkaplan" aria-hidden="true">
      <Izgara />
      <Parcaciklar />
      <div className="ap-hale" />
      <div className="ap-perde" />
    </div>
  );
}
