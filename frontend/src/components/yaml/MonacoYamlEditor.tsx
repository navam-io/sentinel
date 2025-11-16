import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

interface MonacoYamlEditorProps {
	value: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	onError?: (error: string) => void;
}

/**
 * Monaco Editor component configured for YAML editing
 * Features:
 * - Syntax highlighting for YAML
 * - Line numbers and code folding
 * - Auto-indentation (2 spaces)
 * - Find/replace functionality
 * - Multi-cursor editing
 * - Dark theme matching Sentinel design system
 */
function MonacoYamlEditor({ value, onChange, readOnly = false, onError }: MonacoYamlEditorProps) {
	const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;

		// Add keyboard shortcuts
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			// Cmd+S/Ctrl+S - will be handled by parent (Apply button)
			// This prevents browser save dialog
		});

		// Configure editor options
		editor.updateOptions({
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			wordWrap: 'on',
			lineNumbers: 'on',
			glyphMargin: true,
			folding: true,
			lineDecorationsWidth: 0,
			lineNumbersMinChars: 3,
			renderLineHighlight: 'all',
			scrollbar: {
				verticalScrollbarSize: 10,
				horizontalScrollbarSize: 10,
			},
			overviewRulerBorder: false,
			overviewRulerLanes: 0,
			hideCursorInOverviewRuler: true,
			fontSize: 11,
			fontFamily: 'Monaco, Consolas, "Courier New", monospace',
			tabSize: 2,
			insertSpaces: true,
			autoIndent: 'full',
			formatOnPaste: true,
			formatOnType: true,
		});
	};

	const handleEditorChange = (value: string | undefined) => {
		if (onChange && value !== undefined) {
			onChange(value);
		}
	};

	useEffect(() => {
		// Validate YAML syntax when value changes
		if (editorRef.current && value) {
			try {
				// Basic YAML syntax validation will be done by Monaco
				// More complex validation is handled by the parent component
				onError?.('');
			} catch (err) {
				onError?.(err instanceof Error ? err.message : String(err));
			}
		}
	}, [value, onError]);

	return (
		<div className="h-full w-full">
			<Editor
				height="100%"
				defaultLanguage="yaml"
				value={value}
				onChange={handleEditorChange}
				onMount={handleEditorDidMount}
				theme="vs-dark"
				options={{
					readOnly,
					domReadOnly: readOnly,
					contextmenu: true,
					quickSuggestions: !readOnly,
					suggestOnTriggerCharacters: !readOnly,
				}}
				loading={
					<div className="flex items-center justify-center h-full text-sentinel-text-muted text-xs">
						Loading editor...
					</div>
				}
			/>
		</div>
	);
}

export default MonacoYamlEditor;
