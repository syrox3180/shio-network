import Link from "next/link";
import { signOut } from "@/app/actions";
import type { Profile } from "@/lib/data";
import { site } from "@/lib/site";

export function SiteHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="font-display text-xl font-black tracking-tight">
          {site.shortName}
          <span className="ml-1.5 text-brand">NETWORK</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-muted lg:flex">
          <Link href="/#nasil" className="hover:text-ink">Nasıl oynanır</Link>
          <Link href="/#paketler" className="hover:text-ink">VIP paketleri</Link>
          <Link href="/#siralama" className="hover:text-ink">Sıralama</Link>
          <Link href="/#kurallar" className="hover:text-ink">Kurallar</Link>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="border border-brand px-3 py-2 font-medium text-brand"
                >
                  Admin
                </Link>
              )}
              <Link href="/hesap" className="border border-line px-3 py-2 hover:border-brand">
                {profile.username}
              </Link>
              <form action={signOut}>
                <button type="submit" className="px-2 py-2 text-muted hover:text-ink">
                  Çıkış
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/giris" className="px-3 py-2 text-muted hover:text-ink">
                Giriş yap
              </Link>
              <Link href="/kayit" className="border border-line px-3 py-2 hover:border-brand">
                Kayıt ol
              </Link>
            </>
          )}
          <a
            href={site.discord}
            target="_blank"
            rel="noreferrer"
            className="bg-brand px-4 py-2 font-display font-bold text-deep"
          >
            Discord
          </a>
        </div>
      </nav>
    </header>
  );
}
