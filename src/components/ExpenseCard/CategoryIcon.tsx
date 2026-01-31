import {
  Car,
  Utensils,
  Home,
  HeartPulse,
  GraduationCap,
  Phone,
  Gamepad2,
  Shirt,
  Users,
  MoreHorizontal,
  type LucideIcon
} from 'lucide-react'

interface CategoryIconProps {
  name: string
  color?: string
  size?: number
}

const iconMap: Record<string, LucideIcon> = {
  'car': Car,
  'utensils': Utensils,
  'home': Home,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'phone': Phone,
  'gamepad-2': Gamepad2,
  'shirt': Shirt,
  'users': Users,
  'ellipsis': MoreHorizontal
}

export function CategoryIcon({ name, color = '#ffffff', size = 20 }: CategoryIconProps) {
  const Icon = iconMap[name] || MoreHorizontal
  
  return <Icon size={size} color={color} strokeWidth={2} />
}

