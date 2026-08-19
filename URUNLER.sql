-- ============================================================
--   SHIO NETWORK — KASALAR, KİTLER, UNBAN & BLACKLIST AFFI
--   Supabase → SQL Editor → yapıştır → Run
--   Önce KURULUM / KREDI / SANDIK dosyaları çalışmış olmalı.
--   Bu dosyayı birden fazla kez çalıştırman zarar vermez.
-- ============================================================

-- ---------- 1. YENİ ÜRÜNLER ----------
-- Fiyatlar burada tutulur; tarayıcıdan değiştirilemez.
-- DİKKAT: buradaki id ve fiyat değerleri lib/ayarlar.js ile
-- BİREBİR AYNI olmalı. Fiyat değiştirirsen iki yerde de değiştir.

insert into public.paketler (id, ad, fiyat) values
  -- Kasalar
  ('kasa_kit',     'Kit Kasası',      80),
  ('kasa_nihai',   'Nihai Kasası',    50),
  -- Set kitleri
  ('kit_cadi',     'Cadı Kit',       150),
  ('kit_evoker',   'Evoker Kit',     100),
  -- Aflar
  ('af_unban',     'Unban',          250),
  ('af_blacklist', 'Blacklist Affı', 400)
on conflict (id) do update
  set ad = excluded.ad, fiyat = excluded.fiyat;

-- ---------- 2. ENVANTERE KATEGORİ SÜTUNU ----------
-- Yönetim panelinde filtrelemeyi hızlandırır (zorunlu değil).

alter table public.envanter
  add column if not exists kategori text;

-- ---------- 3. TESLİM EDİLEN ÜRÜN SANDIĞA DÜŞSÜN ----------
-- SANDIK.sql'deki tetikleyicinin kategori de yazan hâli.

create or replace function public.siparis_durum_degisti()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_kategori text;
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

  -- Kredi ile alınmış ürün iptal edildiyse krediyi iade et
  if new.tur = 'paket'
     and new.odeme = 'kredi'
     and new.durum = 'iptal'
     and coalesce(old.kredi_islendi, false) = false then
    update public.profiller
      set kredi = kredi + new.fiyat
      where id = new.kullanici_id;
    new.kredi_islendi := true;
  end if;

  -- Ürün teslim edildiyse sandığa düşür
  if new.tur = 'paket'
     and new.durum = 'teslim'
     and old.durum is distinct from 'teslim' then

    v_kategori := case
      when new.paket_id like 'kasa\_%' then 'kasa'
      when new.paket_id like 'kit\_%'  then 'kit'
      when new.paket_id like 'af\_%'   then 'af'
      else 'rutbe'
    end;

    insert into public.envanter
      (kullanici_id, siparis_id, paket_id, paket_ad, kategori)
    values
      (new.kullanici_id, new.id, new.paket_id, new.paket_ad, v_kategori);
  end if;

  return new;
end;
$$;

drop trigger if exists siparis_guncellendi on public.siparisler;
create trigger siparis_guncellendi
  before update on public.siparisler
  for each row execute function public.siparis_durum_degisti();

-- ---------- 4. ESKİ KAYITLARIN KATEGORİSİNİ DOLDUR ----------

update public.envanter
  set kategori = case
    when paket_id like 'kasa\_%' then 'kasa'
    when paket_id like 'kit\_%'  then 'kit'
    when paket_id like 'af\_%'   then 'af'
    else 'rutbe'
  end
  where kategori is null;

-- ---------- 5. KONTROL ----------

select id, ad, fiyat from public.paketler order by fiyat;
