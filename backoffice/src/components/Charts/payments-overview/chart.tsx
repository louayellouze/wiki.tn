"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: {
    received: { x: unknown; y: number }[];
    due: { x: unknown; y: number }[];
  };
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function PaymentsOverviewChart({ data }: PropsType) {
  const isMobile = useIsMobile();

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#ff3d3d", "#00f2ff"],
    chart: {
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      fontFamily: "Satoshi, sans-serif",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 10,
        left: 0,
        blur: 10,
        opacity: 0.2,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 6,
      colors: ["#ff3d3d", "#00f2ff"],
      strokeColors: ["#fff", "#fff"],
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    stroke: {
      curve: "smooth",
      width: [4, 4],
      lineCap: "round"
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.05)",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      type: "category",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
    },
  };

  return (
    <div className="-ml-4 -mr-5 h-[310px]">
      <Chart
        options={options}
        series={[
          {
            name: "Reçu",
            data: data.received,
          },
          {
            name: "En Attente",
            data: data.due,
          },
        ]}
        type="area"
        height={310}
      />
    </div>
  );
}
