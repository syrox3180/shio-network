"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, Field } from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";

export default function KayitPage() {
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
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        data: {
          username: String(form.get("username")).trim(),
          discord: String(form.get("discord") ?? "").trim(),
        },
      },
    });
    setSending(false);

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Bu e-posta zaten kayıtlı. Giriş yapmayı dene."
          : "Kayıt tamamlanamadı: " + error.message,
      );
      return;
    }

    router.push("/hesap");
    router.refresh();
  }

  return (
    <AuthShell
      title="Kayıt ol"
      description="Paket almak ve siparişlerini takip etmek için hesap aç."
      footer={
        <>
          Hesabın var mı?{" "}
          <Link href="/giris" className="text-brand hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Minecraft kullanıcı adın"
          name="username"
          required
          minLength={3}
          maxLength={16}
          hint="Paket bu isme tanımlanacak, doğru yaz."
        />
        <Field label="Discord kullanıcı adın" name="discord" maxLength={40} />
        <Field label="E-posta" name="email" type="email" required autoComplete="email" />
        <Field
          label="Şifre"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-brand px-5 py-3 font-display font-bold text-deep disabled:opacity-60"
        >
          {sending ? "Hesap açılıyor" : "Hesap aç"}
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
