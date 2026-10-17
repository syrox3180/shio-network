-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını yapıştır → Run

-- 1) Profil tablosu (kullanıcı adları burada tutulur)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null
    check (char_length(username) between 3 and 20 and username ~ '^[A-Za-z0-9_]+$'),
  created_at timestamptz not null default now()
);

-- Büyük/küçük harf fark etmeksizin aynı kullanıcı adı iki kez alınamaz
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- 2) Güvenlik kuralları (RLS)
alter table public.profiles enable row level security;

drop policy if exists "Kullanıcı adları herkese açık" on public.profiles;
create policy "Kullanıcı adları herkese açık"
  on public.profiles for select
  using (true);

drop policy if exists "Herkes kendi profilini günceller" on public.profiles;
create policy "Herkes kendi profilini günceller"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3) Yeni kayıt olunca profili otomatik oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
