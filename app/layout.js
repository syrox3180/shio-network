import "./globals.css";
import { SUNUCU } from "../lib/ayarlar";
import Ust from "../components/Ust";
import Alt from "../components/Alt";
import Arkaplan from "../components/Arkaplan";

export const metadata = {
  title: `${SUNUCU.ad} — ${SUNUCU.slogan}`,
  description: SUNUCU.aciklama,
  openGraph: {
    title: `${SUNUCU.ad} — ${SUNUCU.slogan}`,
    description: SUNUCU.aciklama,
    type: "website",
  },
};

export const viewport = {
  themeColor: "#eef6fc",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Manrope:wght@400..800&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Arkaplan />
        <Ust />
        <main>{children}</main>
        <Alt />
      </body>
    </html>
  );
}
