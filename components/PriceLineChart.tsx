"use client";

type Point = { created_at: string; price: number };

function toNumber(x: unknown) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export function PriceLineChart({ points }: { points: Point[] }) {
  const w = 720;
  const h = 220;
  const pad = 16;

  const data = points
    .map((p) => ({ t: new Date(p.created_at).getTime(), v: toNumber(p.price) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))
    .sort((a, b) => a.t - b.t);

  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Not enough history yet. We’ll start charting after the next check.
      </div>
    );
  }

  const minV = Math.min(...data.map((d) => d.v));
  const maxV = Math.max(...data.map((d) => d.v));
  const minT = Math.min(...data.map((d) => d.t));
  const maxT = Math.max(...data.map((d) => d.t));

  const rangeV = Math.max(0.00001, maxV - minV);
  const rangeT = Math.max(1, maxT - minT);

  const x = (t: number) => pad + ((t - minT) / rangeT) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - minV) / rangeV) * (h - pad * 2);

  const d = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.t).toFixed(2)} ${y(p.v).toFixed(2)}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-sm font-semibold text-slate-800">Price trend</div>
        <div className="text-xs text-slate-500">
          Min {minV.toFixed(2)} • Max {maxV.toFixed(2)}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[220px] w-full"
        role="img"
        aria-label="Price history line chart"
      >
        <defs>
          <linearGradient id="pwLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="#2563eb" strokeWidth="3" />
        <path d={`${d} L ${x(maxT).toFixed(2)} ${(h - pad).toFixed(2)} L ${x(minT).toFixed(2)} ${(h - pad).toFixed(2)} Z`} fill="url(#pwLine)" />
      </svg>
      <div className="mt-2 text-xs text-slate-500">
        Updated daily by Vercel Cron.
      </div>
    </div>
  );
}

