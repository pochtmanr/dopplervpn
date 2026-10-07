/**
 * Three dots, filled up to `value`, with the word beside them so the rating never relies on colour alone.
 * `plus`: Calm+ tones (accent on the inset tone).
 */
export function RatingDots({ value, label, plus = false }: { value: number; label: string; plus?: boolean }) {
  const on = plus ? "bg-(--c-accent)" : "bg-accent-teal";
  const off = plus ? "bg-(--c-inset)" : "bg-overlay/15";
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="inline-flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-2 w-2 rounded-full ${n <= value ? on : off}`} />
        ))}
      </span>
      <span className={plus ? "text-(--c-muted)" : "text-text-muted"}>{label}</span>
    </span>
  );
}
