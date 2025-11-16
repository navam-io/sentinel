import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Wrench, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useHandleConnection } from '../../hooks/useHandleConnection';

function ToolNode({ data, id }: NodeProps) {
	const { updateNode, removeNode } = useCanvasStore();
	const [toolName, setToolName] = useState<string>((data?.toolName as string) || 'web_search');
	const [toolDescription, setToolDescription] = useState<string>((data?.toolDescription as string) || '');
	const isTargetConnected = useHandleConnection(id, 'target');
	const isSourceConnected = useHandleConnection(id, 'source');

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setToolName(newName);
		updateNode(id, { toolName: newName });
	};

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newDesc = e.target.value;
		setToolDescription(newDesc);
		updateNode(id, { toolDescription: newDesc });
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeNode(id);
	};

	return (
		<div className="sentinel-node tool-node">
			<button className="node-delete-btn nodrag nopan" onClick={handleDelete} title="Delete node">
				<X size={10} strokeWidth={2} />
			</button>
			<div className="node-header">
				<Wrench size={18} className="node-icon" strokeWidth={2} />
				<span className="node-title">Tool</span>
			</div>
			<div className="node-body">
				<div className="space-y-3">
					<div className="nodrag nopan">
						<label htmlFor="tool-name" className="label">Tool Name</label>
						<input
							id="tool-name"
							type="text"
							value={toolName}
							onChange={handleNameChange}
							className="sentinel-input text-[0.65rem] w-full nodrag nopan"
							placeholder="e.g. web_search"
						/>
					</div>
					<div className="nodrag nopan">
						<label htmlFor="tool-description" className="label">Description</label>
						<textarea
							id="tool-description"
							value={toolDescription}
							onChange={handleDescriptionChange}
							className="sentinel-input text-[0.65rem] w-full min-h-16 resize-y nodrag nopan"
							placeholder="Tool description..."
						/>
					</div>
				</div>
			</div>
			<Handle
				type="target"
				position={Position.Top}
				isConnectable={true}
				className={isTargetConnected ? 'connected' : ''}
				style={{
					width: '12px',
					height: '12px',
					borderRadius: '50%',
					top: '-6px',
					zIndex: 1000,
					position: 'absolute',
					left: '50%',
					transform: 'translateX(-50%)',
					cursor: 'crosshair'
				}}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				isConnectable={true}
				className={isSourceConnected ? 'connected' : ''}
				style={{
					width: '12px',
					height: '12px',
					borderRadius: '50%',
					bottom: '-6px',
					zIndex: 1000,
					position: 'absolute',
					left: '50%',
					transform: 'translateX(-50%)',
					cursor: 'crosshair'
				}}
			/>
		</div>
	);
}

export default ToolNode;
