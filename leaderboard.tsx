import type { Player } from "@/lib/data";

const tr = new Intl.NumberFormat("tr-TR");

export function Leaderboard({ players }: { players: Player[] }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface text-sm text-muted">
            <th className="px-4 py-3 font-medium">Sıra</th>
            <th className="px-4 py-3 font-medium">Oyuncu</th>
            <th className="px-4 py-3 text-right font-medium">Bakiye</th>
            <th className="px-4 py-3 text-right font-medium">Kazılan blok</th>
            <th className="px-4 py-3 text-right font-medium">Kill</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.username} className="border-b border-line/60 last:border-0">
              <td className={`px-4 py-3 font-display text-lg ${i === 0 ? "text-brand" : "text-muted"}`}>
                {i + 1}
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/28`}
                    alt=""
                    width={28}
                    height={28}
                    className="shrink-0"
                  />
                  <span className="font-medium">{p.username}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{tr.format(p.balance)} ₺</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted">{tr.format(p.blocks)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted">{tr.format(p.kills)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
