import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateCard, type Template } from './TemplateCard';

describe('TemplateCard', () => {
  const mockTemplate: Template = {
    id: 'test-1',
    name: 'Simple Q&A Test',
    description: 'A basic question answering test',
    category: 'qa',
    tags: ['qa', 'simple', 'factual'],
    model: 'gpt-4',
    provider: 'openai',
    yamlContent: 'name: Test\nmodel: gpt-4',
  };

  it('renders template information', () => {
    const onLoad = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} />);

    expect(screen.getByText('Simple Q&A Test')).toBeInTheDocument();
    expect(screen.getByText('A basic question answering test')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getAllByText('qa').length).toBeGreaterThan(0);
  });

  it('displays template tags', () => {
    const onLoad = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} />);

    expect(screen.getAllByText('qa').length).toBeGreaterThan(0);
    expect(screen.getByText('simple')).toBeInTheDocument();
    expect(screen.getByText('factual')).toBeInTheDocument();
  });

  it('truncates tags when more than 3', () => {
    const templateWithManyTags: Template = {
      ...mockTemplate,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    const onLoad = vi.fn();
    render(<TemplateCard template={templateWithManyTags} onLoad={onLoad} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('calls onLoad when Load button is clicked', () => {
    const onLoad = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} />);

    const loadButton = screen.getByText('Load to Canvas');
    fireEvent.click(loadButton);

    expect(onLoad).toHaveBeenCalledWith(mockTemplate);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('shows Preview button when onPreview is provided', () => {
    const onLoad = vi.fn();
    const onPreview = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} onPreview={onPreview} />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('calls onPreview when Preview button is clicked', () => {
    const onLoad = vi.fn();
    const onPreview = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} onPreview={onPreview} />);

    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(onPreview).toHaveBeenCalledWith(mockTemplate);
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it('does not show Preview button when onPreview is not provided', () => {
    const onLoad = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} />);

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('applies correct category color', () => {
    const onLoad = vi.fn();
    render(<TemplateCard template={mockTemplate} onLoad={onLoad} />);

    const categoryBadges = screen.getAllByText('qa');
    // The category badge is the one with both bg and text classes
    const categoryBadge = categoryBadges.find((el) =>
      el.className.includes('text-sentinel-info') && el.className.includes('bg-sentinel-info')
    );
    expect(categoryBadge).toBeDefined();
    expect(categoryBadge).toHaveClass('text-sentinel-info');
  });

  it('applies custom className', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <TemplateCard template={mockTemplate} onLoad={onLoad} className="custom-class" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});
