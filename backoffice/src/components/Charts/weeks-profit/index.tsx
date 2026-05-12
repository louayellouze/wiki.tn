import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getWeeksProfitData } from "@/services/charts.services";
import { WeeksProfitChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function WeeksProfit({ className, timeFrame }: PropsType) {
  const data = await getWeeksProfitData(timeFrame);

  return (
    <div
      className={cn(
        "glass-premium rounded-2xl p-7.5 shadow-card-2 glow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-body-2xlg font-bold text-white uppercase tracking-wider">
            Profit Hebdomadaire
          </h2>
          <span className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-glow text-blue-400"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Calculé en temps réel</span>
          </span>
        </div>

        <PeriodPicker
          items={["cette semaine", "la semaine dernière"]}
          defaultValue={timeFrame || "cette semaine"}
          sectionKey="weeks_profit"
        />
      </div>

      <WeeksProfitChart data={data} />
    </div>
  );
}
