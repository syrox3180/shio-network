/* Şifre kuralları — hem tarayıcıda hem sunucuda kullanılır */

const YAYGIN_SIFRELER = [
  "12345678", "123456789", "1234567890", "password", "parola", "sifre123",
  "qwerty123", "11111111", "00000000", "abcd1234", "asdasd123", "minecraft",
  "sifre1234", "admin123", "123123123", "qwertyui", "iloveyou", "123456789a",
];

export function sifreKontrol(sifre, { nick = "", eposta = "" } = {}) {
  const s = String(sifre || "");

  if (s.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (s.length > 72) return "Şifre en fazla 72 karakter olabilir.";
  if (!/[a-zA-Z]/.test(s)) return "Şifre en az bir harf içermeli.";
  if (!/[0-9]/.test(s)) return "Şifre en az bir rakam içermeli.";
  if (/^(.)\1+$/.test(s)) return "Şifre aynı karakterin tekrarı olamaz.";
  if (YAYGIN_SIFRELER.includes(s.toLowerCase())) return "Bu şifre çok yaygın, başka bir şey seç.";

  const kucuk = s.toLowerCase();
  if (nick && nick.length >= 3 && kucuk.includes(nick.toLowerCase()))
    return "Şifren nickini içeremez.";

  const epostaAdi = String(eposta).split("@")[0];
  if (epostaAdi && epostaAdi.length >= 3 && kucuk.includes(epostaAdi.toLowerCase()))
    return "Şifren e-posta adresini içeremez.";

  return null; // sorun yok
}

/* Görsel güç göstergesi için 0-4 arası puan */
export function sifrePuani(sifre) {
  const s = String(sifre || "");
  if (!s) return 0;

  let puan = 0;
  if (s.length >= 8) puan++;
  if (s.length >= 12) puan++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) puan++;
  if (/[0-9]/.test(s) && /[^a-zA-Z0-9]/.test(s)) puan++;

  return Math.min(4, puan);
}

export const NICK_KURALI = /^[A-Za-z0-9_]{3,16}$/;

export function nickKontrol(nick) {
  const n = String(nick || "").trim();
  if (!NICK_KURALI.test(n))
    return "Nick 3-16 karakter olmalı ve sadece harf, rakam ve alt çizgi içerebilir.";
  return null;
}
