import { useState, useEffect } from 'react';
import {
	Circle,
	Square,
	Pause,
	Play,
	Wand2,
	AlertCircle,
	Clock,
	Zap,
} from 'lucide-react';
import { useRecordingStore, useIsRecording } from '../../stores/recordingStore';
import * as api from '../../services/api';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTestStore } from '../../stores/testStore';

interface RecordingControlsProps {
	onTestGenerated?: (testId: number) => void;
}

function RecordingControls({ onTestGenerated }: RecordingControlsProps) {
	const {
		activeSession,
		events,
		detectionResult,
		isLoading,
		error,
		startRecording,
		stopRecording,
		pauseRecording,
		resumeRecording,
		analyzeRecording,
		loadActiveSession,
		clearError,
	} = useRecordingStore();

	const isRecording = useIsRecording();
	const [sessionName, setSessionName] = useState('');
	const [showNameInput, setShowNameInput] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generateError, setGenerateError] = useState<string | null>(null);

	// Load active session on mount
	useEffect(() => {
		loadActiveSession();
	}, [loadActiveSession]);

	const handleStartRecording = async () => {
		if (!sessionName.trim()) {
			setShowNameInput(true);
			return;
		}

		await startRecording(sessionName.trim());
		setSessionName('');
		setShowNameInput(false);
	};

	const handleStopRecording = async () => {
		await stopRecording();
		// Auto-analyze when stopped
		await analyzeRecording();
	};

	const handleGenerateTest = async () => {
		if (!activeSession) return;

		setIsGenerating(true);
		setGenerateError(null);

		try {
			const result = await api.generateTestFromRecording(activeSession.id, {
				includeSuggestions: true,
			});

			// Load the generated test into the canvas
			const { setNodes, setEdges, setActiveTestId } = useCanvasStore.getState();
			const { setCurrentTest } = useTestStore.getState();

			if (result.canvas_state) {
				setNodes(result.canvas_state.nodes);
				setEdges(result.canvas_state.edges);
			}

			// Set test info
			setActiveTestId(String(result.test_id));
			setCurrentTest({
				id: result.test_id,
				filename: null,
				name: result.test_name,
				description: `Generated from recording`,
				category: 'regression',
				isTemplate: false,
				isDirty: false,
				lastSaved: new Date(),
			});

			onTestGenerated?.(result.test_id);
		} catch (err) {
			setGenerateError(err instanceof Error ? err.message : 'Failed to generate test');
		} finally {
			setIsGenerating(false);
		}
	};

	const status = activeSession?.status;
	const eventCount = events.length;

	return (
		<div className="space-y-3">
			{/* Recording Status */}
			{status && (
				<div
					className={`p-3 rounded border ${
						status === 'recording'
							? 'bg-red-500 bg-opacity-10 border-red-500'
							: status === 'paused'
								? 'bg-yellow-500 bg-opacity-10 border-yellow-500'
								: 'bg-sentinel-surface border-sentinel-border'
					}`}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{status === 'recording' ? (
								<Circle
									size={12}
									className="text-red-500 fill-red-500 animate-pulse"
								/>
							) : status === 'paused' ? (
								<Pause size={12} className="text-yellow-500" />
							) : (
								<Square size={12} className="text-sentinel-text-muted" />
							)}
							<span className="text-xs font-semibold text-sentinel-text">
								{status === 'recording'
									? 'Recording...'
									: status === 'paused'
										? 'Paused'
										: 'Stopped'}
							</span>
						</div>
						<span className="text-[0.65rem] text-sentinel-text-muted">
							{eventCount} event{eventCount !== 1 ? 's' : ''}
						</span>
					</div>
					{activeSession && (
						<p className="text-[0.65rem] text-sentinel-text-muted mt-1 truncate">
							{activeSession.name}
						</p>
					)}
				</div>
			)}

			{/* Error Display */}
			{(error || generateError) && (
				<div className="p-2 bg-sentinel-error bg-opacity-10 border border-sentinel-error rounded">
					<div className="flex items-start gap-2">
						<AlertCircle size={14} className="text-sentinel-error flex-shrink-0 mt-0.5" />
						<p className="text-[0.65rem] text-sentinel-error">{error || generateError}</p>
					</div>
					<button
						onClick={() => {
							clearError();
							setGenerateError(null);
						}}
						className="text-[0.6rem] text-sentinel-error underline mt-1"
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Session Name Input */}
			{showNameInput && !activeSession && (
				<div className="space-y-2">
					<input
						type="text"
						value={sessionName}
						onChange={(e) => setSessionName(e.target.value)}
						placeholder="Recording name..."
						className="w-full px-2 py-1.5 text-xs bg-sentinel-surface border border-sentinel-border rounded text-sentinel-text placeholder-sentinel-text-muted focus:outline-none focus:border-sentinel-primary"
						autoFocus
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleStartRecording();
							if (e.key === 'Escape') {
								setShowNameInput(false);
								setSessionName('');
							}
						}}
					/>
					<div className="flex gap-2">
						<button
							onClick={handleStartRecording}
							disabled={!sessionName.trim() || isLoading}
							className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Start
						</button>
						<button
							onClick={() => {
								setShowNameInput(false);
								setSessionName('');
							}}
							className="px-2 py-1 text-xs text-sentinel-text-muted hover:text-sentinel-text"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Control Buttons */}
			{!showNameInput && (
				<div className="flex gap-2">
					{!activeSession ? (
						<button
							onClick={() => setShowNameInput(true)}
							disabled={isLoading}
							className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
							data-testid="start-recording"
						>
							<Circle size={12} className="fill-white" />
							<span>Record</span>
						</button>
					) : status === 'recording' ? (
						<>
							<button
								onClick={pauseRecording}
								disabled={isLoading}
								className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
								data-testid="pause-recording"
							>
								<Pause size={12} />
								<span>Pause</span>
							</button>
							<button
								onClick={handleStopRecording}
								disabled={isLoading}
								className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sentinel-surface border border-sentinel-border text-sentinel-text text-xs font-medium rounded hover:bg-sentinel-bg disabled:opacity-50 disabled:cursor-not-allowed"
								data-testid="stop-recording"
							>
								<Square size={12} />
								<span>Stop</span>
							</button>
						</>
					) : status === 'paused' ? (
						<>
							<button
								onClick={resumeRecording}
								disabled={isLoading}
								className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sentinel-primary text-sentinel-bg text-xs font-medium rounded hover:bg-sentinel-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
								data-testid="resume-recording"
							>
								<Play size={12} />
								<span>Resume</span>
							</button>
							<button
								onClick={handleStopRecording}
								disabled={isLoading}
								className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sentinel-surface border border-sentinel-border text-sentinel-text text-xs font-medium rounded hover:bg-sentinel-bg disabled:opacity-50 disabled:cursor-not-allowed"
								data-testid="stop-recording"
							>
								<Square size={12} />
								<span>Stop</span>
							</button>
						</>
					) : (
						// Stopped state - show generate button
						<button
							onClick={handleGenerateTest}
							disabled={isLoading || isGenerating || eventCount === 0}
							className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sentinel-primary text-sentinel-bg text-xs font-medium rounded hover:bg-sentinel-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
							data-testid="generate-test"
						>
							<Wand2 size={12} />
							<span>{isGenerating ? 'Generating...' : 'Generate Test'}</span>
						</button>
					)}
				</div>
			)}

			{/* Smart Detection Results */}
			{detectionResult && status === 'stopped' && (
				<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border space-y-2">
					<p className="text-[0.65rem] text-sentinel-text-muted font-semibold">
						Smart Detection
					</p>

					{/* Detected Patterns */}
					{detectionResult.detected_patterns.length > 0 && (
						<div className="space-y-1">
							{detectionResult.detected_patterns.map((pattern, idx) => (
								<div key={idx} className="flex items-center gap-1.5">
									<Zap size={10} className="text-yellow-500" />
									<span className="text-[0.6rem] text-sentinel-text">{pattern}</span>
								</div>
							))}
						</div>
					)}

					{/* Suggested Assertions */}
					{detectionResult.suggested_assertions.length > 0 && (
						<div className="mt-2">
							<p className="text-[0.6rem] text-sentinel-text-muted mb-1">
								Suggested Assertions:
							</p>
							<div className="space-y-1">
								{detectionResult.suggested_assertions.map((suggestion, idx) => (
									<div
										key={idx}
										className="flex items-start gap-1.5 p-1.5 bg-sentinel-bg rounded"
									>
										<div
											className={`w-1.5 h-1.5 rounded-full mt-1 ${
												suggestion.confidence >= 0.8
													? 'bg-sentinel-success'
													: suggestion.confidence >= 0.6
														? 'bg-yellow-500'
														: 'bg-sentinel-text-muted'
											}`}
										/>
										<div className="flex-1 min-w-0">
											<p className="text-[0.6rem] text-sentinel-text font-mono">
												{suggestion.assertion_type}
											</p>
											<p className="text-[0.55rem] text-sentinel-text-muted truncate">
												{suggestion.reason}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{detectionResult.suggested_assertions.length === 0 &&
						detectionResult.detected_patterns.length === 0 && (
							<p className="text-[0.6rem] text-sentinel-text-muted italic">
								No patterns detected
							</p>
						)}
				</div>
			)}

			{/* Event Feed (collapsed when not recording) */}
			{events.length > 0 && status === 'recording' && (
				<div className="p-2 bg-sentinel-surface rounded border border-sentinel-border max-h-32 overflow-y-auto">
					<p className="text-[0.6rem] text-sentinel-text-muted font-semibold mb-1">
						Events
					</p>
					<div className="space-y-1">
						{events
							.slice(-5)
							.reverse()
							.map((event) => (
								<div
									key={event.id}
									className="flex items-center gap-1.5 text-[0.55rem]"
								>
									<Clock size={8} className="text-sentinel-text-muted" />
									<span className="text-sentinel-text font-mono">
										{event.event_type}
									</span>
								</div>
							))}
						{events.length > 5 && (
							<p className="text-[0.5rem] text-sentinel-text-muted">
								+{events.length - 5} more events
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default RecordingControls;
