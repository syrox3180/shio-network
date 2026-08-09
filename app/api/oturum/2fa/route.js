import { cookies } from "next/headers";
import { kullaniciAl } from "../../../../lib/oturum-sunucu";
import {
  kaynakGecerli, istekIp, hizSiniri, olayKaydet, discordUyari,
  gizliAnahtarUret, totpDogrula, otpauthAdresi,
  ikiFaktorGetir, ikiFaktorYaz, ikiFaktorSil,
  ikiFaktorJetonUret, ikiFaktorJetonGecerli,
} from "../../../../lib/guvenlik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CEREZ = "sn_2fa";
const CEREZ_AYARI = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

/* Durum sorgusu */
export async function GET() {
  const kullanici = await kullaniciAl();
  if (!kullanici?.id) return Response.json({ hata: "Giris gerekli." }, { status: 401 });

  const kayit = await ikiFaktorGetir(kullanici.id);
  const jeton = cookies().get(CEREZ)?.value;

  return Response.json({
    kurulu: Boolean(kayit?.aktif),
    dogrulandi: Boolean(kayit?.aktif) ? ikiFaktorJetonGecerli(jeton, kullanici.id) : true,
  });
}

export async function POST(request) {
  try {
    if (!kaynakGecerli(request)) {
      return Response.json({ hata: "Gecersiz istek." }, { status: 403 });
    }

    const kullanici = await kullaniciAl();
    if (!kullanici?.id) return Response.json({ hata: "Giris gerekli." }, { status: 401 });

    const ip = istekIp(request);
    const { islem, kod } = await request.json();

    /* ---- Kurulumu başlat: gizli anahtar üret ---- */
    if (islem === "baslat") {
      const mevcut = await ikiFaktorGetir(kullanici.id);
      if (mevcut?.aktif) {
        return Response.json({ hata: "Iki adimli dogrulama zaten kurulu." }, { status: 409 });
      }

      const gizli = gizliAnahtarUret();
      await ikiFaktorYaz(kullanici.id, gizli, false);

      return Response.json({
        gizli,
        adres: otpauthAdresi(gizli, kullanici.email),
      });
    }

    /* ---- Kod doğrula ---- */
    if (islem === "dogrula") {
      const sinir = await hizSiniri(`2fa:${kullanici.id}`, 6, 900, 30);
      if (!sinir.izin) {
        await olayKaydet("2fa_kilitlendi", { kullaniciId: kullanici.id, eposta: kullanici.email, ip });
        return Response.json(
          { hata: `Cok fazla hatali kod. ${sinir.kalanDakika} dakika sonra dene.` },
          { status: 429 }
        );
      }

      const kayit = await ikiFaktorGetir(kullanici.id);
      if (!kayit) return Response.json({ hata: "Once kurulumu baslat." }, { status: 400 });

      if (!totpDogrula(kayit.gizli_anahtar, kod)) {
        await olayKaydet("2fa_basarisiz", { kullaniciId: kullanici.id, eposta: kullanici.email, ip });
        return Response.json({ hata: "Kod hatali. Uygulamadaki guncel kodu gir." }, { status: 401 });
      }

      // İlk doğrulamaysa etkinleştir
      if (!kayit.aktif) {
        await ikiFaktorYaz(kullanici.id, kayit.gizli_anahtar, true);
        await olayKaydet("2fa_kuruldu", { kullaniciId: kullanici.id, eposta: kullanici.email, ip });
        await discordUyari(
          "Iki adimli dogrulama kuruldu",
          `**${kullanici.email}** hesabi icin 2FA etkinlestirildi.`,
          0x5fbf8b
        );
      }

      cookies().set(CEREZ, ikiFaktorJetonUret(kullanici.id), {
        ...CEREZ_AYARI,
        maxAge: 12 * 60 * 60,
      });

      return Response.json({ tamam: true });
    }

    /* ---- Kapat ---- */
    if (islem === "kapat") {
      const kayit = await ikiFaktorGetir(kullanici.id);
      if (!kayit?.aktif) return Response.json({ tamam: true });

      if (!totpDogrula(kayit.gizli_anahtar, kod)) {
        return Response.json({ hata: "Kod hatali." }, { status: 401 });
      }

      await ikiFaktorSil(kullanici.id);
      cookies().set(CEREZ, "", { ...CEREZ_AYARI, maxAge: 0 });

      await olayKaydet("2fa_kapatildi", { kullaniciId: kullanici.id, eposta: kullanici.email, ip });
      await discordUyari(
        "Iki adimli dogrulama kapatildi",
        `**${kullanici.email}** hesabi icin 2FA devre disi birakildi.`,
        0xed4245
      );

      return Response.json({ tamam: true });
    }

    return Response.json({ hata: "Bilinmeyen islem." }, { status: 400 });
  } catch (err) {
    console.error("2FA hatasi:", err);
    return Response.json({ hata: "Islem tamamlanamadi." }, { status: 500 });
  }
}
