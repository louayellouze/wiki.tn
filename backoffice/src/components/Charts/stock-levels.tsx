"use client";

import React, { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getProducts } from "@/services/product.service";
import { Product } from "@/dtos/product.dto";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function StockLevels({ className }: { className?: string }) {
    const [data, setData] = useState<{ x: string; y: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const products = await getProducts();
                const sorted = products
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 10)
                    .map((p) => ({
                        x: p.title.length > 20 ? p.title.substring(0, 20) + "..." : p.title,
                        y: p.quantity,
                    }));
                setData(sorted);
            } catch (error) {
                console.error("Error fetching stock levels:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const options: ApexOptions = {
        colors: ["#22AD5C"],
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: "60%",
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toString(),
            offsetX: -6,
            style: {
                fontSize: "12px",
                colors: ["#fff"],
            },
        },
        xaxis: {
            categories: data.map((d) => d.x),
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        grid: {
            borderColor: "#E6EBF1",
            strokeDashArray: 5,
        },
        tooltip: {
            theme: "dark",
        },
    };

    return (
        <div
            className={cn(
                "rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <div className="mb-4">
                <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                    Produits les plus en Stock
                </h2>
            </div>

            <div className="min-h-[350px]">
                {!loading && data.length > 0 ? (
                    <Chart
                        options={options}
                        series={[{ name: "Quantité", data: data.map((d) => d.y) }]}
                        type="bar"
                        height={350}
                    />
                ) : loading ? (
                    <div className="flex h-[350px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="flex h-[350px] items-center justify-center text-gray-500">
                        Aucune donnée disponible
                    </div>
                )}
            </div>
        </div>
    );
}
