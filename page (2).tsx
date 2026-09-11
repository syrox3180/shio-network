import { ApplyForm } from "@/components/apply-form";
import { CopyIp } from "@/components/copy-ip";
import { Leaderboard } from "@/components/leaderboard";
import { PackagesTable } from "@/components/packages-table";
import { SiteHeader } from "@/components/site-header";
import {
  getFeatures,
  getPackages,
  getPlayers,
  getProfile,
  getStaff,
  getStatus,
} from "@/lib/data";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Kaz",
    body: "Kutunun içinde madenini kazarsın. Blok kırıldıkça envanterin dolar, kırılan bloklar geri gelir — duraksamadan kazmaya devam edersin.",
  },
  {
    title: "Sat",
    body: "/warp takas ile topladığın blokları shard ve paraya çevirirsin. XP çarpanın yükseldikçe aynı emek daha çok kazandırır.",
  },
  {
    title: "Yüksel",
    body: "Takımını kur, beacon dik, alanını büyüt. Raid yiyebilirsin de yapabilirsin de — sıralamanın tepesi savunmayı bilenin.",
  },
];

export default async function Home() {
  const [profile, packages, features, players, staff, status] = await Promise.all([
    getProfile(),
    getPackages(),
    getFeatures(),
    getPlayers(),
    getStaff(),
    getStatus(site.ip),
  ]);

  return (
    <>
      <SiteHeader profile={profile} />

      <main>
        <section className="grid-bg border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
            <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-2">
                <span
                  className={`size-2 ${status.online ? "bg-ok" : "bg-muted"}`}
                  aria-hidden="true"
                />
                {status.online
                  ? `${status.players} oyuncu sunucuda`
                  : "Sunucu kapalı"}
              </span>
              <span className="text-line">|</span>
              Türk {site.mode} sunucusu
              <span className="text-line">|</span>
              {site.version}
            </p>

            <h1 className="max-w-3xl font-display text-6xl font-black leading-[0.92] tracking-tight sm:text-8xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Kutunu kaz, blokları takasta dönüştür, takımınla alanını büyüt.
              Ekonomi hızlı, raid serbest, tepede kalmak zor.
            </p>

            <div className="mt-10">
              <CopyIp ip={site.ip} />
            </div>
          </div>
        </section>

        <section id="nasil" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Döngü basit
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <p className="font-display text-5xl font-black text-brand-dim">{i + 1}</p>
                  <p className="mt-3 font-display text-xl font-bold">{step.title}</p>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="paketler" className="border-b border-line bg-deep">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              VIP paketleri
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">
              Üç paket var, hepsi bir ay geçerli. Satın al butonuna bastığında sipariş
              oluşur; ödeme onaylanınca paket oyun içi hesabına tanımlanır.
            </p>
            <div className="mt-10">
              <PackagesTable
                packages={packages}
                features={features}
                signedIn={Boolean(profile)}
              />
            </div>
          </div>
        </section>

        <section id="siralama" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                En zenginler
              </h2>
              <p className="text-sm text-muted">Dakikada bir güncellenir</p>
            </div>
            <Leaderboard players={players} />
          </div>
        </section>

        <section id="kurallar" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kurallar
            </h2>
            <div className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {site.rules.map((rule) => (
                <div key={rule.title} className="border-l-2 border-brand pl-5">
                  <p className="font-display text-lg font-bold">{rule.title}</p>
                  <p className="mt-1.5 leading-relaxed text-muted">{rule.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ekip" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ekip
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {staff.map((member) => (
                <li key={member.username} className="border border-line bg-deep p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://mc-heads.net/avatar/${encodeURIComponent(member.username)}/48`}
                    alt=""
                    width={48}
                    height={48}
                  />
                  <p className="mt-3 font-display text-lg font-bold">{member.username}</p>
                  <p className="text-sm text-brand">{member.role}</p>
                </li>
              ))}
            </ul>

            <div className="mt-16 grid gap-10 border-t border-line pt-16 md:grid-cols-2">
              <div>
                <h3 className="font-display text-2xl font-extrabold tracking-tight">
                  Ekibe katıl
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  Aktif, sakin ve sunucuyu bilen oyuncu arıyoruz. Başvurular her ayın
                  başında değerlendirilir, sonuç Discord'dan yazılır.
                </p>
              </div>
              <ApplyForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-deep">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-12">
          <div>
            <p className="font-display text-lg font-black tracking-tight">{site.name}</p>
            <p className="mt-1.5 text-sm text-muted">
              {site.ip} · {site.mode} · {site.region}
            </p>
          </div>
          <a
            href={site.discord}
            target="_blank"
            rel="noreferrer"
            className="border border-line px-4 py-2 text-sm hover:border-brand"
          >
            Discord'a katıl
          </a>
          <p className="w-full text-xs leading-relaxed text-muted/70">
            Bu site Mojang AB veya Microsoft ile bağlantılı değildir ve onlar tarafından
            onaylanmamıştır. Minecraft, Mojang AB'nin tescilli markasıdır.
          </p>
        </div>
      </footer>
    </>
  );
}
