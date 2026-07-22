import { createClient } from '@/utils/supabase/server'
import { Check, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import StatusCell from './StatusCell'

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

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type MatrixCell = {
  totalPaid: number
  count: number
  firstDate?: string
  lastDate?: string
}

export default async function RecapPage(props: PageProps) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const currentYear = new Date().getFullYear()
  const year = searchParams?.year ? parseInt(searchParams.year as string) : currentYear

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

  // Summary counts untuk bulan berjalan
  const currentMonth = new Date().getMonth() + 1
  let lunasCount = 0, cicilanCount = 0, belumBayarCount = 0

  students?.forEach(s => {
    const d = matrix[s.id]?.[currentMonth]
    if (!d || d.totalPaid === 0) {
      belumBayarCount++
    } else {
      const firstD = d.firstDate ? new Date(d.firstDate) : new Date()
      const lastD = d.lastDate ? new Date(d.lastDate) : new Date()
      const durationDays = (lastD.getTime() - firstD.getTime()) / (1000 * 3600 * 24)
      const daysSinceFirst = (Date.now() - firstD.getTime()) / (1000 * 3600 * 24)

      if ((d.count === 1 && d.totalPaid === 10000) || (d.totalPaid >= 10000 && durationDays <= 7) || d.totalPaid >= 15000) {
        lunasCount++
      } else {
        cicilanCount++
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Rekap Kas Kelas</h1>
          <p className="text-sm text-zinc-500">Matriks pembayaran kas siswa tahun {year}.</p>
        </div>

        {/* Year Switcher */}
        <div className="flex items-center bg-white border border-zinc-200 rounded-md p-1 shadow-sm">
          <Link
            href={`/admin/recap?year=${year - 1}`}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="px-4 py-1 text-sm font-medium text-zinc-900">
            {year}
          </div>
          <Link
            href={`/admin/recap?year=${year + 1}`}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary bulan ini */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <Check className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Lunas Bln Ini</h3>
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
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky left-0 z-10 bg-zinc-50 border-r border-zinc-200" style={{ minWidth: 140 }}>
                  Nama Siswa
                </th>
                {MONTHS.map(m => (
                  <th
                    key={m.value}
                    className={`text-center px-2 py-3 text-xs font-semibold uppercase tracking-wider border-r border-zinc-100 last:border-0 ${
                      m.value === currentMonth ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-500'
                    }`}
                    style={{ minWidth: 52 }}
                  >
                    {m.label}
                    {m.value === currentMonth && (
                      <div className="w-1 h-1 bg-zinc-900 rounded-full mx-auto mt-1" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students?.map((student) => (
                <tr key={student.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td
                    className="px-4 py-2 sticky left-0 z-10 border-r border-zinc-200 bg-white group-hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-zinc-900 truncate max-w-[120px]">{student.name}</span>
                    </div>
                  </td>
                  {MONTHS.map(m => {
                    const cell = matrix[student.id]?.[m.value]
                    return (
                      <td
                        key={m.value}
                        className={`border-r border-zinc-100 last:border-0 text-center align-middle p-0 ${
                          m.value === currentMonth ? 'bg-zinc-50/50' : ''
                        }`}
                      >
                        <StatusCell 
                          totalPaid={cell?.totalPaid || 0} 
                          count={cell?.count || 0} 
                          monthLabel={`${m.label} ${year}`}
                          studentName={student.name}
                          firstPaymentDate={cell?.firstDate}
                          lastPaymentDate={cell?.lastDate}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={13} className="px-6 py-10 text-center text-sm text-zinc-500">
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
