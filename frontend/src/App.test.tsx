import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useSettingsStore } from './stores/settingsStore';

// Mock React Flow
vi.mock('@xyflow/react', () => ({
	ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ReactFlow: () => <div data-testid="react-flow">Canvas</div>,
	Controls: () => <div>Controls</div>,
	ControlButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
	MiniMap: () => <div>MiniMap</div>,
	Background: () => <div>Background</div>,
	useReactFlow: () => ({
		screenToFlowPosition: vi.fn(),
		fitView: vi.fn(),
		setViewport: vi.fn()
	}),
	useNodesState: () => [[], vi.fn(), vi.fn()],
	useEdgesState: () => [[], vi.fn(), vi.fn()]
}));

// Mock components
vi.mock('./components/canvas/Canvas', () => ({
	default: () => <div data-testid="canvas">Canvas</div>
}));

vi.mock('./components/palette/ComponentPalette', () => ({
	default: () => <div data-testid="component-palette">ComponentPalette</div>
}));

vi.mock('./components/RightPanel', () => ({
	default: () => <div data-testid="right-panel">RightPanel</div>
}));

describe('App - Collapsible Panels', () => {
	it('renders all main components', () => {
		render(<App />);

		expect(screen.getByTestId('component-palette')).toBeDefined();
		expect(screen.getByTestId('canvas')).toBeDefined();
		expect(screen.getByTestId('right-panel')).toBeDefined();
	});

	it('shows expand button when left panel is collapsed', () => {
		// Set left panel to collapsed
		useSettingsStore.setState({ showLeftPanel: false });

		render(<App />);

		const expandButton = screen.getByTestId('expand-left-panel');
		expect(expandButton).toBeDefined();
		expect(expandButton.title).toBe('Expand left panel');
	});

	it('hides expand button when left panel is visible', () => {
		// Set left panel to visible
		useSettingsStore.setState({ showLeftPanel: true });

		render(<App />);

		expect(screen.queryByTestId('expand-left-panel')).toBeNull();
	});

	it('shows expand button when right panel is collapsed', () => {
		// Set right panel to collapsed
		useSettingsStore.setState({ showRightPanel: false });

		render(<App />);

		const expandButton = screen.getByTestId('expand-right-panel');
		expect(expandButton).toBeDefined();
		expect(expandButton.title).toBe('Expand right panel');
	});

	it('hides expand button when right panel is visible', () => {
		// Set right panel to visible
		useSettingsStore.setState({ showRightPanel: true });

		render(<App />);

		expect(screen.queryByTestId('expand-right-panel')).toBeNull();
	});

	it('expands left panel when expand button is clicked', () => {
		// Set left panel to collapsed
		useSettingsStore.setState({ showLeftPanel: false });

		render(<App />);

		const expandButton = screen.getByTestId('expand-left-panel');
		fireEvent.click(expandButton);

		// Check that showLeftPanel is now true
		expect(useSettingsStore.getState().showLeftPanel).toBe(true);
	});

	it('expands right panel when expand button is clicked', () => {
		// Set right panel to collapsed
		useSettingsStore.setState({ showRightPanel: false });

		render(<App />);

		const expandButton = screen.getByTestId('expand-right-panel');
		fireEvent.click(expandButton);

		// Check that showRightPanel is now true
		expect(useSettingsStore.getState().showRightPanel).toBe(true);
	});

	it('shows both expand buttons when both panels are collapsed', () => {
		// Set both panels to collapsed
		useSettingsStore.setState({
			showLeftPanel: false,
			showRightPanel: false
		});

		render(<App />);

		expect(screen.getByTestId('expand-left-panel')).toBeDefined();
		expect(screen.getByTestId('expand-right-panel')).toBeDefined();
	});

	it('hides both expand buttons when both panels are visible', () => {
		// Set both panels to visible
		useSettingsStore.setState({
			showLeftPanel: true,
			showRightPanel: true
		});

		render(<App />);

		expect(screen.queryByTestId('expand-left-panel')).toBeNull();
		expect(screen.queryByTestId('expand-right-panel')).toBeNull();
	});
});
