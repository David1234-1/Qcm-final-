import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { supabase } from './services/supabase'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Flashcards from './pages/Flashcards'
import Quiz from './pages/Quiz'
import Summary from './pages/Summary'
import Profile from './pages/Profile'

// Components
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, setUser, loading, setLoading } = useAuthStore()
  const { isDark } = useThemeStore()
  const [error, setError] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    // Vérifier le mode démo
    const isDemoMode = localStorage.getItem('demoMode') === 'true'
    setDemoMode(isDemoMode)
  }, [])

  useEffect(() => {
    // Appliquer le thème
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    // Vérifier la session utilisateur au démarrage
    const checkUser = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Si en mode démo, ne pas vérifier Supabase
        if (demoMode) {
          setLoading(false)
          return
        }

        // Vérifier si Supabase est configuré
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Mode démo : Supabase non configuré')
          setLoading(false)
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur Supabase:', error)
          setError('Erreur de connexion à la base de données')
        } else {
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error)
        setError('Erreur de connexion')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Écouter les changements d'authentification (seulement si pas en mode démo)
    if (!demoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user || null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [setUser, setLoading, demoMode])

  // Afficher l'erreur si elle existe
  if (error) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Erreur de connexion</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Recharger la page
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Vérifier si l'utilisateur est connecté ou en mode démo
  const isAuthenticated = user || demoMode

  return (
    <div className="min-h-screen bg-secondary-900">
      <Routes>
        {/* Routes publiques */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        
        {/* Routes protégées */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />} 
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="summary" element={<Summary />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App