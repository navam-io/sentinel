import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { TokenMeter } from '../icons';

export interface RunCardProps {
  testName: string;
  status: 'success' | 'failed' | 'regression';
  latency: number; // ms
  tokens: number;
  cost: number; // USD
  timestamp: Date;
  onClick?: () => void;
  className?: string;
}

/**
 * RunCard Component
 *
 * Card displaying test run information (spec-03.md)
 * - Shows status, metrics, timestamp
 * - Color-coded based on pass/fail/regression
 */
export const RunCard: React.FC<RunCardProps> = ({
  testName,
  status,
  latency,
  tokens,
  cost,
  timestamp,
  onClick,
  className = '',
}) => {
  const statusColors = {
    success: 'border-sentinel-success text-sentinel-success',
    failed: 'border-sentinel-danger text-sentinel-danger',
    regression: 'border-sentinel-warning text-sentinel-warning',
  };

  return (
    <div
      onClick={onClick}
      className={`
        sentinel-card
        ${onClick ? 'cursor-pointer hover:shadow-sentinel-glow' : ''}
        border-l-4 ${statusColors[status]}
        transition-all duration-160
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-sentinel-text">
          {testName}
        </h3>
        <span
          className={`
            px-2 py-0.5 rounded text-xs font-medium
            ${status === 'success' ? 'bg-sentinel-success bg-opacity-20' : ''}
            ${status === 'failed' ? 'bg-sentinel-danger bg-opacity-20' : ''}
            ${status === 'regression' ? 'bg-sentinel-warning bg-opacity-20' : ''}
            ${statusColors[status]}
          `}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {/* Latency */}
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-sentinel-text-dim" />
          <div>
            <div className="text-xs text-sentinel-text-dim">Latency</div>
            <div className="text-sm font-medium text-sentinel-text">
              {latency}ms
            </div>
          </div>
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-2">
          <TokenMeter size={14} className="text-sentinel-text-dim" />
          <div>
            <div className="text-xs text-sentinel-text-dim">Tokens</div>
            <div className="text-sm font-medium text-sentinel-text">
              {tokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-sentinel-text-dim" />
          <div>
            <div className="text-xs text-sentinel-text-dim">Cost</div>
            <div className="text-sm font-medium text-sentinel-text">
              ${cost.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-sentinel-border">
        <span className="text-xs text-sentinel-text-dim">
          {timestamp.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default RunCard;
