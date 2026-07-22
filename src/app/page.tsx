import Link from 'next/link'
import { ArrowRight, Wallet } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
      
      <div className="max-w-xl w-full bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-white text-center z-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">KasAdmin</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Sistem manajemen uang kas kelas yang modern, transparan, dan mudah digunakan.
        </p>
        
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Masuk sebagai Admin
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
