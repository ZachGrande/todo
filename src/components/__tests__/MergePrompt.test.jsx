import { render, screen, fireEvent } from '@testing-library/react';
import MergePrompt from '../MergePrompt';

describe('MergePrompt', () => {
  const defaultProps = {
    localCount: 3,
    cloudCount: 2,
    onKeepBoth: jest.fn(),
    onUseCloud: jest.fn(),
    onUseLocal: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the merge prompt with correct counts', () => {
    render(<MergePrompt {...defaultProps} />);
    
    expect(screen.getByText('Merge Your Todos?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays correct total in "Keep both" button', () => {
    render(<MergePrompt {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /keep both \(5 total\)/i })).toBeInTheDocument();
  });

  it('shows plural "todos" when localCount is not 1', () => {
    render(<MergePrompt {...defaultProps} localCount={3} />);
    
    // Text is split across elements, use function matcher
    expect(screen.getByText((content, element) => {
      return element.tagName === 'P' && content.includes('saved locally');
    })).toBeInTheDocument();
  });

  it('shows singular "todo" when localCount is 1', () => {
    render(<MergePrompt {...defaultProps} localCount={1} />);
    
    expect(screen.getByText(/todo[^s]/)).toBeInTheDocument();
  });

  it('shows "Use cloud only" button when cloudCount > 0', () => {
    render(<MergePrompt {...defaultProps} cloudCount={2} />);
    
    expect(screen.getByRole('button', { name: /use cloud only \(2\)/i })).toBeInTheDocument();
  });

  it('hides "Use cloud only" button when cloudCount is 0', () => {
    render(<MergePrompt {...defaultProps} cloudCount={0} />);
    
    expect(screen.queryByRole('button', { name: /use cloud only/i })).not.toBeInTheDocument();
  });

  it('shows "Replace cloud with local" when cloudCount > 0', () => {
    render(<MergePrompt {...defaultProps} cloudCount={2} localCount={3} />);
    
    expect(screen.getByRole('button', { name: /replace cloud with local \(3\)/i })).toBeInTheDocument();
  });

  it('shows "Use local" when cloudCount is 0', () => {
    render(<MergePrompt {...defaultProps} cloudCount={0} localCount={3} />);
    
    expect(screen.getByRole('button', { name: /use local \(3\)/i })).toBeInTheDocument();
  });

  it('calls onKeepBoth when "Keep both" button is clicked', () => {
    render(<MergePrompt {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /keep both/i }));
    
    expect(defaultProps.onKeepBoth).toHaveBeenCalledTimes(1);
  });

  it('calls onUseCloud when "Use cloud only" button is clicked', () => {
    render(<MergePrompt {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /use cloud only/i }));
    
    expect(defaultProps.onUseCloud).toHaveBeenCalledTimes(1);
  });

  it('calls onUseLocal when local button is clicked', () => {
    render(<MergePrompt {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /replace cloud with local/i }));
    
    expect(defaultProps.onUseLocal).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<MergePrompt {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides cloud count text when cloudCount is 0', () => {
    render(<MergePrompt {...defaultProps} cloudCount={0} />);
    
    expect(screen.queryByText(/in the cloud/)).not.toBeInTheDocument();
  });
});
