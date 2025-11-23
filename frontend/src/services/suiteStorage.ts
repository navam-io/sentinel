/**
 * Suite Storage Service
 *
 * Manages persistence of test suites in localStorage.
 * Suites are stored locally for now, with future migration to backend.
 */

import type { TestSuite } from '../components/suites/TestSuiteOrganizer';

const STORAGE_KEY = 'sentinel_test_suites';
const STORAGE_VERSION = '1.0';

interface StorageData {
  version: string;
  suites: TestSuite[];
  lastUpdated: string;
}

/**
 * Load test suites from localStorage
 */
export function loadSuites(): TestSuite[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed: StorageData = JSON.parse(data);

    // Version check for future migrations
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Suite storage version mismatch, using defaults');
      return [];
    }

    // Convert date strings back to Date objects
    return parsed.suites.map((suite) => ({
      ...suite,
      createdAt: new Date(suite.createdAt),
      updatedAt: new Date(suite.updatedAt),
      tests: suite.tests.map((test) => ({
        ...test,
        lastRun: test.lastRun ? new Date(test.lastRun) : undefined,
      })),
    }));
  } catch (err) {
    console.error('Failed to load suites from localStorage:', err);
    return [];
  }
}

/**
 * Save test suites to localStorage
 */
export function saveSuites(suites: TestSuite[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      suites,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save suites to localStorage:', err);
    // If quota exceeded, try to clean up old data
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old data');
      localStorage.removeItem(STORAGE_KEY);
      // Try again
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: STORAGE_VERSION,
          suites,
          lastUpdated: new Date().toISOString(),
        }));
      } catch (retryErr) {
        console.error('Failed to save suites even after clearing:', retryErr);
      }
    }
  }
}

/**
 * Clear all saved suites (useful for reset/testing)
 */
export function clearSuites(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear suites from localStorage:', err);
  }
}

/**
 * Export suites as JSON file
 */
export function exportSuitesToFile(suites: TestSuite[]): void {
  const data: StorageData = {
    version: STORAGE_VERSION,
    suites,
    lastUpdated: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-suites-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import suites from JSON file
 */
export async function importSuitesFromFile(file: File): Promise<TestSuite[]> {
  try {
    const content = await file.text();
    const parsed: StorageData = JSON.parse(content);

    // Version check
    if (parsed.version !== STORAGE_VERSION) {
      throw new Error('Incompatible suite file version');
    }

    // Convert date strings back to Date objects
    return parsed.suites.map((suite) => ({
      ...suite,
      createdAt: new Date(suite.createdAt),
      updatedAt: new Date(suite.updatedAt),
      tests: suite.tests.map((test) => ({
        ...test,
        lastRun: test.lastRun ? new Date(test.lastRun) : undefined,
      })),
    }));
  } catch (err) {
    throw new Error(`Failed to import suites: ${err instanceof Error ? err.message : String(err)}`);
  }
}
