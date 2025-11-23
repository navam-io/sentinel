import { useState } from 'react';
import { FileCode, FolderOpen, Play, Library } from 'lucide-react';
import YamlPreview from './yaml/YamlPreview';
import TestManager from './tests/TestManager';
import ExecutionPanel from './execution/ExecutionPanel';
import { TemplateGallery } from './templates';
import { TestSuiteOrganizer } from './suites';
import type { TestSuite } from './suites';
import { useTemplates } from '../hooks/useTemplates';
import { useCanvasStore } from '../stores/canvasStore';
import { parseYAMLToNodes } from '../lib/dsl/generator';
import type { Template } from './templates/TemplateCard';

type Tab = 'yaml' | 'tests' | 'templates' | 'execution';

function RightPanel() {
	const [activeTab, setActiveTab] = useState<Tab>('yaml');
	const [suites, setSuites] = useState<TestSuite[]>([]);
	const { templates, loading: templatesLoading } = useTemplates();
	const { nodes, setNodes, setEdges } = useCanvasStore();

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

				// Switch to YAML tab to show the loaded template
				setActiveTab('yaml');

				// Show success message
				alert(`Successfully loaded template: ${template.name}`);
			}, 50);
		} catch (err) {
			alert(`Error loading template: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

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

	const handleRunSuite = (id: string) => {
		const suite = suites.find((s) => s.id === id);
		if (suite) {
			alert(`Running all tests in suite: ${suite.name}`);
			// TODO: Implement actual suite execution
		}
	};

	const handleExportSuite = (id: string) => {
		const suite = suites.find((s) => s.id === id);
		if (suite) {
			alert(`Exporting suite: ${suite.name}`);
			// TODO: Implement actual suite export
		}
	};

	const handleLoadTest = (testId: string) => {
		alert(`Loading test: ${testId}`);
		// TODO: Load test to canvas
		setActiveTab('yaml');
	};

	const handleRunTest = (suiteId: string, testId: string) => {
		alert(`Running test: ${testId} in suite: ${suiteId}`);
		// TODO: Implement test execution
	};

	const handleAddTestToSuite = (suiteId: string, testId: string) => {
		alert(`Adding test ${testId} to suite ${suiteId}`);
		// TODO: Implement adding test to suite
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

	return (
		<div className="w-96 flex flex-col h-full bg-sentinel-bg-elevated border-l border-sentinel-border flex-shrink-0" data-testid="right-panel">
			{/* Tab Navigation */}
			<div className="flex border-b border-sentinel-border bg-sentinel-bg">
				<button
					data-testid="tab-yaml"
					onClick={() => setActiveTab('yaml')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'yaml'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<FileCode size={16} strokeWidth={2} />
					<span>YAML</span>
				</button>

				<button
					data-testid="tab-tests"
					onClick={() => setActiveTab('tests')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'tests'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<FolderOpen size={16} strokeWidth={2} />
					<span>Tests</span>
				</button>

				<button
					data-testid="tab-templates"
					onClick={() => setActiveTab('templates')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'templates'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<Library size={16} strokeWidth={2} />
					<span>Templates</span>
				</button>

				<button
					data-testid="tab-execution"
					onClick={() => setActiveTab('execution')}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
						activeTab === 'execution'
							? 'text-sentinel-primary border-b-2 border-sentinel-primary'
							: 'text-sentinel-text-muted hover:text-sentinel-text hover:bg-sentinel-surface'
					}`}
				>
					<Play size={16} strokeWidth={2} />
					<span>Run</span>
				</button>
			</div>

			{/* Tab Content */}
			<div className="flex-1 overflow-hidden" data-testid="tab-content">
				{activeTab === 'yaml' && <YamlPreview />}
				{activeTab === 'tests' && (
					<div className="h-full overflow-y-auto">
						<div className="p-4">
							<TestSuiteOrganizer
								suites={suites}
								onCreateSuite={handleCreateSuite}
								onRenameSuite={handleRenameSuite}
								onDeleteSuite={handleDeleteSuite}
								onAddTestToSuite={handleAddTestToSuite}
								onRemoveTestFromSuite={handleRemoveTestFromSuite}
								onRunSuite={handleRunSuite}
								onRunTest={handleRunTest}
								onExportSuite={handleExportSuite}
								onLoadTest={handleLoadTest}
							/>
						</div>
					</div>
				)}
				{activeTab === 'templates' && (
					<div className="h-full overflow-y-auto">
						{templatesLoading ? (
							<div className="flex items-center justify-center h-full">
								<p className="text-sentinel-text-muted text-sm">Loading templates...</p>
							</div>
						) : (
							<div className="p-4">
								<TemplateGallery
									templates={templates}
									onLoadTemplate={handleLoadTemplate}
								/>
							</div>
						)}
					</div>
				)}
				{activeTab === 'execution' && <ExecutionPanel />}
			</div>
		</div>
	);
}

export default RightPanel;
