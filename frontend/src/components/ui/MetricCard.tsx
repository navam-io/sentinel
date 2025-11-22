import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
}

/**
 * MetricCard Component
 *
 * Card for displaying metrics with delta indicators (spec-03.md)
 * - Shows metric value with optional delta
 * - Color-coded + / − % regression colors
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`sentinel-card ${className}`}>
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-sentinel-text-dim">{label}</span>
        {Icon && <Icon size={16} className="text-sentinel-text-dim" />}
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-sentinel-text mb-1">
        {value}
      </div>

      {/* Delta */}
      {delta && (
        <div className="flex items-center gap-1">
          {delta.value === 0 ? (
            <Minus size={14} className="text-sentinel-text-dim" />
          ) : delta.isPositive ? (
            <TrendingUp size={14} className="text-sentinel-success" />
          ) : (
            <TrendingDown size={14} className="text-sentinel-danger" />
          )}
          <span
            className={`
              text-xs font-medium
              ${delta.value === 0 ? 'text-sentinel-text-dim' : ''}
              ${delta.isPositive && delta.value !== 0 ? 'text-sentinel-success' : ''}
              ${!delta.isPositive && delta.value !== 0 ? 'text-sentinel-danger' : ''}
            `}
          >
            {delta.value > 0 ? '+' : ''}
            {delta.value.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
