import { useCallback } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	Panel,
	BackgroundVariant
} from '@xyflow/react';
import { useCanvasStore } from '../../stores/canvasStore';

function Canvas() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		setLastClickPosition
	} = useCanvasStore();

	// Handle canvas clicks for positioning
	const handlePaneClick = useCallback((event: React.MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.classList.contains('react-flow__pane')) {
			setLastClickPosition({ x: event.clientX, y: event.clientY });
		}
	}, [setLastClickPosition]);

	return (
		<div className="w-full h-full">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onPaneClick={handlePaneClick}
				fitView
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={16}
					size={1}
				/>
				<Controls />
				<MiniMap />
				<Panel position="top-left" className="bg-sentinel-surface border border-sentinel-border rounded-lg p-4">
					<h1 className="text-xl font-bold text-sentinel-primary">Sentinel</h1>
					<p className="text-sm text-sentinel-text-muted">AI Agent Testing Platform</p>
				</Panel>
			</ReactFlow>
		</div>
	);
}

export default Canvas;
