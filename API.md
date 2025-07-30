# API Documentation - StudyHub V7

## Vue d'ensemble

StudyHub V7 utilise Supabase comme backend principal avec des services locaux pour le parsing PDF et la gestion des données.

## Services principaux

### 1. Service d'authentification (`authService`)

Gère l'authentification des utilisateurs via Supabase Auth.

#### Méthodes

```javascript
// Inscription
const { data, error } = await authService.signUp(email, password)

// Connexion
const { data, error } = await authService.signIn(email, password)

// Déconnexion
const { error } = await authService.signOut()

// Réinitialisation du mot de passe
const { data, error } = await authService.resetPassword(email)

// Mise à jour du mot de passe
const { data, error } = await authService.updatePassword(newPassword)

// Mise à jour du profil
const { data, error } = await authService.updateProfile(updates)
```

### 2. Service de données (`dataService`)

Gère les opérations CRUD sur les données via Supabase.

#### Matières

```javascript
// Récupérer toutes les matières d'un utilisateur
const { data, error } = await dataService.getSubjects(userId)

// Créer une matière
const { data, error } = await dataService.createSubject(subject)

// Mettre à jour une matière
const { data, error } = await dataService.updateSubject(id, updates)

// Supprimer une matière
const { error } = await dataService.deleteSubject(id)
```

#### QCM

```javascript
// Récupérer les QCM
const { data, error } = await dataService.getQuizzes(userId, subjectId)

// Créer un QCM
const { data, error } = await dataService.createQuiz(quiz)

// Mettre à jour un QCM
const { data, error } = await dataService.updateQuiz(id, updates)

// Supprimer un QCM
const { error } = await dataService.deleteQuiz(id)
```

#### Flashcards

```javascript
// Récupérer les flashcards
const { data, error } = await dataService.getFlashcards(userId, subjectId)

// Créer des flashcards
const { data, error } = await dataService.createFlashcards(flashcards)

// Mettre à jour une flashcard
const { data, error } = await dataService.updateFlashcard(id, updates)

// Supprimer une flashcard
const { error } = await dataService.deleteFlashcard(id)
```

#### Résumés

```javascript
// Récupérer les résumés
const { data, error } = await dataService.getSummaries(userId, subjectId)

// Créer un résumé
const { data, error } = await dataService.createSummary(summary)

// Mettre à jour un résumé
const { data, error } = await dataService.updateSummary(id, updates)

// Supprimer un résumé
const { error } = await dataService.deleteSummary(id)
```

### 3. Service PDF (`pdfService`)

Gère l'analyse et l'extraction de contenu depuis les fichiers PDF.

#### Méthodes principales

```javascript
// Charger et analyser un PDF
const result = await pdfService.loadPDF(file)

// Générer des QCM
const quizzes = await pdfService.generateQuizzes(subjectId, numQuestions)

// Générer des flashcards
const flashcards = await pdfService.generateFlashcards(subjectId)

// Générer un résumé
const summary = await pdfService.generateSummary(subjectId)

// Exporter en PDF
const pdfBytes = await pdfService.exportToPDF(content, filename)
```

### 4. Service de synchronisation (`syncService`)

Gère la synchronisation entre les données locales et le cloud.

```javascript
// Synchroniser vers le cloud
const { success, error } = await syncService.syncToCloud(userId, localData)

// Récupérer depuis le cloud
const { success, data, error } = await syncService.syncFromCloud(userId)
```

## Structure des données

### Matière (Subject)

```javascript
{
  id: string,
  name: string,
  description?: string,
  color: string,
  createdAt: string,
  userId: string
}
```

### QCM (Quiz)

```javascript
{
  id: string,
  title: string,
  questions: [
    {
      question: string,
      options: string[],
      correctAnswers: number[],
      explanation?: string
    }
  ],
  difficulty: 'easy' | 'medium' | 'hard',
  subjectId: string,
  createdAt: string,
  userId: string
}
```

### Flashcard

```javascript
{
  id: string,
  term: string,
  definition: string,
  difficulty: 'easy' | 'medium' | 'hard',
  subjectId: string,
  createdAt: string,
  userId: string
}
```

### Résumé (Summary)

```javascript
{
  id: string,
  title: string,
  keyPoints: string[],
  sections: [
    {
      title: string,
      content: string[]
    }
  ],
  importantTerms: [
    {
      term: string,
      count: number,
      importance: 'low' | 'medium' | 'high'
    }
  ],
  subjectId: string,
  createdAt: string,
  userId: string
}
```

### Historique QCM (Quiz History)

```javascript
{
  id: string,
  quizId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpent: number,
  date: string,
  userId: string
}
```

## Configuration Supabase

### Variables d'environnement requises

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Tables de base de données

Voir le README.md pour le script SQL complet de création des tables.

### Politiques RLS (Row Level Security)

```sql
-- Exemple de politique pour les matières
CREATE POLICY "Users can view own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);
```

## Gestion des erreurs

### Types d'erreurs courants

```javascript
// Erreur d'authentification
{
  message: "Invalid login credentials",
  status: 400
}

// Erreur de validation
{
  message: "Validation failed",
  details: { field: "error message" }
}

// Erreur de permission
{
  message: "Access denied",
  status: 403
}

// Erreur de serveur
{
  message: "Internal server error",
  status: 500
}
```

### Gestion des erreurs côté client

```javascript
try {
  const { data, error } = await dataService.createSubject(subject)
  
  if (error) {
    console.error('Erreur:', error.message)
    toast.error(error.message)
    return
  }
  
  // Succès
  toast.success('Matière créée avec succès')
} catch (error) {
  console.error('Erreur inattendue:', error)
  toast.error('Une erreur est survenue')
}
```

## Sécurité

### Authentification

- Utilisation de Supabase Auth avec JWT
- Sessions sécurisées avec refresh tokens
- Validation côté serveur et client

### Autorisation

- Row Level Security (RLS) activé sur toutes les tables
- Politiques basées sur l'ID utilisateur
- Validation des permissions côté serveur

### Validation des données

- Validation côté client avec des schémas
- Validation côté serveur avec les contraintes de base de données
- Sanitisation des entrées utilisateur

## Performance

### Optimisations

- Pagination pour les grandes listes
- Mise en cache des données fréquemment utilisées
- Lazy loading des composants
- Optimisation des requêtes Supabase

### Monitoring

- Logs d'erreurs détaillés
- Métriques de performance
- Surveillance des temps de réponse

## Déploiement

### Variables d'environnement de production

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_ENV=production
```

### Configuration de build

```bash
npm run build
```

Le build génère un dossier `dist/` optimisé pour la production.

## Support et maintenance

### Logs

Les logs sont disponibles dans :
- Console du navigateur (développement)
- Supabase Dashboard (production)
- Services de monitoring tiers

### Debugging

```javascript
// Activer le mode debug
localStorage.setItem('debug', 'studyhub:*')

// Logs détaillés
console.log('Debug data:', data)
```

### Mise à jour

1. Mettre à jour les dépendances : `npm update`
2. Tester en local : `npm run dev`
3. Build de production : `npm run build`
4. Déployer sur la plateforme choisie