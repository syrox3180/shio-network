# Shio Network — Sunucu Sitesi

Next.js ile yazılmış, Vercel'de ücretsiz yayınlanabilen Minecraft sunucu sitesi.

**Sayfalar:** Ana sayfa · Mağaza (VIP + kredi) · Kayıt ol · Giriş yap · Şifremi unuttum · Hesabım · Yönetim paneli

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

## 4. Üyelik sistemi + yönetim paneli

Kurmazsan site çalışır ama kayıt/giriş ve sipariş takibi kapalı olur. Açmak 10 dakika sürüyor:

### a) Supabase projesi aç

1. [supabase.com](https://supabase.com) → ücretsiz hesap aç → **New project**
2. Bir isim ve veritabanı şifresi belirle (şifreyi bir yere not et), bölge olarak **Frankfurt** seç
3. Proje kurulurken 1-2 dakika bekle

### b) Tabloları oluştur

1. Sol menüden **SQL Editor** → **New query**
2. Projedeki **KURULUM.sql** dosyasını aç, içindekilerin tamamını kopyala, buraya yapıştır
3. En alttaki satırda `BURAYA_KENDI_EPOSTANI_YAZ` yazan yeri **kendi e-postanla** değiştir — siteye hangi e-posta ile kayıt olacaksan o
4. **Run** butonuna bas. "Success" yazması gerekiyor

### c) E-posta doğrulamasını kapat

Sol menüden **Authentication → Sign In / Providers → Email** → **Confirm email** seçeneğini **kapat** → Save.

Açık bırakırsan oyuncular kayıt olduktan sonra e-posta onayı beklemek zorunda kalır.

### d) Anahtarları Vercel'e ekle

1. Supabase → **Settings → API** → şu ikisini kopyala:
   - `Project URL`
   - `anon public` anahtarı
2. Vercel → projen → **Settings → Environment Variables** → şunları ekle:

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
```

3. **Deployments** sekmesi → en üstteki dağıtımın sağındaki `...` → **Redeploy**

### e) Kendi hesabını aç

Siteye git → **Kayıt ol** → KURULUM.sql'e yazdığın e-posta ile kaydol. Giriş yapınca menüde **Yönetim** bağlantısı çıkacak.

---

## Sistem nasıl çalışıyor

**Oyuncu tarafı:** Kayıt olurken oyun içi nickini verir → mağazadan bir pakete tıklar → sistem sipariş kaydı oluşturur ve onu ödeme sayfasına (Shopier ya da Discord) gönderir → "Hesabım" sayfasından siparişinin durumunu takip eder.

**Senin tarafın:** `/yonetim` sayfasında bekleyen siparişleri, kimin hangi paketi aldığını, toplam ciroyu ve tüm üyeleri görürsün. Ödemeyi aldığını doğruladıktan sonra **Teslim et** butonuna basarsın; oyuncunun panelinde paket "Teslim edildi" olarak görünür.

**Önemli:** Sipariş kaydı ödemenin yapıldığı anlamına gelmez — oyuncu butona bastığı an kayıt oluşur. Yani **Teslim et** demeden önce ödemenin gerçekten geldiğini Shopier panelinden veya dekonttan kontrol et. Gerçek anlamda otomatik doğrulama için Shopier'in bildirim URL'si ile bir webhook kurmak gerekir, o ayrı bir aşama.

Yönetim paneline sadece `adminler` tablosundaki e-postalar girebilir. Başka birini yetkilendirmek için Supabase → **Table Editor → adminler → Insert row** ile e-postasını ekle.

---

## Kredi sistemi

Oyuncular siteden kredi satın alır, VIP paketlerini bu krediyle anında alabilir. 1 kredi = 1 ₺.

### Kurulum

KURULUM.sql'i çalıştırdıktan sonra **KREDI.sql** dosyasını da aynı şekilde çalıştır: Supabase → SQL Editor → New query → dosyanın tamamını yapıştır → Run. Birden fazla kez çalıştırman zarar vermez.

### Nasıl işliyor

**Kredi yükleme:** Oyuncu mağazadaki kredi paketlerinden birini seçer → sipariş kaydı oluşur ve Discord'a yönlendirilir → ödemeyi alıp yönetim panelinden **Teslim et** dediğinde kredi otomatik olarak hesabına yüklenir. Elle kredi yazmana gerek yok.

**Kredi ile VIP alma:** Oyuncu paket kartındaki "Kredi ile al" butonuna basar → kredi anında düşer, sipariş "Kredi" ödemeli olarak panelinde görünür. Senin tek yapman gereken oyun içinde rütbeyi verip **Teslim et** demek — para kontrolü gerekmiyor, ödeme zaten yapılmış sayılır.

**İptal:** Kredi ile alınmış bir siparişi iptal edersen kredi otomatik iade edilir.

**Elle kredi verme:** Yönetim paneli → Üyeler sekmesi → ilgili oyuncunun yanındaki **Düzenle**. Eklemek için `100`, çıkarmak için `-50` yazarsın. Etkinlik ödülü, çekiliş, telafi gibi durumlar için.

### Güvenlik

Kredi bakiyesi tarayıcıdan değiştirilemez. Tüm kredi işlemleri veritabanı içindeki fonksiyonlar üzerinden yürür ve fiyatlar `paketler` ile `kredi_paketleri` tablolarından okunur — yani kimse 300₺'lik paketi 1 krediye alamaz.

**Önemli:** `ayarlar.js` içindeki fiyatları değiştirirsen Supabase'deki bu iki tabloyu da güncellemen gerekir (Table Editor'den elle, ya da KREDI.sql'in ilgili `insert` satırlarını düzenleyip tekrar çalıştırarak). Aksi halde sitede görünen fiyat ile kredi düşülen tutar farklı olur.

---

## Shopier otomatik ödeme

Kurduğunda oyuncu kartıyla öder, kredisi **anında** hesabına yüklenir. Sen hiçbir şey yapmazsın.

### a) Shopier API bilgilerini al

1. Shopier paneline gir → sol menü **Entegrasyonlar** → **Modül Yönetimi**
2. Site kaydı istiyorsa protokolü **https** seçip `shionetwork.com.tr` yaz ve kaydet
3. Açılan ekranda **API Key** ve **API Secret** bilgilerini kopyala

> API erişimi hesabında kapalıysa Shopier destekten açtırman gerekebilir.

### b) Geri dönüş adresini tanımla

Aynı sayfadaki **Geri Dönüş URL** alanına şunu yaz:

```
https://shionetwork.com.tr/api/shopier/bildirim
```

Bu adres ödemeyi doğrulayan yer. Yanlış yazarsan ödemeler alınır ama krediler yüklenmez.

### c) Supabase servis anahtarını al

Ödeme bildirimi geldiğinde krediyi sunucu tarafında yüklememiz gerekiyor, bunun için ayrı bir anahtar lazım.

Supabase → **Settings → API Keys** → **Legacy** sekmesi → `service_role` anahtarını kopyala.

> ⚠️ Bu anahtar tüm güvenlik kurallarını atlar. Sadece Vercel'e gir, başka hiçbir yere yazma, kimseyle paylaşma, `NEXT_PUBLIC_` ön eki **kesinlikle ekleme**.

### d) Vercel'e dört değişken ekle

Vercel → projen → **Settings → Environment Variables**:

| Key | Value |
|---|---|
| `SHOPIER_API_KEY` | Shopier API Key |
| `SHOPIER_API_SECRET` | Shopier API Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role anahtarı |
| `NEXT_PUBLIC_SHOPIER_AKTIF` | `1` |

Sonra **Deployments → ⋯ → Redeploy**.

### e) Veritabanını güncelle

Supabase → SQL Editor → **SHOPIER.sql** dosyasının tamamını yapıştır → Run.

### Nasıl çalışıyor

**Kredi alımı:** Oyuncu paketi seçer → Shopier ödeme sayfası açılır → ödeme tamamlanır → Shopier bize imzalı bildirim gönderir → imza doğrulanır, tutar kontrol edilir → kredi otomatik yüklenir → oyuncu "Ödemen alındı" sayfasına döner.

**VIP alımı (kartla):** Aynı akış, ama rütbe otomatik verilmez. Sipariş yönetim panelinde **✓ Ödendi** rozetiyle görünür; sen oyun içinde rütbeyi verip **Teslim et** dersin.

**VIP alımı (krediyle):** Kredi anında düşer, sipariş **Kredi** rozetiyle listelenir.

### Güvenlik önlemleri

- Gelen her bildirimin imzası API Secret ile doğrulanır; imzasız veya yanlış imzalı istek hiçbir işlem yapmaz
- Ödenen tutar sipariş tutarıyla karşılaştırılır
- Aynı ödeme iki kez işlenemez (veritabanı seviyesinde benzersiz indeks)
- Ödeme başlatırken siparişin gerçekten o kullanıcıya ait olduğu sunucuda doğrulanır
- Fiyatlar veritabanından okunur, tarayıcıdan gelen değere güvenilmez

### Kurmazsan ne olur

Hiçbir şey bozulmaz. `NEXT_PUBLIC_SHOPIER_AKTIF` tanımlı değilse butonlar eskisi gibi Discord'a yönlendirir, siparişleri elle onaylarsın.

---

## Ödeme yöntemi seçimi

Oyuncu bir VIP paketinin **Satın al** butonuna bastığında bir pencere açılır ve iki seçenek sunulur:

- **💳 Shopier ile öde** — kredi kartı / banka kartı / havale
- **🪙 Kredi ile öde** — bakiyesinden düşer, anında tamamlanır

Kredi bakiyesi yetmiyorsa ikinci seçenek pasif görünür ve kaç kredi eksik olduğu yazar.

### Shopier linklerini nereye yazacaksın

`lib/ayarlar.js` dosyasında her paketin `satinAlLinki` alanı var. Shopier panelinde ürünü açıp linkini buraya yapıştır:

```js
{
  id: "vip",
  ad: "VIP",
  fiyat: 75,
  satinAlLinki: "https://www.shopier.com/xxxxxxx",   // ← buraya
  ...
}
```

Aynı alan kredi paketlerinde de var:

```js
export const KREDI_PAKETLERI = [
  { id: "k50", kredi: 50, bonus: 0, fiyat: 50, satinAlLinki: "https://www.shopier.com/xxxxxxx" },
  ...
];
```

### Hangi yol kullanılır

Sistem şu sırayla bakar:

1. `satinAlLinki` doluysa → o Shopier ürün linkine gider (sipariş kaydı yine oluşur, panelinde görürsün)
2. Boşsa ve Shopier API kuruluysa → doğrudan ödeme sayfasına gider, kredi otomatik yüklenir
3. İkisi de yoksa → Discord'a yönlendirir, siparişi elle onaylarsın

> Ürün linki kullanırken ödeme bildirimi gelmez, yani krediyi **sen** yönetim panelinden Teslim et diyerek yüklersin. Tam otomatik olması için Shopier API kurulumunu yapman gerekir (bir üstteki bölüm).
>
> Shopier ürün açıklamasına **"Sipariş notuna oyun içi nickinizi yazın"** eklemeyi unutma.

---

## Güvenlik sistemi

### Kurulum

Supabase → SQL Editor → **GUVENLIK.sql** dosyasının tamamını yapıştır → Run.

Dosyanın başında bir kontrol sorgusu var: aynı nicki kullanan iki hesap varsa listeler. Sonuç boş dönerse sorun yok. Doluysa Table Editor'den nickleri düzeltip dosyayı tekrar çalıştır.

### Şifre yenileme e-postaları için

Supabase → **Authentication → URL Configuration** → **Redirect URLs** listesine ekle:

```
https://shionetwork.com.tr/sifre-yenile
```

> ⚠️ Supabase'in ücretsiz e-posta servisi saatte sadece birkaç mail gönderir ve çoğu spam klasörüne düşer. Oyuncu sayın artınca **Authentication → Emails → SMTP Settings** bölümünden ücretsiz bir servis (Resend, Brevo) bağlaman gerekir. Yoksa "şifremi unuttum" pratikte çalışmaz.

### Neler korunuyor

**Oturum çalınmasına karşı**
Giriş bilgileri artık tarayıcının localStorage'ında değil, **httpOnly çerezlerde** tutuluyor. Bu çerezleri JavaScript okuyamaz — sitede bir XSS açığı çıksa bile oturum çalınamaz. Tarayıcı Supabase'e doğrudan bağlanmıyor; her istek `/api/db` vekilinden geçiyor.

**Kaba kuvvet saldırısına karşı**
Giriş denemeleri hem IP hem hesap bazında sınırlı: bir hesaba 10 dakikada en fazla 6 deneme, bir IP'den 15 deneme. Kayıt saatte 5, şifre sıfırlama yarım saatte 4 istekle sınırlı.

**Zayıf şifreye karşı**
En az 8 karakter, bir harf ve bir rakam zorunlu. Yaygın şifreler (`12345678`, `password` vb.) reddediliyor. Şifre nicki veya e-posta adını içeremiyor. Formda canlı güç göstergesi var.

**Hesap çalmaya karşı**
Şifre değiştirmek için mevcut şifre zorunlu — açık kalmış bir oturumdan şifre değiştirilemez. "Her yerden çık" ile tüm cihazlardaki oturumlar kapatılabilir.

**Kimlik taklidine karşı**
Aynı Minecraft nicki iki hesapta kayıtlı olamaz (veritabanı seviyesinde benzersizlik).

**Fiyat oynamasına karşı**
Siparişler doğrudan eklenemiyor, sadece veritabanı fonksiyonları üzerinden oluşuyor ve fiyat `paketler` tablosundan okunuyor. Kimse 300₺'lik paketi 1₺'ye sipariş edemez.

**Spam siparişe karşı**
Bir oyuncunun aynı anda en fazla 5 bekleyen siparişi olabilir.

**Kötüye kullanıma karşı**
Yönetici kredi düzenlemeleri `kredi_hareketleri` tablosuna kaydediliyor: kim, kime, ne kadar, ne zaman. Tek seferde 100.000'den fazla kredi verilemiyor.

**Bilgi sızmasına karşı**
"Şifremi unuttum" ekranı, e-posta kayıtlı olsun olmasın aynı mesajı gösterir — böylece hangi e-postaların sistemde olduğu öğrenilemez.

### Senin yapman gerekenler

1. **Vercel hesabında 2FA'yı aç.** Domainin, siten ve ödeme anahtarların o hesaba bağlı.
2. **Supabase hesabında 2FA'yı aç.**
3. `service_role` anahtarını hiçbir yere yazma, kimseyle paylaşma.
4. Yönetici yetkisini sadece güvendiğin kişilere ver — yönetim paneline giren herkes sınırsız kredi dağıtabilir.

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
