-- ============================================================
--   SHIO NETWORK — VERİTABANI KURULUMU
--   Supabase → SQL Editor → bu dosyanın tamamını yapıştır → Run
--   Sadece BİR KEZ çalıştırman yeterli.
-- ============================================================

-- ---------- 1. TABLOLAR ----------

-- Kayıt olan oyuncular
create table if not exists public.profiller (
  id uuid primary key references auth.users on delete cascade,
  nick text not null,
  eposta text,
  kayit_tarihi timestamptz default now()
);

-- Yönetim paneline girebilecek e-postalar
create table if not exists public.adminler (
  eposta text primary key
);

-- Siparişler
create table if not exists public.siparisler (
  id bigserial primary key,
  kullanici_id uuid references auth.users on delete set null,
  nick text not null,
  eposta text,
  paket_id text not null,
  paket_ad text not null,
  fiyat integer not null,
  durum text not null default 'bekliyor',
  aciklama text,
  olusturma timestamptz default now(),
  guncelleme timestamptz default now()
);

-- ---------- 2. KAYIT OLUNCA PROFİL OLUŞTUR ----------

create or replace function public.yeni_kullanici()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiller (id, nick, eposta)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nick', 'oyuncu'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists yeni_kullanici_tetikleyici on auth.users;
create trigger yeni_kullanici_tetikleyici
  after insert on auth.users
  for each row execute function public.yeni_kullanici();

-- ---------- 3. ADMİN KONTROLÜ ----------

create or replace function public.admin_mi()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.adminler
    where eposta = auth.jwt() ->> 'email'
  );
$$;

-- ---------- 4. GÜVENLİK (RLS) ----------

alter table public.profiller enable row level security;
alter table public.adminler  enable row level security;
alter table public.siparisler enable row level security;

drop policy if exists "profil oku" on public.profiller;
create policy "profil oku" on public.profiller
  for select using (auth.uid() = id or public.admin_mi());

drop policy if exists "profil guncelle" on public.profiller;
create policy "profil guncelle" on public.profiller
  for update using (auth.uid() = id);

drop policy if exists "admin kontrol" on public.adminler;
create policy "admin kontrol" on public.adminler
  for select using (eposta = auth.jwt() ->> 'email');

drop policy if exists "siparis oku" on public.siparisler;
create policy "siparis oku" on public.siparisler
  for select using (auth.uid() = kullanici_id or public.admin_mi());

drop policy if exists "siparis olustur" on public.siparisler;
create policy "siparis olustur" on public.siparisler
  for insert with check (auth.uid() = kullanici_id);

drop policy if exists "siparis guncelle" on public.siparisler;
create policy "siparis guncelle" on public.siparisler
  for update using (public.admin_mi());

-- ---------- 5. KENDİNİ ADMİN YAP ----------
-- Aşağıdaki satırdaki e-postayı KENDİ e-postanla değiştir ve öyle çalıştır.
-- Siteye hangi e-posta ile kayıt olacaksan onu yaz.

insert into public.adminler (eposta)
values ('BURAYA_KENDI_EPOSTANI_YAZ')
on conflict (eposta) do nothing;
