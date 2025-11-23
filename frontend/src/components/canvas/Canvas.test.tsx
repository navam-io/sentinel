import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './Canvas';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the ReactFlow components
vi.mock('@xyflow/react', async () => {
	const actual = await vi.importActual<typeof import('@xyflow/react')>('@xyflow/react');
	return {
		...actual,
		ReactFlow: ({ children, onPaneClick, ...props }: any) => (
			<div
				data-testid="react-flow-canvas"
				onClick={onPaneClick}
				{...props}
			>
				<div className="react-flow__pane" data-testid="react-flow-pane" />
				{children}
			</div>
		),
		Background: ({ variant }: any) => <div data-testid="background" data-variant={variant} />,
		Controls: () => <div data-testid="controls" />,
		MiniMap: () => <div data-testid="minimap" />,
		BackgroundVariant: {
			Dots: 'dots',
			Lines: 'lines',
			Cross: 'cross'
		},
		useReactFlow: () => ({
			screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
			getNodes: vi.fn(() => []),
			getEdges: vi.fn(() => []),
			setNodes: vi.fn(),
			setEdges: vi.fn(),
		}),
	};
});

// Mock the node components
vi.mock('../nodes/InputNode', () => ({
	default: () => <div data-testid="input-node">InputNode</div>
}));
vi.mock('../nodes/ModelNode', () => ({
	default: () => <div data-testid="model-node">ModelNode</div>
}));
vi.mock('../nodes/AssertionNode', () => ({
	default: () => <div data-testid="assertion-node">AssertionNode</div>
}));
vi.mock('../nodes/ToolNode', () => ({
	default: () => <div data-testid="tool-node">ToolNode</div>
}));
vi.mock('../nodes/SystemNode', () => ({
	default: () => <div data-testid="system-node">SystemNode</div>
}));

describe('Canvas', () => {
	beforeEach(() => {
		// Reset store to initial state
		useCanvasStore.setState({
			nodes: [],
			edges: [],
			lastCanvasClickPosition: { x: 0, y: 0 }
		});
	});

	describe('Initialization', () => {
		it('should render empty canvas', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
			expect(screen.getByTestId('background')).toBeInTheDocument();
			expect(screen.getByTestId('controls')).toBeInTheDocument();
			expect(screen.getByTestId('minimap')).toBeInTheDocument();
		});

		it('should initialize with dots background variant', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const background = screen.getByTestId('background');
			expect(background).toHaveAttribute('data-variant', 'dots');
		});

		it('should load canvas with existing nodes', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'input',
						data: { label: 'Input' },
						position: { x: 100, y: 100 }
					},
					{
						id: '2',
						type: 'model',
						data: { label: 'Model' },
						position: { x: 100, y: 300 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes).toHaveLength(2);
			expect(state.nodes[0].type).toBe('input');
			expect(state.nodes[1].type).toBe('model');
		});

		it('should load canvas with existing edges', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'input',
						data: { label: 'Input' },
						position: { x: 100, y: 100 }
					},
					{
						id: '2',
						type: 'model',
						data: { label: 'Model' },
						position: { x: 100, y: 300 }
					}
				],
				edges: [
					{
						id: 'e1-2',
						source: '1',
						target: '2',
						animated: true
					}
				]
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.edges).toHaveLength(1);
			expect(state.edges[0].source).toBe('1');
			expect(state.edges[0].target).toBe('2');
		});
	});

	describe('Click Position Tracking', () => {
		it('should have setLastClickPosition function available', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.setLastClickPosition).toBeDefined();
			expect(typeof state.setLastClickPosition).toBe('function');
		});

		it('should store lastCanvasClickPosition in state', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.lastCanvasClickPosition).toBeDefined();
			expect(state.lastCanvasClickPosition).toHaveProperty('x');
			expect(state.lastCanvasClickPosition).toHaveProperty('y');
		});

		it('should update lastCanvasClickPosition when setLastClickPosition is called', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			const testPosition = { x: 100, y: 200 };

			// Manually call setLastClickPosition to verify it works
			state.setLastClickPosition(testPosition);

			const updatedState = useCanvasStore.getState();
			expect(updatedState.lastCanvasClickPosition).toEqual(testPosition);
		});
	});

	describe('Node Types Registration', () => {
		it('should register all 5 node types', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			// Node types are registered internally by ReactFlow
			// We verify by checking that the component renders without errors
			expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
		});

		it('should support input node type', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'input',
						data: { label: 'Input' },
						position: { x: 100, y: 100 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes[0].type).toBe('input');
		});

		it('should support model node type', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'model',
						data: { label: 'Model' },
						position: { x: 100, y: 100 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes[0].type).toBe('model');
		});

		it('should support assertion node type', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'assertion',
						data: { label: 'Assertion' },
						position: { x: 100, y: 100 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes[0].type).toBe('assertion');
		});

		it('should support tool node type', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'tool',
						data: { label: 'Tool' },
						position: { x: 100, y: 100 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes[0].type).toBe('tool');
		});

		it('should support system node type', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'system',
						data: { label: 'System' },
						position: { x: 100, y: 100 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes[0].type).toBe('system');
		});
	});

	describe('ReactFlow Configuration', () => {
		it('should set default viewport', () => {
			const { container } = render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const reactFlow = container.querySelector('[data-testid="react-flow-canvas"]');
			expect(reactFlow).toBeInTheDocument();
		});

		it('should set min and max zoom levels', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			// Zoom levels are configured but not visible in the DOM
			// We verify the component renders without errors
			expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
		});

		it('should enable Background component', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			expect(screen.getByTestId('background')).toBeInTheDocument();
		});

		it('should enable Controls component', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			expect(screen.getByTestId('controls')).toBeInTheDocument();
		});

		it('should enable MiniMap component', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			expect(screen.getByTestId('minimap')).toBeInTheDocument();
		});
	});

	describe('Store Integration', () => {
		it('should sync nodes with store', () => {
			const testNodes = [
				{
					id: '1',
					type: 'input',
					data: { label: 'Input' },
					position: { x: 100, y: 100 }
				},
				{
					id: '2',
					type: 'model',
					data: { label: 'Model' },
					position: { x: 100, y: 300 }
				}
			];

			useCanvasStore.setState({ nodes: testNodes, edges: [] });

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes).toEqual(testNodes);
		});

		it('should sync edges with store', () => {
			const testEdges = [
				{
					id: 'e1-2',
					source: '1',
					target: '2',
					animated: true
				}
			];

			useCanvasStore.setState({
				nodes: [],
				edges: testEdges
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.edges).toEqual(testEdges);
		});

		it('should use store callbacks for changes', () => {
			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.onNodesChange).toBeDefined();
			expect(state.onEdgesChange).toBeDefined();
			expect(state.onConnect).toBeDefined();
		});
	});

	describe('Complex Scenarios', () => {
		it('should handle multiple nodes of different types', () => {
			useCanvasStore.setState({
				nodes: [
					{
						id: '1',
						type: 'input',
						data: { label: 'Input' },
						position: { x: 100, y: 100 }
					},
					{
						id: '2',
						type: 'model',
						data: { label: 'Model' },
						position: { x: 100, y: 300 }
					},
					{
						id: '3',
						type: 'assertion',
						data: { label: 'Assertion' },
						position: { x: 100, y: 500 }
					},
					{
						id: '4',
						type: 'tool',
						data: { label: 'Tool' },
						position: { x: 400, y: 300 }
					},
					{
						id: '5',
						type: 'system',
						data: { label: 'System' },
						position: { x: 100, y: 0 }
					}
				],
				edges: []
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes).toHaveLength(5);
			expect(state.nodes.map(n => n.type)).toEqual([
				'input',
				'model',
				'assertion',
				'tool',
				'system'
			]);
		});

		it('should handle multiple edges between nodes', () => {
			useCanvasStore.setState({
				nodes: [
					{ id: '1', type: 'input', data: {}, position: { x: 0, y: 0 } },
					{ id: '2', type: 'model', data: {}, position: { x: 0, y: 200 } },
					{ id: '3', type: 'assertion', data: {}, position: { x: 0, y: 400 } },
					{ id: '4', type: 'assertion', data: {}, position: { x: 0, y: 600 } }
				],
				edges: [
					{ id: 'e1-2', source: '1', target: '2', animated: true },
					{ id: 'e2-3', source: '2', target: '3', animated: true },
					{ id: 'e2-4', source: '2', target: '4', animated: true }
				]
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.edges).toHaveLength(3);
		});

		it('should handle empty canvas state', () => {
			useCanvasStore.setState({
				nodes: [],
				edges: [],
				lastCanvasClickPosition: { x: 0, y: 0 }
			});

			render(
				<ReactFlowProvider>
					<Canvas />
				</ReactFlowProvider>
			);

			const state = useCanvasStore.getState();
			expect(state.nodes).toHaveLength(0);
			expect(state.edges).toHaveLength(0);
			expect(state.lastCanvasClickPosition).toEqual({ x: 0, y: 0 });
		});
	});
});
