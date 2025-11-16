import type { Node, Edge } from '@xyflow/react';
import * as yaml from 'yaml';

// Complete TestSpec interface matching backend schema
export interface ModelConfig {
	temperature?: number;
	max_tokens?: number;
	top_p?: number;
	top_k?: number;
	stop_sequences?: string[];
}

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface InputSpec {
	query?: string;
	messages?: Message[];
	system_prompt?: string;
	context?: Record<string, any>;
}

export interface ToolSpec {
	name: string;
	description?: string;
	parameters?: Record<string, any>;
}

export interface TestSpec {
	// Required fields
	name: string;
	model: string;
	inputs: InputSpec;
	assertions: Array<Record<string, any>>;

	// Optional metadata
	description?: string;
	tags?: string[];

	// Model configuration
	provider?: string;
	seed?: number;
	model_config?: ModelConfig;

	// Tools and frameworks
	tools?: Array<string | ToolSpec>;
	framework?: string;
	framework_config?: Record<string, any>;

	// Execution settings
	timeout_ms?: number;
}

/**
 * Generate YAML test specification from canvas nodes and edges
 */
export function generateYAML(nodes: Node[], _edges: Edge[]): string {
	const spec: Partial<TestSpec> = {
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
					if (!spec.inputs) spec.inputs = {};
					spec.inputs.query = String(node.data.query);
				}
				if (node.data?.system_prompt) {
					if (!spec.inputs) spec.inputs = {};
					spec.inputs.system_prompt = String(node.data.system_prompt);
				}
				if (node.data?.context) {
					if (!spec.inputs) spec.inputs = {};
					spec.inputs.context = node.data.context;
				}
				break;

			case 'model':
				if (node.data?.model) {
					spec.model = String(node.data.model);
				}
				if (node.data?.provider) {
					spec.provider = String(node.data.provider);
				}
				if (node.data?.seed !== undefined) {
					spec.seed = Number(node.data.seed);
				}
				// Handle model_config
				if (node.data?.temperature !== undefined ||
				    node.data?.max_tokens !== undefined ||
				    node.data?.top_p !== undefined) {
					if (!spec.model_config) spec.model_config = {};
					if (node.data.temperature !== undefined) {
						spec.model_config.temperature = Number(node.data.temperature);
					}
					if (node.data.max_tokens !== undefined) {
						spec.model_config.max_tokens = Number(node.data.max_tokens);
					}
					if (node.data.top_p !== undefined) {
						spec.model_config.top_p = Number(node.data.top_p);
					}
				}
				break;

			case 'assertion':
				if (node.data?.assertionType && node.data?.assertionValue !== undefined) {
					const assertion: Record<string, any> = {};
					const value = node.data.assertionValue;
					const assertionType = String(node.data.assertionType);

					// Handle different assertion value types
					if (assertionType === 'must_call_tool' && Array.isArray(value)) {
						assertion[assertionType] = value;
					} else if (['max_latency_ms', 'min_tokens', 'max_tokens'].includes(assertionType)) {
						assertion[assertionType] = Number(value);
					} else {
						assertion[assertionType] = String(value);
					}
					spec.assertions!.push(assertion);
				}
				break;

			case 'tool':
				if (node.data?.toolName) {
					if (!spec.tools) spec.tools = [];
					// Support both string and ToolSpec format
					if (node.data?.toolDescription || node.data?.toolParameters) {
						const toolSpec: ToolSpec = {
							name: String(node.data.toolName),
						};
						if (node.data.toolDescription) {
							toolSpec.description = String(node.data.toolDescription);
						}
						if (node.data.toolParameters) {
							toolSpec.parameters = node.data.toolParameters;
						}
						spec.tools.push(toolSpec);
					} else {
						spec.tools.push(String(node.data.toolName));
					}
				}
				break;

			case 'system':
				if (node.data?.description) {
					spec.description = String(node.data.description);
				}
				if (node.data?.timeout_ms) {
					spec.timeout_ms = Number(node.data.timeout_ms);
				}
				if (node.data?.framework) {
					spec.framework = String(node.data.framework);
				}
				break;
		}
	}

	// Ensure at least one input field exists
	if (!spec.inputs || Object.keys(spec.inputs).length === 0) {
		spec.inputs = { query: 'Enter your query here' };
	}

	// Ensure at least one assertion exists
	if (!spec.assertions || spec.assertions.length === 0) {
		spec.assertions = [{ must_contain: 'result' }];
	}

	// Clean up empty arrays/objects
	if (spec.tools && spec.tools.length === 0) {
		delete spec.tools;
	}

	// Convert to YAML with proper formatting
	const yamlStr = yaml.stringify(spec, {
		indent: 2,
		lineWidth: 0,
		minContentWidth: 0,
	});

	return yamlStr;
}

/**
 * Parse YAML and convert to nodes and edges (for import feature)
 */
export function parseYAMLToNodes(yamlContent: string): { nodes: Node[]; edges: Edge[] } {
	try {
		const spec = yaml.parse(yamlContent) as TestSpec;
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		let yPosition = 100;
		const xPosition = 250;
		const spacing = 180;

		// Create system/metadata node if we have description, timeout, or framework
		if (spec.description || spec.timeout_ms || spec.framework) {
			nodes.push({
				id: 'system-1',
				type: 'system',
				data: {
					label: 'System Config',
					description: spec.description,
					timeout_ms: spec.timeout_ms,
					framework: spec.framework
				},
				position: { x: xPosition, y: yPosition }
			});
			yPosition += spacing;
		}

		// Create input node
		if (spec.inputs) {
			const inputData: any = { label: 'Input' };
			if (spec.inputs.query) inputData.query = spec.inputs.query;
			if (spec.inputs.system_prompt) inputData.system_prompt = spec.inputs.system_prompt;
			if (spec.inputs.context) inputData.context = spec.inputs.context;
			if (spec.inputs.messages) inputData.messages = spec.inputs.messages;

			nodes.push({
				id: 'input-1',
				type: 'input',
				data: inputData,
				position: { x: xPosition, y: yPosition }
			});
			yPosition += spacing;
		}

		// Create model node
		const modelData: any = {
			label: `Model: ${spec.model}`,
			model: spec.model
		};
		if (spec.provider) modelData.provider = spec.provider;
		if (spec.seed !== undefined) modelData.seed = spec.seed;

		// Add model_config fields
		if (spec.model_config) {
			if (spec.model_config.temperature !== undefined) {
				modelData.temperature = spec.model_config.temperature;
			}
			if (spec.model_config.max_tokens !== undefined) {
				modelData.max_tokens = spec.model_config.max_tokens;
			}
			if (spec.model_config.top_p !== undefined) {
				modelData.top_p = spec.model_config.top_p;
			}
		}

		nodes.push({
			id: 'model-1',
			type: 'model',
			data: modelData,
			position: { x: xPosition, y: yPosition }
		});

		// Create edge from input to model
		if (nodes.length > 1 && spec.inputs) {
			edges.push({
				id: 'e-input-model',
				source: 'input-1',
				target: 'model-1',
				animated: true
			});
		}

		yPosition += spacing;

		// Create tool nodes
		if (spec.tools && spec.tools.length > 0) {
			spec.tools.forEach((tool, index) => {
				const toolData: any = { label: 'Tool' };

				if (typeof tool === 'string') {
					toolData.toolName = tool;
				} else {
					toolData.toolName = tool.name;
					if (tool.description) toolData.toolDescription = tool.description;
					if (tool.parameters) toolData.toolParameters = tool.parameters;
				}

				nodes.push({
					id: `tool-${index + 1}`,
					type: 'tool',
					data: toolData,
					position: { x: xPosition + 300, y: yPosition }
				});

				// Connect tool to model
				edges.push({
					id: `e-model-tool-${index + 1}`,
					source: 'model-1',
					target: `tool-${index + 1}`,
					animated: true
				});

				yPosition += spacing / 2; // Smaller spacing for tools
			});

			yPosition += spacing / 2; // Add some space after tools
		}

		// Create assertion nodes
		if (spec.assertions && spec.assertions.length > 0) {
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
		throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
	}
}
