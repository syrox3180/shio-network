import { tokenAl, kullaniciAl, authIstek, hataCevir, hizSiniri, istekIp } from "../../../../lib/oturum-sunucu";
import { sifreKontrol } from "../../../../lib/sifre";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request) {
  try {
    const kullanici = await kullaniciAl();
    if (!kullanici?.id) {
      return Response.json({ hata: "Once giris yapmalisin." }, { status: 401 });
    }

    const ip = istekIp(request);
    const sinir = hizSiniri(`degistir:${ip}`, 8, 30 * 60 * 1000);
    if (!sinir.izin) {
      return Response.json({ hata: "Cok fazla deneme. Biraz sonra tekrar dene." }, { status: 429 });
    }

    const { eskiSifre, yeniSifre } = await request.json();

    const sifreHatasi = sifreKontrol(yeniSifre, { eposta: kullanici.email });
    if (sifreHatasi) return Response.json({ hata: sifreHatasi }, { status: 400 });

    // Eski sifreyi dogrula - boylece acik kalmis bir oturumdan sifre degistirilemez
    const dogrulama = await authIstek("token?grant_type=password", {
      email: kullanici.email,
      password: eskiSifre,
    });

    if (!dogrulama.ok) {
      return Response.json({ hata: "Mevcut sifren hatali." }, { status: 401 });
    }

    const token = await tokenAl();
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: yeniSifre }),
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
    console.error("Sifre degistirme hatasi:", err);
    return Response.json({ hata: "Sifre degistirilemedi." }, { status: 500 });
  }
}
