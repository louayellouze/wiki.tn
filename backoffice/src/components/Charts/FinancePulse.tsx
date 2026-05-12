"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  className?: string;
  value?: number;
  label?: string;
}

export const FinancePulse = ({ className, value = 0, label = "RECOVERY" }: Props) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: '70%',
          background: 'transparent',
        },
        track: {
          background: 'rgba(255, 255, 255, 0.05)',
          strokeWidth: '100%',
          margin: 0,
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '12px',
            fontWeight: 700,
            color: '#64748B',
            offsetY: 20
          },
          value: {
            offsetY: -15,
            fontSize: '32px',
            fontWeight: 900,
            color: '#fff',
            formatter: (val) => `${val}%`
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        gradientToColors: ['#3b82f6'],
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: [label],
  };

  return (
    <div className={`glass-premium rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h3 className="font-bold text-white tracking-wider uppercase text-sm">Finance Pulse</h3>
      </div>
      
      <div className="relative flex justify-center py-4">
        <Chart
          options={chartOptions}
          series={[value]}
          type="radialBar"
          height={240}
        />
      </div>

      <div className="space-y-4 mt-2">
        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs font-medium text-gray-400 uppercase">Dossiers Payés</span>
            <span className="text-sm font-bold text-white">{value}%</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs font-medium text-gray-400 uppercase">Encaissement Réel</span>
            <span className="text-sm font-bold text-emerald-400">0M <span className="text-[10px] opacity-60">DT</span></span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 px-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Flux Trésorerie Positif</span>
      </div>
    </div>
  );
};
