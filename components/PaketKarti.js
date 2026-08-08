import { SUNUCU } from "../lib/ayarlar";

export default function PaketKarti({ paket }) {
  const link = paket.satinAlLinki || SUNUCU.discord;
  const butonMetni = paket.satinAlLinki ? "Satın al" : "Discord'dan al";

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
        {paket.devami && (
          <li className="paket-devam">{paket.devami} paketindeki her şey</li>
        )}
        {paket.ayricaliklar.map((madde) => (
          <li key={madde} style={{ "--isaret": paket.renk }}>
            {madde}
          </li>
        ))}
      </ul>

      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={paket.oneCikan ? "dugme dugme-vurgu dugme-genis" : "dugme dugme-genis"}
      >
        {butonMetni}
      </a>
    </div>
  );
}
