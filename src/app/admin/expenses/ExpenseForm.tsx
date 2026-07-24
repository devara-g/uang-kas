'use client'

import { useState, useTransition } from 'react'
import { addExpense, deleteExpense } from '@/app/actions/expense'
import { EXPENSE_CATEGORIES, type Expense } from '@/constants/expense'
import {
  PlusCircle, Trash2, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, Receipt, Tag, Calendar, FileText, DollarSign,
  TrendingDown, Pencil, Utensils, Package, PartyPopper, Sparkles, HeartHandshake
} from 'lucide-react'

const MONTHS = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
]

interface ExpenseFormProps {
  initialExpenses: Expense[]
  selectedMonth: number
  selectedYear: number
  currentMonth: number
  currentYear: number
}

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function CategoryIcon({ category, className = "w-3.5 h-3.5" }: { category: string; className?: string }) {
  switch (category) {
    case 'ATK': return <Pencil className={className} />
    case 'Konsumsi': return <Utensils className={className} />
    case 'Perlengkapan': return <Package className={className} />
    case 'Kegiatan': return <PartyPopper className={className} />
    case 'Kebersihan': return <Sparkles className={className} />
    case 'Sosial': return <HeartHandshake className={className} />
    default: return <Tag className={className} />
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ATK:          { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200' },
  Konsumsi:     { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  Perlengkapan: { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  Kegiatan:     { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200' },
  Kebersihan:   { bg: 'bg-teal-50',    text: 'text-teal-700',   border: 'border-teal-200' },
  Sosial:       { bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200' },
  Lainnya:      { bg: 'bg-zinc-100',   text: 'text-zinc-700',   border: 'border-zinc-200' },
}

export default function ExpenseForm({
  initialExpenses,
  selectedMonth,
  selectedYear,
  currentMonth,
  currentYear,
}: ExpenseFormProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(selectedMonth)
  const [year, setYear] = useState(selectedYear)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalPengeluaran = expenses.reduce((sum, e) => sum + e.amount, 0)

  const resetForm = () => {
    setTitle(''); setCategory(''); setAmount(''); setNote('')
    setError(null); setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const fd = new FormData()
    fd.append('title', title)
    fd.append('category', category)
    fd.append('amount', amount)
    fd.append('month', String(month))
    fd.append('year', String(year))
    fd.append('note', note)

    const res = await addExpense(fd)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        title, category, amount: parseInt(amount),
        month, year, note: note || null,
        created_at: new Date().toISOString(),
      }
      setExpenses(prev => [newExpense, ...prev])
      resetForm()
      setTimeout(() => {
        setSuccess(false)
        setShowForm(false)
      }, 1200)
    }
    setIsSubmitting(false)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      const res = await deleteExpense(id)
      if (!res?.error) {
        setExpenses(prev => prev.filter(e => e.id !== id))
      }
      setDeletingId(null)
    })
  }

  return (
    <div className="space-y-5">
      {/* Header + button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Pengeluaran Kas</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); resetForm() }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Pengeluaran</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showForm ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Total Card */}
        <div className="bg-zinc-900 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Pengeluaran</span>
            </div>
            <p className="text-2xl font-black text-white leading-tight">
              {formatRupiah(totalPengeluaran)}
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">
              {expenses.length} item pengeluaran ({MONTHS.find(m => m.value === selectedMonth)?.label})
            </p>
          </div>
        </div>

        {/* Kategori Card */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kategori Pengeluaran</span>
          </div>
          <div className="space-y-1.5">
            {EXPENSE_CATEGORIES.filter(c => expenses.some(e => e.category === c.value)).slice(0, 3).map(cat => {
              const total = expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0)
              const color = CATEGORY_COLORS[cat.value] || CATEGORY_COLORS['Lainnya']
              return (
                <div key={cat.value} className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${color.bg} ${color.text}`}>
                    <CategoryIcon category={cat.value} className="w-3 h-3" /> {cat.value}
                  </span>
                  <span className="text-xs font-semibold text-zinc-800">{formatRupiah(total)}</span>
                </div>
              )
            })}
            {expenses.length === 0 && (
              <p className="text-xs text-zinc-400 py-1">Belum ada pengeluaran dicatat</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Input */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-zinc-900" />
              <p className="text-sm font-bold text-zinc-900">Form Pengeluaran Baru</p>
            </div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Input Kas Out</span>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Judul */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                <FileText className="w-3.5 h-3.5 text-zinc-400" /> Judul Pengeluaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="Contoh: Beli spidol whiteboard & penghapus..."
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                <Tag className="w-3.5 h-3.5 text-zinc-400" /> Pilih Kategori <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPENSE_CATEGORIES.map(cat => {
                  const isSelected = category === cat.value
                  const color = CATEGORY_COLORS[cat.value] || CATEGORY_COLORS['Lainnya']
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : `${color.bg} ${color.text} ${color.border} hover:opacity-80`
                      }`}
                    >
                      <CategoryIcon category={cat.value} className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} />
                      <span>{cat.value}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Nominal */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> Nominal (IDR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">Rp</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  min="100"
                  step="100"
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                />
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap pt-1">
                {[5000, 10000, 20000, 50000, 100000].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className="px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    +{v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulan & Tahun */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Month
                </label>
                <select
                  value={month}
                  onChange={e => setMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                >
                  {MONTHS.filter(m => year !== 2026 || m.value >= 8).map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Catatan */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                <FileText className="w-3.5 h-3.5 text-zinc-400" /> Catatan <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Rincian / tempat pembelian..."
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none placeholder:text-zinc-400"
              />
            </div>

            {/* Feedback */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-600 text-xs border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 text-emerald-600 text-xs border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Pengeluaran berhasil dicatat.</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm() }}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title || !category || !amount}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSubmitting ? 'Simpan...' : 'Simpan Pengeluaran'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Pengeluaran Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-900" />
            <p className="text-sm font-bold text-zinc-900">Daftar Pengeluaran</p>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{expenses.length} item</span>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <Receipt className="w-8 h-8 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500 font-medium">Belum ada pengeluaran</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {expenses.map((exp, idx) => {
              const color = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS['Lainnya']
              return (
                <div
                  key={exp.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors ${idx % 2 === 1 ? 'bg-zinc-50/40' : ''}`}
                >
                  {/* Category icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color.bg} border ${color.border}`}>
                    <CategoryIcon category={exp.category} className={`w-4 h-4 ${color.text}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 truncate">{exp.title}</p>
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-semibold ${color.bg} ${color.text}`}>
                        {exp.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-zinc-400">
                        {MONTHS.find(m => m.value === exp.month)?.label} {exp.year}
                      </p>
                      {exp.note && (
                        <p className="text-xs text-zinc-400 truncate">· {exp.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Amount + ALWAYS VISIBLE DELETE BUTTON */}
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-semibold text-zinc-900">
                      -{formatRupiah(exp.amount)}
                    </p>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id || isPending}
                      title="Hapus pengeluaran"
                      aria-label="Hapus pengeluaran"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all border border-zinc-200 hover:border-red-200 shrink-0 disabled:opacity-50"
                    >
                      {deletingId === exp.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {expenses.length > 0 && (
          <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Total Pengeluaran</span>
            <span className="text-sm font-bold text-zinc-900">{formatRupiah(totalPengeluaran)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
