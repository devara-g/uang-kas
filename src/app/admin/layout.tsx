'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TableProperties,
  QrCode,
  LogOut,
  Menu,
  X,
  History
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, exact: true },
  { href: '/admin/payments/transactions', label: 'Transactions', icon: History },
  { href: '/admin/recap', label: 'Recap', icon: TableProperties },
  { href: '/admin/qris', label: 'QRIS', icon: QrCode },
]

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
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-zinc-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30 w-[240px] flex flex-col bg-white border-r border-zinc-200
          transition-transform duration-300 md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-14 flex items-center px-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">KasAdmin</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${active 
                    ? 'bg-zinc-100 text-zinc-900' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 ${active ? 'text-zinc-900' : 'text-zinc-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center px-4 md:hidden sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-50 rounded-md"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-2 font-semibold text-zinc-900 text-sm">KasAdmin</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
