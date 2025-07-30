import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, BookOpen, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/supabase'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await authService.signIn(email, password)
      
      if (error) {
        toast.error(error.message || 'Erreur de connexion')
        return
      }

      setUser(data.user)
      toast.success('Connexion réussie !')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Erreur de connexion')
      console.error('Erreur de connexion:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Veuillez entrer votre email')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await authService.resetPassword(email)
      
      if (error) {
        toast.error(error.message || 'Erreur lors de l\'envoi')
        return
      }

      setResetEmailSent(true)
      toast.success('Email de réinitialisation envoyé !')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StudyHub</h1>
          <p className="text-secondary-400">Votre assistant d'étude intelligent</p>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Mot de passe oublié */}
          <div className="mt-4 text-center">
            <button
              onClick={handleResetPassword}
              disabled={loading || resetEmailSent}
              className="text-sm text-primary-400 hover:text-primary-300 disabled:opacity-50"
            >
              {resetEmailSent ? 'Email envoyé !' : 'Mot de passe oublié ?'}
            </button>
          </div>

          {/* Séparateur */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-secondary-600"></div>
            <span className="px-4 text-sm text-secondary-400">ou</span>
            <div className="flex-1 border-t border-secondary-600"></div>
          </div>

          {/* Lien d'inscription */}
          <div className="text-center">
            <p className="text-secondary-400">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-secondary-500">
            © 2024 StudyHub. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login