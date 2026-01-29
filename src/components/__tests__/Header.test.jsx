import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router
jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router';

describe('Header', () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  describe('when user is logged in', () => {
    const mockUser = {
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
    };

    beforeEach(() => {
      useAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });
    });

    it('renders user avatar', () => {
      render(<Header />);
      
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('renders user display name', () => {
      render(<Header />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders sign out button', () => {
      render(<Header />);
      
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('does not render sign in button', () => {
      render(<Header />);
      
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });

    it('calls logout when sign out button is clicked', async () => {
      mockLogout.mockResolvedValue();
      render(<Header />);
      
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('handles logout error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLogout.mockRejectedValue(new Error('Logout failed'));
      render(<Header />);
      
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
      
      // Wait for the async operation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sign out:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
      });
    });

    it('renders sign in button', () => {
      render(<Header />);
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('does not render sign out button', () => {
      render(<Header />);
      
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });

    it('does not render user avatar', () => {
      render(<Header />);
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('navigates to /login when sign in button is clicked', () => {
      render(<Header />);
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders the app title', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(<Header />);
    
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });
});
