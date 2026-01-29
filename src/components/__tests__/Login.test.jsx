import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router
jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

// Mock the google icon import
jest.mock('../../assets/google.png', () => 'google-icon.png');

import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router';

describe('Login', () => {
  const mockNavigate = jest.fn();
  const mockSignInWithGoogle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        signInWithGoogle: mockSignInWithGoogle,
      });
    });

    it('renders welcome message', () => {
      render(<Login />);
      
      expect(screen.getByText('Welcome to Todo')).toBeInTheDocument();
    });

    it('renders sign in description', () => {
      render(<Login />);
      
      expect(screen.getByText('Sign in to sync your todos across devices')).toBeInTheDocument();
    });

    it('renders Google sign in button', () => {
      render(<Login />);
      
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('renders "Continue without signing in" button', () => {
      render(<Login />);
      
      expect(screen.getByRole('button', { name: /continue without signing in/i })).toBeInTheDocument();
    });

    it('calls signInWithGoogle and navigates on successful sign in', async () => {
      mockSignInWithGoogle.mockResolvedValue();
      render(<Login />);
      
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));
      
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles sign in error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSignInWithGoogle.mockRejectedValue(new Error('Sign in failed'));
      render(<Login />);
      
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to sign in:', expect.any(Error));
      });
      consoleSpy.mockRestore();
    });

    it('navigates to home when "Continue without signing in" is clicked', () => {
      render(<Login />);
      
      fireEvent.click(screen.getByRole('button', { name: /continue without signing in/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('when user is already logged in', () => {
    it('redirects to home page', () => {
      useAuth.mockReturnValue({
        user: { displayName: 'John' },
        signInWithGoogle: mockSignInWithGoogle,
      });
      
      render(<Login />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
