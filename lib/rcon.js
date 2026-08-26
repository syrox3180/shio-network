import net from "net";

/*
  Minecraft sunucusuna RCON ile komut gönderir.
  server.properties dosyasında şunlar açık olmalı:
    enable-rcon=true
    rcon.port=25575
    rcon.password=guclu-bir-sifre

  Boxmining ve Prac birbirinden tamamen ayrı sunucular olduğu için
  her birinin kendi bağlantı bilgisi ayrı env değişkenlerinde tutulur.
*/

const TUR_AUTH = 3;
const TUR_KOMUT = 2;

const SUNUCU_ENV = {
  boxmining: { host: "RCON_HOST_BOXMINING", port: "RCON_PORT_BOXMINING", sifre: "RCON_SIFRE_BOXMINING" },
  prac: { host: "RCON_HOST_PRAC", port: "RCON_PORT_PRAC", sifre: "RCON_SIFRE_PRAC" },
};

function paketOlustur(id, tur, govde) {
  const icerik = Buffer.from(govde, "utf8");
  const tampon = Buffer.alloc(icerik.length + 14);

  tampon.writeInt32LE(icerik.length + 10, 0);
  tampon.writeInt32LE(id, 4);
  tampon.writeInt32LE(tur, 8);
  icerik.copy(tampon, 12);
  tampon.writeInt16LE(0, icerik.length + 12);

  return tampon;
}

export function rconKomut(komut, sunucuAdi) {
  const anahtar = SUNUCU_ENV[sunucuAdi];
  if (!anahtar) {
    return Promise.reject(new Error(`Geçersiz sunucu: ${sunucuAdi}`));
  }

  const sunucu = process.env[anahtar.host];
  const port = Number(process.env[anahtar.port] || 25575);
  const sifre = process.env[anahtar.sifre];

  if (!sunucu || !sifre) {
    return Promise.reject(new Error(`${sunucuAdi} sunucusu için RCON yapılandırılmamış.`));
  }

  return new Promise((cozumle, reddet) => {
    const baglanti = new net.Socket();
    let tampon = Buffer.alloc(0);
    let girisYapildi = false;
    let bitti = false;

    const kapat = (hata, sonuc) => {
      if (bitti) return;
      bitti = true;
      baglanti.destroy();
      hata ? reddet(hata) : cozumle(sonuc);
    };

    baglanti.setTimeout(8000);
    baglanti.on("timeout", () => kapat(new Error("Sunucuya ulaşılamadı (zaman aşımı).")));
    baglanti.on("error", (err) => kapat(new Error(`Sunucuya bağlanılamadı: ${err.message}`)));

    baglanti.connect(port, sunucu, () => {
      baglanti.write(paketOlustur(1, TUR_AUTH, sifre));
    });

    baglanti.on("data", (veri) => {
      tampon = Buffer.concat([tampon, veri]);

      while (tampon.length >= 12) {
        const uzunluk = tampon.readInt32LE(0);
        if (tampon.length < uzunluk + 4) break;

        const id = tampon.readInt32LE(4);
        const govde = tampon.toString("utf8", 12, uzunluk + 2);
        tampon = tampon.subarray(uzunluk + 4);

        if (!girisYapildi) {
          if (id === -1) return kapat(new Error("RCON şifresi hatalı."));
          girisYapildi = true;
          baglanti.write(paketOlustur(2, TUR_KOMUT, komut));
          continue;
        }

        return kapat(null, govde);
      }
    });
  });
}
