'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updatePayment, deletePayment } from '@/app/actions/payment'
import {
  History, Pencil, Trash2, X, Check, Loader2,
  ChevronLeft, ChevronRight, CreditCard, TrendingUp
} from 'lucide-react'

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

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

type PaymentItem = {
  id: string
  student_id: string
  month: number
  year: number
  amount: number
  created_at: string
  students?: { name: string } | null
}

interface TransactionListProps {
  payments: PaymentItem[] | null
  totalMonth: number
  monthlyTotals: Record<number, number>
  selectedMonth: number
  selectedYear: number
  currentMonth: number
  currentYear: number
}

export default function TransactionList({
  payments,
  totalMonth,
  monthlyTotals,
  selectedMonth,
  selectedYear,
  currentMonth,
  currentYear,
}: TransactionListProps) {
  const [editingPayment, setEditingPayment] = useState<PaymentItem | null>(null)
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOpenEdit = (p: PaymentItem) => {
    setEditingPayment(p)
    setAmount(String(p.amount))
    setMonth(p.month)
    setYear(p.year)
    setError(null)
  }

  const handleCloseEdit = () => {
    setEditingPayment(null)
    setError(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPayment) return
    setIsSubmitting(true)
    setError(null)
    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus berupa angka > 0')
      setIsSubmitting(false)
      return
    }
    const res = await updatePayment(editingPayment.id, numAmount, month, year)
    if (res?.error) setError(res.error)
    else handleCloseEdit()
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    setDeletingId(id)
    await deletePayment(id)
    setDeletingId(null)
  }

  const selectedMonthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || ''
  const totalYear = Object.values(monthlyTotals).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Semua Transaksi</h1>
          <p className="text-sm text-zinc-500 mt-1">Riwayat pembayaran diurutkan per bulan.</p>
        </div>

        {/* Year switcher */}
        <div className="flex items-center bg-white border border-zinc-200 rounded-md p-1 shadow-sm">
          <Link
            href={`/admin/payments/transactions?year=${selectedYear - 1}&month=${selectedMonth}`}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="px-4 py-1 text-sm font-medium text-zinc-900">{selectedYear}</div>
          <Link
            href={`/admin/payments/transactions?year=${selectedYear + 1}&month=${selectedMonth}`}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Transaksi Bulan Ini</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">{payments?.length || 0}</p>
          <p className="text-xs text-zinc-400">{selectedMonthLabel} {selectedYear}</p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Bulan Ini</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">Rp {totalMonth.toLocaleString('id-ID')}</p>
          <p className="text-xs text-emerald-600">{selectedMonthLabel} {selectedYear}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <History className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Tahun {selectedYear}</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">Rp {totalYear.toLocaleString('id-ID')}</p>
          <p className="text-xs text-zinc-400">Semua bulan</p>
        </div>
      </div>

      {/* Month tabs */}
      <div className="flex flex-wrap gap-1.5">
        {MONTHS.filter(m => selectedYear !== 2026 || m.value >= 8).map(m => {
          const total = monthlyTotals[m.value] || 0
          const isSelected = m.value === selectedMonth
          const isCurrent = m.value === currentMonth && selectedYear === currentYear
          return (
            <Link
              key={m.value}
              href={`/admin/payments/transactions?year=${selectedYear}&month=${m.value}`}
              className={`relative flex flex-col items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-w-[52px] ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span>
                {MONTHS_SHORT[m.value - 1]}
                {isCurrent && (
                  <span className={`ml-1 w-1 h-1 rounded-full inline-block mb-0.5 ${isSelected ? 'bg-white' : 'bg-zinc-900'}`} />
                )}
              </span>
              {total > 0 && (
                <span className={`text-[9px] font-normal ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                  {(total / 1000).toFixed(0)}k
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Transaksi — {selectedMonthLabel} {selectedYear}
            </h2>
          </div>
          <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
            {payments?.length || 0} transaksi
          </span>
        </div>

        {(!payments || payments.length === 0) ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <History className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-medium text-zinc-500">Belum ada transaksi</p>
            <p className="text-xs text-zinc-400">
              Tidak ada pembayaran di {selectedMonthLabel} {selectedYear}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100">
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="flex items-center px-5 py-3.5 hover:bg-zinc-50 transition-colors group gap-3"
                >
                  {/* Nomor urut */}
                  <span className="text-xs font-medium text-zinc-300 w-5 shrink-0">
                    {index + 1}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {payment.students?.name || 'Unknown Student'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(payment.created_at).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Nominal */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-zinc-900">
                      +Rp {payment.amount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(payment)}
                      className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      disabled={deletingId === payment.id}
                      className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === payment.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer total */}
            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Total {selectedMonthLabel} {selectedYear}
              </span>
              <span className="text-sm font-bold text-emerald-700">
                Rp {totalMonth.toLocaleString('id-ID')}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal Edit */}
      {editingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm">Edit Pembayaran</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{editingPayment.students?.name}</p>
              </div>
              <button onClick={handleCloseEdit} className="p-1 rounded hover:bg-zinc-100 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">Bulan</label>
                  <select
                    value={month}
                    onChange={e => setMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700">Tahun</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">Nominal (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  step="1000"
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
