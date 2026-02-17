"use client";

import React, { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getOrders } from "@/services/order.service";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function TopOrderedProducts({ className }: { className?: string }) {
    const [data, setData] = useState<{ x: string; y: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orders = await getOrders();
                const productStats: Record<string, number> = {};

                orders.forEach((order) => {
                    order.items.forEach((item) => {
                        productStats[item.productTitle] = (productStats[item.productTitle] || 0) + item.quantity;
                    });
                });

                const sorted = Object.entries(productStats)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([name, count]) => ({
                        x: name.length > 20 ? name.substring(0, 20) + "..." : name,
                        y: count,
                    }));

                setData(sorted);
            } catch (error) {
                console.error("Error fetching top products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const options: ApexOptions = {
        colors: ["#5750F1"],
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "40%",
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: data.map((d) => d.x),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                rotate: -45,
                style: { fontSize: "10px" }
            }
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
                    Les plus Produits Commandés
                </h2>
            </div>

            <div className="min-h-[350px]">
                {!loading && data.length > 0 ? (
                    <Chart
                        options={options}
                        series={[{ name: "Commandés", data: data.map((d) => d.y) }]}
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
