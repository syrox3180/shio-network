"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uyelikAktif, SUNUCU } from "../../lib/ayarlar";
import { oturumOku, cikisYap } from "../../lib/kimlik";

export default function PanelSayfasi() {
  const router = useRouter();
  const [oturum, setOturum] = useState(undefined);

  useEffect(() => {
    if (!uyelikAktif) return;
    const o = oturumOku();
    if (!o) {
      router.replace("/giris");
      return;
    }
    setOturum(o);
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
  const kayitTarihi = oturum.kullanici?.created_at
    ? new Date(oturum.kullanici.created_at).toLocaleDateString("tr-TR")
    : "—";

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
            <span className="etiket" style={{ display: "block", fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
              Oyun içi nick
            </span>
            <span className="panel-nick">{nick}</span>
          </div>
          <button className="dugme" onClick={cikis}>
            Çıkış yap
          </button>
        </div>

        <div className="panel-kutular">
          <div className="panel-kutu">
            <span className="etiket">E-posta</span>
            <span className="deger">{eposta}</span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Kayıt tarihi</span>
            <span className="deger">{kayitTarihi}</span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Aktif paket</span>
            <span className="deger">Yok</span>
          </div>
          <div className="panel-kutu">
            <span className="etiket">Sunucu adresi</span>
            <span className="deger" style={{ fontFamily: "var(--mono)" }}>
              {SUNUCU.adres}
            </span>
          </div>
        </div>

        <div className="discord-serit" style={{ marginTop: 30 }}>
          <div>
            <h2 className="baslik-m">Henüz paketin yok</h2>
            <p>Mağazadan bir paket alıp oyun içi ayrıcalıkların kilidini açabilirsin.</p>
          </div>
          <Link href="/magaza" className="dugme dugme-vurgu">
            Mağazaya git
          </Link>
        </div>
      </div>
    </section>
  );
}
