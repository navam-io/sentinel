import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Settings Store
 *
 * Manages application settings including templates folder path
 */

export interface SettingsState {
	templatesFolder: string;
	setTemplatesFolder: (path: string) => void;
	resetToDefaults: () => void;
}

const DEFAULT_TEMPLATES_FOLDER = 'artifacts/templates';

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			// Default templates folder path (relative to project root)
			templatesFolder: DEFAULT_TEMPLATES_FOLDER,

			// Update templates folder path
			setTemplatesFolder: (path: string) => {
				set({ templatesFolder: path });
			},

			// Reset all settings to defaults
			resetToDefaults: () => {
				set({ templatesFolder: DEFAULT_TEMPLATES_FOLDER });
			},
		}),
		{
			name: 'sentinel-settings', // localStorage key
		}
	)
);
