import { motion } from 'framer-motion'
import { useThemeStore } from '../../stores/themeStore'
import { 
  Mic, 
  TrendingUp, 
  CreditCard, 
  Lock, 
  Bot, 
  BarChart3,
  DollarSign,
  Clock,
  Smartphone,
  Infinity,
  CheckCircle2,
  Globe,
  Lightbulb,
  Settings,
  Home,
  GraduationCap,
  Shirt,
  Users,
  Package,
  Building2,
  Heart,
  MessageSquare,
  Bell,
  Mail,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sparkles,
  Coins,
  Car,
  UtensilsCrossed,
  Pill,
  Gamepad2,
  Banknote,
  CircleDot,
  Phone,
  Waves,
  Building,
  X,
  FileText,
  Trophy,
  User,
  type LucideIcon
} from 'lucide-react'

// Mapping des couleurs par emoji selon le thème
export const getIconColor = (emoji: string, theme: 'dark' | 'light', customColor?: string): string => {
  if (customColor) return customColor
  
  // Couleurs adaptées au thème
  const lightColors: Record<string, string> = {
    '🎤': '#f48c25', // Orange
    '📊': '#4ecdc4', // Turquoise
    '💳': '#45b7d1', // Bleu clair
    '🔒': '#96ceb4', // Vert menthe
    '🤖': '#a29bfe', // Violet
    '📈': '#fd79a8', // Rose
    '💰': '#f39c12', // Orange foncé
    '⏰': '#3498db', // Bleu
    '📱': '#2ecc71', // Vert
    '♾️': '#9b59b6', // Violet foncé
    '✅': '#27ae60', // Vert foncé
    '🇨🇮': '#ff6b35', // Orange rouge
    '💵': '#2ecc71', // Vert
    '🟠': '#ff6600', // Orange
    '🟡': '#ffcc00', // Jaune
    '🔵': '#0066cc', // Bleu
    '🌊': '#1dc8f2', // Bleu clair
    '🏦': '#3498db', // Bleu
    '💡': '#f1c40f', // Jaune
    '⚙️': '#7f8c8d', // Gris
    '🏠': '#9b59b6', // Violet
    '🎓': '#f39c12', // Orange
    '👕': '#00bcd4', // Cyan
    '👨‍👩‍👧': '#ff9800', // Orange
    '📦': '#607d8b', // Gris bleu
    '💊': '#1abc9c', // Turquoise
    '🍽️': '#e74c3c', // Rouge
    '🚗': '#3498db', // Bleu
    '🎮': '#e91e63', // Rose
    '💬': '#3498db', // Bleu
    '🔔': '#f39c12', // Orange
    '📧': '#3498db', // Bleu
    '🎯': '#e74c3c', // Rouge
    '💸': '#e74c3c', // Rouge
    '📉': '#e74c3c', // Rouge
    '📝': '#3498db', // Bleu
    '❌': '#e74c3c', // Rouge
    '👤': '#7f8c8d', // Gris
    '🔐': '#27ae60', // Vert foncé
    '📄': '#3498db', // Bleu
    '🌐': '#3498db', // Bleu
    '📞': '#3498db', // Bleu
    '📜': '#7f8c8d', // Gris
    '🚀': '#9b59b6', // Violet
    '💼': '#34495e', // Gris foncé
    '❤️': '#e74c3c', // Rouge
    '⚡': '#f1c40f', // Jaune
    '✨': '#f1c40f', // Jaune
    '🪙': '#f39c12', // Orange
    '🏆': '#f1c40f', // Jaune
  }
  
  const darkColors: Record<string, string> = {
    '🎤': '#ff9f4a', // Orange plus clair
    '📊': '#6eddd6', // Turquoise plus clair
    '💳': '#5fc7e1', // Bleu plus clair
    '🔒': '#a6dcc4', // Vert menthe plus clair
    '🤖': '#b2a4fe', // Violet plus clair
    '📈': '#fd89b8', // Rose plus clair
    '💰': '#f5b041', // Orange plus clair
    '⏰': '#5dade2', // Bleu plus clair
    '📱': '#52c785', // Vert plus clair
    '♾️': '#bb8fce', // Violet plus clair
    '✅': '#58d68d', // Vert plus clair
    '🇨🇮': '#ff8c55', // Orange rouge plus clair
    '💵': '#52c785', // Vert plus clair
    '🟠': '#ff8533', // Orange plus clair
    '🟡': '#ffd633', // Jaune plus clair
    '🔵': '#3385ff', // Bleu plus clair
    '🌊': '#4dd4f2', // Bleu clair plus clair
    '🏦': '#5dade2', // Bleu plus clair
    '💡': '#f4d03f', // Jaune plus clair
    '⚙️': '#aab7b8', // Gris plus clair
    '🏠': '#bb8fce', // Violet plus clair
    '🎓': '#f5b041', // Orange plus clair
    '👕': '#33d4e4', // Cyan plus clair
    '👨‍👩‍👧': '#ffb333', // Orange plus clair
    '📦': '#8597a3', // Gris bleu plus clair
    '💊': '#48e9d4', // Turquoise plus clair
    '🍽️': '#ec7063', // Rouge plus clair
    '🚗': '#5dade2', // Bleu plus clair
    '🎮': '#f1948a', // Rose plus clair
    '💬': '#5dade2', // Bleu plus clair
    '🔔': '#f5b041', // Orange plus clair
    '📧': '#5dade2', // Bleu plus clair
    '🎯': '#ec7063', // Rouge plus clair
    '💸': '#ec7063', // Rouge plus clair
    '📉': '#ec7063', // Rouge plus clair
    '📝': '#5dade2', // Bleu plus clair
    '❌': '#ec7063', // Rouge plus clair
    '👤': '#aab7b8', // Gris plus clair
    '🔐': '#58d68d', // Vert foncé plus clair
    '📄': '#5dade2', // Bleu plus clair
    '🌐': '#5dade2', // Bleu plus clair
    '📞': '#5dade2', // Bleu plus clair
    '📜': '#aab7b8', // Gris plus clair
    '🚀': '#bb8fce', // Violet plus clair
    '💼': '#5d6d7e', // Gris foncé plus clair
    '❤️': '#ec7063', // Rouge plus clair
    '⚡': '#f4d03f', // Jaune plus clair
    '✨': '#f4d03f', // Jaune plus clair
    '🪙': '#f5b041', // Orange plus clair
    '🏆': '#f4d03f', // Jaune plus clair
  }
  
  const colors = theme === 'dark' ? darkColors : lightColors
  return colors[emoji] || (theme === 'dark' ? '#e0e0e0' : '#333333')
}

// Mapping des emojis vers les icônes Lucide
export const emojiToIcon: Record<string, LucideIcon> = {
  '🎤': Mic,
  '📊': BarChart3,
  '💳': CreditCard,
  '🔒': Lock,
  '🤖': Bot,
  '📈': TrendingUp,
  '💰': DollarSign,
  '⏰': Clock,
  '📱': Smartphone,
  '♾️': Infinity,
  '✅': CheckCircle2,
  '🇨🇮': Globe,
  '💵': Banknote,
  '🟠': CircleDot,
  '🟡': CircleDot,
  '🔵': CircleDot,
  '🌊': Waves,
  '🏦': Building,
  '💡': Lightbulb,
  '⚙️': Settings,
  '🏠': Home,
  '🎓': GraduationCap,
  '👕': Shirt,
  '👨‍👩‍👧': Users,
  '📦': Package,
  '💊': Pill,
  '🍽️': UtensilsCrossed,
  '🚗': Car,
  '🎮': Gamepad2,
  '💬': MessageSquare,
  '🔔': Bell,
  '📧': Mail,
  '🎯': Target,
  '💸': ArrowDownRight,
  '📉': TrendingUp,
  '📝': FileText,
  '❌': X,
  '👤': User,
  '🔐': Lock,
  '📄': FileText,
  '🌐': Globe,
  '📞': Phone,
  '📜': FileText,
  '🚀': ArrowUpRight,
  '💼': Building2,
  '❤️': Heart,
  '⚡': Zap,
  '✨': Sparkles,
  '🪙': Coins,
  '🏆': Trophy,
}

interface AnimatedIconProps {
  emoji?: string
  icon?: LucideIcon
  size?: number
  color?: string
  className?: string
  animation?: 'pulse' | 'bounce' | 'rotate' | 'scale' | 'float' | 'none'
  delay?: number
}

export function AnimatedIcon({ 
  emoji, 
  icon, 
  size = 24, 
  color,
  className = '',
  animation = 'pulse',
  delay = 0
}: AnimatedIconProps) {
  const { effectiveTheme } = useThemeStore()
  let IconComponent: LucideIcon | null = null

  // Si une icône est fournie directement, l'utiliser
  if (icon) {
    IconComponent = icon
  }
  // Sinon, chercher dans le mapping emoji -> icône
  else if (emoji && emojiToIcon[emoji]) {
    IconComponent = emojiToIcon[emoji]
  }

  // Si aucune icône n'est trouvée, retourner l'emoji en fallback
  if (!IconComponent) {
    return <span className={className} style={{ fontSize: size }}>{emoji}</span>
  }

  // Déterminer la couleur finale
  const finalColor = color || (emoji ? getIconColor(emoji, effectiveTheme) : (effectiveTheme === 'dark' ? '#e0e0e0' : '#333333'))

  // Variantes d'animation
  const animationVariants: Record<string, any> = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }
    },
    rotate: {
      rotate: [0, 360],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
        delay
      }
    },
    scale: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }
    },
    float: {
      y: [0, -8, 0],
      x: [0, 2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }
    },
    none: {}
  }

  return (
    <motion.div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      animate={animation !== 'none' ? animationVariants[animation] : {}}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <IconComponent size={size} color={finalColor} />
    </motion.div>
  )
}

// Composant pour afficher une icône avec un emoji en fallback
export function IconOrEmoji({ 
  emoji, 
  icon, 
  size = 24, 
  color, 
  className = '',
  animation = 'pulse',
  delay = 0
}: AnimatedIconProps) {
  return (
    <AnimatedIcon
      emoji={emoji}
      icon={icon}
      size={size}
      color={color}
      className={className}
      animation={animation}
      delay={delay}
    />
  )
}

