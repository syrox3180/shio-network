"use client";

/*
  Oturum yönetimi artık tamamen sunucu tarafında.
  Token'lar httpOnly çerezlerde durur — JavaScript ile okunamaz,
  dolayısıyla bir XSS açığında çalınamaz.
*/

async function gonder(yol, govde) {
  const res = await fetch(yol, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(govde || {}),
  });

  const veri = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(veri.hata || "İşlem tamamlanamadı.");
  return veri;
}

export function kayitOl({ eposta, sifre, nick }) {
  return gonder("/api/oturum/kayit", { eposta, sifre, nick });
}

export function girisYap({ eposta, sifre }) {
  return gonder("/api/oturum/giris", { eposta, sifre });
}

export function cikisYap(tumCihazlar = false) {
  return gonder("/api/oturum/cikis", { tumCihazlar });
}

export function sifreSifirlamaIste(eposta) {
  return gonder("/api/oturum/sifre-sifirla", { eposta });
}

export function sifreYenile({ token, sifre }) {
  return gonder("/api/oturum/sifre-yenile", { token, sifre });
}

export function sifreDegistir({ eskiSifre, yeniSifre }) {
  return gonder("/api/oturum/sifre-degistir", { eskiSifre, yeniSifre });
}

/* Mevcut oturum bilgisi — girişli değilse { girisli: false } döner */
export async function benKim() {
  try {
    const res = await fetch("/api/oturum/ben", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return { girisli: false };
    return res.json();
  } catch {
    return { girisli: false };
  }
}
