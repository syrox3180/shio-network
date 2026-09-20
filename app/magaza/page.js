import MagazaSekmeleri from "../../components/MagazaSekmeleri";
import KrediBolumu from "../../components/KrediBolumu";
import { SUNUCU } from "../../lib/ayarlar";
import DiscordSayac from "../../components/DiscordSayac";

export const metadata = {
  title: `Mağaza — ${SUNUCU.ad}`,
  description: "Shio Network mağazası: VIP paketleri, Raid Alert, unban ve blacklist affı.",
};

const ADIMLAR = [
  {
    baslik: "Ürününü seç",
    metin: "Sekmelerden bölümü seç, istediğin ürünün satın alma butonuna bas.",
  },
  {
    baslik: "Ödemeyi yap",
    metin: "Ödeme sayfasında oyun içi nickini eksiksiz yaz. Paketin bu nicke tanımlanır.",
  },
  {
    baslik: "Sandıktan etkinleştir",
    metin: "Ödemen onaylanınca ürün sandığına düşer. Sandıktan etkinleştirdiğin an oyuna otomatik tanımlanır.",
  },
];

export default function MagazaSayfasi() {
  return (
    <>
      <section className="bolum" style={{ borderTop: "none", paddingBottom: 0 }}>
        <div className="kapsayici">
          <div className="bolum-bas">
            <p className="gozkasi">Mağaza</p>
            <h1 className="baslik-l">Tüm ürünler</h1>
            <p>
              Rütbeler, Raid Alert ve ceza afları. Aldığın her ürün sandığına düşer;
              hazır olduğunda etkinleştirir, oyun içinde anında alırsın.
            </p>
          </div>
        </div>
      </section>

      <section className="bolum" style={{ borderTop: "none", paddingTop: 40 }}>
        <div className="kapsayici">
          <MagazaSekmeleri />
        </div>
      </section>

      <KrediBolumu />

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
              <DiscordSayac />
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
