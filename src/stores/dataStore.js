import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDataStore = create(
  persist(
    (set, get) => ({
      // Matières
      subjects: [],
      currentSubject: null,
      
      // QCM
      quizzes: [],
      quizHistory: [],
      
      // Flashcards
      flashcards: [],
      
      // Résumés
      summaries: [],
      
      // Actions pour les matières
      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, { ...subject, id: Date.now().toString() }]
      })),
      
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(subject => 
          subject.id === id ? { ...subject, ...updates } : subject
        )
      })),
      
      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter(subject => subject.id !== id),
        quizzes: state.quizzes.filter(quiz => quiz.subjectId !== id),
        flashcards: state.flashcards.filter(flashcard => flashcard.subjectId !== id),
        summaries: state.summaries.filter(summary => summary.subjectId !== id)
      })),
      
      setCurrentSubject: (subject) => set({ currentSubject: subject }),
      
      // Actions pour les QCM
      addQuiz: (quiz) => set((state) => ({
        quizzes: [...state.quizzes, { ...quiz, id: Date.now().toString() }]
      })),
      
      updateQuiz: (id, updates) => set((state) => ({
        quizzes: state.quizzes.map(quiz => 
          quiz.id === id ? { ...quiz, ...updates } : quiz
        )
      })),
      
      deleteQuiz: (id) => set((state) => ({
        quizzes: state.quizzes.filter(quiz => quiz.id !== id)
      })),
      
      addQuizResult: (result) => set((state) => ({
        quizHistory: [...state.quizHistory, { ...result, id: Date.now().toString() }]
      })),
      
      // Actions pour les flashcards
      addFlashcards: (flashcards) => set((state) => ({
        flashcards: [...state.flashcards, ...flashcards.map(fc => ({ ...fc, id: Date.now().toString() + Math.random() }))]
      })),
      
      updateFlashcard: (id, updates) => set((state) => ({
        flashcards: state.flashcards.map(flashcard => 
          flashcard.id === id ? { ...flashcard, ...updates } : flashcard
        )
      })),
      
      deleteFlashcard: (id) => set((state) => ({
        flashcards: state.flashcards.filter(flashcard => flashcard.id !== id)
      })),
      
      // Actions pour les résumés
      addSummary: (summary) => set((state) => ({
        summaries: [...state.summaries, { ...summary, id: Date.now().toString() }]
      })),
      
      updateSummary: (id, updates) => set((state) => ({
        summaries: state.summaries.map(summary => 
          summary.id === id ? { ...summary, ...updates } : summary
        )
      })),
      
      deleteSummary: (id) => set((state) => ({
        summaries: state.summaries.filter(summary => summary.id !== id)
      })),
      
      // Getters
      getQuizzesBySubject: (subjectId) => {
        const state = get()
        return state.quizzes.filter(quiz => quiz.subjectId === subjectId)
      },
      
      getFlashcardsBySubject: (subjectId) => {
        const state = get()
        return state.flashcards.filter(flashcard => flashcard.subjectId === subjectId)
      },
      
      getSummaryBySubject: (subjectId) => {
        const state = get()
        return state.summaries.find(summary => summary.subjectId === subjectId)
      },
      
      getQuizErrors: () => {
        const state = get()
        return state.quizHistory.filter(result => result.score < 100)
      },
      
      // Reset complet
      resetData: () => set({
        subjects: [],
        currentSubject: null,
        quizzes: [],
        quizHistory: [],
        flashcards: [],
        summaries: []
      })
    }),
    {
      name: 'studyhub-data',
      partialize: (state) => ({
        subjects: state.subjects,
        quizzes: state.quizzes,
        quizHistory: state.quizHistory,
        flashcards: state.flashcards,
        summaries: state.summaries
      }),
    }
  )
)