import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import { useEffect } from 'react'
import googleIcon from '../assets/google.png'

export default function Login() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (error) {
      console.error('Failed to sign in:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Todo</h1>
          <p className="text-gray-400">
            Sign in to sync your todos across devices
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <img src={googleIcon} alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Continue without signing in
          </button>
        </div>
      </div>
    </div>
  )
}
