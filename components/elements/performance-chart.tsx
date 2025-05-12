"use client";

import React, { useEffect, useRef } from "react";
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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface ChartDataPoint {
  name: string;
  date: string;
  value: number;
  price?: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[] | null;
  indexId: number;
  btcData: ChartDataPoint[];
  showComparison?: boolean;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  indexId,
  btcData,
  showComparison = false,
}) => {
  const chartRef = useRef<any>(null);
  useEffect(() => {
    return () => {
      // Cleanup chart instance when component unmounts
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-accent rounded-lg">
        <p className="text-secondary">
          No historical data available for this index
        </p>
      </div>
    );
  }

  // Normalize data to price or percentage based on showComparison
  const normalizeData = (dataset: ChartDataPoint[], usePercentage: boolean) => {
    if (dataset.length === 0) return [];
    
    if (usePercentage) {
      const firstValue = dataset[0].price || dataset[0].value;
      return dataset.map((item) => ({
        x: new Date(item.date),
        y: ((item.price || item.value) / firstValue - 1) * 100,
      }));
    } else {
      return dataset.map((item) => ({
        x: new Date(item.date),
        y: item.price || item.value,
      }));
    }
  };

  const normalizedIndexData = normalizeData(data, showComparison);
  const normalizedBtcData = showComparison ? normalizeData(btcData, true) : [];

  // Create gradient for area chart
  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
    if (!chartArea) return null;

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );
    gradient.addColorStop(0, "rgba(255, 0, 0, 0.005)");
    gradient.addColorStop(1, "rgba(255, 0, 0, 0.1)");
    return gradient;
  };

  const chartData: any = {
    datasets: [
      {
        label: `${data[0].name} Index`,
        data: normalizedIndexData,
        borderColor: showComparison ? "#3b82f6" : "#ff3a33",
        backgroundColor: (context: any) => {
          if (showComparison) return "rgba(59, 130, 246, 0.1)";

          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return getGradient(ctx, chartArea);
        },
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: showComparison ? false : "origin",
      },
      ...(showComparison
        ? [
            {
              label: "Bitcoin (BTC)",
              data: normalizedBtcData,
              borderColor: "#f7931a",
              backgroundColor: "rgba(247, 147, 26, 0.1)",
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5,
              borderWidth: 2,
            },
          ]
        : []),
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "month" as const,
          tooltipFormat: "dd MMM yyyy",
          displayFormats: {
            month: "MMM yyyy",
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
            if (typeof value === "number") {
              return showComparison 
                ? `${value.toFixed(2)}%` 
                : `$${value.toLocaleString()}`;
            }
            return showComparison ? `${value}%` : `$${value}`;
          },
        },
        title: {
          display: true,
          text: showComparison ? "Percentage Change" : "Price (USD)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          },
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return showComparison
              ? `${label}: ${value.toFixed(2)}%`
              : `${label}: $${value.toFixed(2)}`;
          },
          footer: (context: any) => {
            if (!showComparison || context.length < 2) return null;

            const indexValue = context[0].parsed.y;
            const btcValue = context[1].parsed.y;
            const difference = (indexValue - btcValue).toFixed(2);
            const relativePerformance = indexValue - btcValue;

            return [
              "Comparison:",
              `vs BTC: ${difference}%`,
              relativePerformance > 0 ? "Outperforming BTC" : "Underperforming BTC",
            ];
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        usePointStyle: true,
        bodyFont: {
          size: 14,
          weight: "bold",
        },
        footerFont: {
          size: 12,
        },
      },
    },
  };

  return (
    <div className="w-full h-96">
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[
          {
            id: "customGradient",
            beforeDraw(chart: any) {
              if (!showComparison) {
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                const gradient = getGradient(ctx, chartArea);
                chart.data.datasets[0].backgroundColor = gradient;
              }
            },
          },
        ]}
      />
    </div>
  );
};