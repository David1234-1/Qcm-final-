import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Plus, 
  Upload, 
  FileText, 
  Brain, 
  Trash2, 
  Edit,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { pdfService } from '../services/pdfService'
import toast from 'react-hot-toast'

const Subjects = () => {
  const { subjects, addSubject, deleteSubject, addQuiz, addFlashcards, addSummary } = useDataStore()
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  const [importData, setImportData] = useState({
    file: null,
    subjectId: '',
    generateQuizzes: true,
    generateFlashcards: true,
    generateSummary: true
  })

  const handleCreateSubject = () => {
    if (!newSubject.name.trim()) {
      toast.error('Veuillez entrer un nom de matière')
      return
    }

    addSubject({
      ...newSubject,
      createdAt: new Date().toISOString()
    })

    setNewSubject({ name: '', description: '', color: '#3B82F6' })
    setShowModal(false)
    toast.success('Matière créée avec succès !')
  }

  const handleImportPDF = async () => {
    if (!importData.file || !importData.subjectId) {
      toast.error('Veuillez sélectionner un fichier et une matière')
      return
    }

    setLoading(true)

    try {
      // Charger et analyser le PDF
      const result = await pdfService.loadPDF(importData.file)
      
      if (!result.success) {
        toast.error('Erreur lors du chargement du PDF')
        return
      }

      toast.success(`PDF analysé avec succès ! ${result.pages} pages détectées.`)

      // Générer le contenu selon les options sélectionnées
      if (importData.generateQuizzes) {
        const quizzes = await pdfService.generateQuizzes(importData.subjectId, 10)
        quizzes.forEach(quiz => addQuiz(quiz))
        toast.success(`${quizzes.length} QCM générés`)
      }

      if (importData.generateFlashcards) {
        const flashcards = await pdfService.generateFlashcards(importData.subjectId)
        addFlashcards(flashcards)
        toast.success(`${flashcards.length} flashcards générées`)
      }

      if (importData.generateSummary) {
        const summary = await pdfService.generateSummary(importData.subjectId)
        addSummary(summary)
        toast.success('Résumé généré')
      }

      setImportData({
        file: null,
        subjectId: '',
        generateQuizzes: true,
        generateFlashcards: true,
        generateSummary: true
      })
      setShowImportModal(false)
      
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      toast.error('Erreur lors de l\'import du PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = (subjectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ? Tous les contenus associés seront également supprimés.')) {
      deleteSubject(subjectId)
      toast.success('Matière supprimée')
    }
  }

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'recent') {
      const daysSinceCreation = (new Date() - new Date(subject.createdAt)) / (1000 * 60 * 60 * 24)
      return matchesSearch && daysSinceCreation <= 7
    }
    
    return matchesSearch
  })

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Matières</h1>
          <p className="text-secondary-400 mt-1">
            Gérez vos matières et importez vos cours
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer PDF</span>
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle matière</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher une matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field"
        >
          <option value="all">Toutes les matières</option>
          <option value="recent">Récentes (7 jours)</option>
        </select>
      </div>

      {/* Liste des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: subject.color }}
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedSubject(subject)}
                    className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedSubject(subject)}
                    className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-secondary-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{subject.name}</h3>
              <p className="text-secondary-400 text-sm mb-4 line-clamp-2">
                {subject.description || 'Aucune description'}
              </p>

              <div className="flex items-center justify-between text-sm text-secondary-400">
                <span>
                  {new Date(subject.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>0 QCM</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* État vide */}
      {filteredSubjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'Aucune matière trouvée' : 'Aucune matière créée'}
          </h3>
          <p className="text-secondary-400 mb-6">
            {searchTerm 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première matière'
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Créer une matière
          </button>
        </motion.div>
      )}

      {/* Modal de création de matière */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Nouvelle matière</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Nom de la matière
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Ex: Mathématiques, Histoire..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={newSubject.description}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field w-full resize-none"
                    rows="3"
                    placeholder="Description de la matière..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Couleur
                  </label>
                  <div className="flex space-x-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewSubject(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newSubject.color === color ? 'border-white scale-110' : 'border-secondary-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-outline flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateSubject}
                  className="btn-primary flex-1"
                >
                  Créer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'import PDF */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Importer un PDF</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Sélectionner une matière
                  </label>
                  <select
                    value={importData.subjectId}
                    onChange={(e) => setImportData(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="">Choisir une matière</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Fichier PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setImportData(prev => ({ ...prev, file: e.target.files[0] }))}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Contenu à générer
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importData.generateQuizzes}
                        onChange={(e) => setImportData(prev => ({ ...prev, generateQuizzes: e.target.checked }))}
                        className="rounded border-secondary-600 bg-secondary-800 text-primary-500"
                      />
                      <span className="text-sm text-white">QCM (10 questions)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importData.generateFlashcards}
                        onChange={(e) => setImportData(prev => ({ ...prev, generateFlashcards: e.target.checked }))}
                        className="rounded border-secondary-600 bg-secondary-800 text-primary-500"
                      />
                      <span className="text-sm text-white">Flashcards</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importData.generateSummary}
                        onChange={(e) => setImportData(prev => ({ ...prev, generateSummary: e.target.checked }))}
                        className="rounded border-secondary-600 bg-secondary-800 text-primary-500"
                      />
                      <span className="text-sm text-white">Résumé structuré</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="btn-outline flex-1"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleImportPDF}
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Import en cours...' : 'Importer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Subjects