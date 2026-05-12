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

export function OverviewCard({ label, data, Icon }: PropsType) {
  const growthRate = data.growthRate ?? 0;
  const isDecreasing = growthRate < 0;

  return (
    <div className="group glass-premium rounded-2xl p-6 shadow-card-2 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-1 glow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-all group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        <Icon className="h-6 w-6" />
      </div>

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt className={cn(
            "text-3xl font-black tracking-tight transition-all duration-500",
            label.includes("Profit") ? "text-neon-cyan" :
              label.includes("Réparations") ? "text-neon-red" : "text-white"
          )}>
            {data.value}
          </dt>

          <dd className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</dd>
        </dl>

        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
            isDecreasing
              ? "bg-red-500/10 text-red-500 border border-red-500/20"
              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
          )}
        >
          {isDecreasing ? (
            <ArrowDownIcon aria-hidden className="h-3 w-3" />
          ) : (
            <ArrowUpIcon aria-hidden className="h-3 w-3" />
          )}
          {Math.abs(growthRate)}%
        </div>
      </div>
    </div>
  );
}
