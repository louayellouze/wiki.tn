import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate?: number;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

const COLOR_MAP: Record<string, {
  icon: string;
  glow: string;
  badge: string;
  border: string;
}> = {
  green:  { icon: 'text-primary bg-primary/10 border-primary/20',   glow: 'hover:shadow-primary/20',  badge: 'bg-primary/10 text-primary border-primary/20',   border: 'group-hover:border-primary/30' },
  orange: { icon: 'text-orange-400 bg-orange-400/10 border-orange-400/20', glow: 'hover:shadow-orange-400/20', badge: 'bg-orange-400/10 text-orange-400 border-orange-400/20', border: 'group-hover:border-orange-400/30' },
  blue:   { icon: 'text-blue-400 bg-blue-400/10 border-blue-400/20',   glow: 'hover:shadow-blue-400/20',   badge: 'bg-blue-400/10 text-blue-400 border-blue-400/20',   border: 'group-hover:border-blue-400/30' },
  indigo: { icon: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', glow: 'hover:shadow-indigo-400/20', badge: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20', border: 'group-hover:border-indigo-400/30' },
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const growthRate = data.growthRate ?? 0;
  const isDecreasing = growthRate < 0;

  const colorKey =
    label.includes("Profit") || label.includes("Paiements") ? "green" :
    label.includes("Réparations") ? "orange" :
    label.includes("Products") ? "blue" : "indigo";

  const theme = COLOR_MAP[colorKey];

  return (
    <div className={cn(
      "group relative glass-premium rounded-2xl p-6 transition-all duration-500",
      "hover:-translate-y-1 hover:shadow-2xl",
      theme.glow,
      "border border-white/[0.06]",
      theme.border,
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
          theme.icon,
        )}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Growth badge */}
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border",
          isDecreasing
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        )}>
          {isDecreasing
            ? <ArrowDownIcon aria-hidden className="h-3 w-3" />
            : <ArrowUpIcon   aria-hidden className="h-3 w-3" />}
          {Math.abs(growthRate)}%
        </div>
      </div>

      {/* Value */}
      <dl>
        <dt className="metric-value mb-1.5">
          {data.value}
        </dt>
        <dd className="section-header">{label}</dd>
      </dl>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-6 right-6 h-px transition-all duration-500 opacity-0 group-hover:opacity-100",
        colorKey === 'green'  ? "bg-gradient-to-r from-transparent via-primary to-transparent" :
        colorKey === 'orange' ? "bg-gradient-to-r from-transparent via-orange-400 to-transparent" :
        colorKey === 'blue'   ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent" :
                                "bg-gradient-to-r from-transparent via-indigo-400 to-transparent",
      )} />
    </div>
  );
}
