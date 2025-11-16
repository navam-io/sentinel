import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MessageSquare, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useHandleConnection } from '../../hooks/useHandleConnection';

function InputNode({ data, id }: NodeProps) {
	const { updateNode, removeNode } = useCanvasStore();
	const [query, setQuery] = useState<string>((data?.query as string) || 'What is the capital of France?');
	const isSourceConnected = useHandleConnection(id, 'source');

	const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newQuery = e.target.value;
		setQuery(newQuery);
		updateNode(id, { query: newQuery });
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeNode(id);
	};

	return (
		<div className="sentinel-node input-node">
			<button className="node-delete-btn nodrag nopan" onClick={handleDelete} title="Delete node">
				<X size={10} strokeWidth={2} />
			</button>
			<div className="node-header">
				<MessageSquare size={18} className="node-icon" strokeWidth={2} />
				<span className="node-title">Input</span>
			</div>
			<div className="node-body">
				<textarea
					value={query}
					onChange={handleQueryChange}
					className="sentinel-input text-[0.65rem] w-full min-h-16 resize-y nodrag nopan"
					placeholder="Enter your prompt..."
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

export default InputNode;
