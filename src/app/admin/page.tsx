import { createClient } from '@/utils/supabase/server'
import { Users, CreditCard, Clock, CheckCircle2, Calendar } from 'lucide-react'
import IncomeLineChart from './IncomeLineChart'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  // Parallel fetch untuk performa lebih cepat
  const [{ data: students }, { data: payments }] = await Promise.all([
    supabase.from('students').select('*'),
    supabase.from('payments').select('*').eq('year', currentYear),
  ])

  const totalStudents = students?.length || 0
  const currentMonth = new Date().getMonth() + 1
  // Sistem mulai Agustus 2026 — kalau masih sebelum itu, gunakan bulan 8 sebagai acuan
  const startMonth = currentYear === 2026 ? 8 : 1
  const activeMonth = currentYear === 2026 ? Math.max(currentMonth, startMonth) : currentMonth
  const isBeforeStart = currentYear === 2026 && currentMonth < startMonth
  let totalLunasBulanIni = 0
  let totalUangMasukBulanIni = 0

  // Hitung status bulan ini per siswa
  const paymentStatus: Record<string, { totalPaid: number, count: number }> = {}

  payments?.forEach(p => {
    if (p.month === activeMonth) {
      if (!paymentStatus[p.student_id]) {
        paymentStatus[p.student_id] = { totalPaid: 0, count: 0 }
      }
      paymentStatus[p.student_id].totalPaid += p.amount
      paymentStatus[p.student_id].count += 1
      totalUangMasukBulanIni += p.amount
    }
  })

  // Hitung yang sudah lunas (10k lunas, atau cicil 15k lunas)
  Object.values(paymentStatus).forEach(status => {
    if ((status.count === 1 && status.totalPaid === 10000) || status.totalPaid >= 15000) {
      totalLunasBulanIni++
    }
  })

  // Data grafik bulanan (2026: Agustus - Desember; Tahun lain: Jan - Des)
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const monthlyData = []

  for (let m = startMonth; m <= 12; m++) {
    let totalMasuk = 0
    payments?.filter(p => p.month === m).forEach(p => {
      totalMasuk += p.amount
    })
    monthlyData.push({ month: m, name: MONTHS_SHORT[m - 1], total: totalMasuk })
  }


  return (
    <div className="space-y-6">
      {isBeforeStart && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          <Calendar className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p>Sistem kas mulai aktif <strong>Agustus {currentYear}</strong>. Data pembayaran akan muncul setelah periode dimulai.</p>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-sm text-zinc-500">Monitor your classroom finances for {currentYear}.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Total Siswa</h3>
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <CreditCard className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Pemasukan Bulan Ini</h3>
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">Rp {totalUangMasukBulanIni.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Lunas Bulan Ini</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-semibold text-zinc-900">{totalLunasBulanIni}</p>
            <p className="text-sm text-zinc-500 mb-1">/ {totalStudents} siswa</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Belum Lunas</h3>
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">{totalStudents - totalLunasBulanIni}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart Component */}
        <div className="lg:col-span-2">
          <IncomeLineChart data={monthlyData} year={currentYear} />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">Transaksi Terbaru</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            {payments && payments.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 7).map(payment => {
                  const studentName = students?.find(s => s.id === payment.student_id)?.name || 'Unknown'
                  return (
                    <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{studentName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Bulan ke-{payment.month}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900">
                          +Rp {payment.amount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <CreditCard className="w-8 h-8 text-zinc-300 mb-3" />
                <p className="text-sm text-zinc-500">Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
