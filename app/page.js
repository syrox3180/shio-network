import Link from "next/link";
import Hero from "../components/Hero";
import PaketKarti from "../components/PaketKarti";
import { OZELLIKLER, PAKETLER, SUNUCU } from "../lib/ayarlar";

export default function AnaSayfa() {
  return (
    <>
      <Hero />

      <section className="bolum">
        <div className="kapsayici">
          <div className="bolum-bas">
            <p className="gozkasi">Sunucuda ne var</p>
            <h2 className="baslik-l">Kutudan başlıyorsun</h2>
            <p>
              Sunucuya girdiğin an sana ait bir kutu açılır. Gerisi tamamen senin nasıl oynadığına bağlı.
            </p>
          </div>

          <div className="kartlar">
            {OZELLIKLER.map((o) => (
              <div className="kart" key={o.baslik}>
                <h3>{o.baslik}</h3>
                <p>{o.metin}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bolum">
        <div className="kapsayici">
          <div className="bolum-bas">
            <p className="gozkasi">Mağaza</p>
            <h2 className="baslik-l">VIP paketleri</h2>
            <p>
              Paketler tek seferlik alınır ve hesabında süresiz kalır. Ödeme sonrası yetkili ekibi paketini oyun içi
              hesabına tanımlar.
            </p>
          </div>

          <div className="paketler">
            {PAKETLER.map((p) => (
              <PaketKarti paket={p} key={p.id} />
            ))}
          </div>

          <p style={{ marginTop: 28 }}>
            <Link href="/magaza" className="dugme">
              Paket detayları
            </Link>
          </p>
        </div>
      </section>

      <section className="bolum">
        <div className="kapsayici">
          <div className="discord-serit">
            <div>
              <h2 className="baslik-m">Discord'da buluşalım</h2>
              <p>
                Duyurular, etkinlikler, yetkili başvuruları ve destek talepleri Discord sunucumuzda. Bir sorunun olursa
                en hızlı cevabı buradan alırsın.
              </p>
            </div>
            <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme dugme-mor">
              Sunucuya katıl
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
