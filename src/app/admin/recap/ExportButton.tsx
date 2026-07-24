'use client'

import { useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

type MonthlyRecap = {
  month: number
  monthLabel: string
  students: unknown[]
  totalCollected: number
}

interface ExportButtonProps {
  monthlyData: MonthlyRecap[]
  currentMonth: number
  year: number
}

export default function ExportButton({ monthlyData, currentMonth, year }: ExportButtonProps) {
  const [open, setOpen] = useState(false)

  const download = (url: string) => {
    window.location.href = url
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow-xs"
      >
        <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Ekspor Excel</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden w-[220px] max-w-[calc(100vw-32px)]">
            <div className="px-3 py-2 bg-zinc-50 border-b border-zinc-100">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Ekspor Excel (.xlsx)</p>
            </div>

            {/* Semua bulan */}
            <button
              onClick={() => download(`/api/export?year=${year}&month=all`)}
              className="w-full text-left px-3 py-2.5 text-xs font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-zinc-100 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <div>
                <p className="font-semibold">Semua Bulan</p>
                <p className="text-[10px] text-zinc-400 font-normal">
                  {year === 2026 ? 'Agustus–Desember + ringkasan' : '12 sheet + ringkasan'}
                </p>
              </div>
            </button>

            {/* Per bulan */}
            <div className="max-h-[240px] overflow-y-auto">
              {MONTHS.filter(m => year !== 2026 || m.value >= 8).map(m => {
                const data = monthlyData.find(d => d.month === m.value)
                const total = data?.totalCollected || 0
                const isCurrent = m.value === currentMonth
                return (
                  <button
                    key={m.value}
                    onClick={() => download(`/api/export?year=${year}&month=${m.value}`)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-zinc-50 text-zinc-900 font-semibold hover:bg-zinc-100'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>
                      {m.label}
                      {isCurrent && (
                        <span className="text-[9px] bg-zinc-900 text-white rounded px-1 py-0.5 ml-1">Bln Ini</span>
                      )}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {total > 0 ? `Rp ${(total / 1000).toFixed(0)}k` : '—'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
