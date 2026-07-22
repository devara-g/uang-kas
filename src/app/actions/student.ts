'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStudent(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Nama diperlukan' }

  const { error } = await supabase.from('students').insert([{ name }])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/students')
  revalidatePath('/admin/payments')
  revalidatePath('/')
  return { success: true }
}

export async function deleteStudent(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('students').delete().eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/admin/students')
  revalidatePath('/admin/payments')
  revalidatePath('/')
  return { success: true }
}
