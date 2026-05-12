import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getDevicesUsedData } from "@/services/charts.services";
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function UsedDevices({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = await getDevicesUsedData(timeFrame);

  return (
    <div
      className={cn(
        "glass-premium rounded-2xl p-7.5 shadow-card-2",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-body-2xlg font-bold text-white uppercase tracking-wider">
          Répartition Secteurs
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
      </div>

      <div className="grid place-items-center py-4">
        <DonutChart data={data} />
      </div>
    </div>
  );
}
