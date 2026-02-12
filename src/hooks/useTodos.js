import { useState, useEffect, useCallback } from 'react'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { logEvent } from 'firebase/analytics'
import { db, analytics } from '../firebase'
import { useAuth } from './useAuth'

const LOCAL_STORAGE_KEY = 'todos-local'

function getLocalTodos() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setLocalTodos(todos) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
}

function clearLocalTodos() {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export function useTodos() {
  const { user, loading: authLoading } = useAuth()
  const [todos, setTodos] = useState([])
  const [loadedUserId, setLoadedUserId] = useState(undefined) // undefined = not loaded yet, null = loaded for anonymous
  const [showMergePrompt, setShowMergePrompt] = useState(false)
  const [localTodosToMerge, setLocalTodosToMerge] = useState([])

  // Combined loading state - we're loading if auth is loading OR we haven't loaded data for current user
  const currentUserId = user?.uid ?? null
  const loading = authLoading || loadedUserId !== currentUserId

  // Get Firestore collection reference for user's todos
  const getTodosRef = useCallback(() => {
    if (!user) return null
    return collection(db, 'users', user.uid, 'todos')
  }, [user])

  // Load todos - either from Firestore (logged in) or localStorage (logged out)
  useEffect(() => {
    // Don't load todos until auth state is determined
    if (authLoading) {
      return
    }

    if (user) {
      // User is logged in - sync with Firestore
      const todosRef = getTodosRef()
      if (!todosRef) return

      const q = query(todosRef)
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreTodos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Sort by createdAt or order field
        firestoreTodos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        
        // Check if there are local todos to merge (only on initial load)
        const localTodos = getLocalTodos()
        if (localTodos.length > 0 && !showMergePrompt) {
          setLocalTodosToMerge(localTodos)
          setShowMergePrompt(true)
        }
        
        setTodos(firestoreTodos)
        setLoadedUserId(user.uid)
      }, (error) => {
        console.error('Error fetching todos:', error)
        setLoadedUserId(user.uid)
      })

      return unsubscribe
    } else {
      // User is logged out - use localStorage
      // Defer state updates to avoid synchronous setState in effect body
      queueMicrotask(() => {
        setTodos(getLocalTodos())
        setLoadedUserId(null)
      })
    }
  }, [user, authLoading, getTodosRef, showMergePrompt])

  // Add a todo
  const addTodo = useCallback(async (text) => {
    // Calculate the next order value as max existing order + 1 to ensure new items go to the bottom
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order ?? 0)) : -1
    const newTodo = {
      text,
      completed: false,
      createdAt: Date.now(),
      order: maxOrder + 1
    }

    if (user) {
      const todosRef = getTodosRef()
      await addDoc(todosRef, newTodo)
      logEvent(analytics, 'create_todo', {
        user_id: user.uid,
        todo_length: text.length,
        total_todos: todos.length + 1
      })
    } else {
      const todoWithId = { ...newTodo, id: Date.now().toString() }
      const updatedTodos = [...todos, todoWithId]
      setTodos(updatedTodos)
      setLocalTodos(updatedTodos)
      logEvent(analytics, 'create_todo', {
        user_id: 'anonymous',
        todo_length: text.length,
        total_todos: updatedTodos.length
      })
    }
  }, [user, todos, getTodosRef])

  // Toggle todo completion
  const toggleComplete = useCallback(async (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    
    const newCompletedState = !todo.completed
    
    if (user) {
      const todoRef = doc(db, 'users', user.uid, 'todos', id)
      await updateDoc(todoRef, { completed: newCompletedState })
      logEvent(analytics, 'toggle_todo_complete', {
        user_id: user.uid,
        completed: newCompletedState,
        total_todos: todos.length,
        completed_todos: todos.filter(t => t.completed).length + (newCompletedState ? 1 : -1)
      })
    } else {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: newCompletedState } : todo
      )
      setTodos(updatedTodos)
      setLocalTodos(updatedTodos)
      logEvent(analytics, 'toggle_todo_complete', {
        user_id: 'anonymous',
        completed: newCompletedState,
        total_todos: updatedTodos.length,
        completed_todos: updatedTodos.filter(t => t.completed).length
      })
    }
  }, [user, todos])

  // Delete a todo
  const deleteTodo = useCallback(async (id) => {
    const todoToDelete = todos.find(todo => todo.id === id)
    if (user) {
      const todoRef = doc(db, 'users', user.uid, 'todos', id)
      await deleteDoc(todoRef)
      logEvent(analytics, 'delete_todo', {
        user_id: user.uid,
        was_completed: todoToDelete?.completed || false,
        total_todos: todos.length - 1
      })
    } else {
      const updatedTodos = todos.filter(todo => todo.id !== id)
      setTodos(updatedTodos)
      setLocalTodos(updatedTodos)
      logEvent(analytics, 'delete_todo', {
        user_id: 'anonymous',
        was_completed: todoToDelete?.completed || false,
        total_todos: updatedTodos.length
      })
    }
  }, [user, todos])

  // Reorder todos
  const reorderTodos = useCallback(async (activeId, overId) => {
    const oldIndex = todos.findIndex(todo => todo.id === activeId)
    const newIndex = todos.findIndex(todo => todo.id === overId)
    
    if (oldIndex === -1 || newIndex === -1) return

    const newTodos = [...todos]
    const [movedTodo] = newTodos.splice(oldIndex, 1)
    newTodos.splice(newIndex, 0, movedTodo)

    // Update order field for all affected todos
    const reorderedTodos = newTodos.map((todo, index) => ({
      ...todo,
      order: index
    }))

    if (user) {
      // Batch update all order fields in Firestore
      const batch = writeBatch(db)
      reorderedTodos.forEach((todo) => {
        const todoRef = doc(db, 'users', user.uid, 'todos', todo.id)
        batch.update(todoRef, { order: todo.order })
      })
      await batch.commit()
    } else {
      setTodos(reorderedTodos)
      setLocalTodos(reorderedTodos)
    }
  }, [user, todos])

  // Merge handlers
  const handleMergeKeepBoth = useCallback(async () => {
    if (!user) return
    
    const todosRef = getTodosRef()
    const batch = writeBatch(db)
    
    // Add local todos to Firestore with new order values
    const startOrder = todos.length
    localTodosToMerge.forEach((todo, index) => {
      const newDocRef = doc(todosRef)
      batch.set(newDocRef, {
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt || Date.now(),
        order: startOrder + index
      })
    })
    
    await batch.commit()
    clearLocalTodos()
    setShowMergePrompt(false)
    setLocalTodosToMerge([])
  }, [user, todos, localTodosToMerge, getTodosRef])

  const handleMergeUseCloud = useCallback(() => {
    clearLocalTodos()
    setShowMergePrompt(false)
    setLocalTodosToMerge([])
  }, [])

  const handleMergeUseLocal = useCallback(async () => {
    if (!user) return
    
    const todosRef = getTodosRef()
    const batch = writeBatch(db)
    
    // Delete all existing Firestore todos
    todos.forEach((todo) => {
      const todoRef = doc(db, 'users', user.uid, 'todos', todo.id)
      batch.delete(todoRef)
    })
    
    // Add local todos to Firestore
    localTodosToMerge.forEach((todo, index) => {
      const newDocRef = doc(todosRef)
      batch.set(newDocRef, {
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt || Date.now(),
        order: index
      })
    })
    
    await batch.commit()
    clearLocalTodos()
    setShowMergePrompt(false)
    setLocalTodosToMerge([])
  }, [user, todos, localTodosToMerge, getTodosRef])

  const dismissMergePrompt = useCallback(() => {
    clearLocalTodos()
    setShowMergePrompt(false)
    setLocalTodosToMerge([])
  }, [])

  return {
    todos,
    loading,
    addTodo,
    toggleComplete,
    deleteTodo,
    reorderTodos,
    // Merge prompt state and handlers
    showMergePrompt,
    localTodosToMerge,
    handleMergeKeepBoth,
    handleMergeUseCloud,
    handleMergeUseLocal,
    dismissMergePrompt
  }
}
