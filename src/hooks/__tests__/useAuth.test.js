import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthContext } from '../../context/AuthContext';

describe('useAuth', () => {
  it('returns context value when used within AuthProvider', () => {
    const mockContextValue = {
      user: { uid: '123', displayName: 'Test User' },
      loading: false,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toEqual(mockContextValue);
    expect(result.current.user.displayName).toBe('Test User');
  });

  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test since React will log the error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('returns loading state correctly', () => {
    const mockContextValue = {
      user: null,
      loading: true,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('returns null user when not authenticated', () => {
    const mockContextValue = {
      user: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
