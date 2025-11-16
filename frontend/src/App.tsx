import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Canvas from './components/canvas/Canvas';

function App() {
	return (
		<ReactFlowProvider>
			<div className="w-full h-screen bg-sentinel-bg">
				<Canvas />
			</div>
		</ReactFlowProvider>
	);
}

export default App;
