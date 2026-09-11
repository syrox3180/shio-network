"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Paket sipariti olusturur. Giris yoksa giris sayfasina yollar. */
export async function createOrder(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const supabase = await createClient();
  if (!supabase) redirect("/?hata=baglanti");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?devam=/hesap");

  const { data: pkg } = await supabase
    .from("packages")
    .select("slug, price")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (!pkg) redirect("/?hata=paket");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    package_slug: pkg.slug,
    price: pkg.price,
    username: profile?.username ?? "",
    status: "pending",
  });

  if (error) redirect("/?hata=siparis");

  revalidatePath("/hesap");
  redirect("/hesap?siparis=olusturuldu");
}

/** Admin: siparis durumunu degistirir. */
export async function updateOrderStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const allowed = ["pending", "paid", "delivered", "cancelled"];
  if (!id || !allowed.includes(status)) return;

  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return;

  await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
