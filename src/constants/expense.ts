export type Expense = {
  id: string
  title: string
  category: string
  amount: number
  month: number
  year: number
  note: string | null
  created_at: string
}

export const EXPENSE_CATEGORIES = [
  { value: 'ATK', label: 'ATK (Alat Tulis Kantor)', iconName: 'Pencil' },
  { value: 'Konsumsi', label: 'Konsumsi / Makanan', iconName: 'Utensils' },
  { value: 'Perlengkapan', label: 'Perlengkapan Kelas', iconName: 'Package' },
  { value: 'Kegiatan', label: 'Kegiatan / Event', iconName: 'PartyPopper' },
  { value: 'Kebersihan', label: 'Kebersihan', iconName: 'Sparkles' },
  { value: 'Sosial', label: 'Sosial / Sumbangan', iconName: 'HeartHandshake' },
  { value: 'Lainnya', label: 'Lainnya', iconName: 'Tag' },
]
