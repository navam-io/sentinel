import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Cpu, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';

const models = [
	'gpt-4',
	'gpt-4-turbo',
	'gpt-3.5-turbo',
	'claude-3-5-sonnet-20241022',
	'claude-3-opus-20240229',
	'claude-3-sonnet-20240229'
];

function ModelNode({ data, id }: NodeProps) {
	const { updateNode, removeNode } = useCanvasStore();
	const [selectedModel, setSelectedModel] = useState<string>((data?.model as string) || 'gpt-4');
	const [temperature, setTemperature] = useState<number>((data?.temperature as number) || 0.7);

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
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

export default ModelNode;
