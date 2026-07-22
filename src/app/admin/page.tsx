import { createClient } from '@/utils/supabase/server'
import { Users, CreditCard, Clock, CheckCircle2 } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Ambil data siswa
  const { data: students } = await supabase.from('students').select('*')
  const totalStudents = students?.length || 0

  // Ambil data pembayaran tahun ini
  const currentYear = new Date().getFullYear()
  const { data: payments } = await supabase.from('payments').select('*').eq('year', currentYear)

  const currentMonth = new Date().getMonth() + 1
  let totalLunasBulanIni = 0
  let totalUangMasukBulanIni = 0

  // Hitung status bulan ini per siswa
  const paymentStatus: Record<string, { totalPaid: number, count: number }> = {}
  
  payments?.forEach(p => {
    if (p.month === currentMonth) {
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

  // Data grafik bulanan (6 bulan terakhir)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i
    let y = currentYear
    if (m <= 0) {
      m += 12
      y -= 1
    }
    const monthName = new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' })
    let totalMasuk = 0
    // Karena kita cuma ambil payments tahun ini, grafik mungkin tidak akurat kalau nyebrang tahun,
    // tapi demi kesederhanaan kita filter dari `payments` saja (asumsi tahun ini).
    payments?.filter(p => p.month === m).forEach(p => {
      totalMasuk += p.amount
    })
    
    monthlyData.push({ name: monthName, total: totalMasuk })
  }
  
  const maxAmount = Math.max(...monthlyData.map(d => d.total), 100000)

  return (
    <div className="space-y-6">
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
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">Pemasukan 6 Bulan Terakhir</h2>
          </div>
          <div className="p-5 h-[300px] flex items-end gap-2 pb-8">
            {monthlyData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex items-end justify-center h-[200px]">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-xs py-1 px-2 rounded font-medium pointer-events-none whitespace-nowrap z-10">
                    Rp {data.total.toLocaleString('id-ID')}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[40px] bg-zinc-900 rounded-t-sm transition-all duration-500 group-hover:bg-zinc-700"
                    style={{ height: `${Math.max((data.total / maxAmount) * 100, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-500">{data.name}</span>
              </div>
            ))}
          </div>
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
