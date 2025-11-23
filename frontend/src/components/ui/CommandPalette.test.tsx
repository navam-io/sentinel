import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette, type Command } from './CommandPalette';

// Mock scrollIntoView which is not available in jsdom
Element.prototype.scrollIntoView = vi.fn();

describe('CommandPalette', () => {
  const mockCommands: Command[] = [
    {
      id: 'create-test',
      label: 'Create New Test',
      description: 'Create a new test spec',
      shortcut: '⌘N',
      action: vi.fn(),
      category: 'Tests',
    },
    {
      id: 'run-test',
      label: 'Run Test',
      description: 'Execute the current test',
      shortcut: '⌘R',
      action: vi.fn(),
      category: 'Tests',
    },
    {
      id: 'open-settings',
      label: 'Open Settings',
      description: 'Open application settings',
      shortcut: '⌘,',
      action: vi.fn(),
      category: 'General',
    },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<CommandPalette commands={mockCommands} isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByTestId('command-palette')).toBeInTheDocument();
    });

    it('should render all commands initially', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Create New Test')).toBeInTheDocument();
      expect(screen.getByText('Run Test')).toBeInTheDocument();
      expect(screen.getByText('Open Settings')).toBeInTheDocument();
    });

    it('should render commands grouped by category', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Tests')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('should render command descriptions', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Create a new test spec')).toBeInTheDocument();
      expect(screen.getByText('Execute the current test')).toBeInTheDocument();
    });

    it('should render shortcuts', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('⌘N')).toBeInTheDocument();
      expect(screen.getByText('⌘R')).toBeInTheDocument();
      expect(screen.getByText('⌘,')).toBeInTheDocument();
    });

    it('should render custom placeholder', () => {
      const customPlaceholder = 'Search for commands...';
      render(
        <CommandPalette
          commands={mockCommands}
          isOpen={true}
          onClose={mockOnClose}
          placeholder={customPlaceholder}
        />
      );
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter commands by label', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByTestId('command-palette-input');
      await user.type(input, 'Create');

      expect(screen.getByText('Create New Test')).toBeInTheDocument();
      expect(screen.queryByText('Run Test')).not.toBeInTheDocument();
      expect(screen.queryByText('Open Settings')).not.toBeInTheDocument();
    });

    it('should filter commands by description', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByTestId('command-palette-input');
      await user.type(input, 'Execute');

      expect(screen.getByText('Run Test')).toBeInTheDocument();
      expect(screen.queryByText('Create New Test')).not.toBeInTheDocument();
    });

    it('should filter commands by category', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByTestId('command-palette-input');
      await user.type(input, 'Tests');

      expect(screen.getByText('Create New Test')).toBeInTheDocument();
      expect(screen.getByText('Run Test')).toBeInTheDocument();
      expect(screen.queryByText('Open Settings')).not.toBeInTheDocument();
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByTestId('command-palette-input');
      await user.type(input, 'SETTINGS');

      expect(screen.getByText('Open Settings')).toBeInTheDocument();
    });

    it('should show "No commands found" when no matches', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByTestId('command-palette-input');
      await user.type(input, 'xyz123');

      expect(screen.getByText('No commands found')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate down with ArrowDown', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // First command should be selected initially, second after ArrowDown
      const commands = screen.getAllByRole('button');
      expect(commands[1]).toHaveClass('bg-sentinel-hover');
    });

    it('should navigate up with ArrowUp', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      // Move down twice, then up once
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowUp' });

      const commands = screen.getAllByRole('button');
      expect(commands[1]).toHaveClass('bg-sentinel-hover');
    });

    it('should execute command on Enter', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockCommands[0].action).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close on Escape', () => {
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Mouse Interaction', () => {
    it('should execute command on click', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByTestId('command-create-test'));

      expect(mockCommands[0].action).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close when clicking overlay', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByTestId('command-palette-overlay'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside palette', async () => {
      const user = userEvent.setup();
      render(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByTestId('command-palette'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should focus input when opened', async () => {
      const { rerender } = render(
        <CommandPalette commands={mockCommands} isOpen={false} onClose={mockOnClose} />
      );

      rerender(<CommandPalette commands={mockCommands} isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('command-palette-input')).toHaveFocus();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty commands array', () => {
      render(<CommandPalette commands={[]} isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('No commands found')).toBeInTheDocument();
    });

    it('should handle commands without categories', () => {
      const commandsWithoutCategory: Command[] = [
        {
          id: 'cmd1',
          label: 'Command 1',
          action: vi.fn(),
        },
      ];

      render(<CommandPalette commands={commandsWithoutCategory} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Command 1')).toBeInTheDocument();
    });

    it('should handle commands without icons, shortcuts, or descriptions', () => {
      const minimalCommands: Command[] = [
        {
          id: 'minimal',
          label: 'Minimal Command',
          action: vi.fn(),
        },
      ];

      render(<CommandPalette commands={minimalCommands} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Minimal Command')).toBeInTheDocument();
    });
  });
});
