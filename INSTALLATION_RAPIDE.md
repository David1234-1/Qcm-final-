# 🚀 Installation Rapide - StudyHub V7

## 📦 Décompression et installation

### 1. Décompresser le ZIP
```bash
unzip StudyHub_V7_Final.zip
cd studyhub-v7
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration Supabase (optionnel)
```bash
cp .env.example .env.local
# Éditer .env.local avec vos identifiants Supabase
```

### 4. Démarrage
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## ⚡ Démarrage ultra-rapide

Si vous avez Node.js 18+ installé, utilisez le script automatique :

```bash
chmod +x start.sh
./start.sh
```

## 📋 Contenu du ZIP

### 🎯 Fichiers principaux
- `package.json` - Configuration et dépendances
- `vite.config.js` - Configuration Vite
- `tailwind.config.js` - Configuration Tailwind CSS
- `index.html` - Point d'entrée HTML

### 📁 Structure des dossiers
```
src/
├── components/     # Composants réutilisables
├── pages/         # Pages de l'application
├── services/      # Services (Supabase, PDF)
├── stores/        # Stores Zustand
├── utils/         # Utilitaires
└── assets/        # Ressources

public/            # Fichiers publics
```

### 📄 Documentation
- `README.md` - Documentation complète
- `API.md` - Documentation de l'API
- `.env.example` - Exemple de configuration

### ⚙️ Configuration
- `.eslintrc.cjs` - Configuration ESLint
- `.prettierrc` - Configuration Prettier
- `vercel.json` - Configuration Vercel
- `netlify.toml` - Configuration Netlify

## 🔧 Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Copiez l'URL et la clé anonyme
3. Créez le fichier `.env.local` :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🎮 Utilisation

1. **Créer un compte** ou se connecter
2. **Créer une matière** (ex: Mathématiques)
3. **Importer un PDF** de cours
4. **Étudier** avec les QCM et flashcards générés automatiquement

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

## 📞 Support

- **Documentation** : `README.md`
- **API** : `API.md`
- **Issues** : GitHub Issues

---

**StudyHub V7** - Prêt à transformer vos cours en expérience d'apprentissage interactive ! 🎓✨