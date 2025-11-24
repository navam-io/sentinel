import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenuEvents } from './useMenuEvents';

// Mock Tauri modules
const mockListen = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@tauri-apps/api/event', () => ({
	listen: (...args: unknown[]) => mockListen(...args),
}));

vi.mock('@tauri-apps/api/core', () => ({
	invoke: (...args: unknown[]) => mockInvoke(...args),
}));

// Mock the settings store
const mockSetShowLeftPanel = vi.fn();
const mockSetShowRightPanel = vi.fn();
const mockSetShowMinimap = vi.fn();

let mockShowLeftPanel = true;
let mockShowRightPanel = true;
let mockShowMinimap = true;

vi.mock('../stores/settingsStore', () => ({
	useSettingsStore: () => ({
		showLeftPanel: mockShowLeftPanel,
		setShowLeftPanel: mockSetShowLeftPanel,
		showRightPanel: mockShowRightPanel,
		setShowRightPanel: mockSetShowRightPanel,
		showMinimap: mockShowMinimap,
		setShowMinimap: mockSetShowMinimap,
	}),
}));

describe('useMenuEvents', () => {
	// Store the event handlers registered via listen
	const eventHandlers: Record<string, (event: { payload: string }) => void> = {};
	const unlistenFns: (() => void)[] = [];

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock state
		mockShowLeftPanel = true;
		mockShowRightPanel = true;
		mockShowMinimap = true;

		// Clear event handlers
		Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);
		unlistenFns.length = 0;

		// Set up mock listen to capture event handlers
		mockListen.mockImplementation((eventName: string, handler: (event: { payload: string }) => void) => {
			eventHandlers[eventName] = handler;
			const unlisten = vi.fn();
			unlistenFns.push(unlisten);
			return Promise.resolve(unlisten);
		});

		// Set up mock invoke
		mockInvoke.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Event Listener Setup', () => {
		it('should register listeners for all menu events on mount', () => {
			renderHook(() => useMenuEvents());

			expect(mockListen).toHaveBeenCalledWith('menu:settings', expect.any(Function));
			expect(mockListen).toHaveBeenCalledWith('menu:toggle-panel', expect.any(Function));
			expect(mockListen).toHaveBeenCalledWith('menu:zoom', expect.any(Function));
			expect(mockListen).toHaveBeenCalledWith('menu:canvas', expect.any(Function));
			expect(mockListen).toHaveBeenCalledWith('menu:file', expect.any(Function));
			expect(mockListen).toHaveBeenCalledWith('menu:help', expect.any(Function));
		});

		it('should clean up listeners on unmount', async () => {
			const { unmount } = renderHook(() => useMenuEvents());

			// Unmount should trigger cleanup
			unmount();

			// Wait for async cleanup
			await vi.waitFor(() => {
				// Each listener should have its unlisten called eventually
				expect(unlistenFns.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Panel Toggle Events', () => {
		it('should toggle left panel when menu:toggle-panel left event fires', () => {
			mockShowLeftPanel = true;
			renderHook(() => useMenuEvents());

			// Simulate menu event
			act(() => {
				eventHandlers['menu:toggle-panel']?.({ payload: 'left' });
			});

			expect(mockSetShowLeftPanel).toHaveBeenCalledWith(false);
		});

		it('should toggle right panel when menu:toggle-panel right event fires', () => {
			mockShowRightPanel = true;
			renderHook(() => useMenuEvents());

			// Simulate menu event
			act(() => {
				eventHandlers['menu:toggle-panel']?.({ payload: 'right' });
			});

			expect(mockSetShowRightPanel).toHaveBeenCalledWith(false);
		});

		it('should show left panel when it is hidden and toggle event fires', () => {
			mockShowLeftPanel = false;
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:toggle-panel']?.({ payload: 'left' });
			});

			expect(mockSetShowLeftPanel).toHaveBeenCalledWith(true);
		});

		it('should show right panel when it is hidden and toggle event fires', () => {
			mockShowRightPanel = false;
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:toggle-panel']?.({ payload: 'right' });
			});

			expect(mockSetShowRightPanel).toHaveBeenCalledWith(true);
		});
	});

	describe('Settings Events', () => {
		it('should dispatch sentinel:open-settings custom event when menu:settings fires', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:settings']?.({ payload: '' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:open-settings',
				})
			);

			dispatchEventSpy.mockRestore();
		});
	});

	describe('Zoom Events', () => {
		it('should dispatch sentinel:zoom custom event for zoom in', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:zoom']?.({ payload: 'in' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:zoom',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:zoom custom event for zoom out', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:zoom']?.({ payload: 'out' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:zoom',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:zoom custom event for zoom reset', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:zoom']?.({ payload: 'reset' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:zoom',
				})
			);

			dispatchEventSpy.mockRestore();
		});
	});

	describe('Canvas Events', () => {
		it('should toggle minimap when menu:canvas toggle-minimap event fires', () => {
			mockShowMinimap = true;
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:canvas']?.({ payload: 'toggle-minimap' });
			});

			expect(mockSetShowMinimap).toHaveBeenCalledWith(false);
		});

		it('should show minimap when hidden and toggle event fires', () => {
			mockShowMinimap = false;
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:canvas']?.({ payload: 'toggle-minimap' });
			});

			expect(mockSetShowMinimap).toHaveBeenCalledWith(true);
		});

		it('should dispatch sentinel:canvas-action for fit event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:canvas']?.({ payload: 'fit' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:canvas-action',
				})
			);

			dispatchEventSpy.mockRestore();
		});
	});

	describe('File Events', () => {
		it('should dispatch sentinel:file-action for new file event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:file']?.({ payload: 'new' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:file-action',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:file-action for open file event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:file']?.({ payload: 'open' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:file-action',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:file-action for save file event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:file']?.({ payload: 'save' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:file-action',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:file-action for export event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:file']?.({ payload: 'export' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:file-action',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:file-action for import event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:file']?.({ payload: 'import' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:file-action',
				})
			);

			dispatchEventSpy.mockRestore();
		});
	});

	describe('Help Events', () => {
		it('should open documentation URL for docs event', () => {
			const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:help']?.({ payload: 'docs' });
			});

			expect(windowOpenSpy).toHaveBeenCalledWith(
				'https://docs.navam.io/sentinel',
				'_blank'
			);

			windowOpenSpy.mockRestore();
		});

		it('should dispatch sentinel:show-shortcuts for shortcuts event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:help']?.({ payload: 'shortcuts' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:show-shortcuts',
				})
			);

			dispatchEventSpy.mockRestore();
		});

		it('should dispatch sentinel:check-updates for check-updates event', () => {
			const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
			renderHook(() => useMenuEvents());

			act(() => {
				eventHandlers['menu:help']?.({ payload: 'check-updates' });
			});

			expect(dispatchEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'sentinel:check-updates',
				})
			);

			dispatchEventSpy.mockRestore();
		});
	});

	describe('Menu State Sync', () => {
		it('should not call sync_menu_state when not in Tauri environment', () => {
			// By default, __TAURI__ is not defined
			renderHook(() => useMenuEvents());

			expect(mockInvoke).not.toHaveBeenCalled();
		});

		it('should call sync_menu_state when in Tauri environment', () => {
			// Simulate Tauri environment
			(window as unknown as { __TAURI__: boolean }).__TAURI__ = true;

			renderHook(() => useMenuEvents());

			expect(mockInvoke).toHaveBeenCalledWith('sync_menu_state', {
				leftPanelVisible: true,
				rightPanelVisible: true,
			});

			// Clean up
			delete (window as unknown as { __TAURI__?: boolean }).__TAURI__;
		});

		it('should handle sync_menu_state errors gracefully', async () => {
			(window as unknown as { __TAURI__: boolean }).__TAURI__ = true;
			const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
			mockInvoke.mockRejectedValue(new Error('Command not found'));

			renderHook(() => useMenuEvents());

			// Wait for the rejection to be handled
			await vi.waitFor(() => {
				expect(consoleSpy).toHaveBeenCalled();
			});

			consoleSpy.mockRestore();
			delete (window as unknown as { __TAURI__?: boolean }).__TAURI__;
		});
	});
});
