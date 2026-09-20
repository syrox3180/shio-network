import { SUNUCU } from "../../../lib/ayarlar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${SUNUCU.sorguAdresi}`, {
      cache: "no-store",
      headers: { "User-Agent": "shionetwork-site" },
    });

    if (!res.ok) throw new Error("sorgu basarisiz");

    const veri = await res.json();

    return Response.json({
      online: Boolean(veri.online),
      oyuncu: veri.players?.online ?? 0,
      maks: veri.players?.max ?? 0,
      surum: veri.version ?? null,
    });
  } catch {
    return Response.json({ online: false, oyuncu: 0, maks: 0, surum: null });
  }
}
