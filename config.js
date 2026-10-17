// Supabase panelinde: Project Settings → API bölümünden bu iki değeri kopyala.
// "anon public" anahtarı tarayıcıda durabilir; veriler RLS kurallarıyla korunur.
const SUPABASE_URL = 'https://PROJE-ID.supabase.co';
const SUPABASE_ANON_KEY = 'BURAYA-ANON-KEY';

window.sb = null;
try {
  if (window.supabase && !SUPABASE_URL.includes('PROJE-ID')) {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.error('Supabase başlatılamadı:', e);
}
