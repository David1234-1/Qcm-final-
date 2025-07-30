import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

// Configuration de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export class PDFService {
  constructor() {
    this.pdfDocument = null
    this.textContent = []
    this.images = []
  }

  // Charger et analyser un PDF
  async loadPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      this.pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      await this.extractContent()
      return {
        success: true,
        pages: this.pdfDocument.numPages,
        textContent: this.textContent,
        images: this.images
      }
    } catch (error) {
      console.error('Erreur lors du chargement du PDF:', error)
      return { success: false, error: error.message }
    }
  }

  // Extraire le contenu du PDF
  async extractContent() {
    this.textContent = []
    this.images = []

    for (let pageNum = 1; pageNum <= this.pdfDocument.numPages; pageNum++) {
      const page = await this.pdfDocument.getPage(pageNum)
      
      // Extraire le texte
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .trim()
      
      if (pageText) {
        this.textContent.push({
          page: pageNum,
          text: pageText,
          items: textContent.items
        })
      }

      // Extraire les images (optionnel)
      try {
        const operatorList = await page.getOperatorList()
        // Logique d'extraction d'images si nécessaire
      } catch (error) {
        console.warn('Impossible d\'extraire les images de la page', pageNum)
      }
    }
  }

  // Générer des QCM à partir du contenu
  async generateQuizzes(subjectId, numQuestions = 10) {
    const allText = this.textContent.map(page => page.text).join(' ')
    const sentences = this.extractSentences(allText)
    const keyTerms = this.extractKeyTerms(allText)
    
    const quizzes = []
    
    for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
      const sentence = sentences[i]
      const quiz = await this.createQuizFromSentence(sentence, keyTerms, subjectId)
      if (quiz) {
        quizzes.push(quiz)
      }
    }

    return quizzes
  }

  // Générer des flashcards à partir du contenu
  async generateFlashcards(subjectId) {
    const allText = this.textContent.map(page => page.text).join(' ')
    const keyTerms = this.extractKeyTerms(allText)
    const definitions = this.extractDefinitions(allText)
    
    const flashcards = []
    
    // Associer les termes avec leurs définitions
    for (const term of keyTerms) {
      const definition = this.findDefinitionForTerm(term, definitions)
      if (definition) {
        flashcards.push({
          term: term.term,
          definition: definition,
          subjectId: subjectId,
          difficulty: term.importance,
          createdAt: new Date().toISOString()
        })
      }
    }

    return flashcards
  }

  // Générer un résumé structuré
  async generateSummary(subjectId) {
    const allText = this.textContent.map(page => page.text).join(' ')
    
    const summary = {
      title: this.extractTitle(),
      keyPoints: this.extractKeyPoints(allText),
      sections: this.extractSections(),
      importantTerms: this.extractKeyTerms(allText).slice(0, 20),
      subjectId: subjectId,
      createdAt: new Date().toISOString()
    }

    return summary
  }

  // Méthodes utilitaires
  extractSentences(text) {
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 20 && sentence.length < 200)
      .slice(0, 50) // Limiter le nombre de phrases
  }

  extractKeyTerms(text) {
    // Mots-clés importants (termes techniques, concepts)
    const importantWords = text
      .toLowerCase()
      .match(/\b[a-zÀ-ÿ]{4,}\b/g)
      .filter(word => !this.isCommonWord(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})

    return Object.entries(importantWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .map(([term, count]) => ({
        term: term.charAt(0).toUpperCase() + term.slice(1),
        count,
        importance: count > 3 ? 'high' : count > 1 ? 'medium' : 'low'
      }))
  }

  extractDefinitions(text) {
    // Chercher des définitions (patterns comme "X est", "X désigne", etc.)
    const definitionPatterns = [
      /([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*)\s+(?:est|désigne|signifie|représente)\s+([^.!?]+)/gi,
      /([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*)\s*:\s*([^.!?]+)/gi
    ]

    const definitions = []
    
    for (const pattern of definitionPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        definitions.push({
          term: match[1].trim(),
          definition: match[2].trim()
        })
      }
    }

    return definitions
  }

  findDefinitionForTerm(term, definitions) {
    return definitions.find(def => 
      def.term.toLowerCase().includes(term.term.toLowerCase()) ||
      term.term.toLowerCase().includes(def.term.toLowerCase())
    )?.definition || `Définition de ${term.term}`
  }

  extractTitle() {
    // Essayer d'extraire le titre du premier paragraphe ou de la première page
    if (this.textContent.length > 0) {
      const firstPageText = this.textContent[0].text
      const lines = firstPageText.split('\n').filter(line => line.trim())
      
      // Chercher une ligne qui ressemble à un titre
      for (const line of lines.slice(0, 5)) {
        if (line.length > 5 && line.length < 100 && 
            line === line.toUpperCase() || 
            line.match(/^[A-Z][^.!?]*$/)) {
          return line.trim()
        }
      }
    }
    
    return 'Document sans titre'
  }

  extractKeyPoints(text) {
    const sentences = this.extractSentences(text)
    return sentences
      .filter(sentence => 
        sentence.includes('important') || 
        sentence.includes('clé') || 
        sentence.includes('principal') ||
        sentence.includes('notamment') ||
        sentence.includes('particulièrement')
      )
      .slice(0, 10)
  }

  extractSections() {
    const sections = []
    let currentSection = null

    for (const page of this.textContent) {
      const lines = page.text.split('\n')
      
      for (const line of lines) {
        // Détecter les titres de section
        if (line.match(/^[0-9]+\.\s+[A-Z]/) || 
            line.match(/^[A-Z][^.!?]*$/) && line.length < 100) {
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = {
            title: line.trim(),
            content: []
          }
        } else if (currentSection && line.trim()) {
          currentSection.content.push(line.trim())
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    return sections
  }

  isCommonWord(word) {
    const commonWords = [
      'avec', 'pour', 'dans', 'sur', 'par', 'les', 'des', 'une', 'est', 'sont',
      'cette', 'comme', 'plus', 'tout', 'fait', 'peut', 'nous', 'vous', 'leur',
      'avoir', 'être', 'faire', 'dire', 'voir', 'savoir', 'pouvoir', 'vouloir',
      'devoir', 'aller', 'venir', 'prendre', 'donner', 'mettre', 'passer',
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
    ]
    return commonWords.includes(word.toLowerCase())
  }

  async createQuizFromSentence(sentence, keyTerms, subjectId) {
    try {
      // Créer une question basée sur la phrase
      const question = this.createQuestionFromSentence(sentence)
      const options = this.generateOptions(sentence, keyTerms)
      
      if (question && options.length >= 2) {
        return {
          question: question,
          options: options,
          correctAnswers: [0], // Par défaut, première réponse correcte
          explanation: sentence,
          subjectId: subjectId,
          difficulty: 'medium',
          createdAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la création du QCM:', error)
    }
    
    return null
  }

  createQuestionFromSentence(sentence) {
    // Transformer une phrase en question
    if (sentence.includes('est')) {
      return sentence.replace(/est/, 'est-il')
    } else if (sentence.includes('sont')) {
      return sentence.replace(/sont/, 'sont-ils')
    } else {
      return `Quelle affirmation est correcte concernant : "${sentence.substring(0, 50)}..." ?`
    }
  }

  generateOptions(sentence, keyTerms) {
    const options = [sentence] // Réponse correcte
    
    // Générer des réponses incorrectes
    const incorrectOptions = keyTerms
      .filter(term => !sentence.toLowerCase().includes(term.term.toLowerCase()))
      .slice(0, 3)
      .map(term => `Cette affirmation concerne ${term.term}`)
    
    return [...options, ...incorrectOptions]
  }

  // Exporter en PDF
  async exportToPDF(content, filename) {
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      
      // Ajouter le contenu au PDF
      // Cette fonction serait implémentée selon le type de contenu
      
      const pdfBytes = await pdfDoc.save()
      return pdfBytes
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
      throw error
    }
  }
}

// Instance singleton
export const pdfService = new PDFService()