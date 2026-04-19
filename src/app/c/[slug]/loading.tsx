export default function PublicPageLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-start gap-5">
            <div className="w-[72px] h-[72px] rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-7 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-72 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        <section className="space-y-6">
          <div className="h-5 w-28 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                <div className="aspect-video bg-gray-100" />
                <div className="p-3 space-y-1">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
