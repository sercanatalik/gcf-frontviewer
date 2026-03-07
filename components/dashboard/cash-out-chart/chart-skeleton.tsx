"use client"

const BAR_HEIGHTS = [38, 52, 45, 61, 34, 48, 55, 42, 67, 50, 58, 44]

export function ChartSkeleton() {
  return (
    <div className="flex h-[350px] items-end gap-3 px-4 pb-6 pt-4">
      {BAR_HEIGHTS.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end h-full">
          <div
            className="w-full rounded-t-md bg-muted animate-pulse"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 80}ms`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
