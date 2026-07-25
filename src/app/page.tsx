import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { 
  ChevronRight,
  Receipt
} from 'lucide-react'

const MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

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

  return { status: 'mencicil', target: 10000, remaining: Math.max(0, 10000 - cell.totalPaid) }
}

export default async function Home() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Fetch real data from Supabase
  const { data: students } = await supabase.from('students').select('*').order('name', { ascending: true })
  const { data: payments } = await supabase.from('payments').select('*, students(name)').order('created_at', { ascending: false })

  const studentList = students || []
  const paymentList = payments || []

  // Compute status matrix for current month
  const matrix: Record<string, MatrixCell> = {}
  studentList.forEach(student => {
    matrix[student.id] = { totalPaid: 0, count: 0 }
  })

  let totalCollectedMonth = 0
  let totalCollectedYear = 0

  paymentList.forEach(payment => {
    if (payment.year === currentYear) {
      totalCollectedYear += payment.amount
      if (payment.month === currentMonth && matrix[payment.student_id]) {
        const cell = matrix[payment.student_id]
        cell.totalPaid += payment.amount
        cell.count += 1
        const pDate = payment.created_at || payment.payment_date
        if (!cell.firstDate) cell.firstDate = pDate
        cell.lastDate = pDate
      }
    }
  })

  let lunasCount = 0
  let cicilanCount = 0
  let belumBayarCount = 0

  studentList.forEach(s => {
    const cell = matrix[s.id] || { totalPaid: 0, count: 0 }
    totalCollectedMonth += cell.totalPaid
    const { status } = getStudentStatus(cell, false)
    if (status === 'belum_bayar' || status === 'nunggak') belumBayarCount++
    else if (status === 'mencicil') cicilanCount++
    else lunasCount++
  })

  // Top 3 recent payments
  const recentPayments = paymentList.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/KELAS_XI_PPLG_1_20260724_182044.jpg"
              alt="PPLG 1"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            <div>
              <span className="font-bold text-zinc-900 text-sm block">Kas Kelas</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/recap"
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              Rekap Kas
            </Link>

            <Link
              href="/admin/qris"
              className="hidden xs:block px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              QRIS
            </Link>

            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Login Bendahara
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4 pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Rekap Uang Kas Kelas
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto">
            Pantau status pembayaran kas siswa dan unduh laporan kas kelas.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href="/recap"
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-md text-xs transition-colors"
            >
              Lihat Rekap Kas
            </Link>

            <Link
              href="/admin/qris"
              className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium py-2 px-4 rounded-md text-xs transition-colors"
            >
              QRIS Pembayaran
            </Link>

            <Link
              href="/login"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium py-2 px-4 rounded-md text-xs transition-colors"
            >
              Login Bendahara
            </Link>
          </div>
        </section>

        {/* DASHBOARD SUMMARY PREVIEW */}
        <section>
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">Ringkasan Kas Bulan Ini</span>
              <span className="text-xs text-zinc-500 font-medium">
                {MONTHS_FULL[currentMonth - 1]} {currentYear}
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-zinc-200">
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/80">
                <span className="text-xs font-medium text-zinc-500 block">Lunas</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-zinc-900">{lunasCount}</span>
                  <span className="text-xs text-emerald-600 font-medium">dari {studentList.length} siswa</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/80">
                <span className="text-xs font-medium text-zinc-500 block">Mencicil</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold text-zinc-900">{cicilanCount}</span>
                  <span className="text-xs text-amber-600 font-medium">siswa</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/80">
                <span className="text-xs font-medium text-emerald-700 block">Terkumpul</span>
                <div className="mt-0.5">
                  <span className="text-lg font-bold text-emerald-900">
                    Rp {totalCollectedMonth.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Transaksi Terakhir</span>
                <Link href="/recap" className="text-zinc-900 hover:underline flex items-center gap-0.5 font-medium">
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentPayments.length > 0 ? (
                <div className="border border-zinc-200 rounded-lg overflow-hidden text-xs divide-y divide-zinc-100">
                  {recentPayments.map((payment) => {
                    const studentName = payment.students?.name || 'Siswa'
                    const pDate = payment.created_at || payment.payment_date
                    const dateFormatted = pDate 
                      ? new Date(pDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                      : ''

                    return (
                      <div key={payment.id} className="px-3.5 py-2 flex items-center justify-between bg-white">
                        <div>
                          <span className="font-medium text-zinc-900 block">{studentName}</span>
                          <span className="text-[10px] text-zinc-400">
                            Bulan {MONTHS_FULL[payment.month - 1]} {payment.year} {dateFormatted && `• ${dateFormatted}`}
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-700 text-xs">
                          +Rp {payment.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
                  Belum ada transaksi pembayaran
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ATURAN PEMBAYARAN */}
        <section className="space-y-3">
          <div className="border-b border-zinc-200 pb-2">
            <h2 className="text-base font-bold text-zinc-900">Ketentuan Tagihan Kas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 space-y-1">
              <div className="text-xs font-semibold text-emerald-700">Lunas Sekaligus</div>
              <div className="text-lg font-bold text-zinc-900">Rp 10.000</div>
              <p className="text-[11px] text-zinc-500">1x bayar pada bulan berjalan.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 space-y-1">
              <div className="text-xs font-semibold text-emerald-700">Cicilan ≤ 7 Hari</div>
              <div className="text-lg font-bold text-zinc-900">Rp 10.000</div>
              <p className="text-[11px] text-zinc-500">Lunas maksimal 7 hari dari cicilan awal.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 space-y-1">
              <div className="text-xs font-semibold text-amber-700">Cicilan &gt; 7 Hari</div>
              <div className="text-lg font-bold text-zinc-900">Rp 15.000</div>
              <p className="text-[11px] text-zinc-500">Lunas lebih dari 7 hari di bulan berjalan.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 space-y-1">
              <div className="text-xs font-semibold text-red-700">Nunggak</div>
              <div className="text-lg font-bold text-zinc-900">Rp 20.000</div>
              <p className="text-[11px] text-zinc-500">Lewat bulan dan belum dibayar.</p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white py-5 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">Kas Kelas</span>
            <span>— Rekap Uang Kas</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/recap" className="hover:text-zinc-900 transition-colors">
              Rekap
            </Link>
            <Link href="/admin/qris" className="hover:text-zinc-900 transition-colors">
              QRIS
            </Link>
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Login Bendahara
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
