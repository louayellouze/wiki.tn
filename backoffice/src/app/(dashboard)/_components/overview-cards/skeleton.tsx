import { Skeleton } from "@/components/ui/skeleton";

export function OverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-dark border border-gray-100 dark:border-gray-800"
        >
          <Skeleton className="h-12 w-12 rounded-xl" />

          <div className="mt-6 flex items-end justify-between">
            <div>
              <Skeleton className="mb-1.5 h-8 w-24" />

              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
