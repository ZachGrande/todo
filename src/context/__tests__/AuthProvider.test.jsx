import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../AuthProvider';
import { AuthContext } from '../AuthContext';
import { useContext } from 'react';

// Mock Firebase
jest.mock('../../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Test component to consume context
function TestConsumer() {
  const context = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user">{context.user?.displayName || 'No user'}</span>
      <span data-testid="loading">{context.loading.toString()}</span>
      <button onClick={context.signInWithGoogle}>Sign In</button>
      <button onClick={context.logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  let authStateCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn(); // unsubscribe function
    });
  });

  it('provides initial loading state as true', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('sets loading to false after auth state is determined', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate auth state change wrapped in act
    await act(async () => {
      authStateCallback(null);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('sets user when auth state changes to logged in', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const mockUser = { uid: '123', displayName: 'John Doe' };
    await act(async () => {
      authStateCallback(mockUser);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
  });

  it('sets user to null when auth state changes to logged out', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      authStateCallback(null);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  it('signInWithGoogle calls Firebase signInWithPopup', async () => {
    signInWithPopup.mockResolvedValue({ user: { uid: '123' } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  it('signInWithGoogle logs error and rethrows on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const testError = new Error('Sign in failed');
    signInWithPopup.mockRejectedValue(testError);

    // Test consumer that catches the thrown error
    function TestConsumerWithCatch() {
      const context = useContext(AuthContext);
      const handleClick = async () => {
        try {
          await context.signInWithGoogle();
        } catch {
          // Error is expected to be thrown
        }
      };
      return <button onClick={handleClick}>Sign In</button>;
    }

    render(
      <AuthProvider>
        <TestConsumerWithCatch />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error signing in with Google:', testError);
    });

    consoleSpy.mockRestore();
  });

  it('logout calls Firebase signOut', async () => {
    signOut.mockResolvedValue();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });

  it('logout logs error and rethrows on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const testError = new Error('Sign out failed');
    signOut.mockRejectedValue(testError);

    // Test consumer that catches the thrown error
    function TestConsumerWithCatch() {
      const context = useContext(AuthContext);
      const handleClick = async () => {
        try {
          await context.logout();
        } catch {
          // Error is expected to be thrown
        }
      };
      return <button onClick={handleClick}>Logout</button>;
    }

    render(
      <AuthProvider>
        <TestConsumerWithCatch />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', testError);
    });

    consoleSpy.mockRestore();
  });

  it('unsubscribes from auth state on unmount', () => {
    const unsubscribe = jest.fn();
    onAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('provides context with all expected properties', () => {
    function ContextCapture() {
      const context = useContext(AuthContext);
      return (
        <div
          data-testid="context-info"
          data-has-user={'user' in context}
          data-has-loading={'loading' in context}
          data-has-signin={'signInWithGoogle' in context}
          data-has-logout={'logout' in context}
          data-signin-is-function={typeof context.signInWithGoogle === 'function'}
          data-logout-is-function={typeof context.logout === 'function'}
        />
      );
    }

    render(
      <AuthProvider>
        <ContextCapture />
      </AuthProvider>
    );

    const element = screen.getByTestId('context-info');
    expect(element.dataset.hasUser).toBe('true');
    expect(element.dataset.hasLoading).toBe('true');
    expect(element.dataset.hasSignin).toBe('true');
    expect(element.dataset.hasLogout).toBe('true');
    expect(element.dataset.signinIsFunction).toBe('true');
    expect(element.dataset.logoutIsFunction).toBe('true');
  });
});
