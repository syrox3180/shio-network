import net from "net";

/*
  Minecraft sunucusuna RCON ile komut gönderir.
  server.properties dosyasında şunlar açık olmalı:
    enable-rcon=true
    rcon.port=25575
    rcon.password=guclu-bir-sifre
*/

const TUR_AUTH = 3;
const TUR_KOMUT = 2;

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

export function rconKomut(komut) {
  const sunucu = process.env.RCON_HOST;
  const port = Number(process.env.RCON_PORT || 25575);
  const sifre = process.env.RCON_SIFRE;

  if (!sunucu || !sifre) {
    return Promise.reject(new Error("RCON yapılandırılmamış."));
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
