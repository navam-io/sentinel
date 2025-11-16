import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Settings, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useHandleConnection } from '../../hooks/useHandleConnection';

function SystemNode({ data, id }: NodeProps) {
	const { updateNode, removeNode } = useCanvasStore();
	const [systemPrompt, setSystemPrompt] = useState<string>((data?.systemPrompt as string) || 'You are a helpful AI assistant.');
	const isSourceConnected = useHandleConnection(id, 'source');

	const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newPrompt = e.target.value;
		setSystemPrompt(newPrompt);
		updateNode(id, { systemPrompt: newPrompt });
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeNode(id);
	};

	return (
		<div className="sentinel-node system-node">
			<button className="node-delete-btn nodrag nopan" onClick={handleDelete} title="Delete node">
				<X size={10} strokeWidth={2} />
			</button>
			<div className="node-header">
				<Settings size={18} className="node-icon" strokeWidth={2} />
				<span className="node-title">System</span>
			</div>
			<div className="node-body">
				<textarea
					value={systemPrompt}
					onChange={handlePromptChange}
					className="sentinel-input text-[0.65rem] w-full min-h-16 resize-y nodrag nopan"
					placeholder="Enter system prompt..."
				/>
			</div>
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

export default SystemNode;
