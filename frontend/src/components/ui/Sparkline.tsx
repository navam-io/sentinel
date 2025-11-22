import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export interface SparklineProps {
  data: number[];
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  height?: number;
}

/**
 * Sparkline Component
 *
 * Miniature line chart for quick insights (spec-03.md)
 * - Simplified chart without axes or labels
 * - Color-coded by trend (success/danger/neutral)
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  trend = 'neutral',
  className = '',
  height = 40,
}) => {
  const chartData = data.map((value, index) => ({ index, value }));

  const trendColors = {
    up: '#4ADE80',     // sentinel-success
    down: '#F87171',   // sentinel-danger
    neutral: '#6EE3F6', // sentinel-primary
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={trendColors[trend]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
