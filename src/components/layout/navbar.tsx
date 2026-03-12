import { Link } from "@/i18n/navigation";
import { DopplerLogo } from "./doppler-logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { ScrollHeader } from "./scroll-header";

export async function Navbar() {
  return (
    <ScrollHeader className="fixed top-[max(1rem,env(safe-area-inset-top))] inset-x-0 z-50 px-4 sm:px-6 lg:px-8">
      <DesktopNav
        logo={
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <DopplerLogo />
            <span className="hidden sm:inline text-lg font-semibold text-text-primary tracking-tight transition-[opacity,max-width] duration-300 group-data-[compact]:opacity-0 group-data-[compact]:max-w-0 overflow-hidden max-w-[10rem]">
              Doppler VPN
            </span>
          </Link>
        }
        controls={<ThemeToggle />}
        mobile={<MobileNav />}
      />
    </ScrollHeader>
  );
}
