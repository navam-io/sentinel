import { useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * Hook to handle Tauri menu events from the native system menu.
 *
 * This hook:
 * - Listens for menu events emitted by Rust backend
 * - Toggles panel visibility
 * - Opens Settings dialog
 * - Syncs panel checkbox state back to native menu
 * - Dispatches custom events for file operations and canvas controls
 */
export function useMenuEvents() {
	const {
		showLeftPanel,
		setShowLeftPanel,
		showRightPanel,
		setShowRightPanel,
		showMinimap,
		setShowMinimap,
	} = useSettingsStore();

	// Toggle left panel
	const toggleLeftPanel = useCallback(() => {
		setShowLeftPanel(!showLeftPanel);
	}, [showLeftPanel, setShowLeftPanel]);

	// Toggle right panel
	const toggleRightPanel = useCallback(() => {
		setShowRightPanel(!showRightPanel);
	}, [showRightPanel, setShowRightPanel]);

	// Toggle minimap
	const toggleMinimap = useCallback(() => {
		setShowMinimap(!showMinimap);
	}, [showMinimap, setShowMinimap]);

	useEffect(() => {
		const listeners: Promise<() => void>[] = [];

		// Settings menu - dispatch custom event to open Settings dialog
		listeners.push(
			listen('menu:settings', () => {
				window.dispatchEvent(new CustomEvent('sentinel:open-settings'));
			})
		);

		// Panel toggles
		listeners.push(
			listen<string>('menu:toggle-panel', (event) => {
				if (event.payload === 'left') {
					toggleLeftPanel();
				} else if (event.payload === 'right') {
					toggleRightPanel();
				}
			})
		);

		// Zoom controls - dispatch to canvas
		listeners.push(
			listen<string>('menu:zoom', (event) => {
				window.dispatchEvent(
					new CustomEvent('sentinel:zoom', {
						detail: { action: event.payload },
					})
				);
			})
		);

		// Canvas controls
		listeners.push(
			listen<string>('menu:canvas', (event) => {
				if (event.payload === 'toggle-minimap') {
					toggleMinimap();
				} else {
					window.dispatchEvent(
						new CustomEvent('sentinel:canvas-action', {
							detail: { action: event.payload },
						})
					);
				}
			})
		);

		// File operations - dispatch to file handlers
		listeners.push(
			listen<string>('menu:file', (event) => {
				window.dispatchEvent(
					new CustomEvent('sentinel:file-action', {
						detail: { action: event.payload },
					})
				);
			})
		);

		// Help menu
		listeners.push(
			listen<string>('menu:help', (event) => {
				switch (event.payload) {
					case 'docs':
						window.open('https://docs.navam.io/sentinel', '_blank');
						break;
					case 'shortcuts':
						window.dispatchEvent(new CustomEvent('sentinel:show-shortcuts'));
						break;
					case 'check-updates':
						window.dispatchEvent(new CustomEvent('sentinel:check-updates'));
						break;
				}
			})
		);

		// Cleanup all listeners on unmount
		return () => {
			listeners.forEach((listener) => {
				listener.then((unlisten) => unlisten());
			});
		};
	}, [toggleLeftPanel, toggleRightPanel, toggleMinimap]);

	// Sync panel state back to native menu checkboxes
	useEffect(() => {
		// Only sync in Tauri environment
		if (typeof window !== 'undefined' && (window as unknown as { __TAURI__?: unknown }).__TAURI__) {
			invoke('sync_menu_state', {
				leftPanelVisible: showLeftPanel,
				rightPanelVisible: showRightPanel,
			}).catch((err) => {
				// Silently fail in non-Tauri environments or if command not available
				console.debug('Menu sync not available:', err);
			});
		}
	}, [showLeftPanel, showRightPanel]);
}

export default useMenuEvents;
