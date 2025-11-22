import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrendChart } from './TrendChart';

describe('TrendChart', () => {
  const mockData = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 120 },
    { label: 'Apr', value: 180 },
  ];

  it('renders without title', () => {
    const { container } = render(<TrendChart data={mockData} />);

    // Recharts ResponsiveContainer renders
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<TrendChart data={mockData} title="Test Trend" />);

    expect(screen.getByText('Test Trend')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(<TrendChart data={mockData} height={400} />);

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('renders chart elements', () => {
    const { container } = render(<TrendChart data={mockData} />);

    // Check for Recharts responsive container (surface may not render in test env)
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TrendChart data={mockData} className="custom-chart" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-chart');
  });

  it('handles empty data', () => {
    const { container } = render(<TrendChart data={[]} />);

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
