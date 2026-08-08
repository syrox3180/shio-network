"use client";

import { SUPABASE_URL, SUPABASE_KEY } from "./ayarlar";
import { tokenAl, oturumOku } from "./kimlik";

async function istek(yol, secenekler = {}) {
  const token = await tokenAl();
  if (!token) throw new Error("Oturumun sona ermiş, tekrar giriş yap.");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${yol}`, {
    ...secenekler,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      ...(secenekler.headers || {}),
    },
  });

  if (!res.ok) {
    const metin = await res.text();
    throw new Error(metin || "Veritabanı hatası");
  }

  if (res.status === 204) return null;
  return res.json();
}

/* ---------- Sipariş oluştur ---------- */
export async function siparisOlustur(paket) {
  const oturum = oturumOku();
  if (!oturum?.kullanici) throw new Error("Önce giriş yapmalısın.");

  const nick = oturum.kullanici.user_metadata?.nick || "bilinmiyor";

  const sonuc = await istek("siparisler", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      kullanici_id: oturum.kullanici.id,
      nick,
      eposta: oturum.kullanici.email,
      paket_id: paket.id,
      paket_ad: paket.ad,
      fiyat: paket.fiyat,
      durum: "bekliyor",
    }),
  });

  return Array.isArray(sonuc) ? sonuc[0] : sonuc;
}

/* ---------- Kendi siparişlerim ---------- */
export async function siparislerimiGetir() {
  return istek("siparisler?select=*&order=olusturma.desc");
}

/* ---------- Yönetim: tüm siparişler ---------- */
export async function tumSiparisler() {
  return istek("siparisler?select=*&order=olusturma.desc&limit=500");
}

/* ---------- Yönetim: sipariş durumu güncelle ---------- */
export async function siparisGuncelle(id, durum, aciklama) {
  return istek(`siparisler?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      durum,
      aciklama: aciklama ?? null,
      guncelleme: new Date().toISOString(),
    }),
  });
}

/* ---------- Yönetim: üyeler ---------- */
export async function uyeleriGetir() {
  return istek("profiller?select=*&order=kayit_tarihi.desc&limit=500");
}

/* ---------- Bu kullanıcı admin mi? ---------- */
export async function adminMi() {
  const oturum = oturumOku();
  if (!oturum?.kullanici?.email) return false;
  try {
    const sonuc = await istek(
      `adminler?select=eposta&eposta=eq.${encodeURIComponent(oturum.kullanici.email)}`
    );
    return Array.isArray(sonuc) && sonuc.length > 0;
  } catch {
    return false;
  }
}
