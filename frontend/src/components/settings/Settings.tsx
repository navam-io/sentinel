import { useState } from 'react';
import { X, Folder, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

interface SettingsProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * Settings Component
 *
 * Allows users to configure application settings including templates folder path
 */
export function Settings({ isOpen, onClose }: SettingsProps) {
	const { templatesFolder, setTemplatesFolder, resetToDefaults } = useSettingsStore();
	const [localPath, setLocalPath] = useState(templatesFolder);
	const [isSaving, setIsSaving] = useState(false);

	if (!isOpen) return null;

	const handleSave = () => {
		setIsSaving(true);
		setTemplatesFolder(localPath);

		// Show brief "saved" state
		setTimeout(() => {
			setIsSaving(false);
			onClose();
		}, 300);
	};

	const handleReset = () => {
		resetToDefaults();
		setLocalPath('artifacts/templates');
	};

	const handleCancel = () => {
		// Revert to saved value
		setLocalPath(templatesFolder);
		onClose();
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 z-40"
				onClick={handleCancel}
				data-testid="settings-backdrop"
			/>

			{/* Modal */}
			<div
				className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
				data-testid="settings-modal"
			>
				<div className="bg-sentinel-bg-elevated border border-sentinel-border rounded-lg shadow-2xl w-full max-w-2xl mx-4 pointer-events-auto">
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-sentinel-border">
						<h2 className="text-lg font-semibold text-sentinel-text">Settings</h2>
						<button
							onClick={handleCancel}
							className="p-1 hover:bg-sentinel-hover rounded transition-colors"
							data-testid="settings-close"
						>
							<X size={20} className="text-sentinel-text-muted" />
						</button>
					</div>

					{/* Content */}
					<div className="px-6 py-6 space-y-6">
						{/* Templates Folder Setting */}
						<div>
							<label className="block text-sm font-medium text-sentinel-text mb-2">
								Templates Folder
							</label>
							<p className="text-xs text-sentinel-text-muted mb-3">
								Path to the folder containing YAML test templates. Can be relative (e.g.,
								"artifacts/templates") or absolute.
							</p>
							<div className="flex gap-2">
								<div className="flex-1 relative">
									<Folder
										size={16}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-sentinel-text-muted"
									/>
									<input
										type="text"
										value={localPath}
										onChange={(e) => setLocalPath(e.target.value)}
										placeholder="artifacts/templates"
										className="w-full pl-10 pr-3 py-2 bg-sentinel-surface border border-sentinel-border rounded text-sm text-sentinel-text placeholder-sentinel-text-muted focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
										data-testid="templates-folder-input"
									/>
								</div>
								<button
									onClick={handleReset}
									className="px-3 py-2 bg-sentinel-surface border border-sentinel-border rounded text-sm text-sentinel-text hover:bg-sentinel-hover transition-colors flex items-center gap-2"
									data-testid="reset-defaults"
									title="Reset to default"
								>
									<RotateCcw size={16} />
									<span>Reset</span>
								</button>
							</div>
							<p className="text-xs text-sentinel-text-muted mt-2">
								Default: <code className="text-sentinel-primary">artifacts/templates</code>
							</p>
						</div>

						{/* Info Box */}
						<div className="bg-sentinel-surface border border-sentinel-border rounded p-4">
							<h3 className="text-sm font-medium text-sentinel-text mb-2">
								About Templates
							</h3>
							<ul className="text-xs text-sentinel-text-muted space-y-1 list-disc list-inside">
								<li>Templates are loaded from YAML files in the specified folder</li>
								<li>All .yaml and .yml files will be automatically detected</li>
								<li>Templates must follow the Sentinel test specification schema</li>
								<li>Changes take effect immediately after saving</li>
							</ul>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sentinel-border">
						<button
							onClick={handleCancel}
							className="px-4 py-2 text-sm text-sentinel-text hover:bg-sentinel-hover rounded transition-colors"
							data-testid="settings-cancel"
						>
							Cancel
						</button>
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="px-4 py-2 bg-sentinel-primary text-sentinel-bg text-sm font-medium rounded hover:bg-sentinel-primary-hover transition-colors disabled:opacity-50"
							data-testid="settings-save"
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
