import { Link } from "@/i18n/navigation";
import { DopplerLogo } from "./doppler-logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 lg:px-8">
      <DesktopNav
        logo={
          <Link href="/" className="flex items-center gap-2.5">
            <DopplerLogo />
            <span className="hidden sm:inline text-lg font-semibold text-text-primary tracking-tight">
              Doppler VPN
            </span>
          </Link>
        }
        controls={<ThemeToggle />}
        mobile={<MobileNav />}
      />
    </header>
  );
}
