import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DISCORD_WEBHOOK = process.env.DISCORD_GUVENLIK_WEBHOOK || "";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "";

export const turnstileAktif = Boolean(TURNSTILE_SECRET);

/* ============ Servis anahtarıyla veritabanı ============ */
async function servisIstek(yol, secenekler = {}) {
  if (!SERVICE_KEY) return null;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${yol}`, {
    ...secenekler,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...(secenekler.headers || {}),
    },
  });

  if (!res.ok) return null;
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

function servisRpc(isim, govde) {
  return servisIstek(`rpc/${isim}`, { method: "POST", body: JSON.stringify(govde || {}) });
}

/* ============ İstek kaynağı doğrulama (CSRF) ============ */
export function kaynakGecerli(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Origin yoksa (aynı sayfa gezinmeleri) engelleme
  if (!origin) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ============ IP ve parmak izi ============ */
export function istekIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "bilinmiyor"
  );
}

export function ipOzeti(ip) {
  return crypto.createHash("sha256").update(`shio:${ip}`).digest("hex").slice(0, 32);
}

/* ============ Kalıcı hız sınırlama ============ */
export async function hizSiniri(anahtar, limit = 6, pencereSaniye = 600, kilitDakika = 15) {
  const sonuc = await servisRpc("deneme_kaydet", {
    p_anahtar: anahtar,
    p_limit: limit,
    p_pencere_saniye: pencereSaniye,
    p_kilit_dakika: kilitDakika,
  });

  // Veritabanına ulaşılamazsa isteği engelleme, sadece geç
  if (!sonuc) return { izin: true };

  if (sonuc.izin === false) {
    const dakika = Math.max(1, Math.ceil((sonuc.kalan_saniye || 60) / 60));
    return { izin: false, kalanDakika: dakika };
  }

  return { izin: true, sayac: sonuc.sayac };
}

export function sayaciSifirla(anahtar) {
  return servisRpc("deneme_sifirla", { p_anahtar: anahtar });
}

/* ============ Güvenlik günlüğü ============ */
export async function olayKaydet(olay, bilgi = {}) {
  try {
    await servisIstek("guvenlik_kayitlari", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        olay,
        kullanici_id: bilgi.kullaniciId || null,
        eposta: bilgi.eposta || null,
        ip: bilgi.ip || null,
        detay: bilgi.detay || null,
      }),
    });
  } catch (err) {
    console.error("Guvenlik kaydi yazilamadi:", err);
  }
}

/* ============ Discord bildirimi ============ */
export async function discordUyari(baslik, aciklama, renk = 0xf0a63c) {
  if (!DISCORD_WEBHOOK) return;

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: baslik,
            description: aciklama,
            color: renk,
            timestamp: new Date().toISOString(),
            footer: { text: "Shio Network Güvenlik" },
          },
        ],
      }),
    });
  } catch (err) {
    console.error("Discord uyarisi gonderilemedi:", err);
  }
}

/* ============ Yeni cihazdan giriş tespiti ============ */
export async function girisKaydet(kullaniciId, ip) {
  const sonuc = await servisRpc("giris_kaydet", {
    p_kullanici: kullaniciId,
    p_ip_ozet: ipOzeti(ip),
  });
  return sonuc === true;
}

/* ============ Cloudflare Turnstile doğrulama ============ */
export async function turnstileDogrula(jeton, ip) {
  if (!TURNSTILE_SECRET) return true; // kurulu değilse atla
  if (!jeton) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: jeton, remoteip: ip }),
    });
    const veri = await res.json();
    return veri.success === true;
  } catch {
    return false;
  }
}

/* ============ İki adımlı doğrulama (TOTP) ============ */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function gizliAnahtarUret() {
  const bayt = crypto.randomBytes(20);
  let bit = 0;
  let deger = 0;
  let sonuc = "";

  for (const b of bayt) {
    deger = (deger << 8) | b;
    bit += 8;
    while (bit >= 5) {
      sonuc += B32[(deger >>> (bit - 5)) & 31];
      bit -= 5;
    }
  }
  if (bit > 0) sonuc += B32[(deger << (5 - bit)) & 31];

  return sonuc;
}

function base32Coz(metin) {
  let bit = 0;
  let deger = 0;
  const bayt = [];

  for (const harf of metin.replace(/=+$/, "").toUpperCase()) {
    const indeks = B32.indexOf(harf);
    if (indeks === -1) continue;
    deger = (deger << 5) | indeks;
    bit += 5;
    if (bit >= 8) {
      bayt.push((deger >>> (bit - 8)) & 255);
      bit -= 8;
    }
  }

  return Buffer.from(bayt);
}

function totpUret(gizli, adim) {
  const tampon = Buffer.alloc(8);
  tampon.writeUInt32BE(Math.floor(adim / 0x100000000), 0);
  tampon.writeUInt32BE(adim >>> 0, 4);

  const ozet = crypto.createHmac("sha1", base32Coz(gizli)).update(tampon).digest();
  const konum = ozet[ozet.length - 1] & 0x0f;
  const kod =
    ((ozet[konum] & 0x7f) << 24) |
    ((ozet[konum + 1] & 0xff) << 16) |
    ((ozet[konum + 2] & 0xff) << 8) |
    (ozet[konum + 3] & 0xff);

  return String(kod % 1000000).padStart(6, "0");
}

/* Kodu doğrular. Saat kayması için önceki ve sonraki 30 saniyeyi de kabul eder. */
export function totpDogrula(gizli, kod) {
  const temiz = String(kod || "").replace(/\D/g, "");
  if (temiz.length !== 6) return false;

  const simdikiAdim = Math.floor(Date.now() / 1000 / 30);

  for (let fark = -1; fark <= 1; fark++) {
    const beklenen = totpUret(gizli, simdikiAdim + fark);
    const a = Buffer.from(beklenen);
    const b = Buffer.from(temiz);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }

  return false;
}

export function otpauthAdresi(gizli, eposta) {
  return `otpauth://totp/${encodeURIComponent(`Shio Network:${eposta}`)}?secret=${gizli}&issuer=Shio%20Network&algorithm=SHA1&digits=6&period=30`;
}

/* ============ 2FA veritabanı işlemleri ============ */
export async function ikiFaktorGetir(kullaniciId) {
  const liste = await servisIstek(`yonetici_2fa?select=*&kullanici_id=eq.${kullaniciId}`);
  return Array.isArray(liste) ? liste[0] || null : null;
}

export async function ikiFaktorYaz(kullaniciId, gizli, aktif) {
  return servisIstek("yonetici_2fa", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ kullanici_id: kullaniciId, gizli_anahtar: gizli, aktif }),
  });
}

export async function ikiFaktorSil(kullaniciId) {
  return servisIstek(`yonetici_2fa?kullanici_id=eq.${kullaniciId}`, { method: "DELETE" });
}

/* ============ 2FA oturum çerezi imzası ============ */
const IMZA_ANAHTARI = process.env.OTURUM_IMZA_ANAHTARI || SERVICE_KEY || "shio-varsayilan";

export function ikiFaktorJetonUret(kullaniciId) {
  const bitis = Date.now() + 12 * 60 * 60 * 1000; // 12 saat
  const govde = `${kullaniciId}.${bitis}`;
  const imza = crypto.createHmac("sha256", IMZA_ANAHTARI).update(govde).digest("hex");
  return `${govde}.${imza}`;
}

export function ikiFaktorJetonGecerli(jeton, kullaniciId) {
  if (!jeton) return false;

  const parcalar = String(jeton).split(".");
  if (parcalar.length !== 3) return false;

  const [id, bitis, imza] = parcalar;
  if (id !== kullaniciId) return false;
  if (Number(bitis) < Date.now()) return false;

  const beklenen = crypto
    .createHmac("sha256", IMZA_ANAHTARI)
    .update(`${id}.${bitis}`)
    .digest("hex");

  const a = Buffer.from(beklenen);
  const b = Buffer.from(imza);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
