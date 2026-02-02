import { TextInput } from './TextInput'

interface VoiceRecorderProps {
  isRecording: boolean
  isProcessing: boolean
  currentTranscript: string
  onToggleRecording: () => void
  showTextInput?: boolean
  onTextSubmit?: (text: string) => void
  onCloseTextInput?: () => void
}

export function VoiceRecorder({
  isRecording,
  isProcessing,
  currentTranscript,
  onToggleRecording,
  showTextInput = false,
  onTextSubmit,
  onCloseTextInput,
}: VoiceRecorderProps) {
  
  if (showTextInput && onTextSubmit && onCloseTextInput) {
    return (
      <TextInput 
        onSubmit={onTextSubmit} 
        onClose={onCloseTextInput} 
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Status Text */}
      <div className="h-20 flex items-center justify-center mb-6">
        {isProcessing ? (
          <div className="flex items-center gap-3 text-text-muted animate-fade-in">
            <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '24px' }}>progress_activity</span>
            <span className="font-bold">Analyse en cours...</span>
          </div>
        ) : isRecording ? (
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
              <p className="text-primary font-bold text-lg">
                J'écoute... (parle normalement ou doucement)
              </p>
            </div>
            {currentTranscript && (
              <p className="text-xl text-white max-w-sm font-medium">
                "{currentTranscript}"
              </p>
            )}
            {!currentTranscript && (
              <p className="text-sm text-text-muted mt-2">
                Le micro est très sensible, parle normalement
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-text-muted font-medium">
              Appuie sur le micro et dis ta dépense
            </p>
          </div>
        )}
      </div>

      {/* Microphone Button */}
      <div className="relative">
        {/* Ripple Effect */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            <div className="absolute -inset-4 rounded-full border-2 border-primary/50 animate-pulse" />
          </>
        )}
        
        <button
          onClick={onToggleRecording}
          disabled={isProcessing}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-primary shadow-lg shadow-primary/30' 
              : 'bg-gradient-to-br from-primary to-tropical-orange shadow-lg shadow-primary/20'
          } hover:scale-105 active:scale-95 disabled:opacity-50`}
          aria-label={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
        >
          {isProcessing ? (
            <span className="material-symbols-outlined text-background-dark animate-spin" style={{ fontSize: '40px' }}>progress_activity</span>
          ) : isRecording ? (
            <span className="material-symbols-outlined text-background-dark" style={{ fontSize: '40px' }}>stop</span>
          ) : (
            <span className="material-symbols-outlined text-background-dark" style={{ fontSize: '40px' }}>mic</span>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        {isRecording ? (
          <p className="text-sm text-primary font-bold animate-pulse">
            Touche pour arrêter
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-text-muted/60 font-bold uppercase tracking-widest">
              Exemples
            </p>
            <p className="text-sm text-text-muted">
              "Gbaka 500" • "Garba 1500" • "Transport taxi 2000"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceRecorder
