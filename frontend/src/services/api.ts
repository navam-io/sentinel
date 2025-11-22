/**
 * API client for Sentinel backend.
 *
 * All types are imported from types/test-spec to ensure
 * consistency with backend schema and eliminate any usage.
 */

import type {
	TestSpec,
	ExecutionResult,
	AssertionResult,
	ExecuteResponse,
	ProviderInfo,
	ProvidersResponse,
	CanvasState,
	TestDefinition,
	CreateTestRequest,
	UpdateTestRequest,
	TestListResponse,
} from '../types/test-spec';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Re-export types for convenience
export type {
	TestSpec,
	ExecutionResult,
	AssertionResult,
	ExecuteResponse,
	ProviderInfo,
	ProvidersResponse,
	CanvasState,
	TestDefinition,
	CreateTestRequest,
	UpdateTestRequest,
	TestListResponse,
};

/**
 * Execute a test specification.
 */
export async function executeTest(testSpec: TestSpec): Promise<ExecuteResponse> {
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
	return data;
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

// Test Storage API Functions

/**
 * Create a new test definition.
 */
export async function createTest(request: CreateTestRequest): Promise<TestDefinition> {
	const response = await fetch(`${API_BASE_URL}/api/tests/create`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to create test');
	}

	return await response.json();
}

/**
 * List all test definitions.
 */
export async function listTests(limit = 100, offset = 0): Promise<TestListResponse> {
	const response = await fetch(
		`${API_BASE_URL}/api/tests/list?limit=${limit}&offset=${offset}`
	);

	if (!response.ok) {
		throw new Error('Failed to fetch tests');
	}

	return await response.json();
}

/**
 * Get a specific test definition by ID.
 */
export async function getTest(testId: number): Promise<TestDefinition> {
	const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to fetch test ${testId}`);
	}

	return await response.json();
}

/**
 * Update a test definition.
 */
export async function updateTest(
	testId: number,
	request: UpdateTestRequest
): Promise<TestDefinition> {
	const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to update test ${testId}`);
	}

	return await response.json();
}

/**
 * Delete a test definition.
 */
export async function deleteTest(testId: number): Promise<{ message: string }> {
	const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to delete test ${testId}`);
	}

	return await response.json();
}
