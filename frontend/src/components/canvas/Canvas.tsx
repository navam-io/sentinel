import { useCallback, useMemo } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	ControlButton,
	MiniMap,
	BackgroundVariant,
	useReactFlow
} from '@xyflow/react';
import { Network } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import InputNode from '../nodes/InputNode';
import ModelNode from '../nodes/ModelNode';
import AssertionNode from '../nodes/AssertionNode';
import ToolNode from '../nodes/ToolNode';
import SystemNode from '../nodes/SystemNode';

function Canvas() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		setLastClickPosition,
		organizeNodes
	} = useCanvasStore();

	const { screenToFlowPosition } = useReactFlow();

	// Handle canvas clicks for positioning
	const handlePaneClick = useCallback((event: React.MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.classList.contains('react-flow__pane')) {
			// Convert screen coordinates to flow coordinates
			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});
			setLastClickPosition(position);
		}
	}, [screenToFlowPosition, setLastClickPosition]);

	// Register custom node types
	const nodeTypes = useMemo(() => ({
		input: InputNode,
		model: ModelNode,
		assertion: AssertionNode,
		tool: ToolNode,
		system: SystemNode
	}), []);

	return (
		<div className="w-full h-full" data-testid="canvas-container">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onPaneClick={handlePaneClick}
				defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
				minZoom={0.1}
				maxZoom={4}
				data-testid="react-flow-canvas"
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={16}
					size={1}
				/>
				<Controls showInteractive={true}>
					<ControlButton onClick={organizeNodes} title="Auto-organize nodes" data-testid="canvas-organize">
						<Network className="w-4 h-4" />
					</ControlButton>
				</Controls>
				<MiniMap />
			</ReactFlow>
		</div>
	);
}

export default Canvas;
