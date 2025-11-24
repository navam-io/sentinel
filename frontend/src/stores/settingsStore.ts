import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Settings Store
 *
 * Manages application settings including templates folder path
 */

export interface SettingsState {
	templatesFolder: string;
	showMinimap: boolean;
	showLeftPanel: boolean;
	showRightPanel: boolean;
	setTemplatesFolder: (path: string) => void;
	setShowMinimap: (show: boolean) => void;
	setShowLeftPanel: (show: boolean) => void;
	setShowRightPanel: (show: boolean) => void;
	resetToDefaults: () => void;
}

const DEFAULT_TEMPLATES_FOLDER = 'artifacts/templates';
const DEFAULT_SHOW_MINIMAP = true;
const DEFAULT_SHOW_LEFT_PANEL = true;
const DEFAULT_SHOW_RIGHT_PANEL = true;

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			// Default templates folder path (relative to project root)
			templatesFolder: DEFAULT_TEMPLATES_FOLDER,

			// Show/hide minimap on canvas
			showMinimap: DEFAULT_SHOW_MINIMAP,

			// Show/hide left panel (Component Palette)
			showLeftPanel: DEFAULT_SHOW_LEFT_PANEL,

			// Show/hide right panel (Test Script)
			showRightPanel: DEFAULT_SHOW_RIGHT_PANEL,

			// Update templates folder path
			setTemplatesFolder: (path: string) => {
				set({ templatesFolder: path });
			},

			// Update minimap visibility
			setShowMinimap: (show: boolean) => {
				set({ showMinimap: show });
			},

			// Update left panel visibility
			setShowLeftPanel: (show: boolean) => {
				set({ showLeftPanel: show });
			},

			// Update right panel visibility
			setShowRightPanel: (show: boolean) => {
				set({ showRightPanel: show });
			},

			// Reset all settings to defaults
			resetToDefaults: () => {
				set({
					templatesFolder: DEFAULT_TEMPLATES_FOLDER,
					showMinimap: DEFAULT_SHOW_MINIMAP,
					showLeftPanel: DEFAULT_SHOW_LEFT_PANEL,
					showRightPanel: DEFAULT_SHOW_RIGHT_PANEL
				});
			},
		}),
		{
			name: 'sentinel-settings', // localStorage key
		}
	)
);
