import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Brain, 
  FileText, 
  TrendingUp, 
  Upload, 
  Plus,
  Calendar,
  Target,
  Award,
  Clock
} from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { subjects, quizzes, flashcards, summaries, quizHistory } = useDataStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalQuizzes: 0,
    totalFlashcards: 0,
    totalSummaries: 0,
    averageScore: 0,
    studyTime: 0
  })

  useEffect(() => {
    calculateStats()
  }, [subjects, quizzes, flashcards, summaries, quizHistory])

  const calculateStats = () => {
    const totalSubjects = subjects.length
    const totalQuizzes = quizzes.length
    const totalFlashcards = flashcards.length
    const totalSummaries = summaries.length
    
    // Calculer le score moyen
    const scores = quizHistory.map(result => result.score || 0)
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

    // Temps d'étude estimé (en minutes)
    const studyTime = (totalQuizzes * 5) + (totalFlashcards * 2) + (totalSummaries * 10)

    setStats({
      totalSubjects,
      totalQuizzes,
      totalFlashcards,
      totalSummaries,
      averageScore,
      studyTime
    })
  }

  const getRecentActivity = () => {
    const allItems = [
      ...subjects.map(s => ({ ...s, type: 'subject', date: s.createdAt })),
      ...quizzes.map(q => ({ ...q, type: 'quiz', date: q.createdAt })),
      ...flashcards.map(f => ({ ...f, type: 'flashcard', date: f.createdAt })),
      ...summaries.map(s => ({ ...s, type: 'summary', date: s.createdAt }))
    ]

    return allItems
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'subject': return <BookOpen className="w-4 h-4" />
      case 'quiz': return <FileText className="w-4 h-4" />
      case 'flashcard': return <Brain className="w-4 h-4" />
      case 'summary': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'subject': return 'text-blue-400'
      case 'quiz': return 'text-green-400'
      case 'flashcard': return 'text-purple-400'
      case 'summary': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Aujourd\'hui'
    if (diffDays === 2) return 'Hier'
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`
    return date.toLocaleDateString('fr-FR')
  }

  const statCards = [
    {
      title: 'Matières',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/subjects'
    },
    {
      title: 'QCM',
      value: stats.totalQuizzes,
      icon: FileText,
      color: 'bg-green-500',
      href: '/quiz'
    },
    {
      title: 'Flashcards',
      value: stats.totalFlashcards,
      icon: Brain,
      color: 'bg-purple-500',
      href: '/flashcards'
    },
    {
      title: 'Résumés',
      value: stats.totalSummaries,
      icon: FileText,
      color: 'bg-orange-500',
      href: '/summary'
    }
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Bonjour, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Étudiant'} !
          </h1>
          <p className="text-secondary-400 mt-1">
            Voici un aperçu de votre progression d'étude
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/subjects')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle matière</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card cursor-pointer hover:bg-secondary-700 transition-colors"
            onClick={() => navigate(stat.href)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score moyen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Performance</h3>
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-secondary-400">Score moyen</span>
              <span className="text-2xl font-bold text-white">{stats.averageScore}%</span>
            </div>
            
            <div className="w-full bg-secondary-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.averageScore}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Temps d'étude */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Temps d'étude</h3>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-secondary-400">Temps estimé</span>
              <span className="text-2xl font-bold text-white">
                {Math.round(stats.studyTime / 60)}h {stats.studyTime % 60}min
              </span>
            </div>
            
            <div className="text-sm text-secondary-400">
              Basé sur vos contenus créés
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activité récente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Activité récente</h3>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>

        <div className="space-y-4">
          {getRecentActivity().length > 0 ? (
            getRecentActivity().map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/${item.type === 'subject' ? 'subjects' : item.type + 's'}`)}
              >
                <div className={`p-2 rounded-lg bg-secondary-700 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {item.name || item.question || item.term || 'Sans titre'}
                  </p>
                  <p className="text-sm text-secondary-400">
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
              <p className="text-secondary-400 mb-4">Aucune activité récente</p>
              <button
                onClick={() => navigate('/subjects')}
                className="btn-primary"
              >
                Commencer à étudier
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Actions rapides</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/subjects')}
            className="flex flex-col items-center p-4 rounded-lg bg-secondary-700 hover:bg-secondary-600 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-sm font-medium text-white">Nouvelle matière</span>
          </button>
          
          <button
            onClick={() => navigate('/quiz')}
            className="flex flex-col items-center p-4 rounded-lg bg-secondary-700 hover:bg-secondary-600 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-sm font-medium text-white">Créer un QCM</span>
          </button>
          
          <button
            onClick={() => navigate('/flashcards')}
            className="flex flex-col items-center p-4 rounded-lg bg-secondary-700 hover:bg-secondary-600 transition-colors"
          >
            <Brain className="w-8 h-8 text-purple-400 mb-2" />
            <span className="text-sm font-medium text-white">Nouvelles flashcards</span>
          </button>
          
          <button
            onClick={() => navigate('/summary')}
            className="flex flex-col items-center p-4 rounded-lg bg-secondary-700 hover:bg-secondary-600 transition-colors"
          >
            <FileText className="w-8 h-8 text-orange-400 mb-2" />
            <span className="text-sm font-medium text-white">Nouveau résumé</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard