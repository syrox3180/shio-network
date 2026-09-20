"use client";

import { useEffect, useState, useCallback } from "react";
import PaketKarti from "./PaketKarti";
import { PAKETLER, uyelikAktif } from "../lib/ayarlar";
import { benKim } from "../lib/kimlik";

export default function PaketListesi() {
  const [bakiye, setBakiye] = useState(null);
  const [girisli, setGirisli] = useState(false);

  const bakiyeCek = useCallback(async () => {
    if (!uyelikAktif) return;
    const oturum = await benKim();
    setGirisli(oturum.girisli);
    if (oturum.girisli) setBakiye(oturum.kredi ?? 0);
  }, []);

  useEffect(() => {
    bakiyeCek();
  }, [bakiyeCek]);

  return (
    <>
      {uyelikAktif && girisli && (
        <div className="bakiye-serit">
          <span className="bakiye-etiket">Kredi bakiyen</span>
          <span className="bakiye-deger">{bakiye === null ? "…" : bakiye} 🪙</span>
        </div>
      )}

      <div className="paketler">
        {PAKETLER.map((p) => (
          <PaketKarti key={p.id} paket={p} bakiye={bakiye} girisli={girisli} onDegisim={bakiyeCek} />
        ))}
      </div>
    </>
  );
}
