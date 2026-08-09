import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const ERISIM_CEREZ = "sn_erisim";
export const YENILEME_CEREZ = "sn_yenileme";

const CEREZ_AYARI = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

/* -------- Oturumu çerezlere yaz -------- */
export function oturumuYaz(veri) {
  const kutu = cookies();
  const omur = Number(veri.expires_in || 3600);

  kutu.set(ERISIM_CEREZ, veri.access_token, { ...CEREZ_AYARI, maxAge: omur });

  if (veri.refresh_token) {
    kutu.set(YENILEME_CEREZ, veri.refresh_token, {
      ...CEREZ_AYARI,
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });
  }
}

/* -------- Oturumu temizle -------- */
export function oturumuSil() {
  const kutu = cookies();
  kutu.set(ERISIM_CEREZ, "", { ...CEREZ_AYARI, maxAge: 0 });
  kutu.set(YENILEME_CEREZ, "", { ...CEREZ_AYARI, maxAge: 0 });
}

/* -------- Geçerli erişim token'ı al, gerekirse yenile -------- */
export async function tokenAl() {
  const kutu = cookies();
  const erisim = kutu.get(ERISIM_CEREZ)?.value;
  if (erisim) return erisim;

  const yenileme = kutu.get(YENILEME_CEREZ)?.value;
  if (!yenileme) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: JSON.stringify({ refresh_token: yenileme }),
    });

    if (!res.ok) {
      oturumuSil();
      return null;
    }

    const veri = await res.json();
    if (!veri.access_token) {
      oturumuSil();
      return null;
    }

    oturumuYaz(veri);
    return veri.access_token;
  } catch {
    return null;
  }
}

/* -------- Oturumdaki kullanıcıyı getir -------- */
export async function kullaniciAl() {
  const token = await tokenAl();
  if (!token) return null;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    cache: "no-store",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

/* -------- Supabase auth çağrısı -------- */
export async function authIstek(yol, govde, ekBaslik = {}) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${yol}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY, ...ekBaslik },
    body: JSON.stringify(govde),
  });

  const veri = await res.json().catch(() => ({}));
  return { ok: res.ok, durum: res.status, veri };
}

/* -------- Hata metinlerini Türkçeleştir -------- */
export function hataCevir(mesaj = "") {
  const m = String(mesaj).toLowerCase();
  if (m.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Bu e-posta ile zaten bir hesap var.";
  if (m.includes("password should be")) return "Şifre en az 8 karakter olmalı.";
  if (m.includes("unable to validate email") || m.includes("invalid format"))
    return "E-posta adresi geçerli görünmüyor.";
  if (m.includes("email not confirmed")) return "Önce e-postandaki doğrulama bağlantısına tıkla.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.";
  if (m.includes("duplicate key") && m.includes("nick"))
    return "Bu nick başka bir hesapta kayıtlı.";
  if (m.includes("new password should be different"))
    return "Yeni şifren eskisiyle aynı olamaz.";
  return "İşlem tamamlanamadı. Lütfen tekrar dene.";
}

/* -------- Basit hız sınırlaması (aynı IP'den ard arda deneme) -------- */
const denemeler = new Map();

export function hizSiniri(anahtar, limit = 8, pencereMs = 10 * 60 * 1000) {
  const simdi = Date.now();
  const kayit = denemeler.get(anahtar);

  if (!kayit || simdi - kayit.baslangic > pencereMs) {
    denemeler.set(anahtar, { baslangic: simdi, sayi: 1 });
    return { izin: true };
  }

  kayit.sayi += 1;

  if (kayit.sayi > limit) {
    const kalan = Math.ceil((pencereMs - (simdi - kayit.baslangic)) / 60000);
    return { izin: false, kalanDakika: Math.max(1, kalan) };
  }

  return { izin: true };
}

export function istekIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "bilinmiyor"
  );
}
