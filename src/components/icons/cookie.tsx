/** The consent banner's mark (cookie-consent.tsx). */

type IconProps = { className?: string };

/** Duotone: a tinted wash under a solid outline, with two chips and a bite. */
export function CookieIcon({ className = "w-[18px] h-[18px]" }: IconProps) {
  const bite =
    "M20.9 12.4A8.9 8.9 0 1 1 11.6 3.1a2.6 2.6 0 0 0 3.15 3.15 2.6 2.6 0 0 0 2.95 3.25 2.6 2.6 0 0 0 3.2 2.9Z";
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={bite} fill="currentColor" fillOpacity={0.22} />
      <path d={bite} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
      <circle cx="8.6" cy="10.4" r="1.25" fill="currentColor" />
      <circle cx="13.6" cy="15.6" r="1.25" fill="currentColor" />
      <circle cx="8.9" cy="15.9" r="0.9" fill="currentColor" />
    </svg>
  );
}
