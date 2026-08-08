# Shio Network — Sunucu Sitesi

Next.js ile yazılmış, Vercel'de ücretsiz yayınlanabilen Minecraft sunucu sitesi.

**Sayfalar:** Ana sayfa · Mağaza · Kayıt ol · Giriş yap · Hesabım

---

## 1. Siteyi yayına alma (15 dakika)

### a) GitHub'a yükle

1. [github.com](https://github.com) hesabı aç.
2. Sağ üstten **New repository** → isim: `shio-network` → **Create**.
3. Açılan sayfadaki **uploading an existing file** bağlantısına tıkla.
4. Bu klasörün **içindeki** tüm dosyaları sürükleyip bırak, **Commit changes**.

> `node_modules` klasörünü yükleme, gerek yok.

### b) Vercel'e bağla

1. [vercel.com](https://vercel.com) → GitHub hesabınla giriş yap.
2. **Add New → Project** → `shio-network` reposunu seç → **Deploy**.
3. 1-2 dakika sonra siten `shio-network.vercel.app` gibi bir adreste yayında.

### c) Domaini bağla

1. Vercel'de proje → **Settings → Domains** → `shionetwork.com.tr` yaz → **Add**.
2. Vercel sana bir DNS kaydı gösterecek (genelde `A` kaydı ve `76.76.21.21` IP'si).
3. Turkticaret paneli → **DNS Yönetimi** → `shionetwork.com.tr` satırının **Düzenle** butonu → Veriler alanına Vercel'in verdiği IP'yi yaz.
4. `www` için: tür **CNAME**, ad `www`, hedef `cname.vercel-dns.com` → **+ Kayıt Oluştur**.

> ⚠️ `play.shionetwork.com.tr` ve `oyna.shionetwork.com.tr` kayıtlarına **dokunma** — oyuncular sunucuya onlarla bağlanıyor.

Yayılması 1 saat kadar sürer. Vercel https sertifikasını kendi kurar.

---

## 2. İçeriği değiştirme

Neredeyse her şey **tek dosyada**: `lib/ayarlar.js`

| Ne değişecek | Nerede |
|---|---|
| Sunucu adı, adresi, sürüm, Discord linki | `SUNUCU` |
| VIP paketleri, fiyatlar, ayrıcalıklar | `PAKETLER` |
| Ana sayfadaki özellik kartları | `OZELLIKLER` |

Dosyayı GitHub üzerinden düzenleyip kaydettiğinde Vercel siteyi otomatik günceller.

### Renkleri değiştirmek

`app/globals.css` dosyasının en üstündeki `:root` bölümü:

```css
--amethyst: #9d5cff;   /* ana vurgu rengi */
--amber: #f0a63c;      /* buton ve fiyat rengi */
--void: #0c0a12;       /* arka plan */
```

---

## 3. Ödeme alma

Şu an paket butonları Discord'a yönlendiriyor — oyuncu ticket açar, sen elle tanımlarsın. **İlk aşamada bu yeterli.**

Otomatik ödemeye geçmek istersen:

1. [Shopier](https://www.shopier.com) hesabı aç (şahıs olarak da açılıyor).
2. Her paket için bir ürün oluştur, ürün linkini kopyala.
3. `lib/ayarlar.js` içinde ilgili paketin `satinAlLinki` alanına yapıştır:

```js
satinAlLinki: "https://www.shopier.com/xxxxxxx",
```

Link dolu olduğunda buton otomatik olarak "Satın al" olur ve Shopier'e gider.

> Shopier ürün açıklamasına **"Sipariş notuna oyun içi nickinizi yazın"** yazmayı unutma.

---

## 4. Üyelik sistemi (isteğe bağlı)

Kurmazsan site sorunsuz çalışır, sadece kayıt/giriş sayfaları "üyelik kapalı" gösterir.

Açmak için:

1. [supabase.com](https://supabase.com) → ücretsiz hesap → **New project**.
2. Proje açılınca **Settings → API** bölümünden şu ikisini kopyala:
   - `Project URL`
   - `anon public` anahtarı
3. Vercel'de proje → **Settings → Environment Variables** → şunları ekle:

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
```

4. **Deployments** sekmesinden en üstteki dağıtımı **Redeploy** et.

Kayıt olan oyuncuları Supabase panelinde **Authentication → Users** altında görürsün. Nick bilgisi her kullanıcının `user_metadata` alanında durur.

> E-posta doğrulamasını kapatmak istersen: Supabase → **Authentication → Providers → Email** → "Confirm email" kapalı.

---

## 5. Bilgisayarında çalıştırma (isteğe bağlı)

```bash
npm install
npm run dev
```

`http://localhost:3000` adresinden açılır.

---

## Notlar

- **Oyuncu sayacı** `api.mcsrvstat.us` üzerinden çalışır, ücretsizdir ve kurulum gerektirmez. Sunucu kapalıysa "Sunucu kapalı" yazar.
- Mojang'ın kullanım şartları oyun içi **avantaj** satmayı kısıtlıyor; kozmetik ayrıcalıklar (etiket, renk, /nick gibi) serbest. Paket içeriklerini buna göre gözden geçirmek isteyebilirsin.
