import Link from "next/link";
import { site } from "@/lib/site";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid-bg flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-black tracking-tight">
          {site.name}
        </Link>
        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 leading-relaxed text-muted">{description}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-sm text-muted">{footer}</div>
      </div>
    </main>
  );
}

export function Field({
  label,
  hint,
  ...rest
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <input
        {...rest}
        className="w-full border border-line bg-deep px-3.5 py-2.5 text-ink focus:border-brand focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-muted/80">{hint}</span>}
    </label>
  );
}
