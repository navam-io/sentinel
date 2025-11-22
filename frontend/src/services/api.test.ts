import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	executeTest,
	listProviders,
	checkHealth,
	createTest,
	listTests,
	getTest,
	updateTest,
	deleteTest,
	type TestSpec,
	type CreateTestRequest,
	type UpdateTestRequest,
} from './api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('executeTest', () => {
		it('should execute a test successfully', async () => {
			const testSpec: TestSpec = {
				name: 'Test 1',
				model: 'gpt-5.1',
				inputs: {
					query: 'Hello',
				},
				assertions: [{ must_contain: 'hello' }],
			};

			const mockResponse = {
				result: {
					success: true,
					output: 'Hello there!',
					model: 'gpt-5.1',
					provider: 'openai',
					latency_ms: 500,
					tokens_input: 10,
					tokens_output: 20,
					cost_usd: 0.001,
					timestamp: '2025-11-16T10:00:00Z',
				},
				assertions: [
					{
						assertion_type: 'must_contain',
						passed: true,
						message: "Output contains 'hello'",
					},
				],
				all_assertions_passed: true,
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await executeTest(testSpec);

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledWith(
				'http://localhost:8000/api/execution/execute',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ test_spec: testSpec }),
				}
			);
		});

		it('should throw error on failed execution', async () => {
			const testSpec: TestSpec = {
				name: 'Test 1',
				model: 'gpt-5.1',
				inputs: { query: 'Hello' },
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				json: async () => ({ detail: 'Execution failed' }),
			});

			await expect(executeTest(testSpec)).rejects.toThrow('Execution failed');
		});
	});

	describe('listProviders', () => {
		it('should list providers successfully', async () => {
			const mockProviders = [
				{
					name: 'openai',
					configured: true,
					models: ['gpt-5.1', 'gpt-5-nano'],
				},
				{
					name: 'anthropic',
					configured: true,
					models: ['claude-4.5-sonnet'],
				},
			];

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ providers: mockProviders }),
			});

			const result = await listProviders();

			expect(result).toEqual(mockProviders);
			expect(global.fetch).toHaveBeenCalledWith(
				'http://localhost:8000/api/providers/list'
			);
		});

		it('should throw error when fetch fails', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			await expect(listProviders()).rejects.toThrow('Failed to fetch providers');
		});
	});

	describe('checkHealth', () => {
		it('should return true when backend is healthy', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
			});

			const result = await checkHealth();

			expect(result).toBe(true);
			expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/health');
		});

		it('should return false when backend is down', async () => {
			(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

			const result = await checkHealth();

			expect(result).toBe(false);
		});
	});

	describe('Test Storage API', () => {
		describe('createTest', () => {
			it('should create a test successfully', async () => {
				const request: CreateTestRequest = {
					name: 'My Test',
					spec: {
						model: 'gpt-5.1',
						inputs: { query: 'Test' },
					},
					spec_yaml: 'name: My Test\nmodel: gpt-5.1',
					canvas_state: {
						nodes: [],
						edges: [],
					},
					description: 'Test description',
				};

				const mockResponse = {
					id: 1,
					name: 'My Test',
					description: 'Test description',
					spec: request.spec,
					spec_yaml: request.spec_yaml,
					canvas_state: request.canvas_state,
					provider: 'openai',
					model: 'gpt-5.1',
					created_at: '2025-11-16T10:00:00Z',
					updated_at: '2025-11-16T10:00:00Z',
					version: 1,
				};

				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => mockResponse,
				});

				const result = await createTest(request);

				expect(result).toEqual(mockResponse);
				expect(global.fetch).toHaveBeenCalledWith(
					'http://localhost:8000/api/tests/create',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(request),
					}
				);
			});

			it('should throw error on failed creation', async () => {
				const request: CreateTestRequest = {
					name: 'My Test',
					spec: {},
				};

				(global.fetch as any).mockResolvedValueOnce({
					ok: false,
					json: async () => ({ detail: 'Creation failed' }),
				});

				await expect(createTest(request)).rejects.toThrow('Creation failed');
			});
		});

		describe('listTests', () => {
			it('should list tests with pagination', async () => {
				const mockTests = [
					{
						id: 1,
						name: 'Test 1',
						description: 'First test',
						spec: {},
						version: 1,
					},
					{
						id: 2,
						name: 'Test 2',
						description: 'Second test',
						spec: {},
						version: 1,
					},
				];

				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => ({ tests: mockTests, total: 2 }),
				});

				const result = await listTests(10, 0);

				expect(result.tests).toEqual(mockTests);
				expect(result.total).toBe(2);
				expect(global.fetch).toHaveBeenCalledWith(
					'http://localhost:8000/api/tests/list?limit=10&offset=0'
				);
			});

			it('should use default pagination params', async () => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => ({ tests: [], total: 0 }),
				});

				await listTests();

				expect(global.fetch).toHaveBeenCalledWith(
					'http://localhost:8000/api/tests/list?limit=100&offset=0'
				);
			});

			it('should throw error when fetch fails', async () => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: false,
				});

				await expect(listTests()).rejects.toThrow('Failed to fetch tests');
			});
		});

		describe('getTest', () => {
			it('should get a test by ID', async () => {
				const mockTest = {
					id: 1,
					name: 'Test 1',
					spec: {},
					version: 1,
				};

				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => mockTest,
				});

				const result = await getTest(1);

				expect(result).toEqual(mockTest);
				expect(global.fetch).toHaveBeenCalledWith(
					'http://localhost:8000/api/tests/1'
				);
			});

			it('should throw error when test not found', async () => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: false,
					json: async () => ({ detail: 'Test not found' }),
				});

				await expect(getTest(999)).rejects.toThrow('Test not found');
			});
		});

		describe('updateTest', () => {
			it('should update a test successfully', async () => {
				const request: UpdateTestRequest = {
					name: 'Updated Test',
					spec: { model: 'gpt-5.1' },
				};

				const mockResponse = {
					id: 1,
					name: 'Updated Test',
					spec: request.spec,
					version: 2,
				};

				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => mockResponse,
				});

				const result = await updateTest(1, request);

				expect(result).toEqual(mockResponse);
				expect(global.fetch).toHaveBeenCalledWith(
					'http://localhost:8000/api/tests/1',
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(request),
					}
				);
			});

			it('should throw error when update fails', async () => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: false,
					json: async () => ({ detail: 'Update failed' }),
				});

				await expect(updateTest(1, { name: 'New Name' })).rejects.toThrow(
					'Update failed'
				);
			});
		});

		describe('deleteTest', () => {
			it('should delete a test successfully', async () => {
				const mockResponse = {
					message: 'Test 1 deleted successfully',
				};

				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => mockResponse,
				});

				const result = await deleteTest(1);

				expect(result).toEqual(mockResponse);
				expect(global.fetch).toHaveBeenCalledWith(
					'http://localhost:8000/api/tests/1',
					{
						method: 'DELETE',
					}
				);
			});

			it('should throw error when delete fails', async () => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: false,
					json: async () => ({ detail: 'Delete failed' }),
				});

				await expect(deleteTest(1)).rejects.toThrow('Delete failed');
			});
		});
	});
});
