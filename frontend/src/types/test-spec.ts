/**
 * TypeScript types for Sentinel test specifications.
 *
 * These types match the Pydantic models in backend/core/schema.py
 * to ensure type safety across the frontend-backend boundary.
 */

import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// Model Configuration
// ============================================================================

export interface ModelConfig {
	temperature?: number;  // 0.0-2.0
	max_tokens?: number;   // > 0
	top_p?: number;        // 0.0-1.0
	top_k?: number;        // > 0
	stop_sequences?: string[];
}

// ============================================================================
// Tool Specifications
// ============================================================================

export interface ToolParameters {
	[key: string]: unknown;
}

export interface ToolSpec {
	name: string;
	description?: string;
	parameters?: ToolParameters;
}

export type ToolDefinition = string | ToolSpec;

// ============================================================================
// Input Specifications
// ============================================================================

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface InputSpec {
	query?: string;
	messages?: Message[];
	system_prompt?: string;
	context?: Record<string, unknown>;
}

// ============================================================================
// Assertion Types
// ============================================================================

export interface MustContainAssertion {
	must_contain: string;
}

export interface MustNotContainAssertion {
	must_not_contain: string;
}

export interface RegexMatchAssertion {
	regex_match: string;
}

export interface MustCallToolAssertion {
	must_call_tool: string[];
}

export interface OutputTypeAssertion {
	output_type: 'json' | 'text' | 'markdown' | 'code';
}

export interface MaxLatencyAssertion {
	max_latency_ms: number;
}

export interface MinTokensAssertion {
	min_tokens: number;
}

export interface MaxTokensAssertion {
	max_tokens: number;
}

export type Assertion =
	| MustContainAssertion
	| MustNotContainAssertion
	| RegexMatchAssertion
	| MustCallToolAssertion
	| OutputTypeAssertion
	| MaxLatencyAssertion
	| MinTokensAssertion
	| MaxTokensAssertion;

// ============================================================================
// Test Specification
// ============================================================================

export interface TestSpec {
	name: string;
	model: string;
	provider?: string;
	seed?: number;
	inputs: InputSpec;
	model_config?: ModelConfig;
	tools?: ToolDefinition[];
	assertions?: Assertion[];
	tags?: string[];
	description?: string;
	timeout_ms?: number;
	system_prompt?: string;
	framework?: string;
}

// ============================================================================
// Execution Results
// ============================================================================

export interface ToolCall {
	id: string;
	name: string;
	input: Record<string, unknown>;
}

export interface ExecutionResult {
	success: boolean;
	output: string;
	model: string;
	provider: string;
	latency_ms: number;
	tokens_input?: number;
	tokens_output?: number;
	cost_usd?: number;
	tool_calls?: ToolCall[];
	error?: string;
	timestamp: string;
	raw_response?: Record<string, unknown>;
}

export interface AssertionResult {
	assertion_type: string;
	passed: boolean;
	message: string;
	expected?: unknown;
	actual?: unknown;
	details?: Record<string, unknown>;
}

export interface ExecuteResponse {
	result: ExecutionResult;
	assertions: AssertionResult[];
	all_assertions_passed: boolean;
}

// ============================================================================
// Canvas and Storage Types
// ============================================================================

export interface CanvasState {
	nodes: Node[];
	edges: Edge[];
}

export interface TestDefinition {
	id: number;
	name: string;
	description?: string;
	spec: TestSpec;
	spec_yaml?: string;
	canvas_state?: CanvasState;
	provider?: string;
	model?: string;
	created_at?: string;
	updated_at?: string;
	version: number;
}

export interface CreateTestRequest {
	name: string;
	spec: TestSpec;
	spec_yaml?: string;
	canvas_state?: CanvasState;
	description?: string;
}

export interface UpdateTestRequest {
	name?: string;
	spec?: TestSpec;
	spec_yaml?: string;
	canvas_state?: CanvasState;
	description?: string;
}

export interface TestListResponse {
	tests: TestDefinition[];
	total: number;
}

// ============================================================================
// Provider Types
// ============================================================================

export interface ProviderInfo {
	name: string;
	configured: boolean;
	models: string[];
}

export interface ProvidersResponse {
	providers: ProviderInfo[];
}

// ============================================================================
// Node Data Types (for type-safe node creation)
// ============================================================================

export interface InputNodeData extends Record<string, unknown> {
	label: string;
	query?: string;
	system_prompt?: string;
	messages?: Message[];
}

export interface ModelNodeData extends Record<string, unknown> {
	label: string;
	model?: string;
	provider?: string;
	temperature?: number;
	max_tokens?: number;
	top_p?: number;
	seed?: number;
}

export interface AssertionNodeData extends Record<string, unknown> {
	label: string;
	assertionType?: string;
	assertionValue?: string | number | string[];
}

export interface ToolNodeData extends Record<string, unknown> {
	label: string;
	toolName?: string;
	toolDescription?: string;
	toolParameters?: ToolParameters | null;
}

export interface SystemNodeData extends Record<string, unknown> {
	label: string;
	systemPrompt?: string;
	description?: string;
	timeout_ms?: number;
	framework?: string;
}

export type NodeData =
	| InputNodeData
	| ModelNodeData
	| AssertionNodeData
	| ToolNodeData
	| SystemNodeData;
