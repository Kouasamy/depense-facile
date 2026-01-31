import { useState } from 'react'
import { Send, X } from 'lucide-react'

interface TextInputProps {
  onSubmit: (text: string) => void
  onClose: () => void
}

export function TextInput({ onSubmit, onClose }: TextInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim())
      setText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const suggestions = [
    'Gbaka 500',
    'Garba 1500',
    'Taxi 2000',
    'Crédit 1000',
  ]

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Gbaka 500, Garba 1500..."
          className="input pr-24 text-lg"
          autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="btn btn-primary btn-icon"
            title="Envoyer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSubmit(suggestion)}
            className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TextInput
