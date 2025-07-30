#!/bin/bash

echo "🚀 Démarrage de StudyHub V7..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ est requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier si le fichier .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  Fichier .env.local non trouvé"
    echo "📝 Création d'un fichier .env.local d'exemple..."
    cp .env.example .env.local
    echo "🔧 Veuillez configurer vos variables d'environnement dans .env.local"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
fi

echo "🌐 Démarrage du serveur de développement..."
echo "📱 L'application sera accessible sur http://localhost:3000"
echo ""

npm run dev