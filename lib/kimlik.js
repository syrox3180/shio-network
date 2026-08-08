"use client";

import { SUPABASE_URL, SUPABASE_KEY } from "./ayarlar";

const ANAHTAR = "shio_oturum";

function baslik() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
  };
}

/* Supabase'in döndürdüğü hata metinlerini Türkçeleştir */
function hataCevir(mesaj = "") {
  const m = String(mesaj).toLowerCase();
  if (m.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Bu e-posta ile zaten bir hesap var.";
  if (m.includes("password should be")) return "Şifre en az 6 karakter olmalı.";
  if (m.includes("unable to validate email") || m.includes("invalid format"))
    return "E-posta adresi geçerli görünmüyor.";
  if (m.includes("email not confirmed")) return "Önce e-postandaki doğrulama bağlantısına tıkla.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Çok fazla deneme yaptın. Birkaç dakika sonra tekrar dene.";
  return mesaj || "Beklenmedik bir hata oluştu.";
}

export async function kayitOl({ eposta, sifre, nick }) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: baslik(),
    body: JSON.stringify({ email: eposta, password: sifre, data: { nick } }),
  });

  const veri = await res.json();
  if (!res.ok) throw new Error(hataCevir(veri.msg || veri.error_description || veri.message));

  if (veri.access_token) oturumYaz(veri);
  return veri;
}

export async function girisYap({ eposta, sifre }) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: baslik(),
    body: JSON.stringify({ email: eposta, password: sifre }),
  });

  const veri = await res.json();
  if (!res.ok) throw new Error(hataCevir(veri.msg || veri.error_description || veri.message));

  oturumYaz(veri);
  return veri;
}

export function oturumYaz(veri) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    ANAHTAR,
    JSON.stringify({
      token: veri.access_token,
      yenileme: veri.refresh_token,
      sonaErme: Date.now() + (veri.expires_in || 3600) * 1000,
      kullanici: veri.user,
    })
  );
}

export function oturumOku() {
  if (typeof window === "undefined") return null;
  try {
    const ham = localStorage.getItem(ANAHTAR);
    return ham ? JSON.parse(ham) : null;
  } catch {
    return null;
  }
}

export function cikisYap() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANAHTAR);
}

/* Süresi dolmak üzereyse oturumu yeniler, geçerli token döner */
export async function tokenAl() {
  const oturum = oturumOku();
  if (!oturum) return null;

  // Son 1 dakika kaldıysa yenile
  if (oturum.sonaErme && oturum.sonaErme - Date.now() > 60000) {
    return oturum.token;
  }

  if (!oturum.yenileme) return oturum.token;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: baslik(),
      body: JSON.stringify({ refresh_token: oturum.yenileme }),
    });
    const veri = await res.json();
    if (!res.ok || !veri.access_token) {
      cikisYap();
      return null;
    }
    oturumYaz(veri);
    return veri.access_token;
  } catch {
    return oturum.token;
  }
}
