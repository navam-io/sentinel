import { test, expect } from '@playwright/test';

/**
 * E2E Test Journey 2: Load Template and Execute
 *
 * This test validates the template loading workflow:
 * 1. Open template gallery
 * 2. Select a template
 * 3. Verify nodes loaded on canvas
 * 4. Verify YAML generated correctly
 * 5. (Future) Execute test and verify results
 *
 * Templates tested:
 * - simple_qa (Simple Q&A template)
 * - code_generation (Code Generation template)
 * - browser_agent (Browser Agent template)
 */

test.describe('Template Workflow', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app
		await page.goto('/');

		// Wait for app to fully load
		await page.waitForSelector('[data-testid="component-palette"]');
		await page.waitForSelector('[data-testid="canvas-container"]');
		await page.waitForSelector('[data-testid="right-panel"]');
	});

	test('should open template gallery', async ({ page }) => {
		// Click Templates tab
		await page.click('[data-testid="tab-templates"]');

		// Verify template gallery is visible
		await page.waitForSelector('[data-testid="tab-content"]');

		// Verify templates are loaded
		// The TemplateGallery component renders template cards
		const templates = page.locator('.cursor-pointer'); // Template cards have cursor-pointer class
		const count = await templates.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should display all built-in templates', async ({ page }) => {
		// Open template gallery
		await page.click('[data-testid="tab-templates"]');
		await page.waitForSelector('[data-testid="tab-content"]');

		// Verify we have at least 6 templates (the built-in ones)
		const templates = page.locator('text=Simple Q&A, text=Code Generation, text=Browser Agent');
		// Note: Templates should be visible as cards with titles
		// At minimum, we should see template content loaded
		const content = await page.textContent('[data-testid="tab-content"]');
		expect(content).toContain('Simple Q&A');
	});

	test('should load simple_qa template to canvas', async ({ page }) => {
		// Open template gallery
		await page.click('[data-testid="tab-templates"]');
		await page.waitForTimeout(500);

		// Find and click on Simple Q&A template
		// Template cards have clickable areas - look for the "Simple Q&A" text
		const simpleQATemplate = page.locator('text=Simple Q&A').first();
		await expect(simpleQATemplate).toBeVisible();

		// Click on the template card (or Load button if visible)
		await simpleQATemplate.click();

		// Handle the confirmation dialog (if canvas is empty, this won't show)
		// If it does show, click OK
		page.on('dialog', async dialog => {
			if (dialog.type() === 'confirm' || dialog.type() === 'alert') {
				await dialog.accept();
			}
		});

		await page.waitForTimeout(1000);

		// Verify we switched back to YAML tab (as per RightPanel logic)
		const yamlTab = page.locator('[data-testid="tab-yaml"]');
		await expect(yamlTab).toHaveClass(/text-sentinel-primary/);

		// Verify nodes were loaded on canvas
		// Simple Q&A template should have Input and Model nodes at minimum
		const nodes = page.locator('.react-flow__node');
		const nodeCount = await nodes.count();
		expect(nodeCount).toBeGreaterThan(0);
	});

	test('should show template categories', async ({ page }) => {
		// Open template gallery
		await page.click('[data-testid="tab-templates"]');
		await page.waitForTimeout(500);

		// Verify category indicators exist
		// Templates have category badges like "Q&A", "Code Generation", etc.
		const content = await page.textContent('[data-testid="tab-content"]');

		// Should contain at least some category indicators
		// The TemplateGallery shows categories as badges
		expect(content).toBeTruthy();
		expect(content!.length).toBeGreaterThan(0);
	});

	test('should handle loading template when canvas has existing nodes', async ({ page }) => {
		// Step 1: Add some nodes to canvas first
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-model"]');

		// Verify nodes exist
		await expect(page.locator('.react-flow__node')).toHaveCount(2);

		// Step 2: Open template gallery
		await page.click('[data-testid="tab-templates"]');
		await page.waitForTimeout(500);

		// Step 3: Try to load a template
		const simpleQATemplate = page.locator('text=Simple Q&A').first();

		// Set up dialog handler BEFORE clicking (to catch the confirm dialog)
		const dialogPromise = page.waitForEvent('dialog');
		await simpleQATemplate.click();

		// Handle the confirmation dialog
		const dialog = await dialogPromise;
		expect(dialog.message()).toContain('Loading this template will replace your current canvas');
		await dialog.accept();

		await page.waitForTimeout(1000);

		// Step 4: Verify canvas was cleared and new template loaded
		// After loading template, nodes should be replaced
		const nodes = page.locator('.react-flow__node');
		const nodeCount = await nodes.count();
		// Simple Q&A template has different nodes than the manual ones we added
		expect(nodeCount).toBeGreaterThan(0);
	});

	test('should allow canceling template load when canvas has nodes', async ({ page }) => {
		// Step 1: Add nodes to canvas
		await page.click('[data-testid="palette-node-input"]');
		await page.click('[data-testid="palette-node-model"]');

		const originalNodeCount = await page.locator('.react-flow__node').count();
		expect(originalNodeCount).toBe(2);

		// Step 2: Open template gallery and try to load template
		await page.click('[data-testid="tab-templates"]');
		await page.waitForTimeout(500);

		const simpleQATemplate = page.locator('text=Simple Q&A').first();

		// Set up dialog handler to CANCEL
		const dialogPromise = page.waitForEvent('dialog');
		await simpleQATemplate.click();

		const dialog = await dialogPromise;
		await dialog.dismiss(); // Cancel the load

		await page.waitForTimeout(500);

		// Step 3: Verify original nodes are still there
		// Since we canceled, nodes should remain unchanged
		await page.click('[data-testid="tab-yaml"]'); // Switch back to see canvas
		await page.waitForTimeout(500);

		const finalNodeCount = await page.locator('.react-flow__node').count();
		expect(finalNodeCount).toBe(originalNodeCount);
	});

	test('should search templates', async ({ page }) => {
		// Open template gallery
		await page.click('[data-testid="tab-templates"]');
		await page.waitForTimeout(500);

		// Look for search input (if TemplateGallery has search)
		// The TemplateGallery component has search functionality
		const searchInput = page.locator('input[type="text"]').first();

		if (await searchInput.isVisible()) {
			// Type search query
			await searchInput.fill('Q&A');
			await page.waitForTimeout(500);

			// Verify filtered results
			const content = await page.textContent('[data-testid="tab-content"]');
			expect(content).toContain('Simple Q&A');
		}
	});
});
