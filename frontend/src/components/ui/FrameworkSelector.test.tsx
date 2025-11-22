import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FrameworkSelector, type Framework } from './FrameworkSelector';

describe('FrameworkSelector', () => {
  const mockFrameworks: Framework[] = [
    { id: 'langgraph', name: 'LangGraph', type: 'langgraph' },
    { id: 'claude-sdk', name: 'Claude Agent SDK', type: 'claude-agent-sdk' },
    { id: 'openai-sdk', name: 'OpenAI Agents SDK', type: 'openai-agents-sdk' },
    { id: 'strands', name: 'Strands Agents', type: 'strands' },
  ];

  it('should render all frameworks in dropdown', () => {
    const onSelect = vi.fn();
    render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    mockFrameworks.forEach((framework) => {
      expect(screen.getByText(framework.name)).toBeInTheDocument();
    });
  });

  it('should show placeholder when no framework is selected', () => {
    const onSelect = vi.fn();
    render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Select framework...')).toBeInTheDocument();
  });

  it('should not show placeholder when framework is selected', () => {
    const onSelect = vi.fn();
    render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        selected={mockFrameworks[0]}
        onSelect={onSelect}
      />
    );

    expect(screen.queryByText('Select framework...')).not.toBeInTheDocument();
  });

  it('should display selected framework', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        selected={mockFrameworks[1]}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('claude-sdk');
  });

  it('should call onSelect when framework is changed', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        selected={mockFrameworks[0]}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'claude-sdk' } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(mockFrameworks[1]);
  });

  it('should handle selection of different frameworks', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select') as HTMLSelectElement;

    // Select LangGraph
    fireEvent.change(select, { target: { value: 'langgraph' } });
    expect(onSelect).toHaveBeenCalledWith(mockFrameworks[0]);

    // Select OpenAI SDK
    fireEvent.change(select, { target: { value: 'openai-sdk' } });
    expect(onSelect).toHaveBeenCalledWith(mockFrameworks[2]);
  });

  it('should not call onSelect for invalid framework ID', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'invalid-id' } });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should render GraphNodes icon', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-sentinel-primary');
  });

  it('should apply custom className to wrapper', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
    expect(wrapper).toHaveClass('relative');
  });

  it('should apply sentinel-input class to select', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select');
    expect(select).toHaveClass('sentinel-input');
    expect(select).toHaveClass('cursor-pointer');
  });

  it('should handle empty frameworks array', () => {
    const onSelect = vi.fn();
    render(
      <FrameworkSelector
        frameworks={[]}
        onSelect={onSelect}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Select framework...')).toBeInTheDocument();
  });

  it('should handle single framework', () => {
    const onSelect = vi.fn();
    render(
      <FrameworkSelector
        frameworks={[mockFrameworks[0]]}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('LangGraph')).toBeInTheDocument();
    expect(screen.queryByText('Claude Agent SDK')).not.toBeInTheDocument();
  });

  it('should preserve framework type in selection', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'langgraph' } });

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'langgraph',
        name: 'LangGraph',
        type: 'langgraph',
      })
    );
  });

  it('should update when selected prop changes', () => {
    const onSelect = vi.fn();
    const { container, rerender } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        selected={mockFrameworks[0]}
        onSelect={onSelect}
      />
    );

    let select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('langgraph');

    // Update selected framework
    rerender(
      <FrameworkSelector
        frameworks={mockFrameworks}
        selected={mockFrameworks[2]}
        onSelect={onSelect}
      />
    );

    select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('openai-sdk');
  });

  it('should handle undefined selected prop gracefully', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <FrameworkSelector
        frameworks={mockFrameworks}
        selected={undefined}
        onSelect={onSelect}
      />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('');
  });
});
