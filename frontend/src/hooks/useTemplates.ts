import { useState, useEffect } from 'react';
import type { Template } from '../components/templates/TemplateCard';
import { loadTemplates } from '../services/templates';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * useTemplates Hook
 *
 * Load and manage templates from configured folder
 * Part of Feature 7: Template Gallery & Test Suites
 */
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const templatesFolder = useSettingsStore((state) => state.templatesFolder);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);
        const loadedTemplates = await loadTemplates(templatesFolder);
        setTemplates(loadedTemplates);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load templates'));
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [templatesFolder]); // Re-load when templates folder changes

  return { templates, loading, error };
}
