/**
 * Test Files Service
 *
 * Manages test files stored as YAML in artifacts/tests/.
 * Part of Feature 11 Phase 4: File-Based Storage
 */

import type {
	TestFileInfo,
	TestFileListResponse,
	TestFileContent,
} from '../types/test-spec';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Re-export types for convenience
export type { TestFileInfo, TestFileListResponse, TestFileContent };

/**
 * Save a test as a YAML file.
 *
 * @param yamlContent - YAML content to save
 * @param filename - Optional filename (generated if not provided)
 * @param name - Optional test name for filename generation
 * @returns Saved test file info
 */
export async function saveTestFile(
	yamlContent: string,
	filename?: string,
	name?: string
): Promise<TestFileInfo> {
	const response = await fetch(`${API_BASE_URL}/api/tests/files`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			yaml_content: yamlContent,
			filename,
			name,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || 'Failed to save test file');
	}

	return await response.json();
}

/**
 * List all test files.
 *
 * @returns List of test files with metadata
 */
export async function listTestFiles(): Promise<TestFileListResponse> {
	const response = await fetch(`${API_BASE_URL}/api/tests/files`);

	if (!response.ok) {
		throw new Error('Failed to fetch test files');
	}

	return await response.json();
}

/**
 * Load a test file by filename.
 *
 * @param filename - Filename (with or without .yaml extension)
 * @returns Test file content and metadata
 */
export async function loadTestFile(filename: string): Promise<TestFileContent> {
	const normalizedFilename = filename.replace('.yaml', '').replace('.yml', '');
	const response = await fetch(`${API_BASE_URL}/api/tests/files/${normalizedFilename}`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to load test file: ${filename}`);
	}

	return await response.json();
}

/**
 * Update an existing test file.
 *
 * @param filename - Filename to update
 * @param yamlContent - Updated YAML content
 * @returns Updated test file info
 */
export async function updateTestFile(
	filename: string,
	yamlContent: string
): Promise<TestFileInfo> {
	const normalizedFilename = filename.replace('.yaml', '').replace('.yml', '');
	const response = await fetch(`${API_BASE_URL}/api/tests/files/${normalizedFilename}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			yaml_content: yamlContent,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to update test file: ${filename}`);
	}

	return await response.json();
}

/**
 * Delete a test file.
 *
 * @param filename - Filename to delete
 * @returns Success message
 */
export async function deleteTestFile(filename: string): Promise<{ message: string }> {
	const normalizedFilename = filename.replace('.yaml', '').replace('.yml', '');
	const response = await fetch(`${API_BASE_URL}/api/tests/files/${normalizedFilename}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to delete test file: ${filename}`);
	}

	return await response.json();
}

/**
 * Rename a test file.
 *
 * @param filename - Current filename
 * @param newName - New test name
 * @returns Updated test file info with new filename
 */
export async function renameTestFile(
	filename: string,
	newName: string
): Promise<TestFileInfo> {
	const normalizedFilename = filename.replace('.yaml', '').replace('.yml', '');
	const response = await fetch(`${API_BASE_URL}/api/tests/files/${normalizedFilename}/rename`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			new_name: newName,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || `Failed to rename test file: ${filename}`);
	}

	return await response.json();
}

/**
 * Check if a test file exists.
 *
 * @param filename - Filename to check
 * @returns Boolean indicating existence
 */
export async function testFileExists(filename: string): Promise<boolean> {
	const normalizedFilename = filename.replace('.yaml', '').replace('.yml', '');
	const response = await fetch(`${API_BASE_URL}/api/tests/files/${normalizedFilename}/exists`);

	if (!response.ok) {
		return false;
	}

	const result = await response.json();
	return result.exists;
}
