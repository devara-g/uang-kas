// Skeleton untuk Expenses page
export default function ExpensesLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="h-7 w-40 bg-zinc-200 rounded-md" />
          <div className="h-4 w-28 bg-zinc-100 rounded-md" />
        </div>
        <div className="h-10 w-44 bg-zinc-200 rounded-lg" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-2xl p-4 h-24" />
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-2">
          <div className="h-3.5 w-36 bg-zinc-100 rounded" />
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-5 w-20 bg-zinc-100 rounded-md" />
              <div className="h-4 w-24 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex justify-between">
          <div className="h-5 w-36 bg-zinc-200 rounded" />
          <div className="h-4 w-12 bg-zinc-100 rounded" />
        </div>
        <div className="divide-y divide-zinc-100">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <div className="h-4 w-32 bg-zinc-100 rounded" />
                  <div className="h-4 w-16 bg-zinc-100 rounded" />
                </div>
                <div className="h-3 w-24 bg-zinc-100 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 bg-zinc-200 rounded" />
                <div className="h-8 w-8 bg-zinc-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
