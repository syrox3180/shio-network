import { tokenAl } from "../../../lib/oturum-sunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/*
  Tarayıcı artık Supabase'e doğrudan bağlanmıyor; her istek buradan geçiyor.
  Oturum bilgisi httpOnly çerezde durduğu için JavaScript ile çalınamaz.

  Hedef, "kaynak" parametresiyle belirtilir:
    /api/db?kaynak=siparisler&select=*
    /api/db?kaynak=rpc/kredi_ile_al

  Aşağıdaki listeler ek bir savunma katmanı: sadece bunlara erişilebilir.
  Asıl yetki kontrolünü yine veritabanındaki RLS kuralları yapıyor.
*/
const IZINLI_TABLOLAR = new Set([
  "siparisler",
  "profiller",
  "adminler",
  "paketler",
  "kredi_paketleri",
  "kredi_hareketleri",
  "envanter",
  "site_ayarlari",
]);

const IZINLI_FONKSIYONLAR = new Set([
  "kredi_ile_al",
  "kredi_siparisi_olustur",
  "paket_siparisi_olustur",
  "kredi_ayarla",
  "nick_musait",
  "carpan_ayarla",
]);

const IZINLI_METOTLAR = new Set(["GET", "POST", "PATCH"]);

function hedefCoz(kaynak) {
  if (!kaynak) return null;
  if (kaynak.includes("..") || kaynak.startsWith("/")) return null;

  const parcalar = kaynak.split("/").filter(Boolean);

  if (parcalar[0] === "rpc") {
    if (parcalar.length !== 2 || !IZINLI_FONKSIYONLAR.has(parcalar[1])) return null;
    return `rpc/${parcalar[1]}`;
  }

  if (parcalar.length !== 1 || !IZINLI_TABLOLAR.has(parcalar[0])) return null;
  return parcalar[0];
}

async function ilet(request) {
  if (!IZINLI_METOTLAR.has(request.method)) {
    return Response.json({ hata: "İzin verilmeyen işlem." }, { status: 405 });
  }

  const gelen = new URL(request.url);
  const parametreler = new URLSearchParams(gelen.search);
  const kaynak = parametreler.get("kaynak");
  parametreler.delete("kaynak");

  const hedefYol = hedefCoz(kaynak);
  if (!hedefYol) {
    return Response.json({ hata: "İzin verilmeyen kaynak." }, { status: 403 });
  }

  const token = await tokenAl();
  if (!token) {
    return Response.json({ hata: "Oturumun sona ermiş, tekrar giriş yap." }, { status: 401 });
  }

  const sorgu = parametreler.toString();
  const hedef = `${SUPABASE_URL}/rest/v1/${hedefYol}${sorgu ? `?${sorgu}` : ""}`;

  const basliklar = {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
  };

  const prefer = request.headers.get("prefer");
  if (prefer) basliklar.Prefer = prefer;

  let govde;
  if (request.method !== "GET") {
    govde = await request.text();
  }

  const res = await fetch(hedef, {
    method: request.method,
    cache: "no-store",
    headers: basliklar,
    body: govde,
  });

  const metin = await res.text();

  return new Response(metin, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}

export async function GET(request) {
  return ilet(request);
}

export async function POST(request) {
  return ilet(request);
}

export async function PATCH(request) {
  return ilet(request);
}
