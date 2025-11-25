import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	saveTestFile,
	listTestFiles,
	loadTestFile,
	updateTestFile,
	deleteTestFile,
	renameTestFile,
	testFileExists,
} from './testFiles';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('testFiles service', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('saveTestFile', () => {
		it('saves a test file successfully', async () => {
			const mockResponse = {
				filename: 'my-test',
				name: 'My Test',
				description: 'Test description',
				category: 'qa',
				provider: 'anthropic',
				model: 'claude-sonnet-4-5-20250929',
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await saveTestFile('name: My Test\nmodel: gpt-5.1');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tests/files'),
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				})
			);
			expect(result.filename).toBe('my-test');
			expect(result.name).toBe('My Test');
		});

		it('throws error on failure', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ detail: 'Invalid YAML' }),
			});

			await expect(saveTestFile('invalid yaml')).rejects.toThrow('Invalid YAML');
		});
	});

	describe('listTestFiles', () => {
		it('lists all test files', async () => {
			const mockResponse = {
				tests: [
					{ filename: 'test-1', name: 'Test 1' },
					{ filename: 'test-2', name: 'Test 2' },
				],
				total: 2,
				path: '/path/to/tests',
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await listTestFiles();

			expect(result.tests).toHaveLength(2);
			expect(result.total).toBe(2);
			expect(result.path).toBe('/path/to/tests');
		});

		it('throws error on failure', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
			});

			await expect(listTestFiles()).rejects.toThrow('Failed to fetch test files');
		});
	});

	describe('loadTestFile', () => {
		it('loads a test file by filename', async () => {
			const mockResponse = {
				filename: 'my-test',
				yaml_content: 'name: My Test\nmodel: gpt-5.1',
				name: 'My Test',
				description: 'Test description',
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await loadTestFile('my-test');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tests/files/my-test')
			);
			expect(result.filename).toBe('my-test');
			expect(result.yaml_content).toContain('name: My Test');
		});

		it('normalizes filename with .yaml extension', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ filename: 'my-test' }),
			});

			await loadTestFile('my-test.yaml');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tests/files/my-test')
			);
		});

		it('throws error when file not found', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ detail: 'Test file not found: nonexistent' }),
			});

			await expect(loadTestFile('nonexistent')).rejects.toThrow(
				'Test file not found: nonexistent'
			);
		});
	});

	describe('updateTestFile', () => {
		it('updates an existing test file', async () => {
			const mockResponse = {
				filename: 'my-test',
				name: 'Updated Test',
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await updateTestFile('my-test', 'name: Updated Test\n');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tests/files/my-test'),
				expect.objectContaining({ method: 'PUT' })
			);
			expect(result.name).toBe('Updated Test');
		});

		it('throws error when file not found', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ detail: 'File not found' }),
			});

			await expect(updateTestFile('nonexistent', 'content')).rejects.toThrow(
				'File not found'
			);
		});
	});

	describe('deleteTestFile', () => {
		it('deletes a test file', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ message: 'Deleted' }),
			});

			const result = await deleteTestFile('my-test');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tests/files/my-test'),
				expect.objectContaining({ method: 'DELETE' })
			);
			expect(result.message).toBe('Deleted');
		});

		it('throws error when file not found', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ detail: 'Not found' }),
			});

			await expect(deleteTestFile('nonexistent')).rejects.toThrow('Not found');
		});
	});

	describe('renameTestFile', () => {
		it('renames a test file', async () => {
			const mockResponse = {
				filename: 'new-name',
				name: 'New Name',
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await renameTestFile('old-name', 'New Name');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tests/files/old-name/rename'),
				expect.objectContaining({ method: 'POST' })
			);
			expect(result.filename).toBe('new-name');
		});
	});

	describe('testFileExists', () => {
		it('returns true when file exists', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ exists: true }),
			});

			const result = await testFileExists('my-test');

			expect(result).toBe(true);
		});

		it('returns false when file does not exist', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ exists: false }),
			});

			const result = await testFileExists('nonexistent');

			expect(result).toBe(false);
		});

		it('returns false on API error', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
			});

			const result = await testFileExists('error-case');

			expect(result).toBe(false);
		});
	});
});
