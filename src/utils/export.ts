import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  getThisMonthExpenses, 
  getThisMonthIncomes, 
  categoryMeta, 
  paymentMethodMeta, 
  type ExpenseCategory 
} from '../db/schema'
import { useAuthStore } from '../stores/authStore'
import { formatAmount } from '../core/nlp/parser'

// Helper to get current user ID
function getCurrentUserId(): string | null {
  const authState = useAuthStore.getState()
  return authState.user?.id ?? null
}

// Colors for the PDF - GèreTonDjai Orange Abidjan theme
const COLORS = {
  primary: [244, 140, 37] as [number, number, number],  // Orange Abidjan
  success: [7, 136, 14] as [number, number, number],
  danger: [231, 16, 8] as [number, number, number],
  dark: [24, 20, 17] as [number, number, number],
  gray: [90, 77, 59] as [number, number, number],
  lightGray: [248, 247, 245] as [number, number, number],
}

// Helper to add header to PDF
function addHeader(doc: jsPDF, title: string, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header background
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // App name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('GereTonDjai', 20, 22)
  
  // Title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 20, 35)
  
  // Date
  doc.setFontSize(10)
  doc.text(subtitle, pageWidth - 20, 35, { align: 'right' })
  
  return 55 // Return Y position after header
}

// Helper to add section title
function addSectionTitle(doc: jsPDF, title: string, y: number, color: [number, number, number] = COLORS.primary) {
  doc.setFillColor(...color)
  doc.rect(15, y - 5, 4, 15, 'F')
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 25, y + 5)
  return y + 20
}

// Helper to add stats card
function addStatCard(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  label: string, 
  value: string, 
  color: [number, number, number]
) {
  // Card background
  doc.setFillColor(...COLORS.lightGray)
  doc.roundedRect(x, y, width, 35, 3, 3, 'F')
  
  // Label
  doc.setTextColor(...COLORS.gray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(label, x + 10, y + 12)
  
  // Value
  doc.setTextColor(...color)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(value, x + 10, y + 27)
  
  return y + 40
}

// Helper to add footer
function addFooter(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  doc.setDrawColor(230, 230, 230)
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)
  
  doc.setTextColor(...COLORS.gray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`GereTonDjai - Genere le ${new Date().toLocaleDateString('fr-FR')} | by Sam_k`, 20, pageHeight - 10)
  doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
}

/**
 * Export expenses as PDF
 */
export async function downloadExpensesPDF() {
  const userId = getCurrentUserId()
  if (!userId) {
    alert('Veuillez vous connecter pour exporter vos données')
    return
  }

  const now = new Date()
  const expenses = await getThisMonthExpenses(userId)
  const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  
  const doc = new jsPDF()
  let y = addHeader(doc, 'Rapport des Dépenses', monthName)
  
  // Summary stats
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pageWidth = doc.internal.pageSize.getWidth()
  const cardWidth = (pageWidth - 50) / 3
  
  addStatCard(doc, 15, y, cardWidth, 'Total dépenses', `${formatAmount(total)} F`, COLORS.danger)
  addStatCard(doc, 20 + cardWidth, y, cardWidth, 'Transactions', `${expenses.length}`, COLORS.primary)
  addStatCard(doc, 25 + cardWidth * 2, y, cardWidth, 'Moyenne/jour', `${formatAmount(Math.round(total / 30))} F`, COLORS.gray)
  
  y += 50
  
  // Category breakdown
  y = addSectionTitle(doc, 'Répartition par catégorie', y)
  
  const byCategory: Record<string, number> = {}
  for (const exp of expenses) {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount
  }
  
  const categoryData = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => {
      const meta = categoryMeta[cat as ExpenseCategory]
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0
      return [meta?.label || cat, `${formatAmount(amount)} F`, `${percentage}%`]
    })
  
  if (categoryData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Catégorie', 'Montant', '%']],
      body: categoryData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 30, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
    })
    
    y = (doc as any).lastAutoTable.finalY + 15
  }
  
  // Expenses table
  y = addSectionTitle(doc, 'Détail des dépenses', y)
  
  const expenseData = expenses.map(exp => {
    const meta = categoryMeta[exp.category]
    const payment = paymentMethodMeta[exp.paymentMethod]
    return [
      new Date(exp.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      exp.description,
      meta?.label || exp.category,
      payment?.label || exp.paymentMethod,
      `${formatAmount(exp.amount)} F`
    ]
  })
  
  if (expenseData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Description', 'Catégorie', 'Paiement', 'Montant']],
      body: expenseData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.danger,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 55 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: () => {
        addFooter(doc, doc.getCurrentPageInfo().pageNumber)
      }
    })
  } else {
    doc.setTextColor(...COLORS.gray)
    doc.setFontSize(10)
    doc.text('Aucune dépense ce mois-ci', pageWidth / 2, y + 10, { align: 'center' })
  }
  
  // Add footer to first page if only one page
  if (doc.getNumberOfPages() === 1) {
    addFooter(doc, 1)
  }
  
  // Download
  const filename = `depenses_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`
  doc.save(filename)
}

/**
 * Export incomes as PDF
 */
export async function downloadIncomesPDF() {
  const userId = getCurrentUserId()
  if (!userId) {
    alert('Veuillez vous connecter pour exporter vos données')
    return
  }

  const now = new Date()
  const incomes = await getThisMonthIncomes(userId)
  const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  
  const doc = new jsPDF()
  let y = addHeader(doc, 'Rapport des Revenus', monthName)
  
  // Summary
  const total = incomes.reduce((sum, i) => sum + i.amount, 0)
  const pageWidth = doc.internal.pageSize.getWidth()
  const cardWidth = (pageWidth - 40) / 2
  
  addStatCard(doc, 15, y, cardWidth, 'Total revenus', `${formatAmount(total)} F`, COLORS.success)
  addStatCard(doc, 25 + cardWidth, y, cardWidth, 'Sources', `${incomes.length}`, COLORS.primary)
  
  y += 50
  
  // Incomes by source
  y = addSectionTitle(doc, 'Détail des revenus', y, COLORS.success)
  
  const incomeData = incomes.map(inc => [
    new Date(inc.date).toLocaleDateString('fr-FR'),
    inc.source,
    inc.description,
    `${formatAmount(inc.amount)} F`
  ])
  
  if (incomeData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Source', 'Description', 'Montant']],
      body: incomeData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.success,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
    })
  } else {
    doc.setTextColor(...COLORS.gray)
    doc.setFontSize(10)
    doc.text('Aucun revenu ce mois-ci', pageWidth / 2, y + 10, { align: 'center' })
  }
  
  addFooter(doc, 1)
  
  const filename = `revenus_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`
  doc.save(filename)
}

/**
 * Export complete monthly report as PDF
 */
export async function downloadMonthlyReportPDF() {
  const userId = getCurrentUserId()
  if (!userId) {
    alert('Veuillez vous connecter pour exporter vos données')
    return
  }

  const now = new Date()
  const [expenses, incomes] = await Promise.all([
    getThisMonthExpenses(userId),
    getThisMonthIncomes(userId)
  ])
  
  const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  let y = addHeader(doc, 'Rapport Financier Mensuel', monthName)
  
  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0)
  const balance = totalIncomes - totalExpenses
  const savingsRate = totalIncomes > 0 ? Math.round((balance / totalIncomes) * 100) : 0
  
  // Summary cards
  const cardWidth = (pageWidth - 60) / 4
  
  addStatCard(doc, 15, y, cardWidth, 'Revenus', `${formatAmount(totalIncomes)} F`, COLORS.success)
  addStatCard(doc, 20 + cardWidth, y, cardWidth, 'Dépenses', `${formatAmount(totalExpenses)} F`, COLORS.danger)
  addStatCard(doc, 25 + cardWidth * 2, y, cardWidth, 'Solde', `${balance >= 0 ? '+' : ''}${formatAmount(balance)} F`, balance >= 0 ? COLORS.success : COLORS.danger)
  addStatCard(doc, 30 + cardWidth * 3, y, cardWidth, 'Épargne', `${savingsRate}%`, COLORS.primary)
  
  y += 50
  
  // Analysis section
  y = addSectionTitle(doc, 'Analyse du mois', y)
  
  // Create analysis text
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const analysisLines = [
    `• Vous avez effectué ${expenses.length} transaction(s) ce mois-ci.`,
    `• Votre revenu total s'élève à ${formatAmount(totalIncomes)} FCFA.`,
    `• Vos dépenses totales représentent ${formatAmount(totalExpenses)} FCFA.`,
    balance >= 0 
      ? `• Félicitations ! Vous avez économisé ${formatAmount(balance)} FCFA (${savingsRate}% de vos revenus).`
      : `• Attention : vous avez un déficit de ${formatAmount(Math.abs(balance))} FCFA ce mois-ci.`,
  ]
  
  analysisLines.forEach((line, index) => {
    doc.text(line, 20, y + (index * 8))
  })
  
  y += analysisLines.length * 8 + 15
  
  // Top expenses by category
  y = addSectionTitle(doc, 'Top des dépenses par catégorie', y)
  
  const byCategory: Record<string, number> = {}
  for (const exp of expenses) {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount
  }
  
  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amount], index) => {
      const meta = categoryMeta[cat as ExpenseCategory]
      const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      return [`${index + 1}`, meta?.label || cat, `${formatAmount(amount)} F`, `${percentage}%`]
    })
  
  if (topCategories.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Catégorie', 'Montant', '%']],
      body: topCategories,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
    })
    
    y = (doc as any).lastAutoTable.finalY + 15
  }
  
  // Daily spending chart (text representation)
  y = addSectionTitle(doc, 'Évolution des dépenses', y)
  
  // Group expenses by day
  const byDay: Record<number, number> = {}
  for (const exp of expenses) {
    const day = new Date(exp.date).getDate()
    byDay[day] = (byDay[day] || 0) + exp.amount
  }
  
  const maxDaily = Math.max(...Object.values(byDay), 1)
  const days = Object.entries(byDay).sort(([a], [b]) => Number(a) - Number(b))
  
  if (days.length > 0) {
    // Simple bar representation
    const barMaxWidth = 120
    days.forEach(([day, amount], index) => {
      if (index > 14) return // Limit to 15 days for space
      
      const barWidth = (amount / maxDaily) * barMaxWidth
      const dayY = y + (index * 8)
      
      // Day label
      doc.setTextColor(...COLORS.dark)
      doc.setFontSize(8)
      doc.text(`${day.padStart(2, '0')}`, 20, dayY + 4)
      
      // Bar
      doc.setFillColor(...COLORS.danger)
      doc.rect(35, dayY, barWidth, 5, 'F')
      
      // Amount
      doc.setTextColor(...COLORS.gray)
      doc.text(`${formatAmount(amount)} F`, 160, dayY + 4)
    })
    
    y += Math.min(days.length, 15) * 8 + 15
  }
  
  // Recommendations
  if (y < 230) {
    y = addSectionTitle(doc, 'Recommandations', y)
    
    doc.setTextColor(...COLORS.dark)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    const recommendations = []
    
    if (savingsRate < 20) {
      recommendations.push('→ Essayez d\'épargner au moins 20% de vos revenus chaque mois.')
    }
    if (topCategories.length > 0 && topCategories[0][2].includes('000')) {
      const topCat = topCategories[0][1]
      recommendations.push(`→ Votre plus grande dépense est "${topCat}". Définissez un budget pour cette catégorie.`)
    }
    if (expenses.length > 50) {
      recommendations.push('→ Vous avez beaucoup de transactions. Envisagez de regrouper certains achats.')
    }
    if (balance < 0) {
      recommendations.push('→ Réduisez vos dépenses non essentielles pour rééquilibrer votre budget.')
    }
    if (recommendations.length === 0) {
      recommendations.push('→ Continuez ainsi ! Votre gestion financière est excellente.')
    }
    
    recommendations.forEach((rec, index) => {
      doc.text(rec, 20, y + (index * 7))
    })
  }
  
  addFooter(doc, 1)
  
  const filename = `rapport_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`
  doc.save(filename)
}
