import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/canvas/Canvas';
import ComponentPalette from './components/palette/ComponentPalette';
import RightPanel from './components/RightPanel';

function App() {
	return (
		<ReactFlowProvider>
			<div className="w-full h-screen bg-sentinel-bg flex overflow-hidden">
				<ComponentPalette />
				<Canvas />
				<RightPanel />
			</div>
		</ReactFlowProvider>
	);
}

export default App;
