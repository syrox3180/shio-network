import { createOrder } from "@/app/actions";
import type { Feature, Package } from "@/lib/data";

function Value({ raw }: { raw: string | undefined }) {
  if (!raw || raw === "false") {
    return <span className="text-muted/50">—</span>;
  }
  if (raw === "true") {
    return (
      <span className="inline-flex" title="var">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-label="Var" role="img">
          <circle cx="10" cy="10" r="9" fill="none" stroke="var(--color-ok)" strokeWidth="1.5" />
          <path d="M6 10.2l2.6 2.6L14 7.4" fill="none" stroke="var(--color-ok)" strokeWidth="1.8" />
        </svg>
      </span>
    );
  }
  return <span>{raw}</span>;
}

export function PackagesTable({
  packages,
  features,
  signedIn,
}: {
  packages: Package[];
  features: Feature[];
  signedIn: boolean;
}) {
  return (
    <div className="overflow-x-auto border border-line bg-deep">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr>
            <th className="w-[30%] border-b border-line px-5 py-6 align-bottom text-sm font-medium text-muted">
              Özellik
            </th>
            {packages.map((pkg) => (
              <th
                key={pkg.slug}
                className={`border-b border-line px-5 py-6 align-bottom ${
                  pkg.popular ? "bg-surface" : ""
                }`}
              >
                {pkg.popular && (
                  <span className="mb-2 inline-block bg-brand px-2.5 py-1 text-xs font-bold text-deep">
                    En popüler
                  </span>
                )}
                <p className="font-display text-2xl font-extrabold tracking-tight">
                  {pkg.name}
                </p>
                {pkg.blurb && (
                  <p className="mt-1 text-sm font-normal leading-snug text-muted">
                    {pkg.blurb}
                  </p>
                )}
                <p className="mt-3 font-display text-3xl font-black text-brand">
                  {pkg.price}
                  <span className="ml-0.5 text-lg text-muted">₺</span>
                </p>

                <form action={createOrder} className="mt-4">
                  <input type="hidden" name="slug" value={pkg.slug} />
                  <button
                    type="submit"
                    className={`w-full px-4 py-2.5 font-display text-sm font-bold ${
                      pkg.popular
                        ? "bg-brand text-deep"
                        : "border border-line text-ink hover:border-brand"
                    }`}
                  >
                    {signedIn ? "Satın al" : "Giriş yap ve al"}
                  </button>
                </form>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {features.map((f) => (
            <tr key={f.label} className="border-b border-line/60 last:border-0">
              <th scope="row" className="px-5 py-4 text-left font-medium text-muted">
                {f.label}
              </th>
              {packages.map((pkg) => (
                <td
                  key={pkg.slug}
                  className={`px-5 py-4 ${pkg.popular ? "bg-surface/60" : ""}`}
                >
                  <Value raw={f.values?.[pkg.slug]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
