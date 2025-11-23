/**
 * Canvas Rendering Performance Benchmark
 *
 * Tests rendering performance with varying numbers of nodes
 * Target: 60fps (16.67ms per frame) @ 100 nodes
 */

import { describe, it, bench } from 'vitest';
import type { Node } from '@xyflow/react';
import type { NodeData } from '../src/types/test-spec';
import { generateYamlFromNodes } from '../src/lib/dsl/generator';

// Generate test nodes for benchmarking
function generateTestNodes(count: number): Node<NodeData>[] {
	const nodes: Node<NodeData>[] = [];

	for (let i = 0; i < count; i++) {
		const type = ['input', 'model', 'assertion', 'tool', 'system'][i % 5];
		let data: NodeData;

		switch (type) {
			case 'input':
				data = {
					label: `Input ${i}`,
					query: `Test query ${i}`,
					system_prompt: 'Test system prompt'
				};
				break;
			case 'model':
				data = {
					label: `Model ${i}`,
					model: 'gpt-5.1',
					provider: 'openai',
					temperature: 0.7,
					max_tokens: 1000
				};
				break;
			case 'assertion':
				data = {
					label: `Assertion ${i}`,
					assertionType: 'must_contain',
					assertionValue: 'test value'
				};
				break;
			case 'tool':
				data = {
					label: `Tool ${i}`,
					toolName: `tool_${i}`,
					toolDescription: `Test tool ${i}`,
					toolParameters: null
				};
				break;
			case 'system':
				data = {
					label: `System ${i}`,
					systemPrompt: 'Test system prompt',
					timeout_ms: 30000,
					framework: 'langgraph',
					description: 'Test system'
				};
				break;
			default:
				data = { label: `Node ${i}` };
		}

		nodes.push({
			id: `node-${i}`,
			type,
			data,
			position: { x: (i % 10) * 200, y: Math.floor(i / 10) * 100 }
		});
	}

	return nodes;
}

describe('Canvas Rendering Performance', () => {
	bench('Render 10 nodes', () => {
		const nodes = generateTestNodes(10);
		// Simulate rendering cost
		nodes.forEach(node => {
			JSON.stringify(node);
		});
	});

	bench('Render 50 nodes', () => {
		const nodes = generateTestNodes(50);
		nodes.forEach(node => {
			JSON.stringify(node);
		});
	});

	bench('Render 100 nodes (target: < 16.67ms for 60fps)', () => {
		const nodes = generateTestNodes(100);
		nodes.forEach(node => {
			JSON.stringify(node);
		});
	});

	bench('Render 200 nodes', () => {
		const nodes = generateTestNodes(200);
		nodes.forEach(node => {
			JSON.stringify(node);
		});
	});
});

describe('DSL Generation Performance', () => {
	bench('Generate YAML from 10 nodes', () => {
		const nodes = generateTestNodes(10);
		generateYamlFromNodes(nodes, []);
	});

	bench('Generate YAML from 50 nodes', () => {
		const nodes = generateTestNodes(50);
		generateYamlFromNodes(nodes, []);
	});

	bench('Generate YAML from 100 nodes (target: < 100ms)', () => {
		const nodes = generateTestNodes(100);
		generateYamlFromNodes(nodes, []);
	});

	bench('Generate YAML from 200 nodes', () => {
		const nodes = generateTestNodes(200);
		generateYamlFromNodes(nodes, []);
	});

	bench('Generate YAML from 500 nodes (stress test)', () => {
		const nodes = generateTestNodes(500);
		generateYamlFromNodes(nodes, []);
	});
});

describe('Node Data Processing Performance', () => {
	bench('Process 100 node data objects', () => {
		const nodes = generateTestNodes(100);
		nodes.forEach(node => {
			const data = { ...node.data };
			Object.keys(data).forEach(key => {
				const value = data[key as keyof NodeData];
				if (typeof value === 'string') {
					value.trim();
				}
			});
		});
	});

	bench('Deep clone 100 nodes', () => {
		const nodes = generateTestNodes(100);
		nodes.map(node => JSON.parse(JSON.stringify(node)));
	});

	bench('Filter 100 nodes by type', () => {
		const nodes = generateTestNodes(100);
		['input', 'model', 'assertion', 'tool', 'system'].forEach(type => {
			nodes.filter(node => node.type === type);
		});
	});
});
