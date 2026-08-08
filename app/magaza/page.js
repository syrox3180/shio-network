import PaketKarti from "../../components/PaketKarti";
import { PAKETLER, SUNUCU } from "../../lib/ayarlar";

export const metadata = {
  title: `Mağaza — ${SUNUCU.ad}`,
  description: "Shio Network VIP paketleri: VIP, MVP, SVIP ve Sponsor.",
};

const ADIMLAR = [
  {
    baslik: "Paketini seç",
    metin: "Aşağıdaki paketlerden birinin satın alma butonuna bas.",
  },
  {
    baslik: "Ödemeyi yap",
    metin: "Ödeme sayfasında oyun içi nickini eksiksiz yaz. Paketin bu nicke tanımlanır.",
  },
  {
    baslik: "Paketin tanımlansın",
    metin: "Ödeme onaylandıktan sonra yetkili ekibi paketini hesabına işler ve Discord'dan bilgi verir.",
  },
];

export default function MagazaSayfasi() {
  return (
    <>
      <section className="bolum" style={{ borderTop: "none", paddingBottom: 0 }}>
        <div className="kapsayici">
          <div className="bolum-bas">
            <p className="gozkasi">Mağaza</p>
            <h1 className="baslik-l">VIP paketleri</h1>
            <p>
              Dört paket var, hepsi tek seferlik ödemeyle alınır ve hesabında süresiz kalır. Üst paketler alt paketlerin
              tüm ayrıcalıklarını kapsar.
            </p>
          </div>
        </div>
      </section>

      <section className="bolum" style={{ borderTop: "none", paddingTop: 40 }}>
        <div className="kapsayici">
          <div className="paketler">
            {PAKETLER.map((p) => (
              <PaketKarti paket={p} key={p.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="bolum">
        <div className="kapsayici">
          <div className="bolum-bas">
            <p className="gozkasi">Nasıl alınır</p>
            <h2 className="baslik-l">Üç adım</h2>
          </div>

          <div className="kartlar">
            {ADIMLAR.map((a, i) => (
              <div className="kart" key={a.baslik}>
                <p className="gozkasi" style={{ marginBottom: 12 }}>
                  Adım {i + 1}
                </p>
                <h3>{a.baslik}</h3>
                <p>{a.metin}</p>
              </div>
            ))}
          </div>

          <div className="discord-serit" style={{ marginTop: 44 }}>
            <div>
              <h2 className="baslik-m">Ödemede sorun mu çıktı?</h2>
              <p>
                Paketin tanımlanmadıysa veya ödeme sırasında bir aksilik olduysa Discord sunucumuzdan destek talebi aç.
                Ödeme dekontunu ve nickini yazman yeterli.
              </p>
            </div>
            <a href={SUNUCU.discord} target="_blank" rel="noreferrer" className="dugme dugme-mor">
              Destek al
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
