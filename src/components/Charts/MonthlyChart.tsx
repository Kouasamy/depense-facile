import { useMemo } from 'react'
import { formatAmount } from '../../core/nlp/parser'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface MonthlyChartProps {
  data: ChartData[]
  height?: number
  showLabels?: boolean
  type?: 'bar' | 'line'
}

export function MonthlyChart({ 
  data, 
  height = 200, 
  showLabels = true,
  type = 'bar'
}: MonthlyChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  
  const chartWidth = 100 // percentage
  const barWidth = data.length > 0 ? (chartWidth / data.length) * 0.7 : 0
  const barGap = data.length > 0 ? (chartWidth / data.length) * 0.3 : 0

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-[var(--color-text-muted)]"
        style={{ height }}
      >
        Pas de données
      </div>
    )
  }

  if (type === 'line') {
    return <LineChart data={data} height={height} maxValue={maxValue} showLabels={showLabels} />
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={height - (y / 100) * (height - 30)}
            x2="100"
            y2={height - (y / 100) * (height - 30)}
            stroke="var(--color-bg-card)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 30)
          const x = index * (barWidth + barGap) + barGap / 2
          const y = height - barHeight - 20
          
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="2"
                fill={item.color || 'var(--color-primary)'}
                className="transition-all duration-300"
              />
              
              {/* Label */}
              {showLabels && (
                <text
                  x={x + barWidth / 2}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="6"
                  fill="var(--color-text-muted)"
                >
                  {item.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Line Chart Component
function LineChart({ 
  data, 
  height, 
  maxValue,
  showLabels 
}: { 
  data: ChartData[]
  height: number
  maxValue: number
  showLabels: boolean
}) {
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 95 + 2.5
    const y = height - 25 - (item.value / maxValue) * (height - 40)
    return { x, y, value: item.value, label: item.label }
  })

  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  // Area path
  const areaPath = `${pathD} L ${points[points.length - 1]?.x || 0} ${height - 25} L ${points[0]?.x || 0} ${height - 25} Z`

  return (
    <div className="w-full" style={{ height }}>
      <svg 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={height - 25 - (y / 100) * (height - 40)}
            x2="100"
            y2={height - 25 - (y / 100) * (height - 40)}
            stroke="var(--color-bg-card)"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="var(--color-primary)"
          fillOpacity="0.1"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points and labels */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill="var(--color-primary)"
            />
            {showLabels && (
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="5"
                fill="var(--color-text-muted)"
              >
                {point.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

// Pie Chart Component
interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>
  size?: number
}

export function PieChart({ data, size = 150 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  
  if (total === 0) {
    return (
      <div 
        className="flex items-center justify-center text-[var(--color-text-muted)]"
        style={{ width: size, height: size }}
      >
        Pas de données
      </div>
    )
  }

  let currentAngle = -90 // Start from top

  const slices = data.map(item => {
    const percentage = item.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    currentAngle += angle
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle
    }
  })

  const center = size / 2
  const radius = size * 0.4
  const innerRadius = radius * 0.6 // Donut hole

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {slices.map((slice, index) => {
          const startRad = (slice.startAngle * Math.PI) / 180
          const endRad = (slice.endAngle * Math.PI) / 180
          
          const x1 = center + radius * Math.cos(startRad)
          const y1 = center + radius * Math.sin(startRad)
          const x2 = center + radius * Math.cos(endRad)
          const y2 = center + radius * Math.sin(endRad)
          
          const ix1 = center + innerRadius * Math.cos(startRad)
          const iy1 = center + innerRadius * Math.sin(startRad)
          const ix2 = center + innerRadius * Math.cos(endRad)
          const iy2 = center + innerRadius * Math.sin(endRad)
          
          const largeArc = slice.percentage > 0.5 ? 1 : 0
          
          const path = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            'Z'
          ].join(' ')

          return (
            <path
              key={index}
              d={path}
              fill={slice.color}
              className="transition-all duration-300 hover:opacity-80"
            />
          )
        })}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold">{formatAmount(total)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">FCFA</p>
        </div>
      </div>
    </div>
  )
}

// Legend Component
interface LegendProps {
  items: Array<{ label: string; value: number; color: string }>
}

export function ChartLegend({ items }: LegendProps) {
  const total = items.reduce((sum, i) => sum + i.value, 0)

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
        
        return (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              {formatAmount(item.value)} F ({percentage}%)
            </div>
          </div>
        )
      })}
    </div>
  )
}

