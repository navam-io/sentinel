import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssertionCard, type AssertionCardProps } from './AssertionCard';

describe('AssertionCard', () => {
  describe('Rendering', () => {
    it('should render with must_contain type', () => {
      render(
        <AssertionCard
          type="must_contain"
          status="passed"
          value="Hello World"
          description="Check if output contains greeting"
        />
      );

      expect(screen.getByText('Must Contain')).toBeInTheDocument();
      expect(screen.getByText('Check if output contains greeting')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('Hello World');
    });

    it('should render with must_not_contain type', () => {
      render(
        <AssertionCard type="must_not_contain" status="passed" value="error" />
      );

      expect(screen.getByText('Must Not Contain')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('error');
    });

    it('should render with regex_match type', () => {
      render(
        <AssertionCard type="regex_match" status="passed" value="^[A-Z].*" />
      );

      expect(screen.getByText('Regex Match')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('^[A-Z].*');
    });

    it('should render with must_call_tool type', () => {
      render(
        <AssertionCard type="must_call_tool" status="passed" value="search_web" />
      );

      expect(screen.getByText('Must Call Tool')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('search_web');
    });

    it('should render with output_type type', () => {
      render(
        <AssertionCard type="output_type" status="passed" value="json" />
      );

      expect(screen.getByText('Output Type')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('json');
    });

    it('should render with max_latency_ms type and format value', () => {
      render(
        <AssertionCard type="max_latency_ms" status="passed" value={1000} />
      );

      expect(screen.getByText('Max Latency')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('1000ms');
    });

    it('should render with min_tokens type and format value', () => {
      render(
        <AssertionCard type="min_tokens" status="passed" value={50} />
      );

      expect(screen.getByText('Min Tokens')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('50 tokens');
    });

    it('should render with max_tokens type and format value', () => {
      render(
        <AssertionCard type="max_tokens" status="passed" value={500} />
      );

      expect(screen.getByText('Max Tokens')).toBeInTheDocument();
      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('500 tokens');
    });
  });

  describe('Status Display', () => {
    it('should display passed status correctly', () => {
      render(
        <AssertionCard type="must_contain" status="passed" value="test" />
      );

      const statusBadge = screen.getByTestId('assertion-status');
      expect(statusBadge).toHaveTextContent('passed');
      expect(statusBadge).toHaveClass('text-sentinel-success');
      expect(screen.getByText('Assertion passed')).toBeInTheDocument();
    });

    it('should display failed status correctly', () => {
      render(
        <AssertionCard
          type="must_contain"
          status="failed"
          value="expected"
          actualValue="actual"
          message="Output did not contain the expected value"
        />
      );

      const statusBadge = screen.getByTestId('assertion-status');
      expect(statusBadge).toHaveTextContent('failed');
      expect(statusBadge).toHaveClass('text-sentinel-danger');
    });

    it('should display pending status correctly', () => {
      render(
        <AssertionCard type="must_contain" status="pending" value="test" />
      );

      const statusBadge = screen.getByTestId('assertion-status');
      expect(statusBadge).toHaveTextContent('pending');
      expect(statusBadge).toHaveClass('text-sentinel-warning');
    });
  });

  describe('Failure Details', () => {
    it('should show actual value when failed', () => {
      render(
        <AssertionCard
          type="must_contain"
          status="failed"
          value="expected text"
          actualValue="actual text"
        />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('expected text');
      expect(screen.getByTestId('assertion-actual')).toHaveTextContent('actual text');
    });

    it('should show failure message when provided', () => {
      const message = 'The output did not match the expected pattern';
      render(
        <AssertionCard
          type="regex_match"
          status="failed"
          value="^test"
          actualValue="invalid"
          message={message}
        />
      );

      expect(screen.getByTestId('assertion-message')).toHaveTextContent(message);
    });

    it('should not show actual value when status is passed', () => {
      render(
        <AssertionCard
          type="must_contain"
          status="passed"
          value="test"
        />
      );

      expect(screen.queryByTestId('assertion-actual')).not.toBeInTheDocument();
    });

    it('should not show failure message when status is passed', () => {
      render(
        <AssertionCard
          type="must_contain"
          status="passed"
          value="test"
        />
      );

      expect(screen.queryByTestId('assertion-message')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply success styling for passed status', () => {
      render(
        <AssertionCard type="must_contain" status="passed" value="test" />
      );

      const card = screen.getByTestId('assertion-card');
      expect(card).toHaveClass('border-sentinel-success/30');
    });

    it('should apply danger styling for failed status', () => {
      render(
        <AssertionCard
          type="must_contain"
          status="failed"
          value="test"
          actualValue="wrong"
        />
      );

      const card = screen.getByTestId('assertion-card');
      expect(card).toHaveClass('border-sentinel-danger/30');
    });

    it('should apply warning styling for pending status', () => {
      render(
        <AssertionCard type="must_contain" status="pending" value="test" />
      );

      const card = screen.getByTestId('assertion-card');
      expect(card).toHaveClass('border-sentinel-warning/30');
    });
  });

  describe('Icons', () => {
    it('should render appropriate icon for each assertion type', () => {
      const types: AssertionCardProps['type'][] = [
        'must_contain',
        'must_not_contain',
        'regex_match',
        'must_call_tool',
        'output_type',
        'max_latency_ms',
        'min_tokens',
        'max_tokens',
      ];

      types.forEach((type) => {
        const { unmount } = render(
          <AssertionCard type={type} status="passed" value="test" />
        );
        expect(screen.getByTestId('assertion-icon')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Value Formatting', () => {
    it('should format latency values with ms suffix', () => {
      render(
        <AssertionCard type="max_latency_ms" status="passed" value={1500} />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('1500ms');
    });

    it('should format token values with "tokens" suffix', () => {
      render(
        <AssertionCard type="min_tokens" status="passed" value={100} />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('100 tokens');
    });

    it('should format actual values when failed', () => {
      render(
        <AssertionCard
          type="max_latency_ms"
          status="failed"
          value={1000}
          actualValue={1500}
        />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('1000ms');
      expect(screen.getByTestId('assertion-actual')).toHaveTextContent('1500ms');
    });

    it('should handle string values for latency/tokens', () => {
      render(
        <AssertionCard type="max_latency_ms" status="passed" value="1000" />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('1000ms');
    });
  });

  describe('Edge Cases', () => {
    it('should render without description', () => {
      render(
        <AssertionCard type="must_contain" status="passed" value="test" />
      );

      expect(screen.getByText('Must Contain')).toBeInTheDocument();
      expect(screen.queryByText('Check if')).not.toBeInTheDocument();
    });

    it('should render with zero values', () => {
      render(
        <AssertionCard type="max_latency_ms" status="passed" value={0} />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent('0ms');
    });

    it('should render with very long values', () => {
      const longValue = 'a'.repeat(500);
      render(
        <AssertionCard type="must_contain" status="passed" value={longValue} />
      );

      expect(screen.getByTestId('assertion-expected')).toHaveTextContent(longValue);
    });

    it('should render with empty string value', () => {
      render(
        <AssertionCard type="must_contain" status="passed" value="" />
      );

      expect(screen.getByTestId('assertion-expected')).toBeInTheDocument();
    });
  });
});
