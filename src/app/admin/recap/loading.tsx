// Skeleton untuk Recap page
export default function RecapLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="h-7 w-36 bg-zinc-200 rounded-md" />
          <div className="h-4 w-52 bg-zinc-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-zinc-100 rounded-md" />
          <div className="h-9 w-24 bg-zinc-100 rounded-md" />
          <div className="h-9 w-28 bg-zinc-200 rounded-md" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm space-y-2">
            <div className="h-3.5 w-20 bg-zinc-100 rounded" />
            <div className="h-7 w-12 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex justify-between">
          <div className="h-5 w-36 bg-zinc-200 rounded" />
          <div className="h-5 w-24 bg-zinc-100 rounded" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                {[1,2,3,4,5,6,7,8].map(i => (
                  <th key={i} className="p-3">
                    <div className="h-3.5 bg-zinc-200 rounded mx-auto" style={{ width: i === 1 ? 120 : 40 }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[1,2,3,4,5,6].map(i => (
                <tr key={i}>
                  {[1,2,3,4,5,6,7,8].map(j => (
                    <td key={j} className="p-3">
                      <div className={`h-3.5 bg-zinc-100 rounded ${j === 1 ? 'w-28' : 'w-8 mx-auto'}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
