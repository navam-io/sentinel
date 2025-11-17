import { useState } from 'react';
import { FileCode, FolderOpen, Play } from 'lucide-react';
import YamlPreview from './yaml/YamlPreview';
import TestManager from './tests/TestManager';
import ExecutionPanel from './execution/ExecutionPanel';

type Tab = 'yaml' | 'tests' | 'execution';

function RightPanel() {
	const [activeTab, setActiveTab] = useState<Tab>('yaml');

	return (
		<div className="flex flex-col h-full bg-sentinel-bg-elevated border-l border-sentinel-border">
			{/* Tab Navigation */}
			<div className="flex border-b border-sentinel-border bg-sentinel-bg">
				<button
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
			<div className="flex-1 overflow-hidden">
				{activeTab === 'yaml' && <YamlPreview />}
				{activeTab === 'tests' && <TestManager />}
				{activeTab === 'execution' && <ExecutionPanel />}
			</div>
		</div>
	);
}

export default RightPanel;
