-- Supabase > SQL Editor > yapistir > Run.
-- Tekrar calistirmak guvenli.

-- ============ 1) PROFILLER ============
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text not null unique,          -- Minecraft kullanici adi
  discord    text,
  role       text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- Kayit olan her kullaniciya otomatik profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, discord)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'oyuncu_' || left(new.id::text, 6)),
    new.raw_user_meta_data->>'discord'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Yetki kontrolu (RLS icinde sonsuz donguye girmemesi icin security definer)
create or replace function public.is_admin()
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============ 2) VIP PAKETLERI ============
create table if not exists public.packages (
  slug       text primary key,
  name       text not null,
  price      numeric(10,2) not null,
  duration   text not null default '1 Ay',
  blurb      text,
  popular    boolean not null default false,
  sort_order int not null default 0,
  active     boolean not null default true
);

-- Karsilastirma tablosunun satirlari.
-- values ornegi: {"vip":"20","mvip":"30","sponsor":"40"}
-- "true" yazarsan tik isareti, "false" veya bos birakirsan tire gorunur.
create table if not exists public.package_features (
  id         bigint generated always as identity primary key,
  label      text not null,
  values     jsonb not null default '{}'::jsonb,
  sort_order int not null default 0
);

-- ============ 3) SIPARISLER ============
create table if not exists public.orders (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users on delete cascade,
  package_slug text not null references public.packages(slug),
  username     text not null,
  price        numeric(10,2) not null,
  status       text not null default 'pending'
               check (status in ('pending','paid','delivered','cancelled')),
  admin_note   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists orders_user_idx    on public.orders (user_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ============ 4) SIRALAMA ve EKIP ============
create table if not exists public.players (
  id         bigint generated always as identity primary key,
  username   text not null unique,
  balance    bigint not null default 0,
  blocks     bigint not null default 0,
  kills      int    not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists players_balance_idx on public.players (balance desc);

create table if not exists public.staff (
  id         bigint generated always as identity primary key,
  username   text not null,
  role       text not null,
  discord    text,
  sort_order int not null default 0
);

create table if not exists public.applications (
  id         bigint generated always as identity primary key,
  username   text not null,
  discord    text not null,
  age        int  not null,
  reason     text not null,
  created_at timestamptz not null default now()
);

-- ============ 5) RLS ============
alter table public.profiles         enable row level security;
alter table public.packages         enable row level security;
alter table public.package_features enable row level security;
alter table public.orders           enable row level security;
alter table public.players          enable row level security;
alter table public.staff            enable row level security;
alter table public.applications     enable row level security;

drop policy if exists "profil oku"        on public.profiles;
drop policy if exists "profil guncelle"   on public.profiles;
drop policy if exists "paket oku"         on public.packages;
drop policy if exists "paket yonet"       on public.packages;
drop policy if exists "ozellik oku"       on public.package_features;
drop policy if exists "ozellik yonet"     on public.package_features;
drop policy if exists "siparis oku"       on public.orders;
drop policy if exists "siparis olustur"   on public.orders;
drop policy if exists "siparis guncelle"  on public.orders;
drop policy if exists "oyuncu oku"        on public.players;
drop policy if exists "ekip oku"          on public.staff;
drop policy if exists "basvuru gonder"    on public.applications;
drop policy if exists "basvuru oku"       on public.applications;

-- Profil: kendi profilini gorur, admin hepsini gorur
create policy "profil oku" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profil guncelle" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Yetki yukseltme kapali: role sutunu API uzerinden hic guncellenemez.
-- Sadece SQL Editor'dan (service role) degistirilebilir.
revoke update (role) on public.profiles from anon, authenticated;

-- Paketler herkese acik, sadece admin duzenler
create policy "paket oku"   on public.packages for select using (true);
create policy "paket yonet" on public.packages for all
  using (public.is_admin()) with check (public.is_admin());

create policy "ozellik oku"   on public.package_features for select using (true);
create policy "ozellik yonet" on public.package_features for all
  using (public.is_admin()) with check (public.is_admin());

-- Siparis: oyuncu kendininkini gorur ve olusturur, durumu sadece admin degistirir
create policy "siparis oku" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "siparis olustur" on public.orders for insert
  with check (user_id = auth.uid() and status = 'pending');
create policy "siparis guncelle" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "oyuncu oku" on public.players for select using (true);
create policy "ekip oku"   on public.staff   for select using (true);

create policy "basvuru gonder" on public.applications for insert with check (
  char_length(username) between 3 and 16
  and char_length(discord) between 2 and 40
  and age between 10 and 99
  and char_length(reason) between 20 and 1000
);
create policy "basvuru oku" on public.applications for select using (public.is_admin());

-- ============ 6) BASLANGIC VERISI ============
insert into public.packages (slug, name, price, duration, blurb, popular, sort_order) values
  ('vip',     'VIP',     150, '1 Ay', 'Başlangıç için ihtiyacın olan her şey', false, 1),
  ('mvip',    'MVIP',    300, '1 Ay', 'Ekonomide öne geçmek isteyenler için',  false, 2),
  ('sponsor', 'Sponsor', 500, '1 Ay', 'Sunucudaki en üst seviye',              true,  3)
on conflict (slug) do update set
  name = excluded.name, price = excluded.price, duration = excluded.duration,
  blurb = excluded.blurb, popular = excluded.popular, sort_order = excluded.sort_order;

delete from public.package_features;
insert into public.package_features (label, values, sort_order) values
  ('Süre',                      '{"vip":"1 Ay","mvip":"1 Ay","sponsor":"1 Ay"}', 1),
  ('Kırılan blokların düşmesi', '{"vip":"true","mvip":"true","sponsor":"true"}', 2),
  ('Takım limiti',              '{"vip":"20","mvip":"30","sponsor":"40"}', 3),
  ('Respawn beacon koyma limiti','{"vip":"3","mvip":"4","sponsor":"5"}', 4),
  ('AFK alanı shard ödülü',     '{"vip":"3","mvip":"4","sponsor":"5"}', 5),
  ('AFK ödül limiti yok',       '{"vip":"true","mvip":"true","sponsor":"true"}', 6),
  ('Günlük ödül',               '{"vip":"1.25x + vote kasası anahtarı","mvip":"1.50x + vote ve para kasası anahtarı","sponsor":"2x + vote ve para kasası anahtarı"}', 7),
  ('XP çarpanı',                '{"vip":"1.25x","mvip":"1.50x","sponsor":"2x"}', 8),
  ('Discord raid bildirimi',    '{"vip":"true","mvip":"true","sponsor":"true"}', 9),
  ('/enderchest komutu',        '{"vip":"true","mvip":"true","sponsor":"true"}', 10);

insert into public.staff (username, role, sort_order) values
  ('Kurucu', 'Kurucu', 1)
on conflict do nothing;

-- ============ 7) KENDINI ADMIN YAP ============
-- Once siteden normal kayit ol, sonra asagidaki satiri kendi mailinle calistir.
-- Baska hic kimse kendini admin yapamaz; bu satir sadece SQL Editor'da calisir.
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'senin@mailin.com');
--
-- Admin listesini gormek icin:
-- select p.username, u.email from public.profiles p
-- join auth.users u on u.id = p.id where p.role = 'admin';
