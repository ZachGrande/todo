import { useState } from 'react'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import Header from './components/Header'
import MergePrompt from './components/MergePrompt'
import { useTodos } from './hooks/useTodos'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  
  const {
    todos,
    loading,
    addTodo,
    toggleComplete,
    deleteTodo,
    reorderTodos,
    showMergePrompt,
    localTodosToMerge,
    handleMergeKeepBoth,
    handleMergeUseCloud,
    handleMergeUseLocal,
    dismissMergePrompt
  } = useTodos()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) {
      setError('Please enter a todo')
      return
    }
    
    await addTodo(inputValue.trim())
    setInputValue('')
    setError('')
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    if (error) setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="pt-20 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Todo List</h1>
          
          <TodoInput
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
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

      {showMergePrompt && (
        <MergePrompt
          localCount={localTodosToMerge.length}
          cloudCount={todos.length}
          onKeepBoth={handleMergeKeepBoth}
          onUseCloud={handleMergeUseCloud}
          onUseLocal={handleMergeUseLocal}
          onDismiss={dismissMergePrompt}
        />
      )}
    </div>
  )
}

export default App
