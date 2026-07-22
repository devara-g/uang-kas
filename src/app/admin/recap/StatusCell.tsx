'use client'

import { useState } from 'react'
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
    // Cek apakah bulan sudah lewat (nunggak)
    // monthLabel format: "Jul 2026" — kita perlu tahu apakah month ini sudah lewat
    // Cara paling simpel: cek via prop isPastMonth yang bisa kita tambah
    // Untuk sementara gunakan flag dari prop
    if (isPastMonth) {
      status = 'nunggak'
      target = 20000
    }
  }

  const remaining = Math.max(0, target - totalPaid)

  const renderIcon = () => {
    if (status === 'belum_bayar') return (
      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-zinc-100 border border-zinc-200">
        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />
      </div>
    )
    if (status === 'nunggak') return (
      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-red-100 border border-red-300">
        <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
      </div>
    )
    if (status === 'mencicil') return (
      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-amber-50 border border-amber-200">
        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
      </div>
    )
    return (
      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-emerald-50 border border-emerald-200">
        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
      </div>
    )
  }

  const getStatusText = () => {
    if (status === 'belum_bayar') return 'Belum Bayar'
    if (status === 'nunggak') return 'Nunggak (20k)'
    if (status === 'mencicil') return `Mencicil (Target Rp ${target.toLocaleString('id-ID')})`
    if (status === 'lunas_sekaligus') return 'Lunas Sekaligus (10k)'
    return `Lunas Cicilan (${target === 10000 ? '10k ≤ 1 mgg' : target === 15000 ? '15k > 1 mgg' : '20k nunggak'})`
  }

  return (
    <>
      <div 
        className="relative group flex flex-col items-center justify-center w-full h-full py-1 sm:py-1.5 cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => setShowModal(true)}
      >
        {renderIcon()}
        {status === 'nunggak' && (
          <span className="text-[8px] sm:text-[10px] font-medium mt-0.5 sm:mt-1 text-red-700">20k</span>
        )}
        {status === 'mencicil' && (
          <span className="text-[8px] sm:text-[10px] font-medium mt-0.5 sm:mt-1 text-amber-700">
            {(totalPaid / 1000).toFixed(0)}k
          </span>
        )}
        {(status === 'lunas_sekaligus' || status === 'lunas_cicilan') && (
          <span className="text-[8px] sm:text-[10px] font-medium mt-0.5 sm:mt-1 text-emerald-700">
            {target === 10000 ? '10k' : target === 15000 ? '15k' : '20k'}
          </span>
        )}

        {/* Hover Tooltip (Desktop only) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover:flex z-50 pointer-events-none w-max transition-opacity opacity-0 group-hover:opacity-100">
          <div className="bg-zinc-900 text-white text-xs rounded-md py-2 px-3 shadow-sm flex flex-col items-center border border-zinc-800">
            <span className="font-medium text-zinc-300 mb-1">{studentName} - {monthLabel}</span>
            <span className="font-semibold text-white">{getStatusText()}</span>
            {status === 'mencicil' && <span className="text-amber-400 mt-0.5">Sisa: Rp {remaining.toLocaleString('id-ID')}</span>}
            {status === 'nunggak' && <span className="text-red-400 mt-0.5">Nunggak! Target: Rp 20.000</span>}
            {status === 'belum_bayar' && <span className="text-zinc-400 mt-0.5">Target: Rp 10.000</span>}
            
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
          </div>
        </div>
      </div>

      {/* Modal Popup (Mobile & Desktop on click) */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg transition-transform transform scale-100 border border-zinc-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Payment Details</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <span className="text-xs font-medium text-zinc-500">Student</span>
                <span className="text-sm font-medium text-zinc-900">{studentName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <span className="text-xs font-medium text-zinc-500">Month</span>
                <span className="text-sm font-medium text-zinc-900">{monthLabel}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <span className="text-xs font-medium text-zinc-500">Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                  status === 'belum_bayar' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' :
                  status === 'nunggak' ? 'bg-red-100 text-red-700 border-red-300' :
                  (status === 'mencicil' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                }`}>
                  {getStatusText()}
                </span>
              </div>
              
              <div className="bg-zinc-50 rounded-md p-4 mt-2 border border-zinc-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-zinc-500">Total Terbayar</span>
                  <span className="text-sm font-semibold text-zinc-900">Rp {totalPaid.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-zinc-500">Target Bayar</span>
                  <span className="text-sm font-semibold text-zinc-900">Rp {target.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                  <span className="text-xs font-medium text-zinc-500">Sisa Tagihan</span>
                  <span className="text-sm font-semibold text-zinc-900">Rp {remaining.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-2 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  )
}
