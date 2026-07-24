'use client'

import { useState, useEffect } from 'react'
import { Check, Clock, X, AlertTriangle } from 'lucide-react'

type CellStatus = 'lunas_sekaligus' | 'lunas_cicilan' | 'mencicil' | 'belum_bayar' | 'nunggak'

interface StatusCellProps {
  totalPaid: number
  count: number
  monthLabel: string
  studentName: string
  firstPaymentDate?: string | null
  lastPaymentDate?: string | null
  isPastMonth?: boolean
}

export default function StatusCell({
  totalPaid,
  count,
  monthLabel,
  studentName,
  firstPaymentDate,
  lastPaymentDate,
  isPastMonth = false,
}: StatusCellProps) {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (showModal) {
      // Small delay for animation
      const t = setTimeout(() => setMounted(true), 10)
      document.body.style.overflow = 'hidden'
      return () => clearTimeout(t)
    } else {
      setMounted(false)
      document.body.style.overflow = ''
    }
  }, [showModal])

  const closeModal = () => {
    setMounted(false)
    setTimeout(() => setShowModal(false), 250)
  }

  let status: CellStatus = 'belum_bayar'
  let target = 10000

  if (totalPaid > 0) {
    if (count === 1 && totalPaid === 10000) {
      status = 'lunas_sekaligus'
      target = 10000
    } else {
      const firstDate = firstPaymentDate ? new Date(firstPaymentDate) : new Date()
      const lastDate = lastPaymentDate ? new Date(lastPaymentDate) : new Date()
      const durationDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
      const daysSinceFirst = (Date.now() - firstDate.getTime()) / (1000 * 3600 * 24)

      if (totalPaid >= 10000 && durationDays <= 7) {
        status = 'lunas_cicilan'
        target = 10000
      } else if (totalPaid >= 20000) {
        status = 'lunas_cicilan'
        target = 20000
      } else if (totalPaid >= 15000) {
        status = 'lunas_cicilan'
        target = 15000
      } else {
        status = 'mencicil'
        target = daysSinceFirst <= 7 ? 10000 : 15000
      }
    }
  } else {
    if (isPastMonth) {
      status = 'nunggak'
      target = 20000
    }
  }

  const remaining = Math.max(0, target - totalPaid)
  const progressPct = Math.min(100, Math.round((totalPaid / target) * 100))

  const statusConfig = {
    lunas_sekaligus: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      text: 'Lunas Sekaligus',
      subtext: '10k',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      progressColor: 'bg-emerald-500',
    },
    lunas_cicilan: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      text: 'Lunas Cicilan',
      subtext: target === 10000 ? '10k' : target === 15000 ? '15k' : '20k',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      progressColor: 'bg-emerald-500',
    },
    mencicil: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />,
      iconBg: 'bg-amber-100',
      text: 'Mencicil',
      subtext: `${(totalPaid / 1000).toFixed(0)}k`,
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
      progressColor: 'bg-amber-400',
    },
    belum_bayar: {
      bg: '',
      border: 'border-zinc-100',
      icon: <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />,
      iconBg: 'bg-zinc-100',
      text: 'Belum Bayar',
      subtext: '',
      textColor: 'text-zinc-400',
      badgeBg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      progressColor: 'bg-zinc-300',
    },
    nunggak: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />,
      iconBg: 'bg-red-100',
      text: 'Nunggak',
      subtext: '20k',
      textColor: 'text-red-600',
      badgeBg: 'bg-red-100 text-red-700 border-red-200',
      progressColor: 'bg-red-400',
    },
  }

  const cfg = statusConfig[status]

  const formatRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`

  return (
    <>
      {/* Cell */}
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-full py-1 sm:py-1.5 cursor-pointer transition-all duration-150 hover:z-10 select-none active:scale-95`}
        onClick={() => setShowModal(true)}
      >
        {/* Background tint */}
        {cfg.bg && (
          <div className={`absolute inset-0.5 rounded ${cfg.bg} opacity-60`} />
        )}
        <div className="relative flex flex-col items-center gap-0.5">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${cfg.iconBg} border ${cfg.border}`}>
            {cfg.icon}
          </div>
          {cfg.subtext && (
            <span className={`text-[8px] sm:text-[9px] font-semibold ${cfg.textColor}`}>
              {cfg.subtext}
            </span>
          )}
        </div>

        {/* Hover Tooltip — Desktop only */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover:flex z-50 pointer-events-none w-max">
          <div className="bg-zinc-900 text-white text-[11px] rounded-lg py-2.5 px-3.5 shadow-xl flex flex-col gap-1 border border-white/10">
            <span className="font-semibold text-white">{studentName}</span>
            <span className="text-zinc-400">{monthLabel}</span>
            <span className={`font-medium mt-0.5 ${
              status.startsWith('lunas') ? 'text-emerald-400' :
              status === 'mencicil' ? 'text-amber-400' :
              status === 'nunggak' ? 'text-red-400' : 'text-zinc-400'
            }`}>
              {cfg.text}
              {status === 'mencicil' && ` · Sisa ${formatRp(remaining)}`}
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
          </div>
        </div>
      </div>

      {/* Modal — Bottom Sheet on Mobile, Centered on Desktop */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
          style={{ backgroundColor: mounted ? 'rgba(9,9,11,0.5)' : 'rgba(9,9,11,0)', backdropFilter: 'blur(4px)', transition: 'background-color 250ms ease' }}
          onClick={closeModal}
        >
          <div
            className={`
              bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden
              transition-all duration-250 ease-out
              ${mounted ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-full opacity-0 sm:translate-y-0 sm:scale-95'}
            `}
            style={{ transitionDuration: '250ms' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>

            {/* Header */}
            <div className={`px-5 pt-4 pb-4 sm:pt-5 flex items-start justify-between gap-3 border-b border-zinc-100`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg} border ${cfg.border} shrink-0`}>
                  <div className="scale-150">{cfg.icon}</div>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm leading-tight">{studentName}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{monthLabel}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Status Pembayaran</span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.badgeBg}`}>
                  {cfg.text}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-500">Progress</span>
                  <span className={`font-semibold ${cfg.textColor}`}>{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cfg.progressColor}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 font-medium mb-1">Terbayar</p>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">
                    {(totalPaid / 1000).toFixed(0)}k
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 font-medium mb-1">Target</p>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">
                    {(target / 1000).toFixed(0)}k
                  </p>
                </div>
                <div className={`rounded-xl p-3 border ${remaining > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className="text-[10px] text-zinc-400 font-medium mb-1">Sisa</p>
                  <p className={`text-sm font-bold leading-tight ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {remaining > 0 ? `${(remaining / 1000).toFixed(0)}k` : '✓'}
                  </p>
                </div>
              </div>

              {/* Payment Count */}
              {count > 0 && (
                <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-100">
                  <span>Jumlah transaksi</span>
                  <span className="font-semibold text-zinc-700">{count}x bayar</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="px-5 pb-5 pt-1">
              <button
                onClick={closeModal}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
