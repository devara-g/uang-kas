import { createClient } from '@/utils/supabase/server'
import { Check, Clock, X, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import StatusCell from './StatusCell'
import ExportButton from './ExportButton'

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

const MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type MatrixCell = {
  totalPaid: number
  count: number
  firstDate?: string
  lastDate?: string
}

function getStudentStatus(cell: MatrixCell, isPastMonth: boolean) {
  if (!cell || cell.totalPaid === 0) {
    if (isPastMonth) return { status: 'nunggak', target: 20000, remaining: 20000 }
    return { status: 'belum_bayar', target: 10000, remaining: 10000 }
  }

  const firstDate = cell.firstDate ? new Date(cell.firstDate) : new Date()
  const lastDate = cell.lastDate ? new Date(cell.lastDate) : new Date()
  const durationDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
  const daysSinceFirst = (Date.now() - firstDate.getTime()) / (1000 * 3600 * 24)

  if (cell.count === 1 && cell.totalPaid === 10000) {
    return { status: 'lunas_sekaligus', target: 10000, remaining: 0 }
  }
  if (cell.totalPaid >= 10000 && durationDays <= 7) {
    return { status: 'lunas_cicilan', target: 10000, remaining: 0 }
  }
  if (cell.totalPaid >= 20000) {
    return { status: 'lunas_cicilan', target: 20000, remaining: 0 }
  }
  if (cell.totalPaid >= 15000 && !isPastMonth) {
    return { status: 'lunas_cicilan', target: 15000, remaining: 0 }
  }

  const target = isPastMonth ? 20000 : (daysSinceFirst <= 7 ? 10000 : 15000)
  return { status: 'mencicil', target, remaining: Math.max(0, target - cell.totalPaid) }
}

export default async function RecapPage(props: PageProps) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const year = searchParams?.year ? parseInt(searchParams.year as string) : currentYear
  const startMonth = year === 2026 ? 8 : 1
  let selectedMonth = searchParams?.month ? parseInt(searchParams.month as string) : currentMonth
  if (selectedMonth < startMonth) {
    selectedMonth = startMonth
  }

  const activeMonths = MONTHS.filter(m => m.value >= startMonth)

  const { data: students } = await supabase.from('students').select('*').order('name', { ascending: true })
  const { data: payments } = await supabase.from('payments').select('*').eq('year', year).order('created_at', { ascending: true })

  // Build full matrix
  const matrix: Record<string, Record<number, MatrixCell>> = {}
  students?.forEach(student => {
    matrix[student.id] = {}
    for (let m = 1; m <= 12; m++) {
      matrix[student.id][m] = { totalPaid: 0, count: 0 }
    }
  })

  payments?.forEach(payment => {
    if (matrix[payment.student_id]) {
      const cell = matrix[payment.student_id][payment.month]
      cell.totalPaid += payment.amount
      cell.count += 1
      const pDate = payment.created_at || payment.payment_date
      if (!cell.firstDate) cell.firstDate = pDate
      cell.lastDate = pDate
    }
  })

  // Summary for selected month
  let lunasCount = 0, cicilanCount = 0, belumBayarCount = 0
  let totalCollectedMonth = 0

  students?.forEach(s => {
    const cell = matrix[s.id]?.[selectedMonth]
    totalCollectedMonth += cell?.totalPaid || 0
    const isPastMonth = year < currentYear || (year === currentYear && selectedMonth < currentMonth)
    const { status } = getStudentStatus(cell || { totalPaid: 0, count: 0 }, isPastMonth)
    if (status === 'belum_bayar' || status === 'nunggak') belumBayarCount++
    else if (status === 'mencicil') cicilanCount++
    else lunasCount++
  })

  const totalStudents = students?.length || 0
  const lunasPercent = totalStudents > 0 ? Math.round((lunasCount / totalStudents) * 100) : 0

  // Build monthly data for export
  const monthlyData = activeMonths.map(m => {
    let totalCollected = 0
    const studentRecaps = (students || []).map(s => {
      const cell = matrix[s.id]?.[m.value] || { totalPaid: 0, count: 0 }
      const isPast = year < currentYear || (year === currentYear && m.value < currentMonth)
      const { status, target, remaining } = getStudentStatus(cell, isPast)
      totalCollected += cell.totalPaid
      return { name: s.name, totalPaid: cell.totalPaid, target, status, remaining }
    })
    return {
      month: m.value,
      monthLabel: MONTHS_FULL[m.value - 1],
      students: studentRecaps,
      totalCollected,
    }
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Rekap Kas Kelas</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {MONTHS_FULL[selectedMonth - 1]} {year} · {totalStudents} siswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton monthlyData={monthlyData} currentMonth={currentMonth} year={year} />

          {/* Year Switcher */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
            <Link
              href={`/admin/recap?year=${year - 1}&month=${selectedMonth}`}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="px-3 py-1.5 text-sm font-semibold text-zinc-900 border-x border-zinc-100">{year}</span>
            <Link
              href={`/admin/recap?year=${year + 1}&month=${selectedMonth}`}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Month Tabs — horizontal scroll on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {activeMonths.map(m => {
          const isSelected = m.value === selectedMonth
          const isCurrent = m.value === currentMonth && year === currentYear
          return (
            <Link
              key={m.value}
              href={`/admin/recap?year=${year}&month=${m.value}`}
              className={`relative shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap
                ${isSelected
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }
              `}
            >
              {m.label}
              {isCurrent && (
                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Lunas */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full opacity-80" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lunas</span>
            </div>
            <p className="text-3xl font-black text-zinc-900">{lunasCount}</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">{lunasPercent}% dari total</p>
          </div>
        </div>

        {/* Mencicil */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full opacity-80" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mencicil</span>
            </div>
            <p className="text-3xl font-black text-zinc-900">{cicilanCount}</p>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Dalam proses</p>
          </div>
        </div>

        {/* Belum Bayar */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full opacity-80" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Belum</span>
            </div>
            <p className="text-3xl font-black text-zinc-900">{belumBayarCount}</p>
            <p className="text-[10px] text-red-500 font-medium mt-1">Perlu ditagih</p>
          </div>
        </div>

        {/* Total */}
        <div className="bg-emerald-600 rounded-2xl p-4 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Terkumpul</span>
            </div>
            <p className="text-xl font-black text-white leading-tight">
              Rp {(totalCollectedMonth / 1000).toFixed(0)}k
            </p>
            <p className="text-[10px] text-emerald-200 font-medium mt-1">
              {MONTHS_FULL[selectedMonth - 1]} {year}
            </p>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-900">Matriks Pembayaran</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{MONTHS_FULL[selectedMonth - 1]} {year}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400">{totalStudents} siswa</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200">
                <th className="text-left px-2 py-2.5 sm:px-4 sm:py-3 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200 min-w-[90px] sm:min-w-[140px]">
                  Siswa
                </th>
                {activeMonths.map(m => (
                  <th
                    key={m.value}
                    className={`text-center px-0.5 py-2 sm:px-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-r border-zinc-100 last:border-0 min-w-[34px] sm:min-w-[52px] ${
                      m.value === selectedMonth ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'
                    }`}
                  >
                    {m.label}
                    {m.value === selectedMonth && (
                      <div className="w-1 h-1 bg-zinc-900 rounded-full mx-auto mt-0.5" />
                    )}
                  </th>
                ))}
                <th className="text-center px-1.5 py-2.5 sm:px-3 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border-l border-emerald-200 sticky right-0 z-10 min-w-[60px] sm:min-w-[90px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student, idx) => {
                const totalAllMonths = activeMonths.reduce((sum, m) => {
                  return sum + (matrix[student.id]?.[m.value]?.totalPaid || 0)
                }, 0)
                return (
                  <tr
                    key={student.id}
                    className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-50/30'}`}
                  >
                    <td className="px-2 py-1 sm:px-4 sm:py-1.5 sticky left-0 z-10 border-r border-zinc-200 bg-white">
                      <span className="font-semibold text-xs sm:text-sm text-zinc-800 truncate max-w-[85px] sm:max-w-[120px] block">
                        {student.name}
                      </span>
                    </td>
                    {activeMonths.map(m => {
                      const cell = matrix[student.id]?.[m.value]
                      const isPast = year < currentYear || (year === currentYear && m.value < currentMonth)
                      return (
                        <td
                          key={m.value}
                          className={`border-r border-zinc-100 last:border-0 text-center align-middle p-0 ${
                            m.value === selectedMonth ? 'bg-zinc-50/60' : ''
                          }`}
                        >
                          <StatusCell
                            totalPaid={cell?.totalPaid || 0}
                            count={cell?.count || 0}
                            monthLabel={`${m.label} ${year}`}
                            studentName={student.name}
                            firstPaymentDate={cell?.firstDate}
                            lastPaymentDate={cell?.lastDate}
                            isPastMonth={isPast}
                          />
                        </td>
                      )
                    })}
                    <td className="px-1.5 py-1 sm:px-3 sm:py-1.5 text-center border-l border-emerald-200 bg-emerald-50/30 sticky right-0 z-10">
                      <span className={`text-[10px] sm:text-xs font-bold ${totalAllMonths > 0 ? 'text-emerald-700' : 'text-zinc-300'}`}>
                        {totalAllMonths > 0 ? `Rp ${(totalAllMonths / 1000).toFixed(0)}k` : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {/* Footer total row */}
              {students && students.length > 0 && (
                <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                  <td className="px-2 py-2.5 sm:px-4 sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200">
                    <span className="text-[10px] sm:text-xs font-black text-zinc-600 uppercase tracking-wider">Total</span>
                  </td>
                  {activeMonths.map(m => {
                    const monthTotal = students.reduce((sum, s) => {
                      return sum + (matrix[s.id]?.[m.value]?.totalPaid || 0)
                    }, 0)
                    return (
                      <td
                        key={m.value}
                        className={`border-r border-zinc-100 text-center py-2 px-0.5 ${
                          m.value === selectedMonth ? 'bg-zinc-100' : ''
                        }`}
                      >
                        <span className={`text-[9px] sm:text-[10px] font-bold ${monthTotal > 0 ? 'text-zinc-600' : 'text-zinc-300'}`}>
                          {monthTotal > 0 ? `${(monthTotal / 1000).toFixed(0)}k` : '—'}
                        </span>
                      </td>
                    )
                  })}
                  <td className="px-1.5 py-2 sm:px-3 text-center border-l border-emerald-200 bg-emerald-50 sticky right-0 z-10">
                    <span className="text-[10px] sm:text-xs font-black text-emerald-700">
                      {(payments?.reduce((sum, p) => sum + p.amount, 0) || 0) > 0
                        ? `Rp ${((payments?.reduce((sum, p) => sum + p.amount, 0) || 0) / 1000).toFixed(0)}k`
                        : '—'
                      }
                    </span>
                  </td>
                </tr>
              )}

              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-sm text-zinc-400">
                    Belum ada data siswa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-emerald-100 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="font-medium">Lunas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-100 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
          </div>
          <span className="font-medium">Mencicil</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-zinc-100 border border-zinc-200">
            <X className="w-3 h-3 text-zinc-400" />
          </div>
          <span className="font-medium">Belum Bayar</span>
        </div>
        <div className="flex items-center gap-1.5 ml-1 text-zinc-400">
          <span>· Tap sel untuk detail</span>
        </div>
      </div>
    </div>
  )
}
