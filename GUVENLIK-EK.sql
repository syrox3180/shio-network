-- ============================================================
--   SHIO NETWORK — FONKSİYON YETKİLERİNİ SIKILAŞTIRMA
--   Supabase Security Advisor uyarılarını kapatır.
--   SQL Editor → yapıştır → Run
-- ============================================================

-- ---------- 1. TETİKLEYİCİ FONKSİYONLARI TAMAMEN KAPAT ----------
-- Bunlar sadece veritabanı içinden otomatik çalışır.
-- Dışarıdan çağrılabilmeleri için hiçbir sebep yok.

revoke all on function public.yeni_kullanici() from public, anon, authenticated;
revoke all on function public.siparis_durum_degisti() from public, anon, authenticated;

-- ---------- 2. DİĞER FONKSİYONLARDAN GENEL YETKİYİ AL ----------

revoke all on function public.admin_mi() from public, anon, authenticated;
revoke all on function public.nick_musait(text) from public, anon, authenticated;
revoke all on function public.kredi_ile_al(text) from public, anon, authenticated;
revoke all on function public.kredi_siparisi_olustur(text) from public, anon, authenticated;
revoke all on function public.paket_siparisi_olustur(text) from public, anon, authenticated;
revoke all on function public.kredi_ayarla(uuid, integer) from public, anon, authenticated;

-- ---------- 3. SADECE GEREKEN YETKİLERİ GERİ VER ----------

-- admin_mi: RLS kuralları içinde kullanılıyor, her iki role de gerekli.
-- Giriş yapmamış birine her zaman false döner, bilgi sızdırmaz.
grant execute on function public.admin_mi() to anon, authenticated;

-- nick_musait: kayıt formunda, giriş yapmadan önce çalışıyor.
-- Sadece true/false döner, kimin aldığını söylemez.
grant execute on function public.nick_musait(text) to anon, authenticated;

-- Aşağıdakiler yalnızca giriş yapmış kullanıcılar için:
grant execute on function public.kredi_ile_al(text) to authenticated;
grant execute on function public.kredi_siparisi_olustur(text) to authenticated;
grant execute on function public.paket_siparisi_olustur(text) to authenticated;
grant execute on function public.kredi_ayarla(uuid, integer) to authenticated;

-- ---------- 4. KONTROL ----------
-- Aşağıdaki sorgu her fonksiyonun kimler tarafından çağrılabildiğini gösterir.

select
  p.proname as fonksiyon,
  coalesce(array_to_string(p.proacl, ', '), 'sadece sahibi') as yetkiler
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'admin_mi', 'nick_musait', 'kredi_ile_al', 'kredi_siparisi_olustur',
    'paket_siparisi_olustur', 'kredi_ayarla', 'yeni_kullanici', 'siparis_durum_degisti'
  )
order by p.proname;
