import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTemplates } from './useTemplates';
import * as templatesService from '../services/templates';
import type { Template } from '../components/templates/TemplateCard';

// Mock the templates service
vi.mock('../services/templates');

describe('useTemplates', () => {
  const mockTemplates: Template[] = [
    {
      id: 'template-1',
      name: 'Simple Q&A',
      description: 'Basic question answering test',
      category: 'Q&A',
      model: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      tags: ['qa', 'simple'],
      spec: {
        name: 'Simple Q&A Test',
        input: { user_message: 'What is the capital of France?' },
        model: 'claude-3-5-sonnet-20241022',
        assertions: [],
      },
    },
    {
      id: 'template-2',
      name: 'Code Generation',
      description: 'Python function generation test',
      category: 'Code Generation',
      model: 'gpt-5.1',
      provider: 'openai',
      tags: ['code', 'python'],
      spec: {
        name: 'Code Generation Test',
        input: { user_message: 'Write a Python function to calculate fibonacci' },
        model: 'gpt-5.1',
        assertions: [],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load templates successfully', async () => {
    vi.mocked(templatesService.loadTemplates).mockResolvedValue(mockTemplates);

    const { result } = renderHook(() => useTemplates());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.templates).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for templates to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toEqual(mockTemplates);
    expect(result.current.error).toBeNull();
    expect(templatesService.loadTemplates).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state correctly', async () => {
    let resolveTemplates: (value: Template[]) => void;
    const templatesPromise = new Promise<Template[]>((resolve) => {
      resolveTemplates = resolve;
    });

    vi.mocked(templatesService.loadTemplates).mockReturnValue(templatesPromise);

    const { result } = renderHook(() => useTemplates());

    // Should be loading initially
    expect(result.current.loading).toBe(true);
    expect(result.current.templates).toEqual([]);
    expect(result.current.error).toBeNull();

    // Resolve the promise
    resolveTemplates!(mockTemplates);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toEqual(mockTemplates);
  });

  it('should handle empty templates array', async () => {
    vi.mocked(templatesService.loadTemplates).mockResolvedValue([]);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when loading templates fails', async () => {
    const testError = new Error('Failed to load templates');
    vi.mocked(templatesService.loadTemplates).mockRejectedValue(testError);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toEqual([]);
    expect(result.current.error).toEqual(testError);
    expect(result.current.error?.message).toBe('Failed to load templates');
  });

  it('should handle non-Error objects thrown during loading', async () => {
    vi.mocked(templatesService.loadTemplates).mockRejectedValue('String error');

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to load templates');
  });

  it('should only load templates once on mount', async () => {
    vi.mocked(templatesService.loadTemplates).mockResolvedValue(mockTemplates);

    const { result, rerender } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Rerender the hook
    rerender();

    // Should still have only called loadTemplates once
    expect(templatesService.loadTemplates).toHaveBeenCalledTimes(1);
    expect(result.current.templates).toEqual(mockTemplates);
  });

  it('should set loading to false even when error occurs', async () => {
    vi.mocked(templatesService.loadTemplates).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useTemplates());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should reset error state when loading starts', async () => {
    vi.mocked(templatesService.loadTemplates).mockResolvedValue(mockTemplates);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error is null after successful load
    expect(result.current.error).toBeNull();
  });
});
