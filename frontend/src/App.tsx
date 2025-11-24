import { ReactFlowProvider } from '@xyflow/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Canvas from './components/canvas/Canvas';
import ComponentPalette from './components/palette/ComponentPalette';
import RightPanel from './components/RightPanel';
import { useSettingsStore } from './stores/settingsStore';

function App() {
	const { showLeftPanel, setShowLeftPanel, showRightPanel, setShowRightPanel } = useSettingsStore();

	return (
		<ReactFlowProvider>
			<div className="w-full h-screen bg-sentinel-bg flex overflow-hidden relative">
				<ComponentPalette />
				<Canvas />
				<RightPanel />

				{/* Floating Expand Button - Left Panel */}
				{!showLeftPanel && (
					<button
						onClick={() => setShowLeftPanel(true)}
						className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-sentinel-bg-elevated border border-sentinel-border rounded-r-lg px-2 py-6 hover:bg-sentinel-hover transition-all shadow-lg"
						title="Expand left panel"
						data-testid="expand-left-panel"
					>
						<ChevronRight size={16} className="text-sentinel-text-muted" />
					</button>
				)}

				{/* Floating Expand Button - Right Panel */}
				{!showRightPanel && (
					<button
						onClick={() => setShowRightPanel(true)}
						className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-sentinel-bg-elevated border border-sentinel-border rounded-l-lg px-2 py-6 hover:bg-sentinel-hover transition-all shadow-lg"
						title="Expand right panel"
						data-testid="expand-right-panel"
					>
						<ChevronLeft size={16} className="text-sentinel-text-muted" />
					</button>
				)}
			</div>
		</ReactFlowProvider>
	);
}

export default App;
