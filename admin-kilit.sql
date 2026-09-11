-- Sema'yi daha once calistirdiysan sadece bunu calistirman yeterli.

drop policy if exists "profil guncelle" on public.profiles;
create policy "profil guncelle" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Yetki yukseltme kapali: role sutunu API uzerinden guncellenemez.
revoke update (role) on public.profiles from anon, authenticated;

-- Kendini admin yap (maili degistir):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'senin@mailin.com');

-- Yanlislikla birini admin yaptiysan geri al:
-- update public.profiles set role = 'user'
-- where id = (select id from auth.users where email = 'digeri@mail.com');
