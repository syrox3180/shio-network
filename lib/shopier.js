import crypto from "crypto";

export const SHOPIER_ODEME_URL = "https://www.shopier.com/ShowProduct/api_pay4.php";

export const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY || "";
export const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET || "";
export const shopierAktif = Boolean(SHOPIER_API_KEY && SHOPIER_API_SECRET);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/* -------- İmza üretimi -------- */
export function imzaOlustur(randomNr, siparisNo, tutar, paraBirimi) {
  return crypto
    .createHmac("sha256", SHOPIER_API_SECRET)
    .update(`${randomNr}${siparisNo}${tutar}${paraBirimi}`)
    .digest("base64");
}

/* -------- Gelen bildirimin imzasını doğrula -------- */
export function imzaDogrula(veri) {
  const gelen = veri.signature;
  if (!gelen) return false;

  const randomNr = veri.random_nr ?? "";
  const siparisNo = veri.platform_order_id ?? "";
  const tutar = veri.total_order_value ?? "";
  const paraBirimi = veri.currency ?? "";

  // Shopier'in iki farklı imza biçimi kullanan sürümleri var, ikisini de kabul et
  const adaylar = [
    `${randomNr}${siparisNo}${tutar}${paraBirimi}`,
    `${randomNr}${siparisNo}`,
  ];

  for (const veriMetni of adaylar) {
    const beklenen = crypto
      .createHmac("sha256", SHOPIER_API_SECRET)
      .update(veriMetni)
      .digest("base64");

    const a = Buffer.from(beklenen);
    const b = Buffer.from(gelen);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }

  return false;
}

/* -------- Servis anahtarıyla veritabanı erişimi (RLS'i atlar) -------- */
export async function yonetimIstek(yol, secenekler = {}) {
  if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY tanımlı değil.");

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

  if (!res.ok) {
    const metin = await res.text();
    throw new Error(`Veritabanı hatası: ${metin}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

/* -------- Kullanıcının oturum token'ını doğrula -------- */
export async function kullaniciDogrula(token) {
  if (!token) return null;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    cache: "no-store",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return res.json();
}
