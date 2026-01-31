import { render, screen, waitFor } from '@testing-library/react';
import { debug } from 'jest-preview';
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

describe('App Visual Tests', () => {
  const mockUseTodosEmpty = {
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
    useTodos.mockReturnValue(mockUseTodosEmpty);
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('renders home page with no todo items and shows correct text', async () => {
    render(<App />);

    // Verify the main heading appears
    expect(screen.getByText('Todo List')).toBeInTheDocument();

    // Verify the input placeholder text appears
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();

    // Wait for the empty state message (it has a 200ms animation delay)
    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });

    // Open jest-preview to see the rendered component in browser
    debug();

    // Verify there are no todo items rendered (empty state)
    const todoItems = screen.queryAllByRole('listitem');
    expect(todoItems).toHaveLength(0);
  });
});
