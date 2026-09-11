# Shio Network — sunucu sitesi

Next.js 15 (App Router) + Tailwind 4 + Supabase (Auth + Postgres). GitHub'a push edip Vercel'e bağlaman yeterli.

## Sayfalar

| Yol | Ne yapar |
|---|---|
| `/` | Ana sayfa: IP kopyalama, canlı oyuncu sayısı, VIP karşılaştırma tablosu, sıralama, kurallar, yetkili başvurusu |
| `/kayit` | Hesap açma (Minecraft nicki + e-posta + şifre) |
| `/giris` | Giriş |
| `/hesap` | Oyuncunun siparişleri ve ödeme bilgileri |
| `/admin` | Tüm siparişler, durum değiştirme, ciro özeti — sadece admin |

## 1. Yerelde çalıştır

```bash
npm install
cp .env.example .env.local   # anahtarları Supabase'den doldur
npm run dev
```

Anahtarları girmesen de site açılır, demo veriyle çalışır (giriş ve sipariş çalışmaz).

## 2. Supabase kurulumu

1. supabase.com'da yeni proje aç.
2. **SQL Editor** > `supabase/schema.sql` içeriğini yapıştır > Run.
3. **Authentication > Providers > Email**: "Confirm email" kapalıysa kayıt anında aktif olur. Açık bırakırsan oyuncunun mailini onaylaması gerekir.
4. **Project Settings > API**: `Project URL` ve `anon public` anahtarını `.env.local` içine yaz.

### Kendini admin yap

Önce siteden normal kayıt ol, sonra SQL Editor'da:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'senin@mailin.com');
```

Bundan sonra üst menüde **Admin** butonu çıkar. Kimlerin admin olduğunu görmek için:

```sql
select p.username, u.email from public.profiles p
join auth.users u on u.id = p.id where p.role = 'admin';
```

**Panel sadece senin hesabında açılır.** Üç kat koruma var:

1. `role` sütunu API üzerinden güncellenemez — `revoke update (role)` ile kapalı. Kimse kendini admin yapamaz, sadece SQL Editor'dan sen yaparsın.
2. `/admin` adresine admin olmayan biri girerse 404 görür, sayfanın varlığını bile anlamaz.
3. RLS gereği başkasının siparişini okuyamaz; sipariş durumunu değiştiren işlem sunucu tarafında ayrıca rol kontrolünden geçer.

Şemayı daha önce çalıştırdıysan `supabase/admin-kilit.sql` dosyasını çalıştırman yeterli.

## 3. Tablolar

| Tablo | İş |
|---|---|
| `profiles` | Kullanıcı profili: Minecraft nicki, Discord, rol (`user` / `admin`) |
| `packages` | VIP · MVIP · Sponsor. Fiyat ve açıklamayı panelden değiştirirsin |
| `package_features` | Karşılaştırma tablosunun satırları |
| `orders` | Siparişler. Durum: `pending` → `paid` → `delivered` |
| `players` | Sıralama tablosu, sunucu eklentin buraya yazar |
| `staff` | Yetkili kadrosu |
| `applications` | Yetkili başvuruları (sadece admin okur) |

RLS açık: oyuncu sadece kendi siparişini görür, durumu yalnızca admin değiştirebilir. Paket ve özellik tablolarını da yalnızca admin düzenleyebilir.

### Karşılaştırma tablosuna satır ekleme

`package_features` tablosuna satır ekle, `values` alanına şunu yaz:

```json
{"vip": "20", "mvip": "30", "sponsor": "40"}
```

`"true"` yazarsan yeşil tik, boş bırakır veya `"false"` yazarsan tire görünür. Metin yazarsan olduğu gibi çıkar.

## 4. Sipariş akışı

1. Oyuncu giriş yapar, paketin altındaki **Satın al** butonuna basar.
2. `orders` tablosuna `pending` kaydı düşer, oyuncu `/hesap` sayfasında sipariş numarasını ve ödeme bilgilerini görür.
3. Ödeme gelince `/admin` üzerinden durumu **Ödeme alındı**, paketi tanımlayınca **Teslim edildi** yaparsın.

Ödeme bilgileri `lib/site.ts` içindeki `payment` alanından geliyor — IBAN / Papara bilgini oraya yaz.
Otomatik ödeme istersen (Shopier, iyzico, PayTR) sonradan bir webhook route'u ekleyip durumu `paid`'e çeken adımı otomatikleştirebiliriz.

## 5. GitHub + Vercel

```bash
git init
git add .
git commit -m "ilk surum"
git branch -M main
git remote add origin https://github.com/KULLANICI/shio-network-site.git
git push -u origin main
```

vercel.com > **Add New > Project** > repoyu seç. Environment Variables kısmına ekle:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Deploy. Sonra `main`'e her push otomatik yayına çıkar. Domainini Vercel > Settings > Domains kısmından bağlarsın.

## 6. Özelleştirme

- `lib/site.ts` — sunucu adı, IP, sürüm, Discord linki, ödeme bilgisi, kurallar.
- `app/globals.css` içindeki `@theme` bloğu — `--color-brand` değerini değiştirince tüm vurgu rengi değişir.
- Canlı oyuncu sayısı `api.mcsrvstat.us` üzerinden geliyor, eklenti gerekmiyor.
- Kafa görselleri `mc-heads.net` üzerinden geliyor.
