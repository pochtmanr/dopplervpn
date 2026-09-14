/**
 * Loading skeletons for the account page.
 *
 * The account route decides what to show from `localStorage`, which only exists
 * after mount. These stand in for that first paint so a logged-in visitor never
 * sees the signup panel flash before the dashboard replaces it, and so the
 * dashboard never renders half-empty while its data is still in flight.
 *
 * Shimmer is Tailwind's `animate-pulse`; the global `prefers-reduced-motion`
 * block in globals.css already neutralises it.
 */

/* ── Primitives ──────────────────────────────────────────────────────── */

/**
 * One shimmering bar. Width/height come from the caller.
 *
 * The default radius is dropped when the caller supplies its own: emitting both
 * `rounded-md` and `rounded-full` leaves the winner to CSS source order rather
 * than class order, which would square off the circles and pills.
 */
function Bar({ className = '' }: { className?: string }) {
  const radius = /(^|\s)rounded(-|\s|$)/.test(className) ? '' : 'rounded-md ';
  return <div className={`${radius}bg-overlay/10 ${className}`} />;
}

/** The repo card idiom, pulsing. */
function SkeletonCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-5 ${className}`}>
      {children}
    </div>
  );
}

/* ── Pre-hydration gate ──────────────────────────────────────────────── */

/**
 * Shown until the client has read the saved account id — i.e. until we know
 * whether this visitor gets the auth panel or the dashboard. Deliberately
 * neutral: it must not hint at either outcome.
 */
export function AccountGateSkeleton() {
  return (
    <div
      className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      role="status"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-md animate-pulse space-y-5">
        <div className="flex flex-col items-center gap-3">
          <Bar className="h-11 w-11 rounded-full" />
          <Bar className="h-7 w-48" />
          <Bar className="h-4 w-64 max-w-full" />
        </div>
        <SkeletonCard className="space-y-4">
          <Bar className="h-11 w-full rounded-xl" />
          <Bar className="h-11 w-full rounded-xl" />
          <Bar className="h-3 w-3/4" />
        </SkeletonCard>
      </div>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────── */

/**
 * Mirrors the real dashboard: header with status chip, the `lg:grid-cols-5`
 * split (account ID, devices, contacts | subscription), then the device band.
 */
export function DashboardSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-busy="true">
      {/* Header — eyebrow, title, member-since line, status chip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Bar className="h-3 w-16" />
          <Bar className="h-9 w-56 max-w-full" />
          <Bar className="h-3.5 w-36" />
        </div>
        <Bar className="h-8 w-40 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left — account */}
        <div className="lg:col-span-3 space-y-5">
          {/* Account ID card */}
          <SkeletonCard className="p-6 space-y-4">
            <Bar className="h-3 w-20" />
            <Bar className="h-8 w-72 max-w-full" />
            <Bar className="h-4 w-60 max-w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Bar className="h-11 w-full rounded-xl" />
              <Bar className="h-11 w-full rounded-xl" />
            </div>
            <Bar className="h-24 w-full rounded-xl" />
          </SkeletonCard>

          {/* Contacts card */}
          <SkeletonCard className="space-y-3">
            <Bar className="h-3 w-28" />
            <Bar className="h-11 w-full rounded-xl" />
            <Bar className="h-11 w-full rounded-xl" />
          </SkeletonCard>
        </div>

        {/* Right — subscription / paywall */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Bar className="h-10 w-10 rounded-2xl" />
              <Bar className="h-7 w-40" />
            </div>
            <Bar className="h-4 w-52 max-w-full" />

            {/* Price block */}
            <div className="space-y-2">
              <Bar className="h-3 w-12" />
              <Bar className="h-14 w-56 max-w-full" />
            </div>

            {/* Feature rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Bar className="h-9 w-9 rounded-xl shrink-0" />
                  <Bar className="h-4 flex-1 max-w-xs" />
                </div>
              ))}
            </div>

            <Bar className="h-14 w-full rounded-xl" />
          </div>

          {/* Devices card */}
          <SkeletonCard className="space-y-3">
            <div className="flex items-center justify-between">
              <Bar className="h-3 w-24" />
              <Bar className="h-5 w-14 rounded-full" />
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary/40 border border-overlay/5">
                <Bar className="h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-3.5 w-32" />
                  <Bar className="h-3 w-20" />
                </div>
              </div>
            ))}
          </SkeletonCard>
        </div>
      </div>

      {/* Every-device band */}
      <div className="mt-5 rounded-2xl border border-overlay/10 bg-bg-secondary/30 px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center gap-2 mb-5">
          <Bar className="h-3 w-24" />
          <Bar className="h-6 w-64 max-w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Bar key={i} className="h-[104px] md:h-[112px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
