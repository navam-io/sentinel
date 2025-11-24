import { useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { FileCode, FolderOpen, Library as LibraryIcon, ChevronRight } from 'lucide-react';
import TestTab from './yaml/TestTab';
import { Library } from './library/Library';
import { TestSuiteOrganizer } from './suites';
import type { TestSuite, TestSuiteItem } from './suites';
import { useTemplates } from '../hooks/useTemplates';
import { useCanvasStore } from '../stores/canvasStore';
import { useTestStore } from '../stores/testStore';
import { useSettingsStore } from '../stores/settingsStore';
import { parseYAMLToNodes } from '../lib/dsl/generator';
import { listTests, getTest, executeTest, deleteTest, updateTest, type TestDefinition } from '../services/api';
import { loadSuites, saveSuites } from '../services/suiteStorage';
import { convertYAMLToTestSpec } from '../lib/dsl/generator';
import type { Template } from './templates/TemplateCard';
import type { TestCategory } from '../types/test-spec';

type Tab = 'test' | 'suite' | 'library';

function RightPanel() {
	const [activeTab, setActiveTab] = useState<Tab>('test');
	const [suites, setSuites] = useState<TestSuite[]>(() => loadSuites());
	const [savedTests, setSavedTests] = useState<TestDefinition[]>([]);
	const [loadingTests, setLoadingTests] = useState(false);
	const { templates, loading: templatesLoading } = useTemplates();
	const { nodes, setNodes, setEdges, organizeNodes } = useCanvasStore();
	const { setCurrentTest, newTest } = useTestStore();
	const { showRightPanel, setShowRightPanel } = useSettingsStore();

	// Auto-save suites to localStorage whenever they change
	useEffect(() => {
		saveSuites(suites);
	}, [suites]);

	/**
	 * Robust canvas loading function that properly clears and loads nodes/edges.
	 * This ensures old canvas state is fully cleared before loading new content.
	 *
	 * CRITICAL: Uses explicit clearing pattern to prevent state merging issues.
	 *
	 * @param parsedNodes - New nodes to load
	 * @param parsedEdges - New edges to load
	 * @param options - Loading options (testInfo, confirmClear, successMessage)
	 */
	const loadToCanvas = (
		parsedNodes: Node[],
		parsedEdges: Edge[],
		options?: {
			testInfo?: {
				id?: number;
				name: string;
				description: string;
				category?: TestCategory | null;
				isTemplate?: boolean;
			} | null;
			confirmClear?: boolean;
			successMessage?: string;
			switchToTest?: boolean;
		}
	) => {
		try {
			// Confirm if there are existing nodes on canvas (if requested)
			if (options?.confirmClear && nodes.length > 0) {
				const confirmed = window.confirm(
					`Loading this will replace your current canvas. Continue?`
				);
				if (!confirmed) {
					return false;
				}
			}

			if (parsedNodes.length === 0) {
				alert('Failed to load content. No nodes found.');
				return false;
			}

			// CRITICAL FIX: Explicitly clear canvas first, then load new content
			// This prevents React from merging or partially updating state
			console.log(`[Canvas Load] Current nodes before clear: ${nodes.length}`);
			console.log(`[Canvas Load] New nodes to load: ${parsedNodes.length}`);

			// Step 1: Clear everything
			setNodes([]);
			setEdges([]);
			console.log('[Canvas Load] Canvas cleared (setNodes/setEdges to [])');

			// Step 2: Use requestAnimationFrame to ensure clear is processed
			// before loading new content (gives React time to flush updates)
			requestAnimationFrame(() => {
				console.log('[Canvas Load] requestAnimationFrame callback - loading new content');

				// Now set the new nodes and edges
				setNodes(parsedNodes);
				setEdges(parsedEdges);
				console.log(`[Canvas Load] New content loaded: ${parsedNodes.length} nodes, ${parsedEdges.length} edges`);

				// Apply auto-layout after loading
				// Use another requestAnimationFrame to ensure nodes are rendered before organizing
				requestAnimationFrame(() => {
					console.log('[Canvas Load] Applying auto-layout');
					organizeNodes();
				});

				// Update test store with test info
				if (options?.testInfo !== undefined) {
					if (options.testInfo === null) {
						// Loading a template - create new unsaved test
						newTest('Untitled Test', '');
					} else {
						// Loading a saved test or template
						setCurrentTest({
							id: options.testInfo.id ?? null,
							filename: null, // Will be set when file-based storage is implemented
							name: options.testInfo.name,
							description: options.testInfo.description,
							category: options.testInfo.category ?? null,
							isTemplate: options.testInfo.isTemplate ?? false,
							isDirty: false,
							lastSaved: options.testInfo.id ? new Date() : null,
						});
					}
				}

				// Switch to Test tab if requested
				if (options?.switchToTest) {
					setActiveTab('test');
				}

				// Show success message if provided
				if (options?.successMessage) {
					setTimeout(() => alert(options.successMessage), 100);
				}
			});

			return true;
		} catch (err) {
			alert(`Error loading to canvas: ${err instanceof Error ? err.message : String(err)}`);
			return false;
		}
	};

	const handleLoadTemplate = (template: Template) => {
		try {
			console.log(`[Template Loading] Starting load for: ${template.name}`);
			console.log('[Template Loading] YAML content:', template.yamlContent);

			// Parse the template YAML
			const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(template.yamlContent);

			console.log(`[Template Loading] Parsed ${parsedNodes.length} nodes and ${parsedEdges.length} edges`);
			console.log('[Template Loading] Parsed nodes:', parsedNodes);

			if (parsedNodes.length === 0) {
				console.error('[Template Loading] ERROR: No nodes parsed from template');
				alert(`Failed to load template "${template.name}". No nodes were generated from the YAML.`);
				return;
			}

			// Load to canvas with confirmation
			loadToCanvas(parsedNodes, parsedEdges, {
				testInfo: {
					name: template.name,
					description: template.description || '',
					category: template.category as TestCategory | undefined,
					isTemplate: true,
				},
				confirmClear: true,
				successMessage: `Successfully loaded template: ${template.name}`,
				switchToTest: true,
			});
		} catch (err) {
			console.error('[Template Loading] ERROR:', err);
			alert(`Error loading template "${template.name}": ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	// Load saved tests from backend
	useEffect(() => {
		const loadSavedTests = async () => {
			setLoadingTests(true);
			try {
				const response = await listTests(100, 0);
				setSavedTests(response.tests);
			} catch (err) {
				console.error('Failed to load saved tests:', err);
			} finally {
				setLoadingTests(false);
			}
		};

		// Load tests when Suite or Library tab is active
		if (activeTab === 'suite' || activeTab === 'library') {
			loadSavedTests();
		}
	}, [activeTab]);

	// Test Suite handlers
	const handleCreateSuite = (name: string, description?: string) => {
		const newSuite: TestSuite = {
			id: `suite-${Date.now()}`,
			name,
			description,
			tests: [],
			isExpanded: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		setSuites([...suites, newSuite]);
	};

	const handleRenameSuite = (id: string, newName: string) => {
		setSuites(
			suites.map((suite) =>
				suite.id === id
					? { ...suite, name: newName, updatedAt: new Date() }
					: suite
			)
		);
	};

	const handleDeleteSuite = (id: string) => {
		setSuites(suites.filter((suite) => suite.id !== id));
	};

	const handleToggleSuite = (id: string) => {
		setSuites(
			suites.map((suite) =>
				suite.id === id ? { ...suite, isExpanded: !suite.isExpanded } : suite
			)
		);
	};

	const handleRunSuite = async (id: string) => {
		const suite = suites.find((s) => s.id === id);
		if (!suite || suite.tests.length === 0) {
			alert('No tests to run in this suite');
			return;
		}

		// Run all tests in the suite sequentially
		for (const test of suite.tests) {
			await handleRunTest(id, test.id);
		}

		alert(`Completed running all ${suite.tests.length} tests in suite: ${suite.name}`);
	};

	const handleExportSuite = (id: string) => {
		const suite = suites.find((s) => s.id === id);
		if (suite) {
			alert(`Exporting suite: ${suite.name}`);
			// TODO: Implement actual suite export
		}
	};

	const handleLoadTest = async (testId: string) => {
		try {
			const testIdNum = parseInt(testId);

			// Check if it's a template (negative IDs)
			if (testIdNum < 0) {
				const templateIndex = -testIdNum - 1000;
				const template = templates[templateIndex];

				if (template && template.yamlContent) {
					// Parse template YAML
					const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(template.yamlContent);

					// Load to canvas using robust loading function
					loadToCanvas(parsedNodes, parsedEdges, {
						testInfo: {
							name: template.name,
							description: template.description || '',
							category: template.category as TestCategory | undefined,
							isTemplate: true,
						},
						confirmClear: nodes.length > 0, // Only confirm if canvas has content
						successMessage: `Loaded template: ${template.name}`,
						switchToTest: true,
					});
					return;
				}
			}

			// Check if it's a saved test (positive IDs)
			const savedTest = savedTests.find((t) => t.id === testIdNum);
			if (savedTest) {
				// Determine nodes and edges from saved test
				let parsedNodes: Node[] = [];
				let parsedEdges: Edge[] = [];

				if (savedTest.canvas_state && savedTest.canvas_state.nodes && savedTest.canvas_state.edges) {
					parsedNodes = savedTest.canvas_state.nodes;
					parsedEdges = savedTest.canvas_state.edges;
				} else if (savedTest.spec_yaml) {
					const parsed = parseYAMLToNodes(savedTest.spec_yaml);
					parsedNodes = parsed.nodes;
					parsedEdges = parsed.edges;
				}

				// Load to canvas using robust loading function
				loadToCanvas(parsedNodes, parsedEdges, {
					testInfo: {
						id: savedTest.id,
						name: savedTest.name,
						description: savedTest.description || '',
						category: savedTest.category,
					},
					confirmClear: nodes.length > 0, // Only confirm if canvas has content
					switchToTest: true,
				});
				return;
			}

			// Fallback: try to fetch from API
			const test = await getTest(testIdNum);

			let parsedNodes: Node[] = [];
			let parsedEdges: Edge[] = [];

			if (test.canvas_state && test.canvas_state.nodes && test.canvas_state.edges) {
				parsedNodes = test.canvas_state.nodes;
				parsedEdges = test.canvas_state.edges;
			} else if (test.spec_yaml) {
				const parsed = parseYAMLToNodes(test.spec_yaml);
				parsedNodes = parsed.nodes;
				parsedEdges = parsed.edges;
			}

			// Load to canvas using robust loading function
			loadToCanvas(parsedNodes, parsedEdges, {
				testInfo: {
					id: test.id,
					name: test.name,
					description: test.description || '',
					category: test.category,
				},
				confirmClear: nodes.length > 0, // Only confirm if canvas has content
				switchToTest: true,
			});
		} catch (err) {
			alert(`Failed to load test: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const handleRunTest = async (suiteId: string, testId: string) => {
		try {
			// Fetch the full test definition
			const testIdNum = parseInt(testId);
			const test = await getTest(testIdNum);

			// Execute the test using its spec
			let testSpec;
			if (test.spec) {
				testSpec = test.spec;
			} else if (test.spec_yaml) {
				testSpec = convertYAMLToTestSpec(test.spec_yaml);
			} else {
				throw new Error('Test has no specification');
			}

			const result = await executeTest(testSpec);

			// Update test status in suite based on result
			const status = result.all_assertions_passed ? 'passed' : 'failed';
			setSuites(
				suites.map((suite) =>
					suite.id === suiteId
						? {
								...suite,
								tests: suite.tests.map((t) =>
									t.id === testId
										? { ...t, status, lastRun: new Date() }
										: t
								),
								updatedAt: new Date(),
						  }
						: suite
				)
			);

			// Show result notification
			const message = result.all_assertions_passed
				? `✅ Test "${test.name}" passed!`
				: `❌ Test "${test.name}" failed`;
			alert(message);
		} catch (err) {
			// Update test status to failed on error
			setSuites(
				suites.map((suite) =>
					suite.id === suiteId
						? {
								...suite,
								tests: suite.tests.map((t) =>
									t.id === testId
										? { ...t, status: 'failed' as const, lastRun: new Date() }
										: t
								),
								updatedAt: new Date(),
						  }
						: suite
				)
			);

			alert(`Failed to run test: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const handleAddTestToSuite = (suiteId: string, testId: string) => {
		const testIdNum = parseInt(testId);

		// Find the test from saved tests
		const test = savedTests.find((t) => t.id === testIdNum);

		if (!test) {
			alert('Test not found');
			return;
		}

		// Convert TestDefinition to TestSuiteItem
		const testItem: TestSuiteItem = {
			id: test.id.toString(),
			name: test.name,
			status: 'pending', // Default status
			lastRun: undefined,
		};

		// Add test to suite
		setSuites(
			suites.map((suite) =>
				suite.id === suiteId
					? {
							...suite,
							tests: [...suite.tests, testItem],
							updatedAt: new Date(),
					  }
					: suite
			)
		);
	};

	const handleRemoveTestFromSuite = (suiteId: string, testId: string) => {
		setSuites(
			suites.map((suite) =>
				suite.id === suiteId
					? {
							...suite,
							tests: suite.tests.filter((test) => test.id !== testId),
							updatedAt: new Date(),
					  }
					: suite
			)
		);
	};

	const handleAddTestToSuiteById = (testId: number, suiteId: string) => {
		handleAddTestToSuite(suiteId, testId.toString());
	};

	const handleRunTestById = async (testId: number) => {
		try {
			const test = await getTest(testId);

			let testSpec;
			if (test.spec) {
				testSpec = test.spec;
			} else if (test.spec_yaml) {
				testSpec = convertYAMLToTestSpec(test.spec_yaml);
			} else {
				throw new Error('Test has no specification');
			}

			const result = await executeTest(testSpec);

			const message = result.all_assertions_passed
				? `✅ Test "${test.name}" passed!`
				: `❌ Test "${test.name}" failed`;
			alert(message);
		} catch (err) {
			alert(`Failed to run test: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const handleDeleteTestById = async (testId: number) => {
		try {
			await deleteTest(testId);
			// Refresh the tests list
			const response = await listTests(100, 0);
			setSavedTests(response.tests);
		} catch (err) {
			alert(`Failed to delete test: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const refreshTests = async () => {
		setLoadingTests(true);
		try {
			const response = await listTests(100, 0);
			setSavedTests(response.tests);
		} catch (err) {
			console.error('Failed to load tests:', err);
		} finally {
			setLoadingTests(false);
		}
	};

	const handleRenameTest = async (testId: number, newName: string, newDescription: string, category?: TestDefinition['category']) => {
		try {
			const updates: any = { name: newName, description: newDescription };
			if (category !== undefined) {
				updates.category = category;
			}
			await updateTest(testId, updates);
			await refreshTests();
		} catch (err) {
			alert(`Failed to rename test: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	return (
		<div
			className="flex flex-col h-full bg-sentinel-bg-elevated border-l border-sentinel-border flex-shrink-0 transition-all duration-300 ease-in-out"
			style={{ width: showRightPanel ? '24rem' : '0', overflow: 'hidden' }}
			data-testid="right-panel"
		>
			{/* Tab Navigation */}
			<div className="flex border-b border-sentinel-border bg-sentinel-bg">
				<button
					onClick={() => setShowRightPanel(false)}
					className="px-2 py-3 hover:bg-sentinel-hover transition-colors"
					title="Collapse panel"
					data-testid="collapse-right-panel"
				>
					<ChevronRight size={16} className="text-sentinel-text-muted" />
				</button>
				<button
					data-testid="tab-test"
					onClick={() => setActiveTab('test')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'test'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<FileCode size={16} strokeWidth={2} />
					<span>Test</span>
				</button>

				<button
					data-testid="tab-suite"
					onClick={() => setActiveTab('suite')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'suite'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<FolderOpen size={16} strokeWidth={2} />
					<span>Suite</span>
				</button>

				<button
					data-testid="tab-library"
					onClick={() => setActiveTab('library')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'library'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<LibraryIcon size={16} strokeWidth={2} />
					<span>Library</span>
				</button>
			</div>

			{/* Tab Content */}
			<div className="flex-1 overflow-hidden" data-testid="tab-content">
				{activeTab === 'test' && <TestTab />}
				{activeTab === 'suite' && (
					<div className="h-full overflow-y-auto">
						<div className="p-4">
							<TestSuiteOrganizer
								suites={suites}
								availableTests={savedTests}
								loadingTests={loadingTests}
								onCreateSuite={handleCreateSuite}
								onRenameSuite={handleRenameSuite}
								onDeleteSuite={handleDeleteSuite}
								onAddTestToSuite={handleAddTestToSuite}
								onRemoveTestFromSuite={handleRemoveTestFromSuite}
								onRunSuite={handleRunSuite}
								onRunTest={handleRunTest}
								onExportSuite={handleExportSuite}
								onLoadTest={handleLoadTest}
								onToggleSuite={handleToggleSuite}
							/>
						</div>
					</div>
				)}
				{activeTab === 'library' && (
					<Library
						tests={savedTests}
						templates={templates.map((template, index) => ({
							id: -(index + 1000), // Use negative IDs for templates to avoid conflicts
							name: template.name,
							description: template.description,
							category: template.category as TestDefinition['category'],
							is_template: true,
							spec: { name: template.name, provider: template.provider, model: template.model, inputs: {}, assertions: [] },
							spec_yaml: template.yamlContent,
							provider: template.provider,
							model: template.model,
							version: 1,
							// Store original template ID for reference
							...(template as any).originalId !== undefined ? { originalId: template.id } : {},
						}))}
						loading={loadingTests || templatesLoading}
						suites={suites.map((s) => ({ id: s.id, name: s.name, tests: s.tests }))}
						onLoadTest={(testId) => handleLoadTest(testId.toString())}
						onRunTest={handleRunTestById}
						onAddToSuite={handleAddTestToSuiteById}
						onRenameTest={handleRenameTest}
						onDeleteTest={handleDeleteTestById}
					/>
				)}
			</div>
		</div>
	);
}

export default RightPanel;
