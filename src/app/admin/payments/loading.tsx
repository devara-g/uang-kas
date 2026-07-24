// Skeleton untuk Payments page
export default function PaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="h-7 w-28 bg-zinc-200 rounded-md" />
          <div className="h-4 w-52 bg-zinc-100 rounded-md mt-1" />
        </div>
        <div className="h-8 w-44 bg-zinc-100 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form skeleton */}
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm h-fit space-y-4">
          <div className="h-5 w-28 bg-zinc-200 rounded mb-4" />
          <div className="h-9 bg-zinc-100 rounded-md" />
          <div className="h-9 bg-zinc-100 rounded-md" />
          <div className="h-9 bg-zinc-100 rounded-md" />
          <div className="h-9 bg-zinc-200 rounded-md mt-2" />
        </div>

        {/* List skeleton */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="h-5 w-40 bg-zinc-200 rounded" />
          </div>
          <div className="divide-y divide-zinc-100">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-zinc-100 rounded" />
                  <div className="h-3 w-24 bg-zinc-100 rounded" />
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
