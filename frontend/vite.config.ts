import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],

	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
		exclude: ['node_modules', 'dist', 'build', 'e2e/**'], // Exclude E2E tests from Vitest
	},

	// Vite options for Tauri 2.0
	clearScreen: false,

	server: {
		port: 1420,
		strictPort: true,
		watch: {
			// Tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**']
		}
	},

	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},

	build: {
		// Tauri uses Chromium on Windows and WebKit on macOS and Linux
		target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
		// Don't minify for debug builds
		minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
		// Produce sourcemaps for debug builds and development
		sourcemap: process.env.NODE_ENV === 'production' ? false : true,
	},
});
