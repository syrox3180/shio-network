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


/* ---------- RPC çağrısı ---------- */
async function rpc(isim, govde) {
  const token = await tokenAl();
  if (!token) throw new Error("Oturumun sona ermiş, tekrar giriş yap.");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${isim}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(govde || {}),
  });

  const veri = await res.json().catch(() => null);

  if (!res.ok) {
    const ham = veri?.message || veri?.hint || "";
    if (ham.includes("Yetersiz kredi")) throw new Error("Kredin yetmiyor.");
    if (ham.includes("Giris yapmalisin")) throw new Error("Önce giriş yapmalısın.");
    if (ham.includes("Profil bulunamadi")) throw new Error("Profilin bulunamadı.");
    if (ham.includes("Paket bulunamadi") || ham.includes("Kredi paketi bulunamadi"))
      throw new Error("Paket bulunamadı. Yöneticiyle iletişime geç.");
    if (ham.includes("Yetkin yok")) throw new Error("Bu işlem için yetkin yok.");
    throw new Error(ham || "İşlem tamamlanamadı.");
  }

  return veri;
}

/* ---------- Kendi profilim (kredi bakiyesi dahil) ---------- */
export async function profilimiGetir() {
  const oturum = oturumOku();
  if (!oturum?.kullanici?.id) return null;
  const sonuc = await istek(`profiller?select=*&id=eq.${oturum.kullanici.id}`);
  return Array.isArray(sonuc) ? sonuc[0] || null : null;
}

/* ---------- Kredi ile paket satın al ---------- */
export async function krediIleAl(paketId) {
  return rpc("kredi_ile_al", { p_paket_id: paketId });
}

/* ---------- Kredi yükleme siparişi oluştur ---------- */
export async function krediSiparisiOlustur(krediPaketiId) {
  return rpc("kredi_siparisi_olustur", { p_kredi_paketi: krediPaketiId });
}

/* ---------- Yönetici: elle kredi ekle/çıkar ---------- */
export async function krediAyarla(kullaniciId, miktar) {
  return rpc("kredi_ayarla", { p_kullanici: kullaniciId, p_miktar: miktar });
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

/* ---------- Shopier ödeme sayfasına gönder ---------- */
export async function shopierOdemeyeGit(siparisId) {
  const token = await tokenAl();
  if (!token) throw new Error("Oturumun sona ermiş, tekrar giriş yap.");

  const res = await fetch("/api/shopier/basla", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ siparisId }),
  });

  const veri = await res.json().catch(() => null);
  if (!res.ok) throw new Error(veri?.hata || "Ödeme başlatılamadı.");

  // Shopier'e otomatik gönderilen gizli form
  const form = document.createElement("form");
  form.method = "POST";
  form.action = veri.hedef;
  form.style.display = "none";

  Object.entries(veri.alanlar).forEach(([ad, deger]) => {
    const alan = document.createElement("input");
    alan.type = "hidden";
    alan.name = ad;
    alan.value = deger;
    form.appendChild(alan);
  });

  document.body.appendChild(form);
  form.submit();
}
