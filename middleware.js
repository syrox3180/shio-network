import { NextResponse } from "next/server";

/*
  Her sayfa isteğine güvenlik başlıkları ekler.

  Not: script-src için nonce yerine 'self' + 'unsafe-inline' kullanılıyor.
  Nonce daha sıkı olurdu ama Next.js'in kendi başlatma betikleriyle
  uyumsuzluk çıkarıp siteyi tamamen bozabiliyor. Bu haliyle de dış
  kaynaklı betikler engelleniyor — asıl koruma orada.
*/
export function middleware() {
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob:`,
    `connect-src 'self' https://challenges.cloudflare.com`,
    `frame-src https://challenges.cloudflare.com`,
    `form-action 'self' https://www.shopier.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join("; ");

  const cevap = NextResponse.next();

  cevap.headers.set("content-security-policy", csp);
  cevap.headers.set("x-content-type-options", "nosniff");
  cevap.headers.set("x-frame-options", "DENY");
  cevap.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  cevap.headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  cevap.headers.set("strict-transport-security", "max-age=63072000; includeSubDomains");
  cevap.headers.set("cross-origin-opener-policy", "same-origin");

  return cevap;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
