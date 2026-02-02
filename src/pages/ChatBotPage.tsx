import { useState, useRef, useEffect } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import {
  analyzeMessage,
  generateResponse,
  generateSavingsPlan,
  getQuickReplies,
  type ChatMessage,
  type ConversationContext,
  type SavingsPlan,
  type RealUserData
} from '../core/ai/chatbot'
import { downloadSavingsPlanPDF } from '../utils/savingsPlanPdf'
import { BackButton } from '../components/common'
import './ChatBotPage.css'

export function ChatBotPage() {
  const { totalIncomes, totalExpenses, categoryTotals } = useExpenseStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [context, setContext] = useState<ConversationContext>({})
  const [currentPlan, setCurrentPlan] = useState<SavingsPlan | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialContext: ConversationContext = {
        income: totalIncomes > 0 ? totalIncomes : undefined,
        expenses: totalExpenses > 0 ? totalExpenses : undefined,
        categorySpending: Object.keys(categoryTotals).length > 0 ? categoryTotals : undefined
      }
      setContext(initialContext)

      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: totalIncomes > 0 
          ? `Hey, c'est **Woro** ton conseiller !\n\nJe vois que tu gagnes environ **${formatCurrency(totalIncomes)}** par mois. Excellent !\n\nDis-moi, tu veux épargner pour quoi ? Un projet, une urgence, ou juste mieux gérer ton argent ?`
          : `Hey, c'est **Woro** ton conseiller !\n\nJe suis là pour t'aider à gérer ton argent comme un pro. Dis-moi combien tu gagnes par mois et quels sont tes objectifs !`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [totalIncomes, totalExpenses])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    const { context: newContext } = analyzeMessage(inputValue, context)
    setContext(newContext)

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))
    
    const hasPreviousPlan = currentPlan !== null

    const { response, shouldGeneratePlan } = generateResponse(
      inputValue,
      newContext,
      [...messages, userMessage],
      hasPreviousPlan
    )

    let plan: SavingsPlan | undefined
    if (shouldGeneratePlan) {
      const realUserData: RealUserData = {
        actualIncome: totalIncomes > 0 ? totalIncomes : (newContext.income || 150000),
        actualExpenses: totalExpenses > 0 ? totalExpenses : (newContext.expenses || 0),
        categorySpending: Object.keys(categoryTotals).length > 0 ? categoryTotals : undefined
      }
      plan = generateSavingsPlan(newContext, realUserData)
      setCurrentPlan(plan)
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      savingsPlan: plan
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleDownloadPDF = async (plan: SavingsPlan) => {
    setIsGeneratingPdf(true)
    try {
      await downloadSavingsPlanPDF(plan)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
    setIsGeneratingPdf(false)
  }

  const handleReset = () => {
    setMessages([])
    setContext({})
    setCurrentPlan(null)
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Ok, on recommence !\n\nDis-moi:\n- Ton salaire mensuel\n- Ton objectif d'épargne\n- Tes difficultés actuelles`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }, 100)
  }

  const quickReplies = getQuickReplies(context, currentPlan !== null)

  return (
    <div className="chatbot-page">
      <BackButton />
      {/* Header */}
      <header className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <span className="material-symbols-outlined">smart_toy</span>
              <div className="chatbot-avatar-status"></div>
            </div>
            <div>
              <h1 className="chatbot-title">
                Conseiller Woro
                <span className="badge badge-primary">IA</span>
              </h1>
              <p className="chatbot-subtitle">Ton coach financier personnel</p>
            </div>
          </div>
          <button onClick={handleReset} className="btn btn-secondary btn-icon" title="Recommencer">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </header>

      {/* Context Badges */}
      {(totalIncomes > 0 || context.income || context.savingsGoal) && (
        <div className="chatbot-badges">
          {totalIncomes > 0 && (
            <span className="badge badge-success">
              <span className="material-symbols-outlined">verified</span>
              Revenu: {formatCurrency(totalIncomes)}/mois
            </span>
          )}
          {context.savingsGoal && (
            <span className="badge badge-secondary">
              <span className="material-symbols-outlined">target</span>
              Objectif: {formatCurrency(context.savingsGoal)}
            </span>
          )}
          {totalExpenses > 0 && (
            <span className="badge badge-warning">
              <span className="material-symbols-outlined">receipt_long</span>
              Dépenses: {formatCurrency(totalExpenses)}
            </span>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div className="chatbot-messages">
        <div className="chatbot-messages-inner">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbot-message ${message.role === 'user' ? 'user' : 'assistant'} animate-fade-in-up`}
            >
              {/* Avatar */}
              <div className={`chatbot-message-avatar ${message.role}`}>
                <span className="material-symbols-outlined">
                  {message.role === 'user' ? 'person' : 'smart_toy'}
                </span>
              </div>

              {/* Message Bubble */}
              <div className="chatbot-message-content">
                <div className={`chatbot-bubble ${message.role}`}>
                  <div className="chatbot-bubble-text">
                    {message.content.split('**').map((part, index) => 
                      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                    )}
                  </div>
                </div>

                {/* Savings Plan Card */}
                {message.savingsPlan && (
                  <div className="chatbot-plan-card animate-scale-in">
                    <div className="chatbot-plan-header">
                      <div className="chatbot-plan-title">
                        <span className="material-symbols-outlined">description</span>
                        <span>Plan d'épargne prêt !</span>
                      </div>
                      <span className="badge badge-primary">Personnalisé</span>
                    </div>
                    
                    {/* Income Display */}
                    <div className="chatbot-plan-income">
                      <p className="chatbot-plan-label">Votre revenu mensuel</p>
                      <p className="chatbot-plan-value text-success">{formatCurrency(message.savingsPlan.monthlyIncome)}</p>
                    </div>
                    
                    <div className="chatbot-plan-stats">
                      <div className="chatbot-plan-stat">
                        <p className="chatbot-plan-label">Objectif</p>
                        <p className="chatbot-plan-value text-accent">{formatCurrency(message.savingsPlan.savingsGoal)}</p>
                      </div>
                      <div className="chatbot-plan-stat">
                        <p className="chatbot-plan-label">Durée</p>
                        <p className="chatbot-plan-value">{message.savingsPlan.timelineMonths} mois</p>
                      </div>
                    </div>
                    
                    <div className="chatbot-plan-monthly">
                      <p className="chatbot-plan-label">Épargne mensuelle</p>
                      <p className="chatbot-plan-value">
                        {formatCurrency(Math.round(message.savingsPlan.savingsGoal / message.savingsPlan.timelineMonths))}
                        <span className="chatbot-plan-percent">({message.savingsPlan.savingsPercentage}% du revenu)</span>
                      </p>
                    </div>

                    <div className="chatbot-plan-actions">
                      <button
                        onClick={() => handleDownloadPDF(message.savingsPlan!)}
                        disabled={isGeneratingPdf}
                        className="btn btn-primary"
                      >
                        {isGeneratingPdf ? (
                          <>
                            <span className="material-symbols-outlined spinning">progress_activity</span>
                            Génération...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">download</span>
                            Télécharger le PDF
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setInputValue('Je veux modifier mon plan')}
                        className="btn btn-secondary"
                      >
                        <span className="material-symbols-outlined">edit</span>
                        Modifier
                      </button>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <p className="chatbot-message-time">
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chatbot-message assistant animate-fade-in">
              <div className="chatbot-message-avatar assistant">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div className="chatbot-bubble assistant">
                <div className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && !isTyping && (
        <div className="chatbot-quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="chatbot-quick-reply"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="chatbot-input-area">
        <div className="chatbot-input-container">
          <div className="chatbot-input-wrapper">
            <button className="chatbot-input-btn">
              <span className="material-symbols-outlined">add</span>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Écris ton message..."
              className="chatbot-input"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="chatbot-send-btn"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <p className="chatbot-input-hint">Propulsé par l'IA • Conseils personnalisés</p>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F'
}

export default ChatBotPage
