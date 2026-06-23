export default function ProductsLoading() {
  return (
    <div className="pt-32 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header skeleton */}
        <div className="mb-12 md:mb-16">
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Category filter skeleton */}
        <div className="mb-12 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800"
            />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[3/4] animate-pulse bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex flex-col gap-1">
                <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-1 h-4 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
