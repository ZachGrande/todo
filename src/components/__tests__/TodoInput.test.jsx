import { render, screen, fireEvent } from '@testing-library/react';
import TodoInput from '../TodoInput';

describe('TodoInput', () => {
  const defaultProps = {
    inputValue: '',
    onInputChange: jest.fn(),
    onSubmit: jest.fn(),
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input with correct placeholder', () => {
    render(<TodoInput {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
  });

  it('renders input with the provided value', () => {
    render(<TodoInput {...defaultProps} inputValue="Test todo" />);
    
    expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument();
  });

  it('renders Add button', () => {
    render(<TodoInput {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('calls onInputChange when typing in the input', () => {
    render(<TodoInput {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'New todo' } });
    
    expect(defaultProps.onInputChange).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when form is submitted', () => {
    const mockOnSubmit = jest.fn((e) => e.preventDefault());
    render(<TodoInput {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const form = screen.getByRole('button', { name: /add/i }).closest('form');
    fireEvent.submit(form);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not display error message when error is null', () => {
    render(<TodoInput {...defaultProps} error={null} />);
    
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<TodoInput {...defaultProps} error="Todo cannot be empty" />);
    
    expect(screen.getByText('Todo cannot be empty')).toBeInTheDocument();
  });

  it('applies error styling to input when error exists', () => {
    render(<TodoInput {...defaultProps} error="Error message" />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    expect(input).toHaveClass('border-red-500');
  });

  it('does not apply error styling when no error', () => {
    render(<TodoInput {...defaultProps} error={null} />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    expect(input).not.toHaveClass('border-red-500');
    expect(input).toHaveClass('border-gray-700');
  });
});
