import { createClient } from '@/utils/supabase/server'
import { addStudent } from '@/app/actions/student'
import { Plus } from 'lucide-react'
import StudentList from './StudentList'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: students } = await supabase.from('students').select('*').order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Students</h1>
        <p className="text-sm text-zinc-500">Manage classroom students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Siswa */}
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-zinc-500" />
            Add Student
          </h2>
          <form action={async (fd) => {
            'use server'
            void await addStudent(fd)
          }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                placeholder="Enter student name"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Add Student
            </button>
          </form>
        </div>

        {/* Daftar Siswa Client Component */}
        <StudentList students={students} />
      </div>
    </div>
  )
}
