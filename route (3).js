import { discordSayilari } from "../../../lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const veri = await discordSayilari();

    return Response.json(veri, {
      headers: {
        // Vercel kenar önbelleği: 60 sn taze, 5 dk boyunca eskisini de kullanabilir
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Discord sayaci hatasi:", err);
    return Response.json({ toplam: null, online: null, hata: "Ulaşılamadı." }, { status: 200 });
  }
}
