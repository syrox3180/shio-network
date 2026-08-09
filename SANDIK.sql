-- ============================================================
--   SHIO NETWORK — SANDIK VE ETKİNLİK SİSTEMİ
--   Supabase → SQL Editor → yapıştır → Run
--   Önce diğer SQL dosyaları çalıştırılmış olmalı.
-- ============================================================

-- ---------- 1. SİTE AYARLARI (etkinlikler için) ----------

create table if not exists public.site_ayarlari (
  anahtar text primary key,
  deger jsonb not null,
  guncelleme timestamptz not null default now()
);

insert into public.site_ayarlari (anahtar, deger)
values ('kredi_carpani', '{"aktif": false, "carpan": 2, "bitis": null, "baslik": "2X KREDİ ETKİNLİĞİ"}'::jsonb)
on conflict (anahtar) do nothing;

alter table public.site_ayarlari enable row level security;

drop policy if exists "ayar oku" on public.site_ayarlari;
create policy "ayar oku" on public.site_ayarlari for select using (true);

-- Çarpanı yönetici ayarlar
create or replace function public.carpan_ayarla(
  p_aktif boolean,
  p_carpan numeric,
  p_bitis timestamptz,
  p_baslik text
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_deger jsonb;
begin
  if not public.admin_mi() then
    raise exception 'Yetkin yok.';
  end if;

  if p_carpan < 1 or p_carpan > 10 then
    raise exception 'Carpan 1 ile 10 arasinda olmali.';
  end if;

  v_deger := jsonb_build_object(
    'aktif', p_aktif,
    'carpan', p_carpan,
    'bitis', p_bitis,
    'baslik', coalesce(p_baslik, 'KREDİ ETKİNLİĞİ')
  );

  update public.site_ayarlari
    set deger = v_deger, guncelleme = now()
    where anahtar = 'kredi_carpani';

  return v_deger;
end;
$$;

-- Çarpan şu an geçerli mi
create or replace function public.gecerli_carpan()
returns numeric
language sql
stable
security definer set search_path = public
as $$
  select case
    when (deger ->> 'aktif')::boolean is true
      and ((deger ->> 'bitis') is null or (deger ->> 'bitis')::timestamptz > now())
    then greatest(1, (deger ->> 'carpan')::numeric)
    else 1
  end
  from public.site_ayarlari
  where anahtar = 'kredi_carpani';
$$;

-- ---------- 2. KREDİ SİPARİŞİNE ÇARPAN UYGULA ----------

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
  v_carpan numeric;
  v_toplam integer;
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
    raise exception 'Cok fazla bekleyen siparisin var.';
  end if;

  -- Etkinlik çarpanı burada uygulanıyor (tarayıcıya güvenilmiyor)
  v_carpan := public.gecerli_carpan();
  v_toplam := floor(v_kp.kredi * v_carpan);

  insert into public.siparisler
    (kullanici_id, nick, eposta, paket_id, paket_ad, fiyat, durum, tur, odeme, kredi_miktari)
  values
    (v_kullanici, v_profil.nick, v_profil.eposta, v_kp.id,
     v_toplam || ' kredi' || case when v_carpan > 1 then ' (' || v_carpan || 'x etkinlik)' else '' end,
     v_kp.fiyat, 'bekliyor', 'kredi', 'para', v_toplam)
  returning * into v_siparis;

  return v_siparis;
end;
$$;

-- ---------- 3. SANDIK (ENVANTER) ----------

create table if not exists public.envanter (
  id bigserial primary key,
  kullanici_id uuid references auth.users on delete cascade,
  siparis_id bigint references public.siparisler on delete set null,
  paket_id text not null,
  paket_ad text not null,
  durum text not null default 'bekliyor',   -- bekliyor | etkin | hata
  nick text,
  etkinlestirme timestamptz,
  bitis timestamptz,
  hata_mesaji text,
  olusturma timestamptz not null default now()
);

create index if not exists envanter_kullanici on public.envanter (kullanici_id, durum);

alter table public.envanter enable row level security;

drop policy if exists "envanter oku" on public.envanter;
create policy "envanter oku" on public.envanter
  for select using (auth.uid() = kullanici_id or public.admin_mi());

-- ---------- 4. TESLİM EDİLEN PAKET SANDIĞA DÜŞSÜN ----------

create or replace function public.siparis_durum_degisti()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Kredi siparişi teslim edildiyse krediyi yükle
  if new.tur = 'kredi'
     and new.durum = 'teslim'
     and coalesce(old.kredi_islendi, false) = false then
    update public.profiller
      set kredi = kredi + coalesce(new.kredi_miktari, 0)
      where id = new.kullanici_id;
    new.kredi_islendi := true;
  end if;

  -- Kredi ile alınmış paket iptal edildiyse krediyi iade et
  if new.tur = 'paket'
     and new.odeme = 'kredi'
     and new.durum = 'iptal'
     and coalesce(old.kredi_islendi, false) = false then
    update public.profiller
      set kredi = kredi + new.fiyat
      where id = new.kullanici_id;
    new.kredi_islendi := true;
  end if;

  -- Paket teslim edildiyse sandığa düşür
  if new.tur = 'paket'
     and new.durum = 'teslim'
     and old.durum is distinct from 'teslim' then
    insert into public.envanter (kullanici_id, siparis_id, paket_id, paket_ad)
    values (new.kullanici_id, new.id, new.paket_id, new.paket_ad);
  end if;

  return new;
end;
$$;

drop trigger if exists siparis_guncellendi on public.siparisler;
create trigger siparis_guncellendi
  before update on public.siparisler
  for each row execute function public.siparis_durum_degisti();

-- ---------- 5. YETKİLER ----------

revoke all on function public.carpan_ayarla(boolean, numeric, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.carpan_ayarla(boolean, numeric, timestamptz, text) to authenticated;

revoke all on function public.gecerli_carpan() from public, anon, authenticated;
grant execute on function public.gecerli_carpan() to anon, authenticated;
