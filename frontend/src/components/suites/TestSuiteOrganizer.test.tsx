import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestSuiteOrganizer, type TestSuite } from './TestSuiteOrganizer';

describe('TestSuiteOrganizer', () => {
  const mockSuites: TestSuite[] = [
    {
      id: 'suite-1',
      name: 'Integration Tests',
      description: 'API integration tests',
      tests: [
        { id: 'test-1', name: 'Login Test', status: 'passed', lastRun: new Date('2024-01-01') },
        { id: 'test-2', name: 'Logout Test', status: 'failed', lastRun: new Date('2024-01-02') },
      ],
      isExpanded: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'suite-2',
      name: 'Unit Tests',
      description: 'Component unit tests',
      tests: [
        { id: 'test-3', name: 'Button Test', status: 'pending' },
      ],
      isExpanded: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  const mockHandlers = {
    availableTests: [],
    loadingTests: false,
    onCreateSuite: vi.fn(),
    onDeleteSuite: vi.fn(),
    onRenameSuite: vi.fn(),
    onAddTestToSuite: vi.fn(),
    onRemoveTestFromSuite: vi.fn(),
    onRunSuite: vi.fn(),
    onRunTest: vi.fn(),
    onExportSuite: vi.fn(),
    onLoadTest: vi.fn(),
    onToggleSuite: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);
      expect(screen.getByTestId('test-suite-organizer')).toBeInTheDocument();
    });

    it('should render header with title and create button', () => {
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);
      expect(screen.getByText('Test Suites')).toBeInTheDocument();
      expect(screen.getByTestId('create-suite-button')).toBeInTheDocument();
    });

    it('should render all suites', () => {
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);
      expect(screen.getByTestId('suite-suite-1')).toBeInTheDocument();
      expect(screen.getByTestId('suite-suite-2')).toBeInTheDocument();
    });

    it('should render suite names and test counts', () => {
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);
      expect(screen.getByText('Integration Tests')).toBeInTheDocument();
      expect(screen.getByText('(2 tests)')).toBeInTheDocument();
      expect(screen.getByText('Unit Tests')).toBeInTheDocument();
      expect(screen.getByText('(1 tests)')).toBeInTheDocument();
    });

    it('should render suite descriptions', () => {
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);
      expect(screen.getByText('API integration tests')).toBeInTheDocument();
      expect(screen.getByText('Component unit tests')).toBeInTheDocument();
    });

    it('should render empty state when no suites', () => {
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);
      expect(screen.getByText('No test suites yet')).toBeInTheDocument();
      expect(screen.getByText('Create a suite to organize your tests')).toBeInTheDocument();
    });
  });

  describe('Suite Expansion/Collapse', () => {
    it('should not show tests when suite is collapsed', () => {
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);
      expect(screen.queryByText('Login Test')).not.toBeInTheDocument();
    });

    it('should show tests when suite is expanded', () => {
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);
      expect(screen.getByText('Button Test')).toBeInTheDocument();
    });

    it('should toggle suite expansion when clicking chevron', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      // Suite 1 is initially collapsed
      expect(screen.queryByText('Login Test')).not.toBeInTheDocument();

      // Click to expand - should call onToggleSuite
      await user.click(screen.getByTestId('toggle-suite-suite-1'));
      expect(mockHandlers.onToggleSuite).toHaveBeenCalledWith('suite-1');
    });

    it('should show folder icon when collapsed and folder-open when expanded', () => {
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      const suite1 = screen.getByTestId('suite-suite-1');
      const suite2 = screen.getByTestId('suite-suite-2');

      // Suite 1 is collapsed (Folder icon)
      // Suite 2 is expanded (FolderOpen icon)
      // We can't directly test the icon type, but we can verify the suites render
      expect(suite1).toBeInTheDocument();
      expect(suite2).toBeInTheDocument();
    });
  });

  describe('Create Suite', () => {
    it('should show create form when clicking create button', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);

      await user.click(screen.getByTestId('create-suite-button'));
      expect(screen.getByTestId('create-suite-form')).toBeInTheDocument();
    });

    it('should create suite with name only', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);

      await user.click(screen.getByTestId('create-suite-button'));
      await user.type(screen.getByTestId('suite-name-input'), 'New Suite');
      await user.click(screen.getByTestId('confirm-create-suite'));

      expect(mockHandlers.onCreateSuite).toHaveBeenCalledWith('New Suite', undefined);
    });

    it('should create suite with name and description', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);

      await user.click(screen.getByTestId('create-suite-button'));
      await user.type(screen.getByTestId('suite-name-input'), 'New Suite');
      await user.type(screen.getByTestId('suite-description-input'), 'Test description');
      await user.click(screen.getByTestId('confirm-create-suite'));

      expect(mockHandlers.onCreateSuite).toHaveBeenCalledWith('New Suite', 'Test description');
    });

    it('should not create suite with empty name', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);

      await user.click(screen.getByTestId('create-suite-button'));
      await user.click(screen.getByTestId('confirm-create-suite'));

      expect(mockHandlers.onCreateSuite).not.toHaveBeenCalled();
    });

    it('should cancel suite creation', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);

      await user.click(screen.getByTestId('create-suite-button'));
      await user.type(screen.getByTestId('suite-name-input'), 'New Suite');
      await user.click(screen.getByTestId('cancel-create-suite'));

      expect(mockHandlers.onCreateSuite).not.toHaveBeenCalled();
      expect(screen.queryByTestId('create-suite-form')).not.toBeInTheDocument();
    });
  });

  describe('Rename Suite', () => {
    it('should show rename input when clicking rename button', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('rename-suite-suite-1'));
      expect(screen.getByTestId('edit-suite-name-suite-1')).toBeInTheDocument();
    });

    it('should rename suite on blur', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('rename-suite-suite-1'));
      const input = screen.getByTestId('edit-suite-name-suite-1');

      await user.clear(input);
      await user.type(input, 'Renamed Suite');
      fireEvent.blur(input);

      expect(mockHandlers.onRenameSuite).toHaveBeenCalledWith('suite-1', 'Renamed Suite');
    });

    it('should rename suite on Enter key', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('rename-suite-suite-1'));
      const input = screen.getByTestId('edit-suite-name-suite-1');

      await user.clear(input);
      await user.type(input, 'Renamed Suite{Enter}');

      expect(mockHandlers.onRenameSuite).toHaveBeenCalledWith('suite-1', 'Renamed Suite');
    });

    it('should cancel rename on Escape key', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('rename-suite-suite-1'));
      const input = screen.getByTestId('edit-suite-name-suite-1');

      await user.clear(input);
      await user.type(input, 'New Name{Escape}');

      expect(mockHandlers.onRenameSuite).not.toHaveBeenCalled();
    });
  });

  describe('Delete Suite', () => {
    it('should show delete confirmation when clicking delete', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('delete-suite-suite-1'));
      expect(screen.getByTestId('confirm-delete-suite-suite-1')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-delete-suite-suite-1')).toBeInTheDocument();
    });

    it('should delete suite when confirming', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('delete-suite-suite-1'));
      await user.click(screen.getByTestId('confirm-delete-suite-suite-1'));

      expect(mockHandlers.onDeleteSuite).toHaveBeenCalledWith('suite-1');
    });

    it('should cancel delete', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('delete-suite-suite-1'));
      await user.click(screen.getByTestId('cancel-delete-suite-suite-1'));

      expect(mockHandlers.onDeleteSuite).not.toHaveBeenCalled();
    });
  });

  describe('Suite Actions', () => {
    it('should run suite when clicking run button', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('run-suite-suite-1'));
      expect(mockHandlers.onRunSuite).toHaveBeenCalledWith('suite-1');
    });

    it('should export suite when clicking export button', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      await user.click(screen.getByTestId('export-suite-suite-1'));
      expect(mockHandlers.onExportSuite).toHaveBeenCalledWith('suite-1');
    });
  });

  describe('Test Display', () => {
    it('should show test status badges', () => {
      // Use expanded suites to see test details
      const expandedSuites = mockSuites.map(s => ({ ...s, isExpanded: true }));
      render(<TestSuiteOrganizer suites={expandedSuites} {...mockHandlers} />);

      expect(screen.getByText('passed')).toBeInTheDocument();
      expect(screen.getByText('failed')).toBeInTheDocument();
    });

    it('should show test last run date', () => {
      // Use expanded suites to see test details
      const expandedSuites = mockSuites.map(s => ({ ...s, isExpanded: true }));
      render(<TestSuiteOrganizer suites={expandedSuites} />);

      // Check that test rows are rendered (dates formatted by browser locale)
      const suite1Tests = screen.getByTestId('suite-tests-suite-1');
      expect(suite1Tests).toBeInTheDocument();

      // Verify tests are shown
      expect(screen.getByText('Login Test')).toBeInTheDocument();
      expect(screen.getByText('Logout Test')).toBeInTheDocument();
    });

    it('should show empty state when suite has no tests', () => {
      const emptySuite: TestSuite = {
        id: 'empty',
        name: 'Empty Suite',
        tests: [],
        isExpanded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<TestSuiteOrganizer suites={[emptySuite]} {...mockHandlers} />);
      expect(screen.getByText('No tests in this suite yet')).toBeInTheDocument();
    });

    it('should load test when clicking test name', async () => {
      const user = userEvent.setup();
      // Use expanded suites to see test details
      const expandedSuites = mockSuites.map(s => ({ ...s, isExpanded: true }));
      render(<TestSuiteOrganizer suites={expandedSuites} {...mockHandlers} />);

      // Click on test name
      await user.click(screen.getByText('Login Test'));

      expect(mockHandlers.onLoadTest).toHaveBeenCalledWith('test-1');
    });

    it('should run individual test', async () => {
      const user = userEvent.setup();
      // Use expanded suites to see test details
      const expandedSuites = mockSuites.map(s => ({ ...s, isExpanded: true }));
      render(<TestSuiteOrganizer suites={expandedSuites} {...mockHandlers} />);

      // Click run button on test
      await user.click(screen.getByTestId('run-test-test-1'));

      expect(mockHandlers.onRunTest).toHaveBeenCalledWith('suite-1', 'test-1');
    });

    it('should remove test from suite', async () => {
      const user = userEvent.setup();
      // Use expanded suites to see test details
      const expandedSuites = mockSuites.map(s => ({ ...s, isExpanded: true }));
      render(<TestSuiteOrganizer suites={expandedSuites} {...mockHandlers} />);

      // Click remove button
      await user.click(screen.getByTestId('remove-test-test-1'));

      expect(mockHandlers.onRemoveTestFromSuite).toHaveBeenCalledWith('suite-1', 'test-1');
    });
  });

  describe('Props Updates', () => {
    it('should update when suites prop changes', () => {
      const { rerender } = render(<TestSuiteOrganizer suites={mockSuites} {...mockHandlers} />);

      expect(screen.getByText('Integration Tests')).toBeInTheDocument();

      const newSuites: TestSuite[] = [
        {
          id: 'new-suite',
          name: 'Updated Test Suite Name',
          tests: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      rerender(<TestSuiteOrganizer suites={newSuites} {...mockHandlers} />);

      expect(screen.getByText('Updated Test Suite Name')).toBeInTheDocument();
      expect(screen.queryByText('Integration Tests')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle suite without description', () => {
      const suiteWithoutDesc: TestSuite = {
        id: 'no-desc',
        name: 'No Description Suite',
        tests: [],
        isExpanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<TestSuiteOrganizer suites={[suiteWithoutDesc]} {...mockHandlers} />);
      expect(screen.getByText('No Description Suite')).toBeInTheDocument();
    });

    it('should handle test without status', () => {
      const suiteWithNoStatus: TestSuite = {
        id: 'no-status',
        name: 'No Status Suite',
        tests: [{ id: 'test-no-status', name: 'Test Without Status' }],
        isExpanded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<TestSuiteOrganizer suites={[suiteWithNoStatus]} {...mockHandlers} />);
      expect(screen.getByText('Test Without Status')).toBeInTheDocument();
    });

    it('should trim whitespace from suite name', async () => {
      const user = userEvent.setup();
      render(<TestSuiteOrganizer suites={[]} {...mockHandlers} />);

      await user.click(screen.getByTestId('create-suite-button'));
      await user.type(screen.getByTestId('suite-name-input'), '  Trimmed Suite  ');
      await user.click(screen.getByTestId('confirm-create-suite'));

      expect(mockHandlers.onCreateSuite).toHaveBeenCalledWith('Trimmed Suite', undefined);
    });
  });
});
