import { useCallback, useMemo, useRef } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	BackgroundVariant,
	useReactFlow
} from '@xyflow/react';
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
		addNode,
		setLastClickPosition
	} = useCanvasStore();

	const { screenToFlowPosition } = useReactFlow();
	const reactFlowWrapper = useRef<HTMLDivElement>(null);

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

	// Handle drag-and-drop from palette
	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback((event: React.DragEvent) => {
		event.preventDefault();

		const nodeType = event.dataTransfer.getData('application/reactflow');
		const label = event.dataTransfer.getData('application/label');

		if (!nodeType) return;

		// Convert screen coordinates to flow coordinates
		const position = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		});

		// Create new node
		const newNode = {
			id: `${nodeType}-${Date.now()}`,
			type: nodeType,
			data: { label },
			position
		};

		console.log('Dropped node:', newNode);
		addNode(newNode);
	}, [screenToFlowPosition, addNode]);

	// Register custom node types
	const nodeTypes = useMemo(() => ({
		input: InputNode,
		model: ModelNode,
		assertion: AssertionNode,
		tool: ToolNode,
		system: SystemNode
	}), []);

	return (
		<div className="w-full h-full" ref={reactFlowWrapper}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onPaneClick={handlePaneClick}
				onDrop={onDrop}
				onDragOver={onDragOver}
				fitView
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={16}
					size={1}
				/>
				<Controls />
				<MiniMap />
			</ReactFlow>
		</div>
	);
}

export default Canvas;
