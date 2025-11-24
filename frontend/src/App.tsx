import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Settings as SettingsIcon } from 'lucide-react';
import Canvas from './components/canvas/Canvas';
import ComponentPalette from './components/palette/ComponentPalette';
import RightPanel from './components/RightPanel';
import { Settings } from './components/settings';

function App() {
	const [settingsOpen, setSettingsOpen] = useState(false);

	return (
		<ReactFlowProvider>
			<div className="w-full h-screen bg-sentinel-bg flex flex-col">
				{/* Top Bar */}
				<div className="h-12 bg-sentinel-bg-elevated border-b border-sentinel-border flex items-center justify-between px-4 flex-shrink-0">
					<div className="flex items-center gap-3">
						<h1 className="text-sm font-semibold text-sentinel-text">
							Sentinel
						</h1>
						<span className="text-xs text-sentinel-text-muted">
							AI Agent Testing Platform
						</span>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setSettingsOpen(true)}
							className="p-2 hover:bg-sentinel-hover rounded transition-colors"
							title="Settings"
							data-testid="settings-button"
						>
							<SettingsIcon size={18} className="text-sentinel-text-muted" />
						</button>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex overflow-hidden">
					<ComponentPalette />
					<Canvas />
					<RightPanel />
				</div>

				{/* Settings Modal */}
				<Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
			</div>
		</ReactFlowProvider>
	);
}

export default App;
