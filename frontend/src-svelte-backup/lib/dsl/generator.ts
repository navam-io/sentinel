import type { Node, Edge } from '@xyflow/svelte';
import * as yaml from 'yaml';

export interface TestSpec {
	name: string;
	model: string;
	inputs?: Record<string, any>;
	assertions?: Array<Record<string, any>>;
	tools?: string[];
	tags?: string[];
	timeout_ms?: number;
	seed?: number;
}

/**
 * Generate YAML test specification from canvas nodes and edges
 */
export function generateYAML(nodes: Node[], edges: Edge[]): string {
	const spec: TestSpec = {
		name: 'Test from Canvas',
		model: 'gpt-4',
		inputs: {},
		assertions: [],
		tags: ['canvas-generated']
	};

	// Process nodes to extract test configuration
	for (const node of nodes) {
		switch (node.type) {
			case 'input':
				if (node.data?.query) {
					spec.inputs!.query = String(node.data.query);
				}
				break;

			case 'model':
				if (node.data?.model) {
					spec.model = String(node.data.model);
				}
				if (node.data?.temperature !== undefined) {
					if (!spec.inputs) spec.inputs = {};
					spec.inputs.temperature = node.data.temperature;
				}
				break;

			case 'assertion':
				if (node.data?.assertionType && node.data?.assertionValue) {
					const assertion: Record<string, any> = {};
					assertion[String(node.data.assertionType)] = String(node.data.assertionValue);
					spec.assertions!.push(assertion);
				}
				break;

			case 'tool':
				if (node.data?.toolName) {
					if (!spec.tools) spec.tools = [];
					spec.tools.push(String(node.data.toolName));
				}
				break;
		}
	}

	// Clean up empty arrays/objects
	if (spec.assertions && spec.assertions.length === 0) {
		delete spec.assertions;
	}
	if (spec.tools && spec.tools.length === 0) {
		delete spec.tools;
	}
	if (spec.inputs && Object.keys(spec.inputs).length === 0) {
		delete spec.inputs;
	}

	// Convert to YAML
	return yaml.stringify(spec, {
		indent: 2,
		lineWidth: 0,
		minContentWidth: 0,
	});
}

/**
 * Parse YAML and convert to nodes and edges (for future import feature)
 */
export function parseYAMLToNodes(yamlContent: string): { nodes: Node[]; edges: Edge[] } {
	try {
		const spec = yaml.parse(yamlContent) as TestSpec;
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		let yPosition = 100;
		const xPosition = 250;
		const spacing = 180;

		// Create input node
		if (spec.inputs?.query) {
			nodes.push({
				id: 'input-1',
				type: 'input',
				data: { label: 'Input', query: spec.inputs.query },
				position: { x: xPosition, y: yPosition }
			});
			yPosition += spacing;
		}

		// Create model node
		nodes.push({
			id: 'model-1',
			type: 'model',
			data: {
				label: `Model: ${spec.model}`,
				model: spec.model,
				temperature: spec.inputs?.temperature || 0.7
			},
			position: { x: xPosition, y: yPosition }
		});

		// Create edge from input to model
		if (nodes.length > 1) {
			edges.push({
				id: 'e-input-model',
				source: 'input-1',
				target: 'model-1',
				animated: true
			});
		}

		yPosition += spacing;

		// Create assertion nodes
		if (spec.assertions) {
			spec.assertions.forEach((assertion, index) => {
				const [type, value] = Object.entries(assertion)[0];
				nodes.push({
					id: `assertion-${index + 1}`,
					type: 'assertion',
					data: {
						label: 'Assertion',
						assertionType: type,
						assertionValue: value
					},
					position: { x: xPosition, y: yPosition }
				});

				// Create edge from model to assertion
				edges.push({
					id: `e-model-assertion-${index + 1}`,
					source: 'model-1',
					target: `assertion-${index + 1}`,
					animated: true
				});

				yPosition += spacing;
			});
		}

		return { nodes, edges };
	} catch (error) {
		console.error('Error parsing YAML:', error);
		return { nodes: [], edges: [] };
	}
}
