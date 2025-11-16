/**
 * API client for Sentinel backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TestSpec {
	name: string;
	model: string;
	inputs: {
		query?: string;
		system_prompt?: string;
		messages?: Array<{ role: string; content: string }>;
	};
	model_config?: {
		temperature?: number;
		max_tokens?: number;
		top_p?: number;
		top_k?: number;
		stop_sequences?: string[];
	};
	tools?: Array<string | { name: string; description?: string; parameters?: any }>;
	assertions?: Array<{ [key: string]: any }>;
	tags?: string[];
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
	tool_calls?: Array<{ id: string; name: string; input: any }>;
	error?: string;
	timestamp: string;
	raw_response?: any;
}

export interface ExecuteResponse {
	result: ExecutionResult;
}

export interface ProviderInfo {
	name: string;
	configured: boolean;
	models: string[];
}

export interface ProvidersResponse {
	providers: ProviderInfo[];
}

/**
 * Execute a test specification.
 */
export async function executeTest(testSpec: TestSpec): Promise<ExecutionResult> {
	const response = await fetch(`${API_BASE_URL}/api/execution/execute`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ test_spec: testSpec }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Execution failed');
	}

	const data: ExecuteResponse = await response.json();
	return data.result;
}

/**
 * List all available providers.
 */
export async function listProviders(): Promise<ProviderInfo[]> {
	const response = await fetch(`${API_BASE_URL}/api/providers/list`);

	if (!response.ok) {
		throw new Error('Failed to fetch providers');
	}

	const data: ProvidersResponse = await response.json();
	return data.providers;
}

/**
 * Check if backend is healthy.
 */
export async function checkHealth(): Promise<boolean> {
	try {
		const response = await fetch(`${API_BASE_URL}/health`);
		return response.ok;
	} catch {
		return false;
	}
}
