import type { TestCategory } from '../types/test-spec';

export interface CategoryConfig {
  label: string;
  color: string;
  description: string;
}

export const CATEGORY_CONFIG: Record<TestCategory, CategoryConfig> = {
  'qa': {
    label: 'Q&A',
    color: 'bg-blue-500',
    description: 'Question answering and information retrieval'
  },
  'code-generation': {
    label: 'Code Generation',
    color: 'bg-purple-500',
    description: 'Code generation and completion tasks'
  },
  'browser': {
    label: 'Browser Agents',
    color: 'bg-green-500',
    description: 'Web automation and browser interactions'
  },
  'multi-turn': {
    label: 'Multi-turn',
    color: 'bg-orange-500',
    description: 'Conversational and multi-step interactions'
  },
  'langgraph': {
    label: 'LangGraph',
    color: 'bg-cyan-500',
    description: 'LangGraph agentic workflows'
  },
  'safety': {
    label: 'Safety',
    color: 'bg-red-500',
    description: 'Safety and alignment testing'
  },
  'data-analysis': {
    label: 'Data Analysis',
    color: 'bg-indigo-500',
    description: 'Data processing and analysis tasks'
  },
  'reasoning': {
    label: 'Reasoning',
    color: 'bg-pink-500',
    description: 'Logic, reasoning, and problem-solving'
  },
  'tool-use': {
    label: 'Tool Use',
    color: 'bg-yellow-500',
    description: 'Function calling and tool integration'
  },
  'api-testing': {
    label: 'API Testing',
    color: 'bg-teal-500',
    description: 'REST API and endpoint testing'
  },
  'ui-testing': {
    label: 'UI Testing',
    color: 'bg-lime-500',
    description: 'User interface and visual testing'
  },
  'regression': {
    label: 'Regression',
    color: 'bg-amber-500',
    description: 'Regression and consistency testing'
  }
};

export function getCategoryConfig(category?: TestCategory): CategoryConfig {
  if (!category || !CATEGORY_CONFIG[category]) {
    return {
      label: 'Uncategorized',
      color: 'bg-gray-500',
      description: 'No category assigned'
    };
  }
  return CATEGORY_CONFIG[category];
}
