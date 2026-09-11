import { createClient } from "@/lib/supabase/server";

export type Package = {
  slug: string;
  name: string;
  price: number;
  duration: string;
  blurb: string | null;
  popular: boolean;
};

export type Feature = {
  label: string;
  values: Record<string, string>;
};

export type Player = {
  username: string;
  balance: number;
  blocks: number;
  kills: number;
};

export type Staff = { username: string; role: string; discord: string | null };

export type Profile = {
  id: string;
  username: string;
  discord: string | null;
  role: "user" | "admin";
};

const demoPackages: Package[] = [
  { slug: "vip", name: "VIP", price: 150, duration: "1 Ay", blurb: "Başlangıç için ihtiyacın olan her şey", popular: false },
  { slug: "mvip", name: "MVIP", price: 300, duration: "1 Ay", blurb: "Ekonomide öne geçmek isteyenler için", popular: false },
  { slug: "sponsor", name: "Sponsor", price: 500, duration: "1 Ay", blurb: "Sunucudaki en üst seviye", popular: true },
];

const demoFeatures: Feature[] = [
  { label: "Süre", values: { vip: "1 Ay", mvip: "1 Ay", sponsor: "1 Ay" } },
  { label: "Kırılan blokların düşmesi", values: { vip: "true", mvip: "true", sponsor: "true" } },
  { label: "Takım limiti", values: { vip: "20", mvip: "30", sponsor: "40" } },
  { label: "Respawn beacon koyma limiti", values: { vip: "3", mvip: "4", sponsor: "5" } },
  { label: "AFK alanı shard ödülü", values: { vip: "3", mvip: "4", sponsor: "5" } },
  { label: "AFK ödül limiti yok", values: { vip: "true", mvip: "true", sponsor: "true" } },
  {
    label: "Günlük ödül",
    values: {
      vip: "1.25x + vote kasası anahtarı",
      mvip: "1.50x + vote ve para kasası anahtarı",
      sponsor: "2x + vote ve para kasası anahtarı",
    },
  },
  { label: "XP çarpanı", values: { vip: "1.25x", mvip: "1.50x", sponsor: "2x" } },
  { label: "Discord raid bildirimi", values: { vip: "true", mvip: "true", sponsor: "true" } },
  { label: "/enderchest komutu", values: { vip: "true", mvip: "true", sponsor: "true" } },
];

const demoPlayers: Player[] = [
  { username: "Kerem", balance: 184320000, blocks: 812400, kills: 1043 },
  { username: "Vortex", balance: 151900000, blocks: 744100, kills: 926 },
  { username: "Efe61", balance: 133450000, blocks: 690300, kills: 611 },
  { username: "Nyx", balance: 98220000, blocks: 512800, kills: 874 },
  { username: "Sarp", balance: 76800000, blocks: 488200, kills: 332 },
  { username: "Deniz", balance: 61040000, blocks: 401900, kills: 508 },
];

const demoStaff: Staff[] = [
  { username: "Kurucu", role: "Kurucu", discord: null },
];

export async function getPackages(): Promise<Package[]> {
  const supabase = await createClient();
  if (!supabase) return demoPackages;
  const { data } = await supabase
    .from("packages")
    .select("slug, name, price, duration, blurb, popular")
    .eq("active", true)
    .order("sort_order");
  return data?.length ? (data as Package[]) : demoPackages;
}

export async function getFeatures(): Promise<Feature[]> {
  const supabase = await createClient();
  if (!supabase) return demoFeatures;
  const { data } = await supabase
    .from("package_features")
    .select("label, values")
    .order("sort_order");
  return data?.length ? (data as Feature[]) : demoFeatures;
}

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  if (!supabase) return demoPlayers;
  const { data } = await supabase
    .from("players")
    .select("username, balance, blocks, kills")
    .order("balance", { ascending: false })
    .limit(10);
  return data?.length ? (data as Player[]) : demoPlayers;
}

export async function getStaff(): Promise<Staff[]> {
  const supabase = await createClient();
  if (!supabase) return demoStaff;
  const { data } = await supabase
    .from("staff")
    .select("username, role, discord")
    .order("sort_order");
  return data?.length ? (data as Staff[]) : demoStaff;
}

/** Oturum acmis kullanicinin profili. Giris yoksa null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, discord, role")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export type Status = { online: boolean; players: number; max: number };

export async function getStatus(ip: string): Promise<Status> {
  try {
    const res = await fetch("https://api.mcsrvstat.us/3/" + ip, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { online: false, players: 0, max: 0 };
    const json = await res.json();
    return {
      online: Boolean(json.online),
      players: json.players?.online ?? 0,
      max: json.players?.max ?? 0,
    };
  } catch {
    return { online: false, players: 0, max: 0 };
  }
}
