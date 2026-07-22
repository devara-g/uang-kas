import { createClient } from '@/utils/supabase/server'
import PaymentForm from './PaymentForm'
import PaymentList from './PaymentList'
import { CreditCard } from 'lucide-react'

export default async function PaymentsPage() {
  const supabase = await createClient()

  // Ambil data siswa untuk dropdown
  const { data: students } = await supabase.from('students').select('id, name').order('name', { ascending: true })
  
  // Ambil data transaksi terbaru
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*, students(name)')
    .order('created_at', { ascending: false })
    .limit(15)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Payments</h1>
        <p className="text-sm text-zinc-500">Record and monitor student payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-500" />
            New Payment
          </h2>
          <PaymentForm students={students} />
        </div>

        {/* History Pembayaran dengan Fitur Edit & Delete */}
        <PaymentList payments={recentPayments} />
      </div>
    </div>
  )
}
