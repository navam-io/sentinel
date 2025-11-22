import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModelSelector } from './ModelSelector';

describe('ModelSelector', () => {
  const mockModels = [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' as const },
    { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'openai' as const },
    { id: 'llama-3', name: 'Llama 3', provider: 'ollama' as const },
  ];

  it('renders select dropdown with models', () => {
    const onSelect = vi.fn();
    render(<ModelSelector models={mockModels} onSelect={onSelect} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('displays all model options', () => {
    const onSelect = vi.fn();
    render(<ModelSelector models={mockModels} onSelect={onSelect} />);

    expect(screen.getByText(/Claude 3.5 Sonnet.*anthropic/)).toBeInTheDocument();
    expect(screen.getByText(/GPT-5.1.*openai/)).toBeInTheDocument();
    expect(screen.getByText(/Llama 3.*ollama/)).toBeInTheDocument();
  });

  it('shows selected model', () => {
    const onSelect = vi.fn();
    render(
      <ModelSelector
        models={mockModels}
        selected={mockModels[0]}
        onSelect={onSelect}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('claude-3-5-sonnet');
  });

  it('calls onSelect when model is changed', () => {
    const onSelect = vi.fn();
    render(<ModelSelector models={mockModels} onSelect={onSelect} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'gpt-5.1' } });

    expect(onSelect).toHaveBeenCalledWith(mockModels[1]);
  });

  it('shows placeholder when no model selected', () => {
    const onSelect = vi.fn();
    render(<ModelSelector models={mockModels} onSelect={onSelect} />);

    expect(screen.getByText('Select model...')).toBeInTheDocument();
  });

  it('renders ModelCube icon', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ModelSelector models={mockModels} onSelect={onSelect} />
    );

    // Check for SVG icon
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
