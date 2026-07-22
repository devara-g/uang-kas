'use client'

import { addPayment, getPaymentStatus, type PaymentStatus } from '@/app/actions/payment'
import { useState, useTransition } from 'react'
import { CheckCircle2, Clock, AlertCircle, Loader2, QrCode } from 'lucide-react'
import Link from 'next/link'

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

type Student = { id: string; name: string }

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status.status === 'belum_bayar') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md border border-red-200 bg-red-50">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Belum Bayar</p>
          <p className="text-xs text-red-600 mt-0.5">Target Rp 10.000 jika lunas ≤ 1 minggu. Jika lebih dari  1 minggu target Rp 15.000.</p>
        </div>
      </div>
    )
  }
  if (status.status === 'mencicil') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-md border border-amber-200 bg-amber-50">
        <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700">Sedang Mencicil</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Terbayar: Rp {status.totalPaid.toLocaleString('id-ID')} • Target ({status.target === 10000 ? '≤ 1 minggu' : '> 1 minggu'}): Rp {status.target.toLocaleString('id-ID')} • Sisa: Rp {status.remaining.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3 p-3 rounded-md border border-emerald-200 bg-emerald-50">
      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-emerald-700">Lunas</p>
        <p className="text-xs text-emerald-600 mt-0.5">
          {status.status === 'lunas_sekaligus' ? 'Dibayar sekaligus Rp 10.000.' : `Lunas cicilan Rp ${status.totalPaid.toLocaleString('id-ID')}.`}
        </p>
      </div>
    </div>
  )
}

export default function PaymentForm({ students }: { students: Student[] | null }) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [studentId, setStudentId] = useState('')
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [amount, setAmount] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStatus, startCheckingStatus] = useTransition()

  const checkStatus = (sid: string, m: number, y: number) => {
    if (!sid) { setPaymentStatus(null); return }
    startCheckingStatus(async () => {
      const s = await getPaymentStatus(sid, m, y)
      setPaymentStatus(s)
      if (s.status !== 'belum_bayar' && s.status !== 'mencicil') {
        setAmount('')
      } else {
        setAmount(String(s.remaining))
      }
    })
  }

  const handleStudentChange = (v: string) => {
    setStudentId(v)
    setError(null)
    setSuccess(false)
    checkStatus(v, month, year)
  }

  const handleMonthChange = (v: number) => {
    setMonth(v)
    setError(null)
    setSuccess(false)
    checkStatus(studentId, v, year)
  }

  const handleYearChange = (v: number) => {
    setYear(v)
    setError(null)
    setSuccess(false)
    checkStatus(studentId, month, v)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const fd = new FormData()
    fd.append('student_id', studentId)
    fd.append('month', String(month))
    fd.append('year', String(year))
    fd.append('amount', amount)

    const res = await addPayment(fd)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setAmount('')
      checkStatus(studentId, month, year)
    }
    setIsSubmitting(false)
  }

  const isLunas = paymentStatus?.status === 'lunas_sekaligus' || paymentStatus?.status === 'lunas_cicilan'

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Nama Siswa */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700">Student</label>
          <select
            value={studentId}
            onChange={e => handleStudentChange(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
          >
            <option value="">Select student...</option>
            {students?.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Bulan & Tahun */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Month</label>
            <select
              value={month}
              onChange={e => handleMonthChange(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
            >
              {MONTHS.filter(m => year !== 2026 || m.value >= 8).map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Year</label>
            <input
              type="number"
              value={year}
              onChange={e => handleYearChange(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Status indicator */}
        {isCheckingStatus && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking payment status...
          </div>
        )}
        {!isCheckingStatus && paymentStatus && <StatusBadge status={paymentStatus} />}

        {/* Nominal */}
        {!isLunas && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Amount (IDR)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="1000"
              step="1000"
              className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
              placeholder="Enter amount..."
            />
            {paymentStatus?.status === 'belum_bayar' && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAmount('10000')}
                  className="flex-1 py-1.5 text-xs font-medium rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  Pay Full (10k)
                </button>
                <button
                  type="button"
                  onClick={() => setAmount('5000')}
                  className="flex-1 py-1.5 text-xs font-medium rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  Installment (5k)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-emerald-50 text-emerald-600 text-sm border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Payment successfully recorded.</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
        {!isLunas && (
          <button
            type="submit"
            disabled={isSubmitting || !studentId || !amount}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Payment'}
          </button>
        )}
        <Link
          href="/admin/qris"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          Show QRIS
        </Link>
      </div>
    </form>
  )
}
