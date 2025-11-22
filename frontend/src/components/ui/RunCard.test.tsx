import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RunCard } from './RunCard';

describe('RunCard', () => {
  const mockProps = {
    testName: 'Test Run 1',
    status: 'success' as const,
    latency: 150,
    tokens: 1234,
    cost: 0.0045,
    timestamp: new Date('2025-01-01T12:00:00Z'),
  };

  it('renders test run information', () => {
    render(<RunCard {...mockProps} />);

    expect(screen.getByText('Test Run 1')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('$0.0045')).toBeInTheDocument();
  });

  it('displays success status with correct styling', () => {
    render(<RunCard {...mockProps} status="success" />);

    const statusBadge = screen.getByText('Success');
    expect(statusBadge).toHaveClass('text-sentinel-success');
  });

  it('displays failed status with correct styling', () => {
    render(<RunCard {...mockProps} status="failed" />);

    const statusBadge = screen.getByText('Failed');
    expect(statusBadge).toHaveClass('text-sentinel-danger');
  });

  it('displays regression status with correct styling', () => {
    render(<RunCard {...mockProps} status="regression" />);

    const statusBadge = screen.getByText('Regression');
    expect(statusBadge).toHaveClass('text-sentinel-warning');
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<RunCard {...mockProps} onClick={onClick} />);

    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not apply cursor-pointer class when onClick is not provided', () => {
    const { container } = render(<RunCard {...mockProps} />);

    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('applies cursor-pointer class when onClick is provided', () => {
    const onClick = vi.fn();
    const { container } = render(<RunCard {...mockProps} onClick={onClick} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('formats timestamp correctly', () => {
    render(<RunCard {...mockProps} />);

    // Timestamp should be rendered (exact format depends on locale)
    expect(screen.getByText(/2025|2024/)).toBeInTheDocument();
  });
});
