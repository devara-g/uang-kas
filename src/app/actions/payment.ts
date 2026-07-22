'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PaymentStatus = {
  status: 'belum_bayar' | 'nunggak' | 'mencicil' | 'lunas_sekaligus' | 'lunas_cicilan'
  totalPaid: number
  paymentCount: number
  remaining: number
  target: number
}

export async function getPaymentStatus(
  student_id: string,
  month: number,
  year: number
): Promise<PaymentStatus> {
  const supabase = await createClient()

  const { data: history } = await supabase
    .from('payments')
    .select('amount, created_at, payment_date')
    .eq('student_id', student_id)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: true })

  const paymentCount = history?.length || 0
  const totalPaid = history?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Cek apakah bulan ini sudah lewat (nunggak)
  const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth)

  if (totalPaid === 0 || !history || history.length === 0) {
    if (isPastMonth) {
      // Nunggak: bulan sudah lewat tapi belum bayar sama sekali → tagihan 20k
      return { status: 'nunggak', totalPaid: 0, paymentCount: 0, remaining: 20000, target: 20000 }
    }
    return { status: 'belum_bayar', totalPaid: 0, paymentCount: 0, remaining: 10000, target: 10000 }
  }

  const firstDate = new Date(history[0].created_at || history[0].payment_date || Date.now())
  const lastDate = new Date(history[history.length - 1].created_at || history[history.length - 1].payment_date || Date.now())

  // Durasi antara cicilan pertama dan terakhir (dalam hari)
  const durationDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
  const daysSinceFirst = (now.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)

  if (paymentCount === 1 && totalPaid === 10000) {
    return { status: 'lunas_sekaligus', totalPaid: 10000, paymentCount, remaining: 0, target: 10000 }
  }

  // Aturan cicilan 1 minggu: jika lunas (totalPaid >= 10k) dalam <= 7 hari, targetnya 10k
  if (totalPaid >= 10000 && durationDays <= 7) {
    return { status: 'lunas_cicilan', totalPaid, paymentCount, remaining: 0, target: 10000 }
  }

  if (totalPaid >= 20000) {
    return { status: 'lunas_cicilan', totalPaid, paymentCount, remaining: 0, target: 20000 }
  }

  if (totalPaid >= 15000 && !isPastMonth) {
    return { status: 'lunas_cicilan', totalPaid, paymentCount, remaining: 0, target: 15000 }
  }

  // Belum lunas:
  // - Bulan lalu (nunggak) → target 20k
  // - Bulan ini ≤ 7 hari → target 10k
  // - Bulan ini > 7 hari → target 15k
  const target = isPastMonth ? 20000 : (daysSinceFirst <= 7 ? 10000 : 15000)
  const remaining = Math.max(0, target - totalPaid)

  if (remaining === 0) {
    return { status: 'lunas_cicilan', totalPaid, paymentCount, remaining: 0, target }
  }

  return { status: 'mencicil', totalPaid, paymentCount, remaining, target }
}

export async function addPayment(formData: FormData) {
  const supabase = await createClient()
  
  const student_id = formData.get('student_id') as string
  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const amount = parseInt(formData.get('amount') as string)

  if (!student_id || !month || !year || !amount) {
    return { error: 'Semua field harus diisi' }
  }

  if (amount <= 0) {
    return { error: 'Nominal harus lebih dari 0' }
  }

  const status = await getPaymentStatus(student_id, month, year)

  if (status.status === 'lunas_sekaligus' || status.status === 'lunas_cicilan') {
    return { error: 'Bulan ini sudah LUNAS. Tidak perlu bayar lagi.' }
  }

  if (status.status === 'belum_bayar' || status.status === 'nunggak') {
    if (amount > status.target) {
      return { error: `Nominal maksimal adalah Rp ${status.target.toLocaleString('id-ID')}` }
    }
  } else {
    // mencicil
    if (amount > status.remaining) {
      return { error: `Sisa tagihan hanya Rp ${status.remaining.toLocaleString('id-ID')}` }
    }
  }

  const { error } = await supabase.from('payments').insert([{
    student_id,
    month,
    year,
    amount
  }])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/payments')
  revalidatePath('/admin/recap')
  revalidatePath('/recap')
  revalidatePath('/admin')
  return { success: true }
}

export async function updatePayment(id: string, amount: number, month: number, year: number) {
  const supabase = await createClient()

  if (amount <= 0) return { error: 'Nominal harus lebih dari 0' }

  const { error } = await supabase
    .from('payments')
    .update({ amount, month, year })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/payments')
  revalidatePath('/admin/recap')
  revalidatePath('/recap')
  revalidatePath('/admin')
  return { success: true }
}

export async function deletePayment(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('payments').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/payments')
  revalidatePath('/admin/recap')
  revalidatePath('/recap')
  revalidatePath('/admin')
  return { success: true }
}
