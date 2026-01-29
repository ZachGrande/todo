import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the useTodos hook
jest.mock('../hooks/useTodos', () => ({
  useTodos: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router
jest.mock('react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
}));

import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../hooks/useAuth';

describe('App', () => {
  const mockUseTodos = {
    todos: [],
    loading: false,
    addTodo: jest.fn(),
    toggleComplete: jest.fn(),
    deleteTodo: jest.fn(),
    reorderTodos: jest.fn(),
    showMergePrompt: false,
    localTodosToMerge: [],
    handleMergeKeepBoth: jest.fn(),
    handleMergeUseCloud: jest.fn(),
    handleMergeUseLocal: jest.fn(),
    dismissMergePrompt: jest.fn(),
  };

  const mockUseAuth = {
    user: null,
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useTodos.mockReturnValue(mockUseTodos);
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('renders loading state', () => {
    useTodos.mockReturnValue({ ...mockUseTodos, loading: true });
    render(<App />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders main app when not loading', () => {
    render(<App />);
    
    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
  });

  it('renders todo list when todos exist', () => {
    useTodos.mockReturnValue({
      ...mockUseTodos,
      todos: [
        { id: '1', text: 'Test todo', completed: false },
      ],
    });
    render(<App />);
    
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('handles form submission with valid input', async () => {
    const mockAddTodo = jest.fn().mockResolvedValue();
    useTodos.mockReturnValue({ ...mockUseTodos, addTodo: mockAddTodo });
    render(<App />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(mockAddTodo).toHaveBeenCalledWith('New todo');
    });
  });

  it('shows error when submitting empty input', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.submit(input.closest('form'));
    
    expect(screen.getByText('Please enter a todo')).toBeInTheDocument();
  });

  it('clears error when typing after error', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    
    // Submit empty to trigger error
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('Please enter a todo')).toBeInTheDocument();
    
    // Type to clear error
    fireEvent.change(input, { target: { value: 'a' } });
    expect(screen.queryByText('Please enter a todo')).not.toBeInTheDocument();
  });

  it('clears input after successful submission', async () => {
    const mockAddTodo = jest.fn().mockResolvedValue();
    useTodos.mockReturnValue({ ...mockUseTodos, addTodo: mockAddTodo });
    render(<App />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('renders merge prompt when showMergePrompt is true', () => {
    useTodos.mockReturnValue({
      ...mockUseTodos,
      showMergePrompt: true,
      localTodosToMerge: [{ id: '1', text: 'Local todo', completed: false }],
      todos: [{ id: '2', text: 'Cloud todo', completed: false }],
    });
    render(<App />);
    
    expect(screen.getByText('Merge Your Todos?')).toBeInTheDocument();
  });

  it('does not render merge prompt when showMergePrompt is false', () => {
    render(<App />);
    
    expect(screen.queryByText('Merge Your Todos?')).not.toBeInTheDocument();
  });

  it('passes correct handlers to merge prompt', () => {
    const mockHandlers = {
      handleMergeKeepBoth: jest.fn(),
      handleMergeUseCloud: jest.fn(),
      handleMergeUseLocal: jest.fn(),
      dismissMergePrompt: jest.fn(),
    };
    useTodos.mockReturnValue({
      ...mockUseTodos,
      ...mockHandlers,
      showMergePrompt: true,
      localTodosToMerge: [{ id: '1', text: 'Local', completed: false }],
      todos: [{ id: '2', text: 'Cloud', completed: false }],
    });
    render(<App />);
    
    // Click keep both button
    fireEvent.click(screen.getByRole('button', { name: /keep both/i }));
    expect(mockHandlers.handleMergeKeepBoth).toHaveBeenCalled();
  });
});
