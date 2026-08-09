-- ============================================================
--   SHIO NETWORK — İLERİ GÜVENLİK KATMANI
--   Supabase → SQL Editor → yapıştır → Run
--   Önce KURULUM / KREDI / SHOPIER / GUVENLIK dosyaları çalışmış olmalı.
-- ============================================================

-- ---------- 1. KALICI HIZ SINIRLAMA ----------
-- Sunucu yeniden başlasa bile deneme sayaçları kaybolmaz.

create table if not exists public.guvenlik_denemeleri (
  anahtar text primary key,
  sayac integer not null default 0,
  ilk_deneme timestamptz not null default now(),
  kilit_bitis timestamptz
);

alter table public.guvenlik_denemeleri enable row level security;
-- Politika yok: sadece servis anahtarı erişebilir.

create or replace function public.deneme_kaydet(
  p_anahtar text,
  p_limit integer,
  p_pencere_saniye integer,
  p_kilit_dakika integer
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_kayit public.guvenlik_denemeleri;
  v_simdi timestamptz := now();
begin
  select * into v_kayit
  from public.guvenlik_denemeleri
  where anahtar = p_anahtar
  for update;

  -- Kilitliyse süresi dolmuş mu bak
  if found and v_kayit.kilit_bitis is not null and v_kayit.kilit_bitis > v_simdi then
    return jsonb_build_object(
      'izin', false,
      'kalan_saniye', ceil(extract(epoch from (v_kayit.kilit_bitis - v_simdi)))
    );
  end if;

  -- Kayıt yok ya da pencere dolmuş → sıfırdan başlat
  if not found
     or v_kayit.ilk_deneme < v_simdi - make_interval(secs => p_pencere_saniye)
     or (v_kayit.kilit_bitis is not null and v_kayit.kilit_bitis <= v_simdi) then
    insert into public.guvenlik_denemeleri (anahtar, sayac, ilk_deneme, kilit_bitis)
    values (p_anahtar, 1, v_simdi, null)
    on conflict (anahtar) do update
      set sayac = 1, ilk_deneme = v_simdi, kilit_bitis = null;
    return jsonb_build_object('izin', true, 'sayac', 1);
  end if;

  -- Sayacı artır
  update public.guvenlik_denemeleri
    set sayac = sayac + 1,
        kilit_bitis = case
          when sayac + 1 >= p_limit then v_simdi + make_interval(mins => p_kilit_dakika)
          else null
        end
    where anahtar = p_anahtar
    returning * into v_kayit;

  if v_kayit.sayac >= p_limit then
    return jsonb_build_object(
      'izin', false,
      'kalan_saniye', ceil(extract(epoch from (v_kayit.kilit_bitis - v_simdi)))
    );
  end if;

  return jsonb_build_object('izin', true, 'sayac', v_kayit.sayac);
end;
$$;

-- Başarılı işlemden sonra sayacı temizle
create or replace function public.deneme_sifirla(p_anahtar text)
returns void
language sql
security definer set search_path = public
as $$
  delete from public.guvenlik_denemeleri where anahtar = p_anahtar;
$$;

-- ---------- 2. GÜVENLİK GÜNLÜĞÜ ----------

create table if not exists public.guvenlik_kayitlari (
  id bigserial primary key,
  olay text not null,
  kullanici_id uuid,
  eposta text,
  ip text,
  detay jsonb,
  tarih timestamptz not null default now()
);

create index if not exists guvenlik_kayit_tarih on public.guvenlik_kayitlari (tarih desc);
create index if not exists guvenlik_kayit_olay on public.guvenlik_kayitlari (olay);

alter table public.guvenlik_kayitlari enable row level security;

drop policy if exists "kayit oku" on public.guvenlik_kayitlari;
create policy "kayit oku" on public.guvenlik_kayitlari
  for select using (public.admin_mi());

-- ---------- 3. BİLİNEN CİHAZLAR ----------
-- Yeni bir yerden giriş yapıldığında haberdar olmak için.

create table if not exists public.bilinen_girisler (
  id bigserial primary key,
  kullanici_id uuid not null,
  ip_ozet text not null,
  ilk_gorulme timestamptz not null default now(),
  son_gorulme timestamptz not null default now(),
  unique (kullanici_id, ip_ozet)
);

alter table public.bilinen_girisler enable row level security;

drop policy if exists "giris oku" on public.bilinen_girisler;
create policy "giris oku" on public.bilinen_girisler
  for select using (auth.uid() = kullanici_id or public.admin_mi());

create or replace function public.giris_kaydet(p_kullanici uuid, p_ip_ozet text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_yeni boolean := false;
begin
  insert into public.bilinen_girisler (kullanici_id, ip_ozet)
  values (p_kullanici, p_ip_ozet)
  on conflict (kullanici_id, ip_ozet)
    do update set son_gorulme = now()
  returning (xmax = 0) into v_yeni;

  return coalesce(v_yeni, false);
end;
$$;

-- ---------- 4. YÖNETİCİ İKİ ADIMLI DOĞRULAMA ----------

create table if not exists public.yonetici_2fa (
  kullanici_id uuid primary key references auth.users on delete cascade,
  gizli_anahtar text not null,
  aktif boolean not null default false,
  olusturma timestamptz not null default now()
);

alter table public.yonetici_2fa enable row level security;
-- Politika yok: sadece servis anahtarı erişebilir, tarayıcı asla göremez.

-- ---------- 5. YETKİLERİ KAPAT ----------

revoke all on function public.deneme_kaydet(text, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function public.deneme_sifirla(text) from public, anon, authenticated;
revoke all on function public.giris_kaydet(uuid, text) from public, anon, authenticated;

-- ---------- 6. ESKİ KAYITLARI TEMİZLEME ----------
-- İstersen ayda bir elle çalıştır.

create or replace function public.guvenlik_temizle()
returns void
language sql
security definer set search_path = public
as $$
  delete from public.guvenlik_kayitlari where tarih < now() - interval '90 days';
  delete from public.guvenlik_denemeleri where ilk_deneme < now() - interval '7 days'
    and (kilit_bitis is null or kilit_bitis < now());
$$;

revoke all on function public.guvenlik_temizle() from public, anon, authenticated;
