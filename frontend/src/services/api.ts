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
	TestRun,
	TestRunResult,
	RunListResponse,
	ComparisonResult,
	RegressionAnalysis,
	RecordingSession,
	RecordingEvent,
	SmartDetectionResult,
	GeneratedTestResponse,
	RecordingListResponse,
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
	TestRun,
	TestRunResult,
	RunListResponse,
	ComparisonResult,
	RegressionAnalysis,
	RecordingSession,
	RecordingEvent,
	SmartDetectionResult,
	GeneratedTestResponse,
	RecordingListResponse,
};

/**
 * Execute a test specification.
 *
 * @param testSpec - Test specification to execute
 * @param testId - Optional test ID to link the run to a saved test
 * @returns Execution response with results and optional run_id
 */
export async function executeTest(
	testSpec: TestSpec,
	testId?: number
): Promise<ExecuteResponse> {
	const response = await fetch(`${API_BASE_URL}/api/execution/execute`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			test_spec: testSpec,
			test_id: testId,
		}),
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

/**
 * Rename a test definition (convenience method).
 */
export async function renameTest(testId: number, newName: string): Promise<TestDefinition> {
	return updateTest(testId, { name: newName });
}

// Run Management API Functions

/**
 * List all test runs.
 */
export async function listRuns(limit = 100, offset = 0): Promise<RunListResponse> {
	const response = await fetch(
		`${API_BASE_URL}/api/runs/list?limit=${limit}&offset=${offset}`
	);

	if (!response.ok) {
		throw new Error('Failed to fetch runs');
	}

	return await response.json();
}

/**
 * List runs for a specific test.
 */
export async function listRunsForTest(
	testId: number,
	limit = 50,
	offset = 0
): Promise<RunListResponse> {
	const response = await fetch(
		`${API_BASE_URL}/api/runs/test/${testId}?limit=${limit}&offset=${offset}`
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch runs for test ${testId}`);
	}

	return await response.json();
}

/**
 * Get a specific test run.
 */
export async function getRun(runId: number): Promise<TestRun> {
	const response = await fetch(`${API_BASE_URL}/api/runs/${runId}`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to fetch run ${runId}`);
	}

	return await response.json();
}

/**
 * Get assertion results for a run.
 */
export async function getRunResults(runId: number): Promise<TestRunResult[]> {
	const response = await fetch(`${API_BASE_URL}/api/runs/${runId}/results`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to fetch results for run ${runId}`);
	}

	return await response.json();
}

/**
 * Compare two test runs.
 */
export async function compareRuns(
	baselineId: number,
	currentId: number
): Promise<ComparisonResult> {
	const response = await fetch(
		`${API_BASE_URL}/api/runs/compare/${baselineId}/${currentId}`
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to compare runs');
	}

	return await response.json();
}

/**
 * Perform regression analysis between two runs.
 */
export async function analyzeRegression(
	baselineId: number,
	currentId: number,
	options?: {
		latencyThreshold?: number;
		costThreshold?: number;
		tokensThreshold?: number;
	}
): Promise<RegressionAnalysis> {
	const params = new URLSearchParams();
	if (options?.latencyThreshold !== undefined) {
		params.set('latency_threshold', options.latencyThreshold.toString());
	}
	if (options?.costThreshold !== undefined) {
		params.set('cost_threshold', options.costThreshold.toString());
	}
	if (options?.tokensThreshold !== undefined) {
		params.set('tokens_threshold', options.tokensThreshold.toString());
	}

	const queryString = params.toString();
	const url = `${API_BASE_URL}/api/runs/regression/${baselineId}/${currentId}${
		queryString ? `?${queryString}` : ''
	}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to analyze regression');
	}

	return await response.json();
}

// =============================================================================
// Recording API Functions (Record & Replay Feature)
// =============================================================================

/**
 * Start a new recording session.
 */
export async function startRecording(
	name: string,
	description?: string
): Promise<RecordingSession> {
	const response = await fetch(`${API_BASE_URL}/api/recording/start`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name, description }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to start recording');
	}

	return await response.json();
}

/**
 * Stop a recording session.
 */
export async function stopRecording(sessionId: number): Promise<RecordingSession> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}/stop`, {
		method: 'POST',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to stop recording');
	}

	return await response.json();
}

/**
 * Pause a recording session.
 */
export async function pauseRecording(sessionId: number): Promise<RecordingSession> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}/pause`, {
		method: 'POST',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to pause recording');
	}

	return await response.json();
}

/**
 * Resume a paused recording session.
 */
export async function resumeRecording(sessionId: number): Promise<RecordingSession> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}/resume`, {
		method: 'POST',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to resume recording');
	}

	return await response.json();
}

/**
 * Get the currently active recording session.
 */
export async function getActiveRecording(): Promise<RecordingSession | null> {
	const response = await fetch(`${API_BASE_URL}/api/recording/active`);

	if (!response.ok) {
		throw new Error('Failed to check active recording');
	}

	const data = await response.json();
	return data || null;
}

/**
 * Get a recording session by ID.
 */
export async function getRecording(sessionId: number): Promise<RecordingSession> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to fetch recording ${sessionId}`);
	}

	return await response.json();
}

/**
 * Add an event to a recording session.
 */
export async function addRecordingEvent(
	sessionId: number,
	eventType: string,
	data: Record<string, unknown>
): Promise<RecordingEvent> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}/event`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ event_type: eventType, data }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to add recording event');
	}

	return await response.json();
}

/**
 * Get all events for a recording session.
 */
export async function getRecordingEvents(sessionId: number): Promise<RecordingEvent[]> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}/events`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to fetch events for recording ${sessionId}`);
	}

	return await response.json();
}

/**
 * Analyze a recording session for smart detection.
 */
export async function analyzeRecording(sessionId: number): Promise<SmartDetectionResult> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}/analyze`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to analyze recording ${sessionId}`);
	}

	return await response.json();
}

/**
 * Generate a test from a recording session.
 */
export async function generateTestFromRecording(
	sessionId: number,
	options?: {
		testName?: string;
		testDescription?: string;
		includeSuggestions?: boolean;
	}
): Promise<GeneratedTestResponse> {
	const response = await fetch(`${API_BASE_URL}/api/recording/generate-test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			session_id: sessionId,
			test_name: options?.testName,
			test_description: options?.testDescription,
			include_suggestions: options?.includeSuggestions ?? true,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to generate test from recording');
	}

	return await response.json();
}

/**
 * List all recording sessions.
 */
export async function listRecordings(
	limit = 50,
	offset = 0
): Promise<RecordingListResponse> {
	const response = await fetch(
		`${API_BASE_URL}/api/recording/list?limit=${limit}&offset=${offset}`
	);

	if (!response.ok) {
		throw new Error('Failed to fetch recordings');
	}

	return await response.json();
}

/**
 * Delete a recording session.
 */
export async function deleteRecording(sessionId: number): Promise<{ message: string }> {
	const response = await fetch(`${API_BASE_URL}/api/recording/${sessionId}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to delete recording ${sessionId}`);
	}

	return await response.json();
}
