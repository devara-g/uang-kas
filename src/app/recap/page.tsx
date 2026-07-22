import { createClient } from '@/utils/supabase/server'
import { Check, Clock, X, ChevronLeft, ChevronRight, Wallet, QrCode, Lock } from 'lucide-react'
import Link from 'next/link'
import StatusCell from '../admin/recap/StatusCell'
import ExportButton from '../admin/recap/ExportButton'

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

export default async function PublicRecapPage(props: PageProps) {
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

  // Summary untuk bulan yang dipilih
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Publik */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-semibold shadow-xs">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 tracking-tight text-sm sm:text-base block">Kas Kelas</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 hidden xs:block -mt-1">Rekap Transparan Member</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/admin/qris"
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content Body */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 flex-1">
        {/* Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Rekap Kas Anggota Class</h1>
            <p className="text-xs sm:text-sm text-zinc-500">Transparansi pembayaran uang kas siswa tahun {year}.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export */}
            <ExportButton
              monthlyData={monthlyData}
              currentMonth={currentMonth}
              year={year}
            />

            {/* Year Switcher */}
            <div className="flex items-center bg-white border border-zinc-200 rounded-md p-0.5 sm:p-1 shadow-xs">
              <Link
                href={`/recap?year=${year - 1}&month=${selectedMonth}`}
                className="p-1 sm:p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <div className="px-2.5 sm:px-4 py-0.5 text-xs sm:text-sm font-medium text-zinc-900">
                {year}
              </div>
              <Link
                href={`/recap?year=${year + 1}&month=${selectedMonth}`}
                className="p-1 sm:p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Month Switcher */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {activeMonths.map(m => (
            <Link
              key={m.value}
              href={`/recap?year=${year}&month=${m.value}`}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors ${
                m.value === selectedMonth
                  ? 'bg-zinc-900 text-white shadow-xs'
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

        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-xs text-amber-800 space-y-1">
          <p className="font-semibold text-amber-900">💡 Aturan Pembayaran Uang Kas:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700">
            <li>Bayar LUNAS sekaligus dalam 1 transaksi di bulan berjalan: <b>Rp 10.000</b>.</li>
            <li>Jika dicicil dan lunas dalam waktu <b>≤ 1 minggu (7 hari)</b> sejak cicilan pertama: Total bayar <b>Rp 10.000</b>.</li>
            <li>Jika cicilan melebihi <b>1 minggu</b> pada bulan berjalan: Total bayar menjadi <b>Rp 15.000</b>.</li>
            <li>Jika <b>nunggak (lewat bulan belum bayar)</b>: Tagihan menjadi <b>Rp 20.000</b>.</li>
            {year === 2026 && <li><i>Catatan: Kas tahun 2026 dimulai dari bulan Agustus.</i></li>}
          </ul>
        </div>

        {/* Summary bulan yang dipilih */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-zinc-200 shadow-xs flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h3 className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Lunas</h3>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-zinc-900">{lunasCount}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-zinc-200 shadow-xs flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 text-amber-600">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h3 className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Mencicil</h3>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-zinc-900">{cicilanCount}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-zinc-200 shadow-xs flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 text-red-600">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h3 className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Belum Bayar</h3>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-zinc-900">{belumBayarCount}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200 shadow-xs flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <h3 className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Total Terkumpul</h3>
            </div>
            <p className="text-lg sm:text-xl font-bold text-emerald-900">
              Rp {totalCollectedMonth.toLocaleString('id-ID')}
            </p>
            <p className="text-[9px] sm:text-[10px] text-emerald-600">
              {MONTHS_FULL[selectedMonth - 1]} {year}
            </p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-lg shadow-xs border border-zinc-200 overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold text-zinc-900">
              Detail per Bulan — {MONTHS_FULL[selectedMonth - 1]} {year}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500">{students?.length || 0} siswa</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-2 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200 min-w-[90px] sm:min-w-[140px]">
                    Nama Siswa
                  </th>
                  {activeMonths.map(m => (
                    <th
                      key={m.value}
                      className={`text-center px-0.5 py-1.5 sm:px-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-r border-zinc-100 last:border-0 min-w-[34px] sm:min-w-[52px] ${
                        m.value === selectedMonth ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500'
                      }`}
                    >
                      {m.label}
                      {m.value === selectedMonth && (
                        <div className="w-1 h-1 bg-zinc-900 rounded-full mx-auto mt-0.5" />
                      )}
                    </th>
                  ))}
                  <th className="text-center px-1.5 py-1.5 sm:px-3 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border-l border-emerald-200 min-w-[68px] sm:min-w-[100px]">
                    Total
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
                      <td className="px-2 py-1.5 sm:px-4 sm:py-2 sticky left-0 z-10 border-r border-zinc-200 bg-white">
                        <span className="font-medium text-xs sm:text-sm text-zinc-900 truncate max-w-[85px] sm:max-w-[120px] block">
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
                      <td className="px-1.5 py-1.5 sm:px-3 sm:py-2 text-center border-l border-emerald-200 bg-emerald-50/30">
                        <span className={`text-[11px] sm:text-xs font-semibold ${totalAllMonths > 0 ? 'text-emerald-700' : 'text-zinc-400'}`}>
                          {totalAllMonths > 0 ? `Rp ${(totalAllMonths / 1000).toFixed(0)}k` : '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {/* Footer total row */}
                {students && students.length > 0 && (
                  <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                    <td className="px-2 py-2 sm:px-4 sm:py-2.5 sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200">
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-700 uppercase tracking-wider">Total</span>
                    </td>
                    {activeMonths.map(m => {
                      const monthTotal = students.reduce((sum, s) => {
                        return sum + (matrix[s.id]?.[m.value]?.totalPaid || 0)
                      }, 0)
                      return (
                        <td
                          key={m.value}
                          className={`border-r border-zinc-100 text-center py-1.5 sm:py-2.5 px-0.5 ${
                            m.value === selectedMonth ? 'bg-zinc-100' : ''
                          }`}
                        >
                          <span className={`text-[9px] sm:text-[10px] font-semibold ${monthTotal > 0 ? 'text-zinc-700' : 'text-zinc-300'}`}>
                            {monthTotal > 0 ? `${(monthTotal / 1000).toFixed(0)}k` : '—'}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-center border-l border-emerald-200 bg-emerald-50">
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-800">
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
      </main>
    </div>
  )
}
