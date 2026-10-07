/** Three dots, filled up to `value`, with the word beside them so the rating never relies on colour alone. */
export function RatingDots({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="inline-flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-2 w-2 rounded-full ${n <= value ? "bg-accent-teal" : "bg-overlay/15"}`}
          />
        ))}
      </span>
      <span className="text-text-muted">{label}</span>
    </span>
  );
}
