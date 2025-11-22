import { useState, useEffect } from 'react';
import type { Template } from '../components/templates/TemplateCard';
import { loadTemplates } from '../services/templates';

/**
 * useTemplates Hook
 *
 * Load and manage templates
 * Part of Feature 7: Template Gallery & Test Suites
 */
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);
        const loadedTemplates = await loadTemplates();
        setTemplates(loadedTemplates);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load templates'));
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  return { templates, loading, error };
}
