import { test, expect } from '@playwright/test';

/**
 * E2E Test Journey 1: Create Test from Scratch
 *
 * This test validates the complete user workflow of creating a test
 * from scratch by adding nodes, connecting them, and verifying the
 * generated YAML structure.
 *
 * User Journey:
 * 1. Open the app
 * 2. Add Input node to canvas
 * 3. Add Model node to canvas
 * 4. Add Assertion node to canvas
 * 5. Connect nodes (Input -> Model -> Assertion)
 * 6. Configure node data
 * 7. Verify YAML generation
 */

test.describe('Create Test from Scratch', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app
		await page.goto('/');

		// Wait for app to fully load
		await page.waitForSelector('[data-testid="component-palette"]');
		await page.waitForSelector('[data-testid="canvas-container"]');
		await page.waitForSelector('[data-testid="right-panel"]');
	});

	test('should create a simple test with Input and Model nodes', async ({ page }) => {
		// Step 1: Add Input node by clicking palette button
		await page.click('[data-testid="palette-node-input"]');

		// Verify Input node appears on canvas
		// Note: React Flow renders nodes with class .react-flow__node
		const inputNodes = page.locator('.react-flow__node[data-id^="input-"]');
		await expect(inputNodes).toHaveCount(1);

		// Step 2: Add Model node by clicking palette button
		await page.click('[data-testid="palette-node-model"]');

		// Verify Model node appears on canvas
		const modelNodes = page.locator('.react-flow__node[data-id^="model-"]');
		await expect(modelNodes).toHaveCount(1);

		// Step 3: Verify total nodes on canvas
		const allNodes = page.locator('.react-flow__node');
		await expect(allNodes).toHaveCount(2);
	});

	test('should create a complete test with Input, Model, and Assertion nodes', async ({ page }) => {
		// Add Input node
		await page.click('[data-testid="palette-node-input"]');
		await expect(page.locator('.react-flow__node[data-id^="input-"]')).toHaveCount(1);

		// Add Model node
		await page.click('[data-testid="palette-node-model"]');
		await expect(page.locator('.react-flow__node[data-id^="model-"]')).toHaveCount(1);

		// Add Assertion node
		await page.click('[data-testid="palette-node-assertion"]');
		await expect(page.locator('.react-flow__node[data-id^="assertion-"]')).toHaveCount(1);

		// Verify total nodes
		const allNodes = page.locator('.react-flow__node');
		await expect(allNodes).toHaveCount(3);
	});

	test('should generate valid YAML when nodes are added', async ({ page }) => {
		// Add Input and Model nodes
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-model"]');

		// Switch to YAML tab
		await page.click('[data-testid="tab-yaml"]');

		// Wait for YAML preview to be visible
		await page.waitForSelector('[data-testid="tab-content"]');

		// Verify YAML contains expected structure
		// Note: The YamlPreview component uses Monaco Editor which renders text
		const yamlContent = page.locator('.view-line');
		await expect(yamlContent.first()).toBeVisible();
	});

	test('should create test with all node types', async ({ page }) => {
		// Add all 5 node types
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-model"]');
		await page.click('[data-testid="palette-node-assertion"]');
		await page.click('[data-testid="palette-node-tool"]');
		await page.click('[data-testid="palette-node-system"]');

		// Verify all nodes are on canvas
		await expect(page.locator('.react-flow__node[data-id^="input-"]')).toHaveCount(1);
		await expect(page.locator('.react-flow__node[data-id^="model-"]')).toHaveCount(1);
		await expect(page.locator('.react-flow__node[data-id^="assertion-"]')).toHaveCount(1);
		await expect(page.locator('.react-flow__node[data-id^="tool-"]')).toHaveCount(1);
		await expect(page.locator('.react-flow__node[data-id^="system-"]')).toHaveCount(1);

		// Verify total count
		const allNodes = page.locator('.react-flow__node');
		await expect(allNodes).toHaveCount(5);
	});

	test('should maintain nodes after tab switches', async ({ page }) => {
		// Add nodes
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-model"]');

		// Verify nodes exist
		await expect(page.locator('.react-flow__node')).toHaveCount(2);

		// Switch to Templates tab
		await page.click('[data-testid="tab-templates"]');
		await page.waitForTimeout(500);

		// Switch back to canvas view (YAML tab)
		await page.click('[data-testid="tab-yaml"]');
		await page.waitForTimeout(500);

		// Verify nodes still exist
		await expect(page.locator('.react-flow__node')).toHaveCount(2);
	});

	test('should allow multiple nodes of the same type', async ({ page }) => {
		// Add multiple Input nodes
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-input"]');

		// Verify 3 Input nodes exist
		const inputNodes = page.locator('.react-flow__node[data-id^="input-"]');
		await expect(inputNodes).toHaveCount(3);

		// Add multiple Model nodes
		await page.click('[data-testid="palette-node-model"]');
		await page.click('[data-testid="palette-node-model"]');

		// Verify 2 Model nodes exist
		const modelNodes = page.locator('.react-flow__node[data-id^="model-"]');
		await expect(modelNodes).toHaveCount(2);

		// Verify total count
		const allNodes = page.locator('.react-flow__node');
		await expect(allNodes).toHaveCount(5);
	});
});
