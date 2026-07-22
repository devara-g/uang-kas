import { createClient } from '@/utils/supabase/server'
import PaymentForm from './PaymentForm'
import { CreditCard, History } from 'lucide-react'

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

        {/* History Pembayaran */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900">Recent Transactions</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
            {(!recentPayments || recentPayments.length === 0) ? (
              <div className="py-12 text-center flex flex-col items-center">
                <History className="w-8 h-8 text-zinc-300 mb-3" />
                <p className="text-sm font-medium text-zinc-500">No transactions yet</p>
                <p className="text-xs text-zinc-400 mt-1">Record a payment to see history here.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {recentPayments.map(payment => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {payment.students?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Month {payment.month} - {payment.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">
                        +Rp {payment.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(payment.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
