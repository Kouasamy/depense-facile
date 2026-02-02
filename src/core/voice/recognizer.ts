// Voice Recognition Module
// Uses Web Speech API with fallback to OpenAI Whisper

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
        'audio-capture': 'Problème avec le micro. Vérifie les permissions.',
        'not-allowed': 'Micro non autorisé. Active le micro dans les paramètres.',
        'network': 'Problème de connexion. Réessaie.',
        'aborted': 'Annulé',
        'language-not-supported': 'Langue non supportée'
      }
      const message = errorMessages[event.error] || `Erreur: ${event.error}`
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

// Whisper API Recognition (fallback)
class WhisperRecognizer {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private isRecording = false
  private options: RecognitionOptions = {}
  private stream: MediaStream | null = null

  async start(options: RecognitionOptions = {}): Promise<void> {
    this.options = options

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false, // Disabled for better sensitivity to quiet voices
          noiseSuppression: false, // Disabled to capture all sounds including quiet speech
          autoGainControl: true, // Auto gain for better volume - amplifies quiet voices
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1 // Mono for better processing
        } 
      })

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType()
      })

      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        await this.processAudio()
      }

      this.mediaRecorder.start()
      this.isRecording = true
      this.options.onStart?.()

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur micro'
      this.options.onError?.(message)
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    
    return 'audio/webm'
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      
      // Stop all audio tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
    }
  }

  abort(): void {
    this.stop()
    this.audioChunks = []
    this.options.onEnd?.()
  }

  private async processAudio(): Promise<void> {
    if (this.audioChunks.length === 0) {
      this.options.onError?.('Aucun audio enregistré')
      this.options.onEnd?.()
      return
    }

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
    
    // Check if Whisper API is configured
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!apiKey) {
      // No API key - try to handle locally or show error
      this.options.onError?.('Whisper API non configurée. Active le mode en ligne.')
      this.options.onEnd?.()
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')
      formData.append('language', 'fr')
      formData.append('response_format', 'json')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.options.onResult?.({
        transcript: result.text,
        confidence: 0.9, // Whisper doesn't return confidence
        isFinal: true
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur transcription'
      this.options.onError?.(message)
    }

    this.options.onEnd?.()
  }

  getIsRecording(): boolean {
    return this.isRecording
  }
}

// Main Voice Recognizer - automatically selects best available method
export class VoiceRecognizer {
  private webSpeech: WebSpeechRecognizer | null = null
  private whisper: WhisperRecognizer | null = null
  private useWhisper = false
  private isActive = false

  constructor(preferWhisper = false) {
    this.useWhisper = preferWhisper

    if (isWebSpeechAvailable() && !preferWhisper) {
      this.webSpeech = new WebSpeechRecognizer()
    } else {
      this.whisper = new WhisperRecognizer()
      this.useWhisper = true
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

    if (this.useWhisper && this.whisper) {
      await this.whisper.start(wrappedOptions)
    } else if (this.webSpeech) {
      this.webSpeech.start(wrappedOptions)
    } else {
      options.onError?.('Aucune méthode de reconnaissance disponible')
    }
  }

  stop(): void {
    if (this.webSpeech) {
      this.webSpeech.stop()
    }
    if (this.whisper) {
      this.whisper.stop()
    }
    this.isActive = false
  }

  abort(): void {
    if (this.webSpeech) {
      this.webSpeech.abort()
    }
    if (this.whisper) {
      this.whisper.abort()
    }
    this.isActive = false
  }

  isListening(): boolean {
    return this.isActive
  }

  // Switch between Web Speech and Whisper
  setUseWhisper(use: boolean): void {
    if (use && !this.whisper) {
      this.whisper = new WhisperRecognizer()
    }
    if (!use && !this.webSpeech && isWebSpeechAvailable()) {
      this.webSpeech = new WebSpeechRecognizer()
    }
    this.useWhisper = use
  }

  isUsingWhisper(): boolean {
    return this.useWhisper
  }
}

// Singleton instance
let recognizerInstance: VoiceRecognizer | null = null

export function getVoiceRecognizer(preferWhisper = false): VoiceRecognizer {
  if (!recognizerInstance) {
    recognizerInstance = new VoiceRecognizer(preferWhisper)
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

