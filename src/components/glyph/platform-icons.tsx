/**
 * Platform logos for the recipe-A glass tiles — shared by the home page's
 * "Available on" band and the account dashboard's device band, so the two
 * stay one picture.
 */

export type PlatformIcon = "apple" | "android" | "googlePlay" | "windows" | "appStore" | "appGallery";

const PATHS: Record<Exclude<PlatformIcon, "appStore" | "appGallery">, string> = {
  apple:
    "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
  android:
    "M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m-9.22 0c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m9.5-5.09l1.67-2.88a.35.35 0 00-.12-.47.35.35 0 00-.48.12l-1.69 2.93A10.1 10.1 0 0012 8.57c-1.53 0-2.98.34-4.27.95L6.04 6.59a.35.35 0 00-.48-.12.35.35 0 00-.12.47l1.67 2.88C4.44 11.36 2.62 14.09 2.3 17.3h19.4c-.32-3.21-2.14-5.94-4.81-7.24z",
  googlePlay:
    "M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z",
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
  if (icon === "appStore") return <AppStoreMark className={className} />;
  if (icon === "appGallery") return <AppGalleryMark className={className} />;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={PATHS[icon]} />
    </svg>
  );
}

/**
 * The App Store "A": two strokes crossing at the apex and a crossbar, drawn as rounded
 * strokes so it sits at the same weight as the filled marks. For store buttons; the
 * platform itself stays the Apple logo.
 */
export function AppStoreMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M14.4 3.6 6.1 18M9.6 3.6 17.9 18M4.4 14.6h15.2M5.2 19.6l.9-1.6" />
    </svg>
  );
}

/**
 * A neutral app-store mark for AppGallery buttons: a rounded tile holding a shopping bag,
 * stroked at the App Store mark's weight. Deliberately not Huawei's logo (no petals, no red);
 * the button's words say which store it is.
 */
export function AppGalleryMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.5" />
      <path d="M7.5 9h9l-.8 7.25a1 1 0 0 1-1 .9H9.3a1 1 0 0 1-1-.9L7.5 9Z" />
      <path d="M9.75 11.25V8.5a2.25 2.25 0 0 1 4.5 0v2.75" />
    </svg>
  );
}

/** Huawei flower mark from public/images/brands/huawei.svg (SVG Repo). Used on Huawei / Honor CTAs. */
export function HuaweiMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M4.896 8.188c0 0-2.469 2.359-2.604 4.854v0.464c0.109 2.016 1.63 3.203 1.63 3.203 2.438 2.385 8.344 5.385 9.729 6.063 0 0 0.083 0.042 0.135-0.010l0.026-0.052v-0.057c-3.786-8.25-8.917-14.464-8.917-14.464zM12.865 24.802c-0.026-0.109-0.13-0.109-0.13-0.109l-9.839 0.349c1.063 1.906 2.865 3.37 4.745 2.932 1.281-0.333 4.214-2.375 5.172-3.068 0.083-0.068 0.052-0.12 0.052-0.12zM12.974 23.76c-4.323-2.922-12.693-7.385-12.693-7.385-0.203 0.609-0.266 1.198-0.281 1.729v0.094c0 1.427 0.531 2.427 0.531 2.427 1.068 2.255 3.12 2.938 3.12 2.938 0.938 0.396 1.87 0.411 1.87 0.411 0.161 0.026 5.865 0 7.385 0 0.068 0 0.109-0.068 0.109-0.068v-0.078c0-0.042-0.042-0.068-0.042-0.068zM12.078 4.255c-1.938 0.495-3.328 2.198-3.427 4.198v0.547c0.042 0.802 0.214 1.401 0.214 1.401 0.88 3.865 5.151 10.198 6.068 11.531 0.068 0.068 0.135 0.042 0.135 0.042 0.052-0.021 0.083-0.078 0.078-0.135 1.417-14.13-1.479-17.891-1.479-17.891-0.427 0.026-1.589 0.307-1.589 0.307zM23.146 7.281c0 0-0.651-2.401-3.25-3.042 0 0-0.76-0.188-1.563-0.292 0 0-2.906 3.745-1.495 17.906 0.016 0.094 0.083 0.104 0.083 0.104 0.094 0.042 0.13-0.036 0.13-0.036 0.964-1.375 5.203-7.682 6.068-11.521 0 0 0.479-1.87 0.026-3.12zM19.255 24.708c0 0-0.094 0-0.12 0.063 0 0-0.016 0.094 0.036 0.135 0.932 0.682 3.802 2.667 5.177 3.068 0 0 0.214 0.068 0.573 0.078h0.182c0.922-0.026 2.536-0.49 4-3.010l-9.865-0.333zM29.693 13.495c0.188-2.75-2.589-5.297-2.589-5.307 0 0-5.13 6.214-8.891 14.401 0 0-0.042 0.104 0.026 0.172l0.052 0.010h0.083c1.411-0.703 7.276-3.693 9.703-6.052 0 0 1.536-1.24 1.615-3.224zM31.719 16.349c0 0-8.37 4.49-12.693 7.396 0 0-0.068 0.057-0.042 0.151 0 0 0.042 0.078 0.094 0.078 1.547 0 7.417 0 7.563-0.026 0 0 0.76-0.026 1.693-0.385 0 0 2.078-0.667 3.161-3.031 0 0 0.974-1.932 0.224-4.182z" />
    </svg>
  );
}
