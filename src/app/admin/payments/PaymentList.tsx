'use client'

import { useState } from 'react'
import { updatePayment, deletePayment } from '@/app/actions/payment'
import { History, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'

type PaymentItem = {
  id: string
  student_id: string
  month: number
  year: number
  amount: number
  created_at: string
  students?: { name: string } | null
}

const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Agu' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Okt' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Des' },
]

export default function PaymentList({ payments }: { payments: PaymentItem[] | null }) {
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
    if (res?.error) {
      setError(res.error)
    } else {
      handleCloseEdit()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi pembayaran ini?')) return
    setDeletingId(id)
    await deletePayment(id)
    setDeletingId(null)
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
      <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Recent Transactions</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0">
        {(!payments || payments.length === 0) ? (
          <div className="py-12 text-center flex flex-col items-center">
            <History className="w-8 h-8 text-zinc-300 mb-3" />
            <p className="text-sm font-medium text-zinc-500">No transactions yet</p>
            <p className="text-xs text-zinc-400 mt-1">Record a payment to see history here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {payments.map(payment => (
              <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {payment.students?.name || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Bulan {payment.month} - {payment.year}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">
                      +Rp {payment.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(payment.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(payment)}
                      className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                      title="Edit transaksi"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      disabled={deletingId === payment.id}
                      className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Hapus transaksi"
                    >
                      {deletingId === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Edit Payment */}
      {editingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm">Edit Pembayaran</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{editingPayment.students?.name || 'Siswa'}</p>
              </div>
              <button onClick={handleCloseEdit} className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600">
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
                <label className="block text-xs font-medium text-zinc-700">Nominal Pembayaran (Rp)</label>
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
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
