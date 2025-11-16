import { describe, it, expect } from 'vitest';
import { generateYAML, parseYAMLToNodes, convertYAMLToTestSpec } from './generator';
import type { Node, Edge } from '@xyflow/react';

describe('DSL Generator', () => {
	describe('generateYAML', () => {
		it('should generate valid YAML from empty canvas', () => {
			const nodes: Node[] = [];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('name: Test from Canvas');
			expect(yaml).toContain('model: claude-sonnet-4-5-20250929');
			expect(yaml).toContain('query: Enter your query here');
			expect(yaml).toContain('must_contain: result');
		});

		it('should generate YAML with input node', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'input',
					data: { label: 'Input', query: 'What is AI?' },
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('query: What is AI?');
		});

		it('should generate YAML with model configuration', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'model',
					data: {
						label: 'Model',
						model: 'claude-3-5-sonnet-20241022',
						provider: 'anthropic',
						temperature: 0.7,
						max_tokens: 1000
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('model: claude-3-5-sonnet-20241022');
			expect(yaml).toContain('provider: anthropic');
			expect(yaml).toContain('temperature: 0.7');
			expect(yaml).toContain('max_tokens: 1000');
		});

		it('should generate YAML with assertion nodes', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'assertion',
					data: {
						label: 'Assertion',
						assertionType: 'must_contain',
						assertionValue: 'Paris'
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('must_contain: Paris');
		});

		it('should generate YAML with numeric assertions', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'assertion',
					data: {
						label: 'Assertion',
						assertionType: 'max_latency_ms',
						assertionValue: '2000'
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('max_latency_ms: 2000');
		});

		it('should generate YAML with tool nodes', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'browser'
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('tools:');
			expect(yaml).toContain('- browser');
		});

		it('should generate YAML with multiple tool nodes', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'browser'
					},
					position: { x: 100, y: 100 }
				},
				{
					id: '2',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'calculator'
					},
					position: { x: 100, y: 300 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('tools:');
			expect(yaml).toContain('- browser');
			expect(yaml).toContain('- calculator');
		});

		it('should generate YAML with tool node including description', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'web_search',
						toolDescription: 'Search the web for information',
						toolParameters: null
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('tools:');
			expect(yaml).toContain('name: web_search');
			expect(yaml).toContain('description: Search the web for information');
		});

		it('should generate YAML with tool node with only name (no description, no parameters)', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'calculator',
						toolDescription: '',
						toolParameters: null
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('tools:');
			expect(yaml).toContain('- calculator');
			// Should be simple string format, not object format
			expect(yaml).not.toContain('name: calculator');
		});

		it('should generate YAML with tool node with description and parameters', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'api_call',
						toolDescription: 'Make an API call',
						toolParameters: {
							url: 'string',
							method: 'string'
						}
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('tools:');
			expect(yaml).toContain('name: api_call');
			expect(yaml).toContain('description: Make an API call');
			expect(yaml).toContain('parameters:');
		});

		it('should generate YAML with system node', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'system',
					data: {
						label: 'System',
						description: 'Test description',
						timeout_ms: 5000,
						framework: 'langgraph'
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('description: Test description');
			expect(yaml).toContain('timeout_ms: 5000');
			expect(yaml).toContain('framework: langgraph');
		});

		it('should generate YAML with system node (default values from ComponentPalette)', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'system',
					data: {
						label: 'System',
						systemPrompt: 'You are a helpful AI assistant.',
						description: 'System configuration',
						timeout_ms: 30000,
						framework: 'langgraph'
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('system_prompt: You are a helpful AI assistant.');
			expect(yaml).toContain('description: System configuration');
			expect(yaml).toContain('timeout_ms: 30000');
			expect(yaml).toContain('framework: langgraph');
		});

		it('should generate YAML with tool node (default values from ComponentPalette)', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'tool',
					data: {
						label: 'Tool',
						toolName: 'tool_name'
					},
					position: { x: 100, y: 100 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('tools:');
			expect(yaml).toContain('- tool_name');
		});

		it('should generate complete YAML with all node types', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'input',
					data: { label: 'Input', query: 'What is the capital of France?' },
					position: { x: 100, y: 100 }
				},
				{
					id: '2',
					type: 'model',
					data: {
						label: 'Model',
						model: 'gpt-4',
						provider: 'openai',
						temperature: 0.0,
						max_tokens: 100
					},
					position: { x: 100, y: 300 }
				},
				{
					id: '3',
					type: 'assertion',
					data: {
						label: 'Assertion',
						assertionType: 'must_contain',
						assertionValue: 'Paris'
					},
					position: { x: 100, y: 500 }
				}
			];
			const edges: Edge[] = [];

			const yaml = generateYAML(nodes, edges);

			expect(yaml).toContain('query: What is the capital of France?');
			expect(yaml).toContain('model: gpt-4');  // Model from node data, not default
			expect(yaml).toContain('provider: openai');
			expect(yaml).toContain('temperature: 0');
			expect(yaml).toContain('max_tokens: 100');
			expect(yaml).toContain('must_contain: Paris');
		});
	});

	describe('parseYAMLToNodes', () => {
		it('should parse basic YAML to nodes', () => {
			const yaml = `
name: "Simple Test"
model: "gpt-4"
inputs:
  query: "What is AI?"
assertions:
  - must_contain: "artificial intelligence"
`;

			const { nodes, edges } = parseYAMLToNodes(yaml);

			expect(nodes.length).toBeGreaterThan(0);
			expect(edges.length).toBeGreaterThan(0);

			// Check input node
			const inputNode = nodes.find(n => n.type === 'input');
			expect(inputNode).toBeDefined();
			expect(inputNode?.data.query).toBe('What is AI?');

			// Check model node
			const modelNode = nodes.find(n => n.type === 'model');
			expect(modelNode).toBeDefined();
			expect(modelNode?.data.model).toBe('gpt-4');

			// Check assertion node
			const assertionNode = nodes.find(n => n.type === 'assertion');
			expect(assertionNode).toBeDefined();
			expect(assertionNode?.data.assertionType).toBe('must_contain');
			expect(assertionNode?.data.assertionValue).toBe('artificial intelligence');
		});

		it('should parse YAML with model configuration', () => {
			const yaml = `
name: "Test with Config"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 123
model_config:
  temperature: 0.7
  max_tokens: 1000
  top_p: 0.9
inputs:
  query: "Test query"
assertions:
  - must_contain: "test"
`;

			const { nodes } = parseYAMLToNodes(yaml);

			const modelNode = nodes.find(n => n.type === 'model');
			expect(modelNode).toBeDefined();
			expect(modelNode?.data.model).toBe('claude-3-5-sonnet-20241022');
			expect(modelNode?.data.provider).toBe('anthropic');
			expect(modelNode?.data.seed).toBe(123);
			expect(modelNode?.data.temperature).toBe(0.7);
			expect(modelNode?.data.max_tokens).toBe(1000);
			expect(modelNode?.data.top_p).toBe(0.9);
		});

		it('should parse YAML with tools', () => {
			const yaml = `
name: "Test with Tools"
model: "gpt-4"
tools:
  - browser
  - calculator
inputs:
  query: "Search for laptops"
assertions:
  - must_call_tool: ["browser"]
`;

			const { nodes } = parseYAMLToNodes(yaml);

			const toolNodes = nodes.filter(n => n.type === 'tool');
			expect(toolNodes.length).toBe(2);
			expect(toolNodes[0].data.toolName).toBe('browser');
			expect(toolNodes[1].data.toolName).toBe('calculator');
		});

		it('should parse YAML with system metadata', () => {
			const yaml = `
name: "Test with Metadata"
description: "A test with description"
model: "gpt-4"
timeout_ms: 5000
framework: "langgraph"
inputs:
  query: "Test query"
assertions:
  - must_contain: "test"
`;

			const { nodes } = parseYAMLToNodes(yaml);

			const systemNode = nodes.find(n => n.type === 'system');
			expect(systemNode).toBeDefined();
			expect(systemNode?.data.description).toBe('A test with description');
			expect(systemNode?.data.timeout_ms).toBe(5000);
			expect(systemNode?.data.framework).toBe('langgraph');
		});

		it('should throw error for invalid YAML', () => {
			const invalidYaml = 'invalid: yaml: content:';

			expect(() => parseYAMLToNodes(invalidYaml)).toThrow();
		});

		it('should create edges between nodes', () => {
			const yaml = `
name: "Test with Edges"
model: "gpt-4"
inputs:
  query: "Test query"
assertions:
  - must_contain: "test"
`;

			const { edges } = parseYAMLToNodes(yaml);

			expect(edges.length).toBeGreaterThan(0);

			// Should have edge from input to model
			const inputModelEdge = edges.find(e => e.source === 'input-1' && e.target === 'model-1');
			expect(inputModelEdge).toBeDefined();

			// Should have edge from model to assertion
			const modelAssertionEdge = edges.find(e => e.source === 'model-1' && e.target === 'assertion-1');
			expect(modelAssertionEdge).toBeDefined();
		});
	});

	describe('Round-trip conversion', () => {
		it('should preserve data in round-trip conversion (YAML → Canvas → YAML)', () => {
			const originalYaml = `
name: "Capital Test"
model: "gpt-4"
provider: "openai"
seed: 42
model_config:
  temperature: 0
  max_tokens: 100
inputs:
  query: "What is the capital of France?"
assertions:
  - must_contain: "Paris"
  - must_not_contain: "London"
tags:
  - test
  - qa
`;

			// Parse YAML to nodes
			const { nodes, edges } = parseYAMLToNodes(originalYaml);

			// Generate YAML from nodes
			const regeneratedYaml = generateYAML(nodes, edges);

			// Check that key fields are preserved
			expect(regeneratedYaml).toContain('model: gpt-4');
			expect(regeneratedYaml).toContain('provider: openai');
			expect(regeneratedYaml).toContain('seed: 42');
			expect(regeneratedYaml).toContain('temperature: 0');
			expect(regeneratedYaml).toContain('max_tokens: 100');
			expect(regeneratedYaml).toContain('query: What is the capital of France?');
			expect(regeneratedYaml).toContain('must_contain: Paris');
			expect(regeneratedYaml).toContain('must_not_contain: London');
		});

		it('should handle system prompt in round-trip conversion', () => {
			const originalYaml = `
name: Test with System Prompt
model: gpt-4
provider: openai
inputs:
  query: What is AI?
  system_prompt: You are a helpful AI assistant.
assertions:
  - must_contain: artificial intelligence
timeout_ms: 30000
framework: langgraph
`;

			// Parse YAML to nodes
			const { nodes, edges } = parseYAMLToNodes(originalYaml);

			// Should have a system node
			const systemNode = nodes.find(n => n.type === 'system');
			expect(systemNode).toBeDefined();
			expect(systemNode?.data.systemPrompt).toBe('You are a helpful AI assistant.');

			// Generate YAML from nodes
			const regeneratedYaml = generateYAML(nodes, edges);

			// Check that system_prompt is preserved
			expect(regeneratedYaml).toContain('system_prompt: You are a helpful AI assistant.');
			expect(regeneratedYaml).toContain('timeout_ms: 30000');
			expect(regeneratedYaml).toContain('framework: langgraph');
		});

		it('should always generate inputs with at least a query field', () => {
			// Empty canvas should have default query
			const yaml1 = generateYAML([], []);
			expect(yaml1).toContain('query: Enter your query here');

			// Canvas with only model node should still have default query
			const nodes: Node[] = [
				{
					id: '1',
					type: 'model',
					data: { label: 'Model', model: 'claude-3-5-sonnet-20241022' },
					position: { x: 100, y: 100 }
				}
			];
			const yaml2 = generateYAML(nodes, []);
			expect(yaml2).toContain('query:');

			// Verify the generated YAML can be converted to TestSpec
			const testSpec = convertYAMLToTestSpec(yaml2);
			expect(testSpec.inputs.query).toBeTruthy();
		});

		it('should override default query when input node has custom query', () => {
			const nodes: Node[] = [
				{
					id: '1',
					type: 'input',
					data: { label: 'Input', query: 'Custom query from user' },
					position: { x: 100, y: 100 }
				}
			];

			const yaml = generateYAML(nodes, []);
			expect(yaml).toContain('query: Custom query from user');
			expect(yaml).not.toContain('Enter your query here');
		});
	});
});
