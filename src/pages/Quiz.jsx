import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Target,
  Award,
  Clock,
  Search,
  Filter,
  BookOpen,
  Eye
} from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import toast from 'react-hot-toast'

const Quiz = () => {
  const { quizzes, subjects, quizHistory, addQuizResult } = useDataStore()
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [errorsOnly, setErrorsOnly] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    filterQuizzes()
  }, [quizzes, selectedSubject, searchTerm, errorsOnly])

  useEffect(() => {
    let interval = null
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      handleFinishQuiz()
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const filterQuizzes = () => {
    let filtered = quizzes

    // Filtrer par matière
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(quiz => quiz.subjectId === selectedSubject)
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(quiz => 
        quiz.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrer les erreurs uniquement
    if (errorsOnly) {
      const errorQuizIds = quizHistory
        .filter(result => result.score < 100)
        .map(result => result.quizId)
      filtered = filtered.filter(quiz => errorQuizIds.includes(quiz.id))
    }

    setFilteredQuizzes(filtered)
  }

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResults(false)
    setQuizMode(true)
    setTimeLeft(300) // 5 minutes par défaut
    setTimerActive(true)
  }

  const handleAnswerSelect = (answerIndex) => {
    const newSelectedAnswers = [...selectedAnswers]
    const currentIndex = newSelectedAnswers.findIndex(a => a.questionIndex === currentQuestionIndex)
    
    if (currentIndex >= 0) {
      newSelectedAnswers[currentIndex].answers = [answerIndex]
    } else {
      newSelectedAnswers.push({
        questionIndex: currentQuestionIndex,
        answers: [answerIndex]
      })
    }
    
    setSelectedAnswers(newSelectedAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleFinishQuiz()
    }
  }

  const handleFinishQuiz = () => {
    setTimerActive(false)
    setShowResults(true)
    
    // Calculer le score
    const correctAnswers = selectedAnswers.filter(answer => {
      const question = currentQuiz.questions[answer.questionIndex]
      return question.correctAnswers.includes(answer.answers[0])
    }).length
    
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100)
    
    // Sauvegarder le résultat
    addQuizResult({
      quizId: currentQuiz.id,
      score: score,
      totalQuestions: currentQuiz.questions.length,
      correctAnswers: correctAnswers,
      timeSpent: 300 - timeLeft,
      date: new Date().toISOString()
    })
    
    toast.success(`Quiz terminé ! Score: ${score}%`)
  }

  const handleRetryErrors = () => {
    setErrorsOnly(true)
    filterQuizzes()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.name || 'Matière inconnue'
  }

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.color || '#3B82F6'
  }

  if (quizMode && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    const selectedAnswer = selectedAnswers.find(a => a.questionIndex === currentQuestionIndex)
    
    return (
      <div className="space-y-6">
        {/* En-tête du quiz */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{currentQuiz.title}</h1>
            <p className="text-secondary-400 mt-1">
              Question {currentQuestionIndex + 1} sur {currentQuiz.questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            
            <button
              onClick={() => {
                setQuizMode(false)
                setTimerActive(false)
              }}
              className="btn-outline"
            >
              Quitter
            </button>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-secondary-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
          />
        </div>

        {/* Question actuelle */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedAnswer?.answers.includes(index)
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-secondary-600 hover:border-secondary-500 text-secondary-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer?.answers.includes(index)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-secondary-500'
                  }`}>
                    {selectedAnswer?.answers.includes(index) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="btn-outline disabled:opacity-50"
            >
              Précédent
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="btn-primary disabled:opacity-50"
            >
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">QCM</h1>
          <p className="text-secondary-400 mt-1">
            Testez vos connaissances avec nos quiz interactifs
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRetryErrors}
            className="btn-secondary flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Rejouer erreurs</span>
          </button>
          
          <button
            onClick={() => setErrorsOnly(false)}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Nouveau quiz</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher dans les quiz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input-field"
        >
          <option value="all">Toutes les matières</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{quizzes.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Filtrés</p>
              <p className="text-2xl font-bold text-white">{filteredQuizzes.length}</p>
            </div>
            <Filter className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Score moyen</p>
              <p className="text-2xl font-bold text-white">
                {quizHistory.length > 0 
                  ? Math.round(quizHistory.reduce((sum, result) => sum + result.score, 0) / quizHistory.length)
                  : 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Erreurs</p>
              <p className="text-2xl font-bold text-white">
                {quizHistory.filter(result => result.score < 100).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Liste des quiz */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getSubjectColor(quiz.subjectId) }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getSubjectColor(quiz.subjectId) + '20',
                    color: getSubjectColor(quiz.subjectId)
                  }}
                >
                  {getSubjectName(quiz.subjectId)}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {quiz.title || 'Quiz sans titre'}
              </h3>
              <p className="text-secondary-400 text-sm mb-4">
                {quiz.questions?.length || 0} questions
              </p>

              <div className="flex items-center justify-between text-sm text-secondary-400 mb-4">
                <span>
                  {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Difficulté: {quiz.difficulty || 'Moyenne'}</span>
                </div>
              </div>

              <button
                onClick={() => startQuiz(quiz)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Commencer</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* État vide */}
      {filteredQuizzes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || selectedSubject !== 'all' || errorsOnly ? 'Aucun quiz trouvé' : 'Aucun quiz créé'}
          </h3>
          <p className="text-secondary-400 mb-6">
            {searchTerm || selectedSubject !== 'all' || errorsOnly
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier quiz'
            }
          </p>
          <button
            onClick={() => setErrorsOnly(false)}
            className="btn-primary"
          >
            Créer un quiz
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default Quiz