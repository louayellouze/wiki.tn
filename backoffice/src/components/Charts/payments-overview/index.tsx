import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getPaymentsOverviewData } from "@/services/charts.services";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function PaymentsOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = await getPaymentsOverviewData(timeFrame);

  return (
    <div
      className={cn(
        "glass-premium rounded-2xl p-7.5 shadow-card-2",
        className,
      )}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-body-2xlg font-bold text-white uppercase tracking-wider">
              Analyse des Ventes
            </h2>
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-widest">
              Temps Réel
            </span>
          </div>
          <p className="text-body-sm font-medium text-gray-500 mt-1">
            Flux comparatif : Ventes réalisées & Prévisions
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">VENTES (DT)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">COMMANDES</span>
          </div>
          <PeriodPicker defaultValue={timeFrame} sectionKey="payments_overview" />
        </div>
      </div>

      <PaymentsOverviewChart data={data} />
    </div>
  );
}
