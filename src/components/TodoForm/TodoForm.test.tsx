// src/components/TodoForm/TodoForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './TodoForm';

describe('TodoForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSubmit: mockOnSubmit,
        mode: 'add' as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the form when isOpen is true', () => {
            render(<TodoForm {...defaultProps} />);
            expect(screen.getByText('Add New Todo')).toBeInTheDocument();
        });

        it('should not render when isOpen is false', () => {
            render(<TodoForm {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Add New Todo')).not.toBeInTheDocument();
        });

        it('should show edit mode title when mode is edit', () => {
            render(<TodoForm {...defaultProps} mode="edit" />);
            expect(screen.getByText('Edit Todo')).toBeInTheDocument();
        });
    });

    describe('Form Interaction', () => {
        it('should allow typing in title field', async () => {
            render(<TodoForm {...defaultProps} />);

            const titleInput = screen.getByLabelText(/title/i);
            await userEvent.type(titleInput, 'New Todo Item');

            expect(titleInput).toHaveValue('New Todo Item');
        });

        it('should validate required title field', async () => {
            render(<TodoForm {...defaultProps} />);

            const submitButton = screen.getByText('Add Todo');
            await userEvent.click(submitButton);

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('should submit form with valid data', async () => {
            render(<TodoForm {...defaultProps} />);

            await userEvent.type(screen.getByLabelText(/title/i), 'Test Todo');
            await userEvent.type(screen.getByLabelText(/description/i), 'Test Description');
            await userEvent.click(screen.getByText('Add Todo'));

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: 'Test Todo',
                        description: 'Test Description',
                    }),
                    undefined
                );
            });
        });

        it('should close form when cancel button is clicked', async () => {
            render(<TodoForm {...defaultProps} />);

            await userEvent.click(screen.getByText('Cancel'));
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should close form when backdrop is clicked', async () => {
            render(<TodoForm {...defaultProps} />);

            const backdrop = screen.getByTestId('modal-backdrop');
            fireEvent.click(backdrop);

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('Priority Selection', () => {
        it('should have LOW priority selected by default', () => {
            render(<TodoForm {...defaultProps} />);
            const lowButton = screen.getByRole('button', { name: /low/i });
            expect(lowButton).toHaveClass('bg-green-600');
        });

        it('should change priority when clicked', async () => {
            render(<TodoForm {...defaultProps} />);

            const highButton = screen.getByRole('button', { name: /high/i });
            await userEvent.click(highButton);

            expect(highButton).toHaveClass('bg-red-600');
        });
    });

    describe('Edit Mode', () => {
        const existingTodo = {
            id: '1',
            title: 'Existing Todo',
            description: 'Existing Description',
            completed: false,
            priority: 'HIGH' as const,
            category: 'Work',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        };

        it('should populate form with existing todo data', () => {
            render(<TodoForm {...defaultProps} todo={existingTodo} mode="edit" />);

            expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Todo');
            expect(screen.getByLabelText(/description/i)).toHaveValue('Existing Description');
        });

        it('should submit updated todo data', async () => {
            render(<TodoForm {...defaultProps} todo={existingTodo} mode="edit" />);

            const titleInput = screen.getByLabelText(/title/i);
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, 'Updated Todo');

            await userEvent.click(screen.getByText('Update Todo'));

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: 'Updated Todo',
                    }),
                    '1'
                );
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<TodoForm {...defaultProps} />);

            expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        });

        it('should support keyboard navigation', async () => {
            render(<TodoForm {...defaultProps} />);

            const titleInput = screen.getByLabelText(/title/i);
            titleInput.focus();

            await userEvent.tab();
            expect(screen.getByLabelText(/description/i)).toHaveFocus();
        });

        it('should close on Escape key', async () => {
            render(<TodoForm {...defaultProps} />);

            await userEvent.keyboard('{Escape}');
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('Dark Mode', () => {
        it('should apply dark mode styles when darkMode is true', () => {
            render(<TodoForm {...defaultProps} darkMode={true} />);

            const modal = screen.getByRole('dialog');
            expect(modal).toHaveClass('bg-gray-800');
        });
    });
});