"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, Field } from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase bağlantısı tanımlı değil. .env.local dosyasını doldur.");
      return;
    }

    setSending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setSending(false);

    if (error) {
      setError("E-posta veya şifre hatalı.");
      return;
    }

    router.push("/hesap");
    router.refresh();
  }

  return (
    <AuthShell
      title="Giriş yap"
      description="Siparişlerini görmek ve paket almak için giriş yap."
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="text-brand hover:underline">
            Kayıt ol
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="E-posta" name="email" type="email" required autoComplete="email" />
        <Field
          label="Şifre"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-brand px-5 py-3 font-display font-bold text-deep disabled:opacity-60"
        >
          {sending ? "Giriş yapılıyor" : "Giriş yap"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-brand">
            {error}
          </p>
        )}
      </form>
    </AuthShell>
  );
}
