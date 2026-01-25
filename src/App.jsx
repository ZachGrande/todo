import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const reorderTodos = (activeId, overId) => {
    setTodos((todos) => {
      const oldIndex = todos.findIndex((todo) => todo.id === activeId)
      const newIndex = todos.findIndex((todo) => todo.id === overId)
      return arrayMove(todos, oldIndex, newIndex)
    })
  }

  const addTodo = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) {
      setError('Please enter a todo')
      return
    }
    
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false
    }
    setTodos([...todos, newTodo])
    setInputValue('')
    setError('')
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    if (error) setError('')
  }

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Todo List</h1>
        
        <TodoInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSubmit={addTodo}
          error={error}
        />

        <TodoList
          todos={todos}
          onToggle={toggleComplete}
          onDelete={deleteTodo}
          onReorder={reorderTodos}
        />
      </div>
    </div>
  )
}

export default App
