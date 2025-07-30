import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Search, 
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Calendar,
  Tag
} from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import toast from 'react-hot-toast'

const Summary = () => {
  const { summaries, subjects, deleteSummary } = useDataStore()
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')

  const filteredSummaries = summaries.filter(summary => {
    const matchesSearch = summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         summary.keyPoints.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (selectedSubject !== 'all') {
      return matchesSearch && summary.subjectId === selectedSubject
    }
    
    return matchesSearch
  })

  const handleDeleteSummary = (summaryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce résumé ?')) {
      deleteSummary(summaryId)
      toast.success('Résumé supprimé')
    }
  }

  const handleExport = (summary) => {
    // Créer un fichier JSON pour l'export
    const dataStr = JSON.stringify(summary, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Résumé exporté en JSON')
  }

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.name || 'Matière inconnue'
  }

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.color || '#3B82F6'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Résumés</h1>
          <p className="text-secondary-400 mt-1">
            Consultez et gérez vos résumés structurés
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau résumé</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher dans les résumés..."
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
              <p className="text-2xl font-bold text-white">{summaries.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Filtrés</p>
              <p className="text-2xl font-bold text-white">{filteredSummaries.length}</p>
            </div>
            <Filter className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Matières</p>
              <p className="text-2xl font-bold text-white">
                {new Set(summaries.map(summary => summary.subjectId)).size}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Liste des résumés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredSummaries.map((summary, index) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getSubjectColor(summary.subjectId) }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedSummary(summary)}
                    className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExport(summary)}
                    className="p-1 rounded hover:bg-secondary-600 text-secondary-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSummary(summary.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-secondary-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {summary.title}
              </h3>
              
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium mb-3 inline-block"
                style={{ 
                  backgroundColor: getSubjectColor(summary.subjectId) + '20',
                  color: getSubjectColor(summary.subjectId)
                }}
              >
                {getSubjectName(summary.subjectId)}
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-secondary-300 mb-2">Points clés</h4>
                  <ul className="space-y-1">
                    {summary.keyPoints.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="text-sm text-secondary-400 flex items-start space-x-2">
                        <span className="text-primary-400 mt-1">•</span>
                        <span className="line-clamp-2">{point}</span>
                      </li>
                    ))}
                    {summary.keyPoints.length > 3 && (
                      <li className="text-sm text-secondary-500">
                        +{summary.keyPoints.length - 3} autres points...
                      </li>
                    )}
                  </ul>
                </div>

                {summary.importantTerms && summary.importantTerms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-300 mb-2">Termes importants</h4>
                    <div className="flex flex-wrap gap-1">
                      {summary.importantTerms.slice(0, 5).map((term, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-secondary-700 rounded-full text-xs text-secondary-300"
                        >
                          {term.term}
                        </span>
                      ))}
                      {summary.importantTerms.length > 5 && (
                        <span className="px-2 py-1 bg-secondary-700 rounded-full text-xs text-secondary-500">
                          +{summary.importantTerms.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-secondary-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(summary.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>{summary.sections?.length || 0} sections</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* État vide */}
      {filteredSummaries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || selectedSubject !== 'all' ? 'Aucun résumé trouvé' : 'Aucun résumé créé'}
          </h3>
          <p className="text-secondary-400 mb-6">
            {searchTerm || selectedSubject !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier résumé'
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Créer un résumé
          </button>
        </motion.div>
      )}

      {/* Modal de détail du résumé */}
      <AnimatePresence>
        {selectedSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSummary(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedSummary.title}</h2>
                <button
                  onClick={() => setSelectedSummary(null)}
                  className="p-2 rounded-lg hover:bg-secondary-700 text-secondary-400 hover:text-white"
                >
                  <span className="sr-only">Fermer</span>
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Métadonnées */}
                <div className="flex items-center space-x-4 text-sm text-secondary-400">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{getSubjectName(selectedSummary.subjectId)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedSummary.createdAt)}</span>
                  </div>
                </div>

                {/* Points clés */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Points clés</h3>
                  <ul className="space-y-2">
                    {selectedSummary.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-secondary-300 flex items-start space-x-3">
                        <span className="text-primary-400 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sections */}
                {selectedSummary.sections && selectedSummary.sections.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Sections</h3>
                    <div className="space-y-4">
                      {selectedSummary.sections.map((section, idx) => (
                        <div key={idx} className="border-l-2 border-secondary-600 pl-4">
                          <h4 className="font-medium text-white mb-2">{section.title}</h4>
                          <ul className="space-y-1">
                            {section.content.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm text-secondary-400">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Termes importants */}
                {selectedSummary.importantTerms && selectedSummary.importantTerms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Termes importants</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedSummary.importantTerms.map((term, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-secondary-700 rounded-lg text-sm"
                        >
                          <div className="font-medium text-white">{term.term}</div>
                          <div className="text-secondary-400 text-xs">
                            Fréquence: {term.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-secondary-700">
                <button
                  onClick={() => handleExport(selectedSummary)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Summary