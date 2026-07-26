import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { 
  Eye, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  FileSpreadsheet, 
  ShieldCheck, 
  ChevronRight,
  BarChart3,
  Receipt,
  Sparkles
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/KELAS_XI_PPLG_1_20260724_182044.jpg"
              alt="PPLG 1 AREA"
              width={36}
              height={36}
              className="rounded-lg object-cover"
            />
            <div>
              <span className="font-semibold text-zinc-900 tracking-tight text-base block">KasKelas</span>
              <span className="text-[11px] text-zinc-500 block -mt-1 font-normal">PPLG 1 • Transparansi Kas</span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/recap"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-md transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rekap Kas</span>
            </Link>

            <Link
              href="/admin/qris"
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-md transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-600" />
              <span>QRIS</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Bendahara</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sistem Transparansi Uang Kas PPLG 1</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
              Rekapitulasi & Pengelolaan Uang Kas Kelas
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Pantau status pembayaran siswa secara transparan, akses matriks per bulan, dan unduh laporan kas kelas kapan saja tanpa perlu login.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/recap"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-5 rounded-lg shadow-xs transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Buka Rekap Kas Publik</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>

            <Link
              href="/admin/qris"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              <QrCode className="w-4 h-4 text-zinc-600" />
              <span>QRIS Pembayaran</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-medium py-2.5 px-5 rounded-lg transition-colors text-sm"
            >
              <Lock className="w-4 h-4 text-zinc-500" />
              <span>Login Bendahara</span>
            </Link>
          </div>
        </section>

        {/* DASHBOARD SUMMARY PREVIEW */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-700" />
                <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Ringkasan Bulan Ini</span>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                {MONTHS_FULL[currentMonth - 1]} {currentYear}
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-zinc-200">
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200/80">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Siswa Lunas</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-zinc-900">{lunasCount}</span>
                  <span className="text-xs text-emerald-600 font-medium">dari {studentList.length} siswa</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200/80">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Siswa Mencicil</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-zinc-900">{cicilanCount}</span>
                  <span className="text-xs text-amber-600 font-medium">siswa</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200/80">
                <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider block">Terkumpul Bulan Ini</span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-emerald-900">
                    Rp {totalCollectedMonth.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                <span>Catatan Transaksi Pembayaran Terakhir</span>
                <Link href="/recap" className="text-zinc-900 hover:underline flex items-center gap-1 font-semibold">
                  Buka Rekap Lengkap <ChevronRight className="w-3.5 h-3.5" />
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
                      <div key={payment.id} className="px-4 py-2.5 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2.5">
                          <Receipt className="w-4 h-4 text-zinc-400 shrink-0" />
                          <div>
                            <span className="font-medium text-zinc-900 block">{studentName}</span>
                            <span className="text-[10px] text-zinc-400">
                              Bulan {MONTHS_FULL[payment.month - 1]} {payment.year} {dateFormatted && `• ${dateFormatted}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          +Rp {payment.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
                  Belum ada transaksi pembayaran terbaru
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ATURAN PEMBAYARAN */}
        <section className="max-w-4xl mx-auto space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-lg font-bold text-zinc-900">Ketentuan Tagihan Uang Kas</h2>
            <p className="text-xs text-zinc-500">Perhitungan nominal pembayaran otomatis berdasarkan waktu pelunasan.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lunas Sekaligus</span>
              </div>
              <div className="text-xl font-bold text-zinc-900">Rp 10.000</div>
              <p className="text-xs text-zinc-500 leading-relaxed">Dibayar lunas dalam 1x transaksi pada bulan berjalan.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Cicilan ≤ 7 Hari</span>
              </div>
              <div className="text-xl font-bold text-zinc-900">Rp 10.000</div>
              <p className="text-xs text-zinc-500 leading-relaxed">Lunas dicicil dalam waktu maksimal 7 hari dari pembayaran awal.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Cicilan &gt; 7 Hari</span>
              </div>
              <div className="text-xl font-bold text-zinc-900">Rp 15.000</div>
              <p className="text-xs text-zinc-500 leading-relaxed">Total tagihan menjadi Rp 15.000 jika cicilan melebihi 7 hari.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Nunggak</span>
              </div>
              <div className="text-xl font-bold text-zinc-900">Rp 20.000</div>
              <p className="text-xs text-zinc-500 leading-relaxed">Tagihan untuk bulan yang sudah berlalu dan belum dilunasi.</p>
            </div>
          </div>
        </section>

        {/* INFORMASI PLATFORM */}
        <section className="max-w-4xl mx-auto space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-lg font-bold text-zinc-900">Fitur & Keunggulan Platform</h2>
            <p className="text-xs text-zinc-500">Memudahkan seluruh siswa dan bendahara dalam mengelola keuangan kelas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 mb-3">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Rekapitulasi Transparan</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Matriks pembayaran seluruh siswa per bulan yang dapat diakses publik kapan saja tanpa perlu login.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 mb-3">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Ekspor Laporan Excel</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Fitur unduh laporan keuangan kas lengkap format Microsoft Excel (.xlsx) per bulan maupun per tahun.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">QRIS & Portal Bendahara</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Kemudahan pembayaran via barcode QRIS serta dashboard terproteksi untuk pencatatan kas & pengeluaran.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Image
              src="/KELAS_XI_PPLG_1_20260724_182044.jpg"
              alt="PPLG 1 AREA"
              width={20}
              height={20}
              className="rounded object-cover"
            />
            <span className="font-semibold text-zinc-900">KasKelas</span>
            <span>— Rekap Uang Kas PPLG 1</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/recap" className="hover:text-zinc-900 transition-colors">
              Rekap Publik
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
