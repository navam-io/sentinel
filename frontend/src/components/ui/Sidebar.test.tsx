import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders with children', () => {
    render(
      <Sidebar>
        <div>Test Content</div>
      </Sidebar>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('starts expanded by default', () => {
    const { container } = render(
      <Sidebar>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('w-[280px]');
  });

  it('can start collapsed', () => {
    const { container } = render(
      <Sidebar defaultCollapsed>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('w-20');
  });

  it('toggles collapse state when button clicked', () => {
    const { container } = render(
      <Sidebar>
        <div>Content</div>
      </Sidebar>
    );

    const button = screen.getByRole('button');
    const sidebar = container.querySelector('aside');

    // Initially expanded
    expect(sidebar).toHaveClass('w-[280px]');

    // Click to collapse
    fireEvent.click(button);
    expect(sidebar).toHaveClass('w-20');

    // Click to expand
    fireEvent.click(button);
    expect(sidebar).toHaveClass('w-[280px]');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Sidebar className="custom-class">
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('custom-class');
  });
});
