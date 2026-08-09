import { tokenAl, kullaniciAl } from "../../../../lib/oturum-sunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET() {
  const kullanici = await kullaniciAl();
  if (!kullanici?.id) {
    return Response.json({ girisli: false });
  }

  const token = await tokenAl();
  let admin = false;
  let profil = null;

  try {
    const [adminCevap, profilCevap] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/adminler?select=eposta&eposta=eq.${encodeURIComponent(kullanici.email || "")}`,
        { cache: "no-store", headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } }
      ),
      fetch(`${SUPABASE_URL}/rest/v1/profiller?select=*&id=eq.${kullanici.id}`, {
        cache: "no-store",
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
      }),
    ]);

    if (adminCevap.ok) {
      const liste = await adminCevap.json();
      admin = Array.isArray(liste) && liste.length > 0;
    }
    if (profilCevap.ok) {
      const liste = await profilCevap.json();
      profil = Array.isArray(liste) ? liste[0] || null : null;
    }
  } catch (err) {
    console.error("Profil okunamadi:", err);
  }

  return Response.json({
    girisli: true,
    admin,
    kullanici: {
      id: kullanici.id,
      eposta: kullanici.email,
      nick: profil?.nick || kullanici.user_metadata?.nick || null,
      kayitTarihi: kullanici.created_at,
    },
    kredi: profil?.kredi ?? 0,
  });
}
