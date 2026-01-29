import { render, screen } from '@testing-library/react';
import TodoList from '../TodoList';

// Mock @dnd-kit/core
const mockOnDragEnd = jest.fn();
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }) => {
    mockOnDragEnd.mockImplementation(onDragEnd);
    return <div data-testid="dnd-context">{children}</div>;
  },
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  TouchSensor: jest.fn(),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock @dnd-kit/utilities
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => null),
    },
  },
}));

// Mock motion/react - filter out Framer Motion specific props
jest.mock('motion/react', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: {
    div: ({ children, className, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...props }) => (
      <div className={className} {...props}>{children}</div>
    ),
    p: ({ children, className, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...props }) => (
      <p className={className} {...props}>{children}</p>
    ),
  },
}));

describe('TodoList', () => {
  const defaultProps = {
    todos: [
      { id: '1', text: 'First todo', completed: false },
      { id: '2', text: 'Second todo', completed: true },
    ],
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onReorder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all todos', () => {
    render(<TodoList {...defaultProps} />);
    
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  it('renders correct number of todo items', () => {
    render(<TodoList {...defaultProps} />);
    
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('displays empty state message when todos array is empty', () => {
    render(<TodoList {...defaultProps} todos={[]} />);
    
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });

  it('does not display empty state message when todos exist', () => {
    render(<TodoList {...defaultProps} />);
    
    expect(screen.queryByText('No todos yet. Add one above!')).not.toBeInTheDocument();
  });

  it('wraps content in DndContext', () => {
    render(<TodoList {...defaultProps} />);
    
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
  });

  it('wraps content in SortableContext', () => {
    render(<TodoList {...defaultProps} />);
    
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('renders checkboxes with correct states', () => {
    render(<TodoList {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('renders delete buttons for each todo', () => {
    render(<TodoList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onReorder when drag ends with different items', () => {
    render(<TodoList {...defaultProps} />);
    
    // Simulate drag end event
    mockOnDragEnd({ active: { id: '1' }, over: { id: '2' } });
    
    expect(defaultProps.onReorder).toHaveBeenCalledWith('1', '2');
  });

  it('does not call onReorder when active and over are the same', () => {
    render(<TodoList {...defaultProps} />);
    
    // Simulate drag end with same ids
    mockOnDragEnd({ active: { id: '1' }, over: { id: '1' } });
    
    expect(defaultProps.onReorder).not.toHaveBeenCalled();
  });

  it('does not call onReorder when over is null', () => {
    render(<TodoList {...defaultProps} />);
    
    // Simulate drag end with no drop target
    mockOnDragEnd({ active: { id: '1' }, over: null });
    
    expect(defaultProps.onReorder).not.toHaveBeenCalled();
  });
});
