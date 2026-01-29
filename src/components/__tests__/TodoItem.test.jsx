import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../TodoItem';

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
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
  motion: {
    div: ({ children, className, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...props }) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

import { useSortable } from '@dnd-kit/sortable';

describe('TodoItem', () => {
  const defaultProps = {
    todo: {
      id: '1',
      text: 'Test todo',
      completed: false,
    },
    onToggle: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    });
  });

  it('renders todo text', () => {
    render(<TodoItem {...defaultProps} />);
    
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('renders checkbox unchecked when todo is not completed', () => {
    render(<TodoItem {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checkbox checked when todo is completed', () => {
    render(<TodoItem {...defaultProps} todo={{ ...defaultProps.todo, completed: true }} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('applies strikethrough styling when todo is completed', () => {
    render(<TodoItem {...defaultProps} todo={{ ...defaultProps.todo, completed: true }} />);
    
    const todoText = screen.getByText('Test todo');
    expect(todoText).toHaveClass('line-through');
  });

  it('does not apply strikethrough styling when todo is not completed', () => {
    render(<TodoItem {...defaultProps} />);
    
    const todoText = screen.getByText('Test todo');
    expect(todoText).not.toHaveClass('line-through');
  });

  it('calls onToggle with todo id when checkbox is clicked', () => {
    render(<TodoItem {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    
    expect(defaultProps.onToggle).toHaveBeenCalledWith('1');
  });

  it('renders delete button', () => {
    render(<TodoItem {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onDelete with todo id when delete button is clicked', () => {
    render(<TodoItem {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('calls useSortable with the correct id', () => {
    render(<TodoItem {...defaultProps} />);
    
    expect(useSortable).toHaveBeenCalledWith({ id: '1' });
  });

  it('applies dragging styles when isDragging is true', () => {
    useSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    });
    
    render(<TodoItem {...defaultProps} />);
    
    // The li element should have inline styles for zIndex when dragging
    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveStyle({ zIndex: 50 });
  });
});
