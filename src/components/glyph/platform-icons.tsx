/**
 * Platform logos for the recipe-A glass tiles — shared by the home page's
 * "Available on" band and the account dashboard's device band, so the two
 * stay one picture.
 */

export type PlatformIcon = "apple" | "android" | "windows";

const PATHS: Record<PlatformIcon, string> = {
  apple:
    "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
  android:
    "M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m-9.22 0c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m9.5-5.09l1.67-2.88a.35.35 0 00-.12-.47.35.35 0 00-.48.12l-1.69 2.93A10.1 10.1 0 0012 8.57c-1.53 0-2.98.34-4.27.95L6.04 6.59a.35.35 0 00-.48-.12.35.35 0 00-.12.47l1.67 2.88C4.44 11.36 2.62 14.09 2.3 17.3h19.4c-.32-3.21-2.14-5.94-4.81-7.24z",
  windows:
    "M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z",
};

export function PlatformLogo({
  icon,
  className = "w-5 h-5 md:w-7 md:h-7",
}: {
  icon: PlatformIcon;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={PATHS[icon]} />
    </svg>
  );
}
