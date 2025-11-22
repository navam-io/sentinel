import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import ModelNode from './ModelNode';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the useHandleConnection hook
vi.mock('../../hooks/useHandleConnection', () => ({
	useHandleConnection: vi.fn(() => false)
}));

describe('ModelNode', () => {
	const defaultProps: NodeProps = {
		id: 'model-1',
		data: { label: 'Model', model: 'gpt-5.1', temperature: 0.7 },
		type: 'model',
		selected: false,
		isConnectable: true,
		xPos: 100,
		yPos: 100,
		dragging: false,
		zIndex: 0,
		positionAbsoluteX: 100,
		positionAbsoluteY: 100
	};

	beforeEach(() => {
		// Reset store to initial state
		useCanvasStore.setState({
			nodes: [
				{
					id: 'model-1',
					type: 'model',
					data: { label: 'Model', model: 'gpt-5.1', temperature: 0.7 },
					position: { x: 100, y: 100 }
				}
			],
			edges: [],
			lastCanvasClickPosition: { x: 0, y: 0 }
		});
	});

	describe('Rendering', () => {
		it('should render model node', () => {
			render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// Check for the node title specifically
			expect(screen.getByText((content, element) => {
				return element?.classList.contains('node-title') && content === 'Model';
			})).toBeInTheDocument();
		});

		it('should render with default model selection', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;
			expect(select).toHaveValue('gpt-5.1');
		});

		it('should render with default temperature', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			expect(slider).toHaveValue('0.7');
		});

		it('should render temperature label with value', () => {
			render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(screen.getByText(/Temperature: 0.7/)).toBeInTheDocument();
		});

		it('should render delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toBeInTheDocument();
		});

		it('should render CPU icon', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const icon = container.querySelector('.node-icon');
			expect(icon).toBeInTheDocument();
		});

		it('should render both target and source handles', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// Should have 2 handles (target at top, source at bottom)
			const handles = container.querySelectorAll('[data-handlepos]');
			expect(handles.length).toBe(2);
		});

		it('should render all 13 model options', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;
			const options = select.querySelectorAll('option');

			// 13 models total (3 Claude 4.x, 4 GPT-5, 5 GPT-4, 1 GPT-3.5)
			expect(options.length).toBe(13);
		});
	});

	describe('User Interactions', () => {
		it('should update model on selection change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;
			fireEvent.change(select, { target: { value: 'claude-sonnet-4-5-20250929' } });

			expect(select.value).toBe('claude-sonnet-4-5-20250929');
		});

		it('should call updateNode when model changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;
			fireEvent.change(select, { target: { value: 'gpt-4o' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('model-1', { model: 'gpt-4o' });
		});

		it('should update temperature on slider change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			fireEvent.change(slider, { target: { value: '1.5' } });

			expect(slider.value).toBe('1.5');
		});

		it('should call updateNode when temperature changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			fireEvent.change(slider, { target: { value: '0.3' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('model-1', { temperature: 0.3 });
		});

		it('should display current temperature value in label', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// Check temperature label displays current value
			const label = container.querySelector('label[for="temperature-range"]');
			expect(label).toHaveTextContent('Temperature: 0.7');
		});

		it('should call removeNode when delete button is clicked', () => {
			const removeNodeSpy = vi.spyOn(useCanvasStore.getState(), 'removeNode');

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;
			fireEvent.click(deleteButton);

			expect(removeNodeSpy).toHaveBeenCalledWith('model-1');
		});

		it('should stop propagation on delete button click', () => {
			const stopPropagationSpy = vi.fn();

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;

			const event = new MouseEvent('click', { bubbles: true });
			event.stopPropagation = stopPropagationSpy;

			deleteButton.dispatchEvent(event);

			expect(stopPropagationSpy).toHaveBeenCalled();
		});
	});

	describe('State Management', () => {
		it('should initialize with model from data prop', () => {
			const customModel = 'claude-haiku-4-5-20251001';
			const propsWithCustomModel = {
				...defaultProps,
				data: { label: 'Model', model: customModel, temperature: 0.7 }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...propsWithCustomModel} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;
			expect(select.value).toBe(customModel);
		});

		it('should use default model when data.model is not provided', () => {
			const propsWithoutModel = {
				...defaultProps,
				data: { label: 'Model' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...propsWithoutModel} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;
			expect(select.value).toBe('gpt-5.1');
		});

		it('should initialize with temperature from data prop', () => {
			const customTemp = 1.8;
			const propsWithCustomTemp = {
				...defaultProps,
				data: { label: 'Model', model: 'gpt-5.1', temperature: customTemp }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...propsWithCustomTemp} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			expect(slider.value).toBe(String(customTemp));
		});

		it('should use default temperature when data.temperature is not provided', () => {
			const propsWithoutTemp = {
				...defaultProps,
				data: { label: 'Model', model: 'gpt-5.1' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...propsWithoutTemp} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			expect(slider.value).toBe('0.7');
		});

		it('should maintain local state for model selection', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;

			// Change model
			fireEvent.change(select, { target: { value: 'gpt-4o-mini' } });
			expect(select.value).toBe('gpt-4o-mini');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(select.value).toBe('gpt-4o-mini');
		});

		it('should maintain local state for temperature', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;

			// Change temperature
			fireEvent.change(slider, { target: { value: '0.2' } });
			expect(slider.value).toBe('0.2');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(slider.value).toBe('0.2');
		});
	});

	describe('Styling and CSS Classes', () => {
		it('should apply sentinel-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.sentinel-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply model-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.model-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply nodrag and nopan classes to select', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select');
			expect(select).toHaveClass('nodrag');
			expect(select).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to slider', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range');
			expect(slider).toHaveClass('nodrag');
			expect(slider).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveClass('nodrag');
			expect(deleteButton).toHaveClass('nopan');
		});
	});

	describe('Accessibility', () => {
		it('should have title attribute on delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveAttribute('title', 'Delete node');
		});

		it('should have label for model select', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const label = container.querySelector('label[for="model-select"]');
			expect(label).toHaveTextContent('Model');
			expect(label).toHaveAttribute('for', 'model-select');
		});

		it('should have label for temperature slider', () => {
			render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const label = screen.getByText(/Temperature:/);
			expect(label).toHaveAttribute('for', 'temperature-range');
		});
	});

	describe('Edge Cases', () => {
		it('should handle temperature at minimum bound (0.1)', () => {
			const propsWithMinTemp = {
				...defaultProps,
				data: { label: 'Model', model: 'gpt-5.1', temperature: 0.1 }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...propsWithMinTemp} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			expect(slider.value).toBe('0.1');

			const label = container.querySelector('label[for="temperature-range"]');
			expect(label).toHaveTextContent('Temperature: 0.1');
		});

		it('should handle temperature at maximum bound (2)', () => {
			const propsWithMaxTemp = {
				...defaultProps,
				data: { label: 'Model', model: 'gpt-5.1', temperature: 2 }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...propsWithMaxTemp} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			expect(slider.value).toBe('2');
			expect(screen.getByText(/Temperature: 2/)).toBeInTheDocument();
		});

		it('should handle all Claude model selections', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;

			const claudeModels = [
				'claude-sonnet-4-5-20250929',
				'claude-haiku-4-5-20251001',
				'claude-opus-4-1-20250805'
			];

			claudeModels.forEach(model => {
				fireEvent.change(select, { target: { value: model } });
				expect(select.value).toBe(model);
			});
		});

		it('should handle all GPT model selections', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#model-select') as HTMLSelectElement;

			const gptModels = [
				'gpt-5.1', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano',
				'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4',
				'gpt-3.5-turbo'
			];

			gptModels.forEach(model => {
				fireEvent.change(select, { target: { value: model } });
				expect(select.value).toBe(model);
			});
		});

		it('should handle temperature slider with step of 0.1', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ModelNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const slider = container.querySelector('#temperature-range') as HTMLInputElement;
			expect(slider).toHaveAttribute('step', '0.1');

			// Test fractional temperature
			fireEvent.change(slider, { target: { value: '0.85' } });
			expect(slider.value).toBe('0.85');
		});
	});
});
