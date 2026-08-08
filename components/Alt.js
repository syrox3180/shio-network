import Link from "next/link";
import { SUNUCU, uyelikAktif } from "../lib/ayarlar";

export default function Alt() {
  return (
    <footer className="alt">
      <div className="kapsayici">
        <div className="alt-ic">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <span className="logo-kup" aria-hidden="true" />
              SHIO <span>NETWORK</span>
            </div>
            <p className="sonuk" style={{ margin: 0, fontSize: "0.88rem" }}>
              {SUNUCU.adres}
            </p>
          </div>

          <nav className="alt-menu">
            <Link href="/">Ana sayfa</Link>
            <Link href="/magaza">Mağaza</Link>
            {uyelikAktif && <Link href="/kayit">Kayıt ol</Link>}
            {uyelikAktif && <Link href="/giris">Giriş yap</Link>}
            <a href={SUNUCU.discord} target="_blank" rel="noreferrer">
              Discord
            </a>
          </nav>
        </div>

        <p className="alt-not">
          © {new Date().getFullYear()} {SUNUCU.ad}. Satın alınan paketler dijital ürünlerdir, teslim edildikten sonra
          iadesi yapılmaz. Sorun yaşarsan Discord sunucumuzdan destek talebi aç.
          <br />
          {SUNUCU.ad}, Mojang AB veya Microsoft ile bağlantılı değildir ve onlar tarafından onaylanmamıştır.
        </p>
      </div>
    </footer>
  );
}
