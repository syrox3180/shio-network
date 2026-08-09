import { NextResponse } from "next/server";

/*
  Her sayfa isteğine güvenlik başlıkları ekler.
  En önemlisi CSP: tarayıcıya "sadece bu kaynaklardan kod çalıştır" der.
  Siteye bir şekilde zararlı kod enjekte edilse bile tarayıcı çalıştırmaz.
*/
export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob:`,
    `connect-src 'self' https://challenges.cloudflare.com`,
    `frame-src https://challenges.cloudflare.com`,
    `form-action 'self' https://www.shopier.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const istekBasliklari = new Headers(request.headers);
  istekBasliklari.set("x-nonce", nonce);
  istekBasliklari.set("content-security-policy", csp);

  const cevap = NextResponse.next({ request: { headers: istekBasliklari } });

  cevap.headers.set("content-security-policy", csp);
  cevap.headers.set("x-content-type-options", "nosniff");
  cevap.headers.set("x-frame-options", "DENY");
  cevap.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  cevap.headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  cevap.headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  cevap.headers.set("x-dns-prefetch-control", "off");
  cevap.headers.set("cross-origin-opener-policy", "same-origin");

  return cevap;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
