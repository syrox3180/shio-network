-- ============================================================
--   SHIO NETWORK — KREDİ SİSTEMİ
--   Supabase → SQL Editor → bu dosyanın tamamını yapıştır → Run
--   KURULUM.sql'i daha önce çalıştırmış olman gerekiyor.
--   Bu dosyayı birden fazla kez çalıştırman zarar vermez.
-- ============================================================

-- ---------- 1. YENİ SÜTUNLAR ----------

alter table public.profiller
  add column if not exists kredi integer not null default 0;

alter table public.siparisler
  add column if not exists tur text not null default 'paket',            -- 'paket' | 'kredi'
  add column if not exists odeme text not null default 'para',           -- 'para'  | 'kredi'
  add column if not exists kredi_miktari integer,
  add column if not exists kredi_islendi boolean not null default false;

-- ---------- 2. FİYAT TABLOLARI ----------
-- Fiyatlar burada tutulur. Böylece kimse tarayıcıdan fiyat değiştirip
-- 300₺'lik paketi 1 krediye alamaz.

create table if not exists public.paketler (
  id text primary key,
  ad text not null,
  fiyat integer not null
);

create table if not exists public.kredi_paketleri (
  id text primary key,
  kredi integer not null,
  fiyat integer not null
);

-- VIP paketleri (ayarlar.js ile aynı olmalı)
insert into public.paketler (id, ad, fiyat) values
  ('vip',     'VIP',      75),
  ('mvp',     'MVP',     150),
  ('svip',    'SVIP',    250),
  ('sponsor', 'SPONSOR', 300)
on conflict (id) do update set ad = excluded.ad, fiyat = excluded.fiyat;

-- Kredi paketleri (kredi = bonus dahil toplam)
insert into public.kredi_paketleri (id, kredi, fiyat) values
  ('k50',   50,   50),
  ('k100',  110, 100),
  ('k250',  290, 250),
  ('k500',  625, 500)
on conflict (id) do update set kredi = excluded.kredi, fiyat = excluded.fiyat;

alter table public.paketler enable row level security;
alter table public.kredi_paketleri enable row level security;

drop policy if exists "paket oku" on public.paketler;
create policy "paket oku" on public.paketler for select using (true);

drop policy if exists "kredi paket oku" on public.kredi_paketleri;
create policy "kredi paket oku" on public.kredi_paketleri for select using (true);

-- ---------- 3. GÜVENLİK ----------
-- Kullanıcı kendi profilini güncelleyemesin, yoksa kendine kredi yazar.

drop policy if exists "profil guncelle" on public.profiller;

-- ---------- 4. KREDİ İLE PAKET SATIN ALMA ----------

create or replace function public.kredi_ile_al(p_paket_id text)
returns public.siparisler
language plpgsql
security definer set search_path = public
as $$
declare
  v_kullanici uuid := auth.uid();
  v_profil public.profiller;
  v_paket public.paketler;
  v_siparis public.siparisler;
begin
  if v_kullanici is null then
    raise exception 'Giris yapmalisin.';
  end if;

  select * into v_paket from public.paketler where id = p_paket_id;
  if not found then
    raise exception 'Paket bulunamadi.';
  end if;

  select * into v_profil from public.profiller where id = v_kullanici for update;
  if not found then
    raise exception 'Profil bulunamadi.';
  end if;

  if v_profil.kredi < v_paket.fiyat then
    raise exception 'Yetersiz kredi.';
  end if;

  update public.profiller
    set kredi = kredi - v_paket.fiyat
    where id = v_kullanici;

  insert into public.siparisler
    (kullanici_id, nick, eposta, paket_id, paket_ad, fiyat, durum, tur, odeme)
  values
    (v_kullanici, v_profil.nick, v_profil.eposta, v_paket.id, v_paket.ad,
     v_paket.fiyat, 'bekliyor', 'paket', 'kredi')
  returning * into v_siparis;

  return v_siparis;
end;
$$;

-- ---------- 5. KREDİ SİPARİŞİ OLUŞTURMA ----------

create or replace function public.kredi_siparisi_olustur(p_kredi_paketi text)
returns public.siparisler
language plpgsql
security definer set search_path = public
as $$
declare
  v_kullanici uuid := auth.uid();
  v_profil public.profiller;
  v_kp public.kredi_paketleri;
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

  insert into public.siparisler
    (kullanici_id, nick, eposta, paket_id, paket_ad, fiyat, durum, tur, odeme, kredi_miktari)
  values
    (v_kullanici, v_profil.nick, v_profil.eposta, v_kp.id,
     v_kp.kredi || ' kredi', v_kp.fiyat, 'bekliyor', 'kredi', 'para', v_kp.kredi)
  returning * into v_siparis;

  return v_siparis;
end;
$$;

-- ---------- 6. OTOMATİK KREDİ YÜKLEME / İADE ----------
-- Yönetici bir kredi siparişini "Teslim et" yaptığında kredi otomatik yüklenir.
-- Kredi ile alınmış bir paket iptal edilirse kredi otomatik iade edilir.

create or replace function public.siparis_durum_degisti()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.tur = 'kredi'
     and new.durum = 'teslim'
     and coalesce(old.kredi_islendi, false) = false then
    update public.profiller
      set kredi = kredi + coalesce(new.kredi_miktari, 0)
      where id = new.kullanici_id;
    new.kredi_islendi := true;
  end if;

  if new.tur = 'paket'
     and new.odeme = 'kredi'
     and new.durum = 'iptal'
     and coalesce(old.kredi_islendi, false) = false then
    update public.profiller
      set kredi = kredi + new.fiyat
      where id = new.kullanici_id;
    new.kredi_islendi := true;
  end if;

  return new;
end;
$$;

drop trigger if exists siparis_guncellendi on public.siparisler;
create trigger siparis_guncellendi
  before update on public.siparisler
  for each row execute function public.siparis_durum_degisti();

-- ---------- 7. YÖNETİCİ: ELLE KREDİ EKLE / ÇIKAR ----------

create or replace function public.kredi_ayarla(p_kullanici uuid, p_miktar integer)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_yeni integer;
begin
  if not public.admin_mi() then
    raise exception 'Yetkin yok.';
  end if;

  update public.profiller
    set kredi = greatest(0, kredi + p_miktar)
    where id = p_kullanici
    returning kredi into v_yeni;

  if v_yeni is null then
    raise exception 'Kullanici bulunamadi.';
  end if;

  return v_yeni;
end;
$$;
