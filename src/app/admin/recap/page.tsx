import { createClient } from '@/utils/supabase/server'
import { Check, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'
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

  // Build full matrix (all months)
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

  // Summary counts untuk bulan yang dipilih
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

  // Build monthly data for export
  const monthlyData = activeMonths.map(m => {
    let totalCollected = 0
    const studentRecaps = (students || []).map(s => {
      const cell = matrix[s.id]?.[m.value] || { totalPaid: 0, count: 0 }
      const isPast = year < currentYear || (year === currentYear && m.value < currentMonth)
      const { status, target, remaining } = getStudentStatus(cell, isPast)
      totalCollected += cell.totalPaid
      return {
        name: s.name,
        totalPaid: cell.totalPaid,
        target,
        status,
        remaining,
      }
    })
    return {
      month: m.value,
      monthLabel: MONTHS_FULL[m.value - 1],
      students: studentRecaps,
      totalCollected,
    }
  })

  const selectedMonthData = monthlyData.find(m => m.month === selectedMonth)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Rekap Kas Kelas</h1>
          <p className="text-sm text-zinc-500">
            Matriks pembayaran kas siswa tahun {year}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Button */}
          <ExportButton
            monthlyData={monthlyData}
            currentMonth={currentMonth}
            year={year}
          />

          {/* Year Switcher */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-md p-1 shadow-sm">
            <Link
              href={`/admin/recap?year=${year - 1}&month=${selectedMonth}`}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="px-4 py-1 text-sm font-medium text-zinc-900">
              {year}
            </div>
            <Link
              href={`/admin/recap?year=${year + 1}&month=${selectedMonth}`}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Month Switcher */}
      <div className="flex flex-wrap gap-1.5">
        {activeMonths.map(m => (
          <Link
            key={m.value}
            href={`/admin/recap?year=${year}&month=${m.value}`}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              m.value === selectedMonth
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            {m.label}
            {m.value === currentMonth && year === currentYear && (
              <span className="ml-1 w-1 h-1 bg-current rounded-full inline-block mb-0.5" />
            )}
          </Link>
        ))}
      </div>

      {/* Summary bulan yang dipilih */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <Check className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Lunas</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">{lunasCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Mencicil</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">{cicilanCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-600">
            <X className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Belum Bayar</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">{belumBayarCount}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <h3 className="text-xs font-medium uppercase tracking-wider">Total Terkumpul</h3>
          </div>
          <p className="text-xl font-bold text-emerald-900">
            Rp {totalCollectedMonth.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-emerald-600">
            {MONTHS_FULL[selectedMonth - 1]} {year}
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900">
            Detail per Bulan — {MONTHS_FULL[selectedMonth - 1]} {year}
          </p>
          <p className="text-xs text-zinc-500">
            {students?.length || 0} siswa
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200" style={{ minWidth: 140 }}>
                  Nama Siswa
                </th>
                {activeMonths.map(m => (
                  <th
                    key={m.value}
                    className={`text-center px-2 py-3 text-xs font-semibold uppercase tracking-wider border-r border-zinc-100 last:border-0 ${
                      m.value === selectedMonth ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500'
                    }`}
                    style={{ minWidth: 52 }}
                  >
                    {m.label}
                    {m.value === selectedMonth && (
                      <div className="w-1 h-1 bg-zinc-900 rounded-full mx-auto mt-1" />
                    )}
                  </th>
                ))}
                {/* Total column */}
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border-l border-emerald-200 sticky right-0 z-10" style={{ minWidth: 100 }}>
                  Total Terbayar
                </th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student) => {
                const totalAllMonths = activeMonths.reduce((sum, m) => {
                  return sum + (matrix[student.id]?.[m.value]?.totalPaid || 0)
                }, 0)
                return (
                  <tr key={student.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                    <td
                      className="px-4 py-2 sticky left-0 z-10 border-r border-zinc-200 bg-white group-hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-zinc-900 truncate max-w-[120px]">{student.name}</span>
                      </div>
                    </td>
                    {activeMonths.map(m => {
                      const cell = matrix[student.id]?.[m.value]
                      const isPast = year < currentYear || (year === currentYear && m.value < currentMonth)
                      return (
                        <td
                          key={m.value}
                          className={`border-r border-zinc-100 last:border-0 text-center align-middle p-0 ${
                            m.value === selectedMonth ? 'bg-zinc-50/50' : ''
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
                    {/* Total per student */}
                    <td className="px-3 py-2 text-center border-l border-emerald-200 bg-emerald-50/30 sticky right-0 z-10">
                      <span className={`text-xs font-semibold ${totalAllMonths > 0 ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        {totalAllMonths > 0 ? `Rp ${totalAllMonths.toLocaleString('id-ID')}` : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {/* Footer total row */}
              {students && students.length > 0 && (
                <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                  <td className="px-4 py-2.5 sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Total / Bulan</span>
                  </td>
                  {activeMonths.map(m => {
                    const monthTotal = students.reduce((sum, s) => {
                      return sum + (matrix[s.id]?.[m.value]?.totalPaid || 0)
                    }, 0)
                    return (
                      <td
                        key={m.value}
                        className={`border-r border-zinc-100 text-center py-2.5 px-1 ${
                          m.value === selectedMonth ? 'bg-zinc-100' : ''
                        }`}
                      >
                        <span className={`text-[10px] font-semibold ${monthTotal > 0 ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          {monthTotal > 0 ? `${(monthTotal / 1000).toFixed(0)}k` : '—'}
                        </span>
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5 text-center border-l border-emerald-200 bg-emerald-50 sticky right-0 z-10">
                    <span className="text-xs font-bold text-emerald-800">
                      Rp {(payments?.reduce((sum, p) => sum + p.amount, 0) || 0).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              )}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={14} className="px-6 py-10 text-center text-sm text-zinc-500">
                    Belum ada data siswa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded flex items-center justify-center bg-emerald-50 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
          </div>
          <span>Lunas (10k ≤ 1 mgg / 15k &gt; 1 mgg)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-50 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
          </div>
          <span>Mencicil</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded flex items-center justify-center bg-zinc-100 border border-zinc-200">
            <X className="w-3 h-3 text-zinc-400" />
          </div>
          <span>Belum Bayar</span>
        </div>
      </div>
    </div>
  )
}
