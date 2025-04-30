// components/TimePeriodSelector.tsx
'use client';

import React from 'react';

const periods = [
  { label: 'YTD', value: 'ytd' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: '3Y', value: '3y' },
  { label: '5Y', value: '5y' },
  { label: '10Y', value: '10y' },
  { label: 'All', value: 'all' },
];

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <div className="flex space-x-2 mb-4">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-3 py-1 rounded-md text-sm ${
            selectedPeriod === period.value
              ? 'bg-blue-500 text-primary'
              : 'bg-foreground text-secondary hover:text-secondary'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};