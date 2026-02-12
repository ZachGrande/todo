import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../useTodos';
import { AuthContext } from '../../context/AuthContext';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
  analytics: {},
}));

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn(),
  })),
}));

// Mock Firebase Analytics functions
jest.mock('firebase/analytics', () => ({
  logEvent: jest.fn(),
}));

import { onSnapshot, addDoc, updateDoc, deleteDoc, doc, collection, query, writeBatch } from 'firebase/firestore';

describe('useTodos', () => {
  const mockLocalStorage = {
    store: {},
    getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
    setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value; }),
    removeItem: jest.fn((key) => { delete mockLocalStorage.store[key]; }),
    clear: jest.fn(() => { mockLocalStorage.store = {}; }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.store = {};
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
  });

  const createWrapper = (user = null, loading = false) => {
    return ({ children }) => (
      <AuthContext.Provider value={{ user, loading, signInWithGoogle: jest.fn(), logout: jest.fn() }}>
        {children}
      </AuthContext.Provider>
    );
  };

  describe('anonymous mode (no user)', () => {
    it('loads todos from localStorage', async () => {
      const localTodos = [
        { id: '1', text: 'Local todo', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual(localTodos);
    });

    it('returns empty array when no localStorage data', async () => {
      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual([]);
    });

    it('addTodo adds to localStorage', async () => {
      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addTodo('New todo');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('New todo');
      expect(result.current.todos[0].completed).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('toggleComplete updates todo in localStorage', async () => {
      const localTodos = [
        { id: '1', text: 'Test todo', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleComplete('1');
      });

      expect(result.current.todos[0].completed).toBe(true);
    });

    it('deleteTodo removes todo from localStorage', async () => {
      const localTodos = [
        { id: '1', text: 'Test todo', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTodo('1');
      });

      expect(result.current.todos).toHaveLength(0);
    });
  });

  describe('authenticated mode', () => {
    const mockUser = { uid: 'user123' };
    let unsubscribeMock;
    let snapshotCallback;

    beforeEach(() => {
      unsubscribeMock = jest.fn();
      onSnapshot.mockImplementation((q, callback) => {
        snapshotCallback = callback;
        return unsubscribeMock;
      });
      collection.mockReturnValue('todosCollection');
      query.mockReturnValue('todosQuery');
    });

    it('subscribes to Firestore on mount', async () => {
      renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });
    });

    it('unsubscribes from Firestore on unmount', async () => {
      const { unmount } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      unmount();
      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('loads todos from Firestore snapshot', async () => {
      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      // Simulate Firestore snapshot
      act(() => {
        snapshotCallback({
          docs: [
            { id: '1', data: () => ({ text: 'Firestore todo', completed: false, order: 0 }) },
          ],
        });
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Firestore todo');
    });

    it('addTodo calls addDoc for authenticated user', async () => {
      addDoc.mockResolvedValue({ id: 'newId' });

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      // Simulate empty snapshot first
      act(() => {
        snapshotCallback({ docs: [] });
      });

      await act(async () => {
        await result.current.addTodo('New firestore todo');
      });

      expect(addDoc).toHaveBeenCalledWith(
        'todosCollection',
        expect.objectContaining({
          text: 'New firestore todo',
          completed: false,
        })
      );
    });

    it('toggleComplete calls updateDoc for authenticated user', async () => {
      doc.mockReturnValue('todoDocRef');
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      // Simulate snapshot with a todo
      act(() => {
        snapshotCallback({
          docs: [
            { id: '1', data: () => ({ text: 'Test', completed: false, order: 0 }) },
          ],
        });
      });

      await act(async () => {
        await result.current.toggleComplete('1');
      });

      expect(updateDoc).toHaveBeenCalledWith('todoDocRef', { completed: true });
    });

    it('deleteTodo calls deleteDoc for authenticated user', async () => {
      doc.mockReturnValue('todoDocRef');
      deleteDoc.mockResolvedValue();

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      // Simulate snapshot with a todo
      act(() => {
        snapshotCallback({
          docs: [
            { id: '1', data: () => ({ text: 'Test', completed: false, order: 0 }) },
          ],
        });
      });

      await act(async () => {
        await result.current.deleteTodo('1');
      });

      expect(deleteDoc).toHaveBeenCalledWith('todoDocRef');
    });
  });

  describe('loading state', () => {
    it('returns loading true while auth is loading', () => {
      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, true) });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('merge prompt', () => {
    it('shows merge prompt when user logs in with local todos', async () => {
      const localTodos = [
        { id: '1', text: 'Local todo', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const mockUser = { uid: 'user123' };
      let snapshotCallback;
      onSnapshot.mockImplementation((q, callback) => {
        snapshotCallback = callback;
        return jest.fn();
      });
      collection.mockReturnValue('todosCollection');
      query.mockReturnValue('todosQuery');

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      // Simulate Firestore response
      act(() => {
        snapshotCallback({ docs: [] });
      });

      expect(result.current.showMergePrompt).toBe(true);
    });
  });

  describe('reorderTodos', () => {
    it('reorders todos in localStorage for anonymous user', async () => {
      const localTodos = [
        { id: '1', text: 'First', completed: false, order: 0 },
        { id: '2', text: 'Second', completed: false, order: 1 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.reorderTodos('2', '1');
      });

      // Second todo should now be first
      expect(result.current.todos[0].id).toBe('2');
      expect(result.current.todos[1].id).toBe('1');
    });

    it('returns early if activeId is not found', async () => {
      const localTodos = [
        { id: '1', text: 'First', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.reorderTodos('nonexistent', '1');
      });

      // Should not change
      expect(result.current.todos).toHaveLength(1);
    });

    it('uses writeBatch for authenticated user', async () => {
      const mockUser = { uid: 'user123' };
      let snapshotCallback;
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(),
      };
      writeBatch.mockReturnValue(mockBatch);
      onSnapshot.mockImplementation((q, callback) => {
        snapshotCallback = callback;
        return jest.fn();
      });
      collection.mockReturnValue('todosCollection');
      query.mockReturnValue('todosQuery');
      doc.mockReturnValue('todoDocRef');

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      act(() => {
        snapshotCallback({
          docs: [
            { id: '1', data: () => ({ text: 'First', completed: false, order: 0 }) },
            { id: '2', data: () => ({ text: 'Second', completed: false, order: 1 }) },
          ],
        });
      });

      await act(async () => {
        await result.current.reorderTodos('2', '1');
      });

      expect(writeBatch).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('merge handlers', () => {
    const mockUser = { uid: 'user123' };
    let snapshotCallback;

    beforeEach(() => {
      const mockBatch = {
        set: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(),
      };
      writeBatch.mockReturnValue(mockBatch);
      onSnapshot.mockImplementation((q, callback) => {
        snapshotCallback = callback;
        return jest.fn();
      });
      collection.mockReturnValue('todosCollection');
      query.mockReturnValue('todosQuery');
      doc.mockReturnValue('todoDocRef');
    });

    it('handleMergeUseCloud clears local storage and dismisses prompt', async () => {
      const localTodos = [
        { id: '1', text: 'Local', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      act(() => {
        snapshotCallback({ docs: [] });
      });

      await act(async () => {
        result.current.handleMergeUseCloud();
      });

      expect(result.current.showMergePrompt).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('todos-local');
    });

    it('dismissMergePrompt clears local storage and hides prompt', async () => {
      const localTodos = [
        { id: '1', text: 'Local', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      act(() => {
        snapshotCallback({ docs: [] });
      });

      await act(async () => {
        result.current.dismissMergePrompt();
      });

      expect(result.current.showMergePrompt).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('todos-local');
    });

    it('handleMergeKeepBoth adds local todos to Firestore', async () => {
      const localTodos = [
        { id: '1', text: 'Local', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(),
      };
      writeBatch.mockReturnValue(mockBatch);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      act(() => {
        snapshotCallback({ docs: [] });
      });

      await act(async () => {
        await result.current.handleMergeKeepBoth();
      });

      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result.current.showMergePrompt).toBe(false);
    });

    it('handleMergeUseLocal replaces cloud todos with local', async () => {
      const localTodos = [
        { id: '1', text: 'Local', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const mockBatch = {
        set: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(),
      };
      writeBatch.mockReturnValue(mockBatch);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(mockUser, false) });

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });

      act(() => {
        snapshotCallback({
          docs: [
            { id: 'cloud1', data: () => ({ text: 'Cloud', completed: false, order: 0 }) },
          ],
        });
      });

      await act(async () => {
        await result.current.handleMergeUseLocal();
      });

      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result.current.showMergePrompt).toBe(false);
    });

    it('handleMergeKeepBoth returns early if no user', async () => {
      const localTodos = [
        { id: '1', text: 'Local', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleMergeKeepBoth();
      });

      // Should not call writeBatch since user is null
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it('handleMergeUseLocal returns early if no user', async () => {
      const localTodos = [
        { id: '1', text: 'Local', completed: false, order: 0 },
      ];
      mockLocalStorage.store['todos-local'] = JSON.stringify(localTodos);

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleMergeUseLocal();
      });

      // Should not call writeBatch since user is null
      expect(writeBatch).not.toHaveBeenCalled();
    });
  });

  describe('localStorage error handling', () => {
    it('returns empty array when localStorage.getItem throws', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useTodos(), { wrapper: createWrapper(null, false) });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual([]);
    });
  });
});
