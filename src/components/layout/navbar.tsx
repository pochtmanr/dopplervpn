import { Link } from "@/i18n/navigation";
import { DopplerLogo } from "./doppler-logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  // Shared with MobileNav so the open menu's top row matches the bar exactly.
  const logo = (
    <Link href="/" dir="ltr" className="flex items-center gap-2.5 shrink-0">
      <DopplerLogo />
      <span className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
        Doppler VPN
      </span>
    </Link>
  );

  // Sticky with zero height, not fixed. iOS 26 Safari floats its toolbars over
  // the page and repositions fixed elements on their own layer whenever the
  // toolbar collapses (first pixels of a scroll) or returns (pull-to-refresh),
  // so a fixed bar visibly lagged, snapped back, or landed half under the
  // status bar. A sticky bar scrolls with the document instead. `h-0` keeps it
  // out of the flow, so pages keep their own top padding; the pill overflows
  // the empty box. Must stay a direct child of the page (body is its
  // containing block). mobile-nav.tsx's .mnav-panel mirrors this top offset.
  return (
    <header className="sticky top-[max(1rem,env(safe-area-inset-top))] z-50 h-0 px-4 sm:px-6 lg:px-8">
      <DesktopNav
        logo={logo}
        controls={<ThemeToggle />}
        mobile={<MobileNav logo={logo} />}
      />
    </header>
  );
}
