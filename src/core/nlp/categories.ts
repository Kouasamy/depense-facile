import type { ExpenseCategory } from '../../db/schema'
import { categoryMeta } from '../../db/schema'

// Get all categories as array for UI
export function getAllCategories(): Array<{
  id: ExpenseCategory
  label: string
  icon: string
  color: string
}> {
  return Object.entries(categoryMeta).map(([id, meta]) => ({
    id: id as ExpenseCategory,
    ...meta
  }))
}

// Get category by id
export function getCategoryById(id: ExpenseCategory) {
  return {
    id,
    ...categoryMeta[id]
  }
}

// Format category for display
export function formatCategory(category: ExpenseCategory): string {
  return categoryMeta[category]?.label || category
}

// Get category color
export function getCategoryColor(category: ExpenseCategory): string {
  return categoryMeta[category]?.color || '#607d8b'
}

// Get category icon name
export function getCategoryIcon(category: ExpenseCategory): string {
  return categoryMeta[category]?.icon || 'circle'
}

// Suggest categories based on partial text
export function suggestCategories(text: string): ExpenseCategory[] {
  const normalizedText = text.toLowerCase()
  const suggestions: ExpenseCategory[] = []
  
  for (const [id, meta] of Object.entries(categoryMeta)) {
    if (meta.label.toLowerCase().includes(normalizedText)) {
      suggestions.push(id as ExpenseCategory)
    }
  }
  
  return suggestions
}

