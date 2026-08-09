-- ============================================================
--   SHIO NETWORK — GÜVENLİK GÜNCELLEMESİ
--   Supabase → SQL Editor → yapıştır → Run
--   Önce KURULUM.sql, KREDI.sql ve SHOPIER.sql çalıştırılmış olmalı.
-- ============================================================

-- ---------- 1. AYNI NİCK İKİ HESAPTA OLMASIN ----------
-- Önce çakışan kayıt var mı diye bak. Sonuç boş dönerse sorun yok.
-- Doluysa Table Editor'den nickleri düzelt, sonra bu dosyayı tekrar çalıştır.

select lower(nick) as nick, count(*) as adet
from public.profiller
group by lower(nick)
having count(*) > 1;

create unique index if not exists profiller_nick_benzersiz
  on public.profiller (lower(nick));

-- ---------- 2. NİCK MÜSAİT Mİ (kayıt formu için) ----------
-- Kayıt olmadan önce nick kontrolü yapar. Kimin aldığını söylemez,
-- sadece müsait olup olmadığını döner.

create or replace function public.nick_musait(p_nick text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select not exists (
    select 1 from public.profiller where lower(nick) = lower(p_nick)
  );
$$;

-- ---------- 3. PAKET SİPARİŞİ FONKSİYONU ----------
-- Fiyat artık veritabanından okunuyor. Tarayıcıdan gelen tutara güvenilmiyor.

create or replace function public.paket_siparisi_olustur(p_paket_id text)
returns public.siparisler
language plpgsql
security definer set search_path = public
as $$
declare
  v_kullanici uuid := auth.uid();
  v_profil public.profiller;
  v_paket public.paketler;
  v_acik integer;
  v_siparis public.siparisler;
begin
  if v_kullanici is null then
    raise exception 'Giris yapmalisin.';
  end if;

  select * into v_paket from public.paketler where id = p_paket_id;
  if not found then
    raise exception 'Paket bulunamadi.';
  end if;

  select * into v_profil from public.profiller where id = v_kullanici;
  if not found then
    raise exception 'Profil bulunamadi.';
  end if;

  -- Spam koruması: aynı anda 5'ten fazla bekleyen siparişi olamaz
  select count(*) into v_acik
  from public.siparisler
  where kullanici_id = v_kullanici and durum = 'bekliyor';

  if v_acik >= 5 then
    raise exception 'Cok fazla bekleyen siparisin var. Once mevcut siparislerini tamamla.';
  end if;

  insert into public.siparisler
    (kullanici_id, nick, eposta, paket_id, paket_ad, fiyat, durum, tur, odeme)
  values
    (v_kullanici, v_profil.nick, v_profil.eposta, v_paket.id, v_paket.ad,
     v_paket.fiyat, 'bekliyor', 'paket', 'para')
  returning * into v_siparis;

  return v_siparis;
end;
$$;

-- ---------- 4. DOĞRUDAN SİPARİŞ EKLEMEYİ KAPAT ----------
-- Artık siparişler sadece yukarıdaki fonksiyonlar üzerinden oluşturulabilir.
-- Böylece kimse kendi belirlediği fiyatla sipariş kaydı açamaz.

drop policy if exists "siparis olustur" on public.siparisler;

-- ---------- 5. KREDİ SİPARİŞİNE DE SPAM KORUMASI ----------

create or replace function public.kredi_siparisi_olustur(p_kredi_paketi text)
returns public.siparisler
language plpgsql
security definer set search_path = public
as $$
declare
  v_kullanici uuid := auth.uid();
  v_profil public.profiller;
  v_kp public.kredi_paketleri;
  v_acik integer;
  v_siparis public.siparisler;
begin
  if v_kullanici is null then
    raise exception 'Giris yapmalisin.';
  end if;

  select * into v_kp from public.kredi_paketleri where id = p_kredi_paketi;
  if not found then
    raise exception 'Kredi paketi bulunamadi.';
  end if;

  select * into v_profil from public.profiller where id = v_kullanici;
  if not found then
    raise exception 'Profil bulunamadi.';
  end if;

  select count(*) into v_acik
  from public.siparisler
  where kullanici_id = v_kullanici and durum = 'bekliyor';

  if v_acik >= 5 then
    raise exception 'Cok fazla bekleyen siparisin var. Once mevcut siparislerini tamamla.';
  end if;

  insert into public.siparisler
    (kullanici_id, nick, eposta, paket_id, paket_ad, fiyat, durum, tur, odeme, kredi_miktari)
  values
    (v_kullanici, v_profil.nick, v_profil.eposta, v_kp.id,
     v_kp.kredi || ' kredi', v_kp.fiyat, 'bekliyor', 'kredi', 'para', v_kp.kredi)
  returning * into v_siparis;

  return v_siparis;
end;
$$;

-- ---------- 6. KREDİ HAREKETLERİ KAYDI ----------
-- Her kredi değişimi kayda geçer. Bir anlaşmazlıkta geçmişe bakabilirsin.

create table if not exists public.kredi_hareketleri (
  id bigserial primary key,
  kullanici_id uuid references auth.users on delete set null,
  miktar integer not null,
  onceki integer,
  sonraki integer,
  sebep text,
  yapan uuid,
  tarih timestamptz default now()
);

alter table public.kredi_hareketleri enable row level security;

drop policy if exists "hareket oku" on public.kredi_hareketleri;
create policy "hareket oku" on public.kredi_hareketleri
  for select using (auth.uid() = kullanici_id or public.admin_mi());

-- Yönetici kredi düzenlemesi artık kayıt bırakıyor
create or replace function public.kredi_ayarla(p_kullanici uuid, p_miktar integer)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_onceki integer;
  v_yeni integer;
begin
  if not public.admin_mi() then
    raise exception 'Yetkin yok.';
  end if;

  if p_miktar = 0 or abs(p_miktar) > 100000 then
    raise exception 'Gecersiz miktar.';
  end if;

  select kredi into v_onceki from public.profiller where id = p_kullanici;
  if v_onceki is null then
    raise exception 'Kullanici bulunamadi.';
  end if;

  update public.profiller
    set kredi = greatest(0, kredi + p_miktar)
    where id = p_kullanici
    returning kredi into v_yeni;

  insert into public.kredi_hareketleri (kullanici_id, miktar, onceki, sonraki, sebep, yapan)
  values (p_kullanici, p_miktar, v_onceki, v_yeni, 'Yonetici duzenlemesi', auth.uid());

  return v_yeni;
end;
$$;
