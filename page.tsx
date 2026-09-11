import { notFound, redirect } from "next/navigation";
import { updateOrderStatus } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
import { StatusPill } from "@/components/status-pill";
import { getProfile } from "@/lib/data";
import { orderStatus, type OrderStatus } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Order = {
  id: number;
  username: string;
  package_slug: string;
  price: number;
  status: OrderStatus;
  created_at: string;
};

const tarih = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" });
const tl = new Intl.NumberFormat("tr-TR");

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  // Admin olmayan icin sayfa hic yokmus gibi davranir.
  if (profile.role !== "admin") notFound();

  const supabase = await createClient();
  const { data } = (await supabase
    ?.from("orders")
    .select("id, username, package_slug, price, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200)) ?? { data: [] };
  const orders = (data ?? []) as Order[];

  const bekleyen = orders.filter((o) => o.status === "pending");
  const odenen = orders.filter((o) => o.status === "paid");
  const ciro = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.price), 0);

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-4xl font-black tracking-tight">Siparişler</h1>
        <p className="mt-2 text-muted">
          Ödeme geldiğinde durumu değiştir. Oyuncu kendi hesabından takip eder.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Stat label="Ödeme bekleyen" value={String(bekleyen.length)} highlight />
          <Stat label="Teslim edilecek" value={String(odenen.length)} />
          <Stat label="Toplam ciro" value={tl.format(ciro) + " ₺"} />
        </div>

        {orders.length === 0 ? (
          <p className="mt-12 border border-line bg-deep p-8 text-muted">
            Henüz sipariş yok. Oyuncular paket aldıkça burada listelenir.
          </p>
        ) : (
          <div className="mt-10 overflow-x-auto border border-line">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-line bg-surface text-sm text-muted">
                  <th className="px-4 py-3 font-medium">No</th>
                  <th className="px-4 py-3 font-medium">Oyuncu</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium">Tutar</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                  <th className="px-4 py-3 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 tabular-nums text-muted">#{o.id}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(o.username)}/24`}
                          alt=""
                          width={24}
                          height={24}
                        />
                        <span className="font-medium">{o.username}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium uppercase">{o.package_slug}</td>
                    <td className="px-4 py-3 tabular-nums">{o.price} ₺</td>
                    <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-3 text-muted">
                      {tarih.format(new Date(o.created_at))}
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateOrderStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={o.id} />
                        <select
                          name="status"
                          defaultValue={o.status}
                          className="border border-line bg-deep px-2 py-1.5 text-ink focus:border-brand focus:outline-none"
                        >
                          {(Object.keys(orderStatus) as OrderStatus[]).map((key) => (
                            <option key={key} value={key}>
                              {orderStatus[key].label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="border border-line px-3 py-1.5 font-medium hover:border-brand"
                        >
                          Kaydet
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`border p-5 ${highlight ? "border-brand bg-surface" : "border-line bg-deep"}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}
