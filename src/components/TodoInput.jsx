function TodoInput({ inputValue, onInputChange, onSubmit, error }) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Add a new todo..."
          className={`flex-1 px-4 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:border-gray-500 ${error ? 'border-red-500' : 'border-gray-700'}`}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
    </form>
  )
}

export default TodoInput
