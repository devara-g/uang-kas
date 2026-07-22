import { createClient } from '@/utils/supabase/server'
import { addStudent, deleteStudent } from '@/app/actions/student'
import { Trash2, Plus, Users } from 'lucide-react'

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

        {/* Daftar Siswa */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900">Student Directory</h2>
            </div>
            <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
              {students?.length || 0} students
            </span>
          </div>

          {(!students || students.length === 0) ? (
            <div className="py-12 text-center flex flex-col items-center">
              <Users className="w-8 h-8 text-zinc-300 mb-3" />
              <p className="text-sm font-medium text-zinc-500">No students found</p>
              <p className="text-xs text-zinc-400 mt-1">Add a student using the form to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {students.map((student, index) => (
                <div key={student.id} className="flex items-center px-5 py-3 hover:bg-zinc-50 transition-colors group">
                  <span className="text-xs font-medium text-zinc-400 w-8">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{student.name}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Added {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <form action={async () => {
                    'use server'
                    void await deleteStudent(student.id)
                  }}>
                    <button
                      type="submit"
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all"
                      title="Delete student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
