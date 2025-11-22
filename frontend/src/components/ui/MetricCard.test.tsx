import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricCard } from './MetricCard';
import { Clock } from 'lucide-react';

describe('MetricCard', () => {
  it('renders metric label and value', () => {
    render(<MetricCard label="Latency" value="150ms" />);

    expect(screen.getByText('Latency')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<MetricCard label="Tokens" value={1234} />);

    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders delta with positive change', () => {
    render(
      <MetricCard
        label="Cost"
        value="$0.50"
        delta={{ value: 10.5, isPositive: true }}
      />
    );

    expect(screen.getByText('+10.5%')).toBeInTheDocument();
    expect(screen.getByText('+10.5%')).toHaveClass('text-sentinel-success');
  });

  it('renders delta with negative change', () => {
    render(
      <MetricCard
        label="Latency"
        value="100ms"
        delta={{ value: -5.2, isPositive: false }}
      />
    );

    expect(screen.getByText('-5.2%')).toBeInTheDocument();
    expect(screen.getByText('-5.2%')).toHaveClass('text-sentinel-danger');
  });

  it('renders delta with zero change', () => {
    render(
      <MetricCard
        label="Tokens"
        value="1000"
        delta={{ value: 0, isPositive: false }}
      />
    );

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toHaveClass('text-sentinel-text-dim');
  });

  it('renders without delta', () => {
    render(<MetricCard label="Test" value="123" />);

    // No delta text should be present
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const { container } = render(
      <MetricCard label="Time" value="10s" icon={Clock} />
    );

    // Icon should be rendered (lucide-react icons have a specific class)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricCard label="Test" value="123" className="custom-class" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});
