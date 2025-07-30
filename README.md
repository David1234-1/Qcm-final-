# StudyHub V7 - Assistant d'étude intelligent

Une application web moderne pour optimiser votre apprentissage avec des QCM, flashcards et résumés générés automatiquement à partir de vos documents PDF.

## 🎯 Fonctionnalités principales

### 📚 Import et analyse de PDF
- Import de documents PDF de cours
- Extraction intelligente du contenu
- Génération automatique de contenu d'étude

### 🧠 Contenu généré automatiquement
- **QCM** : 10 questions à choix multiples par document
- **Flashcards** : Termes et définitions détectés automatiquement
- **Résumés** : Points clés et structure du document

### 📊 Gestion des matières
- Organisation par matière avec codes couleur
- Filtrage et recherche avancée
- Statistiques de progression

### 🎮 Modes d'étude interactifs
- **Mode QCM** : Quiz chronométrés avec suivi des erreurs
- **Mode Flashcards** : Cartes mémoire avec animations 3D
- **Rejouer erreurs** : Focus sur les questions ratées

### ☁️ Synchronisation cloud
- Sauvegarde automatique sur Supabase
- Fonctionnement hors ligne avec sync
- Multi-comptes supportés

### 📱 Interface moderne
- Design responsive et accessible
- Mode sombre par défaut
- Animations fluides avec Framer Motion

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (optionnel)

### Installation locale

```bash
# Cloner le projet
git clone <repository-url>
cd studyhub-v7

# Installer les dépendances
npm install

# Configuration Supabase (optionnel)
cp .env.example .env.local
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# Lancer en développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
npm run build
npm run preview
```

## 🛠️ Stack technique

### Frontend
- **React 18** - Interface utilisateur
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Styling et design system
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Zustand** - Gestion d'état

### Backend & Services
- **Supabase** - Authentification et base de données
- **PDF.js** - Parsing de documents PDF
- **PDF-lib** - Manipulation de PDF
- **jsPDF** - Export PDF

### Outils de développement
- **ESLint** - Linting
- **Prettier** - Formatage
- **TypeScript** - Typage statique

## 📁 Structure du projet

```
studyhub-v7/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── services/      # Services (Supabase, PDF)
│   ├── stores/        # Stores Zustand
│   ├── utils/         # Utilitaires
│   ├── hooks/         # Hooks personnalisés
│   └── assets/        # Ressources statiques
├── public/            # Fichiers publics
├── package.json       # Dépendances
└── README.md         # Documentation
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` :

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Configurez les tables suivantes :

```sql
-- Table des matières
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des QCM
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des flashcards
CREATE TABLE flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject_id UUID REFERENCES subjects(id),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des résumés
CREATE TABLE summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  key_points JSONB NOT NULL,
  sections JSONB,
  important_terms JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'historique des QCM
CREATE TABLE quiz_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  quiz_id UUID REFERENCES quizzes(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Activez Row Level Security (RLS) et configurez les politiques

## 🎨 Personnalisation

### Thèmes et couleurs

Modifiez `tailwind.config.js` pour personnaliser :
- Couleurs primaires et secondaires
- Typographie
- Animations personnalisées

### Composants

Tous les composants sont modulaires et réutilisables dans `src/components/`

## 📱 Utilisation

### Première utilisation

1. Créez un compte ou connectez-vous
2. Créez votre première matière
3. Importez un PDF de cours
4. L'application génère automatiquement le contenu d'étude

### Workflow d'étude

1. **Import** : Uploadez vos PDF de cours
2. **Organisation** : Organisez par matière
3. **Étude** : Utilisez les QCM et flashcards
4. **Suivi** : Consultez vos statistiques
5. **Révision** : Rejouez vos erreurs

## 🔒 Sécurité

- Authentification sécurisée via Supabase
- Row Level Security (RLS) activé
- Validation des données côté client et serveur
- Pas de stockage de mots de passe en clair

## 🚀 Déploiement

### Vercel (recommandé)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Uploadez le dossier dist/
```

### Autres plateformes

L'application est compatible avec toutes les plateformes supportant les SPA React.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation** : Ce README
- **Issues** : GitHub Issues
- **Email** : support@studyhub.com

## 🗺️ Roadmap

- [ ] Support des images dans les PDF
- [ ] Mode collaboratif
- [ ] API mobile
- [ ] Intégration IA avancée
- [ ] Support multi-langues
- [ ] Mode hors ligne complet

---

**StudyHub V7** - Transformez vos cours en expérience d'apprentissage interactive ! 🚀