'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PaymentStatus = {
  status: 'belum_bayar' | 'mencicil' | 'lunas_sekaligus' | 'lunas_cicilan'
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
    .select('amount')
    .eq('student_id', student_id)
    .eq('month', month)
    .eq('year', year)

  const paymentCount = history?.length || 0
  const totalPaid = history?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  if (totalPaid === 0) {
    return { status: 'belum_bayar', totalPaid: 0, paymentCount: 0, remaining: 10000, target: 10000 }
  }
  if (paymentCount === 1 && totalPaid === 10000) {
    return { status: 'lunas_sekaligus', totalPaid: 10000, paymentCount, remaining: 0, target: 10000 }
  }
  if (totalPaid >= 15000) {
    return { status: 'lunas_cicilan', totalPaid, paymentCount, remaining: 0, target: 15000 }
  }
  return { status: 'mencicil', totalPaid, paymentCount, remaining: 15000 - totalPaid, target: 15000 }
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

  if (status.status === 'belum_bayar') {
    if (amount > 15000) {
      return { error: 'Nominal maksimal adalah Rp 15.000' }
    }
  } else {
    // mencicil
    if (amount > status.remaining) {
      return { error: `Sisa tagihan bulan ini hanya Rp ${status.remaining.toLocaleString('id-ID')}` }
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
  revalidatePath('/admin')
  return { success: true }
}
