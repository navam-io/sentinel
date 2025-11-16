import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { CheckCircle2, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';

const assertionTypes = [
	{ value: 'must_contain', label: 'Must Contain' },
	{ value: 'must_not_contain', label: 'Must Not Contain' },
	{ value: 'regex_match', label: 'Regex Match' },
	{ value: 'output_type', label: 'Output Type' },
	{ value: 'max_latency_ms', label: 'Max Latency' }
];

function AssertionNode({ data, id }: NodeProps) {
	const { updateNode, removeNode } = useCanvasStore();
	const [assertionType, setAssertionType] = useState<string>((data?.assertionType as string) || 'must_contain');
	const [assertionValue, setAssertionValue] = useState<string>((data?.assertionValue as string) || 'Paris');

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value;
		setAssertionType(newType);
		updateNode(id, { assertionType: newType });
	};

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setAssertionValue(newValue);
		updateNode(id, { assertionValue: newValue });
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeNode(id);
	};

	return (
		<div className="sentinel-node assertion-node">
			<button className="node-delete-btn nodrag nopan" onClick={handleDelete} title="Delete node">
				<X size={10} strokeWidth={2} />
			</button>
			<div className="node-header">
				<CheckCircle2 size={18} className="node-icon" strokeWidth={2} />
				<span className="node-title">Assertion</span>
			</div>
			<div className="node-body">
				<div className="space-y-3">
					<div className="nodrag nopan">
						<label htmlFor="assertion-type" className="label">Type</label>
						<select
							id="assertion-type"
							value={assertionType}
							onChange={handleTypeChange}
							className="sentinel-input text-[0.65rem] w-full nodrag nopan"
						>
							{assertionTypes.map((type) => (
								<option key={type.value} value={type.value}>{type.label}</option>
							))}
						</select>
					</div>
					<div className="nodrag nopan">
						<label htmlFor="assertion-value" className="label">Value</label>
						<input
							id="assertion-value"
							type="text"
							value={assertionValue}
							onChange={handleValueChange}
							className="sentinel-input text-[0.65rem] w-full nodrag nopan"
							placeholder="Expected value..."
						/>
					</div>
				</div>
			</div>
			<Handle type="target" position={Position.Top} />
		</div>
	);
}

export default AssertionNode;
