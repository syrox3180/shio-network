"use client";

/* Tüm veritabanı istekleri /api/db vekili üzerinden geçer */
async function istek(yol, secenekler = {}) {
  const res = await fetch(`/api/db/${yol}`, {
    ...secenekler,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(secenekler.headers || {}) },
  });

  if (!res.ok) {
    const metin = await res.text();
    let mesaj = "İşlem tamamlanamadı.";
    try {
      const veri = JSON.parse(metin);
      const ham = veri.hata || veri.message || veri.hint || "";
      if (ham.includes("Yetersiz kredi")) mesaj = "Kredin yetmiyor.";
      else if (ham.includes("Giris yapmalisin")) mesaj = "Önce giriş yapmalısın.";
      else if (ham.includes("Profil bulunamadi")) mesaj = "Profilin bulunamadı.";
      else if (ham.includes("bulunamadi")) mesaj = "Paket bulunamadı. Yöneticiyle iletişime geç.";
      else if (ham.includes("Yetkin yok")) mesaj = "Bu işlem için yetkin yok.";
      else if (ham.includes("Cok fazla bekleyen"))
        mesaj = "Çok fazla bekleyen siparişin var. Önce mevcut siparişlerini tamamla.";
      else if (ham.includes("permission denied") || ham.includes("not allowed"))
        mesaj = "Veritabanı izni eksik. GUVENLIK-EK.sql dosyasını çalıştırdın mı?";
      else if (ham.includes("Could not find the function") || ham.includes("schema cache"))
        mesaj = "Veritabanı fonksiyonu bulunamadı. GUVENLIK.sql dosyasını çalıştırman gerekiyor.";
      else if (ham) mesaj = ham;
    } catch {
      /* metin JSON değilse varsayılan mesaj kalsın */
    }
    throw new Error(mesaj);
  }

  if (res.status === 204) return null;
  return res.json();
}

function rpc(isim, govde) {
  return istek(`rpc/${isim}`, { method: "POST", body: JSON.stringify(govde || {}) });
}

/* ---------- Siparişler ---------- */
export function siparisOlustur(paket) {
  return rpc("paket_siparisi_olustur", { p_paket_id: paket.id });
}

export function siparislerimiGetir() {
  return istek("siparisler?select=*&order=olusturma.desc");
}

export function tumSiparisler() {
  return istek("siparisler?select=*&order=olusturma.desc&limit=500");
}

export function siparisGuncelle(id, durum, aciklama) {
  return istek(`siparisler?id=eq.${Number(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      durum,
      aciklama: aciklama ?? null,
      guncelleme: new Date().toISOString(),
    }),
  });
}

/* ---------- Üyeler ---------- */
export function uyeleriGetir() {
  return istek("profiller?select=*&order=kayit_tarihi.desc&limit=500");
}

/* ---------- Kredi ---------- */
export function krediIleAl(paketId) {
  return rpc("kredi_ile_al", { p_paket_id: paketId });
}

export function krediSiparisiOlustur(krediPaketiId) {
  return rpc("kredi_siparisi_olustur", { p_kredi_paketi: krediPaketiId });
}

export function krediAyarla(kullaniciId, miktar) {
  return rpc("kredi_ayarla", { p_kullanici: kullaniciId, p_miktar: miktar });
}

/* ---------- Shopier ödeme sayfasına gönder ---------- */
export async function shopierOdemeyeGit(siparisId) {
  const res = await fetch("/api/shopier/basla", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ siparisId }),
  });

  const veri = await res.json().catch(() => null);
  if (!res.ok) throw new Error(veri?.hata || "Ödeme başlatılamadı.");

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
