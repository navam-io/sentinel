import type { Template } from '../components/templates/TemplateCard';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { resolveResource } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

/**
 * Template Service
 *
 * Load and manage test templates from filesystem
 * Part of Feature 7: Template Gallery & Test Suites
 */

/**
 * Parse YAML template to extract metadata
 */
function parseTemplateMetadata(id: string, yaml: string): Template {
  // Simple YAML parsing (extract key fields)
  const lines = yaml.split('\n');
  let name = '';
  let description = '';
  let model = '';
  let provider = '';
  let categoryFromYaml = '';
  const tags: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('name:')) {
      name = trimmed.substring(5).trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('description:')) {
      description = trimmed.substring(12).trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('model:')) {
      model = trimmed.substring(6).trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('provider:')) {
      provider = trimmed.substring(9).trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('category:')) {
      categoryFromYaml = trimmed.substring(9).trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('- ') && lines[i - 1]?.trim() === 'tags:') {
      tags.push(trimmed.substring(2).trim());
    }
  }

  // Use category from YAML, or infer from tags/filename as fallback
  let category: Template['category'] = categoryFromYaml as Template['category'];

  if (!category) {
    // Fallback: Determine category from tags or filename
    if (tags.includes('code-generation') || id.includes('code')) {
      category = 'code-generation';
    } else if (tags.includes('browser') || id.includes('browser')) {
      category = 'browser';
    } else if (tags.includes('multi-turn') || id.includes('multi')) {
      category = 'multi-turn';
    } else if (tags.includes('langgraph') || id.includes('langgraph')) {
      category = 'langgraph';
    } else if (tags.includes('safety') || id.includes('safety') || id.includes('injection')) {
      category = 'safety';
    } else if (id.includes('data-analysis')) {
      category = 'data-analysis';
    } else if (id.includes('reasoning')) {
      category = 'reasoning';
    } else if (id.includes('tool')) {
      category = 'tool-use';
    } else if (id.includes('api')) {
      category = 'api-testing';
    } else if (id.includes('ui')) {
      category = 'ui-testing';
    } else if (id.includes('regression')) {
      category = 'regression';
    } else {
      category = 'qa';
    }
  }

  return {
    id,
    name: name || `Template ${id}`,
    description: description || 'No description available',
    category,
    tags,
    model,
    provider,
    yamlContent: yaml,
  };
}

/**
 * Load templates from filesystem
 * @param templatesPath - Relative or absolute path to templates folder
 */
export async function loadTemplates(templatesPath?: string): Promise<Template[]> {
  const templates: Template[] = [];

  try {
    // Default to artifacts/templates if no path provided
    const folderPath = templatesPath || 'artifacts/templates';

    console.log(`Loading templates from: ${folderPath}`);

    let fullPath: string;

    if (folderPath.startsWith('/') || folderPath.match(/^[A-Z]:\\/)) {
      // Absolute path provided by user
      fullPath = folderPath;
    } else {
      // Relative path - need to resolve from project root
      // Always use Rust command to get project root (works in both dev and prod)
      try {
        const projectRoot = await invoke<string>('get_project_root');
        fullPath = `${projectRoot}/${folderPath}`;
        console.log(`Project root: ${projectRoot}`);
        console.log(`Templates path: ${fullPath}`);
      } catch (err) {
        console.error('Failed to get project root:', err);

        // Fallback: try resolveResource for production bundles
        try {
          fullPath = await resolveResource(folderPath);
          console.log(`Using bundled resources path: ${fullPath}`);
        } catch {
          throw new Error('Could not determine project root directory');
        }
      }
    }

    console.log(`Resolved templates path: ${fullPath}`);

    // Read directory contents
    const entries = await readDir(fullPath);

    // Filter YAML files
    const yamlFiles = entries.filter(
      (entry) =>
        entry.isFile &&
        entry.name &&
        (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))
    );

    console.log(`Found ${yamlFiles.length} YAML template files`);

    // Load each template
    for (const file of yamlFiles) {
      if (!file.name) continue;

      try {
        const filePath = `${fullPath}/${file.name}`;
        const content = await readTextFile(filePath);

        // Extract template ID from filename (remove .yaml/.yml extension)
        const templateId = file.name.replace(/\.(yaml|yml)$/, '');

        const template = parseTemplateMetadata(templateId, content);
        templates.push(template);

        console.log(`Loaded template: ${template.name} (${templateId})`);
      } catch (error) {
        console.error(`Failed to load template ${file.name}:`, error);
      }
    }

    console.log(`Successfully loaded ${templates.length} templates`);
    return templates;

  } catch (error) {
    console.error('Failed to load templates from filesystem:', error);

    // Fallback to empty array if templates can't be loaded
    console.warn('Templates folder not accessible. No templates loaded.');
    return [];
  }
}

/**
 * Get a template by ID
 */
export async function getTemplateById(
  id: string,
  templatesPath?: string
): Promise<Template | null> {
  const templates = await loadTemplates(templatesPath);
  return templates.find((t) => t.id === id) || null;
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(
  category: Template['category'],
  templatesPath?: string
): Promise<Template[]> {
  const templates = await loadTemplates(templatesPath);
  return templates.filter((t) => t.category === category);
}
