'use client'

import { useState } from 'react'
import { TrendingUp, ArrowUpRight, Wallet } from 'lucide-react'

type ChartDataPoint = {
  month: number
  name: string
  total: number
}

interface IncomeLineChartProps {
  data: ChartDataPoint[]
  year: number
}

export default function IncomeLineChart({ data, year }: IncomeLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const totalIncome = data.reduce((sum, d) => sum + d.total, 0)
  const maxTotal = Math.max(...data.map(d => d.total), 50000)
  const peakMonth = data.reduce((max, d) => (d.total > max.total ? d : max), data[0] || { name: '—', total: 0 })

  // Dimensions
  const svgWidth = 700
  const svgHeight = 240
  const padLeft = 60
  const padRight = 30
  const padTop = 30
  const padBottom = 40

  const chartW = svgWidth - padLeft - padRight
  const chartH = svgHeight - padTop - padBottom

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = data.length > 1
      ? padLeft + (i * chartW) / (data.length - 1)
      : padLeft + chartW / 2
    const y = padTop + chartH - (d.total / maxTotal) * chartH
    return { x, y, data: d, index: i }
  })

  // Smooth bezier curve path
  const getSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`

    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      const cpx1 = p0.x + (p1.x - p0.x) * 0.4
      const cpy1 = p0.y
      const cpx2 = p0.x + (p1.x - p0.x) * 0.6
      const cpy2 = p1.y
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`
    }
    return d
  }

  const linePath = getSmoothPath(points)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`
    : ''

  // Y-axis grid ticks (4 levels)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => ({
    val: Math.round(maxTotal * ratio),
    y: padTop + chartH - ratio * chartH,
  }))

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Grafik Pemasukan Kas</h2>
            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {year === 2026 ? 'Agustus – Desember 2026' : `Tahun ${year}`}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Trend akumulasi pembayaran uang kas siswa</p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-zinc-50 px-3 py-1.5 rounded-md border border-zinc-100">
            <span className="text-zinc-400 block text-[10px]">Total Terkumpul</span>
            <span className="font-bold text-zinc-900">Rp {totalIncome.toLocaleString('id-ID')}</span>
          </div>
          <div className="bg-emerald-50/60 px-3 py-1.5 rounded-md border border-emerald-100">
            <span className="text-emerald-600 block text-[10px]">Pemasukan Tertinggi</span>
            <span className="font-bold text-emerald-900">
              {peakMonth.name} ({peakMonth.total > 0 ? `Rp ${peakMonth.total.toLocaleString('id-ID')}` : '—'})
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="p-4 relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            {/* Line Gradient */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Point Shadow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Y Labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="#f4f4f5"
                strokeWidth="1"
                strokeDasharray={idx === 0 ? undefined : '4 4'}
              />
              <text
                x={padLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-zinc-400 text-[10px] font-medium"
              >
                {tick.val >= 1000 ? `${Math.round(tick.val / 1000)}k` : tick.val}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#areaGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Curve Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Hover Vertical Guide Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + chartH}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70"
            />
          )}

          {/* Data Points & X Labels */}
          {points.map((pt) => {
            const isHovered = hoveredIdx === pt.index
            return (
              <g key={pt.index}>
                {/* X Label */}
                <text
                  x={pt.x}
                  y={padTop + chartH + 24}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isHovered ? 'fill-zinc-900 font-bold' : 'fill-zinc-500'
                  }`}
                >
                  {pt.data.name}
                </text>

                {/* Interactive Touch Target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(pt.index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '7' : '5'}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth={isHovered ? '3' : '2.5'}
                  className="transition-all duration-200 pointer-events-none"
                />

                {/* Inner Glow Dot */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    fill="#047857"
                    className="pointer-events-none"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${(activePoint.y / svgHeight) * 100}%`,
            }}
          >
            <div className="bg-zinc-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-zinc-800 flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                {activePoint.data.name} {year}
              </span>
              <span className="font-bold text-emerald-400 text-sm">
                Rp {activePoint.data.total.toLocaleString('id-ID')}
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
