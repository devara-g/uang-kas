import { createClient } from '@/utils/supabase/server'
import TransactionList from './TransactionList'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionsPage(props: PageProps) {
  const supabase = await createClient()
  const searchParams = await props.searchParams

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const year = searchParams?.year ? parseInt(searchParams.year as string) : currentYear
  const startMonth = year === 2026 ? 8 : 1
  let month = searchParams?.month ? parseInt(searchParams.month as string) : currentMonth
  if (month < startMonth) {
    month = startMonth
  }

  // Ambil semua transaksi untuk bulan & tahun yg dipilih
  const { data: payments } = await supabase
    .from('payments')
    .select('*, students(name)')
    .eq('year', year)
    .eq('month', month)
    .order('created_at', { ascending: false })

  // Total terkumpul bulan ini
  const totalMonth = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  // Ambil ringkasan per bulan (untuk tab)
  const { data: allPayments } = await supabase
    .from('payments')
    .select('month, amount')
    .eq('year', year)

  const monthlyTotals: Record<number, number> = {}
  allPayments?.forEach(p => {
    monthlyTotals[p.month] = (monthlyTotals[p.month] || 0) + p.amount
  })

  return (
    <TransactionList
      payments={payments}
      totalMonth={totalMonth}
      monthlyTotals={monthlyTotals}
      selectedMonth={month}
      selectedYear={year}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  )
}
