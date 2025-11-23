/**
 * Build Performance Measurement Script
 *
 * Measures Vite build times, bundle sizes, and compilation performance
 * Target: Frontend build < 10s, Bundle size < 50MB
 */

import { execSync } from 'child_process';
import { statSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface BuildMetrics {
	buildTime: number; // milliseconds
	bundleSize: number; // bytes
	chunkCount: number;
	timestamp: string;
}

/**
 * Measure Vite build performance
 */
export function measureBuildPerformance(): BuildMetrics {
	console.log('📊 Measuring build performance...\n');

	// Clean previous build
	try {
		execSync('rm -rf dist', { cwd: process.cwd() });
		console.log('✓ Cleaned previous build');
	} catch (error) {
		console.log('ℹ No previous build to clean');
	}

	// Measure build time
	const startTime = Date.now();

	try {
		execSync('npm run build', {
			cwd: process.cwd(),
			stdio: 'pipe'
		});
	} catch (error) {
		console.error('✗ Build failed:', error);
		throw error;
	}

	const buildTime = Date.now() - startTime;
	console.log(`✓ Build completed in ${(buildTime / 1000).toFixed(2)}s`);

	// Measure bundle size
	const distPath = join(process.cwd(), 'dist');
	const { size, chunkCount } = getBundleSize(distPath);

	const metrics: BuildMetrics = {
		buildTime,
		bundleSize: size,
		chunkCount,
		timestamp: new Date().toISOString()
	};

	return metrics;
}

/**
 * Calculate total bundle size
 */
function getBundleSize(distPath: string): { size: number; chunkCount: number } {
	let totalSize = 0;
	let chunkCount = 0;

	function walk(dir: string) {
		const files = readdirSync(dir);

		for (const file of files) {
			const filePath = join(dir, file);
			const stat = statSync(filePath);

			if (stat.isDirectory()) {
				walk(filePath);
			} else {
				totalSize += stat.size;
				if (file.endsWith('.js') || file.endsWith('.css')) {
					chunkCount++;
				}
			}
		}
	}

	try {
		walk(distPath);
	} catch (error) {
		console.error('Error calculating bundle size:', error);
	}

	return { size: totalSize, chunkCount };
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Print build metrics report
 */
export function printBuildMetrics(metrics: BuildMetrics): void {
	console.log('\n📈 Build Performance Report\n');
	console.log('─'.repeat(50));
	console.log(`Build Time:    ${(metrics.buildTime / 1000).toFixed(2)}s`);
	console.log(`Bundle Size:   ${formatBytes(metrics.bundleSize)}`);
	console.log(`Chunk Count:   ${metrics.chunkCount} files`);
	console.log(`Timestamp:     ${new Date(metrics.timestamp).toLocaleString()}`);
	console.log('─'.repeat(50));

	// Check against targets
	const buildTimeTarget = 10000; // 10 seconds
	const bundleSizeTarget = 50 * 1024 * 1024; // 50 MB

	console.log('\n🎯 Performance Targets:\n');

	if (metrics.buildTime < buildTimeTarget) {
		console.log(`✅ Build time: ${(metrics.buildTime / 1000).toFixed(2)}s < ${buildTimeTarget / 1000}s (PASS)`);
	} else {
		console.log(`❌ Build time: ${(metrics.buildTime / 1000).toFixed(2)}s > ${buildTimeTarget / 1000}s (FAIL)`);
	}

	if (metrics.bundleSize < bundleSizeTarget) {
		console.log(`✅ Bundle size: ${formatBytes(metrics.bundleSize)} < ${formatBytes(bundleSizeTarget)} (PASS)`);
	} else {
		console.log(`❌ Bundle size: ${formatBytes(metrics.bundleSize)} > ${formatBytes(bundleSizeTarget)} (FAIL)`);
	}

	console.log();
}

/**
 * Save metrics to JSON file
 */
export function saveMetrics(metrics: BuildMetrics, filePath: string): void {
	const json = JSON.stringify(metrics, null, 2);
	writeFileSync(filePath, json);
	console.log(`✓ Metrics saved to ${filePath}`);
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
	try {
		const metrics = measureBuildPerformance();
		printBuildMetrics(metrics);

		const outputPath = join(process.cwd(), 'benchmarks', 'build-metrics.json');
		saveMetrics(metrics, outputPath);

		process.exit(0);
	} catch (error) {
		console.error('Build performance measurement failed:', error);
		process.exit(1);
	}
}
