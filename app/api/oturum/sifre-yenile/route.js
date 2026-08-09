import { hataCevir, hizSiniri, istekIp } from "../../../../lib/oturum-sunucu";
import { sifreKontrol } from "../../../../lib/sifre";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request) {
  try {
    const ip = istekIp(request);
    const sinir = hizSiniri(`yenile:${ip}`, 10, 30 * 60 * 1000);
    if (!sinir.izin) {
      return Response.json({ hata: "Cok fazla deneme. Biraz sonra tekrar dene." }, { status: 429 });
    }

    const { token, sifre } = await request.json();
    if (!token) {
      return Response.json({ hata: "Baglanti gecersiz veya suresi dolmus." }, { status: 400 });
    }

    const sifreHatasi = sifreKontrol(sifre);
    if (sifreHatasi) return Response.json({ hata: sifreHatasi }, { status: 400 });

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: sifre }),
    });

    const veri = await res.json().catch(() => ({}));

    if (!res.ok) {
      return Response.json(
        { hata: hataCevir(veri.msg || veri.error_description || veri.message) },
        { status: 400 }
      );
    }

    return Response.json({ tamam: true });
  } catch (err) {
    console.error("Sifre yenileme hatasi:", err);
    return Response.json({ hata: "Sifre degistirilemedi." }, { status: 500 });
  }
}
