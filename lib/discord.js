import { SUNUCU } from "./ayarlar";

/*
  Discord üye sayısını çeker. Bot tokenı ya da özel anahtar gerekmez.

  1. Yöntem — Davet API'si:
     Davet linkinden hem toplam üye hem o an çevrimiçi sayısı gelir.
     Davetin süresiz olması gerekir (Discord'da "Süre: Asla" seçili).

  2. Yöntem — Sunucu widget'ı (yedek):
     Discord → Sunucu Ayarları → Widget → "Sunucu Widget'ını Etkinleştir" açıksa
     çalışır. Sadece çevrimiçi sayısını verir.
*/

const SURE = 60_000; // 60 saniye önbellek
let onbellek = { zaman: 0, veri: null };

/* Davet linkinden kodu ayıklar: https://discord.gg/ABC123 → ABC123 */
export function davetKodu(adres = SUNUCU.discord) {
  if (!adres) return "";
  try {
    const yol = new URL(adres).pathname;
    return yol.split("/").filter(Boolean).pop() || "";
  } catch {
    return String(adres).split("/").filter(Boolean).pop() || "";
  }
}

async function davettenCek(kod) {
  const adres = `https://discord.com/api/v10/invites/${encodeURIComponent(
    kod
  )}?with_counts=true&with_expiration=true`;

  const res = await fetch(adres, {
    cache: "no-store",
    headers: { "User-Agent": "ShioNetwork-Site/1.0" },
  });

  if (!res.ok) throw new Error(`Davet okunamadı (${res.status})`);

  const veri = await res.json();

  return {
    sunucuId: veri.guild?.id || null,
    ad: veri.guild?.name || null,
    toplam: veri.approximate_member_count ?? null,
    online: veri.approximate_presence_count ?? null,
    kaynak: "davet",
  };
}

async function widgettanCek(sunucuId) {
  if (!sunucuId) throw new Error("Sunucu kimliği yok.");

  const res = await fetch(`https://discord.com/api/guilds/${sunucuId}/widget.json`, {
    cache: "no-store",
    headers: { "User-Agent": "ShioNetwork-Site/1.0" },
  });

  if (!res.ok) throw new Error(`Widget kapalı (${res.status})`);

  const veri = await res.json();

  return {
    sunucuId,
    ad: veri.name || null,
    toplam: null,
    online: veri.presence_count ?? null,
    kaynak: "widget",
  };
}

export async function discordSayilari() {
  const simdi = Date.now();

  // Önbellekteki veri tazeyse onu kullan (Discord'un hız sınırına takılmamak için)
  if (onbellek.veri && simdi - onbellek.zaman < SURE) {
    return { ...onbellek.veri, onbellekten: true };
  }

  const kod = davetKodu();
  let sonuc = null;
  let hata = null;

  if (kod) {
    try {
      sonuc = await davettenCek(kod);
    } catch (err) {
      hata = err.message;
    }
  }

  // Davet çalışmadıysa ya da sayılar boşsa widget'ı dene
  if (!sonuc || (sonuc.toplam === null && sonuc.online === null)) {
    const id = sonuc?.sunucuId || process.env.DISCORD_SUNUCU_ID || null;
    try {
      const yedek = await widgettanCek(id);
      sonuc = { ...(sonuc || {}), ...yedek, toplam: sonuc?.toplam ?? yedek.toplam };
    } catch (err) {
      hata = hata || err.message;
    }
  }

  if (!sonuc) {
    // Eski veri varsa bayat da olsa onu ver — ekranda boşluk görünmesin
    if (onbellek.veri) return { ...onbellek.veri, bayat: true, hata };
    return { toplam: null, online: null, hata: hata || "Discord'a ulaşılamadı." };
  }

  onbellek = { zaman: simdi, veri: sonuc };
  return sonuc;
}
