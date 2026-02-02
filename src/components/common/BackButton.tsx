import { useNavigate } from 'react-router-dom'
import './BackButton.css'

export function BackButton() {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <button 
      className="back-button"
      onClick={handleBack}
      aria-label="Retour à la page précédente"
      title="Retour"
    >
      <span className="material-symbols-outlined">arrow_back</span>
    </button>
  )
}

