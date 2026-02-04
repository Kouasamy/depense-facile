import { useState, useCallback, useRef, useEffect } from 'react'
import { VoiceRecognizer, isWebSpeechAvailable } from '../core/voice/recognizer'
import { parseExpenseText } from '../core/nlp/parser'
import { useExpenseStore } from '../stores/expenseStore'

export function useVoiceRecognition() {
  const [isAvailable, setIsAvailable] = useState(false)
  const recognizerRef = useRef<VoiceRecognizer | null>(null)
  
  const {
    isRecording,
    isProcessing,
    currentTranscript,
    setRecording,
    setProcessing,
    setTranscript,
    setParsedExpense,
    setAiMessage
  } = useExpenseStore()

  // Initialize recognizer
  useEffect(() => {
    const hasWebSpeech = isWebSpeechAvailable()
    const hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1'
    
    // Check availability
    const available = hasWebSpeech || (hasMediaDevices && isSecure)
    setIsAvailable(available)
    
    if (available) {
      recognizerRef.current = new VoiceRecognizer(false) // Prefer Web Speech
    } else if (!isSecure && window.location.hostname !== 'localhost') {
      // Log warning for HTTPS requirement
      console.warn('Reconnaissance vocale nécessite HTTPS en production')
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort()
      }
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    if (!recognizerRef.current) {
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'
      
      if (!isSecure && window.location.hostname !== 'localhost') {
        setAiMessage('La reconnaissance vocale nécessite HTTPS. Assure-toi que le site utilise https://')
      } else {
        setAiMessage('Reconnaissance vocale non disponible sur cet appareil. Vérifie les permissions du micro.')
      }
      return
    }

    setRecording(true)
    setTranscript('')

    try {
      await recognizerRef.current.start({
        language: 'fr-FR',
        continuous: true, // Continuous mode for better capture
        interimResults: true, // Show results as you speak
        
        onResult: (result) => {
          // Always update transcript for better UX - even for quiet speech
          if (result.transcript && result.transcript.trim()) {
            setTranscript(result.transcript)
          }
          
          // Process final results immediately
          if (result.isFinal && result.transcript.trim()) {
            processTranscript(result.transcript)
          }
        },
        
        onError: (error) => {
          setRecording(false)
          // Provide more helpful error messages
          let errorMessage = error
          if (error.includes('not-allowed') || error.includes('non autorisé')) {
            errorMessage = 'Micro non autorisé. Clique sur l\'icône de cadenas dans la barre d\'adresse et autorise le micro.'
          } else if (error.includes('HTTPS') || error.includes('service-not-allowed')) {
            errorMessage = 'La reconnaissance vocale nécessite HTTPS. Le site doit être en https:// pour fonctionner.'
          }
          setAiMessage(errorMessage)
        },
        
        onEnd: () => {
          setRecording(false)
        }
      })
    } catch (error) {
      setRecording(false)
      const errorMsg = error instanceof Error ? error.message : 'Erreur au démarrage du micro.'
      setAiMessage(`Erreur : ${errorMsg}. Vérifie les permissions du navigateur.`)
    }
  }, [setRecording, setTranscript, setAiMessage])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop()
    }
    setRecording(false)
    
    // Wait a bit for any final results, then process
    setTimeout(() => {
      if (currentTranscript && currentTranscript.trim() && !isProcessing) {
        processTranscript(currentTranscript)
      }
    }, 500) // Give time for final results to arrive
  }, [currentTranscript, isProcessing, setRecording])

  // Process transcript through NLP
  const processTranscript = useCallback((text: string) => {
    if (!text.trim()) {
      setAiMessage('Je n\'ai rien entendu. Essaie encore ?')
      return
    }

    setProcessing(true)

    // Small delay for UX
    setTimeout(() => {
      const result = parseExpenseText(text)
      
      if (result.success && result.expense) {
        setParsedExpense(result.expense)
        setAiMessage('C\'est ça ?')
      } else {
        setAiMessage(result.error || 'Je n\'ai pas compris. Essaie encore ?')
      }
      
      setProcessing(false)
    }, 300)
  }, [setProcessing, setParsedExpense, setAiMessage])

  // Cancel and reset
  const cancel = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.abort()
    }
    setRecording(false)
    setTranscript('')
    setProcessing(false)
  }, [setRecording, setTranscript, setProcessing])

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [setTranscript])

  return {
    isAvailable,
    isRecording,
    isProcessing,
    transcript: currentTranscript,
    currentTranscript,
    startRecording,
    stopRecording,
    resetTranscript,
    cancel,
    processText: processTranscript
  }
}

