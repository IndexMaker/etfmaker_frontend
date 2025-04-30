// components/PerformanceChart.tsx
'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ChartDataPoint {
  name: string;
  date: string;
  value: number;
  price?: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  indexId: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, indexId }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-primary rounded-lg">
        <p className="text-secondary">No historical data available for this index</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        label: `Index Value (ID: ${data[0].name})`,
        data: data.map(item => ({
          x: new Date(item.date),
          y: item.price,
        })),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          tooltipFormat: 'dd MMM yyyy',
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: number | string) => {
            if (typeof value === 'number') {
              return '$' + value.toLocaleString();
            }
            return '$' + value;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};