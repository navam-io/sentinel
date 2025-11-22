import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Topbar } from './Topbar';

describe('Topbar', () => {
  it('should render children correctly', () => {
    render(
      <Topbar>
        <div data-testid="test-child">Test Content</div>
      </Topbar>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render as header element', () => {
    const { container } = render(<Topbar>Content</Topbar>);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should apply base styling classes', () => {
    const { container } = render(<Topbar>Content</Topbar>);

    const header = container.querySelector('header');
    expect(header).toHaveClass('h-14');
    expect(header).toHaveClass('px-4');
    expect(header).toHaveClass('bg-sentinel-bg-elevated');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-sentinel-border');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('items-center');
    expect(header).toHaveClass('gap-4');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Topbar className="custom-class">Content</Topbar>
    );

    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-class');
  });

  it('should merge custom className with base classes', () => {
    const { container } = render(
      <Topbar className="custom-class another-class">Content</Topbar>
    );

    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-class');
    expect(header).toHaveClass('another-class');
    expect(header).toHaveClass('h-14');
    expect(header).toHaveClass('flex');
  });

  it('should render multiple children', () => {
    render(
      <Topbar>
        <button data-testid="btn-1">Button 1</button>
        <button data-testid="btn-2">Button 2</button>
        <div data-testid="div-1">Div Content</div>
      </Topbar>
    );

    expect(screen.getByTestId('btn-1')).toBeInTheDocument();
    expect(screen.getByTestId('btn-2')).toBeInTheDocument();
    expect(screen.getByTestId('div-1')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    const { container } = render(<Topbar>{null}</Topbar>);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toBeEmptyDOMElement();
  });

  it('should render text content directly', () => {
    render(<Topbar>Simple text content</Topbar>);

    expect(screen.getByText('Simple text content')).toBeInTheDocument();
  });

  it('should render with no custom className', () => {
    const { container } = render(<Topbar>Content</Topbar>);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    // Base classes should still be present
    expect(header).toHaveClass('h-14');
  });
});
