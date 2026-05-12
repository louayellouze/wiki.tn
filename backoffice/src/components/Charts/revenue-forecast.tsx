"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const RevenueForecast: React.FC = () => {
    const options: ApexOptions = {
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            labels: { colors: "#9ca3af" },
        },
        colors: ["#3c50e0", "#80caee"],
        chart: {
            fontFamily: "Satoshi, sans-serif",
            height: 335,
            type: "area",
            dropShadow: {
                enabled: true,
                color: "#62321b",
                top: 10,
                left: 0,
                blur: 4,
                opacity: 0.1,
            },
            toolbar: { show: false },
        },
        stroke: {
            width: [3, 3],
            curve: "smooth",
            dashArray: [0, 8],
        },
        grid: {
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } },
            borderColor: "rgba(255, 255, 255, 0.05)",
        },
        dataLabels: { enabled: false },
        markers: {
            size: 4,
            colors: "#fff",
            strokeColors: ["#3056d3", "#80caee"],
            strokeWidth: 3,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 1,
            hover: { size: 6 },
        },
        xaxis: {
            type: "category",
            categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim", "Lun+1", "Mar+1", "Mer+1"],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#9ca3af" } },
        },
        yaxis: {
            title: { style: { fontSize: "0px" } },
            labels: { style: { colors: "#9ca3af" } },
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100],
            },
        },
        tooltip: {
            theme: "dark",
        }
    };

    const series = [
        {
            name: "Revenu Réel",
            data: [23, 11, 22, 27, 13, 22, 37, null, null, null],
        },
        {
            name: "Prévision IA",
            data: [20, 15, 25, 25, 18, 25, 35, 42, 38, 45],
        },
    ];

    return (
        <div className="glass-premium rounded-3xl p-6 col-span-12 xl:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-primary">Revenu Réel</p>
                            <p className="text-sm font-medium text-gray-400">01 Jan, 2026 - 07 Jan, 2026</p>
                        </div>
                    </div>
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-secondary">Prévision IA</p>
                            <p className="text-sm font-medium text-gray-400">01 Jan, 2026 - 10 Jan, 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div id="revenueForecast" className="-ml-5">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="area"
                        height={350}
                        width={"100%"}
                    />
                </div>
            </div>
        </div>
    );
};
