'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type Expense } from '@/constants/expense'

export async function addExpense(formData: FormData) {
  const supabase = await createClient()

  const title = (formData.get('title') as string)?.trim()
  const category = formData.get('category') as string
  const amount = parseInt(formData.get('amount') as string)
  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const note = (formData.get('note') as string)?.trim() || null

  if (!title || !category || !amount || !month || !year) {
    return { error: 'Semua field wajib diisi' }
  }
  if (amount <= 0) {
    return { error: 'Nominal harus lebih dari 0' }
  }

  const { error } = await supabase.from('expenses').insert([{
    title,
    category,
    amount,
    month,
    year,
    note,
  }])

  if (error) return { error: error.message }

  revalidatePath('/admin/expenses')
  revalidatePath('/admin/recap')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/expenses')
  revalidatePath('/admin/recap')
  revalidatePath('/admin')
  return { success: true }
}

export async function getExpenses(month: number, year: number): Promise<Expense[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false })
  return data || []
}
