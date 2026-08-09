-- ============================================================
--   SHIO NETWORK — SHOPIER OTOMATİK ÖDEME
--   Supabase → SQL Editor → yapıştır → Run
--   Önce KURULUM.sql ve KREDI.sql çalıştırılmış olmalı.
-- ============================================================

alter table public.siparisler
  add column if not exists odendi boolean not null default false,
  add column if not exists shopier_odeme_id text,
  add column if not exists odeme_tarihi timestamptz;

-- Aynı Shopier ödemesinin iki kez işlenmesini engelle
create unique index if not exists siparis_shopier_odeme_benzersiz
  on public.siparisler (shopier_odeme_id)
  where shopier_odeme_id is not null;
