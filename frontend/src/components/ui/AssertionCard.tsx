import { CheckCircle2, XCircle, Clock, FileText, Settings, Zap } from 'lucide-react';

export interface AssertionCardProps {
  type:
    | 'must_contain'
    | 'must_not_contain'
    | 'regex_match'
    | 'must_call_tool'
    | 'output_type'
    | 'max_latency_ms'
    | 'min_tokens'
    | 'max_tokens';
  status: 'passed' | 'failed' | 'pending';
  value: string | number;
  actualValue?: string | number;
  message?: string;
  description?: string;
}

const assertionTypeConfig: Record<
  AssertionCardProps['type'],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  must_contain: { label: 'Must Contain', icon: CheckCircle2 },
  must_not_contain: { label: 'Must Not Contain', icon: XCircle },
  regex_match: { label: 'Regex Match', icon: FileText },
  must_call_tool: { label: 'Must Call Tool', icon: Settings },
  output_type: { label: 'Output Type', icon: FileText },
  max_latency_ms: { label: 'Max Latency', icon: Clock },
  min_tokens: { label: 'Min Tokens', icon: Zap },
  max_tokens: { label: 'Max Tokens', icon: Zap },
};

const statusConfig: Record<
  AssertionCardProps['status'],
  { color: string; bgColor: string; borderColor: string }
> = {
  passed: {
    color: 'text-sentinel-success',
    bgColor: 'bg-sentinel-success/10',
    borderColor: 'border-sentinel-success/30',
  },
  failed: {
    color: 'text-sentinel-danger',
    bgColor: 'bg-sentinel-danger/10',
    borderColor: 'border-sentinel-danger/30',
  },
  pending: {
    color: 'text-sentinel-warning',
    bgColor: 'bg-sentinel-warning/10',
    borderColor: 'border-sentinel-warning/30',
  },
};

export function AssertionCard({
  type,
  status,
  value,
  actualValue,
  message,
  description,
}: AssertionCardProps) {
  const typeConfig = assertionTypeConfig[type];
  const statusStyle = statusConfig[status];
  const Icon = typeConfig.icon;

  return (
    <div
      className={`bg-sentinel-surface border ${statusStyle.borderColor} rounded-lg p-4 transition-colors duration-160`}
      data-testid="assertion-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded ${statusStyle.bgColor} ${statusStyle.color}`}
            data-testid="assertion-icon"
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-sentinel-text">{typeConfig.label}</div>
            {description && (
              <div className="text-sm text-sentinel-text-muted mt-0.5">{description}</div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bgColor} ${statusStyle.color} uppercase tracking-wide`}
          data-testid="assertion-status"
        >
          {status}
        </div>
      </div>

      {/* Expected Value */}
      <div className="mb-2">
        <div className="text-xs text-sentinel-text-muted mb-1">Expected</div>
        <div
          className="bg-sentinel-bg-elevated border border-sentinel-border rounded px-3 py-2 text-sm font-mono text-sentinel-text"
          data-testid="assertion-expected"
        >
          {formatValue(type, value)}
        </div>
      </div>

      {/* Actual Value (only show if failed) */}
      {status === 'failed' && actualValue !== undefined && (
        <div className="mb-2">
          <div className="text-xs text-sentinel-text-muted mb-1">Actual</div>
          <div
            className={`bg-sentinel-bg-elevated border ${statusStyle.borderColor} rounded px-3 py-2 text-sm font-mono ${statusStyle.color}`}
            data-testid="assertion-actual"
          >
            {formatValue(type, actualValue)}
          </div>
        </div>
      )}

      {/* Failure Message */}
      {message && status === 'failed' && (
        <div
          className={`mt-3 p-3 rounded ${statusStyle.bgColor} border ${statusStyle.borderColor}`}
          data-testid="assertion-message"
        >
          <div className="flex items-start gap-2">
            <XCircle className={`w-4 h-4 mt-0.5 ${statusStyle.color} flex-shrink-0`} />
            <p className={`text-sm ${statusStyle.color}`}>{message}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'passed' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-sentinel-success">
          <CheckCircle2 className="w-4 h-4" />
          <span>Assertion passed</span>
        </div>
      )}
    </div>
  );
}

// Helper function to format values based on assertion type
function formatValue(type: AssertionCardProps['type'], value: string | number): string {
  if (type === 'max_latency_ms') {
    return `${value}ms`;
  }
  if (type === 'min_tokens' || type === 'max_tokens') {
    return `${value} tokens`;
  }
  return String(value);
}
