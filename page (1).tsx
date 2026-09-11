import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { StatusPill } from "@/components/status-pill";
import { getProfile } from "@/lib/data";
import { site, type OrderStatus } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Order = {
  id: number;
  package_slug: string;
  price: number;
  status: OrderStatus;
  created_at: string;
};

const tarih = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

export default async function HesapPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();
  const { data } = (await supabase
    ?.from("orders")
    .select("id, package_slug, price, status, created_at")
    .order("created_at", { ascending: false })) ?? { data: [] };
  const orders = (data ?? []) as Order[];
  const bekleyen = orders.filter((o) => o.status === "pending");

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="font-display text-4xl font-black tracking-tight">Hesabım</h1>
        <p className="mt-2 text-muted">
          {profile.username}
          {profile.discord ? ` · ${profile.discord}` : ""}
        </p>

        {bekleyen.length > 0 && (
          <section className="mt-10 border border-brand bg-surface p-6">
            <h2 className="font-display text-xl font-bold">Ödeme bilgileri</h2>
            <p className="mt-2 leading-relaxed text-muted">{site.payment.note}</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted">Yöntem</dt>
                <dd className="mt-0.5 font-medium">{site.payment.title}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">Hesap</dt>
                <dd className="mt-0.5 font-medium break-all">{site.payment.account}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Alıcı</dt>
                <dd className="mt-0.5 font-medium">{site.payment.holder}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Sipariş numaran</dt>
                <dd className="mt-0.5 font-medium">
                  {bekleyen.map((o) => "#" + o.id).join(", ")}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Siparişlerim</h2>

          {orders.length === 0 ? (
            <div className="mt-6 border border-line bg-deep p-8">
              <p className="text-muted">Henüz siparişin yok.</p>
              <Link
                href="/#paketler"
                className="mt-4 inline-block bg-brand px-5 py-2.5 font-display font-bold text-deep"
              >
                VIP paketlerine bak
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border border-line">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-line bg-surface text-sm text-muted">
                    <th className="px-4 py-3 font-medium">No</th>
                    <th className="px-4 py-3 font-medium">Paket</th>
                    <th className="px-4 py-3 font-medium">Tutar</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">Tarih</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3 tabular-nums text-muted">#{o.id}</td>
                      <td className="px-4 py-3 font-medium uppercase">{o.package_slug}</td>
                      <td className="px-4 py-3 tabular-nums">{o.price} ₺</td>
                      <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                      <td className="px-4 py-3 text-muted">{tarih.format(new Date(o.created_at))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
