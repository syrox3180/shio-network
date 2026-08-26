-- ============================================================
--   SHIO NETWORK — SANDIK: OYUN MODU (BOXMINING / PRAC) SÜTUNU
--   Boxmining ve Prac birbirinden ayrı sunucular olduğu için
--   oyuncu etkinleştirirken hangisini seçtiğini burada saklarız.
--   SANDIK.sql zaten çalıştırılmış olmalı.
--   Supabase → SQL Editor → yapıştır → Run
-- ============================================================

alter table public.envanter
  add column if not exists sunucu text;

comment on column public.envanter.sunucu is 'Etkinleştirmenin gönderildiği sunucu: boxmining | prac';
