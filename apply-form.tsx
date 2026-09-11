"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "sending" | "done" | "error";

export function ApplyForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      username: String(form.get("username") ?? "").trim(),
      discord: String(form.get("discord") ?? "").trim(),
      age: Number(form.get("age")),
      reason: String(form.get("reason") ?? "").trim(),
    };

    if (payload.reason.length < 20) {
      setState("error");
      setMessage("Neden alanı en az 20 karakter olmalı. Biraz daha anlat.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setState("error");
      setMessage("Supabase bağlantısı tanımlı değil. .env.local dosyasına anahtarları ekle.");
      return;
    }

    setState("sending");
    const { error } = await supabase.from("applications").insert(payload);

    if (error) {
      setState("error");
      setMessage("Başvuru kaydedilemedi. Bilgileri kontrol edip tekrar gönder.");
      return;
    }

    setState("done");
    setMessage("Başvurun bize ulaştı. Sonucu Discord üzerinden yazacağız.");
  }

  if (state === "done") {
    return (
      <div className="border border-brand bg-surface p-6">
        <p className="font-display text-xl font-bold">Başvuru alındı</p>
        <p className="mt-2 text-muted">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minecraft kullanıcı adın" name="username" required minLength={3} maxLength={16} />
        <Field label="Discord kullanıcı adın" name="discord" required maxLength={40} />
      </div>
      <Field label="Yaşın" name="age" type="number" required min={10} max={99} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-muted">
          Seni neden almalıyız?
        </span>
        <textarea
          name="reason"
          required
          rows={4}
          maxLength={1000}
          className="w-full border border-line bg-deep px-3.5 py-2.5 text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none"
          placeholder="Günde kaç saat aktifsin, daha önce nerede yetkililik yaptın, sunucuya ne katarsın?"
        />
      </label>

      <button
        type="submit"
        disabled={state === "sending"}
        className="bg-brand px-6 py-3 font-display font-bold text-deep disabled:opacity-60"
      >
        {state === "sending" ? "Gönderiliyor" : "Başvuruyu gönder"}
      </button>

      {state === "error" && (
        <p role="alert" className="text-sm text-brand">
          {message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: { label: string; name: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full border border-line bg-deep px-3.5 py-2.5 text-ink focus:border-brand focus:outline-none"
        {...rest}
      />
    </label>
  );
}
