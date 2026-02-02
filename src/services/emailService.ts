/**
 * Service d'envoi d'emails avec Resend
 * Documentation: https://resend.com/docs
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
  private apiKey: string
  private fromEmail: string
  private fromName: string
  private baseUrl: string

  constructor() {
    // Utiliser la clé API Resend depuis les variables d'environnement
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || ''
    // Utiliser l'email par défaut de Resend si aucun domaine n'est configuré
    this.fromEmail = import.meta.env.VITE_EMAIL_FROM || 'onboarding@resend.dev'
    this.fromName = import.meta.env.VITE_EMAIL_FROM_NAME || 'GèreTonDjai'
    this.baseUrl = import.meta.env.VITE_RESEND_API_URL || 'https://api.resend.com'
    
    // Log pour debug
    if (this.isConfigured()) {
      console.log('✅ Email service configured:', {
        hasApiKey: !!this.apiKey,
        fromEmail: this.fromEmail,
        fromName: this.fromName
      })
    } else {
      console.warn('⚠️ Email service not configured. Set VITE_RESEND_API_KEY in .env')
    }
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
  }

  /**
   * Envoie un email via Resend API
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Set VITE_RESEND_API_KEY in .env')
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
        ...(options.replyTo && { reply_to: options.replyTo }),
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc })
      }

      console.log('📧 Sending email to:', emailData.to, 'Subject:', emailData.subject)

      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(emailData)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Email send failed:', data)
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      console.log('✅ Email sent successfully! Message ID:', data.id)
      return {
        success: true,
        messageId: data.id
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
   * Template de bienvenue
   */
  private getWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Bienvenue sur GèreTonDjai ! 🎉 Ton inscription est confirmée',
      html: this.getEmailHTML({
        title: 'Bienvenue sur GèreTonDjai ! 🎉',
        content: `
          <p style="font-size: 18px; margin-bottom: 20px;">Salut <strong>${userName}</strong> ! 👋</p>
          <p>Nous sommes ravis de t'accueillir sur <strong style="color: #f48c25;">GèreTonDjai</strong>, l'application qui va t'aider à gérer ton argent comme un boss !</p>
          
          <div style="background: linear-gradient(135deg, #f48c2520 0%, #ff6b3520 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f48c25;">
            <h3 style="margin-top: 0; color: #f48c25;">🚀 Pour commencer :</h3>
            <ul style="line-height: 2; padding-left: 20px;">
              <li><strong>Enregistre tes dépenses</strong> avec la saisie vocale ultra-sensible</li>
              <li><strong>Définis tes budgets</strong> par catégorie pour mieux contrôler</li>
              <li><strong>Consulte tes analyses</strong> et statistiques en temps réel</li>
              <li><strong>Discute avec Woro</strong>, ton conseiller IA personnel</li>
            </ul>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>💡 Astuce :</strong> Utilise la saisie vocale pour enregistrer rapidement tes dépenses. 
              Dis simplement "Gbaka 500" ou "Garba 1500" et c'est fait !
            </p>
          </div>

          <p style="margin-top: 30px; text-align: center;">
            <a href="https://geretondjai.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f48c25, #ff6b35); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 10px 0;">
              Accéder à mon tableau de bord →
            </a>
          </p>

          <p style="margin-top: 30px; color: #6b7280;">
            N'hésite pas à nous contacter si tu as des questions. Nous sommes là pour t'aider !<br>
            Bonne gestion de tes finances ! 💰
          </p>
        `,
        type: 'success',
        color: '#10b981',
        icon: '🎉'
      }),
      text: `Bienvenue sur GèreTonDjai !\n\nSalut ${userName} !\n\nNous sommes ravis de t'accueillir sur GèreTonDjai, l'application qui va t'aider à gérer ton argent comme un boss !\n\nPour commencer :\n- Enregistre tes premières dépenses avec la saisie vocale\n- Définis tes budgets par catégorie\n- Consulte tes analyses et statistiques\n- Discute avec Woro, ton conseiller IA\n\nAccède à ton tableau de bord : https://geretondjai.com/dashboard\n\nBonne gestion ! 💰`
    }
  }

  /**
   * Template d'alerte de budget
   */
  private getBudgetAlertTemplate(category: string, spent: number, budget: number, percentage: number): EmailTemplate {
    const isOver = percentage >= 100
    const type = isOver ? 'danger' : 'warning'
    const color = isOver ? '#ef4444' : '#f59e0b'
    const icon = isOver ? '🚨' : '⚠️'

    return {
      subject: `${icon} Alerte Budget ${category} - GèreTonDjai`,
      html: this.getEmailHTML({
        title: isOver ? 'Budget dépassé !' : 'Budget presque épuisé',
        content: `
          <p>Attention ! Tu as ${isOver ? 'dépassé' : 'utilisé'} ton budget <strong>${category}</strong>.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Budget :</strong> ${this.formatCurrency(budget)}</p>
            <p style="margin: 5px 0;"><strong>Dépensé :</strong> ${this.formatCurrency(spent)}</p>
            <p style="margin: 5px 0;"><strong>Pourcentage :</strong> ${percentage.toFixed(0)}%</p>
          </div>
          ${isOver 
            ? '<p style="color: #ef4444;"><strong>Il est temps de réduire tes dépenses dans cette catégorie !</strong></p>'
            : '<p>Tu approches de la limite. Fais attention à tes prochaines dépenses.</p>'
          }
        `,
        type,
        color,
        icon
      }),
      text: `Alerte Budget ${category}\n\nTu as ${isOver ? 'dépassé' : 'utilisé'} ${percentage.toFixed(0)}% de ton budget.`
    }
  }

  /**
   * Template de conseil quotidien
   */
  private getDailyTipTemplate(tip: { title: string; message: string }): EmailTemplate {
    return {
      subject: `💡 Conseil du jour - GèreTonDjai`,
      html: this.getEmailHTML({
        title: tip.title,
        content: `
          <p>${tip.message}</p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Reçois un nouveau conseil chaque jour pour mieux gérer tes finances ! 💰
          </p>
        `,
        type: 'info',
        color: '#3b82f6',
        icon: '💡'
      }),
      text: `${tip.title}\n\n${tip.message}`
    }
  }

  /**
   * Template HTML de base pour les emails
   */
  private getEmailHTML(options: {
    title: string
    content: string
    type: string
    color: string
    icon: string
  }): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f48c25 0%, #ff6b35 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                ${options.icon} GèreTonDjai
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 60px; height: 60px; background-color: ${options.color}20; border-radius: 50%; line-height: 60px; font-size: 30px;">
                  ${options.icon}
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 700; text-align: center;">
                ${options.title}
              </h2>
              
              <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${options.content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Gère ton argent comme un boss, en Nouchi ! 💰
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} GèreTonDjai. Tous droits réservés.
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                <a href="https://geretondjai.com/settings" style="color: #f48c25; text-decoration: none;">Gérer mes préférences email</a>
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

