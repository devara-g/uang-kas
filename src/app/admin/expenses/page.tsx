import { createClient } from '@/utils/supabase/server'
import ExpenseForm from './ExpenseForm'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ExpensesPage(props: PageProps) {
  const supabase = await createClient()
  const searchParams = await props.searchParams

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const year = searchParams?.year ? parseInt(searchParams.year as string) : currentYear
  const startMonth = year === 2026 ? 8 : 1
  let selectedMonth = searchParams?.month ? parseInt(searchParams.month as string) : currentMonth
  if (selectedMonth < startMonth) selectedMonth = startMonth

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('month', selectedMonth)
    .eq('year', year)
    .order('created_at', { ascending: false })

  return (
    <ExpenseForm
      initialExpenses={expenses || []}
      selectedMonth={selectedMonth}
      selectedYear={year}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  )
}
