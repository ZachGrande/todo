import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
