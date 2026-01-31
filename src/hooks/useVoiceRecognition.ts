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
    
    setIsAvailable(hasWebSpeech || hasMediaDevices)
    
    if (hasWebSpeech || hasMediaDevices) {
      recognizerRef.current = new VoiceRecognizer(false) // Prefer Web Speech
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
      setAiMessage('Reconnaissance vocale non disponible sur cet appareil.')
      return
    }

    setRecording(true)
    setTranscript('')

    try {
      await recognizerRef.current.start({
        language: 'fr-FR',
        interimResults: true,
        
        onResult: (result) => {
          setTranscript(result.transcript)
          
          // If final result, process it
          if (result.isFinal) {
            processTranscript(result.transcript)
          }
        },
        
        onError: (error) => {
          setRecording(false)
          setAiMessage(error)
        },
        
        onEnd: () => {
          setRecording(false)
        }
      })
    } catch (error) {
      setRecording(false)
      setAiMessage('Erreur au démarrage du micro.')
    }
  }, [setRecording, setTranscript, setAiMessage])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop()
    }
    setRecording(false)
    
    // If we have a transcript but it wasn't finalized, process it now
    if (currentTranscript && !isProcessing) {
      processTranscript(currentTranscript)
    }
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

