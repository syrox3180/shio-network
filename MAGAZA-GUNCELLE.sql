-- ============================================================
--   SHIO NETWORK — MAĞAZA GÜNCELLEMESİ
--   Supabase → SQL Editor → yapıştır → Run
--   • Raid Alert (100 ₺) ürününü ekler
--   • Satıştan kaldırılan kasa, set kiti ve SVIP'i siparişe kapatır
--   Birden fazla kez çalıştırman zarar vermez.
--   DİKKAT: id ve fiyat lib/ayarlar.js ile BİREBİR AYNI olmalı.
-- ============================================================

insert into public.paketler (id, ad, fiyat) values
  ('raidalert', 'Raid Alert', 100)
on conflict (id) do update
  set ad = excluded.ad, fiyat = excluded.fiyat;

-- Kasalar, setler ve SVIP artık satılmıyor. Fiyat tablosundan silinince
-- kimse bu ürünleri API üzerinden de sipariş edemez.
-- (Eski siparişler ve sandık kayıtları bozulmaz; paket_id düz metin.)
delete from public.paketler
  where id in ('kasa_kit', 'kasa_nihai', 'kit_cadi', 'kit_evoker', 'svip');

comment on column public.envanter.sunucu is 'Etkinleştirmenin gönderildiği sunucu: genpvp (eski kayıtlarda boxmining | prac)';

-- Kontrol: sandıkta hâlâ kullanılmamış kasa/kit/SVIP var mı?
select id, kullanici_id, paket_ad, durum
  from public.envanter
  where paket_id like 'kasa\_%' or paket_id like 'kit\_%' or paket_id = 'svip'
  order by id;
