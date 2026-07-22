'use client'

import { useState } from 'react'
import { Check, Clock, X } from 'lucide-react'

type CellStatus = 'lunas_sekaligus' | 'lunas_cicilan' | 'mencicil' | 'belum_bayar'

interface StatusCellProps {
  totalPaid: number
  count: number
  monthLabel: string
  studentName: string
}

export default function StatusCell({ totalPaid, count, monthLabel, studentName }: StatusCellProps) {
  const [showModal, setShowModal] = useState(false)

  let status: CellStatus = 'belum_bayar'
  if (totalPaid > 0) {
    if (count === 1 && totalPaid === 10000) status = 'lunas_sekaligus'
    else if (totalPaid >= 15000) status = 'lunas_cicilan'
    else status = 'mencicil'
  }

  const remaining = status === 'mencicil' ? 15000 - totalPaid : (status === 'belum_bayar' ? 10000 : 0)

  const renderIcon = () => {
    if (status === 'belum_bayar') return (
      <div className="w-5 h-5 rounded flex items-center justify-center bg-zinc-100 border border-zinc-200">
        <X className="w-3 h-3 text-zinc-400" />
      </div>
    )
    if (status === 'mencicil') return (
      <div className="w-5 h-5 rounded flex items-center justify-center bg-amber-50 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-500" />
      </div>
    )
    return (
      <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-50 border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
    )
  }

  const getStatusText = () => {
    if (status === 'belum_bayar') return 'Belum Bayar'
    if (status === 'mencicil') return 'Sedang Mencicil'
    if (status === 'lunas_sekaligus') return 'Lunas (10k)'
    return 'Lunas Cicilan (15k)'
  }

  return (
    <>
      <div 
        className="relative group flex flex-col items-center justify-center w-full h-full py-1.5 cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => setShowModal(true)}
      >
        {renderIcon()}
        {status === 'mencicil' && (
          <span className="text-[10px] font-medium mt-1 text-amber-700">
            {(totalPaid / 1000).toFixed(0)}k
          </span>
        )}
        {(status === 'lunas_sekaligus' || status === 'lunas_cicilan') && (
          <span className="text-[10px] font-medium mt-1 text-emerald-700">
            {status === 'lunas_sekaligus' ? '10k' : '15k'}
          </span>
        )}

        {/* Hover Tooltip (Desktop only) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover:flex z-50 pointer-events-none w-max transition-opacity opacity-0 group-hover:opacity-100">
          <div className="bg-zinc-900 text-white text-xs rounded-md py-2 px-3 shadow-sm flex flex-col items-center border border-zinc-800">
            <span className="font-medium text-zinc-300 mb-1">{studentName} - {monthLabel}</span>
            <span className="font-semibold text-white">{getStatusText()}</span>
            {status === 'mencicil' && <span className="text-amber-400 mt-0.5">Sisa: Rp {remaining.toLocaleString('id-ID')}</span>}
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
                  status === 'belum_bayar' ? 'bg-red-50 text-red-700 border-red-200' : 
                  (status === 'mencicil' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                }`}>
                  {getStatusText()}
                </span>
              </div>
              
              <div className="bg-zinc-50 rounded-md p-4 mt-2 border border-zinc-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-zinc-500">Paid Amount</span>
                  <span className="text-sm font-semibold text-zinc-900">Rp {totalPaid.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                  <span className="text-xs font-medium text-zinc-500">Remaining</span>
                  <span className="text-sm font-semibold text-zinc-900">Rp {remaining.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-2 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
