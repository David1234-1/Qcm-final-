import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Settings, 
  Download, 
  Trash2,
  Eye,
  EyeOff,
  Save,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { authService } from '../services/supabase'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout } = useAuthStore()
  const { resetData } = useDataStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error('Le nom ne peut pas être vide')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await authService.updateProfile({
        data: { name: profileData.name }
      })
      
      if (error) {
        toast.error('Erreur lors de la mise à jour du profil')
        return
      }

      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await authService.updatePassword(passwordData.newPassword)
      
      if (error) {
        toast.error('Erreur lors de la mise à jour du mot de passe')
        return
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Mot de passe mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    const { subjects, quizzes, flashcards, summaries, quizHistory } = useDataStore.getState()
    
    const exportData = {
      subjects,
      quizzes,
      flashcards,
      summaries,
      quizHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `studyhub-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Données exportées avec succès')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      if (window.confirm('Toutes vos données seront définitivement supprimées. Continuer ?')) {
        // Ici on pourrait implémenter la suppression du compte via Supabase
        toast.error('Fonctionnalité de suppression de compte non implémentée')
      }
    }
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      logout()
      toast.success('Déconnexion réussie')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'security', name: 'Sécurité', icon: Lock },
    { id: 'data', name: 'Données', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profil</h1>
        <p className="text-secondary-400 mt-1">
          Gérez vos informations personnelles et paramètres
        </p>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 bg-secondary-800 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-400 hover:text-white hover:bg-secondary-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Profil */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Informations personnelles</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field pl-10 w-full"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="input-field pl-10 w-full bg-secondary-700 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Mise à jour...' : 'Mettre à jour le profil'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Onglet Sécurité */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Changer le mot de passe</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input-field pl-10 pr-10 w-full"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input-field pl-10 pr-10 w-full"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field w-full"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Mise à jour...' : 'Changer le mot de passe'}</span>
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Déconnexion</h2>
              <p className="text-secondary-400 mb-4">
                Déconnectez-vous de votre compte StudyHub
              </p>
              <button
                onClick={handleLogout}
                className="btn-outline flex items-center space-x-2 text-red-400 border-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Onglet Données */}
        {activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Gestion des données</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Exporter vos données</h3>
                  <p className="text-secondary-400 mb-4">
                    Téléchargez une copie de toutes vos données (matières, QCM, flashcards, résumés)
                  </p>
                  <button
                    onClick={handleExportData}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exporter les données</span>
                  </button>
                </div>

                <div className="border-t border-secondary-700 pt-4">
                  <h3 className="text-lg font-medium text-white mb-2">Réinitialiser les données</h3>
                  <p className="text-secondary-400 mb-4">
                    Supprimez toutes vos données locales. Cette action est irréversible.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.')) {
                        resetData()
                        toast.success('Données réinitialisées')
                      }
                    }}
                    className="btn-outline flex items-center space-x-2 text-red-400 border-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer toutes les données</span>
                  </button>
                </div>

                <div className="border-t border-secondary-700 pt-4">
                  <h3 className="text-lg font-medium text-white mb-2">Supprimer le compte</h3>
                  <p className="text-secondary-400 mb-4">
                    Supprimez définitivement votre compte et toutes vos données
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="btn-outline flex items-center space-x-2 text-red-400 border-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer le compte</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Profile