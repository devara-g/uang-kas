import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

const MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

type MatrixCell = {
  totalPaid: number
  count: number
  firstDate?: string
  lastDate?: string
}

function getStudentStatus(cell: MatrixCell, isPastMonth: boolean) {
  if (!cell || cell.totalPaid === 0) {
    if (isPastMonth) return { status: 'Nunggak', target: 20000, remaining: 20000 }
    return { status: 'Belum Bayar', target: 10000, remaining: 10000 }
  }

  const firstDate = cell.firstDate ? new Date(cell.firstDate) : new Date()
  const lastDate = cell.lastDate ? new Date(cell.lastDate) : new Date()
  const durationDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
  const daysSinceFirst = (Date.now() - firstDate.getTime()) / (1000 * 3600 * 24)

  if (cell.count === 1 && cell.totalPaid === 10000) {
    return { status: 'Lunas (Sekaligus)', target: 10000, remaining: 0 }
  }
  if (cell.totalPaid >= 10000 && durationDays <= 7) {
    return { status: 'Lunas (Cicilan)', target: 10000, remaining: 0 }
  }
  if (cell.totalPaid >= 20000) {
    return { status: 'Lunas (Cicilan)', target: 20000, remaining: 0 }
  }
  if (cell.totalPaid >= 15000 && !isPastMonth) {
    return { status: 'Lunas (Cicilan)', target: 15000, remaining: 0 }
  }

  const target = isPastMonth ? 20000 : (daysSinceFirst <= 7 ? 10000 : 15000)
  return { status: 'Mencicil', target, remaining: Math.max(0, target - cell.totalPaid) }
}

function buildSheetForMonth(
  students: { id: string; name: string }[],
  matrix: Record<string, Record<number, MatrixCell>>,
  monthNum: number,
  year: number
): XLSX.WorkSheet {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isPastMonth = year < currentYear || (year === currentYear && monthNum < currentMonth)

  const rows = students.map((s, i) => {
    const cell = matrix[s.id]?.[monthNum] || { totalPaid: 0, count: 0 }
    const { status, target, remaining } = getStudentStatus(cell, isPastMonth)
    return {
      'No': i + 1,
      'Nama Siswa': s.name,
      'Total Dibayar (Rp)': cell.totalPaid,
      'Target Bayar (Rp)': target,
      'Status': status,
      'Sisa Tagihan (Rp)': remaining,
    }
  })

  const totalCollected = rows.reduce((sum, r) => sum + r['Total Dibayar (Rp)'], 0)
  rows.push({
    'No': null as unknown as number,
    'Nama Siswa': '— TOTAL TERKUMPUL —',
    'Total Dibayar (Rp)': totalCollected,
    'Target Bayar (Rp)': null as unknown as number,
    'Status': '',
    'Sisa Tagihan (Rp)': null as unknown as number,
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 4 },
    { wch: 28 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
  ]
  return ws
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const monthParam = searchParams.get('month') // 'all' or number string

    const supabase = await createClient()
    const { data: students } = await supabase
      .from('students')
      .select('id, name')
      .order('name', { ascending: true })

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('year', year)
      .order('created_at', { ascending: true })

    if (!students) {
      return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
    }

    // Build matrix
    const matrix: Record<string, Record<number, MatrixCell>> = {}
    students.forEach(s => {
      matrix[s.id] = {}
      for (let m = 1; m <= 12; m++) {
        matrix[s.id][m] = { totalPaid: 0, count: 0 }
      }
    })

    payments?.forEach(p => {
      if (matrix[p.student_id]) {
        const cell = matrix[p.student_id][p.month]
        cell.totalPaid += p.amount
        cell.count += 1
        const pDate = p.created_at || p.payment_date
        if (!cell.firstDate) cell.firstDate = pDate
        cell.lastDate = pDate
      }
    })

    const wb = XLSX.utils.book_new()
    let filename = ''
    const startMonth = year === 2026 ? 8 : 1

    if (monthParam === 'all') {
      // Semua bulan (sesuai tahun aktif): 8-12 untuk 2026, 1-12 untuk tahun lain + ringkasan
      for (let m = startMonth; m <= 12; m++) {
        const ws = buildSheetForMonth(students, matrix, m, year)
        XLSX.utils.book_append_sheet(wb, ws, MONTHS_FULL[m - 1])
      }

      // Sheet ringkasan
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const summaryRows = []
      for (let m = startMonth; m <= 12; m++) {
        const isPastMonth = year < currentYear || (year === currentYear && m < currentMonth)
        const monthStudents = students.map(s => {
          const cell = matrix[s.id]?.[m] || { totalPaid: 0, count: 0 }
          return getStudentStatus(cell, isPastMonth)
        })
        const totalCollected = students.reduce((sum, s) => sum + (matrix[s.id]?.[m]?.totalPaid || 0), 0)
        const lunas = monthStudents.filter(s => s.status.startsWith('Lunas')).length
        const cicilan = monthStudents.filter(s => s.status === 'Mencicil').length
        const belum = monthStudents.filter(s => s.status === 'Belum Bayar' || s.status === 'Nunggak').length

        summaryRows.push({
          'Bulan': MONTHS_FULL[m - 1],
          'Total Terkumpul (Rp)': totalCollected,
          'Lunas': lunas,
          'Mencicil': cicilan,
          'Belum Bayar / Nunggak': belum,
        })
      }

      const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
      wsSummary['!cols'] = [
        { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 20 },
      ]
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

      filename = `Rekap_Kas_Semua_Bulan_${year}.xlsx`
    } else {
      // Bulan tertentu
      const rawMonth = parseInt(monthParam || String(new Date().getMonth() + 1))
      const monthNum = Math.max(rawMonth, startMonth)
      const ws = buildSheetForMonth(students, matrix, monthNum, year)
      XLSX.utils.book_append_sheet(wb, ws, MONTHS_FULL[monthNum - 1])
      filename = `Rekap_Kas_${MONTHS_FULL[monthNum - 1]}_${year}.xlsx`
    }

    // Generate buffer
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': String(buf.length),
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Gagal export' }, { status: 500 })
  }
}
