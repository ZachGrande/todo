import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-white">
          Todo
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm text-gray-300 hidden sm:inline">
                {user.displayName}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
