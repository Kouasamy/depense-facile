/**
 * Service d'envoi d'emails via SMTP Hostinger
 * Utilise un serveur backend Express pour gérer l'envoi SMTP
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

class EmailService {
  private fromEmail: string
  private fromName: string
  private emailServerUrl: string

  constructor() {
    // Configuration pour SMTP Hostinger
    this.fromEmail = import.meta.env.VITE_EMAIL_FROM || 'contact@gèretondjai.com'
    this.fromName = import.meta.env.VITE_EMAIL_FROM_NAME || 'GèreTonDjai'
    
    // URL du serveur backend email
    // En production, doit pointer vers l'URL du serveur déployé
    // En développement, utilise localhost
    const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost'
    this.emailServerUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 
      (isProduction ? '' : 'http://localhost:3001')
    
    // Log pour debug
    if (this.isConfigured()) {
      console.log('✅ Email service configured (SMTP Hostinger):', {
        fromEmail: this.fromEmail,
        fromName: this.fromName,
        serverUrl: this.emailServerUrl,
        environment: isProduction ? 'production' : 'development'
      })
    } else {
      const errorMsg = isProduction 
        ? '⚠️ Email service not configured for production. Définissez VITE_EMAIL_SERVER_URL avec l\'URL de votre serveur email déployé.'
        : '⚠️ Email service not configured. Vérifiez que le serveur email est démarré (npm run dev:email).'
      console.warn(errorMsg)
    }
  }

  /**
   * Vérifie si le service est configuré
   * Le service est considéré comme configuré si l'URL du serveur est définie
   */
  isConfigured(): boolean {
    return !!this.emailServerUrl && this.emailServerUrl.length > 0
  }

  /**
   * Envoie un email via le serveur backend SMTP
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Vérifiez que le serveur email est démarré.')
      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    try {
      const emailData = {
        from: options.from || `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        ...(options.replyTo && { replyTo: options.replyTo })
      }

      console.log('📧 Sending email via SMTP Hostinger to:', emailData.to, 'Subject:', emailData.subject)

      const response = await fetch(`${this.emailServerUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      // Gérer les erreurs réseau (serveur non accessible)
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP error! status: ${response.status}` }
        }
        
        console.error('❌ Email send failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          serverUrl: this.emailServerUrl
        })
        
        // Message d'erreur plus explicite
        if (response.status === 0 || response.status >= 500) {
          throw new Error(`Le serveur email n'est pas accessible. Vérifiez que le serveur est déployé et que VITE_EMAIL_SERVER_URL est correctement configuré.`)
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log('✅ Email sent successfully via SMTP! Message ID:', data.messageId)
      return {
        success: true,
        messageId: data.messageId
      }
    } catch (error) {
      console.error('❌ Error sending email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Convertit HTML en texte brut (simple)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  /**
   * Envoie un email de notification
   */
  async sendNotificationEmail(
    to: string,
    notification: {
      title: string
      message: string
      type: 'warning' | 'info' | 'success' | 'danger'
      category?: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.getNotificationTemplate(notification)
    
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Envoie un email de bienvenue
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<{ success: boolean; error?: string }> {
    const template = this.getWelcomeTemplate(userName)
    
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Envoie un email d'alerte de budget
   */
  async sendBudgetAlertEmail(
    to: string,
    category: string,
    spent: number,
    budget: number,
    percentage: number
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.getBudgetAlertTemplate(category, spent, budget, percentage)
    
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Envoie un email de conseil quotidien
   */
  async sendDailyTipEmail(to: string, tip: { title: string; message: string }): Promise<{ success: boolean; error?: string }> {
    const template = this.getDailyTipTemplate(tip)
    
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  /**
   * Template pour les notifications
   */
  private getNotificationTemplate(notification: {
    title: string
    message: string
    type: 'warning' | 'info' | 'success' | 'danger'
    category?: string
  }): EmailTemplate {
    const colors = {
      warning: '#f59e0b',
      info: '#3b82f6',
      success: '#10b981',
      danger: '#ef4444'
    }

    const color = colors[notification.type]
    const icon = {
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅',
      danger: '🚨'
    }[notification.type]

    return {
      subject: `${icon} ${notification.title} - GèreTonDjai`,
      html: this.getEmailHTML({
        title: notification.title,
        content: notification.message,
        type: notification.type,
        color,
        icon
      }),
      text: `${notification.title}\n\n${notification.message}`
    }
  }

  /**
   * Template de bienvenue - Design Premium
   */
  private getWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Bienvenue sur GèreTonDjai ! 🎉 Ton inscription est confirmée',
      html: this.getEmailHTML({
        title: 'Bienvenue sur GèreTonDjai ! 🎉',
        content: `
          <!-- Salutation personnalisée -->
          <div style="text-align: center; margin-bottom: 35px;">
            <p style="font-size: 20px; margin: 0 0 10px 0; color: #0a0a0a; font-weight: 600;">
              Salut <span style="color: #f48c25; font-weight: 700;">${userName}</span> ! 👋
            </p>
            <p style="font-size: 16px; margin: 0; color: #6b6b6b; line-height: 1.6;">
              Nous sommes ravis de t'accueillir sur <strong style="color: #f48c25;">GèreTonDjai</strong>,<br>
              l'application qui va t'aider à gérer ton argent comme un boss !
            </p>
          </div>

          <!-- Features Cards -->
          <div style="background: linear-gradient(135deg, rgba(244, 140, 37, 0.08) 0%, rgba(255, 107, 53, 0.08) 100%); padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid rgba(244, 140, 37, 0.15);">
            <h3 style="margin: 0 0 25px 0; color: #f48c25; font-size: 22px; font-weight: 700; text-align: center;">
              🚀 Pour commencer
            </h3>
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(244, 140, 37, 0.1);">
                  <div style="display: flex; align-items: center;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f48c25, #ff6b35); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;">
                      🎤
                    </div>
                    <div>
                      <strong style="color: #0a0a0a; font-size: 15px;">Saisie vocale</strong>
                      <p style="margin: 4px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.5;">Enregistre tes dépenses avec la voix</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(244, 140, 37, 0.1);">
                  <div style="display: flex; align-items: center;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f48c25, #ff6b35); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;">
                      📊
                    </div>
                    <div>
                      <strong style="color: #0a0a0a; font-size: 15px;">Budgets intelligents</strong>
                      <p style="margin: 4px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.5;">Définis tes budgets par catégorie</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(244, 140, 37, 0.1);">
                  <div style="display: flex; align-items: center;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f48c25, #ff6b35); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;">
                      📈
                    </div>
                    <div>
                      <strong style="color: #0a0a0a; font-size: 15px;">Analyses en temps réel</strong>
                      <p style="margin: 4px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.5;">Consulte tes statistiques détaillées</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <div style="display: flex; align-items: center;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f48c25, #ff6b35); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0;">
                      🤖
                    </div>
                    <div>
                      <strong style="color: #0a0a0a; font-size: 15px;">Woro, ton conseiller IA</strong>
                      <p style="margin: 4px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.5;">Discute avec ton assistant personnel</p>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Astuce -->
          <div style="background: #f8f7f5; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #f48c25;">
            <div style="display: flex; align-items: start;">
              <div style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">💡</div>
              <div>
                <strong style="color: #0a0a0a; font-size: 15px; display: block; margin-bottom: 6px;">Astuce Pro</strong>
                <p style="margin: 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                  Utilise la saisie vocale pour enregistrer rapidement tes dépenses. 
                  Dis simplement <strong style="color: #f48c25;">"Gbaka 500"</strong> ou <strong style="color: #f48c25;">"Garba 1500"</strong> et c'est fait !
                </p>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0 30px;">
            <a href="https://geretondjai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f48c25 0%, #ff6b35 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 16px rgba(244, 140, 37, 0.3); transition: transform 0.2s, box-shadow 0.2s;">
              Accéder à mon tableau de bord →
            </a>
          </div>

          <!-- Message final -->
          <div style="text-align: center; padding-top: 30px; border-top: 1px solid rgba(229, 231, 235, 0.8);">
            <p style="margin: 0; color: #6b6b6b; font-size: 15px; line-height: 1.7;">
              N'hésite pas à nous contacter si tu as des questions.<br>
              Nous sommes là pour t'aider !<br><br>
              <strong style="color: #f48c25;">Bonne gestion de tes finances ! 💰</strong>
            </p>
          </div>
        `,
        type: 'success',
        color: '#10b981',
        icon: '🎉'
      }),
      text: `Bienvenue sur GèreTonDjai !\n\nSalut ${userName} !\n\nNous sommes ravis de t'accueillir sur GèreTonDjai, l'application qui va t'aider à gérer ton argent comme un boss !\n\nPour commencer :\n- Enregistre tes premières dépenses avec la saisie vocale\n- Définis tes budgets par catégorie\n- Consulte tes analyses et statistiques\n- Discute avec Woro, ton conseiller IA\n\nAccède à ton tableau de bord : https://geretondjai.com/dashboard\n\nBonne gestion ! 💰`
    }
  }

  /**
   * Template d'alerte de budget - Design Premium
   */
  private getBudgetAlertTemplate(category: string, spent: number, budget: number, percentage: number): EmailTemplate {
    const isOver = percentage >= 100
    const type = isOver ? 'danger' : 'warning'
    const color = isOver ? '#dc2626' : '#d97706'
    const bgColor = isOver ? '#fee2e2' : '#fef3c7'
    const borderColor = isOver ? '#dc2626' : '#d97706'
    const icon = isOver ? '🚨' : '⚠️'
    const remaining = budget - spent
    const remainingPercent = Math.max(0, 100 - percentage)

    return {
      subject: `${icon} Alerte Budget ${category} - GèreTonDjai`,
      html: this.getEmailHTML({
        title: isOver ? '🚨 Budget dépassé !' : '⚠️ Budget presque épuisé',
        content: `
          <!-- Message d'alerte -->
          <div style="text-align: center; margin-bottom: 35px;">
            <p style="font-size: 18px; margin: 0; color: ${color}; font-weight: 600;">
              Attention ! Tu as ${isOver ? 'dépassé' : 'utilisé'} <strong>${percentage.toFixed(0)}%</strong> de ton budget
            </p>
            <p style="font-size: 20px; margin: 10px 0 0; color: #0a0a0a; font-weight: 700;">
              ${category}
            </p>
          </div>

          <!-- Stats Card -->
          <div style="background: ${bgColor}; padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid ${borderColor};">
            <!-- Progress Bar -->
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #0a0a0a; font-size: 14px; font-weight: 600;">Progression</span>
                <span style="color: ${color}; font-size: 14px; font-weight: 700;">${percentage.toFixed(0)}%</span>
              </div>
              <div style="background: rgba(0, 0, 0, 0.1); height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, ${color} 0%, ${isOver ? '#991b1b' : '#92400e'} 100%); height: 100%; width: ${Math.min(percentage, 100)}%; border-radius: 6px; transition: width 0.3s;"></div>
              </div>
            </div>

            <!-- Stats Grid -->
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px; background: rgba(255, 255, 255, 0.6); border-radius: 12px; text-align: center; border: 1px solid rgba(0, 0, 0, 0.05);">
                  <div style="font-size: 24px; margin-bottom: 5px;">💰</div>
                  <div style="color: #6b6b6b; font-size: 12px; margin-bottom: 4px;">Budget</div>
                  <div style="color: #0a0a0a; font-size: 18px; font-weight: 700;">${this.formatCurrency(budget)}</div>
                </td>
                <td style="width: 15px;"></td>
                <td style="padding: 15px; background: rgba(255, 255, 255, 0.6); border-radius: 12px; text-align: center; border: 1px solid rgba(0, 0, 0, 0.05);">
                  <div style="font-size: 24px; margin-bottom: 5px;">💸</div>
                  <div style="color: #6b6b6b; font-size: 12px; margin-bottom: 4px;">Dépensé</div>
                  <div style="color: ${color}; font-size: 18px; font-weight: 700;">${this.formatCurrency(spent)}</div>
                </td>
              </tr>
              ${!isOver ? `
              <tr>
                <td colspan="3" style="padding-top: 15px;">
                  <div style="padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 12px; text-align: center; border: 1px solid rgba(0, 0, 0, 0.05);">
                    <div style="font-size: 24px; margin-bottom: 5px;">✅</div>
                    <div style="color: #6b6b6b; font-size: 12px; margin-bottom: 4px;">Reste</div>
                    <div style="color: #059669; font-size: 20px; font-weight: 700;">${this.formatCurrency(remaining)} (${remainingPercent.toFixed(0)}%)</div>
                  </div>
                </td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Message d'action -->
          <div style="background: #f8f7f5; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid ${color};">
            <div style="display: flex; align-items: start;">
              <div style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">${isOver ? '🚨' : '💡'}</div>
              <div>
                <strong style="color: #0a0a0a; font-size: 15px; display: block; margin-bottom: 6px;">
                  ${isOver ? 'Action requise' : 'Conseil'}
                </strong>
                <p style="margin: 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                  ${isOver 
                    ? `Il est temps de réduire tes dépenses dans la catégorie <strong style="color: ${color};">${category}</strong>. Consulte tes analyses pour voir où tu peux économiser.`
                    : `Tu approches de la limite. Fais attention à tes prochaines dépenses dans cette catégorie.`
                  }
                </p>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0 30px;">
            <a href="https://geretondjai.com/budgets" style="display: inline-block; background: linear-gradient(135deg, #f48c25 0%, #ff6b35 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 16px rgba(244, 140, 37, 0.3);">
              Voir mes budgets →
            </a>
          </div>
        `,
        type,
        color,
        icon
      }),
      text: `Alerte Budget ${category}\n\nTu as ${isOver ? 'dépassé' : 'utilisé'} ${percentage.toFixed(0)}% de ton budget.\n\nBudget: ${this.formatCurrency(budget)}\nDépensé: ${this.formatCurrency(spent)}\n\n${isOver ? 'Il est temps de réduire tes dépenses !' : 'Fais attention à tes prochaines dépenses.'}`
    }
  }

  /**
   * Template de conseil quotidien - Design Premium
   */
  private getDailyTipTemplate(tip: { title: string; message: string }): EmailTemplate {
    return {
      subject: `💡 Conseil du jour - GèreTonDjai`,
      html: this.getEmailHTML({
        title: tip.title,
        content: `
          <!-- Conseil Card -->
          <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%); padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid rgba(37, 99, 235, 0.15);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #2563eb, #3b82f6); border-radius: 16px; line-height: 60px; font-size: 32px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                💡
              </div>
            </div>
            <p style="margin: 0; color: #2d2d2d; font-size: 16px; line-height: 1.8; text-align: center; font-weight: 500;">
              ${tip.message}
            </p>
          </div>

          <!-- Info Box -->
          <div style="background: #f8f7f5; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #2563eb;">
            <div style="display: flex; align-items: start;">
              <div style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">📬</div>
              <div>
                <strong style="color: #0a0a0a; font-size: 15px; display: block; margin-bottom: 6px;">
                  Conseil quotidien
                </strong>
                <p style="margin: 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                  Reçois un nouveau conseil chaque jour pour mieux gérer tes finances et optimiser ton épargne ! 💰
                </p>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0 30px;">
            <a href="https://geretondjai.com/advisor" style="display: inline-block; background: linear-gradient(135deg, #f48c25 0%, #ff6b35 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 16px rgba(244, 140, 37, 0.3);">
              Discuter avec Woro →
            </a>
          </div>
        `,
        type: 'info',
        color: '#2563eb',
        icon: '💡'
      }),
      text: `${tip.title}\n\n${tip.message}\n\nReçois un nouveau conseil chaque jour pour mieux gérer tes finances ! 💰`
    }
  }

  /**
   * Template HTML de base pour les emails - Design Premium
   */
  private getEmailHTML(options: {
    title: string
    content: string
    type: string
    color: string
    icon: string
  }): string {
    const primaryColor = '#f48c25'
    const secondaryColor = '#ff6b35'
    const bgGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${options.title} - GèreTonDjai</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f8f7f5 0%, #f5f2f0 100%); background-color: #f8f7f5;">
  <!-- Preheader -->
  <div style="display: none; font-size: 1px; color: #f8f7f5; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${options.title} - Gère ton argent comme un boss, en Nouchi !
  </div>
  
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8f7f5 0%, #f5f2f0 100%);">
    <tr>
      <td style="padding: 0;" align="center">
        <!-- Main Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); border: 1px solid rgba(244, 140, 37, 0.1);">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background: ${bgGradient}; padding: 0; position: relative; overflow: hidden;">
              <!-- Pattern décoratif -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);"></div>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 50px 40px 40px; text-align: center; position: relative; z-index: 1;">
                    <!-- Logo/Icon -->
                    <div style="margin-bottom: 20px;">
                      <div style="display: inline-block; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 20px; line-height: 80px; font-size: 40px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
                        ${options.icon}
                      </div>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      GèreTonDjai
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                      Gère ton argent comme un boss, en Nouchi ! 💰
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 50px 40px;">
              <!-- Title -->
              <h2 style="margin: 0 0 30px 0; color: #0a0a0a; font-size: 28px; font-weight: 700; text-align: center; line-height: 1.3; letter-spacing: -0.3px;">
                ${options.title}
              </h2>
              
              <!-- Content -->
              <div style="color: #2d2d2d; font-size: 16px; line-height: 1.7; text-align: left;">
                ${options.content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(to bottom, #f9fafb 0%, #f5f2f0 100%); padding: 40px; text-align: center; border-top: 1px solid rgba(229, 231, 235, 0.8);">
              <!-- Social Links (optionnel) -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <p style="margin: 0 0 15px 0; color: #6b6b6b; font-size: 14px; font-weight: 500;">
                      Suis-nous sur les réseaux
                    </p>
                    <div style="margin-bottom: 20px;">
                      <a href="https://geretondjai.com" style="display: inline-block; margin: 0 8px; width: 40px; height: 40px; background: ${bgGradient}; border-radius: 10px; line-height: 40px; text-decoration: none; color: #ffffff; font-size: 18px; box-shadow: 0 4px 8px rgba(244, 140, 37, 0.2); transition: transform 0.2s;">
                        🌐
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="height: 1px; background: linear-gradient(to right, transparent, rgba(244, 140, 37, 0.3), transparent); margin: 25px 0;"></div>
              
              <!-- Footer Text -->
              <p style="margin: 0 0 8px 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                <strong style="color: ${primaryColor};">Gère ton argent comme un boss, en Nouchi !</strong> 💰
              </p>
              <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} GèreTonDjai. Tous droits réservés.
              </p>
              
              <!-- Links -->
              <p style="margin: 15px 0 0 0;">
                <a href="https://geretondjai.com/settings" style="color: ${primaryColor}; text-decoration: none; font-size: 13px; font-weight: 500; margin: 0 10px;">
                  Préférences
                </a>
                <span style="color: #d1d5db;">|</span>
                <a href="https://geretondjai.com/help" style="color: ${primaryColor}; text-decoration: none; font-size: 13px; font-weight: 500; margin: 0 10px;">
                  Aide
                </a>
                <span style="color: #d1d5db;">|</span>
                <a href="https://geretondjai.com/contact" style="color: ${primaryColor}; text-decoration: none; font-size: 13px; font-weight: 500; margin: 0 10px;">
                  Contact
                </a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Spacing Bottom -->
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                Tu reçois cet email car tu es inscrit sur GèreTonDjai.<br>
                Si tu ne souhaites plus recevoir nos emails, <a href="https://geretondjai.com/settings" style="color: ${primaryColor}; text-decoration: underline;">gère tes préférences</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }

  /**
   * Formate un montant en devise ivoirienne
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }
}

// Export singleton instance
export const emailService = new EmailService()

