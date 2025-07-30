import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Plus, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Shuffle,
  Filter,
  Search,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import toast from 'react-hot-toast'

const Flashcards = () => {
  const { flashcards, subjects, updateFlashcard } = useDataStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyMode, setStudyMode] = useState(false)
  const [filteredCards, setFilteredCards] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [shuffled, setShuffled] = useState(false)

  useEffect(() => {
    filterCards()
  }, [flashcards, selectedSubject, searchTerm, shuffled])

  const filterCards = () => {
    let filtered = flashcards

    // Filtrer par matière
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(card => card.subjectId === selectedSubject)
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.definition.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Mélanger si demandé
    if (shuffled) {
      filtered = [...filtered].sort(() => Math.random() - 0.5)
    }

    setFilteredCards(filtered)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleShuffle = () => {
    setShuffled(!shuffled)
    toast.success(shuffled ? 'Ordre normal restauré' : 'Cartes mélangées')
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setStudyMode(false)
  }

  const getCurrentCard = () => {
    return filteredCards[currentIndex] || null
  }

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.name || 'Matière inconnue'
  }

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.color || '#3B82F6'
  }

  if (studyMode && filteredCards.length > 0) {
    const currentCard = getCurrentCard()
    
    return (
      <div className="space-y-6">
        {/* En-tête mode étude */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Mode étude - Flashcards</h1>
            <p className="text-secondary-400 mt-1">
              {currentIndex + 1} sur {filteredCards.length} cartes
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleShuffle}
              className={`btn-outline flex items-center space-x-2 ${shuffled ? 'bg-primary-600 text-white' : ''}`}
            >
              <Shuffle className="w-4 h-4" />
              <span>Mélanger</span>
            </button>
            
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Carte flashcard */}
        <div className="flex justify-center">
          <motion.div
            key={`${currentCard.id}-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <div
              className="relative cursor-pointer perspective-1000"
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-64 bg-secondary-800 border border-secondary-700 rounded-xl p-8 flex items-center justify-center text-center relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Face avant */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${
                    isFlipped ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-sm text-secondary-400 mb-4">
                    Cliquez pour retourner
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {currentCard.term}
                  </h2>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getSubjectColor(currentCard.subjectId) + '20',
                      color: getSubjectColor(currentCard.subjectId)
                    }}
                  >
                    {getSubjectName(currentCard.subjectId)}
                  </div>
                </div>

                {/* Face arrière */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${
                    isFlipped ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-sm text-secondary-400 mb-4">
                    Définition
                  </div>
                  <p className="text-lg text-white leading-relaxed">
                    {currentCard.definition}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Contrôles de navigation */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-lg bg-secondary-700 hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {currentIndex + 1} / {filteredCards.length}
            </div>
            <div className="text-sm text-secondary-400">
              Progression
            </div>
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === filteredCards.length - 1}
            className="p-3 rounded-lg bg-secondary-700 hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-secondary-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Flashcards</h1>
          <p className="text-secondary-400 mt-1">
            Étudiez avec vos cartes mémoire interactives
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setStudyMode(true)}
            disabled={filteredCards.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Brain className="w-4 h-4" />
            <span>Mode étude</span>
          </button>
          
          <button
            onClick={() => setStudyMode(false)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle carte</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher dans les flashcards..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{flashcards.length}</p>
            </div>
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Filtrées</p>
              <p className="text-2xl font-bold text-white">{filteredCards.length}</p>
            </div>
            <Filter className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Matières</p>
              <p className="text-2xl font-bold text-white">
                {new Set(flashcards.map(card => card.subjectId)).size}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Liste des flashcards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:bg-secondary-700 transition-colors cursor-pointer"
              onClick={() => {
                setCurrentIndex(filteredCards.indexOf(card))
                setStudyMode(true)
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getSubjectColor(card.subjectId) }}
                >
                  <Brain className="w-5 h-5 text-white" />
                </div>
                
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getSubjectColor(card.subjectId) + '20',
                    color: getSubjectColor(card.subjectId)
                  }}
                >
                  {getSubjectName(card.subjectId)}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {card.term}
              </h3>
              <p className="text-secondary-400 text-sm line-clamp-3">
                {card.definition}
              </p>

              <div className="flex items-center justify-between mt-4 text-sm text-secondary-400">
                <span>
                  {new Date(card.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>Cliquer pour étudier</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* État vide */}
      {filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Brain className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || selectedSubject !== 'all' ? 'Aucune flashcard trouvée' : 'Aucune flashcard créée'}
          </h3>
          <p className="text-secondary-400 mb-6">
            {searchTerm || selectedSubject !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer vos premières flashcards'
            }
          </p>
          <button
            onClick={() => setStudyMode(false)}
            className="btn-primary"
          >
            Créer des flashcards
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default Flashcards