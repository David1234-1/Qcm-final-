import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables d\'environnement Supabase manquantes.')
  console.warn('L\'application fonctionnera en mode local uniquement.')
  console.warn('Pour configurer Supabase :')
  console.warn('1. Créez un projet sur https://supabase.com')
  console.warn('2. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d\'environnement')
}

// Création du client Supabase avec fallback
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Service d'authentification
export const authService = {
  // Inscription
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Connexion
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  // Mise à jour du mot de passe
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  },

  // Mise à jour du profil
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  }
}

// Service de données
export const dataService = {
  // Matières
  async getSubjects(userId) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async createSubject(subject) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
    
    return { data, error }
  },

  async updateSubject(id, updates) {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async deleteSubject(id) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // QCM
  async getQuizzes(userId, subjectId = null) {
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  async createQuiz(quiz) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quiz])
      .select()
    
    return { data, error }
  },

  async updateQuiz(id, updates) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async deleteQuiz(id) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // Historique des QCM
  async getQuizHistory(userId) {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async saveQuizResult(result) {
    const { data, error } = await supabase
      .from('quiz_history')
      .insert([result])
      .select()
    
    return { data, error }
  },

  // Flashcards
  async getFlashcards(userId, subjectId = null) {
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  async createFlashcards(flashcards) {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcards)
      .select()
    
    return { data, error }
  },

  async updateFlashcard(id, updates) {
    const { data, error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async deleteFlashcard(id) {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // Résumés
  async getSummaries(userId, subjectId = null) {
    let query = supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  async createSummary(summary) {
    const { data, error } = await supabase
      .from('summaries')
      .insert([summary])
      .select()
    
    return { data, error }
  },

  async updateSummary(id, updates) {
    const { data, error } = await supabase
      .from('summaries')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async deleteSummary(id) {
    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // Fichiers
  async uploadFile(file, path) {
    const { data, error } = await supabase.storage
      .from('studyhub-files')
      .upload(path, file)
    
    return { data, error }
  },

  async getFileUrl(path) {
    const { data } = supabase.storage
      .from('studyhub-files')
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  async deleteFile(path) {
    const { error } = await supabase.storage
      .from('studyhub-files')
      .remove([path])
    
    return { error }
  }
}

// Service de synchronisation
export const syncService = {
  // Synchroniser les données locales avec Supabase
  async syncToCloud(userId, localData) {
    try {
      // Synchroniser les matières
      for (const subject of localData.subjects) {
        if (!subject.synced) {
          await dataService.createSubject({
            ...subject,
            user_id: userId,
            synced: true
          })
        }
      }

      // Synchroniser les QCM
      for (const quiz of localData.quizzes) {
        if (!quiz.synced) {
          await dataService.createQuiz({
            ...quiz,
            user_id: userId,
            synced: true
          })
        }
      }

      // Synchroniser les flashcards
      for (const flashcard of localData.flashcards) {
        if (!flashcard.synced) {
          await dataService.createFlashcards([{
            ...flashcard,
            user_id: userId,
            synced: true
          }])
        }
      }

      // Synchroniser les résumés
      for (const summary of localData.summaries) {
        if (!summary.synced) {
          await dataService.createSummary({
            ...summary,
            user_id: userId,
            synced: true
          })
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur de synchronisation:', error)
      return { success: false, error }
    }
  },

  // Récupérer les données depuis Supabase
  async syncFromCloud(userId) {
    try {
      const [subjects, quizzes, flashcards, summaries] = await Promise.all([
        dataService.getSubjects(userId),
        dataService.getQuizzes(userId),
        dataService.getFlashcards(userId),
        dataService.getSummaries(userId)
      ])

      return {
        success: true,
        data: {
          subjects: subjects.data || [],
          quizzes: quizzes.data || [],
          flashcards: flashcards.data || [],
          summaries: summaries.data || []
        }
      }
    } catch (error) {
      console.error('Erreur de récupération:', error)
      return { success: false, error }
    }
  }
}