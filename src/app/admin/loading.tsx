// Skeleton untuk Admin Dashboard
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-1">
        <div className="h-7 w-32 bg-zinc-200 rounded-md" />
        <div className="h-4 w-52 bg-zinc-100 rounded-md mt-1" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-3">
            <div className="h-4 w-24 bg-zinc-100 rounded" />
            <div className="h-8 w-16 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>

      {/* Chart + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm p-5">
          <div className="h-5 w-32 bg-zinc-200 rounded mb-4" />
          <div className="h-48 bg-zinc-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-5">
          <div className="h-5 w-32 bg-zinc-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-zinc-100 rounded" />
                  <div className="h-3 w-16 bg-zinc-100 rounded" />
                </div>
                <div className="h-4 w-20 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
