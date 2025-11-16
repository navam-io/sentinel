import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Cpu, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useHandleConnection } from '../../hooks/useHandleConnection';

const models = [
	// Latest Claude 4.x (Recommended)
	'claude-sonnet-4-5-20250929',      // Claude Sonnet 4.5 (Latest)
	'claude-haiku-4-5-20251001',       // Claude Haiku 4.5 (Fast)
	'claude-opus-4-1-20250805',        // Claude Opus 4.1 (Most capable)

	// Claude 4.0
	'claude-sonnet-4-20250514',        // Claude Sonnet 4
	'claude-opus-4-20250514',          // Claude Opus 4

	// Claude 3.x (Legacy)
	'claude-3-7-sonnet-20250219',      // Claude Sonnet 3.7
	'claude-3-5-haiku-20241022',       // Claude Haiku 3.5

	// OpenAI (Placeholder - not yet implemented)
	'gpt-4',
	'gpt-4-turbo',
	'gpt-3.5-turbo'
];

function ModelNode({ data, id }: NodeProps) {
	const { updateNode, removeNode } = useCanvasStore();
	const [selectedModel, setSelectedModel] = useState<string>((data?.model as string) || 'claude-sonnet-4-5-20250929');
	const [temperature, setTemperature] = useState<number>((data?.temperature as number) || 0.7);
	const isTargetConnected = useHandleConnection(id, 'target');
	const isSourceConnected = useHandleConnection(id, 'source');

	const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newModel = e.target.value;
		setSelectedModel(newModel);
		updateNode(id, { model: newModel });
	};

	const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTemp = parseFloat(e.target.value);
		setTemperature(newTemp);
		updateNode(id, { temperature: newTemp });
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeNode(id);
	};

	return (
		<div className="sentinel-node model-node">
			<button className="node-delete-btn nodrag nopan" onClick={handleDelete} title="Delete node">
				<X size={10} strokeWidth={2} />
			</button>
			<div className="node-header">
				<Cpu size={18} className="node-icon" strokeWidth={2} />
				<span className="node-title">Model</span>
			</div>
			<div className="node-body">
				<div className="space-y-3">
					<div className="nodrag nopan">
						<label htmlFor="model-select" className="label">Model</label>
						<select
							id="model-select"
							value={selectedModel}
							onChange={handleModelChange}
							className="sentinel-input text-[0.65rem] w-full nodrag nopan"
						>
							{models.map((model) => (
								<option key={model} value={model}>{model}</option>
							))}
						</select>
					</div>
					<div className="nodrag nopan">
						<label htmlFor="temperature-range" className="label text-[0.55rem]">
							Temperature: {temperature}
						</label>
						<input
							id="temperature-range"
							type="range"
							min="0"
							max="2"
							step="0.1"
							value={temperature}
							onChange={handleTemperatureChange}
							className="w-full cursor-pointer nodrag nopan"
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

export default ModelNode;
