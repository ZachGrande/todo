import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:drop-shadow-[0_0_2em_#646cffaa] transition-all">
          <img src={viteLogo} className="h-24 p-4" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:drop-shadow-[0_0_2em_#61dafbaa] transition-all">
          <img src={reactLogo} className="h-24 p-4 animate-spin [animation-duration:20s]" alt="React logo" />
        </a>
      </div>
      <h1 className="text-5xl font-bold mb-8">Vite + React</h1>
      <div className="p-8 bg-gray-800 rounded-lg mb-8">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-base font-medium transition-colors cursor-pointer"
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-400">
          Edit <code className="bg-gray-700 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
