import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface PieDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface PieDonutProps {
  data: PieDataPoint[];
  title?: string;
  donut?: boolean;
  className?: string;
  height?: number;
}

/**
 * PieDonut Component
 *
 * Pie or donut chart for distributions (spec-03.md)
 * - Uses semantic colors for different categories
 * - Clean, research-grade visualization
 */
export const PieDonut: React.FC<PieDonutProps> = ({
  data,
  title,
  donut = true,
  className = '',
  height = 300,
}) => {
  const COLORS = [
    '#6EE3F6', // sentinel-primary
    '#9B8CFF', // sentinel-secondary
    '#4ADE80', // sentinel-success
    '#F87171', // sentinel-danger
    '#FBBF24', // sentinel-warning
    '#38BDF8', // sentinel-info
  ];

  return (
    <div className={`sentinel-card ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-sentinel-text mb-4">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 60 : 0}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1C2026',
              border: '1px solid #2C323A',
              borderRadius: '0.375rem',
              color: '#E2E5E9',
            }}
          />
          <Legend
            wrapperStyle={{
              color: '#E2E5E9',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieDonut;
