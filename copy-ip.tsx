"use client";

import { useState } from "react";

export function CopyIp({ ip }: { ip: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(ip);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="w-full max-w-xl">
      <button
        type="button"
        onClick={copy}
        className="group relative flex w-full items-center justify-between gap-4 border-2 border-line bg-deep px-5 py-5 text-left transition-colors hover:border-brand sm:px-7 sm:py-6"
      >
        <span>
          <span className="block text-xs font-medium tracking-wide text-muted">
            Sunucu adresi
          </span>
          <span className="block font-display text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {ip}
          </span>
        </span>
        <span
          className="shrink-0 bg-brand px-4 py-2.5 font-display text-sm font-bold text-deep sm:px-6 sm:text-base"
          aria-hidden="true"
        >
          {state === "copied" ? "Kopyalandı" : "Kopyala"}
        </span>
      </button>

      <p aria-live="polite" className="mt-3 h-5 text-sm text-muted">
        {state === "copied" && "Adres panoya kopyalandı. Minecraft'ta Multiplayer > Add Server."}
        {state === "failed" && "Tarayıcı kopyalamaya izin vermedi. Adresi elle yazman gerekiyor."}
      </p>
    </div>
  );
}
