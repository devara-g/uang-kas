'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TableProperties,
  QrCode,
  LogOut,
  Menu,
  X,
  History,
  TrendingDown,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Siswa', icon: Users },
  { href: '/admin/payments', label: 'Bayar', icon: CreditCard, exact: true },
  { href: '/admin/payments/transactions', label: 'Riwayat', icon: History },
  { href: '/admin/recap', label: 'Rekap', icon: TableProperties },
  { href: '/admin/expenses', label: 'Pengeluaran', icon: TrendingDown },
  { href: '/admin/qris', label: 'QRIS', icon: QrCode },
]

// Bottom nav shows 5 items max
const bottomNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/payments', label: 'Bayar', icon: CreditCard, exact: true },
  { href: '/admin/recap', label: 'Rekap', icon: TableProperties },
  { href: '/admin/expenses', label: 'Keluar', icon: TrendingDown },
  { href: '/admin/qris', label: 'QRIS', icon: QrCode },
]

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/KELAS_XI_PPLG_1_20260724_182044.jpg"
      alt="PPLG 1 AREA"
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex bg-[#f4f4f5]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-zinc-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30 w-[240px] flex flex-col
          bg-white border-r border-zinc-200/80
          transition-transform duration-300 ease-in-out md:translate-x-0
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <div className="leading-tight">
              <span className="font-bold text-zinc-900 text-sm tracking-tight block">PPLG 1 AREA</span>
              <span className="text-[10px] text-zinc-400 font-medium">Kas Kelas</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Menu</p>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="h-14 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 md:hidden sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <div className="leading-tight">
              <span className="font-bold text-zinc-900 text-sm block">PPLG 1 AREA</span>
              <span className="text-[10px] text-zinc-400">Kas Kelas</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-stretch h-[60px]">
            {bottomNavItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative
                    ${active ? 'text-emerald-600' : 'text-zinc-400'}
                  `}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-b-full" />
                  )}
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                  <span className={`text-[10px] font-medium transition-all duration-200 ${active ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
          {/* iPhone home indicator safe area */}
          <div className="h-[env(safe-area-inset-bottom,0px)] bg-white/95" />
        </nav>
      </div>
    </div>
  )
}
