// Voice Recognition Module
// Utilise uniquement l'API Web Speech du navigateur (100% gratuit)

export interface RecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface RecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (result: RecognitionResult) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

// Check if Web Speech API is available
export function isWebSpeechAvailable(): boolean {
  // Web Speech API requires HTTPS in production (except localhost)
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1'
  
  if (!isSecure) {
    console.warn('Web Speech API requires HTTPS in production')
    return false
  }
  
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

// Web Speech API Recognition
class WebSpeechRecognizer {
  private recognition: SpeechRecognition | null = null
  private isListening = false
  private options: RecognitionOptions = {}

  constructor() {
    this.initRecognition()
  }

  private initRecognition(): void {
    if (!isWebSpeechAvailable()) {
      console.warn('Web Speech API not available')
      return
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognitionAPI() as SpeechRecognition

    // Default configuration - Optimized for sensitivity
    this.recognition.continuous = true // Continuous mode for better capture
    this.recognition.interimResults = true // Show results as you speak
    this.recognition.lang = 'fr-FR' // French for Côte d'Ivoire
    this.recognition.maxAlternatives = 3 // More alternatives for better accuracy
  }

  start(options: RecognitionOptions = {}): void {
    if (!this.recognition) {
      options.onError?.('Reconnaissance vocale non disponible')
      return
    }

    if (this.isListening) {
      this.stop()
    }

    this.options = options

    // Apply options
    if (options.language) {
      this.recognition.lang = options.language
    }
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous
    }
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults
    }

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true
      this.options.onStart?.()
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.options.onEnd?.()
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false
      const errorMessages: Record<string, string> = {
        'no-speech': 'Je n\'ai rien entendu. Parle un peu plus fort ou rapproche-toi du micro !',
        'audio-capture': 'Problème avec le micro. Vérifie les permissions du navigateur.',
        'not-allowed': 'Micro non autorisé. Active le micro dans les paramètres du navigateur.',
        'network': 'Problème de connexion. Vérifie ta connexion internet.',
        'aborted': 'Annulé',
        'language-not-supported': 'Langue non supportée',
        'service-not-allowed': 'Service non autorisé. Vérifie que tu es en HTTPS.'
      }
      let message = errorMessages[event.error] || `Erreur: ${event.error}`
      
      // Add helpful hint for HTTPS issues
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        message += ' (La reconnaissance vocale nécessite HTTPS en production)'
      }
      
      this.options.onError?.(message)
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Collect all results for better accuracy
      let fullTranscript = ''
      let maxConfidence = 0
      let hasFinal = false
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result[0]) {
          fullTranscript += result[0].transcript + ' '
          if (result[0].confidence > maxConfidence) {
            maxConfidence = result[0].confidence
          }
          if (result.isFinal) {
            hasFinal = true
          }
        }
      }
      
      // Use the best alternative if available
      const lastResult = event.results[event.results.length - 1]
      let bestTranscript = lastResult[0]?.transcript || fullTranscript.trim()
      let bestConfidence = lastResult[0]?.confidence || maxConfidence
      
      // Try to get better alternative if confidence is low
      if (bestConfidence < 0.7 && lastResult.length > 1) {
        // Check other alternatives
        for (let i = 1; i < lastResult.length; i++) {
          if (lastResult[i].confidence > bestConfidence) {
            bestTranscript = lastResult[i].transcript
            bestConfidence = lastResult[i].confidence
          }
        }
      }

      this.options.onResult?.({
        transcript: bestTranscript.trim() || fullTranscript.trim(),
        confidence: bestConfidence || maxConfidence,
        isFinal: hasFinal || lastResult.isFinal
      })
    }

    try {
      this.recognition.start()
    } catch (error) {
      this.options.onError?.('Impossible de démarrer la reconnaissance')
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
  }
}

// Main Voice Recognizer - automatically selects best available method
export class VoiceRecognizer {
  private webSpeech: WebSpeechRecognizer | null = null
  private isActive = false

  constructor() {
    // On ne supporte que Web Speech (pas Whisper) pour rester 100% gratuit
    if (isWebSpeechAvailable()) {
      this.webSpeech = new WebSpeechRecognizer()
    } else {
      console.warn('Aucune API de reconnaissance vocale disponible dans ce navigateur.')
    }
  }

  async start(options: RecognitionOptions = {}): Promise<void> {
    if (this.isActive) {
      this.stop()
    }

    this.isActive = true

    // Wrap callbacks to track active state
    const wrappedOptions: RecognitionOptions = {
      ...options,
      onEnd: () => {
        this.isActive = false
        options.onEnd?.()
      },
      onError: (error) => {
        this.isActive = false
        options.onError?.(error)
      }
    }

    if (this.webSpeech) {
      this.webSpeech.start(wrappedOptions)
    } else {
      options.onError?.('Aucune méthode de reconnaissance disponible')
    }
  }

  stop(): void {
    if (this.webSpeech) {
      this.webSpeech.stop()
    }
    this.isActive = false
  }

  abort(): void {
    if (this.webSpeech) {
      this.webSpeech.abort()
    }
    this.isActive = false
  }

  isListening(): boolean {
    return this.isActive
  }

  // API conservée pour compatibilité, mais ne fait plus rien (Whisper désactivé)
  setUseWhisper(_use: boolean): void {
    // noop
  }

  isUsingWhisper(): boolean {
    return false
  }
}

// Singleton instance
let recognizerInstance: VoiceRecognizer | null = null

export function getVoiceRecognizer(): VoiceRecognizer {
  if (!recognizerInstance) {
    recognizerInstance = new VoiceRecognizer()
  }
  return recognizerInstance
}

// Type declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

