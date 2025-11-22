import { describe, it, expect } from 'vitest';
import { loadTemplates, getTemplateById, getTemplatesByCategory } from './templates';

describe('Template Service', () => {
  describe('loadTemplates', () => {
    it('loads all built-in templates', async () => {
      const templates = await loadTemplates();

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.length).toBe(6); // Should have 6 built-in templates
    });

    it('returns templates with required fields', async () => {
      const templates = await loadTemplates();

      templates.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('tags');
        expect(template).toHaveProperty('model');
        expect(template).toHaveProperty('provider');
        expect(template).toHaveProperty('yamlContent');
      });
    });

    it('parses template metadata correctly', async () => {
      const templates = await loadTemplates();
      const qaTemplate = templates.find((t) => t.id === 'simple-qa');

      expect(qaTemplate).toBeDefined();
      expect(qaTemplate?.name).toBe('Simple Q&A - Capital Cities');
      expect(qaTemplate?.model).toBe('gpt-4');
      expect(qaTemplate?.provider).toBe('openai');
      expect(qaTemplate?.category).toBe('qa');
    });

    it('assigns correct categories based on tags', async () => {
      const templates = await loadTemplates();

      const codeTemplate = templates.find((t) => t.id === 'code-generation');
      expect(codeTemplate?.category).toBe('code-generation');

      const browserTemplate = templates.find((t) => t.id === 'browser-agent');
      expect(browserTemplate?.category).toBe('browser');

      const langgraphTemplate = templates.find((t) => t.id === 'langgraph-agent');
      expect(langgraphTemplate?.category).toBe('langgraph');
    });
  });

  describe('getTemplateById', () => {
    it('returns template by ID', async () => {
      const template = await getTemplateById('simple-qa');

      expect(template).toBeDefined();
      expect(template?.id).toBe('simple-qa');
      expect(template?.name).toBe('Simple Q&A - Capital Cities');
    });

    it('returns null for non-existent ID', async () => {
      const template = await getTemplateById('nonexistent');

      expect(template).toBeNull();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('returns templates for given category', async () => {
      const qaTemplates = await getTemplatesByCategory('qa');

      expect(qaTemplates.length).toBeGreaterThan(0);
      qaTemplates.forEach((template) => {
        expect(template.category).toBe('qa');
      });
    });

    it('returns empty array for category with no templates', async () => {
      const safetyTemplates = await getTemplatesByCategory('safety');

      expect(safetyTemplates).toEqual([]);
    });

    it('filters correctly by code-generation category', async () => {
      const codeTemplates = await getTemplatesByCategory('code-generation');

      expect(codeTemplates.length).toBeGreaterThan(0);
      codeTemplates.forEach((template) => {
        expect(template.category).toBe('code-generation');
      });
    });
  });
});
