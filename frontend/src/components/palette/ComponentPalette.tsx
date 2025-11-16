import { LucideIcon, MessageSquare, Settings, Cpu, Wrench, CheckCircle2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';

interface NodeType {
	type: string;
	label: string;
	icon: LucideIcon;
	description: string;
}

interface NodeCategory {
	category: string;
	nodes: NodeType[];
}

const nodeTypes: NodeCategory[] = [
	{
		category: 'Inputs',
		nodes: [
			{ type: 'input', label: 'Prompt', icon: MessageSquare, description: 'User input prompt' },
			{ type: 'system', label: 'System', icon: Settings, description: 'System prompt' },
		]
	},
	{
		category: 'Models',
		nodes: [
			{ type: 'model', label: 'Model', icon: Cpu, description: 'AI model configuration' },
		]
	},
	{
		category: 'Tools',
		nodes: [
			{ type: 'tool', label: 'Tool', icon: Wrench, description: 'Agent tool' },
		]
	},
	{
		category: 'Assertions',
		nodes: [
			{ type: 'assertion', label: 'Assertion', icon: CheckCircle2, description: 'Test assertion' },
		]
	}
];

function ComponentPalette() {
	const { addNode, lastCanvasClickPosition, setLastClickPosition } = useCanvasStore();

	const handleAddNode = (nodeType: string, label: string) => {
		// Use last canvas click position
		const position = { ...lastCanvasClickPosition };

		// Initialize node data based on type
		let nodeData: any = { label };

		switch (nodeType) {
			case 'input':
				nodeData = {
					label,
					query: 'Enter your query here',
					system_prompt: '',
					context: {}
				};
				break;

			case 'model':
				nodeData = {
					label,
					model: 'gpt-4',
					provider: 'openai',
					temperature: 0.7,
					max_tokens: 1000
				};
				break;

			case 'system':
				nodeData = {
					label,
					description: 'System configuration',
					timeout_ms: 30000,
					framework: 'langgraph'
				};
				break;

			case 'tool':
				nodeData = {
					label,
					toolName: 'tool_name',
					toolDescription: '',
					toolParameters: null
				};
				break;

			case 'assertion':
				nodeData = {
					label,
					assertionType: 'must_contain',
					assertionValue: ''
				};
				break;

			default:
				nodeData = { label };
		}

		// Create new node
		const newNode = {
			id: `${nodeType}-${Date.now()}`,
			type: nodeType,
			data: nodeData,
			position
		};

		addNode(newNode);

		// Increment position for next node to avoid overlap
		setLastClickPosition({ x: position.x, y: position.y + 200 });
	};

	return (
		<div className="w-64 bg-sentinel-bg-elevated border-r border-sentinel-border flex flex-col">
			{/* App Title */}
			<div className="p-4 border-b border-sentinel-border">
				<h1 className="text-xl font-bold text-sentinel-primary">Sentinel</h1>
				<p className="text-xs text-sentinel-text-muted whitespace-nowrap">AI Agent Testing Platform</p>
			</div>

			{/* Palette Header */}
			<div className="p-4 border-b border-sentinel-border">
				<h2 className="text-sm font-semibold text-sentinel-text">Components</h2>
				<p className="text-[0.6rem] text-sentinel-text-muted mt-1">Click to add to canvas</p>
			</div>

			{/* Component Categories */}
			<div className="flex-1 overflow-y-auto p-3 space-y-4">
				{nodeTypes.map((category) => (
					<div key={category.category} className="space-y-2">
						<h3 className="text-[0.6rem] font-medium text-sentinel-text-muted uppercase tracking-wide px-2">
							{category.category}
						</h3>
						<div className="space-y-1">
							{category.nodes.map((node) => {
								const Icon = node.icon;
								return (
									<button
										key={node.type}
										className="w-full text-left p-2 bg-sentinel-surface border border-sentinel-border rounded-md hover:bg-sentinel-hover hover:border-sentinel-primary transition-all duration-150 cursor-pointer"
										onClick={() => handleAddNode(node.type, node.label)}
									>
										<div className="flex items-center gap-2">
											<Icon size={14} strokeWidth={2} className="text-sentinel-primary flex-shrink-0" />
											<div className="flex-1 min-w-0">
												<div className="text-[0.65rem] font-medium text-sentinel-text truncate">
													{node.label}
												</div>
												<div className="text-[0.55rem] text-sentinel-text-muted truncate">
													{node.description}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{/* Palette Footer */}
			<div className="p-3 border-t border-sentinel-border">
				<button className="w-full sentinel-button-secondary text-[0.65rem]">
					+ Add Custom Node
				</button>
			</div>
		</div>
	);
}

export default ComponentPalette;
