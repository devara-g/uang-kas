'use client'

import { useState } from 'react'
import Image from 'next/image'
import { QrCode, Maximize2, X, Download } from 'lucide-react'

export default function QrisPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">QRIS Payment</h1>
        <p className="text-sm text-zinc-500">Scan ini untuk pembayaran kas kelas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instruction Card */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center border border-zinc-200">
              <QrCode className="w-5 h-5 text-zinc-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Cara Pembayaran</h2>
              <p className="text-xs text-zinc-500">Ikuti langkah-langkah berikut</p>
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 bg-white text-zinc-900 text-xs font-semibold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                1
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-md border border-zinc-200 bg-white">
                <h3 className="font-semibold text-zinc-900 text-sm">Buka Aplikasi E-Wallet/Bank</h3>
                <p className="text-xs text-zinc-500 mt-1">Buka aplikasi GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 bg-white text-zinc-900 text-xs font-semibold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                2
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-md border border-zinc-200 bg-white">
                <h3 className="font-semibold text-zinc-900 text-sm">Scan QRIS</h3>
                <p className="text-xs text-zinc-500 mt-1">Pilih menu Scan QR dan arahkan kamera ke barcode QRIS.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 bg-white text-zinc-900 text-xs font-semibold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                3
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-md border border-zinc-200 bg-white">
                <h3 className="font-semibold text-zinc-900 text-sm">Konfirmasi Nominal</h3>
                <p className="text-xs text-zinc-500 mt-1">Masukkan nominal pembayaran (Rp 10.000) dan selesaikan transaksi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm flex flex-col items-center justify-center p-8 relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsFullscreen(true)}
              className="p-2 bg-zinc-100 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-full max-w-[280px] aspect-square relative mb-6 rounded-md overflow-hidden border border-zinc-200 shadow-sm">
            <Image
              src="/qris.jpg"
              alt="QRIS Code"
              fill
              className="object-contain bg-white"
            />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-zinc-900">QRIS Kas Kelas</h3>
            <p className="text-sm text-zinc-500 mt-1">Menerima pembayaran dari semua bank & e-wallet</p>
          </div>
          
          <a
            href="/qris.jpg"
            download="QRIS_Kas_Kelas.jpg"
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download QRIS
          </a>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 transition-opacity"
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Scan QRIS</h2>
            <p className="text-zinc-500 mt-2">Gunakan aplikasi M-Banking atau E-Wallet Anda</p>
          </div>
          
          <div className="w-full max-w-[400px] aspect-square relative rounded-xl overflow-hidden border-2 border-zinc-200 shadow-2xl">
            <Image
              src="/qris.jpg"
              alt="QRIS Code Fullscreen"
              fill
              className="object-contain bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}
