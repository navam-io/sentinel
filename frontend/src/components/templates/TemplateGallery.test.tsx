import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateGallery } from './TemplateGallery';
import type { Template } from './TemplateCard';

describe('TemplateGallery', () => {
  const mockTemplates: Template[] = [
    {
      id: 'qa-1',
      name: 'Simple Q&A',
      description: 'Basic question answering',
      category: 'qa',
      tags: ['qa', 'simple'],
      model: 'gpt-4',
      provider: 'openai',
      yamlContent: '',
    },
    {
      id: 'code-1',
      name: 'Code Generation',
      description: 'Generate Python code',
      category: 'code-generation',
      tags: ['code', 'python'],
      model: 'claude-3-5-sonnet',
      provider: 'anthropic',
      yamlContent: '',
    },
    {
      id: 'browser-1',
      name: 'Browser Agent',
      description: 'Research products',
      category: 'browser',
      tags: ['browser', 'e2e'],
      model: 'claude-3-5-sonnet',
      provider: 'anthropic',
      yamlContent: '',
    },
  ];

  it('renders gallery header', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    expect(screen.getByText('Template Gallery')).toBeInTheDocument();
    expect(screen.getByText(/Browse and load pre-built test templates/)).toBeInTheDocument();
  });

  it('displays all templates', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    expect(screen.getByRole('heading', { name: 'Simple Q&A' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Code Generation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Browser Agent' })).toBeInTheDocument();
  });

  it('shows correct template count', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    expect(screen.getByText('Showing 3 of 3 templates')).toBeInTheDocument();
  });

  it('filters templates by search query', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'code' } });

    expect(screen.getByRole('heading', { name: 'Code Generation' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Simple Q&A' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Browser Agent' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 templates')).toBeInTheDocument();
  });

  it('filters templates by category', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'browser' } });

    expect(screen.getByRole('heading', { name: 'Browser Agent' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Simple Q&A' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Code Generation' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 templates')).toBeInTheDocument();
  });

  it('shows "All Templates" by default in category filter', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    const categorySelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(categorySelect.value).toBe('all');
  });

  it('shows empty state when no templates match filter', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No templates found')).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search/)).toBeInTheDocument();
  });

  it('combines search and category filters', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'code-generation' } });

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'python' } });

    expect(screen.getByRole('heading', { name: 'Code Generation' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Simple Q&A' })).not.toBeInTheDocument();
  });

  it('passes onLoadTemplate to TemplateCard', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={mockTemplates} onLoadTemplate={onLoad} />);

    const loadButtons = screen.getAllByText('Load to Canvas');
    fireEvent.click(loadButtons[0]);

    expect(onLoad).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('passes onPreviewTemplate to TemplateCard when provided', () => {
    const onLoad = vi.fn();
    const onPreview = vi.fn();
    render(
      <TemplateGallery
        templates={mockTemplates}
        onLoadTemplate={onLoad}
        onPreviewTemplate={onPreview}
      />
    );

    expect(screen.getAllByText('Preview')).toHaveLength(3);
  });

  it('handles empty templates array', () => {
    const onLoad = vi.fn();
    render(<TemplateGallery templates={[]} onLoadTemplate={onLoad} />);

    expect(screen.getByText('Showing 0 of 0 templates')).toBeInTheDocument();
    expect(screen.getByText('No templates found')).toBeInTheDocument();
  });
});
