import Link from 'next/link'
import { ArrowRight, Wallet, Eye, Lock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
      
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-white text-center z-10 space-y-6">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Kas Kelas</h1>
          <p className="text-slate-600 text-base">
            Sistem manajemen uang kas kelas yang transparan, modern, dan real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link 
            href="/recap" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Eye className="w-4 h-4" />
            Lihat Rekap Kas (Public)
          </Link>

          <Link 
            href="/login" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <Lock className="w-4 h-4 text-zinc-500" />
            Login Admin
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
