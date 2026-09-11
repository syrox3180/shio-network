import { orderStatus, type OrderStatus } from "@/lib/site";

const tone: Record<string, string> = {
  wait: "border-muted/50 text-muted",
  ok: "border-brand text-brand",
  done: "border-ok text-ok",
  off: "border-line text-muted/70 line-through",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const s = orderStatus[status] ?? orderStatus.pending;
  return (
    <span className={`inline-block border px-2.5 py-1 text-xs font-medium ${tone[s.tone]}`}>
      {s.label}
    </span>
  );
}
