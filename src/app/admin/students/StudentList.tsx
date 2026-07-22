'use client'

import { useState } from 'react'
import { updateStudent, deleteStudent } from '@/app/actions/student'
import { Trash2, Pencil, Users, X, Check, Loader2 } from 'lucide-react'

type Student = {
  id: string
  name: string
  created_at: string
}

export default function StudentList({ students }: { students: Student[] | null }) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editName, setEditName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student)
    setEditName(student.name)
    setError(null)
  }

  const handleCloseEdit = () => {
    setEditingStudent(null)
    setEditName('')
    setError(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    setIsSubmitting(true)
    setError(null)

    const res = await updateStudent(editingStudent.id, editName)
    if (res?.error) {
      setError(res.error)
    } else {
      handleCloseEdit()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini? Semua data pembayaran terkait juga akan terhapus.')) return
    setDeletingId(id)
    await deleteStudent(id)
    setDeletingId(null)
  }

  return (
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(student)}
                  className="p-2 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                  title="Edit student"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  disabled={deletingId === student.id}
                  className="p-2 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete student"
                >
                  {deletingId === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900 text-sm">Edit Siswa</h3>
              <button onClick={handleCloseEdit} className="p-1 rounded-lg bg-zinc-100 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
