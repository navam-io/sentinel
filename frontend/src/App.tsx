import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/canvas/Canvas';
import ComponentPalette from './components/palette/ComponentPalette';
import YamlPreview from './components/yaml/YamlPreview';

function App() {
	return (
		<ReactFlowProvider>
			<div className="w-full h-screen bg-sentinel-bg flex">
				<ComponentPalette />
				<Canvas />
				<YamlPreview />
			</div>
		</ReactFlowProvider>
	);
}

export default App;
