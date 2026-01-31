import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SavingsPlan } from '../core/ai/chatbot'
import { categoryMeta } from '../db/schema'

// Couleurs du theme GèreTonDjai - Orange Abidjan
const COLORS = {
  primary: [244, 140, 37] as [number, number, number],      // Orange Abidjan
  primaryDark: [224, 122, 21] as [number, number, number],
  secondary: [249, 165, 77] as [number, number, number],   // Orange clair
  success: [7, 136, 14] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [231, 16, 8] as [number, number, number],
  text: [24, 20, 17] as [number, number, number],
  textMuted: [90, 77, 59] as [number, number, number],
  background: [248, 247, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number]
}

// Formater les montants en F CFA (sans caracteres speciaux)
function formatMontant(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA'
}

// Nettoyer le texte des caracteres speciaux
function cleanText(text: string): string {
  return text
    .replace(/[📊📋💰💡📈🎯💪🎬🚌🛡️✓⬇️⬆️📦]/g, '')
    .replace(/\*\*/g, '')
    .trim()
}

// Telecharger le plan d'epargne en PDF
export async function downloadSavingsPlanPDF(plan: SavingsPlan): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 0

  // ============================================================
  // PAGE 1 - COUVERTURE ET RESUME
  // ============================================================

  // En-tete avec bande coloree
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 55, 'F')

  // Logo/Titre de l'application
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('GERETONDJAI', 15, 15)

  // Titre principal
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('PLAN D\'EPARGNE PERSONNALISE', pageWidth / 2, 32, { align: 'center' })

  // Sous-titre
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Votre feuille de route vers vos objectifs financiers', pageWidth / 2, 42, { align: 'center' })

  // Date de generation
  const dateOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  const dateStr = plan.createdAt.toLocaleDateString('fr-FR', dateOptions)
  doc.setFontSize(9)
  doc.text('Document genere le ' + dateStr, pageWidth / 2, 50, { align: 'center' })

  yPos = 70

  // ============================================================
  // SECTION: VOS INFORMATIONS FINANCIERES
  // ============================================================
  
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('VOS INFORMATIONS FINANCIERES', 15, yPos)
  
  yPos += 8

  // Cadre d'information
  doc.setFillColor(...COLORS.background)
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, yPos, pageWidth - 30, 55, 3, 3, 'FD')

  yPos += 12

  // Grille d'informations - 2 colonnes
  const colWidth = (pageWidth - 40) / 2
  
  // Colonne gauche
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.textMuted)
  doc.text('Revenu mensuel', 22, yPos)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.success)
  doc.text(formatMontant(plan.monthlyIncome), 22, yPos + 8)

  // Colonne droite
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.textMuted)
  doc.text('Depenses mensuelles estimees', 22 + colWidth, yPos)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.danger)
  doc.text(formatMontant(plan.monthlyExpenses), 22 + colWidth, yPos + 8)

  yPos += 22

  // Deuxieme ligne
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.textMuted)
  doc.text('Objectif d\'epargne total', 22, yPos)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text(formatMontant(plan.savingsGoal), 22, yPos + 8)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.textMuted)
  doc.text('Duree du plan', 22 + colWidth, yPos)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.text)
  doc.text(plan.timelineMonths + ' mois', 22 + colWidth, yPos + 8)

  yPos += 35

  // ============================================================
  // SECTION: OBJECTIF MENSUEL
  // ============================================================

  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('VOTRE OBJECTIF MENSUEL', 15, yPos)

  yPos += 8

  // Cadre epargne mensuelle
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F')

  const montantMensuel = Math.round(plan.savingsGoal / plan.timelineMonths)
  
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Montant a epargner chaque mois', pageWidth / 2, yPos + 10, { align: 'center' })
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(formatMontant(montantMensuel), pageWidth / 2, yPos + 25, { align: 'center' })

  yPos += 45

  // Informations complementaires
  doc.setTextColor(...COLORS.textMuted)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const pourcentageRevenu = plan.savingsPercentage
  const limiteJournaliere = Math.round((plan.monthlyIncome - montantMensuel) / 30)
  
  doc.text('Soit ' + pourcentageRevenu + '% de votre revenu mensuel', 15, yPos)
  yPos += 6
  doc.text('Limite de depenses quotidienne recommandee : ' + formatMontant(limiteJournaliere), 15, yPos)

  yPos += 15

  // ============================================================
  // SECTION: REPARTITION BUDGETAIRE
  // ============================================================

  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('REPARTITION BUDGETAIRE RECOMMANDEE', 15, yPos)

  yPos += 5

  // Tableau des categories
  const budgetData = plan.categories.map(cat => {
    const meta = categoryMeta[cat.category]
    const labelClean = meta?.label || cat.category
    let action = 'Maintenir'
    if (cat.priority === 'reduce') action = 'Reduire'
    if (cat.priority === 'increase') action = 'Augmenter'
    
    return [
      labelClean,
      formatMontant(cat.currentAmount),
      formatMontant(cat.suggestedAmount),
      formatMontant(cat.savings),
      action
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Categorie', 'Actuel', 'Suggere', 'Economie', 'Action']],
    body: budgetData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text,
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 35 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 }
    },
    margin: { left: 15, right: 15 }
  })

  // ============================================================
  // PAGE 2 - PLAN D'ACTION ET CONSEILS
  // ============================================================
  
  doc.addPage()
  yPos = 20

  // En-tete page 2
  doc.setFillColor(...COLORS.secondary)
  doc.rect(0, 0, pageWidth, 25, 'F')
  
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PLAN D\'ACTION - 4 SEMAINES', pageWidth / 2, 16, { align: 'center' })

  yPos = 35

  // Tableau des etapes
  const stepsData = plan.steps.map(step => [
    'Semaine ' + step.week,
    cleanText(step.action),
    cleanText(step.description)
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Periode', 'Action', 'Description']],
    body: stepsData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.secondary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 }
    },
    margin: { left: 15, right: 15 }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // ============================================================
  // SECTION: CONSEILS PERSONNALISES
  // ============================================================

  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CONSEILS PERSONNALISES', 15, yPos)

  yPos += 8

  // Cadre des conseils
  const tipsHeight = plan.tips.length * 14 + 15
  doc.setFillColor(...COLORS.background)
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, yPos, pageWidth - 30, tipsHeight, 3, 3, 'FD')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.text)

  plan.tips.forEach((tip, index) => {
    const cleanTip = cleanText(tip)
    doc.text((index + 1) + '. ' + cleanTip, 22, yPos + 12 + index * 14, { maxWidth: pageWidth - 50 })
  })

  yPos += tipsHeight + 15

  // ============================================================
  // SECTION: PROJECTION D'EPARGNE
  // ============================================================

  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PROJECTION DE VOTRE EPARGNE', 15, yPos)

  yPos += 5

  // Tableau de projection
  const monthlyAmount = Math.round(plan.savingsGoal / plan.timelineMonths)
  const projectionData: string[][] = []
  
  const monthsToShow = Math.min(plan.timelineMonths, 12)
  for (let i = 1; i <= monthsToShow; i++) {
    const cumulative = monthlyAmount * i
    const percentage = Math.round((cumulative / plan.savingsGoal) * 100)
    projectionData.push([
      'Mois ' + i,
      formatMontant(monthlyAmount),
      formatMontant(cumulative),
      percentage + '%'
    ])
  }

  if (plan.timelineMonths > 12) {
    projectionData.push(['...', '...', '...', '...'])
    projectionData.push([
      'Mois ' + plan.timelineMonths,
      formatMontant(monthlyAmount),
      formatMontant(plan.savingsGoal),
      '100%'
    ])
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Mois', 'Epargne mensuelle', 'Total cumule', 'Progression']],
    body: projectionData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.warning,
      textColor: COLORS.text,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text,
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    margin: { left: 15, right: 15 }
  })

  // ============================================================
  // PAGE 3 - RESUME ET MOTIVATION
  // ============================================================
  
  doc.addPage()

  // Fond colore
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Titre motivationnel
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('VOUS POUVEZ Y ARRIVER !', pageWidth / 2, 50, { align: 'center' })

  // Cadre resume
  doc.setFillColor(255, 255, 255, 0.15)
  doc.roundedRect(20, 70, pageWidth - 40, 100, 5, 5, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  yPos = 90
  doc.text('Votre revenu mensuel :', pageWidth / 2, yPos, { align: 'center' })
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(formatMontant(plan.monthlyIncome), pageWidth / 2, yPos + 12, { align: 'center' })

  yPos += 30
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Dans ' + plan.timelineMonths + ' mois, vous aurez economise :', pageWidth / 2, yPos, { align: 'center' })
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(formatMontant(plan.savingsGoal), pageWidth / 2, yPos + 14, { align: 'center' })

  // Messages motivationnels
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  
  const messages = [
    'Chaque franc economise vous rapproche de votre objectif.',
    '',
    'Commencez des aujourd\'hui, pas demain.',
    '',
    'Les petites economies font les grandes fortunes.',
    '',
    '"L\'argent que vous n\'avez pas depense',
    'est l\'argent que vous avez gagne."'
  ]

  yPos = 200
  messages.forEach(line => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' })
    yPos += 14
  })

  // Pied de page
  doc.setFontSize(10)
  doc.text('Suivez votre progression avec', pageWidth / 2, pageHeight - 40, { align: 'center' })
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DEPENSE FACILE', pageWidth / 2, pageHeight - 25, { align: 'center' })

  // ============================================================
  // PIED DE PAGE SUR TOUTES LES PAGES
  // ============================================================
  
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount - 1; i++) { // Pas sur la page de motivation
    doc.setPage(i)
    
    // Ligne de separation
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.5)
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15)
    
    // Texte du pied de page
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textMuted)
    doc.setFont('helvetica', 'normal')
    doc.text('Depense Facile - Votre assistant financier personnel', 15, pageHeight - 8)
    doc.text('Page ' + i + ' / ' + (pageCount - 1), pageWidth - 15, pageHeight - 8, { align: 'right' })
  }

  // ============================================================
  // ENREGISTRER LE PDF
  // ============================================================
  
  const filename = 'plan-epargne-' + plan.createdAt.toISOString().split('T')[0] + '.pdf'
  doc.save(filename)
}
