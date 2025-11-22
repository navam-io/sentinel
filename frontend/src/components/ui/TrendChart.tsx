import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface TrendDataPoint {
  label: string;
  value: number;
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  valueLabel?: string;
  className?: string;
  height?: number;
}

/**
 * TrendChart Component
 *
 * Line chart for displaying trends over time (spec-03.md)
 * - Uses Recharts library
 * - Monochrome + accent colors (research-grade clarity)
 */
export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  className = '',
  height = 300,
}) => {
  return (
    <div className={`sentinel-card ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-sentinel-text mb-4">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis
            dataKey="label"
            stroke="#A0A4A9"
            tick={{ fill: '#A0A4A9', fontSize: 12 }}
          />
          <YAxis
            stroke="#A0A4A9"
            tick={{ fill: '#A0A4A9', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1C2026',
              border: '1px solid #2C323A',
              borderRadius: '0.375rem',
              color: '#E2E5E9',
            }}
            labelStyle={{ color: '#A0A4A9' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6EE3F6"
            strokeWidth={2}
            dot={{ fill: '#6EE3F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
