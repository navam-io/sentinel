import { useState, useEffect } from 'react';
import { FileCode, FolderOpen, Library as LibraryIcon } from 'lucide-react';
import TestTab from './yaml/TestTab';
import { Library } from './library/Library';
import { TestSuiteOrganizer } from './suites';
import type { TestSuite, TestSuiteItem } from './suites';
import { useTemplates } from '../hooks/useTemplates';
import { useCanvasStore } from '../stores/canvasStore';
import { parseYAMLToNodes } from '../lib/dsl/generator';
import { listTests, getTest, executeTest, deleteTest, updateTest, type TestDefinition } from '../services/api';
import { loadSuites, saveSuites } from '../services/suiteStorage';
import { convertYAMLToTestSpec } from '../lib/dsl/generator';
import type { Template } from './templates/TemplateCard';

type Tab = 'test' | 'suite' | 'library';

function RightPanel() {
	const [activeTab, setActiveTab] = useState<Tab>('test');
	const [suites, setSuites] = useState<TestSuite[]>(() => loadSuites());
	const [savedTests, setSavedTests] = useState<TestDefinition[]>([]);
	const [loadingTests, setLoadingTests] = useState(false);
	const { templates, loading: templatesLoading } = useTemplates();
	const { nodes, setNodes, setEdges, setSavedTestInfo } = useCanvasStore();

	// Auto-save suites to localStorage whenever they change
	useEffect(() => {
		saveSuites(suites);
	}, [suites]);

	const handleLoadTemplate = (template: Template) => {
		try {
			// Confirm if there are existing nodes on canvas
			if (nodes.length > 0) {
				const confirmed = window.confirm(
					`Loading this template will replace your current canvas. Continue?`
				);
				if (!confirmed) {
					return;
				}
			}

			// Parse the template YAML and load to canvas
			const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(template.yamlContent);

			if (parsedNodes.length === 0) {
				alert('Failed to load template. Please try another template.');
				return;
			}

			// Clear canvas first, then load template nodes and edges
			setNodes([]);
			setEdges([]);

			// Small delay to ensure canvas is cleared before loading new template
			setTimeout(() => {
				setNodes(parsedNodes);
				setEdges(parsedEdges);

				// Clear saved test info since we loaded a template
				setSavedTestInfo(null);

				// Switch to Test tab to show the loaded template
				setActiveTab('test');

				// Show success message
				alert(`Successfully loaded template: ${template.name}`);
			}, 50);
		} catch (err) {
			alert(`Error loading template: ${err instanceof Error ? err.message : String(err)}`);
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
					// Load from template YAML
					const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(template.yamlContent);
					setNodes(parsedNodes);
					setEdges(parsedEdges);

					// Clear saved test info for templates (they're not saved yet)
					setSavedTestInfo(null);

					setActiveTab('test');
					return;
				}
			}

			// Check if it's a saved test (positive IDs)
			const savedTest = savedTests.find((t) => t.id === testIdNum);
			if (savedTest) {
				// Load from saved test
				if (savedTest.canvas_state && savedTest.canvas_state.nodes && savedTest.canvas_state.edges) {
					setNodes(savedTest.canvas_state.nodes);
					setEdges(savedTest.canvas_state.edges);
				} else if (savedTest.spec_yaml) {
					const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(savedTest.spec_yaml);
					setNodes(parsedNodes);
					setEdges(parsedEdges);
				}

				setSavedTestInfo({
					name: savedTest.name,
					description: savedTest.description || '',
				});

				setActiveTab('test');
				return;
			}

			// Fallback: try to fetch from API
			const test = await getTest(testIdNum);

			if (test.canvas_state && test.canvas_state.nodes && test.canvas_state.edges) {
				setNodes(test.canvas_state.nodes);
				setEdges(test.canvas_state.edges);
			} else if (test.spec_yaml) {
				const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(test.spec_yaml);
				setNodes(parsedNodes);
				setEdges(parsedEdges);
			}

			setSavedTestInfo({
				name: test.name,
				description: test.description || '',
			});

			setActiveTab('test');
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
		<div className="w-96 flex flex-col h-full bg-sentinel-bg-elevated border-l border-sentinel-border flex-shrink-0" data-testid="right-panel">
			{/* Tab Navigation */}
			<div className="flex border-b border-sentinel-border bg-sentinel-bg">
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
